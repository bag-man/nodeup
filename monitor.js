var http = require('follow-redirects').http;

function upFinder(code) {
  return !!(code >= 200 && code <= 203);
}

function Monitor(domain) {
  this.domain = domain;
  this.clients = [];
  this.handler;
  this.started = false;
}

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

Monitor.prototype.removeClient = function(client) {
  for(var i in this.clients) {
    if(this.clients[i].id == client) {
      this.clients.splice(i, 0);
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
  for(var i in clients) {
    console.log(clients[i].id + " requested " + this.domain); //Shitty debugging
  }
  console.log('\n\n'); //Shitty debugging
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
  }, 5000);
}

module.exports = Monitor;
