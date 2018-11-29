/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

ARC.service('TreeChart', ['$filter', 'ColorChart', '$state', function ($filter, ColorChart, $state) {

        this.drow = function (data, height, width, a) {

            /*
             * stop exceute the draw function if we don't have any node or any link or any marker
             */

//		if (!data.nodes.length || !data.links.length || !data.marker.length) {
//			return;
//		};

            /*
             * initilze the color scale for this chart depend on organisation id 
             * I use schemeCategory20 as an Ordinal Scale
             */

            var color = ColorChart.getColors();
            var color2 = {};
            _.each(data.organisations, function (o) {
                color2[o.id] = color(Math.abs(o.id * 10));
            });

            /*
             * drawBubbles : Function. 
             * @params :
             * @data: Array of objects 'nodes'.
             * @height: The speciefic height.
             * width: The speciefic width.
             * I  use this function to draw /re draw the bubbles chart  
             */

            function drawBubbles(data, height, width) {
                var graph = angular.copy(data);
                d3.selectAll("g").remove();
                d3.selectAll("circle").remove();
                d3.selectAll("rect").remove();
                d3.selectAll("line").remove();
                d3.selectAll(".links").remove();

                var svg = d3.select("svg"),
                        width = width,
                        height = height;

                svg.append('g')
                        .append('text')
                        .attr('class', 'description2');

                var g = svg.append("g")
                        .attr("class", "everything")
                        .attr("transform", "translate(100,50)scale(.5,.5)");

                var simulation = d3.forceSimulation()
                        .force("link", d3.forceLink().id(function (d) {
                            return d.id;
                        }).distance(300).strength(0.07))
                        .force(1, d3.forceCenter(500, 500))
                        .force("y", d3.forceX().x(function (d) {
                            return Math.abs(d.organaisationId * 10)
                        }).strength(0.01))
                        .force("x", d3.forceY().y(function (d) {
                            return Math.abs(d.organaisationId * 10)
                        }).strength(0.005))
                        .force('collision', d3.forceCollide().radius(function (d) {
                            return d.id + 60
                        }));

                g.append("defs").selectAll("marker")
                        .data(graph.marker)
                        .enter().append("marker")
                        .attr("id", function (d) {
                            return d.id;
                        })
                        .attr("viewBox", "0 -5 10 10")
                        .attr("refX", function (d) {
                            return (d.id * 0.4 + 13 / d.id * d.id);
                        })
                        .attr("refY", 0)
                        .attr("markerWidth", 10)
                        .attr("markerHeight", 10)
                        .attr("orient", "auto")
                        .append("path")
                        .attr("d", "M0,-5L10,0L0,5")
                        .attr('fill', function (d) {
                            return color2[d.organaisationId];
                        })
                var link = g.append("g")
                        .attr("class", "links")
                        .selectAll(".line1")
                        .data(graph.links)
                        .enter().append("line")
                        .attr("class", "line1")
                        .attr("id", function (d, i) {
                            return d.target;
                        })
                        .attr("stroke", function (d) {
                            return color2[d.organaisationId]
                        })
                        .attr("stroke-width", function (d) {
                            return Math.sqrt(d.id);
                        })
                        .attr("marker-end", function (d) {
                            return "url(#" + d.target + ")";
                        })
                        .style("stroke-dasharray", function (d, i) {
                            return [15, (d.transactionType.toUpperCase !== 'MANUAL') ? 0 : 20]
                        })
                        .style("stroke-width", 2.5)

                var node = g.append("g")
                        .attr("class", "nodes")
                        .selectAll(".nodeS")
                        .data(graph.nodes)
                        .enter().append("g")
                        .attr("class", "nodeS")
                        .attr("id", function (d, i) {
                            return 'S' + d.id;
                        })
                        .call(d3.drag()
                                .on("start", dragstarted)
                                .on("drag", dragged)
                                .on("end", dragended))
                        .on('mouseover', function (d) {
                            var m = link._groups[0],
                                    n = node._groups[0];
                            var def = d3.select("defs")._groups[0]
                            for (var i = 0; i < m.length; i++) {
                                if (m[i].__data__.source.id == d.id || m[i].__data__.target.id == d.id) {
                                    for (var a = 0; a < n.length; a++) {
                                        if (n[a].__data__.id == m[i].__data__.source.id ||
                                                n[a].__data__.id == m[i].__data__.target.id) {
                                            n[a].querySelector(".node2").attributes.fill.value = "#d0e2ff";
                                        }
                                        ;
                                    }
                                    m[i].attributes.stroke.value = "#d0e2ff";
                                }
                            }
                            d3.select(this).select('.node2')
                                    .attr("fill", "#d0e2ff");
                        })
                        .on('mouseout', function (d) {
                            var m = link._groups[0],
                                    n = node._groups[0];
                            for (var i = 0; i < m.length; i++) {
                                if (m[i].__data__.source.id == d.id || m[i].__data__.target.id == d.id) {
                                    for (var a = 0; a < n.length; a++) {
                                        //                                           console.log(n[a].__data__.id,m[i].__data__)
                                        if (n[a].__data__.id == m[i].__data__.source.id ||
                                                n[a].__data__.id == m[i].__data__.target.id) {
                                            n[a].querySelector(".node2").attributes.fill.value = color2[n[a].__data__.organaisationId];
                                            //									n[a].querySelector(".circle1").attributes.fill.value = (n[a].__data__.organizationId == -1) ? 'none' : color(n[a].__data__.organizationId * 10);
                                            //									n[a].querySelector(".circle1").style.fill.value = (n[a].__data__.organizationId == -1) ? 'none' : color(n[a].__data__.organizationId * 10);
                                        }
                                        ;
                                    }
                                    m[i].attributes.stroke.value = color2[m[i].__data__.source.organaisationId];
                                }
                            }
                            d3.select(this).select('.node2')
                                    .attr("fill", function (d) {
                                        return color2[d.organaisationId];
                                    })
                                    .style("stroke-dasharray", function (d) {
                                        return (d.organaisationId !== -1) ? null : [20, 15];

                                    })
                                    .style("stroke", function (d) {
                                        return (d.organaisationId !== -1) ? null : 'red';

                                    })
                        })
                        .on('click', function (d) {

                            $('#detailsArea').css("visibility", "visible");

                            d3.select("#Interfaces").selectAll('label').remove();
                            d3.select("#Interfaces").selectAll('p').remove();

                            d3.select("#orgs").selectAll('label').remove();
                            d3.select("#orgs").selectAll('p').remove();

                            d3.select("#dataSets").selectAll('label').remove();
                            d3.select("#dataSets").selectAll('p').remove();

                            d3.select('#classSelectionInformation')
                                    .attr("class", 'accordion-container');
//					d3.select('#organizationName')
//						.text((d.organaisationName == undefined) ? 'None' : d.organaisationName).attr("transform", 'translate(  50 , 50 )').attr('class', 'paragraph');
                            d3.select('#name')
                                    .text(d.name).attr("transform", 'translate(  50 , 50 )').attr('class', 'paragraph');
                            d3.select('#destinationName')
                                    .text((d.destinationName == undefined) ? 'None' : d.destinationName)
                                    .attr("transform", 'translate(  50 , 50 )').attr('class', 'paragraph')
                            d3.select('#sourceName')
                                    .text((d.sourceName == undefined) ? 'None' : d.sourceName)
                                    .attr("transform", 'translate(  50 , 50 )').attr('class', 'paragraph')
                            d3.select('#frequencyName')
                                    .text((d.interfaceFreq == undefined) ? 'None' : d.interfaceFreq)
                                    .attr("transform", 'translate(  50 , 50 )').attr('class', 'paragraph')

//					d3.select('#dataSetName')
//						.text((d.dataSetName == undefined) ? 'None' : d.dataSetName)
//						.attr("transform", 'translate(  50 , 50 )').attr('class', 'paragraph')
                            d3.select('#businessCapabilityName')
                                    .text((d.businessCapabilityName == undefined) ? 'None' : d.businessCapabilityName)
                                    .attr("transform", 'translate(  50 , 50 )').attr('class', 'paragraph')

                            var divOrgs = d3.select('#orgs').selectAll("label")
                                    .data((d.organisations) ? d.organisations : [])
                                    .enter().append('label')
                                    .attr('class', 'paragraph').attr("dy", "1em");
                            divOrgs.append('br')
                            divOrgs
                                    .append("p")
                                    .html(function (d, i) {
                                        return (d.id !== -1) ? (d.name.length < 10) ? '\u00A0' + '\u00A0' + '\u00A0' + (i + 1) + ': \u00A0' + d.name + '\u00A0' + '\u00A0' + '\u00A0' : (i + 1) + ': ' + d.name + '\u00A0' + '\u00A0' + '\u00A0' : d.name;
                                    })
                                    .attr('class', 'paragraph')
                                    .attr('color', function (d) {
                                        return color2[d.id]
                                    });

                            var divDataSets = d3.select('#dataSets').selectAll("label")
                                    .data((d.dataSets) ? d.dataSets : [])
                                    .enter().append('label')
                                    .attr('class', 'paragraph').attr("dy", "1em");
                            divDataSets.append('br')
                            divDataSets
                                    .append("p")
                                    .html(function (d, i) {
                                        return (d.id !== -1) ? (d.name.length < 10) ? '\u00A0' + '\u00A0' + '\u00A0' + (i + 1) + ': \u00A0' + d.name + '\u00A0' + '\u00A0' + '\u00A0' : (i + 1) + ': ' + d.name + '\u00A0' + '\u00A0' + '\u00A0' : 'None';
                                    })
                                    .attr('class', 'paragraph')
                                    .attr("transform", 'translate(  50 , 50 )');



                            var diventer = d3.select("#Interfaces").selectAll("label")
                                    .data((d.interfaces) ? d.interfaces : [])
                                    .enter().append("label")
                                    .attr("id", function (d, i) {
                                        return d.id;
                                    })
                                    .attr('class', 'paragraph')
                                    .each(function (d, i) {
                                        d3.select(this).selectAll('p').remove();
                                        d3.select(this).selectAll('label').remove();
                                        var p = d3.select(this).selectAll("label")
                                                .data((d.dataSets) ? d.dataSets : [])
                                                .enter()

                                        p.append("p")
                                                .text(function (d, i) {
                                                    return 'Data Set Name ' + (i + 1) + ':' + d.name;
                                                })
                                                .attr('class', 'paragraph');
                                    });

                            diventer
                                    .append("p")
                                    .text(function (d, i) {
                                        return 'Interface Name ' + (i + 1) + ': ' + d.name;
                                    })
                                    .attr('class', 'paragraph')
                                    .append("p")
                                    .text(function (d) {
                                        return (d.source && d.source.name) ? 'Source : ' + d.source.name : 'None';
                                    })
                                    .attr('class', 'paragraph')
                                    .append("p")
                                    .text(function (d) {
                                        return (d.destination && d.destination.name) ? 'Destination: ' + d.destination.name : 'None';
                                    })
                                    .attr('class', 'paragraph')
                                    .append("p")
                                    .text(function (d) {
                                        return (d.frequency && d.frequency.name) ? 'Frequency: ' + d.frequency.name : 'None';
                                    })
                                    .attr('class', 'paragraph')
                                    .append("p")
                                    .text(function (d) {
                                        return (d.frequency && d.frequency.name) ? 'Criticality: ' + d.criticality.name : 'None';
                                    })
                                    .attr('class', 'paragraph')
                                    .append("p")
                                    .text(function (d) {
                                        return (d.reference && d.reference.name) ? 'Reference: ' + d.reference.name : 'None';
                                    })
                                    .attr('class', 'paragraph')
                                    .append("p")
                                    .text(function (d) {
                                        return (d.securityClassification && d.securityClassification.name) ? 'Security Classification: ' + d.securityClassification.name : 'None';
                                    })
                                    .attr('class', 'paragraph')
                                    .each(function (d, i) {
                                        d3.select(this).selectAll('p').remove();
                                        d3.select(this).selectAll('label').remove();
                                        var p = d3.select(this).selectAll("label")
                                                .data((d.dataSets) ? d.dataSets : [])
                                                .enter()

                                        p.append("p")
                                                .text(function (d, i) {
                                                    return 'Data Set Name ' + (i + 1) + ':' + d.name;
                                                })
                                                .attr('class', 'paragraph');
                                    });
                            d3.select('.description')
                                    .text(d.id).attr("transform", 'translate(  50 , 50 )')
                        });

                for (var i = 0; i < graph.nodes.length; i++) {
                    (graph.nodes[i].applicationType) ? graph.nodes[i].applicationType = graph.nodes[i].applicationType : graph.nodes[i].applicationType = {}
                    if (graph.nodes[i].applicationType && graph.nodes[i].applicationType.name === "System" || graph.nodes[i].applicationType.name === "Major Application") {

                        d3.select(".nodes")
                                .select('#S' + graph.nodes[i].id)
                                .append("circle")
                                .attr("class", "node1")
                                .attr("r", function (d) {
                                    return d.id - 15;
                                })
                                .attr("fill", function (d) {
                                    return color2[d.organaisationId];
                                })
                                .style("stroke", function (d) {
                                    return (d.organaisationId !== -1) ? null : 'red';

                                })
                        d3.select(".nodes")
                                .select('#S' + graph.nodes[i].id)
                                .append("circle")
                                .attr("class", "node2")
                                .attr("r", function (d) {
                                    return d.id;
                                })
                                .attr("fill", function (d) {
                                    return color2[d.organaisationId];
                                });
                    } else {

                        d3.select(".nodes")
                                .select('#S' + graph.nodes[i].id)
                                .append("rect")
                                .attr("class", "node1")
                                .attr("width", 150)
                                .attr("height", 50)
                                .attr('rx', 10)
                                .attr('ry', 10)
                                .attr("transform", "translate(-75 ,-30)")
                                .attr("fill", function (d) {
                                    return color2[d.organaisationId];
                                })
                                .style("stroke", function (d) {
                                    return (d.organaisationId !== -1) ? null : 'red';

                                });
                        d3.select(".nodes")
                                .select('#S' + graph.nodes[i].id)
                                .append("rect")
                                .attr("class", "node2")
                                .attr("width", 140)
                                .attr("height", 40)
                                .attr('rx', 10)
                                .attr('ry', 10)
                                .attr("transform", "translate(-70 ,-25)")
                                .attr("fill", function (d) {
                                    return color2[d.organaisationId];
                                });
                    }
                }
                node.append("text")
                        .attr("text-anchor", "middle")
                        .text(function (d) {
                            return (d.name.length > 16) ? d.name.substr(0, 16) : d.name;
                        })
                        .attr("font-size", 10)
                        .attr("font-weight", 'bold');
                simulation
                        .nodes(graph.nodes)
                        .on("tick", ticked);

                simulation.force("link")
                        .links(graph.links);

                function ticked() {
                    link
                            .attr("x1", function (d) {
                                return d.source.x;
                            })
                            .attr("y1", function (d) {
                                return d.source.y;
                            })
                            .attr("x2", function (d) {
                                return d.target.x;
                            })
                            .attr("y2", function (d) {
                                return d.target.y;
                            });

                    node
                            .attr("transform", function (d) {
                                return "translate(" + d.x + "," + d.y + ")";
                            })
                            .attr("cx", function (d) {
                                return d.x;
                            })
                            .attr("cy", function (d) {
                                return d.y;
                            });
                }
                //                });

                var zoom = d3.zoom()
                        .scaleExtent([0.1, 1.5])
                        .on("zoom", zoomed);
                zoom(svg);

                function zoomed() {
                    g.attr("transform", d3.event.transform);
                    slider.property("value", d3.event.transform.k);
                }

                var slider = d3.select(".zoominput")
                        .datum({})
                        .attr("type", "range")
                        .attr("value", 1)
                        .attr("min", zoom.scaleExtent()[0])
                        .attr("max", zoom.scaleExtent()[1])
                        .attr("step", (zoom.scaleExtent()[1] - zoom.scaleExtent()[0]) / 100)
                        .on("input", slided);

                function slided(d) {
                    zoom.scaleTo(svg, d3.select(this).property("value"));
                }

                function dragstarted(d) {
                    if (!d3.event.active)
                        simulation.alphaTarget(2).restart();
                    d.fx = d.x;
                    d.fy = d.y;
                }

                function dragged(d) {
                    d.fx = d3.event.x;
                    d.fy = d3.event.y;
                }

                function dragended(d) {
                    if (!d3.event.active)
                        simulation.alphaTarget(0);
                    d.fx = null;
                    d.fy = null;
                }
                var copyOrg = graph.organisations;
                if (copyOrg[0] && copyOrg[0].name == 'None Selected') {
                    copyOrg.shift();
                }
                var svgLegned3 = d3.select("svg").append("svg")
                        .attr("width", width - 50).attr("height", height - 50)


                var legend3 = svgLegned3.selectAll('.legend3')
                        .data(copyOrg)
                        .enter().append('g')
                        .attr("class", "legends3")
                        .attr("padding-bottom", 10)
                        .attr("transform", function (d, i) {
                            {
                                return "translate(0," + (i + 0.5) * 20 + ")"
                            }
                        })

                legend3.append('rect')
                        .attr("x", 0)
                        .attr("y", 0)
                        .attr("width", 10)
                        .attr("height", 10)
                        .style("fill", function (d, i) {
                            return color2[d.id];
                        })

                legend3.append('text')
                        .attr("x", 20)
                        .attr("y", 10)
                        .text(function (d, i) {
                            return d.name
                        })
                        .attr("class", "textselected")
                        .style("text-anchor", "start")
                        .style("font-size", 15);
            }

            drawBubbles(data, height, width);

        }

        this.drowCollapsedTreeChart = function (data, height, width) {

            if (!data || !data.children || !data.children.length) {
                return;
            }
            var graph = data;
            var margin = {
                top: width / 15,
                right: width / 40,
                bottom: (width / 20) + 10,
                left: width / 40
            },
                    width = width,
                    barHeight = (width / 40),
                    barWidth = (width - margin.left - margin.right) * 0.3;
            var i = 0,
                    duration = 400,
                    root;
            var diagonal = d3.linkHorizontal()
                    .x(function (d) {
                        return d.y;
                    })
                    .y(function (d) {
                        return d.x;
                    });


            var svg = d3.select("svg")
                    .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            root = d3.hierarchy(graph);

            root.x0 = 0;
            root.y0 = 0;

            d3.select("svg").append("g")
                    .attr("transform", "translate(" + (margin.left + 20) + "," + (margin.top - 50) + ")")
                    .append("text").text(graph.Title)
                    .attr("transform", "translate(" + 60 + "," + 10 + ")")
                    .attr("font-size", 20)
                    .attr("font-weight", "bold");

            update(root, height);

            function update(source, height) {
                // Compute the flattened node list.
                var nodes = root.descendants();
                //			var height = Math.max(500, nodes.length * barHeight + margin.top + margin.bottom);
                d3.select("svg").transition()
                        .duration(duration)
                        .attr("height", height);
                d3.select(self.frameElement).transition()
                        .duration(duration)
                        .style("height", height + "px");
                // Compute the "layout". TODO https://github.com/d3/d3-hierarchy/issues/67
                var index = -1;
                root.eachBefore(function (n) {
                    n.x = ++index * barHeight;
                    n.y = n.depth * 20;
                });
                // Update the nodes…
                var node = svg.selectAll(".node")
                        .data(nodes, function (d) {
                            return d.id || (d.id = ++i);
                        });
                var nodeEnter = node.enter().append("g")
                        .attr("class", "node")
                        .attr("transform", function (d) {
                            return "translate(" + source.y0 + "," + source.x0 + ")";
                        })
                        .style("opacity", 0);
                // Enter any new nodes at the parent's previous position.
                nodeEnter.append("rect")
                        .attr("y", -barHeight / 2)
                        .attr("height", barHeight)
                        .attr("width", barWidth)
                        .style("fill", color)
                        .on("click", click);
                nodeEnter.append("text")
                        .attr("dy", 7)
                        .attr("dx", 10)
                        .text(function (d) {
                            return d.data.name;
                        });
                // Transition nodes to their new position.
                nodeEnter.transition()
                        .duration(duration)
                        .attr("transform", function (d) {
                            return "translate(" + d.y + "," + d.x + ")";
                        })
                        .style("opacity", 1);
                node.transition()
                        .duration(duration)
                        .attr("transform", function (d) {
                            return "translate(" + d.y + "," + d.x + ")";
                        })
                        .style("opacity", 1)
                        .select("rect")
                        .style("fill", color);
                // Transition exiting nodes to the parent's new position.
                node.exit().transition()
                        .duration(duration)
                        .attr("transform", function (d) {
                            return "translate(" + source.y + "," + source.x + ")";
                        })
                        .style("opacity", 0)
                        .remove();
                // Update the links…
                var link = svg.selectAll(".link")
                        .data(root.links(), function (d) {
                            return d.target.id;
                        });
                // Enter any new links at the parent's previous position.
                link.enter().insert("path", "g")
                        .attr("class", "link")
                        .attr("d", function (d) {
                            var o = {
                                x: source.x0,
                                y: source.y0
                            };
                            return diagonal({
                                source: o,
                                target: o
                            });
                        })
                        .transition()
                        .duration(duration)
                        .attr("d", diagonal);
                // Transition links to their new position.
                link.transition()
                        .duration(duration)
                        .attr("d", diagonal);
                // Transition exiting nodes to the parent's new position.
                link.exit().transition()
                        .duration(duration)
                        .attr("d", function (d) {
                            var o = {
                                x: source.x,
                                y: source.y
                            };
                            return diagonal({
                                source: o,
                                target: o
                            });
                        })
                        .remove();
                // Stash the old positions for transition.
                root.each(function (d) {
                    d.x0 = d.x;
                    d.y0 = d.y;
                });
            }
            // Toggle children on click.
            function click(d) {
                if (d.children) {
                    d._children = d.children;
                    d.children = null;
                } else {
                    d.children = d._children;
                    d._children = null;
                }
                update(d);
            }
        
        this.drowDataFlow = function(data){
            var radius  = 450
            
            d3.select('svg').attr('width',radius*2.5)
                            .attr('height',radius*2.5) 
                    
            d3.select('.drow').attr('transform', 'translate('+radius*1.25 +','+ radius*1.25+')')
                    
            var ribbonGenerator = d3.ribbon().radius(radius);

            var color = d3.scaleOrdinal(d3.schemeCategory10);
            var Orgs = [
            {name:'org1',id:1,apps:[{name:'App1',id:1},{name:'App2',id:2},{name:'App3',id:3},{name:'App4',id:4},{name:'App5',id:5},{name:'App6',id:6},{name:'App7',id:7}]},
            {name:'org2',id:2,apps:[{name:'App14',id:14},{name:'App13',id:13},{name:'App12',id:12},{name:'App11',id:11},{name:'App10',id:10},{name:'App9',id:9},{name:'App8',id:8}]},
            {name:'org3',id:3,apps:[{name:'App15',id:15},{name:'App16',id:16},{name:'App17',id:17},{name:'App18',id:18},{name:'App19',id:19},{name:'App20',id:20},{name:'App21',id:21}]},
            {name:'org4',id:4,apps:[{name:'App25',id:25},{name:'App24',id:24},{name:'App23',id:23},{name:'App22',id:22}]},
            {name:'org5',id:5,apps:[{name:'App26',id:26},{name:'App27',id:27},{name:'App28',id:28},{name:'App29',id:29},{name:'App30',id:30}]},
            {name:'org6',id:6,apps:[{name:'App53',id:37},{name:'App51',id:38},{name:'App52',id:39}]},
            {name:'org7',id:7,apps:[{name:'App35',id:36},{name:'App35',id:35},{name:'App34',id:34},{name:'App33',id:33},{name:'App32',id:32},{name:'App31',id:31}]},
            {name:'org8',id:8,apps:[{name:'App37',id:40},{name:'App38',id:41},{name:'App39',id:42},{name:'App40',id:43},{name:'App41',id:44},{name:'App42',id:45}]},
            {name:'org9',id:9,apps:[{name:'App47',id:50},{name:'App46',id:49},{name:'App45',id:48},{name:'App44',id:47},{name:'App43',id:46}]},
            {name:'org10',id:10,apps:[{name:'App48',id:51},{name:'App49',id:52},{name:'App50',id:53}]},
            ];
          var data1 = [];  
          var data2 = angular.copy(data);  
          var v =0 ;
          var dist;
          for(var i = 0;i < data2.organisations.length;i++){
              data2.organisations[i].orgid = i;
              var app = data2.organisations[i].App
              for(var j = 0; j < app.length; j++){
                  app[j].orgid = data2.organisations[i].orgid ;
              }
              data1.push(data2.organisations[i].App.length)
          }  

            var arc = d3.arc()
              .innerRadius(radius)
              .outerRadius(radius +100);

            var pie = d3.pie()
          //    .padAngle(0.2);
          
            var dist = 50     
            var anas = [];
  
            for(var i=0; i < data2.organisations.length; i++){
                anas = anas.concat(data2.organisations[i].App)
            }
//            anas = anas.concat(anas);
            
            dist = anas.length;
            v = Math.PI*2/dist
            var arr = [];
            for(var i=0; i < anas.length; i++){
                
                    anas[i].Appid = anas[i].id;
//                    A[i].id = i;
//                    anas[i].name = ("App"+i);
                    anas[i].k = "" + (i+1);                    
                    anas[i].source  = {startAngle : v*i,endAngle : v*i + v };
                    arr.push(angular.copy(anas[i]));
                    console.log(anas[i].name)
//                  target :{startAngle : v*i, data.links},
            }
//           
//                         target :{startAngle : chords[i].target.startAngle, endAngle :chords[i].target.endAngle}} 
            console.log(anas[8].name)
            var l = [];
            
            console.log("AAAAAAAAAAAAAAAAAAAAAAAAAA")
          
            for(var i= 0; i<anas.length; i++ ){
                console.log(angular.copy(anas[i].name))
            }
              
              
            for(var i=0; i < data2.links.length; i++){
                var m = {}
              for(var j=0; j < anas.length; j++){
                  if(data2.links[i].source.id == anas[j].id){
                      m.source = angular.copy(anas[j].source);
                      m.sourceid = angular.copy(anas[j].id);
                      m.k = angular.copy(anas[j].orgid) 
                  }
              }
              for(var j=0; j < anas.length; j++){
                  if(data2.links[i].destination.id == anas[j].id){
                      m.target  = angular.copy(anas[j].source);
                      m.targetid  = angular.copy(anas[j].id);
                  }
              }
              if(m.source !== undefined && m.target !== undefined){
                  l.push(m)
              }
            }
            
            console.log(l) 


            d3.select('g').attr('class','gMax') 

              var k = d3.select('.gMax')
                     .append('g').attr('class','gpath')
                     .selectAll('g')
                     .data(l)
                     .enter()
                     .append('g')
                     .attr('class',function(d,i){return 'path' +i;})
                     .attr('transform','rotate(0)')
          //           .on('click',function(d){console.log(d3.select(this).attr('fill','red'))})
                   k
                     .append('path').attr('class','links')
                     .attr('k',function(d) { return color(d.k);})
                     .style("fill", function(d) { return color(d.k);})
                     .style('opacity',0.5)
                     .on('mouseover',function(d){ for(var i = 0;i<l.length;i++){  
                                                                                    d3.select('.path'+i).select('path').style('fill','none').style('opacity',1);
                                                                                }
                                                                                    d3.select(this).style('fill','red').style('opacity',1);
                                                })
                     .attr('d', ribbonGenerator)
                     .on('mouseout',function(d){ for(var i = 0;i<l.length;i++){  
                                                                                    d3.select('.path'+i).select('path').style('fill', d3.select('.path'+i).select('path').attr('k')).style('opacity',0.5);
                                                                                }
                                                })
                     .attr('d', ribbonGenerator)

              var s = d3.select('.gMax')
                     .append('g').attr('class','Arcpath')
                     .selectAll('g')
                     .data(pie(data1))
                     .enter()
                     .append('g') 

                  s.append("path")
                      .style("fill", 'red')
                      .style("fill", function(d, i) { return color(i); })
                      .attr("d", arc);

              var J = d3.select('.gMax')
                     .append('g').attr('class','gtext')
                     .selectAll('g')
                     .data(arr)
                     .enter()
                     .append('g')
          //           .attr('class',function(d,i){return 'path' + i;})
                     .attr('transform','rotate(0)')
          //           .on('click',function(d){console.log(d3.select(this).attr('fill','red'))})


                  J.append('text')
                   .text(function(d){return d.name;})
                   .style('font-size',100/dist+10)
                   .style('font-weight','bold')
                   .attr('transform', position)
                   .attr('k', function(d){return d.k})
                   .on('click',function(d){console.log(d)})


           function position(d){
              if((d.source.startAngle/Math.PI*180 >= 0 && d.source.startAngle/Math.PI*180 < 180)){
                  return 'translate(' + (Math.cos((v/2+d.source.startAngle-Math.PI/2))*(radius-v*100+75)) + ',' + (Math.sin((v/2+d.source.startAngle-Math.PI/2))*(radius-v*100+75)) + '),rotate('+ ((d.source.startAngle+v/2)/Math.PI*180-90) +')'
              }else{ 
                  return 'translate(' + (Math.cos((v/2+d.source.startAngle-Math.PI/2))*(radius + 95)) + ',' + (Math.sin((v/2+d.source.startAngle-Math.PI/2))*(radius + 95)) + '),rotate('+ ((v/2+d.source.startAngle)/Math.PI*180+90) +')'
              }
            }
          //         k.on('click',function(d){console.log(d3.select(this).attr('fill','red'))})

          //         k.append('text')
          //          .text(function(d){return d.k;})
          //          .attr('transform',function(d){ return 'translate('+ (Math.cos((0.07+d.target.startAngle-Math.PI/2))*320) + ',' + (Math.sin((0.07+d.target.startAngle-Math.PI/2))*320) + '),rotate('+((d.target.startAngle/Math.PI*180 >= 0 && d.target.startAngle/Math.PI*180 < 180) ? d.target.startAngle/Math.PI*180-90 : d.target.startAngle/Math.PI*180+90)+')'})

          //         k.append('text')
          //          .text(function(d){return d.k;})
          //          .attr('transform',function(d){ return 'translate('+ (Math.cos((0.07+d.source.startAngle-Math.PI/2))*320) + ',' + (Math.sin((0.07+d.source.startAngle-Math.PI/2))*320) + '),rotate('+((d.source.startAngle/Math.PI*180 >= 0 && d.source.startAngle/Math.PI*180 < 180) ? d.source.startAngle/Math.PI*180-90 : d.source.startAngle/Math.PI*180+90)+')'})
          //        .on('click',function(d){})
            
        }

            function color(d) {
                return d._children ? "#5e6db3" : d.children ? "#a3c7ea" : "#fd5e5e";
            }
        }

    }]);
