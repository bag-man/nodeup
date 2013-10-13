var io = require('socket.io').listen(81);
io.set('log level', 1); // reduce logging
var express = require('express');
var http = require('http');
var app = express();

//Serve the public directory
app.configure(function () {
    app.use(express.static(__dirname + '/public'));
});

//This is the bit that is strange and I need to figure out how to get to work properly
app.get('/:domain', function(req, res){
	//var domain = req.params.domain;
	//console.log("url arg " + domain);
	//res.send(domain);
	res.sendfile(__dirname + '/public/index.html');
});

//A guy on IRC suggested this
//app.get(/^\/(.*)$/, function(req, res) {
//  console.log(req.params[0]);
//});

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
  for(i=0;i < clients.length;i++) {
    var socket = clients[i];
    socket.on('domainSubmit', function(data) {
      setInterval(function (){
	getStatusCode(data.domainName, function(statusCode, errorCode) {
	    socket.emit('result', {'errorCode': errorCode, 'status': statusCode});
	});
      }, 5000);
    });
  }

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
