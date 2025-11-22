let buttonColors = ["red", "green", "yellow", "blue"];
let gamePattern = [];
let userPattern = [];
let started = false;
let level = 0;

const sounds = {
  red: document.getElementById("red-sound"),
  green: document.getElementById("green-sound"),
  yellow: document.getElementById("yellow-sound"),
  blue: document.getElementById("blue-sound"),
  wrong: document.getElementById("wrong-sound")
};

// START GAME
document.addEventListener("keydown", startGame);
document.addEventListener("touchstart", startGame);

function startGame() {
  if (!started) {
    nextSequence();
    started = true;
  }
}

// NEXT LEVEL
function nextSequence() {
  userPattern = [];
  level++;
  document.getElementById("level-title").innerText = "Level " + level;

  let randomColor = buttonColors[Math.floor(Math.random() * 4)];
  gamePattern.push(randomColor);

  animateButton(randomColor);
  playSound(randomColor);
}

// BUTTON CLICK
document.querySelectorAll(".btn").forEach(btn => {
  btn.addEventListener("click", function() {
    if (!started) return;

    let userColor = this.id;
    userPattern.push(userColor);

    playSound(userColor);
    animateButton(userColor);
    checkAnswer(userPattern.length - 1);
  });
});

// CHECK ANSWER
function checkAnswer(index) {
  if (userPattern[index] === gamePattern[index]) {
    if (userPattern.length === gamePattern.length) {
      setTimeout(nextSequence, 800);
    }
  } else {
    sounds.wrong.play();
    document.body.classList.add("game-over");
    document.getElementById("level-title").innerText = "Game Over! Press Any Key";

    setTimeout(() => {
      document.body.classList.remove("game-over");
    }, 300);

    resetGame();
  }
}

// SOUND
function playSound(color) {
  sounds[color].currentTime = 0;
  sounds[color].play();
}

// ANIMATION
function animateButton(color) {
  let btn = document.getElementById(color);
  btn.classList.add("pressed");

  setTimeout(() => {
    btn.classList.remove("pressed");
  }, 150);
}

// RESET
function resetGame() {
  gamePattern = [];
  userPattern = [];
  level = 0;
  started = false;
}
