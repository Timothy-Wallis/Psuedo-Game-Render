
//Camera
export class Camera{

    constructor(x, y, mouseX = 0, mouseY = 0, curve = 0.1){
        this.x = x;
        this.y = y;
        this.mouseX = mouseX;
        this.mouseY = mouseY;
        this.curve = curve;
    }
    updateCamera(xChange, yChange){
        this.x += this.curve * xChange;
        this.y += this.curve * yChange;
    }
}