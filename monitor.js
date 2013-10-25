var http = require('follow-redirects').http;

function upFinder(code)
{
  if(code >= 200 && code <= 203)
  {
    return true;
  }
  return false;
}

function Monitor(domain)
{
  //Class constructor
  this.domain = domain;
  this.clients = [];
  this.handler;
}

Monitor.prototype.addClient = function(client, callback)
{
  for(var i in this.clients) {
    if(this.clients[i].id == client) {
      return;
    }
  }
  this.clients.push({id: client, callback: callback});
}

Monitor.prototype.removeClient = function(client)
{
  for(var i in this.clients) {
    if(this.clients[i].id == client) {
      this.clients.splice(i, 1);
    }
  }
  if(!this.clients.length) {
    this.stop();
  }
}

Monitor.prototype.start = function()
{
  var parent = this;
  parent.checkDomain();
}

Monitor.prototype.stop = function()
{
  //clearInterval(this.handler);
  clearTimeout(this.handler);
}

Monitor.prototype.checkDomain = function()
{
  var clients = this.clients;
  var target = "http://" + this.domain;
  console.log(target);
  http.get(target, function(res)
  {
    console.log(res.statusCode);
    var up = upFinder(res.statusCode);
    for(var client in clients) {
      clients[client].callback(up);
    }
  }).on('error', function(e)
  {
    console.log('Error checking domain: ', e);
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
