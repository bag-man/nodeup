//Require modules
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
io.set('log level', 1); // reduce logging
var http = require('follow-redirects').http;

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

//Create 2D array
var clients = [];
var client;

//Sockets connect and disconnect
io.sockets.on('connection', function (socket)
{

  //Add new client to array
  socket.emit('id', {'id': socket.id});
  clients.push(socket);
  console.log(socket.id + " connected.");
  
  //Remove client from array on disconnect
  socket.on('disconnect', function()
  {
    clearInterval(clients[client].handler);
    clients.splice(clients.indexOf(socket), 1);
    console.log(socket.id + " disconnected.");
  });
  
  //Return codes to client on submission and keep refreshing
  socket.on('domainSubmit', function(data)
  {
    for(i=0; i<clients.length; i++)
    {
      if(clients[i].id == data.id)
      {
        client = i; //Maybe this is the problem

        if(clients[i].handler)
	{
	  console.log("Client " + clients[i].id + " already has a handler. Killing old one.");
	  clearInterval(clients[i].handler);
	}
      }
    }

    var check = function()
    {
      console.log("Client " + clients[client].id + " is running " + data.domainName);
      getStatusCode(data.domainName, function(statusCode, errorCode)
      {
	if(statusCode == null)
	{
	  var up = false;
	} else
	{
	  var up = upFinder(statusCode);
	}
	socket.emit('result', {'up': up });
      });
    };

    check();
    clients[client].handler = setInterval(check, 5000);
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
