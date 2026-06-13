const titleScreen = document.getElementById("titleScreen");
const gameScreen = document.getElementById("gameScreen");

const startBtn = document.getElementById("startBtn");
const howBtn = document.getElementById("howBtn");
const howText = document.getElementById("howText");

const levelText = document.getElementById("levelText");
const levelName = document.getElementById("levelName");
const goalText = document.getElementById("goalText");
const missionText = document.getElementById("missionText");

const scoreText = document.getElementById("scoreText");
const timerText = document.getElementById("timerText");
const meterText = document.getElementById("meterText");
const meterFill = document.getElementById("meterFill");
const streakText = document.getElementById("streakText");
const feedback = document.getElementById("feedback");

const supplyButtons = document.querySelectorAll(".supply-btn");
const buildSlots = document.querySelectorAll(".build-slot");
const pollutionLayer = document.getElementById("pollutionLayer");

const restartBtn = document.getElementById("restartBtn");
const homeBtn = document.getElementById("homeBtn");
const pauseBtn = document.getElementById("pauseBtn");

const endModal = document.getElementById("endModal");
const modalTitle = document.getElementById("modalTitle");
const modalMessage = document.getElementById("modalMessage");
const modalActionBtn = document.getElementById("modalActionBtn");
const modalHomeBtn = document.getElementById("modalHomeBtn");

let score = 0;
let timeLeft = 60;
let waterMeter = 0;
let streak = 0;
let currentStep = 0;
let currentLevel = 0;
let selectedItem = null;
let gameActive = false;
let paused = false;
let timerInterval = null;
let pollutionInterval = null;
let modalMode = "restart";

const levels = [
  {
    name: "Level 1: First Well",
    goal: "Connect the first clean water system.",
    mission: "Build a basic clean water path to the village.",
    time: 60,
    pollutionEvery: 9000,
    pollutionPenalty: 4,
    wrongPenalty: 3
  },
  {
    name: "Level 2: Faster Build",
    goal: "Build faster while protecting the water source.",
    mission: "Complete the system with less time and more pollution risk.",
    time: 50,
    pollutionEvery: 7000,
    pollutionPenalty: 5,
    wrongPenalty: 4
  },
  {
    name: "Level 3: Final Village",
    goal: "Finish the final project before time runs out.",
    mission: "Bring clean water to the final village under pressure.",
    time: 45,
    pollutionEvery: 5500,
    pollutionPenalty: 6,
    wrongPenalty: 5
  }
];

const steps = [
  {
    item: "pipe",
    zone: "pipe1",
    builtText: "✅ Pipe",
    message: "Great! The first pipe is connected.",
    points: 15,
    progress: 16
  },
  {
    item: "tool",
    zone: "leak",
    builtText: "✅ Fixed",
    message: "Nice work! You fixed the leak.",
    points: 20,
    progress: 18
  },
  {
    item: "pipe",
    zone: "pipe2",
    builtText: "✅ Pipe",
    message: "Good job! The second pipe is connected.",
    points: 15,
    progress: 16
  },
  {
    item: "filter",
    zone: "filter",
    builtText: "✅ Filter",
    message: "Awesome! The water filter is installed.",
    points: 25,
    progress: 18
  },
  {
    item: "pipe",
    zone: "pipe3",
    builtText: "✅ Pipe",
    message: "Almost there! The final pipe is connected.",
    points: 15,
    progress: 16
  },
  {
    item: "tank",
    zone: "tank",
    builtText: "✅ Tank",
    message: "Amazing! The water tank is ready.",
    points: 30,
    progress: 16
  }
];

howBtn.addEventListener("click", () => {
  howText.classList.toggle("hidden");
});

startBtn.addEventListener("click", () => {
  titleScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  startNewGame();
});

restartBtn.addEventListener("click", () => {
  startLevel(currentLevel);
});

homeBtn.addEventListener("click", () => {
  goHome();
});

pauseBtn.addEventListener("click", () => {
  if (!gameActive) return;

  paused = !paused;

  if (paused) {
    pauseBtn.textContent = "Resume";
    feedback.textContent = "Game paused.";
  } else {
    pauseBtn.textContent = "Pause";
    feedback.textContent = "Game resumed. Keep building!";
  }
});

modalHomeBtn.addEventListener("click", () => {
  goHome();
});

modalActionBtn.addEventListener("click", () => {
  endModal.classList.add("hidden");

  if (modalMode === "next") {
    currentLevel++;
    startLevel(currentLevel);
  } else if (modalMode === "newGame") {
    startNewGame();
  } else {
    startLevel(currentLevel);
  }
});

supplyButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (!gameActive || paused) return;

    selectedItem = button.dataset.item;

    supplyButtons.forEach((btn) => btn.classList.remove("selected"));
    button.classList.add("selected");

    const nextStep = steps[currentStep];
    feedback.textContent = `Selected ${button.textContent}. Now click the glowing area.`;

    highlightTarget(nextStep.zone);
  });
});

buildSlots.forEach((slot) => {
  slot.addEventListener("click", () => {
    if (!gameActive || paused) return;

    if (!selectedItem) {
      feedback.textContent = "Choose a supply first, then click the glowing area.";
      return;
    }

    checkBuildMove(slot.dataset.zone);
  });
});

function startNewGame() {
  score = 0;
  currentLevel = 0;
  startLevel(currentLevel);
}

function startLevel(levelIndex) {
  const level = levels[levelIndex];

  timeLeft = level.time;
  waterMeter = 0;
  streak = 0;
  currentStep = 0;
  selectedItem = null;
  gameActive = true;
  paused = false;

  levelText.textContent = levelIndex + 1;
  levelName.textContent = level.name;
  goalText.textContent = level.goal;
  missionText.textContent = level.mission;

  pauseBtn.textContent = "Pause";
  feedback.textContent = "Select a pipe to begin building the water system.";

  endModal.classList.add("hidden");

  resetVisuals();
  updateDisplay();
  highlightTarget(steps[currentStep].zone);

  stopTimers();
  startTimer();
  startPollution();
}

function resetVisuals() {
  buildSlots.forEach((slot) => {
    slot.classList.remove("built");
    slot.classList.remove("active-target");
    slot.textContent = slot.dataset.empty;
  });

  supplyButtons.forEach((button) => {
    button.classList.remove("selected");
  });

  pollutionLayer.innerHTML = "";
}

function startTimer() {
  timerInterval = setInterval(() => {
    if (!gameActive || paused) return;

    timeLeft--;
    updateDisplay();

    if (timeLeft <= 0) {
      loseLevel();
    }
  }, 1000);
}

function startPollution() {
  const level = levels[currentLevel];

  pollutionInterval = setInterval(() => {
    if (!gameActive || paused) return;
    spawnPollution();
  }, level.pollutionEvery);
}

function stopTimers() {
  clearInterval(timerInterval);
  clearInterval(pollutionInterval);
}

function highlightTarget(zoneName) {
  buildSlots.forEach((slot) => {
    slot.classList.remove("active-target");
  });

  const target = document.querySelector(`[data-zone="${zoneName}"]`);

  if (target) {
    target.classList.add("active-target");
  }
}

function checkBuildMove(zoneClicked) {
  const step = steps[currentStep];

  if (selectedItem === step.item && zoneClicked === step.zone) {
    correctMove(step);
  } else {
    wrongMove();
  }
}

function correctMove(step) {
  const target = document.querySelector(`[data-zone="${step.zone}"]`);

  target.classList.add("built");
  target.classList.remove("active-target");
  target.textContent = step.builtText;

  score += step.points;
  waterMeter += step.progress;
  streak++;

  if (streak > 0 && streak % 3 === 0) {
    score += 10;
    timeLeft += 3;
    feedback.textContent = `${step.message} Bonus streak! +10 points and +3 seconds.`;
  } else {
    feedback.textContent = step.message;
  }

  if (waterMeter > 100) {
    waterMeter = 100;
  }

  selectedItem = null;
  supplyButtons.forEach((button) => button.classList.remove("selected"));

  currentStep++;
  updateDisplay();

  if (currentStep >= steps.length || waterMeter >= 100) {
    completeLevel();
  } else {
    highlightTarget(steps[currentStep].zone);
  }
}

function wrongMove() {
  const level = levels[currentLevel];

  streak = 0;
  score -= 5;
  timeLeft -= level.wrongPenalty;

  if (score < 0) score = 0;
  if (timeLeft < 0) timeLeft = 0;

  feedback.textContent = "Wrong move! Check which supply should go in the glowing area.";
  updateDisplay();

  if (timeLeft <= 0) {
    loseLevel();
  }
}

function spawnPollution() {
  const pollution = document.createElement("button");
  pollution.classList.add("pollution");
  pollution.textContent = "☠️";

  const x = Math.floor(Math.random() * 75) + 10;
  const y = Math.floor(Math.random() * 55) + 20;

  pollution.style.left = x + "%";
  pollution.style.top = y + "%";

  pollutionLayer.appendChild(pollution);

  pollution.addEventListener("click", () => {
    if (!gameActive || paused) return;

    score += 10;
    timeLeft += 2;
    feedback.textContent = "Pollution cleaned! +10 points and +2 seconds.";
    pollution.remove();
    updateDisplay();
  });

  setTimeout(() => {
    checkPollutionMissed(pollution);
  }, 3500);
}

function checkPollutionMissed(pollution) {
  if (!pollution.isConnected) return;

  if (paused) {
    setTimeout(() => {
      checkPollutionMissed(pollution);
    }, 1000);
    return;
  }

  const level = levels[currentLevel];

  pollution.remove();
  timeLeft -= level.pollutionPenalty;
  streak = 0;

  if (timeLeft < 0) timeLeft = 0;

  feedback.textContent = "Pollution reached the water source! Time penalty.";
  updateDisplay();

  if (timeLeft <= 0) {
    loseLevel();
  }
}

function completeLevel() {
  gameActive = false;
  stopTimers();

  pollutionLayer.innerHTML = "";

  if (currentLevel < levels.length - 1) {
    modalMode = "next";
    modalTitle.textContent = "Level Complete!";
    modalMessage.textContent =
      "Great job! You completed this clean water project. Ready for the next village?";
    modalActionBtn.textContent = "Next Level";
  } else {
    modalMode = "newGame";
    modalTitle.textContent = "You Win!";
    modalMessage.textContent =
      "Amazing! You helped bring clean water to every village. This connects to charity: water’s mission of helping communities access safe water.";
    modalActionBtn.textContent = "Play Again";
  }

  endModal.classList.remove("hidden");
}

function loseLevel() {
  gameActive = false;
  stopTimers();

  pollutionLayer.innerHTML = "";

  modalMode = "restart";
  modalTitle.textContent = "Time is Up!";
  modalMessage.textContent =
    "The village still needs clean water. Try again and complete the system faster.";
  modalActionBtn.textContent = "Try Again";

  endModal.classList.remove("hidden");
}

function updateDisplay() {
  scoreText.textContent = score;
  timerText.textContent = timeLeft;
  meterText.textContent = waterMeter + "%";
  meterFill.style.width = waterMeter + "%";
  streakText.textContent = streak + " correct move" + (streak === 1 ? "" : "s");
}

function goHome() {
  gameActive = false;
  paused = false;
  stopTimers();

  pollutionLayer.innerHTML = "";
  endModal.classList.add("hidden");
  gameScreen.classList.add("hidden");
  titleScreen.classList.remove("hidden");
}