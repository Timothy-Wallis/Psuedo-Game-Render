import { ctx } from "./canvas.js";

export class Vec2 {
    x;
    y;
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  tangentLineTo(target){
    const deltaX = target.x - this.x;
    const deltaY = target.y - this.y;
    return Math.atan2(deltaY, deltaX);
  }
}

/**
 * Vec2dfRect: Creates a rectangle using Vec2 objects
 * param Vec2: The top-left corner of the rectangle
 * param Vec2b: The width and height of the rectangle (x = width, y = height)
 * Draws a filled rectangle on the canvas using the provided Vec2 objects.
 */
export class Vec2dfRect{
    x;
    y;
    width;
    height;
    constructor(vec2, Vec2b) {
        this.x = vec2.x;
        this.y = vec2.y;
        this.width = Vec2b.x;
        this.height = Vec2b.y;
    }
    draw(){
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

export class Vec2dlRect {
    x;
    y;
    width;
    height;
    constructor(vec2, width, height) {
        this.x = vec2.x;
        this.y = vec2.y;
        this.width = width;
        this.height = height;
    }
    draw(){
        ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
}


export class Vec3 {
    x;
    y;
    z;
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}