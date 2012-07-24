Node.js DDP Client v0.6.1
=========================

Node.js module to connect to servers using DDP protocol.

This was based on the existing Python client: https://github.com/meteor/meteor/tree/master/examples/unfinished/python-ddp-client

installation
============

```
npm install ddpclient
```

example
=======

There is a dead simple example on using the class, take a look at "examples/example.coffee" or "examples/example.js"

To test your client, you may use the deployed app (http://ddpclient-tester.meteor.com), as used on the example.

development
===========

Use: "coffee --bare -wc -j lib/*.js src/*.coffee"

TODO
====

 - better docs