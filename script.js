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
const ARCADE_GAMES = ['bubbles','snake','breakout','flappy','ballbattle'];

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
  id('arcadeName').textContent = {bubbles:'BUBBLE BATTLE',snake:'SNAKE',breakout:'BREAKOUT',flappy:'FLAPPY BIRD',ballbattle:'BALL BATTLE'}[g];
  hide(hub); show(arcadeScreen);
  setupCanvas();
  buildControls(g);
  if (g === 'ballbattle') {
    showArcadeOverlay('⚔️', 'BALL BATTLE', 'PHYSICS ARENA · 1v1 OR VS BOT', '🤖 VS BOT');
    id('overlayBtn').textContent = '🤖 VS BOT';
    id('overlayBtn').dataset.bbmode = 'bot';
    // Add 2P button
    const existing = document.getElementById('bb2pBtn');
    if (existing) existing.remove();
    const btn2p = document.createElement('button');
    btn2p.id = 'bb2pBtn'; btn2p.className = 'ctrl-btn'; btn2p.textContent = '👥 2 PLAYERS';
    btn2p.style.cssText = 'width:100%;margin-top:8px;border-color:var(--o-col);color:var(--o-col)';
    id('arcadeOverlay').appendChild(btn2p);
    btn2p.addEventListener('click', () => { hideArcadeOverlay(); arcadeScore = 0; updateArcadeScore(); startBallBattle('2p'); });
  } else {
    showArcadeOverlay('🎮', {bubbles:'BUBBLE BATTLE',snake:'SNAKE',breakout:'BREAKOUT',flappy:'FLAPPY BIRD'}[g], {bubbles:'TAP TO SHOOT',snake:'TAP TO START',breakout:'MOVE PADDLE',flappy:'TAP TO FLY'}[g]);
  }
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
  if(currentGame==='ballbattle') startBallBattle('bot');
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
['bubbles','snake','breakout','flappy'].forEach(g=>{ try{arcadeHiScore[g]=parseInt(localStorage.getItem('hi_'+g))||0;}catch(e){} });

// ══════════════════════════════════════════════
// ⚽  BALL BATTLE  –  physics arena
// ══════════════════════════════════════════════
function startBallBattle(mode) { // mode: 'bot' | '2p'
  const W = canvas.width, H = canvas.height;
  const CX = W / 2, CY = H / 2;
  const ARENA_R = Math.min(W, H) * 0.42;
  const BALL_R = W < 360 ? 20 : 24;
  const FRICTION = 0.985;
  const PUSH_FORCE = 7;
  const BOT_SPEED = 2.8;

  // Power-ups
  const POWERUPS = [];
  let puTimer = 0;

  // Players
  const players = [
    { x: CX - ARENA_R * 0.45, y: CY, vx: 0, vy: 0, r: BALL_R, color: '#ff6b9d', hp: 5, maxHp: 5, name: 'P1', angle: 0, dashTimer: 0, shield: 0, speed: 1, emoji: '🔴' },
    { x: CX + ARENA_R * 0.45, y: CY, vx: 0, vy: 0, r: BALL_R, color: '#6bdbff', hp: 5, maxHp: 5, name: mode === 'bot' ? 'BOT' : 'P2', angle: 0, dashTimer: 0, shield: 0, speed: 1, emoji: '🔵' }
  ];

  // Input
  const keys = {};
  function onKey(e) { keys[e.code] = e.type === 'keydown'; }
  document.addEventListener('keydown', onKey);
  document.addEventListener('keyup', onKey);

  // Touch joystick for P1
  let touch1 = null;
  let touchStart1 = null;
  let dashTouch = false;

  function onTouchStart(e) {
    for (const t of e.changedTouches) {
      const rect = canvas.getBoundingClientRect();
      const s = W / rect.width;
      const tx = (t.clientX - rect.left) * s;
      const ty = (t.clientY - rect.top) * s;
      if (tx < W / 2) { touch1 = { id: t.identifier, x: tx, y: ty }; touchStart1 = { x: tx, y: ty }; }
      else { dashTouch = true; setTimeout(() => dashTouch = false, 200); }
    }
  }
  function onTouchMove(e) {
    for (const t of e.changedTouches) {
      if (touch1 && t.identifier === touch1.id) touch1 = { id: t.identifier, x: (t.clientX - canvas.getBoundingClientRect().left) * (W / canvas.getBoundingClientRect().width), y: (t.clientY - canvas.getBoundingClientRect().top) * (W / canvas.getBoundingClientRect().width) };
    }
  }
  function onTouchEnd(e) { for (const t of e.changedTouches) { if (touch1 && t.identifier === touch1.id) { touch1 = null; touchStart1 = null; } } }

  canvas.addEventListener('touchstart', onTouchStart, { passive: true });
  canvas.addEventListener('touchmove', onTouchMove, { passive: true });
  canvas.addEventListener('touchend', onTouchEnd, { passive: true });

  arcadeGame = {
    cleanup() {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('keyup', onKey);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
    }
  };

  // Build controls UI
  const ctrl = id('arcadeControls');
  if (mode === 'bot') {
    ctrl.innerHTML = `
      <div style="display:grid;grid-template-columns:repeat(3,58px);grid-template-rows:repeat(2,58px);gap:6px">
        <div></div><button class="arc-btn" id="bb_up">▲</button><button class="arc-btn" id="bb_dash" style="border-color:var(--accent2);color:var(--accent2);font-size:11px;letter-spacing:1px">DASH</button>
        <button class="arc-btn" id="bb_left">◀</button><button class="arc-btn" id="bb_down">▼</button><button class="arc-btn" id="bb_right">▶</button>
      </div>`;
    const btnMap = { bb_up: 'ArrowUp', bb_down: 'ArrowDown', bb_left: 'ArrowLeft', bb_right: 'ArrowRight', bb_dash: 'Space' };
    Object.entries(btnMap).forEach(([id_, code]) => {
      const el = document.getElementById(id_);
      if (!el) return;
      el.addEventListener('touchstart', e => { e.preventDefault(); keys[code] = true; }, { passive: false });
      el.addEventListener('touchend', e => { e.preventDefault(); keys[code] = false; }, { passive: false });
      el.addEventListener('mousedown', () => keys[code] = true);
      el.addEventListener('mouseup', () => keys[code] = false);
    });
  } else {
    ctrl.innerHTML = `
      <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center">
        <div style="text-align:center">
          <div style="font-family:var(--font-hd);font-size:9px;color:var(--sub);letter-spacing:1px;margin-bottom:6px">P1</div>
          <div style="display:grid;grid-template-columns:repeat(3,52px);grid-template-rows:repeat(2,52px);gap:5px">
            <div></div><button class="arc-btn" id="bb_up">▲</button><button class="arc-btn" id="bb_dash1" style="font-size:10px;border-color:var(--accent2);color:var(--accent2)">DASH</button>
            <button class="arc-btn" id="bb_left">◀</button><button class="arc-btn" id="bb_down">▼</button><button class="arc-btn" id="bb_right">▶</button>
          </div>
        </div>
        <div style="text-align:center">
          <div style="font-family:var(--font-hd);font-size:9px;color:var(--sub);letter-spacing:1px;margin-bottom:6px">P2</div>
          <div style="display:grid;grid-template-columns:repeat(3,52px);grid-template-rows:repeat(2,52px);gap:5px">
            <div></div><button class="arc-btn" id="bb_w">▲</button><button class="arc-btn" id="bb_dash2" style="font-size:10px;border-color:var(--o-col);color:var(--o-col)">DASH</button>
            <button class="arc-btn" id="bb_a">◀</button><button class="arc-btn" id="bb_s">▼</button><button class="arc-btn" id="bb_d">▶</button>
          </div>
        </div>
      </div>`;
    const btnMap2 = { bb_up: 'ArrowUp', bb_down: 'ArrowDown', bb_left: 'ArrowLeft', bb_right: 'ArrowRight', bb_dash1: 'Space', bb_w: 'KeyW', bb_s: 'KeyS', bb_a: 'KeyA', bb_d: 'KeyD', bb_dash2: 'ShiftLeft' };
    Object.entries(btnMap2).forEach(([id_, code]) => {
      const el = document.getElementById(id_);
      if (!el) return;
      el.addEventListener('touchstart', e => { e.preventDefault(); keys[code] = true; }, { passive: false });
      el.addEventListener('touchend', e => { e.preventDefault(); keys[code] = false; }, { passive: false });
      el.addEventListener('mousedown', () => keys[code] = true);
      el.addEventListener('mouseup', () => keys[code] = false);
    });
  }

  // Stars background
  const stars = Array.from({ length: 60 }, () => ({ x: rnd(0, W), y: rnd(0, H), r: rnd(0.5, 2), a: rnd(0.1, 0.5) }));

  // Particles
  let particles = [];
  function burst(x, y, color, n = 12) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, spd = rnd(2, 7);
      particles.push({ x, y, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd, r: rnd(3, 7), color, life: 1 });
    }
  }

  // Spawn power-up
  function spawnPU() {
    const types = ['speed', 'shield', 'push', 'shrink'];
    const type = types[Math.floor(Math.random() * types.length)];
    const angle = Math.random() * Math.PI * 2;
    const dist = rnd(20, ARENA_R * 0.55);
    POWERUPS.push({
      x: CX + Math.cos(angle) * dist, y: CY + Math.sin(angle) * dist,
      type, r: 14, life: 1, pulse: 0,
      color: { speed: '#facc15', shield: '#7c6fff', push: '#ff6b9d', shrink: '#4ade80' }[type],
      emoji: { speed: '⚡', shield: '🛡', push: '💥', shrink: '🔬' }[type]
    });
  }

  // Round state
  let roundWins = [0, 0];
  let roundOver = false;
  let roundOverTimer = 0;
  let flashMsg = '', flashTimer = 0;

  function resetRound() {
    players[0].x = CX - ARENA_R * 0.45; players[0].y = CY; players[0].vx = 0; players[0].vy = 0; players[0].hp = 5; players[0].shield = 0; players[0].speed = 1;
    players[1].x = CX + ARENA_R * 0.45; players[1].y = CY; players[1].vx = 0; players[1].vy = 0; players[1].hp = 5; players[1].shield = 0; players[1].speed = 1;
    POWERUPS.length = 0; roundOver = false; puTimer = 0;
  }

  function loop() {
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, W, H);

    // Stars
    stars.forEach(s => { ctx.globalAlpha = s.a; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill(); });
    ctx.globalAlpha = 1;

    // Arena
    // Outer glow
    const aGrd = ctx.createRadialGradient(CX, CY, ARENA_R * 0.7, CX, CY, ARENA_R + 20);
    aGrd.addColorStop(0, 'transparent'); aGrd.addColorStop(1, '#7c6fff22');
    ctx.fillStyle = aGrd; ctx.beginPath(); ctx.arc(CX, CY, ARENA_R + 20, 0, Math.PI * 2); ctx.fill();
    // Floor
    ctx.fillStyle = '#12121a'; ctx.beginPath(); ctx.arc(CX, CY, ARENA_R, 0, Math.PI * 2); ctx.fill();
    // Floor grid
    ctx.save(); ctx.clip(); ctx.beginPath(); ctx.arc(CX, CY, ARENA_R, 0, Math.PI * 2);
    ctx.strokeStyle = '#1c1c28'; ctx.lineWidth = 1;
    for (let gx = CX - ARENA_R; gx < CX + ARENA_R; gx += 32) { ctx.beginPath(); ctx.moveTo(gx, CY - ARENA_R); ctx.lineTo(gx, CY + ARENA_R); ctx.stroke(); }
    for (let gy = CY - ARENA_R; gy < CY + ARENA_R; gy += 32) { ctx.beginPath(); ctx.moveTo(CX - ARENA_R, gy); ctx.lineTo(CX + ARENA_R, gy); ctx.stroke(); }
    ctx.restore();
    // Border
    ctx.strokeStyle = '#7c6fff88'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(CX, CY, ARENA_R, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = '#7c6fff33'; ctx.lineWidth = 8;
    ctx.beginPath(); ctx.arc(CX, CY, ARENA_R + 4, 0, Math.PI * 2); ctx.stroke();

    if (!roundOver) {
      // ── INPUT ──
      // P1 keyboard
      let ax1 = 0, ay1 = 0;
      if (keys['ArrowLeft']) ax1 -= 1;
      if (keys['ArrowRight']) ax1 += 1;
      if (keys['ArrowUp']) ay1 -= 1;
      if (keys['ArrowDown']) ay1 += 1;
      // P1 touch joystick
      if (touch1 && touchStart1) {
        const dx = touch1.x - touchStart1.x, dy = touch1.y - touchStart1.y;
        const len = Math.hypot(dx, dy);
        if (len > 8) { ax1 = dx / len; ay1 = dy / len; }
      }
      const spd1 = 3.5 * players[0].speed;
      players[0].vx += ax1 * 0.8; players[0].vy += ay1 * 0.8;

      // P1 dash
      if ((keys['Space'] || dashTouch) && players[0].dashTimer <= 0) {
        const len = Math.hypot(players[0].vx, players[0].vy) || 1;
        players[0].vx += (players[0].vx / len) * 8;
        players[0].vy += (players[0].vy / len) * 8;
        players[0].dashTimer = 45;
        burst(players[0].x, players[0].y, players[0].color, 8);
      }
      if (players[0].dashTimer > 0) players[0].dashTimer--;

      if (mode === '2p') {
        // P2 keyboard WASD
        let ax2 = 0, ay2 = 0;
        if (keys['KeyA']) ax2 -= 1;
        if (keys['KeyD']) ax2 += 1;
        if (keys['KeyW']) ay2 -= 1;
        if (keys['KeyS']) ay2 += 1;
        players[1].vx += ax2 * 0.8; players[1].vy += ay2 * 0.8;
        if ((keys['ShiftLeft'] || keys['ShiftRight']) && players[1].dashTimer <= 0) {
          const len = Math.hypot(players[1].vx, players[1].vy) || 1;
          players[1].vx += (players[1].vx / len) * 8;
          players[1].vy += (players[1].vy / len) * 8;
          players[1].dashTimer = 45;
          burst(players[1].x, players[1].y, players[1].color, 8);
        }
        if (players[1].dashTimer > 0) players[1].dashTimer--;
      } else {
        // BOT AI
        const p = players[0], b = players[1];
        const dx = p.x - b.x, dy = p.y - b.y, dist = Math.hypot(dx, dy);
        // Check if PU closer
        let target = { x: p.x, y: p.y };
        for (const pu of POWERUPS) {
          const d = Math.hypot(pu.x - b.x, pu.y - b.y);
          if (d < ARENA_R * 0.4 && (pu.type === 'speed' || pu.type === 'push')) { target = pu; break; }
        }
        const tdx = target.x - b.x, tdy = target.y - b.y, tlen = Math.hypot(tdx, tdy) || 1;
        // Stay in arena
        const distFromCenter = Math.hypot(b.x - CX, b.y - CY);
        if (distFromCenter > ARENA_R * 0.75) {
          b.vx += ((CX - b.x) / distFromCenter) * 1.5;
          b.vy += ((CY - b.y) / distFromCenter) * 1.5;
        } else {
          b.vx += (tdx / tlen) * BOT_SPEED * 0.25;
          b.vy += (tdy / tlen) * BOT_SPEED * 0.25;
        }
        if (dist < BALL_R * 4 && b.dashTimer <= 0 && Math.random() < 0.05) {
          b.vx += (dx / dist) * -6; b.vy += (dy / dist) * -6;
          b.dashTimer = 45; burst(b.x, b.y, b.color, 8);
        }
        if (b.dashTimer > 0) b.dashTimer--;
      }

      // ── PHYSICS ──
      for (const p of players) {
        const maxSpd = 10 * p.speed;
        const spd = Math.hypot(p.vx, p.vy);
        if (spd > maxSpd) { p.vx = p.vx / spd * maxSpd; p.vy = p.vy / spd * maxSpd; }
        p.vx *= FRICTION; p.vy *= FRICTION;
        p.x += p.vx; p.y += p.vy;
        p.angle += (p.vx * 0.05);
        if (p.shield > 0) p.shield--;
      }

      // Ball vs ball collision
      const [p1, p2] = players;
      const dx = p2.x - p1.x, dy = p2.y - p1.y;
      const dist = Math.hypot(dx, dy);
      if (dist < p1.r + p2.r && dist > 0) {
        const nx = dx / dist, ny = dy / dist;
        const overlap = (p1.r + p2.r - dist) / 2;
        p1.x -= nx * overlap; p1.y -= ny * overlap;
        p2.x += nx * overlap; p2.y += ny * overlap;
        const relVx = p1.vx - p2.vx, relVy = p1.vy - p2.vy;
        const dot = relVx * nx + relVy * ny;
        if (dot > 0) {
          const impulse = dot * 1.3;
          p1.vx -= nx * impulse; p1.vy -= ny * impulse;
          p2.vx += nx * impulse; p2.vy += ny * impulse;
          // Damage
          const impact = Math.abs(dot);
          if (impact > 2) {
            const dmg = Math.floor(impact * 0.5);
            if (p1.shield <= 0) { p1.hp = Math.max(0, p1.hp - dmg); burst(p1.x, p1.y, p1.color, 6); }
            if (p2.shield <= 0) { p2.hp = Math.max(0, p2.hp - dmg); burst(p2.x, p2.y, p2.color, 6); }
          }
        }
      }

      // Arena boundary — bounce with damage
      for (const p of players) {
        const d = Math.hypot(p.x - CX, p.y - CY);
        if (d + p.r > ARENA_R) {
          const nx = (p.x - CX) / d, ny = (p.y - CY) / d;
          p.x = CX + nx * (ARENA_R - p.r - 1);
          p.y = CY + ny * (ARENA_R - p.r - 1);
          const dot = p.vx * nx + p.vy * ny;
          p.vx -= 2 * dot * nx * 0.8; p.vy -= 2 * dot * ny * 0.8;
          if (Math.abs(dot) > 3 && p.shield <= 0) { p.hp = Math.max(0, p.hp - 1); burst(p.x, p.y, p.color, 5); }
        }
      }

      // Power-ups
      puTimer++;
      if (puTimer % 300 === 0 && POWERUPS.length < 3) spawnPU();
      for (let i = POWERUPS.length - 1; i >= 0; i--) {
        const pu = POWERUPS[i];
        pu.pulse += 0.08;
        for (const p of players) {
          if (Math.hypot(p.x - pu.x, p.y - pu.y) < p.r + pu.r) {
            burst(pu.x, pu.y, pu.color, 10);
            flashMsg = (p === players[0] ? '🔴' : '🔵') + ' ' + pu.emoji;
            flashTimer = 80;
            if (pu.type === 'speed') p.speed = Math.min(2, p.speed + 0.4);
            if (pu.type === 'shield') p.shield = 180;
            if (pu.type === 'push') { const other = p === players[0] ? players[1] : players[0]; const od = Math.hypot(other.x - CX, other.y - CY); const ox = (other.x - CX) / (od || 1), oy = (other.y - CY) / (od || 1); other.vx += ox * 12; other.vy += oy * 12; }
            if (pu.type === 'shrink') { const other = p === players[0] ? players[1] : players[0]; other.r = Math.max(12, other.r - 4); setTimeout(() => other.r = BALL_R, 5000); }
            POWERUPS.splice(i, 1); break;
          }
        }
      }

      // Check death
      for (let i = 0; i < 2; i++) {
        if (players[i].hp <= 0) {
          roundWins[1 - i]++;
          arcadeScore = roundWins[0] * 100;
          updateArcadeScore();
          roundOver = true;
          roundOverTimer = 120;
          burst(players[i].x, players[i].y, players[i].color, 25);
          if (roundWins[0] >= 3) { setTimeout(() => gameOver('🏆', mode === 'bot' ? 'YOU WIN!' : 'P1 WINS!'), 500); return; }
          if (roundWins[1] >= 3) { setTimeout(() => gameOver('💀', mode === 'bot' ? 'BOT WINS!' : 'P2 WINS!'), 500); return; }
        }
      }
    } else {
      roundOverTimer--;
      if (roundOverTimer <= 0) resetRound();
    }

    // Draw power-ups
    for (const pu of POWERUPS) {
      const pr = pu.r + Math.sin(pu.pulse) * 2;
      ctx.save();
      ctx.shadowColor = pu.color; ctx.shadowBlur = 15;
      ctx.strokeStyle = pu.color; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(pu.x, pu.y, pr, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
      ctx.font = `${pr * 1.2}px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(pu.emoji, pu.x, pu.y);
    }

    // Draw particles
    particles.forEach(p => {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2); ctx.fill();
      p.x += p.vx; p.y += p.vy; p.vx *= 0.92; p.vy *= 0.92; p.life -= 0.04;
    });
    particles = particles.filter(p => p.life > 0);
    ctx.globalAlpha = 1;

    // Draw players
    for (const p of players) {
      ctx.save();
      ctx.translate(p.x, p.y); ctx.rotate(p.angle);
      // Shadow
      ctx.fillStyle = p.color + '33'; ctx.beginPath(); ctx.arc(3, 3, p.r, 0, Math.PI * 2); ctx.fill();
      // Shield ring
      if (p.shield > 0) {
        ctx.strokeStyle = '#7c6fff'; ctx.lineWidth = 3; ctx.globalAlpha = 0.5 + Math.sin(Date.now() * 0.01) * 0.3;
        ctx.beginPath(); ctx.arc(0, 0, p.r + 6, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1;
      }
      // Body gradient
      const grd = ctx.createRadialGradient(-p.r * 0.3, -p.r * 0.3, p.r * 0.1, 0, 0, p.r);
      grd.addColorStop(0, '#fff9'); grd.addColorStop(0.4, p.color); grd.addColorStop(1, p.color + '88');
      ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(0, 0, p.r, 0, Math.PI * 2); ctx.fill();
      // Shine
      ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.beginPath(); ctx.ellipse(-p.r * 0.25, -p.r * 0.3, p.r * 0.35, p.r * 0.22, -0.5, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }

    // HP bars
    for (let i = 0; i < 2; i++) {
      const p = players[i];
      const bw = ARENA_R * 0.7, bh = 8;
      const bx = i === 0 ? CX - ARENA_R - 10 - bw : CX + ARENA_R + 10;
      const by = CY - bh / 2;
      ctx.fillStyle = C.bg3; ctx.beginPath(); roundRect(ctx, bx, by, bw, bh, 4); ctx.fill();
      const ratio = p.hp / p.maxHp;
      ctx.fillStyle = ratio > 0.5 ? C.green : ratio > 0.25 ? C.yellow : C.pink;
      ctx.beginPath(); roundRect(ctx, bx, by, bw * ratio, bh, 4); ctx.fill();
      ctx.strokeStyle = C.border; ctx.lineWidth = 1; ctx.beginPath(); roundRect(ctx, bx, by, bw, bh, 4); ctx.stroke();
      ctx.fillStyle = C.text; ctx.font = `bold 10px ${C.font}`; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
      ctx.fillText(p.name, bx + bw / 2, by - 3);
    }

    // Round wins
    for (let i = 0; i < 2; i++) {
      const bx = i === 0 ? CX - 50 : CX + 10;
      for (let w = 0; w < 3; w++) {
        ctx.fillStyle = w < roundWins[i] ? (i === 0 ? C.pink : C.cyan) : C.bg3;
        ctx.strokeStyle = i === 0 ? C.pink : C.cyan; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(bx + w * 16, CY - ARENA_R - 22, 5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      }
    }

    // Flash message
    if (flashTimer > 0) {
      ctx.globalAlpha = Math.min(1, flashTimer / 30);
      ctx.font = `bold 20px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(flashMsg, CX, CY - ARENA_R * 0.6);
      ctx.globalAlpha = 1; flashTimer--;
    }

    // Round over banner
    if (roundOver) {
      ctx.globalAlpha = 0.7; ctx.fillStyle = C.bg; ctx.fillRect(CX - 100, CY - 28, 200, 56); ctx.globalAlpha = 1;
      ctx.strokeStyle = C.accent; ctx.lineWidth = 2; ctx.strokeRect(CX - 100, CY - 28, 200, 56);
      ctx.fillStyle = C.accent; ctx.font = `bold 14px var(--font-hd, monospace)`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('ROUND OVER', CX, CY);
    }

    arcadeRAF = requestAnimationFrame(loop);
  }
  arcadeRAF = requestAnimationFrame(loop);
}
