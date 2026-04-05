import { canvas, ctx } from "./canvas.js";
import { Terrain } from "./terrain.js";
import { Vec2, Vec2dfRect } from "./Vectors.js";
import { Controller } from "./controller.js";
//Player class
export class Player {
    floatyVel;
    constructor(position, size, velocity, controller = new Controller(), health = 100, inventory = {}, keys = []) {
        this.absPosition = new Vec2(position.x, position.y);
        this.absSize = new Vec2(size.x, size.y);
        this.controller = controller;
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
        document.addEventListener('keydown', e => {
            if (!this.keys.includes(e.key)) {
                this.keys.push(e.key);
            }
        });

        document.addEventListener('keyup', e => {
            for (let i = 0; i < this.keys.length; i++) {
                if (e.key === this.keys[i]) {
                    this.keys.splice(i, 1);
                }
            }
        });
    }
    applyGravity() {
        const standingOnTerrain = Terrain.instances.some((terrain) => {
            const isHorizontallyOverlapping =
                this.absPosition.x < terrain.absPosition.x + terrain.absSize.x &&
                this.absPosition.x + this.absSize.x > terrain.absPosition.x;
            const isStandingOnTop = Math.abs(this.absPosition.y + this.absSize.y - terrain.absPosition.y) < 0.1;
            return isHorizontallyOverlapping && isStandingOnTop;
        });

        if (this.grounded && !standingOnTerrain) {
            this.grounded = false;
        }

        if (!this.grounded) {
            this.gainVelY = Math.min(this.gainVelY + this.gravity, this.maxFallSpeed);
        }

        const nextY = this.absPosition.y + this.gainVelY;
        let landed = false;
        for (const terrain of Terrain.instances) {
            const isHorizontallyOverlapping =
                this.absPosition.x < terrain.absPosition.x + terrain.absSize.x &&
                this.absPosition.x + this.absSize.x > terrain.absPosition.x;
            const isLandingOnTop =
                this.absPosition.y + this.absSize.y <= terrain.absPosition.y &&
                nextY + this.absSize.y >= terrain.absPosition.y;

            if (isHorizontallyOverlapping && isLandingOnTop) {
                this.grounded = true;
                this.absPosition.y = terrain.absPosition.y - this.absSize.y;
                this.gainVelY = 0;
                landed = true;
                break;
            }
        }

        if (!landed) {
            this.grounded = false;
            this.absPosition.y = nextY;
        }
    }
    updateMaxHealth(amount) {
        this.maxHealth = amount;
        if (this.health > this.maxHealth) {
            this.health = this.maxHealth;
        } else if (!this.onDamage) {
            this.health = this.maxHealth;
        }
    }
    checkCollisionWithTerrain() {
        for (const terrain of Terrain.instances) {
            const isHorizontallyOverlapping =
                this.absPosition.x < terrain.absPosition.x + terrain.absSize.x &&
                this.absPosition.x + this.absSize.x > terrain.absPosition.x;
            const isVerticallyOverlapping =
                this.absPosition.y < terrain.absPosition.y + terrain.absSize.y &&
                this.absPosition.y + this.absSize.y > terrain.absPosition.y;
            if (isHorizontallyOverlapping && isVerticallyOverlapping) {
                return true;
            }
        }
        return false;
    }
    globalUpdate() {
        this.noMove = true;
        this.regen(this.regenAmount, this.regenRate);
        if (this.health > this.maxHealth) {
            this.maxHealth = this.health;
        }
        this.regen(this.regenAmount, this.regenRate);
        if (this.health <= 0) {
            this.health = 0;
        }
        for (let i = 0; i < this.keys.length; i++) {
            switch (this.keys[i]) {
                case `${this.controller.up}`:
                    if (this.grounded) {
                        this.noMove = false;
                        this.gainVelY = -this.jumpStrength;
                        this.grounded = false;
                    }
                    break;
                case `${this.controller.down}`:
                    for (const terrain of Terrain.instances) {
                        const isHorizontallyOverlapping =
                            this.absPosition.x < terrain.absPosition.x + terrain.absSize.x &&
                            this.absPosition.x + this.absSize.x > terrain.absPosition.x;
                        const isStandingOnTop = Math.abs(this.absPosition.y + this.absSize.y - terrain.absPosition.y) < 0.1;
                        if (isHorizontallyOverlapping && isStandingOnTop && terrain.platform) {
                            this.absPosition.y += 5;
                            break;
                        }
                    }
                    this.noMove = false;
                    this.gainVelY = Math.min(this.gainVelY + this.gravity * 2, this.maxFallSpeed);
                    break;
                case `${this.controller.left}`:
                    this.noMove = false;
                    if (this.acceleration < this.vel) {
                        this.acceleration += 0.5;
                    }
                    this.absPosition.x -= this.acceleration + this.vel;
                    break;
                case `${this.controller.right}`:
                    this.noMove = false;
                    if (this.acceleration < this.vel) {
                        this.acceleration += 0.5;
                    }
                    this.absPosition.x += this.acceleration + this.vel;
                    break;
            }
        }
        this.applyGravity();
    }
    draw() {
        ctx.fillStyle = "red";
        const rect = new Vec2dfRect(this.absPosition, this.absSize);
        rect.draw();
        this.globalUpdate();
    }
    drawHealthBar(position) {
        const barWidth = 200;
        const barHeight = 25;

        const healthPercentage = this.health / this.maxHealth;
        let filledWidth = barWidth * healthPercentage;
        if (this.health > this.maxHealth) filledWidth = barWidth;
        if (filledWidth < 0) filledWidth = 0;

        ctx.fillStyle = "red";
        ctx.strokeStyle = "goldenrod";
        ctx.fillRect(position.x, position.y, filledWidth, barHeight);
        ctx.strokeRect(position.x, position.y, barWidth, barHeight);
        ctx.fillStyle = "black";
        ctx.font = "16px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`Health: ${Math.round(this.health)}/${this.maxHealth}`, position.x + barWidth / 2, position.y + barHeight + 16);
    }
    damage(amount) {
        if (!this.onDamage) {
            this.health = this.maxHealth;
            this.onDamage = true;
        }
        this.health -= amount;
    }
    regen(amount, rate) {
        let currTime = Date.now();
        if (this.health >= this.maxHealth) {
            this.health = this.maxHealth;
        } else if (currTime - this.lastRegenTime >= rate) {
            if (this.noMove) {
                this.regenRate -= .05 * rate;
            }
            this.health += amount;
            this.lastRegenTime = currTime;
        }
        if (!this.noMove) {
            this.regenRate = 100;
        }
    }
}