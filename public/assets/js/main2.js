'use strict';

// Cosmetic
var domainInput   = document.getElementById('domain'),
    checking      = $('<div class="alert alert-info"><i class="fa fa-repeat fa-spin"></i> Checking...</div>'),
    resultSuccess = $('<div class="alert alert-success"><strong>Hooray!</strong> It\'s up!</div>'), 
    resultFail	  = $('<div class="alert alert-danger"><strong>Arsebiscuits!</strong> It\'s down!</div>'),
    notifications = false;

domainInput.focus();
getNotifyPerms();

function updateIcon(up) {
  var link = document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'shortcut icon';

  if(up == true) {
    link.href = '/assets/imgs/up.ico';
  } else {
    link.href = '/assets/imgs/down.ico';
  }

  document.getElementsByTagName('head')[0].appendChild(link);
};

function getNotifyPerms() {
  if (!Notification) {
    alert('Notifications are supported in modern versions of Chrome, Firefox, Opera and Firefox.'); 
    return;
  }

  if (Notification.permission !== "granted")
    Notification.requestPermission();

  if (Notification.permission === "granted")
    notifications = true;

}

// Backend
var socket = io.connect('/'),
    sessionID,
    usePath,
    result = null,
    domainSubmitted,
    first = true;

socket.on('id', function(data) {
  sessionID = data.id;
});

function testDomain(domain) {
  socket.emit('domainVal', {'domain': domain, 'path': usePath, 'id': sessionID});
  socket.on('theDomain', function(data) {
    domainSubmitted = data.domain;
  });

  result = null;

  $('#result').fadeOut('fast', function() {
    $('#result').html(checking).fadeIn('fast');
    socket.emit('domainSubmit', {'domain': domain, 'id': sessionID});
  });
}

function processResult(success) {

  if(success == true) {
    document.title = "It's back!";
  } else {
    document.title = "It's down :(";
  }

  updateIcon(success);
  if(result == success) {
    return;
  }

  result = success;
  $('#result').fadeOut('fast', function() {
    $('#result').html((success ? resultSuccess : resultFail)).fadeIn('fast');
  });
}

socket.on('result', function(data) {
  if(domainSubmitted == data.domain && result != data.up && first == false) {
    if(data.up == true) {
      if(notifications == true) {
        var notification = new Notification(domainSubmitted + " is back up!");
      }
      
    } else {
      if(notifications == true) {
        var notification = new Notification(domainSubmitted + " has gone down!");
      }
    }
  }

  processResult(data.up);
  first = false;
});

$('#domainInput').submit(function(){
  testDomain($('#domain').val());
  first = true;
  if(window.webkitNotifications) {
    //console.log("It supports it!");
    window.webkitNotifications.requestPermission();
  } else {
    //console.log("This is not supported!");
  }
  return false;
});

$('#usePath').change(function() { usePath = this.checked });

if(window.location.pathname.substr(1).length) {
  var path		= window.location.pathname.substr(1).split('/');
  console.log(path);
  $('#domain').val(path[0]);
  testDomain(path[0]);
}
