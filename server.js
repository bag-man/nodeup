var express = require('express'),
        app = express(),
     server = require('http').createServer(app),
         io = require('socket.io').listen(server),
	      url = require('url'),
       path = false,
    Monitor = require('./monitor.js'),
    domains = {};

//DEBUG=socket.io:* node server.js
server.listen(80);
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
  //console.log("%s connected. %O", socket.id, socket );

  socket.on('disconnect', function() {
    //clear the client from any listening domains
    for(var i in domains) {
      domains[i].removeClient(socket.id);
    }
  });
  
  socket.on('url', function(data) {

    //Validate the url
    if(!validateURL(data.url)) {
      console.log("Invalid url %s", data.url);
      socket.emit('result', false);
      return;
    }
    
    //make a url object out of it
    var urlObject = url.parse(data.url);
    console.log(urlObject);

    if(urlObject === null){
      console.log("Something went wrong, couldnt create url object from url ", data.url);
      socket.emit('result', false);
      return;
    }

    //if no protocol was specified, assume http, unless the port was spefcified as 443 (https)
    if(!urlObject.protocol){
      if(urlObject.port == 443){
        urlObject = url.parse("https://" + data.url);
      } else {
        urlObject = url.parse("http://" + data.url);
      }
    }

    if(!url.port){
      if(urlObject.protocol == "https:"){
        urlObject.port = 443;
      }
    }

    //create a key to store the monitor under; this could be adapted in future to have a single monitor for host,
    // which then checks paths?
    var key = urlObject.href;

    //remove client from any existing domain listeners
    for(var i in domains) { 
      domains[i].removeClient(socket.id); 
    }

    // Create a new domain Monitor if needed
    if(!domains.hasOwnProperty(key)) {
      domains[key] = new Monitor(urlObject);
      domains[key].start();
    }

    //and add the client to the new domain and create the callback event
    domains[key].addClient(socket.id, function(up) {
      socket.emit('result', {'up': up, 'url': key, 'watchers' : domains[key].getCount()});
    });
  });
});

function validateURL(inputUrl) {
  // URL validation regex, probebly doesnt work for everything..?
  var regexp = /^(https?:\/\/)?(\S)+(\.\S{2,})+$/;
  return regexp.test(inputUrl);
}

