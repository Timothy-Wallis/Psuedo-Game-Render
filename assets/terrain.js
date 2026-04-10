import { ctx } from "./canvas.js";
import { canvas } from "./canvas.js";
import { Vec2, Vec2dfRect } from "./Vectors.js";

export class Terrain{
    static instances = [];
    constructor(position, size, color = "blue", platform = false, isIgnored = false){
        this.absPosition = new Vec2(position.x, position.y);
        this.absSize = new Vec2(size.x, size.y);
        this.color = color;
        this.platform = platform;
        this.isIgnored = isIgnored;
        this.hasRenderCapability = true;
        Terrain.instances.push(this);
    }
    static check(camera){
        for (let i = 0; i < Terrain.instances.length; i++) {
            if (Terrain.instances[i].isIgnored || Terrain.instances[i].isAbleToRender(camera)) {
                Terrain.instances[i].hasRenderCapability = true;
                Terrain.instances[i].render();
            }
            else {
                Terrain.instances[i].hasRenderCapability = false;
            }
        }
    }
    render(){
        ctx.fillStyle = this.color;
        const rect = new Vec2dfRect(this.absPosition, this.absSize);
        rect.draw();
    }
    isAbleToRender(camera){
        let origin = camera.absPosition;
        const leftBound = origin.x - canvas.width / 2;
        const rightBound = origin.x + canvas.width / 2;
        const topBound = origin.y - canvas.height / 2;
        const bottomBound = origin.y + canvas.height / 2;
        if(this.absPosition.x + this.absSize.x < leftBound || this.absPosition.x > rightBound ||
           this.absPosition.y + this.absSize.y < topBound || this.absPosition.y > bottomBound){
            return false;
        }
        return true;
    }
}