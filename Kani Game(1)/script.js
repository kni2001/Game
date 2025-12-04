/* script.js - updated to call PHP backend for auth & scores
   Keep the rest of your game logic unchanged. */

// Navigation helpers
function openLogin() {
  window.location.href = "login.html";
}

function openRegister() {
  window.location.href = "register.html";
}

function goBack() {
  window.location.href = "index.html";
}

function openScoreboard() {
  // open the leaderboard page we added
  window.location.href = "leaderboard.html";
}

/* ===== AUTH: register & login call backend ===== */

function register() {
  const user = document.getElementById("regUser").value.trim();
  const pass = document.getElementById("regPass").value.trim();

  if (!user || !pass) {
    alert("Please fill all fields!");
    return;
  }

  fetch("register.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: user, password: pass, display_name: user })
  })
    .then(r => r.json())
    .then(d => {
      if (d.success) {
        alert("Registration successful! 🍍");
        window.location.href = "login.html";
      } else {
        alert(d.message || "Registration failed");
      }
    })
    .catch(err => {
      console.error(err);
      alert("Server error during registration");
    });
}

function login() {
  const user = document.getElementById("loginUser").value.trim();
  const pass = document.getElementById("loginPass").value.trim();

  if (!user || !pass) {
    alert("Please fill all fields!");
    return;
  }

  fetch("login.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: user, password: pass })
  })
    .then(r => r.json())
    .then(d => {
      if (d.success) {
        alert(`Welcome back, ${d.user.display_name || d.user.username}! 🍉`);
        window.location.href = "level.html";
      } else {
        alert(d.message || "Login failed");
      }
    })
    .catch(err => {
      console.error(err);
      alert("Server error during login");
    });
}

/* ===== keep selectLevel as-is (stores chosen level in localStorage) ===== */

function selectLevel(level) {
  localStorage.setItem("selectedLevel", level);
  alert(`You selected ${level.toUpperCase()} level! 🍒`);
  window.location.href = "game.html";
}

/* ===== Game logic (unchanged) ===== */
/* ... paste the rest of your existing game logic here exactly as it was ... */
/* We'll include the same startGame, timer, flipCard, checkMatch, getBonusAttempt, banana/trivia code etc. */

/* START of game code (copied from your provided script) */

let cards = [];
let flippedCards = [];
let matchedCards = 0;
let attempts;
let timeLeft;
let timer;
let score = 0;
let level = localStorage.getItem("selectedLevel") || "easy";
let gamePaused = false;
let gameOver = false;

// Fruit emojis (enough for all 3 levels)
const fruits = [
  "🍎", "🍌", "🍓", "🍊", "🍇", "🍉", "🍍", "🥝",
  "🍒", "🍑", "🥥", "🍋", "🍐", "🍈", "🍏", "🥭", "🫐", "🥑"
];

function startGame() {
  const board = document.getElementById("game-board");
  board.innerHTML = "";

  gameOver = false;
  matchedCards = 0;
  flippedCards = [];
  score = 0;

  let cardSize;

  if (level === "easy") {
      board.style.gridTemplateColumns = "repeat(4, 100px)";
      attempts = 10;
      timeLeft = 60;
      cardSize = 100;
      cards = [...fruits.slice(0, 8), ...fruits.slice(0, 8)].sort(() => Math.random() - 0.5);
  } 
  else if (level === "medium") {
      board.style.gridTemplateColumns = "repeat(5, 90px)";
      attempts = 15;
      timeLeft = 80;
      cardSize = 90;
      cards = [...fruits.slice(0, 13)];
      cards = [...cards, ...cards.slice(0, 12)].sort(() => Math.random() - 0.5);
  } 
  else if (level === "hard") {
      board.style.gridTemplateColumns = "repeat(6, 80px)";
      attempts = 20;
      timeLeft = 100;
      cardSize = 80;
      cards = [...fruits.slice(0, 18), ...fruits.slice(0, 18)].sort(() => Math.random() - 0.5);
  }

  cards.forEach((fruit, index) => {
      const card = document.createElement("div");
      card.classList.add("card");
      card.dataset.value = fruit;
      card.dataset.index = index;
      card.style.width = cardSize + "px";
      card.style.height = cardSize + "px";
      card.addEventListener("click", flipCard);
      board.appendChild(card);
  });

  document.getElementById("attempts").textContent = attempts;
  document.getElementById("time").textContent = timeLeft;
  document.getElementById("score").textContent = score;

  startTimer();
}

function startTimer() {
  clearInterval(timer);
  timer = setInterval(() => {
    if (!gamePaused && !gameOver) {
      timeLeft--;
      document.getElementById("time").textContent = timeLeft;
      if (timeLeft <= 0) {
        timeLeft = 0;
        endGame("⏰ Time's up!");
      }
    }
  }, 1000);
}

function flipCard() {
  if (gamePaused || gameOver) return;
  const card = this;
  if (card.classList.contains("flipped") || flippedCards.length === 2) return;

  card.textContent = card.dataset.value;
  card.classList.add("flipped");
  flippedCards.push(card);

  if (flippedCards.length === 2) {
    setTimeout(checkMatch, 800);
  }
}

function checkMatch() {
  const [card1, card2] = flippedCards;
  if (card1.dataset.value === card2.dataset.value) {
    matchedCards += 2;
    score += 5;
    document.getElementById("score").textContent = score;
    flippedCards = [];

    if (matchedCards === cards.length) {
      endGame(`🎉 You matched all fruits! Final Score: ${score}`);
    }
  } else {
    attempts--;
    score = Math.max(0, score - 5);
    document.getElementById("attempts").textContent = attempts;
    document.getElementById("score").textContent = score;

    card1.classList.remove("flipped");
    card2.classList.remove("flipped");
    card1.textContent = "";
    card2.textContent = "";
    flippedCards = [];

    if (attempts <= 0) {
      attempts = 0;
      endGame(`😢 No attempts left! Final Score: ${score}`);
    }
  }
}

function endGame(message) {
  clearInterval(timer);
  gameOver = true;
  setTimeout(() => {
    alert(message);
    // Submit score to server when game ends (attempt to save, but do not block)
    submitScoreToServer(score, level);
  }, 300);
}

function resumeGameAfterBonus() {
  if (attempts > 0 && timeLeft > 0) {
    gameOver = false;
    startTimer();
  }
}

function goBackToLevel() {
  window.location.href = "level.html";
}

/* ===== Banana API Feature ===== */
let bananaData;

function getBonusAttempt() {
  gamePaused = true;
  fetch("https://marcconrad.com/uob/banana/api.php")
    .then(res => res.json())
    .then(data => {
      bananaData = data;
      document.getElementById("bananaImage").src = data.question;
      document.getElementById("bananaModal").style.display = "flex";
    })
    .catch(err => alert("Error loading puzzle!"));
}

function submitBanana() {
  const answer = document.getElementById("bananaAnswer").value.trim();
  const message = document.getElementById("bananaMessage");

  if (answer === bananaData.solution.toString()) {
    attempts++;
    document.getElementById("attempts").textContent = attempts;
    message.textContent = "✅ Correct! You earned 1 attempt!";
    setTimeout(() => {
      closeBanana();
      gamePaused = false;
      resumeGameAfterBonus();
    }, 1000);
  } else {
    message.textContent = "❌ Incorrect! Try again.";
  }
}

function closeBanana() {
  document.getElementById("bananaModal").style.display = "none";
  document.getElementById("bananaMessage").textContent = "";
  document.getElementById("bananaAnswer").value = "";
  gamePaused = false;
  if (!gameOver) startTimer();
}

window.onload = function () {
  // If this is the game page, start game (original behavior)
  if (document.getElementById("game-board")) {
    // ensure level variable is updated from localStorage when loading game page
    level = localStorage.getItem("selectedLevel") || "easy";
    startGame();
  }
};

let triviaData = null;

document.addEventListener('click', function setupHintBtn(e) {
  // safe hookup if hintBtn exists at runtime
  const hintBtn = document.getElementById("hintBtn");
  if (hintBtn) {
    hintBtn.removeEventListener('click', loadTriviaQuestionSafe);
    hintBtn.addEventListener('click', loadTriviaQuestionSafe);
    document.removeEventListener('click', setupHintBtn);
  }
});

function loadTriviaQuestionSafe() {
  gamePaused = true;
  loadTriviaQuestion();
}

function loadTriviaQuestion() {
  fetch("https://opentdb.com/api.php?amount=1&type=multiple")
    .then(res => res.json())
    .then(data => {
      const questionData = data.results[0];

      const options = [...questionData.incorrect_answers, questionData.correct_answer]
        .sort(() => Math.random() - 0.5);

      triviaData = {
        question: questionData.question,
        correct: questionData.correct_answer
      };

      document.getElementById("triviaQuestion").innerHTML = triviaData.question;

      const optionsDiv = document.getElementById("triviaOptions");
      optionsDiv.innerHTML = "";

      options.forEach(option => {
        const btn = document.createElement("button");
        btn.textContent = option;
        btn.classList.add("trivia-option-btn");
        btn.onclick = () => checkTriviaAnswer(option);
        optionsDiv.appendChild(btn);
      });

      document.getElementById("triviaMessage").textContent = "";
      document.getElementById("triviaModal").style.display = "flex";
    })
    .catch(err => {
      alert("Error loading trivia question!");
      console.error(err);
    });
}

function checkTriviaAnswer(selected) {
  const message = document.getElementById("triviaMessage");

  if (selected === triviaData.correct) {
    document.getElementById("triviaModal").style.display = "none";
    message.textContent = "";

    const allCards = document.querySelectorAll(".card");

    allCards.forEach(card => {
      if (!card.classList.contains("flipped")) {
        card.textContent = card.dataset.value;
        card.classList.add("hint-temp");
      }
    });

    setTimeout(() => {
      allCards.forEach(card => {
        if (card.classList.contains("hint-temp")) {
          card.textContent = "";
          card.classList.remove("hint-temp");
        }
      });
      gamePaused = false;
    }, 5000);

  } else {
    message.textContent = "❌ Wrong! Try another question...";
    setTimeout(() => {
      loadTriviaQuestion();
    }, 1000);
  }
}

function closeTrivia() {
  document.getElementById("triviaModal").style.display = "none";
  gamePaused = false;
}

/* ===== Submit score helper ===== */
function submitScoreToServer(finalScore, levelName) {
  // try to save the score; if user not logged in, server returns 401 and we silently ignore
  fetch('add_score.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ score: finalScore, level: levelName })
  })
  .then(r => r.json())
  .then(d => {
    // optional: notify player
    if (d && d.success) {
      console.log('Score saved');
    } else {
      console.log('Score not saved:', d.message || d);
    }
  })
  .catch(err => {
    console.error('Error saving score', err);
  });
}

/* ===== End of script.js ===== */

const music = document.getElementById("music");
const musicBtn = document.getElementById("playMusicBtn");

musicBtn.addEventListener("click", () => {
    if (music.paused) {
        music.play();
        musicBtn.textContent = "Pause Music ⏸️";
    } else {
        music.pause();
        musicBtn.textContent = "Play Music 🎵";
    }
});