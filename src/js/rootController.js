function domain(dimension, data){ 
  if(~dimension.indexOf('Performance')){
    return [200, 1000];
  } else if(~dimension.indexOf('%')) {
    return [0,100];
  } else {
    return d3.extent(data, function(d) { return +d[dimension]; });
  }
};

var nameMap =  {
  API: 'Academic Performance',
  HI_API: 'Hispanic Academic Performance',
  WH_API: 'White Academic Performance',
  COL_GRAD: '% Parents Graduated College',
  PCT_WH: '% White Students',
  PCT_HI: '% Hispanic Students'
};

var noFilterText = 'all California School Districts';

module.exports = function rootController($scope, $http){
  $scope.pcChart = {
    highlight: nameMap.API,
    select: [nameMap.API, nameMap.WH_API, nameMap.HI_API,nameMap.COL_GRAD, nameMap.PCT_WH, nameMap.PCT_HI],
    config: {
      domain: domain
    }
  };

  $scope.sampleChart = angular.copy($scope.pcChart);
  $scope.sampleChart.select = [nameMap.API, nameMap.WH_API, nameMap.HI_API,nameMap.COL_GRAD];

  $scope.getFilterText = function(){
    var filters = $scope.pcChart.filters;
    if(!filters) return noFilterText;

    var dimensions = Object.keys(filters);
    if(!dimensions.length) return noFilterText;

    var result = 'California School Districts which have ';
    result += dimensions.map(function(dimension){
      var filter = filters[dimension];
      return dimension + ' between ' + (filter[0]|0) + ' and ' + (filter[1]|0);
    }).join(', and ');

    return result;
  };

  $scope.alwaysTrue = function(){return true;};

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
    response.data.objects.districts.geometries.forEach(function(district){
      if(!district.properties) return;
      renameMany(district.properties, nameMap);
    });

    var topo = response.data;
    $scope.topo = topo;
    
    $scope.pcChart.data = topojson.feature(topo, topo.objects.districts).features
      .map(function(d){
        var props = d.properties;
        Object.keys(props).forEach(function(key){
          if(~key.indexOf('Performance') && props[key] < 200){
            delete props[key]; // remove invalid API scores
          }
        });

        return props;
      })
      .filter(function(d){ 
        return d[nameMap.API]; // Ensure the data atleast has API scores
      });
  });
}

function rename(obj, oldName, newName){
  obj[newName] = obj[oldName];
  delete obj[oldName];
}

function renameMany(obj, nameMap){
  for(oldName in nameMap){
    rename(obj, oldName, nameMap[oldName]);
  }
}