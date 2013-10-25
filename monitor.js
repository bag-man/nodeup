var http = require('http');

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
  //this.client = client;

  this.clients = [];
 // clients.push(client);
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
      delete this.clients[client];
    }
  }
}

Monitor.prototype.checkDomain = function()
{
  var clients = this.clients;
  var target = "http://" + this.domain;
  console.log(target);
  http.get(target, function(res)
  {
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
  //I want to return up here, but its from a callback of a function so I am usure :/
}

module.exports = Monitor;
