var topojson = require('topojson');


function domain(dimension, data){ 
  if(~dimension.indexOf('API')){
    return [200, 1000];
  } else if(~dimension.indexOf('PCT')) {
    return [0,100];
  } else {
    return d3.extent(data, function(d) { return +d[dimension]; });
  }
};

module.exports = function rootController($scope, $http){
  $scope.pcChart = {
    highlight: 'COL_GRAD',
    select: ['API', 'WH_API', 'HI_API','COL_GRAD','PCT_WH','PCT_HI'],
    config: {
      domain: domain
    }
  };

  $scope.$watch('pcChart.filters', function(filters){
    if(!filters) return;

    $scope.geoFilter = function(obj){
      var dimension, value, filter;
      for(dimension in filters){
        value = obj.properties[dimension];
        filter = filters[dimension];

        if(value < filter[0] || value > filter[1]) return false;
      }

      return true;
    };
  });

  $http.get('data/data.topo.json').then(function(response){
    var topo = response.data;
    $scope.topo = topo;
    
    $scope.pcChart.data = topojson.feature(topo, topo.objects.districts).features
      .map(function(d){
        var props = d.properties;
        Object.keys(props).forEach(function(key){
          if(~key.indexOf('API') && props[key] < 200){
            delete props[key]; // remove invalid API scores
          }
        });

        return props;
      })
      .filter(function(d){ 
        return d.API; // Ensure the data atleast has API scores
      });
  });
}