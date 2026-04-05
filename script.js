//Workspace constants
import { Player } from "./assets/player.js";
import { Terrain } from "./assets/terrain.js";
import { Camera } from "./assets/camera.js";
import { canvas, ctx } from "./assets/canvas.js";
import { Stage } from "./assets/stage.js";
import { Vec2 } from "./assets/Vectors.js";

//const debugColor = "yellow";
const scrollSpeed = 1.0;

let renderLoop;

//Canvas Attribs.
canvas.style.backgroundColor = "skyblue";
const spawnCoords = new Vec2(0, 0);
const playerSize = new Vec2(50, 50);

const player = new Player(spawnCoords, playerSize, 2
);
player.updateMaxHealth(600);
player.damage(300);
const WorldCamera = new Camera(spawnCoords, spawnCoords);

const stageTerrains = [
    // Main floor
    new Terrain(new Vec2(-(canvas.width ** 2), canvas.height - 500), new Vec2(canvas.width ** 4, canvas.height * 2), "green"),
    
    // Platforms
    new Terrain(new Vec2(-300, canvas.height - 650), new Vec2(200, 20), "#8B4513"),
    new Terrain(new Vec2(0, canvas.height - 750), new Vec2(200, 20), "#8B4513"),
    new Terrain(new Vec2(300, canvas.height - 650), new Vec2(200, 20), "#8B4513"),
    new Terrain(new Vec2(500, canvas.height - 800), new Vec2(150, 20), "#8B4513"),
    new Terrain(new Vec2(-500, canvas.height - 800), new Vec2(150, 20), "#8B4513"),

    // Wall on the left
    new Terrain(new Vec2(-600, canvas.height - 1000), new Vec2(20, 500), "#555"),

    // Wall on the right
    new Terrain(new Vec2(700, canvas.height - 1000), new Vec2(20, 500), "#555"),
];

const stage = new Stage(player, WorldCamera, stageTerrains);

let healthBarPosition = new Vec2(WorldCamera.absPosition.x - canvas.width / 2 + 40, WorldCamera.absPosition.y - canvas.height / 2 + 40);

//Render loop
const main = () => {
    renderLoop = requestAnimationFrame(main);
    WorldCamera.begin(player);
    healthBarPosition = new Vec2(WorldCamera.absPosition.x - canvas.width / 2 + 40, WorldCamera.absPosition.y - canvas.height / 2 + 40);
    player.drawHealthBar(healthBarPosition);
    stage.draw();
    player.draw();
    WorldCamera.mouseDebug();
    WorldCamera.end();
}
main();