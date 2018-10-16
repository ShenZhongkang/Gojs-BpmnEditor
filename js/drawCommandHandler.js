function DrawCommandHandler() {
  go.CommandHandler.call(this);
  this._arrowKeyBehavior = 'move';
  this._pasteOffset = new go.Point(10, 10);
  this._lastPasteOffset = new go.Point(0, 0);
};

go.Diagram.inherit(DrawCommandHandler, go.CommandHandler);

DrawCommandHandler.prototype.callAlignSelection = function () {
  var diagram = this.diagram;
  if (diagram === null || diagram.isReadOnly || diagram.isModelReadOnly) {
    return false;
  }
  if (diagram.selection.count < 2) {
    return false;
  }
  return true;
};

DrawCommandHandler.prototype.alignLeft = function () {
  var diagram = this.diagram;
  diagram.startTransaction('aligning left');
  var minPosition = Infinity;
  diagram.selection.each(function (current) {
    if (current instanceof go.Link) {
      return;
    }
    minPosition = Math.min(current.position.x, minPosition);
  });
  diagram.selection.each(function (current) {
    if (current instanceof go.Link) {
      return;
    }
    current.move(new go.Point(minPosition, current.position.y));
  });
  diagram.commitTransaction('aligning left');
};

DrawCommandHandler.prototype.alignRight = function () {
  var diagram = this.diagram;
  diagram.startTransaction('aligning right');
  var maxPosition = -Infinity;
  diagram.selection.each(function (current) {
    if (current instanceof go.Link) {
      return;
    }
    var rightSideLoc = current.actualBounds.x + current.actualBounds.width;
    maxPosition = Math.max(rightSideLoc, maxPosition);
  });
  diagram.selection.each(function (current) {
    if (current instanceof go.Link) {
      return;
    }
    current.move(new go.Point(maxPosition - current.actualBounds.width, current.position.y));
  });
  diagram.commitTransaction('aligning right');
};

DrawCommandHandler.prototype.alignTop = function () {
  var diagram = this.diagram;
  diagram.startTransaction('aligning top');
  var minPosition = Infinity;
  diagram.selection.each(function (current) {
    if (current instanceof go.Link) {
      return;
    }
    minPosition = Math.min(current.position.y, minPosition);
  });
  diagram.selection.each(function (current) {
    if (current instanceof go.Link) {
      return;
    }
    current.move(new go.Point(current.position.x, minPosition));
  });
  diagram.commitTransaction('aligning top');
};

DrawCommandHandler.prototype.alignBottom = function () {
  var diagram = this.diagram;
  diagram.startTransaction('aligning bottom');
  var maxPosition = -Infinity;
  diagram.selection.each(function (current) {
    if (current instanceof go.Link) {
      return;
    }
    var bottomSideLoc = current.actualBounds.y + current.actualBounds.height;
    maxPosition = Math.max(bottomSideLoc, maxPosition);
  });
  diagram.selection.each(function (current) {
    if (current instanceof go.Link) {
      return;
    }
    current.move(new go.Point(current.actualBounds.x, maxPosition - current.actualBounds.height));
  });
  diagram.commitTransaction('aligning bottom');
};

DrawCommandHandler.prototype.alignCenterX = function () {
  var diagram = this.diagram;
  var firstSelection = diagram.selection.first();
  if (!firstSelection) {
    return;
  }
  diagram.startTransaction('aligning Center X');
  var centerX = firstSelection.actualBounds.x + firstSelection.actualBounds.width / 2;
  diagram.selection.each(function (current) {
    if (current instanceof go.Link) {
      return;
    }
    current.move(new go.Point(centerX - current.actualBounds.width / 2, current.actualBounds.y));
  });
  diagram.commitTransaction('aligning Center X');
};

DrawCommandHandler.prototype.alignCenterY = function () {
  var diagram = this.diagram;
  var firstSelection = diagram.selection.first();
  if (!firstSelection) {
    return;
  }
  diagram.startTransaction('aligning Center Y');
  var centerY = firstSelection.actualBounds.y + firstSelection.actualBounds.height / 2;
  diagram.selection.each(function (current) {
    if (current instanceof go.Link) {
      return;
    }
    current.move(new go.Point(current.actualBounds.x, current.actualBounds.height / 2));
  });
  diagram.commitTransaction('aligning Center Y');
};

DrawCommandHandler.prototype.alignColumn = function (distance) {
  var diagram = this.diagram;
  diagram.startTransaction('align Column');
  if (distance === undefined) {
    distance = 0;
  }
  distance = parseFloat(distance);
  var selectedParts = new Array();
  diagram.selection.each(function (current) {
    if (current instanceof go.Link) {
      return;
    }
    selectedParts.push(current);
  });
  for (var i = 0; i < selectedParts.length - 1; i++) {
    var current = selectedParts[i];
    var curBottomSideLoc = current.actualBounds.y + current.actualBounds.height + distance;
    var next = selectedParts[i + 1];
    next.move(new go.Point(current.actualBounds.x, curBottomSideLoc));
  }
  diagram.commitTransaction('align Column');
};

DrawCommandHandler.prototype.alignRow = function (distance) {
  if (distance === undefined) {
    distance = 0;
  }
  distance = parseFloat(distance);
  var diagram = this.diagram;
  diagram.startTransaction('align Row');
  var selectedParts = new Array();
  diagram.selection.each(function (current) {
    if (current instanceof go.Link) {
      return;
    }
    selectedParts.push(current);
  });
  for (var i = 0; i < selectedParts.length - 1; i++) {
    var current = selectedParts[i];
    var curRightSideLoc = current.actualBounds.x + current.actualBounds.width + distance;
    var next = selectedParts[i + 1];
    next.move(new go.Point(curRightSideLoc, current.actualBounds.y));
  }
  diagram.commitTransaction('align Row');
};

DrawCommandHandler.prototype.canRotate = function (number) {
  var diagram = this.diagram;
  if (diagram === null || diagram.isReadOnly || diagram.isModelReadOnly) {
    return false;
  }
  if (diagram.selection.count < 1) {
    return false;
  }
  return true;
};

DrawCommandHandler.prototype.rotate = function (angle) {
  if (angle === undefined) {
    angle = 90;
  }
  var diagram = this.diagram;
  diagram.startTransaction('rotate ' + angle.toString());
  diagram.selection.each(function (current) {
    if (current instanceof go.Link || current instanceof go.Group) {
      return;
    }
    current.angle += angle;
  })
  diagram.commitTransaction('rotate ' + angle.toString());
};

DrawCommandHandler.prototype.doKeyDown = function () {
  var diagram = this.diagram;
  if (diagram === null) {
    return;
  }
  var e = diagram.lastInput;
  if (e.key === 'Up' || e.key === 'Down' || e.key === 'Left' || e.key === 'Right') {
    var behavior = this.arrowKeyBehavior;
    if (behavior === 'none') {
      return;
    } else if (behavior === 'select') {
      this._arrowKeySelect();
      return;
    } else if (behavior === 'move') {
      this._arrowKeyMove();
      return;
    }
  }
  go.CommandHandler.prototype.doKeyDown.call(this);
};

DrawCommandHandler.prototype._getAllParts = function () {
  var allParts = new Array();
  this.diagram.nodes.each(function (node) {
    allParts.push(node);
  });
  this.diagram.parts.each(function (part) {
    allParts.push(part);
  });
  return allParts;
};

DrawCommandHandler.prototype._arrowKeyMove = function () {
  var diagram = this.diagram;
  var e = diagram.lastInput;
  var vdistance = 0;
  var hdistance = 0;
  if (e.control || e.meta) {
    vdistance = 1;
    hdistance = 1;
  } else if (diagram.grid !== null) {
    var cellSize = diagram.grid.girdCellSize;
    hdistance = cellSize.width;
    vdistance = cellSize.height;
  }
  diagram.startTransaction('arrowKeyMove');
  diagram.selection.each(function (part) {
    if (e.key === 'Up') {
      part.move(new go.Point(part.actualBounds.x, part.actualBounds.y - vdistance));
    } else if (e.key === 'Down') {
      part.move(new go.Point(part.actualBounds.x, part.actualBounds.y + vdistance));
    } else if (e.key === 'Left') {
      part.move(new go.Point(part.actualBounds.x - hdistance, part.actualBounds.y));
    } else if (e.key === 'Right') {
      part.move(new go.Point(part.actualBounds.x + hdistance, part.actualBounds.y));
    }
  });
  diagram.commitTransaction('arrowKeyMove');
};

DrawCommandHandler.prototype._arrowKeySelect = function () {
  var diagram = this.diagram;
  var e = diagram.lastInput;
  var nextPart = null;
  if (e.key === 'Up') {
    nextPart = this._findNearestPartTowards(270);
  } else if (e.key === 'Down') {
    nextPart = this._findNearestPartTowards(90);
  } else if (e.key === 'Left') {
    nextPart = this._findNearestPartTowards(180);
  } else if (e.key === 'Right') {
    nextPart = this._findNearestPartTowards(0);
  }
  if (nextPart !== null) {
    if (e.shift) {
      nextPart.isSelected = true;
    } else if (e.control || e.meta) {
      nextPart.isSelected = !nextPart.isSelected;
    } else {
      diagram.select(nextPart);
    }
  }
};

DrawCommandHandler.prototype._findNearestPartTowards = function (dir) {
  var originalPart = this.diagram.selection.first();
  if (originalPart === null) {
    return null;
  }
  var originalPoint = originalPart.actualBounds.center;
  var allParts = this._getAllParts();
  var closestDistance = Infinity;
  var closest = originalPart;
  for (var i = 0; i < allParts.length; i++) {
    var nextPart = allParts[i];
    if (nextPart === originalPart) {
      continue;
    }
    var nextPoint = nextPart.actualBounds.center;
    var angle = originalPoint.directionPoint(nextPoint);
    var angleDiff = this._angleCloseness(angle, dir);
    if (angleDiff <= 45) {
      var distance = originalPoint.distanceSquaredPoint(nextPoint);
      distance *= 1 + Math.sin(angleDiff * Math.PI / 180);
      if (distance < closestDistance) {
        closestDistance = distance;
        closest = nextPart;
      }
    }
  }
  return closest;
};

DrawCommandHandler.prototype._angleCloseness = function (a, dir) {
  return Math.min(Math.abs(dir - a), Math.min(Math.abs(dir + 360 - a), Math.abs(dir - 360 - a)));
};

DrawCommandHandler.prototype.copyToClipboard = function (coll) {
  go.CommandHandler.prototype.copyToClipboard.call(this, coll);
  this._lastPasteOffset.set(this.pasteOffset);
};

DrawCommandHandler.prototype.pasteFromClipboard = function () {
  var coll = go.CommandHandler.prototype.pasteFromClipboard.call(this);
  this.diagram.moveParts(coll, this._lastPasteOffset);
  this._lastPasteOffset.add(this.pasteOffset);
  return coll;
};

Object.defineProperty(DrawCommandHandler.prototype, 'arrowKeyBehavior', {
  get: function () {
    return this._arrowKeyBehavior;
  },
  set: function (val) {
    if (val !== 'move' && val !== 'select' && val !== 'sroll' && val !== 'none') {
      throw new Error('DrawCommandHandler.arrowKeyBehavior must be either "move", "select", "scroll", or "none", not: ' + val);
    }
    this._arrowKeyBehavior = val;
  }
});

Object.defineProperty(DrawCommandHandler.prototype, 'pasteOffset', {
  get: function () {
    return this._pasteOffset;
  },
  set: function (val) {
    if (!(val instanceof go.Point)) {
      throw new Error('DrawCommandHandler.pasteOffset must be a Point, not: ' + val);
    }
    this._pasteOffset.set(val);
  }
});