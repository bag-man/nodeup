var http = require('http');

function upFinder(code)
{
  if(code >= 200 && code <= 203)
  {
    return true;
  }
  return false;
}

function getStatusCode(domain, callback)
{
  var target = "http://" + domain; //Need to test for http later
  http.get(target, function(res)
  {
    callback(res.statusCode, null);
  }).on('error', function(e)
  {
    callback(null, e);
  });
}

function Monitor(domain, client)
{
  //Class constructor
  this.domain = domain;
  this.client = client;

  var clients = [];
  clients.push(client);
}

Monitor.prototype.checkDomain = function(client)
{
  clients.push(client);
}

Monitor.prototype.checkDomain = function()
{
    getStatusCode(this.domain, function(statusCode, errorCode)
    {
      if(statusCode == null)
      {
	var up = false;
      } else
      {
	var up = upFinder(statusCode);
      }
      socket.emit('result', {'up': up, 'domain': this.domain});
    });
}

//var object = new Monitor("google.com", "34384");

module.exports = Monitor;
