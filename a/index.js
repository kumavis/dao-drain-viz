const d3 = require('d3')
const traceData = require('./trace.json')

// format data for graph
var graph = { nodes: [], links: [] }
var addressToNodeIndex = {}

forKeyValue(traceData.accounts, function(address, account){
  var index = graph.nodes.length
  addressToNodeIndex[address] = index
  graph.nodes.push(account)
})

forKeyValue(traceData.calls, function(sequence, callParams){
  graph.links.push({
    source: addressToNodeIndex[callParams.fromAddress],
    target: addressToNodeIndex[callParams.toAddress],
    depth: callParams.depth,
  })
})

function forKeyValue(obj, fn){
  for (var key in obj){
    var val = obj[key]
    fn(key, val)
  }
}


var width = 960,
    height = 500

var color = d3.scale.category20()

var force = d3.layout.force()
    .charge(-120)
    .linkDistance(30)
    .size([width, height])

var svg = d3.select('body').append('svg')
    .attr('width', width)
    .attr('height', height)


force
    .nodes(graph.nodes)
    .links(graph.links)
    .start()

// define calls (links)
var link = svg.selectAll('.link')
    .data(graph.links)
  .enter().append('line')
    .attr('class', 'link')
    .style('stroke-width', function(d) { return Math.sqrt(10) })
    .style('stroke', function(d) { return color(d.depth%20) })
    .attr("id",function(d,i) { return "linkId_" + i; })

// var linktext = svg.append("svg:g").selectAll("g.linklabelholder").data(force.links());
//     linktext.enter().append("g").attr("class", "linklabelholder")
//      .append("text")
//      .attr("class", "linklabel")
//    .style("font-size", "13px")
//      .attr("x", "50")
//    .attr("y", "-20")
//      .attr("text-anchor", "start")
//      .style("fill","#000")
//    .append("textPath")
//     .attr("xlink:href",function(d,i) { return "#linkId_" + i;})
//      .text(function(d) { 
//    return Math.random(); 
//    });

// define accounts (nodes)
var node = svg.selectAll('.node')
    .data(graph.nodes)
  .enter().append('circle')
    .attr('class', 'node')
    .attr('r', 5)
    // new color for each depth, looping over 20 colors
    // .style('fill', function(d) { return color(d.depth%20) })
    .call(force.drag)

node.append('title')
    .text(function(d) { return d.address })

// force-direction
force.on('tick', function() {
  link.attr('x1', function(d) { return d.source.x })
      .attr('y1', function(d) { return d.source.y })
      .attr('x2', function(d) { return d.target.x })
      .attr('y2', function(d) { return d.target.y })

  node.attr('cx', function(d) { return d.x })
      .attr('cy', function(d) { return d.y })
})