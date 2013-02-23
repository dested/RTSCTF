////////////////////////////////////////////////////////////////////////////////
// RTSCTF.ActionManager
var $RTSCTF_ActionManager = function(clientGameManager) {
	this.$myClientGameManager = null;
	this.currentTick = 0;
	this.$myClientGameManager = clientGameManager;
};
$RTSCTF_ActionManager.prototype = {
	init: function() {
		this.currentTick = 0;
		//pull from soiver
	},
	tick: function() {
		this.currentTick++;
	}
};
////////////////////////////////////////////////////////////////////////////////
// RTSCTF.AStarNode
var $RTSCTF_AStarNode = function(movementCost, heuristicCost, parent, coord) {
	this.totalCost = 0;
	this.movementCost = 0;
	this.heuristicCost = 0;
	this.parent = null;
	this.coordinate = null;
	this.totalCost = movementCost + heuristicCost;
	this.movementCost = movementCost;
	this.heuristicCost = heuristicCost;
	this.parent = parent;
	this.coordinate = coord;
};
////////////////////////////////////////////////////////////////////////////////
// RTSCTF.ClickMode
var $RTSCTF_ClickMode = function() {
};
$RTSCTF_ClickMode.prototype = { moveCharacter: 0, dragMap: 1 };
Type.registerEnum(global, 'RTSCTF.ClickMode', $RTSCTF_ClickMode, false);
////////////////////////////////////////////////////////////////////////////////
// RTSCTF.Client
var $RTSCTF_Client = function() {
	this.screen = null;
};
$RTSCTF_Client.prototype = {
	init: function(context) {
	},
	mouseMove: function(pointer) {
		return false;
	},
	mouseScroll: function(pointer) {
		return false;
	},
	buildUI: function(manager) {
	},
	bindKeys: function(manager) {
	},
	onClick: function(pointer) {
		return false;
	},
	mouseUp: function(pointer) {
		return false;
	},
	resize: function() {
	},
	draw: function(context) {
	},
	tick: function() {
	},
	gameTick: function() {
	}
};
////////////////////////////////////////////////////////////////////////////////
// RTSCTF.ClientGameManager
var $RTSCTF_ClientGameManager = function(game) {
	this.game = null;
	this.$screenOffset = null;
	this.$2$WindowManagerField = null;
	this.gameMode = 0;
	this.clickMode = 0;
	this.scale = null;
	this.actionManager = null;
	$RTSCTF_GameManager.call(this);
	this.tileManager = new $RTSCTF_DrawTileManager(this);
	this.mapManager = new $RTSCTF_DrawMapManager(this, 400, 400);
	this.unitManager = new $RTSCTF_DrawUnitManager(this);
	this.game = game;
	this.set_windowManager(new $RTSCTF_WindowManager(this, 0, 0, 400, 225));
	this.actionManager = new $RTSCTF_ActionManager(this);
	this.$screenOffset = $RTSCTF_Utility_Point.$ctor1(0, 0);
	this.scale = $RTSCTF_Utility_Point.$ctor1(2, 2);
	this.clickMode = 0;
	this.unitManager.mainCharacterUpdate = Function.combine(this.unitManager.mainCharacterUpdate, Function.mkdel(this, function(x, y) {
		this.get_windowManager().centerAround(x, y);
	}));
};
$RTSCTF_ClientGameManager.prototype = {
	get_windowManager: function() {
		return this.$2$WindowManagerField;
	},
	set_windowManager: function(value) {
		this.$2$WindowManagerField = value;
	},
	init: function() {
		this.actionManager.init();
		$RTSCTF_GameManager.prototype.init.call(this);
	},
	tick: function() {
		this.actionManager.tick();
		$RTSCTF_GameManager.prototype.tick.call(this);
	},
	loadTiles: function(jsonTileMap, completed) {
		$RTSCTF_Utility_UIManager_CHelp.loadImageFromUrl(jsonTileMap.tileMapURL, Function.mkdel(this, function(image) {
			Type.cast(this.tileManager, $RTSCTF_DrawTileManager).loadTiles$1(jsonTileMap, image, completed);
		}));
	},
	draw: function(context) {
		context.save();
		switch (this.gameMode) {
			case 0: {
				break;
			}
			case 1: {
				this.$screenOffset.x = ss.Int32.div(this.game.screen.width, 2) - ss.Int32.div(this.get_windowManager().width * this.scale.x, 2);
				this.$screenOffset.y = ss.Int32.div(this.game.screen.height, 2) - ss.Int32.div(this.get_windowManager().height * this.scale.y, 2);
				context.translate(this.$screenOffset.x, this.$screenOffset.y);
				this.$playDraw(context);
				break;
			}
		}
		context.restore();
	},
	$playDraw: function(context) {
		var wm = this.get_windowManager();
		var wX = Math.max(0, ss.Int32.div(wm.x, $RTSCTF_RTSCTFGameConfig.tileSize) - 3);
		var wY = Math.max(0, ss.Int32.div(wm.y, $RTSCTF_RTSCTFGameConfig.tileSize) - 3);
		var wWidth = wX + ss.Int32.div(wm.width, $RTSCTF_RTSCTFGameConfig.tileSize) + 6;
		var wHeight = wY + ss.Int32.div(wm.height, $RTSCTF_RTSCTFGameConfig.tileSize) + 6;
		context.save();
		context.scale(this.scale.x, this.scale.y);
		context.beginPath();
		context.rect(0, 0, wm.width, wm.height);
		context.clip();
		context.closePath();
		context.translate(-wm.x, -wm.y);
		Type.cast(this.mapManager, $RTSCTF_DrawMapManager).draw(context, wX, wY, wWidth, wHeight);
		Type.cast(this.unitManager, $RTSCTF_DrawUnitManager).draw(context);
		context.restore();
	},
	offsetPointer: function(pointer) {
		pointer.x -= this.$screenOffset.x;
		pointer.y -= this.$screenOffset.y;
	},
	gameTick: function() {
		this.actionManager.tick();
	}
};
////////////////////////////////////////////////////////////////////////////////
// RTSCTF.ClientManager
var $RTSCTF_ClientManager = function() {
	this.$canvasHeight = 0;
	this.$canvasWidth = 0;
	this.$gameCanvas = null;
	this.$gameCanvasName = 'gameLayer';
	this.$gameGoodSize = null;
	this.$gameManager = null;
	this.$lastMouseMove = null;
	this.$uiCanvas = null;
	this.$uiCanvasName = 'uiLayer';
	this.$uiGoodSize = null;
	this.uiManager = null;
	var elem = document.getElementById('loading');
	elem.parentNode.removeChild(elem);
	var stats = new xStats();
	document.body.appendChild(stats.element);
	this.$gameCanvas = $RTSCTF_Utility_CanvasInformation.create$3(document.getElementById(this.$gameCanvasName), 0, 0);
	this.$uiCanvas = $RTSCTF_Utility_CanvasInformation.create$3(document.getElementById(this.$uiCanvasName), 0, 0);
	this.uiManager = new $RTSCTF_Utility_UIManager_UIManager();
	this.$gameManager = new $RTSCTF_MainGameManager();
	this.$bindInput();
	window.addEventListener('resize', Function.mkdel(this, function(e) {
		this.resizeCanvas();
	}));
	$(document).resize(Function.mkdel(this, function(e1) {
		this.resizeCanvas();
	}));
	var a = 0;
	//Window.SetInterval(() => {},1000 / 60);
	window.setInterval(Function.mkdel(this, this.$gameTick), 100);
	window.setInterval(Function.mkdel(this, this.$tick), 16);
	window.setInterval(Function.mkdel(this, this.gameDraw), 16);
	window.setInterval(Function.mkdel(this, this.uiDraw), 100);
	this.$gameManager.start(this.$gameCanvas.context);
	this.resizeCanvas();
	this.$gameManager.buildUI(this.uiManager);
};
$RTSCTF_ClientManager.prototype = {
	$tick: function() {
		this.$gameManager.tick();
	},
	$gameTick: function() {
		this.$gameManager.gameTick();
	},
	$bindInput: function() {
		this.$uiCanvas.domCanvas.mousedown(Function.mkdel(this, this.$canvasOnClick));
		this.$uiCanvas.domCanvas.mouseup(Function.mkdel(this, this.$canvasMouseUp));
		this.$uiCanvas.domCanvas.mousemove(Function.mkdel(this, this.$canvasMouseMove));
		this.$uiCanvas.domCanvas.bind('touchstart', Function.mkdel(this, this.$canvasOnClick));
		this.$uiCanvas.domCanvas.bind('touchend', Function.mkdel(this, this.$canvasMouseUp));
		this.$uiCanvas.domCanvas.bind('touchmove', Function.mkdel(this, this.$canvasMouseMove));
		this.$uiCanvas.domCanvas.bind('DOMMouseScroll', Function.mkdel(this, this.$handleScroll));
		this.$uiCanvas.domCanvas.bind('mousewheel', Function.mkdel(this, this.$handleScroll));
		this.$uiCanvas.domCanvas.bind('contextmenu', function(e) {
			e.preventDefault();
		});
		var dontPress = false;
		document.addEventListener('keypress', Function.mkdel(this, function(e1) {
			dontPress = this.uiManager.onKeyDown(e1);
		}), true);
		KeyboardJS.bind.key('e', function() {
		}, function() {
		});
	},
	$handleScroll: function(jQueryEvent) {
		jQueryEvent.preventDefault();
		var j = ss.Nullable.unbox(Type.cast((!!jQueryEvent.detail ? (jQueryEvent.detail * -120) : jQueryEvent.wheelDelta), ss.Int32));
		if (this.uiManager.onMouseScroll(jQueryEvent)) {
			return;
		}
	},
	$canvasMouseMove: function(queryEvent) {
		queryEvent.preventDefault();
		document.body.style.cursor = 'default';
		this.$lastMouseMove = $RTSCTF_Utility_UIManager_CHelp.getCursorPosition(queryEvent);
		if (this.uiManager.onMouseMove(this.$lastMouseMove)) {
			return;
		}
		if (this.$gameManager.mouseMove(this.$lastMouseMove)) {
			return;
		}
		return;
	},
	$canvasOnClick: function(queryEvent) {
		queryEvent.preventDefault();
		var cursorPosition = $RTSCTF_Utility_UIManager_CHelp.getCursorPosition(queryEvent);
		if (this.uiManager.onClick(cursorPosition)) {
			return;
		}
		if (this.$gameManager.onClick(cursorPosition)) {
			return;
		}
	},
	$canvasMouseUp: function(queryEvent) {
		queryEvent.preventDefault();
		this.uiManager.onMouseUp(this.$lastMouseMove);
		if (this.$gameManager.mouseUp(this.$lastMouseMove)) {
			return;
		}
	},
	resizeCanvas: function() {
		this.$canvasWidth = $(window).width();
		this.$canvasHeight = $(window).height();
		this.$uiCanvas.domCanvas.attr('width', this.$canvasWidth.toString());
		this.$uiCanvas.domCanvas.attr('height', this.$canvasHeight.toString());
		this.$gameManager.screen.width = window.innerWidth;
		this.$gameManager.screen.height = window.innerHeight;
		this.$gameCanvas.domCanvas.attr('width', this.$gameManager.screen.width.toString());
		this.$gameCanvas.domCanvas.attr('height', this.$gameManager.screen.height.toString());
		this.$uiGoodSize = $RTSCTF_Utility_Point.$ctor1(this.$canvasWidth, this.$canvasHeight);
		this.$gameGoodSize = $RTSCTF_Utility_Point.$ctor1(this.$gameManager.screen.width, this.$gameManager.screen.height);
	},
	clear: function(canv) {
		var w;
		if (ss.referenceEquals(canv, this.$gameCanvas)) {
			w = this.$gameGoodSize;
		}
		else {
			w = this.$uiGoodSize;
		}
		//canv.DomCanvas[0].Me().width = w.width;
		canv.context.clearRect(0, 0, w.x, w.y);
	},
	gameDraw: function() {
		this.clear(this.$gameCanvas);
		this.$gameManager.draw(this.$gameCanvas.context);
	},
	uiDraw: function() {
		this.clear(this.$uiCanvas);
		this.uiManager.draw(this.$uiCanvas.context);
	}
};
$RTSCTF_ClientManager.$randomName = function() {
	var randomName = '';
	var ra = Math.random() * 10;
	for (var i = 0; i < ra; i++) {
		randomName += String.fromCharCode(ss.Int32.trunc(65 + Math.random() * 26));
	}
	return randomName;
};
$RTSCTF_ClientManager.$main = function() {
	$(function() {
		new $RTSCTF_ClientManager();
	});
};
////////////////////////////////////////////////////////////////////////////////
// RTSCTF.CollisionType
var $RTSCTF_CollisionType = function() {
};
$RTSCTF_CollisionType.prototype = { empty: 0, full: 1, rightHalf: 2, topHalf: 3, leftHalf: 4, bottomHalf: 5 };
Type.registerEnum(global, 'RTSCTF.CollisionType', $RTSCTF_CollisionType, false);
////////////////////////////////////////////////////////////////////////////////
// RTSCTF.DrawGameMap
var $RTSCTF_DrawGameMap = function(mapManager, jsonMap) {
	$RTSCTF_GameMap.call(this, mapManager, jsonMap);
};
$RTSCTF_DrawGameMap.prototype = {
	draw: function(context, tileX, tileY, wWidth, wHeight) {
		context.save();
		for (var x = tileX; x < wWidth; x++) {
			for (var y = tileY; y < wHeight; y++) {
				var tile = Type.cast($RTSCTF_Utility_Extensions.getSafe($RTSCTF_Tile).call(null, this.tileMap, x, y), $RTSCTF_DrawTile);
				if (ss.isNullOrUndefined(tile)) {
					continue;
				}
				tile.draw(context, tileX, tileY, x, y);
			}
		}
		context.restore();
	}
};
////////////////////////////////////////////////////////////////////////////////
// RTSCTF.DrawMapManager
var $RTSCTF_DrawMapManager = function(gameManager, totalRegionWidth, totalRegionHeight) {
	$RTSCTF_MapManager.call(this, gameManager, totalRegionWidth, totalRegionHeight);
};
$RTSCTF_DrawMapManager.prototype = {
	loadMap: function(jsonMap) {
		var gameMap = new $RTSCTF_DrawGameMap(this, jsonMap);
		this.get_gameMaps()[gameMap.name] = gameMap;
		return gameMap;
	},
	draw: function(context, wX, wY, wWidth, wHeight) {
		context.save();
		wWidth = Math.min(wWidth, this.myTotalRegionWidth);
		wHeight = Math.min(wHeight, this.myTotalRegionHeight);
		var $t1 = this.get_gameMapLayouts();
		for (var $t2 = 0; $t2 < $t1.length; $t2++) {
			var gameMapLayout = $t1[$t2];
			Type.cast(gameMapLayout.get_gameMap(), $RTSCTF_DrawGameMap).draw(context, gameMapLayout.get_x() + wX, gameMapLayout.get_y() + wY, wWidth, wHeight);
		}
		context.restore();
	}
};
////////////////////////////////////////////////////////////////////////////////
// RTSCTF.DrawTile
var $RTSCTF_DrawTile = function(canvas, x, y, jsonMap) {
	this.image = null;
	$RTSCTF_Tile.call(this, x, y, jsonMap);
	var imageData = canvas.context.getImageData(x, y, jsonMap.tileWidth, jsonMap.tileHeight);
	var data = $RTSCTF_Utility_CanvasInformation.create$1(imageData);
	this.image = data;
};
$RTSCTF_DrawTile.prototype = {
	draw: function(context, _x, _y, mapX, mapY) {
		context.save();
		context.translate(_x + mapX * $RTSCTF_RTSCTFGameConfig.tileSize, _y + mapY * $RTSCTF_RTSCTFGameConfig.tileSize);
		//
		//            context.Translate(RTSCTFGameConfig.TileSize / 2, RTSCTFGameConfig.TileSize / 2);
		//
		//            //context.Rotate(fm);
		//
		//            context.Translate(-RTSCTFGameConfig.TileSize / 2, -RTSCTFGameConfig.TileSize / 2);
		context.drawImage(this.image.canvas, 0, 0);
		//
		//            context.StrokeStyle = "red";
		//
		//            context.StrokeRect(0, 0, RTSCTFGameConfig.TileSize, RTSCTFGameConfig.TileSize);
		//
		//            
		//
		//            switch (Collision) {
		//
		//            case CollisionType.Full:
		//
		//            context.FillStyle = "rgba(233,12,22,0.6)";
		//
		//            context.FillRect(0, 0, RTSCTFGameConfig.TileSize, RTSCTFGameConfig.TileSize);
		//
		//            break;
		//
		//            case CollisionType.RightHalf:
		//
		//            context.FillStyle = "rgba(233,12,22,0.6)";
		//
		//            context.FillRect(RTSCTFGameConfig.TileSize / 2, 0, RTSCTFGameConfig.TileSize / 2, RTSCTFGameConfig.TileSize);
		//
		//            break;
		//
		//            case CollisionType.TopHalf:
		//
		//            context.FillStyle = "rgba(233,12,22,0.6)";
		//
		//            context.FillRect(0, 0, RTSCTFGameConfig.TileSize, RTSCTFGameConfig.TileSize / 2);
		//
		//            break;
		//
		//            case CollisionType.LeftHalf:
		//
		//            context.FillStyle = "rgba(233,12,22,0.6)";
		//
		//            context.FillRect(0, 0, RTSCTFGameConfig.TileSize / 2, RTSCTFGameConfig.TileSize);
		//
		//            break;
		//
		//            case CollisionType.BottomHalf:
		//
		//            context.FillStyle = "rgba(233,12,22,0.6)";
		//
		//            context.FillRect(0, RTSCTFGameConfig.TileSize / 2, RTSCTFGameConfig.TileSize, RTSCTFGameConfig.TileSize / 2);
		//
		//            break;
		//
		//            }
		//todo enable when some sort of edit mode is enabled
		context.restore();
	}
};
////////////////////////////////////////////////////////////////////////////////
// RTSCTF.DrawTileManager
var $RTSCTF_DrawTileManager = function(gameManager) {
	$RTSCTF_TileManager.call(this, gameManager);
};
$RTSCTF_DrawTileManager.prototype = {
	loadTiles$1: function(jsonTileMap, tileImage, completed) {
		var canvas = $RTSCTF_Utility_CanvasInformation.create(tileImage);
		var height = jsonTileMap.mapHeight * jsonTileMap.tileHeight;
		var width = jsonTileMap.mapWidth * jsonTileMap.tileWidth;
		for (var x = 0; x < width; x += jsonTileMap.tileWidth) {
			for (var y = 0; y < height; y += jsonTileMap.tileHeight) {
				//load just the xy width*height of the canvas into a tile object for caching mostly. 
				var tile = new $RTSCTF_DrawTile(canvas, x, y, jsonTileMap);
				//store each tile in a hash of name-x-y
				this.loadedTiles[tile.get_key()] = tile;
			}
		}
		completed();
	}
};
////////////////////////////////////////////////////////////////////////////////
// RTSCTF.DrawUnitManager
var $RTSCTF_DrawUnitManager = function(gameManager) {
	$RTSCTF_UnitManager.call(this, gameManager);
};
$RTSCTF_DrawUnitManager.prototype = {
	draw: function(context) {
		this.mainCharacter.draw(context);
	}
};
////////////////////////////////////////////////////////////////////////////////
// RTSCTF.Game
var $RTSCTF_Game = function() {
	this.$clicking = false;
	this.$gameManager = null;
	this.$myClickState = null;
	$RTSCTF_Client.call(this);
	this.$gameManager = new $RTSCTF_ClientGameManager(this);
	$RTSCTF_Game.debugText = [];
};
$RTSCTF_Game.prototype = {
	resize: function() {
	},
	bindKeys: function(manager) {
		manager.bind.key('ctrl', Function.mkdel(this, function() {
			//keydown
			this.$gameManager.clickMode = 1;
		}), Function.mkdel(this, function() {
			//keyup
			this.$gameManager.clickMode = 0;
		}));
		manager.bind.key('shift', function() {
			//keydown
		}, function() {
			//keyup
		});
	},
	init: function(context) {
		$RTSCTF_Client.prototype.init.call(this, context);
		this.$gameManager.gameMode = 1;
		$RTSCTF_TaskHandler.start(Function.mkdel(this, function(completed) {
			this.$gameManager.loadTiles($RTSCTF_Game.$fakeJsonTileMap2(), completed);
		})).addTask(Function.mkdel(this, function(completed1) {
			this.$gameManager.loadTiles($RTSCTF_Game.$fakeJsonTileMap(), completed1);
		})).addTask(Function.mkdel(this, function(completed2) {
			var bigMap = this.$gameManager.mapManager.loadMap($RTSCTF_Game.$fakeJsonMap());
			this.$gameManager.mapManager.addMapToRegion(bigMap, 0, 0);
			this.$gameManager.mapManager.addMapToRegion(this.$gameManager.mapManager.loadMap($RTSCTF_Game.$fakeJsonMap()), bigMap.mapWidth, 0);
			completed2();
		})).do();
		this.$gameManager.init();
	},
	tick: function() {
		this.$gameManager.tick();
	},
	gameTick: function() {
		this.$gameManager.gameTick();
	},
	buildUI: function(manager) {
		var manageData;
		var $t1 = new $RTSCTF_Utility_UIManager_UIArea(this.screen.width - 400, 100, 250, 300);
		$t1.closable = true;
		manager.addArea(manageData = $t1);
		manageData.visible = true;
		var $t2 = new $RTSCTF_Utility_UIManager_TextArea(30, 25, Type.makeGenericType($RTSCTF_Utility_DelegateOrValue$1, [String]).op_Implicit$2('Manage Defense'));
		$t2.color = 'blue';
		manageData.addControl($RTSCTF_Utility_UIManager_TextArea).call(manageData, $t2);
		manageData.addControl($RTSCTF_Utility_UIManager_TextArea).call(manageData, new $RTSCTF_Utility_UIManager_TextArea(5, 50, Type.makeGenericType($RTSCTF_Utility_DelegateOrValue$1, [String]).op_Implicit$2('Mode: ')));
		this.$myClickState = null;
		var $t3 = new (Type.makeGenericType($RTSCTF_Utility_UIManager_Button$1, [Boolean]))(true, 20, 50, 100, 25, Type.makeGenericType($RTSCTF_Utility_DelegateOrValue$1, [String]).op_Implicit$1(Function.mkdel(this, function() {
			return (this.$myClickState.data ? 'Edit' : 'Play');
		})));
		$t3.click = Function.mkdel(this, function(p) {
			this.$myClickState.data = !this.$myClickState.data;
			if (this.$myClickState.data) {
				this.$gameManager.gameMode = 1;
			}
			else {
				this.$gameManager.gameMode = 0;
			}
		});
		this.$myClickState = $t3;
		manageData.addControl(Type.makeGenericType($RTSCTF_Utility_UIManager_Button$1, [Boolean])).call(manageData, this.$myClickState);
		var $t4 = new $RTSCTF_Utility_UIManager_Button(20, 80, 100, 25, Type.makeGenericType($RTSCTF_Utility_DelegateOrValue$1, [String]).op_Implicit$2('Send Wave'));
		$t4.click = function(p1) {
		};
		manageData.addControl($RTSCTF_Utility_UIManager_Button).call(manageData, $t4);
	},
	mouseMove: function(screenPointer) {
		if (!this.$clicking) {
			return false;
		}
		var gamePointer = this.$getGamePointer(screenPointer);
		var tilePointer = this.$getTilePointer(gamePointer);
		switch (this.$gameManager.clickMode) {
			case 0: {
				if (this.$gameManager.get_windowManager().collides(gamePointer)) {
					this.$gameManager.unitManager.mainCharacter.moveTowards(gamePointer.x, gamePointer.y);
				}
				break;
			}
			case 1: {
				this.$gameManager.get_windowManager().centerAround(screenPointer.x, screenPointer.y);
				break;
			}
		}
		return false;
	},
	onClick: function(screenPointer) {
		this.$clicking = true;
		var gamePointer = this.$getGamePointer(screenPointer);
		var tilePointer = this.$getTilePointer(gamePointer);
		switch (this.$gameManager.clickMode) {
			case 0: {
				if (this.$gameManager.get_windowManager().collides(gamePointer)) {
					this.$gameManager.unitManager.mainCharacter.moveTowards(gamePointer.x, gamePointer.y);
				}
				break;
			}
		}
		return false;
	},
	$getGamePointer: function(screenPointer) {
		var gamePointer = $RTSCTF_Utility_Pointer.clonePointer(screenPointer);
		this.$gameManager.offsetPointer(gamePointer);
		gamePointer.x = ss.Int32.div(gamePointer.x, this.$gameManager.scale.x);
		gamePointer.y = ss.Int32.div(gamePointer.y, this.$gameManager.scale.y);
		//the scale "offset"
		this.$gameManager.get_windowManager().offsetPointer(gamePointer);
		//the window offset
		return gamePointer;
	},
	$getTilePointer: function(gamePointer) {
		var tilePointer = $RTSCTF_Utility_Pointer.clonePointer(gamePointer);
		tilePointer.x = ss.Int32.div(tilePointer.x, this.$gameManager.scale.x);
		tilePointer.y = ss.Int32.div(tilePointer.y, $RTSCTF_RTSCTFGameConfig.tileSize);
		//the scale "offset" 
		return tilePointer;
	},
	mouseUp: function(pointer) {
		this.$clicking = false;
		return $RTSCTF_Client.prototype.mouseUp.call(this, pointer);
	},
	draw: function(context) {
		this.$gameManager.draw(context);
		for (var i = 0; i < $RTSCTF_Game.debugText.length; i++) {
			if ($RTSCTF_Game.debugText[i]) {
				context.save();
				context.strokeStyle = 'white';
				context.strokeText($RTSCTF_Game.debugText[i].toString(), this.screen.width - 120, i * 20 + 150);
				context.restore();
			}
		}
	}
};
$RTSCTF_Game.$makeFakeMap = function(name, w, h) {
	var keys = new Array(w);
	for (var x = 0; x < w; x++) {
		keys[x] = new Array(h);
		for (var y = 0; y < h; y++) {
			keys[x][y] = $RTSCTF_Tile.makeKey(name, x, y);
		}
	}
	return keys;
};
$RTSCTF_Game.$fakeJsonTileMap2 = function() {
	return { mapWidth: 20, mapHeight: 16, name: 'Pretty', tileWidth: $RTSCTF_RTSCTFGameConfig.tileSize, tileHeight: $RTSCTF_RTSCTFGameConfig.tileSize, tileMapURL: 'http://50.116.22.241:8881/lamp/Games/ZombieGame/assets/top.png' };
};
$RTSCTF_Game.$fakeJsonTileMap = function() {
	return { mapWidth: 12, mapHeight: 10, name: 'Pretty2', tileWidth: $RTSCTF_RTSCTFGameConfig.tileSize, tileHeight: $RTSCTF_RTSCTFGameConfig.tileSize, tileMapURL: 'http://50.116.22.241:8881/lamp/Games/ZombieGame/assets/watertileset3qb2tg0.png' };
};
$RTSCTF_Game.$fakeJsonMap2 = function() {
	return { mapWidth: 20, mapHeight: 16, name: 'Pretties', tileMap: $RTSCTF_Game.$makeFakeMap('Pretty', 20, 16) };
};
$RTSCTF_Game.$fakeJsonMap = function() {
	return { mapWidth: 12, mapHeight: 10, name: 'Pretties2', tileMap: $RTSCTF_Game.$makeFakeMap('Pretty2', 12, 10) };
};
////////////////////////////////////////////////////////////////////////////////
// RTSCTF.GameManager
var $RTSCTF_GameManager = function() {
	this.tileManager = null;
	this.mapManager = null;
	this.unitManager = null;
	this.tileManager = new $RTSCTF_TileManager(this);
	this.mapManager = new $RTSCTF_MapManager(this, 400, 400);
	this.unitManager = new $RTSCTF_UnitManager(this);
};
$RTSCTF_GameManager.prototype = {
	init: function() {
		this.unitManager.init();
	},
	tick: function() {
		this.unitManager.tick();
	}
};
////////////////////////////////////////////////////////////////////////////////
// RTSCTF.GameMap
var $RTSCTF_GameMap = function(mapManager, jsonMap) {
	this.$myMapManager = null;
	this.mapWidth = 0;
	this.mapHeight = 0;
	this.name = null;
	this.tileMap = null;
	this.collisionMap = null;
	this.$myMapManager = mapManager;
	this.name = jsonMap.name;
	this.mapWidth = jsonMap.mapWidth;
	this.mapHeight = jsonMap.mapHeight;
	this.tileMap = new Array(this.mapWidth);
	this.collisionMap = new Array(this.mapWidth);
	for (var x = 0; x < this.mapWidth; x++) {
		this.tileMap[x] = new Array(this.mapHeight);
		this.collisionMap[x] = new Array(this.mapHeight);
		for (var y = 0; y < this.mapHeight; y++) {
			var key = jsonMap.tileMap[x][y];
			var tile = this.$myMapManager.myGameManager.tileManager.getTileByKey(key);
			this.tileMap[x][y] = tile;
			this.collisionMap[x][y] = tile.get_collision();
		}
	}
};
$RTSCTF_GameMap.prototype = {
	getTileAt: function(x, y) {
		return this.tileMap[x][y];
	}
};
////////////////////////////////////////////////////////////////////////////////
// RTSCTF.GameMapLayout
var $RTSCTF_GameMapLayout = function() {
	this.$1$GameMapField = null;
	this.$1$XField = 0;
	this.$1$YField = 0;
};
$RTSCTF_GameMapLayout.prototype = {
	get_gameMap: function() {
		return this.$1$GameMapField;
	},
	set_gameMap: function(value) {
		this.$1$GameMapField = value;
	},
	get_x: function() {
		return this.$1$XField;
	},
	set_x: function(value) {
		this.$1$XField = value;
	},
	get_y: function() {
		return this.$1$YField;
	},
	set_y: function(value) {
		this.$1$YField = value;
	}
};
////////////////////////////////////////////////////////////////////////////////
// RTSCTF.GameMode
var $RTSCTF_GameMode = function() {
};
$RTSCTF_GameMode.prototype = { tileEdit: 0, play: 1 };
Type.registerEnum(global, 'RTSCTF.GameMode', $RTSCTF_GameMode, false);
////////////////////////////////////////////////////////////////////////////////
// RTSCTF.MainGameManager
var $RTSCTF_MainGameManager = function() {
	this.$game = null;
	this.screen = null;
	this.$game = new $RTSCTF_Game();
	// game = new Game(); 
	// game = new ZakGame.Client.Game();
	this.screen = $RTSCTF_Rectangle.$ctor1(0, 0, 0, 0);
};
$RTSCTF_MainGameManager.prototype = {
	mouseMove: function(queryEvent) {
		return this.$game.mouseMove(queryEvent);
	},
	buildUI: function(uiManager) {
		this.$game.buildUI(uiManager);
	},
	onClick: function(queryEvent) {
		return this.$game.onClick(queryEvent);
	},
	mouseUp: function(queryEvent) {
		return this.$game.mouseUp(queryEvent);
	},
	draw: function(context) {
		this.$game.draw(context);
	},
	tick: function() {
		this.$game.tick();
	},
	start: function(context) {
		this.$game.screen = this.screen;
		this.$game.init(context);
		this.$game.bindKeys(KeyboardJS);
	},
	gameTick: function() {
		this.$game.gameTick();
	}
};
////////////////////////////////////////////////////////////////////////////////
// RTSCTF.MapManager
var $RTSCTF_MapManager = function(gameManager, totalRegionWidth, totalRegionHeight) {
	this.myGameManager = null;
	this.myTotalRegionHeight = 0;
	this.myTotalRegionWidth = 0;
	this.$1$GameMapsField = null;
	this.$1$CollisionMapField = null;
	this.$1$GameMapLayoutsField = null;
	this.myGameManager = gameManager;
	this.myTotalRegionWidth = totalRegionWidth;
	this.myTotalRegionHeight = totalRegionHeight;
	this.set_gameMaps({});
	this.set_gameMapLayouts([]);
	this.set_collisionMap(new Array(this.myTotalRegionWidth));
	for (var x = 0; x < this.myTotalRegionWidth; x++) {
		this.get_collisionMap()[x] = new Array(this.myTotalRegionHeight);
		for (var y = 0; y < this.myTotalRegionHeight; y++) {
			this.get_collisionMap()[x][y] = 0;
		}
	}
};
$RTSCTF_MapManager.prototype = {
	get_gameMaps: function() {
		return this.$1$GameMapsField;
	},
	set_gameMaps: function(value) {
		this.$1$GameMapsField = value;
	},
	get_collisionMap: function() {
		return this.$1$CollisionMapField;
	},
	set_collisionMap: function(value) {
		this.$1$CollisionMapField = value;
	},
	get_gameMapLayouts: function() {
		return this.$1$GameMapLayoutsField;
	},
	set_gameMapLayouts: function(value) {
		this.$1$GameMapLayoutsField = value;
	},
	loadMap: function(jsonMap) {
		var gameMap = new $RTSCTF_GameMap(this, jsonMap);
		this.get_gameMaps()[gameMap.name] = gameMap;
		return gameMap;
	},
	addMapToRegion$1: function(name, x, y) {
		this.addMapToRegion(this.get_gameMaps()[name], x, y);
	},
	addMapToRegion: function(gameMap, x, y) {
		var $t2 = this.get_gameMapLayouts();
		var $t1 = new $RTSCTF_GameMapLayout();
		$t1.set_gameMap(gameMap);
		$t1.set_x(x);
		$t1.set_y(y);
		$t2.add($t1);
		for (var _x = 0; _x < gameMap.mapWidth; _x++) {
			for (var _y = 0; _y < gameMap.mapHeight; _y++) {
				this.get_collisionMap()[_x + x][_y + y] = gameMap.collisionMap[_x][_y];
			}
		}
	}
};
////////////////////////////////////////////////////////////////////////////////
// RTSCTF.Person
var $RTSCTF_Person = function(gameManager) {
	$RTSCTF_Unit.call(this, gameManager);
};
$RTSCTF_Person.prototype = {
	init: function() {
		this.moveRate = 2.4;
		$RTSCTF_Unit.prototype.init.call(this);
	},
	draw: function(context) {
		context.save();
		context.fillStyle = 'blue';
		context.fillRect(this.x - 13, this.y - 13, 26, 26);
		context.restore();
	}
};
////////////////////////////////////////////////////////////////////////////////
// RTSCTF.Rectangle
var $RTSCTF_Rectangle = function() {
};
$RTSCTF_Rectangle.createInstance = function() {
	return $RTSCTF_Rectangle.$ctor();
};
$RTSCTF_Rectangle.$ctor = function() {
	var $this = $RTSCTF_Utility_Point.$ctor1(0, 0);
	$this.width = 0;
	$this.height = 0;
	return $this;
};
$RTSCTF_Rectangle.$ctor1 = function(x, y, width, height) {
	var $this = $RTSCTF_Utility_Point.$ctor1(x, y);
	$this.width = 0;
	$this.height = 0;
	$this.width = width;
	$this.height = height;
	return $this;
};
////////////////////////////////////////////////////////////////////////////////
// RTSCTF.RTSCTFGameConfig
var $RTSCTF_RTSCTFGameConfig = function() {
};
////////////////////////////////////////////////////////////////////////////////
// RTSCTF.TaskHandler
var $RTSCTF_TaskHandler = function() {
	this.$current = 0;
	this.$1$TasksField = null;
	this.set_tasks([]);
};
$RTSCTF_TaskHandler.prototype = {
	get_tasks: function() {
		return this.$1$TasksField;
	},
	set_tasks: function(value) {
		this.$1$TasksField = value;
	},
	addTask: function(task) {
		this.get_tasks().add(task);
		return this;
	},
	do: function() {
		this.get_tasks()[this.$current++](Function.mkdel(this, this.happen));
	},
	happen: function() {
		if (this.$current === this.get_tasks().length) {
			return;
		}
		this.get_tasks()[this.$current++](Function.mkdel(this, this.happen));
	}
};
$RTSCTF_TaskHandler.start = function(task) {
	return (new $RTSCTF_TaskHandler()).addTask(task);
};
////////////////////////////////////////////////////////////////////////////////
// RTSCTF.Tile
var $RTSCTF_Tile = function(x, y, jsonMap) {
	this.$jsonMap = null;
	this.tileMapY = 0;
	this.tileMapX = 0;
	this.$1$CollisionField = 0;
	this.$jsonMap = jsonMap;
	this.tileMapX = x;
	this.tileMapY = y;
	this.set_collision(this.$randomCollision());
};
$RTSCTF_Tile.prototype = {
	get_key: function() {
		return $RTSCTF_Tile.makeKey(this.$jsonMap.name, ss.Int32.div(this.tileMapX, this.$jsonMap.tileWidth), ss.Int32.div(this.tileMapY, this.$jsonMap.tileHeight));
	},
	get_collision: function() {
		return this.$1$CollisionField;
	},
	set_collision: function(value) {
		this.$1$CollisionField = value;
	},
	$randomCollision: function() {
		if (Math.random() * 100 < 35) {
			return ss.Int32.trunc(Math.random() * 4 + 1);
		}
		return 0;
	}
};
$RTSCTF_Tile.makeKey = function(name, x, y) {
	return String.format('{0}-{1}-{2}', name, x, y);
};
////////////////////////////////////////////////////////////////////////////////
// RTSCTF.TileManager
var $RTSCTF_TileManager = function(gameManager) {
	this.$myGameManager = null;
	this.loadedTiles = null;
	this.$myGameManager = gameManager;
	this.loadedTiles = {};
};
$RTSCTF_TileManager.prototype = {
	loadTiles: function(jsonTileMap, completed) {
		var height = jsonTileMap.mapHeight * jsonTileMap.tileHeight;
		var width = jsonTileMap.mapWidth * jsonTileMap.tileWidth;
		for (var x = 0; x < width; x += jsonTileMap.tileWidth) {
			for (var y = 0; y < height; y += jsonTileMap.tileHeight) {
				//load just the xy width*height of the canvas into a tile object for caching mostly. 
				var tile = new $RTSCTF_Tile(x, y, jsonTileMap);
				//store each tile in a hash of name-x-y
				this.loadedTiles[tile.get_key()] = tile;
			}
		}
		completed();
	},
	getTileByKey: function(key) {
		return this.loadedTiles[key];
	}
};
////////////////////////////////////////////////////////////////////////////////
// RTSCTF.TilePieceData
var $RTSCTF_TilePieceData = function() {
};
$RTSCTF_TilePieceData.createInstance = function() {
	return $RTSCTF_TilePieceData.$ctor();
};
$RTSCTF_TilePieceData.$ctor = function() {
	var $this = {};
	$this.x = 0;
	$this.y = 0;
	$this.tileX = 0;
	$this.tileY = 0;
	$this.tileKey = null;
	return $this;
};
////////////////////////////////////////////////////////////////////////////////
// RTSCTF.Unit
var $RTSCTF_Unit = function(gameManager) {
	this.$movingTowards = null;
	this.$myGameManager = null;
	this.x = 0;
	this.y = 0;
	this.moveRate = 0;
	this.updatePosition = null;
	this.$myGameManager = gameManager;
	this.moveRate = 2;
};
$RTSCTF_Unit.prototype = {
	init: function() {
		if (ss.isValue(this.updatePosition)) {
			this.updatePosition(this.x, this.y);
		}
	},
	draw: function(context) {
	},
	moveTowards: function(x, y) {
		this.$movingTowards = $RTSCTF_Utility_Point.$ctor1(x, y);
		//new WaypointDeterminer(new Point(X, Y), new Point(x, y), MoveRate, myGameManager.MapManager.CollisionMap);
	},
	tick: function() {
		if (ss.isValue(this.$movingTowards)) {
			if (Math.abs(this.$movingTowards.x - this.x) < 6 && Math.abs(this.$movingTowards.y - this.y) < 6) {
				this.$movingTowards = null;
			}
			else {
				var m = $RTSCTF_Utility_Point.normalize($RTSCTF_Utility_Point.negate$1(this.$movingTowards, this.x, this.y), this.moveRate);
				this.x += m.x;
				this.y += m.y;
				if (ss.isValue(this.updatePosition)) {
					this.updatePosition(this.x, this.y);
				}
			}
		}
	}
};
////////////////////////////////////////////////////////////////////////////////
// RTSCTF.UnitManager
var $RTSCTF_UnitManager = function(gameManager) {
	this.$myGameManager = null;
	this.$characterCenterPadding = $RTSCTF_Utility_Point.$ctor1(150, 150);
	this.mainCharacter = null;
	this.mainCharacterUpdate = null;
	this.$myGameManager = gameManager;
};
$RTSCTF_UnitManager.prototype = {
	init: function() {
		var $t1 = new $RTSCTF_Person(this.$myGameManager);
		$t1.x = 100;
		$t1.y = 170;
		$t1.updatePosition = this.mainCharacterUpdate;
		this.mainCharacter = $t1;
		this.mainCharacter.init();
	},
	tick: function() {
		this.mainCharacter.tick();
	}
};
////////////////////////////////////////////////////////////////////////////////
// RTSCTF.Waypoint
var $RTSCTF_Waypoint = function() {
	this.x = 0;
	this.y = 0;
};
////////////////////////////////////////////////////////////////////////////////
// RTSCTF.WaypointDeterminer
var $RTSCTF_WaypointDeterminer = function(start, end, moveRate, collisionMap) {
	this.$myCollisionMap = null;
	this.points = null;
	this.$myCollisionMap = collisionMap;
	var _x = start.x, _y = start.y;
	//[x][y]
	//
	//            switch (collisionMap[0][0]) {
	//
	//            case CollisionType.Empty:
	//
	//            break;
	//
	//            case CollisionType.Full:
	//
	//            break;
	//
	//            case CollisionType.RightHalf:
	//
	//            break;
	//
	//            case CollisionType.TopHalf:
	//
	//            break;
	//
	//            case CollisionType.LeftHalf:
	//
	//            break;
	//
	//            case CollisionType.BottomHalf:
	//
	//            break;
	//
	//            }
	//
	//            int _x=start.X, _y=start.Y;
	//
	//            
	//
	//            while (true) {
	//
	//            if (Math.Abs(end.X - start.X) < 6 && Math.Abs(end.Y - start.X) < 6) //6 chosen arbitrarily
	//
	//            break;
	//
	//            else {
	//
	//            var m = end.Negate(_x, _y).Normalize(moveRate);
	//
	//            _x += m.X;
	//
	//            _y += m.Y;
	//
	//            Points.Add(new Waypoint() {X = _x, Y = _y});
	//
	//            }
	//
	//            }
	//If area mouse clicked is empty, attempt to calculate path to coordinate
	if (this.$myCollisionMap[end.x][end.y] === 0) {
		var openList = [];
		var closedList = [];
		//Add start coord to openlist
		openList.add(new $RTSCTF_AStarNode(0, (Math.abs(start.x - end.x) + Math.abs(start.y - end.y)) * $RTSCTF_AStarNode.lateralCost, null, $RTSCTF_Utility_Point.$ctor1(start.x, start.y)));
		//While still nodes to search on frontier
		while (openList.length > 0) {
			var lowestCost = 2147483647;
			var currentNode = null;
			//Find lowest cost node and set it to current
			for (var $t1 = 0; $t1 < openList.length; $t1++) {
				var node = openList[$t1];
				if (node.totalCost < lowestCost) {
					lowestCost = node.totalCost;
					currentNode = node;
				}
			}
			//switch current node from open list to closed list
			openList.remove(currentNode);
			closedList.add(currentNode);
			//Build list of directly adjacent nodes that are walkable
			var eligibleAdjacent = [];
			var currentX = currentNode.coordinate.x;
			var currentY = currentNode.coordinate.y;
			//Column left of current node
			if (currentX - 1 >= 0) {
				if (this.$myCollisionMap[currentX - 1][currentY] === 0) {
				}
			}
		}
	}
};
$RTSCTF_WaypointDeterminer.prototype = {
	tick: function() {
		return false;
	}
};
////////////////////////////////////////////////////////////////////////////////
// RTSCTF.WindowManager
var $RTSCTF_WindowManager = function(gameManager, x, y, width, height) {
	this.$myGameManager = null;
	this.x = 0;
	this.y = 0;
	this.width = 0;
	this.height = 0;
	this.$myGameManager = gameManager;
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
};
$RTSCTF_WindowManager.prototype = {
	centerAround: function(x, y) {
		this.x = Math.max(x - ss.Int32.div(this.width, 2), 0);
		this.y = Math.max(y - ss.Int32.div(this.height, 2), 0);
	},
	offsetPointer: function(pointer) {
		pointer.x += this.x;
		pointer.y += this.y;
	},
	collides: function(point) {
		return point.x > this.x && point.x < this.x + this.width && point.y > this.y && point.y < this.y + this.height;
	}
};
////////////////////////////////////////////////////////////////////////////////
// RTSCTF.Utility.CanvasInformation
var $RTSCTF_Utility_CanvasInformation = function(context, domCanvas) {
	this.context = null;
	this.domCanvas = null;
	this.canvas = null;
	this.image = null;
	this.imageReady = false;
	this.context = context;
	this.domCanvas = domCanvas;
	this.canvas = domCanvas[0];
};
$RTSCTF_Utility_CanvasInformation.prototype = {
	ready: function() {
		return;
		var image = new Image();
		image.addEventListener('load', Function.mkdel(this, function(e) {
			this.image = image;
			this.imageReady = true;
		}), false);
		image.src = Type.cast(this.canvas.toDataURL(), String);
	}
};
$RTSCTF_Utility_CanvasInformation.get_blackPixel = function() {
	if (ss.isNullOrUndefined($RTSCTF_Utility_CanvasInformation.$blackPixel)) {
		var m = $RTSCTF_Utility_CanvasInformation.create$2(0, 0);
		m.context.fillStyle = 'black';
		m.context.fillRect(0, 0, 1, 1);
		$RTSCTF_Utility_CanvasInformation.$blackPixel = m.canvas;
	}
	return $RTSCTF_Utility_CanvasInformation.$blackPixel;
};
$RTSCTF_Utility_CanvasInformation.create$2 = function(w, h) {
	var canvas = document.createElement('canvas');
	return $RTSCTF_Utility_CanvasInformation.create$3(canvas, w, h);
};
$RTSCTF_Utility_CanvasInformation.create$3 = function(canvas, w, h) {
	if (w === 0) {
		w = 1;
	}
	if (h === 0) {
		h = 1;
	}
	canvas.width = w;
	canvas.height = h;
	var ctx = canvas.getContext('2d');
	return new $RTSCTF_Utility_CanvasInformation(ctx, $(canvas));
};
$RTSCTF_Utility_CanvasInformation.create = function(tileImage) {
	var item = $RTSCTF_Utility_CanvasInformation.create$2(tileImage.width, tileImage.height);
	item.context.drawImage(tileImage, 0, 0);
	return item;
};
$RTSCTF_Utility_CanvasInformation.create$1 = function(imageData) {
	var item = $RTSCTF_Utility_CanvasInformation.create$2(imageData.width, imageData.height);
	item.context.putImageData(imageData, 0, 0);
	return item;
};
////////////////////////////////////////////////////////////////////////////////
// RTSCTF.Utility.DelegateOrValue
var $RTSCTF_Utility_DelegateOrValue$1 = function(T) {
	var $type = function(d) {
		this.isValue = false;
		this.$method = null;
		this.$value = T.getDefaultValue();
		this.$method = d;
		this.isValue = false;
	};
	$type.prototype = {
		$evaluate: function() {
			if (this.isValue === true) {
				return this.$value;
			}
			else if (this.isValue === false) {
				return this.$method();
			}
			return T.getDefaultValue();
		}
	};
	$type.$ctor1 = function(d) {
		this.isValue = false;
		this.$method = null;
		this.$value = T.getDefaultValue();
		this.$value = d;
		this.isValue = true;
	};
	$type.$ctor1.prototype = $type.prototype;
	$type.op_Implicit$2 = function(d) {
		return new (Type.makeGenericType($RTSCTF_Utility_DelegateOrValue$1, [T]).$ctor1)(d);
	};
	$type.op_Implicit$1 = function(d) {
		return new (Type.makeGenericType($RTSCTF_Utility_DelegateOrValue$1, [T]))(d);
	};
	$type.op_Implicit = function(d) {
		return d.$evaluate();
	};
	Type.registerGenericClassInstance($type, $RTSCTF_Utility_DelegateOrValue$1, [T], function() {
		return Object;
	}, function() {
		return [];
	});
	return $type;
};
Type.registerGenericClass(global, 'RTSCTF.Utility.DelegateOrValue$1', $RTSCTF_Utility_DelegateOrValue$1, 1);
////////////////////////////////////////////////////////////////////////////////
// RTSCTF.Utility.Dragger
var $RTSCTF_Utility_Dragger = function(onFling) {
	this.$myOnFling = null;
	this.$lag = 0.925000011920929;
	this.$lastPos = null;
	this.$xsp = 0;
	this.$ysp = 0;
	this.$myOnFling = onFling;
};
$RTSCTF_Utility_Dragger.prototype = {
	click: function(cell) {
		this.$lastPos = $RTSCTF_Utility_Point.$ctor1(cell.x, cell.y);
	},
	isDragging: function(cell) {
		return this.$lastPos;
	},
	mouseUp: function(cell) {
		this.$lastPos = null;
	},
	mouseMove: function(cell) {
		if (!this.$lastPos) {
			return;
		}
		this.$xsp += (this.$lastPos.x - cell.x) * 2.70000004768372;
		this.$ysp += (this.$lastPos.y - cell.y) * 2.70000004768372;
		this.$xsp = ((this.$xsp > 0) ? 1 : -1) * Math.min(Math.abs(this.$xsp), 60);
		this.$ysp = ((this.$ysp > 0) ? 1 : -1) * Math.min(Math.abs(this.$ysp), 60);
		this.$lastPos = $RTSCTF_Utility_Point.$ctor1(cell.x, cell.y);
	},
	tick: function() {
		if (this.$xsp === 0 && this.$ysp === 0) {
			return;
		}
		this.$myOnFling(this.$xsp, this.$ysp);
		if (this.$xsp > 0) {
			this.$xsp *= this.$lag;
		}
		else {
			this.$xsp *= this.$lag;
		}
		if (this.$ysp > 0) {
			this.$ysp *= this.$lag;
		}
		else {
			this.$ysp *= this.$lag;
		}
		if (Math.abs(this.$xsp) <= 2) {
			this.$xsp = 0;
		}
		if (Math.abs(this.$ysp) <= 2) {
			this.$ysp = 0;
		}
	}
};
////////////////////////////////////////////////////////////////////////////////
// RTSCTF.Utility.Extensions
var $RTSCTF_Utility_Extensions = function() {
};
$RTSCTF_Utility_Extensions.getSafe = function(T) {
	return function(o, x, y) {
		var m = o[x];
		if (ss.isNullOrUndefined(m)) {
			return T.getDefaultValue();
		}
		return o[x][y];
	};
};
$RTSCTF_Utility_Extensions.addEvent = function(element, eventName, listener) {
	if (!!ss.isValue(element.addEventListener)) {
		element.addEventListener(eventName, listener, false);
	}
	else {
		element.attachEvent(eventName, function() {
			listener(window.event);
		});
	}
};
$RTSCTF_Utility_Extensions.loaded = function(element) {
	return element.getAttribute('loaded') === 'true';
};
$RTSCTF_Utility_Extensions.loaded$1 = function(element, set) {
	element.setAttribute('loaded', (set ? 'true' : 'false'));
};
$RTSCTF_Utility_Extensions.loadSprite = function(src, complete) {
	var sprite1 = new Image();
	sprite1.addEventListener('load', function(e) {
		$RTSCTF_Utility_Extensions.loaded$1(sprite1, true);
		if (complete) {
			if (ss.isValue(complete)) {
				complete(sprite1);
			}
		}
	}, false);
	sprite1.src = src;
	return sprite1;
};
$RTSCTF_Utility_Extensions.takeRandom = function(T) {
	return function(items) {
		var ls = items.clone();
		ls.sort(function(a, b) {
			return ss.Int32.trunc(Math.round(Math.random()) - 0.5);
		});
		return ls;
	};
};
$RTSCTF_Utility_Extensions.withData = function(T, T2) {
	return function(item, data) {
		return new (Type.makeGenericType($RTSCTF_Utility_ExtraData$2, [T, T2]))(item, data);
	};
};
$RTSCTF_Utility_Extensions.percent$1 = function(num) {
	return num + '%';
};
$RTSCTF_Utility_Extensions.percent = function(num) {
	return num + '%';
};
////////////////////////////////////////////////////////////////////////////////
// RTSCTF.Utility.ExtraData
var $RTSCTF_Utility_ExtraData$2 = function(T, T2) {
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
	Type.registerGenericClassInstance($type, $RTSCTF_Utility_ExtraData$2, [T, T2], function() {
		return Object;
	}, function() {
		return [];
	});
	return $type;
};
Type.registerGenericClass(global, 'RTSCTF.Utility.ExtraData$2', $RTSCTF_Utility_ExtraData$2, 2);
////////////////////////////////////////////////////////////////////////////////
// RTSCTF.Utility.Help
var $RTSCTF_Utility_Help = function() {
};
$RTSCTF_Utility_Help.getColor = function(_start, _end, _percent) {
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
$RTSCTF_Utility_Help.getCursorPosition = function(ev) {
	if (!!(ev.originalEvent && ev.originalEvent.targetTouches && ev.originalEvent.targetTouches.length > 0)) {
		ev = ev.originalEvent.targetTouches[0];
	}
	return $RTSCTF_Utility_Pointer.$ctor(0, 0, ss.Nullable.unbox(Type.cast((!!ev.wheelDelta ? (ev.wheelDelta / 40) : (!!ev.detail ? -ev.detail : 0)), ss.Int32)), ev.button === 2);
};
$RTSCTF_Utility_Help.getRandomColor = function() {
	return $RTSCTF_Utility_Help.colors[ss.Int32.trunc(Math.random() * $RTSCTF_Utility_Help.colors.length)];
};
$RTSCTF_Utility_Help.isPointInIso = function(_s, _a, _b, _c) {
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
$RTSCTF_Utility_Help.log = function(_cont) {
	var console = $('#txtConsole');
	var text = console.val();
	console.val(text + _cont + '\n');
	console.scrollTop(console[0].scrollHeight - console.height());
};
////////////////////////////////////////////////////////////////////////////////
// RTSCTF.Utility.Point
var $RTSCTF_Utility_Point = function() {
};
$RTSCTF_Utility_Point.offset = function($this, windowLocation) {
	return $RTSCTF_Utility_Point.$ctor1($this.x + windowLocation.x, $this.y + windowLocation.y);
};
$RTSCTF_Utility_Point.negate = function($this, windowLocation) {
	return $RTSCTF_Utility_Point.$ctor1($this.x - windowLocation.x, $this.y - windowLocation.y);
};
$RTSCTF_Utility_Point.negate$1 = function($this, x, y) {
	return $RTSCTF_Utility_Point.$ctor1($this.x - x, $this.y - y);
};
$RTSCTF_Utility_Point.set = function($this, x, y) {
	$this.x = x;
	$this.y = y;
};
$RTSCTF_Utility_Point.add = function($this, scaleFactor) {
	$this.x += scaleFactor.x;
	$this.y += scaleFactor.y;
	return $this;
};
$RTSCTF_Utility_Point.add$1 = function($this, scaleFactor) {
	$this.x += ss.Int32.trunc(scaleFactor);
	$this.y += ss.Int32.trunc(scaleFactor);
	return $this;
};
$RTSCTF_Utility_Point.clone = function($this) {
	return $RTSCTF_Utility_Point.$ctor1($this.x, $this.y);
};
$RTSCTF_Utility_Point.normalize = function($this, scale) {
	var norm = Math.sqrt($this.x * $this.x + $this.y * $this.y);
	if (norm !== 0) {
		$this.x = ss.Int32.trunc(scale * $this.x / norm);
		$this.y = ss.Int32.trunc(scale * $this.y / norm);
	}
	return $this;
};
$RTSCTF_Utility_Point.$ctor1 = function(x, y) {
	var $this = {};
	$this.x = 0;
	$this.y = 0;
	$this.x = x;
	$this.y = y;
	return $this;
};
$RTSCTF_Utility_Point.$ctor = function(pos) {
	var $this = {};
	$this.x = 0;
	$this.y = 0;
	$this.x = pos.x;
	$this.y = pos.y;
	return $this;
};
////////////////////////////////////////////////////////////////////////////////
// RTSCTF.Utility.Pointer
var $RTSCTF_Utility_Pointer = function() {
};
$RTSCTF_Utility_Pointer.getPointer = function(ev) {
	if (!!(ev.originalEvent && ev.originalEvent.targetTouches && ev.originalEvent.targetTouches.length > 0)) {
		ev = ev.originalEvent.targetTouches[0];
	}
	if (!!(ss.isValue(ev.pageX) && ss.isValue(ev.pageY))) {
		return $RTSCTF_Utility_Pointer.$ctor(ev.pageX, ev.pageY, 0, ev.which === 3);
	}
	//if (ev.x != null && ev.y != null) return new { x: ev.x, y: ev.y };
	return $RTSCTF_Utility_Pointer.$ctor(ev.clientX, ev.clientY, 0, ev.which === 3);
};
$RTSCTF_Utility_Pointer.clonePointer = function($this) {
	return $RTSCTF_Utility_Pointer.$ctor($this.x, $this.y, $this.wheelDelta, $this.right);
};
$RTSCTF_Utility_Pointer.$ctor = function(x, y, delta, right) {
	var $this = $RTSCTF_Utility_Point.$ctor1(x, y);
	$this.wheelDelta = 0;
	$this.right = false;
	$this.wheelDelta = delta;
	$this.right = right;
	return $this;
};
////////////////////////////////////////////////////////////////////////////////
// RTSCTF.Utility.SizeNumber
var $RTSCTF_Utility_SizeNumber = function(s) {
	this.$value = null;
	this.$value = s.toString();
};
$RTSCTF_Utility_SizeNumber.$ctor1 = function(s) {
	this.$value = null;
	this.$value = s;
};
$RTSCTF_Utility_SizeNumber.$ctor1.prototype = $RTSCTF_Utility_SizeNumber.prototype;
$RTSCTF_Utility_SizeNumber.op_Implicit$3 = function(d) {
	return new $RTSCTF_Utility_SizeNumber.$ctor1(d);
};
$RTSCTF_Utility_SizeNumber.op_Implicit$2 = function(d) {
	return new $RTSCTF_Utility_SizeNumber(d);
};
$RTSCTF_Utility_SizeNumber.op_Implicit$1 = function(d) {
	return d.$value;
};
$RTSCTF_Utility_SizeNumber.op_Implicit = function(d) {
	return parseFloat(d.$value.replaceAll('%', ''));
};
////////////////////////////////////////////////////////////////////////////////
// RTSCTF.Utility.UIManager.Button
var $RTSCTF_Utility_UIManager_Button = function(x, y, width, height, text) {
	this.font = null;
	this.toggle = false;
	this.toggled = false;
	this.clicking = false;
	this.button2Grad = null;
	this.button1Grad = null;
	this.buttonBorderGrad = null;
	this.text = null;
	this.color = null;
	$RTSCTF_Utility_UIManager_Element.call(this, x, y);
	this.text = text;
	this.toggle = false;
	this.toggled = false;
	this.font = $RTSCTF_Utility_UIManager_UIManager.buttonFont;
	this.clicking = false;
	this.button1Grad = null;
	this.button2Grad = null;
	this.buttonBorderGrad = null;
	this.width = width;
	this.height = height;
};
$RTSCTF_Utility_UIManager_Button.prototype = {
	construct: function() {
		$RTSCTF_Utility_UIManager_Element.prototype.construct.call(this);
		var canv = $RTSCTF_Utility_CanvasInformation.create$2(1, 1).context;
		this.button1Grad = canv.createLinearGradient(0, 0, 0, 1);
		this.button1Grad.addColorStop(0, '#FFFFFF');
		this.button1Grad.addColorStop(1, '#A5A5A5');
		this.button2Grad = canv.createLinearGradient(0, 0, 0, 1);
		this.button2Grad.addColorStop(0, '#A5A5A5');
		this.button2Grad.addColorStop(1, '#FFFFFF');
		this.buttonBorderGrad = canv.createLinearGradient(0, 0, 0, 1);
		this.buttonBorderGrad.addColorStop(0, '#AFAFAF');
		this.buttonBorderGrad.addColorStop(1, '#7a7a7a');
	},
	onClick: function(e) {
		if (!this.visible) {
			return false;
		}
		this.clicking = true;
		if (this.toggle) {
			this.toggled = !this.toggled;
		}
		return $RTSCTF_Utility_UIManager_Element.prototype.onClick.call(this, e);
	},
	onMouseUp: function(e) {
		if (!this.visible) {
			return false;
		}
		if (this.clicking) {
			if (ss.isValue(this.click)) {
				this.click($RTSCTF_Utility_Point.$ctor1(e.x, e.y));
			}
		}
		this.clicking = false;
		if (ss.isValue(this.mouseUp)) {
			this.mouseUp($RTSCTF_Utility_Point.$ctor1(e.x, e.y));
		}
		return $RTSCTF_Utility_UIManager_Element.prototype.onMouseUp.call(this, e);
	},
	onMouseOver: function(e) {
		if (!this.visible) {
			return false;
		}
		if (ss.isValue(this.mouseOver)) {
			this.mouseOver($RTSCTF_Utility_Point.$ctor1(e.x, e.y));
		}
		return $RTSCTF_Utility_UIManager_Element.prototype.onMouseOver.call(this, e);
	},
	draw: function(canv) {
		if (!this.visible) {
			return;
		}
		canv.save();
		canv.strokeStyle = this.buttonBorderGrad;
		if (this.toggle) {
			canv.fillStyle = (this.toggled ? this.button1Grad : this.button2Grad);
		}
		else {
			canv.fillStyle = (this.clicking ? this.button1Grad : this.button2Grad);
		}
		canv.lineWidth = 2;
		$RTSCTF_Utility_UIManager_CHelp.roundRect(canv, this.get_totalX(), this.get_totalY(), this.width, this.height, 2, true, true);
		if (!ss.referenceEquals(canv.font, this.font)) {
			canv.font = this.font;
		}
		canv.fillStyle = '#000000';
		var txt = Type.makeGenericType($RTSCTF_Utility_DelegateOrValue$1, [String]).op_Implicit(this.text);
		canv.fillText(txt, this.get_totalX() + (ss.Int32.div(this.width, 2) - canv.measureText(txt).width / 2), this.get_totalY() + ss.Int32.div(this.height, 3) * 2);
		canv.restore();
	}
};
////////////////////////////////////////////////////////////////////////////////
// RTSCTF.Utility.UIManager.Button
var $RTSCTF_Utility_UIManager_Button$1 = function(T) {
	var $type = function(data, x, y, width, height, text) {
		this.data = T.getDefaultValue();
		$RTSCTF_Utility_UIManager_Button.call(this, x, y, width, height, text);
		this.data = data;
	};
	Type.registerGenericClassInstance($type, $RTSCTF_Utility_UIManager_Button$1, [T], function() {
		return $RTSCTF_Utility_UIManager_Button;
	}, function() {
		return [];
	});
	return $type;
};
Type.registerGenericClass(global, 'RTSCTF.Utility.UIManager.Button$1', $RTSCTF_Utility_UIManager_Button$1, 1);
////////////////////////////////////////////////////////////////////////////////
// RTSCTF.Utility.UIManager.CHelp
var $RTSCTF_Utility_UIManager_CHelp = function() {
};
$RTSCTF_Utility_UIManager_CHelp.roundRect = function(ctx, x, y, width, height, radius, fill, stroke) {
	ctx.save();
	ctx.lineWidth = 3;
	ctx.beginPath();
	ctx.moveTo(x + radius, y);
	ctx.lineTo(x + width, y);
	//ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
	ctx.lineTo(x + width, y + height);
	// ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
	ctx.lineTo(x, y + height);
	// ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
	ctx.lineTo(x, y + radius);
	ctx.quadraticCurveTo(x, y, x + radius, y);
	ctx.closePath();
	if (stroke) {
		ctx.stroke();
	}
	if (fill) {
		ctx.fill();
	}
	ctx.restore();
};
$RTSCTF_Utility_UIManager_CHelp.getCursorPosition = function(ev) {
	if (!!(ev.originalEvent && ev.originalEvent.targetTouches && ev.originalEvent.targetTouches.length > 0)) {
		ev = ev.originalEvent.targetTouches[0];
	}
	if (!!(ss.isValue(ev.pageX) && ss.isValue(ev.pageY))) {
		return $RTSCTF_Utility_Pointer.$ctor(ev.pageX, ev.pageY, 0, ev.which === 3);
	}
	//if (ev.x != null && ev.y != null) return new { x: ev.x, y: ev.y };
	return $RTSCTF_Utility_Pointer.$ctor(ev.clientX, ev.clientY, 0, ev.which === 3);
};
$RTSCTF_Utility_UIManager_CHelp.loadImageFromUrl = function(tileMapFile, loaded) {
	var element = new Image();
	element.crossOrigin = 'anonymous';
	//FFFFUUUUU CORS!
	element.addEventListener('load', function(e) {
		loaded(element);
	}, false);
	element.src = tileMapFile;
};
////////////////////////////////////////////////////////////////////////////////
// RTSCTF.Utility.UIManager.EditorEngine
var $RTSCTF_Utility_UIManager_EditorEngine = function(el) {
	this.$points = null;
	this.editing = false;
	this.element = null;
	this.dragging = false;
	this.startDragging = null;
	this.dragg = null;
	this.element = el;
	this.$points = [$RTSCTF_Utility_UIManager_EditorEnginePoint.$ctor(0, 0, 10, 'nw-resize', Function.mkdel(this, function(dv) {
		var x = dv.x;
		var y = dv.y;
		this.element.width += x;
		this.element.height += y;
		this.element.x -= x;
		this.element.y -= y;
		this.element.clearCache();
	})), $RTSCTF_Utility_UIManager_EditorEnginePoint.$ctor(100, 0, 10, 'ne-resize', Function.mkdel(this, function(dv1) {
		var x1 = dv1.x;
		var y1 = dv1.y;
		this.element.width -= x1;
		this.element.height += y1;
		this.element.y -= y1;
		this.element.clearCache();
		dv1.x = 0;
	})), $RTSCTF_Utility_UIManager_EditorEnginePoint.$ctor(100, 100, 10, 'se-resize', Function.mkdel(this, function(dv2) {
		var x2 = dv2.x;
		var y2 = dv2.y;
		this.element.width -= x2;
		this.element.height -= y2;
		this.element.clearCache();
		dv2.x = dv2.y = 0;
	})), $RTSCTF_Utility_UIManager_EditorEnginePoint.$ctor(0, 100, 10, 'sw-resize', Function.mkdel(this, function(dv3) {
		var x3 = dv3.x;
		var y3 = dv3.y;
		this.element.width += x3;
		this.element.height -= y3;
		this.element.x -= x3;
		this.element.clearCache();
		dv3.y = 0;
	})), $RTSCTF_Utility_UIManager_EditorEnginePoint.$ctor(50, 0, 5, 'n-resize', Function.mkdel(this, function(dv4) {
		var x4 = dv4.x;
		var y4 = dv4.y;
		this.element.height += y4;
		this.element.y -= x4;
		this.element.clearCache();
	})), $RTSCTF_Utility_UIManager_EditorEnginePoint.$ctor(100, 50, 5, 'e-resize', Function.mkdel(this, function(dv5) {
		var x5 = dv5.x;
		var y5 = dv5.y;
		this.element.width -= y5;
		this.element.clearCache();
		dv5.x = dv5.y = 0;
	})), $RTSCTF_Utility_UIManager_EditorEnginePoint.$ctor(50, 100, 5, 'n-resize', Function.mkdel(this, function(dv6) {
		var x6 = dv6.x;
		var y6 = dv6.y;
		this.element.height -= y6;
		this.element.clearCache();
		dv6.x = dv6.y = 0;
	})), $RTSCTF_Utility_UIManager_EditorEnginePoint.$ctor(0, 50, 5, 'e-resize', Function.mkdel(this, function(dv7) {
		var x7 = dv7.x;
		var y7 = dv7.y;
		this.element.width += x7;
		this.element.x -= x7;
		this.element.clearCache();
	}))];
};
$RTSCTF_Utility_UIManager_EditorEngine.prototype = {
	click: function(e) {
		var x = 0;
		var y = 0;
		var w = this.element.width;
		var h = this.element.height;
		//uiManager.propertyList.populate(this.Element);
		for (var $t1 = 0; $t1 < this.$points.length; $t1++) {
			var j = this.$points[$t1];
			j.editing = false;
		}
		for (var $t2 = 0; $t2 < this.$points.length; $t2++) {
			var j1 = this.$points[$t2];
			var sz = j1.size * 5;
			var rect = $RTSCTF_Rectangle.$ctor1(x + ss.Int32.div(w * j1.x, 100) - ss.Int32.div(sz, 2), y + ss.Int32.div(h * j1.y, 100) - ss.Int32.div(sz, 2), sz, sz);
			if (e.x > rect.x && e.x < rect.x + rect.width && e.y > rect.y && e.y < rect.y + rect.height) {
				document.body.style.cursor = j1.cursor;
				this.startDragging = $RTSCTF_Utility_Point.$ctor1(e.x, e.y);
				this.editing = true;
				j1.editing = true;
				return true;
			}
		}
		if (e.x > x && e.x < x + w && e.y > y && e.y < y + h) {
			this.dragg = $RTSCTF_Utility_Point.$ctor1(e.x, e.y);
			document.body.style.cursor = 'move';
			this.dragging = true;
			return false;
		}
		else {
			document.body.style.cursor = 'default';
		}
		return false;
	},
	mouseUp: function(e) {
		for (var $t1 = 0; $t1 < this.$points.length; $t1++) {
			var j = this.$points[$t1];
			j.editing = false;
		}
		this.editing = false;
		this.dragging = false;
		this.startDragging = null;
		this.dragg = null;
		return false;
	},
	mouseOver: function(e) {
		var x = 0;
		var y = 0;
		var w = this.element.width;
		var h = this.element.height;
		document.body.style.cursor = 'move';
		if (this.dragging) {
			//
			//                if (this.Element.ChildrenAreEditing())
			//
			//                {
			//
			//                return false;
			//
			//                }
			var jx = e.x - this.dragg.x;
			var jy = e.y - this.dragg.y;
			this.element.x += jx;
			this.element.y += jy;
			//   window.DEBUGLABELS[0] = "E: " + e.X + " " + e.Y;
			//   window.DEBUGLABELS[1] = "Dragg: " + this.dragg.X + " " + this.dragg.Y;
			//   window.DEBUGLABELS[2] = "Element: " + this.Element.X + " " + this.Element.Y;
			//   window.DEBUGLABELS[3] = "Offset: " + jx + " " + jy;
			//this.dragg.x += jx;
			//this.dragg.y += jy;
			return false;
		}
		for (var $t1 = 0; $t1 < this.$points.length; $t1++) {
			var j = this.$points[$t1];
			var sz = j.size * 5;
			if (j.editing) {
				document.body.style.cursor = j.cursor;
				var dv = $RTSCTF_Utility_Point.$ctor1(this.startDragging.x - e.x, this.startDragging.y - e.y);
				j.click(dv);
				this.startDragging = $RTSCTF_Utility_Point.$ctor1(e.x + dv.x, e.y + dv.y);
				return true;
			}
			var rect = $RTSCTF_Rectangle.$ctor1(x + ss.Int32.div(w * j.x, 100) - ss.Int32.div(sz, 2), y + ss.Int32.div(h * j.y, 100) - ss.Int32.div(sz, 2), sz, sz);
			if (e.x > rect.x && e.x < rect.x + rect.width && e.y > rect.y && e.y < rect.y + rect.height) {
				document.body.style.cursor = j.cursor;
				if (j.editing) {
					var dv1 = $RTSCTF_Utility_Point.$ctor1(this.startDragging.x - e.x, this.startDragging.y - e.y);
					j.click(dv1);
					this.startDragging = $RTSCTF_Utility_Point.$ctor1(e.x + dv1.x, e.y + dv1.y);
				}
				return true;
			}
		}
		this.startDragging = $RTSCTF_Utility_Point.$ctor1(e.x, e.y);
		return this.editing;
	},
	draw: function(canv) {
		canv.save();
		var size = 0;
		canv.strokeStyle = canv.fillStyle = 'white';
		canv.lineWidth = 3;
		canv.dashedRect(this.element.get_totalX() - size, this.element.get_totalY() - size, this.element.width + size * 2, this.element.height + size * 2, [2, 2]);
		//canv.strokeRect(this.element.totalX() - size, this.element.totalY() - size, this.element.width + size * 2, this.element.height + size * 2);
		var x = this.element.get_totalX();
		var y = this.element.get_totalY();
		var w = this.element.width;
		var h = this.element.height;
		for (var $t1 = 0; $t1 < this.$points.length; $t1++) {
			var j = this.$points[$t1];
			canv.fillRect(x + ss.Int32.div(w * j.x, 100) - ss.Int32.div(j.size, 2), y + ss.Int32.div(h * j.y, 100) - ss.Int32.div(j.size, 2), j.size, j.size);
		}
		canv.restore();
	},
	maxSize: function() {
		return 10;
	}
};
////////////////////////////////////////////////////////////////////////////////
// RTSCTF.Utility.UIManager.EditorEnginePoint
var $RTSCTF_Utility_UIManager_EditorEnginePoint = function() {
};
$RTSCTF_Utility_UIManager_EditorEnginePoint.$ctor = function(x, y, size, cursor, click) {
	var $this = {};
	$this.x = 0;
	$this.y = 0;
	$this.size = 0;
	$this.cursor = null;
	$this.click = null;
	$this.editing = false;
	$this.x = x;
	$this.y = y;
	$this.size = size;
	$this.cursor = cursor;
	$this.click = click;
	return $this;
};
////////////////////////////////////////////////////////////////////////////////
// RTSCTF.Utility.UIManager.Element
var $RTSCTF_Utility_UIManager_Element = function(x, y) {
	this.cachedForceRedrawing = $RTSCTF_Utility_UIManager_Element$ForceRedrawing.$ctor();
	this.$myDepth = 0;
	this.x = 0;
	this.y = 0;
	this.width = 0;
	this.height = 0;
	this.visible = false;
	this.cachedDrawing = null;
	this.click = null;
	this.mouseUp = null;
	this.mouseOver = null;
	this.editMode = false;
	this.editorEngine = null;
	this.parent = null;
	this.focused = false;
	this.x = x;
	this.y = y;
	this.editorEngine = new $RTSCTF_Utility_UIManager_EditorEngine(this);
	this.visible = true;
	//
	//                        if (this.Construct) {
	//
	//                        this.Construct();
	//
	//                        }
};
$RTSCTF_Utility_UIManager_Element.prototype = {
	get_depth: function() {
		return this.$myDepth;
	},
	set_depth: function(value) {
		this.$myDepth = value;
		if (Type.isInstanceOfType(this, $RTSCTF_Utility_UIManager_UIArea)) {
			$RTSCTF_Utility_UIManager_UIManager.instance.updateDepth();
		}
	},
	get_totalX: function() {
		return this.x + (ss.isValue(this.parent) ? this.parent.get_totalX() : 0);
	},
	get_totalY: function() {
		return this.y + (ss.isValue(this.parent) ? this.parent.get_totalY() : 0);
	},
	construct: function() {
	},
	isEditMode: function() {
		return this.editMode || ss.isValue(this.parent) && this.parent.isEditMode();
	},
	forceDrawing: function() {
		return this.cachedForceRedrawing;
		//redraw=false,cache=false
	},
	onKeyDown: function(e) {
		return false;
	},
	focus: function(e) {
		this.focused = true;
	},
	loseFocus: function() {
		this.focused = false;
	},
	onClick: function(e) {
		if (this.isEditMode()) {
			if (this.editorEngine.click(e)) {
				return true;
			}
		}
		return false;
	},
	onMouseUp: function(e) {
		if (this.isEditMode()) {
			if (this.editorEngine.mouseUp(e)) {
				return true;
			}
		}
		return false;
	},
	onMouseOver: function(e) {
		if (this.isEditMode()) {
			if (this.editorEngine.mouseOver(e)) {
				return true;
			}
		}
		return false;
	},
	draw: function(canv) {
		if (this.isEditMode()) {
			this.editorEngine.draw(canv);
		}
	},
	clearCache: function() {
		this.cachedDrawing = null;
	},
	onScroll: function(e) {
		return false;
	}
};
////////////////////////////////////////////////////////////////////////////////
// RTSCTF.Utility.UIManager.Element.ForceRedrawing
var $RTSCTF_Utility_UIManager_Element$ForceRedrawing = function() {
};
$RTSCTF_Utility_UIManager_Element$ForceRedrawing.createInstance = function() {
	return $RTSCTF_Utility_UIManager_Element$ForceRedrawing.$ctor();
};
$RTSCTF_Utility_UIManager_Element$ForceRedrawing.$ctor = function() {
	var $this = {};
	$this.redraw = false;
	$this.clearCache = false;
	return $this;
};
////////////////////////////////////////////////////////////////////////////////
// RTSCTF.Utility.UIManager.HScrollBox
var $RTSCTF_Utility_UIManager_HScrollBox = function(x, y, itemHeight, visibleItems, itemWidth) {
	this.itemWidth = 0;
	this.scrollWidth = 0;
	this.jWidth = 0;
	this.visibleItems = 0;
	this.itemHeight = 0;
	this.backColor = null;
	this.scrollOffset = 0;
	this.scrollPosition = 0;
	this.dragging = false;
	this.controls = null;
	this.scrolling = false;
	$RTSCTF_Utility_UIManager_Element.call(this, x, y);
	this.itemWidth = itemWidth;
	this.scrollWidth = 14;
	this.jWidth = 5;
	this.visibleItems = visibleItems;
	this.itemHeight = itemHeight;
	this.controls = [];
};
$RTSCTF_Utility_UIManager_HScrollBox.prototype = {
	construct: function() {
		this.width = this.visibleItems * (this.itemWidth + this.jWidth);
		this.height = this.itemHeight + this.scrollWidth;
		this.scrolling = false;
	},
	addControl: function(control) {
		control.parent = this;
		control.construct();
		this.controls.add(control);
		return control;
	},
	onClick: function(e) {
		if (!this.visible) {
			return false;
		}
		for (var ij = this.scrollOffset; ij < this.controls.length; ij++) {
			var control = this.controls[ij];
			if (control.y <= e.y && control.y + control.height > e.y && control.x + 2 <= e.x && control.x + control.width + 2 > e.x) {
				e.x -= control.x;
				e.y -= control.y;
				control.onClick(e);
				return true;
			}
		}
		if (e.y > this.itemHeight && e.y < this.itemHeight + this.scrollWidth) {
			var width = this.visibleItems * (this.itemWidth + this.jWidth) - 2;
			this.scrollOffset = ss.Int32.div(e.x, width) * (this.controls.length - this.visibleItems);
			this.scrollOffset = Math.min(Math.max(this.scrollOffset, 0), this.controls.length);
		}
		this.dragging = true;
		return $RTSCTF_Utility_UIManager_Element.prototype.onClick.call(this, e);
	},
	onMouseUp: function(e) {
		if (!this.visible) {
			return false;
		}
		this.dragging = false;
		for (var ij = this.scrollOffset; ij < this.controls.length; ij++) {
			var control = this.controls[ij];
			if (control.y <= e.y && control.y + control.height > e.y && control.x <= e.x + 2 && control.x + control.width + 2 > e.x) {
				e.x -= control.x;
				e.y -= control.y;
				control.onMouseUp(e);
				return true;
			}
		}
		if (ss.isValue(this.mouseUp)) {
			this.mouseUp($RTSCTF_Utility_Point.$ctor1(e.x, e.y));
		}
		return $RTSCTF_Utility_UIManager_Element.prototype.onMouseUp.call(this, e);
	},
	onMouseOver: function(e) {
		if (!this.visible) {
			return false;
		}
		for (var $t1 = 0; $t1 < this.controls.length; $t1++) {
			var control = this.controls[$t1];
			if (control.y <= e.y && control.y + control.height > e.y && control.x + 2 <= e.x && control.x + control.width + 2 > e.x) {
				e.x -= control.x;
				e.y -= control.y;
				control.onMouseOver(e);
				break;
			}
		}
		if (this.dragging && e.y > this.itemHeight && e.y < this.itemHeight + this.scrollWidth) {
			var width = this.visibleItems * (this.itemWidth + this.jWidth) - 2;
			this.scrollOffset = ss.Int32.trunc(e.x / width * (this.controls.length - this.visibleItems));
			this.scrollOffset = Math.min(Math.max(this.scrollOffset, 0), this.controls.length);
		}
		if (ss.isValue(this.mouseOver)) {
			this.mouseOver($RTSCTF_Utility_Point.$ctor1(e.x, e.y));
		}
		return $RTSCTF_Utility_UIManager_Element.prototype.onMouseOver.call(this, e);
	},
	onScroll: function(e) {
		if (!this.visible) {
			return false;
		}
		if (e.wheelDelta > 0) {
			if (this.scrollOffset > 0) {
				this.scrollOffset--;
			}
		}
		else if (this.scrollOffset < this.controls.length - this.visibleItems) {
			this.scrollOffset++;
		}
		for (var $t1 = 0; $t1 < this.controls.length; $t1++) {
			var control = this.controls[$t1];
			if (control.y <= e.y && control.y + control.height > e.y && control.x <= e.x && control.x + control.width > e.x) {
				e.x -= control.x;
				e.y -= control.y;
				return true;
			}
		}
		//if (this.scroll) this.scroll();
		return true;
	},
	draw: function(canv) {
		if (!this.visible) {
			return;
		}
		canv.save();
		canv.fillStyle = this.backColor;
		var width = this.visibleItems * (this.itemWidth + this.jWidth) - 2;
		canv.fillStyle = this.backColor;
		canv.lineWidth = 1;
		canv.strokeStyle = '#333';
		$RTSCTF_Utility_UIManager_CHelp.roundRect(canv, this.get_totalX(), this.get_totalY(), this.visibleItems * (this.itemWidth + this.jWidth) + 2, this.itemHeight + this.scrollWidth + 6, 3, true, true);
		canv.fillStyle = 'grey';
		canv.lineWidth = 1;
		canv.strokeStyle = '#444';
		canv.fillRect(this.get_totalX() + 2, this.get_totalY() + this.itemHeight + 6, this.visibleItems * (this.itemWidth + this.jWidth), this.scrollWidth);
		canv.fillStyle = 'FFDDFF';
		canv.lineWidth = 1;
		canv.strokeStyle = '#FFDDFF';
		this.scrollPosition = ss.Int32.div(width * this.scrollOffset, this.controls.length - this.visibleItems);
		canv.fillRect(this.get_totalX() + this.scrollPosition + 2, this.get_totalY() + this.itemHeight + 6, 5, this.scrollWidth - 2);
		var curX = 3;
		for (var i = this.scrollOffset; i < Math.min(this.controls.length, this.scrollOffset + this.visibleItems); i++) {
			this.controls[i].parent = this;
			this.controls[i].x = curX;
			this.controls[i].y = 2;
			this.controls[i].height = this.itemHeight;
			this.controls[i].width = this.itemWidth;
			curX += this.itemWidth + this.jWidth;
			this.controls[i].draw(canv);
		}
		canv.restore();
		$RTSCTF_Utility_UIManager_Element.prototype.draw.call(this, canv);
	}
};
////////////////////////////////////////////////////////////////////////////////
// RTSCTF.Utility.UIManager.HtmlBox
var $RTSCTF_Utility_UIManager_HtmlBox = function(x, y) {
	this.$2$InitField = null;
	this.$2$UpdatePositionField = null;
	this.$2$_FocusField = null;
	this.$2$_HideField = null;
	$RTSCTF_Utility_UIManager_Element.call(this, x, y);
};
$RTSCTF_Utility_UIManager_HtmlBox.prototype = {
	get_init: function() {
		return this.$2$InitField;
	},
	set_init: function(value) {
		this.$2$InitField = value;
	},
	get_updatePosition: function() {
		return this.$2$UpdatePositionField;
	},
	set_updatePosition: function(value) {
		this.$2$UpdatePositionField = value;
	},
	get__Focus: function() {
		return this.$2$_FocusField;
	},
	set__Focus: function(value) {
		this.$2$_FocusField = value;
	},
	get__Hide: function() {
		return this.$2$_HideField;
	},
	set__Hide: function(value) {
		this.$2$_HideField = value;
	},
	construct: function() {
		this.get_init()();
		$RTSCTF_Utility_UIManager_Element.prototype.construct.call(this);
	},
	focus: function(e) {
		this.get__Focus()();
		$RTSCTF_Utility_UIManager_Element.prototype.focus.call(this, e);
	},
	loseFocus: function() {
		this.get__Hide()();
		$RTSCTF_Utility_UIManager_Element.prototype.loseFocus.call(this);
	},
	onClick: function(e) {
		return false;
	},
	onMouseUp: function(e) {
		if (ss.isValue(this.mouseUp)) {
			this.mouseUp($RTSCTF_Utility_Point.$ctor1(e.x, e.y));
		}
		return $RTSCTF_Utility_UIManager_Element.prototype.onMouseUp.call(this, e);
	},
	onMouseOver: function(e) {
		if (ss.isValue(this.mouseOver)) {
			this.mouseOver($RTSCTF_Utility_Point.$ctor1(e.x, e.y));
		}
		return $RTSCTF_Utility_UIManager_Element.prototype.onMouseOver.call(this, e);
	},
	draw: function(canv) {
		if (!this.visible) {
			return;
		}
		this.get_updatePosition()(this.get_totalX(), this.get_totalY());
		$RTSCTF_Utility_UIManager_Element.prototype.draw.call(this, canv);
	}
};
////////////////////////////////////////////////////////////////////////////////
// RTSCTF.Utility.UIManager.Image
var $RTSCTF_Utility_UIManager_Image = function(x, y, width, height) {
	this.onDraw = null;
	$RTSCTF_Utility_UIManager_Element.call(this, x, y);
	this.onDraw = null;
	this.width = width;
	this.height = height;
};
$RTSCTF_Utility_UIManager_Image.prototype = {
	construct: function() {
		$RTSCTF_Utility_UIManager_Element.prototype.construct.call(this);
	},
	onClick: function(e) {
		if (!this.visible) {
			return false;
		}
		if (ss.isValue(this.click)) {
			this.click(e);
		}
		return $RTSCTF_Utility_UIManager_Element.prototype.onClick.call(this, e);
	},
	onMouseUp: function(e) {
		if (!this.visible) {
			return false;
		}
		return $RTSCTF_Utility_UIManager_Element.prototype.onMouseUp.call(this, e);
	},
	onMouseOver: function(e) {
		if (!this.visible) {
			return false;
		}
		return $RTSCTF_Utility_UIManager_Element.prototype.onMouseOver.call(this, e);
	},
	draw: function(canv) {
		if (!this.visible) {
			return;
		}
		canv.save();
		canv.lineWidth = 2;
		$RTSCTF_Utility_UIManager_CHelp.roundRect(canv, this.get_totalX(), this.get_totalY(), this.width, this.height, 2, true, true);
		canv.fillStyle = '#000000';
		this.onDraw(canv, this.get_totalX(), this.get_totalY());
		canv.restore();
	}
};
////////////////////////////////////////////////////////////////////////////////
// RTSCTF.Utility.UIManager.Image
var $RTSCTF_Utility_UIManager_Image$1 = function(T) {
	var $type = function(data, x, y, width, height) {
		this.data = T.getDefaultValue();
		$RTSCTF_Utility_UIManager_Image.call(this, x, y, width, height);
		this.data = data;
	};
	Type.registerGenericClassInstance($type, $RTSCTF_Utility_UIManager_Image$1, [T], function() {
		return $RTSCTF_Utility_UIManager_Image;
	}, function() {
		return [];
	});
	return $type;
};
Type.registerGenericClass(global, 'RTSCTF.Utility.UIManager.Image$1', $RTSCTF_Utility_UIManager_Image$1, 1);
////////////////////////////////////////////////////////////////////////////////
// RTSCTF.Utility.UIManager.ImageButton
var $RTSCTF_Utility_UIManager_ImageButton = function(x, y, width, height) {
	this.font = null;
	this.toggle = false;
	this.toggled = false;
	this.clicking = false;
	this.button2Grad = null;
	this.onDraw = null;
	this.button1Grad = null;
	this.buttonBorderGrad = null;
	this.text = null;
	this.color = null;
	$RTSCTF_Utility_UIManager_Element.call(this, x, y);
	this.text = Type.makeGenericType($RTSCTF_Utility_DelegateOrValue$1, [String]).op_Implicit$2('');
	this.toggle = false;
	this.toggled = false;
	this.font = '';
	this.clicking = false;
	this.onDraw = null;
	this.button1Grad = null;
	this.button2Grad = null;
	this.buttonBorderGrad = null;
	this.width = width;
	this.height = height;
};
$RTSCTF_Utility_UIManager_ImageButton.prototype = {
	construct: function() {
		$RTSCTF_Utility_UIManager_Element.prototype.construct.call(this);
		var canv = $RTSCTF_Utility_CanvasInformation.create$2(1, 1).context;
		this.button1Grad = canv.createLinearGradient(0, 0, 0, 1);
		this.button1Grad.addColorStop(0, '#FFFFFF');
		this.button1Grad.addColorStop(1, '#A5A5A5');
		this.button2Grad = canv.createLinearGradient(0, 0, 0, 1);
		this.button2Grad.addColorStop(0, '#A5A5A5');
		this.button2Grad.addColorStop(1, '#FFFFFF');
		this.buttonBorderGrad = canv.createLinearGradient(0, 0, 0, 1);
		this.buttonBorderGrad.addColorStop(0, '#AFAFAF');
		this.buttonBorderGrad.addColorStop(1, '#7a7a7a');
	},
	onClick: function(e) {
		if (!this.visible) {
			return false;
		}
		this.clicking = true;
		if (this.toggle) {
			this.toggled = !this.toggled;
		}
		return $RTSCTF_Utility_UIManager_Element.prototype.onClick.call(this, e);
	},
	onMouseUp: function(e) {
		if (!this.visible) {
			return false;
		}
		if (this.clicking) {
			if (ss.isValue(this.click)) {
				this.click($RTSCTF_Utility_Point.$ctor1(e.x, e.y));
			}
		}
		this.clicking = false;
		if (ss.isValue(this.mouseUp)) {
			this.mouseUp($RTSCTF_Utility_Point.$ctor1(e.x, e.y));
		}
		return $RTSCTF_Utility_UIManager_Element.prototype.onMouseUp.call(this, e);
	},
	onMouseOver: function(e) {
		if (!this.visible) {
			return false;
		}
		if (ss.isValue(this.mouseOver)) {
			this.mouseOver($RTSCTF_Utility_Point.$ctor1(e.x, e.y));
		}
		return $RTSCTF_Utility_UIManager_Element.prototype.onMouseOver.call(this, e);
	},
	draw: function(canv) {
		if (!this.visible) {
			return;
		}
		canv.save();
		canv.strokeStyle = this.buttonBorderGrad;
		if (this.toggle) {
			canv.fillStyle = (this.toggled ? this.button1Grad : this.button2Grad);
		}
		else {
			canv.fillStyle = (this.clicking ? this.button1Grad : this.button2Grad);
		}
		canv.lineWidth = 2;
		$RTSCTF_Utility_UIManager_CHelp.roundRect(canv, this.get_totalX(), this.get_totalY(), this.width, this.height, 2, true, true);
		if (!ss.referenceEquals(canv.font, this.font)) {
			canv.font = this.font;
		}
		canv.fillStyle = '#000000';
		var txt = Type.makeGenericType($RTSCTF_Utility_DelegateOrValue$1, [String]).op_Implicit(this.text);
		canv.save();
		this.onDraw(canv, this.get_totalX(), this.get_totalY());
		canv.restore();
		canv.fillText(txt, this.get_totalX() + (ss.Int32.div(this.width, 2) - canv.measureText(txt).width / 2), this.get_totalY() + this.height - 3);
		canv.restore();
	}
};
////////////////////////////////////////////////////////////////////////////////
// RTSCTF.Utility.UIManager.ImageButton
var $RTSCTF_Utility_UIManager_ImageButton$1 = function(T) {
	var $type = function(data, x, y, width, height) {
		this.data = T.getDefaultValue();
		$RTSCTF_Utility_UIManager_ImageButton.call(this, x, y, width, height);
		this.data = data;
	};
	Type.registerGenericClassInstance($type, $RTSCTF_Utility_UIManager_ImageButton$1, [T], function() {
		return $RTSCTF_Utility_UIManager_ImageButton;
	}, function() {
		return [];
	});
	return $type;
};
Type.registerGenericClass(global, 'RTSCTF.Utility.UIManager.ImageButton$1', $RTSCTF_Utility_UIManager_ImageButton$1, 1);
////////////////////////////////////////////////////////////////////////////////
// RTSCTF.Utility.UIManager.Panel
var $RTSCTF_Utility_UIManager_Panel = function(x, y, width, height) {
	this.controls = null;
	this.outline = false;
	$RTSCTF_Utility_UIManager_Element.call(this, x, y);
	this.outline = true;
	this.width = width;
	this.height = height;
	this.controls = [];
};
$RTSCTF_Utility_UIManager_Panel.prototype = {
	clear: function() {
		this.controls.clear();
	},
	childrenAreEditing: function() {
		var ch = this.controls;
		for (var $t1 = 0; $t1 < ch.length; $t1++) {
			var t = ch[$t1];
			if (t.editorEngine.dragging || t.editorEngine.editing) {
				return true;
			}
			if (Type.isInstanceOfType(t, $RTSCTF_Utility_UIManager_Panel) && Type.cast(t, $RTSCTF_Utility_UIManager_Panel).childrenAreEditing()) {
				return true;
			}
		}
		return false;
	},
	focus: function(e) {
		var e2 = $RTSCTF_Utility_Pointer.$ctor(0, 0, 0, false);
		var ch = this.controls;
		for (var $t1 = 0; $t1 < ch.length; $t1++) {
			var t = ch[$t1];
			if (t.visible && t.y <= e.y && t.y + t.height > e.y && t.x <= e.x && t.x + t.width > e.x) {
				e2.x = e.x - t.x;
				e2.y = e.y - t.y;
				t.focus(e2);
			}
		}
		$RTSCTF_Utility_UIManager_Element.prototype.focus.call(this, e);
	},
	loseFocus: function() {
		var ch = this.controls;
		for (var $t1 = 0; $t1 < ch.length; $t1++) {
			var t = ch[$t1];
			t.loseFocus();
		}
		$RTSCTF_Utility_UIManager_Element.prototype.loseFocus.call(this);
	},
	construct: function() {
		$RTSCTF_Utility_UIManager_Element.prototype.construct.call(this);
		for (var $t1 = 0; $t1 < this.controls.length; $t1++) {
			var element = this.controls[$t1];
			element.construct();
		}
	},
	onKeyDown: function(e) {
		$RTSCTF_Utility_UIManager_Element.prototype.onKeyDown.call(this, e);
		if (!this.visible) {
			return false;
		}
		var ch = this.controls;
		for (var $t1 = 0; $t1 < ch.length; $t1++) {
			var t = ch[$t1];
			if (t.onKeyDown(e)) {
				return true;
			}
		}
		return false;
	},
	onClick: function(e) {
		var e2 = $RTSCTF_Utility_Pointer.$ctor(0, 0, 0, false);
		if (!this.visible) {
			return false;
		}
		var clicked = false;
		var ch = this.controls;
		for (var $t1 = 0; $t1 < ch.length; $t1++) {
			var control = ch[$t1];
			if (control.visible && control.y <= e.y && control.y + control.height > e.y && control.x <= e.x && control.x + control.width > e.x) {
				e2.x = e.x - control.x;
				e2.y = e.y - control.y;
				control.focus(e2);
				control.onClick(e2);
				clicked = true;
			}
			else {
				control.loseFocus();
			}
		}
		if (!clicked && !this.isEditMode() && Type.isInstanceOfType(this, $RTSCTF_Utility_UIManager_UIArea)) {
			Type.cast(this, $RTSCTF_Utility_UIManager_UIArea).dragging = $RTSCTF_Utility_Point.$ctor1(e.x, e.y);
		}
		return clicked;
	},
	onMouseOver: function(e) {
		if (!this.visible) {
			return false;
		}
		var dragging = null;
		var uiArea = Type.safeCast(this, $RTSCTF_Utility_UIManager_UIArea);
		if (ss.isValue(uiArea)) {
			dragging = uiArea.dragging;
		}
		if (ss.isNullOrUndefined(dragging)) {
			for (var $t1 = 0; $t1 < this.controls.length; $t1++) {
				var control = this.controls[$t1];
				if (control.visible && (control.editorEngine.editing || control.y <= e.y && control.y + control.height > e.y && control.x <= e.x && control.x + control.width > e.x)) {
					e.x -= control.x;
					e.y -= control.y;
					control.onMouseOver(e);
					return true;
				}
			}
			return true;
		}
		this.x += e.x - dragging.x;
		this.y += e.y - dragging.y;
		//this.onMove(); 
		return $RTSCTF_Utility_UIManager_Element.prototype.onMouseOver.call(this, e);
	},
	onMouseUp: function(e) {
		if (!this.visible) {
			return false;
		}
		for (var $t1 = 0; $t1 < this.controls.length; $t1++) {
			var control = this.controls[$t1];
			control.onMouseUp($RTSCTF_Utility_Pointer.$ctor(e.x - control.x, e.y - control.y, 0, false));
		}
		var uiArea = Type.safeCast(this, $RTSCTF_Utility_UIManager_UIArea);
		if (ss.isValue(uiArea)) {
			uiArea.dragging = null;
		}
		return $RTSCTF_Utility_UIManager_Element.prototype.onMouseUp.call(this, e);
	},
	onScroll: function(e) {
		if (!this.visible) {
			return false;
		}
		for (var $t1 = 0; $t1 < this.controls.length; $t1++) {
			var control = this.controls[$t1];
			if (control.visible && (control.editorEngine.editing || control.y <= e.y && control.y + control.height > e.y && control.x <= e.x && control.x + control.width > e.x)) {
				e.x -= control.x;
				e.y -= control.y;
				return control.onScroll(e);
			}
		}
		return $RTSCTF_Utility_UIManager_Element.prototype.onScroll.call(this, e);
	},
	draw: function(canv) {
		if (!this.visible) {
			return;
		}
		var _x = this.x;
		var _y = this.y;
		canv.save();
		if (this.outline) {
			var lingrad = canv.createLinearGradient(0, 0, 0, this.height);
			lingrad.addColorStop(0, 'rgba(220,220,220,0.85)');
			lingrad.addColorStop(1, 'rgba(142,142,142,0.85)');
			canv.fillStyle = lingrad;
			canv.strokeStyle = '#333';
			var rad = 5;
			$RTSCTF_Utility_UIManager_CHelp.roundRect(canv, this.get_totalX(), this.get_totalY(), this.width, this.height, rad, true, true);
		}
		for (var $t1 = 0; $t1 < this.controls.length; $t1++) {
			var t = this.controls[$t1];
			t.draw(canv);
		}
		this.x = _x;
		this.y = _y;
		canv.restore();
		$RTSCTF_Utility_UIManager_Element.prototype.draw.call(this, canv);
	},
	addControl: function(T) {
		return function(element) {
			element.parent = this;
			element.construct();
			this.controls.add(element);
			return element;
		};
	}
};
////////////////////////////////////////////////////////////////////////////////
// RTSCTF.Utility.UIManager.Panel
var $RTSCTF_Utility_UIManager_Panel$1 = function(T) {
	var $type = function(data, x, y, width, height) {
		this.data = T.getDefaultValue();
		$RTSCTF_Utility_UIManager_Panel.call(this, x, y, width, height);
		this.data = data;
	};
	Type.registerGenericClassInstance($type, $RTSCTF_Utility_UIManager_Panel$1, [T], function() {
		return $RTSCTF_Utility_UIManager_Panel;
	}, function() {
		return [];
	});
	return $type;
};
Type.registerGenericClass(global, 'RTSCTF.Utility.UIManager.Panel$1', $RTSCTF_Utility_UIManager_Panel$1, 1);
////////////////////////////////////////////////////////////////////////////////
// RTSCTF.Utility.UIManager.PropertyButton
var $RTSCTF_Utility_UIManager_PropertyButton = function(x, y) {
	$RTSCTF_Utility_UIManager_Element.call(this, x, y);
};
$RTSCTF_Utility_UIManager_PropertyButton.prototype = {
	construct: function() {
		$RTSCTF_Utility_UIManager_Element.prototype.construct.call(this);
	}
};
////////////////////////////////////////////////////////////////////////////////
// RTSCTF.Utility.UIManager.ScrollBox
var $RTSCTF_Utility_UIManager_ScrollBox = function(x, y, itemHeight, visibleItems, itemWidth) {
	this.itemWidth = 0;
	this.scrollWidth = 0;
	this.jHeight = 0;
	this.visibleItems = 0;
	this.itemHeight = 0;
	this.backColor = null;
	this.scrollIndex = 0;
	this.scrollPosition = 0;
	this.dragging = false;
	this.controls = null;
	this.scrolling = false;
	$RTSCTF_Utility_UIManager_Element.call(this, x, y);
	this.itemWidth = itemWidth;
	this.scrollWidth = 14;
	this.visibleItems = visibleItems;
	this.itemHeight = itemHeight;
	this.backColor = '';
	this.jHeight = 5;
	this.controls = [];
};
$RTSCTF_Utility_UIManager_ScrollBox.prototype = {
	construct: function() {
		this.height = this.visibleItems * (this.itemHeight + this.jHeight);
		this.width = this.itemWidth + this.scrollWidth;
		this.scrolling = false;
	},
	addControl: function(T) {
		return function(control) {
			control.parent = this;
			control.construct();
			this.controls.add(control);
			return control;
		};
	},
	onClick: function(e) {
		if (!this.visible) {
			return false;
		}
		for (var ij = this.scrollIndex; ij < this.controls.length; ij++) {
			var control = this.controls[ij];
			if (control.y <= e.y && control.y + control.height > e.y && control.x + 2 <= e.x && control.x + control.width + 2 > e.x) {
				e.x -= control.x;
				e.y -= control.y;
				control.onClick(e);
				return true;
			}
		}
		if (e.x > this.itemWidth && e.x < this.itemWidth + this.scrollWidth) {
			var height = this.visibleItems * (this.itemHeight + this.jHeight) - 2;
			this.scrollIndex = ss.Int32.div(e.y, height) * (this.controls.length - this.visibleItems);
			this.scrollIndex = Math.min(Math.max(this.scrollIndex, 0), this.controls.length);
		}
		this.dragging = true;
		return $RTSCTF_Utility_UIManager_Element.prototype.onClick.call(this, e);
	},
	onMouseUp: function(e) {
		if (!this.visible) {
			return false;
		}
		this.dragging = false;
		for (var ij = this.scrollIndex; ij < this.controls.length; ij++) {
			var control = this.controls[ij];
			if (control.y <= e.y && control.y + control.height > e.y && control.x <= e.x + 2 && control.x + control.width + 2 > e.x) {
				e.x -= control.x;
				e.y -= control.y;
				control.onMouseUp(e);
				return true;
			}
		}
		if (ss.isValue(this.mouseUp)) {
			this.mouseUp($RTSCTF_Utility_Point.$ctor1(e.x, e.y));
		}
		return $RTSCTF_Utility_UIManager_Element.prototype.onMouseUp.call(this, e);
	},
	onMouseOver: function(e) {
		if (!this.visible) {
			return false;
		}
		for (var $t1 = 0; $t1 < this.controls.length; $t1++) {
			var control = this.controls[$t1];
			if (control.y <= e.y && control.y + control.height > e.y && control.x + 2 <= e.x && control.x + control.width + 2 > e.x) {
				e.x -= control.x;
				e.y -= control.y;
				control.onMouseOver(e);
				break;
			}
		}
		if (this.dragging && e.x > this.itemWidth && e.x < this.itemWidth + this.scrollWidth) {
			var height = this.visibleItems * (this.itemHeight + this.jHeight) - 2;
			this.scrollIndex = ss.Int32.trunc(e.y / height * (this.controls.length - this.visibleItems));
			this.scrollIndex = Math.min(Math.max(this.scrollIndex, 0), this.controls.length);
		}
		if (ss.isValue(this.mouseOver)) {
			this.mouseOver($RTSCTF_Utility_Point.$ctor1(e.x, e.y));
		}
		return $RTSCTF_Utility_UIManager_Element.prototype.onMouseOver.call(this, e);
	},
	onScroll: function(e) {
		if (!this.visible) {
			return false;
		}
		if (e.wheelDelta > 0) {
			if (this.scrollIndex > 0) {
				this.scrollIndex--;
			}
		}
		else if (this.scrollIndex < this.controls.length - this.visibleItems) {
			this.scrollIndex++;
		}
		for (var $t1 = 0; $t1 < this.controls.length; $t1++) {
			var control = this.controls[$t1];
			if (control.y <= e.y && control.y + control.height > e.y && control.x <= e.x && control.x + control.width > e.x) {
				e.x -= control.x;
				e.y -= control.y;
				return true;
			}
		}
		//if (this.scroll) this.scroll();
		return true;
	},
	draw: function(canv) {
		if (!this.visible) {
			return;
		}
		canv.save();
		canv.fillStyle = this.backColor;
		var height = this.visibleItems * (this.itemHeight + this.jHeight) - 2;
		canv.fillStyle = this.backColor;
		canv.lineWidth = 1;
		canv.strokeStyle = '#333';
		$RTSCTF_Utility_UIManager_CHelp.roundRect(canv, this.get_totalX(), this.get_totalY(), this.itemWidth + this.scrollWidth + 6, this.visibleItems * (this.itemHeight + this.jHeight), 3, true, true);
		canv.fillStyle = 'grey';
		canv.lineWidth = 1;
		canv.strokeStyle = '#444';
		canv.fillRect(this.get_totalX() + this.itemWidth + 2 + 2, this.get_totalY() + 2, this.scrollWidth, this.height);
		canv.fillStyle = 'FFDDFF';
		canv.lineWidth = 1;
		canv.strokeStyle = '#FFDDFF';
		this.scrollPosition = ss.Int32.div(height * this.scrollIndex, this.controls.length - this.visibleItems);
		canv.fillRect(this.get_totalX() + this.itemWidth + 2 + 2 + 2, this.get_totalY() + 2 + this.scrollPosition, this.scrollWidth - 2, 5);
		var curY = 3;
		for (var i = this.scrollIndex; i < Math.min(this.controls.length, this.scrollIndex + this.visibleItems); i++) {
			this.controls[i].parent = this;
			this.controls[i].x = 2;
			this.controls[i].y = curY;
			this.controls[i].height = this.itemHeight;
			this.controls[i].width = this.itemWidth;
			curY += this.itemHeight + this.jHeight;
			this.controls[i].draw(canv);
		}
		canv.restore();
		$RTSCTF_Utility_UIManager_Element.prototype.draw.call(this, canv);
	},
	clearControls: function() {
		this.controls = [];
	}
};
////////////////////////////////////////////////////////////////////////////////
// RTSCTF.Utility.UIManager.Table
var $RTSCTF_Utility_UIManager_Table = function(x, y, width, height) {
	this.rows = null;
	$RTSCTF_Utility_UIManager_Element.call(this, x, y);
	this.width = width;
	this.height = height;
	this.rows = [];
};
$RTSCTF_Utility_UIManager_Table.prototype = {
	childrenAreEditing: function() {
		var ch = this.rows;
		for (var $t1 = 0; $t1 < ch.length; $t1++) {
			var t = ch[$t1];
			if (t.editorEngine.dragging || t.editorEngine.editing) {
				return true;
			}
			if (t.childrenAreEditing()) {
				return true;
			}
		}
		return false;
	},
	$buildSizeMap: function() {
		var spots = [];
		var totalWidth = { $: this.width };
		var totalHeight = { $: this.height };
		var lastRowRect = $RTSCTF_Rectangle.$ctor1(0, 0, 0, 0);
		var mainRow = this.rows[0];
		for (var $t1 = 0; $t1 < this.rows.length; $t1++) {
			var row = this.rows[$t1];
			var lastRowRectData = $RTSCTF_Utility_Extensions.withData($RTSCTF_Rectangle, $RTSCTF_Utility_UIManager_TableRow).call(null, this.$calculateRowSize(row, lastRowRect.y + lastRowRect.height, totalWidth, totalHeight), row);
			lastRowRect = Type.makeGenericType($RTSCTF_Utility_ExtraData$2, [$RTSCTF_Rectangle, $RTSCTF_Utility_UIManager_TableRow]).op_Implicit(lastRowRectData);
			var lastCellRect = $RTSCTF_Rectangle.$ctor1(0, lastRowRect.y, 0, 0);
			for (var $t2 = 0; $t2 < row.cells.length; $t2++) {
				var cell = row.cells[$t2];
				var lastCellRectData = $RTSCTF_Utility_Extensions.withData($RTSCTF_Rectangle, $RTSCTF_Utility_UIManager_TableCell).call(null, this.$calculateCellSize(cell, lastCellRect.x + lastCellRect.width, lastCellRect.y, totalWidth, totalHeight), cell);
				spots.add(lastCellRectData);
				lastCellRect = Type.makeGenericType($RTSCTF_Utility_ExtraData$2, [$RTSCTF_Rectangle, $RTSCTF_Utility_UIManager_TableCell]).op_Implicit(lastCellRectData);
			}
		}
		return spots;
	},
	$calculateRowSize: function(row, y, totalWidth, totalHeight) {
		var height;
		if (ss.isNullOrUndefined($RTSCTF_Utility_SizeNumber.op_Implicit$1(row.get_rowHeight()))) {
			height = totalHeight.$ / row.get_table().rows.length;
		}
		else if ($RTSCTF_Utility_SizeNumber.op_Implicit$1(row.get_rowHeight()).endsWith('%')) {
			height = totalHeight.$ * $RTSCTF_Utility_SizeNumber.op_Implicit(row.get_rowHeight()) / 100;
		}
		else {
			if ($RTSCTF_Utility_SizeNumber.op_Implicit(row.get_rowHeight()) + y > totalHeight.$) {
				var resetHeight = ss.Int32.trunc(y + $RTSCTF_Utility_SizeNumber.op_Implicit(row.get_rowHeight()));
				totalHeight.$ = resetHeight;
			}
			height = $RTSCTF_Utility_SizeNumber.op_Implicit(row.get_rowHeight());
		}
		return $RTSCTF_Rectangle.$ctor1(0, y, totalWidth.$, ss.Int32.trunc(height));
	},
	$calculateCellSize: function(cell, x, y, totalWidth, totalHeight) {
		var width;
		var height;
		var lastCellAtThisIndex;
		var rowIndex = cell.get_row().get_table().rows.indexOf(cell.get_row());
		if (rowIndex === 0) {
			lastCellAtThisIndex = null;
		}
		else {
			lastCellAtThisIndex = cell.get_row().get_table().rows[rowIndex - 1].cells[cell.get_row().cells.indexOf(cell)];
		}
		if (ss.isNullOrUndefined($RTSCTF_Utility_SizeNumber.op_Implicit$1(cell.cellWidth))) {
			width = (ss.isNullOrUndefined(lastCellAtThisIndex) ? (totalWidth.$ / cell.get_row().cells.length) : $RTSCTF_Utility_SizeNumber.op_Implicit(lastCellAtThisIndex.cellWidth));
		}
		else if ($RTSCTF_Utility_SizeNumber.op_Implicit$1(cell.cellWidth).endsWith('%')) {
			width = totalWidth.$ * $RTSCTF_Utility_SizeNumber.op_Implicit(cell.cellWidth) / 100;
		}
		else {
			if ($RTSCTF_Utility_SizeNumber.op_Implicit(cell.cellWidth) + x > totalWidth.$) {
				totalWidth.$ = ss.Int32.trunc(x + $RTSCTF_Utility_SizeNumber.op_Implicit(cell.cellWidth));
			}
			width = $RTSCTF_Utility_SizeNumber.op_Implicit(cell.cellWidth);
		}
		if (ss.isNullOrUndefined($RTSCTF_Utility_SizeNumber.op_Implicit$1(cell.cellHeight))) {
			height = totalHeight.$;
		}
		else if ($RTSCTF_Utility_SizeNumber.op_Implicit$1(cell.cellHeight).endsWith('%')) {
			height = totalHeight.$ * $RTSCTF_Utility_SizeNumber.op_Implicit(cell.cellHeight) / 100;
		}
		else {
			if ($RTSCTF_Utility_SizeNumber.op_Implicit(cell.cellHeight) + y > totalHeight.$) {
				totalHeight.$ = ss.Int32.trunc(y + $RTSCTF_Utility_SizeNumber.op_Implicit(cell.cellHeight));
			}
			height = $RTSCTF_Utility_SizeNumber.op_Implicit(cell.cellHeight);
		}
		if (cell.fullSize) {
			for (var $t1 = 0; $t1 < cell.controls.length; $t1++) {
				var cnt = cell.controls[$t1];
				cnt.x = 0;
				cnt.y = 0;
				cnt.width = ss.Int32.trunc(width);
				cnt.height = ss.Int32.trunc(height);
			}
		}
		return $RTSCTF_Rectangle.$ctor1(x, y, ss.Int32.trunc(width), ss.Int32.trunc(height));
	},
	focus: function(e) {
		$RTSCTF_Utility_UIManager_Element.prototype.focus.call(this, e);
	},
	loseFocus: function() {
		$RTSCTF_Utility_UIManager_Element.prototype.loseFocus.call(this);
	},
	construct: function() {
		$RTSCTF_Utility_UIManager_Element.prototype.construct.call(this);
	},
	onKeyDown: function(e) {
		return $RTSCTF_Utility_UIManager_Element.prototype.onKeyDown.call(this, e);
	},
	onClick: function(e) {
		return $RTSCTF_Utility_UIManager_Element.prototype.onClick.call(this, e);
	},
	onMouseOver: function(e) {
		return $RTSCTF_Utility_UIManager_Element.prototype.onMouseOver.call(this, e);
	},
	onMouseUp: function(e) {
		return $RTSCTF_Utility_UIManager_Element.prototype.onMouseUp.call(this, e);
	},
	onScroll: function(e) {
		return $RTSCTF_Utility_UIManager_Element.prototype.onScroll.call(this, e);
	},
	draw: function(canv) {
		var fm = this.$buildSizeMap();
		for (var $t1 = 0; $t1 < fm.length; $t1++) {
			var extraData = fm[$t1];
			extraData.data.x = extraData.item.x;
			extraData.data.y = extraData.item.y;
			extraData.data.cellWidth = $RTSCTF_Utility_SizeNumber.op_Implicit$2(extraData.item.width);
			extraData.data.cellHeight = $RTSCTF_Utility_SizeNumber.op_Implicit$2(extraData.item.height);
			extraData.data.draw(canv);
		}
		$RTSCTF_Utility_UIManager_Element.prototype.draw.call(this, canv);
	},
	addRow: function(element) {
		element.parent = this;
		element.construct();
		this.rows.add(element);
		return element;
	}
};
////////////////////////////////////////////////////////////////////////////////
// RTSCTF.Utility.UIManager.Table
var $RTSCTF_Utility_UIManager_Table$1 = function(T) {
	var $type = function(data, x, y, width, height) {
		this.data = T.getDefaultValue();
		$RTSCTF_Utility_UIManager_Table.call(this, x, y, width, height);
		this.data = data;
	};
	Type.registerGenericClassInstance($type, $RTSCTF_Utility_UIManager_Table$1, [T], function() {
		return $RTSCTF_Utility_UIManager_Table;
	}, function() {
		return [];
	});
	return $type;
};
Type.registerGenericClass(global, 'RTSCTF.Utility.UIManager.Table$1', $RTSCTF_Utility_UIManager_Table$1, 1);
////////////////////////////////////////////////////////////////////////////////
// RTSCTF.Utility.UIManager.TableCell
var $RTSCTF_Utility_UIManager_TableCell = function() {
	this.cellHeight = null;
	this.cellWidth = null;
	this.fullSize = false;
	this.rowSpan = 0;
	this.colSpan = 0;
	$RTSCTF_Utility_UIManager_Panel.call(this, 0, 0, 0, 0);
};
$RTSCTF_Utility_UIManager_TableCell.prototype = {
	get_row: function() {
		return Type.cast(this.parent, $RTSCTF_Utility_UIManager_TableRow);
	},
	focus: function(e) {
		$RTSCTF_Utility_UIManager_Panel.prototype.focus.call(this, e);
	},
	loseFocus: function() {
		$RTSCTF_Utility_UIManager_Panel.prototype.loseFocus.call(this);
	},
	construct: function() {
		$RTSCTF_Utility_UIManager_Panel.prototype.construct.call(this);
	},
	onKeyDown: function(e) {
		return $RTSCTF_Utility_UIManager_Panel.prototype.onKeyDown.call(this, e);
	},
	onClick: function(e) {
		return $RTSCTF_Utility_UIManager_Panel.prototype.onClick.call(this, e);
	},
	onMouseOver: function(e) {
		return $RTSCTF_Utility_UIManager_Panel.prototype.onMouseOver.call(this, e);
	},
	onMouseUp: function(e) {
		return $RTSCTF_Utility_UIManager_Panel.prototype.onMouseUp.call(this, e);
	},
	onScroll: function(e) {
		return $RTSCTF_Utility_UIManager_Panel.prototype.onScroll.call(this, e);
	},
	draw: function(canv) {
		this.width = ss.Int32.trunc($RTSCTF_Utility_SizeNumber.op_Implicit(this.cellWidth));
		this.height = ss.Int32.trunc($RTSCTF_Utility_SizeNumber.op_Implicit(this.cellHeight));
		$RTSCTF_Utility_UIManager_Panel.prototype.draw.call(this, canv);
	}
};
$RTSCTF_Utility_UIManager_TableCell.$ctor1 = function(width, height) {
	this.cellHeight = null;
	this.cellWidth = null;
	this.fullSize = false;
	this.rowSpan = 0;
	this.colSpan = 0;
	$RTSCTF_Utility_UIManager_Panel.call(this, 0, 0, 0, 0);
	this.cellWidth = width;
	this.cellHeight = height;
	this.outline = true;
	this.fullSize = true;
};
$RTSCTF_Utility_UIManager_TableCell.$ctor1.prototype = $RTSCTF_Utility_UIManager_TableCell.prototype;
////////////////////////////////////////////////////////////////////////////////
// RTSCTF.Utility.UIManager.TableRow
var $RTSCTF_Utility_UIManager_TableRow = function(height) {
	this.cells = null;
	this.$2$RowHeightField = null;
	$RTSCTF_Utility_UIManager_Element.call(this, 0, 0);
	this.set_rowHeight(height);
	this.cells = [];
};
$RTSCTF_Utility_UIManager_TableRow.prototype = {
	get_rowHeight: function() {
		return this.$2$RowHeightField;
	},
	set_rowHeight: function(value) {
		this.$2$RowHeightField = value;
	},
	get_table: function() {
		return Type.cast(this.parent, $RTSCTF_Utility_UIManager_Table);
	},
	childrenAreEditing: function() {
		var ch = this.cells;
		for (var $t1 = 0; $t1 < ch.length; $t1++) {
			var t = ch[$t1];
			if (t.editorEngine.dragging || t.editorEngine.editing) {
				return true;
			}
			if (t.childrenAreEditing()) {
				return true;
			}
		}
		return false;
	},
	focus: function(e) {
		$RTSCTF_Utility_UIManager_Element.prototype.focus.call(this, e);
	},
	loseFocus: function() {
		$RTSCTF_Utility_UIManager_Element.prototype.loseFocus.call(this);
	},
	construct: function() {
		$RTSCTF_Utility_UIManager_Element.prototype.construct.call(this);
	},
	onKeyDown: function(e) {
		return $RTSCTF_Utility_UIManager_Element.prototype.onKeyDown.call(this, e);
	},
	onClick: function(e) {
		return $RTSCTF_Utility_UIManager_Element.prototype.onClick.call(this, e);
	},
	onMouseOver: function(e) {
		return $RTSCTF_Utility_UIManager_Element.prototype.onMouseOver.call(this, e);
	},
	onMouseUp: function(e) {
		return $RTSCTF_Utility_UIManager_Element.prototype.onMouseUp.call(this, e);
	},
	onScroll: function(e) {
		return $RTSCTF_Utility_UIManager_Element.prototype.onScroll.call(this, e);
	},
	draw: function(canv) {
		$RTSCTF_Utility_UIManager_Element.prototype.draw.call(this, canv);
	},
	addCell: function(element) {
		element.parent = this;
		element.construct();
		this.cells.add(element);
		return element;
	}
};
////////////////////////////////////////////////////////////////////////////////
// RTSCTF.Utility.UIManager.TextArea
var $RTSCTF_Utility_UIManager_TextArea = function(x, y, text) {
	this.$oldText = null;
	this.text = null;
	this.font = null;
	this.color = null;
	$RTSCTF_Utility_UIManager_Element.call(this, x, y);
	this.text = text;
	this.font = $RTSCTF_Utility_UIManager_UIManager.textFont;
	this.color = 'black';
	this.$oldText = '';
};
$RTSCTF_Utility_UIManager_TextArea.prototype = {
	draw: function(canv) {
		if (!this.visible) {
			return;
		}
		var txt = Type.makeGenericType($RTSCTF_Utility_DelegateOrValue$1, [String]).op_Implicit(this.text);
		if (!ss.referenceEquals(canv.font, this.font)) {
			canv.font = this.font;
		}
		//var w = canv.MeasureText(txt).Width;
		//var h = int.Parse(canv.Font.Split("pt")[0]);
		//   canv.fillStyle = "rgba(255,255,255,0.78)";
		// var pad = 3;
		//     canv.fillRect(this.parent.x + this.x - pad, this.parent.y + this.y - h - pad, w + (pad * 2), h + (pad * 2));
		canv.fillStyle = this.color;
		canv.fillText(txt, this.get_totalX(), this.get_totalY());
	},
	construct: function() {
		$RTSCTF_Utility_UIManager_Element.prototype.construct.call(this);
	},
	forceDrawing: function() {
		var txt = Type.makeGenericType($RTSCTF_Utility_DelegateOrValue$1, [String]).op_Implicit(this.text);
		this.cachedForceRedrawing.redraw = false;
		this.cachedForceRedrawing.clearCache = false;
		if (ss.referenceEquals(txt, this.$oldText)) {
			this.cachedForceRedrawing.redraw = true;
		}
		else {
			this.$oldText = txt;
			this.cachedForceRedrawing.redraw = true;
			this.cachedForceRedrawing.clearCache = true;
		}
		return this.cachedForceRedrawing;
	}
};
////////////////////////////////////////////////////////////////////////////////
// RTSCTF.Utility.UIManager.TextBox
var $RTSCTF_Utility_UIManager_TextBox = function(x, y, width, height, text) {
	this.$blinkTick = 0;
	this.$blinked = false;
	this.$can = null;
	this.$oldText = null;
	this.textChanged = null;
	this.text = null;
	this.font = null;
	this.clicking = false;
	this.color = null;
	this.cursorPosition = 0;
	this.dragPosition = 0;
	this.drawTicks = 0;
	this.lastClickTick = 0;
	this.blinked = false;
	this.blinkTick = 0;
	this.button1Grad = null;
	this.button2Grad = null;
	this.buttonBorderGrad = null;
	this.can = false;
	$RTSCTF_Utility_UIManager_Element.call(this, x, y);
	this.text = Type.makeGenericType($RTSCTF_Utility_DelegateOrValue$1, [String]).op_Implicit(text);
	this.width = width;
	this.height = height;
	this.font = $RTSCTF_Utility_UIManager_UIManager.textFont;
	this.dragPosition = -1;
};
$RTSCTF_Utility_UIManager_TextBox.prototype = {
	construct: function() {
		$RTSCTF_Utility_UIManager_Element.prototype.construct.call(this);
		var canv = $RTSCTF_Utility_CanvasInformation.create$2(1, 1).context;
		this.button1Grad = canv.createLinearGradient(0, 0, 0, 1);
		this.button1Grad.addColorStop(0, '#FFFFFF');
		this.button1Grad.addColorStop(1, '#A5A5A5');
		this.button2Grad = canv.createLinearGradient(0, 0, 0, 1);
		this.button2Grad.addColorStop(0, '#A5A5A5');
		this.button2Grad.addColorStop(1, '#FFFFFF');
		this.buttonBorderGrad = canv.createLinearGradient(0, 0, 0, 1);
		this.buttonBorderGrad.addColorStop(0, '#AFAFAF');
		this.buttonBorderGrad.addColorStop(1, '#7a7a7a');
	},
	onKeyDown: function(e) {
		if (e.altKey) {
			return false;
		}
		if (this.focused) {
			if (e.ctrlKey) {
				if (e.keyCode === 65) {
					this.dragPosition = 0;
					this.cursorPosition = this.text.length;
				}
				else if (e.keyCode === 67) {
					// _H.copy_to_clipboard(this.text.substring(Math.min(this.cursorPosition, this.dragPosition), Math.max(this.cursorPosition, this.dragPosition)));
				}
				else if (e.keyCode === 88) {
					//  _H.copy_to_clipboard(this.text.substring(Math.min(this.cursorPosition, this.dragPosition), Math.max(this.cursorPosition, this.dragPosition)));
					this.text = this.text.substring(0, Math.min(this.cursorPosition, this.dragPosition)) + this.text.substring(Math.max(this.cursorPosition, this.dragPosition), this.text.length);
					this.cursorPosition = Math.min(this.cursorPosition, this.dragPosition);
					this.dragPosition = -1;
				}
			}
			else if (e.keyCode === 37) {
				if (e.shiftKey) {
					if (this.dragPosition === -1) {
						this.dragPosition = this.cursorPosition;
					}
					this.cursorPosition = Math.max(this.cursorPosition - 1, 0);
				}
				else {
					this.dragPosition = -1;
					this.cursorPosition = Math.max(this.cursorPosition - 1, 0);
				}
			}
			else if (e.keyCode === 39) {
				if (e.shiftKey) {
					if (this.dragPosition === -1) {
						this.dragPosition = this.cursorPosition;
					}
					this.cursorPosition = Math.min(this.cursorPosition + 1, this.text.length);
				}
				else {
					this.dragPosition = -1;
					this.cursorPosition = Math.min(this.cursorPosition + 1, this.text.length);
				}
			}
			else {
				if (e.keyCode === 8) {
					if (this.dragPosition === -1) {
						this.text = this.text.substring(0, this.cursorPosition - 1) + this.text.substring(this.cursorPosition, this.text.length);
					}
					else {
						this.text = this.text.substring(0, Math.min(this.cursorPosition, this.dragPosition)) + this.text.substring(Math.max(this.cursorPosition, this.dragPosition), this.text.length);
					}
					if (this.dragPosition === -1) {
						if (this.cursorPosition > 0) {
							this.cursorPosition--;
						}
					}
					else {
						this.cursorPosition = Math.min(this.cursorPosition, this.dragPosition);
					}
				}
				else if (e.keyCode === 46) {
					if (this.dragPosition === -1) {
						this.text = this.text.substring(0, this.cursorPosition) + this.text.substring(Math.min(this.cursorPosition + 1, this.text.length), this.text.length);
					}
					else {
						this.text = this.text.substring(0, Math.min(this.cursorPosition, this.dragPosition)) + this.text.substring(Math.max(this.cursorPosition, this.dragPosition), this.text.length);
					}
					if (this.dragPosition === -1) {
					}
					else {
						this.cursorPosition = Math.min(this.cursorPosition, this.dragPosition);
					}
				}
				else {
					var m = e.keyCode;
					var t = String.fromCharCode(m);
					if (this.dragPosition === -1) {
						this.text = this.text.substring(0, this.cursorPosition) + t + this.text.substring(this.cursorPosition, this.text.length);
					}
					else {
						this.text = this.text.substring(0, Math.min(this.cursorPosition, this.dragPosition)) + t + this.text.substring(Math.max(this.cursorPosition, this.dragPosition), this.text.length);
					}
					if (this.dragPosition === -1) {
						this.cursorPosition++;
					}
					else {
						this.cursorPosition = Math.max(this.cursorPosition, this.dragPosition);
					}
				}
				this.dragPosition = -1;
			}
			if (ss.isValue(this.textChanged)) {
				this.textChanged();
			}
			e.preventDefault();
			return true;
		}
		return false;
	},
	forceDrawing: function() {
		var redraw = this.focused;
		if (!ss.referenceEquals(this.$oldText, this.text)) {
			this.$oldText = this.text;
			redraw = true;
		}
		this.cachedForceRedrawing.redraw = redraw;
		return this.cachedForceRedrawing;
	},
	onClick: function(e) {
		if (!this.visible) {
			return false;
		}
		this.clicking = true;
		this.$can.save();
		if (!ss.referenceEquals(this.$can.font, this.font)) {
			this.$can.font = this.font;
		}
		for (var i = 0; i < this.text.length; i++) {
			this.dragPosition = -1;
			var w = this.$can.measureText(this.text.substring(0, i)).width;
			if (w > e.x - 14) {
				this.cursorPosition = i;
				if (this.drawTicks - this.lastClickTick < 15) {
					this.$selectWord();
				}
				this.lastClickTick = this.drawTicks;
				return false;
			}
		}
		this.cursorPosition = this.text.length;
		if (this.drawTicks - this.lastClickTick < 20) {
			this.$selectWord();
		}
		this.lastClickTick = this.drawTicks;
		this.$can.restore();
		return $RTSCTF_Utility_UIManager_Element.prototype.onClick.call(this, e);
	},
	$selectWord: function() {
		var j = this.text.split(' ');
		var pos = 0;
		for (var i = 0; i < j.length; i++) {
			if (this.cursorPosition < j[i].length + pos) {
				this.dragPosition = pos;
				this.cursorPosition = j[i].length + pos;
				return;
			}
			else {
				pos += j[i].length + 1;
			}
		}
		this.dragPosition = pos - j[j.length - 1].length;
		this.cursorPosition = this.text.length;
	},
	onMouseUp: function(e) {
		if (!this.visible) {
			return false;
		}
		if (this.clicking) {
		}
		this.clicking = false;
		if (ss.isValue(this.mouseUp)) {
			this.mouseUp($RTSCTF_Utility_Point.$ctor1(e.x, e.y));
		}
		return $RTSCTF_Utility_UIManager_Element.prototype.onMouseUp.call(this, e);
	},
	onMouseOver: function(e) {
		if (!this.visible) {
			return false;
		}
		document.body.style.cursor = 'text';
		if (this.clicking) {
			if (this.dragPosition === -1) {
				this.dragPosition = this.cursorPosition;
			}
			this.$can.save();
			if (!ss.referenceEquals(this.$can.font, this.font)) {
				this.$can.font = this.font;
			}
			for (var i = 0; i < this.text.length; i++) {
				var w = this.$can.measureText(this.text.substring(0, i)).width;
				if (w > e.x - 14) {
					this.cursorPosition = i;
					return false;
				}
			}
			this.$can.restore();
			this.cursorPosition = this.text.length;
		}
		if (ss.isValue(this.mouseOver)) {
			this.mouseOver($RTSCTF_Utility_Point.$ctor1(e.x, e.y));
		}
		return $RTSCTF_Utility_UIManager_Element.prototype.onMouseOver.call(this, e);
	},
	draw: function(canv) {
		if (!this.visible) {
			return;
		}
		canv.save();
		if (!this.focused) {
			this.cursorPosition = -1;
			this.dragPosition = -1;
		}
		this.drawTicks++;
		this.$can = canv;
		canv.strokeStyle = this.buttonBorderGrad;
		canv.fillStyle = (this.clicking ? this.button1Grad : this.button2Grad);
		canv.lineWidth = 2;
		$RTSCTF_Utility_UIManager_CHelp.roundRect(canv, this.get_totalX(), this.get_totalY(), this.width, this.height, 2, true, true);
		if (!ss.referenceEquals(canv.font, this.font)) {
			canv.font = this.font;
		}
		if (this.dragPosition !== -1) {
			canv.fillStyle = '#598AFF';
			var w1 = canv.measureText(this.text.substring(0, Math.min(this.dragPosition, this.cursorPosition))).width;
			var w2 = canv.measureText(this.text.substring(0, Math.max(this.dragPosition, this.cursorPosition))).width;
			canv.fillRect(this.get_totalX() + 8 + w1, this.get_totalY() + 3, w2 - w1, this.height - 7);
		}
		canv.fillStyle = '#000000';
		var hc;
		if (canv.font.indexOf('pt') !== -1) {
			hc = parseInt(canv.font.substr(0, canv.font.indexOf('pt')));
		}
		else {
			hc = parseInt(canv.font.substr(0, canv.font.indexOf('px')));
		}
		canv.fillText(this.text, this.get_totalX() + 8, this.get_totalY() + ss.Int32.div(this.height - hc, 2) + ss.Int32.div(this.height, 2));
		if (this.focused && this.$blinkTick++ % 35 === 0) {
			this.$blinked = !this.$blinked;
		}
		if (this.focused && this.$blinked) {
			canv.strokeStyle = '#000000';
			var w = canv.measureText(this.text.substring(0, this.cursorPosition)).width;
			canv.beginPath();
			canv.moveTo(this.get_totalX() + 8 + w, this.get_totalY() + 3);
			canv.lineTo(this.get_totalX() + 8 + w, this.get_totalY() + (this.height - 7));
			canv.lineWidth = 2;
			canv.stroke();
		}
		canv.restore();
		$RTSCTF_Utility_UIManager_Element.prototype.draw.call(this, canv);
	}
};
////////////////////////////////////////////////////////////////////////////////
// RTSCTF.Utility.UIManager.UIArea
var $RTSCTF_Utility_UIManager_UIArea = function(x, y, width, height) {
	this.dragging = null;
	this.closable = false;
	$RTSCTF_Utility_UIManager_Panel.call(this, x, y, width, height);
	this.closable = true;
	this.outline = false;
};
$RTSCTF_Utility_UIManager_UIArea.prototype = {
	addControl: function(T) {
		return function(element) {
			var fm = $RTSCTF_Utility_UIManager_Panel.prototype.addControl(T).call(this, element);
			fm.construct();
			return fm;
		};
	},
	construct: function() {
		if (this.closable) {
			var $t1 = new $RTSCTF_Utility_UIManager_Button(this.width - 30, 4, 26, 23, Type.makeGenericType($RTSCTF_Utility_DelegateOrValue$1, [String]).op_Implicit$2('X'));
			$t1.font = $RTSCTF_Utility_UIManager_UIManager.buttonFont;
			$t1.color = 'Green';
			$t1.click = Function.mkdel(this, function(p) {
				this.loseFocus();
				this.visible = false;
			});
			this.addControl($RTSCTF_Utility_UIManager_Button).call(this, $t1);
		}
		$RTSCTF_Utility_UIManager_Panel.prototype.construct.call(this);
	},
	onClick: function(e) {
		var base = $RTSCTF_Utility_UIManager_Panel.prototype.onClick.call(this, e);
		if (!base && !this.isEditMode()) {
			this.dragging = $RTSCTF_Utility_Point.$ctor1(e.x, e.y);
		}
		return base;
	},
	draw: function(canv) {
		if (!this.visible) {
			return;
		}
		canv.save();
		if (!this.cachedDrawing) {
			var cg = $RTSCTF_Utility_CanvasInformation.create$2(this.width + 20, this.height + 20);
			var cv = cg.context;
			cv.translate(10, 10);
			var lingrad = cv.createLinearGradient(0, 0, 0, this.height);
			lingrad.addColorStop(0, 'rgba(220,220,220,0.85)');
			lingrad.addColorStop(1, 'rgba(142,142,142,0.85)');
			cv.fillStyle = lingrad;
			cv.strokeStyle = '#333';
			var xy = $RTSCTF_Utility_Point.$ctor1(this.x, this.y);
			this.x = 0;
			this.y = 0;
			var rad = 30;
			$RTSCTF_Utility_UIManager_CHelp.roundRect(cv, this.x, this.y, this.width, this.height, rad, true, true);
			cv.beginPath();
			cv.moveTo(this.x, this.y + rad);
			cv.lineTo(this.x + this.width, this.y + rad);
			cv.lineWidth = 2;
			cv.strokeStyle = '#000000';
			cv.stroke();
			for (var $t1 = 0; $t1 < this.controls.length; $t1++) {
				var t1 = this.controls[$t1];
				var good = t1.forceDrawing();
				if (good.redraw) {
					t1.draw(cv);
				}
			}
			this.x = xy.x;
			this.y = xy.y;
			this.cachedDrawing = cg;
		}
		this.$drawCache(canv);
		if (this.cachedDrawing.canvas.width !== this.width + 20 || this.cachedDrawing.canvas.height !== this.height + 20) {
			this.cachedDrawing = null;
		}
		for (var $t2 = 0; $t2 < this.controls.length; $t2++) {
			var t = this.controls[$t2];
			var good1 = t.forceDrawing();
			if (!good1.redraw) {
				t.draw(canv);
			}
			if (good1.clearCache) {
				this.cachedDrawing = null;
			}
		}
		canv.restore();
		$RTSCTF_Utility_UIManager_Panel.prototype.draw.call(this, canv);
	},
	$drawCache: function(canv) {
		canv.drawImage(this.cachedDrawing.canvas, this.x - 10, this.y - 10);
	}
};
////////////////////////////////////////////////////////////////////////////////
// RTSCTF.Utility.UIManager.UIArea
var $RTSCTF_Utility_UIManager_UIArea$1 = function(T) {
	var $type = function(data, x, y, width, height) {
		this.data = T.getDefaultValue();
		$RTSCTF_Utility_UIManager_UIArea.call(this, x, y, width, height);
		this.data = data;
	};
	Type.registerGenericClassInstance($type, $RTSCTF_Utility_UIManager_UIArea$1, [T], function() {
		return $RTSCTF_Utility_UIManager_UIArea;
	}, function() {
		return [];
	});
	return $type;
};
Type.registerGenericClass(global, 'RTSCTF.Utility.UIManager.UIArea$1', $RTSCTF_Utility_UIManager_UIArea$1, 1);
////////////////////////////////////////////////////////////////////////////////
// RTSCTF.Utility.UIManager.UIManager
var $RTSCTF_Utility_UIManager_UIManager = function() {
	this.$messages = [];
	this.uiAreas = null;
	this.canvasDepths = null;
	this.$1$UIManagerAreasField = null;
	$RTSCTF_Utility_UIManager_UIManager.instance = this;
	this.uiAreas = [];
	this.set_uiManagerAreas(new $RTSCTF_Utility_UIManager_UIManagerAreas());
	this.updateDepth();
};
$RTSCTF_Utility_UIManager_UIManager.prototype = {
	get_uiManagerAreas: function() {
		return this.$1$UIManagerAreasField;
	},
	set_uiManagerAreas: function(value) {
		this.$1$UIManagerAreasField = value;
	},
	onClick: function(cell) {
		var goodArea = null;
		var cl = Enumerable.from(this.uiAreas).orderBy(function(f) {
			return -f.get_depth();
		}).toArray();
		for (var $t1 = 0; $t1 < cl.length; $t1++) {
			var are = cl[$t1];
			if (are.visible && (are.y <= cell.y && are.y + are.height > cell.y && are.x <= cell.x && are.x + are.width > cell.x)) {
				goodArea = are;
				var ec = $RTSCTF_Utility_Pointer.$ctor(cell.x - are.x, cell.y - are.y, 0, cell.right);
				are.onClick(ec);
				break;
			}
		}
		if (goodArea) {
			for (var $t2 = 0; $t2 < this.uiAreas.length; $t2++) {
				var are1 = this.uiAreas[$t2];
				if (ss.referenceEquals(goodArea, are1)) {
					are1.set_depth(1);
					are1.focus(cell);
				}
				else if (are1.visible) {
					are1.set_depth(0);
					are1.loseFocus();
				}
			}
			return true;
		}
		else {
			for (var $t3 = 0; $t3 < this.uiAreas.length; $t3++) {
				var are2 = this.uiAreas[$t3];
				if (are2.visible) {
					are2.set_depth(0);
					are2.loseFocus();
				}
			}
		}
		return false;
	},
	onMouseMove: function(cell) {
		var cl = Enumerable.from(this.uiAreas).orderBy(function(f) {
			return -f.get_depth();
		}).toArray();
		for (var $t1 = 0; $t1 < cl.length; $t1++) {
			var are = cl[$t1];
			if (are.dragging || are.isEditMode() || are.visible && are.y <= cell.y && are.y + are.height > cell.y && are.x <= cell.x && are.x + are.width > cell.x) {
				var cell2 = $RTSCTF_Utility_Pointer.$ctor(cell.x - are.x, cell.y - are.y, 0, cell.right);
				return are.onMouseOver(cell2);
			}
		}
		return false;
	},
	onMouseUp: function(cell) {
		for (var $t1 = 0; $t1 < this.uiAreas.length; $t1++) {
			var are = this.uiAreas[$t1];
			var ec = $RTSCTF_Utility_Pointer.$ctor(cell.x - are.x, cell.y - are.y, 0, cell.right);
			are.onMouseUp(ec);
		}
	},
	onMouseScroll: function(e) {
		var delta = ss.Nullable.unbox(Type.cast((!!e.wheelDelta ? (e.wheelDelta / 40) : (!!e.detail ? -e.detail : 0)), ss.Int32));
		var cell = $RTSCTF_Utility_UIManager_CHelp.getCursorPosition(e);
		for (var $t1 = 0; $t1 < this.uiAreas.length; $t1++) {
			var are = this.uiAreas[$t1];
			if (are.visible && are.y <= cell.y && are.y + are.height > cell.y && are.x <= cell.x && are.x + are.width > cell.x) {
				var cell2 = $RTSCTF_Utility_Pointer.$ctor(cell.x - are.x, cell.y - are.y, delta, cell.right);
				return are.onScroll(cell2);
			}
		}
		return false;
	},
	onKeyDown: function(jQueryEvent) {
		for (var $t1 = 0; $t1 < this.uiAreas.length; $t1++) {
			var are = this.uiAreas[$t1];
			if (are.onKeyDown(jQueryEvent)) {
				return true;
			}
		}
		return false;
	},
	addArea: function(uiArea) {
		uiArea.construct();
		this.uiAreas.add(uiArea);
		this.updateDepth();
	},
	updateDepth: function() {
		this.canvasDepths = Enumerable.from(this.uiAreas).orderBy(function(f) {
			return f.get_depth();
		}).toArray();
	},
	draw: function(canvas) {
		canvas.save();
		for (var $t1 = 0; $t1 < this.canvasDepths.length; $t1++) {
			var are = this.canvasDepths[$t1];
			are.draw(canvas);
		}
		if (true) {
			for (var i = 0; i < this.$messages.length; i++) {
				canvas.fillText(this.$messages[i], 10, 25 + i * 30);
			}
		}
		canvas.restore();
	}
};
$RTSCTF_Utility_UIManager_UIManager.get_curLevelName = function() {
	return $RTSCTF_Utility_UIManager_UIManager.$_curLevelName;
};
$RTSCTF_Utility_UIManager_UIManager.set_curLevelName = function(value) {
	$RTSCTF_Utility_UIManager_UIManager.updateTitle('- Our Sonic - ' + value);
	$RTSCTF_Utility_UIManager_UIManager.$_curLevelName = value;
};
$RTSCTF_Utility_UIManager_UIManager.updateTitle = function(title) {
	document.title = title;
};
////////////////////////////////////////////////////////////////////////////////
// RTSCTF.Utility.UIManager.UIManagerAreas
var $RTSCTF_Utility_UIManager_UIManagerAreas = function() {
};
Type.registerClass(global, 'RTSCTF.ActionManager', $RTSCTF_ActionManager, Object);
Type.registerClass(global, 'RTSCTF.AStarNode', $RTSCTF_AStarNode, Object);
Type.registerClass(global, 'RTSCTF.Client', $RTSCTF_Client, Object);
Type.registerClass(global, 'RTSCTF.ClientManager', $RTSCTF_ClientManager, Object);
Type.registerClass(global, 'RTSCTF.Game', $RTSCTF_Game, $RTSCTF_Client);
Type.registerClass(global, 'RTSCTF.GameManager', $RTSCTF_GameManager, Object);
Type.registerClass(global, 'RTSCTF.GameMap', $RTSCTF_GameMap, Object);
Type.registerClass(global, 'RTSCTF.GameMapLayout', $RTSCTF_GameMapLayout, Object);
Type.registerClass(global, 'RTSCTF.MainGameManager', $RTSCTF_MainGameManager, Object);
Type.registerClass(global, 'RTSCTF.MapManager', $RTSCTF_MapManager, Object);
Type.registerClass(global, 'RTSCTF.RTSCTFGameConfig', $RTSCTF_RTSCTFGameConfig, Object);
Type.registerClass(global, 'RTSCTF.TaskHandler', $RTSCTF_TaskHandler, Object);
Type.registerClass(global, 'RTSCTF.Tile', $RTSCTF_Tile, Object);
Type.registerClass(global, 'RTSCTF.TileManager', $RTSCTF_TileManager, Object);
Type.registerClass(global, 'RTSCTF.TilePieceData', $RTSCTF_TilePieceData, Object);
Type.registerClass(global, 'RTSCTF.Unit', $RTSCTF_Unit, Object);
Type.registerClass(global, 'RTSCTF.UnitManager', $RTSCTF_UnitManager, Object);
Type.registerClass(global, 'RTSCTF.Waypoint', $RTSCTF_Waypoint, Object);
Type.registerClass(global, 'RTSCTF.WaypointDeterminer', $RTSCTF_WaypointDeterminer, Object);
Type.registerClass(global, 'RTSCTF.WindowManager', $RTSCTF_WindowManager, Object);
Type.registerClass(global, 'RTSCTF.Utility.CanvasInformation', $RTSCTF_Utility_CanvasInformation, Object);
Type.registerClass(global, 'RTSCTF.Utility.Dragger', $RTSCTF_Utility_Dragger, Object);
Type.registerClass(global, 'RTSCTF.Utility.Extensions', $RTSCTF_Utility_Extensions, Object);
Type.registerClass(global, 'RTSCTF.Utility.Help', $RTSCTF_Utility_Help, Object);
Type.registerClass(global, 'RTSCTF.Utility.Point', $RTSCTF_Utility_Point, Object);
Type.registerClass(global, 'RTSCTF.Utility.Pointer', $RTSCTF_Utility_Pointer);
Type.registerClass(global, 'RTSCTF.Utility.SizeNumber', $RTSCTF_Utility_SizeNumber, Object);
Type.registerClass(global, 'RTSCTF.Utility.UIManager.CHelp', $RTSCTF_Utility_UIManager_CHelp, Object);
Type.registerClass(global, 'RTSCTF.Utility.UIManager.EditorEngine', $RTSCTF_Utility_UIManager_EditorEngine, Object);
Type.registerClass(global, 'RTSCTF.Utility.UIManager.EditorEnginePoint', $RTSCTF_Utility_UIManager_EditorEnginePoint, Object);
Type.registerClass(global, 'RTSCTF.Utility.UIManager.Element', $RTSCTF_Utility_UIManager_Element, Object);
Type.registerClass(global, 'RTSCTF.Utility.UIManager.Element$ForceRedrawing', $RTSCTF_Utility_UIManager_Element$ForceRedrawing, Object);
Type.registerClass(global, 'RTSCTF.Utility.UIManager.HScrollBox', $RTSCTF_Utility_UIManager_HScrollBox, $RTSCTF_Utility_UIManager_Element);
Type.registerClass(global, 'RTSCTF.Utility.UIManager.HtmlBox', $RTSCTF_Utility_UIManager_HtmlBox, $RTSCTF_Utility_UIManager_Element);
Type.registerClass(global, 'RTSCTF.Utility.UIManager.Image', $RTSCTF_Utility_UIManager_Image, $RTSCTF_Utility_UIManager_Element);
Type.registerClass(global, 'RTSCTF.Utility.UIManager.ImageButton', $RTSCTF_Utility_UIManager_ImageButton, $RTSCTF_Utility_UIManager_Element);
Type.registerClass(global, 'RTSCTF.Utility.UIManager.Panel', $RTSCTF_Utility_UIManager_Panel, $RTSCTF_Utility_UIManager_Element);
Type.registerClass(global, 'RTSCTF.Utility.UIManager.PropertyButton', $RTSCTF_Utility_UIManager_PropertyButton, $RTSCTF_Utility_UIManager_Element);
Type.registerClass(global, 'RTSCTF.Utility.UIManager.ScrollBox', $RTSCTF_Utility_UIManager_ScrollBox, $RTSCTF_Utility_UIManager_Element);
Type.registerClass(global, 'RTSCTF.Utility.UIManager.Table', $RTSCTF_Utility_UIManager_Table, $RTSCTF_Utility_UIManager_Element);
Type.registerClass(global, 'RTSCTF.Utility.UIManager.TableCell', $RTSCTF_Utility_UIManager_TableCell, $RTSCTF_Utility_UIManager_Panel);
Type.registerClass(global, 'RTSCTF.Utility.UIManager.TableRow', $RTSCTF_Utility_UIManager_TableRow, $RTSCTF_Utility_UIManager_Element);
Type.registerClass(global, 'RTSCTF.Utility.UIManager.TextArea', $RTSCTF_Utility_UIManager_TextArea, $RTSCTF_Utility_UIManager_Element);
Type.registerClass(global, 'RTSCTF.Utility.UIManager.TextBox', $RTSCTF_Utility_UIManager_TextBox, $RTSCTF_Utility_UIManager_Element);
Type.registerClass(global, 'RTSCTF.Utility.UIManager.UIArea', $RTSCTF_Utility_UIManager_UIArea, $RTSCTF_Utility_UIManager_Panel);
Type.registerClass(global, 'RTSCTF.Utility.UIManager.UIManager', $RTSCTF_Utility_UIManager_UIManager, Object);
Type.registerClass(global, 'RTSCTF.Utility.UIManager.UIManagerAreas', $RTSCTF_Utility_UIManager_UIManagerAreas, Object);
Type.registerClass(global, 'RTSCTF.ClientGameManager', $RTSCTF_ClientGameManager, $RTSCTF_GameManager);
Type.registerClass(global, 'RTSCTF.DrawGameMap', $RTSCTF_DrawGameMap, $RTSCTF_GameMap);
Type.registerClass(global, 'RTSCTF.DrawMapManager', $RTSCTF_DrawMapManager, $RTSCTF_MapManager);
Type.registerClass(global, 'RTSCTF.DrawTile', $RTSCTF_DrawTile, $RTSCTF_Tile);
Type.registerClass(global, 'RTSCTF.DrawTileManager', $RTSCTF_DrawTileManager, $RTSCTF_TileManager);
Type.registerClass(global, 'RTSCTF.DrawUnitManager', $RTSCTF_DrawUnitManager, $RTSCTF_UnitManager);
Type.registerClass(global, 'RTSCTF.Person', $RTSCTF_Person, $RTSCTF_Unit);
Type.registerClass(global, 'RTSCTF.Rectangle', $RTSCTF_Rectangle);
Type.registerClass(global, 'RTSCTF.Utility.UIManager.Button', $RTSCTF_Utility_UIManager_Button, $RTSCTF_Utility_UIManager_Element);
$RTSCTF_AStarNode.lateralCost = 10;
$RTSCTF_AStarNode.diagonalCost = 14;
$RTSCTF_Game.debugText = null;
$RTSCTF_RTSCTFGameConfig.tileSize = 32;
$RTSCTF_Utility_CanvasInformation.$blackPixel = null;
$RTSCTF_Utility_Help.colors = ['#FF0000', '#00FF00', '#0000FF', '#880088', '#888800', '#008888'];
$RTSCTF_Utility_UIManager_UIManager.smallTextFont = '8pt Calibri ';
$RTSCTF_Utility_UIManager_UIManager.buttonFont = '12pt Calibri ';
$RTSCTF_Utility_UIManager_UIManager.smallButtonFont = '13pt Arial bold ';
$RTSCTF_Utility_UIManager_UIManager.textFont = '11pt Arial bold ';
$RTSCTF_Utility_UIManager_UIManager.$_curLevelName = null;
$RTSCTF_Utility_UIManager_UIManager.instance = null;
$RTSCTF_ClientManager.$main();
