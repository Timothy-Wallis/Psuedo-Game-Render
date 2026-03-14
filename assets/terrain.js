import { ctx } from "./canvas.js";
import { canvas } from "./canvas.js";

export class Terrain{
    static instances = [];
    constructor(x, y, width, height, color = "blue", platform = false){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.platform = platform;
        Terrain.instances.push(this);
    }
    draw(){
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}