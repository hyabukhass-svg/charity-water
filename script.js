const titleScreen = document.getElementById("titleScreen");
const gameScreen = document.getElementById("gameScreen");
const startBtn = document.getElementById("startBtn");
const howBtn = document.getElementById("howBtn");
const howText = document.getElementById("howText");

const scoreText = document.getElementById("score");
const timerText = document.getElementById("timer");
const meterText = document.getElementById("meterText");
const meterFill = document.getElementById("meterFill");
const feedback = document.getElementById("feedback");

const supplyButtons = document.querySelectorAll(".supply-btn");

const restartBtn = document.getElementById("restartBtn");
const homeBtn = document.getElementById("homeBtn");
const pauseBtn = document.getElementById("pauseBtn");

const endModal = document.getElementById("endModal");
const endTitle = document.getElementById("endTitle");
const endMessage = document.getElementById("endMessage");
const playAgainBtn = document.getElementById("playAgainBtn");

const pipe1 = document.getElementById("pipe1");
const pipe2 = document.getElementById("pipe2");
const pipe3 = document.getElementById("pipe3");
const leak = document.getElementById("leak");
const filter = document.getElementById("filter");
const tank = document.getElementById("tank");

let score = 0;
let timeLeft = 60;
let waterMeter = 0;
let currentStep = 0;
let gameRunning = false;
let paused = false;
let timerInterval = null;

const steps = [
  {
    item: "pipe",
    message: "Great! The first pipe is connected.",
    points: 10,
    progress: 15,
    visual: () => pipe1.classList.add("active")
  },
  {
    item: "tool",
    message: "Nice work! You fixed the leak.",
    points: 15,
    progress: 20,
    visual: () => leak.classList.add("fixed")
  },
  {
    item: "pipe",
    message: "Good job! The second pipe is connected.",
    points: 10,
    progress: 15,
    visual: () => pipe2.classList.add("active")
  },
  {
    item: "filter",
    message: "Awesome! The water filter is installed.",
    points: 20,
    progress: 20,
    visual: () => filter.classList.add("active")
  },
  {
    item: "pipe",
    message: "Almost there! The final pipe is connected.",
    points: 10,
    progress: 15,
    visual: () => pipe3.classList.add("active")
  },
  {
    item: "tank",
    message: "Amazing! The water tank is ready.",
    points: 25,
    progress: 15,
    visual: () => tank.classList.add("active")
  }
];

howBtn.addEventListener("click", () => {
  howText.classList.toggle("hidden");
});

startBtn.addEventListener("click", () => {
  titleScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  startGame();
});

restartBtn.addEventListener("click", startGame);
playAgainBtn.addEventListener("click", () => {
  endModal.classList.add("hidden");
  startGame();
});

homeBtn.addEventListener("click", () => {
  stopTimer();
  gameScreen.classList.add("hidden");
  titleScreen.classList.remove("hidden");
  endModal.classList.add("hidden");
});

pauseBtn.addEventListener("click", () => {
  if (!gameRunning) return;

  paused = !paused;

  if (paused) {
    pauseBtn.textContent = "Resume";
    feedback.textContent = "Game paused.";
  } else {
    pauseBtn.textContent = "Pause";
    feedback.textContent = "Game resumed. Keep building!";
  }
});

supplyButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (!gameRunning || paused) return;

    const selectedItem = button.dataset.item;
    checkPlayerMove(selectedItem, button);
  });
});

function startGame() {
  score = 0;
  timeLeft = 60;
  waterMeter = 0;
  currentStep = 0;
  gameRunning = true;
  paused = false;

  pauseBtn.textContent = "Pause";
  feedback.textContent = "Start by clicking a pipe to connect the well.";

  endModal.classList.add("hidden");

  supplyButtons.forEach((button) => {
    button.disabled = false;
  });

  pipe1.classList.remove("active");
  pipe2.classList.remove("active");
  pipe3.classList.remove("active");
  leak.classList.remove("fixed");
  filter.classList.remove("active");
  tank.classList.remove("active");

  updateDisplay();
  stopTimer();
  startTimer();
}

function startTimer() {
  timerInterval = setInterval(() => {
    if (!gameRunning || paused) return;

    timeLeft--;
    updateDisplay();

    if (timeLeft <= 0) {
      loseGame();
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

function checkPlayerMove(selectedItem, button) {
  const correctStep = steps[currentStep];

  if (selectedItem === correctStep.item) {
    score += correctStep.points;
    waterMeter += correctStep.progress;

    if (waterMeter > 100) {
      waterMeter = 100;
    }

    feedback.textContent = correctStep.message;
    correctStep.visual();
    button.disabled = true;

    currentStep++;
    updateDisplay();

    if (waterMeter >= 100 || currentStep >= steps.length) {
      winGame();
    }
  } else {
    score -= 5;

    if (score < 0) {
      score = 0;
    }

    feedback.textContent = "Try again! That is not the supply needed right now.";
    updateDisplay();
  }
}

function updateDisplay() {
  scoreText.textContent = score;
  timerText.textContent = timeLeft;
  meterText.textContent = waterMeter + "%";
  meterFill.style.width = waterMeter + "%";
}

function winGame() {
  gameRunning = false;
  stopTimer();

  feedback.textContent = "You brought clean water to the village!";

  endTitle.textContent = "You Win!";
  endMessage.textContent =
    "Great job! You built a clean water system and helped the village get safe water.";

  endModal.classList.remove("hidden");
}

function loseGame() {
  gameRunning = false;
  stopTimer();

  feedback.textContent = "Time is up! The village still needs clean water.";

  endTitle.textContent = "Time is Up!";
  endMessage.textContent =
    "Try again! Connect the pipes, fix the leak, and complete the water system faster.";

  endModal.classList.remove("hidden");
}