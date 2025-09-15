const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status");
const restartBtn = document.getElementById("restart");
const scoreEl = document.getElementById("score");

let board = Array(9).fill("");
let currentLevel = "easy";
let score = JSON.parse(localStorage.getItem("score")) || {player:0, bot:0, draw:0};

// Смена сложности
document.querySelectorAll("#difficulty button").forEach(btn=>{
    btn.addEventListener("click", ()=> currentLevel = btn.dataset.level);
});

// Рендер доски
function renderBoard(){
    boardEl.innerHTML = "";
    board.forEach((cell, i)=>{
        const div = document.createElement("div");
        div.classList.add("cell");
        if(cell) div.classList.add("taken");
        div.textContent = cell;
        div.addEventListener("click", ()=> playerMove(i));
        boardEl.appendChild(div);
    });
}

// Проверка победителя
function checkWinner(b){
    const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for(const [a,b1,c] of lines){
        if(b[a] && b[a]===b[b1] && b[a]===b[c]) return b[a];
    }
    if(b.every(cell=>cell)) return "draw";
    return null;
}

// Ход игрока
function playerMove(idx){
    if(board[idx]) return;
    board[idx] = "X";
    let winner = checkWinner(board);
    if(winner){ endGame(winner); return; }
    botMove();
}

// Ход бота
function botMove(){
    let idx;
    const empty = board.map((v,i)=>v?null:i).filter(i=>i!==null);
    if(currentLevel==="easy"){
        idx = empty[Math.floor(Math.random()*empty.length)];
    } else if(currentLevel==="medium"){
        idx = findBlockOrRandom();
    } else { // Hard
        idx = findBestMove(board,"O");
    }
    board[idx]="O";
    let winner = checkWinner(board);
    if(winner){ endGame(winner); return; }
    renderBoard();
}

// Medium логика
function findBlockOrRandom(){
    for(let i=0;i<9;i++){
        if(!board[i]){
            board[i]="X";
            if(checkWinner(board)==="X"){ board[i]=null; return i; }
            board[i]=null;
        }
    }
    const empty = board.map((v,i)=>v?null:i).filter(i=>i!==null);
    return empty[Math.floor(Math.random()*empty.length)];
}

// Hard логика (placeholder, можно добавить Minimax)
function findBestMove(b, mark){
    const empty = b.map((v,i)=>v?null:i).filter(i=>i!==null);
    return empty[Math.floor(Math.random()*empty.length)];
}

// Конец игры
function endGame(winner){
    if(winner==="X"){score.player++; statusEl.textContent="You won!";}
    else if(winner==="O"){score.bot++; statusEl.textContent="Bot won!";}
    else{score.draw++; statusEl.textContent="Draw!";}
    localStorage.setItem("score", JSON.stringify(score));
    updateScore();
    renderBoard();
}

// Обновление счёта
function updateScore(){
    scoreEl.textContent = `Score: Player ${score.player} - Bot ${score.bot} - Draw ${score.draw}`;
}

// Перезапуск
restartBtn.addEventListener("click", ()=>{
    board.fill("");
    statusEl.textContent="";
    renderBoard();
});

renderBoard();
updateScore();