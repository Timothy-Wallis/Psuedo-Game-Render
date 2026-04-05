export class Controller{
    constructor(up = " ", down = "s", left = "a", right = "d", jump = " "){
        this.up = up;
        this.down = down;
        this.left = left;
        this.right = right;
        this.jump = jump;
    }
    changeControls(up, down, left, right, jump){
        this.up = up;
        this.down = down;
        this.left = left;
        this.right = right;
        this.jump = jump;
    }

}