## New Version! 

This is an outdated repository, but I am leaving it here for historical referrence. The new version is [here](https://github.com/aardvarks/itsback.at).


##It's Back At!

This is a little project I am working on with [Jamie Knight](http://github.com/jamiek23) to make a website similar to isup.me, but with more awesome features!

At the moment, we have finished the basic functionality of the site, and we are opening it up to the internet so that hopefully we can get some more varied testing done. 

The site is live at [itsback.at](http://itsback.at). Please remeber this site was built for learning, so if you see anything you shouldn't please give us a shout! You can test it out with [this link](http://itsback.at/upanddown.herokuapp.com).

The project was built using NodeJS, Express and Socket.IO. 

#Todo
* Rewrite it, make an npm module for the pinging part
* Test path instead of domain feature
* Test different port feature
* User adjustable certainty (X successful attempts before declared up)
* Email notification feature
* Total users watching domain feature
* Different location of server tests feature (Sensu?)
* Report incorrect results feature / create a list of sites that block us
* "Placebo", so they know the site is working
* Safari support for notifications
* Chrome / Firefox extension
* Client side version
* Reddit bot
* API
* Debug:

    Error: Requested Range Not Satisfiable
        at SendStream.error (/root/nodeup/node_modules/express/node_modules/send/lib/send.js:145:16)
        at SendStream.send (/root/nodeup/node_modules/express/node_modules/send/lib/send.js:371:19)
        at /root/nodeup/node_modules/express/node_modules/send/lib/send.js:323:10
        at FSReqWrap.oncomplete (fs.js:95:15)

