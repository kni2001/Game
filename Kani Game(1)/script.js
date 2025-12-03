function openLogin() {
  // For now, just go to a separate login page
  window.location.href = "login.html";
}

function openRegister() {
  // For now, just go to a separate register page
  window.location.href = "register.html";
}

function goBack() {
  window.location.href = "index.html";
}

function register() {
  const user = document.getElementById("regUser").value.trim();
  const pass = document.getElementById("regPass").value.trim();

  if (user && pass) {
    localStorage.setItem(user, pass);
    alert("Registration successful! 🍍");
    window.location.href = "login.html";
  } else {
    alert("Please fill all fields!");
  }
}

function login() {
  const user = document.getElementById("loginUser").value.trim();
  const pass = document.getElementById("loginPass").value.trim();
  const storedPass = localStorage.getItem(user);

  if (storedPass === pass && user && pass) {
    alert(`Welcome back, ${user}! 🍉`);
    window.location.href = "level.html"; // redirect to your game page
  } else {
    alert("Invalid username or password!");
  }
}

function selectLevel(level) {
  localStorage.setItem("selectedLevel", level);
  alert(`You selected ${level.toUpperCase()} level! 🍒`);
  window.location.href = "game.html";
}

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

// 🟢 Level configurations
let cardSize; // new variable

if (level === "easy") {
    board.style.gridTemplateColumns = "repeat(4, 100px)";
    attempts = 10;
    timeLeft = 60;
    cardSize = 100; // px
    cards = [...fruits.slice(0, 8), ...fruits.slice(0, 8)].sort(() => Math.random() - 0.5); // 16 cards
} 
else if (level === "medium") {
    board.style.gridTemplateColumns = "repeat(5, 90px)";
    attempts = 15;
    timeLeft = 80;
    cardSize = 90; // smaller than easy
    cards = [...fruits.slice(0, 13)];
    cards = [...cards, ...cards.slice(0, 12)].sort(() => Math.random() - 0.5); // 25 cards
} 
else if (level === "hard") {
    board.style.gridTemplateColumns = "repeat(6, 80px)";
    attempts = 20;
    timeLeft = 100;
    cardSize = 80; // smallest
    cards = [...fruits.slice(0, 18), ...fruits.slice(0, 18)].sort(() => Math.random() - 0.5); // 36 cards
}



  // Create cards
cards.forEach((fruit, index) => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.dataset.value = fruit;
    card.dataset.index = index;
    
    // Set dynamic size
    card.style.width = cardSize + "px";
    card.style.height = cardSize + "px";
    
    card.addEventListener("click", flipCard);
    board.appendChild(card);
});


  // Update stats
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

/* ===== 🍌 Banana API Feature ===== */
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

window.onload = startGame;

let triviaData = null;

document.getElementById("hintBtn").addEventListener("click", () => {
  gamePaused = true;
  loadTriviaQuestion();
});

// Function to fetch and show trivia question
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

// Function to check trivia answer
function checkTriviaAnswer(selected) {
  const message = document.getElementById("triviaMessage");

  if (selected === triviaData.correct) {
    // ✅ Correct answer — close trivia modal automatically
    document.getElementById("triviaModal").style.display = "none";
    message.textContent = "";

    // Flip only unmatched cards face-up
    const allCards = document.querySelectorAll(".card");

    allCards.forEach(card => {
      // Flip only if not already matched (flipped)
      if (!card.classList.contains("flipped")) {
        card.textContent = card.dataset.value;
        card.classList.add("hint-temp");
      }
    });

    // Keep them visible for 5 seconds, then flip only unmatched ones down again
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
    // ❌ Wrong answer — show message briefly, then load another trivia question
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






