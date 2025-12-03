const fruits = ["🍌","🍎","🍇","🍉","🍒","🍍","🥭","🍑"];
let cards = [];
const board = document.getElementById('board');
let firstCard = null;
let secondCard = null;
let lock = false;
let matches = 0;

function shuffle(arr){
  for(let i=arr.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [arr[i],arr[j]]=[arr[j],arr[i]];
  }
  return arr;
}

function createBoard(){
  board.innerHTML='';
  matches=0;
  firstCard=secondCard=null;
  lock=false;
  cards = shuffle([...fruits, ...fruits]);
  cards.forEach(fruit=>{
    const card=document.createElement('div');
    card.className='card';
    card.dataset.value=fruit;

    const inner=document.createElement('div');
    inner.className='card-inner';

    const back=document.createElement('div');
    back.className='card-face card-back';
    back.textContent='🍉';

    const front=document.createElement('div');
    front.className='card-face card-front';
    front.textContent=fruit;

    inner.appendChild(back);
    inner.appendChild(front);
    card.appendChild(inner);
    card.addEventListener('click',flipCard);
    board.appendChild(card);
  });
}

function flipCard(e){
  if(lock) return;
  const card=e.currentTarget;
  if(card.classList.contains('flipped') || card.classList.contains('matched')) return;

  card.classList.add('flipped');
  if(!firstCard){firstCard=card;return;}
  secondCard=card;
  checkMatch();
}

function checkMatch(){
  const match = firstCard.dataset.value === secondCard.dataset.value;
  if(match){
    firstCard.classList.add('matched');
    secondCard.classList.add('matched');
    matches++;
    resetTurn();
  } else {
    lock=true;
    setTimeout(()=>{
      firstCard.classList.remove('flipped');
      secondCard.classList.remove('flipped');
      resetTurn();
    },800);
  }

  if(matches===fruits.length){
    setTimeout(()=>alert('🎉 You matched all fruits!'),300);
  }
}

function resetTurn(){
  [firstCard, secondCard]=[null,null];
  lock=false;
}

// --- EXTERNAL BANANA QUIZ VERSION --- //
document.getElementById('hintBtn').addEventListener('click', () => {
  // Ask the player if they want to open Banana Quiz
  const openQuiz = confirm("Need help? Open the Banana Quiz challenge in a new tab?");
  if (openQuiz) {
    // Open the Banana Quiz site
    window.open("https://marcconrad.com/uob/banana/", "_blank");

    // Simulate: After player returns from quiz, show reward button
    setTimeout(() => {
      alert("🎉 Welcome back! If you answered the Banana Quiz correctly, claim your reward!");
      showRewardButton();
    }, 6000); // Wait 6 seconds to simulate player completing quiz
  }
});

// --- SHOW REWARD BUTTON --- //
function showRewardButton() {
  // Avoid duplicates
  if (document.getElementById('rewardBtn')) return;

  const rewardBtn = document.createElement('button');
  rewardBtn.id = 'rewardBtn';
  rewardBtn.textContent = '🎁 Get Reward 🍌';
  rewardBtn.style.display = 'block';
  rewardBtn.style.margin = '20px auto';
  rewardBtn.style.padding = '10px 20px';
  rewardBtn.style.background = '#ffb703';
  rewardBtn.style.color = '#fff';
  rewardBtn.style.border = 'none';
  rewardBtn.style.borderRadius = '8px';
  rewardBtn.style.cursor = 'pointer';
  rewardBtn.style.fontSize = '1em';

  document.body.appendChild(rewardBtn);

  rewardBtn.addEventListener('click', () => {
    alert('🎉 Reward activated! All fruits will be revealed for a few seconds!');
    revealAllCardsTemporarily();
    rewardBtn.remove(); // remove after one use
  });
}

// --- FLIP ALL CARDS TEMPORARILY --- //
function revealAllCardsTemporarily() {
  const allCards = document.querySelectorAll('.card');
  allCards.forEach(c => c.classList.add('flipped'));
  
  setTimeout(() => {
    allCards.forEach(c => {
      if (!c.classList.contains('matched')) {
        c.classList.remove('flipped');
      }
    });
  }, 3000);
}



// helper
function revealAllCardsTemporarily() {
  const all = document.querySelectorAll(".card");
  all.forEach(c => c.classList.add("flipped"));
  setTimeout(() => {
    all.forEach(c => {
      if (!c.classList.contains("matched")) c.classList.remove("flipped");
    });
  }, 3000);
}



document.getElementById('restartBtn').addEventListener('click',createBoard);

createBoard();



const wrapper = document.querySelector('.wrapper');
const loginLink = document.querySelector('.login-link');
const registerLink = document.querySelector('.register-link');
const btnPopup = document.querySelector('.btnLogin-popup');
const iconClose = document.querySelector('.icon-close');
const content = document.querySelector('.principal');


registerLink.addEventListener('click', ()=> {
    wrapper.classList.add('active');
});

loginLink.addEventListener('click', ()=> {
    wrapper.classList.remove('active');
});

btnPopup.addEventListener('click', ()=> {
    wrapper.classList.add('active-popup');
});

btnPopup.addEventListener('click', () =>{
    content.classList.add('active');
})

iconClose.addEventListener('click', ()=> {
    wrapper.classList.remove('active-popup');
});

iconClose.addEventListener('click', ()=> {
    content.classList.remove('active');
});