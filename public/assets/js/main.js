'use strict';

// Cosmetic
var domainInput   = document.getElementById('domain'),
    checking      = $('<div class="alert alert-info"><i class="fa fa-repeat fa-spin"></i> Checking...</div>'),
    resultSuccess = $('<div class="alert alert-success"><strong>Hooray!</strong> It\'s up!</div>'), 
    resultFail	  = $('<div class="alert alert-danger"><strong>Arsebiscuits!</strong> It\'s down!</div>');

domainInput.focus();

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


// Backend
var socket = io.connect('/'),
    sessionID,
    popped = false,
    result = null,
    domainSubmitted;

socket.on('id', function(data) {
  sessionID = data.id;
});


function testDomain(domain) {
  domainSubmitted = domain;
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
  if(domainSubmitted == data.domain && result != data.up && result != null) {
    if(data.up == true) {
      if(popped == false){
	popped = true; 
	if(confirm("Its back up at " + domainSubmitted + "\nDo you want to go there now?")) {
	  window.location.href = "http://" + domainSubmitted;
	}
      }
    } else {
      if(popped == false){
	popped = true;
	alert("The website has gone down! :(");
      }
    }
  }

  processResult(data.up);
});

$('#domainInput').submit(function(){
  testDomain($('#domain').val());
  return false;
});

if(window.location.pathname.substr(1).length) {
  var path		= window.location.pathname.substr(1).split('/');
  console.log(path);
  $('#domain').val(path[0]);
  testDomain(path[0]);
}
