class Goal {

    spawnX = 100;
    spawnY = 100;

    diameter = 50;
    isReached = false;
    isReachedGeneration = null;

    constructor() {
        this.pos = createVector(this.spawnX, this.spawnY);
    }

    update() {
        this.show();
    }
    show() {
        if (this.isReached) {
            fill('rgb(0, 255, 0)');
        } else {
            fill('rgb(255, 255, 255)');
        }
        stroke('rgb(0,0,0)');
        strokeWeight(1);
        // circle(this.x, this.y, this.diameter);
                
        let pointOffset = this.diameter / 2;
        ellipse(
            this.pos.x,
            this.pos.y,
            this.diameter/2,
            this.diameter/2);
    }
}
 