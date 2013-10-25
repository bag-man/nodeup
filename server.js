//Require modules
var express = require('express'),
        app = express(),
     server = require('http').createServer(app),
         io = require('socket.io').listen(server),
       http = require('follow-redirects').http,
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
    for(var i in domains) {
      domains[i].removeClient(socket.id);
    }
    if(!domains[data.domain])
    {
      domains[data.domain] = new Monitor(data.domain);
      domains[data.domain].handler = setInterval(domains[data.domain].checkDomain, 5000);
      domains[data.domain].checkDomain();
    }
    domains[data.domain].addClient(socket.id, function(up){
      socket.emit('result', {'up': up, 'domain': data.domainName});
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
