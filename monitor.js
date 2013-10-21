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
}

Monitor.prototype.checkDomain = function()
{
    getStatusCode(data.domainName, function(statusCode, errorCode)
    {
      if(statusCode == null)
      {
	var up = false;
      } else
      {
	var up = upFinder(statusCode);
      }
      socket.emit('result', {'up': up, 'domain': data.domainName});
    });
}


var object = new Monitor("google.com", "34384");

object.checkDomain();
