'use strict';

// Cosmetic
var alertChecking  = $('#alertChecking'),
    alertSuccess   = $('#alertSuccess'), 
    alertError     = $('#alertError'),
    alertFail      = $('#alertFail'),
    notifyCheckbox = $('#notifyme'),
    pathCheckbox   = $('#usePath'),
    domainInputBox = $('#domain'),
    alertContainer = $('#result'),
    alertCurrent   = null;

//Focus the input field
$('#domain').focus();
//And setup for notifications
if(Notification){
  if (Notification.permission === "default") {
    Notification.requestPermission();
  }
} else {
  notifyCheckbox.attr("disabled", "disabled");
}

/* Updates the fabicon.
 *
 * up: boolean, whether the domain being queried is up or not
 */
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

/* return if notifications can be used
 */
function canNotify() {
  return (Notification && Notification.permission === "granted");
}


// Backend //
var socket = io.connect('/'),
    notifications = false,
    sessionID,
    usePath = false,
    notifyme = true,
    result = null,
    urlSubmitted,
    first = true;

socket.on('id', function(data) {
  sessionID = data.id;
});

/* submits a url to the backend server
 *
 * url: the url to be submitted
 */
function submitUrl(url) {

  //dont bother for empty urls
  if(!url || url.length < 3){
    return; 
  }

  //request listening for the domain
  socket.emit('url', {'id': sessionID, 'url': url});

  //get the servers validation of the url
  socket.on('urlResponse', function(data) {
    //server returns false if its invalid
    if(!data){
      showAlert(alertError);
      return false;
    }
    showAlert(alertChecking);
    urlSubmitted = data
  });

  result = null;
}

socket.on('result', function(data) {
  if(data.url == urlSubmitted){
    if(data.up){
      showAlert(alertSuccess);
    } else {
      showAlert(alertFail);
    }
  } else {
    console.log("Error, something went wrong! Listening to the wrong domain?!");
  }
});

function showAlert(alert){
  //dont bother changing the box if it's the same one!
  if(alert == alertCurrent){
    return;
  }
  //fade out the current alert box
  if(alertCurrent){
    alertCurrent.fadeOut('fast', function(){
      alert.fadeIn('fast');
    })
  } else {
    //if no result box present, fade in the alert box
    alert.fadeIn('fast');
  }

  //and set the current result box
  alertCurrent = alert;
}

$('#domainInput').submit(function(){
  submitUrl(domainInputBox.val());
  return false; //return false to prevent page reloading
});

if(window.location.pathname.substr(1).length) {
  var url	= decodeURIComponent(window.location.pathname.substr(1).split('/')[0]);

  //be user friendly and set the input box
  domainInputBox.val(url);
  submitUrl(url);
}

//bind events to settings modal
$('#usePath').change(function() { usePath = this.checked });
$('#notifyme').change(function() { notifyme = this.checked });
