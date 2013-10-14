var io = require('socket.io').listen(81);
io.set('log level', 1); // reduce logging
var express = require('express');
var http = require('follow-redirects').http;
var app = express();

//Serve the public directory
app.configure(function () {
  app.use(express.static(__dirname + '/public'));
});

//Accept an argument 
app.get('/:domain', function(req, res){
  res.sendfile(__dirname + '/public/index.html');
});

//On port 80
app.listen(80); 
 
//Initialise the array of clients and the loop handler
var clients = [];
var handler;

//Sockets
io.sockets.on('connection', function (socket) {

  //Add new client to array
  clients.push(socket);
  console.log("Client connected");

  //Return codes to client on submission and keep refreshing
  for(i=0;i < clients.length;i++) {
    var socket = clients[i];
    socket.on('domainSubmit', function(data) {
    console.log("Does this code run twice?"); //Yes it does.
    handler = setInterval(function (){
	getStatusCode(data.domainName, function(statusCode, errorCode) {
	    if(statusCode == null) {
              var up = false;
            } else {
              var up = upFinder(statusCode); 
            }	      
	    socket.emit('result', {'up': up }); 
	});
	console.log("running");
      }, 5000);
    });
  }

  //Remove client from array on disconnect
  socket.on('disconnect', function() {
    clients.splice(clients.indexOf(socket), 1);
    clearInterval(handler);
    console.log("Client disconnected");
  });
});

//Perform the http.get request
function getStatusCode(domain, callback) {
  var target = "http://" + domain; //Need to test for http later
  http.get(target, function(res) {
      callback(res.statusCode, null);
  }).on('error', function(e) { 
      callback(null, e);
  });
}

//Test the status code
function upFinder(code) {
  //I'm pretty sure these are the only success codes that return a web page
  if(code >= 200 && code <= 203) {
    return true;
  }
  //Weird bug that means it displays down then up might be caused by this... Maybe.
  return false;
}
