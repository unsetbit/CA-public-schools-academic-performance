var colorbrewer = require('./colorbrewer');

module.exports = function geoChart(config){
  var svg, tooltip;

  // Configurable
  var width,
    height,
    property,
    filter;

  // Derived
  var projection,
    path,
    zoom;

  function updateProjection(){
    projection = d3.geo.albers()
      .scale(3500)
      .translate([width/2, height/2])
      .rotate([118.5,1.4]);

    updatePath();
    updateZoom();
  }

  function updatePath(){
    path =  d3.geo.path().projection(projection);
  }
  
  function updateZoom(){
    zoom = d3.behavior.zoom()
    .translate(projection.translate())
    .scale(projection.scale())
    .scaleExtent([height / 8, 80 * height])
    .on("zoom", function zoomed() {
      projection.translate(d3.event.translate).scale(d3.event.scale);
      redrawPaths(d3.event.scale);
    });
  }

  function init(config){
    if('property' in config) draw.property(config.property);

    if('filter' in config) draw.filter(config.filter);
    else draw.filter(function(){return true;}); // default

    if('width' in config) draw.width(config.width);
    else draw.width(960); // default

    if('height' in config) draw.height(config.height);
    else draw.height(800); // default;
  }

  function redrawPaths(){
    svg.selectAll('.districts path').attr('d', path);
  }

  // Build legend
  function buildLegend(svg, color, height){
    var colorDomainMin = color.domain()[0];
    var colorDomainMax = color.domain()[1];
    var legendSteps = 5;
    var colorStep = (colorDomainMax - colorDomainMin) / legendSteps
    var legendDomain = [];
    var legendLabels = [];
    var legendValueStart, legendValueEnd;

    for(var i = 0; i < legendSteps; i++){
      legendValueStart =  (colorDomainMin + colorStep * i)|0;
      legendValueEnd = (colorDomainMin + colorStep * (i + 1) - 1)|0;
      legendDomain.push(legendValueStart);
      legendLabels.push(legendValueStart + ' - ' + legendValueEnd);
    }

    svg.selectAll("g.legend").remove();
    var legend = svg.selectAll("g.legend")
      .data(legendDomain)
      .enter()
        .append("g")
          .classed('legend', true);

    var ls_w = 20, 
        ls_h = 20;

    legend.append("rect")
      .attr("x", 20)
      .attr("y", function(d, i){ return height - (i*ls_h) - 2*ls_h;})
      .attr("width", ls_w)
      .attr("height", ls_h)
      .style("fill", function(d, i) { return color(d); })
      .style("opacity", 0.8);

    legend.append("text")
      .attr("x", 50)
      .attr("y", function(d, i){ return height - (i*ls_h) - ls_h - 4;})
      .text(function(d, i){ return legendLabels[i]; });
  }

  function getMinMax(features, property){
    var min = 1e15,
      max = 0;

    features.forEach(function(feature){
      var value = feature.properties[property];

      if(value < min ) min = value;
      else if(value > max) max = value;
    });

    if(~property.indexOf('Performance')){
      min = 200;
      max = 1000; 
    } else if(~property.indexOf('%')) {
      min = 0;
      max = 100;
    } else {
      switch(property){
        case 'ACS_46':
        case 'NOT_HSG':
          min = 100;
          max = 0;
          break;
      }
    }

    return [min, max];
  }

  function getColorer(features, property){
    var range = colorbrewer.RdYlGn[10].slice(0);
    var min = 1e15, max = 0;

    features.forEach(function(feature){
      var value = feature.properties[property];

      if(value < min ) min = value;
      else if(value > max) max = value;
    });

    if(~property.indexOf('Performance')){
      min = 200;
      max = 1000; 
    } else if(~property.indexOf('%')){
      min = 0;
      max = 100;
    } else {
      switch(property){
        case 'ACS_46':
        case 'NOT_HSG':
          range = range.reverse();
          min = 0;
          max = 100;
          break;
        case 'HSG':
        case 'SOME_COL':
        case 'COL_GRAD':
        case 'GRAD_SCH':
          min = 0;
          max = 100;
          break;

      }
    }

    return d3.scale.quantile()
      .range(range)
      .domain([min, max]);
  }

  function draw(container){
    var element = container.node();
    var data = container.datum();
    var districts = topojson.feature(data, data.objects.districts).features;
    districts = districts.filter(filter);
    
    svg = container
      .selectAll('svg')
        .data([data])
      .enter()
        .append("svg")
          .classed('geo-chart', true)
          .attr("width", width)
          .attr("height", height)
          .call(zoom);
  
    tooltip = container.append("div")   
      .classed('tooltip', true)               
      .style({
        opacity: 0,
        position: "absolute"
      });

    var districtsGroup = svg.append('g')
            .attr('class', 'districts')
            .datum(districts);

    draw.property(property);
  }

  draw.width = function(_){
    if (!arguments.length) return width;
    width = _;
    updateProjection();
    
    return draw;
  };

  draw.filter = function(_){
    if (!arguments.length) return filter;
    filter = _;
    return draw;
  };

  draw.height = function(_){
    if (!arguments.length) return height;
    height = _;
    
    updateProjection();
    
    return draw;
  };

  draw.redraw = function(container){
    if(svg) svg.remove();
    draw(container);
    return draw;
  };

  draw.property = function(_){
    if (!arguments.length) return property;
    property = _;
    
    if(!svg) return;

    console.log('Setting property to', property);
    var districtsGroup = svg.selectAll('.districts');
    var districts = districtsGroup.data()[0];
    
    districtsGroup.selectAll('path').remove();
    var paths = districtsGroup.selectAll('path')
        .data(districts);

    var color = getColorer(districts, property);
    paths.enter().append('path')
        .style('fill', function(d){ 
          if(!d.properties[property]) return '';
          return color(d.properties[property]);   
        })
        .on("mousemove", function(d){
          tooltip
            .style("left", (d3.event.layerX) + "px")
            .style("top", (d3.event.layerY -30) + "px");
        })
        .on("mouseover", function(d) {
          if(!d.properties.District) return;
          
          tooltip
            .transition()
            .duration(300)
            .style("opacity", 1)
          tooltip.text(d.properties.District + " - " + d.properties[property] + " " + property)
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY -30) + "px");
        })
        .on("mouseout", function() {
          tooltip.transition().duration(300)
          .style("opacity", 0);
        });

    buildLegend(svg, color, height);

    redrawPaths();
  };

  draw.draw = function(container){
    draw(container);
    return draw;
  };

  init(config || {});

  return draw;
};