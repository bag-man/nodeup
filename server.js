var express = require('express'),
        app = express(),
     server = require('http').createServer(app),
         io = require('socket.io').listen(server),
	url = require('url'),
    Monitor = require('./monitor.js'),
    domains = {};

io.set('log level', 1); 
server.listen(80);

app.configure(function () {
  app.use(express.static(__dirname + '/public'));
});

app.get('/:domain', function(req, res) {
  res.sendfile(__dirname + '/public/index.html');
});

io.sockets.on('connection', function (socket) {
  socket.emit('id', {'id': socket.id});
  //console.log(socket.id + " connected.");

  socket.on('disconnect', function() {
    for(var i in domains) {
      domains[i].removeClient(socket.id);
    }
    //console.log(socket.id + " disconnected.");
  });
  
  socket.on('domainSubmit', function(data) {
    domain = valURL(data.domain);
    for(var i in domains) { //It works but not efficiently
      domains[i].removeClient(socket.id); 
    }
    if(!domains[domain]) {
      domains[domain] = new Monitor(domain);
      domains[domain].start();
    }
    domains[domain].addClient(socket.id, function(up) {
      socket.emit('result', {'up': up, 'domain': domain});
    });
  });
});

function valURL(inputUrl) {
  var testUrl = url.parse(inputUrl);
  if(testUrl.protocol == null) {
    testUrl = url.parse('http://' + inputUrl);
  }
  return testUrl.hostname;
}
