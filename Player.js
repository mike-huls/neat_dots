class Player {

    // Attributes     - shape and position
    spawnX = canvas.width - 25;
    spawnY = canvas.height - 25;
    diameter = 15;
    
    // Attributes     -- vision
    visionRange = 250;

    // input nodes
    // Set vision labels in Genome.drawbrain
    vision;
    
    // Attributes    -- navigation
    direction = 270;
    turning_angle = 8;
    accelerationSpeed = 0.5;
    maxAcceleration = 0.5;
    decelerateSpeed = 0.6;
    maxSpeed = 10;
    maxSteps = 250;
    takenSteps = 0;

    // Status
    pos;
    vel = createVector(0, 0);
    acc = createVector(0, 0);
    dead = false;
    seesGoal = false;
    hasSeenGoal = false;
    reachedGoal = false;
    collidedWithObstacle = false;

    // Settings
    // showSensors = true;
    // showLoS = true;

    // Neat
    isBest = false;

    constructor() {

        // <---------------------------------------------------------------------Settings
        // Attributes
        // this.visionRange_diag = sqrt((this.visionRange*this.visionRange)*2);
        this.pos = createVector(this.spawnX, this.spawnY);
        this.visionRange_diag = sqrt((Math.pow(this.visionRange, 2) / 2));

        // <---------------------------------------------------------------------NEAT
        this.fitness = 0;
        this.vision = []; //the input array fed into the neuralNet
        this.decision = []; //the out put of the NN
        this.unadjustedFitness;
        this.lifespan = 0; //how long the player lived for this.fitness
        this.bestScore = 0; //stores the this.score achieved used for replay
        this.dead = false;
        this.score = 0;
        this.gen = 0;

        this.genomeInputs = 10;
        this.genomeOutputs = 2;
        this.brain = new Genome(this.genomeInputs, this.genomeOutputs);
    }

    //RENDERING--------------------------------------------------------------------------------------------------
    update() {
        if (!this.dead && !this.reachedGoal) {
            this.move();
            this.checkCollisions();
        }
        if (this.takenSteps >= this.maxSteps) {
            this.dead = true;
        }
        this.score = this.fitness;
    }
    move() {
        // this.acc = p5.Vector.fromAngle(radians(this.direction));

        // Keep acc between limits |-this.maxAcceleration, this.maxAcceleration|
        if (this.acc.mag() > this.maxAcceleration) {
            this.acc.setMag(this.maxAcceleration);
        } else if (this.acc.mag < -this.maxAcceleration) {
            this.acc.setMag(-this.maxAcceleration);
        }

        // Keep speed between limits |0, this.maxSpeed|
        this.vel.add(this.acc);
        if (this.vel.mag() < 0) {
            this.vel.setMag(0);
        } else if (this.vel.mag() > this.maxSpeed) {
            this.vel.setMag(this.maxSpeed);
        }

        // Actually move
        this.pos.add(this.vel);
        this.takenSteps++;
    }
    checkCollisions() {

        // collide with obstacle
        if (obstacles.coord_in_obstacle(this.pos.x, this.pos.y, this.diameter)) {
            this.collidedWithObstacle = true;
            this.dead = true;
        }

        // Collide with goal
        let d = dist(this.pos.x, this.pos.y, goal.pos.x, goal.pos.y);
        
        if (d <= this.diameter / 2 + goal.diameter / 2) {
            this.reachedGoal = true;
            this.dead = true;
            this.fitness = this.fitness * 1.5;
            if (!goal.isReached) {
                goal.isReachedGeneration = population.gen;
            }

            goal.isReached = true;

        }
    }
    show() {
        if (!Settings.renderDots) {
            return;
        }

        if (frameCount % Settings.skipRenderFrameCount == 0) {
            return;
        }

        let the_fill;
        if (!this.dead) {
            if (this.seesGoal) {
                the_fill = 'rgb(255,127,80)';
            } else {
                the_fill = 'rgb(100, 100, 100)';
            }
        } else {
            the_fill = 'rgb(255, 0, 0)';
        }
        fill(the_fill);
        ellipse(this.pos.x, this.pos.y, this.diameter / 2, this.diameter / 2);
    }
    //---------------------------------------------------------------------------------------------------------


    //-BEHAVIOUR-------------------------------------------------------------------------------------------------
    look() {
        // See the distance to the goal
        let distance = dist(this.pos.x, this.pos.y, goal.pos.x, goal.pos.y);

        // Line of sight to the goal
        // this.seesGoal = obstacles.has_line_of_sight(this.pos.x, this.pos.y, goal.pos.x, goal.pos.y);
        // let _seesGoal = obstacles.line_of_sight(this, goal);
        let _seesGoal = obstacles.has_line_of_sight(this.pos.x, this.pos.y, goal.pos.x, goal.pos.y);
        if (_seesGoal) {
            this.seesGoal = true;
            this.hasSeenGoal = true;
        } else {
            this.seesGoal = false;
        }


        // Check collision
        let sees_obst_n = obstacles.line_through_obstacle(this.pos.x, this.pos.y, this.pos.x, this.pos.y - this.visionRange);
        let sees_obst_e = obstacles.line_through_obstacle(this.pos.x, this.pos.y, this.pos.x + this.visionRange, this.pos.y);
        let sees_obst_s = obstacles.line_through_obstacle(this.pos.x, this.pos.y, this.pos.x, this.pos.y + this.visionRange);
        let sees_obst_w = obstacles.line_through_obstacle(this.pos.x, this.pos.y, this.pos.x - this.visionRange, this.pos.y);

        let sees_obst_ne = obstacles.line_through_obstacle(this.pos.x, this.pos.y, this.pos.x + this.visionRange_diag, this.pos.y - this.visionRange_diag);
        let sees_obst_se = obstacles.line_through_obstacle(this.pos.x, this.pos.y, this.pos.x + this.visionRange_diag, this.pos.y + this.visionRange_diag);
        let sees_obst_nw = obstacles.line_through_obstacle(this.pos.x, this.pos.y, this.pos.x - this.visionRange_diag, this.pos.y - this.visionRange_diag);
        let sees_obst_sw = obstacles.line_through_obstacle(this.pos.x, this.pos.y, this.pos.x - this.visionRange_diag, this.pos.y + this.visionRange_diag);


        // Normalize distance to obstacle
        let sees_obst_n_dist = sees_obst_n ? 1 - (sees_obst_n.distance / this.visionRange) : 0;
        let sees_obst_e_dist = sees_obst_e ? 1 - (sees_obst_e.distance / this.visionRange) : 0;
        let sees_obst_s_dist = sees_obst_s ? 1 - (sees_obst_s.distance / this.visionRange) : 0;
        let sees_obst_w_dist = sees_obst_w ? 1 - (sees_obst_w.distance / this.visionRange) : 0;

        let sees_obst_ne_dist = sees_obst_ne ? 1 - (sees_obst_ne.distance / this.visionRange) : 0;
        let sees_obst_se_dist = sees_obst_se ? 1 - (sees_obst_se.distance / this.visionRange) : 0;
        let sees_obst_nw_dist = sees_obst_nw ? 1 - (sees_obst_nw.distance / this.visionRange) : 0;
        let sees_obst_sw_dist = sees_obst_sw ? 1 - (sees_obst_sw.distance / this.visionRange) : 0;
        

        // Show sensor graphics?
        if (Settings.showSensors) {
            stroke(0,0,0)

            stroke(1 - sees_obst_n_dist * 100);
            // sees_obst_n ? stroke(255,127,80) : stroke(0,0,0)
            line(this.pos.x, this.pos.y, this.pos.x, this.pos.y - this.visionRange);
            stroke(sees_obst_e_dist * 100);
            // sees_obst_e ? stroke(255,127,80) : stroke(0,0,0)
            line(this.pos.x, this.pos.y, this.pos.x + this.visionRange, this.pos.y);
            // sees_obst_s ? stroke(255,127,80) : stroke(0,0,0)
            stroke(sees_obst_s_dist * 100);
            line(this.pos.x, this.pos.y, this.pos.x, this.pos.y + this.visionRange);
            // sees_obst_w ? stroke(255,127,80) : stroke(0,0,0)
            stroke(sees_obst_w_dist * 100);
            line(this.pos.x, this.pos.y, this.pos.x - this.visionRange, this.pos.y);
            // sees_obst_ne ? stroke(255,127,80) : stroke(0,0,0)
            stroke(sees_obst_ne_dist * 100);
            line(this.pos.x, this.pos.y, this.pos.x + this.visionRange_diag, this.pos.y - this.visionRange_diag);
            // sees_obst_se ? stroke(255,127,80) : stroke(0,0,0)
            stroke(sees_obst_se_dist * 100);
            line(this.pos.x, this.pos.y, this.pos.x + this.visionRange_diag, this.pos.y + this.visionRange_diag);
            // sees_obst_nw ? stroke(255,127,80) : stroke(0,0,0)
            stroke(sees_obst_nw_dist * 100);
            line(this.pos.x, this.pos.y, this.pos.x - this.visionRange_diag, this.pos.y - this.visionRange_diag);
            // sees_obst_sw ? stroke(255,127,80) : stroke(0,0,0)
            stroke(sees_obst_sw_dist * 100);
            line(this.pos.x, this.pos.y, this.pos.x - this.visionRange_diag, this.pos.y + this.visionRange_diag);
        }

        
        if (Settings.showSeesGoal) {
            if (this.seesGoal) {
                stroke('rgb(0,255,0)');
                strokeWeight(1);
                line(this.pos.x, this.pos.y, goal.pos.x, goal.pos.y);
            }
        }




        // Set
        // UPDATE IN Genome.js
        // Check for INPUT NODES
        this.vision[0] = sees_obst_n_dist;
        this.vision[1] = sees_obst_e_dist;
        this.vision[2] = sees_obst_s_dist;
        this.vision[3] = sees_obst_w_dist;

        this.vision[4] = sees_obst_ne_dist;
        this.vision[5] = sees_obst_se_dist;
        this.vision[6] = sees_obst_nw_dist;
        this.vision[7] = sees_obst_sw_dist;

        this.vision[8] = this.seesGoal;
        this.vision[9] = this.direction / 360;
    }
    accelerate() {
        let curMag = this.vel.mag();
        if (curMag==0) {
            this.acc.setMag(this.maxAcceleration);
        } else if (curMag + this.maxAcceleration >= this.maxSpeed) {
            this.acc.setMag(this.maxSpeed);
        } else {
            this.acc.setMag(curMag + this.maxAcceleration);
        }
    }
    decelerate() {
        let curMag = this.acc.mag();
        this.acc.setMag(curMag - this.decelerateSpeed);
    }
    turnLeft() {
        this.direction = (this.direction - this.turning_angle) % 360;
        this.acc = p5.Vector.fromAngle(radians(this.direction));
    }
    turnRight() {
        this.direction = (this.direction + this.turning_angle) % 360;
        this.acc = p5.Vector.fromAngle(radians(this.direction));
    }
    getFitness() {
        let distanceToGoal = dist(this.pos.x, this.pos.y, goal.pos.x, goal.pos.y);

        // let walkShortDist = 0.2 * (1-(this.takenSteps / this.maxSteps));
        // let walkratio = 0.2 * ((this.takenSteps / this.maxSteps));
        // let collidedObstacle = this.collidedWithObstacle ? -0.9 : 0.0;
        // let seesGoalScore = this.seesGoal ? 0.3 : 0.0;
        // let hasSeenGoal = this.hasSeenGoal ? 0.3 : 0.0;
        
        // let diagonal = sqrt((canvas.width * canvas.width) + (canvas.height * canvas.height));
        // let goalDist = 0.2 * (1 - (distanceToGoal/ this.maxSteps));

        // let goalDistScore = 1.0/(distanceToGoal * distanceToGoal);

        // let reachedGoal = this.reachedGoal ? 0.3 : 0.0;
        
        // let spawnDist = 0.3 * (distFromSpawn / this.maxSteps);


        // console.log(seesGoalScore + goalDist + reachedGoal + collidedObstacle);
        // let fitness = seesGoalScore + goalDist + reachedGoal + collidedObstacle;
        // let fitness = collidedObstacle + walkratio + seesGoalScore + reachedGoal; 
        // let fitness = goalDistScore + collidedObstacle + seesGoalScore;
        let fitness = 0;


        let distFromSpawn = dist(this.pos.x, this.pos.y, this.spawnX, this.spawnY);
        if (this.hasSeenGoal) {
            fitness = 5.0 / (distanceToGoal * distanceToGoal);
            if (this.seesGoal) {
                // Sees goal bonus
                fitness = fitness * 1.1;
            }
            if (this.reachedGoal) {
                // Reached goad bonus
                fitness = fitness * 1.3;
            }
        } else {
            // Has not seen goal ==> SEARCH: walk as far as possible from spawn without collision
            // Fitness ==> |-1, 0|
            fitness = 0 - (distFromSpawn / this.maxSteps);
            if (this.collidedWithObstacle) {
                // collided fine
                fitness = fitness - 0.5;
            }
        }

        return fitness;
    }
    //-----------------------------------------------------------------------------------------------------------


    //-NEAT----------------------------------------------------------------------------------------------------
    think() {
        //gets the output of the this.brain then converts them to actions

        var max = 0;
        var maxIndex = 0;
        this.decision = this.brain.feedForward(this.vision);

        for (var i = 0; i < this.decision.length; i++) {
            if (this.decision[i] > max) {
                max = this.decision[i];
                maxIndex = i;
            }
        }
        // this.acc = p5.Vector.fromAngle(radians(max*360));


        // Steering
        if (this.decision[0] < 0.25) {
            // Turn left
            this.turnLeft();
        } else if (this.decision[0] > 0.75) {
            // Turn right
            this.turnRight();
        } else {
            // Do Nothing
        }

        // Accelerating / decelerating
        if (this.acc.mag() == 0) {
            this.accelerate();
        }
        if (this.decision[1] < 0.3) {
            // Accelerate
            this.accelerate();
        } else if (this.decision[1] > 0.7) {
            // Decelerate
            this.decelerate();
        } else {
            // Do Nothing
        }
    }
    clone() {
        //returns a clone of this player with the same brian
        var clone = new Player();
        clone.brain = this.brain.clone();
        clone.fitness = this.fitness;
        clone.brain.generateNetwork();
        clone.gen = this.gen;
        clone.bestScore = this.score;
        return clone;
    }
    cloneForReplay() {
        //since there is some randomness in games sometimes when we want to replay the game we need to remove that randomness
        //this fuction does that
        var clone = new Player();
        clone.brain = this.brain.clone();
        clone.fitness = this.fitness;
        clone.brain.generateNetwork();
        clone.gen = this.gen;
        clone.bestScore = this.score;
        return clone;
    }
    calculateFitness() {
        //fot Genetic algorithm
        
        this.fitness =  this.getFitness();
    }
    crossover(parent2) {

        var child = new Player();
        child.brain = this.brain.crossover(parent2.brain);
        child.brain.generateNetwork();
        return child;
    }
    //-----------------------------------------------------------------------------------------------------------
}
