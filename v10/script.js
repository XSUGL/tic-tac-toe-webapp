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
  if (g === 'capybara') {
    hideArcadeOverlay();
    startCapybara();
    return;
  }
  buildControls(g);
  showArcadeOverlay('🎮', {bubbles:'BUBBLE BATTLE',snake:'SNAKE',breakout:'BREAKOUT',flappy:'FLAPPY BIRD'}[g]||g, {bubbles:'TAP TO SHOOT',snake:'TAP TO START',breakout:'MOVE PADDLE',flappy:'TAP TO FLY'}[g]||'');
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
  if(currentGame==='capybara'){ stopArcade(); startCapybara(); return; }
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

// ── IMAGE PRELOADER ───────────────────────────────────
const IMGS = {};
const WEAPON_KEYS = ['sword','hammer','scythe','spear','bow','shield','dagger','lightning','wrench','shuriken','axe','boomerang'];

function preloadImages(cb) {
  let loaded = 0;
  const total = WEAPON_KEYS.length + 2; // weapons + capy + capy_dead
  function onload() { loaded++; if (loaded >= total && cb) cb(); }

  WEAPON_KEYS.forEach(k => {
    const img = new Image();
    img.onload = onload; img.onerror = onload;
    img.src = `assets/weapons/${k}.svg`;
    IMGS['weapon_' + k] = img;
  });

  const capyImg = new Image();
  capyImg.onload = onload; capyImg.onerror = onload;
  capyImg.src = 'assets/capy/capy.svg';
  IMGS['capy'] = capyImg;

  const capyDead = new Image();
  capyDead.onload = onload; capyDead.onerror = onload;
  capyDead.src = 'assets/capy/capy_dead.svg';
  IMGS['capy_dead'] = capyDead;
}

// Preload on page load
window.addEventListener('DOMContentLoaded', () => preloadImages());

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
function drawWeaponIcon(ctx, weaponKey, cx, cy, size, col) {
  const img = IMGS['weapon_' + weaponKey];
  if (img && img.complete && img.naturalWidth > 0) {
    ctx.save();
    ctx.drawImage(img, cx - size, cy - size, size * 2, size * 2);
    ctx.restore();
  } else {
    ctx.save();
    ctx.fillStyle = col + 'cc';
    ctx.beginPath(); ctx.arc(cx, cy, size * 0.8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${size}px monospace`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(weaponKey[0].toUpperCase(), cx, cy);
    ctx.restore();
  }
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
    ctrl.innerHTML='';
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


// ══════════════════════════════════════════════════════════════════
//  ⚔️  BALL BATTLE  –  Earclacks-style weapon ball simulator
//  • Шарики прыгают с физикой гравитации и отскоков
//  • Оружие крутится вокруг шарика и наносит урон при касании
//  • Выбор оружия → бой волнами → апгрейды
// ══════════════════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════════════════════
//  ⚔️  BALL BATTLE  –  Weapon Ball Fight simulator (Earclacks style)
//  Арена · Физика гравитации · Оружие крутится · HP бары · Турнир
// ══════════════════════════════════════════════════════════════════════

// ── WEAPON DATA ──────────────────────────────────────────────────────
const BB_WEAPONS = {
  sword:      { name:'SWORD',       color:'#e53e3e', ballColor:'#c0392b', hp:100, spd:4.0, dmg:12, reach:40, spin:2.8,  special:'parry',    desc:'Parries clashes',    rarity:'common'   },
  hammer:     { name:'HAMMER',      color:'#f97316', ballColor:'#c0550a', hp:130, spd:3.0, dmg:22, reach:32, spin:1.6,  special:'knockback',desc:'Ignores parry',      rarity:'uncommon' },
  scythe:     { name:'SCYTHE',      color:'#a855f7', ballColor:'#7c3aed', hp:90,  spd:4.2, dmg:14, reach:44, spin:3.2,  special:'lifesteal',desc:'Steals HP',          rarity:'uncommon' },
  spear:      { name:'SPEAR',       color:'#3b82f6', ballColor:'#1d4ed8', hp:100, spd:3.8, dmg:13, reach:52, spin:2.4,  special:'pierce',   desc:'Extra reach',        rarity:'common'   },
  dagger:     { name:'DAGGER',      color:'#94a3b8', ballColor:'#64748b', hp:80,  spd:5.2, dmg:9,  reach:24, spin:4.8,  special:'fast',     desc:'Very fast spin',     rarity:'common'   },
  bow:        { name:'BOW',         color:'#22c55e', ballColor:'#15803d', hp:80,  spd:4.5, dmg:10, reach:30, spin:2.6,  special:'ranged',   desc:'Fires arrows',       rarity:'uncommon' },
  shield:     { name:'SHIELD',      color:'#06b6d4', ballColor:'#0e7490', hp:160, spd:2.8, dmg:8,  reach:28, spin:2.0,  special:'block',    desc:'Blocks attacks',     rarity:'uncommon' },
  lightning:  { name:'LIGHTNING',   color:'#fbbf24', ballColor:'#d97706', hp:90,  spd:4.0, dmg:16, reach:36, spin:3.0,  special:'chain',    desc:'Chains on hit',      rarity:'rare'     },
  wrench:     { name:'WRENCH',      color:'#78716c', ballColor:'#57534e', hp:110, spd:3.5, dmg:18, reach:34, spin:2.2,  special:'stun',     desc:'Stuns on hit',       rarity:'uncommon' },
  shuriken:   { name:'SHURIKEN',    color:'#e2e8f0', ballColor:'#94a3b8', hp:75,  spd:5.5, dmg:8,  reach:22, spin:6.0,  special:'multi',    desc:'Multi-hit spin',     rarity:'rare'     },
  axe:        { name:'AXE',         color:'#ef4444', ballColor:'#b91c1c', hp:120, spd:3.2, dmg:20, reach:38, spin:1.8,  special:'heavy',    desc:'Heavy damage',       rarity:'uncommon' },
  boomerang:  { name:'BOOMERANG',   color:'#f59e0b', ballColor:'#b45309', hp:85,  spd:4.8, dmg:11, reach:32, spin:3.4,  special:'return',   desc:'Returns on miss',    rarity:'rare'     },
};

const BB_RARITY_COLOR = { common:'#94a3b8', uncommon:'#4ade80', rare:'#a855f7' };

// ── ARENAS ───────────────────────────────────────────────────────────
const BB_ARENAS = {
  dungeon: {
    name:'DUNGEON', emoji:'🏰', desc:'Normal gravity',
    bg:'#09090f', floor:'#13122a', wall:'#1a1835', border:'#7c6fff', accent:'#a78bfa',
    gravity: 0.42, bounce: 0.72, friction: 0.998,
    shape: 'rect',     // standard rectangle
    obstacles: [],     // no obstacles
    special: null,
  },
  volcano: {
    name:'VOLCANO', emoji:'🌋', desc:'High gravity + lava floor',
    bg:'#0f0600', floor:'#1e0d00', wall:'#2a1400', border:'#f97316', accent:'#fb923c',
    gravity: 0.75,     // heavy gravity
    bounce: 0.55,      // less bouncy (lava sticky)
    friction: 0.994,
    shape: 'rect',
    special: 'lava',   // bottom lava hurts
    lavaH: 18,         // lava zone height at bottom
  },
  icecave: {
    name:'ICE CAVE', emoji:'❄️', desc:'Low gravity + slippery',
    bg:'#04060e', floor:'#0a0f20', wall:'#101828', border:'#60a5fa', accent:'#93c5fd',
    gravity: 0.18,     // floaty
    bounce: 0.88,      // very bouncy ice
    friction: 0.9995,  // almost no friction = slides
    shape: 'rect',
    special: 'ice',
  },
  jungle: {
    name:'JUNGLE', emoji:'🌿', desc:'Platforms + vines',
    bg:'#030903', floor:'#061206', wall:'#0c1e0c', border:'#4ade80', accent:'#86efac',
    gravity: 0.38,
    bounce: 0.65,
    friction: 0.997,
    shape: 'rect',
    special: 'platforms',   // has 2 floating platforms
  },
  space: {
    name:'SPACE', emoji:'🚀', desc:'Zero gravity — no floor!',
    bg:'#02020a', floor:'#06060e', wall:'#0a0a18', border:'#e879f9', accent:'#f0abfc',
    gravity: 0.0,      // true zero-g
    bounce: 0.92,
    friction: 0.999,
    shape: 'circle',   // circular arena!
    special: 'zerog',
  },
  castle: {
    name:'CASTLE', emoji:'🏯', desc:'Wall pillars + normal gravity',
    bg:'#08060a', floor:'#120e18', wall:'#1a1622', border:'#c084fc', accent:'#d8b4fe',
    gravity: 0.42,
    bounce: 0.60,
    friction: 0.996,
    shape: 'rect',
    special: 'pillars',  // 2 stone pillars
  },
};

// ── STATE ────────────────────────────────────────────────────────────
let BB = {
  phase: 'menu',   // menu | fight | result
  p1Weapon: 'sword',
  p2Weapon: null,  // null = random enemy
  arena: 'dungeon',
  balls: [],
  projectiles: [],
  particles: [],
  raf: null,
  result: null,    // 'p1' | 'p2' | 'draw'
  matchTime: 0,
  selectHover: null,
  shake: 0,
  bgStars: [],
  obstacles: [],
};

// ── OPEN ─────────────────────────────────────────────────────────────
function openBallBattle() {
  stopArcade();
  BB.phase = 'menu';
  BB.p1Weapon = localStorage.getItem('bb_p1w') || 'sword';
  BB.arena    = localStorage.getItem('bb_arena') || 'dungeon';
  BB.bgStars  = Array.from({length:40}, () => ({
    x: rnd(0, canvas.width), y: rnd(0, canvas.height),
    r: rnd(0.5, 2), a: rnd(0.05, 0.3)
  }));
  bbBuildUI();
  bbLoop();
}

// ── BUILD CONTROLS UI ─────────────────────────────────────────────────
function bbBuildUI() {
  const ctrl = id('arcadeControls');
  const arenaKeys = Object.keys(BB_ARENAS);
  const selArena = BB.arena;
  ctrl.innerHTML = `
    <div style="margin-bottom:8px">
      <div style="font-family:var(--font-hd);font-size:9px;letter-spacing:2px;color:var(--sub);text-align:center;margin-bottom:6px">ARENA</div>
      <div style="display:flex;gap:5px;overflow-x:auto;padding-bottom:2px;scrollbar-width:none">
        ${arenaKeys.map(k=>{
          const a=BB_ARENAS[k]; const sel=k===selArena;
          return `<button class="bb-arena" data-a="${k}" style="flex-shrink:0;font-family:var(--font-hd);font-size:9px;letter-spacing:1px;padding:6px 11px;border-radius:16px;cursor:pointer;white-space:nowrap;border:1.5px solid ${sel?a.border:'var(--border)'};background:${sel?a.border+'25':'var(--bg3)'};color:${sel?'#fff':'var(--sub)'}" title="${a.desc}">${a.emoji} ${a.name}</button>`;
        }).join('')}
      </div>
    </div>
    <button class="start-btn" id="bbFightBtn" style="max-width:300px;margin:0 auto;display:block">⚔️ FIGHT!</button>`;

  ctrl.querySelectorAll('.bb-arena').forEach(btn => {
    btn.addEventListener('click', () => {
      BB.arena = btn.dataset.a;
      localStorage.setItem('bb_arena', BB.arena);
      bbBuildUI();
    });
  });
  id('bbFightBtn').addEventListener('click', bbStartFight);
}

// ── START FIGHT ───────────────────────────────────────────────────────
function bbStartFight() {
  // Pick random enemy weapon (different from player)
  const keys = Object.keys(BB_WEAPONS).filter(k => k !== BB.p1Weapon);
  BB.p2Weapon = keys[Math.floor(Math.random() * keys.length)];
  BB.phase = 'fight';
  BB.result = null;
  BB.matchTime = 0;
  BB.projectiles = [];
  BB.particles = [];

  const W = canvas.width, H = canvas.height;
  const A = bbArena();

  BB.balls = [
    bbMakeBall('left',  BB.p1Weapon, A),
    bbMakeBall('right', BB.p2Weapon, A),
  ];
  BB.obstacles = [];
  bbBuildObstacles(A);

  id('arcadeControls').innerHTML = '';
}

function bbMakeBall(side, key, A) {
  const w = BB_WEAPONS[key];
  return {
    x:  side==='left' ? A.x + A.w*0.22 : A.x + A.w*0.78,
    y:  A.y + A.h * 0.4,
    vx: side==='left' ? w.spd*0.5 : -w.spd*0.5,
    vy: -(w.spd * 1.8 + rnd(0, 1.5)),
    r:  24,
    hp: w.hp, maxHp: w.hp,
    dmg: w.dmg, spd: w.spd,
    reach: w.reach,
    spin: w.spin * (side==='left' ? 1 : -1),
    armor: 0, regen: 0,
    color: w.ballColor,
    rimColor: w.color,
    weaponKey: key,
    side,
    angle: side==='left' ? 0 : Math.PI,
    hitTimer: 0, parryTimer: 0, stunTimer: 0, arrowTimer: 0,
    alive: true,
    trail: [],
    deathTimer: 0,
  };
}

function bbArena() {
  const W = canvas.width, H = canvas.height;
  const pad = 12;
  const map = BB_ARENAS[BB.arena];
  const base = { x: pad, y: 80, w: W - pad*2, h: H * 0.58 };
  if (map.shape === 'circle') {
    const cx = W / 2, cy = 80 + (H*0.58)/2;
    const r  = Math.min(base.w, base.h) / 2 - 4;
    return { ...base, circle: true, cx, cy, cr: r };
  }
  return base;
}

// Build obstacle list for current arena (called on fight start)
function bbBuildObstacles(A) {
  const map = BB_ARENAS[BB.arena];
  BB.obstacles = [];
  if (map.special === 'platforms') {
    const pw = A.w * 0.28, ph = 14;
    BB.obstacles.push({ x: A.x + A.w*0.12, y: A.y + A.h*0.55, w: pw, h: ph, type:'platform' });
    BB.obstacles.push({ x: A.x + A.w*0.60, y: A.y + A.h*0.38, w: pw, h: ph, type:'platform' });
  }
  if (map.special === 'pillars') {
    const pw = 18, ph = A.h * 0.45;
    BB.obstacles.push({ x: A.x + A.w*0.28 - pw/2, y: A.y + A.h - ph, w: pw, h: ph, type:'pillar' });
    BB.obstacles.push({ x: A.x + A.w*0.72 - pw/2, y: A.y + A.h - ph, w: pw, h: ph, type:'pillar' });
  }
}

// ── PHYSICS ───────────────────────────────────────────────────────────
function bbPhysics() {
  if (BB.phase !== 'fight') return;
  BB.matchTime++;
  if (BB.shake > 0) BB.shake--;

  const A   = bbArena();
  const MAP = BB_ARENAS[BB.arena];
  const BBG = MAP.gravity;
  const BBC = MAP.bounce;
  const dt  = BB.shake > 8 ? 0.3 : 1;

  for (const b of BB.balls) {
    if (!b.alive) { b.deathTimer++; continue; }

    if (b.hitTimer  > 0) b.hitTimer--;
    if (b.parryTimer> 0) b.parryTimer--;
    if (b.stunTimer > 0) b.stunTimer--;
    if (b.arrowTimer> 0) b.arrowTimer--;

    if (b.regen > 0 && BB.matchTime % 60 === 0) b.hp = Math.min(b.maxHp, b.hp + b.regen);
    if (b.stunTimer > 0) continue;

    // Spin weapon (faster on ice)
    const spinMult = MAP.special === 'ice' ? 1.4 : 1;
    b.angle += b.spin * 0.055 * dt * spinMult;

    // Gravity + movement
    b.vy += BBG * dt;
    b.x  += b.vx * dt;
    b.y  += b.vy * dt;
    b.vx *= MAP.friction;

    // Trail
    b.trail.push({x:b.x, y:b.y});
    if (b.trail.length > 10) b.trail.shift();

    // ── CIRCLE ARENA (Space) ──
    if (A.circle) {
      const dx2 = b.x - A.cx, dy2 = b.y - A.cy;
      const d2 = Math.hypot(dx2, dy2);
      if (d2 + b.r > A.cr) {
        const nx2 = dx2/d2, ny2 = dy2/d2;
        b.x = A.cx + nx2 * (A.cr - b.r);
        b.y = A.cy + ny2 * (A.cr - b.r);
        const dot2 = b.vx*nx2 + b.vy*ny2;
        b.vx -= 2*dot2*nx2*BBC; b.vy -= 2*dot2*ny2*BBC;
        bbBurst(b.x, b.y, MAP.accent+'88', 4);
      }
    } else {
      // ── RECT ARENA ──
      if (b.y + b.r > A.y + A.h) {
        b.y = A.y + A.h - b.r;
        b.vy = -Math.abs(b.vy) * BBC;
        b.vx *= 0.80;
        // Lava damage
        if (MAP.special === 'lava') {
          b.hp -= 0.18;
          if (b.hp <= 0 && b.alive) {
            b.alive = false; b.hp = 0;
            bbBurst(b.x, b.y, '#f97316', 30);
            BB.shake = 20;
            setTimeout(bbCheckResult, 700);
          }
          bbBurst(b.x, b.y, '#f97316', 2);
        }
      }
      if (b.y - b.r < A.y) { b.y = A.y + b.r; b.vy = Math.abs(b.vy) * 0.5; }
      if (b.x - b.r < A.x) { b.x = A.x + b.r; b.vx =  Math.abs(b.vx) * BBC; }
      if (b.x + b.r > A.x + A.w) { b.x = A.x+A.w - b.r; b.vx = -Math.abs(b.vx) * BBC; }

      // ── OBSTACLE collision ──
      for (const obs of BB.obstacles) {
        const closestX = Math.max(obs.x, Math.min(b.x, obs.x + obs.w));
        const closestY = Math.max(obs.y, Math.min(b.y, obs.y + obs.h));
        const dd = Math.hypot(b.x - closestX, b.y - closestY);
        if (dd < b.r) {
          const overlapX = b.x - closestX, overlapY = b.y - closestY;
          const ol = Math.hypot(overlapX, overlapY) || 1;
          const push = b.r - dd + 1;
          b.x += (overlapX/ol) * push;
          b.y += (overlapY/ol) * push;
          // Bounce based on which face was hit
          if (Math.abs(overlapX) > Math.abs(overlapY)) b.vx *= -BBC;
          else { b.vy *= -BBC; b.vx *= 0.85; }
        }
      }
    }

    // AI: track enemy
    const enemy = BB.balls.find(o => o !== b && o.alive);
    if (!enemy) continue;

    const dx = enemy.x - b.x;
    const onFloor = A.circle
      ? Math.hypot(b.x-A.cx, b.y-A.cy) > A.cr * 0.8
      : b.y + b.r >= A.y + A.h - 3;

    // Seek
    const seekMult = MAP.special === 'ice' ? 0.15 : 0.32; // ice = less control
    b.vx += Math.sign(dx) * seekMult * dt;
    const maxV = b.spd * 1.8;
    if (Math.abs(b.vx) > maxV) b.vx = Math.sign(b.vx) * maxV;

    // Jump (not in space - no floor)
    if (!A.circle && onFloor) {
      const shouldJump = Math.random() < (Math.abs(dx) > 80 ? 0.06 : 0.03);
      if (shouldJump) b.vy = -(b.spd * 1.6 + rnd(1, 2));
    }
    // Space: thrust toward enemy
    if (A.circle && BB.matchTime % 25 === 0) {
      const dd2 = Math.hypot(dx, enemy.y - b.y) || 1;
      b.vx += (dx/dd2) * b.spd * 0.4;
      b.vy += ((enemy.y-b.y)/dd2) * b.spd * 0.4;
    }

    // Arrow
    if (b.weaponKey === 'bow' && b.arrowTimer <= 0 && Math.abs(dx) > b.r * 2) {
      const ddist = Math.hypot(dx, enemy.y - b.y) || 1;
      const aspd = b.spd * 2.8;
      BB.projectiles.push({
        x:b.x, y:b.y,
        vx:(dx/ddist)*aspd,
        vy:((enemy.y-b.y)/ddist)*aspd - 2,
        r:5, dmg: b.dmg*0.75,
        owner: b.side,
        color: b.rimColor,
        life: 1, angle: Math.atan2(enemy.y-b.y, dx)
      });
      b.arrowTimer = 50;
    }
  }

  // ── Ball vs Ball body collision ──────────────────────────────────
  const alive = BB.balls.filter(b => b.alive);
  if (alive.length === 2) {
    const [b1, b2] = alive;
    const dx = b2.x - b1.x, dy = b2.y - b1.y;
    const dist = Math.hypot(dx, dy);

    if (dist < b1.r + b2.r && dist > 0.1) {
      const nx = dx/dist, ny = dy/dist;
      const overlap = (b1.r + b2.r - dist) / 2;
      b1.x -= nx * overlap; b1.y -= ny * overlap;
      b2.x += nx * overlap; b2.y += ny * overlap;

      const dot = (b1.vx - b2.vx)*nx + (b1.vy - b2.vy)*ny;
      if (dot > 0) {
        const imp = dot * 1.4;
        b1.vx -= nx*imp; b1.vy -= ny*imp;
        b2.vx += nx*imp; b2.vy += ny*imp;
        BB.shake = 6;
        bbBurst(b1.x+nx*b1.r, b1.y+ny*b1.r, '#ffffff88', 6);
      }
    }

    // ── Weapon tip collision ──────────────────────────────────────
    for (const atk of [b1, b2]) {
      const def = atk === b1 ? b2 : b1;
      if (atk.hitTimer > 0) continue;

      // Weapon tip position
      const tipDist = atk.r + atk.reach;
      const tipX = atk.x + Math.cos(atk.angle) * tipDist;
      const tipY = atk.y + Math.sin(atk.angle) * tipDist;
      const tipToDefDist = Math.hypot(tipX - def.x, tipY - def.y);

      if (tipToDefDist > def.r + 7) continue; // no hit

      let dmg = atk.dmg * (1 - (def.armor || 0));
      let blocked = false;

      // === PARRY (sword vs non-hammer) ===
      if (def.weaponKey === 'sword' && atk.weaponKey !== 'hammer') {
        const dTipX = def.x + Math.cos(def.angle) * (def.r + def.reach);
        const dTipY = def.y + Math.sin(def.angle) * (def.r + def.reach);
        if (Math.hypot(dTipX - tipX, dTipY - tipY) < 22) {
          // Parried — reflect attacker
          const bx = atk.x-def.x, by=atk.y-def.y, bl=Math.hypot(bx,by)||1;
          atk.vx += (bx/bl)*7; atk.vy += (by/bl)*4 - 2;
          def.parryTimer = 22;
          atk.hitTimer = 22;
          bbBurst(tipX, tipY, '#fef08a', 14);
          bbSparkLine(atk.x, atk.y, def.x, def.y);
          BB.shake = 10;
          blocked = true;
        }
      }

      // === BLOCK (shield) ===
      if (!blocked && def.weaponKey === 'shield' && Math.random() < 0.5) {
        bbBurst(tipX, tipY, def.rimColor, 8);
        atk.hitTimer = 18;
        blocked = true;
      }

      if (blocked) continue;

      // === HIT ===
      def.hp = Math.max(0, def.hp - dmg);
      atk.hitTimer = 20;
      BB.shake = 14;

      // Knockback
      const kd = Math.hypot(def.x-atk.x, def.y-atk.y)||1;
      def.vx += ((def.x-atk.x)/kd) * 5;
      def.vy += ((def.y-atk.y)/kd) * 3.5 - 2;

      // Specials
      if (atk.weaponKey === 'hammer')    { def.vx += Math.sign(def.x-atk.x)*7; def.vy -= 5; }
      if (atk.weaponKey === 'scythe')    { atk.hp = Math.min(atk.maxHp, atk.hp + dmg*0.45); }
      if (atk.weaponKey === 'lightning') { bbChain(atk, def); }
      if (atk.weaponKey === 'wrench')    { def.stunTimer = 40; }

      bbBurst(tipX, tipY, atk.rimColor, 16);
      bbSparkLine(tipX, tipY, def.x, def.y);

      // Death check
      if (def.hp <= 0 && def.alive) {
        def.alive = false;
        bbBurst(def.x, def.y, def.rimColor, 35);
        BB.shake = 24;
        setTimeout(bbCheckResult, 700);
      }
    }
  }

  // ── Projectiles ──────────────────────────────────────────────────
  const A2 = bbArena();
  const MAP2 = BB_ARENAS[BB.arena];
  for (let i = BB.projectiles.length-1; i >= 0; i--) {
    const p = BB.projectiles[i];
    p.x += p.vx; p.y += p.vy; if (MAP2.gravity > 0) p.vy += 0.18; p.life -= 0.008;
    if (p.x<A2.x||p.x>A2.x+A2.w||p.y>A2.y+A2.h||p.life<=0) { BB.projectiles.splice(i,1); continue; }
    for (const b of BB.balls) {
      if (!b.alive || b.side===p.owner) continue;
      if (Math.hypot(p.x-b.x, p.y-b.y) < b.r+p.r) {
        b.hp = Math.max(0, b.hp - p.dmg*(1-(b.armor||0)));
        bbBurst(p.x,p.y,p.color,8);
        BB.projectiles.splice(i,1);
        if (b.hp<=0 && b.alive) { b.alive=false; bbBurst(b.x,b.y,b.rimColor,30); BB.shake=20; setTimeout(bbCheckResult,700); }
        break;
      }
    }
  }

  // ── Particles ──────────────────────────────────────────────────
  for (let i = BB.particles.length-1; i >= 0; i--) {
    const p = BB.particles[i];
    p.x+=p.vx; p.y+=p.vy; p.vy+=0.14; p.vx*=0.93; p.life-=p.decay;
    if (p.life<=0) BB.particles.splice(i,1);
  }
}

function bbCheckResult() {
  const p1alive = BB.balls.find(b=>b.side==='left' && b.alive);
  const p2alive = BB.balls.find(b=>b.side==='right' && b.alive);
  if (!p1alive && !p2alive) BB.result = 'draw';
  else if (!p2alive) BB.result = 'p1';
  else if (!p1alive) BB.result = 'p2';
  else return; // still fighting
  BB.phase = 'result';
  arcadeScore = (arcadeScore||0) + (BB.result==='p1' ? 100 : 0);
  updateArcadeScore();
  bbBuildResultUI();
}

function bbBuildResultUI() {
  const ctrl = id('arcadeControls');
  const win = BB.result === 'p1';
  const draw = BB.result === 'draw';
  const p2w = BB_WEAPONS[BB.p2Weapon];
  ctrl.innerHTML = `
    <div style="text-align:center;font-family:var(--font-hd);font-size:11px;letter-spacing:2px;color:${win?'var(--accent)':draw?'var(--sub)':'#f87171'};margin-bottom:12px">
      ${draw?'DRAW!':win?'🏆 VICTORY!':'💀 DEFEATED!'}
      <div style="font-size:9px;color:var(--sub);margin-top:4px;letter-spacing:1px">vs ${p2w.name}</div>
    </div>
    <div style="display:flex;gap:8px">
      <button class="start-btn" id="bbRetryBtn" style="flex:1">↺ REMATCH</button>
      <button class="ctrl-btn" id="bbChangeBtn" style="flex:1;border-color:var(--accent);color:var(--accent)">CHANGE WEAPON</button>
    </div>`;
  id('bbRetryBtn').addEventListener('click', bbStartFight);
  id('bbChangeBtn').addEventListener('click', () => { BB.phase='menu'; bbBuildUI(); });
}

function bbChain(atk, def) {
  for (let i=0; i<8; i++) {
    const t = i/7;
    BB.particles.push({ x:atk.x+(def.x-atk.x)*t+rnd(-10,10), y:atk.y+(def.y-atk.y)*t+rnd(-10,10), vx:rnd(-1,1), vy:rnd(-1,1), r:rnd(2,5), color:'#fbbf24', life:0.9, decay:0.09 });
  }
}

// ── DRAW ─────────────────────────────────────────────────────────────
function bbDraw() {
  const W = canvas.width, H = canvas.height;
  const A = bbArena();
  const MAP = BB_ARENAS[BB.arena];

  ctx.save();
  if (BB.shake > 0) ctx.translate(rnd(-BB.shake*0.35,BB.shake*0.35), rnd(-BB.shake*0.25,BB.shake*0.25));

  // ── Full BG ──
  ctx.fillStyle = MAP.bg; ctx.fillRect(0, 0, W, H);

  // Stars/bg particles
  BB.bgStars.forEach(s => {
    ctx.globalAlpha = s.a;
    ctx.fillStyle = MAP.accent;
    ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI*2); ctx.fill();
  });
  ctx.globalAlpha = 1;

  // ── Arena ──
  if (A.circle) {
    // SPACE: circular arena
    ctx.fillStyle = MAP.floor;
    ctx.beginPath(); ctx.arc(A.cx, A.cy, A.cr, 0, Math.PI*2); ctx.fill();
    // Stars inside
    for (let i=0; i<20; i++) {
      const sx = A.cx + Math.cos(i*2.4)*A.cr*(0.3+i%3*0.2);
      const sy = A.cy + Math.sin(i*1.7)*A.cr*(0.3+i%2*0.25);
      ctx.fillStyle='#ffffff'; ctx.globalAlpha=0.25;
      ctx.beginPath(); ctx.arc(sx,sy,1,0,Math.PI*2); ctx.fill();
    }
    ctx.globalAlpha=1;
    // Glow border
    ctx.strokeStyle=MAP.border; ctx.lineWidth=3;
    ctx.beginPath(); ctx.arc(A.cx,A.cy,A.cr,0,Math.PI*2); ctx.stroke();
    ctx.strokeStyle=MAP.accent+'50'; ctx.lineWidth=14;
    ctx.beginPath(); ctx.arc(A.cx,A.cy,A.cr+2,0,Math.PI*2); ctx.stroke();
    // Center label
    ctx.strokeStyle=MAP.border; ctx.lineWidth=1; ctx.globalAlpha=0.15; ctx.setLineDash([4,6]);
    ctx.beginPath(); ctx.moveTo(A.cx-A.cr,A.cy); ctx.lineTo(A.cx+A.cr,A.cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(A.cx,A.cy-A.cr); ctx.lineTo(A.cx,A.cy+A.cr); ctx.stroke();
    ctx.setLineDash([]); ctx.globalAlpha=1;
  } else {
    // RECT arenas
    ctx.fillStyle = MAP.floor;
    roundRect(ctx, A.x, A.y, A.w, A.h, 8); ctx.fill();

    // Grid
    ctx.strokeStyle = MAP.wall; ctx.lineWidth = 1;
    for (let gx=A.x+28; gx<A.x+A.w; gx+=28) { ctx.globalAlpha=0.5; ctx.beginPath(); ctx.moveTo(gx,A.y); ctx.lineTo(gx,A.y+A.h); ctx.stroke(); }
    for (let gy=A.y+28; gy<A.y+A.h; gy+=28) { ctx.beginPath(); ctx.moveTo(A.x,gy); ctx.lineTo(A.x+A.w,gy); ctx.stroke(); }
    ctx.globalAlpha=1;

    // Center divider
    ctx.setLineDash([6,8]); ctx.strokeStyle=MAP.border; ctx.lineWidth=1; ctx.globalAlpha=0.2;
    ctx.beginPath(); ctx.moveTo(A.x+A.w/2,A.y); ctx.lineTo(A.x+A.w/2,A.y+A.h); ctx.stroke();
    ctx.setLineDash([]); ctx.globalAlpha=1;

    // ── LAVA (Volcano) ──
    if (MAP.special === 'lava') {
      const lh = MAP.lavaH || 18;
      const ly = A.y + A.h - lh;
      const lg = ctx.createLinearGradient(0, ly, 0, ly+lh);
      lg.addColorStop(0, '#f97316aa');
      lg.addColorStop(1, '#ea580c');
      ctx.fillStyle = lg;
      ctx.fillRect(A.x, ly, A.w, lh);
      // Lava bubbles
      const t = BB.matchTime;
      for (let i=0; i<8; i++) {
        const bx = A.x + 30 + i*((A.w-60)/7);
        const by = ly + 5 + Math.sin(t*0.08+i)*4;
        ctx.fillStyle='#fb923c'; ctx.globalAlpha=0.7;
        ctx.beginPath(); ctx.arc(bx,by,3+Math.sin(t*0.12+i)*1.5,0,Math.PI*2); ctx.fill();
      }
      ctx.globalAlpha=1;
      // LAVA warning text
      ctx.fillStyle='#f97316'; ctx.globalAlpha=0.5;
      ctx.font=`bold 9px 'Orbitron',monospace`; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText('LAVA', A.x+A.w/2, ly+lh/2);
      ctx.globalAlpha=1;
    }

    // ── ICE effect ──
    if (MAP.special === 'ice') {
      // Ice crystals on walls
      ctx.strokeStyle = '#93c5fd'; ctx.lineWidth=1.5; ctx.globalAlpha=0.3;
      for (let i=0; i<5; i++) {
        const ix=A.x+20+i*((A.w-40)/4), iy=A.y+A.h-2;
        ctx.beginPath(); ctx.moveTo(ix,iy); ctx.lineTo(ix-4,iy-12); ctx.lineTo(ix,iy-18); ctx.lineTo(ix+4,iy-12); ctx.closePath(); ctx.stroke();
      }
      // Frost corners
      ctx.strokeStyle='#bfdbfe'; ctx.lineWidth=1; ctx.globalAlpha=0.2;
      [[A.x,A.y],[A.x+A.w,A.y],[A.x,A.y+A.h],[A.x+A.w,A.y+A.h]].forEach(([fx,fy])=>{
        for(let j=0;j<5;j++){const a=Math.random()*Math.PI*2,l=rnd(8,22);ctx.beginPath();ctx.moveTo(fx,fy);ctx.lineTo(fx+Math.cos(a)*l,fy+Math.sin(a)*l);ctx.stroke();}
      });
      ctx.globalAlpha=1;
    }

    // ── PLATFORMS (Jungle) ──
    for (const obs of BB.obstacles) {
      if (obs.type === 'platform') {
        // Wooden platform
        ctx.fillStyle='#3a2010';
        roundRect(ctx, obs.x, obs.y, obs.w, obs.h, 4); ctx.fill();
        ctx.fillStyle='#7a4a20'; ctx.fillRect(obs.x+2, obs.y+2, obs.w-4, 4);
        ctx.strokeStyle='#4ade80'; ctx.lineWidth=1.5;
        roundRect(ctx, obs.x, obs.y, obs.w, obs.h, 4); ctx.stroke();
        // Moss on top
        ctx.fillStyle='#4ade8055';
        ctx.fillRect(obs.x+2, obs.y, obs.w-4, 3);
        // Vines hanging
        ctx.strokeStyle='#4ade80'; ctx.lineWidth=1; ctx.globalAlpha=0.4;
        for(let v=0;v<3;v++){
          const vx=obs.x+obs.w*0.2+v*(obs.w*0.3);
          ctx.beginPath(); ctx.moveTo(vx,obs.y+obs.h);
          ctx.bezierCurveTo(vx+5,obs.y+obs.h+12,vx-3,obs.y+obs.h+20,vx,obs.y+obs.h+28);
          ctx.stroke();
        }
        ctx.globalAlpha=1;
      }
      if (obs.type === 'pillar') {
        // Stone pillar
        const pg = ctx.createLinearGradient(obs.x, 0, obs.x+obs.w, 0);
        pg.addColorStop(0,'#2a2030'); pg.addColorStop(0.4,'#3a3050'); pg.addColorStop(1,'#1a1025');
        ctx.fillStyle=pg; ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
        // Stone blocks
        ctx.strokeStyle='#1a1025'; ctx.lineWidth=1;
        for(let s=0;s<4;s++) ctx.strokeRect(obs.x+1,obs.y+s*obs.h/4,obs.w-2,obs.h/4);
        // Highlight
        ctx.fillStyle='rgba(255,255,255,0.06)';
        ctx.fillRect(obs.x+2,obs.y,4,obs.h);
        ctx.strokeStyle=MAP.border; ctx.lineWidth=1.5;
        ctx.strokeRect(obs.x,obs.y,obs.w,obs.h);
      }
    }

    // Arena glow border
    ctx.strokeStyle = MAP.border; ctx.lineWidth = 2.5;
    roundRect(ctx, A.x, A.y, A.w, A.h, 8); ctx.stroke();
    ctx.strokeStyle = MAP.accent+'40'; ctx.lineWidth = 12;
    roundRect(ctx, A.x-2, A.y-2, A.w+4, A.h+4, 10); ctx.stroke();
  }

  // ── Particles ──
  for (const p of BB.particles) {
    ctx.globalAlpha = p.life * 0.9;
    ctx.fillStyle = p.color;
    ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(0.5, p.r*p.life), 0, Math.PI*2); ctx.fill();
  }
  ctx.globalAlpha = 1;

  // ── Projectiles ──
  for (const p of BB.projectiles) {
    ctx.save(); ctx.globalAlpha = p.life;
    ctx.translate(p.x, p.y); ctx.rotate(Math.atan2(p.vy, p.vx));
    ctx.fillStyle='#c09050'; ctx.strokeStyle=p.color; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(-9,-2.5); ctx.lineTo(9,0); ctx.lineTo(-9,2.5); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle='#e04040';
    ctx.beginPath(); ctx.moveTo(-9,0); ctx.lineTo(-14,-4); ctx.lineTo(-14,4); ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  // ── Balls ──
  for (const b of BB.balls) {
    const isDead = !b.alive;
    ctx.save();

    // Ball trail
    for (let i=1; i<b.trail.length; i++) {
      ctx.globalAlpha = (i/b.trail.length)*0.14;
      ctx.fillStyle = b.color;
      ctx.beginPath(); ctx.arc(b.trail[i].x, b.trail[i].y, b.r*(i/b.trail.length)*0.5, 0, Math.PI*2); ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Floor shadow
    ctx.fillStyle='rgba(0,0,0,0.28)';
    ctx.beginPath(); ctx.ellipse(b.x, A.y+A.h+2, b.r*0.7, 5, 0, 0, Math.PI*2); ctx.fill();

    // Hit flash
    if (b.hitTimer>0 && Math.floor(b.hitTimer/3)%2===0) ctx.globalAlpha=0.3;

    // ── WEAPON (orbiting PNG) ──
    if (!isDead) {
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.angle);

      const wep   = BB_WEAPONS[b.weaponKey];
      const orbit = b.r * 1.08;
      const wSize = Math.max(30, b.reach * 0.98);

      // Glow behind weapon
      ctx.globalAlpha = 0.3;
      const glowGrd = ctx.createRadialGradient(orbit + wSize*0.5, 0, 0, orbit+wSize*0.5, 0, wSize*0.6);
      glowGrd.addColorStop(0, b.rimColor); glowGrd.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGrd;
      ctx.beginPath(); ctx.arc(orbit+wSize*0.5, 0, wSize*0.55, 0, Math.PI*2); ctx.fill();
      ctx.globalAlpha = b.hitTimer>0 && Math.floor(b.hitTimer/3)%2===0 ? 0.3 : 1;

      // PNG weapon
      const wImg = IMGS['weapon_' + b.weaponKey];
      if (wImg && wImg.complete && wImg.naturalWidth > 0) {
        ctx.save();
        ctx.translate(orbit + wSize*0.5, 0);
        ctx.rotate(Math.PI * 0.5); // handle toward ball
        ctx.drawImage(wImg, -wSize/2, -wSize/2, wSize, wSize);
        ctx.restore();
      } else {
        // Fallback bar
        ctx.fillStyle = b.rimColor;
        ctx.fillRect(orbit, -4, wSize, 8);
        ctx.fillStyle = '#fff8';
        ctx.beginPath(); ctx.arc(orbit+wSize, 0, 5, 0, Math.PI*2); ctx.fill();
      }

      ctx.restore();
    }

    ctx.globalAlpha = 1;

    // ── Ball body ──
    // Parry glow
    if (b.parryTimer > 0) {
      ctx.strokeStyle='#fef08a'; ctx.lineWidth=3+b.parryTimer*0.2; ctx.globalAlpha=b.parryTimer/22;
      ctx.beginPath(); ctx.arc(b.x,b.y,b.r+8,0,Math.PI*2); ctx.stroke(); ctx.globalAlpha=1;
    }

    // Stun stars
    if (b.stunTimer > 0) {
      for (let s=0; s<3; s++) {
        const sa = (BB.matchTime*0.15)+s*Math.PI*2/3;
        ctx.fillStyle='#fbbf24'; ctx.globalAlpha=0.8;
        ctx.font=`${b.r*0.5}px serif`; ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.fillText('★', b.x+Math.cos(sa)*(b.r+10), b.y-b.r-8+Math.sin(sa)*4);
      }
      ctx.globalAlpha=1;
    }

    // Body gradient — big shiny ball
    const grd = ctx.createRadialGradient(b.x-b.r*0.4, b.y-b.r*0.4, b.r*0.05, b.x, b.y, b.r);
    grd.addColorStop(0, isDead ? '#444' : '#ffffffd8');
    grd.addColorStop(0.25, isDead ? '#333' : b.color+'ff');
    grd.addColorStop(0.7, b.color+'cc');
    grd.addColorStop(1, b.color+'44');
    ctx.fillStyle = grd;
    ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI*2); ctx.fill();

    // Rim
    ctx.strokeStyle = isDead ? '#222' : b.rimColor;
    ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI*2); ctx.stroke();

    // Shine highlight
    ctx.fillStyle='rgba(255,255,255,0.25)';
    ctx.beginPath(); ctx.ellipse(b.x-b.r*0.3, b.y-b.r*0.3, b.r*0.4, b.r*0.25, -0.5, 0, Math.PI*2); ctx.fill();

    // Dead X
    if (isDead) {
      ctx.strokeStyle='#ff4444'; ctx.lineWidth=3;
      const d=b.r*0.5;
      ctx.beginPath(); ctx.moveTo(b.x-d,b.y-d); ctx.lineTo(b.x+d,b.y+d); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(b.x+d,b.y-d); ctx.lineTo(b.x-d,b.y+d); ctx.stroke();
    }

    ctx.restore();
  }

  // ── HP BARS (big, prominent) ──────────────────────────────────────
  const barH = 20, barPad = 14;
  const barY = A.y + A.h + 18;
  const halfW = (A.w - barPad*3) / 2;

  for (const b of BB.balls) {
    const isLeft = b.side === 'left';
    const bx = isLeft ? A.x + barPad : A.x + barPad*2 + halfW;
    const ratio = Math.max(0, b.hp / b.maxHp);
    const wep = BB_WEAPONS[b.weaponKey];

    // Track bg
    ctx.fillStyle = C.bg3;
    roundRect(ctx, bx, barY, halfW, barH, 8); ctx.fill();

    // Fill
    if (ratio > 0) {
      ctx.fillStyle = ratio>0.6 ? '#4ade80' : ratio>0.3 ? '#facc15' : '#f87171';
      // Animate fill from correct side
      if (isLeft) { roundRect(ctx, bx, barY, halfW*ratio, barH, 8); }
      else        { roundRect(ctx, bx+halfW*(1-ratio), barY, halfW*ratio, barH, 8); }
      ctx.fill();
    }

    // Rarity glow
    ctx.strokeStyle = BB_RARITY_COLOR[wep.rarity] || C.border; ctx.lineWidth = 1.5;
    roundRect(ctx, bx, barY, halfW, barH, 8); ctx.stroke();

    // Weapon icon
    const wImg = IMGS['weapon_' + b.weaponKey];
    const iSize = barH * 1.6;
    const iX = isLeft ? bx - iSize*0.5 - 2 : bx + halfW + 2 - iSize*0.5;
    const iY = barY + barH/2 - iSize/2;
    if (wImg && wImg.complete && wImg.naturalWidth>0) {
      ctx.drawImage(wImg, iX, iY, iSize, iSize);
    }

    // Name
    ctx.fillStyle = b.alive ? wep.color : C.sub;
    ctx.font = `bold ${W*0.026}px 'Orbitron', monospace`;
    ctx.textAlign = isLeft ? 'left' : 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText(wep.name, isLeft ? bx+4 : bx+halfW-4, barY-3);

    // HP number
    ctx.fillStyle = C.sub; ctx.font = `${W*0.022}px 'DM Sans', sans-serif`;
    ctx.textAlign = isLeft ? 'right' : 'left';
    ctx.fillText(`${Math.ceil(Math.max(0,b.hp))}`, isLeft?bx+halfW-4:bx+4, barY-3);
  }

  // ── TIMER + ARENA INFO ─────────────────────────────────────────────
  if (BB.phase === 'fight') {
    const secs = Math.floor(BB.matchTime / 60);
    ctx.fillStyle = C.sub; ctx.font = `bold ${W*0.028}px 'Orbitron', monospace`;
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(secs+'s', A.circle ? A.cx : A.x+A.w/2, (A.circle ? A.cy-A.cr : A.y) - 22);
    // Arena name small
    const arMap = BB_ARENAS[BB.arena];
    ctx.fillStyle = arMap.border; ctx.font = `${W*0.022}px 'Orbitron', monospace`;
    ctx.fillText(arMap.emoji + ' ' + arMap.desc.toUpperCase(), A.circle ? A.cx : A.x+A.w/2, (A.circle ? A.cy-A.cr : A.y) - 8);
  }

  // ── TOP LABELS ─────────────────────────────────────────────────────
  ctx.fillStyle = C.sub; ctx.font = `bold ${W*0.022}px 'Orbitron', monospace`;
  ctx.textAlign='left'; ctx.textBaseline='top';
  ctx.fillText('YOU', A.x+barPad+4, 10);
  ctx.textAlign='right';
  ctx.fillText('ENEMY', A.x+A.w-barPad, 10);

  // ── SELECT MENU OVERLAY ──
  if (BB.phase === 'menu') bbDrawMenu();

  // ── RESULT OVERLAY ──
  if (BB.phase === 'result') bbDrawResult();

  ctx.restore();
}

// ── SELECT MENU ───────────────────────────────────────────────────────
function bbDrawMenu() {
  const W = canvas.width, H = canvas.height;
  const A = bbArena();

  // Semi-transparent overlay
  ctx.fillStyle='rgba(6,4,12,0.88)';
  roundRect(ctx, A.x, A.y, A.w, A.h, 8); ctx.fill();

  // Title
  ctx.fillStyle=C.accent;
  ctx.font=`bold ${W*0.055}px 'Orbitron', monospace`;
  ctx.textAlign='center'; ctx.textBaseline='top';
  ctx.fillText('CHOOSE BALL', W/2, A.y+10);

  ctx.fillStyle=C.sub;
  ctx.font=`${W*0.026}px 'Orbitron', monospace`;
  ctx.fillText('TAP ONCE TO SELECT  ·  TAP AGAIN TO FIGHT', W/2, A.y+10+W*0.068);

  // 4x3 grid
  const cols=4, padC=8;
  const cellW=(A.w-padC*(cols+1))/cols;
  const cellH=cellW*0.85;
  const startY=A.y+10+W*0.12;

  Object.entries(BB_WEAPONS).forEach(([key, wep], i) => {
    const col=i%cols, row=Math.floor(i/cols);
    const cx=A.x+padC+col*(cellW+padC);
    const cy=startY+row*(cellH+6);
    const sel=BB.p1Weapon===key;
    const hov=BB.selectHover===key;
    const rCol=BB_RARITY_COLOR[wep.rarity];

    // Card
    ctx.fillStyle = sel ? wep.color+'30' : hov ? '#ffffff0d' : C.bg2+'ee';
    ctx.strokeStyle = sel ? wep.color : hov ? '#ffffff25' : rCol+'66';
    ctx.lineWidth = sel ? 2.5 : 1.2;
    roundRect(ctx, cx, cy, cellW, cellH, 8); ctx.fill(); ctx.stroke();

    // Rarity glow for selected
    if (sel) {
      ctx.strokeStyle=rCol; ctx.lineWidth=1; ctx.globalAlpha=0.5;
      roundRect(ctx, cx+2, cy+2, cellW-4, cellH-4, 6); ctx.stroke(); ctx.globalAlpha=1;
    }

    // Weapon PNG
    const wImg=IMGS['weapon_'+key];
    const iSize=cellH*0.48;
    const icx=cx+cellW/2, icy=cy+cellH*0.36;
    if (wImg&&wImg.complete&&wImg.naturalWidth>0) {
      ctx.drawImage(wImg, icx-iSize/2, icy-iSize/2, iSize, iSize);
    } else {
      ctx.fillStyle=wep.color+'aa'; ctx.beginPath(); ctx.arc(icx,icy,iSize*0.38,0,Math.PI*2); ctx.fill();
    }

    // Name
    ctx.fillStyle=sel?wep.color:C.text;
    ctx.font=`bold ${cellW*0.10}px 'Orbitron', monospace`;
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(wep.name, cx+cellW/2, cy+cellH*0.75);

    // Rarity dot
    ctx.fillStyle=rCol;
    ctx.beginPath(); ctx.arc(cx+cellW/2, cy+cellH*0.91, 3, 0, Math.PI*2); ctx.fill();
  });

  // Stats panel for selected
  const sw=BB_WEAPONS[BB.p1Weapon];
  const panY=startY+3*(cellH+6)+6;
  const panH=A.y+A.h-panY-8;
  if (panH>44) {
    ctx.fillStyle=C.bg2+'ee'; ctx.strokeStyle=sw.color; ctx.lineWidth=1.5;
    roundRect(ctx, A.x+padC, panY, A.w-padC*2, panH, 8); ctx.fill(); ctx.stroke();

    const bigImg=IMGS['weapon_'+BB.p1Weapon];
    const bsz=Math.min(panH*0.75, 55);
    if (bigImg&&bigImg.complete&&bigImg.naturalWidth>0) {
      ctx.drawImage(bigImg, A.x+padC+10, panY+(panH-bsz)/2, bsz, bsz);
    }

    const sx=A.x+padC+bsz+18;
    ctx.fillStyle=sw.color; ctx.font=`bold ${W*0.038}px 'Orbitron', monospace`;
    ctx.textAlign='left'; ctx.textBaseline='top';
    ctx.fillText(sw.name, sx, panY+panH*0.08);

    ctx.fillStyle=BB_RARITY_COLOR[sw.rarity]; ctx.font=`${W*0.025}px 'Orbitron', monospace`;
    ctx.fillText(sw.rarity.toUpperCase(), sx, panY+panH*0.38);

    ctx.fillStyle=C.sub; ctx.font=`${W*0.026}px 'DM Sans', sans-serif`;
    ctx.fillText(`HP ${sw.hp}  ·  DMG ${sw.dmg}  ·  SPD ${sw.spd.toFixed(1)}`, sx, panY+panH*0.58);
    ctx.fillText(`✦ ${sw.desc}`, sx, panY+panH*0.8);
  }
}

// ── RESULT OVERLAY ────────────────────────────────────────────────────
function bbDrawResult() {
  const W=canvas.width;
  const A=bbArena();
  ctx.fillStyle='rgba(0,0,0,0.75)';
  roundRect(ctx, A.x, A.y, A.w, A.h, 8); ctx.fill();

  const win=BB.result==='p1', draw=BB.result==='draw';
  ctx.fillStyle=win?C.accent:draw?C.sub:'#f87171';
  ctx.font=`bold ${W*0.068}px 'Orbitron', monospace`;
  ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText(win?'VICTORY':draw?'DRAW':'DEFEAT', W/2, A.y+A.h*0.38);

  if (BB.p2Weapon) {
    const p2=BB_WEAPONS[BB.p2Weapon];
    ctx.fillStyle=C.sub; ctx.font=`${W*0.03}px 'Orbitron', monospace`;
    ctx.fillText(`vs ${p2.name}`, W/2, A.y+A.h*0.58);
  }
}

// ── TOUCH INPUT ───────────────────────────────────────────────────────
function bbHandleClick(ex, ey) {
  if (BB.phase!=='menu') return;
  const W=canvas.width, A=bbArena();
  const cols=4, padC=8;
  const cellW=(A.w-padC*(cols+1))/cols;
  const cellH=cellW*0.85;
  const startY=A.y+10+W*0.12;
  const rect=canvas.getBoundingClientRect();
  const s=W/rect.width;
  const mx=ex*s, my=ey*s;

  const keys=Object.keys(BB_WEAPONS);
  for (let i=0; i<keys.length; i++) {
    const col=i%cols, row=Math.floor(i/cols);
    const cx=A.x+padC+col*(cellW+padC), cy=startY+row*(cellH+6);
    if (mx>=cx&&mx<=cx+cellW&&my>=cy&&my<=cy+cellH) {
      if (BB.p1Weapon===keys[i]) { bbStartFight(); }
      else { BB.p1Weapon=keys[i]; localStorage.setItem('bb_p1w',keys[i]); }
      return;
    }
  }
}
function bbHandleMove(ex, ey) {
  if (BB.phase!=='menu') return;
  const W=canvas.width, A=bbArena();
  const cols=4, padC=8;
  const cellW=(A.w-padC*(cols+1))/cols;
  const cellH=cellW*0.85;
  const startY=A.y+10+W*0.12;
  const rect=canvas.getBoundingClientRect();
  const s=W/rect.width;
  const mx=ex*s, my=ey*s;
  const keys=Object.keys(BB_WEAPONS);
  BB.selectHover=null;
  for (let i=0; i<keys.length; i++) {
    const col=i%cols, row=Math.floor(i/cols);
    const cx=A.x+padC+col*(cellW+padC), cy=startY+row*(cellH+6);
    if (mx>=cx&&mx<=cx+cellW&&my>=cy&&my<=cy+cellH) { BB.selectHover=keys[i]; break; }
  }
}

// ── PARTICLES ─────────────────────────────────────────────────────────
function bbBurst(x, y, color, n) {
  for (let i=0;i<n;i++) {
    const a=Math.random()*Math.PI*2, s=rnd(1.5,7);
    BB.particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,r:rnd(2,6),color,life:1,decay:rnd(0.03,0.06)});
  }
}
function bbSparkLine(x1,y1,x2,y2) {
  for (let i=0;i<6;i++) {
    const t=Math.random(), x=x1+(x2-x1)*t+rnd(-6,6), y=y1+(y2-y1)*t+rnd(-6,6);
    BB.particles.push({x,y,vx:rnd(-2,2),vy:rnd(-3,0),r:2.5,color:'#fef08a',life:0.8,decay:0.1});
  }
}

// ── MAIN LOOP ─────────────────────────────────────────────────────────
function bbLoop() {
  if (BB.phase==='fight') bbPhysics();
  bbDraw();
  BB.raf=requestAnimationFrame(bbLoop);
  arcadeRAF=BB.raf;
}

// ── CANVAS EVENTS ─────────────────────────────────────────────────────
;(function() {
  function onC(e){const r=canvas.getBoundingClientRect();const s=e.changedTouches?e.changedTouches[0]:e;bbHandleClick(s.clientX-r.left,s.clientY-r.top);}
  function onM(e){const r=canvas.getBoundingClientRect();const s=e.touches?e.touches[0]:e;bbHandleMove(s.clientX-r.left,s.clientY-r.top);}
  canvas.addEventListener('click',onC);
  canvas.addEventListener('touchend',onC,{passive:true});
  canvas.addEventListener('mousemove',onM);
  canvas.addEventListener('touchmove',onM,{passive:true});
})();


// ══════════════════════════════════════════════════════════════════════
//  🐾  CAPYBARA  –  2 game modes, 5 worlds
//  MODE 1: RUNNER  – бесконечный бег, прыгай через препятствия
//  MODE 2: CLIMBER – прыгай вверх по платформам как можно выше
// ══════════════════════════════════════════════════════════════════════

const CAPY_WORLDS = {
  grassland: {
    name:'GRASSLAND', emoji:'🌿',
    bg:'#0a0c08', ground:'#1a2410', groundLine:'#2d3d1a', groundTop:'#3a5020',
    platColor:'#2a3d18', platBorder:'#4a6828', platTop:'#5a7830',
    sky: ['#0a0c08','#0d1209'],
    obstColors: ['#2d6a4f','#1a5c3a'],
    coinColor:'#fde047', coinBorder:'#ca8a04',
    decorColor:'#4ade8044', gemColor:'#4ade80',
    particles: '#4ade80',
  },
  snow: {
    name:'SNOW PEAK', emoji:'❄️',
    bg:'#060810', ground:'#1a2038', groundLine:'#2a3560', groundTop:'#3a4878',
    platColor:'#1e2848', platBorder:'#3d5080', platTop:'#4a6090',
    sky: ['#060810','#080a14'],
    obstColors: ['#2a4060','#1e3050'],
    coinColor:'#60dfff', coinBorder:'#0891b2',
    decorColor:'#60a5fa33', gemColor:'#60a5fa',
    particles: '#93c5fd',
  },
  volcano: {
    name:'VOLCANO', emoji:'🌋',
    bg:'#0f0600', ground:'#200a00', groundLine:'#3a1200', groundTop:'#4a1800',
    platColor:'#2a0e00', platBorder:'#6a2000', platTop:'#8a2800',
    sky: ['#0f0600','#1a0800'],
    obstColors: ['#7c2d12','#9a3412'],
    coinColor:'#fb923c', coinBorder:'#c2410c',
    decorColor:'#f9731633', gemColor:'#f97316',
    particles: '#fb923c',
  },
  night: {
    name:'NEON CITY', emoji:'🌙',
    bg:'#04040c', ground:'#0c0a18', groundLine:'#181428', groundTop:'#201c38',
    platColor:'#100e1e', platBorder:'#382860', platTop:'#4a3278',
    sky: ['#04040c','#060410'],
    obstColors: ['#3b1f6e','#4c2d82'],
    coinColor:'#e879f9', coinBorder:'#a21caf',
    decorColor:'#e879f933', gemColor:'#e879f9',
    particles: '#f0abfc',
  },
  desert: {
    name:'DESERT', emoji:'🏜️',
    bg:'#0e0a04', ground:'#1e1608', groundLine:'#2e2010', groundTop:'#3e2c14',
    platColor:'#281c08', platBorder:'#5a3e14', platTop:'#6e4e1e',
    sky: ['#0e0a04','#120c06'],
    obstColors: ['#92400e','#78350f'],
    coinColor:'#fbbf24', coinBorder:'#b45309',
    decorColor:'#fbbf2433', gemColor:'#fbbf24',
    particles: '#fde68a',
  },
};

let capyMode  = localStorage.getItem('capyMode')  || 'runner';
let capyWorld = localStorage.getItem('capyWorld') || 'grassland';

// ── HUB for capybara ──────────────────────────────────────────────────
function startCapybara() {
  stopArcade();
  setupCanvas();
  capyBuildUI();
  capyDrawHub();
}

function capyBuildUI() {
  const ctrl = id('arcadeControls');
  const worldKeys = Object.keys(CAPY_WORLDS);
  ctrl.innerHTML = `
    <div style="margin-bottom:8px">
      <div style="font-family:var(--font-hd);font-size:9px;letter-spacing:2px;color:var(--sub);text-align:center;margin-bottom:6px">GAME MODE</div>
      <div style="display:flex;gap:8px;margin-bottom:10px">
        <button class="capy-mode" data-m="runner" style="flex:1;font-family:var(--font-hd);font-size:10px;letter-spacing:1px;padding:10px;border-radius:10px;cursor:pointer;border:1.5px solid ${capyMode==='runner'?'var(--accent)':'var(--border)'};background:${capyMode==='runner'?'var(--accent)':'var(--bg3)'};color:${capyMode==='runner'?'#fff':'var(--sub)'}">🏃 RUNNER</button>
        <button class="capy-mode" data-m="climber" style="flex:1;font-family:var(--font-hd);font-size:10px;letter-spacing:1px;padding:10px;border-radius:10px;cursor:pointer;border:1.5px solid ${capyMode==='climber'?'var(--accent)':'var(--border)'};background:${capyMode==='climber'?'var(--accent)':'var(--bg3)'};color:${capyMode==='climber'?'#fff':'var(--sub)'}">🧗 CLIMBER</button>
      </div>
      <div style="font-family:var(--font-hd);font-size:9px;letter-spacing:2px;color:var(--sub);text-align:center;margin-bottom:6px">WORLD</div>
      <div style="display:flex;gap:5px;overflow-x:auto;padding-bottom:2px;scrollbar-width:none">
        ${worldKeys.map(k=>{
          const w=CAPY_WORLDS[k];const sel=k===capyWorld;
          return `<button class="capy-world" data-w="${k}" style="flex-shrink:0;font-family:var(--font-hd);font-size:9px;letter-spacing:1px;padding:6px 10px;border-radius:16px;cursor:pointer;white-space:nowrap;border:1.5px solid ${sel?w.gemColor:'var(--border)'};background:${sel?w.gemColor+'25':'var(--bg3)'};color:${sel?'#fff':'var(--sub)'}">${w.emoji} ${w.name}</button>`;
        }).join('')}
      </div>
    </div>
    <button class="start-btn" id="capyPlayBtn" style="max-width:300px;margin:0 auto;display:block">▶ PLAY</button>`;

  ctrl.querySelectorAll('.capy-mode').forEach(btn => {
    btn.addEventListener('click', () => {
      capyMode = btn.dataset.m;
      localStorage.setItem('capyMode', capyMode);
      capyBuildUI();
    });
  });
  ctrl.querySelectorAll('.capy-world').forEach(btn => {
    btn.addEventListener('click', () => {
      capyWorld = btn.dataset.w;
      localStorage.setItem('capyWorld', capyWorld);
      capyBuildUI();
    });
  });
  id('capyPlayBtn').addEventListener('click', () => {
    if (capyMode === 'runner') capyStartRunner();
    else capyStartClimber();
  });
}

function capyDrawHub() {
  const W = canvas.width, H = canvas.height;
  const WORLD = CAPY_WORLDS[capyWorld];
  ctx.fillStyle = WORLD.bg; ctx.fillRect(0,0,W,H);

  // Stars
  for (let i=0;i<40;i++) {
    ctx.fillStyle='#ffffff'; ctx.globalAlpha=(Math.sin(i*1.7)+1)*0.1+0.05;
    ctx.beginPath(); ctx.arc(i*W/40+15, 30+Math.sin(i*0.9)*50, 1, 0, Math.PI*2); ctx.fill();
  }
  ctx.globalAlpha=1;

  // Ground
  ctx.fillStyle=WORLD.ground; ctx.fillRect(0, H-60, W, 60);
  ctx.fillStyle=WORLD.groundTop; ctx.fillRect(0, H-62, W, 6);

  // Title
  ctx.fillStyle=WORLD.gemColor;
  ctx.font=`bold ${W*0.065}px 'Orbitron',monospace`;
  ctx.textAlign='center'; ctx.textBaseline='top';
  ctx.fillText('CAPYBARA', W/2, H*0.08);
  ctx.fillStyle=C.sub;
  ctx.font=`${W*0.028}px 'Orbitron',monospace`;
  ctx.fillText(capyMode==='runner' ? '🏃 ENDLESS RUNNER' : '🧗 CLIMB TO THE TOP', W/2, H*0.08+W*0.075);

  // Capybara preview
  const img = IMGS['capy'];
  if (img && img.complete && img.naturalWidth>0) {
    ctx.drawImage(img, W/2-50, H*0.32, 100, 72);
  } else {
    ctx.fillStyle=WORLD.gemColor+'88';
    ctx.beginPath(); ctx.arc(W/2, H*0.42, 40, 0, Math.PI*2); ctx.fill();
  }

  // Hi-score
  const hi = parseInt(localStorage.getItem(`capy_hi_${capyMode}_${capyWorld}`)||'0');
  if (hi > 0) {
    ctx.fillStyle=WORLD.coinColor;
    ctx.font=`bold ${W*0.032}px 'Orbitron',monospace`;
    ctx.fillText(`BEST: ${hi}`, W/2, H*0.65);
  }

  ctx.textBaseline='alphabetic';
  arcadeRAF = requestAnimationFrame(capyDrawHub);
}

// ══════════════════════════════════════════════════════════════════════
//  MODE 1: RUNNER
// ══════════════════════════════════════════════════════════════════════
function capyStartRunner() {
  stopArcade();
  const W = canvas.width, H = canvas.height;
  const WORLD = CAPY_WORLDS[capyWorld];
  const GROUND = H - 55;
  const GRAVITY = 0.55, JUMP = -13;

  let score = 0, distance = 0, coins = 0;
  let speed = 3.8, frame = 0;
  let dead = false;

  const capy = {
    x: W*0.18, y: GROUND-38, w: 58, h: 40,
    vy:0, onGround:true, jumps:2, coyoteTime:0,
    walkF:0, invincible:0,
  };

  // World-specific objects
  const platforms = [];
  const obstacles = [];
  const coinList  = [];
  const gems      = [];
  const particles = [];
  let platTimer=0, obstTimer=70, coinTimer=45, gemTimer=300;

  // Background parallax layers
  const bgItems = Array.from({length:12}, (_,i) => ({
    x: rnd(0,W), y: rnd(H*0.1, H*0.7),
    s: rnd(0.4,1.2), spd: rnd(0.3,0.9),
    type: i%3
  }));

  function spawnPlatform() {
    const last = platforms[platforms.length-1];
    const px = last ? Math.max(W+40, last.x + last.w + rnd(60,120)) : W+60;
    const py = rnd(GROUND-150, GROUND-60);
    const pw = rnd(70, 140);
    platforms.push({ x:px, y:py, w:pw, h:14 });
  }

  function spawnObstacle() {
    const types = worldObstacles(capyWorld);
    const t = types[Math.floor(Math.random()*types.length)];
    const h2 = t==='cactus'?rnd(38,58):t==='rock'?rnd(24,40):t==='log'?rnd(22,32):t==='barrel'?rnd(28,38):rnd(20,34);
    const w2 = t==='log'?rnd(55,90):t==='barrel'?rnd(28,38):rnd(24,38);
    obstacles.push({ x:W+20, y:GROUND-h2, w:w2, h:h2, type:t });
  }

  function spawnCoin() {
    const onPlat = platforms.length>0 && Math.random()<0.4;
    let cx=W+rnd(20,80), cy;
    if (onPlat) { const p=platforms[Math.floor(Math.random()*platforms.length)]; cx=p.x+p.w*0.5; cy=p.y-22; }
    else cy=rnd(GROUND-150,GROUND-45);
    coinList.push({ x:cx, y:cy, r:9, phase:Math.random()*Math.PI*2, collected:false });
  }

  function spawnGem() {
    gems.push({ x:W+30, y:rnd(GROUND-200,GROUND-80), r:10, phase:0, collected:false });
  }

  // Input
  let jumpQ = false;
  function onKey(e) { if(['Space','ArrowUp','KeyW'].includes(e.code)){ jumpQ=true; e.preventDefault(); } }
  function onTap()  { jumpQ=true; }
  document.addEventListener('keydown',onKey);
  canvas.addEventListener('touchstart',onTap,{passive:true});
  canvas.addEventListener('click',onTap);

  arcadeGame = { cleanup(){ document.removeEventListener('keydown',onKey); canvas.removeEventListener('touchstart',onTap); canvas.removeEventListener('click',onTap); } };

  // Controls
  const ctrl=id('arcadeControls');
  ctrl.innerHTML=`<button class="arc-btn wide" id="capyJump" style="max-width:180px;margin:0 auto;display:block">🐾 JUMP</button>`;
  id('capyJump').addEventListener('click',()=>jumpQ=true);

  function loop() {
    frame++; ctx.fillStyle=WORLD.bg; ctx.fillRect(0,0,W,H);

    // BG parallax
    bgItems.forEach(item=>{
      item.x -= item.spd*(speed/3.8);
      if(item.x<-60) item.x=W+60;
      ctx.globalAlpha=0.12+item.s*0.08;
      ctx.fillStyle=WORLD.decorColor||'#ffffff22';
      if(item.type===0){ ctx.beginPath(); ctx.arc(item.x,item.y,8*item.s,0,Math.PI*2); ctx.fill(); }
      else if(item.type===1){ ctx.fillRect(item.x,item.y,3,20*item.s); }
      else { ctx.beginPath(); ctx.arc(item.x,item.y,2,0,Math.PI*2); ctx.fill(); }
    });
    ctx.globalAlpha=1;

    // Ground
    ctx.fillStyle=WORLD.ground; ctx.fillRect(0,GROUND,W,H-GROUND);
    ctx.fillStyle=WORLD.groundTop; ctx.fillRect(0,GROUND-4,W,8);
    // Ground pattern
    ctx.fillStyle=WORLD.groundLine;
    for(let i=0;i<16;i++) ctx.fillRect(((i*71+frame*speed*0.35)%W),GROUND+8,4,3);

    if(!dead){
      distance+=speed*0.016; speed=3.8+distance*0.04;
      score=Math.floor(distance*10+coins*50+gems.filter(g=>g.collected).length*200);
      arcadeScore=score; updateArcadeScore();
    }

    // Spawn
    platTimer++; if(platTimer>Math.max(40,80-distance*0.6)){ spawnPlatform(); platTimer=0; }
    if(!dead){ obstTimer--; if(obstTimer<=0){ spawnObstacle(); obstTimer=Math.max(30,75-distance*0.7)+rnd(0,25); } }
    coinTimer--; if(coinTimer<=0){ spawnCoin(); coinTimer=rnd(28,55); }
    gemTimer--; if(gemTimer<=0){ spawnGem(); gemTimer=rnd(250,400); }

    // Move world
    for(const p of platforms){ if(!dead) p.x-=speed; }
    for(const o of obstacles){ if(!dead) o.x-=speed; }
    for(const c of coinList) { if(!dead) c.x-=speed; c.phase+=0.07; }
    for(const g of gems)     { if(!dead) g.x-=speed; g.phase+=0.05; }
    platforms.splice(0, platforms.filter(p=>p.x+p.w<-20).length);
    obstacles.splice(0, obstacles.filter(o=>o.x+o.w<-10).length);
    coinList.splice(0, coinList.filter(c=>c.x<-20||c.collected).length);
    gems.splice(0, gems.filter(g=>g.x<-20||g.collected).length);

    // Draw platforms
    platforms.forEach(p=>{
      ctx.fillStyle=WORLD.platColor; roundRect(ctx,p.x,p.y,p.w,p.h,5); ctx.fill();
      ctx.fillStyle=WORLD.platTop; ctx.fillRect(p.x+3,p.y+1,p.w-6,4);
      ctx.strokeStyle=WORLD.platBorder; ctx.lineWidth=1.5;
      roundRect(ctx,p.x,p.y,p.w,p.h,5); ctx.stroke();
    });

    // Draw obstacles
    obstacles.forEach(o=>drawRunnerObstacle(ctx,o,WORLD,capyWorld));

    // Draw coins
    coinList.forEach(c=>{
      if(c.collected) return;
      const fy=c.y+Math.sin(c.phase)*4;
      ctx.save();
      ctx.fillStyle=WORLD.coinColor;
      ctx.strokeStyle=WORLD.coinBorder; ctx.lineWidth=1.5;
      ctx.shadowColor=WORLD.coinColor; ctx.shadowBlur=8;
      ctx.beginPath(); ctx.arc(c.x,fy,c.r,0,Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.fillStyle=WORLD.coinBorder; ctx.font=`bold ${c.r}px serif`; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText('$',c.x,fy);
      ctx.restore();
    });

    // Draw gems (rare)
    gems.forEach(g=>{
      if(g.collected) return;
      const fy=g.y+Math.sin(g.phase)*5;
      ctx.save();
      ctx.fillStyle=WORLD.gemColor; ctx.strokeStyle='#fff8'; ctx.lineWidth=1.5;
      ctx.shadowColor=WORLD.gemColor; ctx.shadowBlur=14;
      // Diamond shape
      ctx.beginPath(); ctx.moveTo(g.x,fy-g.r); ctx.lineTo(g.x+g.r,fy); ctx.lineTo(g.x,fy+g.r); ctx.lineTo(g.x-g.r,fy); ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.restore();
    });

    // Particles
    for(let i=particles.length-1;i>=0;i--){
      const p=particles[i];
      ctx.globalAlpha=p.life; ctx.fillStyle=p.color;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r*p.life,0,Math.PI*2); ctx.fill();
      p.x+=p.vx; p.y+=p.vy; p.vy+=0.15; p.vx*=0.93; p.life-=0.05;
      if(p.life<=0) particles.splice(i,1);
    }
    ctx.globalAlpha=1;

    // Capy physics
    if(!dead){
      if(jumpQ){
        if(capy.jumps>0||capy.coyoteTime>0){
          capy.vy=JUMP-(capy.jumps===1&&!capy.onGround?1.5:0);
          capy.jumps--; capy.onGround=false; capy.coyoteTime=0;
          for(let i=0;i<6;i++) particles.push({x:capy.x+capy.w*0.5,y:capy.y+capy.h,vx:rnd(-2,2),vy:rnd(0,2),r:4,color:WORLD.particles,life:0.8});
        }
        jumpQ=false;
      }
      capy.vy+=GRAVITY; capy.y+=capy.vy;
      capy.onGround=false;

      if(capy.y+capy.h>=GROUND){ capy.y=GROUND-capy.h; capy.vy=0; capy.onGround=true; capy.jumps=2; capy.coyoteTime=0; }
      for(const p of platforms){
        if(capy.x+capy.w*0.8>p.x&&capy.x+capy.w*0.2<p.x+p.w&&capy.vy>=0&&capy.y+capy.h>=p.y&&capy.y+capy.h<=p.y+p.h+16){
          capy.y=p.y-capy.h; capy.vy=0; capy.onGround=true; capy.jumps=2; capy.coyoteTime=0;
        }
      }
      if(!capy.onGround&&capy.coyoteTime>0) capy.coyoteTime--;
      if(capy.onGround) capy.coyoteTime=8;
      capy.walkF+=speed;
      if(capy.invincible>0) capy.invincible--;

      // Coin collect
      coinList.forEach(c=>{
        if(c.collected) return;
        if(Math.hypot(c.x-(capy.x+capy.w*0.6),c.y+Math.sin(c.phase)*4-(capy.y+capy.h*0.5))<c.r+18){
          c.collected=true; coins++;
          for(let i=0;i<8;i++) particles.push({x:c.x,y:c.y,vx:rnd(-3,3),vy:rnd(-4,0),r:3,color:WORLD.coinColor,life:1});
        }
      });
      // Gem collect
      gems.forEach(g=>{
        if(g.collected) return;
        if(Math.hypot(g.x-(capy.x+capy.w*0.6),g.y-(capy.y+capy.h*0.5))<g.r+20){
          g.collected=true;
          for(let i=0;i<15;i++) particles.push({x:g.x,y:g.y,vx:rnd(-4,4),vy:rnd(-5,-1),r:5,color:WORLD.gemColor,life:1.2});
        }
      });

      // Obstacle collision
      if(capy.invincible<=0){
        for(const o of obstacles){
          if(capy.x+capy.w*0.75>o.x+4&&capy.x+capy.w*0.2<o.x+o.w-4&&capy.y+capy.h*0.9>o.y&&capy.y+capy.h*0.2<o.y+o.h){
            dead=true;
            const hi=parseInt(localStorage.getItem(`capy_hi_runner_${capyWorld}`)||'0');
            if(score>hi) localStorage.setItem(`capy_hi_runner_${capyWorld}`,score);
            setTimeout(()=>showRunnerResult(score,coins),900);
            break;
          }
        }
      }
    } else {
      capy.vy+=GRAVITY*0.5; capy.y=Math.min(capy.y+capy.vy,GROUND-capy.h);
    }

    // Shadow
    ctx.fillStyle='rgba(0,0,0,0.22)';
    ctx.beginPath(); ctx.ellipse(capy.x+capy.w/2,GROUND+3,capy.w*0.38,5,0,0,Math.PI*2); ctx.fill();

    // Draw capy
    ctx.save();
    if(dead){ ctx.translate(capy.x+capy.w/2,capy.y+capy.h/2); ctx.rotate(Math.PI); ctx.translate(-(capy.x+capy.w/2),-(capy.y+capy.h/2)); }
    const capImg=IMGS[dead?'capy_dead':'capy'];
    if(capImg&&capImg.complete&&capImg.naturalWidth>0){
      const bob=dead?0:Math.sin(capy.walkF*0.28)*2;
      ctx.drawImage(capImg,capy.x,capy.y+bob,capy.w,capy.h);
    } else {
      ctx.fillStyle=dead?'#555':'#8B6914';
      ctx.beginPath(); ctx.arc(capy.x+capy.w/2,capy.y+capy.h/2,capy.w/2,0,Math.PI*2); ctx.fill();
    }
    ctx.restore();

    // HUD
    ctx.fillStyle=WORLD.coinColor; ctx.font=`bold ${W*0.036}px 'Orbitron',monospace`; ctx.textAlign='left'; ctx.textBaseline='top';
    ctx.fillText(`🪙 ${coins}`, 14, 14);
    ctx.fillStyle=WORLD.gemColor;
    ctx.fillText(`💎 ${gems.filter(g=>g.collected).length}`, 14, 14+W*0.05);
    ctx.fillStyle=C.sub; ctx.font=`${W*0.026}px 'Orbitron',monospace`;
    ctx.fillText(`${(distance*10).toFixed(0)}m`, 14, 14+W*0.1);

    // Speed bar
    const spRatio=Math.min(1,(speed-3.8)/6);
    ctx.fillStyle=C.bg2; roundRect(ctx,W-74,14,60,8,4); ctx.fill();
    ctx.fillStyle=spRatio>0.7?WORLD.gemColor:spRatio>0.4?WORLD.coinColor:'#4ade80';
    if(spRatio>0){ roundRect(ctx,W-74,14,60*spRatio,8,4); ctx.fill(); }
    ctx.strokeStyle=C.border; ctx.lineWidth=1; roundRect(ctx,W-74,14,60,8,4); ctx.stroke();
    ctx.fillStyle=C.sub; ctx.font=`${W*0.02}px 'Orbitron',monospace`; ctx.textAlign='right';
    ctx.fillText('SPEED',W-8,13);
    // Jump dots
    for(let j=0;j<2;j++){
      ctx.fillStyle=j<capy.jumps?WORLD.gemColor:C.bg3;
      ctx.beginPath(); ctx.arc(W-22-j*18,36,6,0,Math.PI*2); ctx.fill();
    }

    if(!dead) arcadeRAF=requestAnimationFrame(loop);
  }
  arcadeRAF=requestAnimationFrame(loop);
}

function showRunnerResult(score, coins) {
  const ctrl=id('arcadeControls');
  const hi=parseInt(localStorage.getItem(`capy_hi_runner_${capyWorld}`)||'0');
  ctrl.innerHTML=`
    <div style="text-align:center;margin-bottom:12px">
      <div style="font-family:var(--font-hd);font-size:14px;letter-spacing:2px;color:var(--accent)">GAME OVER</div>
      <div style="font-family:var(--font-hd);font-size:11px;color:var(--sub);margin-top:4px">SCORE ${score}  ·  COINS ${coins}  ·  BEST ${hi}</div>
    </div>
    <div style="display:flex;gap:8px">
      <button class="start-btn" id="capyRetry" style="flex:1">↺ RETRY</button>
      <button class="ctrl-btn" id="capyMenu" style="flex:1;border-color:var(--accent);color:var(--accent)">MENU</button>
    </div>`;
  id('capyRetry').addEventListener('click',capyStartRunner);
  id('capyMenu').addEventListener('click',()=>{ stopArcade(); hide(arcadeScreen); show(hub); });
}

// ══════════════════════════════════════════════════════════════════════
//  MODE 2: CLIMBER  – прыгай вверх по платформам
// ══════════════════════════════════════════════════════════════════════
function capyStartClimber() {
  stopArcade();
  const W=canvas.width, H=canvas.height;
  const WORLD=CAPY_WORLDS[capyWorld];
  const GRAVITY=0.45, JUMP=-12.5;
  const PLAT_W_MIN=55, PLAT_W_MAX=110;
  const PLAT_GAP=72; // vertical gap between platforms

  let score=0, coins=0, gems_=0;
  let dead=false, frame2=0;
  let cameraY=0; // how far we've scrolled up
  let highestY=H; // highest capy position (world coords)

  const capy={
    x:W/2-29, y:H-120,
    w:58, h:40,
    vx:0, vy:0,
    onGround:false, jumps:2,
    walkF:0, dead:false,
    coyoteTime:0,
  };

  // Generate platforms ahead
  const plats=[];
  const coinList2=[];
  const gemList2=[];
  const particles2=[];

  // Starter platform
  plats.push({ x:W*0.1, y:H-80, w:W*0.8, h:14, type:'normal', moving:false });

  function genPlatforms(fromY, count=20) {
    let y=fromY;
    for(let i=0;i<count;i++){
      y-=PLAT_GAP+rnd(-15,20);
      const pw=rnd(PLAT_W_MIN,PLAT_W_MAX);
      const px=rnd(8, W-pw-8);
      const moving=i>5&&Math.random()<0.3;
      const type=getWorldPlatType(capyWorld, i);
      plats.push({ x:px, y, w:pw, h:14, type, moving, mx:px, mdir:1, mspd:rnd(0.8,1.8) });
      // Coins above some platforms
      if(Math.random()<0.55){
        const n=Math.floor(rnd(1,4));
        for(let c=0;c<n;c++) coinList2.push({ x:px+pw*(c+1)/(n+1), y:y-26-c*0, wy:y-26, phase:Math.random()*Math.PI*2, collected:false });
      }
      // Rare gem
      if(Math.random()<0.12) gemList2.push({ x:px+pw/2, y:y-35, wy:y-35, phase:0, collected:false });
    }
  }
  genPlatforms(H-80);

  // Keys
  const keys2={};
  function onK(e){ keys2[e.code]=(e.type==='keydown'); if(['Space','ArrowUp','KeyW','ArrowLeft','ArrowRight','KeyA','KeyD'].includes(e.code)) e.preventDefault(); }
  document.addEventListener('keydown',onK);
  document.addEventListener('keyup',onK);

  arcadeGame={cleanup(){document.removeEventListener('keydown',onK);document.removeEventListener('keyup',onK);}};

  // Controls
  const ctrl=id('arcadeControls');
  ctrl.innerHTML=`
    <div style="display:grid;grid-template-columns:repeat(3,58px);grid-template-rows:repeat(2,58px);gap:6px;justify-content:center">
      <div></div>
      <button class="arc-btn" id="clUp">▲</button>
      <div></div>
      <button class="arc-btn" id="clLeft">◀</button>
      <button class="arc-btn" id="clDown" style="font-size:11px;letter-spacing:0">DROP</button>
      <button class="arc-btn" id="clRight">▶</button>
    </div>`;
  id('clUp').addEventListener('touchstart',e=>{e.preventDefault();keys2['ArrowUp']=true;},{passive:false});
  id('clUp').addEventListener('touchend',()=>keys2['ArrowUp']=false);
  id('clLeft').addEventListener('touchstart',e=>{e.preventDefault();keys2['ArrowLeft']=true;},{passive:false});
  id('clLeft').addEventListener('touchend',()=>keys2['ArrowLeft']=false);
  id('clRight').addEventListener('touchstart',e=>{e.preventDefault();keys2['ArrowRight']=true;},{passive:false});
  id('clRight').addEventListener('touchend',()=>keys2['ArrowRight']=false);
  id('clDown').addEventListener('touchstart',e=>{e.preventDefault();keys2['ArrowDown']=true;},{passive:false});
  id('clDown').addEventListener('touchend',()=>keys2['ArrowDown']=false);
  ['clUp','clLeft','clRight','clDown'].forEach(btn=>{
    document.getElementById(btn).addEventListener('mousedown',()=>{ const k={'clUp':'ArrowUp','clLeft':'ArrowLeft','clRight':'ArrowRight','clDown':'ArrowDown'}[btn]; keys2[k]=true; });
    document.getElementById(btn).addEventListener('mouseup',()=>{ const k={'clUp':'ArrowUp','clLeft':'ArrowLeft','clRight':'ArrowRight','clDown':'ArrowDown'}[btn]; keys2[k]=false; });
  });

  function worldToScreen(wy){ return wy - cameraY; }

  function loop2(){
    frame2++;
    ctx.fillStyle=WORLD.bg; ctx.fillRect(0,0,W,H);

    // Generate more platforms as we go up
    const topPlat=plats[plats.length-1];
    if(topPlat && cameraY - topPlat.y > -H*0.5) genPlatforms(topPlat.y, 15);

    // Camera follows capy upward
    const targetCam = capy.y - H*0.45;
    cameraY += (targetCam - cameraY) * 0.08;

    // BG parallax stars
    for(let i=0;i<30;i++){
      const sy=((i*137+frame2*0.3)%H+H)%H;
      const sx=(i*73+73)%W;
      ctx.fillStyle=WORLD.gemColor; ctx.globalAlpha=0.06+i%4*0.03;
      ctx.beginPath(); ctx.arc(sx,sy,1,0,Math.PI*2); ctx.fill();
    }
    ctx.globalAlpha=1;

    if(!dead){
      // Move platforms
      plats.forEach(p=>{
        if(p.moving){ p.x+=p.mdir*p.mspd; if(p.x<8||p.x+p.w>W-8) p.mdir*=-1; }
      });

      // Physics
      if(keys2['ArrowLeft']||keys2['KeyA']) capy.vx-=0.7;
      if(keys2['ArrowRight']||keys2['KeyD']) capy.vx+=0.7;
      capy.vx*=0.86;
      if(Math.abs(capy.vx)>6) capy.vx=Math.sign(capy.vx)*6;

      if((keys2['ArrowUp']||keys2['Space']||keys2['KeyW'])&&(capy.jumps>0||capy.coyoteTime>0)){
        if(!capy._jumpHeld){ capy.vy=JUMP-(capy.jumps===1&&!capy.onGround?1.5:0); capy.jumps--; capy.onGround=false; capy.coyoteTime=0; capy._jumpHeld=true;
          for(let i=0;i<6;i++) particles2.push({x:capy.x+capy.w/2,y:capy.y+capy.h,vx:rnd(-2,2),vy:rnd(1,3),r:3,color:WORLD.particles,life:0.7}); }
      } else { capy._jumpHeld=false; }

      capy.vy+=GRAVITY; capy.x+=capy.vx; capy.y+=capy.vy;

      // Walls wrap
      if(capy.x+capy.w<0) capy.x=W;
      if(capy.x>W) capy.x=-capy.w;

      capy.onGround=false;
      if(capy.coyoteTime>0) capy.coyoteTime--;

      // Platform collision (only landing from above)
      for(const p of plats){
        if(!p) continue;
        const sy=worldToScreen(p.y);
        if(capy.x+capy.w*0.8>p.x&&capy.x+capy.w*0.2<p.x+p.w&&capy.vy>=0&&capy.y+capy.h>=p.y&&capy.y+capy.h<=p.y+p.h+18){
          if(!keys2['ArrowDown']){
            capy.y=p.y-capy.h; capy.vy=0; capy.onGround=true; capy.jumps=2; capy.coyoteTime=8;
            // Bounce platforms
            if(p.type==='bouncy'){ capy.vy=-17; capy.onGround=false; capy.jumps=2; for(let i=0;i<8;i++) particles2.push({x:capy.x+capy.w/2,y:capy.y+capy.h,vx:rnd(-3,3),vy:rnd(-2,1),r:4,color:WORLD.gemColor,life:0.9}); }
          }
        }
      }

      // Score = highest point reached
      if(capy.y < highestY){ highestY=capy.y; score=Math.floor((H-highestY)*0.18)+coins*50+gems_*200; arcadeScore=score; updateArcadeScore(); }

      capy.walkF+=Math.abs(capy.vx)*0.4;

      // Coin collect
      coinList2.forEach(c=>{
        if(c.collected) return;
        const sy=worldToScreen(c.wy);
        if(Math.hypot(c.x-(capy.x+capy.w*0.6),c.wy-(capy.y+capy.h*0.5))<20){ c.collected=true; coins++; score+=50; for(let i=0;i<8;i++) particles2.push({x:c.x,y:sy,vx:rnd(-2,2),vy:rnd(-3,0),r:3,color:WORLD.coinColor,life:1}); }
      });
      gemList2.forEach(g=>{
        if(g.collected) return;
        if(Math.hypot(g.x-(capy.x+capy.w*0.6),g.wy-(capy.y+capy.h*0.5))<24){ g.collected=true; gems_++; score+=200; for(let i=0;i<14;i++) particles2.push({x:g.x,y:worldToScreen(g.wy),vx:rnd(-4,4),vy:rnd(-5,-1),r:5,color:WORLD.gemColor,life:1.2}); }
      });

      // Death: fell below start
      if(capy.y > H+80){
        dead=true;
        const hi=parseInt(localStorage.getItem(`capy_hi_climber_${capyWorld}`)||'0');
        if(score>hi) localStorage.setItem(`capy_hi_climber_${capyWorld}`,score);
        setTimeout(()=>showClimberResult(score,coins,gems_),800);
      }
    }

    // Draw platforms
    plats.forEach(p=>{
      const sy=worldToScreen(p.y);
      if(sy>H+30||sy+p.h<-30) return;
      drawClimberPlatform(ctx,p,sy,WORLD,capyWorld);
    });

    // Draw coins
    coinList2.forEach(c=>{
      if(c.collected) return;
      const sy=worldToScreen(c.wy)+Math.sin(c.phase+frame2*0.07)*4;
      if(sy<-20||sy>H+20) return;
      ctx.save();
      ctx.fillStyle=WORLD.coinColor; ctx.strokeStyle=WORLD.coinBorder; ctx.lineWidth=1.5;
      ctx.shadowColor=WORLD.coinColor; ctx.shadowBlur=8;
      ctx.beginPath(); ctx.arc(c.x,sy,9,0,Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.fillStyle=WORLD.coinBorder; ctx.font=`bold 9px serif`; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText('$',c.x,sy); ctx.restore();
    });
    // Gems
    gemList2.forEach(g=>{
      if(g.collected) return;
      const sy=worldToScreen(g.wy)+Math.sin(g.phase+frame2*0.05)*5;
      if(sy<-20||sy>H+20) return;
      ctx.save();
      ctx.fillStyle=WORLD.gemColor; ctx.shadowColor=WORLD.gemColor; ctx.shadowBlur=16;
      ctx.beginPath(); ctx.moveTo(g.x,sy-11); ctx.lineTo(g.x+11,sy); ctx.lineTo(g.x,sy+11); ctx.lineTo(g.x-11,sy); ctx.closePath(); ctx.fill();
      ctx.strokeStyle='#fff8'; ctx.lineWidth=1.5; ctx.stroke();
      ctx.restore();
    });

    // Particles
    for(let i=particles2.length-1;i>=0;i--){
      const p=particles2[i];
      ctx.globalAlpha=p.life; ctx.fillStyle=p.color;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r*p.life,0,Math.PI*2); ctx.fill();
      p.x+=p.vx; p.y+=p.vy; p.vy+=0.1; p.vx*=0.93; p.life-=0.05;
      if(p.life<=0) particles2.splice(i,1);
    }
    ctx.globalAlpha=1;

    // Draw capy (screen coords)
    const capySY=worldToScreen(capy.y);
    ctx.save();
    if(dead){ ctx.translate(capy.x+capy.w/2,capySY+capy.h/2); ctx.rotate(Math.PI); ctx.translate(-(capy.x+capy.w/2),-(capySY+capy.h/2)); }
    const cImg=IMGS[dead?'capy_dead':'capy'];
    if(cImg&&cImg.complete&&cImg.naturalWidth>0){
      ctx.drawImage(cImg,capy.x,capySY+(dead?0:Math.sin(capy.walkF*0.28)*1.5),capy.w,capy.h);
    } else {
      ctx.fillStyle='#8B6914'; ctx.beginPath(); ctx.arc(capy.x+capy.w/2,capySY+capy.h/2,capy.w/2,0,Math.PI*2); ctx.fill();
    }
    ctx.restore();

    // HUD
    const altM=Math.max(0,Math.floor((H-highestY)*0.18));
    ctx.fillStyle=WORLD.gemColor; ctx.font=`bold ${W*0.044}px 'Orbitron',monospace`; ctx.textAlign='center'; ctx.textBaseline='top';
    ctx.fillText(`${altM}m`, W/2, 10);
    ctx.fillStyle=WORLD.coinColor; ctx.font=`${W*0.03}px 'Orbitron',monospace`;
    ctx.fillText(`🪙${coins}  💎${gems_}`, W/2, 10+W*0.056);
    // Jump dots
    for(let j=0;j<2;j++){
      ctx.fillStyle=j<capy.jumps?WORLD.gemColor:C.bg3;
      ctx.beginPath(); ctx.arc(W-22-j*18,18,6,0,Math.PI*2); ctx.fill();
    }
    // Height arrow indicator
    if(altM>0){
      ctx.fillStyle=WORLD.gemColor; ctx.globalAlpha=0.5;
      ctx.font=`${W*0.04}px sans-serif`; ctx.textAlign='right';
      ctx.fillText('▲ GO UP', W-12, H/2);
      ctx.globalAlpha=1;
    }

    if(!dead) arcadeRAF=requestAnimationFrame(loop2);
  }
  arcadeRAF=requestAnimationFrame(loop2);
}

function showClimberResult(score, coins, gems) {
  const ctrl=id('arcadeControls');
  const hi=parseInt(localStorage.getItem(`capy_hi_climber_${capyWorld}`)||'0');
  const alt=Math.max(0,Math.floor(score));
  ctrl.innerHTML=`
    <div style="text-align:center;margin-bottom:12px">
      <div style="font-family:var(--font-hd);font-size:14px;letter-spacing:2px;color:var(--accent)">GAME OVER</div>
      <div style="font-family:var(--font-hd);font-size:11px;color:var(--sub);margin-top:4px">SCORE ${score}  ·  COINS ${coins}  ·  GEMS ${gems}</div>
      <div style="font-family:var(--font-hd);font-size:10px;color:var(--sub);margin-top:2px">BEST ${hi}</div>
    </div>
    <div style="display:flex;gap:8px">
      <button class="start-btn" id="climbRetry" style="flex:1">↺ RETRY</button>
      <button class="ctrl-btn" id="climbMenu" style="flex:1;border-color:var(--accent);color:var(--accent)">MENU</button>
    </div>`;
  id('climbRetry').addEventListener('click',capyStartClimber);
  id('climbMenu').addEventListener('click',()=>{ stopArcade(); hide(arcadeScreen); show(hub); });
}

// ── WORLD-SPECIFIC HELPERS ────────────────────────────────────────────
function worldObstacles(world) {
  const types = {
    grassland: ['cactus','rock','log','bush'],
    snow:      ['snowball','ice_block','log','rock'],
    volcano:   ['rock','lava_rock','barrel','cactus'],
    night:     ['barrel','sign','rock','log'],
    desert:    ['cactus','rock','barrel','skull'],
  };
  return types[world]||['rock','log'];
}

function getWorldPlatType(world, idx) {
  if(idx<3) return 'normal';
  const r=Math.random();
  const worldTypes={
    grassland:['normal','normal','normal','bouncy','crumble'],
    snow:     ['normal','normal','ice','ice','bouncy'],
    volcano:  ['normal','normal','lava','crumble','bouncy'],
    night:    ['normal','normal','neon','moving','bouncy'],
    desert:   ['normal','normal','sand','crumble','moving'],
  };
  const types=worldTypes[world]||['normal'];
  return r<0.5?'normal':types[Math.floor(Math.random()*types.length)];
}

function drawClimberPlatform(ctx, p, sy, WORLD, world) {
  const typeColors={
    normal:  {bg:WORLD.platColor, top:WORLD.platTop, border:WORLD.platBorder},
    bouncy:  {bg:'#1a3a10', top:'#2a5a18', border:'#4ade80'},
    crumble: {bg:'#3a2010', top:'#5a3010', border:'#92400e'},
    ice:     {bg:'#0e1a38', top:'#1a2a58', border:'#60a5fa'},
    lava:    {bg:'#3a0e00', top:'#5a1400', border:'#f97316'},
    neon:    {bg:'#1a0a2a', top:'#2a1040', border:'#e879f9'},
    sand:    {bg:'#2a1e08', top:'#3e2e10', border:'#fbbf24'},
    moving:  {bg:WORLD.platColor, top:WORLD.platTop, border:WORLD.gemColor},
  };
  const tc=typeColors[p.type]||typeColors.normal;

  ctx.fillStyle=tc.bg; roundRect(ctx,p.x,sy,p.w,p.h,5); ctx.fill();
  ctx.fillStyle=tc.top; ctx.fillRect(p.x+3,sy+1,p.w-6,4);
  ctx.strokeStyle=tc.border; ctx.lineWidth=1.5; roundRect(ctx,p.x,sy,p.w,p.h,5); ctx.stroke();

  // Type indicators
  if(p.type==='bouncy'){ ctx.fillStyle='#4ade80'; ctx.font='8px serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('⬆',p.x+p.w/2,sy+p.h/2); }
  if(p.type==='lava'){ ctx.fillStyle='#f97316'; ctx.globalAlpha=0.4; ctx.fillRect(p.x+2,sy+1,p.w-4,p.h-2); ctx.globalAlpha=1; }
  if(p.type==='neon'){ ctx.strokeStyle=tc.border; ctx.lineWidth=2; ctx.globalAlpha=0.3; roundRect(ctx,p.x+2,sy+2,p.w-4,p.h-4,3); ctx.stroke(); ctx.globalAlpha=1; }
  if(p.type==='moving'){ ctx.fillStyle=WORLD.gemColor; ctx.beginPath(); ctx.arc(p.x+p.w/2,sy+p.h/2,3,0,Math.PI*2); ctx.fill(); }
}

function drawRunnerObstacle(ctx, o, WORLD, world) {
  const t=o.type;
  if(t==='cactus'||t==='bush'){
    ctx.fillStyle=world==='volcano'?'#1a5c1a':'#2d6a4f';
    roundRect(ctx,o.x+o.w*0.3,o.y,o.w*0.4,o.h,5); ctx.fill();
    roundRect(ctx,o.x,o.y+o.h*0.3,o.w*0.35,o.h*0.2,5); ctx.fill();
    roundRect(ctx,o.x+o.w*0.65,o.y+o.h*0.45,o.w*0.35,o.h*0.18,5); ctx.fill();
    // Top bits
    roundRect(ctx,o.x,o.y+o.h*0.02,o.w*0.22,o.h*0.3,5); ctx.fill();
    roundRect(ctx,o.x+o.w*0.78,o.y+o.h*0.15,o.w*0.22,o.h*0.28,5); ctx.fill();
    ctx.fillStyle=t==='bush'?'#40916c':'#52b788';
    roundRect(ctx,o.x+o.w*0.35,o.y+2,o.w*0.12,o.h-4,4); ctx.fill();
  } else if(t==='rock'||t==='lava_rock'||t==='snowball'||t==='skull'){
    const col=t==='lava_rock'?'#7c2d12':t==='snowball'?'#dde8ff':t==='skull'?'#d1d5db':'#4a5568';
    const col2=t==='lava_rock'?'#9a3412':t==='snowball'?'#f0f5ff':t==='skull'?'#e2e8f0':'#718096';
    ctx.fillStyle=col;
    ctx.beginPath(); ctx.ellipse(o.x+o.w/2,o.y+o.h*0.6,o.w*0.5,o.h*0.55,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle=col2;
    ctx.beginPath(); ctx.ellipse(o.x+o.w*0.35,o.y+o.h*0.28,o.w*0.28,o.h*0.25,-0.4,0,Math.PI*2); ctx.fill();
    if(t==='lava_rock'){ ctx.strokeStyle='#f97316'; ctx.lineWidth=1; ctx.globalAlpha=0.4;
      ctx.beginPath(); ctx.moveTo(o.x+o.w*0.3,o.y+o.h*0.5); ctx.lineTo(o.x+o.w*0.7,o.y+o.h*0.3); ctx.stroke(); ctx.globalAlpha=1; }
  } else if(t==='log'){
    ctx.fillStyle='#92400e';
    roundRect(ctx,o.x,o.y,o.w,o.h,o.h*0.3); ctx.fill();
    ctx.fillStyle='#78350f'; ctx.lineWidth=1;
    for(let i=1;i<4;i++) { ctx.beginPath(); ctx.moveTo(o.x+o.w*(i/4),o.y+4); ctx.lineTo(o.x+o.w*(i/4),o.y+o.h-4); ctx.stroke(); }
    ctx.fillStyle='#b45309'; roundRect(ctx,o.x+4,o.y+o.h*0.2,o.w-8,o.h*0.22,3); ctx.fill();
  } else if(t==='barrel'){
    ctx.fillStyle='#5a3010'; roundRect(ctx,o.x,o.y,o.w,o.h,4); ctx.fill();
    ctx.strokeStyle='#92400e'; ctx.lineWidth=2;
    for(const ry of[o.y+o.h*0.2,o.y+o.h*0.5,o.y+o.h*0.8]) { ctx.beginPath(); ctx.moveTo(o.x,ry); ctx.lineTo(o.x+o.w,ry); ctx.stroke(); }
    ctx.strokeStyle='#a06030'; ctx.lineWidth=1; roundRect(ctx,o.x,o.y,o.w,o.h,4); ctx.stroke();
  } else if(t==='ice_block'){
    ctx.fillStyle='#0e1a38'; ctx.strokeStyle='#60a5fa'; ctx.lineWidth=2;
    roundRect(ctx,o.x,o.y,o.w,o.h,4); ctx.fill(); ctx.stroke();
    ctx.fillStyle='rgba(147,197,253,0.15)'; roundRect(ctx,o.x+3,o.y+3,o.w-6,o.h-6,2); ctx.fill();
    ctx.fillStyle='rgba(255,255,255,0.2)'; ctx.fillRect(o.x+5,o.y+5,o.w*0.25,o.h*0.22);
  } else if(t==='sign'){
    ctx.fillStyle='#78350f'; ctx.fillRect(o.x+o.w/2-3,o.y+o.h*0.5,6,o.h*0.5);
    ctx.fillStyle='#92400e'; roundRect(ctx,o.x,o.y,o.w,o.h*0.55,4); ctx.fill();
    ctx.strokeStyle='#5a3010'; ctx.lineWidth=1; roundRect(ctx,o.x,o.y,o.w,o.h*0.55,4); ctx.stroke();
    ctx.fillStyle=WORLD.gemColor; ctx.font=`bold ${o.w*0.3}px serif`; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText('!',o.x+o.w/2,o.y+o.h*0.27);
  } else if(t==='sand'){
    ctx.fillStyle='#92400e'; ctx.beginPath(); ctx.ellipse(o.x+o.w/2,o.y+o.h*0.7,o.w*0.5,o.h*0.5,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#b45309'; ctx.beginPath(); ctx.ellipse(o.x+o.w*0.4,o.y+o.h*0.3,o.w*0.3,o.h*0.3,-0.3,0,Math.PI*2); ctx.fill();
  }
}
