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

  function DDPClient(dict) {
    this.subscribe = __bind(this.subscribe, this);
    this.call = __bind(this.call, this);
    this.received = __bind(this.received, this);
    this.handle_error = __bind(this.handle_error, this);
    this.send = __bind(this.send, this);
    this.opened = __bind(this.opened, this);
    this.connect = __bind(this.connect, this);
    this.register_identifier = __bind(this.register_identifier, this);
    this.next_id = __bind(this.next_id, this);
    var hostname, port, protocol, url;
    hostname = dict.hostname;
    port = dict.port || false;
    url = dict.url || "websocket";
    protocol = dict.use_ssl ? "wss" : "ws";
    this.socket_url = "" + protocol + "://" + hostname;
    if (port) this.socket_url += ":" + port;
    this.socket_url += "/" + url;
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
    this.socket.on("error", this.handle_error);
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
    if (object.msg === "data") {
      this.emit("msg-data", object);
      this.emit("msg-data-" + this.identifiers[object.id], object);
    }
    if (object.msg === "result") {
      this.emit("msg-result", object);
      this.emit("msg-result-" + this.identifiers[object.id], object);
    }
    if (object.msg === "nosub") this.emit("msg-nosub", object);
    if (object.msg === "error") return this.emit("msg-error", object);
  };

  DDPClient.prototype.handle_error = function(error) {
    this.emit("connect-error", error);
  };

  DDPClient.prototype.call = function(identifier, method, params) {
    var id;
    if (method === void 0) method = identifier;
    if (method instanceof Array) {
      params = method;
      method = identifier;
    }
    id = this.register_identifier(identifier);
    return this.send({
      "msg": "method",
      "id": id,
      "method": method,
      "params": params
    });
  };

  DDPClient.prototype.subscribe = function(identifier, name, params) {
    var id;
    if (name === void 0) name = identifier;
    if (name instanceof Array) {
      params = name;
      name = identifier;
    }
    id = this.register_identifier(identifier);
    return this.send({
      "msg": "sub",
      "id": id,
      "name": name,
      "params": params
    });
  };

  return DDPClient;

})(EventEmitter);

module.exports = DDPClient;
