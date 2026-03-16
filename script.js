/* ═══════════════════════════════════════════════
   ARCADE X  –  script.js
   Board: TTT 3x3 | TTT 5x5 | Connect 4
   Arcade: Bubble Battle | Snake | Breakout | Flappy
   ═══════════════════════════════════════════════ */

// ── GLOBALS ────────────────────────────────────
let lang      = localStorage.getItem('lang') || 'en';
let firstMode = localStorage.getItem('firstMode') || 'player';
let currentGame = null;
let gameMode  = 'bot';
let difficulty = 'easy';
let gameActive = false;
let gameCount  = 0;
let scores     = { p1:0, p2:0, draw:0 };

const T = {
  en:{ player:'PLAYER',bot:'BOT',player2:'P2',draw:'DRAW',
       yourTurn:'YOUR TURN',botThinking:'BOT THINKING…',
       p1Turn:'PLAYER 1',p2Turn:'PLAYER 2',
       youWin:'🎉 YOU WIN!',botWins:'🤖 BOT WINS!',
       p1Wins:'🎉 P1 WINS!',p2Wins:'🎉 P2 WINS!',drawMsg:'🤝 DRAW!'},
  ru:{ player:'ИГРОК',bot:'БОТ',player2:'ИГ2',draw:'НИЧЬЯ',
       yourTurn:'ВАШ ХОД',botThinking:'БОТ ДУМАЕТ…',
       p1Turn:'ИГРОК 1',p2Turn:'ИГРОК 2',
       youWin:'🎉 ПОБЕДА!',botWins:'🤖 БОТ ПОБЕДИЛ!',
       p1Wins:'🎉 ИГ1 ПОБЕДИЛ!',p2Wins:'🎉 ИГ2 ПОБЕДИЛ!',drawMsg:'🤝 НИЧЬЯ!'},
  it:{ player:'GIOCATORE',bot:'BOT',player2:'G2',draw:'PARI',
       yourTurn:'IL TUO TURNO',botThinking:'BOT STA PENSANDO…',
       p1Turn:'GIOCATORE 1',p2Turn:'GIOCATORE 2',
       youWin:'🎉 HAI VINTO!',botWins:'🤖 HA VINTO IL BOT!',
       p1Wins:'🎉 VINCE G1!',p2Wins:'🎉 VINCE G2!',drawMsg:'🤝 PAREGGIO!'}
};
const t = k => (T[lang]||T.en)[k]||k;

function id(x){ return document.getElementById(x); }
function show(el){ el.classList.remove('hidden'); }
function hide(el){ el.classList.add('hidden'); }

// ── BOARD GAME DOM ─────────────────────────────
const hub         = id('hub');
const gameScreen  = id('gameScreen');
const arcadeScreen= id('arcadeScreen');
const setup       = id('setup');
const diffRow     = id('diffRow');
const turnBar     = id('turnBar');
const turnSymbol  = id('turnSymbol');
const turnLabel   = id('turnLabel');
const ctrlRow     = id('ctrlRow');
const tttBoard    = id('tttBoard');
const ttt5Board   = id('ttt5Board');
const c4Wrap      = id('c4Wrap');
const c4Arrows    = id('c4Arrows');
const c4Grid      = id('c4Grid');
const resultModal = id('resultModal');

// ── HUB ────────────────────────────────────────
const BOARD_GAMES = ['ttt','ttt5','c4'];
const ARCADE_GAMES = ['bubbles','snake','breakout','flappy','ballbattle','capybara'];

document.querySelectorAll('.game-card').forEach(card => {
  card.addEventListener('click', () => {
    const g = card.dataset.game;
    currentGame = g;
    if (ARCADE_GAMES.includes(g)) openArcade(g);
    else openBoardGame(g);
  });
});

// ── BOARD GAME FLOW ────────────────────────────
function openBoardGame(g) {
  scores = {p1:0,p2:0,draw:0};
  updateScores();
  id('gameName').textContent = {ttt:'TIC-TAC-TOE',ttt5:'TTT ULTRA 5×5',c4:'CONNECT 4'}[g];
  hide(hub); show(gameScreen);
  hide(turnBar); hide(ctrlRow); showSetup();
}

function showSetup(){
  show(setup); hide(turnBar); hide(ctrlRow);
  hide(tttBoard); hide(ttt5Board); hide(c4Wrap);
}

let currentPlayer = 'X';
function decideFirst(){ return firstMode==='player'?'X':firstMode==='bot'?'O':gameCount%2===0?'X':'O'; }

function updateScores(){
  id('sVal1').textContent=scores.p1; id('sVal2').textContent=scores.p2; id('sValD').textContent=scores.draw;
  id('sName1').textContent=t('player');
  id('sName2').textContent=gameMode==='bot'?t('bot'):t('player2');
}

function updateTurn(thinking=false){
  show(turnBar); turnBar.className='turn-bar';
  if(thinking){ turnBar.classList.add('thinking'); turnSymbol.textContent='○'; turnLabel.textContent=t('botThinking'); return; }
  const x = currentPlayer==='X';
  turnBar.classList.add(x?'x-turn':'o-turn');
  turnSymbol.textContent = x?'✕':'○';
  turnLabel.textContent = gameMode==='bot'?(x?t('yourTurn'):t('botThinking')):(x?t('p1Turn'):t('p2Turn'));
}

function endBoardGame(result){
  gameActive=false;
  const em=id('resultEmoji'), ti=id('resultTitle');
  if(result==='p1'){scores.p1++;em.textContent='🎉';ti.textContent=gameMode==='bot'?t('youWin'):t('p1Wins');}
  else if(result==='p2'){scores.p2++;em.textContent=gameMode==='bot'?'🤖':'🎉';ti.textContent=gameMode==='bot'?t('botWins'):t('p2Wins');}
  else{scores.draw++;em.textContent='🤝';ti.textContent=t('drawMsg');}
  updateScores(); hide(turnBar);
  setTimeout(()=>show(resultModal),300);
}

id('backBtn').addEventListener('click',()=>{hide(gameScreen);show(hub);gameActive=false;});
id('startBtn').addEventListener('click',startBoardGame);
id('restartBtn').addEventListener('click',restartBoardGame);
id('newGameBtn').addEventListener('click',showSetup);
id('playAgainBtn').addEventListener('click',()=>{hide(resultModal);restartBoardGame();});
id('menuFromResult').addEventListener('click',()=>{hide(resultModal);showSetup();});

document.querySelectorAll('.pill[data-mode]').forEach(b=>b.addEventListener('click',()=>{
  document.querySelectorAll('.pill[data-mode]').forEach(x=>x.classList.remove('active'));
  b.classList.add('active'); gameMode=b.dataset.mode; updateScores();
}));
document.querySelectorAll('.pill[data-diff]').forEach(b=>b.addEventListener('click',()=>{
  document.querySelectorAll('.pill[data-diff]').forEach(x=>x.classList.remove('active'));
  b.classList.add('active'); difficulty=b.dataset.diff;
}));

function startBoardGame(){
  gameCount++; currentPlayer=decideFirst(); gameActive=true;
  hide(setup); show(ctrlRow); updateScores();
  if(currentGame==='ttt')  startTTT();
  if(currentGame==='ttt5') startTTT5();
  if(currentGame==='c4')   startC4();
  updateTurn();
  if(gameMode==='bot'&&currentPlayer==='O') scheduleBotMove();
}
function restartBoardGame(){
  gameCount++; currentPlayer=decideFirst(); gameActive=true;
  hide(resultModal); hide(setup); show(ctrlRow);
  if(currentGame==='ttt')  startTTT();
  if(currentGame==='ttt5') startTTT5();
  if(currentGame==='c4')   startC4();
  updateTurn();
  if(gameMode==='bot'&&currentPlayer==='O') scheduleBotMove();
}

// ══════════════════════════════════════════════
// TTT 3×3
// ══════════════════════════════════════════════
let tttState = Array(9).fill('');
const TTT_WINS = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

function startTTT(){
  tttState=Array(9).fill('');
  hide(tttBoard); hide(ttt5Board); hide(c4Wrap); show(tttBoard);
  tttBoard.innerHTML='';
  for(let i=0;i<9;i++){
    const c=document.createElement('div'); c.className='cell'; c.dataset.i=i;
    c.addEventListener('click',()=>onTTTClick(i)); tttBoard.appendChild(c);
  }
}
function onTTTClick(i){ if(!gameActive||tttState[i]!==''||(gameMode==='bot'&&currentPlayer==='O')) return; placeTTT(i); }
function placeTTT(i){
  tttState[i]=currentPlayer;
  const c=tttBoard.querySelector(`[data-i="${i}"]`);
  c.textContent=currentPlayer==='X'?'✕':'○'; c.classList.add(currentPlayer.toLowerCase(),'taken','pop');
  const w=checkTTTWin(tttState);
  if(w) return finishTTT(w);
  if(tttState.every(c=>c)) return endBoardGame('draw');
  currentPlayer=currentPlayer==='X'?'O':'X'; updateTurn();
  if(gameMode==='bot'&&currentPlayer==='O') scheduleBotMove();
}
function checkTTTWin(b){
  for(const [a,bc,c] of TTT_WINS) if(b[a]&&b[a]===b[bc]&&b[a]===b[c]) return {winner:b[a],combo:[a,bc,c]};
  return null;
}
function finishTTT(w){
  gameActive=false;
  w.combo.forEach(i=>tttBoard.querySelector(`[data-i="${i}"]`).classList.add('winning'));
  setTimeout(()=>endBoardGame(w.winner==='X'?'p1':'p2'),400);
}
function botMoveTTT(){ updateTurn(true); setTimeout(()=>{ if(gameActive) placeTTT(pickMoveTTT()); },350); }
function pickMoveTTT(){
  if(difficulty==='easy') return randomEmpty(tttState);
  const w=findImmediate(tttState,'O'); if(w!==-1) return w;
  if(difficulty==='medium'){ const b=findImmediate(tttState,'X'); return b!==-1?b:randomEmpty(tttState); }
  return minimaxTTT(tttState,'O').move;
}
function minimaxTTT(board,player){
  const w=checkTTTWin(board);
  if(w) return {score:w.winner==='O'?10:-10};
  const emp=board.map((v,i)=>v===''?i:-1).filter(i=>i>=0);
  if(!emp.length) return {score:0};
  const opp=player==='O'?'X':'O';
  const res=emp.map(i=>{ const nb=[...board];nb[i]=player; return{move:i,score:minimaxTTT(nb,opp).score}; });
  res.sort((a,b)=>player==='O'?b.score-a.score:a.score-b.score); return res[0];
}

// ══════════════════════════════════════════════
// TTT 5×5
// ══════════════════════════════════════════════
const S5=5, W5=4;
let ttt5State=Array(25).fill('');
function startTTT5(){
  ttt5State=Array(25).fill('');
  hide(tttBoard); hide(ttt5Board); hide(c4Wrap); show(ttt5Board);
  ttt5Board.innerHTML='';
  for(let i=0;i<25;i++){
    const c=document.createElement('div'); c.className='cell'; c.dataset.i=i;
    c.addEventListener('click',()=>onTTT5Click(i)); ttt5Board.appendChild(c);
  }
}
function onTTT5Click(i){ if(!gameActive||ttt5State[i]!==''||(gameMode==='bot'&&currentPlayer==='O')) return; placeTTT5(i); }
function placeTTT5(i){
  ttt5State[i]=currentPlayer;
  const c=ttt5Board.querySelector(`[data-i="${i}"]`);
  c.textContent=currentPlayer==='X'?'✕':'○'; c.classList.add(currentPlayer.toLowerCase(),'taken','pop');
  const w=checkTTT5Win(ttt5State);
  if(w) return finishTTT5(w);
  if(ttt5State.every(c=>c)) return endBoardGame('draw');
  currentPlayer=currentPlayer==='X'?'O':'X'; updateTurn();
  if(gameMode==='bot'&&currentPlayer==='O') scheduleBotMove();
}
function checkTTT5Win(board){
  const dirs=[[0,1],[1,0],[1,1],[1,-1]];
  for(let r=0;r<S5;r++) for(let c=0;c<S5;c++){
    const v=board[r*S5+c]; if(!v) continue;
    for(const [dr,dc] of dirs){
      const combo=[];
      for(let k=0;k<W5;k++){
        const nr=r+dr*k,nc=c+dc*k;
        if(nr<0||nr>=S5||nc<0||nc>=S5) break;
        if(board[nr*S5+nc]!==v) break;
        combo.push(nr*S5+nc);
      }
      if(combo.length===W5) return{winner:v,combo};
    }
  }
  return null;
}
function finishTTT5(w){
  gameActive=false;
  w.combo.forEach(i=>ttt5Board.querySelector(`[data-i="${i}"]`).classList.add('winning'));
  setTimeout(()=>endBoardGame(w.winner==='X'?'p1':'p2'),400);
}
function botMoveTTT5(){ updateTurn(true); setTimeout(()=>{ if(gameActive) placeTTT5(pickMoveTTT5()); },400); }
function pickMoveTTT5(){
  if(difficulty==='easy') return randomEmpty(ttt5State);
  const w=findImmediateN(ttt5State,'O',S5,W5); if(w!==-1) return w;
  const b=findImmediateN(ttt5State,'X',S5,W5); if(b!==-1) return b;
  if(difficulty==='medium') return randomEmpty(ttt5State);
  return bestHeuristic5(ttt5State);
}
function bestHeuristic5(board){
  const emp=board.map((v,i)=>v===''?i:-1).filter(x=>x>=0);
  let best=-Infinity,move=emp[0];
  for(const i of emp){ const nb=[...board];nb[i]='O'; const s=scoreBoard5(nb,'O')-scoreBoard5(nb,'X'); if(s>best){best=s;move=i;} }
  return move;
}
function scoreBoard5(board,p){
  const dirs=[[0,1],[1,0],[1,1],[1,-1]]; let total=0;
  for(let r=0;r<S5;r++) for(let c=0;c<S5;c++) for(const [dr,dc] of dirs){
    let count=0,open=0;
    for(let k=0;k<W5;k++){
      const nr=r+dr*k,nc=c+dc*k;
      if(nr<0||nr>=S5||nc<0||nc>=S5) break;
      const v=board[nr*S5+nc];
      if(v===p) count++; else if(v==='') open++; else{count=-1;break;}
    }
    if(count>0) total+=Math.pow(10,count)*(open>0?1:0);
  }
  return total;
}

// ══════════════════════════════════════════════
// CONNECT 4
// ══════════════════════════════════════════════
const C4C=7,C4R=6,C4W=4;
let c4State=[];
function startC4(){
  c4State=Array.from({length:C4R},()=>Array(C4C).fill(''));
  hide(tttBoard); hide(ttt5Board); hide(c4Wrap); show(c4Wrap);
  c4Arrows.innerHTML=''; c4Grid.innerHTML='';
  for(let c=0;c<C4C;c++){
    const b=document.createElement('button'); b.className='c4-arrow'; b.textContent='▼'; b.dataset.col=c;
    b.addEventListener('click',()=>onC4Drop(c)); c4Arrows.appendChild(b);
  }
  for(let r=0;r<C4R;r++) for(let c=0;c<C4C;c++){
    const d=document.createElement('div'); d.className='c4-cell'; d.dataset.r=r; d.dataset.c=c;
    c4Grid.appendChild(d);
  }
}
function onC4Drop(col){ if(!gameActive||(gameMode==='bot'&&currentPlayer==='O')) return; dropC4(col); }
function dropC4(col){
  const row=lowestEmpty(col); if(row===-1) return;
  c4State[row][col]=currentPlayer;
  const cell=c4Grid.querySelector(`[data-r="${row}"][data-c="${col}"]`);
  cell.classList.add(currentPlayer==='X'?'r':'y','drop');
  if(lowestEmpty(col)===-1) c4Arrows.querySelectorAll('.c4-arrow')[col].disabled=true;
  const w=checkC4Win();
  if(w) return finishC4(w);
  if(c4State.every(row=>row.every(c=>c))) return endBoardGame('draw');
  currentPlayer=currentPlayer==='X'?'O':'X'; updateTurn();
  if(gameMode==='bot'&&currentPlayer==='O') scheduleBotMove();
}
function lowestEmpty(col){ for(let r=C4R-1;r>=0;r--) if(c4State[r][col]==='') return r; return -1; }
function checkC4Win(){
  const dirs=[[0,1],[1,0],[1,1],[1,-1]];
  for(let r=0;r<C4R;r++) for(let c=0;c<C4C;c++){
    const v=c4State[r][c]; if(!v) continue;
    for(const [dr,dc] of dirs){
      const combo=[];
      for(let k=0;k<C4W;k++){
        const nr=r+dr*k,nc=c+dc*k;
        if(nr<0||nr>=C4R||nc<0||nc>=C4C) break;
        if(c4State[nr][nc]!==v) break; combo.push([nr,nc]);
      }
      if(combo.length===C4W) return{winner:v,combo};
    }
  }
  return null;
}
function finishC4(w){
  gameActive=false;
  w.combo.forEach(([r,c])=>c4Grid.querySelector(`[data-r="${r}"][data-c="${c}"]`).classList.add('winning-c4'));
  c4Arrows.querySelectorAll('.c4-arrow').forEach(b=>b.disabled=true);
  setTimeout(()=>endBoardGame(w.winner==='X'?'p1':'p2'),500);
}
function botMoveC4(){ updateTurn(true); setTimeout(()=>{ if(gameActive) dropC4(pickMoveC4()); },450); }
function pickMoveC4(){
  const cols=availableCols();
  if(difficulty==='easy') return cols[Math.floor(Math.random()*cols.length)];
  for(const c of cols) if(simulateC4(c,'O')) return c;
  for(const c of cols) if(simulateC4(c,'X')) return c;
  if(difficulty==='medium'){ const ctr=[3,2,4,1,5,0,6].find(c=>cols.includes(c)); return ctr!==undefined?ctr:cols[0]; }
  return alphaBetaC4(5).col;
}
function availableCols(){ return Array.from({length:C4C},(_,i)=>i).filter(c=>lowestEmpty(c)!==-1); }
function simulateC4(col,p){ const r=lowestEmpty(col); if(r===-1) return false; c4State[r][col]=p; const w=!!checkC4Win(); c4State[r][col]=''; return w; }
function alphaBetaC4(depth){
  function score(d,p,alpha,beta){
    const cols=availableCols(),w=checkC4Win();
    if(w) return w.winner==='O'?1000+d:-(1000+d);
    if(!cols.length||d===0) return heuristicC4();
    const opp=p==='O'?'X':'O';
    const ord=[3,2,4,1,5,0,6].filter(c=>cols.includes(c));
    if(p==='O'){ let best=-Infinity; for(const c of ord){ const r=lowestEmpty(c); c4State[r][c]=p; best=Math.max(best,score(d-1,opp,alpha,beta)); c4State[r][c]=''; alpha=Math.max(alpha,best); if(alpha>=beta) break; } return best; }
    else{ let best=Infinity; for(const c of ord){ const r=lowestEmpty(c); c4State[r][c]=p; best=Math.min(best,score(d-1,opp,alpha,beta)); c4State[r][c]=''; beta=Math.min(beta,best); if(alpha>=beta) break; } return best; }
  }
  const cols=[3,2,4,1,5,0,6].filter(c=>availableCols().includes(c));
  let bestScore=-Infinity,bestCol=cols[0];
  for(const c of cols){ const r=lowestEmpty(c); c4State[r][c]='O'; const s=score(depth-1,'X',-Infinity,Infinity); c4State[r][c]=''; if(s>bestScore){bestScore=s;bestCol=c;} }
  return{col:bestCol};
}
function heuristicC4(){
  const dirs=[[0,1],[1,0],[1,1],[1,-1]]; let total=0;
  for(let r=0;r<C4R;r++) for(let c=0;c<C4C;c++) for(const [dr,dc] of dirs){
    let o=0,x=0;
    for(let k=0;k<C4W;k++){ const nr=r+dr*k,nc=c+dc*k; if(nr<0||nr>=C4R||nc<0||nc>=C4C) break; const v=c4State[nr][nc]; if(v==='O') o++; else if(v==='X') x++; }
    if(x===0&&o>0) total+=Math.pow(3,o); if(o===0&&x>0) total-=Math.pow(3,x);
  }
  return total;
}

// ── SHARED BOARD UTILS ─────────────────────────
function randomEmpty(board){ const e=board.map((v,i)=>v===''?i:-1).filter(i=>i>=0); return e[Math.floor(Math.random()*e.length)]; }
function findImmediate(board,p){
  for(const [a,b,c] of TTT_WINS){ const cells=[board[a],board[b],board[c]]; if(cells.filter(v=>v===p).length===2&&cells.includes('')) return [a,b,c][cells.indexOf('')]; }
  return -1;
}
function findImmediateN(board,p,size,win){
  const dirs=[[0,1],[1,0],[1,1],[1,-1]];
  for(let r=0;r<size;r++) for(let c=0;c<size;c++) for(const [dr,dc] of dirs){
    const idx=[],vals=[];
    for(let k=0;k<win;k++){ const nr=r+dr*k,nc=c+dc*k; if(nr<0||nr>=size||nc<0||nc>=size) break; idx.push(nr*size+nc); vals.push(board[nr*size+nc]); }
    if(idx.length===win&&vals.filter(v=>v===p).length===win-1&&vals.includes('')) return idx[vals.indexOf('')];
  }
  return -1;
}
function scheduleBotMove(){
  updateTurn(true);
  setTimeout(()=>{
    if(!gameActive) return;
    if(currentGame==='ttt')  botMoveTTT();
    if(currentGame==='ttt5') botMoveTTT5();
    if(currentGame==='c4')   botMoveC4();
  },200);
}

// ══════════════════════════════════════════════
// ═══════════  ARCADE ENGINE  ═════════════════
// ══════════════════════════════════════════════
const canvas = id('arcadeCanvas');
const ctx    = canvas.getContext('2d');
let arcadeRAF = null;
let arcadeGame = null; // current arcade game object
let arcadeScore = 0;
let arcadeHiScore = {};

function openArcade(g) {
  stopArcade();
  currentGame = g;
  id('arcadeName').textContent = {bubbles:'BUBBLE BATTLE',snake:'SNAKE',breakout:'BREAKOUT',flappy:'FLAPPY BIRD',ballbattle:'BALL BATTLE',capybara:'CAPYBARA RUN'}[g];
  hide(hub); show(arcadeScreen);
  setupCanvas();
  if (g === 'ballbattle') {
    id('arcadeControls').innerHTML = '';
    hideArcadeOverlay();
    openBallBattle();
    return;
  }
  buildControls(g);
  showArcadeOverlay('🎮', {bubbles:'BUBBLE BATTLE',snake:'SNAKE',breakout:'BREAKOUT',flappy:'FLAPPY BIRD',capybara:'CAPYBARA RUN'}[g], {bubbles:'TAP TO SHOOT',snake:'TAP TO START',breakout:'MOVE PADDLE',flappy:'TAP TO FLY',capybara:'TAP TO JUMP'}[g]);
}

function setupCanvas(){
  const wrap = id('canvasWrap');
  const W = Math.min(wrap.clientWidth, 480);
  canvas.width = W;
  canvas.height = Math.round(W * 1.2);
  canvas.style.width = '100%';
  canvas.style.height = 'auto';
}

id('arcadeBack').addEventListener('click', ()=>{ stopArcade(); hide(arcadeScreen); show(hub); });

function showArcadeOverlay(emoji, title, sub, btnText='▶ PLAY'){
  const ov = id('arcadeOverlay');
  id('overlayEmoji').textContent = emoji;
  id('overlayTitle').textContent = title;
  id('overlaySub').textContent   = sub;
  id('overlayBtn').textContent   = btnText;
  show(ov);
}
function hideArcadeOverlay(){ hide(id('arcadeOverlay')); }

id('overlayBtn').addEventListener('click', ()=>{
  hideArcadeOverlay();
  arcadeScore = 0; updateArcadeScore();
  if(currentGame==='bubbles') startBubbles();
  if(currentGame==='snake')   startSnake();
  if(currentGame==='breakout')startBreakout();
  if(currentGame==='flappy')  startFlappy();
  if(currentGame==='capybara') startCapybara();
  if(currentGame==='ballbattle') openBallBattle();
});

function stopArcade(){
  if(arcadeRAF){ cancelAnimationFrame(arcadeRAF); arcadeRAF=null; }
  if(arcadeGame&&arcadeGame.cleanup) arcadeGame.cleanup();
  arcadeGame=null;
}

function updateArcadeScore(){
  id('arcadeScore').textContent = arcadeScore;
  const hi = arcadeHiScore[currentGame]||0;
  if(arcadeScore>hi){ arcadeHiScore[currentGame]=arcadeScore; try{ localStorage.setItem('hi_'+currentGame, arcadeScore); }catch(e){} }
}

function gameOver(emoji='💀', msg=''){
  stopArcade();
  const hi = arcadeHiScore[currentGame]||arcadeScore;
  showArcadeOverlay(emoji, 'GAME OVER', `SCORE: ${arcadeScore}  │  BEST: ${hi}`, '↺ RETRY');
}

// ── COLORS ────────────────────────────────────
const C = {
  bg:     '#0a0a0f',
  bg2:    '#12121a',
  bg3:    '#1c1c28',
  border: '#2a2a3d',
  accent: '#7c6fff',
  pink:   '#ff6b9d',
  cyan:   '#6bdbff',
  green:  '#4ade80',
  yellow: '#facc15',
  orange: '#fb923c',
  purple: '#a78bfa',
  text:   '#e8e8f0',
  sub:    '#7070a0',
};

function rnd(a,b){ return a+Math.random()*(b-a); }
function lerp(a,b,t){ return a+(b-a)*t; }

// ══════════════════════════════════════════════
// 🫧  BUBBLE BATTLE
// ══════════════════════════════════════════════
function startBubbles(){
  const W=canvas.width, H=canvas.height;
  const COLORS=[C.pink,C.cyan,C.purple,C.green,C.yellow,C.orange];

  // Shooter
  const shooter = { x:W/2, y:H-60, angle:-Math.PI/2, r:18 };
  let bullet = null;
  let nextColor = COLORS[Math.floor(Math.random()*COLORS.length)];
  let currentColor = COLORS[Math.floor(Math.random()*COLORS.length)];

  // Bubbles grid
  const BR = W < 360 ? 20 : 24; // bubble radius
  const bubbles = [];
  const COLS = Math.floor((W-20)/(BR*2));
  const ROWS = 5;

  function makeBubble(col,row){
    return { x: 10+BR + col*BR*2, y: 30+BR + row*BR*2, r:BR, color: COLORS[Math.floor(Math.random()*COLORS.length)], alive:true, pop:0 };
  }
  for(let r=0;r<ROWS;r++) for(let c=0;c<COLS-(r%2===1?1:0);c++) bubbles.push(makeBubble(c+(r%2===1?.5:0),r));

  // Drop timer – bubbles descend every 15s
  let dropTimer = 0;

  // Aim line
  let aimX = W/2, aimY = 100;

  function shoot(){
    if(bullet) return;
    const dx=aimX-shooter.x, dy=aimY-shooter.y;
    const len=Math.hypot(dx,dy);
    bullet = { x:shooter.x, y:shooter.y, vx:dx/len*12, vy:dy/len*12, r:BR, color:currentColor };
    currentColor=nextColor;
    nextColor=COLORS[Math.floor(Math.random()*COLORS.length)];
  }

  // Touch/click to aim & shoot
  function getPos(e){ const rect=canvas.getBoundingClientRect(); const s=W/rect.width; const src=e.touches?e.touches[0]:e; return{ x:(src.clientX-rect.left)*s, y:(src.clientY-rect.top)*s }; }
  function onMove(e){ const p=getPos(e); aimX=p.x; aimY=Math.min(p.y, shooter.y-20); }
  function onTap(e){ const p=getPos(e); aimX=p.x; aimY=Math.min(p.y, shooter.y-20); shoot(); }
  canvas.addEventListener('mousemove', onMove);
  canvas.addEventListener('click', onTap);
  canvas.addEventListener('touchmove', onMove, {passive:true});
  canvas.addEventListener('touchend', onTap);

  arcadeGame = {
    cleanup(){ canvas.removeEventListener('mousemove',onMove); canvas.removeEventListener('click',onTap); canvas.removeEventListener('touchmove',onMove); canvas.removeEventListener('touchend',onTap); }
  };

  function popGroup(startBubble){
    const col=startBubble.color;
    const visited=new Set(), queue=[startBubble];
    while(queue.length){
      const b=queue.pop();
      if(visited.has(b)||!b.alive||b.color!==col) continue;
      visited.add(b);
      for(const other of bubbles){
        if(!visited.has(other)&&other.alive&&Math.hypot(other.x-b.x,other.y-b.y)<BR*2.1) queue.push(other);
      }
    }
    if(visited.size>=3){
      visited.forEach(b=>{ b.alive=false; b.pop=1; });
      arcadeScore += visited.size*10; updateArcadeScore();
    } else {
      // Just stick it
      startBubble.alive=true;
    }
  }

  function snapBullet(){
    if(!bullet) return;
    // Find closest alive bubble or grid top
    let snapped=false;
    for(const b of bubbles){
      if(!b.alive) continue;
      if(Math.hypot(bullet.x-b.x,bullet.y-b.y)<BR*1.9){
        // Place next to it
        const nb={x:bullet.x,y:bullet.y,r:BR,color:bullet.color,alive:true,pop:0};
        bubbles.push(nb);
        popGroup(nb);
        bullet=null; snapped=true; break;
      }
    }
    if(!snapped&&bullet.y<=30+BR){
      const nb={x:bullet.x,y:bullet.y,r:BR,color:bullet.color,alive:true,pop:0};
      bubbles.push(nb);
      popGroup(nb);
      bullet=null;
    }
  }

  function loop(){
    ctx.fillStyle=C.bg; ctx.fillRect(0,0,W,H);
    dropTimer++;
    if(dropTimer>=900){ // 15s at 60fps
      dropTimer=0;
      bubbles.filter(b=>b.alive).forEach(b=>{ b.y+=BR*2; });
    }

    // Draw aim line
    ctx.save(); ctx.strokeStyle=C.sub; ctx.lineWidth=1.5; ctx.setLineDash([6,8]);
    ctx.globalAlpha=.5;
    const dx=aimX-shooter.x,dy=aimY-shooter.y,len=Math.hypot(dx,dy);
    const nx=dx/len,ny=dy/len;
    let ax=shooter.x,ay=shooter.y;
    for(let i=0;i<3;i++){
      const bx=ax+nx*200,by=ay+ny*200;
      ctx.beginPath(); ctx.moveTo(ax,ay);
      if(bx<BR){ const t=(BR-ax)/nx; ctx.lineTo(ax+nx*t,ay+ny*t); ax=2*BR-bx; ay=by; nx*=-1; break; }
      else if(bx>W-BR){ const t=(W-BR-ax)/nx; ctx.lineTo(ax+nx*t,ay+ny*t); ax=2*(W-BR)-bx; ay=by; break; }
      else { ctx.lineTo(bx,by); break; }
      ctx.stroke();
    }
    ctx.stroke(); ctx.restore();

    // Draw bubbles
    for(const b of bubbles){
      if(b.pop>0){ b.pop-=0.08; if(b.pop<=0){ b.alive=false; continue; } ctx.save(); ctx.globalAlpha=b.pop; ctx.strokeStyle=b.color; ctx.lineWidth=3; ctx.beginPath(); ctx.arc(b.x,b.y,b.r*(2-b.pop),0,Math.PI*2); ctx.stroke(); ctx.restore(); continue; }
      if(!b.alive) continue;
      ctx.save();
      const grd=ctx.createRadialGradient(b.x-b.r*.3,b.y-b.r*.3,b.r*.1,b.x,b.y,b.r);
      grd.addColorStop(0,'rgba(255,255,255,.35)'); grd.addColorStop(.5,b.color+'cc'); grd.addColorStop(1,b.color+'55');
      ctx.fillStyle=grd; ctx.strokeStyle=b.color; ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.restore();
      // Check if fell too low
      if(b.y>H-80){ gameOver('💥','Bubbles reached the bottom!'); return; }
    }

    // Bullet
    if(bullet){
      bullet.x+=bullet.vx; bullet.y+=bullet.vy;
      if(bullet.x<BR){ bullet.x=BR; bullet.vx*=-1; }
      if(bullet.x>W-BR){ bullet.x=W-BR; bullet.vx*=-1; }
      if(bullet.y<BR) snapBullet();
      else snapBullet();
      if(bullet){
        const grd=ctx.createRadialGradient(bullet.x-bullet.r*.3,bullet.y-bullet.r*.3,bullet.r*.1,bullet.x,bullet.y,bullet.r);
        grd.addColorStop(0,'rgba(255,255,255,.5)'); grd.addColorStop(.5,bullet.color+'dd'); grd.addColorStop(1,bullet.color+'66');
        ctx.fillStyle=grd; ctx.strokeStyle=bullet.color; ctx.lineWidth=2;
        ctx.beginPath(); ctx.arc(bullet.x,bullet.y,bullet.r,0,Math.PI*2); ctx.fill(); ctx.stroke();
      }
    }

    // Shooter base
    ctx.save();
    ctx.fillStyle=C.bg3; ctx.strokeStyle=C.border; ctx.lineWidth=2;
    ctx.beginPath(); ctx.arc(shooter.x,shooter.y,shooter.r+6,0,Math.PI*2); ctx.fill(); ctx.stroke();
    // Current bubble preview
    const grd2=ctx.createRadialGradient(shooter.x-6,shooter.y-6,3,shooter.x,shooter.y,shooter.r);
    grd2.addColorStop(0,'rgba(255,255,255,.4)'); grd2.addColorStop(.6,currentColor+'cc'); grd2.addColorStop(1,currentColor+'44');
    ctx.fillStyle=grd2; ctx.strokeStyle=currentColor; ctx.lineWidth=2;
    ctx.beginPath(); ctx.arc(shooter.x,shooter.y,shooter.r,0,Math.PI*2); ctx.fill(); ctx.stroke();
    // Next preview
    ctx.fillStyle=C.bg3; ctx.strokeStyle=C.border; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.arc(shooter.x+50,shooter.y,12,0,Math.PI*2); ctx.fill(); ctx.stroke();
    ctx.fillStyle=nextColor;
    ctx.beginPath(); ctx.arc(shooter.x+50,shooter.y,10,0,Math.PI*2); ctx.fill();
    ctx.fillStyle=C.sub; ctx.font=`9px ${C.font}`; ctx.textAlign='center'; ctx.fillText('NEXT',shooter.x+50,shooter.y+22);
    ctx.restore();

    // Win check
    if(bubbles.filter(b=>b.alive).length===0){ gameOver('🏆','ALL CLEARED!'); return; }

    arcadeRAF=requestAnimationFrame(loop);
  }
  arcadeRAF=requestAnimationFrame(loop);
}

// ══════════════════════════════════════════════
// 🐍  SNAKE
// ══════════════════════════════════════════════
function startSnake(){
  const W=canvas.width, H=canvas.height;
  const GS = W<360?16:18; // grid size
  const COLS=Math.floor(W/GS), ROWS=Math.floor(H/GS);
  const OX=Math.floor((W-COLS*GS)/2), OY=Math.floor((H-ROWS*GS)/2);

  let snake=[{x:Math.floor(COLS/2),y:Math.floor(ROWS/2)}];
  let dir={x:1,y:0}, nextDir={x:1,y:0};
  let food=placeFood();
  let speed=120, lastTime=0, growing=0;

  function placeFood(){
    let f;
    do{ f={x:Math.floor(Math.random()*COLS),y:Math.floor(Math.random()*ROWS)}; }
    while(snake.some(s=>s.x===f.x&&s.y===f.y));
    return f;
  }

  // Controls
  function onKey(e){
    const map={ArrowUp:{x:0,y:-1},ArrowDown:{x:0,y:1},ArrowLeft:{x:-1,y:0},ArrowRight:{x:1,y:0},w:{x:0,y:-1},s:{x:0,y:1},a:{x:-1,y:0},d:{x:1,y:0}};
    const d=map[e.key]; if(!d) return;
    if(d.x===-dir.x&&d.y===-dir.y) return;
    nextDir=d; e.preventDefault();
  }
  document.addEventListener('keydown',onKey);

  arcadeGame = { cleanup(){ document.removeEventListener('keydown',onKey); } };

  // Build swipe buttons
  buildControls('snake');

  function loop(ts){
    if(ts-lastTime < speed){ arcadeRAF=requestAnimationFrame(loop); return; }
    lastTime=ts;

    dir=nextDir;
    const head={x:(snake[0].x+dir.x+COLS)%COLS, y:(snake[0].y+dir.y+ROWS)%ROWS};

    // Self collision
    if(snake.slice(1).some(s=>s.x===head.x&&s.y===head.y)){ gameOver('💀',''); return; }

    snake.unshift(head);
    if(head.x===food.x&&head.y===food.y){
      arcadeScore+=10; updateArcadeScore(); growing+=3;
      food=placeFood(); speed=Math.max(60,speed-1);
    }
    if(growing>0) growing--; else snake.pop();

    // Draw
    ctx.fillStyle=C.bg; ctx.fillRect(0,0,W,H);
    // Grid dots
    ctx.fillStyle=C.border;
    for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++) ctx.fillRect(OX+c*GS+GS/2-1,OY+r*GS+GS/2-1,2,2);

    // Food – pulsing
    const pulse=0.9+Math.sin(ts*0.005)*0.1;
    ctx.save(); ctx.fillStyle=C.pink; ctx.shadowColor=C.pink; ctx.shadowBlur=12;
    ctx.beginPath(); ctx.arc(OX+food.x*GS+GS/2,OY+food.y*GS+GS/2,GS/2*pulse,0,Math.PI*2); ctx.fill();
    ctx.restore();

    // Snake
    snake.forEach((s,i)=>{
      const ratio=i/snake.length;
      const col=i===0?C.green:`hsl(${130-ratio*40},70%,${55-ratio*15}%)`;
      ctx.fillStyle=col;
      const pad=i===0?1:2;
      const r=i===0?4:3;
      roundRect(ctx,OX+s.x*GS+pad,OY+s.y*GS+pad,GS-pad*2,GS-pad*2,r);
      ctx.fill();
    });
    // Eyes
    const h=snake[0];
    ctx.fillStyle='#000';
    const ex=OX+h.x*GS+GS/2, ey=OY+h.y*GS+GS/2;
    ctx.beginPath(); ctx.arc(ex+dir.x*3-dir.y*4,ey+dir.y*3-dir.x*4,2,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(ex+dir.x*3+dir.y*4,ey+dir.y*3+dir.x*4,2,0,Math.PI*2); ctx.fill();

    arcadeRAF=requestAnimationFrame(loop);
  }
  arcadeRAF=requestAnimationFrame(loop);
}

function roundRect(ctx,x,y,w,h,r){
  ctx.beginPath(); ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.arcTo(x+w,y,x+w,y+r,r);
  ctx.lineTo(x+w,y+h-r); ctx.arcTo(x+w,y+h,x+w-r,y+h,r);
  ctx.lineTo(x+r,y+h); ctx.arcTo(x,y+h,x,y+h-r,r);
  ctx.lineTo(x,y+r); ctx.arcTo(x,y,x+r,y,r); ctx.closePath();
}

// ── WEAPON ICON RENDERER ─────────────────────────────────
// Draws a proper canvas icon for each weapon (no emoji)
function drawWeaponIcon(ctx, weaponKey, cx, cy, size, col) {
  ctx.save();
  ctx.translate(cx, cy);
  const s = size; // scale unit
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';

  switch (weaponKey) {
    case 'sword': {
      // Blade
      ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = s * 0.18;
      ctx.beginPath(); ctx.moveTo(-s*0.05, s*0.9); ctx.lineTo(s*0.05, -s*0.9); ctx.stroke();
      // Guard
      ctx.lineWidth = s * 0.14;
      ctx.beginPath(); ctx.moveTo(-s*0.55, s*0.1); ctx.lineTo(s*0.55, s*0.1); ctx.stroke();
      // Pommel
      ctx.fillStyle = '#a0aec0';
      ctx.beginPath(); ctx.arc(0, s*0.75, s*0.17, 0, Math.PI*2); ctx.fill();
      // Tip shine
      ctx.strokeStyle = '#fff'; ctx.lineWidth = s*0.08;
      ctx.beginPath(); ctx.moveTo(s*0.02, -s*0.7); ctx.lineTo(s*0.04, -s*0.9); ctx.stroke();
      break;
    }
    case 'hammer': {
      // Handle
      ctx.strokeStyle = '#92400e'; ctx.lineWidth = s * 0.15;
      ctx.beginPath(); ctx.moveTo(0, s*0.85); ctx.lineTo(0, -s*0.2); ctx.stroke();
      // Head
      ctx.fillStyle = '#9ca3af';
      ctx.beginPath();
      roundRect(ctx, -s*0.45, -s*0.85, s*0.9, s*0.55, s*0.1);
      ctx.fill();
      ctx.strokeStyle = '#6b7280'; ctx.lineWidth = s*0.06;
      ctx.stroke();
      // Face highlight
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      roundRect(ctx, -s*0.38, -s*0.78, s*0.76, s*0.18, s*0.06); ctx.fill();
      break;
    }
    case 'scythe': {
      // Handle
      ctx.strokeStyle = '#92400e'; ctx.lineWidth = s*0.13;
      ctx.beginPath(); ctx.moveTo(-s*0.3, s*0.9); ctx.lineTo(s*0.3, -s*0.6); ctx.stroke();
      // Blade curve (moon shape)
      ctx.strokeStyle = '#fde047'; ctx.lineWidth = s*0.17;
      ctx.beginPath();
      ctx.arc(s*0.15, -s*0.45, s*0.6, Math.PI*1.05, Math.PI*1.75);
      ctx.stroke();
      // Inner curve (concave)
      ctx.strokeStyle = '#1a1a2e'; ctx.lineWidth = s*0.1;
      ctx.beginPath();
      ctx.arc(s*0.1, -s*0.38, s*0.46, Math.PI*1.08, Math.PI*1.72);
      ctx.stroke();
      // Tip
      ctx.fillStyle = '#fde047';
      ctx.beginPath(); ctx.arc(s*0.3, -s*0.87, s*0.1, 0, Math.PI*2); ctx.fill();
      break;
    }
    case 'spear': {
      // Shaft
      ctx.strokeStyle = '#92400e'; ctx.lineWidth = s*0.13;
      ctx.beginPath(); ctx.moveTo(0, s*0.9); ctx.lineTo(0, -s*0.3); ctx.stroke();
      // Tip triangle
      ctx.fillStyle = '#9ca3af';
      ctx.beginPath();
      ctx.moveTo(0, -s*0.95);
      ctx.lineTo(-s*0.2, -s*0.3);
      ctx.lineTo(s*0.2, -s*0.3);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#6b7280'; ctx.lineWidth = s*0.05; ctx.stroke();
      // Highlight
      ctx.strokeStyle = '#fff'; ctx.lineWidth = s*0.07;
      ctx.beginPath(); ctx.moveTo(-s*0.05, -s*0.8); ctx.lineTo(s*0.03, -s*0.45); ctx.stroke();
      break;
    }
    case 'bow': {
      // Bow arc
      ctx.strokeStyle = '#92400e'; ctx.lineWidth = s*0.13;
      ctx.beginPath(); ctx.arc(s*0.25, 0, s*0.75, Math.PI*0.6, Math.PI*1.4); ctx.stroke();
      // String
      ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = s*0.06;
      ctx.beginPath();
      ctx.moveTo(s*0.25 + s*0.75*Math.cos(Math.PI*0.6), s*0.75*Math.sin(Math.PI*0.6));
      ctx.lineTo(-s*0.12, 0);
      ctx.lineTo(s*0.25 + s*0.75*Math.cos(Math.PI*1.4), s*0.75*Math.sin(Math.PI*1.4));
      ctx.stroke();
      // Arrow
      ctx.strokeStyle = '#fde047'; ctx.lineWidth = s*0.09;
      ctx.beginPath(); ctx.moveTo(s*0.5, 0); ctx.lineTo(-s*0.55, 0); ctx.stroke();
      // Arrow tip
      ctx.fillStyle = '#9ca3af';
      ctx.beginPath(); ctx.moveTo(-s*0.55,0); ctx.lineTo(-s*0.35,-s*0.12); ctx.lineTo(-s*0.35,s*0.12); ctx.closePath(); ctx.fill();
      // Fletching
      ctx.strokeStyle = '#ef4444'; ctx.lineWidth = s*0.08;
      ctx.beginPath(); ctx.moveTo(s*0.38,-s*0.14); ctx.lineTo(s*0.5,0); ctx.lineTo(s*0.38,s*0.14); ctx.stroke();
      break;
    }
    case 'shield': {
      // Shield body
      ctx.fillStyle = '#1e3a5f';
      ctx.beginPath();
      ctx.moveTo(0, -s*0.92);
      ctx.bezierCurveTo(s*0.7, -s*0.92, s*0.85, -s*0.2, s*0.85, s*0.1);
      ctx.bezierCurveTo(s*0.85, s*0.55, s*0.45, s*0.85, 0, s*0.95);
      ctx.bezierCurveTo(-s*0.45, s*0.85, -s*0.85, s*0.55, -s*0.85, s*0.1);
      ctx.bezierCurveTo(-s*0.85, -s*0.2, -s*0.7, -s*0.92, 0, -s*0.92);
      ctx.closePath(); ctx.fill();
      // Border
      ctx.strokeStyle = '#e53e3e'; ctx.lineWidth = s*0.1; ctx.stroke();
      // Emblem
      ctx.fillStyle = '#e53e3e';
      ctx.beginPath(); ctx.moveTo(0,-s*0.35); ctx.lineTo(s*0.28,s*0.1); ctx.lineTo(-s*0.28,s*0.1); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(0,s*0.42); ctx.lineTo(s*0.28,-s*0.03); ctx.lineTo(-s*0.28,-s*0.03); ctx.closePath(); ctx.fill();
      // Shine
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ctx.beginPath(); ctx.ellipse(-s*0.2, -s*0.3, s*0.2, s*0.45, -0.4, 0, Math.PI*2); ctx.fill();
      break;
    }
    case 'dagger': {
      // Blade
      ctx.fillStyle = '#d1d5db';
      ctx.beginPath();
      ctx.moveTo(0, -s*0.92);
      ctx.lineTo(-s*0.12, s*0.1);
      ctx.lineTo(s*0.12, s*0.1);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#6b7280'; ctx.lineWidth = s*0.05; ctx.stroke();
      // Fuller (groove)
      ctx.strokeStyle = '#9ca3af'; ctx.lineWidth = s*0.05;
      ctx.beginPath(); ctx.moveTo(0, -s*0.78); ctx.lineTo(0, s*0.05); ctx.stroke();
      // Guard
      ctx.fillStyle = '#92400e';
      ctx.beginPath(); roundRect(ctx, -s*0.32, s*0.07, s*0.64, s*0.16, s*0.06); ctx.fill();
      // Handle
      ctx.fillStyle = '#78350f';
      ctx.beginPath(); roundRect(ctx, -s*0.14, s*0.22, s*0.28, s*0.62, s*0.08); ctx.fill();
      // Pommel
      ctx.fillStyle = '#92400e';
      ctx.beginPath(); ctx.arc(0, s*0.9, s*0.15, 0, Math.PI*2); ctx.fill();
      // Blade shine
      ctx.strokeStyle = '#fff'; ctx.lineWidth = s*0.06; ctx.globalAlpha = 0.5;
      ctx.beginPath(); ctx.moveTo(-s*0.05,-s*0.78); ctx.lineTo(-s*0.04,-s*0.15); ctx.stroke();
      ctx.globalAlpha = 1;
      break;
    }
    case 'lightning': {
      // Bolt shape
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.moveTo(s*0.18, -s*0.92);
      ctx.lineTo(-s*0.28, s*0.0);
      ctx.lineTo(s*0.05, s*0.0);
      ctx.lineTo(-s*0.18, s*0.92);
      ctx.lineTo(s*0.42, -s*0.08);
      ctx.lineTo(s*0.08, -s*0.08);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = s*0.06; ctx.stroke();
      // Inner glow
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.beginPath();
      ctx.moveTo(s*0.12, -s*0.7);
      ctx.lineTo(-s*0.1, s*0.0);
      ctx.lineTo(s*0.04, s*0.0);
      ctx.lineTo(-s*0.06, s*0.62);
      ctx.lineTo(s*0.28, -s*0.08);
      ctx.lineTo(s*0.06, -s*0.08);
      ctx.closePath(); ctx.fill();
      break;
    }
  }
  ctx.restore();
}


// ══════════════════════════════════════════════
// 🧱  BREAKOUT
// ══════════════════════════════════════════════
function startBreakout(){
  const W=canvas.width, H=canvas.height;
  const COLS=7, ROWS=6;
  const BW=Math.floor((W-20)/COLS)-4, BH=18;
  const BOFF_X=10, BOFF_Y=50;

  const blocks=[];
  const BCOLS=[C.pink,C.orange,C.yellow,C.green,C.cyan,C.purple];
  for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++)
    blocks.push({x:BOFF_X+c*(BW+4),y:BOFF_Y+r*(BH+4),w:BW,h:BH,color:BCOLS[r%BCOLS.length],alive:true,hp:r<2?2:1,pop:0});

  const PAD_W=W*.3, PAD_H=10, PAD_Y=H-40;
  let padX=W/2-PAD_W/2;
  const BALL_R=8;
  let ball={x:W/2,y:PAD_Y-BALL_R-4,vx:rnd(-3,3)||2,vy:-5};
  let lives=3;

  function getPos(e){ const rect=canvas.getBoundingClientRect(); const s=W/rect.width; const src=e.touches?e.touches[0]:e; return(src.clientX-rect.left)*s; }
  function onMove(e){ padX=Math.max(0,Math.min(W-PAD_W,getPos(e)-PAD_W/2)); }
  canvas.addEventListener('mousemove',onMove);
  canvas.addEventListener('touchmove',onMove,{passive:true});

  function onKey(e){
    if(e.key==='ArrowLeft') padX=Math.max(0,padX-20);
    if(e.key==='ArrowRight') padX=Math.min(W-PAD_W,padX+20);
  }
  document.addEventListener('keydown',onKey);

  arcadeGame={ cleanup(){ canvas.removeEventListener('mousemove',onMove); canvas.removeEventListener('touchmove',onMove); document.removeEventListener('keydown',onKey); } };
  buildControls('breakout');

  let trail=[];

  function loop(){
    ctx.fillStyle=C.bg; ctx.fillRect(0,0,W,H);

    // Ball trail
    trail.push({x:ball.x,y:ball.y});
    if(trail.length>12) trail.shift();
    trail.forEach((p,i)=>{ ctx.globalAlpha=i/trail.length*.4; ctx.fillStyle=C.cyan; ctx.beginPath(); ctx.arc(p.x,p.y,BALL_R*(i/trail.length),0,Math.PI*2); ctx.fill(); });
    ctx.globalAlpha=1;

    // Move ball
    ball.x+=ball.vx; ball.y+=ball.vy;
    // Walls
    if(ball.x<BALL_R){ ball.x=BALL_R; ball.vx*=-1; }
    if(ball.x>W-BALL_R){ ball.x=W-BALL_R; ball.vx*=-1; }
    if(ball.y<BALL_R){ ball.y=BALL_R; ball.vy*=-1; }
    // Paddle
    if(ball.y>PAD_Y-BALL_R&&ball.y<PAD_Y+PAD_H&&ball.x>padX&&ball.x<padX+PAD_W){
      ball.vy=-Math.abs(ball.vy); ball.vx=(ball.x-(padX+PAD_W/2))/(PAD_W/2)*5;
      ball.y=PAD_Y-BALL_R;
    }
    // Fell
    if(ball.y>H+20){ lives--; if(lives<=0){ gameOver('💀',''); return; } ball.x=W/2; ball.y=PAD_Y-BALL_R-4; ball.vx=rnd(-3,3)||2; ball.vy=-5; trail=[]; }

    // Block collision
    for(const b of blocks){
      if(!b.alive||b.pop>0) continue;
      if(ball.x>b.x-BALL_R&&ball.x<b.x+b.w+BALL_R&&ball.y>b.y-BALL_R&&ball.y<b.y+b.h+BALL_R){
        b.hp--;
        if(b.hp<=0){ b.alive=false; b.pop=1; arcadeScore+=20; updateArcadeScore(); }
        // Which side
        const fromLeft=ball.x-(b.x+b.w), fromRight=b.x-ball.x;
        const fromTop=ball.y-(b.y+b.h), fromBottom=b.y-ball.y;
        const minH=Math.min(Math.abs(fromLeft),Math.abs(fromRight));
        const minV=Math.min(Math.abs(fromTop),Math.abs(fromBottom));
        if(minH<minV) ball.vx*=-1; else ball.vy*=-1;
        break;
      }
    }

    // Draw blocks
    for(const b of blocks){
      if(b.pop>0){ b.pop-=0.07; ctx.save(); ctx.globalAlpha=b.pop; ctx.strokeStyle=b.color; ctx.lineWidth=2; ctx.beginPath(); ctx.rect(b.x,b.y,b.w*(b.pop),b.h); ctx.stroke(); ctx.restore(); continue; }
      if(!b.alive) continue;
      ctx.fillStyle=b.hp>1?b.color+'ff':b.color+'99';
      ctx.strokeStyle=b.color; ctx.lineWidth=1;
      roundRect(ctx,b.x,b.y,b.w,b.h,4); ctx.fill(); ctx.stroke();
      if(b.hp>1){ ctx.fillStyle='rgba(255,255,255,.3)'; ctx.fillRect(b.x+4,b.y+4,b.w-8,3); }
    }

    // Paddle
    ctx.save(); ctx.fillStyle=C.accent; ctx.strokeStyle=C.purple; ctx.lineWidth=2;
    roundRect(ctx,padX,PAD_Y,PAD_W,PAD_H,5); ctx.fill(); ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,.2)'; ctx.fillRect(padX+4,PAD_Y+2,PAD_W-8,3);
    ctx.restore();

    // Ball
    ctx.save(); ctx.fillStyle=C.cyan; ctx.shadowColor=C.cyan; ctx.shadowBlur=15;
    ctx.beginPath(); ctx.arc(ball.x,ball.y,BALL_R,0,Math.PI*2); ctx.fill(); ctx.restore();

    // Lives
    for(let i=0;i<lives;i++){
      ctx.fillStyle=C.pink; ctx.beginPath(); ctx.arc(W-20-i*22,18,7,0,Math.PI*2); ctx.fill();
    }

    // Win
    if(blocks.filter(b=>b.alive).length===0){ gameOver('🏆','ALL BLOCKS CLEARED!'); return; }

    arcadeRAF=requestAnimationFrame(loop);
  }
  arcadeRAF=requestAnimationFrame(loop);
}

// ══════════════════════════════════════════════
// 🐦  FLAPPY BIRD
// ══════════════════════════════════════════════
function startFlappy(){
  const W=canvas.width, H=canvas.height;
  const GRAVITY=0.45, JUMP=-8, BIRD_R=16;
  const PIPE_W=50, GAP=W*.28, PIPE_SPEED=3;
  const PIPE_COLORS=[C.green,C.cyan,C.purple,C.accent];

  let bird={x:W*.25,y:H/2,vy:0,angle:0};
  let pipes=[];
  let pipeTimer=0;
  let passed=0;
  let particles=[];

  function jump(){ bird.vy=JUMP; particles.push(...Array.from({length:8},()=>({x:bird.x,y:bird.y,vx:rnd(-3,-1),vy:rnd(-3,3),life:1,color:C.cyan}))); }

  function onTap(e){ e.preventDefault(); jump(); }
  canvas.addEventListener('touchstart',onTap,{passive:false});
  canvas.addEventListener('click',onTap);

  arcadeGame={ cleanup(){ canvas.removeEventListener('touchstart',onTap); canvas.removeEventListener('click',onTap); } };
  buildControls('flappy');

  function spawnPipe(){
    const gapY=rnd(H*.2, H*.7);
    const col=PIPE_COLORS[Math.floor(Math.random()*PIPE_COLORS.length)];
    pipes.push({x:W,topH:gapY-GAP/2,botY:gapY+GAP/2,color:col,passed:false});
  }

  function loop(){
    ctx.fillStyle=C.bg; ctx.fillRect(0,0,W,H);

    // Parallax bg dots
    ctx.fillStyle=C.border;
    for(let i=0;i<30;i++){
      const bx=((i*137+pipeTimer*.5)%W);
      const by=((i*97)%H);
      ctx.fillRect(bx,by,2,2);
    }

    // Pipes
    pipeTimer++;
    if(pipeTimer%90===0) spawnPipe();
    for(const p of pipes){
      p.x-=PIPE_SPEED;
      // Score
      if(!p.passed&&p.x+PIPE_W<bird.x){ p.passed=true; arcadeScore++; updateArcadeScore(); passed++; PIPE_SPEED; }
      // Draw
      ctx.save(); ctx.fillStyle=p.color+'44'; ctx.strokeStyle=p.color; ctx.lineWidth=2;
      roundRect(ctx,p.x,0,PIPE_W,p.topH,6); ctx.fill(); ctx.stroke();
      roundRect(ctx,p.x,p.botY,PIPE_W,H-p.botY,6); ctx.fill(); ctx.stroke();
      // Caps
      ctx.fillStyle=p.color+'88';
      roundRect(ctx,p.x-5,p.topH-14,PIPE_W+10,14,4); ctx.fill(); ctx.stroke();
      roundRect(ctx,p.x-5,p.botY,PIPE_W+10,14,4); ctx.fill(); ctx.stroke();
      ctx.restore();
      // Collision
      if(bird.x+BIRD_R>p.x+4&&bird.x-BIRD_R<p.x+PIPE_W-4){
        if(bird.y-BIRD_R<p.topH||bird.y+BIRD_R>p.botY){ gameOver('💀',''); return; }
      }
    }
    pipes=pipes.filter(p=>p.x>-PIPE_W);

    // Bird physics
    bird.vy+=GRAVITY; bird.y+=bird.vy;
    bird.angle=Math.max(-0.5,Math.min(1.2,bird.vy*.06));
    if(bird.y>H-BIRD_R){ gameOver('💀',''); return; }
    if(bird.y<BIRD_R){ bird.y=BIRD_R; bird.vy=0; }

    // Particles
    particles.forEach(p=>{ p.x+=p.vx; p.y+=p.vy; p.life-=0.08; });
    particles=particles.filter(p=>p.life>0);
    particles.forEach(p=>{ ctx.globalAlpha=p.life; ctx.fillStyle=p.color; ctx.beginPath(); ctx.arc(p.x,p.y,4*p.life,0,Math.PI*2); ctx.fill(); });
    ctx.globalAlpha=1;

    // Bird
    ctx.save(); ctx.translate(bird.x,bird.y); ctx.rotate(bird.angle);
    // Body
    ctx.fillStyle=C.yellow; ctx.strokeStyle=C.orange; ctx.lineWidth=2;
    ctx.beginPath(); ctx.arc(0,0,BIRD_R,0,Math.PI*2); ctx.fill(); ctx.stroke();
    // Wing
    ctx.fillStyle=C.orange+'cc';
    ctx.beginPath(); ctx.ellipse(-4, 4, 10, 6, -0.4, 0, Math.PI*2); ctx.fill();
    // Eye
    ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(6,-4,5,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#000'; ctx.beginPath(); ctx.arc(7,-3,3,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(8,-2,1,0,Math.PI*2); ctx.fill();
    // Beak
    ctx.fillStyle=C.orange; ctx.beginPath(); ctx.moveTo(12,-2); ctx.lineTo(20,0); ctx.lineTo(12,4); ctx.closePath(); ctx.fill();
    ctx.restore();

    // Ground
    ctx.fillStyle=C.bg3; ctx.fillRect(0,H-8,W,8);
    ctx.fillStyle=C.border; ctx.fillRect(0,H-9,W,2);

    arcadeRAF=requestAnimationFrame(loop);
  }
  arcadeRAF=requestAnimationFrame(loop);
}

// ══════════════════════════════════════════════
// ARCADE CONTROLS
// ══════════════════════════════════════════════
function buildControls(game){
  const ctrl = id('arcadeControls');
  ctrl.innerHTML='';
  if(game==='snake'){
    ctrl.innerHTML=`
      <div style="display:grid;grid-template-columns:repeat(3,60px);grid-template-rows:repeat(2,60px);gap:8px">
        <div></div><button class="arc-btn" data-dir="up">▲</button><div></div>
        <button class="arc-btn" data-dir="left">◀</button>
        <button class="arc-btn" data-dir="down">▼</button>
        <button class="arc-btn" data-dir="right">▶</button>
      </div>`;
    ctrl.querySelectorAll('[data-dir]').forEach(b=>b.addEventListener('click',()=>{
      const k={up:'ArrowUp',down:'ArrowDown',left:'ArrowLeft',right:'ArrowRight'}[b.dataset.dir];
      document.dispatchEvent(new KeyboardEvent('keydown',{key:k}));
    }));
  } else if(game==='breakout'){
    ctrl.innerHTML=`<button class="arc-btn wide" data-dir="left">◀ LEFT</button><button class="arc-btn wide" data-dir="right">RIGHT ▶</button>`;
    ctrl.querySelectorAll('[data-dir]').forEach(b=>{
      let iv;
      const k=b.dataset.dir==='left'?'ArrowLeft':'ArrowRight';
      b.addEventListener('touchstart',()=>{ iv=setInterval(()=>document.dispatchEvent(new KeyboardEvent('keydown',{key:k})),50); },{passive:true});
      b.addEventListener('touchend',()=>clearInterval(iv));
      b.addEventListener('mousedown',()=>{ iv=setInterval(()=>document.dispatchEvent(new KeyboardEvent('keydown',{key:k})),50); });
      b.addEventListener('mouseup',()=>clearInterval(iv));
    });
  } else if(game==='capybara'){
    ctrl.innerHTML=`<button class="arc-btn wide" id="capy_jump">🐾 JUMP</button>`;
    document.getElementById('capy_jump').addEventListener('click',()=>document.dispatchEvent(new KeyboardEvent('keydown',{code:'Space'})));
  } else if(game==='flappy'){
    ctrl.innerHTML=`<button class="arc-btn wide" id="flapBtn">🐦 TAP / FLAP</button>`;
    id('flapBtn').addEventListener('click',()=>canvas.dispatchEvent(new MouseEvent('click')));
  } else if(game==='ballbattle'){
    ctrl.innerHTML=`
      <div style="display:grid;grid-template-columns:repeat(3,60px);grid-template-rows:repeat(2,60px);gap:8px">
        <div></div><button class="arc-btn" id="bb-up">▲</button><div></div>
        <button class="arc-btn" id="bb-left">◀</button>
        <button class="arc-btn" id="bb-down">⚡</button>
        <button class="arc-btn" id="bb-right">▶</button>
      </div>
      <div style="font-family:var(--font-hd);font-size:9px;letter-spacing:1px;color:var(--sub);text-align:center;padding:6px 0">▲ JUMP  ⚡ DASH  (ARROWS)</div>`;
    const bbMap={'bb-up':'ArrowUp','bb-left':'ArrowLeft','bb-right':'ArrowRight','bb-down':'ArrowDown'};
    Object.entries(bbMap).forEach(([bid,key])=>{
      const btn=id(bid);
      btn.addEventListener('touchstart',e=>{e.preventDefault();document.dispatchEvent(new KeyboardEvent('keydown',{key,bubbles:true}));},{passive:false});
      btn.addEventListener('touchend',  e=>{e.preventDefault();document.dispatchEvent(new KeyboardEvent('keyup',  {key,bubbles:true}));},{passive:false});
      btn.addEventListener('mousedown', ()=>document.dispatchEvent(new KeyboardEvent('keydown',{key,bubbles:true})));
      btn.addEventListener('mouseup',   ()=>document.dispatchEvent(new KeyboardEvent('keyup',  {key,bubbles:true})));
    });
  } else if(game==='bubbles'){
    ctrl.innerHTML=`<div style="font-family:var(--font-hd);font-size:10px;letter-spacing:2px;color:var(--sub);text-align:center;padding:8px">TAP THE CANVAS TO AIM &amp; SHOOT</div>`;
  }
}

// ══════════════════════════════════════════════
// SETTINGS
// ══════════════════════════════════════════════
[id('settingsBtn'),id('settingsBtnGame')].forEach(b=>b.addEventListener('click',()=>{
  id('langSelect').value=lang; id('firstSelect').value=firstMode; show(id('settingsModal'));
}));
id('closeSettings').addEventListener('click',()=>hide(id('settingsModal')));
id('langSelect').addEventListener('change',e=>{ lang=e.target.value; localStorage.setItem('lang',lang); updateScores(); if(gameActive) updateTurn(); });
id('firstSelect').addEventListener('change',e=>{ firstMode=e.target.value; localStorage.setItem('firstMode',firstMode); });
[id('settingsModal'),id('resultModal')].forEach(m=>m.addEventListener('click',e=>{ if(e.target===m) hide(m); }));

// Load hi scores
['bubbles','snake','breakout','flappy','capybara'].forEach(g=>{ try{arcadeHiScore[g]=parseInt(localStorage.getItem('hi_'+g))||0;}catch(e){} });

// ══════════════════════════════════════════════

// ══════════════════════════════════════════════════════════
//  ⚔️  BALL BATTLE  –  Weapon auto-battle simulator
//  Механика: выбираешь оружие → шарики прыгают сами →
//  апгрейды между волнами → побеждает последний живой
// ══════════════════════════════════════════════════════════


// ══════════════════════════════════════════════════════════════
//  ⚔️  WEAPON BALL BATTLE  –  Earclacks-style simulator
//  - Square arena with gravity + bouncing physics
//  - Weapons spin around balls, deal damage on contact
//  - Parry system: weapons clashing cancel each other
//  - 8 weapons with unique mechanics
//  - Wave progression + upgrade system
// ══════════════════════════════════════════════════════════════

const WB = {
  WEAPONS: {
    sword:    { name:'SWORD',    emoji:'⚔️',  color:'#e53e3e', hp:100, speed:3.2, dmg:8,  weaponLen:28, weaponW:5,  special:'parry',      desc:'Parries on clash' },
    hammer:   { name:'HAMMER',   emoji:'🔨',  color:'#dd6b20', hp:120, speed:2.6, dmg:15, weaponLen:24, weaponW:10, special:'noparry',     desc:'Ignores parry' },
    scythe:   { name:'SCYTHE',   emoji:'🌙',  color:'#553c9a', hp:90,  speed:3.5, dmg:10, weaponLen:30, weaponW:6,  special:'lifesteal',   desc:'Steals HP on hit' },
    spear:    { name:'SPEAR',    emoji:'🗡️',  color:'#2b6cb0', hp:100, speed:3.0, dmg:9,  weaponLen:36, weaponW:4,  special:'pierce',      desc:'Long reach' },
    bow:      { name:'BOW',      emoji:'🏹',  color:'#276749', hp:80,  speed:3.8, dmg:7,  weaponLen:20, weaponW:4,  special:'ranged',      desc:'Shoots arrows' },
    shield:   { name:'SHIELD',   emoji:'🛡️',  color:'#2c7a7b', hp:140, speed:2.4, dmg:5,  weaponLen:22, weaponW:12, special:'block',       desc:'Blocks attacks' },
    dagger:   { name:'DAGGER',   emoji:'🔪',  color:'#e2e8f0', hp:80,  speed:4.5, dmg:6,  weaponLen:20, weaponW:4,  special:'fast',        desc:'Very fast' },
    lightning:{ name:'LIGHTNING',emoji:'⚡',  color:'#f6e05e', hp:90,  speed:3.6, dmg:11, weaponLen:26, weaponW:5,  special:'chain',       desc:'Chains on hit' },
  },

  // Arena
  arena: { x:0, y:0, w:0, h:0 },

  // Game state
  balls: [],
  projectiles: [],
  particles: [],
  sparks: [],
  wave: 1,
  phase: 'select', // 'select' | 'fight' | 'upgrade' | 'result'
  playerWeapon: 'sword',
  upgradeOptions: [],
  roundWins: [0,0],
  resultWin: false,
  slowmo: 0,
  fightTime: 0,
  shakeX: 0, shakeY: 0,
  scores: [0,0],
  raf: null,
  selectHover: null,
  selectConfirmed: false,
};

function wbInit() {
  const W = canvas.width, H = canvas.height;
  // Square arena centered, leaving room for HP bars
  const arenaSize = Math.min(W - 20, H - 120);
  WB.arena = {
    x: (W - arenaSize) / 2,
    y: 60,
    w: arenaSize,
    h: arenaSize
  };
  WB.phase = 'select';
  WB.wave = 1;
  WB.roundWins = [0, 0];
  WB.selectHover = null;
  WB.selectConfirmed = false;
  WB.balls = [];
  WB.projectiles = [];
  WB.particles = [];
  WB.sparks = [];
}

function wbMakeBall(side, weaponKey, wave) {
  const w = WB.WEAPONS[weaponKey];
  const A = WB.arena;
  const waveMult = 1 + (wave - 1) * 0.18;
  return {
    // Position
    x: side === 'left' ? A.x + A.w * 0.25 : A.x + A.w * 0.75,
    y: A.y + A.h * 0.3,
    vx: side === 'left' ? 1.5 : -1.5,
    vy: 0,
    r: 22,
    // Stats
    hp: w.hp * waveMult,
    maxHp: w.hp * waveMult,
    dmg: w.dmg * waveMult,
    spd: w.speed,
    armor: 0,
    regen: 0,
    // Weapon
    weaponKey,
    weaponAngle: side === 'left' ? 0 : Math.PI,
    weaponRotSpeed: side === 'left' ? 3.5 : -3.5, // rad/s
    weaponLen: w.weaponLen,
    weaponW: w.weaponW,
    // Mechanics
    hitTimer: 0,
    parryTimer: 0,
    side,
    color: w.color,
    multi: 0,
    // Arrow cooldown for bow
    arrowTimer: 0,
    // Chain counter for lightning
    chainCount: 0,
    // Scaling - weapons get stronger on hit
    hitCount: 0,
    // Death
    alive: true,
    deathTimer: 0,
  };
}

// ── PHYSICS ──────────────────────────────────────────────────
const WB_GRAVITY = 0.38;
const WB_BOUNCE  = 0.70;
const WB_FRICTION = 0.989;
const WB_FLOOR_FRICTION = 0.86;

function wbPhysics(dt) {
  const A = WB.arena;

  for (const b of WB.balls) {
    if (!b.alive) continue;

    // Gravity
    b.vy += WB_GRAVITY * dt;
    // Apply velocity
    b.x  += b.vx * dt;
    b.y  += b.vy * dt;

    // Regen
    if (b.regen > 0) b.hp = Math.min(b.maxHp, b.hp + b.regen * dt * 0.016);

    // Weapon rotation
    b.weaponAngle += b.weaponRotSpeed * 0.05 * dt;

    // Arrow timer
    if (b.arrowTimer > 0) b.arrowTimer -= dt;

    // Hitimer
    if (b.hitTimer > 0) b.hitTimer -= dt;
    if (b.parryTimer > 0) b.parryTimer -= dt;

    // Arena walls - bounce
    if (b.x - b.r < A.x) {
      b.x = A.x + b.r;
      b.vx = Math.abs(b.vx) * WB_BOUNCE;
      wbBounceParticles(b.x, b.y, b.color);
    }
    if (b.x + b.r > A.x + A.w) {
      b.x = A.x + A.w - b.r;
      b.vx = -Math.abs(b.vx) * WB_BOUNCE;
      wbBounceParticles(b.x, b.y, b.color);
    }
    // Floor
    if (b.y + b.r > A.y + A.h) {
      b.y = A.y + A.h - b.r;
      b.vy = -Math.abs(b.vy) * WB_BOUNCE;
      b.vx *= WB_FLOOR_FRICTION;
      // Jump back up to keep bouncing
      if (Math.abs(b.vy) < 2) b.vy = -(3 + Math.random() * 2);
    }
    // Ceiling
    if (b.y - b.r < A.y) {
      b.y = A.y + b.r;
      b.vy = Math.abs(b.vy) * WB_BOUNCE;
    }

    // Clamp speed
    const spd = Math.hypot(b.vx, b.vy);
    const maxSpd = b.spd * 6;
    if (spd > maxSpd) { b.vx = b.vx/spd*maxSpd; b.vy = b.vy/spd*maxSpd; }

    // Make sure ball keeps moving
    if (spd < 1.5) {
      b.vx += (Math.random() - 0.5) * 1.2;
      b.vy -= 1 + Math.random();
    }
  }

  // Ball vs ball body collision
  for (let i = 0; i < WB.balls.length; i++) {
    for (let j = i+1; j < WB.balls.length; j++) {
      const a = WB.balls[i], b2 = WB.balls[j];
      if (!a.alive || !b2.alive) continue;
      const dx = b2.x-a.x, dy = b2.y-a.y;
      const d = Math.hypot(dx, dy);
      if (d < a.r + b2.r && d > 0) {
        const nx = dx/d, ny = dy/d;
        const overlap = (a.r + b2.r - d) / 2;
        a.x -= nx*overlap*0.5; a.y -= ny*overlap*0.5;
        b2.x += nx*overlap*0.5; b2.y += ny*overlap*0.5;
        const rv = (a.vx-b2.vx)*nx + (a.vy-b2.vy)*ny;
        if (rv > 0) {
          a.vx -= nx*rv*0.9; a.vy -= ny*rv*0.9;
          b2.vx += nx*rv*0.9; b2.vy += ny*rv*0.9;
        }
      }
    }
  }

  // Projectile physics
  for (let i = WB.projectiles.length-1; i >= 0; i--) {
    const p = WB.projectiles[i];
    p.x += p.vx * dt; p.y += p.vy * dt;
    p.vy += WB_GRAVITY * 0.15 * dt;
    p.life -= 0.015 * dt;
    if (p.x<A.x||p.x>A.x+A.w||p.y>A.y+A.h||p.life<=0) { WB.projectiles.splice(i,1); continue; }
    if (p.y < A.y) { p.vy = Math.abs(p.vy); }
    // Hit
    for (const b of WB.balls) {
      if (!b.alive || b.side === p.owner) continue;
      if (Math.hypot(p.x-b.x, p.y-b.y) < b.r+p.r) {
        if (b.hitTimer <= 0) {
          wbDealDamage(b, p.dmg, null);
        }
        wbBurst(p.x, p.y, p.color, 6);
        WB.projectiles.splice(i, 1);
        break;
      }
    }
  }

  // Particles
  for (let i = WB.particles.length-1; i >= 0; i--) {
    const p = WB.particles[i];
    p.x += p.vx*dt; p.y += p.vy*dt;
    p.vy += 0.1*dt; p.vx *= 0.94; p.vy *= 0.97;
    p.life -= 0.03*dt;
    if (p.life <= 0) WB.particles.splice(i, 1);
  }

  // Sparks
  for (let i = WB.sparks.length-1; i >= 0; i--) {
    const s = WB.sparks[i];
    s.x += s.vx*dt; s.y += s.vy*dt; s.life -= 0.06*dt;
    if (s.life <= 0) WB.sparks.splice(i, 1);
  }

  // Screen shake decay
  WB.shakeX *= 0.75; WB.shakeY *= 0.75;
}

// ── WEAPON COLLISION ─────────────────────────────────────────
function wbWeaponTip(b) {
  return {
    x: b.x + Math.cos(b.weaponAngle) * (b.r + b.weaponLen),
    y: b.y + Math.sin(b.weaponAngle) * (b.r + b.weaponLen)
  };
}

function wbWeaponHitbox(b) {
  // Line from ball surface to tip
  const sx = b.x + Math.cos(b.weaponAngle) * b.r;
  const sy = b.y + Math.sin(b.weaponAngle) * b.r;
  const ex = b.x + Math.cos(b.weaponAngle) * (b.r + b.weaponLen);
  const ey = b.y + Math.sin(b.weaponAngle) * (b.r + b.weaponLen);
  return { sx, sy, ex, ey };
}

function wbPointSegDist(px, py, ax, ay, bx, by) {
  const abx = bx-ax, aby = by-ay;
  const t = Math.max(0, Math.min(1, ((px-ax)*abx+(py-ay)*aby)/(abx*abx+aby*aby+0.001)));
  const cx = ax+t*abx, cy = ay+t*aby;
  return Math.hypot(px-cx, py-cy);
}

function wbCheckWeaponHits(dt) {
  const alive = WB.balls.filter(b => b.alive);
  for (let i = 0; i < alive.length; i++) {
    for (let j = 0; j < alive.length; j++) {
      if (i === j) continue;
      const attacker = alive[i];
      const defender = alive[j];
      if (attacker.side === defender.side) continue;

      const h = wbWeaponHitbox(attacker);
      const distToBody = wbPointSegDist(defender.x, defender.y, h.sx, h.sy, h.ex, h.ey);
      const distToWeapon = wbSegSegDist(h.sx, h.sy, h.ex, h.ey, ...wbWeaponHitbox(defender).sx !== undefined ? [wbWeaponHitbox(defender).sx, wbWeaponHitbox(defender).sy, wbWeaponHitbox(defender).ex, wbWeaponHitbox(defender).ey] : [defender.x, defender.y, defender.x, defender.y]);

      // Weapon-to-weapon parry check
      const defH = wbWeaponHitbox(defender);
      const weaponClash = wbSegSegDist(h.sx, h.sy, h.ex, h.ey, defH.sx, defH.sy, defH.ex, defH.ey) < 8;

      if (weaponClash && attacker.parryTimer <= 0 && defender.parryTimer <= 0) {
        // PARRY - weapons clash
        const isHammerAtt = attacker.weaponKey === 'hammer';
        const isHammerDef = defender.weaponKey === 'hammer';
        if (!isHammerAtt && !isHammerDef) {
          // Both bounce back
          attacker.vx *= -0.6; attacker.vy *= -0.5;
          defender.vx *= -0.6; defender.vy *= -0.5;
          attacker.parryTimer = 20; defender.parryTimer = 20;
          wbSparkBurst((attacker.x+defender.x)/2, (attacker.y+defender.y)/2);
          WB.shakeX = 3; WB.shakeY = 3;
          continue;
        }
      }

      // Weapon hits body
      if (distToBody < defender.r + attacker.weaponW * 0.5 && attacker.hitTimer <= 0) {
        const dmg = attacker.dmg * (1 - (defender.armor || 0));
        wbDealDamage(defender, dmg, attacker);
        attacker.hitTimer = 18;
        attacker.hitCount++;

        // Knock defender away from attacker
        const ang = Math.atan2(defender.y - attacker.y, defender.x - attacker.x);
        defender.vx += Math.cos(ang) * 3;
        defender.vy += Math.sin(ang) * 2.5 - 1;

        wbBurst(defender.x, defender.y, defender.color, 8);
        WB.shakeX += 4; WB.shakeY += 4;
        WB.slowmo = 8;

        // Weapon specials
        wbApplySpecial(attacker, defender);

        // Shoot arrow for bow
        if (attacker.weaponKey === 'bow' && attacker.arrowTimer <= 0) {
          const target = WB.balls.find(b => b.alive && b.side !== attacker.side);
          if (target) {
            const adx = target.x-attacker.x, ady = target.y-attacker.y;
            const al = Math.hypot(adx,ady)||1;
            WB.projectiles.push({ x:attacker.x+Math.cos(attacker.weaponAngle)*attacker.r, y:attacker.y+Math.sin(attacker.weaponAngle)*attacker.r, vx:adx/al*7, vy:ady/al*7-1, r:4, dmg:attacker.dmg*0.5, color:'#68d391', owner:attacker.side, life:1 });
            attacker.arrowTimer = 45;
          }
        }
      }
    }
  }
}

function wbSegSegDist(ax,ay,bx,by,cx,cy,dx,dy) {
  // Minimum distance between two segments
  function ptSeg(px,py,ax,ay,bx,by) {
    const t = Math.max(0,Math.min(1,((px-ax)*(bx-ax)+(py-ay)*(by-ay))/((bx-ax)**2+(by-ay)**2+0.001)));
    return Math.hypot(px-(ax+t*(bx-ax)),py-(ay+t*(by-ay)));
  }
  return Math.min(ptSeg(ax,ay,cx,cy,dx,dy),ptSeg(bx,by,cx,cy,dx,dy),ptSeg(cx,cy,ax,ay,bx,by),ptSeg(dx,dy,ax,ay,bx,by));
}

function wbApplySpecial(attacker, defender) {
  const w = attacker.weaponKey;
  if (w === 'scythe') { attacker.hp = Math.min(attacker.maxHp, attacker.hp + attacker.dmg * 0.4); }
  if (w === 'hammer') { defender.vx += (defender.x-attacker.x > 0 ? 1:-1) * 5; defender.vy -= 4; }
  if (w === 'lightning') {
    attacker.chainCount = (attacker.chainCount||0) + 1;
    // Chain spark
    wbSparkBurst(defender.x, defender.y);
  }
}

function wbDealDamage(ball, dmg, attacker) {
  ball.hp -= dmg;
  if (ball.hp <= 0) {
    ball.hp = 0;
    ball.alive = false;
    wbBurst(ball.x, ball.y, ball.color, 25);
    WB.shakeX = 8; WB.shakeY = 8;
  }
}

function wbBurst(x, y, color, n) {
  for (let i = 0; i < n; i++) {
    const a = Math.random()*Math.PI*2, spd = rnd(2,8);
    WB.particles.push({x, y, vx:Math.cos(a)*spd, vy:Math.sin(a)*spd-1, r:rnd(2,6), color, life:1});
  }
}

function wbBounceParticles(x, y, color) {
  for (let i = 0; i < 4; i++) {
    const a = Math.random()*Math.PI*2, spd = rnd(1,4);
    WB.particles.push({x, y, vx:Math.cos(a)*spd, vy:Math.sin(a)*spd, r:rnd(1,3), color, life:0.6});
  }
}

function wbSparkBurst(x, y) {
  for (let i = 0; i < 8; i++) {
    const a = Math.random()*Math.PI*2, spd = rnd(3,10);
    WB.sparks.push({x, y, vx:Math.cos(a)*spd, vy:Math.sin(a)*spd, life:1});
  }
}

// ── BOT AI ────────────────────────────────────────────────────
function wbBotAI(bot, dt) {
  const target = WB.balls.find(b => b.alive && b.side !== bot.side);
  if (!target) return;

  const A = WB.arena;
  const dx = target.x - bot.x;

  // Move toward player horizontally
  const moveForce = 0.22 * dt;
  bot.vx += Math.sign(dx) * moveForce * bot.spd;

  // Jump when near floor
  const onFloor = bot.y + bot.r > A.y + A.h - 5;
  if (onFloor) {
    bot.vy = -(bot.spd * 4 + Math.random() * 2);
    bot.vx += (Math.random()-0.5) * 2;
  }
}

// ── DRAW ──────────────────────────────────────────────────────
function wbDraw() {
  const W = canvas.width, H = canvas.height;
  const A = WB.arena;

  ctx.save();
  ctx.translate(WB.shakeX * (Math.random()-0.5), WB.shakeY * (Math.random()-0.5));

  // BG
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);

  // Arena background
  ctx.fillStyle = '#0d1117';
  roundRect(ctx, A.x, A.y, A.w, A.h, 8); ctx.fill();

  // Grid
  ctx.strokeStyle = '#1a1f2e'; ctx.lineWidth = 1;
  for (let gx = A.x; gx <= A.x+A.w; gx += 32) { ctx.beginPath(); ctx.moveTo(gx, A.y); ctx.lineTo(gx, A.y+A.h); ctx.stroke(); }
  for (let gy = A.y; gy <= A.y+A.h; gy += 32) { ctx.beginPath(); ctx.moveTo(A.x, gy); ctx.lineTo(A.x+A.w, gy); ctx.stroke(); }

  // Arena border
  ctx.strokeStyle = '#7c6fff'; ctx.lineWidth = 2.5;
  roundRect(ctx, A.x, A.y, A.w, A.h, 8); ctx.stroke();
  ctx.strokeStyle = '#7c6fff33'; ctx.lineWidth = 10;
  roundRect(ctx, A.x-2, A.y-2, A.w+4, A.h+4, 10); ctx.stroke();

  // Particles
  for (const p of WB.particles) {
    ctx.globalAlpha = p.life * 0.9;
    ctx.fillStyle = p.color;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r*p.life, 0, Math.PI*2); ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Sparks
  for (const s of WB.sparks) {
    ctx.globalAlpha = s.life;
    ctx.strokeStyle = '#fef08a'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.x+s.vx*3, s.y+s.vy*3); ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Projectiles
  for (const p of WB.projectiles) {
    ctx.save(); ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color; ctx.strokeStyle = '#fff9'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2); ctx.fill(); ctx.stroke();
    ctx.restore();
  }

  // Balls + weapons
  for (const b of WB.balls) {
    if (!b.alive) continue;
    ctx.save();

    // Body shadow
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = b.color;
    ctx.beginPath(); ctx.ellipse(b.x+2, b.y+3, b.r, b.r*0.5, 0, 0, Math.PI*2); ctx.fill();
    ctx.globalAlpha = 1;

    // Hit flash
    if (b.hitTimer > 0 && Math.floor(b.hitTimer/3) % 2 === 0) ctx.globalAlpha = 0.4;

    // Weapon (drawn behind ball)
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.rotate(b.weaponAngle);
    const w = WB.WEAPONS[b.weaponKey];
    // Weapon trail
    ctx.strokeStyle = b.color + '55'; ctx.lineWidth = w.weaponW + 4;
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(b.r * 0.8, 0); ctx.lineTo(b.r + w.weaponLen, 0); ctx.stroke();
    // Weapon body
    ctx.strokeStyle = w.special === 'block' ? '#a0aec0' : b.color; ctx.lineWidth = w.weaponW;
    ctx.beginPath(); ctx.moveTo(b.r * 0.8, 0); ctx.lineTo(b.r + w.weaponLen, 0); ctx.stroke();
    // Tip glow
    ctx.fillStyle = '#fff'; ctx.globalAlpha = 0.6;
    ctx.beginPath(); ctx.arc(b.r + w.weaponLen, 0, w.weaponW*0.7, 0, Math.PI*2); ctx.fill();
    ctx.restore();

    // Ball body
    ctx.globalAlpha = 1;
    const grd = ctx.createRadialGradient(b.x - b.r*0.35, b.y - b.r*0.35, b.r*0.05, b.x, b.y, b.r);
    grd.addColorStop(0, '#ffffffcc');
    grd.addColorStop(0.35, b.color + 'ff');
    grd.addColorStop(1, b.color + '66');
    ctx.fillStyle = grd;
    ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI*2); ctx.fill();

    // Parry shield rim
    if (b.parryTimer > 0) {
      ctx.strokeStyle = '#fef08a'; ctx.lineWidth = 3; ctx.globalAlpha = b.parryTimer/20;
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r+5, 0, Math.PI*2); ctx.stroke();
    }

    // Weapon icon (canvas SVG-style)
    ctx.globalAlpha = 1;
    drawWeaponIcon(ctx, b.weaponKey, b.x, b.y, b.r * 0.62, b.color);

    ctx.restore();
  }

  // ── HP BARS (outside arena) ──
  const barW = A.w * 0.44;
  const barH = 14;
  const barY = A.y + A.h + 12;

  for (let i = 0; i < WB.balls.length; i++) {
    const b = WB.balls[i];
    const bx = i === 0 ? A.x : A.x + A.w - barW;
    const ratio = Math.max(0, b.hp / b.maxHp);

    ctx.fillStyle = C.bg3;
    roundRect(ctx, bx, barY, barW, barH, 6); ctx.fill();

    ctx.fillStyle = ratio > 0.6 ? C.green : ratio > 0.3 ? C.yellow : C.pink;
    if (ratio > 0) { roundRect(ctx, bx, barY, barW * ratio, barH, 6); ctx.fill(); }

    ctx.strokeStyle = C.border; ctx.lineWidth = 1;
    roundRect(ctx, bx, barY, barW, barH, 6); ctx.stroke();

    // HP label
    ctx.fillStyle = C.text; ctx.textAlign = i === 0 ? 'left' : 'right';
    ctx.font = `bold ${W*0.027}px 'Orbitron', monospace`;
    ctx.textBaseline = 'bottom';
    ctx.fillText(WB.WEAPONS[b.weaponKey].name, i===0 ? bx : bx+barW, barY - 2);

    // HP num
    ctx.fillStyle = C.sub; ctx.textAlign = i === 0 ? 'right' : 'left';
    ctx.font = `${W*0.024}px 'DM Sans', sans-serif`;
    ctx.fillText(Math.ceil(b.hp), i===0 ? bx+barW : bx, barY - 2);
  }

  // Wave + round wins
  ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  ctx.fillStyle = C.sub; ctx.font = `bold ${W*0.032}px 'Orbitron', monospace`;
  ctx.fillText(`WAVE ${WB.wave}`, W/2, A.y - 40);

  // Round win dots
  for (let p = 0; p < 2; p++) {
    const dotX = p === 0 ? A.x + A.w*0.25 : A.x + A.w*0.75;
    for (let w2 = 0; w2 < 3; w2++) {
      const filled = w2 < WB.roundWins[p];
      ctx.fillStyle = filled ? (p===0 ? C.pink : C.cyan) : C.bg3;
      ctx.strokeStyle = p===0 ? C.pink : C.cyan; ctx.lineWidth=2;
      ctx.beginPath();
      ctx.arc(dotX + (w2-1)*18, A.y - 16, 6, 0, Math.PI*2);
      ctx.fill(); ctx.stroke();
    }
  }

  ctx.restore();
}

// ── SELECT SCREEN ─────────────────────────────────────────────
function wbDrawSelect() {
  const W = canvas.width, H = canvas.height;
  ctx.fillStyle = C.bg; ctx.fillRect(0,0,W,H);

  // Title
  ctx.fillStyle = C.accent;
  ctx.font = `bold ${W*0.052}px 'Orbitron', monospace`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  ctx.fillText('PICK WEAPON', W/2, 18);

  ctx.fillStyle = C.sub;
  ctx.font = `${W*0.028}px 'Orbitron', monospace`;
  ctx.fillText('TAP TO SELECT  ·  TAP AGAIN TO FIGHT', W/2, 18 + W*0.065);

  // 4x2 grid
  const cols = 4;
  const pad = 10;
  const cellW = (W - pad*(cols+1)) / cols;
  const cellH = cellW * 0.88;
  const startY = 18 + W*0.1;

  Object.entries(WB.WEAPONS).forEach(([key, w], i) => {
    const col = i % cols, row = Math.floor(i / cols);
    const cx = pad + col*(cellW+pad);
    const cy = startY + row*(cellH+8);
    const sel = WB.playerWeapon === key;
    const hov = WB.selectHover === key;

    // Card
    ctx.fillStyle = sel ? w.color+'2a' : hov ? '#ffffff0e' : C.bg2;
    ctx.strokeStyle = sel ? w.color : hov ? '#ffffff33' : C.border;
    ctx.lineWidth = sel ? 2.5 : 1.5;
    roundRect(ctx, cx, cy, cellW, cellH, 10); ctx.fill(); ctx.stroke();

    // Weapon icon
    drawWeaponIcon(ctx, key, cx+cellW/2, cy+cellH*0.38, cellH*0.22, w.color);

    // Name
    ctx.fillStyle = sel ? w.color : C.text;
    ctx.font = `bold ${cellW*0.11}px 'Orbitron', monospace`;
    ctx.fillText(w.name, cx+cellW/2, cy+cellH*0.73);

    // Desc
    ctx.fillStyle = C.sub;
    ctx.font = `${cellW*0.085}px 'DM Sans', sans-serif`;
    ctx.fillText(w.desc, cx+cellW/2, cy+cellH*0.90);
  });

  // Selected weapon stats panel
  const sw = WB.WEAPONS[WB.playerWeapon];
  const panY = startY + 2*(cellH+8) + 10;
  const panH = H - panY - 10;
  if (panH > 40) {
    ctx.fillStyle = C.bg2; ctx.strokeStyle = sw.color; ctx.lineWidth=1.5;
    roundRect(ctx, pad, panY, W-pad*2, panH, 10); ctx.fill(); ctx.stroke();

    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    drawWeaponIcon(ctx, WB.playerWeapon, W/2, panY + panH*0.28, panH*0.2, sw.color);

    ctx.fillStyle = sw.color;
    ctx.font = `bold ${W*0.042}px 'Orbitron', monospace`;
    ctx.fillText(sw.name, W/2, panY + panH*0.58);

    ctx.fillStyle = C.sub;
    ctx.font = `${W*0.03}px 'DM Sans', sans-serif`;
    ctx.fillText('SPECIAL: ' + sw.special.toUpperCase() + ' · ' + sw.desc.toUpperCase(), W/2, panY + panH*0.82);
  }
}

// ── UPGRADE SCREEN ────────────────────────────────────────────
const WB_UPGRADES = [
  { id:'dmg',    name:'POWER UP',  emoji:'💪', desc:'+25% damage',     apply: b => b.dmg *= 1.25 },
  { id:'speed',  name:'SPEED',     emoji:'⚡', desc:'+20% speed',      apply: b => { b.spd *= 1.2; b.weaponRotSpeed *= 1.15; } },
  { id:'hp',     name:'HEAL',      emoji:'❤️', desc:'Restore 40 HP',   apply: b => { b.hp = Math.min(b.maxHp, b.hp+40); } },
  { id:'size',   name:'BIG BALL',  emoji:'🔮', desc:'+15% size',       apply: b => { b.r *= 1.15; b.dmg *= 1.1; } },
  { id:'armor',  name:'ARMOR',     emoji:'🛡', desc:'-25% dmg taken',  apply: b => b.armor = Math.min(0.6, (b.armor||0)+0.25) },
  { id:'regen',  name:'REGEN',     emoji:'💚', desc:'+1.5 HP/sec',     apply: b => b.regen = (b.regen||0)+1.5 },
  { id:'weapon', name:'LONG ARM',  emoji:'🗡', desc:'+8 weapon reach', apply: b => b.weaponLen += 8 },
  { id:'clone',  name:'CLONE',     emoji:'👥', desc:'Add ally ball',   apply: null },
];

function wbDrawUpgrade() {
  const W = canvas.width, H = canvas.height;
  ctx.fillStyle = C.bg; ctx.fillRect(0,0,W,H);

  ctx.fillStyle = C.green;
  ctx.font = `bold ${W*0.055}px 'Orbitron', monospace`;
  ctx.textAlign='center'; ctx.textBaseline='top';
  ctx.fillText(`WAVE ${WB.wave-1} CLEAR! 🎉`, W/2, 22);

  ctx.fillStyle = C.sub;
  ctx.font = `${W*0.03}px 'Orbitron', monospace`;
  ctx.fillText('CHOOSE UPGRADE', W/2, 22+W*0.072);
}

function wbDrawResult() {
  const W = canvas.width, H = canvas.height;
  ctx.fillStyle = C.bg; ctx.fillRect(0,0,W,H);
  ctx.textAlign='center';
  ctx.font=`${W*0.17}px serif`; ctx.textBaseline='middle';
  ctx.fillText(WB.resultWin ? '🏆' : '💀', W/2, H*0.3);
  ctx.fillStyle = WB.resultWin ? C.accent : C.pink;
  ctx.font=`bold ${W*0.062}px 'Orbitron', monospace`;
  ctx.fillText(WB.resultWin ? 'VICTORY!' : 'DEFEATED!', W/2, H*0.52);
  ctx.fillStyle = C.sub;
  ctx.font=`${W*0.032}px 'Orbitron', monospace`;
  ctx.fillText(`WAVE ${WB.wave}  ·  SCORE: ${arcadeScore}`, W/2, H*0.65);
}

// ── MAIN ENTRY ────────────────────────────────────────────────
function openBallBattle() {
  stopArcade();
  id('arcadeControls').innerHTML = '';
  wbInit();
  wbRunSelectLoop();
}

function wbRunSelectLoop() {
  // Input handling for select
  function getCellKey(ex, ey) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const cx = (ex - rect.left) * scaleX;
    const cy = (ey - rect.top) * scaleY;
    const W = canvas.width;
    const cols = 4, pad = 10;
    const cellW = (W - pad*(cols+1)) / cols;
    const cellH = cellW * 0.88;
    const startY = 18 + W*0.1;
    let found = null;
    Object.keys(WB.WEAPONS).forEach((key, i) => {
      const col = i%cols, row = Math.floor(i/cols);
      const bx = pad+col*(cellW+pad), by = startY+row*(cellH+8);
      if (cx>=bx && cx<=bx+cellW && cy>=by && cy<=by+cellH) found=key;
    });
    return found;
  }

  function onMove(e) { const k = getCellKey(e.clientX, e.clientY); if(k) WB.selectHover=k; }
  function onTap(e) {
    const src = e.touches ? e.changedTouches[0] : e;
    const k = getCellKey(src.clientX, src.clientY);
    if (!k) return;
    if (WB.playerWeapon === k) {
      // Confirmed — start fight
      cleanup();
      wbStartFight();
    } else {
      WB.playerWeapon = k;
    }
  }

  function cleanup() {
    canvas.removeEventListener('mousemove', onMove);
    canvas.removeEventListener('click', onTap);
    canvas.removeEventListener('touchend', onTap);
    id('arcadeControls').innerHTML = '';
    if(WB.raf) { cancelAnimationFrame(WB.raf); WB.raf = null; }
  }

  canvas.addEventListener('mousemove', onMove);
  canvas.addEventListener('click', onTap);
  canvas.addEventListener('touchend', onTap);

  // Fight button
  id('arcadeControls').innerHTML = `<button class="start-btn" id="wbFightBtn" style="max-width:280px;margin:0 auto;display:block">⚔️ FIGHT!</button>`;
  id('wbFightBtn').addEventListener('click', () => { cleanup(); wbStartFight(); });

  function loop() {
    wbDrawSelect();
    WB.raf = requestAnimationFrame(loop);
  }
  WB.raf = requestAnimationFrame(loop);
}

function wbStartFight() {
  if (WB.raf) { cancelAnimationFrame(WB.raf); WB.raf = null; }
  id('arcadeControls').innerHTML = '';

  // Pick enemy weapon
  const keys = Object.keys(WB.WEAPONS).filter(k => k !== WB.playerWeapon);
  const enemyWeapon = keys[Math.floor(Math.random() * keys.length)];

  WB.balls = [
    wbMakeBall('left', WB.playerWeapon, WB.wave),
    wbMakeBall('right', enemyWeapon, WB.wave),
  ];
  WB.projectiles = [];
  WB.particles = [];
  WB.sparks = [];
  WB.slowmo = 0;
  WB.fightTime = 0;
  WB.phase = 'fight';

  arcadeGame = { cleanup() {} };

  let last = null;
  function loop(ts) {
    if (!last) last = ts;
    const rawDt = Math.min((ts - last) / 16.67, 2.5);
    last = ts;
    const dt = WB.slowmo > 0 ? rawDt * 0.3 : rawDt;
    if (WB.slowmo > 0) WB.slowmo--;

    WB.fightTime += rawDt;
    arcadeScore = (WB.wave-1)*200 + Math.floor(WB.fightTime/3);
    updateArcadeScore();

    wbPhysics(dt);
    wbWeaponTick(dt);
    wbCheckWeaponHits(dt);
    wbBotAI(WB.balls[1], dt);

    // Check death
    const pAlive = WB.balls.filter(b=>b.side==='left'&&b.alive);
    const eAlive = WB.balls.filter(b=>b.side==='right'&&b.alive);

    if (eAlive.length === 0) {
      WB.roundWins[0]++;
      cancelAnimationFrame(WB.raf);
      if (WB.roundWins[0] >= 3) {
        WB.wave++;
        if (WB.wave > 5) {
          WB.resultWin = true; WB.phase='result';
          wbDrawResult();
          wbShowResultBtns();
        } else {
          WB.roundWins = [0,0];
          wbDrawResult_wave();
          setTimeout(() => wbShowUpgrades(), 600);
        }
      } else {
        setTimeout(() => wbStartFight(), 1200);
      }
      WB.raf = null;
      wbDraw(); return;
    }
    if (pAlive.length === 0) {
      WB.roundWins[1]++;
      cancelAnimationFrame(WB.raf);
      if (WB.roundWins[1] >= 3) {
        WB.resultWin = false; WB.phase='result';
        wbDrawResult();
        wbShowResultBtns();
      } else {
        setTimeout(() => wbStartFight(), 1200);
      }
      WB.raf = null;
      wbDraw(); return;
    }

    wbDraw();
    WB.raf = requestAnimationFrame(loop);
  }
  WB.raf = requestAnimationFrame(loop);
}

function wbWeaponTick(dt) {
  // Extra: bow fires auto-arrows at enemy
  for (const b of WB.balls) {
    if (!b.alive) continue;
    if (b.weaponKey === 'bow') {
      b.arrowTimer = (b.arrowTimer || 0);
      if (b.arrowTimer > 0) b.arrowTimer -= dt;
      if (b.arrowTimer <= 0) {
        const target = WB.balls.find(t => t.alive && t.side !== b.side);
        if (target) {
          const adx = target.x-b.x, ady = target.y-b.y;
          const al = Math.hypot(adx,ady)||1;
          WB.projectiles.push({
            x: b.x+Math.cos(b.weaponAngle)*(b.r+5),
            y: b.y+Math.sin(b.weaponAngle)*(b.r+5),
            vx: adx/al*8, vy: ady/al*8-1,
            r:5, dmg:b.dmg*0.55, color:'#68d391', owner:b.side, life:1.2
          });
          b.arrowTimer = 60 + Math.random()*30;
          wbBounceParticles(b.x, b.y, '#68d391');
        }
      }
    }
  }
}

function wbDrawResult_wave() {
  const W = canvas.width, H = canvas.height;
  ctx.fillStyle = 'rgba(0,0,0,0.75)';
  ctx.fillRect(0, 0, W, H);
  ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.font=`bold ${W*0.07}px 'Orbitron',monospace`;
  ctx.fillStyle = C.green;
  ctx.fillText('WAVE CLEAR! ✓', W/2, H*0.45);
}

function wbShowUpgrades() {
  if (WB.raf) { cancelAnimationFrame(WB.raf); WB.raf = null; }

  const pool = [...WB_UPGRADES].sort(()=>Math.random()-0.5).slice(0,3);
  WB.upgradeOptions = pool;

  // Draw upgrade cards in controls area
  const ctrl = id('arcadeControls');
  ctrl.innerHTML = `
    <div style="font-family:var(--font-hd);font-size:10px;letter-spacing:2px;color:var(--sub);text-align:center;margin-bottom:10px">
      ⭐ WAVE ${WB.wave} — CHOOSE UPGRADE
    </div>
    ${pool.map((u,i) => `
      <button class="ctrl-btn" id="wbUpg${i}" style="width:100%;margin-bottom:8px;border-color:var(--accent);color:var(--text);padding:13px 12px;display:flex;align-items:center;gap:10px;font-size:13px">
        <span style="font-size:22px">${u.emoji}</span>
        <span style="text-align:left"><strong style="font-family:var(--font-hd);font-size:11px;letter-spacing:1px">${u.name}</strong><br><span style="font-size:12px;color:var(--sub)">${u.desc}</span></span>
      </button>`).join('')}`;

  // Loop to show upgrade bg
  function loop() {
    wbDrawUpgrade();
    WB.raf = requestAnimationFrame(loop);
  }
  WB.raf = requestAnimationFrame(loop);

  pool.forEach((u, i) => {
    id('wbUpg'+i).addEventListener('click', () => {
      // Apply upgrade to player balls
      const playerBalls = WB.balls.filter(b => b.side==='left');
      if (u.apply) {
        playerBalls.forEach(b => u.apply(b));
      } else if (u.id === 'clone') {
        const original = WB.balls.find(b=>b.side==='left'&&b.alive);
        if (original) {
          const clone = { ...original, x: original.x-40, vx:-1, vy:-2, hp:original.maxHp*0.5, maxHp:original.maxHp*0.5, hitTimer:0 };
          WB.balls.push(clone);
        }
      }
      cancelAnimationFrame(WB.raf); WB.raf = null;
      ctrl.innerHTML = '';
      WB.roundWins = [0,0];
      setTimeout(() => wbStartFight(), 300);
    });
  });
}

function wbShowResultBtns() {
  const ctrl = id('arcadeControls');
  ctrl.innerHTML = `
    <button class="start-btn" id="wbRetry" style="max-width:280px;margin:0 auto 10px;display:block">↺ RETRY</button>
    <button class="ctrl-btn" id="wbMenu" style="width:100%;max-width:280px;margin:0 auto;display:block">← MENU</button>`;
  id('wbRetry').addEventListener('click', () => {
    stopArcade(); arcadeScore=0; updateArcadeScore(); openBallBattle();
  });
  id('wbMenu').addEventListener('click', () => {
    stopArcade(); hide(arcadeScreen); show(hub);
  });
}

// ══════════════════════════════════════════════════════════
//  🐾  CAPYBARA RUN  –  Platformer with capybara character
// ══════════════════════════════════════════════════════════
function startCapybara() {
  const W = canvas.width, H = canvas.height;
  const GRAVITY = 0.55, JUMP_FORCE = -13, MOVE_SPD = 4.5;
  const GROUND = H - 45;

  let score = 0, distance = 0;
  let gameSpeed = 3.5;
  let frame = 0;

  // Capy
  const capy = {
    x: W * 0.18, y: GROUND, w: 52, h: 38,
    vy: 0, vx: 0, onGround: true,
    jumps: 2, // double jump
    walkFrame: 0, dead: false,
    coyoteTime: 0,  // frames after leaving platform still can jump
  };

  // Platforms
  const platforms = [
    { x: 0, y: GROUND, w: W, h: 45, color: '#1c1c28' }, // ground
  ];

  // Floating platforms pool
  const floatPlats = [];
  let platTimer = 0;

  // Obstacles
  const obstacles = [];
  let obstTimer = 60;

  // Collectibles (coins)
  const coins = [];
  let coinTimer = 40;

  // Background layers (parallax)
  const bgLayers = [
    { items: Array.from({length:8},()=>({x:rnd(0,W), y:rnd(20,H*0.5), s:rnd(0.3,0.6)})), spd:0.2, color:'#ffffff15' },
    { items: Array.from({length:5},()=>({x:rnd(0,W), y:rnd(H*0.3,H*0.7), s:rnd(0.6,1.2)})), spd:0.6, color:'#7c6fff22' },
  ];

  // Input
  let jumpQueued = false;
  function onKey(e) {
    if ((e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') && e.type === 'keydown') {
      jumpQueued = true; e.preventDefault();
    }
  }
  function onTap(e) { jumpQueued = true; }
  document.addEventListener('keydown', onKey);
  canvas.addEventListener('touchstart', onTap, { passive: true });
  canvas.addEventListener('click', onTap);

  arcadeGame = {
    cleanup() {
      document.removeEventListener('keydown', onKey);
      canvas.removeEventListener('touchstart', onTap);
      canvas.removeEventListener('click', onTap);
    }
  };

  // Draw capybara function
  function drawCapybara(x, y, w, h, walkF, dead) {
    ctx.save();
    if (dead) { ctx.translate(x + w/2, y + h/2); ctx.rotate(Math.PI); ctx.translate(-(x + w/2), -(y + h/2)); }

    const bx = x, by = y;
    const scl = w / 52;

    // Body (rounded rectangle)
    ctx.fillStyle = '#8B6914';
    ctx.beginPath();
    ctx.ellipse(bx + w*0.5, by + h*0.55, w*0.5, h*0.42, 0, 0, Math.PI*2);
    ctx.fill();

    // Belly lighter
    ctx.fillStyle = '#B8882A';
    ctx.beginPath();
    ctx.ellipse(bx + w*0.5, by + h*0.6, w*0.32, h*0.28, 0, 0, Math.PI*2);
    ctx.fill();

    // Legs (animated walk)
    const legOffset = Math.sin(walkF * 0.28) * 5;
    ctx.fillStyle = '#7A5C10';
    // Back legs
    ctx.beginPath(); ctx.ellipse(bx+w*0.25, by+h*0.88, w*0.1, h*0.18, legOffset*0.04, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(bx+w*0.35, by+h*0.88, w*0.1, h*0.18, -legOffset*0.04, 0, Math.PI*2); ctx.fill();
    // Front legs
    ctx.beginPath(); ctx.ellipse(bx+w*0.62, by+h*0.88, w*0.1, h*0.18, -legOffset*0.04, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(bx+w*0.74, by+h*0.88, w*0.1, h*0.18, legOffset*0.04, 0, Math.PI*2); ctx.fill();

    // Head
    ctx.fillStyle = '#8B6914';
    ctx.beginPath();
    ctx.ellipse(bx + w*0.78, by + h*0.3, w*0.26, h*0.28, 0, 0, Math.PI*2);
    ctx.fill();

    // Snout (blunt / rectangular)
    ctx.fillStyle = '#7A5C10';
    ctx.beginPath();
    roundRect(ctx, bx+w*0.82, by+h*0.22, w*0.22, h*0.22, 4*scl);
    ctx.fill();

    // Nostrils
    ctx.fillStyle = '#5a4008';
    ctx.beginPath(); ctx.arc(bx+w*0.88, by+h*0.32, 2*scl, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(bx+w*0.97, by+h*0.32, 2*scl, 0, Math.PI*2); ctx.fill();

    // Eye
    ctx.fillStyle = dead ? '#ff4444' : '#1a0a00';
    ctx.beginPath(); ctx.arc(bx+w*0.83, by+h*0.2, 4*scl, 0, Math.PI*2); ctx.fill();
    if (!dead) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(bx+w*0.85, by+h*0.18, 1.5*scl, 0, Math.PI*2); ctx.fill(); }
    if (dead) {
      // X eyes
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(bx+w*0.8,by+h*0.14); ctx.lineTo(bx+w*0.87,by+h*0.24); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(bx+w*0.87,by+h*0.14); ctx.lineTo(bx+w*0.8,by+h*0.24); ctx.stroke();
    }

    // Ear
    ctx.fillStyle = '#7A5C10';
    ctx.beginPath(); ctx.ellipse(bx+w*0.74, by+h*0.08, 6*scl, 9*scl, -0.3, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#c4903a';
    ctx.beginPath(); ctx.ellipse(bx+w*0.74, by+h*0.09, 3.5*scl, 5.5*scl, -0.3, 0, Math.PI*2); ctx.fill();

    ctx.restore();
  }

  function spawnPlatform() {
    const lastPlat = floatPlats[floatPlats.length - 1];
    const minX = lastPlat ? lastPlat.x + lastPlat.w + 80 : W + 60;
    const pw = rnd(60, 140);
    const py = rnd(GROUND - 160, GROUND - 70);
    floatPlats.push({ x: Math.max(W, minX), y: py, w: pw, h: 14, color: '#2d2d3f' });
  }

  function spawnObstacle() {
    const types = ['cactus', 'rock', 'log'];
    const type = types[Math.floor(Math.random() * types.length)];
    const h2 = type === 'cactus' ? rnd(35, 55) : type === 'rock' ? rnd(22, 38) : rnd(20, 30);
    const w2 = type === 'log' ? rnd(60, 100) : rnd(22, 36);
    obstacles.push({ x: W + 20, y: GROUND - h2, w: w2, h: h2, type, onGround: true });
  }

  function spawnCoin() {
    const onPlatform = floatPlats.length > 0 && Math.random() < 0.4;
    let cx = W + rnd(20, 80), cy;
    if (onPlatform) {
      const plat = floatPlats[Math.floor(Math.random() * floatPlats.length)];
      cx = plat.x + plat.w * 0.5; cy = plat.y - 22;
    } else {
      cy = rnd(GROUND - 140, GROUND - 40);
    }
    coins.push({ x: cx, y: cy, r: 8, collected: false, floatOffset: Math.random() * Math.PI * 2 });
  }

  function drawObstacle(o) {
    if (o.type === 'cactus') {
      ctx.fillStyle = '#2d6a4f';
      // Main trunk
      roundRect(ctx, o.x + o.w*0.3, o.y, o.w*0.4, o.h, 5); ctx.fill();
      // Arms
      roundRect(ctx, o.x, o.y + o.h*0.3, o.w*0.35, o.h*0.18, 5); ctx.fill();
      roundRect(ctx, o.x + o.w*0.65, o.y + o.h*0.45, o.w*0.35, o.h*0.18, 5); ctx.fill();
      // Up bits
      roundRect(ctx, o.x, o.y + o.h*0.02, o.w*0.2, o.h*0.3, 5); ctx.fill();
      roundRect(ctx, o.x + o.w*0.8, o.y + o.h*0.15, o.w*0.2, o.h*0.3, 5); ctx.fill();
      // Highlight
      ctx.fillStyle = '#40916c'; roundRect(ctx, o.x+o.w*0.36, o.y+2, o.w*0.12, o.h-4, 4); ctx.fill();
    } else if (o.type === 'rock') {
      ctx.fillStyle = '#4a5568';
      ctx.beginPath(); ctx.ellipse(o.x+o.w/2, o.y+o.h*0.6, o.w*0.55, o.h*0.6, 0, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#718096';
      ctx.beginPath(); ctx.ellipse(o.x+o.w*0.35, o.y+o.h*0.25, o.w*0.3, o.h*0.28, -0.4, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.beginPath(); ctx.ellipse(o.x+o.w*0.28, o.y+o.h*0.22, o.w*0.12, o.h*0.1, -0.4, 0, Math.PI*2); ctx.fill();
    } else { // log
      ctx.fillStyle = '#92400e';
      roundRect(ctx, o.x, o.y, o.w, o.h, o.h*0.3); ctx.fill();
      ctx.fillStyle = '#78350f'; ctx.lineWidth = 1.5;
      for (let i = 1; i < 4; i++) {
        ctx.beginPath(); ctx.moveTo(o.x + o.w*(i/4), o.y+4); ctx.lineTo(o.x + o.w*(i/4), o.y+o.h-4); ctx.stroke();
      }
      // Wood grain
      ctx.fillStyle = '#b45309'; roundRect(ctx, o.x+4, o.y+o.h*0.2, o.w-8, o.h*0.2, 3); ctx.fill();
    }
  }

  function loop() {
    frame++;
    ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);

    // Parallax bg
    bgLayers.forEach(layer => {
      layer.items.forEach(item => {
        item.x -= layer.spd * (gameSpeed / 3.5);
        if (item.x < -item.s * 30) item.x = W + item.s * 30;
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = layer.color.replace(/[\d.]+\)$/, '0.15)');
        ctx.beginPath(); ctx.arc(item.x, item.y, item.s * 15, 0, Math.PI*2); ctx.fill();
        ctx.globalAlpha = 1;
      });
    });

    // Ground
    ctx.fillStyle = '#1c1c28'; ctx.fillRect(0, GROUND, W, H - GROUND);
    // Ground line
    ctx.strokeStyle = '#2a2a3d'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, GROUND); ctx.lineTo(W, GROUND); ctx.stroke();
    // Ground detail dots
    ctx.fillStyle = '#2d2d42';
    for (let i = 0; i < 12; i++) ctx.fillRect(((i * 73 + frame * gameSpeed * 0.4) % W), GROUND + 6, 3, 3);

    if (!capy.dead) {
      distance += gameSpeed * 0.016;
      arcadeScore = Math.floor(distance * 10 + score * 50);
      updateArcadeScore();
      gameSpeed = 3.5 + distance * 0.04; // accelerate
    }

    // ── Floating platforms ──
    platTimer++;
    if (platTimer > Math.max(55, 90 - distance * 0.5)) { spawnPlatform(); platTimer = 0; }
    for (let i = floatPlats.length - 1; i >= 0; i--) {
      const p = floatPlats[i];
      if (!capy.dead) p.x -= gameSpeed;
      if (p.x + p.w < -20) { floatPlats.splice(i, 1); continue; }
      ctx.fillStyle = '#2a2a3d';
      roundRect(ctx, p.x, p.y, p.w, p.h, 6); ctx.fill();
      ctx.strokeStyle = '#3d3d5c'; ctx.lineWidth = 1.5;
      roundRect(ctx, p.x, p.y, p.w, p.h, 6); ctx.stroke();
      // Shine
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      roundRect(ctx, p.x+4, p.y+2, p.w-8, 4, 2); ctx.fill();
    }

    // ── Obstacles ──
    obstTimer--;
    if (obstTimer <= 0 && !capy.dead) {
      spawnObstacle();
      obstTimer = Math.max(35, 80 - distance * 0.8) + rnd(0, 30);
    }
    for (let i = obstacles.length - 1; i >= 0; i--) {
      const o = obstacles[i];
      if (!capy.dead) o.x -= gameSpeed;
      if (o.x + o.w < -10) { obstacles.splice(i, 1); continue; }
      drawObstacle(o);
      // Collision
      if (!capy.dead && o.x < capy.x + capy.w*0.75 && o.x + o.w > capy.x + capy.w*0.2 &&
          o.y < capy.y + capy.h*0.9 && o.y + o.h > capy.y + capy.h*0.3) {
        capy.dead = true;
        setTimeout(() => {
          gameOver('💀', `SCORE: ${arcadeScore}`);
        }, 900);
      }
    }

    // ── Coins ──
    coinTimer--;
    if (coinTimer <= 0 && !capy.dead) { spawnCoin(); coinTimer = rnd(30, 60); }
    for (let i = coins.length - 1; i >= 0; i--) {
      const c = coins[i];
      if (!capy.dead) c.x -= gameSpeed;
      if (c.x < -20) { coins.splice(i, 1); continue; }
      if (c.collected) continue;
      const floatY = c.y + Math.sin(frame * 0.07 + c.floatOffset) * 4;
      // Collect
      if (!capy.dead && Math.hypot(c.x - (capy.x+capy.w*0.6), floatY - (capy.y+capy.h*0.4)) < c.r + 18) {
        c.collected = true; score++; arcadeScore = Math.floor(distance*10+score*50); updateArcadeScore();
        // Particle burst
        for (let p = 0; p < 8; p++) { const a = Math.random()*Math.PI*2; }
        coins.splice(i, 1); continue;
      }
      // Draw coin
      ctx.save();
      ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 2;
      ctx.fillStyle = '#fde047';
      ctx.beginPath(); ctx.arc(c.x, floatY, c.r, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#f59e0b';
      ctx.font = `bold ${c.r*1.2}px serif`; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText('$', c.x, floatY);
      ctx.restore();
    }

    // ── Capy physics ──
    if (!capy.dead) {
      // Jump
      if (jumpQueued) {
        if (capy.jumps > 0 || capy.coyoteTime > 0) {
          capy.vy = JUMP_FORCE - (capy.jumps === 1 && !capy.onGround ? 1.5 : 0);
          capy.jumps--;
          capy.onGround = false;
          capy.coyoteTime = 0;
        }
        jumpQueued = false;
      }
      capy.vy += GRAVITY;
      capy.y += capy.vy;

      // Ground collision
      capy.onGround = false;
      if (capy.y + capy.h >= GROUND) {
        capy.y = GROUND - capy.h;
        capy.vy = 0; capy.onGround = true; capy.jumps = 2; capy.coyoteTime = 0;
      }

      // Platform collision (only from above)
      for (const p of floatPlats) {
        if (capy.x + capy.w*0.75 > p.x && capy.x + capy.w*0.2 < p.x + p.w) {
          if (capy.vy >= 0 && capy.y + capy.h >= p.y && capy.y + capy.h <= p.y + p.h + 15) {
            capy.y = p.y - capy.h;
            capy.vy = 0; capy.onGround = true; capy.jumps = 2; capy.coyoteTime = 0;
          }
        }
      }

      if (!capy.onGround && capy.coyoteTime > 0) capy.coyoteTime--;
      if (capy.onGround) capy.coyoteTime = 8;

      capy.walkFrame = capy.onGround ? capy.walkFrame + gameSpeed : capy.walkFrame;
    } else {
      capy.vy += GRAVITY * 0.5;
      capy.y = Math.min(capy.y + capy.vy, GROUND - capy.h);
    }

    // Draw shadow
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath(); ctx.ellipse(capy.x+capy.w/2, GROUND+3, capy.w*0.4, 5, 0, 0, Math.PI*2); ctx.fill();

    // Draw capybara
    drawCapybara(capy.x, capy.y, capy.w, capy.h, capy.walkFrame, capy.dead);

    // ── Score / info overlay ──
    ctx.fillStyle = C.text;
    ctx.font = `bold ${W*0.034}px 'Orbitron', monospace`;
    ctx.textAlign = 'left';
    ctx.fillText(`🪙 ${score}`, 14, 32);

    ctx.fillStyle = C.sub;
    ctx.font = `${W*0.026}px 'Orbitron', monospace`;
    ctx.fillText(`${(distance*10).toFixed(0)}m`, 14, 52);

    // Speed indicator
    const spd = Math.min(1, (gameSpeed - 3.5) / 5);
    ctx.fillStyle = C.bg2; roundRect(ctx, W-70, 14, 56, 8, 4); ctx.fill();
    ctx.fillStyle = spd > 0.7 ? C.pink : spd > 0.4 ? C.yellow : C.green;
    if (spd > 0) { roundRect(ctx, W-70, 14, 56*spd, 8, 4); ctx.fill(); }
    ctx.strokeStyle = C.border; ctx.lineWidth=1; roundRect(ctx,W-70,14,56,8,4); ctx.stroke();
    ctx.fillStyle=C.sub; ctx.font=`${W*0.022}px 'Orbitron', monospace`; ctx.textAlign='right';
    ctx.fillText('SPEED', W-8, 14);

    // Double jump indicator
    for (let j = 0; j < 2; j++) {
      ctx.fillStyle = j < capy.jumps ? C.accent : C.bg3;
      ctx.beginPath(); ctx.arc(W - 22 - j*18, 38, 6, 0, Math.PI*2); ctx.fill();
    }

    if (!capy.dead) arcadeRAF = requestAnimationFrame(loop);
  }

  arcadeRAF = requestAnimationFrame(loop);
}
