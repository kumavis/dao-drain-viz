const async = require('async')
const Raphael = require('./raphael.js')
const traceData = require('../trace.json')
const contractNicknames = {
  '0xbb9bc244d798123fde783fcc1c72d3bb8c189413': 'TheDAO',
  '0x304a554a310c7e546dfe434669c62820b7d83490': 'DarkDAO',
  '0xc0ee9db1a9e07ca63e4ff0d5fb6f86bf68d47b89': 'AttackerProxy-c0ee',
  '0xf835a0247b0063c04ef22006ebe57c5f11977cc4': 'AttackerProxy-f835',
  '0x4a574510c7014e4ae985403536074abe582adfc8': 'DAO-Creator',
  '0x807640a13483f8ac783c557fcdf27be11ea4ac7a': 'TheDAO extraBalance',
  '0xda4a4626d3e16e094de3225a751aab7128e96526': 'CuratorMultiSig',
  '0x969837498944ae1dc0dcac2d0c65634c88729b2d': 'Attacker',
  '0x914d1b8b43e92723e64fd0a06f5bdb8dd9b10c79': 'DarkDAO extraBalance',
  '0xd2e16a20dd7b1ae54fb0312209784478d069c7b0': 'TheDAO rewardAccount',
  '0x1d29edb6997993a16c5086733cfd735d01df787c': 'TheDAO DAOrewardAccount',
}

// format data for graph
var graphData = { nodes: [], links: [] }
var addressToNodeIndex = {}

forKeyValue(traceData.accounts, function(address, account){
  var index = graphData.nodes.length
  addressToNodeIndex[address] = index
  graphData.nodes.push(account)
})

forKeyValue(traceData.calls, function(sequence, callParams){
  graphData.links.push({
    source: addressToNodeIndex[callParams.fromAddress],
    target: addressToNodeIndex[callParams.toAddress],
    depth: callParams.depth,
  })
})

// init paper
var paper = Raphael('holder', 640, 480)
global.paper = paper
var pallete = ColorPallete()

// add arrow head
var arrow1 = [2,2]
var arrow2 = [2,11]
var arrow3 = [10,6]
paper.defs.innerHTML = `
  <linearGradient id='grad'>
    <stop stop-color='magenta'/>
    <stop offset='100%' stop-color='black'/>
  </linearGradient>
<marker id="markerArrow" markerWidth="13" markerHeight="13" refX="10" refY="6"
       orient="auto">
    <path d="M${arrow1} L${arrow2} L${arrow3} L${arrow1}" style="fill: #000000;" />
</marker>
`

// accounts -> nodes
// var accountList = valuesFor(traceData.accounts)
var nodes = graphData.nodes.map((item, index) => {
  var color = pallete.getColor()
  var circle = paper.circle(320, 450, 20)
  var percentRotation = index/graphData.nodes.length
  // var angle = 360*percentRotation
  // var transform = `r${angle} 320 240`
  var center = [260,220]
  var radius = 200
  var cx = center[0]+radius*Math.cos(2*Math.PI*percentRotation)
  var cy = center[1]+radius*Math.sin(2*Math.PI*percentRotation)
  circle.attr({
    stroke: color,
    fill: color,
    // transform: transform,
    cx: cx,
    cy: cy,
    'fill-opacity': .4,
  })
  return circle
})

// label nodes
var labels = paper.set()
nodes.forEach((node,index) => {
  var account = graphData.nodes[index]
  var text = paper.text(320, 450, getNodeLabel(account.address))
  var angle = 360*(index/graphData.nodes.length)
  // var transform = `r${angle} 320 240`
  // text.attr({ transform: transform })
  text.attr({
    x: node.attr('cx'),
    y: node.attr('cy'),
  })
  labels.push(text)
})
labels.attr({font: "12px Fontin-Sans, Arial", fill: "#fff", "text-anchor": "start"})

// draw links
pallete.reset()
var links = graphData.links.map((linkData, index) => {
    var sourceNode = nodes[linkData.source]
    var targetNode = nodes[linkData.target]
    // var link = paper.set()
    var sourcePoint = [sourceNode.attr('cx'),sourceNode.attr('cy')]
    var targetPoint = [targetNode.attr('cx'),targetNode.attr('cy')]
    var pathString = `M${sourcePoint}L${targetPoint}`
    var line = paper.path(pathString).attr({
      stroke: pallete.getColor(),
      'stroke-width': 2,
    })
    // have to set manually
    // line.node.style.stroke='url(#grad)'
    line.node.style.markerEnd='url(#markerArrow)'
    line.node.style.opacity = 0
  return line
})

// setTimeout(function(){
  async.eachSeries(links, animateLink)
// }, 10000)

function animateLink(link, cb){
  async.series([
    showLink,
    delay,
    ghostLink,
    delay,
  ], cb)

  function showLink(cb){
    link.node.style.opacity = 1
    cb()
  }

  function delay(cb){
    setTimeout(cb, 400)
  }

  function ghostLink(cb){
    link.node.style.opacity = 0.2
    cb()
  }
}


// util

function getNodeLabel(address){
  var nickname = contractNicknames[address]
  return nickname || address.slice(0,8)
}

function valuesFor(obj){
  return Object.keys(obj).map(key=>obj[key])
}

function forKeyValue(obj, fn){
  for (var key in obj){
    var val = obj[key]
    fn(key, val)
  }
}

// while (angle < 360) {
//     var color = pallete.getColor()
//     var transform = `r${angle} 320 240`
//     r.circle(320, 450, 20).attr({stroke: c, fill: c, transform: , 'fill-opacity': .4})
//         // .click(function () {
//         //     s.animate({transform: t, stroke: c}, 2000, 'bounce')
//         // }).mouseover(function () {
//         //     this.animate({'fill-opacity': .75}, 500)
//         // }).mouseout(function () {
//         //     this.animate({'fill-opacity': .4}, 500)
//         // })
//     })(, color)
//     angle += 30
// }

// var currentPallete = ColorPallete.slice()
// var s = r.set()
// s.push(r.path('M320,240c-50,100,50,110,0,190').attr({fill: 'none', 'stroke-width': 2}))
// s.push(r.circle(320, 450, 20).attr({fill: 'none', 'stroke-width': 2}))
// s.push(r.circle(320, 240, 5).attr({fill: 'none', 'stroke-width': 10}))
// s.attr({stroke: currentPallete.pop()})


function ColorPallete(){
  var currentIndex = 0
  var pallete = ['#7cbf00', '#26bf00', '#00bf2f', '#00bf85', '#00a2bf', '#004cbf', '#0900bf', '#5f00bf', '#b500bf', '#bf0072', '#bf001c', '#bf2626']
  return {
    getColor: ()=>{currentIndex++; return pallete[currentIndex%pallete.length]},
    reset: ()=>{currentIndex=0},
  }
}