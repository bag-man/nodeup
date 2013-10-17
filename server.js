//Require modules
var express         = require('express'),
    http            = require('http'),
    socketIo        = require('socket.io'),
    followRedirects = require('follow-redirects');

var app    = express(),
    server = http.createServer(app),
    io     = socketIo.listen(server);
		
// reduce logging
io.set('log level', 1); 

//Start server
server.listen(80);

//Serve the public directory
app.configure(function()
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
  //Interval for updating domain status
  var interval = null;

  //Add new client to array
  socket.emit('id', { 'id' : socket.id });
  console.log(socket.id, "connected.");
  
  //Remove client from array on disconnect
  socket.on('disconnect', function () {
    if (interval !== null) {
      clearInterval(interval);	
    } 
    console.log(socket.id, "disconnected.");
  });
  
  //Return codes to client on submission and keep refreshing
  socket.on('domainSubmit', function(data) 
  {
    //Function for looping
    var check = function()
    {
      console.log("Client", socket.id, "is running", data.domainName);
      getStatusCode(data.domainName, function(statusCode, errorCode)
      {
        var up = (statusCode == null) ? upFinder(statusCode) : false;
        socket.emit('result', { 'up': up });
      });
    };
    
    //Clear any existing intervals
    if (interval !== null) {
      console.log("Client", socket.id, "already has a handler. Killing old one.");
      clearInterval(interval);
    }
    
    check();
    interval = setInterval(check, 5000);
  });
});

//Perform the http.get request
function getStatusCode(domain, callback)
{
  var target = "http://" + domain; //Need to test for http later
  followRedirects.http.get(target, function(res)
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
  return code >= 200 && code <= 203;
}
