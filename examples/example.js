var DDPClient, ddpclient;

DDPClient = require("../index.js"); // Change this to require("ddpclient");

ddpclient = new DDPClient("localhost", 3000);

ddpclient.connect();

ddpclient.on("open", function(data) {
  console.log("opened!", data);
});

ddpclient.on("connect", function(data) {
  console.log("connected!", data);

  ddpclient.on("msg-result-test", function(data) {
    console.log("result-test received!", data);
  });

  ddpclient.call("test", ["param1", "param2"]);
});

ddpclient.on("msg-data", function(data) {
  console.log("data received!", data);
});

ddpclient.on("msg-result", function(data) {
  console.log("result received!", data);
});