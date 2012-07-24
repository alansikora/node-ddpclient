DDPClient = require("../index.js") # Change this to require("ddpclient")

ddpclient = new DDPClient({hostname: "localhost", port: 3000})

ddpclient.connect()

ddpclient.on "open", (data) ->
  console.log "opened!", data

ddpclient.on "connect", (data) ->
  console.log "connected!", data
  
  ddpclient.on "msg-result-test", (data) ->
    console.log "result-test received!", data
  
  ddpclient.call "test", ["param1", "param2"]
  
  ddpclient.on "msg-data-lists", (data) ->
    console.log "result-lists received!", data
  
  ddpclient.subscribe "lists"
    
ddpclient.on "msg-data", (data) ->
  console.log "data received!", data
  
ddpclient.on "msg-result", (data) ->
  console.log "result received!", data
  
ddpclient.on "msg-nosub", (data) ->
  console.log "nosub received!", data
