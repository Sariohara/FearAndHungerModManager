var MATTIE = MATTIE || {};
MATTIE.menus.multiplayer = MATTIE.menus.multiplayer || {};
MATTIE.scenes.multiplayer = MATTIE.scenes.multiplayer || {};
MATTIE.windows.multiplayer = MATTIE.windows.multiplayer || {};
MATTIE.TextManager = MATTIE.TextManager || {};
MATTIE.CmdManager = MATTIE.CmdManager || {};
MATTIE.TextManager.startGame = "Start Game";
MATTIE.TextManager.returnToMultiplayer = "Close Server";
MATTIE.CmdManager.startGame = "MATTIE_Start_Game"
MATTIE.CmdManager.returnToMultiplayer = "MATTIE_ReturnToMulti"
MATTIE.TextManager.copy = "Copy Code";
MATTIE.CmdManager.copy = "MATTIE_Copy_Code"
MATTIE.TextManager.show = "Show/Hide";
MATTIE.CmdManager.show = "MATTIE_Show_Hide"



/**
 * @description The scene for hosting a multiplayer game
 * @extends Scene_Base
 */
MATTIE.scenes.multiplayer.host = function () {
    this.initialize.apply(this, arguments);
}
MATTIE.scenes.multiplayer.host.prototype = Object.create(MATTIE.scenes.multiplayer.base.prototype); //extend Scene_Base
MATTIE.scenes.multiplayer.host.prototype.constructor = MATTIE.scenes.multiplayer.host; //use constructor

MATTIE.scenes.multiplayer.host.prototype.create = function(){ 
    MATTIE.scenes.multiplayer.base.prototype.create.call(this);
    this.createWindowLayer();
    MATTIE.multiplayer.hostController.open();
    this.addPlayerListWindow();
    this.addOptionsBtns();
    MATTIE.multiplayer.hostController.self.on("open", ()=>{
        this.addPeerDisplayWindow();
        this.initListController();
    });
}

MATTIE.scenes.multiplayer.host.prototype.addPlayerListWindow = function(){
    this._playerWindow = new MATTIE.windows.list(0,0,600,300,"Connected Players:");
    this._playerWindow.updatePlacement(0,15)
    this.addWindow(this._playerWindow);
}

MATTIE.scenes.multiplayer.host.prototype.initListController = function(){
    MATTIE.multiplayer.hostController.addListener('playerInfo', (player) =>{
        this._playerWindow.addItem(player.name)
    })
}

MATTIE.scenes.multiplayer.host.prototype.showHideCode = function(hidden){
    let text = [
        "People can join using this number:",
        hidden ? "*".repeat(MATTIE.multiplayer.hostController.peerId.length) : MATTIE.multiplayer.hostController.peerId
        ];
        this._peerWindow.updateText(text);
        
}


MATTIE.scenes.multiplayer.host.prototype.addPeerDisplayWindow = function(){
    let text = [
        "People can join using this number:",
        "*".repeat(MATTIE.multiplayer.hostController.peerId.length)
        
        ]
    this._peerWindow = new MATTIE.windows.textDisplay((Graphics.boxWidth - 600) / 2+100,0,600,100,text);
    this.addWindow(this._peerWindow);
}

MATTIE.scenes.multiplayer.host.prototype.addOptionsBtns = function(){
    let btns = {}
    btns[MATTIE.TextManager.copy] = MATTIE.CmdManager.copy;
    btns[MATTIE.TextManager.startGame] = MATTIE.CmdManager.startGame;
    btns[MATTIE.TextManager.show] = MATTIE.CmdManager.show;
    btns["Close Server"] = MATTIE.CmdManager.returnToMultiplayer;
    
    
    this._optionsWindow = new MATTIE.windows.horizontalBtns(175+300+10, btns, 4);
    this._optionsWindow.setHandler(MATTIE.CmdManager.startGame, (()=>{
        MATTIE.multiplayer.hostController.startGame();
        MATTIE.menus.multiplayer.openGame();
    }).bind(this));
    this._optionsWindow.setHandler(MATTIE.CmdManager.returnToMultiplayer,  (()=>{
        MATTIE.multiplayer.getCurrentNetController().destroyAllConns();
        MATTIE.menus.multiplayer.openMultiplayer();

    }).bind(this));

    let hidden = true;
    this._optionsWindow.setHandler(MATTIE.CmdManager.show,  (()=>{
        this.showHideCode(!hidden)
        hidden = !hidden;
        this._optionsWindow.activate();
    }).bind(this));

    this._optionsWindow.setHandler(MATTIE.CmdManager.copy,  (()=>{
        MATTIE.clipboard.put(MATTIE.multiplayer.hostController.peerId);
        this._optionsWindow.activate();
    }).bind(this));

    this.addWindow(this._optionsWindow);
    this._optionsWindow.updateWidth(600);
    this._optionsWindow.updatePlacement(175+300+10);
}

