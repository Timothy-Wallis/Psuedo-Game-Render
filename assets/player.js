import { canvas, ctx } from "./canvas.js";
import { Terrain } from "./terrain.js";
//Player class
export class Player{
    floatyVel;
    constructor(x, y, velocity, controls={'up': ' ', 'down': 's', 'left': 'a', 'right': 'd'}, health = 100, inventory={}, keys=[]){
        this.x = x;
        this.y = y;
        this.width = 50;
        this.height = 50;
        this.controls = controls;
        this.health = health;
        this.inv = inventory;
        this.keys = keys;
        this.vel = velocity;
        this.gainVelX = 0;
        this.gainVelY = 0;
        this.grounded = false;
        this.floatyVel = this.vel / 2;
        this.gravity = 0.2;
        this.maxFallSpeed = 9.8;
        this.jumpStrength = this.vel * 5;
        this.gravActive = true;
        this.acceleration = 0;
        this.maxHealth = health;
        this.regenAmount = 1;
        this.regenRate = 100;
        this.noMove = true;
        this.onDamage = false;
        this.lastRegenTime = Date.now();
    }
    applyGravity(){
        const standingOnTerrain = Terrain.instances.some((terrain) => {
            const isHorizontallyOverlapping =
                this.x < terrain.x + terrain.width &&
                this.x + this.width > terrain.x;
            const isStandingOnTop = Math.abs(this.y + this.height - terrain.y) < 0.1;
            return isHorizontallyOverlapping && isStandingOnTop;
        });

        if(this.grounded && !standingOnTerrain){
            this.grounded = false;
        }

        if(!this.grounded){
            this.gainVelY = Math.min(this.gainVelY + this.gravity, this.maxFallSpeed);
        }

        const nextY = this.y + this.gainVelY;
        let landed = false;
        for (const terrain of Terrain.instances) {
            const isHorizontallyOverlapping =
                this.x < terrain.x + terrain.width &&
                this.x + this.width > terrain.x;
            const isLandingOnTop =
                this.y + this.height <= terrain.y &&
                nextY + this.height >= terrain.y;

            if (isHorizontallyOverlapping && isLandingOnTop) {
                this.grounded = true;
                this.y = terrain.y - this.height;
                this.gainVelY = 0;
                landed = true;
                break;
            }
        }

        if(!landed){
            this.grounded = false;
            this.y = nextY;
        }
    }
    updateMaxHealth(amount){
        this.maxHealth = amount;
        if(this.health > this.maxHealth){
            this.health = this.maxHealth;
        }else if(!this.onDamage){
            this.health = this.maxHealth;
        }
    }
    checkCollisionWithTerrain(){
        for(const terrain of Terrain.instances){
            const isHorizontallyOverlapping =
                this.x < terrain.x + terrain.width &&
                this.x + this.width > terrain.x;
            const isVerticallyOverlapping =
                this.y < terrain.y + terrain.height &&
                this.y + this.height > terrain.y;
            if(isHorizontallyOverlapping && isVerticallyOverlapping){
                return true;
            }
        }
        return false;
    }
    globalUpdate(){
        this.noMove = true;
        this.regen(this.regenAmount, this.regenRate);
        if(this.health > this.maxHealth){
            this.maxHealth = this.health;
        }
        this.regen(this.regenAmount, this.regenRate);
        if(this.health <= 0){
            this.health = 0;
        }
        for(let i = 0; i < this.keys.length; i++){
            switch(this.keys[i]){
                case `${this.controls.up}`:
                    if(this.grounded){
                        this.noMove = false;
                        this.gainVelY = -this.jumpStrength;
                        this.grounded = false;
                    }
                    break;
                case `${this.controls.down}`:
                    for(const terrain of Terrain.instances){
                        const isHorizontallyOverlapping =
                            this.x < terrain.x + terrain.width &&
                            this.x + this.width > terrain.x;
                        const isStandingOnTop = Math.abs(this.y + this.height - terrain.y) < 0.1;
                        if(isHorizontallyOverlapping && isStandingOnTop && terrain.platform){
                            this.y += 5;
                            break;
                        }
                    }
                    this.noMove = false;
                    this.gainVelY = Math.min(this.gainVelY + this.gravity * 2, this.maxFallSpeed);
                    break;
                case `${this.controls.left}`:
                    this.noMove = false;
                    if(this.acceleration < this.vel){
                        this.acceleration += 0.5;
                    }
                        this.x -= this.acceleration + this.vel;
                    break;
                case `${this.controls.right}`:
                    this.noMove = false;
                    if(this.acceleration < this.vel){
                        this.acceleration += 0.5;
                    }
                        this.x += this.acceleration + this.vel;
                    break;
            }
        }
        this.applyGravity();
    }
    draw(){
        ctx.fillStyle = "red";
        ctx.fillRect(this.x, this.y, this.width, this.height);
        this.globalUpdate();
    }
    drawHealthBar(x, y){
            const barWidth = 200;
            const barHeight = 25;

            const healthPercentage = this.health / this.maxHealth;
            let filledWidth = barWidth * healthPercentage;
            if(this.health > this.maxHealth) filledWidth = barWidth;
            if(filledWidth < 0) filledWidth = 0;

            ctx.fillStyle = "red";
            ctx.strokeStyle = "goldenrod";
            ctx.fillRect(x, y, filledWidth, barHeight);
            ctx.strokeRect(x, y, barWidth, barHeight);
            ctx.fillStyle = "black";
            ctx.font = "16px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(`Health: ${Math.round(this.health)}/${this.maxHealth}`, x + barWidth / 2, y + barHeight + 16);
    }
    damage(amount){
        if(!this.onDamage){
            this.health = this.maxHealth;
            this.onDamage = true;
        }
        this.health -= amount;
    }
    regen(amount, rate){
        let currTime = Date.now();
        if(this.health >= this.maxHealth){
            this.health = this.maxHealth;
        }else if(currTime - this.lastRegenTime >= rate){
            if(this.noMove){
                this.regenRate -= .05 * rate;
            }
            this.health += amount;
            this.lastRegenTime = currTime;
        }
        if(!this.noMove){
            this.regenRate = 100;
        }
    }
}