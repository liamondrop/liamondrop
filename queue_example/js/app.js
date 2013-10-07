;(function (win, ko, lq) {

  function TaskListViewModel() {

    function Task() {
      var self = this;
      self.taskNumber = (taskNumber += 1);
      self.status = ko.observable('Pending');
      self.taskClass = ko.computed(function () {
        var status = self.status();
        return status === 'Pending' ? 'alert alert-danger' :
               status === 'Working' ? 'alert alert-warning' :
               'alert alert-success';
      });
      self.onStart = function () {
        var qs = lq.size();
        self.status('Working');
        setTimeout(function () {
          self.status('Complete');
          root.queueSize(qs);
        }, (delay += 200));
        root.inFlight(lq.inFlight());
        root.isRunning(lq.isRunning());
      };
    }

    var root = this,
        taskNumber = 0,
        delay = 0;

    root.tasks = ko.observableArray([]);
    root.queueSize = ko.observable(lq.size());
    root.inFlight = ko.observable(lq.inFlight());
    root.isRunning = ko.observable(lq.isRunning());
    root.queueStatus = ko.computed(function () {
      return root.isRunning() ? 'Running' : 'Stopped';
    });
    root.parallelism = ko.computed({
      read: function () {
        return lq.parallelism;
      },
      write: function (value) {
        lq.parallelism = win.parseFloat(value);
      },
      owner: root
    });

    root.addTask = function () {
      var task = new Task();
      lq.addTask(task.onStart);
      root.tasks.push(task);
      root.queueSize(lq.size());
      delay = 0;
    };
    root.removeTask = function (task) {
      root.tasks.remove(task);
    };
    root.runQueue = lq.start;

    lq.addCallback(function () {
      root.inFlight(lq.inFlight());
      root.isRunning(lq.isRunning());
    });
  }

  ko.applyBindings(new TaskListViewModel());

}(window, ko, Queue(2)));