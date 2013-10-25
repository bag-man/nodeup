//Require modules
var express = require('express'),
        app = express(),
     server = require('http').createServer(app),
         io = require('socket.io').listen(server),
    Monitor = require('./monitor.js');

//Array of objects for each domain
var domains = {};

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

  //Tell the client its id
  socket.emit('id', {'id': socket.id});
  console.log(socket.id + " connected.");
  
  //Disconnection
  socket.on('disconnect', function()
  {
    //Remove clients from domains[] objects
    for(var i in domains) {
      domains[i].removeClient(socket.id);
    }
    console.log(socket.id + " disconnected.");
  });
  
  //Return codes to client on submission and keep refreshing
  socket.on('domainSubmit', function(data)
  {
    for(var i in domains) {
      domains[i].removeClient(socket.id);
    }

    if(!domains[data.domain])
    {
      domains[data.domain] = new Monitor(data.domain);
      domains[data.domain].start();
    }

    domains[data.domain].addClient(socket.id, function(up)
    {
      socket.emit('result', {'up': up, 'domain': data.domain});
    });

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
};
