/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

d3.custom.layout.flow = function(data) {

    var hierarchy = d3.hierarchy,
        nodeWidth = 125,
        nodeHeight = 300,
        containerHeight = 100,
        width = 900,
        height = 0,
        padding = {top:20, left:10, bottom:10, right:10},
        margin = {top:10, left:10, bottom:10, right:10};

    function flow(data) {
        var nodes = hierarchy(data),
            root = nodes;
//console.log("nodes",nodes)

        function firstWalk(node) {
//            console.log(node)
            var children = node.children;
            if (children && children.length > 0) {
                var n = children.length,
                    i = -1,
                    child;

                while (++i < n) {
                    child = children[i];
                    firstWalk(child);
                }

                gridLayout(node, children, node.depth);
            } else {
                node.width = node._children ? width - (node.depth * (padding.left + padding.right)) - (padding.left + padding.right) : nodeWidth;
                node.height = node._children ? containerHeight : nodeHeight;
            }
        }


        function secondWalk(node) {
//            console.log(node)
            var children = node.children;
            if (children && children.length > 0) {
                var i = -1,
                    n = children.length,
                    child;
                while (++i < n) {
                    child = children[i];
                    child.x += node.x;
                    child.y += node.y;
                    secondWalk(child);
                }
            }
        }


        function gridLayout(node, children, depth) {
            var paddingValue = node.parent ? padding.left + padding.right : margin.left + margin.right;
            var availableWidth = width - (depth * (paddingValue)) - (paddingValue),
                currentX = padding.left,
                currentY = padding.top,
                tallestChildHeight = 0;

            children.forEach(function(child) {
                if ((currentX + child.width + padding.right) >= availableWidth) {
                    currentX = padding.right;
                    currentY += tallestChildHeight;
                    tallestChildHeight = 0;
                }
                child.x = currentX;
                child.y = currentY;
                currentX += child.width + padding.right;
                tallestChildHeight = Math.max(tallestChildHeight, child.height + padding.bottom);
            });
            node.width = availableWidth;
            node.height = currentY + tallestChildHeight;
            node.x = node.parent ? padding.left : margin.left;
            node.y = node.parent ? padding.top  : margin.top;
        }


        firstWalk(root);
        secondWalk(root);
        height = root.height;

        return nodes;
    }

    flow.padding = function(_) {
        if (!arguments.length) return padding;
        padding.top    = typeof _.top    != 'undefined' ? _.top    : padding.top;
        padding.right  = typeof _.right  != 'undefined' ? _.right  : padding.right;
        padding.bottom = typeof _.bottom != 'undefined' ? _.bottom : padding.bottom;
        padding.left   = typeof _.left   != 'undefined' ? _.left   : padding.left;
        return this;
    };

    flow.margin = function(_) {
        if (!arguments.length) return margin;
        flow.top    = typeof _.top    != 'undefined' ? _.top    : flow.top;
        flow.right  = typeof _.right  != 'undefined' ? _.right  : flow.right;
        flow.bottom = typeof _.bottom != 'undefined' ? _.bottom : flow.bottom;
        flow.left   = typeof _.left   != 'undefined' ? _.left   : flow.left;
        return this;
    };

    flow.width = function(value) {
        if (!arguments.length) return width;
        width = parseInt(value);
        return this;
    };

    flow.height = function(value) {
        if (!arguments.length) return height;
        height = parseInt(value);
        return this;
    };

    flow.nodeWidth = function(value) {
        if (!arguments.length) return nodeWidth;
        nodeWidth = parseInt(value);
        return this;
    };

    flow.nodeHeight = function(value) {
        if (!arguments.length) return nodeHeight;
        nodeHeight = parseInt(value);
        return this;
    };

    flow.containerHeight = function(value) {
        if (!arguments.length) return containerHeight;
        containerHeight = parseInt(value);
        return this;
    };

    return flow;
};
