//this is a template to add a NEAT ai to any game
//note //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<replace
//this means that there is some information specific to the game to input here


var nextConnectionNo = 1000;
var population;
var obstacles;
var goal

var speed = 60;


var showBest = false; //true if only show the best of the previous generation
var runBest = false; //true if replaying the best ever game
var humanPlaying = false; //true if the user is playing
var saveBest = false; //true when saving the best


var humanPlayer;


var showBrain = true;
var showBestEachGen = false;
var upToGen = 0;
var genPlayerTemp; //player

var showNothing = false;

var pause = true;
var hasPlayed = false;
var adding_obstacles = false;

var mousedown=false;
var linedraw_keeper;

var _windowWidth;
var _windowHeight;

//--------------------------------------------------------------------------------------------------------------------------------------------------

function setup() {
  // window.canvas = createCanvas(1280, 720);
  _windowWidth = windowWidth;
  _windowHeight = windowHeight;

  window.canvas = createCanvas(_windowWidth, (_windowHeight-50));
  population = new Population(1000);
  humanPlayer = new Player();
  goal = new Goal();
  obstacles = new Obstacles();

}
// let x = 100,
//   y = 100,
//   angle1 = 0.0,
//   segLength = 50;

//--------------------------------------------------------------------------------------------------------------------------------------------------------
function draw() {


  // Clear --> background color
  background('rgb(220, 220, 220)');


  // FOR DRAWING OBSTACLES
  if (mousedown) {
    stroke(0);
    strokeWeight(15);
    line(linedraw_keeper.x, linedraw_keeper.y, mouseX, mouseY);
  }

  goal.update();
  obstacles.update();
  drawToScreen();


  if (!pause) {

    if (showBestEachGen) { //show the best of each gen
        showBestPlayersForEachGeneration();
    } else if (humanPlaying) { //if the user is controling the ship[
        showHumanPlaying();
    } else if (runBest) { // if replaying the best ever game
        showBestEverPlayer();
    } else if (saveBest) {
      saveBestEverPlayer();
    } else { 
      //if just evolving normally
      if (!population.done()) { //if any players are alive then update them
          population.updateAlive();
      } else { //all dead
          population.naturalSelection();
      }
    }
  }
}

//-----------------------------------------------------------------------------------
function showBestPlayersForEachGeneration() {
  if (!genPlayerTemp.dead) { //if current gen player is not dead then update it

    genPlayerTemp.look();
    genPlayerTemp.think();
    genPlayerTemp.update();
    genPlayerTemp.show();
  } else { //if dead move on to the next generation
    upToGen++;
    if (upToGen >= population.genPlayers.length) { //if at the end then return to the start and stop doing it
      upToGen = 0;
      showBestEachGen = false;
    } else { //if not at the end then get the next generation
      genPlayerTemp = population.genPlayers[upToGen].cloneForReplay();
    }
  }
}
//-----------------------------------------------------------------------------------
function showHumanPlaying() {
  if (!humanPlayer.dead) { //if the player isnt dead then move and show the player based on input
    humanPlayer.look();
    humanPlayer.update();
    humanPlayer.show();
  } else { //once done return to ai
    humanPlaying = false;
  }
}

function download(content, fileName, contentType) {
    var a = document.createElement("a");
    
    console.log(content);
    var file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}


//-----------------------------------------------------------------------------------
function showBestEverPlayer() {
  if (!population.bestPlayer.dead) { //if best player is not dead
    population.bestPlayer.look();
    population.bestPlayer.think();
    population.bestPlayer.update();
    population.bestPlayer.show();
  } else { //once dead
    runBest = false; //stop replaying it
    population.bestPlayer = population.bestPlayer.cloneForReplay(); //reset the best player so it can play again
    console.log(population.bestPlayer);
  }
}
function saveBestEverPlayer() {
  if (!population.bestPlayer.dead) { //if best player is not dead
    population.bestPlayer.look();
    population.bestPlayer.think();
    population.bestPlayer.update();
    population.bestPlayer.show();
  } else { //once dead
    saveBest = false; //stop replaying it
    population.bestPlayer = population.bestPlayer.cloneForReplay(); //reset the best player so it can play again


    let ding = JSON.parse(population.bestPlayer.brain);
    console.log(ding);
    let dingg = JSON.stringify(ding);
    console.log(dingg);
    die();
    console.log(JSON.stringify(population.bestPlayer.brain));
    for (var i = 0; i < population.players.length; i++) {
      population.players[i] = population.bestPlayer;
    }

    download(population.bestPlayer, 'model_timestamp.json', 'text/plain');
    // die();
  }
}
//---------------------------------------------------------------------------------------------------------------------------------------------------------
//draws the display screen
function drawToScreen() {
  // if (!showNothing) {
    drawBrain();
    writeInfo();
  // }
}
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function drawBrain() { //show the brain of whatever genome is currently showing
  var startX = 350; //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<replace
  // var startY = 500;
  var startY = _windowHeight * .70;
  var w = 300;
  // var h = 225;
  var h = _windowHeight / 4;

    if (runBest) {
        population.bestPlayer.brain.drawGenome(startX, startY, w, h);
    } else if (humanPlaying) {
        showBrain = false;
    } else if (showBestEachGen) {
        genPlayerTemp.brain.drawGenome(startX, startY, w, h);
    } else {
        population.players[0].brain.drawGenome(startX, startY, w, h);
    }
    // die();
}
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//writes info about the current player
function writeInfo() {
    fill(200);
    textAlign(LEFT);
    textSize(30);
    if (showBestEachGen) {
      text("Score: " + genPlayerTemp.score, 650, 50); //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<replace
      text("Gen: " + (genPlayerTemp.gen + 1), 1150, 50);
    } else
    if (humanPlaying) {
      text("Score: " + humanPlayer.score, 650, 50); //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<replace
    } else
    if (runBest) {
        text("Score: " + population.bestPlayer.score, 650, 50); //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<replace
        text("Gen: " + population.gen, 1150, 50);
    } else {
        // if (showBest) {
            text("Score: " + population.players[0].score, 650, 50); //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<replace
            text("Gen: " + population.gen, 1150, 50);
            text("Species: " + population.species.length, 50, canvas.height / 2 + 300);
            text("Global Best Score: " + population.bestScore, 50, canvas.height / 2 + 200);
        // }
    }
}
//--------------------------------------------------------------------------------------------------------------------------------------------------

function keyPressed() {
  switch (key) {
    case ' ':
        //toggle showBest
        showBest = !showBest;
        break;
        // case '+': //speed up frame rate
        //   speed += 10;
        //   frameRate(speed);
        //   prvarln(speed);
        //   break;
        // case '-': //slow down frame rate
        //   if(speed > 10) {
        //     speed -= 10;
        //     frameRate(speed);
        //     prvarln(speed);
        //   }
        //   break;
    case 'B': //run the best
        if (population.bestPlayer) {
            runBest = !runBest;
        }
        break;
    case 'G': //show generations
        showBestEachGen = !showBestEachGen;
        upToGen = 0;
        genPlayerTemp = population.genPlayers[upToGen].clone();
        break;
    case 'N': //show absolutely nothing in order to speed up computation
        showNothing = !showNothing;
        break;
    case 'H': //human playing
         humanPlaying = !humanPlaying;
         humanPlayer = new Player();
         break;
    case 'P': //play
         pause = !pause;
         break;
  }
  //any of the arrow keys
  switch (keyCode) {
    case UP_ARROW: //the only time up/ down / left is used is to control the player
      //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<replace
      console.log('accelerate');
      humanPlayer.accelerate();
      break;
    case DOWN_ARROW:
      //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<replace
      humanPlayer.decelerate();
      break;
    case LEFT_ARROW:
      //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<replace
      humanPlayer.turnLeft();
      humanPlayer.turnLeft();
      humanPlayer.turnLeft();
      break;
    case RIGHT_ARROW: //right is used to move through the generations

      if (showBestEachGen) { //if showing the best player each generation then move on to the next generation
        upToGen++;
        if (upToGen >= population.genPlayers.length) { //if reached the current generation then exit out of the showing generations mode
          showBestEachGen = false;
        } else {
          genPlayerTemp = population.genPlayers[upToGen].cloneForReplay();
        }
      } else if (humanPlaying) { //if the user is playing then move player right

        //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<replace
        humanPlayer.turnRight();
        humanPlayer.turnRight();
        humanPlayer.turnRight();

      }

      break;
  }
}

function menuButton(key) {
  switch (key) {
    case 'p':
      hasPlayed = true;
      adding_obstacles = false;
      pause = !pause;

      let btn_obstacle = document.getElementById("btn_o");
      btn_obstacle.firstChild.data = "Add obstacles";
      btn_obstacle.disabled = true;
      btn_obstacle.classList.remove('btn-primary');
      btn_obstacle.classList.add('btn-secondary');



      var btn_pause = document.getElementById("btn_p");
      if 
        (pause) { btn_pause.firstChild.data = "Play";
      } else { 
        btn_pause.firstChild.data = "Pause";
      }
      break;
    case 'sb':
      showBest = !showBest;
      break;
    case 's':
      saveBest = !saveBest;
      break;
    case 'rb':
      if (population.bestPlayer) {
          runBest = !runBest;
      }
      break;
    case 'g':
      showBestEachGen = !showBestEachGen;
      upToGen = 0;
      genPlayerTemp = population.genPlayers[upToGen].clone();
      break;
    case 'n':
      showNothing = !showNothing;
      var btn_show_nothing = document.getElementById("btn_n");
      if (showNothing) { 
        btn_show_nothing.firstChild.data = "Show graphics";
      } else { 
        btn_show_nothing.firstChild.data = "Hide graphics";
      }
      break;
    case 'h':
      humanPlaying = !humanPlaying;
      humanPlayer = new Player();
      break;
    case 'o':
      if (this.hasPlayed) {
        return;
      }
      adding_obstacles = !adding_obstacles;
      var btn_add_obstacle = document.getElementById("btn_o");
      if (adding_obstacles) { 
        btn_add_obstacle.firstChild.data = "Exit editor";
        // document.getElementById("btn_p").disabled = true;
      } else { 
        btn_add_obstacle.firstChild.data = "Add obstacles";
      }
      break;
  }
}

function touchStarted() {
  // ellipse(mouseX, mouseY, 50, 50);
  if (adding_obstacles) {
    if (mouseX >= 0 && mouseX <= canvas.width) {
      if (mouseY >= 0 && mouseY <= canvas.height){
        mousedown = true;
        linedraw_keeper = {x: mouseX, y: mouseY}
      }
    }
  }
  return false;
}

function touchEnded() {
  if (adding_obstacles) {
    if (mouseX >= 0 && mouseX <= canvas.width) {
      if (mouseY >= 0 && mouseY <= canvas.height){
        mousedown = false;
        obstacles.new_line_obstacle(linedraw_keeper.x, linedraw_keeper.y, mouseX, mouseY);  
      }
    }
  }
  return false;
}

function mousePressed(event) {
  if (mouseButton === 'center') {
    let line_index = obstacles.clicked_line(mouseX, mouseY, 10);
    if (line_index) {
      obstacles.remove_obstacle(line_index);
    }

  } else if (mouseButton === 'left') {
    if (adding_obstacles) {
      if (mouseX >= 0 && mouseX <= canvas.width) {
        if (mouseY >= 0 && mouseY <= canvas.height){
          mousedown = true;
          linedraw_keeper = {x: mouseX, y: mouseY}
        }
      }
    }
  }
  return false;
}

function mouseReleased() {
  mousedown = false;
  if (mouseButton === 'left') {
    if (adding_obstacles) {
      if (mouseX >= 0 && mouseX <= canvas.width) {
        if (mouseY >= 0 && mouseY <= canvas.height) {
          obstacles.new_line_obstacle(linedraw_keeper.x, linedraw_keeper.y, mouseX, mouseY);  
        }
      }
    }
  }
  return false;
}
// function mouseDragged(event) {
  // if (mousedown) {
    // linedraw_keeper[x2] = mouseX;
    // linedraw_keeper[y2] = mouseY;
    // console.log(linedraw_keeper);
  // }
// }

