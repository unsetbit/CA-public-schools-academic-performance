var geoChart = require('./geoChart');
var throttle = require('lodash.throttle');

module.exports = function geoDirective(){
  return {
    restrict: 'E',
    scope: {
      'topo': '=',
      'filter': '=',
      'width': '@',
      'height': '@',
      'property': '@'
    },
    link: function(scope, element, attrs){
      var chart = geoChart();
      var d3Element = d3.select(element[0]);
      var data;

      // Prevent attempts to draw more than once a frame
      var throttledRedraw = throttle(chart.redraw, 16);

      function redraw(){
        if(!data) return;
        throttledRedraw(d3Element);
      }

      attrs.$observe('property', function(value){
        chart.property(value || '');
        redraw();
      });

      attrs.$observe('width', function(value){
        if(!value && value !== 0) return;
        chart.width(value);
        redraw();
      });

      attrs.$observe('height', function(value){
        if(!value && value !== 0) return;
        chart.height(value);
        redraw();
      });

      scope.$watch('topo', function(value){
        if(!value) return;
        data = value;
        d3Element.datum(value).call(chart);
      });

      scope.$watch('filter', function(value){
        if(typeof value === "function"){
          chart.filter(value);
          redraw();
        }
      });
    }
  }
}
