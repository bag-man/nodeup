//Require modules
var express = require('express'),
        app = express(),
     server = require('http').createServer(app),
         io = require('socket.io').listen(server),
       http = require('follow-redirects').http,
    monitor = require('./monitor.js');

//Array of objects for each domain
var domains = [];

//Reduce logging
io.set('log level', 1); 

//Start server
server.listen(80);

//Serve the public directory
app.configure(function ()
{
  app.use(express.static(__dirname + '/public'));
});

//Accept an argument
app.get('/:domain', function(req, res)
{
  res.sendfile(__dirname + '/public/index.html');
});

//Sockets connect and disconnect
io.sockets.on('connection', function (socket)
{

  //Add new client to array
  socket.emit('id', {'id': socket.id});
  console.log(socket.id + " connected.");
  
  //Remove client from array on disconnect
  socket.on('disconnect', function()
  {
    //Remove clients from domains[] objects
    console.log(socket.id + " disconnected.");
  });
  
  //Return codes to client on submission and keep refreshing
  socket.on('domainSubmit', function(data)
  {
    var domains   = [ {domain: data.domain, id: socket.id} ]; // "Temporary"
    for(i = 0; i < domains.length; i++)
    {
      if(!domains[i].domain) 
      {
	      domains.push(new Monitor(data.domain, data.id));
        var result = domains[i++].checkDomain();
      } else {
        domains[i].addClient(data.id);
      }

      //Function for looping
      var check = function()
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
      };

      check();
      if(typeof client !== 'undefined') //This doesn't work quite right
      {
        clients[client].handler = setInterval(check, 5000);
      }
    }
  });
});

//Perform the http.get request
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


//Test the status code
function upFinder(code)
{
  if(code >= 200 && code <= 203)
  {
    return true;
  }
  return false;
}
