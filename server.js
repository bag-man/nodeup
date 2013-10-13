var io = require('socket.io').listen(81);
var express = require('express');
var http = require('http');
var app = express();

//Serve the public directory
app.configure(function () {
    app.use( "/", express.static(__dirname + '/public'));
});

//On port 80
app.listen(80); 

//Initialise the array of clients
var clients = [];



//Sockets
io.sockets.on('connection', function (socket) {

  //Add new client to array
  clients.push(socket);
  console.log("Client connected");

  //Return codes to client on submission and keep refreshing
  socket.on('domainSubmit', function(data) {
    setInterval(function (){
      for(i=0;i < clients.length;i++) {
	var socket = clients[i];
	getStatusCode(data.domainName, function(statusCode, errorCode) {
	    socket.emit('result', {'errorCode': errorCode, 'status': statusCode});
	});
      } 
    }, 5000);
  });

  //Remove client from array on disconnect
  socket.on('disconnect', function() {
    clients.splice(clients.indexOf(socket), 1);
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
