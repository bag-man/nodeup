var http = require('follow-redirects').http;

function upFinder(code) {
  //These are the only HTTP codes we consider UP, but we need more HTTP knowledge/testing
  return !!(code >= 200 && code <= 203); 
}

function Monitor(domain) {
  this.domain = domain;
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
  for(var i in this.clients) {
    if(this.clients[i].id == client) {
      this.clients = this.clients.splice(i, 0);
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

Monitor.prototype.checkDomain = function() {
  var clients = this.clients;
  var target = "http://" + this.domain; 

  http.get(target, function(res) {
    var up = upFinder(res.statusCode);
    for(var client in clients) {
      clients[client].callback(up);
    }
  }).on('error', function(e) {
    var up = false;
    for(var client in clients) {
      clients[client].callback(up);
    }
  });
  var parent = this;
  this.handler = setTimeout(function() {
    parent.checkDomain()
  }, 5000); // Check every 5 seconds seemed reasonable
}

module.exports = Monitor;

