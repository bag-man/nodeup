##NodeUP

This is a little project I am working on with [Jamie Knight](http://github.com/jamiek23) to make a website similar to isup.me, but with more awesome features!

It is far from finished so don't be too critical!

##TODO
* When multiple clients access the same domain the requests hang. So multiple clients isn't working. From testing the website I think this is caused by the original domain submitter submitting a new domain. I haven't looked at the code yet I was up till 4AM and was bakc up at 8AM... UPDATE: Looks like the client isn't getting removed from the domain on resubmit, however new clients are still getting sent data. 

* Investigate if multiple alerts stack. So if a site is down and the user doesn't hit okay will they get spammed. 

* Add info/usage/contact etc..

* Testing shit way more thoroughly, perhaps create a node app to generate HTTP codes
