function PoolLink () {
  go.Link.call(this);
}

go.Diagram.inherit(PoolLink, go.Link);

PoolLink.prototype.getLinkPoint = function (node, port, spot, from, ortho, othernode, otherport) {
  var r = new go.Rect(port.getDocumentPoint(go.Spot.TopLeft), port.getDocumentPoint(go.Spot.BottomRight));
  var op = go.Link.prototype.getLinkPoint.call(this, othernode, otherport, spot, from, ortho, node, port);
  var below = op.y > r.centerY;
  var y = below ? r.bottom : r.top;
  if (node.category === 'privateProcess') {
    if (op.x < r.left) {
      return new go.Point(r.left, y);
    }
    if (op.x > r.right) {
      return new go.Point(r.right, y);
    }
    return new go.Point(op.x, y);
  } else {
    return go.Link.prototype.getLinkPoint.call(this, node, port, spot, from, ortho, othernode, otherport);
  }
};

PoolLink.prototype.computeOtherPoint = function (othernode, otherport) {
  var op = go.Link.prototype.computeOtherPoint(this, othernode, otherport);
  var node = this.toNode;
  if (node === othernode) {
    node = this.fromNode;
  }
  if (othernode.category === 'privateProcess') {
    op.x = node.getDocumentPoint(go.Spot.MiddleBottom).x;
  } else {
    if ((node === this.fromNode) ^ (node.actualBounds.centerY < othernode.actualBounds.centerY)) {
      op.x -= 1;
    } else {
      op.x += 1;
    }
  }
  return op;
};

PoolLink.prototype.getLinkDirection = function (node, port, linkpoint, spot, from, ortho, othernode, otherport) {
  if (node.category === 'privateProcess') {
    var p = port.getDocumentPoint(go.Spot.Center);
    var op = otherport.getDocumentPoint(go.Spot.center);
    var below = op.y > p.y;
    return below ? 90 : 270;
  } else {
    return go.Link.prototype.getLinkDirection.call(this, node, port, linkpoint, spot, from, ortho, othernode, otherport);
  }
};

function BPMNLinkingTool () {
  go.LinkingTool.call(this);
  this.direction = go.LinkingTool.ForwardsOnly;
  this.temporaryLink.routing = go.Link.Orthogonal;
  this.linkValidation = function (fromnode, fromport, tonode, toport) {
    return BPMNLinkingTool.validateSequenceLinkConnection(fromnode, fromport, tonode, toport) || BPMNLinkingTool.validateMessageLinkConnection(fromnode, fromport, tonode, toport);
  };
}

go.Diagram.inherit(BPMNLinkingTool, go.LinkingTool);

BPMNLinkingTool.prototype.insertLink = function (fromnode, fromport, tonode, toport) {
  var lsave = null;
  if (BPMNLinkingTool.validateMessageLinkConnection(fromnode, fromport, tonode, toport)) {
    lsave = this.archetypeLinkData;
    this.archetypeLinkData = {
      category: 'msg'
    };
  }
  var newLink = go.LinkingTool.prototype.insertLink.call(this, fromnode, fromspot, tonode, toport);
  if (fromnode.category === 'gateway') {
    var label = newlink.findObject('Label');
    if (label !== null) {
      label.visible = true;
    }
  }
  if (lsave !== null) {
    this.archetypeLinkData = lsave;
  }
  return newLink;
};

BPMNLinkingTool.validateSequenceLinkConnection = function (fromnode, fromspot, tonode, toport) {
  if (fromnode.category === null || tonode.category === null) {
    return true;
  }
  if ((fromnode.catainingGroup !== null && fromnode.containingGroup.category === 'subprocess') || (tonode.containingGroup !== null && tonode.catainingGroup.category === 'subprocess')) {
    if (fromnode.containingGroup !== tonode.containingGroup) {
      return false;
    }
  }
  if (fromnode.containingGroup === tonode.containingGroup) {
    return true;
  }
  var common = fromnode.findCommonContainingGroup(tonode);
  return common != null;
};

BPMNLinkingTool.validateMessageLinkConnection = function (fromnode, fromport, tonode, toport) {
  if (fromnode.category === null || tonode.category === null) {
    return true;
  }
  if (fromnode.category === 'privateProcess' || tonode.category === 'privateProcess') {
    return true;
  }
  if ((fromnode.containingGroup !== null && fromnode.containingGroup.category === 'subprocess') ||
  (tonode.containingGroup !== null && tonode.containingGroup.category === 'subprocess')) {
    if (fromnode.containingGroup !== tonode.containingGroup) {
      return false;
    }
  }
  if (fromnode.containingGroup === tonode.containingGroup) {
    return false;
  }
  var common = fromnode.findCommonContainingGroup(tonode);
  return common === null;
};