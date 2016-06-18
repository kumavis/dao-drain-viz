const d3 = require('d3')
const traceData = require('../trace.json')

// format data for graph
var graph = { nodes: [], links: [] }
var addressToNodeIndex = {}

forKeyValue(traceData.accounts, function(address, account){
  var index = graph.nodes.length
  addressToNodeIndex[address] = index
  graph.nodes.push(account)
})

forKeyValue(traceData.calls, function(sequence, callParams, index){
  graph.links.push({
    source: addressToNodeIndex[callParams.fromAddress],
    target: addressToNodeIndex[callParams.toAddress],
    depth: callParams.depth,
  })
})

function forKeyValue(obj, fn){
  var index = 0
  for (var key in obj){
    var val = obj[key]
    fn(key, val, index)
    index++
  }
}

var width = 960,
    height = 500

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)

var force = d3.layout.force()
    .gravity(0.05)
    .distance(100)
    .charge(-100)
    .size([width, height])

force
    .nodes(graph.nodes)
    .links(graph.links)
    .start()

setTimeout(function(){
  force.stop()
}, 2000)

var color = d3.scale.category20()

var link = svg.selectAll(".link")
    .data(graph.links)
  .enter().append("line")
    // .attr("class", "link")
    .attr("id", function(d,index){ return `link-${index}`})
    .attr("class", function(d){ return 'link invisible' })
    // .attr("stroke", function(d,index){ return color(index%20) })
    .style('stroke-width', function(d) { return Math.sqrt(10) })

var node = svg.selectAll(".node")
    .data(graph.nodes)
  .enter().append("g")
    .attr("class", "node")
    .call(force.drag)

  node.append('circle')
    .attr('class', 'node')
    .attr('r', 5)

node.append("text")
    .attr("dx", 12)
    .attr("dy", ".35em")
    .text(function(d) { return d.address.slice(0,8) })

force.on("tick", function() {
  link.attr("x1", function(d) { return d.source.x })
      .attr("y1", function(d) { return d.source.y })
      .attr("x2", function(d) { return d.target.x })
      .attr("y2", function(d) { return d.target.y })

  node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")" })
})

// de-invis
var invisIndex = 0
setInterval(function(){
  var el = document.getElementById(`link-${invisIndex}`)
  // console.log(invisIndex, el)
  if (!el) return
  el.classList.remove('invisible')
  invisIndex++
}, 200)