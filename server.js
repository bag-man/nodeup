var express = require('express'),
        app = express(),
     server = require('http').createServer(app),
         io = require('socket.io').listen(server),
	url = require('url'),
       path = false,
    Monitor = require('./monitor.js'),
    domains = {};

//DEBUG=socket.io:* node server.js
server.listen(80,'198.98.119.20');
console.log("Server started.");

//https://stackoverflow.com/questions/17245881/node-js-econnreset
process.on('uncaughtException', function (err) {
  console.error(err.stack);
  console.log("Node NOT Exiting...");
});

app.configure(function () {
  app.use(express.static(__dirname + '/public'));
});

// Accept URL parameters
app.get('/:domain', function(req, res) {
  res.sendfile(__dirname + '/public/index.html');
});

// Accept URL parameters
app.get('/api/:domain', function(req, res) {
  console.log("DO API THINGS");
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
  
  socket.on('domainVal', function(data) {
    socket.emit('theDomain', {'domain':valURL(data)});
    if(data.path == true) {
      path == true;
    }
  });

  socket.on('domainSubmit', function(data) {
    var domain = valURL(data);

    if(domain == null) {
      return;
    }

    for(var i in domains) { 
      domains[i].removeClient(socket.id); 
    }

    // Create a new domain Monitor
    if(!domains.hasOwnProperty(domain)) {
      domains[domain] = new Monitor(domain);
      domains[domain].start();
    }

    domains[domain].addClient(socket.id, function(up) {
      socket.emit('result', {'up': up, 'domain': domain});
    });
  });
});

function valURL(inputUrl) {
  var testUrl = url.parse(inputUrl.domain);
  if(testUrl.protocol == null) {
    testUrl = url.parse('http://' + inputUrl.domain);
  }
  if(path != true) {
    //console.log("Just domain " + testUrl.hostname);
    return testUrl.hostname;
  } else {
    //console.log("Using path: " + testUrl.hostname + testUrl.path);
    return testUrl.hostname + testUrl.path;
  }
}
