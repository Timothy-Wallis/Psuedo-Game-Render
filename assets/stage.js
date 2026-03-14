export class Stage {
    constructor(player, camera, terrains = []){
        this.player = player;
        this.camera = camera;
        this.terrains = terrains;
    }
    draw(){
        for(const terrain of this.terrains){
            terrain.draw();
        }
    }
}