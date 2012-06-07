WebSocket = require("ws")
EventEmitter = require('events').EventEmitter

class DDPClient extends EventEmitter
  current_id: 0
  identifiers: {}
  socket_url: null
  socket: null
  
  constructor: (hostname, port, url = "websocket") ->
    @socket_url = "ws://#{hostname}:#{port}/#{url}"
    
  next_id: =>
    (++@current_id).toString()
    
  register_identifier: (identifier) =>
    id = @next_id()
    @identifiers[id] = identifier
    return id
    
  connect: =>
    @socket = new WebSocket @socket_url
    
    @socket.on "message", @received
    
    @socket.on "open", @opened
    
  opened: =>
    @send {"msg": "connect"}
    
  send: (message_dictionary) =>
    message = JSON.stringify message_dictionary
    
    @socket.send message
      
  received: (data, flags) =>
    object = JSON.parse data
    
    if object.server_id
      @.emit "open", object
      
    if object.msg == "connected"
      @.emit "connect", object
      
    if object.msg == "data"
      @.emit "msg-data", object
    
    if object.msg == "result"
      @.emit "msg-result", object
      @.emit "msg-result-#{@identifiers[object.id]}", object
    
  call: (identifier, name, params) =>
    if name instanceof Array
      params = name
      name = identifier
    
    id = @register_identifier identifier
    
    @send
      "msg": "method"
      "method": name
      "params": params
      "id": id
      
  subscribe: (identifier, name, params) =>
    if name instanceof Array
      params = name
      name = identifier
    
    id = @register_identifier identifier
    
    @send
      "msg": "sub"
      "name": name
      "params": params
      "id": id
    
module.exports = DDPClient