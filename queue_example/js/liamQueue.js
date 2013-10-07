;(function (global) {

  global.Queue = function liamQueue(parallelism) {
    if (undefined === parallelism || 1 > parallelism) {
      parallelism = 1;
    }

    var _tasks = [],
    _jobsRunning = 0,
    _working = false,
    _cb = {},
    _noop = function () {},
    _isFunc = function (fn) {
      return 'function' === typeof fn;
    },
    _flush = function () {
      if (_tasks.length && _jobsRunning < lq.parallelism) {
        var item = _tasks.shift();
        _jobsRunning += 1;
        setTimeout(function () {
          _working = true;
          try {
            if (_isFunc(item.task)) {
              item.task.call(item.context, item.task);
              _jobsRunning -= 1;
            }
            if (_tasks.length + _jobsRunning === 0 && _isFunc(_cb.callback)) {
              _working = false;
              _cb.callback.call(_cb.context, _cb.callback);
            }
          } catch (err) {}
          _flush();
        }, 0);
      }
    },
    lq = {
      parallelism: parallelism,
      size: function () {
        return _tasks.length;
      },
      isRunning: function () {
        return _working;
      },
      inFlight: function () {
        return _jobsRunning;
      },
      addTask: function (task, context) {
        var taskItem = {
          task: task || _noop,
          context: context || lq
        };
        _tasks.push(taskItem);
        return lq;
      },
      addCallback: function (callback, context) {
        _cb = {
          callback: callback || _noop,
          context: context || lq
        };
        return lq;
      },
      start: function () {
        _flush();
        return lq;
      }
    };
    return lq;
  };

}(typeof exports != 'undefined' && exports !== null ? exports : window));