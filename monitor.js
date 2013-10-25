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

Monitor.prototype.addClient = function(client)
{
  clients.push(client);
}

Monitor.prototype.checkDomain = function(this.domain, function(statusCode, errorCode)
{
    if(statusCode == null)
    {
      up = false;
    } else
    {
      up = upFinder(statusCode);
    }
    return up;
});

module.exports = Monitor;
