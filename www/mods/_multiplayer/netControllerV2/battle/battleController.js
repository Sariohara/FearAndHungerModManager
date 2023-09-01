var MATTIE = MATTIE || {};
MATTIE.multiplayer = MATTIE.multiplayer || {}
MATTIE.menus.multiplayer = MATTIE.menus.multiplayer || {};
MATTIE.scenes.multiplayer = MATTIE.scenes.multiplayer || {};
MATTIE.windows.multiplayer = MATTIE.windows.multiplayer || {};

var EventEmitter = require("events");


class BattleController extends EventEmitter {

    /**
     * @description trigger the ready event on battle controller and net controller.
     * @param {Game_Action[]} actions an array of the actions the player is taking
     * @emits ready
     */
    emitReadyEvent(actions){
        this.emit("ready")
        MATTIE.multiplayer.getCurrentNetController().emitReadyEvent(actions);
    }

    /**
     * @description trigger the unready event on battle controller and net controller
     * @emits unready
     */
    emitUnreadyEvent(){
        this.emit("unready")
        MATTIE.multiplayer.getCurrentNetController().emitUnreadyEvent();
    }


    /**
     * @description emits the turn end event on the battle controller and net controller
     * @emits turnEnd
     */
    emitTurnEndEvent(){
        this.emit("turnEnd");
        if($gameParty.leader().isDead()){
            MATTIE.multiplayer.getCurrentNetController().emitBattleEndEvent($gameTroop._troopId, MATTIE.multiplayer.currentBattleEnemy)
        }
        let enemyHps = $gameTroop._enemies.map(enemy=>{return enemy._hp});
        let enemyStates = $gameTroop._enemies.map(enemy=>{return enemy.states().map(state=>state.id)});
        let actorData = $gameParty.battleMembers().map(actor=>{
            let obj = {};
            obj.hp = actor.hp
            obj.mp = actor.mp;
            return obj;
        })
        MATTIE.multiplayer.getCurrentNetController().emitTurnEndEvent(enemyHps, enemyStates, actorData);
    }
}


MATTIE.multiplayer.BattleController = new BattleController();