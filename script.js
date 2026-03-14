//Workspace constants
import { Player } from "./assets/player.js";
import { Terrain } from "./assets/terrain.js";
import { Camera } from "./assets/camera.js";
import { canvas, ctx } from "./assets/canvas.js";
import { Stage } from "./assets/stage.js";

//const debugColor = "yellow";
const scrollSpeed = 1.0;

let renderLoop;

//Canvas Attribs.
canvas.style.backgroundColor = "skyblue";

const player = new Player(canvas.width / 2, 0, 2);
player.updateMaxHealth(600);
player.damage(300);
const WorldCamera = new Camera(player.x, player.y);

// Stage layout for movement/gravity testing.
const stageTerrains = [
    // Huge base floor spanning far left and right.
    new Terrain(-3600, canvas.height - 50, 7600, 50, "#2f4f4f"),
];

const stage = new Stage(player, WorldCamera, stageTerrains);

//Render loop
const main = () => {
    renderLoop = requestAnimationFrame(main);

    // Update simulation first so camera and draw use the same frame state.
    WorldCamera.updateCamera(player.x - WorldCamera.x, player.y - WorldCamera.y);

    // Clear in screen space to avoid edge artifacts while camera moves.
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw world in camera space.
    ctx.setTransform(
        1,
        0,
        0,
        1,
        -WorldCamera.x + canvas.width / 2 - player.width / 2,
        -WorldCamera.y + canvas.height / 2 - player.height / 2
    );
    stage.draw();
    player.draw();
    player.drawHealthBar(WorldCamera.x - canvas.width / 2 + 40, WorldCamera.y - canvas.height / 2 + 40);
}
main();

document.addEventListener('keydown', e => {
    if(!player.keys.includes(e.key)){
        player.keys.push(e.key);
    }
});

document.addEventListener('keyup', e => {
    for(let i = 0; i < player.keys.length; i++){
        if(e.key === player.keys[i]){
            player.keys.splice(i, 1);
        }
    }
});

document.addEventListener('mousemove', e => {
    WorldCamera.mouseX = e.clientX;
    WorldCamera.mouseY = e.clientY;
});

document.addEventListener('keyup', e => {
    for(let i = 0; i < player.keys.length; i++){
        if(e.key === player.keys[i]){
            player.keys.splice(i, 1);
        }
    }
});