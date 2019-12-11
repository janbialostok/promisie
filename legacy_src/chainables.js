'use strict';

var setHandlers = function (success, failure) {
  return {
    success,
    failure: (typeof failure === 'function') ? failure : undefined
  };
};

const CHAINABLES = {
  try: function (resources) {
    return function _try (onSuccess, onFailure) {
      let { success, failure } = setHandlers(function (data) {
        try {
          return (typeof onSuccess === 'function') ? onSuccess(data) : resources.Promisie.reject(new TypeError('ERROR: try expects onSuccess handler to be a function'));
        }
        catch (e) {
          return resources.Promisie.reject(e);
        }
      }, onFailure);
      return this.then(success, failure);
    };
  },
  spread: function (resources) {
    return function _spread (onSuccess, onFailure) {
      let { success, failure } = setHandlers(function (data) {
        if (typeof data[Symbol.iterator] !== 'function') return resources.Promisie.reject(new TypeError('ERROR: spread expects input to be iterable'));
        if (typeof onSuccess !== 'function') return resources.Promisie.reject(new TypeError('ERROR: spread expects onSuccess handler to be a function'));
        return onSuccess(...data);
      }, onFailure);
      return this.then(success, failure);
    };
  },
  map: function (resources) {
    return function _map (onSuccess, onFailure, concurrency) {
      if (typeof onFailure === 'number') {
        concurrency = onFailure;
        onFailure = undefined;
      }
      let { success, failure } = setHandlers(function (data) {
        if (!Array.isArray(data)) return resources.Promisie.reject(new TypeError('ERROR: map expects input to be an array'));
        if (typeof onSuccess !== 'function') return resources.Promisie.reject(new TypeError('ERROR: map expects onSuccess handler to be a function'));
        return resources.Promisie.map(data, concurrency, onSuccess);
      }, onFailure);
      return this.then(success, failure);
    };
  },
  each: function (resources) {
    return function _each (onSuccess, onFailure, concurrency) {
      if (typeof onFailure === 'number') {
        concurrency = onFailure;
        onFailure = undefined;
      }
      let { success, failure } = setHandlers(function (data) {
        if (!Array.isArray(data)) return resources.Promisie.reject(new TypeError('ERROR: each expects input to be an array'));
        if (typeof onSuccess !== 'function') return resources.Promisie.reject(new TypeError('ERROR: each expects onSuccess handler to be a function'));
        return resources.Promisie.each(data, concurrency, onSuccess);
      }, onFailure);
      return this.then(success, failure);
    };
  },
  settle: function (resources) {
    return function _settle (onSuccess, onFailure) {
      let { success, failure } = setHandlers(function (data) {
        if (!Array.isArray(data)) return resources.Promisie.reject(new TypeError('ERROR: settle expects input to be an array'));
        if (typeof onSuccess !== 'function') return resources.Promisie.reject(new TypeError('ERROR: settle expects onSuccess handler to be a function'));
        let operations = data.map(d => () => onSuccess(d));
        return resources.Promisie.settle(operations);
      }, onFailure);
      return this.then(success, failure);
    };
  },
  retry: function (resources) {
    return function _retry (onSuccess, onFailure, options) {
      if (typeof onFailure === 'object') {
        options = onFailure;
        onFailure = undefined;
      }
      let { success, failure } = setHandlers(function (data) {
        if (typeof onSuccess !== 'function') return resources.Promisie.reject(new TypeError('ERROR: retry expects onSuccess handler to be a function'));
        return resources.Promisie.retry(() => {
          return onSuccess(data);
        }, options);
      }, onFailure);
      return this.then(success, failure);
    };
  },
  finally: function (resources) {
    return function _finally (handler) {
      let _handler = () => (typeof handler === 'function') ? handler() : resources.Promisie.reject(new TypeError('ERROR: finally expects handler to be a function'));
      return this.then(_handler, _handler);
    };
  }
};

module.exports = CHAINABLES;
