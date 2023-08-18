/*:
 * @plugindesc V0
 * a mod for fear and hunger
 * @author Mattie
 * 
 * 
 * 
 * @param modName  
 * @desc the name of the mod to load
 * @text mod name
 * @type string
 * @default testMod 
 */


//-----------------------------------------------------------------------------\\
// ModManager
//-----------------------------------------------------------------------------\\

/**
 * By default mod's cannot load anything outside of their folder, all dependencies must be included within the mods folder.
 */

var MATTIE_ModManager = MATTIE_ModManager || {};
var MATTIE = MATTIE || {};
MATTIE.menus = MATTIE.menus || {};
MATTIE.windows = MATTIE.windows || {};
MATTIE.scenes = MATTIE.scenes || {};
MATTIE.TextManager = MATTIE.TextManager || {};
MATTIE.CmdManager = MATTIE.CmdManager || {};
MATTIE.menus.mainMenu = MATTIE.menus.mainMenu || {};

class ModManager {
    constructor(path) {
        Object.assign(this,PluginManager);
        this._path = path
        this._realMods = [];
        this._mods = []
    }
    getModInfo(path,modName){
        const fs = require('fs');
        const modInfoPath =  path + modName;
        const modInfoData = fs.readFileSync(modInfoPath)
        const modInfo = JSON.parse(modInfoData);
        return modInfo;
    }

    getPath(){
        const fs = require('fs');
        let path;
        let mode;
        try {
            fs.readdirSync("www/"+this._path); //dist mode
            mode = "dist"
        } catch (error){
            mode = "dev";
        }
        if(mode === "dist"){
            path="www/"+this._path;
        }else{
            path =this._path;
        }
        return path
    }

    getModsFolder(){
        let arr = [];
        const fs = require('fs');
        
        let readMods = fs.readdirSync(this.getPath());
        
        readMods.forEach(modName => { //load _mods first
            arr.push(modName);
        })
        return arr;
    }

    generateDefaultJSONForMod(modName){
        const fs = require('fs');
        let path = this.getPath();
        let obj = {}
        obj.name = modName;
        obj.status = false;
        obj.parameters = {};
        obj.danger = true;
        fs.writeFileSync(path+modName+".json",JSON.stringify(obj))

    }

    generateDefaultJsonForModsWithoutJsons(){
        let modsWithoutJson = this.getModsWithoutJson();
        modsWithoutJson.forEach(modName=>{
            this.generateDefaultJSONForMod(modName);
        })
    }

    getModsWithoutJson(){
        let modsWithJson = this.getAllMods().map(mod=>mod.name);
        console.log(modsWithJson);
        let modsWithoutJson = [];
        this.getModsFolder().forEach(modName =>{
            if(modName.endsWith(".js") && !modName.includes("mattieFMModLoader")){
                modName = modName.replace(".js","")
                if(!modsWithJson.includes(modName)){
                    modsWithoutJson.push(modName);
                }
            }
            
        })
        return modsWithoutJson;


    }

    /**
     * @description Add a mod to the list of mods that setup will initialize. All mod dependencies (Defined in its mod.json) will be loaded before that mod.
     * @param {*} path the path to the folder
     * @param {*} modName the name of the json file containing the mod info
     */
    parseMod(path,modName){
        const fs = require('fs');
        
        const modInfoPath =  path + modName;
        const modInfoData = fs.readFileSync(modInfoPath)
        const modInfo = JSON.parse(modInfoData);
        if(modInfo.dependencies && modInfo.status){ //load all dependencies before mod
            modInfo.dependencies.forEach(dep=>{
                this.addModEntry(dep);
            });
        }
        if(modInfo.name){
            this.addModEntry(modInfo.name,modInfo.status,modInfo.danger,modInfo.parameters)
        }else{
            this.addModEntry(modName)
        }
        
    }

    getActiveRealDangerMods(){
        let arr = [];
        let currentModsData = this.getAllMods();
        currentModsData.forEach(mod => {
            if(mod.status && mod.name[0] != "_" && mod.danger == true) arr.push(mod);
        });
        return arr;
    }

    getActiveRealMods(){
        let arr = [];
        let currentModsData = this.getAllMods();
        currentModsData.forEach(mod => {
            if(mod.status && mod.name[0] != "_") arr.push(mod);
        });
        return arr;
    }

    checkSaveDanger(){
        return this.getActiveRealDangerMods().length > 0;
    }

    checkVanilla(){
        return this.getActiveRealMods().length === 0;
    }

    checkModded(){
        return this.getActiveRealMods().length > 0;
    }

    setVanilla(){
        let currentModsData = this.getAllMods();
        currentModsData.forEach(mod => {
            if(mod.status) this.switchStatusOfMod(mod.name);
        });
    }

    setNonDanger(){
        let currentModsData = this.getAllMods();
        currentModsData.forEach(mod => {
            if(mod.status == true && mod.danger == true) {
                this.switchStatusOfMod(mod.name);
            }
        });
    }

    checkModsChanged(){
        let currentModsData = this.getAllMods();
        for (let index = 0; index < this._mods.length; index++) {
            const mod = this._mods[index];
            for (let index = 0; index < currentModsData.length; index++) {
                const currentMod = currentModsData[index];
                if(mod.name === currentMod.name && mod.status != currentMod.status) {
                    return true
                }
                
            }
            
        }
        return false;
    }

    reloadIfChangedGame(){
        if(this.checkModsChanged())  this.reloadGame();
    }

    reloadGame(){
        location.reload()
    }

    switchStatusOfMod(modName){
        if(!modName.includes(".json")) modName+=".json";
        const fs = require('fs');
        let arr = [];
        let mode;
        let path;
        try {
            fs.readdirSync("www/"+this._path); //dist mode
            mode = "dist"
        } catch (error){
            mode = "dev";
        }
        if(mode === "dist"){
            path="www/"+this._path;
        }

        let dataInfo = this.getModInfo(path,modName);
        dataInfo.status = !dataInfo.status;
        fs.writeFileSync(path+modName,JSON.stringify(dataInfo));
    }

    getAllMods(){
        const fs = require('fs');
        let arr = [];
        let mode;
        let path;
        try {
            fs.readdirSync("www/"+this._path); //dist mode
            mode = "dist"
        } catch (error){
            mode = "dev";
        }
        if(mode === "dist"){
            path="www/"+this._path;
        }
        let readMods = fs.readdirSync(path);
        
        readMods.forEach(modName => { //load _mods first
            if(modName.includes(".json")){
                let name = modName.replace(".json","").replace("_","");
                let obj = {};
                let dataInfo = this.getModInfo(path,modName);
                arr.push(dataInfo);
            }
            
        })
        return arr;

    }

    addModEntry(name,status=true,danger=false, params={}){
        var mod = {};
        mod.status = status;
        mod.name = name;
        mod.parameters = params;
        mod.danger = danger;
        this._mods.push(mod);
    }

    
    disableAndReload(){
        this.setVanilla();
        this.reloadGame();
    }

    parseMods(path){
        const fs = require('fs');
        var readMods;
        var mode;
        try {
            fs.readdirSync("www/"+path); //dist mode
            mode = "dist"
        } catch (error){
            mode = "dev";
        }
        if(mode === "dist"){
            path="www/"+path;
        }
        readMods = fs.readdirSync(path);
        
        readMods.forEach(modName => { //load _mods first
            if (modName[0] === "_" && modName.includes(".json") ){
                this.parseMod(path,modName); 
            }
        })

        readMods.forEach(modName=>{//load all other mods second
            try {
                if(modName.includes('.json') && modName[0] != "_"){
                    this.parseMod(path,modName)
                }

            } catch (error) {
                throw new Error(`an error occurred while loading the mod:\n${error}`)
            }
        })
        return this._mods;

    }

    /**
     * @description load all mods from a list that are not already loaded
     * @param {*} mods a list of mods to load
     */
    setup(mods) {
        mods.forEach((mod) => {
            if (mod.status && !this._mods.contains(mod.name)) {
                this.setParameters(mod.name, mod.parameters);
                this.loadScript(mod.name);
                this._mods.push(mod.name);
            };
        });
    };
}
MATTIE_ModManager.init =
function () {
    const defaultPath = PluginManager._path;
        const path = "mods/";
        const commonLibsPath = path+"commonLibs/";
        
        const modManager = new ModManager(path);
        MATTIE_ModManager.modManager = modManager;
        modManager.generateDefaultJsonForModsWithoutJsons();
        const commonModManager = new ModManager(commonLibsPath);
        const commonMods = modManager.parseMods(commonLibsPath)
        setTimeout(() => {
            new Promise(res=>{
                PluginManager._path = commonLibsPath;
                commonModManager.setup(commonMods);
                window.alert("mod loader successfully initialized")
    
                PluginManager._path = defaultPath
                res();
            }).then(()=>{
                PluginManager._path = path;
                const mods = modManager.parseMods(path); //fs is in a different root dir so it needs this.
                console.info(mods)
                modManager.setup(mods); //all mods load after plugins
                
                PluginManager._path = defaultPath;
               
            })
        }, 500);
        

}

SceneManager.onError = function(e) {
    console.error(e.message);
    console.error(e.filename, e.lineno);
    try {
        this.stop();
        Graphics.printError('Error', e.message+"\nPress Any Key To Reboot without mods");
        AudioManager.stopAll();
        document.addEventListener('keydown', (()=>{
            MATTIE_ModManager.modManager.disableAndReload();
            MATTIE_ModManager.modManager.reloadGame();
        }), false);
        
    } catch (e2) {
    }
};

MATTIE_ModManager.init();