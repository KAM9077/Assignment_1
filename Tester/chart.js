/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
d3.custom = {};
d3.custom.chart = {};
d3.custom.layout = {};

d3.custom.chart.flow = function(data) {
//    var data = d3.hierarchy(d)
//console.log("data",data)
//console.log("d",d)

    // public variables with default settings
    var margin = {top:10, right:10, bottom:10, left:10}, // defaults
        padding = {top:20, right:10, bottom:10, left:10},
        transitionDuration = 300,
        chartGroup,
        container,
        svg,
        width,
        height,
        root,
        rootNode,
        scrollbarAffordance;
//console.log("root",root)
    var flow = d3.custom.layout.flow()
        .margin(margin)
        .padding(padding)
        .nodeWidth(75)
        .nodeHeight(35)
        .containerHeight(20);
//console.log("d",d)
    function chart(data) {
        rootNode = d3.hierarchy(data).descendants();
console.log("data",data)
console.log("rootNode",rootNode)
//        function debounce(fn, timeout) {
//            var timeoutID = -1;
//            return function() {
//                if (timeoutID > -1) {
//                    window.clearTimeout(timeoutID);
//                }
//                timeoutID = window.setTimeout(fn, timeout);
//            }
//        }

        function resize(selectedNode) {
            console.log("d3.select(this)",d3.select(this)._groups[0][0].visualViewport.height)
            var domContainerWidth  = (parseInt(d3.select(this)._groups[0][0].visualViewport.width)),
                domContainerHeight = (parseInt(d3.select(this)._groups[0][0].visualViewport.height)),
                flowWidth = 0;

//                console.log("root",root)

            if (root.height > domContainerHeight) {
//                console.log("root",root)

                scrollbarAffordance = 0;
            } else {
                scrollbarAffordance = 0;
            }

            flowWidth = domContainerWidth - scrollbarAffordance;
            flow.width(flowWidth);

            chart.update(selectedNode);

//            svg.transition().duration(transitionDuration)
//                .attr("width", function(d) {
//                    return domContainerWidth;
//                })
//                .attr("height", function(d) {
//                    return d.height + margin.top + margin.bottom;
//                })
//                .select(".chartGroup")
//                .attr("width", function(d) {
//                    return flowWidth;
//                })
//                .attr("height", function(d) {
//                    return d.height + margin.top + margin.bottom;
//                })
//                .select(".background")
//                .attr("width", function(d) {
//                    return flowWidth;
//                })
//                .attr("height", function(d) {
//                    return d.height + margin.top + margin.bottom;
//                });
        }


        d3.select(window).on('resize', function() {
            debounce(resize, 50)();
        });


        rootNode.forEach(function(arg) {
            root = arg;
//            console.log("root",root)
            container = d3.select("#container");
//            console.log("container",container)
            var i = 0;

            if (!svg) {
                svg = container.append("svg")
                    .attr("class", "svg chartSVG")
                    .attr("transform", "translate(0, 0)")
                    .style("shape-rendering", "auto") // shapeRendering options; [crispEdges|geometricPrecision|optimizeSpeed|auto]
                    .style("text-rendering", "auto"); // textRendering options;  [auto|optimizeSpeed|optimizeLegibility|geometricPrecision]
                chartGroup = svg.append("g")
                    .attr("class", "chartGroup");
                chartGroup.append("rect")
                    .attr("class", "background");
            }


            chart.update = function(source) {
//                var nodes = flow(root);
//                console.log(source)
                function color(d) {
                    return d._children ? "#3182bd" : d.children ? "#c6dbef" : "#fd8d3c";
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
                    resize(d);
                }

                // Update the nodes…
                var node = chartGroup.selectAll("g.node")
                    .data(nodes, function(d) { return d.id || (d.id = ++i); });

                var nodeEnter = node.enter().append("g")
                    .attr("class", "node")
                    .attr("transform", function(d) {
                        return "translate(" + source.x + "," + source.y + ")";
                    })
                    .style("opacity", 1e-6);

                // Enter any new nodes at the parent's previous position.
                nodeEnter.append("rect")
                    .attr("class", "background")
                    .attr("height", function(d) { return d.height; })
                    .attr("width", function(d) { return d.width; })
                    .style("fill", color)
                    .on("click", click);

                nodeEnter.each(function(d) {
                    if (d.children || d._children) {
                        d3.select(this)
                            .append("path")
                            .attr("class", "expander")
                            .attr("d", "M 0 0 L 6 6 L 0 6 z")
                            .attr("transform", function(d) {
                                return d._children ? "translate(8,14)rotate(225)" : "translate(5,8)rotate(315)";
                            });
                        d3.select(this).append("text")
                            .attr("class", "label")
                            .attr("dy", 13)
                            .attr("dx", 17)
                            .text(function(d) { return d.name; });
                    } else {
                        d3.select(this).append("text")
                            .attr("class", "label")
                            .attr("dy", 13)
                            .attr("dx", 4)
                            .text(function(d) { return d.name; });
                    }
                });

                // Transition nodes to their new position.
                nodeEnter.transition()
                    .duration(transitionDuration)
                    .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
                    .style("opacity", 1);

                var nodeUpdate = node.transition()
                    .duration(transitionDuration);

                nodeUpdate.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
                    .style("opacity", 1)
                    .select("rect")
                    .style("fill", color);

                nodeUpdate.each(function(d) {
                    if (d.children || d._children) {
                        d3.select(this).select(".expander").transition()
                            .duration(transitionDuration)
                            .attr("transform", function(d) {
                                return d._children ? "translate(8,14)rotate(225)" : "translate(5,8)rotate(315)";
                            });
                    }
                });

                nodeUpdate.select(".background")
                    .attr("height", function(d) { return d.height; })
                    .attr("width", function(d) { return d.width; });

                // Transition exiting nodes to the parent's new position.
                node.exit().transition()
                    .duration(transitionDuration)
                    .attr("transform", function(d) { return "translate(" + source.x + "," + source.y + ")"; })
                    .style("opacity", 1e-6)
                    .remove();
            };

            resize(root);
            chart.update(root);

        });
    }

    chart.width = function(value) {
        if (!arguments.length) return width;
        width = parseInt(value);
        return this;
    };

    chart.height = function(value) {
        if (!arguments.length) return height;
        height = parseInt(value);
        return this;
    };

    chart.margin = function(_) {
        if (!arguments.length) return margin;
        margin.top    = typeof _.top    != 'undefined' ? _.top    : margin.top;
        margin.right  = typeof _.right  != 'undefined' ? _.right  : margin.right;
        margin.bottom = typeof _.bottom != 'undefined' ? _.bottom : margin.bottom;
        margin.left   = typeof _.left   != 'undefined' ? _.left   : margin.left;
        return chart;
    };

    return chart;
};