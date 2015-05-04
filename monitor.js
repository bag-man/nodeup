var http = require('follow-redirects').http,
     url = require('url');

function upFinder(code) {
  //These are the only HTTP codes we consider UP, but we need more HTTP knowledge/testing
  return !!(code >= 200 && code <= 203); 
}

/* Creates a new monitor object for a domain
 *
 * domain: url object eg
 *  { protocol: 'http:',
 *    slashes: true,
 *    auth: null,
 *    host: 'google.com',
 *    port: null,
 *    hostname: 'google.com',
 *    hash: null,
 *    search: null,
 *    query: null,
 *    pathname: '/',
 *    path: '/',
 *    href: 'http://google.com/'
 *  }
 */
function Monitor(domain) {
  this.domain = domain;
  if(domain.port === null){
    domain.port = 80;
  }
  this.clients = [];
  this.handler;
  this.started = false;
}

// Add clients and start monitor
Monitor.prototype.addClient = function(client, callback) {
  for(var i in this.clients) {
    if(this.clients[i].id == client) {
      return;
    }
  }
  this.clients.push({id: client, callback: callback});
  if(!this.started) {
    this.start();
  }
}

// Remove clients from monitors/domains. This gets ran on sumbit
Monitor.prototype.removeClient = function(client) {
  for(var i=0; i<this.clients.length; i++) {
    if(this.clients[i].id == client) {
      this.clients.splice(i,1);
    }
  }
  if(!this.clients.length) {
    this.stop();
  }
}

Monitor.prototype.start = function() {
  var parent = this;
  parent.checkDomain();
  parent.started = true;
}

Monitor.prototype.stop = function() {
  clearTimeout(this.handler);
  this.started = false;
}

Monitor.prototype.log = function() {
  //console.log("\n" + this.domain + ":");
  for(client in this.clients) {
   // console.log(" " + this.clients[client].id);
  }
}

Monitor.prototype.getCount = function(){
  return this.clients.length;
}

Monitor.prototype.checkDomain = function() {
  var clients = this.clients;
  var target = {
    host: this.domain.host,
    port: this.domain.port,
    path: this.domain.pathname,
    method: 'GET',
    agent: false,
    headers: {
      'User-Agent': 'Mozilla/5.0'
    }
  }

  try {
    http.get(target, function(res) {
      res.on('data',function(){}); // Do nothing with the data to free the socket.
      for(var client in clients) {
        clients[client].callback(res.statusCode);
        //console.log("Sent:  " + clients[client].id);
      }
    }).on('error', function(e) {
      var up = false;
      for(var client in clients) {
        clients[client].callback(up);
      }
      //console.log("Sent:  " + clients[client].id);
    }).end();
  } catch(err) {
    console.log("ERROR! " + err);
  }
  var parent = this;
  this.handler = setTimeout(function() {
    parent.checkDomain()
  }, 5000); // Check every 5 seconds seemed reasonable
  this.log();
}

module.exports = Monitor;
