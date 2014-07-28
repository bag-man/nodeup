'use strict';

// Cosmetic
var domainInput   = document.getElementById('domain'),
    checking      = $('<div class="alert alert-info"><i class="fa fa-repeat fa-spin"></i> Checking...</div>'),
    resultSuccess = $('<div class="alert alert-success"><strong>Hooray!</strong> It\'s up!</div>'), 
    resultFail	  = $('<div class="alert alert-danger"><strong>Arsebiscuits!</strong> It\'s down!</div>'),
    notifications = false;

/*if(getCookie('notify', false)){
  $('#notifyme').get()[0].checked = true;
  getNotifyPerms();
}; */
domainInput.focus();
getNotifyPerms();

function setCookie(name,value,days) {
  var expiry			= '';
  if (days) {
    var date		= new Date();
    date.setTime(date.getTime() + (days*24*60*60*1000));
    expiry = "; expires="+date.toGMTString();
  }
  document.cookie		= name + '=' + value + expiry + '; path=/';
};

function getCookie(name, defaultVal) {
  var value			= "; " + document.cookie;
  var parts			= value.split("; " + name + "=");
  if (parts.length == 2) {
    return parts.pop().split(";").shift();
  }
  else {
    return defaultVal;
  }
};

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

// Taken from: https://developer.mozilla.org/en-US/docs/Web/API/notification
function getNotifyPerms() {
  if (!("Notification" in window)) {
    //alert("This browser does not support desktop notification");
    //setCookie('notify', false);
  } else if (Notification.permission === "granted") {
    notifications = true;
    //setCookie('notify', true);
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission(function (permission) {
      if(!('permission' in Notification)) {
        Notification.permission = permission;
      }
      if (permission === "granted") {
        notifications = true;
    //    setCookie('notify', true);
      }
      else {
     //   setCookie('notify', false);
      }
    });
  }
};

// Backend
var socket = io.connect('/'),
    sessionID,
    usePath,
    popped = false,
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

  popped = false;
  result = null;

  $('#result').fadeOut('fast', function() {
    $('#result').html(checking).fadeIn('fast');
    socket.emit('domainSubmit', {'domain': domain, 'id': sessionID});
  });
}

function processResult(success) {
  popped = false;

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
  if(domainSubmitted == data.domain && result != data.up && !popped && first == false) {
    if(data.up == true) {
      popped = true;
      if(notifications == true) {
        var notification = new Notification(domainSubmitted + " is back up!");
      } /*
      if(window.webkitNotifications.checkPermission() == 0) {
        window.webkitNotifications.createNotification(domainSubmitted + " has gone down!");
      } */
      if(confirm("Its back up at " + domainSubmitted + "\nDo you want to go there now?")) {
        window.location.href = "http://" + domainSubmitted;
      }
    } else {
      popped = true;
      if(notifications == true) {
        var notification = new Notification(domainSubmitted + " has gone down!");
      }  /*
      if(window.webkitNotifications.checkPermission() == 0) {
        window.webkitNotifications.createNotification(domainSubmitted + " has gone down!");
      }*/
      alert(domainSubmitted + " has gone down! :(");
    }
  }

  processResult(data.up);
  first = false;
});

$('#domainInput').submit(function(){
  testDomain($('#domain').val());
  first = true;
  if(window.webkitNotifications) {
    console.log("It supports it!");
    window.webkitNotifications.requestPermission();
  } else {
    console.log("This is not supported!");
  }
  return false;
});

/*$('#notifyme').change(function() {
  setCookie('notify', true);
  if(this.checked) {
   getNotifyPerms();
  }
});*/

$('#usePath').change(function() { usePath = this.checked });

if(window.location.pathname.substr(1).length) {
  var path		= window.location.pathname.substr(1).split('/');
  console.log(path);
  $('#domain').val(path[0]);
  testDomain(path[0]);
}
