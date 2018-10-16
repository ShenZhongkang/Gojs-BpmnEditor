// Setup all of the Diagram and what they need.
function init() { // 页面加载之后运行

  function checkLocalStorage() {
    try {
      window.localStorage.setItem('item', 'item');
      window.localStorage.removeItem('item');
      return true;
    } catch (e) {
      return false;
    }
  }

  if (!checkLocalStorage()) {
    var currentFile = document.getElementById('currentFile');
    currentFile.textContent = '你的浏览器不支持本地存储';
  }

  // 设置顶部操作菜单
  jQuery('#menuui').menu();
  jQuery(function () {
    jQuery('#menuui').menu({
      position: {
        my: 'left top',
        at: 'left top+30'
      }
    });
  });
  jQuery('#menuui').menu({
    icons: {
      submenu: 'ui-icon-triangle-l-s'
    }
  });

  // 打开文件弹窗
  var openDocument = document.getElementById('openDocument');
  openDocument.style.visibility = 'hidden';
  // 移除文件弹窗
  var removeDocument = document.getElementById('removeDocument');
  removeDocument.style.visibility = 'hidden';

  // 定义
  var $ = go.GraphObject.make;

  // 定义预设常量
  var GradientYellow = $(go.Brush, 'Linear', { 0: 'LightGoldenRodYellow', 1: '#ff6' });
  var GradientLightGreen = $(go.Brush, 'Linear', { 0: '#e0fee0', 1: 'PaleGreen' });
  var GradientLightGray = $(go.Brush, 'Linear', { 0: '#fff', 1: '#dadada' });

  var ActivityNodeFill = $(go.Brush, 'Linear', { 0: 'OldLace', 1: 'PapayaWhip' });
  var ActivityNodeStroke = '#cdaa7d';
  var ActivityMarkerStrokeWidth = 1.5;
  var ActivityNodeWidth = 120;
  var ActivityNodeHeight = 80;
  var ActivityNodeStrokeWidth = 1;
  var ActivityNodeStrokeWidthIsCall = 4;

  var SubprocessNodeFill = ActivityNodeFill;
  var SubprocessNodeStroke = ActivityNodeStroke;

  var EventNodeSize = 42;
  var EventNodeInnerSize = EventNodeSize - 6;
  var EventNodeSymbolSize = EventNodeInnerSize - 14;
  var EventEndOuterFillColor = 'pink';
  var EventBackgroundColor = GradientLightGreen;
  var EventSymbolLightFill = 'white';
  var EventSymbolDarkFill = 'dimgray';
  var EventDimensionStrokeColor = 'green';
  var EventDimensionStrokeEndColor = 'red';
  var EventNodeStrokeWidthIsEnd = 4;

  var GatewayNodeSize = 80;
  var GatewayNodeSymbolSize = 45;
  var GatewayNodeFill = GradientYellow;
  var GatewayNodeStroke = 'darkgoldenrod';
  var GatewayNodeSymbolStroke = 'darkgoldenrod';
  var GatewayNodeSymbolFill = GradientYellow;
  var GatewayNodeSymbolStrokeWidth = 3;

  var DataFill = GradientLightGray;

  // 自定义图形
  go.Shape.defineFigureGenerator('Empty', function(shape, w, h) {
    return new go.Geometry();
  });

  var annotationStr = 'M 150,0L 0,0L 0,600L 150,600 M 800,0';
  var annotationGeo = go.Geometry.parse(annotationStr);
  annotationGeo.normalize();
  go.Shape.defineFigureGenerator('Annotation', function(shape, w, h) {
    var geo = annotationGeo.copy();
    // 计算缩放
    var bounds = geo.bounds;
    var scale = Math.min(w / bounds.width, h / bounds.height);
    geo.scale(scale, scale);
    return geo;
  });

  var gearStr = "F M 391,5L 419,14L 444.5,30.5L 451,120.5L 485.5,126L 522,141L 595,83L 618.5,92L 644,106.5" +
  "L 660.5,132L 670,158L 616,220L 640.5,265.5L 658.122,317.809L 753.122,322.809L 770.122,348.309L 774.622,374.309" +
  "L 769.5,402L 756.622,420.309L 659.122,428.809L 640.5,475L 616.5,519.5L 670,573.5L 663,600L 646,626.5" +
  "L 622,639L 595,645.5L 531.5,597.5L 493.192,613.462L 450,627.5L 444.5,718.5L 421.5,733L 393,740.5L 361.5,733.5" +
  "L 336.5,719L 330,627.5L 277.5,611.5L 227.5,584.167L 156.5,646L 124.5,641L 102,626.5L 82,602.5L 78.5,572.5" +
  "L 148.167,500.833L 133.5,466.833L 122,432.5L 26.5,421L 11,400.5L 5,373.5L 12,347.5L 26.5,324L 123.5,317.5" +
  "L 136.833,274.167L 154,241L 75.5,152.5L 85.5,128.5L 103,105.5L 128.5,88.5001L 154.872,82.4758L 237,155" +
  "L 280.5,132L 330,121L 336,30L 361,15L 391,5 Z M 398.201,232L 510.201,275L 556.201,385L 505.201,491L 399.201,537" +
  "L 284.201,489L 242.201,385L 282.201,273L 398.201,232 Z";
  var gearGeo = go.Geometry.parse(gearStr);
  gearGeo.normalize();
  go.Shape.defineFigureGenerator('BpmnTaskService', function(shape, w, h) {
    var geo = gearGeo.copy();
    // 计算缩放
    var bounds = geo.bounds;
    var scale = Math.min(w / bounds.width, h / bounds.height);
    geo.scale(scale, scale);
    // 文字在手上
    geo.spot1 = new go.Spot(0, 0.6, 10, 0);
    geo.spot2 = new go.Spot(1, 1);
    return geo;
  });

  var handStr = "F1M18.13,10.06 C18.18,10.07 18.22,10.07 18.26,10.08 18.91," +
  "10.20 21.20,10.12 21.28,12.93 21.36,15.75 21.42,32.40 21.42,32.40 21.42," +
  "32.40 21.12,34.10 23.08,33.06 23.08,33.06 22.89,24.76 23.80,24.17 24.72," +
  "23.59 26.69,23.81 27.19,24.40 27.69,24.98 28.03,24.97 28.03,33.34 28.03," +
  "33.34 29.32,34.54 29.93,33.12 30.47,31.84 29.71,27.11 30.86,26.56 31.80," +
  "26.12 34.53,26.12 34.72,28.29 34.94,30.82 34.22,36.12 35.64,35.79 35.64," +
  "35.79 36.64,36.08 36.72,34.54 36.80,33.00 37.17,30.15 38.42,29.90 39.67," +
  "29.65 41.22,30.20 41.30,32.29 41.39,34.37 42.30,46.69 38.86,55.40 35.75," +
  "63.29 36.42,62.62 33.47,63.12 30.76,63.58 26.69,63.12 26.69,63.12 26.69," +
  "63.12 17.72,64.45 15.64,57.62 13.55,50.79 10.80,40.95 7.30,38.95 3.80," +
  "36.95 4.24,36.37 4.28,35.35 4.32,34.33 7.60,31.25 12.97,35.75 12.97," +
  "35.75 16.10,39.79 16.10,42.00 16.10,42.00 15.69,14.30 15.80,12.79 15.96," +
  "10.75 17.42,10.04 18.13,10.06z";
  var handGeo = go.Geometry.parse(handStr);
  handGeo.rotate(90, 0, 0);
  handGeo.normalize();
  go.Shape.defineFigureGenerator('BpmnTaskManual', function(shape, w, h) {
    var geo = handGeo.copy();
    // 计算缩放
    var bounds = geo.bounds;
    var scale = Math.min(w / bounds.width, h / bounds.height);
    geo.scale(scale, scale);
    geo.spot1 = new go.Spot(0, 0.6, 10, 0);
    geo.spot2 = new go.Spot(1, 1);
    return geo;
  });

  // 定义提示出现位置
  var tooltipTemplate = $(
    go.Adornment,
    go.Panel.Auto,
    $(
      go.Shape,
      'RoundedRectangle',
      {
        fill: 'whitesmoke',
        stoke: gray
      }
    ),
    $(
      go.TextBlock,
      {
        margin: 3,
        editable: true
      },
      new go.Binding('text', '', function(data) {
        if (data.item !== undefined) {
          return data.item;
        }
        return '(未命名元素)';
      })
    )
  );

  // 数据绑定使用的转换函数
  function nodeActivityTaskTypeConverter(s) {
    var tasks = [
      'Empty',
      'BpmnTaskMessage',
      'BpmnTaskUser',
      'BpmmTaskManual',
      'BpmnTaskScript',
      'BpmnTaskMessage',
      'BpmnTaskService',
      'InternalStorage'
    ];
    if (s < tasks.length) {
      return tasks[s];
    }
    return 'NotAllowed'; // 错误
  }

  // 
  function nodeActivityBESpotConverter(s) {
    var x = 10 + (EventNodeSize / 2);
    if (s === 0) {
      return new go.Spot(0, 1, x, 0); // 左下
    }
    if (s === 1) {
      return new go.Spot(1, 1, -x, 0); // 右下
    }
    if (s === 2) {
      return new go.Spot(1, 0, -x, 0); // 右上
    }
    return new go.Spot(1, 0, -x - (s - 2) * EventNodeSize, 0);
  }

  function nodeActivityTaskTypeColorConverter(s) {
    return (s === 5) ? 'dimgray' : 'white';
  }

  function nodeEventTypeConverter(s) {
    var tasks = [
      'NotAllowed',
      'Empty',
      'BpmnTaskMessage',
      'BpmmEventTimer',
      'BpmnEventEscalation',
      'BpmnEventConditional',
      'Arrow',
      'BpmnEventError',
      'ThinX',
      'BpmnActivityCompensation',
      'Triangle', // 三角形
      'Pentagon', // 五角星
      'ThickCross',
      'Circle'
    ];
    if (s < tasks.length) {
      return tasks[s];
    }
    return 'NotAllowed';
  }

  function nodeEventDimensionStrokeColorConverter(s) {
    if (s === 8) {
      return EventDimensionStrokeEndColor;
    }
    return EventDimensionStrokeColor;
  }

  function nodeEventDimensionSymbolFillConverter(s) {
    if (s <= 6) {
      return EventSymbolLightFill;
    }
    return EventSymbolDarkFill;
  }

  // ------------------ Activity Node Boundary Event -----------------
  var boundaryEventMenu = $(
    go.Adornment,
    'Vertical',
    $(
      'ContextMenuButton',
      $(
        go.TextBlock,
        '移除事件'
      ),
      {
        click: function(e, obj) { // click 事件里，obj.part 是 Adornment， obj.part.adornedObject 是 port
          removeActivityNodeBoundaryEvent(obj.part.adornedObject);
        }
      }
    )
  );

  // removing a boundary event doesn't not reposition other BE circles on the node, just reassigning alignmentIndex in remaining BE would do that.
  function removeActivityNodeBoundaryEvent(obj) {
    myDiagram.startTransaction('removeBoundaryEvent');
    var pid = obj.portId;
    var arr = obj.panel.itemArray;
    for (var i = 0; i < arr.length; i++) {
      if (arr[i].portId === pid) {
        myDiagram.model.removeArrayItem(arr, i);
        break;
      }
    }
    myDiagram.commitTransaction('removeBoundaryEvent');
  }

  var boundrayEventItemTemplate = $(
    go.Panel,
    'Spot',
    {
      contextMenu: boundaryEventMenu,
      alignmentFocus: go.Spot.Center,
      fromLinkable: true,
      toLinkable: false,
      cursor: 'pointer',
      fromSpot: go.Spot.Bottom,
      fromMaxLinks: 1,
      toMaxLinks: 0
    },
    new go.Binding('portId', 'portId'),
    new go.Binding('alignment', 'alignmentIndex', nodeActivityBESpotConverter),
    $(
      go.Shape,
      'Circle',
      {
        'desiredSize': new go.Size(EventNodeSize, EventNodeSize)
      },
      new go.Binding('strokeDashArray', 'eventDimension', function(s) {
        return (s === 6) ? [4, 2] : null;
      }),
      new go.Binding('fromSpot', 'alignmentIndex', function(s) {
        if (s < 2) {
          return go.Spot.Bottom;
        }
        return go.Spot.Top;
      }),
      new go.Binding('fill', 'color')
    ),
    $(
      go.Shape,
      'Circle',
      {
        alignment: go.Spot.Center,
        desiredSize: new go.Size(EventNodeInnerSize, EventNodeInnerSize),
        fill: null
      },
      new go.Binding('strokeDashArray', 'eventDimension', function(s) {
        return (s === 6) ? [4, 2] : null;
      })
    ),
    $(
      go.Shape,
      'NotAllowed',
      {
        alignment: go.Spot.Center,
        desiredSize: new go.Size(EventNodeSymbolSize, EventNodeSymbolSize),
        fill: 'white'
      },
      new go.Binding('figure', 'eventType', nodeEventTypeConverter)
    )
  );

  // --------------- Activity Node contextMenu ----------------------
  var activityNodeMenu = $(
    go.Adornment,
    'Vertical',
    
  );
  // 画布区域
  window.myDiagram = $(go.Diagram, 'myDiagramDiv', {
    nodeTemplateMap: nodeTemplateMap,
    linkTemplateMap: linkTemplateMap,
    groupTemplateMap: groupTemplateMap,
    allowDrop: true,
    commandHandler: new DrawCommandHandler(),
    'commandHandler.arrowKeyBehavior': 'move',
    mouseDrop: function (e) {
      var ok = myDiagram.commandHandler.addTopLevelParts(myDiagram.selection, true);
      if (!ok) {
        myDiagram.currentTool.doCancel();
      }
    },
    linkingTool: new BPMNLinkingTool(),
    'SelectionMoved': relayoutDiagram,
    'SelectionCopied': relayoutDiagram
  });

  // nodeTemplateMap
  var nodeTemplateMap = new go.Map('string', go.Node);
  nodeTemplateMap.add('activity');

  // linkTemplate
  var sequenceLinkTemplate = $(
    go.Link,
    {
      contextMenu: $(
        go.Adornment,
        'Vertical',
        $(
          'ContextMenuButton',
          $(
            go.TextBlock,
            'Default Flow'
          ),
        )
      )
    }
  )
  var linkTemplateMap = new go.Map('string', go.Link);
  linkTemplateMap.add('', sequenceLinkTemplate);

  // ------------ Palette -----------------
  // Make sure the pipes are ordered by their key in the palette inventory
  function keyCompare(a, b) {
    var at = a.data.key;
    var bt = b.data.key;
    if (at < bt) {
      return -1;
    }
    if (at > bt) {
      return 1;
    }
    return 0;
  }

  // initialize the first Palette, BPMN Spec Level 1
  var myPaletteLevel1 = $(go.Palette, 'myPaletteLevel1', {
    nodeTemplateMap: palNodeTemplateMap,
    groupTemplateMap: palGroupTemplateMap,
    layout: $(go.GridLayout, {
      cellSize: new go.Size(1, 1),
      spacing: new go.Size(5, 5),
      comparer: keyCompare
    })
  });

  jQuery('#accordion').accordion({
    active: function (event, ui) {
      myPaletteLevel1.requestUpdate();
    }
  })
}

