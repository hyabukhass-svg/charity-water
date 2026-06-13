const titleScreen = document.getElementById("titleScreen");
const gameScreen = document.getElementById("gameScreen");

const startBtn = document.getElementById("startBtn");
const howBtn = document.getElementById("howBtn");
const howBox = document.getElementById("howBox");
const restartBtn = document.getElementById("restartBtn");
const homeBtn = document.getElementById("homeBtn");

const scoreText = document.getElementById("score");
const timerText = document.getElementById("timer");
const waterText = document.getElementById("waterText");
const meterFill = document.getElementById("meterFill");
const message = document.getElementById("message");

const pipePiece = document.getElementById("pipePiece");
const leakPiece = document.getElementById("leakPiece");
const filterPiece = document.getElementById("filterPiece");
const tankPiece = document.getElementById("tankPiece");

let score = 0;
let timeLeft = 45;
let water = 0;
let step = 0;
let gameStarted = false;
let timer;

const correctOrder = ["pipe", "tool", "filter", "tank"];

const messages = [
  "Great! The pipe is connected.",
  "Nice work! You fixed the leak.",
  "Awesome! The filter is added.",
  "Amazing! The water tank is ready."
];

const pieces = {
  pipe: pipePiece,
  tool: leakPiece,
  filter: filterPiece,
  tank: tankPiece
};

howBtn.addEventListener("click", function () {
  howBox.classList.toggle("hidden");
});

startBtn.addEventListener("click", function () {
  titleScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  startGame();
});

restartBtn.addEventListener("click", restartGame);

homeBtn.addEventListener("click", function () {
  clearInterval(timer);
  gameScreen.classList.add("hidden");
  titleScreen.classList.remove("hidden");
  restartGame();
});

function startGame() {
  clearInterval(timer);

  score = 0;
  timeLeft = 45;
  water = 0;
  step = 0;
  gameStarted = true;

  resetPieces();
  updateScreen();

  message.textContent = "Start by adding the pipe.";

  timer = setInterval(function () {
    timeLeft--;
    updateScreen();

    if (timeLeft <= 0) {
      loseGame();
    }
  }, 1000);
}

function chooseSupply(supply) {
  if (!gameStarted) {
    message.textContent = "Click Start Game first.";
    return;
  }

  if (supply === correctOrder[step]) {
    score += 10;
    water += 25;

    pieces[supply].classList.add("built");
    pieces[supply].textContent = "Done ✅";

    message.textContent = messages[step];

    step++;

    if (water >= 100) {
      winGame();
    }
  } else {
    score -= 5;

    if (score < 0) {
      score = 0;
    }

    message.textContent = "Wrong choice! Try the correct supply in order.";
  }

  updateScreen();
}

function updateScreen() {
  scoreText.textContent = score;
  timerText.textContent = timeLeft;
  waterText.textContent = water + "%";
  meterFill.style.width = water + "%";
}

function winGame() {
  clearInterval(timer);
  gameStarted = false;
  message.textContent = "You win! You brought clean water to the village!";
}

function loseGame() {
  clearInterval(timer);
  gameStarted = false;
  message.textContent = "Time is up! Try again to help the village get clean water.";
}

function restartGame() {
  clearInterval(timer);

  score = 0;
  timeLeft = 45;
  water = 0;
  step = 0;
  gameStarted = false;

  resetPieces();
  updateScreen();

  message.textContent = "Click Start Game to begin.";
}

function resetPieces() {
  pipePiece.classList.remove("built");
  leakPiece.classList.remove("built");
  filterPiece.classList.remove("built");
  tankPiece.classList.remove("built");

  pipePiece.textContent = "Pipe";
  leakPiece.textContent = "Leak";
  filterPiece.textContent = "Filter";
  tankPiece.textContent = "Tank";
}