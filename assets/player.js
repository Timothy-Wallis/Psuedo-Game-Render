import { canvas, ctx } from "./canvas.js";
import { Terrain } from "./terrain.js";
import { Vec2, Vec2dfRect, Vec3 } from "./Vectors.js";
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
        this.relevantCollisionTerrains = [];

        document.addEventListener('keydown', e => {
            if (!this.keys.includes(e.key.toLowerCase())) {
                this.keys.push(e.key.toLowerCase());
            }
        });

        document.addEventListener('keyup', e => {
            this.acceleration = 0;
            for (let i = 0; i < this.keys.length; i++) {
                if (e.key.toLowerCase() === this.keys[i]) {
                    this.keys.splice(i, 1);
                }
            }
        });
    }
    createRelevantcollisionTerrains() {
        const relevantTerrains = Terrain.instances.filter(t => !t.isIgnored && t.hasRenderCapability);
        this.relevantCollisionTerrains = relevantTerrains;
    }

    createRaycastLine(direction, max, origin, step) {
        const dirSearch = { "left": new Vec2(-1, 0), "right": new Vec2(1, 0), "up": new Vec2(0, -1), "down": new Vec2(0, 1) };
        const directionVec = dirSearch[direction];
        const rayEnd = new Vec2(origin.x + directionVec.x * max * step, origin.y + directionVec.y * max * step);
        return rayEnd;
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
        let hitCeiling = false;

        if (this.gainVelY < 0) {
            for (const terrain of this.relevantCollisionTerrains) {
                if (terrain.platform) {
                    continue;
                }

                const terrainBottom = terrain.absPosition.y + terrain.absSize.y;
                const horizontalOverlap =
                    this.absPosition.x + this.absSize.x > terrain.absPosition.x &&
                    this.absPosition.x < terrain.absPosition.x + terrain.absSize.x;
                const wouldHitCeiling =
                    this.absPosition.y >= terrainBottom &&
                    nextY <= terrainBottom;

                if (horizontalOverlap && wouldHitCeiling) {
                    this.absPosition.y = terrainBottom;
                    this.gainVelY = 0;
                    this.grounded = false;
                    hitCeiling = true;
                    break;
                }
            }
        }

        if (hitCeiling) {
            return;
        }

        let landed = false;
        for (const terrain of this.relevantCollisionTerrains) {
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
    isAboveTerrainLevel(terrain) {
        return (
            this.absPosition.y + this.absSize.y <= terrain.absPosition.y
        );
    }
    isBelowTerrainLevel(terrain) {
        return (
            this.absPosition.y >= terrain.absPosition.y + terrain.absSize.y
        );
    }
    getClosestTerrainBelow(onlyPlatforms = false) {
        const playerBottom = this.absPosition.y + this.absSize.y;
        const playerLeft = this.absPosition.x;
        const playerRight = this.absPosition.x + this.absSize.x;

        let closestTerrain = null;
        let closestDistance = Infinity;

        for (const terrain of this.relevantCollisionTerrains) {
            if (onlyPlatforms && !terrain.platform) {
                continue;
            }

            const horizontalOverlap =
                playerRight > terrain.absPosition.x &&
                playerLeft < terrain.absPosition.x + terrain.absSize.x;

            if (!horizontalOverlap) {
                continue;
            }

            const distanceBelow = terrain.absPosition.y - playerBottom;
            if (distanceBelow < 0) {
                continue;
            }

            if (distanceBelow < closestDistance) {
                closestDistance = distanceBelow;
                closestTerrain = terrain;
            }
        }

        return {
            terrain: closestTerrain,
            distance: closestDistance,
        };
    }
    globalUpdate() {
        this.createRelevantcollisionTerrains();
        this.applyGravity();
        // Movement logic
        for (let i = 0; i < this.keys.length; i++) {
            switch (this.keys[i]) {
                case this.controller.left:
                    let tempVel = this.vel;
                    let rayCast = this.createRaycastLine("left", this.vel, new Vec2(this.absPosition.x, this.absPosition.y + this.absSize.y / 2), tempVel);

                    for (const terrain of this.relevantCollisionTerrains) {
                        if (!(terrain.absSize.x > canvas.width) && !this.isAboveTerrainLevel(terrain) && !this.isBelowTerrainLevel(terrain)) {
                            const wallRightEdge = terrain.absPosition.x + terrain.absSize.x;
                            const playerLeftEdge = this.absPosition.x;

                            if (wallRightEdge >= rayCast.x && wallRightEdge <= playerLeftEdge) {
                                // clamp movement so player stops at wall edge
                                tempVel = playerLeftEdge - wallRightEdge;
                            }
                        }
                    }
                    this.absPosition.x -= tempVel;
                    break;
                case this.controller.right:
                    let tempVel2 = this.vel;
                    let rayCastRight = this.createRaycastLine("right", this.vel, new Vec2(this.absPosition.x + this.absSize.x, this.absPosition.y + this.absSize.y / 2), tempVel2);

                    for (const terrain of this.relevantCollisionTerrains) {
                        if (!(terrain.absSize.x > canvas.width) && !this.isAboveTerrainLevel(terrain) && !this.isBelowTerrainLevel(terrain)) {
                            const wallLeftEdge = terrain.absPosition.x;
                            const playerRightEdge = this.absPosition.x + this.absSize.x;

                            if (wallLeftEdge <= rayCastRight.x && wallLeftEdge >= playerRightEdge) {
                                tempVel2 = wallLeftEdge - playerRightEdge;
                            }
                        }
                    }
                    this.absPosition.x += tempVel2;
                    break;
                // instead of checking where player IS, check where player WILL BE
                case this.controller.jump:
                    if (this.grounded) {
                        this.gainVelY = -this.jumpStrength;
                        this.grounded = false;
                    } else if (this.gainVelY < 0 && this.jumpHeld) {
                        this.gainVelY -= 0.05;
                    }
                    break;
                case this.controller.down:
                    const closestPlatformBelow = this.getClosestTerrainBelow(true);

                    if (closestPlatformBelow.terrain && closestPlatformBelow.distance <= 1) {
                        this.absPosition.y += 2;
                        this.grounded = false;
                    }
                    break;
                default:
                    break;
            }
        }
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