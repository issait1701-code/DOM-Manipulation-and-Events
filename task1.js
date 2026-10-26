// Change these constants to change the game rules.
const MIN_NUMBER = 1;
const MAX_NUMBER = 20;
const START_LIVES = 3;
const ZERO = 0;
const STEP = 1;

const prediction = document.getElementById("prediction");
const guessButton = document.getElementById("guess-button");
const restartButton = document.getElementById("restart-button");
const message = document.getElementById("game-message");
const numberBox = document.getElementById("number-box");

let lives = START_LIVES;
let streak = ZERO;
let bestStreak = ZERO;
let currentNumber = randomNumber();
let previousNumber = null;

function randomNumber() {
  return Math.floor(Math.random() * (MAX_NUMBER - MIN_NUMBER + STEP)) + MIN_NUMBER;
}

function showMessage(text, type) {
  message.textContent = text;
  message.classList.remove("success", "error");
  if (type) {
    message.classList.add(type);
  }
}

function renderGame() {
  document.getElementById("game-rules").textContent =
    `Numbers are from ${MIN_NUMBER} to ${MAX_NUMBER}. You have ${START_LIVES} lives. Equal numbers count as a correct guess.`;
  document.getElementById("lives").textContent = lives;
  document.getElementById("streak").textContent = streak;
  document.getElementById("best-streak").textContent = bestStreak;
  document.getElementById("current-number").textContent = currentNumber;
  document.getElementById("previous-number").textContent =
    previousNumber === null ? "Make your first guess." : `Previous number: ${previousNumber}`;
  guessButton.disabled = lives === ZERO;
  prediction.disabled = lives === ZERO;
}

function makeGuess() {
  if (lives === ZERO) {
    showMessage("The game is over. Press Restart to play again.", "error");
    return;
  }

  const choice = prediction.value;
  if (choice !== "higher" && choice !== "lower") {
    showMessage("Choose Higher or Lower first. No life was lost.", "error");
    return;
  }

  const nextNumber = randomNumber();
  let feedback;
  let correct;

  // Three outcomes: equal, correct direction, or wrong direction.
  if (nextNumber === currentNumber) {
    correct = true;
    feedback = `Equal: ${currentNumber} and ${nextNumber}. Your guess counts as correct!`;
  } else if ((choice === "higher" && nextNumber > currentNumber) ||
             (choice === "lower" && nextNumber < currentNumber)) {
    correct = true;
    feedback = `Correct! ${currentNumber} became ${nextNumber}.`;
  } else {
    correct = false;
    feedback = `Wrong guess. ${currentNumber} became ${nextNumber}. You lost a life.`;
  }

  if (correct) {
    streak += STEP;
    bestStreak = Math.max(bestStreak, streak);
  } else {
    lives -= STEP;
    streak = ZERO;
  }

  previousNumber = currentNumber;
  currentNumber = nextNumber;
  numberBox.classList.toggle("win", correct);
  numberBox.classList.toggle("loss", !correct);
  if (lives === ZERO) {
    feedback += ` Game over. Best streak: ${bestStreak}. Press Restart.`;
  }
  showMessage(feedback, correct ? "success" : "error");
  renderGame();
}

function restartGame() {
  lives = START_LIVES;
  streak = ZERO;
  currentNumber = randomNumber();
  previousNumber = null;
  prediction.value = "";
  numberBox.classList.remove("win", "loss");
  showMessage("New game. Choose a direction and check your guess.", "");
  renderGame();
  prediction.focus();
}

guessButton.addEventListener("click", makeGuess);
restartButton.addEventListener("click", restartGame);
showMessage("Choose a direction and check your guess.", "");
renderGame();
