'use strict';

var _ = require('lodash');
var net = require('net');
var tls = require('tls');

function Connector(options) {
  this.options = options;
}

Connector.prototype.check = function () {
  return true;
};

Connector.prototype.disconnect = function () {
  this.connecting = false;
  if (this.stream) {
    this.stream.end();
  }
};

Connector.prototype.connect = function (callback) {
  this.connecting = true;
  var connectionOptions;
  if (this.options.path) {
    connectionOptions = _.pick(this.options, ['path']);
  } else {
    connectionOptions = _.pick(this.options, ['port', 'host', 'family']);
  }
  if (this.options.tls) {
    _.assign(connectionOptions, this.options.tls);
  }

  var _this = this;
  process.nextTick(function () {
    if (!_this.connecting) {
      callback(new Error('Connection is closed.'));
      return;
    }
    var stream;
    if (_this.options.tls) {
      stream = tls.connect(connectionOptions);
    } else {
      stream = net.createConnection(connectionOptions);
    }
    _this.stream = stream;
    callback(null, stream);
  });
};

Connector.prototype.reconnect = function (orginalConnectorObj, callback) {
  this.connecting = false;
  var _this = this;
  process.nextTick(function () {
    _this.connecting = true;
    _this.stream = orginalConnectorObj.stream;
    callback(null, _this.stream);
  });
};

module.exports = Connector;
