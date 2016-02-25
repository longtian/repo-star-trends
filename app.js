/**
 * Created by yan on 16-2-25.
 */

(function () {

  var nameElement = document.getElementById('name');
  var graph2dContainer = document.getElementById('graph2d');
  var timelineContainer = document.getElementById('timeline');

  var dataset = new vis.DataSet();

  var graph2d = new vis.Graph2d(graph2dContainer, dataset, {
    height: 300
  });
  var timeline = new vis.Timeline(timelineContainer, dataset, {
    height: 360,
    zoomMin: 1000 * 60 * 60 * 24,          // a day
    zoomMax: 1000 * 60 * 60 * 24 * 30 * 3  // three months
  });
  graph2d.on('rangechanged', function (e) {
    if (e.byUser) {
      timeline.setWindow(e.start, e.end)
    }
  })

  timeline.on('rangechanged', function (e) {
    if (e.byUser) {
      graph2d.setWindow(e.start, e.end)
    }
  })
  var worker = new Worker('worker.js');

  worker.addEventListener('message', function (e) {
    switch (e.data.type) {
      case 'SET_WINDOW':
        graph2d.setWindow(e.data.payload, new Date);
        timeline.setWindow(e.data.payload, new Date);
        break;
      case 'ADD_DATA':
        dataset.add(e.data.payload);
        break;
    }
  });

  window.show = function () {
    dataset.clear();
    worker.postMessage(nameElement.value);
    return;
  }

})();
