;(function (win, ko, lq) {

  function TaskListViewModel() {

    function Task() {
      // this is data for the individual tasks items in the UI
      var self = this;
      self.taskNumber = (taskNumber += 1);
      self.taskStatus = ko.observable('Pending');
      self.taskClass = ko.computed(function () {
        var ts = self.taskStatus();
        return ts === 'Pending' ? 'alert alert-danger' :
               ts === 'Working' ? 'alert alert-warning' :
               'alert alert-success';
      });

      // this is the task we'll be passing to the queue
      self.onStart = function () {
        var qs = lq.size();
        self.taskStatus('Working');

        // delay update to task status and queue size
        // so humans can see what's actually happening
        setTimeout(function () {
          self.taskStatus('Complete');
          root.queueSize(qs);
        }, (delay += 200));

        root.inFlight(lq.inFlight());
        root.isRunning(lq.isRunning());
      };
    }

    var root = this,
        taskNumber = 0,
        delay = 0;

    // some data
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

    // some methods
    root.addTask = function () {
      var task = new Task();
      lq.addTask(task.onStart);
      root.tasks.push(task);
      root.queueSize(lq.size());
      delay = 0;
    };
    root.removeTask = function (task) {
      root.tasks.remove(task); // this is strictly to remove tasks from the UI after completion
    };
    root.runQueue = lq.start;

    // when queue has emptied out
    lq.addCallback(function () {
      root.inFlight(lq.inFlight());
      root.isRunning(lq.isRunning());
    });
  }

  ko.applyBindings(new TaskListViewModel());

}(window, ko, Queue(2)));