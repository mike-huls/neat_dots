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
    timeAlive = 0;

    // Status
    pos;
    vel = createVector(0, 0);
    acc = createVector(0, 0);
    dead = false;
    seesGoal = false;
    hasSeenGoal = false;
    reachedGoal = false;
    deadSeeingGoal = false;
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

        this.genomeInputs = 9; // bias gets added automaticaly. Set lables in genome
        this.genomeOutputs = 2;
        this.brain = new Genome(this.genomeInputs, this.genomeOutputs);

        // random direction
        this.direction = Math.floor(Math.random() * 90) + 180;
        // random acceleration
        this.move();
    }

    //RENDERING--------------------------------------------------------------------------------------------------
    update() {
        if (!this.dead && !this.reachedGoal) {
            this.move();
            this.checkCollisions();
        }
        if (this.timeAlive >= this.maxSteps) {
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
        if (this.vel.mag() > 0) {
            this.takenSteps++;
        }
        this.timeAlive++;
    }
    checkCollisions() {

        // dot collide with obstacle
        if (obstacles.coord_in_obstacle(this.pos.x, this.pos.y, this.diameter)) {
            this.collidedWithObstacle = true;
            this.dead = true;
            if (this.seesGoal) {
                this.deadSeeingGoal = true;
            }
        }

        // Collide with goal
        let d = dist(this.pos.x, this.pos.y, goal.pos.x, goal.pos.y);
        if (d <= this.diameter / 2 + goal.diameter / 2) {
            this.reachedGoal = true;
            this.dead = true;
            goal.isReached = true;
            goal.isReachedGeneration = this.gen;
            console.log("****************************");

        }
    }
    show() {
        if (!Settings.renderDots) {
            return;
        }

        if (frameCount % Settings.skipRenderFrameCount == 0) {
            return;
        }

        let the_fill = 'rgb(100, 100, 100)';

        if (Settings.showDotState) {
            if (this.dead) {
                // DEAD
                if (this.deadSeeingGoal) {
                    the_fill = 'rgb(216,191,216)';
                } else {
                    the_fill = 'rgb(255, 0, 0)';

                }
            } else {
                // Alive
                if (this.seesGoal) {
                    the_fill = 'rgb(255,127,80)';
                } else if (this.hasSeenGoal) {
                    the_fill = 'rgb(30,144,255)';
                }
            }
        }
        fill(the_fill);
        ellipse(this.pos.x, this.pos.y, this.diameter / 2, this.diameter / 2);
        let _dir1 = p5.Vector.fromAngle(radians(this.direction), 25);  
        // let _dir1 = p5.Vector.fromAngle(radians(this.direction + (360/8*8)), 100);  
        // let _dir2 = p5.Vector.fromAngle(radians(this.direction + (360/8*5)), 100);  
        // TODO: create a cape?
        line(this.pos.x, this.pos.y, this.pos.x+_dir1.x, this.pos.y+_dir1.y);
        // line(this.pos.x, this.pos.y, this.pos.x+_dir2.x, this.pos.y+_dir2.y);

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

        stroke('black');
        let objectDistanceArray = Array(8).fill(null);
        let dirArray = [1, 2, 3, 4, 5, 6, 7, 8];
        dirArray.forEach(d => {
            let _dir = p5.Vector.fromAngle(radians(this.direction + (360/8*d)), this.visionRange);  
            let obst_hit = obstacles.line_through_obstacle(this.pos.x, this.pos.y, this.pos.x+_dir.x, this.pos.y+_dir.y);
            if (obst_hit) {
                let obst_hit_d_norm = obst_hit ? 1 - (obst_hit.distance / this.visionRange) : 0;
                objectDistanceArray[d] = obst_hit_d_norm;
                                
                // Graphics
                if (Settings.showSensors) {
                    if (obst_hit_d_norm < 0.33) {
                        stroke('yellow');
                    } else if (obst_hit_d_norm < 0.66) {
                        stroke('orange');
                    } else {
                        stroke('red');
                    }
                    line(this.pos.x, this.pos.y, obst_hit.x, obst_hit.y);
                }
            }
        });


      
        
        if (Settings.showSeesGoal) {
            if (this.seesGoal) {
                stroke('rgb(0,255,0)');
                strokeWeight(1);
                line(this.pos.x, this.pos.y, goal.pos.x, goal.pos.y);
            }
        }


        this.vision[0] = objectDistanceArray[0];
        this.vision[1] = objectDistanceArray[1];
        this.vision[2] = objectDistanceArray[2];
        this.vision[3] = objectDistanceArray[3];
        this.vision[4] = objectDistanceArray[4];
        this.vision[5] = objectDistanceArray[5];
        this.vision[6] = objectDistanceArray[6];
        this.vision[7] = objectDistanceArray[7];

        this.vision[8] = this.seesGoal;
    }
    accelerate() {
        let curMag = this.vel.mag();
        if (curMag==0) {
            this.acc.setMag(this.accelerationSpeed);
            // this.acc.setMag(this.maxAcceleration);
        // } else if (curMag + this.maxAcceleration >= this.maxSpeed) {
        } else if (curMag + this.accelerationSpeed >= this.maxSpeed) {
            this.acc.setMag(this.maxSpeed);
        } else {
            // this.acc.setMag(curMag + this.maxAcceleration);
            this.acc.setMag(curMag + this.accelerationSpeed);
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

        /* Goal: 
            - goal not reached: survive as long as possible; take as many as possible steps
            - goal is reached:  reach again in as few as possible steps
        */

        // let fitness = this.fitness;

        // let distFromSpawn = dist(this.pos.x, this.pos.y, this.spawnX, this.spawnY);
        // if (this.hasSeenGoal) {
        //     // HasSeenGoalBonus
        //     fitness = fitness + 250;

        //     // closer to goal is better


        //     if (this.seesGoal) {
        //         // Sees goal bonus
        //         fitness = fitness * 1.1;
        //     }
        //     if (this.reachedGoal) {
        //         // Reached goad bonus
        //         fitness = fitness + (250 / (distanceToGoal * distanceToGoal));
        //         fitness = fitness * 1.3;
        //         fitness = fitness + (this.maxSteps - this.takenSteps) / 10;
        //     }
        // } else {
        //     // Has not seen goal ==> SEARCH: walk as far as possible from spawn without collision
        //     fitness = fitness + this.takenSteps + distFromSpawn;// (distFromSpawn / this.maxSteps);
        //     if (this.collidedWithObstacle) {
        //         // collided fine
        //         fitness = fitness * 0.8;
        //     }
        // }

        /* NEW zzzz */
        let fitness = 0;
        let BONUS_HASSEENGOAL = 1000;
        let BONUS_DEADSEEINGGOAL = 0; //--> glitch through - check collision in obstacle
        let BONUS_EXPIRED_SEEING_GOAL = 2500;
        let BONUS_REACHEDGOAL = 5000;

        let distFromSpawn = dist(this.pos.x, this.pos.y, this.spawnX, this.spawnY);
        // exploration -> take as many steps and move away from spawn
        // |0,1000|     -1000 if not moved

        if (!this.hasSeenGoal) {
            // Exploration
            fitness = (this.takenSteps / this.maxSteps) * BONUS_HASSEENGOAL;
        }
        if (this.hasSeenGoal) {
            // min distance from goal
            fitness = BONUS_HASSEENGOAL;
            // fitness = fitness + (windowWidth - distanceToGoal)^2;
            fitness = fitness + abs((windowWidth - distanceToGoal)^2);

            

            if (this.deadSeeingGoal) {
                // fitness = fitness + BONUS_DEADSEEINGGOAL;
                // fitness = fitness + (windowWidth - distanceToGoal)^2;
            }

        }
        if (!this.collidedWithObstacle && this.seesGoal) {
            fitness = fitness + BONUS_EXPIRED_SEEING_GOAL;
        }
        if (this.reachedGoal) {
            // Fastest way to goal
            fitness = fitness + BONUS_REACHEDGOAL;
            fitness = fitness + (this.maxSteps - this.takenSteps);


        }




        if (distFromSpawn == 0) {
            fitness = 0;
        }




        // console.log('ts', this.takenSteps, 'mx', this.maxSteps, 'f', fitness)

        /* / NEW */

        
        /* BAK */
        // let distFromSpawn = dist(this.pos.x, this.pos.y, this.spawnX, this.spawnY);
        // if (this.hasSeenGoal) {
        //     // Has seen goal bonus
        //     fitness = fitness + this.maxSteps;
        //     // if (this.seesGoal) {
        //         // Sees goal bonus
        //         // fitness = fitness * 1.1;
        //     // }
        //     if (this.reachedGoal) {
        //         // Reached goad bonus
        //         fitness = fitness + 10000;
        //     }
        //     fitness = fitness + (this.maxSteps - this.takenSteps) / 10;
        //     // fitness = this.maxSteps + 5.0 / (distanceToGoal * distanceToGoal);
        // } else {
        //     // Has not seen goal ==> SEARCH: walk as far as possible from spawn without collision
        //     // Fitness ==> |-1, 0|
        //     fitness = this.takenSteps;
        //     // fitness = 0 + (distFromSpawn / this.maxSteps);
        //     if (this.collidedWithObstacle) {
        //         // collided fine
        //         // fitness = this.takenSteps * 0.8;
        //     }
        // }
        // if (distFromSpawn == 0) {
        //     fitness = -1;
        // }
        /* / BAK */

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
        clone.fitness = this.getFitness();
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
