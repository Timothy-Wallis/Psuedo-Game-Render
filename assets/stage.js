import { Terrain } from "./terrain.js";
export class Stage {
    constructor(player, camera, terrains = []){
        this.player = player;
        this.camera = camera;
        this.terrains = terrains;
    }
    draw(){
        Terrain.check(this.camera);
    }
}