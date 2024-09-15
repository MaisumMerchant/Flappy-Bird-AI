// Initializing Canvas
// Getting the canvas DOM element and getting the canvas context so we can actually draw on the canvas
var networkCanvas = document.getElementById("networkCanvas");
var networkCtx = networkCanvas.getContext("2d");

// Canvas Size
// Setting the canvas size (width and height) according to the window and also subtracting pixels to add border 
networkCanvas.height = window.innerHeight - 6;
networkCanvas.width = window.innerWidth * 0.6 - 6;

// Level Class
// Has a constructor which initializes the input(s), output(s), weight(s) and bias(es) array
// Weights and biases are randomized
// Has a "feedForward" method which takes input(s) and gives output(s)
class Level {
    constructor(numInputs, numOutputs) {
        this.inputs = new Array(numInputs);
        this.outputs = new Array(numOutputs);
        this.weights = new Array(numInputs);
        this.biases = new Array(numOutputs);

        for (let i = 0; i < this.weights.length; i++) {
            this.weights[i] = new Array(numOutputs);
        }

        for (let i = 0; i < this.inputs.length; i++) {
            for (let j = 0; j < this.outputs.length; j++) {
                this.weights[i][j] = Math.random() * 2 - 1;
            }
        }

        for (let i = 0; i < this.biases.length; i++) {
            this.biases[i] = Math.random() * 2 - 1;
        }
    }

    static feedForward(givenInputs, level) {
        for (let i = 0; i < level.inputs.length; i++) {
            level.inputs[i] = givenInputs[i];
        }

        for (let i = 0; i < level.outputs.length; i++) {
            let sum = 0;

            for (let j = 0; j < level.inputs.length; j++) {
                sum += level.inputs[j] * level.weights[j][i];
            }

            if (sum > level.biases[i]) {
                level.outputs[i] = 1;
            } else {
                level.outputs[i] = 0;
            }
        }

        return level.outputs;
    }
}

// Neural Network Class
// Has a constructor which initializes the level(s) in a neural network
// Has a "feedForward" method whcih takes the output(s) from previous level and passes it as input(s) to the next level
// Has a "mutate" method which may randomize the weight(s) and bias(es) of a certain neuron
class NeuralNetwork {
    constructor(numNeurons) {
        this.levels = [];

        for (let i = 0; i < numNeurons.length - 1; i++) {
            this.levels.push(new Level(numNeurons[i], numNeurons[i + 1]));
        }
    }

    static feedForward(givenInputs, network) {
        let outputs = Level.feedForward(givenInputs, network.levels[0]);

        for (let i = 1; i < network.levels.length; i++) {
            outputs = Level.feedForward(outputs, network.levels[i]);
        }

        return outputs;
    }

    static mutate(network) {
        network.levels.forEach((level) => {
            for (let i = 0; i < level.biases.length; i++) {
                if (Math.random() < 0.2) {
                    level.biases[i] = Math.random() * 2 - 1;
                }
            }

            for (let i = 0; i < level.weights.length; i++) {
                for (let j = 0; j < level.weights[i].length; j++) {
                    if (Math.random() < 0.2) {
                        level.weights[i][j] = Math.random() * 2 - 1;
                    }
                }
            }
        })
    }
}

// Getting Game Inputs
// Game inputs include the birds position, the pipes position and the distance between the bird and the pipe
function getGameInputs(currentBird) {
    let gameInputs = new Array(5);

    if (currentBird.x > (pipes[0].upperPipe.x + pipes[0].upperPipe.width)) {
        gameInputs[0] = pipes[1].upperPipe.x - (currentBird.x + currentBird.width);
        gameInputs[1] = pipes[1].upperPipe.height;
        gameInputs[2] = pipes[1].lowerPipe.y;
        if (!pipeCrossed) {
            score++;
            pipeCrossed = true;
        }
    } else {
        gameInputs[0] = pipes[0].upperPipe.x - (currentBird.x + currentBird.width);
        gameInputs[1] = pipes[0].upperPipe.height;
        gameInputs[2] = pipes[0].lowerPipe.y;
    }

    gameInputs[3] = currentBird.y;
    gameInputs[4] = currentBird.gravity;

    return gameInputs;
}

// Network Loop
// Function for getting the final output from the neural network (jump or no jump)
// Also clears the canvas and displays the neural network of the first bird in the population
function networkLoop(time) {
    birds.forEach((currentBird) => {
        let outputs = NeuralNetwork.feedForward(getGameInputs(currentBird), currentBird.neuralNetwork);
        if (outputs[0]) {
            Bird.jump(currentBird);
        }
    })

    networkCtx.clearRect(0, 0, networkCanvas.width, networkCanvas.height);
    networkCtx.setLineDash([20, 3]);
    networkCtx.lineDashOffset = -time / 50;

    visualizeNeuralNetwork(birds[0].neuralNetwork);

    networkCtx.fillStyle = 'black';
    networkCtx.font = `${networkCanvas.width / 40}px Arial`;
    networkCtx.fillText("Game Speed : " + gameSpeed, networkCanvas.width / 20, networkCanvas.height / 20);
}

// Visualizing The Network
// Function for visualizing the network which uses "printLevel" and "getRGBA" as utility functions
function visualizeNeuralNetwork(network) {
    for (let i = network.levels.length - 1; i >= 0; i--) {
        printLevel(network.levels[i], networkCanvas.width * 0.1, (networkCanvas.height * 0.1) + ((i / network.levels.length) * networkCanvas.height * 0.8), networkCanvas.width * 0.8, (1 / network.levels.length) * networkCanvas.height * 0.8);
    }
}

function printLevel(level, x, y, width, height) {
    for (let i = 0; i < level.inputs.length; i++) {
        for (let j = 0; j < level.outputs.length; j++) {
            networkCtx.beginPath();
            networkCtx.moveTo(x + (((i + 1) / (level.inputs.length + 1)) * width), y);
            networkCtx.lineTo(x + (((j + 1) / (level.outputs.length + 1)) * width), y + height);
            networkCtx.lineWidth = 3;
            networkCtx.strokeStyle = getRGBA(level.weights[i][j]);
            networkCtx.stroke();
        }
    }

    for (let i = 0; i < level.inputs.length; i++) {
        networkCtx.beginPath();
        networkCtx.arc(x + (((i + 1) / (level.inputs.length + 1)) * width), y, width * 0.075 * 2 / level.inputs.length, 0, 2 * Math.PI);
        networkCtx.fillStyle = "White";
        networkCtx.fill();
        networkCtx.beginPath();
        networkCtx.arc(x + (((i + 1) / (level.inputs.length + 1)) * width), y, width * 0.075 / level.inputs.length, 0, 2 * Math.PI);
        if (i == 0) {
            networkCtx.fillStyle = getRGBA(1 - (level.inputs[i] / (gameCanvas.width * 0.4)));
        } else {
            networkCtx.fillStyle = getRGBA(1 - (level.inputs[i] / gameCanvas.height));
        }
        networkCtx.fill();
    }

    for (let i = 0; i < level.outputs.length; i++) {
        networkCtx.beginPath();
        networkCtx.arc(x + (((i + 1) / (level.outputs.length + 1)) * width), y + height, width * 0.075 * 2 / level.outputs.length, 0, 2 * Math.PI);
        networkCtx.fillStyle = "White";
        networkCtx.fill();
        networkCtx.beginPath();
        networkCtx.arc(x + (((i + 1) / (level.outputs.length + 1)) * width), y + height, width * 0.075 / level.outputs.length, 0, 2 * Math.PI);
        networkCtx.fillStyle = getRGBA(level.outputs[i]);
        networkCtx.fill();

        networkCtx.beginPath();
        networkCtx.arc(x + (((i + 1) / (level.outputs.length + 1)) * width), y + height, width * 0.075 * 1.5 / level.outputs.length, 0, 2 * Math.PI);
        networkCtx.strokeStyle = getRGBA(level.biases[i]);
        networkCtx.stroke();
    }
}

function getRGBA(value) {
    let A = Math.abs(value);
    let R = value < 0 ? 0 : 255;
    let G = 0;
    let B = value > 0 ? 0 : 255;
    return "rgba(" + R + "," + G + "," + B + "," + A + ")";
}