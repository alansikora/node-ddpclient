WebSocket = require("ws")
EventEmitter = require('events').EventEmitter

class DDPClient extends EventEmitter
  current_id: 0
  identifiers: {}
  socket_url: null
  socket: null
  
  constructor: (dict) ->
    hostname = dict.hostname
    port = dict.port || false
    url = dict.url || "websocket"
    protocol = if dict.use_ssl then "wss" else "ws"
    
    @socket_url = "#{protocol}://#{hostname}"
    @socket_url += ":#{port}" if port
    @socket_url += "/#{url}"
    
  next_id: =>
    (++@current_id).toString()
    
  register_identifier: (identifier) =>
    id = @next_id()
    @identifiers[id] = identifier
    return id
    
  connect: =>
    @socket = new WebSocket @socket_url
    
    @socket.on "message", @received
    
    @socket.on "error", @handle_error

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
      @.emit "msg-data-#{@identifiers[object.id]}", object
      
    if object.msg == "result"
      @.emit "msg-result", object
      @.emit "msg-result-#{@identifiers[object.id]}", object
      
    if object.msg == "nosub"
      @.emit "msg-nosub", object
      
    if object.msg == "error"
      @.emit "msg-error", object

  handle_error: (error) =>
    @.emit "connect-error", error
    
  call: (identifier, method, params) =>
    method = identifier if method is undefined
    if method instanceof Array
      params = method
      method = identifier
    
    id = @register_identifier identifier
    
    @send
      "msg": "method"
      "id": id
      "method": method
      "params": params
      
  subscribe: (identifier, name, params) =>
    name = identifier if name is undefined    
    if name instanceof Array
      params = name
      name = identifier
    
    id = @register_identifier identifier
    
    @send
      "msg": "sub"
      "id": id
      "name": name
      "params": params
    
module.exports = DDPClient
