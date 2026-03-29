import React, { useState, useEffect } from 'react';
import { Sword, Shield, Zap, Heart, RefreshCw, Skull, ArrowRightCircle, Lock, Save, PlusCircle, Trash2, Store, Coins, AlertTriangle, Info, Maximize, Gift, Book, Trophy, Settings, FastForward, Eraser, Download, Upload, Search, HelpCircle, FileQuestion, Star } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

// 오직 순수 데이터와 로직만 외부에서 가져옵니다. (UI 컴포넌트는 App.jsx 내부에 둡니다)
import { CARD_LIBRARY, BASE_CARDS, GAME_RULES, ENEMIES, NORMAL_BOSSES, SPECIAL_BOSSES, MANA_CARD_IDS } from './constants/gameData';
import { shuffle, decayStack, getCardDef, generateEnemies, generateEnemyIntent, validateDeckStatus } from './utils/gameLogic';

// Firebase 초기화
const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{"projectId":"dummy"}');
let app, auth, db;
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch(e) {}
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// 글로벌 애니메이션 및 스타일
const styles = `
  @keyframes drawCard { 0% { transform: translateY(100px) scale(0.8); opacity: 0; } 100% { transform: translateY(0) scale(1); opacity: 1; } }
  .animate-draw { animation: drawCard 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; opacity: 0; }
  .hide-scrollbar::-webkit-scrollbar { display: none; }
  .tooltip-trigger { position: relative; z-index: 50; }
  .tooltip-trigger .tooltip-content { visibility: hidden; opacity: 0; transition: opacity 0.2s; position: absolute; z-index: 99999; }
  .tooltip-trigger:hover .tooltip-content { visibility: visible; opacity: 1; }
  .legendary-bg { background: linear-gradient(135deg, rgba(15,23,42,1) 0%, rgba(69,26,3,0.8) 100%); }
  .special-bg { background: linear-gradient(135deg, rgba(30,0,50,1) 0%, rgba(100,0,100,0.8) 100%); }
  html { -webkit-text-size-adjust: none; text-size-adjust: none; font-size: 14px; }
  @media (min-width: 768px) { html { font-size: 16px; } }
  #game-root { width: 100%; min-height: 100dvh; overflow-x: hidden; }
`;

export default function App() {
  // --- 1. 전체 상태(State) 선언 ---
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
  const [shopFilterRarity, setShopFilterRarity] = useState('all');
  const [shopSearchQuery, setShopSearchQuery] = useState('');
  const [hideMaxedUpgrades, setHideMaxedUpgrades] = useState(false);
  const [isUpgradesCollapsed, setIsUpgradesCollapsed] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [confirmSelection, setConfirmSelection] = useState(null);
  const [tutorialModalOpen, setTutorialModalOpen] = useState(false);
  const [dexViewingEnemy, setDexViewingEnemy] = useState(null);
  const [isCssFullScreen, setIsCssFullScreen] = useState(false);
  const [isActionLocked, setIsActionLocked] = useState(false);

  // --- 2. 헬퍼 및 세이브 엔진 ---
  const getTotalCards = (counts = deckCounts) => Object.values(counts || {}).reduce((a, b) => a + b, 0);

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

  useEffect(() => {
    const savedData = localStorage.getItem('roguelike_tactics_save');
    if (savedData) {
      const data = JSON.parse(savedData);
      if (data.deckCounts) setDeckCounts(data.deckCounts);
      if (data.unlockedCards) setUnlockedCards(data.unlockedCards);
      if (data.credits !== undefined) setCredits(data.credits);
      if (data.shopUpgrades) setShopUpgrades(data.shopUpgrades);
      if (data.normalCleared !== undefined) setNormalCleared(data.normalCleared);
      if (data.fastMode !== undefined) setFastMode(data.fastMode);
      if (data.maxStageReached !== undefined) setMaxStageReached(data.maxStageReached);
      if (data.seenEnemies) setSeenEnemies(data.seenEnemies);
    }
  }, []);

  const saveGame = async (payload = {}) => {
    const currentSave = { deckCounts, unlockedCards, credits, shopUpgrades, normalCleared, fastMode, maxStageReached, seenEnemies, ...payload };
    try { localStorage.setItem('roguelike_tactics_save', JSON.stringify(currentSave)); } catch (e) {}
    if (!user || !db) return;
    try {
      const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'gameSave', 'data');
      await setDoc(docRef, currentSave);
    } catch (e) {}
  };

  const handleExport = () => {
    const data = JSON.stringify({ deckCounts, unlockedCards, credits, shopUpgrades, normalCleared, fastMode, maxStageReached, seenEnemies });
    navigator.clipboard.writeText(btoa(encodeURIComponent(data)));
    setToastMsg('전체 세이브 코드가 복사되었습니다!');
    setTimeout(() => setToastMsg(''), 2000);
  };

  const handleImport = (encoded) => {
    try {
      const data = JSON.parse(decodeURIComponent(atob(encoded)));
      if (data.deckCounts && data.unlockedCards) {
        setDeckCounts(data.deckCounts);
        setUnlockedCards(data.unlockedCards);
        if(data.credits !== undefined) setCredits(data.credits);
        if(data.shopUpgrades) setShopUpgrades(data.shopUpgrades);
        if(data.fastMode !== undefined) setFastMode(data.fastMode);
        saveGame(data);
        setToastMsg('데이터를 성공적으로 불러왔습니다!');
        setImportModalOpen(false);
      }
    } catch(e) { setToastMsg('잘못된 코드입니다.'); }
  };

  const handleExitGame = async () => {
    setToastMsg('저장 중...');
    await saveGame();
    if (window.require) window.close(); else setGameState('MENU');
  };

  // --- 3. 전투 및 게임 로직 ---
  const startBattle = (mode = 'NORMAL', startingStage = 1) => {
    let fullDeck = [];
    Object.keys(deckCounts).forEach(id => {
      const def = getCardDef(id, shopUpgrades);
      for (let i = 0; i < deckCounts[id]; i++) if (def) fullDeck.push({ ...def });
    });
    const shuffled = shuffle(fullDeck);
    let initialDraw = [...shuffled], initialHand = [];
    for(let i=0; i<5; i++) if(initialDraw.length > 0) initialHand.push({ ...initialDraw.pop(), uid: Math.random().toString() });
    const hp = GAME_RULES.BASE_HP + (shopUpgrades.maxHp * GAME_RULES.HP_PER_UPGRADE);
    const enemies = generateEnemies(startingStage);
    
    // 조우한 적 도감에 추가
    let newSeen = [...seenEnemies];
    let updated = false;
    enemies.forEach(e => {
      if (!newSeen.includes(e.template.name)) { newSeen.push(e.template.name); updated = true; }
    });
    if (updated) { setSeenEnemies(newSeen); saveGame({ seenEnemies: newSeen }); }

    setCombatState({
      mode, stage: startingStage, hand: initialHand, drawPile: initialDraw, discardPile: [], turn: 'PLAYER', baseDeck: fullDeck,
      player: { hp, maxHp: hp, mana: GAME_RULES.INITIAL_MANA, maxMana: GAME_RULES.INITIAL_MANA, block: 0, debuffs: { weak: 0, vulnerable: 0 }, buffs: { strength: 0, dexterity: 0 } },
      enemies: enemies
    });
    setGameState('BATTLE');
  };

  const startNextStage = (newPlayer, newBaseDeck) => {
    const nextStage = combatState.stage + 1;
    const enemies = generateEnemies(nextStage);
    
    let newSeen = [...seenEnemies];
    let updated = false;
    enemies.forEach(e => {
      if (!newSeen.includes(e.template.name)) { newSeen.push(e.template.name); updated = true; }
    });
    if (updated) { setSeenEnemies(newSeen); saveGame({ seenEnemies: newSeen }); }

    const reshuffled = shuffle([...newBaseDeck]);
    let startDraw = [...reshuffled], startHand = [];
    for(let i=0; i<5; i++) if(startDraw.length > 0) startHand.push({ ...startDraw.pop(), uid: Math.random().toString() });
    
    setCombatState({
      ...combatState, stage: nextStage, enemies, baseDeck: newBaseDeck, hand: startHand, drawPile: startDraw, discardPile: [], turn: 'PLAYER',
      player: { ...newPlayer, block: 0, mana: newPlayer.maxMana, debuffs: {weak: 0, vulnerable: 0}, buffs: newPlayer.buffs || { strength: 0, dexterity: 0 } }
    });
    setRewardCards([]); 
    setGameState('BATTLE');
  };

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
      
      for(let i=0; i<(card.draw || 0); i++) {
        if(newHand.length >= GAME_RULES.MAX_HAND_SIZE - 1) break;
        if(newDraw.length === 0) { if(newDiscard.length === 0) break; newDraw = shuffle(newDiscard); newDiscard = []; }
        if(newDraw.length > 0) newHand.push({ ...newDraw.pop(), uid: Math.random().toString() });
      }
      newHand.splice(cardIndex, 1); newDiscard.push(card);

      if (newEnemies.length === 0) {
        if (prev.stage >= maxStageReached) { setMaxStageReached(prev.stage + 1); saveGame({ maxStageReached: prev.stage + 1 }); }
        let earned = 5 + prev.stage + (Math.floor(prev.stage / 5) * 5);
        if (prev.stage % 5 === 0) earned += 15;
        setCredits(credits + earned); saveGame({ credits: credits + earned });
        
        const spec = (st) => {
          if (st === 25) return CARD_LIBRARY.find(c => c.id === 'spider_queen_poison');
          if (st === 50) return CARD_LIBRARY.find(c => c.id === 'twerking');
          if (st === 75) return CARD_LIBRARY.find(c => c.id === 'power_of_asura');
          if (st === 100) return (card.rarity === 'special' || card.rarity === 'rare') && Math.random() < 0.25 ? CARD_LIBRARY.find(c => c.id === 'furioso') : CARD_LIBRARY.find(c => c.id === 'slime_snot');
          return null;
        };
        const reward = spec(prev.stage);
        if (reward) { setSpecialBossRewardCard(reward); setTimeout(() => setGameState('BOSS_CLEAR_REWARD'), 600); }
        else if (prev.mode === 'NORMAL' && prev.stage >= 100) { setNormalCleared(true); saveGame({ normalCleared: true }); setGameState('GAME_CLEAR'); }
        else setTimeout(() => setGameState('REWARDS'), 600);
        return { ...prev, player: p, enemies: [], hand: [], discardPile: [], drawPile: [] };
      }
      return { ...prev, player: p, enemies: newEnemies, hand: newHand, discardPile: newDiscard, drawPile: newDraw };
    });
  };

  useEffect(() => {
    if (gameState !== 'BATTLE' || !combatState || combatState.turn !== 'ENEMY') return;
    const timer = setTimeout(() => {
      setCombatState(prev => {
        let p = { ...prev.player }, newEnemies = prev.enemies.map(e => ({ ...e, block: 0 }));
        newEnemies.forEach(e => {
          if (e.passives?.some(pass => pass.id === 'scaling_strength')) e.buffs.strength = (e.buffs.strength || 0) + 3;
          let card = e.intentCard;
          if (card.type.includes('attack')) {
            let dmg = card.value + (e.buffs.strength || 0);
            if (p.debuffs.vulnerable > 0) dmg = Math.floor(dmg * 1.3);
            if (e.debuffs.weak > 0) dmg = Math.floor(dmg * 0.97);
            for(let i=0; i<(card.multi || 1); i++) {
              if (p.block >= dmg) p.block -= dmg; else { p.hp -= (dmg - p.block); p.block = 0; }
            }
          }
          if (card.type.includes('debuff')) {
            if (card.debuff === 'weak') p.debuffs.weak += card.turns;
            if (card.debuff === 'vulnerable') p.debuffs.vulnerable += card.turns;
          }
          if (card.type.includes('defend')) e.block += card.value;
          if (card.type.includes('buff') && card.buff === 'strength') e.buffs.strength += card.buffValue;
          if (card.type.includes('heal')) e.hp = Math.min(e.maxHp, e.hp + (card.heal || 0));
          e.debuffs.weak = decayStack(e.debuffs.weak);
          e.debuffs.vulnerable = decayStack(e.debuffs.vulnerable);
          e.buffs.strength = decayStack(e.buffs.strength);
          e.intentCard = generateEnemyIntent(e.template, prev.stage);
        });
        if (p.hp <= 0) { setGameState('GAME_OVER'); return prev; }
        p.block = 0; p.mana = p.maxMana;
        ['weak', 'vulnerable'].forEach(k => p.debuffs[k] = decayStack(p.debuffs[k]));
        ['strength', 'dexterity'].forEach(k => p.buffs[k] = decayStack(p.buffs[k]));
        let newDiscard = [...prev.discardPile, ...prev.hand], newDraw = [...prev.drawPile], newHand = [];
        for (let i = 0; i < 5; i++) {
          if (newHand.length >= GAME_RULES.MAX_HAND_SIZE) break;
          if (newDraw.length === 0) { if (newDiscard.length === 0) break; newDraw = shuffle(newDiscard); newDiscard = []; }
          if (newDraw.length > 0) newHand.push({ ...newDraw.pop(), uid: Math.random().toString() });
        }
        return { ...prev, player: p, enemies: newEnemies, hand: newHand, drawPile: newDraw, discardPile: newDiscard, turn: 'PLAYER' };
      });
    }, fastMode ? 500 : 1500);
    return () => clearTimeout(timer);
  }, [gameState, combatState?.turn, fastMode]);

  // --- 4. 인터페이스 및 핸들러 ---
  const handleAddCard = (id) => {
    if (isActionLocked || !unlockedCards.includes(id)) return;
    setIsActionLocked(true);
    setTempDeckCounts(prev => {
      const next = { ...prev, [id]: (prev[id] || 0) + 1 };
      const status = validateDeckStatus(next);
      if (status.total > GAME_RULES.MAX_DECK_SIZE || (prev[id] || 0) >= 3) return prev;
      if (!status.isManaValid) { setToastMsg('마나 카드는 최대 2장입니다.'); setTimeout(()=>setToastMsg(''),2000); return prev; }
      return next;
    });
    setTimeout(() => setIsActionLocked(false), 50);
  };

  const handleRemoveCard = (id) => {
    if (isActionLocked) return;
    setIsActionLocked(true);
    setTempDeckCounts(prev => ((prev[id] || 0) <= 0 ? prev : { ...prev, [id]: prev[id] - 1 }));
    setTimeout(() => setIsActionLocked(false), 50);
  };

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

  // --- 5. UI 렌더링 헬퍼 ---
  const getFilteredCards = (t, e, r, o, q) => {
    return CARD_LIBRARY.filter(c => {
      if (r !== 'all' && c.rarity !== r) return false;
      if (t !== 'all' && c.type !== t) return false;
      if (o === 'owned' && !unlockedCards.includes(c.id)) return false;
      if (o === 'unowned' && unlockedCards.includes(c.id)) return false;
      if (q) {
        const def = getCardDef(c.id, shopUpgrades);
        if (def && !def.name.toLowerCase().includes(q.toLowerCase()) && !def.desc.toLowerCase().includes(q.toLowerCase())) return false;
      }
      return true;
    });
  };

  const renderTooltipIcon = (desc) => {
    if (!desc) return null;
    const tips = [];
    if (desc.includes('약화')) tips.push({ title: '약화', desc: '가하는 피해가 3% 감소합니다.' });
    if (desc.includes('취약')) tips.push({ title: '취약', desc: '받는 피해가 30% 증가합니다.' });
    if (desc.includes('근력')) tips.push({ title: '근력', desc: '공격 카드의 피해량이 증가합니다.' });
    if (desc.includes('민첩')) tips.push({ title: '민첩', desc: '방어 카드의 방어도가 증가합니다.' });
    if (desc.includes('도박')) tips.push({ title: '도박', desc: '확률에 따라 추가 효과나 패널티가 발생합니다.' });
    if (tips.length === 0) return null;
    return (
      <div tabIndex="0" className="tooltip-trigger inline-flex ml-1 text-slate-400 cursor-help outline-none">
        <Info className="w-4 h-4" />
        <div className="tooltip-content absolute bottom-[120%] left-1/2 -translate-x-1/2 w-48 bg-slate-800 text-white text-[10px] p-2 rounded border border-slate-600 shadow-xl flex flex-col gap-1 z-[9999]">
          {tips.map((t, i) => (<div key={i} className="text-left"><span className="font-bold text-orange-400">{t.title}:</span> {t.desc}</div>))}
        </div>
      </div>
    );
  };

  const renderFiltersUI = (type, setType, effect, setEffect, rarity, setRarity, ownership, setOwnership, search, setSearch) => (
    <div className="flex flex-col gap-4 mb-6 w-full px-4 bg-slate-800/40 p-4 rounded-xl border border-slate-700 shadow-inner">
      <div className="flex items-center bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 w-full md:w-1/2 focus-within:border-indigo-500 transition-colors">
        <Search className="w-5 h-5 text-slate-400 mr-2 shrink-0" />
        <input type="text" placeholder="카드 이름이나 효과 검색..." className="bg-transparent border-none outline-none text-white w-full font-bold text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-3">
        <div className="flex gap-2 items-center"><span className="text-slate-400 text-xs font-bold w-10">종류</span>
          {['all', 'attack', 'skill'].map(v => (
            <button key={v} onClick={()=>setType(v)} className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${type === v ? 'bg-indigo-600 shadow-md' : 'bg-slate-700 text-slate-300'}`}>{v==='all'?'전체':v==='attack'?'공격':'스킬'}</button>
          ))}
        </div>
        <div className="flex gap-2 items-center"><span className="text-slate-400 text-xs font-bold w-10">등급</span>
          {['all', 'common', 'uncommon', 'rare', 'special'].map(v => (
            <button key={v} onClick={()=>setRarity(v)} className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${rarity === v ? 'bg-indigo-600 shadow-md' : 'bg-slate-700 text-slate-300'}`}>{v==='all'?'전체':v==='common'?'일반':v==='uncommon'?'희귀':v==='rare'?'전설':'특수'}</button>
          ))}
        </div>
        {setOwnership && (
          <div className="flex gap-2 items-center"><span className="text-slate-400 text-xs font-bold w-10">보유</span>
            {['all', 'owned', 'unowned'].map(v => (
              <button key={v} onClick={()=>setOwnership(v)} className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${ownership === v ? 'bg-indigo-600 shadow-md' : 'bg-slate-700 text-slate-300'}`}>{v==='all'?'전체':v==='owned'?'보유':'미보유'}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderCard = (card, count = null, isLocked = false, onAdd = null, onRemove = null, customClick = null) => {
    if (!card) return null;
    const isAtk = card.type === 'attack', rarity = card.rarity;
    const border = isAtk ? 'border-red-500' : 'border-blue-500';
    let shadow = '', nameCol = 'text-white', bg = 'bg-slate-900', tag = '일반';
    if (rarity === 'uncommon') { shadow = 'shadow-[0_0_12px_cyan]'; nameCol = 'text-cyan-300'; tag='희귀'; }
    else if (rarity === 'rare') { shadow = 'shadow-[0_0_20px_yellow]'; nameCol = 'text-yellow-300'; bg = 'legendary-bg'; tag='전설'; }
    else if (rarity === 'special') { shadow = 'shadow-[0_0_25px_fuchsia]'; nameCol = 'text-fuchsia-300'; bg = 'special-bg'; tag='특수'; }
    if (card.isUpgraded) { nameCol = 'text-yellow-400'; shadow = 'shadow-[0_0_15px_gold]'; }
    const style = isLocked ? 'opacity-60 grayscale border-slate-700 bg-slate-900' : `${border} ${shadow} ${bg}`;
    
    return (
      <div key={card.uid || card.id} onClick={customClick} className={`border-2 p-2 rounded-xl flex flex-col justify-between relative transition-all ${customClick ? 'cursor-pointer hover:-translate-y-2' : ''} ${style} w-full aspect-[3/4.2] max-w-[160px] mx-auto overflow-hidden`}>
        {isLocked && <div className="absolute inset-0 bg-slate-900/80 z-10 flex flex-col items-center justify-center backdrop-blur-[1px]"><Lock className="w-8 h-8 text-slate-400 mb-2"/><span className="text-[10px] font-bold text-yellow-500">미보유</span></div>}
        <div className="z-10 flex justify-between items-start">
          <span className="font-bold text-[10px] bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 text-white">Cost {card.cost}</span>
          <span className="text-[10px] font-bold opacity-80 text-white">{tag}</span>
        </div>
        <div className={`text-center z-10 font-black text-sm leading-tight drop-shadow-md mt-1 ${nameCol}`}>{card.name}</div>
        <div className="text-[10px] text-slate-200 text-center leading-tight bg-black/60 p-2 rounded flex-1 flex items-center justify-center font-medium z-10 mt-1 border border-white/5">
          <div>{card.desc} {renderTooltipIcon(card.desc)}</div>
        </div>
        {count !== null && onAdd && onRemove && (
          <div className="mt-2 flex items-center justify-between bg-slate-800/90 border border-slate-600 px-2 py-1 rounded-lg z-20 shadow-inner">
            <button onClick={(e) => { e.stopPropagation(); onRemove(card.id); }} className="w-6 h-6 bg-slate-600 hover:bg-slate-500 rounded-full font-black transition-colors">-</button>
            <span className="font-bold text-white text-sm">{count}</span>
            <button onClick={(e) => { e.stopPropagation(); onAdd(card.id); }} className="w-6 h-6 bg-indigo-600 hover:bg-indigo-500 rounded-full font-black transition-colors">+</button>
          </div>
        )}
      </div>
    );
  };

  // --- 6. 화면 렌더링 섹션 ---
  const renderMenu = () => (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-slate-900 text-white p-4">
      <Sword className="w-24 h-24 mb-6 text-indigo-500 animate-pulse" />
      <h1 className="text-4xl md:text-5xl font-black mb-4 text-center tracking-tighter">로그라이크 택틱스</h1>
      <div className="flex items-center gap-2 text-yellow-400 font-bold mb-8 bg-slate-800 px-4 py-2 rounded-full border border-yellow-900 shadow-lg">
        <Coins className="w-5 h-5"/> {credits} <span className="text-xs text-slate-400">CREDITS</span>
      </div>
      <div className="flex flex-col gap-3 w-full max-w-[280px]">
        <button onClick={() => { setTempDeckCounts({...deckCounts}); setGameState('DECK_BUILDING'); }} className="py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-black transition-all shadow-md">덱 구성 ({getTotalCards()}/20)</button>
        <div className="flex gap-2">
          <button onClick={() => setGameState('ENCYCLOPEDIA')} className="py-3 bg-slate-800 hover:bg-slate-700 rounded-lg font-bold flex-1 border border-slate-600 transition-all">도감</button>
          <button onClick={() => setGameState('MONSTER_DEX')} className="py-3 bg-slate-800 hover:bg-slate-700 rounded-lg font-bold flex-1 border border-slate-600 transition-all">적 정보</button>
        </div>
        <button onClick={() => setGameState('SHOP')} className="py-3 bg-yellow-600 hover:bg-yellow-500 text-slate-900 rounded-lg font-black shadow-[0_0_15px_rgba(202,138,4,0.4)] transition-all">상점 방문</button>
        <div className="flex gap-2">
          <button onClick={() => setTutorialModalOpen(true)} className="py-3 bg-blue-800 hover:bg-blue-700 rounded-lg font-bold flex-1 transition-all">방법</button>
          <button onClick={() => setGameState('SETTINGS')} className="py-3 bg-slate-800 hover:bg-slate-700 rounded-lg font-bold flex-1 border border-slate-600 transition-all">설정</button>
        </div>
        <hr className="border-slate-800 my-2" />
        <button onClick={() => startBattle('NORMAL')} disabled={getTotalCards() !== 20} className="py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-black shadow-lg disabled:bg-slate-800 disabled:text-slate-500 transition-all border-b-4 border-indigo-800 active:border-b-0 active:translate-y-1">일반 모드 (100층)</button>
      </div>
      {tutorialModalOpen && (
        <div className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setTutorialModalOpen(false)}>
          <div className="bg-slate-800 p-8 rounded-2xl max-w-2xl border-2 border-indigo-500 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-black mb-4 text-indigo-400">게임 방법</h2>
            <p className="text-slate-300 leading-relaxed mb-6">매 턴 마나를 소모해 카드를 사용하세요. 덱은 20장으로 고정되며, 상점에서 카드를 영구 강화하거나 가챠를 통해 새로운 카드를 수집할 수 있습니다. 마나 카드는 덱에 최대 2장만 넣을 수 있습니다.</p>
            <button onClick={() => setTutorialModalOpen(false)} className="w-full py-4 bg-indigo-600 rounded-xl font-bold hover:bg-indigo-500 transition-all">확인</button>
          </div>
        </div>
      )}
    </div>
  );

  const renderDeckBuilder = () => {
    const cards = getFilteredCards(filterType, filterEffect, filterRarity, filterOwnership, searchQuery);
    return (
      <div className="flex flex-col min-h-[100dvh] bg-slate-900 text-white p-4 pt-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 max-w-6xl mx-auto w-full gap-4 px-4">
          <h2 className="text-3xl font-black tracking-tighter">DECK CONSTRUCTION</h2>
          <div className="flex flex-wrap items-center gap-3">
             <span className={`text-lg font-black mr-4 ${getTotalCards(tempDeckCounts) === 20 ? 'text-green-400' : 'text-yellow-500'}`}>
               TOTAL: {getTotalCards(tempDeckCounts)} / 20
             </span>
             <button onClick={() => setTempDeckCounts({})} className="px-3 py-2 bg-red-900/50 text-red-400 rounded-lg font-bold border border-red-900 hover:bg-red-900 hover:text-white transition-all"><Eraser size={16}/></button>
             <button onClick={() => { setDeckCounts(tempDeckCounts); saveGame({ deckCounts: tempDeckCounts }); setToastMsg('DECK SAVED!'); setTimeout(()=>setToastMsg(''), 2000); }} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold shadow-lg border-b-4 border-emerald-800">SAVE DECK</button>
             <button onClick={() => setGameState('MENU')} className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold border-b-4 border-slate-900">BACK</button>
          </div>
        </div>
        <div className="max-w-6xl mx-auto w-full mb-6">
          {renderFiltersUI(filterType, setFilterType, filterEffect, setFilterEffect, filterRarity, setFilterRarity, filterOwnership, setFilterOwnership, searchQuery, setSearchQuery)}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5 max-w-6xl mx-auto w-full overflow-y-auto pb-20 pr-2 custom-scroll">
          {cards.map(c => renderCard(getCardDef(c.id, shopUpgrades), tempDeckCounts[c.id] || 0, !unlockedCards.includes(c.id), handleAddCard, handleRemoveCard))}
        </div>
      </div>
    );
  };

  const renderShop = () => {
    const hpCost = 50 + (shopUpgrades.maxHp * 40);
    const upgradableIds = (unlockedCards || []).filter(id => {
       const c = CARD_LIBRARY.find(item => item.id === id);
       if (shopFilterRarity !== 'all' && c.rarity !== shopFilterRarity) return false;
       if (shopSearchQuery && !c.name.includes(shopSearchQuery)) return false;
       if (hideMaxedUpgrades && shopUpgrades.upgradedCards.filter(uid => uid === id).length >= 5) return false;
       return true;
    });

    return (
      <div className="flex flex-col min-h-[100dvh] bg-slate-900 text-white p-4 pt-16">
        <div className="flex justify-between items-center mb-8 max-w-6xl mx-auto w-full px-4">
          <h2 className="text-3xl font-black flex items-center gap-3"><Store className="text-yellow-500"/> CREDIT SHOP</h2>
          <div className="flex items-center gap-4">
            <span className="text-xl font-bold text-yellow-400 bg-slate-800 px-4 py-2 rounded-full border border-yellow-900">🪙 {credits}</span>
            <button onClick={() => setGameState('MENU')} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-bold shadow-md transition-all">EXIT</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto w-full mb-10 px-4">
          <div className="bg-slate-800 p-6 rounded-2xl border-2 border-slate-700 flex flex-col items-center shadow-lg group hover:border-purple-500 transition-all">
            <div className="w-16 h-16 bg-purple-900/50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><Gift className="text-purple-400" size={32}/></div>
            <h3 className="text-xl font-bold mb-2">CARD GACHA</h3>
            <p className="text-xs text-slate-400 text-center mb-6">무작위 카드 3장을 획득합니다.<br/>(중복 시 10원 환급)</p>
            <button onClick={handleGacha} disabled={credits < 50} className="w-full py-4 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold disabled:bg-slate-700 shadow-lg transition-all">50 CREDITS</button>
          </div>
          <div className="bg-slate-800 p-6 rounded-2xl border-2 border-cyan-800 flex flex-col items-center shadow-lg group hover:border-cyan-500 transition-all">
            <div className="w-16 h-16 bg-cyan-900/50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><Star className="text-cyan-400" size={32}/></div>
            <h3 className="text-xl font-bold mb-2">PREMIUM PICK</h3>
            <p className="text-xs text-slate-400 text-center mb-6">3장의 후보 중 1장을 직접 선택합니다.<br/>(고등급 확률 증가)</p>
            <button onClick={handlePremiumGacha} disabled={credits < 100} className="w-full py-4 bg-cyan-700 hover:bg-cyan-600 rounded-xl font-bold disabled:bg-slate-700 shadow-lg transition-all">100 CREDITS</button>
          </div>
          <div className="bg-slate-800 p-6 rounded-2xl border-2 border-red-900 flex flex-col items-center shadow-lg group hover:border-red-500 transition-all">
            <div className="w-16 h-16 bg-red-900/50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><Heart className="text-red-400" size={32}/></div>
            <h3 className="text-xl font-bold mb-2">MAX HP UP</h3>
            <p className="text-xs text-slate-400 text-center mb-6">영구적으로 최대 체력을 15 증가시킵니다.<br/>(현재 보너스: +{shopUpgrades.maxHp * 15})</p>
            <button onClick={() => {
              if (credits >= hpCost) {
                const nc = credits - hpCost;
                const nu = { ...shopUpgrades, maxHp: shopUpgrades.maxHp + 1 };
                setCredits(nc); setShopUpgrades(nu); saveGame({ credits: nc, shopUpgrades: nu });
              }
            }} disabled={credits < hpCost} className="w-full py-4 bg-red-700 hover:bg-red-600 rounded-xl font-bold disabled:bg-slate-700 shadow-lg transition-all">{hpCost} CREDITS</button>
          </div>
        </div>

        <div className="bg-slate-800/40 p-6 rounded-3xl border border-slate-700 max-w-6xl mx-auto w-full mb-20 shadow-2xl backdrop-blur-sm px-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <h3 className="text-2xl font-black flex items-center gap-3"><Zap className="text-yellow-400" fill="currentColor"/> ARTIFACT ENHANCEMENT</h3>
            <div className="flex gap-2">
              <label className="flex items-center gap-2 text-xs font-bold bg-slate-800 px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-700 border border-slate-600"><input type="checkbox" checked={hideMaxedUpgrades} onChange={e=>setHideMaxedUpgrades(e.target.checked)}/> 풀강 제외</label>
              <button onClick={()=>setIsUpgradesCollapsed(!isUpgradesCollapsed)} className="bg-slate-700 px-3 py-2 rounded-lg text-xs font-bold">{isUpgradesCollapsed?'열기':'닫기'}</button>
            </div>
          </div>
          {!isUpgradesCollapsed && (
            <>
              <div className="mb-6">{renderFiltersUI(shopFilterType, setShopFilterType, null, null, shopFilterRarity, setShopFilterRarity, null, null, shopSearchQuery, setShopSearchQuery)}</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 overflow-y-auto max-h-[50vh] pr-2 custom-scroll">
                {upgradableIds.map(id => {
                  const cardBase = CARD_LIBRARY.find(item => item.id === id);
                  const level = shopUpgrades.upgradedCards.filter(uid => uid === id).length;
                  const cost = (cardBase.rarity === 'rare' ? 200 : cardBase.rarity === 'uncommon' ? 150 : 100) + (level * 50);
                  const displayCard = getCardDef(id, shopUpgrades);
                  return (
                    <div key={id} className={`p-4 rounded-2xl border-2 flex flex-col justify-between transition-all ${level > 0 ? 'bg-yellow-900/10 border-yellow-700/50 shadow-[0_0_10px_rgba(234,179,8,0.1)]' : 'bg-slate-900 border-slate-700'}`}>
                      <div>
                        <div className="flex justify-between items-start mb-2"><span className={`font-black text-sm ${level>0?'text-yellow-400':'text-white'}`}>{displayCard.name}</span><span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">LV.{level}</span></div>
                        <p className="text-[10px] text-slate-400 leading-tight mb-4 min-h-[30px]">{displayCard.desc}</p>
                      </div>
                      <button onClick={() => {
                        if (credits >= cost && level < 5) {
                          const nc = credits - cost;
                          const nu = { ...shopUpgrades, upgradedCards: [...shopUpgrades.upgradedCards, id] };
                          setCredits(nc); setShopUpgrades(nu); saveGame({ credits: nc, shopUpgrades: nu });
                          setToastMsg(`${displayCard.name} 강화 성공!`); setTimeout(()=>setToastMsg(''), 1500);
                        }
                      }} disabled={credits < cost || level >= 5} className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all ${level >= 5 ? 'bg-yellow-900/40 text-yellow-600 border border-yellow-800' : 'bg-indigo-600 hover:bg-indigo-500 shadow-md disabled:bg-slate-800 disabled:text-slate-600'}`}>
                        {level >= 5 ? 'MAX LEVEL' : `UPGRADE (🪙 ${cost})`}
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
        {gachaResult && (
           <div className="fixed inset-0 bg-black/95 z-[9999] flex flex-col items-center justify-center p-4 animate-draw" onClick={()=>setGachaResult(null)}>
             <h2 className="text-4xl font-black text-purple-400 mb-12 drop-shadow-[0_0_20px_purple] animate-bounce">NEW CARDS UNLOCKED!</h2>
             <div className="flex flex-wrap justify-center gap-6">{gachaResult.map((c, i) => <div key={i} className="relative">{c.isDuplicate && <span className="absolute -top-3 -right-3 bg-amber-500 text-black font-black text-[10px] px-2 py-1 rounded-full z-20 shadow-lg">+10🪙</span>}{renderCard(c)}</div>)}</div>
             <button className="mt-16 px-12 py-4 bg-indigo-600 rounded-full font-black text-xl shadow-xl hover:scale-110 transition-transform">CONFIRM</button>
           </div>
        )}
      </div>
    );
  };

  const renderBattle = () => {
    if (!combatState) return null;
    const { player, enemies, hand, turn, stage, drawPile, discardPile, baseDeck, mode } = combatState;
    const isPlayerTurn = turn === 'PLAYER';

    return (
      <div className="flex flex-col h-[100dvh] bg-slate-950 text-white p-2 md:p-4 overflow-hidden relative">
        <div className="flex justify-between items-center bg-slate-900/80 p-3 md:px-6 rounded-2xl border border-white/5 shadow-2xl z-20">
          <div className="flex items-center gap-4">
             <div className="text-indigo-400 font-black tracking-tighter bg-indigo-950/50 px-3 py-1 rounded-lg border border-indigo-900/50">STAGE {stage}</div>
             <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hidden md:block">{mode} MODE</div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-slate-400 cursor-pointer hover:text-white" onClick={()=>setViewingPile('baseDeck')}>DECK: {baseDeck.length}</span>
            <button onClick={() => setGameState('GAME_OVER')} className="bg-red-950/30 text-red-500 px-3 py-1 rounded-lg text-xs font-bold border border-red-900/30 hover:bg-red-900 hover:text-white transition-all">SURRENDER</button>
          </div>
        </div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02] pointer-events-none z-0"><h1 className="text-[15rem] font-black italic whitespace-nowrap">{isPlayerTurn ? 'PLAYER' : 'ENEMY'}</h1></div>

        <div className="flex-1 flex flex-row justify-between items-center max-w-6xl mx-auto w-full px-4 relative z-10">
          <div className={`flex flex-col items-center transition-all duration-500 ${isPlayerTurn?'scale-110':'opacity-40 scale-90'}`}>
             <div className="w-24 h-24 md:w-32 md:h-32 bg-slate-800 rounded-full border-4 border-indigo-500 shadow-[0_0_30px_rgba(79,70,229,0.3)] flex items-center justify-center relative mb-4">
                <Shield size={48} className="text-indigo-400"/>
                {player.block > 0 && <div className="absolute -top-2 -right-2 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-black border-2 border-blue-300 animate-bounce">{player.block}</div>}
             </div>
             <div className="w-32 md:w-48 bg-slate-900 h-4 rounded-full border border-slate-700 overflow-hidden relative shadow-inner">
                <div className="bg-green-500 h-full transition-all duration-500" style={{width: `${(player.hp/player.maxHp)*100}%`}}/>
                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black drop-shadow-md">{player.hp} / {player.maxHp}</div>
             </div>
             <div className="mt-3 flex gap-1 h-6">
                {player.buffs.strength > 0 && <span className="bg-red-900 px-2 py-0.5 rounded-full text-[9px] font-bold border border-red-500">STR +{player.buffs.strength}</span>}
                {player.buffs.dexterity > 0 && <span className="bg-blue-900 px-2 py-0.5 rounded-full text-[9px] font-bold border border-blue-500">DEX +{player.buffs.dexterity}</span>}
             </div>
          </div>

          <div className="text-2xl font-black italic text-slate-800">VS</div>

          <div className="flex gap-8 items-end">
            {enemies.map((e, idx) => {
              const intent = e.intentCard;
              return (
                <div key={e.uid} className={`flex flex-col items-center transition-all duration-500 ${idx===0?'scale-100':'scale-75 opacity-50'}`}>
                  {idx === 0 && <div className="text-red-500 font-black text-[10px] animate-bounce mb-2 tracking-widest">TARGET</div>}
                  <div className={`mb-4 p-2 bg-slate-900 border-2 rounded-xl text-center w-24 md:w-28 shadow-xl ${intent.type.includes('attack')?'border-red-600/50':'border-blue-600/50'}`}>
                     <div className="text-[10px] font-black truncate">{intent.name}</div>
                     <div className="text-[9px] text-slate-500 mt-1 leading-tight">{intent.desc}</div>
                  </div>
                  <div className={`w-20 h-20 md:w-28 md:h-28 bg-red-950/20 rounded-full border-4 flex items-center justify-center relative mb-4 transition-all ${idx===0?'border-red-600 shadow-[0_0_20px_rgba(220,38,38,0.3)]':'border-slate-800'}`}>
                    <Skull size={idx===0?48:32} className="text-red-500/70"/>
                    {e.block > 0 && <div className="absolute -top-1 -right-1 w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center font-black border border-slate-500 text-xs">{e.block}</div>}
                  </div>
                  <div className="w-24 md:w-32 bg-slate-900 h-3 rounded-full border border-slate-800 overflow-hidden relative mb-1">
                    <div className="bg-red-600 h-full transition-all duration-500" style={{width: `${(e.hp/e.maxHp)*100}%`}}/>
                    <div className="absolute inset-0 flex items-center justify-center text-[8px] font-black">{e.hp}</div>
                  </div>
                  <div className="text-[10px] font-bold text-slate-500">{e.name}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="h-56 flex flex-col items-center justify-end pb-4 relative z-20">
           <div className="flex items-center gap-12 w-full max-w-5xl px-8 relative">
              <div className="flex flex-col items-center gap-4 shrink-0">
                 <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-950 border-4 border-blue-400 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.6)]">
                    <span className="text-3xl md:text-4xl font-black text-white">{player.mana}</span>
                 </div>
                 <div className="flex flex-col items-center gap-1 cursor-pointer group" onClick={()=>setViewingPile('drawPile')}>
                    <div className="w-10 h-14 bg-slate-800 border-2 border-slate-700 rounded-lg flex items-center justify-center font-black group-hover:-translate-y-1 transition-transform">{drawPile.length}</div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Draw</span>
                 </div>
              </div>

              <div className="flex-1 flex justify-center items-end -space-x-10 md:-space-x-14">
                {hand.map((c, i) => {
                  const canPlay = player.mana >= c.cost && isPlayerTurn;
                  const isHov = hoveredCard === i;
                  return (
                    <div key={c.uid} onMouseEnter={()=>setHoveredCard(i)} onMouseLeave={()=>setHoveredCard(null)} onClick={()=>canPlay && playCard(i)}
                         className={`relative transition-all duration-300 ease-out cursor-pointer origin-bottom ${canPlay?'':'opacity-40 grayscale-50'} ${isHov?'-translate-y-12 scale-110 z-50':'translate-y-0 z-10'}`}>
                       <div className="pointer-events-none">{renderCard(c)}</div>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col items-center gap-4 shrink-0">
                 <button onClick={()=>setCombatState(p=>({...p, turn:'ENEMY'}))} disabled={!isPlayerTurn}
                         className={`px-6 py-3 rounded-full font-black text-sm md:text-lg shadow-xl transition-all border-b-4 ${isPlayerTurn?'bg-amber-600 hover:bg-amber-500 border-amber-800 active:border-b-0 active:translate-y-1':'bg-slate-800 border-slate-900 text-slate-600 opacity-50'}`}>END TURN</button>
                 <div className="flex flex-col items-center gap-1 cursor-pointer group" onClick={()=>setViewingPile('discardPile')}>
                    <div className="w-10 h-14 bg-slate-900 border-2 border-slate-800 rounded-lg flex items-center justify-center font-black opacity-60 group-hover:opacity-100 group-hover:-translate-y-1 transition-all">{discardPile.length}</div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Grave</span>
                 </div>
              </div>
           </div>
        </div>

        {viewingPile && (
          <div className="fixed inset-0 bg-black/90 z-[200] flex items-center justify-center p-6 backdrop-blur-md animate-draw" onClick={()=>setViewingPile(null)}>
            <div className="bg-slate-800 p-8 rounded-3xl max-w-6xl w-full max-h-[85vh] border-2 border-white/10 shadow-2xl overflow-hidden flex flex-col" onClick={e=>e.stopPropagation()}>
               <div className="flex justify-between items-center mb-8 border-b border-slate-700 pb-6 shrink-0">
                  <h3 className="text-3xl font-black tracking-tighter uppercase">{viewingPile === 'baseDeck' ? 'Master Deck List' : viewingPile === 'drawPile' ? 'Draw Pile' : 'Discard Pile'}</h3>
                  <button onClick={()=>setViewingPile(null)} className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold">CLOSE</button>
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

  return (
    <>
      <style>{styles}</style>
      <div id="game-root" className={`font-sans antialiased selection:bg-indigo-500 selection:text-white ${isCssFullScreen ? 'fixed inset-0 z-[999999] w-[100vw] h-[100vh] overflow-auto bg-slate-950' : 'bg-slate-900 min-h-screen'}`}>
        {toastMsg && <div className="fixed top-12 left-1/2 -translate-x-1/2 bg-green-600 px-8 py-4 rounded-full shadow-2xl z-[10000] text-white font-black animate-pulse flex items-center gap-3 border-2 border-white/20 backdrop-blur-md"><Zap size={20} fill="currentColor"/> {toastMsg}</div>}
        
        {gameState === 'MENU' && renderMenu()}
        {gameState === 'DECK_BUILDING' && renderDeckBuilder()}
        {gameState === 'SHOP' && renderShop()}
        {gameState === 'ENCYCLOPEDIA' && renderEncyclopedia()}
        {gameState === 'MONSTER_DEX' && renderMonsterDex()}
        {gameState === 'BATTLE' && renderBattle()}
        {gameState === 'REWARDS' && renderRewards()}
        {gameState === 'REWARD_CARD' && renderRewardCard()}
        {gameState === 'REWARD_REMOVE' && renderRewardRemove()}
        {gameState === 'BOSS_CLEAR_REWARD' && renderBossClearReward()}
        {gameState === 'SETTINGS' && renderSettings()}
        {gameState === 'GAME_OVER' && renderGameOver()}
        {gameState === 'GAME_CLEAR' && renderGameClear()}
      </div>
    </>
  );
}