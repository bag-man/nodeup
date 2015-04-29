'use strict';

// Cosmetic
var alertChecking  = $('#alertChecking'),
    alertSuccess   = $('#alertSuccess'), 
    watchersWell   = $('#watchersWell'),
    alertError     = $('#alertError'),
    watchCount     = $('#watchCount'),
    alertFail      = $('#alertFail'),
    notifyCheckbox = $('#notifyme'),
    watchUrl       = $('#watchUrl'),
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
    usePath = false,
    notifyme = true,
    result = null,
    first = true,
    sessionID,
    submittedUrl;

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
  
  submittedUrl = makeUrlObject(url);

  //request listening for the domain
  socket.emit('url', {'id': sessionID, 'url': url});
  showAlert(alertChecking);

  result = null;
}

socket.on('result', function(data) {
  console.log(data);
  if(!data){
    showAlert(alertError);
    watchersWell.hide();
    return;
  }

  //show watchers if more than one
  if(data.watchers && data.watchers > 0){
    watchCount.html(data.watchers);
    watchUrl.attr('href', submittedUrl.href);
    watchUrl.html(submittedUrl.href);
    watchersWell.show();
  }

  if(data.up){
    showAlert(alertSuccess);

  } else {
    showAlert(alertFail);
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

function makeUrlObject(url){
  var regexp = /^https?:\/\//
  if(!regexp.test(url)){
    url = "http://" + url;
  }
  return new URL(url);
}

//bind events to settings modal
$('#usePath').change(function() { usePath = this.checked });
$('#notifyme').change(function() { notifyme = this.checked });
