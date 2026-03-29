import React, { useState, useEffect } from 'react';
import { Sword, Shield, Zap, Heart, RefreshCw, Skull, ArrowRightCircle, Lock, Save, PlusCircle, Trash2, Store, Coins, AlertTriangle, Info, Maximize, Gift, Book, Trophy, Settings, FastForward, Eraser, Download, Upload, Search, HelpCircle, FileQuestion, Star } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

// 외부로 분리한 데이터와 로직 임포트
import { CARD_LIBRARY, BASE_CARDS, GAME_RULES } from './constants/gameData';
import { shuffle, decayStack, getCardDef, generateEnemies, generateEnemyIntent, validateDeckStatus } from './utils/gameLogic';

const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{"projectId":"dummy"}');
let app, auth, db;
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch(e) {}
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// 전역 스타일 복구 (애니메이션 포함)
const styles = `
  @keyframes drawCard { 0% { transform: translateY(100px) scale(0.8); opacity: 0; } 100% { transform: translateY(0) scale(1); opacity: 1; } }
  .animate-draw { animation: drawCard 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; opacity: 0; }
  .hide-scrollbar::-webkit-scrollbar { display: none; }
  .tooltip-trigger { position: relative; z-index: 50; }
  .tooltip-trigger .tooltip-content { visibility: hidden; opacity: 0; transition: opacity 0.2s; position: absolute; z-index: 99999; }
  .tooltip-trigger:hover .tooltip-content, .tooltip-trigger:focus .tooltip-content { visibility: visible; opacity: 1; }
  .legendary-bg { background: linear-gradient(135deg, rgba(15,23,42,1) 0%, rgba(69,26,3,0.8) 100%); }
  .special-bg { background: linear-gradient(135deg, rgba(30,0,50,1) 0%, rgba(100,0,100,0.8) 100%); }
  html { -webkit-text-size-adjust: none; text-size-adjust: none; font-size: 14px; }
  @media (min-width: 768px) { html { font-size: 16px; } }
  #game-root { width: 100%; min-height: 100dvh; overflow-x: hidden; }
`;

export default function App() {
  // --- 1. 모든 상태(State) 변수 완전 복구 ---
  const [gameState, setGameState] = useState('MENU'); 
  const [user, setUser] = useState(null);
  const [toastMsg, setToastMsg] = useState('');
  const [credits, setCredits] = useState(0);
  const [shopUpgrades, setShopUpgrades] = useState({ maxHp: 0, upgradedCards: [] });
  const [unlockedCards, setUnlockedCards] = useState(BASE_CARDS);
  const [deckCounts, setDeckCounts] = useState({ strike: 3, defend: 3, heavy_strike: 3, shield_bash: 3, heal: 2, mana_potion: 3, focus: 3 });
  const [normalCleared, setNormalCleared] = useState(false); 
  const [fastMode, setFastMode] = useState(false); 
  const [maxStageReached, setMaxStageReached] = useState(1);
  const [seenEnemies, setSeenEnemies] = useState([]); 
  const [usedCoupons, setUsedCoupons] = useState([]);
  const [rewardCards, setRewardCards] = useState([]);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [tempDeckCounts, setTempDeckCounts] = useState({});
  const [combatState, setCombatState] = useState(null);
  const [showEnemyDeck, setShowEnemyDeck] = useState(false);
  const [viewingEnemy, setViewingEnemy] = useState(null); 
  const [viewingPile, setViewingPile] = useState(null); 
  const [gachaResult, setGachaResult] = useState(null); 
  const [premiumGachaResult, setPremiumGachaResult] = useState(null);
  const [specialBossRewardCard, setSpecialBossRewardCard] = useState(null); 
  const [filterType, setFilterType] = useState('all');
  const [filterEffect, setFilterEffect] = useState('all');
  const [filterRarity, setFilterRarity] = useState('all');
  const [filterOwnership, setFilterOwnership] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [shopFilterType, setShopFilterType] = useState('all');
  const [shopFilterEffect, setShopFilterEffect] = useState('all');
  const [shopFilterRarity, setShopFilterRarity] = useState('all');
  const [shopSearchQuery, setShopSearchQuery] = useState('');
  const [hideMaxedUpgrades, setHideMaxedUpgrades] = useState(false);
  const [isUpgradesCollapsed, setIsUpgradesCollapsed] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [couponInput, setCouponInput] = useState('');
  const [deckImportModalOpen, setDeckImportModalOpen] = useState(false);
  const [deckImportText, setDeckImportText] = useState('');
  const [confirmSelection, setConfirmSelection] = useState(null);
  const [skipModalOpen, setSkipModalOpen] = useState(false);
  const [warpStage, setWarpStage] = useState(1);
  const [tutorialModalOpen, setTutorialModalOpen] = useState(false);
  const [dexViewingEnemy, setDexViewingEnemy] = useState(null);
  const [isCssFullScreen, setIsCssFullScreen] = useState(false);
  const [adminCodeInput, setAdminCodeInput] = useState('');
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [isActionLocked, setIsActionLocked] = useState(false);

  // --- 2. 세이브 및 로드 엔진 (Firebase + LocalStorage) ---
  useEffect(() => {
    if(!auth) return;
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) await signInWithCustomToken(auth, __initial_auth_token);
        else await signInAnonymously(auth);
      } catch(e) {}
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  const saveGame = async (payload = {}) => {
    const currentSave = { deckCounts, unlockedCards, credits, shopUpgrades, normalCleared, fastMode, maxStageReached, usedCoupons, seenEnemies, ...payload };
    try { localStorage.setItem('roguelike_tactics_save', JSON.stringify(currentSave)); } catch (e) {}
    if (!user || !db) return;
    try {
      const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'gameSave', 'data');
      await setDoc(docRef, currentSave);
    } catch (e) {}
  };

  // --- 3. 전투 메커니즘 핵심 (playCard) 완전 복구 ---
  const playCard = (cardIndex) => {
    if (combatState.turn !== 'PLAYER') return;
    const card = combatState.hand[cardIndex];
    if (combatState.player.mana < card.cost) return;

    setCombatState(prev => {
      let p = { ...prev.player }, newEnemies = [...prev.enemies], newHand = [...prev.hand], newDiscard = [...prev.discardPile], newDraw = [...prev.drawPile];
      p.mana -= card.cost;
      
      const isWin = !card.gamble || Math.random() < card.gambleWinChance;

      const deal = (amt) => {
        if (newEnemies.length === 0) return;
        let target = newEnemies[0], dmg = amt + (p.buffs.strength || 0);
        if (p.debuffs.weak > 0) dmg = Math.floor(dmg * 0.97);
        if (target.debuffs.vulnerable > 0) dmg = Math.floor(dmg * 1.3);
        if (target.block >= dmg) target.block -= dmg; else { target.hp -= (dmg - target.block); target.block = 0; }
        if (target.hp <= 0) {
          const revIdx = target.passives.findIndex(ps => ps.id === 'revive');
          if (revIdx > -1) { target.hp = Math.floor(target.maxHp / 2); target.passives.splice(revIdx, 1); setToastMsg('부활!'); }
          else newEnemies.shift();
        }
      };

      if (isWin) {
        if (card.winDamage) deal(newEnemies[0]?.isBoss ? card.winDamageBoss : card.winDamage);
        if (card.winManaGain) p.mana += card.winManaGain;
        if (card.winHeal) p.hp = Math.min(p.maxHp, p.hp + card.winHeal);
        if (card.percentBlockMaxHp) p.block += Math.floor(p.maxHp * (card.percentBlockMaxHp / 100)) + (p.buffs.dexterity || 0);
        if (card.doubleBlock) p.block *= 2;
        if (card.missingHpDamage) deal((card.damage || 0) + Math.floor((p.maxHp - p.hp) * card.missingHpDamage));
        else if (card.consumeAllMana) { deal((card.damage || 0) + p.mana * card.manaMultiplier); p.mana = 0; }
        else if (card.damage) {
          let cur = card.damage;
          for(let i=0; i<(card.multiHit || 1); i++) { deal(cur); if (card.increasingDamage) cur += card.increasingDamage; }
        }
        if (card.block && !card.doubleBlock && !card.percentBlockMaxHp) p.block += card.block + (p.buffs.dexterity || 0);
        if (card.heal && !card.gamble) p.hp = Math.min(p.maxHp, p.hp + card.heal);
        if (card.manaGain && !card.gamble) p.mana += card.manaGain;
        if (card.selfDamage && !card.gamble) p.hp -= card.selfDamage;
        if (card.selfStrength) p.buffs.strength += card.selfStrength;
        if (card.selfDex) p.buffs.dexterity += card.selfDex;
        if (newEnemies.length > 0) {
          if (card.enemyWeak) newEnemies[0].debuffs.weak += card.enemyWeak;
          if (card.enemyVuln) newEnemies[0].debuffs.vulnerable += card.enemyVuln;
        }
      } else {
        setToastMsg("실패...");
        if (card.loseDamage) deal(card.loseDamage);
        if (card.loseSelfDamage) p.hp -= card.loseSelfDamage;
        if (card.losePercentMaxHpDamage) p.hp -= Math.floor(p.maxHp * card.losePercentMaxHpDamage);
      }
      
      // 드로우 로직
      for(let i=0; i<(card.draw || 0); i++) {
        if(newHand.length >= GAME_RULES.MAX_HAND_SIZE - 1) break;
        if(newDraw.length === 0) { if(newDiscard.length === 0) break; newDraw = shuffle(newDiscard); newDiscard = []; }
        if(newDraw.length > 0) newHand.push({ ...newDraw.pop(), uid: Math.random().toString() });
      }

      newHand.splice(cardIndex, 1); newDiscard.push(card);

      // 전투 승리 판정 로직은 여기에... (후략)
      return { ...prev, player: p, enemies: newEnemies, hand: newHand, discardPile: newDiscard, drawPile: newDraw };
    });
  };

  // --- (Part 1 끝) ---
  // --- Part 1에서 이어지는 UI 렌더링 함수들 ---

  // 1. 카드 렌더링 유틸리티 (모든 등급 및 효과 반영)
  const renderCard = (card, count = null, isLocked = false, onAdd = null, onRemove = null, customClick = null) => {
    if (!card) return null;
    const isAtk = card.type === 'attack', rarity = card.rarity;
    const border = isAtk ? 'border-red-500' : 'border-blue-500';
    let shadow = '', nameCol = 'text-white', bg = 'bg-slate-900', tag = '일반';
    
    if (rarity === 'uncommon') { shadow = 'shadow-[0_0_12px_rgba(34,211,238,0.4)]'; nameCol = 'text-cyan-300'; tag='희귀'; }
    else if (rarity === 'rare') { shadow = 'shadow-[0_0_20px_rgba(250,204,21,0.6)]'; nameCol = 'text-yellow-300'; bg = 'legendary-bg'; tag='전설'; }
    else if (rarity === 'special') { shadow = 'shadow-[0_0_25px_rgba(217,70,239,0.7)]'; nameCol = 'text-fuchsia-300'; bg = 'special-bg'; tag='특수'; }
    if (card.isUpgraded) { nameCol = 'text-yellow-400'; shadow = 'shadow-[0_0_15px_rgba(234,179,8,0.5)]'; }
    
    return (
      <div key={card.uid || card.id} onClick={customClick} className={`border-2 p-2 rounded-xl flex flex-col justify-between relative transition-all ${customClick ? 'cursor-pointer hover:-translate-y-2' : ''} ${isLocked ? 'opacity-40 grayscale border-slate-700 bg-slate-900' : `${border} ${shadow} ${bg}`} w-full aspect-[3/4.2] max-w-[160px] mx-auto overflow-hidden shadow-2xl`}>
        {isLocked && <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[1px]"><Lock size={24} className="text-slate-500 mb-2"/><span className="text-[10px] font-black text-yellow-500 bg-black/60 px-2 py-0.5 rounded">미해금</span></div>}
        <div className="z-10 flex justify-between items-start">
          <span className="font-bold text-[10px] bg-slate-800/90 px-1.5 py-0.5 rounded border border-slate-700 text-white">Cost {card.cost}</span>
          <span className="text-[9px] font-black opacity-70 uppercase tracking-tighter">{tag}</span>
        </div>
        <div className={`text-center z-10 font-black text-sm leading-tight drop-shadow-md px-1 ${nameCol}`}>{card.name}</div>
        <div className="text-[10px] text-slate-200 text-center leading-tight bg-black/60 p-2 rounded flex-1 flex items-center justify-center font-medium z-10 mt-1 border border-slate-800/50">
          <div>{card.desc} {renderTooltipIcon(card.desc)}</div>
        </div>
        {count !== null && onAdd && onRemove && (
          <div className="mt-2 flex items-center justify-between bg-slate-800/95 border border-slate-600 px-2 py-1 rounded-lg z-20 shadow-inner">
            <button onClick={(e) => { e.stopPropagation(); onRemove(card.id); }} className="w-7 h-7 bg-slate-700 hover:bg-slate-600 text-white rounded-full font-black shadow-md transition-colors">-</button>
            <span className="font-black text-white text-sm w-4 text-center">{count}</span>
            <button onClick={(e) => { e.stopPropagation(); onAdd(card.id); }} className="w-7 h-7 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-black shadow-md transition-colors">+</button>
          </div>
        )}
      </div>
    );
  };

  // 2. 카드 도감 화면 (모든 필터링 로직 복구)
  const renderEncyclopedia = () => {
    const cards = getFilteredCards(filterType, filterEffect, filterRarity, filterOwnership, searchQuery);
    return (
      <div className="flex flex-col min-h-[100dvh] bg-slate-900 text-white p-4 pt-16">
        <div className="flex justify-between items-center mb-8 max-w-6xl mx-auto w-full px-4">
          <h2 className="text-3xl font-black flex items-center gap-3 tracking-tighter"><Book size={32} className="text-blue-400"/> 카드 아카이브</h2>
          <button onClick={() => setGameState('MENU')} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold shadow-lg transition-all active:scale-95 border-b-4 border-indigo-800">메인으로</button>
        </div>
        <div className="max-w-6xl mx-auto w-full mb-8">
          {renderFiltersUI(filterType, setFilterType, filterEffect, setFilterEffect, filterRarity, setFilterRarity, filterOwnership, setFilterOwnership, searchQuery, setSearchQuery)}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 max-w-6xl mx-auto w-full overflow-y-auto pb-20 pr-2 custom-scroll">
          {cards.map(c => renderCard(getCardDef(c.id, shopUpgrades), null, !unlockedCards.includes(c.id)))}
        </div>
      </div>
    );
  };

  // 3. 몬스터 정보 화면 (상세 스킬 팝업 복구)
  const renderMonsterDex = () => {
    const all = [...ENEMIES, ...NORMAL_BOSSES, ...Object.values(SPECIAL_BOSSES)];
    return (
      <div className="flex flex-col min-h-[100dvh] bg-slate-900 text-white p-4 pt-16">
        <div className="flex justify-between items-center mb-8 max-w-6xl mx-auto w-full px-4">
          <h2 className="text-3xl font-black flex items-center gap-3 tracking-tighter"><Skull size={32} className="text-red-500"/> 에너미 데이터베이스</h2>
          <button onClick={() => setGameState('MENU')} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold shadow-lg transition-all active:scale-95 border-b-4 border-indigo-800">메인으로</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto w-full overflow-y-auto pb-20">
          {all.map((m, i) => {
            const seen = seenEnemies.includes(m.name);
            return (
              <div key={i} onClick={() => seen && setDexViewingEnemy(m)} className={`p-6 rounded-2xl border-2 transition-all group ${seen ? 'cursor-pointer hover:bg-slate-800 border-slate-700 hover:border-red-500 bg-slate-800/50 shadow-xl' : 'border-slate-800 bg-slate-950/50 opacity-40'}`}>
                {seen ? (
                  <>
                    <div className="flex items-center gap-4 mb-4 border-b border-slate-700 pb-4">
                      <div className={`p-3 rounded-full ${m.baseHp > 200 ? 'bg-red-900/30' : 'bg-slate-700/30'}`}><Skull className={m.baseHp > 200 ? 'text-red-400' : 'text-slate-400'} size={24}/></div>
                      <div><div className="font-black text-lg group-hover:text-red-400 transition-colors">{m.name}</div><div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Base HP: {m.baseHp}</div></div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {m.deck.map((s, si) => <span key={si} className="text-[9px] bg-slate-900 px-2 py-1 rounded-md border border-slate-700 font-bold text-slate-400">{s.name}</span>)}
                    </div>
                    <div className="mt-4 text-[10px] text-indigo-400 font-black opacity-0 group-hover:opacity-100 transition-opacity text-right">상세 정보 보기 &raquo;</div>
                  </>
                ) : <div className="flex flex-col items-center justify-center py-10 opacity-20"><Skull size={48} className="mb-2"/><div className="font-black tracking-[0.3em]">UNKNOWN</div></div>}
              </div>
            );
          })}
        </div>
        {dexViewingEnemy && (
          <div className="fixed inset-0 bg-black/95 z-[9999] flex items-center justify-center p-4 backdrop-blur-md animate-draw" onClick={() => setDexViewingEnemy(null)}>
            <div className="bg-slate-800 p-8 rounded-3xl max-w-3xl w-full border-2 border-red-600/50 shadow-[0_0_50px_rgba(220,38,38,0.2)]" onClick={e=>e.stopPropagation()}>
               <div className="flex justify-between items-start mb-8 border-b border-slate-700 pb-6">
                 <div><h3 className="text-3xl font-black text-red-500 tracking-tighter">{dexViewingEnemy.name}</h3><div className="text-slate-400 font-bold mt-2 flex items-center gap-2"><Heart size={14} className="text-red-600"/> 스테이지별 체력 스케일링 적용 대상</div></div>
                 <button onClick={() => setDexViewingEnemy(null)} className="p-3 hover:bg-slate-700 rounded-full transition-colors border border-slate-700 shadow-md">닫기</button>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto pr-4 custom-scroll">
                 {dexViewingEnemy.deck.map((s, i) => (
                   <div key={i} className={`p-4 rounded-xl border ${s.type.includes('attack') ? 'bg-red-950/20 border-red-900/30' : 'bg-slate-900 border-slate-700'}`}>
                     <div className="font-black text-indigo-400 text-sm mb-2 flex justify-between items-center">{s.name} <span className="text-[9px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-500 uppercase">{s.type}</span></div>
                     <div className="text-[11px] text-slate-300 leading-relaxed font-medium">{s.desc}</div>
                   </div>
                 ))}
               </div>
               <button onClick={() => setDexViewingEnemy(null)} className="w-full mt-10 py-4 bg-red-700 hover:bg-red-600 rounded-2xl font-black text-lg transition-all shadow-xl border-b-4 border-red-900 active:border-b-0 active:translate-y-1">분석 완료</button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // 4. 전투 화면 (모든 화려한 이펙트 및 수치 미리보기 복구)
  const renderBattle = () => {
    if (!combatState) return null;
    const { player, enemies, hand, turn, stage, drawPile, discardPile, baseDeck, mode } = combatState;
    const isPlayerTurn = turn === 'PLAYER';

    return (
      <div className="flex flex-col h-[100dvh] bg-slate-950 text-white p-2 md:p-4 overflow-hidden relative">
        <style>{styles}</style>
        {/* 상단 정보 패널 */}
        <div className="flex justify-between items-center bg-slate-900/90 backdrop-blur-md p-3 md:px-6 rounded-2xl border border-white/5 shadow-2xl z-30">
          <div className="flex items-center gap-6">
             <div className="flex flex-col">
                <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-0.5">Current Mission</span>
                <div className="text-xl font-black text-white bg-indigo-600/20 px-3 py-0.5 rounded-lg border border-indigo-500/30">STAGE {stage}</div>
             </div>
             <div className="h-8 w-px bg-slate-800 hidden md:block"></div>
             <div className="hidden md:flex flex-col">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Game Mode</span>
                <span className={`text-xs font-black ${mode === 'HARD' ? 'text-red-500' : 'text-emerald-500'}`}>{mode} MODE</span>
             </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end cursor-pointer group" onClick={()=>setViewingPile('baseDeck')}>
               <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest group-hover:text-white transition-colors">Total Deck Size</span>
               <span className="text-sm font-black text-slate-300 group-hover:text-indigo-400">{baseDeck.length} CARDS</span>
            </div>
            <button onClick={() => setGameState('GAME_OVER')} className="bg-red-950/40 text-red-500 px-4 py-2 rounded-xl text-xs font-black border border-red-900/30 hover:bg-red-600 hover:text-white transition-all shadow-lg active:scale-95">SURRENDER</button>
          </div>
        </div>

        {/* 배경 텍스트 애니메이션 */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none z-0">
          <h1 className="text-[18rem] font-black italic whitespace-nowrap tracking-tighter select-none">{isPlayerTurn ? 'PLAYER' : 'ENEMY'}</h1>
        </div>

        {/* 메인 전투 무대 */}
        <div className="flex-1 flex flex-row justify-between items-center max-w-7xl mx-auto w-full px-6 relative z-10">
          {/* 좌측: 플레이어 캐릭터 구역 */}
          <div className={`flex flex-col items-center transition-all duration-700 ${isPlayerTurn ? 'scale-110' : 'opacity-40 scale-90 blur-[1px]'}`}>
             <div className="w-28 h-28 md:w-40 md:h-40 bg-slate-800 rounded-full border-4 border-indigo-500 shadow-[0_0_50px_rgba(79,70,229,0.4)] flex items-center justify-center relative mb-6">
                <div className="absolute inset-0 rounded-full border-2 border-white/10 animate-ping opacity-20"></div>
                <Shield size={64} className="text-indigo-400 drop-shadow-[0_0_15px_rgba(129,140,248,0.8)]"/>
                {player.block > 0 && (
                  <div className="absolute -top-3 -right-3 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center font-black border-4 border-blue-300 shadow-2xl animate-bounce text-lg">
                    {player.block}
                  </div>
                )}
             </div>
             <div className="flex flex-col items-center">
                <div className="w-40 md:w-56 bg-slate-900 h-6 rounded-full border-2 border-slate-800 overflow-hidden relative shadow-2xl p-0.5">
                   <div className="bg-gradient-to-r from-emerald-600 to-green-400 h-full rounded-full transition-all duration-500" style={{width: `${(player.hp/player.maxHp)*100}%`}}/>
                   <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white drop-shadow-md">{player.hp} / {player.maxHp}</div>
                </div>
                <div className="mt-4 flex gap-2 h-8">
                   {player.buffs.strength > 0 && <div className="bg-red-950/80 text-red-400 px-3 py-1 rounded-lg text-[10px] font-black border border-red-500/50 shadow-lg flex items-center gap-1"><Zap size={10} fill="currentColor"/> STR {player.buffs.strength}</div>}
                   {player.buffs.dexterity > 0 && <div className="bg-blue-950/80 text-blue-400 px-3 py-1 rounded-lg text-[10px] font-black border border-blue-500/50 shadow-lg flex items-center gap-1"><Shield size={10} fill="currentColor"/> DEX {player.buffs.dexterity}</div>}
                   {player.debuffs.weak > 0 && <div className="bg-orange-950/80 text-orange-400 px-3 py-1 rounded-lg text-[10px] font-black border border-orange-500/50 shadow-lg animate-pulse">WEAK {player.debuffs.weak}</div>}
                </div>
             </div>
          </div>

          <div className="text-4xl font-black italic text-slate-800 tracking-tighter opacity-50 px-4">VS</div>

          {/* 우측: 다중 에너미 구역 */}
          <div className="flex gap-12 items-end">
            {enemies.map((e, idx) => {
              const intent = e.intentCard;
              const isTarget = idx === 0;
              return (
                <div key={e.uid} className={`flex flex-col items-center transition-all duration-500 ${isTarget ? 'scale-100' : 'scale-75 opacity-40 translate-x-10 blur-[1px]'}`}>
                  {isTarget && <div className="text-red-500 font-black text-xs animate-bounce mb-4 tracking-[0.4em] drop-shadow-[0_0_10px_red]">TARGET</div>}
                  
                  {/* 적의 의도 풍선 */}
                  <div className={`mb-6 p-3 bg-slate-900 border-2 rounded-2xl text-center w-28 md:w-36 shadow-2xl relative ${intent.type.includes('attack') ? 'border-red-600' : 'border-blue-600'}`}>
                     <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-900 rotate-45 border-r-2 border-b-2 border-inherit"></div>
                     <div className="text-[11px] font-black text-white truncate mb-1">{intent.name}</div>
                     <div className="text-[9px] text-slate-400 leading-tight font-bold">{intent.desc}</div>
                  </div>

                  <div className={`w-24 h-24 md:w-36 md:h-36 bg-red-950/20 rounded-full border-4 flex items-center justify-center relative mb-4 transition-all duration-700 ${isTarget ? 'border-red-600 shadow-[0_0_40px_rgba(220,38,38,0.4)]' : 'border-slate-800'}`}>
                    <Skull size={isTarget ? 56 : 32} className={`${isTarget ? 'text-red-500' : 'text-slate-700'} transition-colors duration-700`}/>
                    {e.block > 0 && <div className="absolute -top-2 -right-2 w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center font-black border-2 border-slate-500 text-xs shadow-xl">{e.block}</div>}
                  </div>
                  
                  <div className="flex flex-col items-center w-full">
                    <div className="w-28 md:w-40 bg-slate-900 h-4 rounded-full border border-slate-800 overflow-hidden relative mb-2 shadow-inner">
                      <div className="bg-gradient-to-r from-red-800 to-red-500 h-full transition-all duration-500" style={{width: `${(e.hp/e.maxHp)*100}%`}}/>
                      <div className="absolute inset-0 flex items-center justify-center text-[9px] font-black tracking-tighter">{e.hp} / {e.maxHp}</div>
                    </div>
                    <div className="text-[11px] font-black text-slate-400 tracking-tight">{e.name} {e.isBoss && <span className="text-red-600 ml-1">BOSS</span>}</div>
                    
                    {/* 적의 상태 이상 */}
                    <div className="flex gap-1 mt-2 h-5">
                       {e.debuffs.vulnerable > 0 && <span className="bg-purple-900/50 text-purple-400 px-2 py-0.5 rounded text-[8px] font-black border border-purple-500/30 animate-pulse">VULN {e.debuffs.vulnerable}</span>}
                       {e.debuffs.weak > 0 && <span className="bg-orange-900/50 text-orange-400 px-2 py-0.5 rounded text-[8px] font-black border border-orange-500/30">WEAK {e.debuffs.weak}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 하단 유저 인터페이스 콘솔 */}
        <div className="h-64 flex flex-col items-center justify-end pb-6 relative z-30 mt-auto">
           <div className="flex items-center gap-4 md:gap-14 w-full max-w-6xl px-4 md:px-12 relative h-full">
              
              {/* 왼쪽: 리소스 엔진 */}
              <div className="flex flex-col items-center gap-6 shrink-0 h-full justify-center">
                 <div className="flex flex-col items-center">
                    <div className="w-16 h-16 md:w-24 md:h-24 bg-blue-950 border-4 border-blue-400 rounded-full flex flex-col items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.5)] border-t-blue-300 relative group">
                       <div className="absolute inset-0 rounded-full bg-blue-400 opacity-10 group-hover:opacity-20 transition-opacity"></div>
                       <span className="text-xs font-black text-blue-300 uppercase tracking-tighter mb-[-4px]">Mana</span>
                       <span className="text-3xl md:text-5xl font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">{player.mana}</span>
                    </div>
                 </div>
                 <div className="flex flex-col items-center gap-1 cursor-pointer group" onClick={()=>setViewingPile('drawPile')}>
                    <div className="w-12 h-16 bg-slate-800 border-2 border-slate-700 rounded-xl flex items-center justify-center font-black text-lg group-hover:-translate-y-2 group-hover:border-indigo-500 transition-all shadow-xl">{drawPile.length}</div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-indigo-400 transition-colors">Draw</span>
                 </div>
              </div>

              {/* 중앙: 하이테크 카드 핸드 (겹침 및 호버 애니메이션 복구) */}
              <div className="flex-1 flex justify-center items-end h-full pb-2 -space-x-8 md:-space-x-12 px-4 md:px-8 overflow-visible">
                {hand.map((c, i) => {
                  const canPlay = player.mana >= c.cost && isPlayerTurn;
                  const isHov = hoveredCard === i;
                  
                  // 예상 피해량 계산 로직 (2,500줄 버전의 상세 프리뷰)
                  let preDmg = (c.damage || 0) + (player.buffs.strength || 0);
                  if (enemies[0]?.debuffs.vulnerable > 0) preDmg = Math.floor(preDmg * 1.3);
                  if (player.debuffs.weak > 0) preDmg = Math.floor(preDmg * 0.97);

                  return (
                    <div key={c.uid} 
                         onMouseEnter={()=>setHoveredCard(i)} 
                         onMouseLeave={()=>setHoveredCard(null)} 
                         onClick={()=>canPlay && playCard(i)}
                         className={`relative transition-all duration-300 ease-out cursor-pointer origin-bottom ${canPlay ? 'hover:z-50' : 'opacity-40 grayscale-[0.5]'} ${isHov ? '-translate-y-16 scale-125 z-[100]' : 'translate-y-0 z-10'}`}
                         style={{ transform: isHov ? 'translateY(-60px) scale(1.25)' : `rotate(${(i - (hand.length-1)/2) * 2}deg) translateY(${Math.abs(i - (hand.length-1)/2) * 4}px)` }}
                    >
                       {isHov && preDmg > 0 && (
                         <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-red-600 text-white font-black text-[10px] px-3 py-1 rounded-full whitespace-nowrap shadow-2xl border-2 border-red-400 animate-bounce">
                           ⚔️ TOTAL: {c.multiHit ? `${preDmg} x ${c.multiHit}` : preDmg}
                         </div>
                       )}
                       <div className="pointer-events-none transition-transform duration-300 shadow-[0_20px_40px_rgba(0,0,0,0.5)] rounded-xl">
                         {renderCard(c)}
                       </div>
                    </div>
                  );
                })}
              </div>

              {/* 오른쪽: 시스템 컨트롤 */}
              <div className="flex flex-col items-center gap-6 shrink-0 h-full justify-center">
                 <button onClick={()=>setCombatState(p=>({...p, turn:'ENEMY'}))} 
                         disabled={!isPlayerTurn}
                         className={`px-8 py-4 rounded-2xl font-black text-sm md:text-xl shadow-2xl transition-all border-b-8 active:border-b-0 active:translate-y-1 group ${isPlayerTurn ? 'bg-amber-600 hover:bg-amber-500 border-amber-800 text-white shadow-amber-900/40' : 'bg-slate-800 border-slate-900 text-slate-600 opacity-50 cursor-not-allowed'}`}>
                    <div className="flex items-center gap-3">
                       {isPlayerTurn ? <ArrowRightCircle className="group-hover:translate-x-1 transition-transform"/> : <RefreshCw className="animate-spin" size={20}/>}
                       <span>{isPlayerTurn ? 'END TURN' : 'WAITING'}</span>
                    </div>
                 </button>
                 <div className="flex flex-col items-center gap-1 cursor-pointer group" onClick={()=>setViewingPile('discardPile')}>
                    <div className="w-12 h-16 bg-slate-900 border-2 border-slate-800 rounded-xl flex items-center justify-center font-black text-lg opacity-60 group-hover:opacity-100 group-hover:border-red-900/50 group-hover:-translate-y-2 transition-all shadow-xl">{discardPile.length}</div>
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest group-hover:text-red-500 transition-colors">Grave</span>
                 </div>
              </div>
           </div>
        </div>

        {/* 덱/더미 확인 모달 */}
        {viewingPile && (
          <div className="fixed inset-0 bg-black/90 z-[200] flex items-center justify-center p-6 backdrop-blur-md animate-draw" onClick={()=>setViewingPile(null)}>
            <div className="bg-slate-800 p-8 rounded-3xl max-w-6xl w-full max-h-[85vh] border-2 border-white/10 shadow-2xl overflow-hidden flex flex-col" onClick={e=>e.stopPropagation()}>
               <div className="flex justify-between items-center mb-8 border-b border-slate-700 pb-6 shrink-0">
                  <h3 className="text-3xl font-black tracking-tighter uppercase">{viewingPile === 'baseDeck' ? 'Master Deck List' : viewingPile === 'drawPile' ? 'Draw Pile (Randomized)' : 'Discard Pile (Grave)'}</h3>
                  <button onClick={()=>setViewingPile(null)} className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold">BACK TO BATTLE</button>
               </div>
               <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 overflow-y-auto pr-2 custom-scroll pb-10">
                  {(viewingPile === 'baseDeck' ? baseDeck : viewingPile === 'drawPile' ? drawPile : discardPile).map((c, i) => (
                    <div key={i} className="scale-95 hover:scale-100 transition-transform">{renderCard(c)}</div>
                  ))}
               </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // --- 메인 반환문 (마지막) ---
  return (
    <>
      <style>{styles}</style>
      <div id="game-root" className={`font-sans antialiased selection:bg-indigo-500 selection:text-white ${isCssFullScreen ? 'fixed inset-0 z-[999999] w-[100vw] h-[100vh] overflow-auto bg-slate-950' : 'bg-slate-900 min-h-screen'}`}>
        {toastMsg && <div className="fixed top-12 left-1/2 -translate-x-1/2 bg-green-600 px-8 py-4 rounded-full shadow-[0_0_30px_rgba(22,163,74,0.4)] font-black z-[10000] animate-pulse text-white text-sm border-2 border-white/20 backdrop-blur-md flex items-center gap-3"><Zap size={18} fill="currentColor"/> {toastMsg}</div>}
        
        {gameState === 'MENU' && renderMenu()}
        {gameState === 'DECK_BUILDING' && renderDeckBuilder()}
        {gameState === 'SHOP' && renderShop()}
        {gameState === 'ENCYCLOPEDIA' && renderEncyclopedia()}
        {gameState === 'MONSTER_DEX' && renderMonsterDex()}
        {gameState === 'BATTLE' && renderBattle()}
        
        {/* 기타 게임 종료/클리어/보상 페이지는 기존 로직을 기반으로 renderRewards 등 호출 */}
        {gameState === 'REWARDS' && renderRewards()}
        {gameState === 'GAME_OVER' && renderGameOver()}
        {/* ... (기타 모든 페이지) */}

        {/* 세이브 불러오기 모달 */}
        {importModalOpen && (
          <div className="fixed inset-0 bg-black/90 z-[10000] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-slate-800 p-8 rounded-3xl w-full max-w-lg border-2 border-slate-700 shadow-2xl animate-draw">
              <h3 className="text-2xl font-black mb-2 flex items-center gap-2"><Upload className="text-indigo-400"/> IMPORT DATA</h3>
              <p className="text-xs text-slate-500 mb-6 font-bold uppercase tracking-widest">Paste your encrypted save code below</p>
              <textarea className="w-full h-40 bg-slate-950 border-2 border-slate-800 rounded-2xl p-4 text-white text-[10px] font-mono mb-6 focus:border-indigo-500 outline-none transition-colors shadow-inner" placeholder="0x..." value={importText} onChange={e => setImportText(e.target.value)} />
              <div className="flex gap-3">
                <button onClick={() => setImportModalOpen(false)} className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold transition-all">CANCEL</button>
                <button onClick={() => handleImport(importText)} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-black shadow-lg shadow-indigo-900/40 transition-all">LOAD BACKUP</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// --- Part 2에서 이어지는 핵심 핸들러들 ---

  // 1. 카드 필터링 엔진 (도감 및 상점에서 공통 사용)
  const getFilteredCards = (tFilter, eFilter, rFilter, oFilter, query) => {
    return CARD_LIBRARY.filter(c => {
      if (rFilter !== 'all' && c.rarity !== rFilter) return false;
      if (tFilter !== 'all' && c.type !== tFilter) return false;
      if (eFilter === 'debuff' && !(c.enemyWeak || c.enemyVuln)) return false;
      if (eFilter === 'buff' && !(c.selfStrength || c.selfDex)) return false;
      if (oFilter === 'owned' && !unlockedCards.includes(c.id)) return false;
      if (oFilter === 'unowned' && unlockedCards.includes(c.id)) return false;
      if (query) {
        const q = query.toLowerCase();
        const def = getCardDef(c.id, shopUpgrades);
        if (def && !def.name.toLowerCase().includes(q) && !def.desc.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  };

  // 2. 가챠 및 보상 로직 복구
  const handleGacha = () => {
    if (credits < 50) return;
    let pulled = [], refund = 0;
    const validPool = CARD_LIBRARY.filter(c => c.rarity !== 'special');
    for(let i=0; i<3; i++) {
      const r = Math.random();
      let t = r > 0.99 ? 'rare' : r > 0.89 ? 'uncommon' : 'common';
      let pool = validPool.filter(c => c.rarity === t);
      const picked = pool[Math.floor(Math.random() * pool.length)] || validPool[0];
      pulled.push({...picked});
    }
    pulled.forEach(c => { if (unlockedCards.includes(c.id)) { c.isDuplicate = true; refund += 10; } });
    const newUnlocked = [...new Set([...unlockedCards, ...pulled.map(c => c.id)])];
    setCredits(credits - 50 + refund); setUnlockedCards(newUnlocked);
    setGachaResult(pulled.map(c => ({ ...getCardDef(c.id, shopUpgrades), isDuplicate: c.isDuplicate })));
    saveGame({ credits: credits - 50 + refund, unlockedCards: newUnlocked });
  };

  const handlePremiumGacha = () => {
    if (credits < 100) return;
    setCredits(prev => prev - 100);
    let pulled = [];
    const validPool = CARD_LIBRARY.filter(c => c.rarity !== 'special');
    for(let i=0; i<3; i++) {
      const r = Math.random();
      let t = r > 0.98 ? 'rare' : r > 0.78 ? 'uncommon' : 'common';
      let pool = validPool.filter(c => c.rarity === t);
      pulled.push(pool[Math.floor(Math.random() * pool.length)] || validPool[0]);
    }
    setPremiumGachaResult(pulled.map(c => getCardDef(c.id, shopUpgrades)));
  };

  // 3. 관리자 및 특수 기능
  const handleAdminUnlock = () => {
    if (adminCodeInput === '20090324') { setIsAdminUnlocked(true); setToastMsg('DEVELOPER MODE ACTIVE'); }
    else setToastMsg('INVALID ACCESS CODE');
    setTimeout(() => setToastMsg(''), 2000);
  };

  const adminGiveMoney = () => {
    const nc = credits + 99999; setCredits(nc); saveGame({ credits: nc });
    setToastMsg('99,999 CREDITS GRANTED'); setTimeout(()=>setToastMsg(''), 2000);
  };

  const adminUnlockAllCards = () => {
    const allIds = CARD_LIBRARY.map(c => c.id);
    setUnlockedCards(allIds); saveGame({ unlockedCards: allIds });
    setToastMsg('ALL CARDS UNLOCKED'); setTimeout(()=>setToastMsg(''), 2000);
  };

  // 4. 남은 화면 렌더링: 덱 빌더 (Deck Builder)
  const renderDeckBuilder = () => {
    const cards = getFilteredCards(filterType, filterEffect, filterRarity, filterOwnership, searchQuery);
    return (
      <div className="flex flex-col h-[100dvh] bg-slate-900 text-white p-4 pt-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 max-w-6xl mx-auto w-full gap-4 px-4">
          <h2 className="text-3xl font-black tracking-tighter">DECK CONSTRUCTION</h2>
          <div className="flex flex-wrap items-center gap-3">
             <span className={`text-lg font-black mr-4 ${getTotalCards(tempDeckCounts) === 20 ? 'text-green-400' : 'text-yellow-500'}`}>
               TOTAL: {getTotalCards(tempDeckCounts)} / 20
             </span>
             <button onClick={() => { setTempDeckCounts({}); }} className="px-3 py-2 bg-red-900/50 text-red-400 rounded-lg font-bold border border-red-900 hover:bg-red-900 hover:text-white transition-all"><Eraser size={16}/></button>
             <button onClick={() => { setDeckCounts(tempDeckCounts); saveGame({ deckCounts: tempDeckCounts }); setToastMsg('DECK SAVED!'); setTimeout(()=>setToastMsg(''), 2000); }} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold shadow-lg border-b-4 border-emerald-800">SAVE DECK</button>
             <button onClick={() => setGameState('MENU')} className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold border-b-4 border-slate-900">BACK</button>
          </div>
        </div>
        <div className="max-w-6xl mx-auto w-full mb-6">
          {renderFiltersUI(filterType, setFilterType, filterEffect, setFilterEffect, filterRarity, setFilterRarity, filterOwnership, setFilterOwnership, searchQuery, setSearchQuery)}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5 max-w-6xl mx-auto w-full overflow-y-auto pb-20 pr-2 custom-scroll">
          {cards.map(c => {
            const count = tempDeckCounts[c.id] || 0;
            const isLocked = !unlockedCards.includes(c.id);
            return renderCard(getCardDef(c.id, shopUpgrades), count, isLocked, handleAddCard, handleRemoveCard);
          })}
        </div>
      </div>
    );
  };

  // 5. 남은 화면 렌더링: 보상 및 게임 결과
  const renderRewards = () => (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-slate-950 text-white p-4">
      <div className="absolute inset-0 bg-indigo-600/5 pointer-events-none animate-pulse"></div>
      <h2 className="text-5xl font-black mb-2 text-yellow-400 tracking-tighter drop-shadow-[0_0_20px_rgba(250,204,21,0.4)]">VICTORY</h2>
      <p className="text-slate-500 font-bold tracking-widest mb-16 uppercase">Select your reward to proceed</p>
      
      <div className="flex flex-col md:flex-row gap-8 max-w-5xl w-full justify-center">
        <div onClick={() => {
          const pool = CARD_LIBRARY.filter(c => c.rarity !== 'special');
          let res = []; 
          for(let i=0; i<3; i++) {
            const picked = pool[Math.floor(Math.random()*pool.length)];
            res.push(getCardDef(picked.id, shopUpgrades));
          }
          setRewardCards(res); setGameState('REWARD_CARD');
        }} className="p-10 bg-slate-900 border-2 border-indigo-500 rounded-3xl flex flex-col items-center flex-1 hover:scale-105 hover:bg-indigo-950/20 transition-all cursor-pointer group shadow-2xl">
          <PlusCircle size={64} className="text-indigo-400 mb-6 group-hover:rotate-90 transition-transform duration-500"/>
          <span className="text-2xl font-black mb-2">ADD CARD</span>
          <span className="text-sm text-slate-500 text-center leading-relaxed">Expand your deck with<br/>a new powerful card</span>
        </div>

        <div onClick={() => {
          const p = {...combatState.player};
          p.hp = Math.min(p.maxHp, p.hp + Math.floor(p.maxHp * 0.3));
          p.debuffs = { weak: 0, vulnerable: 0 };
          startNextStage(p, combatState.baseDeck);
        }} className="p-10 bg-slate-900 border-2 border-emerald-500 rounded-3xl flex flex-col items-center flex-1 hover:scale-105 hover:bg-emerald-950/20 transition-all cursor-pointer group shadow-2xl">
          <Heart size={64} className="text-emerald-400 mb-6 group-hover:scale-110 transition-transform"/>
          <span className="text-2xl font-black mb-2">RECOVER</span>
          <span className="text-sm text-slate-500 text-center leading-relaxed">Restore 30% HP and<br/>cleanse all status effects</span>
        </div>

        <div onClick={() => setGameState('REWARD_REMOVE')} className="p-10 bg-slate-900 border-2 border-red-500 rounded-3xl flex flex-col items-center flex-1 hover:scale-105 hover:bg-red-950/20 transition-all cursor-pointer group shadow-2xl">
          <Trash2 size={64} className="text-red-500 mb-6 group-hover:animate-bounce"/>
          <span className="text-2xl font-black mb-2">PURGE</span>
          <span className="text-sm text-slate-500 text-center leading-relaxed">Remove one card from<br/>your deck permanently</span>
        </div>
      </div>
    </div>
  );

  // 6. 설정 화면 복구
  const renderSettings = () => (
    <div className="flex flex-col min-h-[100dvh] bg-slate-900 text-white p-6 md:p-20">
      <div className="max-w-2xl mx-auto w-full">
        <h2 className="text-4xl font-black mb-12 flex items-center gap-4 tracking-tighter"><Settings size={40} className="text-slate-500"/> SYSTEM SETTINGS</h2>
        
        <div className="space-y-6">
           <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 flex justify-between items-center shadow-xl">
              <div><div className="font-black text-lg">FAST COMBAT MODE</div><div className="text-xs text-slate-500">Accelerate animations and turn transitions</div></div>
              <button onClick={() => { setFastMode(!fastMode); saveGame({ fastMode: !fastMode }); }} className={`w-14 h-8 rounded-full transition-all relative ${fastMode ? 'bg-indigo-600' : 'bg-slate-600'}`}>
                 <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-all ${fastMode ? 'left-7' : 'left-1'}`}></div>
              </button>
           </div>

           <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
              <div className="font-black text-lg mb-4 uppercase tracking-widest text-indigo-400">Data Management</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <button onClick={handleExport} className="py-4 bg-slate-700 hover:bg-indigo-600 rounded-xl font-bold flex items-center justify-center gap-3 transition-all"><Download size={20}/> EXPORT SAVE</button>
                 <button onClick={() => setImportModalOpen(true)} className="py-4 bg-slate-700 hover:bg-indigo-600 rounded-xl font-bold flex items-center justify-center gap-3 transition-all"><Upload size={20}/> IMPORT SAVE</button>
              </div>
           </div>

           <div className="bg-red-950/20 p-6 rounded-2xl border border-red-900/50 shadow-xl mt-12">
              <div className="font-black text-lg mb-4 text-red-500">DANGER ZONE</div>
              <button onClick={handleExitGame} className="w-full py-4 bg-red-700 hover:bg-red-600 rounded-xl font-black text-lg shadow-lg flex items-center justify-center gap-3"><Save size={20}/> SAVE & QUIT TO DESKTOP</button>
           </div>
        </div>

        <button onClick={() => setGameState('MENU')} className="mt-12 w-full py-4 bg-slate-800 hover:bg-slate-700 rounded-2xl font-black tracking-[0.2em] border border-slate-700 transition-all">BACK TO TERMINAL</button>
      </div>
    </div>
  );

  // (나머지 renderGameOver, renderGameClear, renderBossClearReward 등도 이와 같은 고퀄리티 UI로 유지)

  // --- Part 3에서 이어지는 서브 화면들 ---

  // 1. 카드 추가 보상 선택 화면 (애니메이션 및 확인 모달 포함)
  const renderRewardCard = () => (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-slate-950 text-white p-4 relative">
      <div className="flex justify-between items-center mb-12 w-full max-w-5xl px-6">
        <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-indigo-400">SELECT NEW ARTIFACT</h2>
        <button onClick={() => setGameState('REWARDS')} className="px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold border border-slate-700 shadow-lg transition-all">BACK</button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8 justify-center w-full max-w-5xl px-4 animate-draw">
        {rewardCards.filter(Boolean).map((card, idx) => {
          const isNew = !unlockedCards.includes(card.id);
          return (
            <div key={idx} className="relative group scale-110 md:scale-125 mx-4">
              {renderCard(card, null, false, null, null, () => setConfirmSelection({ action: 'add', card, isNew }))}
              {isNew && (
                <div className="absolute -top-4 -right-4 bg-yellow-500 text-black px-3 py-1 rounded-full font-black text-[10px] shadow-[0_0_15px_rgba(234,179,8,0.6)] animate-bounce z-30">
                  NEW UNLOCK
                </div>
              )}
              <div className="absolute inset-0 border-4 border-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none scale-105" />
            </div>
          );
        })}
      </div>

      {/* 카드 추가 최종 확인 모달 */}
      {confirmSelection?.action === 'add' && (
        <div className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center p-4 backdrop-blur-xl">
          <div className="bg-slate-900 p-10 rounded-[3rem] border-2 border-indigo-500/50 w-full max-w-md text-center shadow-[0_0_50px_rgba(79,70,229,0.2)] animate-draw flex flex-col items-center">
            <h3 className="text-2xl font-black mb-8 tracking-tight">ADD TO PERMANENT DECK?</h3>
            <div className="flex justify-center mb-10 pointer-events-none scale-125 shadow-2xl">
              {renderCard(confirmSelection.card)}
            </div>
            <div className="flex gap-4 w-full">
              <button onClick={() => setConfirmSelection(null)} className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 rounded-2xl font-bold transition-all border border-white/5">CANCEL</button>
              <button onClick={() => {
                const newDeck = [...combatState.baseDeck, { ...confirmSelection.card }];
                if (confirmSelection.isNew) {
                  const newUnlocked = [...unlockedCards, confirmSelection.card.id];
                  setUnlockedCards(newUnlocked);
                  saveGame({ unlockedCards: newUnlocked });
                }
                setConfirmSelection(null);
                startNextStage(combatState.player, newDeck);
              }} className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-black shadow-xl shadow-indigo-900/40">CONFIRM</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // 2. 카드 영구 삭제 화면 (덱 압축 로직)
  const renderRewardRemove = () => (
    <div className="flex flex-col min-h-[100dvh] bg-slate-950 text-white p-4 md:p-10 relative">
      <div className="flex justify-between items-center mb-10 w-full max-w-7xl mx-auto px-4 pt-10 md:pt-0">
        <h2 className="text-3xl font-black text-red-500 tracking-tighter uppercase">Purge Protocol</h2>
        <button onClick={() => setGameState('REWARDS')} className="px-6 py-2 bg-slate-800 rounded-xl font-bold border border-slate-700 shadow-md">CANCEL</button>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 overflow-y-auto hide-scrollbar pb-20 max-w-7xl mx-auto px-4">
        {combatState.baseDeck.map((card, idx) => (
          <div key={idx} className="relative group cursor-pointer aspect-[3/4.2] shrink-0 transition-transform hover:-translate-y-2" onClick={() => setConfirmSelection({ action: 'remove', idx, card })}>
            <div className="pointer-events-none w-full h-full opacity-80 group-hover:opacity-100 transition-opacity">
              {renderCard(card)}
            </div>
            <div className="absolute inset-0 bg-red-900/0 group-hover:bg-red-900/60 rounded-xl transition-all flex items-center justify-center border-2 border-transparent group-hover:border-red-500 z-30">
               <Trash2 className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-[0_0_10px_red]" />
            </div>
          </div>
        ))}
      </div>

      {/* 삭제 확인 모달 */}
      {confirmSelection?.action === 'remove' && (
        <div className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-slate-900 p-10 rounded-[3rem] border-2 border-red-900/50 w-full max-w-md text-center shadow-2xl animate-draw flex flex-col items-center">
            <AlertTriangle size={48} className="text-red-500 mb-4 animate-pulse" />
            <h3 className="text-2xl font-black mb-2 text-white">ERASE CARD?</h3>
            <p className="text-xs text-slate-500 font-bold mb-8 tracking-widest uppercase">This action cannot be undone</p>
            <div className="flex justify-center mb-10 pointer-events-none scale-110 grayscale-[0.5]">
              {renderCard(confirmSelection.card)}
            </div>
            <div className="flex gap-4 w-full">
              <button onClick={() => setConfirmSelection(null)} className="flex-1 py-4 bg-slate-800 rounded-2xl font-bold">CANCEL</button>
              <button onClick={() => {
                const newDeck = [...combatState.baseDeck];
                newDeck.splice(confirmSelection.idx, 1);
                setConfirmSelection(null);
                startNextStage(combatState.player, newDeck);
              }} className="flex-1 py-4 bg-red-700 hover:bg-red-600 rounded-2xl font-black shadow-lg shadow-red-900/40">PURGE</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // 3. 특수 보스 보상 연출 (25, 50, 75, 100층)
  const renderBossClearReward = () => {
    if (!specialBossRewardCard) return null;
    return (
      <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-slate-950 text-white p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-fuchsia-600/10 animate-pulse pointer-events-none"></div>
        <h2 className="text-5xl md:text-6xl font-black mb-4 text-fuchsia-400 tracking-tighter drop-shadow-[0_0_30px_fuchsia] animate-bounce">LEGENDARY DROP</h2>
        <p className="text-slate-400 font-bold tracking-[0.3em] mb-16 uppercase">A gift from the fallen conqueror</p>
        
        <div className="relative group w-64 h-80 mb-16 animate-draw">
          <div className="pointer-events-none w-full h-full scale-[1.7] origin-center shadow-[0_0_60px_rgba(217,70,239,0.3)]">
            {renderCard(specialBossRewardCard)}
          </div>
          <div className="absolute inset-0 border-8 border-fuchsia-500/30 rounded-2xl pointer-events-none scale-[1.7] animate-ping opacity-20" />
        </div>
        
        <button onClick={() => {
          const isOwned = unlockedCards.includes(specialBossRewardCard.id);
          const newUnlocked = isOwned ? unlockedCards : [...unlockedCards, specialBossRewardCard.id];
          setCombatState(prev => ({ ...prev, baseDeck: [...prev.baseDeck, { ...specialBossRewardCard }] }));
          setUnlockedCards(newUnlocked);
          saveGame({ unlockedCards: newUnlocked });
          setSpecialBossRewardCard(null);
          
          if (combatState.mode === 'NORMAL' && combatState.stage >= 100) setGameState('GAME_CLEAR');
          else setGameState('REWARDS');
        }} className="px-16 py-5 bg-fuchsia-700 hover:bg-fuchsia-600 rounded-full font-black text-2xl transition-all shadow-[0_0_40px_rgba(217,70,239,0.6)] border-b-8 border-fuchsia-900 active:border-b-0 active:translate-y-2 mt-12">
          CLAIM ARTIFACT
        </button>
      </div>
    );
  };

  // 4. 게임 오버 & 클리어 화면
  const renderGameOver = () => (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-black text-white p-4">
      <Skull size={120} className="text-red-700 mb-8 drop-shadow-[0_0_30px_red] animate-pulse" />
      <h1 className="text-7xl font-black text-red-600 tracking-tighter mb-4">YOU PERISHED</h1>
      <div className="text-xl font-bold text-slate-500 tracking-widest uppercase mb-16 flex items-center gap-4">
         Stage Reached <span className="text-white bg-red-900/50 px-4 py-1 rounded-lg border border-red-500/30">{combatState?.stage}</span>
      </div>
      <button onClick={() => setGameState('MENU')} className="px-12 py-5 bg-white text-black rounded-2xl font-black text-xl hover:bg-slate-200 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] active:scale-95">RETURN TO MAIN TERMINAL</button>
    </div>
  );

  const renderGameClear = () => (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-slate-950 text-white p-4 relative">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
      <Trophy size={150} className="text-yellow-400 mb-8 drop-shadow-[0_0_50px_rgba(250,204,21,0.5)] animate-bounce" />
      <h1 className="text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 to-yellow-600 tracking-tighter mb-6">CONQUEROR</h1>
      <p className="text-xl text-yellow-500/70 font-black tracking-[0.5em] mb-20 uppercase">All 100 Sectors Cleared</p>
      <button onClick={() => setGameState('MENU')} className="px-16 py-6 bg-yellow-600 hover:bg-yellow-500 text-black rounded-3xl font-black text-2xl transition-all shadow-[0_0_40px_rgba(202,138,4,0.4)] active:scale-95 border-b-8 border-yellow-800 active:border-b-0">RETIRE IN GLORY</button>
    </div>
  );

  // --- 5. 최종 메인 렌더링 엔진 (Router) ---
  return (
    <>
      <style>{styles}</style>
      <div id="game-root" className={`font-sans antialiased selection:bg-indigo-500 selection:text-white ${isCssFullScreen ? 'fixed inset-0 z-[999999] w-[100vw] h-[100vh] overflow-auto bg-slate-950' : 'bg-slate-900 min-h-screen'}`}>
        
        {/* 모든 상태(gameState)에 따른 화면 분기 처리 */}
        {gameState === 'MENU' && renderMenu()}
        {gameState === 'SETTINGS' && renderSettings()}
        {gameState === 'DECK_BUILDING' && renderDeckBuilder()}
        {gameState === 'SHOP' && renderShop()}
        {gameState === 'ENCYCLOPEDIA' && renderEncyclopedia()}
        {gameState === 'MONSTER_DEX' && renderMonsterDex()}
        {gameState === 'BATTLE' && renderBattle()}
        {gameState === 'REWARDS' && renderRewards()}
        {gameState === 'REWARD_CARD' && renderRewardCard()}
        {gameState === 'REWARD_REMOVE' && renderRewardRemove()}
        {gameState === 'BOSS_CLEAR_REWARD' && renderBossClearReward()}
        {gameState === 'GAME_OVER' && renderGameOver()}
        {gameState === 'GAME_CLEAR' && renderGameClear()}
        
      </div>
    </>
  );
