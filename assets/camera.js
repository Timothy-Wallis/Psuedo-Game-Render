import { Vec2 } from "./Vectors.js";
import { canvas, ctx } from "./canvas.js";
//Camera
export class Camera{

    constructor(position, mouseCoords, curve = 0.1){
        this.absPosition = new Vec2(position.x, position.y);
        this.mouse = new Vec2(mouseCoords.x, mouseCoords.y);
        this.curve = curve;
        document.addEventListener('mousemove', e => {
            this.mouse = new Vec2(e.clientX, e.clientY);
        });
    }
    //Hidden
    updateCamera(linker)
    {
        this.absPosition = new Vec2(
            this.absPosition.x + (linker.absPosition.x - this.absPosition.x) * this.curve,
            this.absPosition.y + (linker.absPosition.y - this.absPosition.y) * this.curve
        );
    }
    begin(linker){
        this.updateCamera(linker);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.setTransform(
            1,
            0,
            0,
            1,
            -this.absPosition.x + canvas.width / 2,
            -this.absPosition.y + canvas.height / 2
        );
    }
    end(){
        ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
    mouseDebug(){
        ctx.fillStyle = "black";
        ctx.fillText(`( ${Math.round(this.mouse.x)}, ${Math.round(this.mouse.y)} )`, this.mouse.x + this.absPosition.x - canvas.width / 2, this.mouse.y + this.absPosition.y - canvas.height / 2 - 20);
    }
}