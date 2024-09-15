// Initializing Canvas
// Getting the canvas DOM element and getting the canvas context so we can actually draw on the canvas
var gameCanvas = document.getElementById("gameCanvas");
var gameCtx = gameCanvas.getContext("2d");

// Canvas Size
// Setting the canvas size (width and height) according to the window and also subtracting pixels to add border 
gameCanvas.height = window.innerHeight - 6;
gameCanvas.width = window.innerWidth * 0.4 - 6;

// Font Styling
var fontSize = gameCanvas.width / 10;
gameCtx.font = `${fontSize}px FlappyFont`;
gameCtx.shadowOffsetX = fontSize * 0.04;
gameCtx.shadowOffsetY = fontSize * 0.04;
gameCtx.lineWidth = fontSize * 0.08;
gameCtx.strokeStyle = "black";
gameCtx.textBaseline = "middle";
gameCtx.textAlign = "center";

// Variables
// Array for pipe(s) and bird(s)
var pipes = [];
var birds = [];

// Images
// Images for the background and pipe(s) (upper and lower pipe)
var backgroundImage = new Image();
backgroundImage.src = "../assets/background.png";

var upperPipeImage = new Image();
upperPipeImage.src = "../assets/upper-pipe.png";

var lowerPipeImage = new Image();
lowerPipeImage.src = "../assets/lower-pipe.png";

// Best Neural Network
var bestNeuralNetwork;

// Score
var score = 0;
var pipeCrossed = false;

// Generation
var generation = 1;

// Game Speed
var gameSpeed = 1;

// Bird Class And Create Bird Method
// Has a constructor which initializes bird(s) position, image and its neural network
// Has a "jump" function
// Function "createBird" is defined which creates "N" number of bird(s) for each generation
class Bird {
    constructor(y) {
        this.x = gameCanvas.width * 0.099;
        this.y = y;
        this.width = gameCanvas.width * 0.099;
        this.height = gameCanvas.height * 0.068;
        this.gravity = 1;
        this.angle = 0;
        this.image = new Image();
        this.image.src = "../assets/bird.png";
        this.neuralNetwork = new NeuralNetwork([5, 8, 8, 1]);
    }

    static jump(bird) {
        bird.gravity = -5 * (gameCanvas.height / 587);
    }
}

function createBirds(numBirds) {
    for (let i = 0; i < numBirds; i++) {
        birds.push(new Bird((gameCanvas.height - gameCanvas.height * 0.068) / 2));
    }
}

// Create Pipes
// Function for making "N" number of pipe(s) when the game starts and after that new pipe(s) are made as the game continues
function createUpperPipe(y) {
    if (pipes.length == 0) {
        this.x = gameCanvas.width;
    } else {
        this.x = pipes[pipes.length - 1].upperPipe.x + gameCanvas.width * 0.4;
    }

    this.y = 0;
    this.height = y;
    this.width = gameCanvas.width * 0.099;
}

function createLowerPipe(y) {
    if (pipes.length == 0) {
        this.x = gameCanvas.width;
    } else {
        this.x = pipes[pipes.length - 1].lowerPipe.x + gameCanvas.width * 0.4;
    }

    this.y = y;
    this.height = gameCanvas.height - y;
    this.width = gameCanvas.width * 0.099;
}

function createPipe() {
    let tempY = Math.floor(Math.random() * (gameCanvas.height - (gameCanvas.height * 0.25
    ) + 1)) + (gameCanvas.height * 0.25);

    this.upperPipe = new createUpperPipe(tempY - (gameCanvas.height * 0.25));
    this.lowerPipe = new createLowerPipe(tempY);
}

function createPipes(numPipes) {
    for (let i = 0; i < numPipes; i++) {
        pipes.push(new createPipe());
    }
}

// Collision Detection
// Function to check is the bird is colliding with any pipe, floor or ceiling
function checkCollisions(currentBird) {
    if (currentBird.y + currentBird.height > gameCanvas.height) {
        return true;
    }

    if (currentBird.y < 0) {
        return true;
    }

    for (let pipe of pipes) {
        if (currentBird.x < pipe.upperPipe.x + pipe.upperPipe.width &&
            currentBird.x + currentBird.width > pipe.upperPipe.x &&
            currentBird.y < pipe.upperPipe.y + pipe.upperPipe.height &&
            currentBird.y + currentBird.height > pipe.upperPipe.y) {
            return true;
        }
        if (currentBird.x < pipe.lowerPipe.x + pipe.lowerPipe.width &&
            currentBird.x + currentBird.width > pipe.lowerPipe.x &&
            currentBird.y < pipe.lowerPipe.y + pipe.lowerPipe.height &&
            currentBird.y + currentBird.height > pipe.lowerPipe.y) {
            return true;
        }
    }

    return false;
}

// Game Loop with Clear, Update And Draw Method
// Function to display the game in which the canvas is cleared, updated and redrawn to display a smooth animation
function clearGame() {
    gameCtx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
}

function updateGame() {
    birds.forEach((currentBird) => {
        currentBird.gravity += 0.2 * (gameCanvas.height / 587);
        currentBird.y += currentBird.gravity;
        currentBird.angle = Math.atan(currentBird.gravity / 7.5);
    })

    pipes.forEach((pipe) => {
        pipe.upperPipe.x -= gameCanvas.width / 506;
        pipe.lowerPipe.x -= gameCanvas.width / 506;
    })

    if ((pipes[0].upperPipe.x + pipes[0].upperPipe.width) < 0 && (pipes[0].lowerPipe.x + pipes[0].lowerPipe.width) < 0) {
        pipes.shift();
        pipes.push(new createPipe());
        pipeCrossed = false;
    }
}

function drawGame() {
    gameCtx.drawImage(backgroundImage, 0, 0, gameCanvas.width, gameCanvas.height);

    birds.forEach((currentBird) => {
        gameCtx.save();
        gameCtx.translate(currentBird.x + currentBird.width / 2, currentBird.y + currentBird.height / 2);
        gameCtx.rotate(currentBird.angle);
        gameCtx.drawImage(currentBird.image, -currentBird.width / 2, -currentBird.height / 2, currentBird.width, currentBird.height);
        gameCtx.restore();
    })

    gameCtx.shadowColor = "rgba(0, 0, 0, 0.7)";
    gameCtx.strokeText(String(score), gameCanvas.width / 2, gameCanvas.height / 2);
    gameCtx.strokeText(String(generation), gameCanvas.width / 15, gameCanvas.height / 15);
    gameCtx.shadowColor = "transparent";
    gameCtx.fillStyle = "white";
    gameCtx.fillText(String(score), gameCanvas.width / 2, gameCanvas.height / 2);
    gameCtx.fillText(String(generation), gameCanvas.width / 15, gameCanvas.height / 15);

    pipes.forEach((pipe) => {
        gameCtx.drawImage(upperPipeImage, 0, upperPipeImage.height - pipe.upperPipe.height, upperPipeImage.width, pipe.upperPipe.height, pipe.upperPipe.x, pipe.upperPipe.y, pipe.upperPipe.width, pipe.upperPipe.height);
        gameCtx.drawImage(lowerPipeImage, 0, 0, lowerPipeImage.width, pipe.lowerPipe.height, pipe.lowerPipe.x, pipe.lowerPipe.y, pipe.lowerPipe.width, pipe.lowerPipe.height);
    })
}

function gameLoop(time) {
    clearGame();

    for (let i = 0; i < gameSpeed; i++) {
        updateGame();

        for (let i = birds.length - 1; i >= 0; i--) {
            if (checkCollisions(birds[i])) {
                birds.splice(i, 1);
                if (birds.length == 1) {
                    bestNeuralNetwork = JSON.stringify(birds[0].neuralNetwork);
                }
                if (birds.length == 0) {
                    score = 0;
                    generation++;
                    pipes.splice(0, pipes.length);
                    createBirds(100);
                    createPipes(4);
                    applyMutation();
                }
            }
        }

        networkLoop(time);
    }

    drawGame();

    requestAnimationFrame(gameLoop);
}

// Mutation
// Function to get the best neural network saved in local storage and mutate the network and set it to the new birds population
function applyMutation() {
    if (bestNeuralNetwork) {
        for (let i = 0; i < birds.length; i++) {
            birds[i].neuralNetwork = JSON.parse(bestNeuralNetwork);
            if (i != 0) {
                NeuralNetwork.mutate(birds[i].neuralNetwork);
            }
        }
    }
}

// Initializing The Game
// Creating 100 birds (population size)
// Creating 4 pipes
// Applying Mutation (Nothing happens for the very first generation because it is random)
createBirds(100);
createPipes(4);
applyMutation();

// Starting The Game
requestAnimationFrame(gameLoop);

// Game Speed Control (Desktop)
document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') {
        gameSpeed++;
    } else if (event.key === 'ArrowLeft') {
        gameSpeed = Math.max(1, gameSpeed - 1);
    }
});


// Game Speed Control (Mobile)
var startX = 0;
var endX = 0;

window.addEventListener('touchstart', function (event) {
    startX = event.touches[0].clientX;
}, false);

window.addEventListener('touchend', function (event) {
    endX = event.changedTouches[0].clientX;
    handleSwipe();
}, false);

function handleSwipe() {
    let deltaX = endX - startX;
    let swipeThreshold = 50;

    if (Math.abs(deltaX) > swipeThreshold) {
        if (deltaX > 0) {
            gameSpeed++;
        } else {
            gameSpeed = Math.max(1, gameSpeed - 1);
        }
    }
}
