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
  for(var i=0; i<this.clients.length; i++) {
    if(this.clients[i] != undefined && this.clients[i].id == client) {
      //console.log(this.domain , " has these clients: " , this.clients);
      //delete this.clients[i];
      this.clients.splice(i,1); // This used to be 0
      //console.log(this.domain , " has these clients: " , this.clients);
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
      console.log("Sending data to: " + clients[client].id);
    }
  }).on('error', function(e) {
    var up = false;
    for(var client in clients) {
      clients[client].callback(up);
    }
  });
  var parent = this;
  this.handler = setTimeout(function() {
    parent.checkDomain();
    console.log("Checking site...");
  }, 5000); // Check every 5 seconds seemed reasonable
}

// Debug, show domains clients
Monitor.prototype.printClients = function() {
  console.log(this.domain, " has these clients: \n", this.clients);
}

module.exports = Monitor;
