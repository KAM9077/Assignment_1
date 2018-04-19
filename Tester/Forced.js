<!DOCTYPE html>
<meta charset="utf-8">
<head>
    <title>Main</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/d3/4.2.2/d3.min.js"></script>
</head>


<style>

.node text { 
    pointer-events: none;
    font-family: "Open Sans";
}

.link.type1 { 
    stroke: #666; 
}

.link.type2 {
  stroke: #5cd65c;
  stroke-dasharray: 3, 3;
}


.node.type1 {
  fill:#690011;
}
.node.type2 {
  fill:#BF0426;
}

.fadein{
display:none;
font-size:20px;
}

div.tooltip {   
    position: center;           
    text-align: center;         
    width: 600px;
    padding: 10px;              
    font: 12px black;
    font-family: "Open Sans";
    background: #c6d9eb;    
    border: 0px;        
    border-radius: 8px;         
    pointer-events: none;           
}

</style>

<script type="text/javascript"></script>
<script >

var w = 600,
    h = 500,
    r = 35;

var force = d3.layout.force()
        .charge(-3000)
        .linkDistance(30)
        .linkStrength(.1)
        .gravity(0.6)
        .size([w, h]);

var svg = d3.select("body").append("svg:svg")
        .attr("width", w)
        .attr("height", h);
        
//tooltip        
var div = d3.select("body").append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 0)
			;

//loads radius size into fuction for collision detection
function load(json) {
    json.nodes.forEach(function(node) {
    	node.radius = 35;
    })
    
    //creates lines
    var link = svg.selectAll("line")
            .data(json.links)
            .enter()
            .append("svg:line")
            .attr("class", function(d){ 
              return "link type" + d.type;
            })
            .attr("marker-end", "url(#end)"); //adds arrowhead to line
            
		//creates nodes
    var node = svg.selectAll("g.node")
            .data(json.nodes)
            .enter().append("svg:g")
            .attr("class", "node")
            .call(force.drag);
            
       //arrowheads
			svg.append("svg:defs").selectAll("marker")
    				.data(["end"])
  					.enter().append("svg:marker")
            .attr("class", "marker")
    				.attr("id", String)
    				.attr("viewBox", "0 -5 10 10")
    				.attr("refX", 37)
    				.attr("refY", -0)
    				.attr("markerWidth", 3)
    				.attr("markerHeight", 3)
    				.attr("orient", "auto")
  					.append("svg:path")
    				.attr("d", "M0,-5L10,0L0,5");

         //draws circles onto nodes   
       	node.append("circle")
            .attr("r", 35)
            .attr("class", function(d){
              return "node type" + d.type;
            })
            .on("mouseover", fade(.1))
            .on("mouseout", fade(1))
            
           	node.on("mouseover", function (d) {
								link.style('stroke-width', function(l) {
				    			if (d === l.source || d === l.target)
				    				return 4;
				  				else
				    				return 2;
								})
        				d3.select(this).select('text')
									.transition()
									.duration(300)
									//.text(function(d){
									//		return d.full_name;
									//		})
									.style("font-size","12px")
               div.transition()		
                .duration(300)		
                .style("opacity", .9)

               div.html("<b>" + d.full_name + "</b>" + "<br>" + d.info)
               ;
        });

            node.on("mouseout", function (d) {
            		d3.select(this).select('text')
									.transition()
									.duration(300)
									//.text(function(d){return d.name;})
									.style("font-size","10px")
                link.style('stroke-width', 2)
                div.transition()
                		.duration(300)
                    .style("opacity", 0)
                ;
            });
            
            //unsure what this does
            svg.transition()
    					.duration(750)
    					.delay(function(d, i) { return i * 10; });
                
            //text formatting    
            node.append("text")
                .attr("class", function(d){ return d.name })
                .attr("dx", 0)
                .attr("dy", ".35em")
                .style("font-size","10px")
                .style("font", "sans-serif")
                .attr("text-anchor", "middle")
                .style("fill", "white")
                .text(function(d) {return d.name});
               

    force.nodes(json.nodes).links(json.links)
            .on("tick", tick)
            .start();

    var linkedByIndex = {};
            json.links.forEach(function(d) {
            linkedByIndex[d.source.index + "," + d.target.index] = 1;
                });

function isConnected(a, b) {
        return linkedByIndex[a.index + "," + b.index] || linkedByIndex[b.index + "," + a.index] || a.index == b.index;
    }

function tick() {
        var nodes = force.nodes(),
        		q = d3.geom.quadtree(nodes),
            i = 0,
            n = nodes.length;

        while (++i < n) q.visit(collide(nodes[i]));

        svg.selectAll("circle")
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });
      
        d3.selectAll("circle")
        		.attr("cx", function(d) {
              return d.x = Math.max(r, Math.min(w - r, d.x));
        			})
        		.attr("cy", function(d) {
            	return d.y = Math.max(r, Math.min(h - r, d.y));
        			});
 
				d3.selectAll("text")
        		.attr("x", function(d) {return d.x;})
            .attr("y", function(d) {return d.y;})
        
        link.attr("x1", function(d) {return d.source.x;})
        .attr("y1", function(d) {return d.source.y;})
        .attr("x2", function(d) {return d.target.x;})
        .attr("y2", function(d) {return d.target.y;});
    }

function collide(node) {
      var r = node.radius + 16,
          nx1 = node.x - r,
          nx2 = node.x + r,
          ny1 = node.y - r,
          ny2 = node.y + r;
      return function(quad, x1, y1, x2, y2) {
        if (quad.point && (quad.point !== node)) {
          var x = node.x - quad.point.x,
              y = node.y - quad.point.y,
              l = Math.sqrt(x * x + y * y),
              r = node.radius + quad.point.radius;
          if (l < r) {
            l = (l - r) / l * .5;
            node.x -= x *= l;
            node.y -= y *= l;
            quad.point.x += x;
            quad.point.y += y;
          }
        }
        return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
      };
    }
    
function fade(opacity) {
        return function(d) {
            node.style("stroke-opacity", function(o) {
                thisOpacity = isConnected(d, o) ? 1 : opacity;
                this.setAttribute('fill-opacity', thisOpacity);
                return thisOpacity;
                node.transition()
            			.duration(300);
            })
            ;

            link.style("opacity", function(o) {
                return o.source === d || o.target === d ? 1 : opacity;
                link.transition()
            			.duration(300);
            })
            
        };
    }
}
load({"nodes": [
                {"name":"AATF", "full_name":"African Agricultural Technology Foundation", "info":" ", "type":1},
                {"name":"Africa Harvest", "full_name":"Africa Harvest Biotech Foundation International", "info":" ", "type":1},
                {"name":"Gates", "full_name":"Bill & Melinda Gates Foundation", "info":" ", "type":1},
                {"name":"Buffett", "full_name":"Howard G. Buffett Foundation", "info":" ", "type":1},
                {"name":"CGIAR", "full_name":"Consultative Group for International Agricultural Research", "info":" ", "type":1},
                {"name":"DuPont", "full_name":"DuPont", "info":" ", "type":1},
                {"name":"G8", "full_name":"New Alliance for Food Security and Nutrition", "info":" ", "type":1},
                {"name":"WEF", "full_name":"WEF Grow Africa", "info":" ", "type":1},
                {"name":"ISAAA", "full_name":"Internatinal Service for the Acquisition of Agri-biotech Applications", "info":" ", "type":1},
                {"name":"Monsanto", "full_name":"Monsanto", "info":" ", "type":1},
                {"name":"USAID", "full_name":"United States Agency for International Development", "info":" ", "type":1},
                {"name":"ABS", "full_name":"Africa Biofortified Sorghum", "info": "Project led by Africa Harvest with in-kind and financial support from DuPont Pioneer, and in partnership with AATF and ICRISAT (a CGIAR center) to develop GM sorghum in Kenya, Burkina Faso and Nigeria, and plans to expand it to other countries in East and West Africa. The BMGF and the Buffett Foundation are funding the project.", "type":2},
                {"name":"Bt Cotton", "full_name":"Bt Cotton", "info":"As part of its commitment to WEF Grow Africa and the G8 New Alliance, Monsanto committed to introduce Bollgard insect-protected cotton in Malawi. The technology, better known as Bt cotton, is a GM variety.", "type":2},
                {"name":"HarvestPlus", "full_name":"HarvestPlus", "info":"Program that conveys knowledge and technology to research institutions and implementing agencies in order to develop biofortified crops. Supported by the BMGF, it is managed by IFPRI and the CIAT (a CGIAR center) and partners with USAID. Some of HarvestPlus projects for Africa involve GM techniques.", "type":2},
                {"name":"IMAS", "full_name":"Improved Maize for African Soils", "info":"Public-private partnership including DuPont Pioneer and CIMMYT (a CGIAR center), and funded by USAID ($2.2 million) and the BMGF ($17.3 million), it has received more than $30 million. The aim is to create new maize varieties and to develop transgenic seeds within the next 10 years. DuPont Pioneer will provide transgenic breeding technologies and training to African researchers.", "type":2},
                {"name":"IR Cowpea", "full_name":"Insect Resistant Cowpea", "info":"Project led by AATF, Monsanto provided the Bt gene and USAID brought financial support. The goal is to develop GM cowpea resistant to the Maruca Vitrata pod borer. The technology is being developed for Nigeria, Burkina Faso and Ghana.",  "type":2},
                {"name":"OFAB", "full_name":"Open Forum on Agricultural Biotechnology", "info":"Established by AATF, OFAB promotes the so-called safety and benefits of biotech crops. In 2014, a Nigerian Minister said: “(…) OFAB activities have contributed immensely towards mitigating the negative perceptions people have on genetically modified products.” As for the coordinator of the OFAB at the AATF, he welcomed Tanzania’s move to a more GMO-friendly policy saying it “is a sign that the government is appreciating the role of the new technology in improving agricultural production.” ISAAA’s AfriCenter handles the program in Kenya.", "type":2},
                {"name":"PBS", "full_name":"Program for Biosafety Systems", "info":"USAID-funded program managed by IFPRI that supports pro-biotech policies, including national biosafety regulations and that works to “ensure that the people involved in biosafety decisionmaking are competent and confident enough (…) to assess planned releases of GMOs and genetically modified (GM) food products.” in Africa and Asia. In Malawi for instance, it provided technical support to make way for the first field trial for genetically engineered cotton.", "type":2},
                {"name":"VIRCA", "full_name":"Virus Resistant Cassava for Africa", "info":"Initiative to develop GM varieties resistant to the cassava brown streak disease (CBSD) and cassava mosaic disease (CMD) supported by Monsanto ($13 million), the BMGF, the Buffett Foundation and USAID. Uganda and Kenya are the countries targeted for use of this variety. ISAAA’s AfriCenter is in charge of communication for this project.", "type":2},
                {"name":"WEMA", "full_name":"Water Efficient Maize for Africa", "info":"Public-private partnership led by AATF with Monsanto and CIMMYT (a CGIAR center) to develop GM drought-tolerant and pest-protected maize hybrids in sub-Saharan Africa. The project is funded by the BMGF, who has granted more than $39 million to the AATF, the Buffett Foundation and USAID.", "type":2},
  ],
            "links": [
                            {"source":0,"target":11,"type":1},
                            {"source":0,"target":15,"type":1},
                            {"source":0,"target":19,"type":1},
                            
                            {"source":1,"target":11,"type":1},

                            {"source":2,"target":11,"type":1},
                            {"source":2,"target":13,"type":1},
                            {"source":2,"target":14,"type":1},
                            {"source":2,"target":18,"type":1},
                            {"source":2,"target":19,"type":1},

                            {"source":3,"target":11,"type":1},
                            {"source":3,"target":18,"type":1},
                            {"source":3,"target":19,"type":1},

                            {"source":4,"target":13,"type":1},
                            {"source":4,"target":14,"type":1},
                            {"source":4,"target":17,"type":1},
                            {"source":4,"target":19,"type":1},

                            {"source":5,"target":11,"type":1},
                            {"source":5,"target":14,"type":1},

                            {"source":6,"target":12,"type":1},

                            {"source":7,"target":2,"type":1},

                            {"source":8,"target":16,"type":1},
                            {"source":8,"target":18,"type":1},

                            {"source":9,"target":12,"type":1},
                            {"source":9,"target":15,"type":1},
                            {"source":9,"target":18,"type":1},
                            {"source":9,"target":19,"type":1},

                            {"source":10,"target":13,"type":1},
                            {"source":10,"target":14,"type":1},
                            {"source":10,"target":15,"type":1},
                            {"source":10,"target":17,"type":1},
                            {"source":10,"target":18,"type":1},
                            {"source":10,"target":19,"type":1},

                            {"source":0,"target":8,"type":2},
                            {"source":2,"target":1,"type":2},
                            {"source":2,"target":0,"type":2},
                            {"source":2,"target":4,"type":2},

                            {"source":3,"target":0,"type":2},

                            {"source":5,"target":1,"type":2},
                            {"source":9,"target":8,"type":2},

                            {"source":10,"target":1,"type":2},
                            {"source":10,"target":4,"type":2},
                            {"source":10,"target":7,"type":2},
                            {"source":10,"target":8,"type":2},
                            {"source":10,"target":0,"type":2},
  ]})


</script>