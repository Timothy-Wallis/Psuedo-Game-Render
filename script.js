//Workspace constants
import { Player } from "./assets/player.js";
import { Terrain } from "./assets/terrain.js";
import { Camera } from "./assets/camera.js";
import { canvas, ctx } from "./assets/canvas.js";
import { Stage } from "./assets/stage.js";
import { Vec2 } from "./assets/Vectors.js";

//Ai generate test stage
import { buildTestStage } from "./assets/testStage.js";

//const debugColor = "yellow";
const scrollSpeed = 1.0;

let renderLoop;

//Canvas Attribs.
canvas.style.backgroundColor = "skyblue";
const spawnCoords = new Vec2(0, -100);
const playerSize = new Vec2(50, 50);

const player = new Player(spawnCoords, playerSize, 2
);
player.updateMaxHealth(600);
player.damage(300);
const WorldCamera = new Camera(spawnCoords, spawnCoords);

    //Test code not for prod
    buildTestStage();
    //End of test code not for prod

const stage = new Stage(player, WorldCamera);

let healthBarPosition = new Vec2(WorldCamera.absPosition.x - canvas.width / 2 + 40, WorldCamera.absPosition.y - canvas.height / 2 + 40);

//Render loop
const main = () => {
    renderLoop = requestAnimationFrame(main);
    WorldCamera.begin(player);


    healthBarPosition = new Vec2(WorldCamera.absPosition.x - canvas.width / 2 + 40, WorldCamera.absPosition.y - canvas.height / 2 + 40);
    stage.draw();
    player.draw();
    WorldCamera.mouseDebug();
    player.drawHealthBar(healthBarPosition);
    WorldCamera.end();
}
main();