/*
* Code based on example code for Circle Packing by Mike Bostock
*
*/

(function () {
  'use strict';

  var svg = d3.select("svg"),
      width = +svg.attr("width"),
      height = +svg.attr("height");

  var format = d3.format(",d");

  //Variable for putting data into a hierarchy
  var stratify = d3.stratify()
      .parentId(function(d) { return d.id.substring(0, d.id.lastIndexOf(".")); });

  //Variable for packing data which will be used later on
  var pack = d3.pack()
      .size([width - 2, height - 2])
      .padding(3);

  //putting data from the Pokemon.csv into a hierarchy and then packing it
  d3.csv("Pokemon.csv").then(function(data) {
    
    var root = stratify(data)
        .sum(function(d) { return d.HP; })
        .sort(function(a, b) { return b.HP - a.HP; });

    pack(root);

    //Variables for the colours which will be assigned to each Pokemon type of which the variable is named. Tried finding 18 distinct colours to make it easy
    var Bug = '#bfef45';
    var Dark = '#aaaaaa';
    var Dragon = '#800000';
    var Electric = '#42d4f4';
    var Fairy = '#ffe119';
    var Fighting = '#911eb4';
    var Fire = '#e6194B';
    var Flying = '#469990';
    var Ghost = '#a9a9a9';
    var Grass = '#3cb44b';
    var Ground = '#808000';
    var Ice = '#000075';
    var Normal = '#ffd8b1';
    var Poison = '#aaffc3';
    var Psychic = '#fabebe';
    var Rock  = '#9A6324';
    var Steel = '#fffac8';
    var Water = '#4363d8';
    var Pokemon = '#f58231';

    //The next chunks of code are on setting up the nodes and actually drawing the visualisations
    var node = svg.select("g")
      .selectAll("g")
      .data(root.descendants())
      .enter().append("g")
        .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
        .attr("class", function(d) { return "node" + (!d.children ? " node--leaf" : d.depth ? "" : " node--root"); })
        .each(function(d) { d.node = this; })
        .on("mouseover", hovered(true))
        .on("mouseout", hovered(false));

    node.append("circle")
        .attr("id", function(d) { return "node-" + d.id; })
        .attr("r", function(d) { return d.r; })
        //If statements are for assigning the correct colour to the correct Pokemon Type with the use of the colour variables above
        .style("fill", function(d) { if(d.id.substring(d.id.lastIndexOf(".") + 1).split(/(?=[A-Z][^A-Z])/g) == 'Bug') {
          return Bug;
        } else if(d.id.substring(d.id.lastIndexOf(".") + 1).split(/(?=[A-Z][^A-Z])/g) == 'Dark'){
          return Dark;
        } else if(d.id.substring(d.id.lastIndexOf(".") + 1).split(/(?=[A-Z][^A-Z])/g) == 'Dragon'){
          return Dragon;
        }else if(d.id.substring(d.id.lastIndexOf(".") + 1).split(/(?=[A-Z][^A-Z])/g) == 'Electric'){
          return Electric;
        }else if(d.id.substring(d.id.lastIndexOf(".") + 1).split(/(?=[A-Z][^A-Z])/g) == 'Fairy'){
          return Fairy;
        }else if(d.id.substring(d.id.lastIndexOf(".") + 1).split(/(?=[A-Z][^A-Z])/g) == 'Fighting'){
          return Fighting;
        }else if(d.id.substring(d.id.lastIndexOf(".") + 1).split(/(?=[A-Z][^A-Z])/g) == 'Fire'){
          return Fire;
        }else if(d.id.substring(d.id.lastIndexOf(".") + 1).split(/(?=[A-Z][^A-Z])/g) == 'Flying'){
          return Flying;
        }else if(d.id.substring(d.id.lastIndexOf(".") + 1).split(/(?=[A-Z][^A-Z])/g) == 'Ghost'){
          return Ghost;
        }else if(d.id.substring(d.id.lastIndexOf(".") + 1).split(/(?=[A-Z][^A-Z])/g) == 'Grass'){
          return Grass;
        }else if(d.id.substring(d.id.lastIndexOf(".") + 1).split(/(?=[A-Z][^A-Z])/g) == 'Ground'){
          return Ground;
        }else if(d.id.substring(d.id.lastIndexOf(".") + 1).split(/(?=[A-Z][^A-Z])/g) == 'Ice'){
          return Ice;
        }else if(d.id.substring(d.id.lastIndexOf(".") + 1).split(/(?=[A-Z][^A-Z])/g) == 'Normal'){
          return Normal;
        }else if(d.id.substring(d.id.lastIndexOf(".") + 1).split(/(?=[A-Z][^A-Z])/g) == 'Poison'){
          return Poison;
        }else if(d.id.substring(d.id.lastIndexOf(".") + 1).split(/(?=[A-Z][^A-Z])/g) == 'Psychic'){
          return Psychic;
        }else if(d.id.substring(d.id.lastIndexOf(".") + 1).split(/(?=[A-Z][^A-Z])/g) == 'Rock'){
          return Rock;
        }else if(d.id.substring(d.id.lastIndexOf(".") + 1).split(/(?=[A-Z][^A-Z])/g) == 'Steel'){
          return Steel;
        }else if(d.id.substring(d.id.lastIndexOf(".") + 1).split(/(?=[A-Z][^A-Z])/g) == 'Water'){
          return Water;
        }else if(d.id.substring(d.id.lastIndexOf(".") + 1).split(/(?=[A-Z][^A-Z])/g) == 'Pokemon'){
          return Pokemon;
        }});

      var leaf = node.filter(function(d) { return !d.children; });

      //Attching the name to the leaf nodes, the innermost circle nodes to display on the visualisation
      leaf.append("clipPath")
          .attr("id", function(d) { return "clip-" + d.id; })
          .append("use")
          .attr("xlink:href", function(d) { return "#node-" + d.id + ""; });

      leaf.append("text")
          .attr("clip-path", function(d) { return "url(#clip-" + d.id + ")"; })
          .selectAll("tspan")
          .data(function(d) { return d.id.substring(d.id.lastIndexOf(".") + 1).split(/(?=[A-Z][^A-Z])/g); })
          .enter().append("tspan")
          .attr("x", 0)
          .attr("y", function(d, i, nodes) { return 13 + (i - nodes.length / 2 - 0.5) * 10; })
          .attr("font-family","serif")
          .attr("font-size", 7)
          .text(function(d) { return d; });

      node.append("title")
          .text(function(d) { return d.id + "\n" + format(d.value); });
  });

  function hovered(hover) {
    return function(d) {
      d3.selectAll(d.ancestors().map(function(d) { return d.node; })).classed("node--hover", hover);
    };
  }

}());

