var express = require('express'),
        app = express(),
     server = require('http').createServer(app),
         io = require('socket.io').listen(server),
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
  console.log(socket.id + " connected.");

  socket.on('disconnect', function() {
    for(i = 0; i < domains.length; i++) {
      domains[i].removeClient(socket.id);
    }
    console.log(socket.id + " disconnected.");
  });
  
  socket.on('domainSubmit', function(data) {
    for(i = 0; i < domains.length; i++) {
      domains[i].removeClient(socket.id);
    }
    if(!domains[data.domain]) {
      domains[data.domain] = new Monitor(data.domain);
      domains[data.domain].start();
    }
    domains[data.domain].addClient(socket.id, function(up) {
      socket.emit('result', {'up': up, 'domain': data.domain});
    });
  });
});
