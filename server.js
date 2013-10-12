var io = require('socket.io').listen(81);
var express = require('express');
var http = require('http');
var app = express();

app.configure(function () {
    app.use( "/", express.static(__dirname + '/public'));
});

app.listen(80); 

var clients = [];

io.sockets.on('connection', function (socket) {
  clients.push(socket);
  console.log("Client connected");

  socket.on('domainSubmit', function(data) {
    getStatusCode(data.domainName, function(statusCode, errorCode) {
        socket.emit('result', {'errorCode': errorCode, 'status': statusCode});
    });
  });

  socket.on('disconnect', function() {
    clients.splice(clients.indexOf(socket), 1);
    console.log("Client disconnected");
  });
});

function getStatusCode(domain, callback) {
  var target = "http://" + domain; //Need to test for http later
  http.get(target, function(res) {
      callback(res.statusCode, null);
  }).on('error', function(e) { 
      callback(null, e);
  });
}
