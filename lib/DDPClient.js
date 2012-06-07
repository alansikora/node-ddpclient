var DDPClient, EventEmitter, WebSocket,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

WebSocket = require("ws");

EventEmitter = require('events').EventEmitter;

DDPClient = (function(_super) {

  __extends(DDPClient, _super);

  DDPClient.prototype.current_id = 0;

  DDPClient.prototype.identifiers = {};

  DDPClient.prototype.socket_url = null;

  DDPClient.prototype.socket = null;

  function DDPClient(hostname, port, url) {
    if (url == null) url = "websocket";
    this.subscribe = __bind(this.subscribe, this);
    this.call = __bind(this.call, this);
    this.received = __bind(this.received, this);
    this.send = __bind(this.send, this);
    this.opened = __bind(this.opened, this);
    this.connect = __bind(this.connect, this);
    this.register_identifier = __bind(this.register_identifier, this);
    this.next_id = __bind(this.next_id, this);
    this.socket_url = "ws://" + hostname + ":" + port + "/" + url;
  }

  DDPClient.prototype.next_id = function() {
    return (++this.current_id).toString();
  };

  DDPClient.prototype.register_identifier = function(identifier) {
    var id;
    id = this.next_id();
    this.identifiers[id] = identifier;
    return id;
  };

  DDPClient.prototype.connect = function() {
    this.socket = new WebSocket(this.socket_url);
    this.socket.on("message", this.received);
    return this.socket.on("open", this.opened);
  };

  DDPClient.prototype.opened = function() {
    return this.send({
      "msg": "connect"
    });
  };

  DDPClient.prototype.send = function(message_dictionary) {
    var message;
    message = JSON.stringify(message_dictionary);
    return this.socket.send(message);
  };

  DDPClient.prototype.received = function(data, flags) {
    var object;
    object = JSON.parse(data);
    if (object.server_id) this.emit("open", object);
    if (object.msg === "connected") this.emit("connect", object);
    if (object.msg === "data") this.emit("msg-data", object);
    if (object.msg === "result") {
      this.emit("msg-result", object);
      return this.emit("msg-result-" + this.identifiers[object.id], object);
    }
  };

  DDPClient.prototype.call = function(identifier, name, params) {
    var id;
    if (name instanceof Array) {
      params = name;
      name = identifier;
    }
    id = this.register_identifier(identifier);
    return this.send({
      "msg": "method",
      "method": name,
      "params": params,
      "id": id
    });
  };

  DDPClient.prototype.subscribe = function(identifier, name, params) {
    var id;
    if (name instanceof Array) {
      params = name;
      name = identifier;
    }
    id = this.register_identifier(identifier);
    return this.send({
      "msg": "sub",
      "name": name,
      "params": params,
      "id": id
    });
  };

  return DDPClient;

})(EventEmitter);

module.exports = DDPClient;
