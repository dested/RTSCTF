////////////////////////////////////////////////////////////////////////////////
// Isos.Utility.CanvasInformation
var $Isos_Utility_CanvasInformation = function(context, domCanvas) {
	this.context = null;
	this.domCanvas = null;
	this.canvas = null;
	this.context = context;
	this.domCanvas = domCanvas;
	this.canvas = domCanvas[0];
};
$Isos_Utility_CanvasInformation.get_blackPixel = function() {
	if (ss.isNullOrUndefined($Isos_Utility_CanvasInformation.$blackPixel)) {
		var m = $Isos_Utility_CanvasInformation.create(0, 0);
		m.context.fillStyle = 'black';
		m.context.fillRect(0, 0, 1, 1);
		$Isos_Utility_CanvasInformation.$blackPixel = m.canvas;
	}
	return $Isos_Utility_CanvasInformation.$blackPixel;
};
$Isos_Utility_CanvasInformation.create = function(w, h) {
	var canvas = document.createElement('canvas');
	return $Isos_Utility_CanvasInformation.create$1(canvas, w, h);
};
$Isos_Utility_CanvasInformation.create$1 = function(canvas, w, h) {
	if (w === 0) {
		w = 1;
	}
	if (h === 0) {
		h = 1;
	}
	canvas.width = w;
	canvas.height = h;
	var ctx = canvas.getContext('2d');
	return new $Isos_Utility_CanvasInformation(ctx, $(canvas));
};
////////////////////////////////////////////////////////////////////////////////
// Isos.Utility.Extensions
var $Isos_Utility_Extensions = function() {
};
$Isos_Utility_Extensions.addEvent = function(element, eventName, listener) {
	if (!!ss.isValue(element.addEventListener)) {
		element.addEventListener(eventName, listener, false);
	}
	else {
		element.attachEvent(eventName, function() {
			listener(window.event);
		});
	}
};
$Isos_Utility_Extensions.takeRandom = function(T) {
	return function(items) {
		var ls = items.clone();
		ls.sort(function(a, b) {
			return ss.Int32.trunc(Math.round(Math.random()) - 0.5);
		});
		return ls;
	};
};
$Isos_Utility_Extensions.withData = function(T, T2) {
	return function(item, data) {
		return new (Type.makeGenericType($Isos_Utility_ExtraData$2, [T, T2]))(item, data);
	};
};
$Isos_Utility_Extensions.percent$1 = function(num) {
	return num + '%';
};
$Isos_Utility_Extensions.percent = function(num) {
	return num + '%';
};
////////////////////////////////////////////////////////////////////////////////
// Isos.Utility.ExtraData
var $Isos_Utility_ExtraData$2 = function(T, T2) {
	var $type = function(item, data) {
		this.item = T.getDefaultValue();
		this.data = T2.getDefaultValue();
		this.data = data;
		this.item = item;
	};
	$type.op_Implicit = function(d) {
		return d.item;
	};
	$type.op_Implicit$1 = function(d) {
		return d.data;
	};
	Type.registerGenericClassInstance($type, $Isos_Utility_ExtraData$2, [T, T2], function() {
		return Object;
	}, function() {
		return [];
	});
	return $type;
};
Type.registerGenericClass(global, 'Isos.Utility.ExtraData$2', $Isos_Utility_ExtraData$2, 2);
////////////////////////////////////////////////////////////////////////////////
// Isos.Utility.Help
var $Isos_Utility_Help = function() {
};
$Isos_Utility_Help.getColor = function(_start, _end, _percent) {
	if (ss.isNullOrUndefined(_start)) {
		_start = '#FFFFFF';
	}
	var hex2Dec = function(_hex) {
		return parseInt(_hex, 16);
	};
	var dec2Hex = function(_dec) {
		return ((_dec < 16) ? '0' : '') + _dec.toString(16);
	};
	_start = _start.substring(1, 7);
	_end = _end.substring(1, 7);
	var r1 = hex2Dec(_start.substring(0, 2));
	var g1 = hex2Dec(_start.substring(2, 4));
	var b1 = hex2Dec(_start.substring(4, 6));
	var r2 = hex2Dec(_end.substring(0, 2));
	var g2 = hex2Dec(_end.substring(2, 4));
	var b2 = hex2Dec(_end.substring(4, 6));
	var pc = _percent / 100;
	var r = ss.Int32.trunc(Math.floor(r1 + pc * (r2 - r1) + 0.5));
	var g = ss.Int32.trunc(Math.floor(g1 + pc * (g2 - g1) + 0.5));
	var b = ss.Int32.trunc(Math.floor(b1 + pc * (b2 - b1) + 0.5));
	return '#' + dec2Hex(r) + dec2Hex(g) + dec2Hex(b);
};
$Isos_Utility_Help.getCursorPosition = function(ev) {
	if (!!(ev.originalEvent && ev.originalEvent.targetTouches && ev.originalEvent.targetTouches.length > 0)) {
		ev = ev.originalEvent.targetTouches[0];
	}
	return $Isos_Utility_Pointer.$ctor(0, 0, ss.Nullable.unbox(Type.cast((!!ev.wheelDelta ? (ev.wheelDelta / 40) : (!!ev.detail ? -ev.detail : 0)), ss.Int32)), ev.button === 2);
};
$Isos_Utility_Help.getRandomColor = function() {
	return $Isos_Utility_Help.colors[ss.Int32.trunc(Math.random() * $Isos_Utility_Help.colors.length)];
};
$Isos_Utility_Help.isPointInIso = function(_s, _a, _b, _c) {
	var asX = _s.x - _a.x;
	var asY = _s.y - _a.y;
	var sAb = (_b.x - _a.x) * asY - (_b.y - _a.y) * asX > 0;
	if ((_c.x - _a.x) * asY - (_c.y - _a.y) * asX > 0 === sAb) {
		return false;
	}
	if ((_c.x - _b.x) * (_s.y - _b.y) - (_c.y - _b.y) * (_s.x - _b.x) > 0 !== sAb) {
		return false;
	}
	return true;
};
$Isos_Utility_Help.log = function(_cont) {
	var console = $('#txtConsole');
	var text = console.val();
	console.val(text + _cont + '\n');
	console.scrollTop(console[0].scrollHeight - console.height());
};
////////////////////////////////////////////////////////////////////////////////
// Isos.Utility.Point
var $Isos_Utility_Point = function() {
};
$Isos_Utility_Point.$ctor = function(x, y) {
	var $this = {};
	$this.x = 0;
	$this.y = 0;
	$this.x = x;
	$this.y = y;
	return $this;
};
////////////////////////////////////////////////////////////////////////////////
// Isos.Utility.Pointer
var $Isos_Utility_Pointer = function() {
};
$Isos_Utility_Pointer.$ctor = function(x, y, delta, right) {
	var $this = $Isos_Utility_Point.$ctor(x, y);
	$this.delta = 0;
	$this.right = false;
	$this.delta = delta;
	$this.right = right;
	return $this;
};
////////////////////////////////////////////////////////////////////////////////
// RTSCTF.RTSCTF
var $RTSCTF_RTSCTF = function() {
};
$RTSCTF_RTSCTF.main = function() {
	$(function() {
		new $RTSCTF_RTSCTF();
	});
};
Type.registerClass(global, 'Isos.Utility.CanvasInformation', $Isos_Utility_CanvasInformation, Object);
Type.registerClass(global, 'Isos.Utility.Extensions', $Isos_Utility_Extensions, Object);
Type.registerClass(global, 'Isos.Utility.Help', $Isos_Utility_Help, Object);
Type.registerClass(global, 'Isos.Utility.Point', $Isos_Utility_Point, Object);
Type.registerClass(global, 'Isos.Utility.Pointer', $Isos_Utility_Pointer);
Type.registerClass(global, 'RTSCTF.RTSCTF', $RTSCTF_RTSCTF, Object);
$Isos_Utility_CanvasInformation.$blackPixel = null;
$Isos_Utility_Help.colors = ['#FF0000', '#00FF00', '#0000FF', '#880088', '#888800', '#008888'];
$RTSCTF_RTSCTF.main();
