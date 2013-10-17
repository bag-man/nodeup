'use strict';

var socket = io.connect('/'); 
var sessionID;
socket.on('id', function(data) {
   sessionID = data.id;
});

var checking       = $('<div class="alert alert-info"><i class="icon-repeat icon-spin"></i> Checking...</div>');
var resultSuccess  = $('<div class="alert alert-success"><strong>Hooray!</strong> It\'s up!</div>');
var resultFail     = $('<div class="alert alert-danger"><strong>Arsebiscuits!</strong> It\'s down!</div>');
var $result        = $('#result');
var $domain        = $('#domain');
var result = null;

function testDomain(domain) {
  result = null;
  $result.fadeOut('fast', function() {
    $result.html(checking).fadeIn('fast');
    socket.emit('domainSubmit', {'domainName': domain, 'id': sessionID});
  });
}

function processResult(success) {
  if(result == success) {
    return;
  }
  result = success;
  $result.fadeOut('fast', function() {
    $result.html((success ? resultSuccess : resultFail)).fadeIn('fast');
  });
  //If previousResult == false && curentResult == true, alert("Website is back up, press OK to continue");
}

socket.on('result', function(data) {
  processResult(data.up);
});

$('#domainInput').submit(function(){
  testDomain($domain.val());
  return false;
});

if(window.location.pathname.substr(1).length) {
  var path = window.location.pathname.substr(1).split('/');
  console.log(path);
  $domain.val(path[0])
  testDomain(path[0]);
}

