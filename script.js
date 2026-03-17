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

// ── IMAGE PRELOADER ───────────────────────────────────
const IMGS = {};
const WEAPON_KEYS = ['sword','hammer','scythe','spear','bow','shield','dagger','lightning'];

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
    const worldKeys = Object.keys(CAPY_WORLDS);
    ctrl.innerHTML=`
      <div style="margin-bottom:8px">
        <div style="font-family:var(--font-hd);font-size:9px;letter-spacing:2px;color:var(--sub);text-align:center;margin-bottom:6px">SELECT WORLD</div>
        <div style="display:flex;gap:6px;overflow-x:auto;padding-bottom:4px">
          ${worldKeys.map(k=>`<button class="world-pill ${k===capyWorld?'map-active':''}" data-world="${k}" style="flex-shrink:0;background:${k===capyWorld?'var(--accent)':'var(--bg3)'};border:1px solid ${k===capyWorld?'var(--accent)':'var(--border)'};color:${k===capyWorld?'#fff':'var(--sub)'};font-family:var(--font-hd);font-size:10px;letter-spacing:1px;padding:7px 10px;border-radius:20px;cursor:pointer;white-space:nowrap">${CAPY_WORLDS[k].emoji} ${CAPY_WORLDS[k].name}</button>`).join('')}
        </div>
      </div>
      <button class="arc-btn wide" id="capy_jump">🐾 JUMP</button>`;
    document.querySelectorAll('.world-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        capyWorld = btn.dataset.world;
        localStorage.setItem('capyWorld', capyWorld);
        document.querySelectorAll('.world-pill').forEach(b => {
          const active = b.dataset.world === capyWorld;
          b.style.background = active ? 'var(--accent)' : 'var(--bg3)';
          b.style.borderColor = active ? 'var(--accent)' : 'var(--border)';
          b.style.color = active ? '#fff' : 'var(--sub)';
        });
      });
    });
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


// ══════════════════════════════════════════════════════════════════
//  ⚔️  BALL BATTLE  –  Earclacks-style weapon ball simulator
//  • Шарики прыгают с физикой гравитации и отскоков
//  • Оружие крутится вокруг шарика и наносит урон при касании
//  • Выбор оружия → бой волнами → апгрейды
// ══════════════════════════════════════════════════════════════════

const BB = {};

BB.WEAPONS = {
  sword:     { name:'SWORD',     color:'#e53e3e', hp:100, spd:4.0, dmg:12, reach:38, spinSpd:2.8,  special:'parry',      desc:'Parries on clash',    w:38, h:8  },
  hammer:    { name:'HAMMER',    color:'#f97316', hp:130, spd:3.2, dmg:22, reach:30, spinSpd:1.8,  special:'knockback',  desc:'Ignores parry',       w:30, h:14 },
  scythe:    { name:'SCYTHE',    color:'#a855f7', hp:90,  spd:4.2, dmg:14, reach:42, spinSpd:3.2,  special:'lifesteal',  desc:'Steals HP on hit',    w:42, h:10 },
  spear:     { name:'SPEAR',     color:'#3b82f6', hp:100, spd:3.8, dmg:13, reach:50, spinSpd:2.4,  special:'pierce',     desc:'Long reach',          w:50, h:6  },
  bow:       { name:'BOW',       color:'#22c55e', hp:80,  spd:4.5, dmg:10, reach:28, spinSpd:2.6,  special:'ranged',     desc:'Shoots arrows',       w:28, h:18 },
  shield:    { name:'SHIELD',    color:'#06b6d4', hp:160, spd:2.8, dmg:8,  reach:26, spinSpd:2.0,  special:'block',      desc:'Blocks attacks',      w:26, h:26 },
  dagger:    { name:'DAGGER',    color:'#94a3b8', hp:80,  spd:5.2, dmg:9,  reach:24, spinSpd:4.5,  special:'fast',       desc:'Very fast',           w:24, h:7  },
  lightning: { name:'LIGHTNING', color:'#fbbf24', hp:90,  spd:4.0, dmg:16, reach:34, spinSpd:3.0,  special:'chain',      desc:'Chains on hit',       w:34, h:10 },
};

BB.UPGRADES = [
  { id:'dmg',   name:'POWER UP',   emoji:'💪', desc:'+30% damage',     apply: b => b.dmg   *= 1.3  },
  { id:'spd',   name:'SPEED UP',   emoji:'⚡', desc:'+20% speed',      apply: b => { b.spd *= 1.2; b.spinSpd *= 1.2; } },
  { id:'hp',    name:'HEAL',       emoji:'❤️', desc:'Restore 50 HP',   apply: b => b.hp = Math.min(b.maxHp, b.hp + 50) },
  { id:'big',   name:'GROW',       emoji:'🔮', desc:'+25% size + dmg', apply: b => { b.r *= 1.25; b.dmg *= 1.1; } },
  { id:'armor', name:'ARMOR',      emoji:'🛡', desc:'-35% damage taken',apply: b => b.armor = Math.min(0.65, (b.armor||0)+0.35) },
  { id:'regen', name:'REGEN',      emoji:'💚', desc:'+2 HP/sec',        apply: b => b.regen = (b.regen||0)+2 },
  { id:'reach', name:'LONG REACH', emoji:'🗡', desc:'+12 weapon reach', apply: b => b.reach += 12 },
  { id:'clone', name:'TWIN BALL',  emoji:'👥', desc:'Spawn ally ball',  apply: null },
];

BB.MAPS = {
  dungeon: { name:'DUNGEON',  emoji:'🏰', bg:'#0d0d15', grid:'#16152a', border:'#7c6fff', glow:'rgba(124,111,255,0.25)', floor:'#12101e' },
  volcano: { name:'VOLCANO',  emoji:'🌋', bg:'#150500', grid:'#241000', border:'#f97316', glow:'rgba(249,115,22,0.25)',  floor:'#1a0800' },
  ice:     { name:'ICE CAVE', emoji:'❄️', bg:'#06090f', grid:'#0c1220', border:'#60a5fa', glow:'rgba(96,165,250,0.25)', floor:'#0a1025' },
  jungle:  { name:'JUNGLE',   emoji:'🌿', bg:'#060e06', grid:'#0b1a0b', border:'#4ade80', glow:'rgba(74,222,128,0.25)', floor:'#081208' },
  space:   { name:'SPACE',    emoji:'🚀', bg:'#030308', grid:'#080815', border:'#e879f9', glow:'rgba(232,121,249,0.25)',floor:'#06060e' },
};

// Runtime state
BB.state = {
  phase: 'select', // select | fight | upgrade | result
  playerWeapon: 'sword',
  currentMap: localStorage.getItem('bbMap') || 'dungeon',
  wave: 1,
  roundWins: [0, 0],
  balls: [],
  projectiles: [],
  particles: [],
  upgradeOptions: [],
  raf: null,
  fightTimer: 0,
  shake: 0,
  selectHover: null,
};

// ── OPEN ─────────────────────────────────────────────────────────
function openBallBattle() {
  stopArcade();
  BB.state.phase = 'select';
  BB.state.wave = 1;
  BB.state.roundWins = [0,0];
  BB.state.balls = [];
  BB.state.projectiles = [];
  BB.state.particles = [];
  setupCanvas();
  bbBuildControls();
  bbLoop();
}

function bbBuildControls() {
  const ctrl = id('arcadeControls');
  const mapKeys = Object.keys(BB.MAPS);
  ctrl.innerHTML = `
    <div style="margin-bottom:8px">
      <div style="font-family:var(--font-hd);font-size:9px;letter-spacing:2px;color:var(--sub);text-align:center;margin-bottom:6px">ARENA</div>
      <div style="display:flex;gap:6px;overflow-x:auto;padding-bottom:2px;scrollbar-width:none">
        ${mapKeys.map(k=>`<button class="bb-map-btn" data-map="${k}" style="flex-shrink:0;font-family:var(--font-hd);font-size:9px;letter-spacing:1px;padding:6px 11px;border-radius:16px;cursor:pointer;white-space:nowrap;border:1.5px solid ${k===BB.state.currentMap?BB.MAPS[k].border:'var(--border)'};background:${k===BB.state.currentMap?BB.MAPS[k].border+'33':'var(--bg3)'};color:${k===BB.state.currentMap?'#fff':'var(--sub)'}">${BB.MAPS[k].emoji} ${BB.MAPS[k].name}</button>`).join('')}
      </div>
    </div>
    <button class="start-btn" id="bbFightBtn" style="max-width:300px;margin:0 auto;display:block">⚔️ FIGHT!</button>`;

  ctrl.querySelectorAll('.bb-map-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      BB.state.currentMap = btn.dataset.map;
      localStorage.setItem('bbMap', BB.state.currentMap);
      bbBuildControls();
    });
  });
  id('bbFightBtn').addEventListener('click', () => {
    BB.state.phase = 'fight';
    bbStartWave();
    id('arcadeControls').innerHTML = '';
  });
}

// ── BALL FACTORY ─────────────────────────────────────────────────
function bbMakeBall(side, weaponKey, isPlayer) {
  const W = canvas.width, H = canvas.height;
  const wep = BB.WEAPONS[weaponKey];
  const ARENA = bbGetArena();
  return {
    x: side === 'left' ? ARENA.x + ARENA.w * 0.22 : ARENA.x + ARENA.w * 0.78,
    y: ARENA.y + ARENA.h * 0.45,
    vx: side === 'left' ? wep.spd * 0.4 : -wep.spd * 0.4,
    vy: -wep.spd * 1.4,
    r: 22,
    hp: wep.hp,
    maxHp: wep.hp,
    dmg: wep.dmg,
    spd: wep.spd,
    spinSpd: wep.spinSpd,
    reach: wep.reach,
    armor: 0,
    regen: 0,
    color: side === 'left' ? '#ff6b9d' : '#6bdbff',
    weaponKey,
    side,
    isPlayer,
    angle: side === 'left' ? 0 : Math.PI,   // weapon angle
    hitTimer: 0,
    parryTimer: 0,
    arrowTimer: 0,
    alive: true,
    trail: [],
  };
}

function bbGetArena() {
  const W = canvas.width, H = canvas.height;
  const pad = 14;
  const aH = H * 0.62;
  const aW = W - pad * 2;
  return { x: pad, y: pad + H * 0.06, w: aW, h: aH };
}

// ── WAVE START ────────────────────────────────────────────────────
function bbStartWave() {
  const playerWep = BB.state.playerWeapon;
  const enemyKeys = Object.keys(BB.WEAPONS).filter(k=>k!==playerWep);
  const enemyWep = enemyKeys[Math.floor(Math.random()*enemyKeys.length)];

  const player = bbMakeBall('left', playerWep, true);
  const enemy  = bbMakeBall('right', enemyWep, false);

  // Scale enemy per wave
  enemy.hp    = Math.round(BB.WEAPONS[enemyWep].hp * (1 + (BB.state.wave-1) * 0.2));
  enemy.maxHp = enemy.hp;
  enemy.dmg   *= (1 + (BB.state.wave-1) * 0.12);
  enemy.spd   *= (1 + (BB.state.wave-1) * 0.05);

  BB.state.balls = [player, enemy];
  BB.state.projectiles = [];
  BB.state.fightTimer = 0;
}

// ── PHYSICS ───────────────────────────────────────────────────────
const BB_GRAVITY  = 0.38;
const BB_BOUNCE   = 0.68;
const BB_FRICTION = 0.994;

function bbPhysics() {
  const A = bbGetArena();
  const dt = BB.state.phase === 'fight' ? (BB.state.shake > 0 ? 0.4 : 1) : 0;
  if (!dt) return;
  BB.state.fightTimer++;
  if (BB.state.shake > 0) BB.state.shake--;

  for (const b of BB.state.balls) {
    if (!b.alive) continue;

    // Regen
    if (b.regen > 0 && BB.state.fightTimer % 60 === 0) b.hp = Math.min(b.maxHp, b.hp + b.regen);

    // Rotate weapon
    b.angle += b.spinSpd * 0.055 * (b.side==='left' ? 1 : -1);

    // Gravity
    b.vy += BB_GRAVITY;
    b.x  += b.vx * BB_FRICTION;
    b.y  += b.vy;

    // Trail
    b.trail.push({x:b.x, y:b.y});
    if (b.trail.length > 8) b.trail.shift();

    // Floor
    if (b.y + b.r > A.y + A.h) {
      b.y = A.y + A.h - b.r;
      b.vy *= -BB_BOUNCE;
      b.vx *= 0.82;
    }
    // Ceiling
    if (b.y - b.r < A.y) { b.y = A.y + b.r; b.vy = Math.abs(b.vy) * 0.5; }
    // Walls
    if (b.x - b.r < A.x) { b.x = A.x + b.r; b.vx = Math.abs(b.vx) * BB_BOUNCE; }
    if (b.x + b.r > A.x + A.w) { b.x = A.x + A.w - b.r; b.vx = -Math.abs(b.vx) * BB_BOUNCE; }

    // Timers
    if (b.hitTimer > 0) b.hitTimer--;
    if (b.parryTimer > 0) b.parryTimer--;
    if (b.arrowTimer > 0) b.arrowTimer--;

    // AI: seek enemy, jump
    const enemy = BB.state.balls.find(o => o !== b && o.alive);
    if (enemy) {
      const dx = enemy.x - b.x;
      const onFloor = b.y + b.r >= A.y + A.h - 2;

      // Seek horizontally
      b.vx += Math.sign(dx) * 0.28;
      const maxV = b.spd * 1.6;
      if (Math.abs(b.vx) > maxV) b.vx = Math.sign(b.vx) * maxV;

      // Jump when on floor and enemy is far or above
      if (onFloor && (Math.abs(dx) > b.r * 2 || enemy.y < b.y - 30)) {
        if (Math.random() < 0.06) b.vy = -b.spd * 1.5;
      }

      // Arrow shot
      if (b.weaponKey === 'bow' && b.arrowTimer <= 0 && Math.abs(dx) > b.r * 3) {
        const dist = Math.hypot(dx, enemy.y - b.y);
        const spd2 = b.spd * 2.2;
        BB.state.projectiles.push({
          x: b.x, y: b.y,
          vx: (dx/dist) * spd2,
          vy: ((enemy.y - b.y)/dist) * spd2 - 1.5,
          r: 5, dmg: b.dmg * 0.7,
          owner: b.side,
          color: b.color,
          life: 1, type:'arrow'
        });
        b.arrowTimer = 55;
      }
    }
  }

  // Ball vs ball collision + weapon hit
  const [b1, b2] = BB.state.balls.filter(b => b.alive);
  if (b1 && b2) {
    const dx = b2.x - b1.x, dy = b2.y - b1.y;
    const dist = Math.hypot(dx, dy);

    // Body collision
    if (dist < b1.r + b2.r && dist > 0.1) {
      const nx = dx/dist, ny = dy/dist;
      const overlap = (b1.r + b2.r - dist) / 2;
      b1.x -= nx * overlap; b1.y -= ny * overlap;
      b2.x += nx * overlap; b2.y += ny * overlap;
      const dot = (b1.vx - b2.vx)*nx + (b1.vy - b2.vy)*ny;
      if (dot > 0) {
        const imp = dot * 1.25;
        b1.vx -= nx*imp; b1.vy -= ny*imp;
        b2.vx += nx*imp; b2.vy += ny*imp;
        BB.state.shake = 8;
        bbBurst(b1.x + nx*b1.r, b1.y + ny*b1.r, '#ffffff', 8);
      }
    }

    // Weapon tip hit detection
    for (const attacker of [b1, b2]) {
      if (!attacker.alive) continue;
      const defender = attacker === b1 ? b2 : b1;
      if (!defender.alive) continue;

      // Weapon tip world position
      const tipAngle = attacker.angle;
      const tipDist  = attacker.r + attacker.reach;
      const tipX = attacker.x + Math.cos(tipAngle) * tipDist;
      const tipY = attacker.y + Math.sin(tipAngle) * tipDist;
      const tipToDef = Math.hypot(tipX - defender.x, tipY - defender.y);

      if (tipToDef < defender.r + 6 && attacker.hitTimer <= 0) {
        let dmg = attacker.dmg * (1 - (defender.armor || 0));

        // Parry
        if (defender.weaponKey === 'sword' && attacker.weaponKey !== 'hammer') {
          const defTipX = defender.x + Math.cos(defender.angle) * (defender.r + defender.reach);
          const defTipY = defender.y + Math.sin(defender.angle) * (defender.r + defender.reach);
          if (Math.hypot(defTipX - tipX, defTipY - tipY) < 18) {
            // Parried! Bounce attacker back
            const bx2 = attacker.x - defender.x, by2 = attacker.y - defender.y;
            const bl = Math.hypot(bx2,by2)||1;
            attacker.vx += (bx2/bl)*6; attacker.vy += (by2/bl)*4;
            defender.parryTimer = 20;
            bbBurst(tipX, tipY, '#fef08a', 10);
            bbSpark(tipX, tipY);
            attacker.hitTimer = 20;
            continue;
          }
        }

        // Block
        if (defender.weaponKey === 'shield' && Math.random() < 0.45) {
          bbBurst(tipX, tipY, defender.color, 6);
          attacker.hitTimer = 20;
          continue;
        }

        // Apply damage
        defender.hp -= dmg;
        defender.hp = Math.max(0, defender.hp);
        attacker.hitTimer = 18;
        BB.state.shake = 12;

        // Knockback
        const kdx = defender.x - attacker.x, kdy = defender.y - attacker.y;
        const kl = Math.hypot(kdx,kdy)||1;
        defender.vx += (kdx/kl) * 4.5;
        defender.vy += (kdy/kl) * 3 - 1.5;

        // Specials
        if (attacker.weaponKey === 'hammer') { defender.vx += (kdx/kl)*6; defender.vy -= 4; }
        if (attacker.weaponKey === 'scythe') { attacker.hp = Math.min(attacker.maxHp, attacker.hp + dmg * 0.4); }
        if (attacker.weaponKey === 'lightning') bbChainLightning(attacker, defender);

        bbBurst(tipX, tipY, attacker.color, 12);
        bbSpark(tipX, tipY);
      }
    }
  }

  // Projectiles
  for (let i = BB.state.projectiles.length-1; i >= 0; i--) {
    const p = BB.state.projectiles[i];
    p.x += p.vx; p.y += p.vy; p.vy += 0.2; p.life -= 0.007;
    const A2 = bbGetArena();
    if (p.x < A2.x || p.x > A2.x+A2.w || p.y > A2.y+A2.h || p.life <= 0) {
      BB.state.projectiles.splice(i, 1); continue;
    }
    for (const b of BB.state.balls) {
      if (!b.alive || b.side === p.owner) continue;
      if (Math.hypot(p.x-b.x, p.y-b.y) < b.r + p.r) {
        b.hp -= p.dmg * (1-(b.armor||0));
        b.hp = Math.max(0, b.hp);
        bbBurst(p.x, p.y, p.color, 7);
        BB.state.projectiles.splice(i, 1);
        break;
      }
    }
  }

  // Particles
  for (let i = BB.state.particles.length-1; i >= 0; i--) {
    const p = BB.state.particles[i];
    p.x += p.vx; p.y += p.vy; p.vy += 0.15; p.vx *= 0.94; p.life -= p.decay;
    if (p.life <= 0) { BB.state.particles.splice(i,1); continue; }
  }

  // Check deaths
  for (const b of BB.state.balls) {
    if (b.alive && b.hp <= 0) {
      b.alive = false; b.hp = 0;
      bbBurst(b.x, b.y, b.color, 30);
      BB.state.shake = 20;
      setTimeout(() => bbCheckWaveEnd(), 600);
    }
  }
}

function bbChainLightning(attacker, defender) {
  // Visual chain between balls
  for (let i = 0; i < 6; i++) {
    BB.state.particles.push({
      x: attacker.x + (defender.x - attacker.x) * (i/5) + rnd(-8,8),
      y: attacker.y + (defender.y - attacker.y) * (i/5) + rnd(-8,8),
      vx: rnd(-1,1), vy: rnd(-1,1), r: rnd(2,5),
      color: '#fbbf24', life: 0.8, decay: 0.08
    });
  }
}

function bbCheckWaveEnd() {
  const playerAlive = BB.state.balls.find(b => b.side === 'left'  && b.alive);
  const enemyAlive  = BB.state.balls.find(b => b.side === 'right' && b.alive);

  if (!playerAlive) {
    BB.state.roundWins[1]++;
    if (BB.state.roundWins[1] >= 3) { BB.state.phase = 'result'; BB.state.resultWin = false; }
    else bbShowUpgrade(false);
  } else if (!enemyAlive) {
    BB.state.roundWins[0]++;
    arcadeScore = BB.state.wave * 100;
    updateArcadeScore();
    if (BB.state.roundWins[0] >= 3) { BB.state.phase = 'result'; BB.state.resultWin = true; }
    else bbShowUpgrade(true);
  }
}

function bbShowUpgrade(won) {
  BB.state.phase = 'upgrade';
  const pool = [...BB.UPGRADES].sort(() => Math.random()-0.5).slice(0, 3);
  BB.state.upgradeOptions = pool;
  BB.state.wave++;

  const ctrl = id('arcadeControls');
  ctrl.innerHTML = `
    <div style="font-family:var(--font-hd);font-size:10px;letter-spacing:2px;color:var(--accent);text-align:center;margin-bottom:10px">WAVE CLEAR! CHOOSE UPGRADE</div>
    ${pool.map((u,i) => `
      <button id="bbUpg${i}" style="width:100%;margin-bottom:8px;background:var(--bg2);border:1.5px solid var(--border);color:var(--text);font-family:var(--font);font-size:14px;padding:14px 16px;border-radius:12px;cursor:pointer;text-align:left;display:flex;align-items:center;gap:12px">
        <span style="font-size:22px">${u.emoji}</span>
        <span><strong style="font-family:var(--font-hd);font-size:11px;letter-spacing:1px;color:var(--accent)">${u.name}</strong><br><span style="color:var(--sub);font-size:12px">${u.desc}</span></span>
      </button>`).join('')}`;

  pool.forEach((u, i) => {
    id('bbUpg' + i).addEventListener('click', () => {
      // Apply to all player balls
      const playerBalls = BB.state.balls.filter(b => b.side === 'left');
      if (u.apply) { playerBalls.forEach(b => u.apply(b)); }
      else if (u.id === 'clone') {
        const src = playerBalls[0];
        if (src) {
          const clone = {...src, x: src.x - 20, y: src.y - 30, hp: src.maxHp * 0.6, maxHp: src.maxHp * 0.6, vx: rnd(-2,2), vy: -4, trail:[], hitTimer:0 };
          BB.state.balls.push(clone);
        }
      }
      ctrl.innerHTML = '';
      BB.state.phase = 'fight';
      bbStartWave();
    });
    id('bbUpg' + i).addEventListener('mouseover', function(){ this.style.borderColor='var(--accent)'; });
    id('bbUpg' + i).addEventListener('mouseout',  function(){ this.style.borderColor='var(--border)'; });
  });
}

// ── DRAW ─────────────────────────────────────────────────────────
function bbDraw() {
  const W = canvas.width, H = canvas.height;
  const A = bbGetArena();
  const MAP = BB.MAPS[BB.state.currentMap];

  ctx.save();
  // Screen shake
  if (BB.state.shake > 0) {
    ctx.translate(rnd(-BB.state.shake*0.4, BB.state.shake*0.4), rnd(-BB.state.shake*0.3, BB.state.shake*0.3));
  }

  // ── Background ──
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);

  // ── Arena floor ──
  ctx.fillStyle = MAP.floor;
  roundRect(ctx, A.x, A.y, A.w, A.h, 10); ctx.fill();

  // Grid lines
  ctx.strokeStyle = MAP.grid; ctx.lineWidth = 1;
  for (let gx = A.x + 28; gx < A.x+A.w; gx += 28) {
    ctx.globalAlpha = 0.5;
    ctx.beginPath(); ctx.moveTo(gx, A.y); ctx.lineTo(gx, A.y+A.h); ctx.stroke();
  }
  for (let gy = A.y + 28; gy < A.y+A.h; gy += 28) {
    ctx.beginPath(); ctx.moveTo(A.x, gy); ctx.lineTo(A.x+A.w, gy); ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Center line
  ctx.strokeStyle = MAP.border; ctx.lineWidth = 1; ctx.globalAlpha = 0.2;
  ctx.setLineDash([6,6]);
  ctx.beginPath(); ctx.moveTo(A.x+A.w/2, A.y); ctx.lineTo(A.x+A.w/2, A.y+A.h); ctx.stroke();
  ctx.setLineDash([]); ctx.globalAlpha = 1;

  // ── Arena border glow ──
  ctx.strokeStyle = MAP.border; ctx.lineWidth = 3;
  roundRect(ctx, A.x, A.y, A.w, A.h, 10); ctx.stroke();
  ctx.strokeStyle = MAP.glow; ctx.lineWidth = 14;
  roundRect(ctx, A.x-2, A.y-2, A.w+4, A.h+4, 12); ctx.stroke();

  // ── Particles ──
  for (const p of BB.state.particles) {
    ctx.globalAlpha = p.life * 0.85;
    ctx.fillStyle = p.color;
    ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(0.5, p.r * p.life), 0, Math.PI*2); ctx.fill();
  }
  ctx.globalAlpha = 1;

  // ── Projectiles (arrows) ──
  for (const p of BB.state.projectiles) {
    ctx.save(); ctx.globalAlpha = p.life;
    ctx.translate(p.x, p.y);
    ctx.rotate(Math.atan2(p.vy, p.vx));
    ctx.fillStyle = '#c09050'; ctx.strokeStyle = p.color; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-8, -2); ctx.lineTo(8, 0); ctx.lineTo(-8, 2); ctx.closePath();
    ctx.fill(); ctx.stroke();
    // Fletching
    ctx.fillStyle = '#e04040';
    ctx.beginPath(); ctx.moveTo(-8,0); ctx.lineTo(-12,-4); ctx.lineTo(-8,0); ctx.lineTo(-12,4); ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  // ── Balls ──
  for (const b of BB.state.balls) {
    if (!b.alive && b.hp <= 0) continue;

    ctx.save();

    // Trail
    if (b.trail.length > 1) {
      for (let i = 1; i < b.trail.length; i++) {
        ctx.globalAlpha = (i / b.trail.length) * 0.18;
        ctx.fillStyle = b.color;
        ctx.beginPath(); ctx.arc(b.trail[i].x, b.trail[i].y, b.r * (i/b.trail.length) * 0.6, 0, Math.PI*2); ctx.fill();
      }
    }
    ctx.globalAlpha = 1;

    // Floor shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath(); ctx.ellipse(b.x, A.y + A.h, b.r * 0.75, 5, 0, 0, Math.PI*2); ctx.fill();

    // Hit flash
    if (b.hitTimer > 0 && Math.floor(b.hitTimer/3)%2 === 0) ctx.globalAlpha = 0.35;

    // ── Weapon (orbiting PNG) ──
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.rotate(b.angle);

    const orbitDist = b.r * 1.05 + b.reach * 0.08;
    const wSize = Math.max(28, b.reach * 0.95);

    // Glow trail behind weapon tip
    ctx.fillStyle = b.color;
    ctx.globalAlpha = 0.22;
    ctx.beginPath();
    ctx.arc(orbitDist + wSize * 0.5, 0, wSize * 0.28, 0, Math.PI*2);
    ctx.fill();
    ctx.globalAlpha = b.hitTimer > 0 && Math.floor(b.hitTimer/3)%2===0 ? 0.35 : 1;

    // Draw weapon PNG
    const wImg = IMGS['weapon_' + b.weaponKey];
    if (wImg && wImg.complete && wImg.naturalWidth > 0) {
      ctx.save();
      ctx.translate(orbitDist + wSize * 0.5, 0);
      // Handle toward ball, tip pointing outward
      ctx.rotate(Math.PI * 0.5);
      ctx.drawImage(wImg, -wSize/2, -wSize/2, wSize, wSize);
      ctx.restore();
    } else {
      // Fallback colored bar
      ctx.fillStyle = BB.WEAPONS[b.weaponKey].color;
      ctx.fillRect(orbitDist, -4, wSize, 8);
    }
    ctx.restore();
    ctx.globalAlpha = 1;

    // ── Ball body ──
    // Outer glow when parrying
    if (b.parryTimer > 0) {
      ctx.strokeStyle = '#fef08a'; ctx.lineWidth = 4;
      ctx.globalAlpha = b.parryTimer / 20;
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r + 7, 0, Math.PI*2); ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // Body gradient
    const grd = ctx.createRadialGradient(
      b.x - b.r * 0.38, b.y - b.r * 0.38, b.r * 0.06,
      b.x, b.y, b.r
    );
    grd.addColorStop(0, '#ffffffd0');
    grd.addColorStop(0.28, b.color);
    grd.addColorStop(1, b.color + '55');
    ctx.fillStyle = grd;
    ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI*2); ctx.fill();

    // Shine
    ctx.fillStyle = 'rgba(255,255,255,0.22)';
    ctx.beginPath(); ctx.ellipse(b.x - b.r*0.28, b.y - b.r*0.28, b.r*0.38, b.r*0.24, -0.5, 0, Math.PI*2); ctx.fill();

    // Dead X
    if (!b.alive) {
      ctx.strokeStyle = '#ff4444'; ctx.lineWidth = 3;
      const d = b.r * 0.5;
      ctx.beginPath(); ctx.moveTo(b.x-d, b.y-d); ctx.lineTo(b.x+d, b.y+d); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(b.x+d, b.y-d); ctx.lineTo(b.x-d, b.y+d); ctx.stroke();
    }

    ctx.restore();
  }

  // ── HP BARS ──────────────────────────────────────────────────────
  const barH = 14, barW = A.w * 0.42;
  const barY = A.y + A.h + 14;

  for (let i = 0; i < BB.state.balls.length; i++) {
    const b = BB.state.balls[i];
    if (!b || (b.side !== 'left' && i > 0) && (b.side !== 'right' && i > 1)) continue;
    if (b.side !== (i === 0 ? 'left' : 'right')) continue;

    const bx = b.side === 'left' ? A.x : A.x + A.w - barW;
    const ratio = Math.max(0, b.hp / b.maxHp);

    // Track
    ctx.fillStyle = C.bg3;
    roundRect(ctx, bx, barY, barW, barH, 6); ctx.fill();

    // Fill
    if (ratio > 0) {
      ctx.fillStyle = ratio > 0.55 ? '#4ade80' : ratio > 0.28 ? '#facc15' : '#f87171';
      roundRect(ctx, bx, barY, barW * ratio, barH, 6); ctx.fill();
    }
    ctx.strokeStyle = C.border; ctx.lineWidth = 1;
    roundRect(ctx, bx, barY, barW, barH, 6); ctx.stroke();

    // Name label
    ctx.fillStyle = b.color;
    ctx.font = `bold ${W*0.026}px 'Orbitron', monospace`;
    ctx.textBaseline = 'bottom';
    ctx.textAlign = b.side === 'left' ? 'left' : 'right';
    ctx.fillText(
      (b.isPlayer ? 'YOU · ' : 'ENEMY · ') + BB.WEAPONS[b.weaponKey].name.toUpperCase(),
      b.side === 'left' ? bx : bx + barW,
      barY - 3
    );

    // HP number
    ctx.fillStyle = C.sub;
    ctx.font = `${W*0.022}px 'DM Sans', sans-serif`;
    ctx.textAlign = b.side === 'left' ? 'right' : 'left';
    ctx.fillText(`${Math.ceil(b.hp)}/${b.maxHp}`, b.side==='left' ? bx+barW : bx, barY - 3);
  }

  // ── Round win dots ──
  const dotY = A.y - 20;
  for (let p = 0; p < 2; p++) {
    const baseX = p === 0 ? A.x + 16 : A.x + A.w - 16 - 44;
    for (let w2 = 0; w2 < 3; w2++) {
      const filled = w2 < BB.state.roundWins[p];
      ctx.fillStyle = filled ? (p===0 ? '#ff6b9d' : '#6bdbff') : C.bg3;
      ctx.strokeStyle = p===0 ? '#ff6b9d' : '#6bdbff'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(baseX + w2 * 18, dotY, 6, 0, Math.PI*2); ctx.fill(); ctx.stroke();
    }
  }

  // Wave label
  ctx.fillStyle = C.sub; ctx.font = `bold ${W*0.03}px 'Orbitron', monospace`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(`WAVE ${BB.state.wave}`, A.x + A.w/2, A.y - 20);

  ctx.restore();

  // ── SELECT SCREEN ──
  if (BB.state.phase === 'select') bbDrawSelect();

  // ── UPGRADE SCREEN ──
  if (BB.state.phase === 'upgrade') bbDrawUpgrade();

  // ── RESULT SCREEN ──
  if (BB.state.phase === 'result') bbDrawResult();
}

// ── SELECT SCREEN ──────────────────────────────────────────────────
function bbDrawSelect() {
  const W = canvas.width, H = canvas.height;
  const A = bbGetArena();

  // Dim arena
  ctx.fillStyle = 'rgba(0,0,0,0.72)';
  roundRect(ctx, A.x, A.y, A.w, A.h, 10); ctx.fill();

  // Title
  ctx.fillStyle = C.accent;
  ctx.font = `bold ${W*0.052}px 'Orbitron', monospace`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  ctx.fillText('PICK WEAPON', W/2, A.y + 12);

  ctx.fillStyle = C.sub;
  ctx.font = `${W*0.026}px 'Orbitron', monospace`;
  ctx.fillText('TAP ONCE TO SELECT · TWICE TO FIGHT', W/2, A.y + 12 + W*0.065);

  // 4×2 grid
  const cols = 4;
  const pad2 = 10;
  const cellW = (A.w - pad2*(cols+1)) / cols;
  const cellH = cellW * 0.9;
  const startY = A.y + 12 + W*0.11;

  Object.entries(BB.WEAPONS).forEach(([key, wep], i) => {
    const col = i % cols, row = Math.floor(i / cols);
    const cx = A.x + pad2 + col*(cellW+pad2);
    const cy = startY + row*(cellH+8);
    const sel = BB.state.playerWeapon === key;
    const hov = BB.state.selectHover === key;

    // Card background
    ctx.fillStyle = sel ? wep.color + '28' : hov ? '#ffffff0d' : C.bg2 + 'ee';
    ctx.strokeStyle = sel ? wep.color : hov ? '#ffffff30' : C.border;
    ctx.lineWidth = sel ? 2.5 : 1.5;
    roundRect(ctx, cx, cy, cellW, cellH, 10); ctx.fill(); ctx.stroke();

    // Weapon PNG icon
    const wImg = IMGS['weapon_' + key];
    const iconSize = cellH * 0.44;
    const iconCX = cx + cellW/2;
    const iconCY = cy + cellH * 0.36;
    if (wImg && wImg.complete && wImg.naturalWidth > 0) {
      ctx.drawImage(wImg, iconCX - iconSize/2, iconCY - iconSize/2, iconSize, iconSize);
    } else {
      ctx.fillStyle = wep.color + 'aa';
      ctx.beginPath(); ctx.arc(iconCX, iconCY, iconSize*0.35, 0, Math.PI*2); ctx.fill();
    }

    // Name
    ctx.fillStyle = sel ? wep.color : C.text;
    ctx.font = `bold ${cellW*0.105}px 'Orbitron', monospace`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(wep.name, cx+cellW/2, cy+cellH*0.76);

    // Desc
    ctx.fillStyle = sel ? wep.color + 'bb' : C.sub;
    ctx.font = `${cellW*0.083}px 'DM Sans', sans-serif`;
    ctx.fillText(wep.desc, cx+cellW/2, cy+cellH*0.9);
  });

  // Stats panel for selected weapon
  const sw = BB.WEAPONS[BB.state.playerWeapon];
  const panY = startY + 2*(cellH+8) + 8;
  const panH = A.y + A.h - panY - 8;
  if (panH > 50) {
    ctx.fillStyle = C.bg2 + 'ee'; ctx.strokeStyle = sw.color; ctx.lineWidth = 1.5;
    roundRect(ctx, A.x+pad2, panY, A.w-pad2*2, panH, 10); ctx.fill(); ctx.stroke();

    // Weapon icon large
    const bigImg = IMGS['weapon_' + BB.state.playerWeapon];
    const bigSize = Math.min(panH * 0.65, 56);
    if (bigImg && bigImg.complete && bigImg.naturalWidth > 0) {
      ctx.drawImage(bigImg, A.x+pad2+12, panY + (panH-bigSize)/2, bigSize, bigSize);
    }

    // Stats
    const sx = A.x + pad2 + bigSize + 22;
    ctx.fillStyle = sw.color;
    ctx.font = `bold ${W*0.038}px 'Orbitron', monospace`;
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText(sw.name, sx, panY + panH*0.12);

    ctx.fillStyle = C.sub;
    ctx.font = `${W*0.026}px 'DM Sans', sans-serif`;
    ctx.fillText(`HP ${sw.hp}  ·  DMG ${sw.dmg}  ·  SPD ${sw.spd.toFixed(1)}`, sx, panY + panH*0.45);
    ctx.fillText(`✦ ${sw.desc.toUpperCase()}`, sx, panY + panH*0.7);
  }
}

// ── UPGRADE SCREEN ────────────────────────────────────────────────
function bbDrawUpgrade() {
  const W = canvas.width, H = canvas.height;
  const A = bbGetArena();
  ctx.fillStyle = 'rgba(0,0,0,0.78)';
  roundRect(ctx, A.x, A.y, A.w, A.h, 10); ctx.fill();

  ctx.fillStyle = C.accent;
  ctx.font = `bold ${W*0.048}px 'Orbitron', monospace`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  ctx.fillText(`WAVE ${BB.state.wave-1} CLEAR!`, W/2, A.y + 14);
  ctx.fillStyle = C.sub;
  ctx.font = `${W*0.028}px 'Orbitron', monospace`;
  ctx.fillText('SELECT UPGRADE BELOW', W/2, A.y + 14 + W*0.065);
}

// ── RESULT SCREEN ─────────────────────────────────────────────────
function bbDrawResult() {
  const W = canvas.width, H = canvas.height;
  const A = bbGetArena();
  ctx.fillStyle = 'rgba(0,0,0,0.85)';
  roundRect(ctx, A.x, A.y, A.w, A.h, 10); ctx.fill();

  const win = BB.state.resultWin;
  ctx.fillStyle = win ? C.accent : '#f87171';
  ctx.font = `bold ${W*0.072}px 'Orbitron', monospace`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(win ? 'VICTORY!' : 'DEFEAT!', W/2, A.y + A.h*0.38);

  ctx.fillStyle = C.sub;
  ctx.font = `${W*0.032}px 'Orbitron', monospace`;
  ctx.fillText(`SCORE: ${arcadeScore}  ·  WAVE: ${BB.state.wave}`, W/2, A.y + A.h*0.58);

  // Build buttons if not already present
  const ctrl = id('arcadeControls');
  if (!ctrl.querySelector('#bbRetry')) {
    ctrl.innerHTML = `
      <button class="start-btn" id="bbRetry" style="max-width:280px;margin:0 auto;display:block">↺ RETRY</button>
      <button class="ctrl-btn" id="bbMenu" style="width:100%;max-width:280px;margin:8px auto;display:block">← MENU</button>`;
    id('bbRetry').addEventListener('click', () => { ctrl.innerHTML=''; openBallBattle(); });
    id('bbMenu').addEventListener('click', () => { stopArcade(); hide(arcadeScreen); show(hub); });
  }
}

// ── SPARK FX ──────────────────────────────────────────────────────
function bbBurst(x, y, color, n) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI*2;
    const spd = rnd(1.5, 7);
    BB.state.particles.push({ x, y, vx: Math.cos(a)*spd, vy: Math.sin(a)*spd, r: rnd(2,6), color, life:1, decay: rnd(0.03,0.06) });
  }
}
function bbSpark(x, y) {
  for (let i = 0; i < 5; i++) {
    const a = Math.random()*Math.PI*2, s = rnd(3,9);
    BB.state.particles.push({ x, y, vx:Math.cos(a)*s, vy:Math.sin(a)*s, r:2, color:'#fef08a', life:0.9, decay:0.1 });
  }
}

// ── TOUCH / CLICK INPUT on SELECT screen ─────────────────────────
function bbHandleClick(ex, ey) {
  if (BB.state.phase !== 'select') return;
  const W = canvas.width;
  const A = bbGetArena();
  const cols = 4, pad2 = 10;
  const cellW = (A.w - pad2*(cols+1))/cols;
  const cellH = cellW * 0.9;
  const startY = A.y + 12 + W*0.11;

  const rect = canvas.getBoundingClientRect();
  const s = W / rect.width;
  const mx = ex * s, my = ey * s;

  const keys = Object.keys(BB.WEAPONS);
  for (let i = 0; i < keys.length; i++) {
    const col = i%cols, row = Math.floor(i/cols);
    const cx = A.x + pad2 + col*(cellW+pad2);
    const cy = startY + row*(cellH+8);
    if (mx>=cx && mx<=cx+cellW && my>=cy && my<=cy+cellH) {
      if (BB.state.playerWeapon === keys[i]) {
        // Second tap = start fight
        BB.state.phase = 'fight';
        bbStartWave();
        id('arcadeControls').innerHTML = '';
      } else {
        BB.state.playerWeapon = keys[i];
      }
      return;
    }
  }
}

function bbHandleMove(ex, ey) {
  if (BB.state.phase !== 'select') return;
  const W = canvas.width;
  const A = bbGetArena();
  const cols = 4, pad2 = 10;
  const cellW = (A.w - pad2*(cols+1))/cols;
  const cellH = cellW * 0.9;
  const startY = A.y + 12 + W*0.11;
  const rect = canvas.getBoundingClientRect();
  const s = W / rect.width;
  const mx = ex * s, my = ey * s;

  const keys = Object.keys(BB.WEAPONS);
  BB.state.selectHover = null;
  for (let i = 0; i < keys.length; i++) {
    const col=i%cols, row=Math.floor(i/cols);
    const cx=A.x+pad2+col*(cellW+pad2), cy=startY+row*(cellH+8);
    if (mx>=cx && mx<=cx+cellW && my>=cy && my<=cy+cellH) { BB.state.selectHover=keys[i]; break; }
  }
}

// ── MAIN LOOP ─────────────────────────────────────────────────────
function bbLoop() {
  if (BB.state.phase === 'fight') bbPhysics();
  bbDraw();
  BB.state.raf = requestAnimationFrame(bbLoop);
  arcadeRAF = BB.state.raf;
}

// Wire canvas events
;(function bbWireEvents() {
  function onC(e){ const r=canvas.getBoundingClientRect(); const src=e.changedTouches?e.changedTouches[0]:e; bbHandleClick(src.clientX-r.left, src.clientY-r.top); }
  function onM(e){ const r=canvas.getBoundingClientRect(); const src=e.touches?e.touches[0]:e; bbHandleMove(src.clientX-r.left, src.clientY-r.top); }
  canvas.addEventListener('click', onC);
  canvas.addEventListener('touchend', onC, {passive:true});
  canvas.addEventListener('mousemove', onM);
  canvas.addEventListener('touchmove', onM, {passive:true});
})();

const CAPY_WORLDS = {
  grassland: { name:'GRASSLAND', emoji:'🌿', bg:'#0a0a0f', ground:'#1c1c28', groundLine:'#2a2a3d', platColor:'#2a2a3d', platBorder:'#3d3d5c', obstacleCol:'#2d6a4f', coinCol:'#fde047', skyColor:'#0d1020', starColor:'#ffffff20' },
  jungle:    { name:'JUNGLE',    emoji:'🌴', bg:'#051208', ground:'#0a1e0a', groundLine:'#1a3a1a', platColor:'#0e280e', platBorder:'#1a4a1a', obstacleCol:'#1a5c1a', coinCol:'#ffd700', skyColor:'#060f06', starColor:'#90ee9020' },
  snow:      { name:'SNOW',      emoji:'❄️', bg:'#060810', ground:'#1a2030', groundLine:'#2a3050', platColor:'#1e2840', platBorder:'#3a4868', obstacleCol:'#2a4060', coinCol:'#60dfff', skyColor:'#08090f', starColor:'#b0c8ff30' },
  city:      { name:'CITY',      emoji:'🏙', bg:'#08080c', ground:'#181820', groundLine:'#282830', platColor:'#202030', platBorder:'#383848', obstacleCol:'#303040', coinCol:'#ffd700', skyColor:'#080810', starColor:'#ffffff15' },
  night:     { name:'NIGHT',     emoji:'🌙', bg:'#04040a', ground:'#100c18', groundLine:'#1e1630', platColor:'#160e24', platBorder:'#2a1a3e', obstacleCol:'#553c9a', coinCol:'#e879f9', skyColor:'#04040c', starColor:'#c080ff25' },
};
let capyWorld = localStorage.getItem('capyWorld') || 'grassland';

function startCapybara(worldKey) {
  if (worldKey) capyWorld = worldKey;
  const WORLD = CAPY_WORLDS[capyWorld];
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
    const img = dead ? IMGS['capy_dead'] : IMGS['capy'];
    if (img && img.complete && img.naturalWidth > 0) {
      ctx.save();
      // Subtle walk bob
      const bob = Math.sin(walkF * 0.28) * 2;
      ctx.drawImage(img, x, y + (dead ? 0 : bob), w, h);
      ctx.restore();
    } else {
      // Fallback circle
      ctx.fillStyle = dead ? '#666' : '#8B6914';
      ctx.beginPath(); ctx.arc(x + w/2, y + h/2, w/2, 0, Math.PI*2); ctx.fill();
    }
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
    ctx.fillStyle = WORLD.bg; ctx.fillRect(0, 0, W, H);

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
    ctx.fillStyle = WORLD.ground; ctx.fillRect(0, GROUND, W, H - GROUND);
    // Ground line
    ctx.strokeStyle = WORLD.groundLine; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, GROUND); ctx.lineTo(W, GROUND); ctx.stroke();
    // Ground detail
    ctx.fillStyle = WORLD.groundLine;
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
      ctx.fillStyle = WORLD.platColor;
      roundRect(ctx, p.x, p.y, p.w, p.h, 6); ctx.fill();
      ctx.strokeStyle = WORLD.platBorder; ctx.lineWidth = 1.5;
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
