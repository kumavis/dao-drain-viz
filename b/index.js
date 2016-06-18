const d3 = require('d3')
const traceData = require('../trace.json')

// var links = [{source: "John", target: "Eric", type: "UVA"},
//              {source: "John", target: "Chip", type: "School"},
//              {source: "Chip", target: "Eric", type: "Golf"},
//              {source: "John", target: "Eric", type: "Prework"},
//              {source: "Eric", target: "John", type: "Board"}]

// format data for graph
var links = []

forKeyValue(traceData.calls, function(sequence, callParams){
  links.push({
    source: callParams.fromAddress,
    target: callParams.toAddress,
    type: callParams.depth,
  })
})

function forKeyValue(obj, fn){
  for (var key in obj){
    var val = obj[key]
    fn(key, val)
  }
}


//sort links by source, then target
links.sort(function(a,b) {
    if (a.source > b.source) {return 1;}
    else if (a.source < b.source) {return -1;}
    else {
        if (a.target > b.target) {return 1;}
        if (a.target < b.target) {return -1;}
        else {return 0;}
    }
});
// //any links with duplicate source and target get an incremented 'linknum'
// for (var i=0; i<links.length; i++) {
//     var currentLink = links[i]
//     var prevLink = links[i-1]
//     if (prevLink){
//       var linksMatch = currentLink.source === prevLink.source && currentLink.target === prevLink.target

//     } else {
//       currentLink.linknum = 1
//     }
//     if (i > 0 &&
//         currentLink.source == prevLink.source &&
//         currentLink.target == prevLink.target) {
//             currentLink.linknum = prevLink.linknum + 1;
//         }
//     else {currentLink.linknum = 1;};
// };
var repeatLinks = {}
links.forEach(function(link){
  var vertices = [link.source,link.target].sort()
  var key = vertices.join(',')
  // init as array
  var matchingLinks = repeatLinks[key] = repeatLinks[key] || []
  // mark link with incrementing matchingLink num, so we can bend away
  link.linknum = matchingLinks.length
  console.log(key, link.linknum)
  matchingLinks.push(link)
})
repeatLinks=null

var nodes = {};

// Compute the distinct nodes from the links.
links.forEach(function(link) {
  link.source = nodes[link.source] || (nodes[link.source] = {name: link.source});
  link.target = nodes[link.target] || (nodes[link.target] = {name: link.target});
});

var w = 600,
    h = 600;

var force = d3.layout.force()
    .nodes(d3.values(nodes))
    .links(links)
    .size([w, h])
    .linkDistance(150)
    .charge(-300)
    .on("tick", tick)
    .start();

var svg = d3.select("body").append("svg:svg")
    .attr("width", w)
    .attr("height", h)
  .style("background" ,"#FFF7DB");

// Per-type markers, as they don't inherit styles.
// svg.append("svg:defs").selectAll("marker")
//     .data(["UVA", "Prework", "School","Golf","Board"])
//   .enter().append("svg:marker")
//     .attr("id", String)
//     .attr("viewBox", "0 -5 10 10")
//     .attr("refX", 30)
//     .attr("refY", -4.5)
//     .attr("markerWidth", 6)
//     .attr("markerHeight", 6)
//     .attr("orient", "auto")
//   .append("svg:path")
//     .attr("d", "M0,-5L10,0L0,5");

var path = svg.append("svg:g").selectAll("path")
    .data(force.links())
  .enter().append("svg:path")
    .attr("class", function(d) { return "link " + d.type; })
  .attr("id",function(d,i) { return "linkId_" + i; })
    .attr("marker-end", function(d) { return "url(#" + d.type + ")"; });


    var linktext = svg.append("svg:g").selectAll("g.linklabelholder").data(force.links());
  
    linktext.enter().append("g").attr("class", "linklabelholder")
     .append("text")
     .attr("class", "linklabel")
   .style("font-size", "13px")
     .attr("x", "50")
   .attr("y", "-20")
     .attr("text-anchor", "start")
     .style("fill","#000")
   .append("textPath")
    .attr("xlink:href",function(d,i) { return "#linkId_" + i;})
     .text(function(d) { 
   return d.type; 
   });
  
var circle = svg.append("svg:g").selectAll("circle")
    .data(force.nodes())
  .enter().append("svg:circle")
    .attr("r", 20)
  .style("fill", "#FD8D3C")
    .call(force.drag);

var text = svg.append("svg:g").selectAll("g")
    .data(force.nodes())
  .enter().append("svg:g");

text.append("svg:text")
    .attr("x", "-1em")
    .attr("y", ".31em")
   .style("font-size", "13px")
    .text(function(d) { return d.name; });

// Use elliptical arc path segments to doubly-encode directionality.
function tick() {
  path.attr("d", function(d) {
    var dx = d.target.x - d.source.x,
        dy = d.target.y - d.source.y,
        // dr = 75/(d.linknum+1);  //linknum is defined above
        // dr = 200;  //linknum is defined above
        dr = Math.pow(10,3-d.linknum)
    // console.log('dr:',dr)
    return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
  });

  circle.attr("transform", function(d) {
    return "translate(" + d.x + "," + d.y + ")";
  });

  text.attr("transform", function(d) {
    return "translate(" + d.x + "," + d.y + ")";
  });
   
 
}