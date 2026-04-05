import { ctx } from "./canvas.js";
import { canvas } from "./canvas.js";
import { Vec2, Vec2dfRect } from "./Vectors.js";

export class Terrain{
    static instances = [];
    constructor(position, size, color = "blue", platform = false){
        this.absPosition = new Vec2(position.x, position.y);
        this.absSize = new Vec2(size.x, size.y);
        this.color = color;
        this.platform = platform;
        Terrain.instances.push(this);
    }
    draw(){
        ctx.fillStyle = this.color;
        const rect = new Vec2dfRect(this.absPosition, this.absSize);
        rect.draw();
    }
}