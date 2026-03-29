import React, { useState, useEffect } from 'react';
import { Sword, Shield, Zap, Heart, RefreshCw, Skull, ArrowRightCircle, Lock, Save, PlusCircle, Trash2, Store, Coins, AlertTriangle, Info, Maximize, Gift, Book, Trophy, Settings, FastForward, Eraser, Download, Upload, Search, HelpCircle, FileQuestion, Star } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

// 외부 파일 임포트
import { CARD_LIBRARY, BASE_CARDS, ENEMIES, NORMAL_BOSSES, SPECIAL_BOSSES, GAME_RULES, MANA_CARD_IDS } from './constants/gameData';
import { shuffle, decayStack, getCardDef, generateEnemies, generateEnemyIntent, validateDeckStatus } from './utils/gameLogic';

const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{"projectId":"dummy"}');
let app, auth, db;
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch(e) {}
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

const styles = `
  @keyframes drawCard {
    0% { transform: translateY(100px) scale(0.8); opacity: 0; }
    100% { transform: translateY(0) scale(1); opacity: 1; }
  }
  .animate-draw {
    animation: drawCard 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
    opacity: 0;
  }
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .tooltip-trigger {
    position: relative;
    z-index: 50;
  }
  .tooltip-trigger .tooltip-content {
    visibility: hidden; 
    opacity: 0; 
    transition: opacity 0.2s;
    position: absolute;
    z-index: 99999;
  }
  .tooltip-trigger:hover .tooltip-content {
    visibility: visible; opacity: 1;
  }
  .legendary-bg {
    background: linear-gradient(135deg, rgba(15,23,42,1) 0%, rgba(69,26,3,0.8) 100%);
  }
  .special-bg {
    background: linear-gradient(135deg, rgba(30,0,50,1) 0%, rgba(100,0,100,0.8) 100%);
  }
  html {
    -webkit-text-size-adjust: none;
    text-size-adjust: none;
    font-size: 14px; 
  }
  @media (min-width: 768px) {
    html { font-size: 16px; }
  }
  #game-root {
    width: 100%;
    min-height: 100dvh;
    overflow-x: hidden;
  }
`;

export default function App() {
  const [gameState, setGameState] = useState('MENU'); 
  const [user, setUser] = useState(null);
  const [toastMsg, setToastMsg] = useState('');
  
  // 영구 상태
  const [credits, setCredits] = useState(0);
  const [shopUpgrades, setShopUpgrades] = useState({ maxHp: 0, upgradedCards: [] });
  const [unlockedCards, setUnlockedCards] = useState(BASE_CARDS);
  const [deckCounts, setDeckCounts] = useState({ strike: 3, defend: 3, heavy_strike: 3, shield_bash: 3, heal: 2, mana_potion: 3, focus: 3 });
  const [normalCleared, setNormalCleared] = useState(false); 
  const [fastMode, setFastMode] = useState(false); 
  const [maxStageReached, setMaxStageReached] = useState(1);
  const [seenEnemies, setSeenEnemies] = useState([]); 
  const [usedCoupons, setUsedCoupons] = useState([]);

  // 임시 상태
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

  // 필터 및 검색
  const [filterType, setFilterType] = useState('all');
  const [filterEffect, setFilterEffect] = useState('all');
  const [filterRarity, setFilterRarity] = useState('all');
  const [filterOwnership, setFilterOwnership] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [shopFilterType, setShopFilterType] = useState('all');
  const [shopFilterEffect, setShopFilterEffect] = useState('all');
  const [shopFilterRarity, setShopFilterRarity] = useState('all');
  const [shopFilterOwnership, setShopFilterOwnership] = useState('all');
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

  const getTotalCards = (counts = deckCounts) => {
    return Object.values(counts || {}).reduce((a, b) => a + b, 0);
  };

  // --- Firebase 로드 및 저장 ---
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
    if (window.require) {
      const { ipcRenderer } = window.require('electron');
      const handleSaveRequest = () => {
        saveGame({ deckCounts, unlockedCards, credits, shopUpgrades, normalCleared, fastMode, maxStageReached, usedCoupons, seenEnemies });
      };
      ipcRenderer.on('save-request', handleSaveRequest);
      return () => ipcRenderer.removeListener('save-request', handleSaveRequest);
    }
  }, [deckCounts, unlockedCards, credits, shopUpgrades, normalCleared, fastMode, maxStageReached, usedCoupons, seenEnemies]);

  useEffect(() => {
    if (!user || !db) return;
    const loadData = async () => {
      try {
        const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'gameSave', 'data');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.deckCounts) setDeckCounts(data.deckCounts || {});
          if (data.unlockedCards) setUnlockedCards((data.unlockedCards || []).filter(id => CARD_LIBRARY.some(c => c.id === id)));
          if (data.credits !== undefined) setCredits(data.credits || 0);
          if (data.shopUpgrades) setShopUpgrades(data.shopUpgrades || { maxHp: 0, upgradedCards: [] });
          if (data.normalCleared !== undefined) setNormalCleared(data.normalCleared || false);
          if (data.fastMode !== undefined) setFastMode(data.fastMode || false);
          if (data.maxStageReached !== undefined) setMaxStageReached(data.maxStageReached || 1);
          if (data.usedCoupons) setUsedCoupons(data.usedCoupons || []);
          if (data.seenEnemies) setSeenEnemies(data.seenEnemies || []);
        }
      } catch(e) {}
    };
    loadData();
  }, [user]);

  useEffect(() => {
    try {
      const savedData = localStorage.getItem('roguelike_tactics_save');
      if (savedData) {
        const data = JSON.parse(savedData);
        if (data.deckCounts) setDeckCounts(data.deckCounts);
        if (data.unlockedCards) setUnlockedCards((data.unlockedCards || []).filter(id => CARD_LIBRARY.some(c => c.id === id)));
        if (data.credits !== undefined) setCredits(data.credits);
        if (data.shopUpgrades) setShopUpgrades(data.shopUpgrades);
        if (data.normalCleared !== undefined) setNormalCleared(data.normalCleared);
        if (data.fastMode !== undefined) setFastMode(data.fastMode);
        if (data.maxStageReached !== undefined) setMaxStageReached(data.maxStageReached);
        if (data.usedCoupons) setUsedCoupons(data.usedCoupons);
        if (data.seenEnemies) setSeenEnemies(data.seenEnemies);
      }
    } catch (e) {}
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

  const updateSeenEnemies = (enemiesList) => {
    let updated = false;
    let newSeen = [...(seenEnemies || [])];
    enemiesList.forEach(e => {
      if (!newSeen.includes(e.template.name)) {
        newSeen.push(e.template.name);
        updated = true;
      }
    });
    if (updated) {
      setSeenEnemies(newSeen);
      saveGame({ seenEnemies: newSeen });
    }
  };

  const toggleFullScreen = () => {
    const doc = window.document;
    const docEl = doc.documentElement;
    const requestFullScreen = docEl.requestFullscreen || docEl.webkitRequestFullscreen || docEl.mozRequestFullScreen || docEl.msRequestFullscreen;
    const cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
    if (!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
      if (requestFullScreen) requestFullScreen.call(docEl).catch(() => setIsCssFullScreen(!isCssFullScreen));
      else setIsCssFullScreen(!isCssFullScreen);
    } else {
      if (cancelFullScreen) cancelFullScreen.call(doc);
      setIsCssFullScreen(false);
    }
  };

  const handleExport = () => {
    const data = JSON.stringify({ deckCounts, unlockedCards, credits, shopUpgrades, normalCleared, fastMode, maxStageReached, usedCoupons, seenEnemies });
    const encoded = btoa(encodeURIComponent(data));
    navigator.clipboard.writeText(encoded);
    setToastMsg('전체 세이브 코드가 복사되었습니다!');
    setTimeout(() => setToastMsg(''), 2000);
  };

  const handleImport = (encoded) => {
    try {
      const decoded = decodeURIComponent(atob(encoded));
      const data = JSON.parse(decoded);
      if (data.deckCounts && data.unlockedCards) {
        setDeckCounts(data.deckCounts);
        setUnlockedCards((data.unlockedCards || []).filter(id => CARD_LIBRARY.some(c => c.id === id)));
        if(data.credits !== undefined) setCredits(data.credits);
        if(data.shopUpgrades) setShopUpgrades(data.shopUpgrades);
        if(data.normalCleared !== undefined) setNormalCleared(data.normalCleared);
        if(data.fastMode !== undefined) setFastMode(data.fastMode);
        if(data.maxStageReached !== undefined) setMaxStageReached(data.maxStageReached);
        if(data.usedCoupons) setUsedCoupons(data.usedCoupons);
        if(data.seenEnemies) setSeenEnemies(data.seenEnemies);
        saveGame(data);
        setToastMsg('데이터를 성공적으로 불러왔습니다!');
        setImportModalOpen(false);
        setImportText('');
      } else throw new Error();
    } catch(e) { setToastMsg('잘못된 세이브 코드입니다.'); setTimeout(() => setToastMsg(''), 2000); }
  };

  const handleDeckExport = () => {
    const data = JSON.stringify({ type: 'deck_only', deckCounts: tempDeckCounts });
    const encoded = btoa(encodeURIComponent(data));
    navigator.clipboard.writeText(encoded);
    setToastMsg('덱 코드가 복사되었습니다!');
    setTimeout(() => setToastMsg(''), 2000);
  };

  const handleDeckImport = () => {
    try {
      const decoded = decodeURIComponent(atob(deckImportText));
      const data = JSON.parse(decoded);
      if (data.type === 'deck_only' && data.deckCounts) {
        const { isManaValid } = validateDeckStatus(data.deckCounts);
        if (!isManaValid) { setToastMsg('불러온 덱에 마나 카드가 너무 많습니다.'); return; }
        setTempDeckCounts(data.deckCounts);
        setToastMsg('덱을 성공적으로 불러왔습니다!');
        setDeckImportModalOpen(false);
      } else throw new Error();
    } catch(e) { setToastMsg('잘못된 덱 코드입니다.'); setTimeout(() => setToastMsg(''), 2000); }
  };

  const handleCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (!code || (usedCoupons || []).includes(code)) return;
    let newCredits = credits, newUnlocked = [...unlockedCards], valid = false, msg = '';
    if (code === 'WELCOME') { newCredits += 1000; msg = '1000 크레딧 획득!'; valid = true; }
    else if (code === 'LEGENDARY') { if (!newUnlocked.includes('true_dragon_slayer')) newUnlocked.push('true_dragon_slayer'); msg = '진·용살검 획득!'; valid = true; }
    else if (code === 'GEMS' || code === 'EZ') { newCredits += 500; msg = '500 크레딧 획득!'; valid = true; }
    if (valid) {
      const updatedCoupons = [...(usedCoupons || []), code];
      setCredits(newCredits); setUnlockedCards(newUnlocked); setUsedCoupons(updatedCoupons);
      saveGame({ credits: newCredits, unlockedCards: newUnlocked, usedCoupons: updatedCoupons });
      setToastMsg(msg); setCouponInput('');
    } else { setToastMsg('유효하지 않은 코드입니다.'); setTimeout(() => setToastMsg(''), 2000); }
  };

  const openDeckBuilder = () => { setTempDeckCounts({ ...deckCounts }); setGameState('DECK_BUILDING'); };
  const openEncyclopedia = () => { setGameState('ENCYCLOPEDIA'); };
  const openMonsterDex = () => { setGameState('MONSTER_DEX'); };
  const openShop = () => { setGameState('SHOP'); };

  const handleAddCard = (id) => {
    if (isActionLocked || !unlockedCards.includes(id)) return;
    setIsActionLocked(true);
    setTempDeckCounts(prev => {
      const next = { ...prev, [id]: (prev[id] || 0) + 1 };
      const status = validateDeckStatus(next);
      if (status.total > 20 || (prev[id] || 0) >= 3) return prev;
      if (!status.isManaValid) {
        setToastMsg(`마나 카드는 최대 ${GAME_RULES.MAX_MANA_CARDS}장까지만 가능합니다.`);
        setTimeout(() => setToastMsg(''), 2000);
        return prev;
      }
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

  const handleAdminUnlock = () => {
    if (adminCodeInput === '20090324') { setIsAdminUnlocked(true); setToastMsg('개발자 권한 활성화'); }
    else setToastMsg('잘못된 코드');
    setTimeout(() => setToastMsg(''), 2000);
  };

  const handleExitGame = async () => {
    setToastMsg('저장 중...');
    await saveGame({ deckCounts, unlockedCards, credits, shopUpgrades, normalCleared, fastMode, maxStageReached, usedCoupons, seenEnemies });
    if (window.require) window.close(); else setGameState('MENU');
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

  const selectPremiumCard = (cardDef) => {
    const isOwned = unlockedCards.includes(cardDef.id);
    const newUnlocked = isOwned ? unlockedCards : [...unlockedCards, cardDef.id];
    if (isOwned) { setCredits(prev => prev + 20); setToastMsg('20 크레딧 환급'); }
    else setToastMsg(`${cardDef.name} 획득!`);
    setUnlockedCards(newUnlocked); setPremiumGachaResult(null);
    saveGame({ unlockedCards: newUnlocked });
  };

  const startBattle = (mode = 'NORMAL', startingStage = 1) => {
    let fullDeck = [];
    Object.keys(deckCounts).forEach(id => {
      const def = getCardDef(id, shopUpgrades);
      for (let i = 0; i < deckCounts[id]; i++) if (def) fullDeck.push({ ...def });
    });
    const shuffled = shuffle(fullDeck);
    let initialDraw = [...shuffled], initialHand = [];
    for(let i=0; i<5; i++) if(initialDraw.length > 0) initialHand.push({ ...initialDraw.pop(), uid: Math.random().toString() });
    const hp = 100 + (shopUpgrades.maxHp * 15);
    const enemies = generateEnemies(startingStage);
    updateSeenEnemies(enemies);
    setCombatState({
      mode, stage: startingStage, hand: initialHand, drawPile: initialDraw, discardPile: [], turn: 'PLAYER', baseDeck: fullDeck,
      player: { hp, maxHp: hp, mana: 3, maxMana: 3, block: 0, debuffs: { weak: 0, vulnerable: 0 }, buffs: { strength: 0, dexterity: 0 } },
      enemies: enemies
    });
    setSkipModalOpen(false); setRewardCards([]); setGameState('BATTLE');
  };

  const startNextStage = (newPlayer, newBaseDeck) => {
    const nextStage = combatState.stage + 1;
    const enemies = generateEnemies(nextStage);
    updateSeenEnemies(enemies);
    const reshuffled = shuffle([...newBaseDeck]);
    let startDraw = [...reshuffled], startHand = [];
    for(let i=0; i<5; i++) if(startDraw.length > 0) startHand.push({ ...startDraw.pop(), uid: Math.random().toString() });
    setCombatState({
      ...combatState, stage: nextStage, enemies, baseDeck: newBaseDeck, hand: startHand, drawPile: startDraw, discardPile: [], turn: 'PLAYER',
      player: { ...newPlayer, block: 0, mana: newPlayer.maxMana, debuffs: {weak: 0, vulnerable: 0}, buffs: newPlayer.buffs || { strength: 0, dexterity: 0 } }
    });
    setRewardCards([]); setGameState('BATTLE');
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
        if (prev.mode === 'HARD') earned *= 2;
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

  const renderTooltipIcon = (desc) => {
    if (!desc) return null;
    const tips = [];
    if (desc.includes('약화')) tips.push({ title: '약화', desc: '가하는 피해가 3% 감소합니다.' });
    if (desc.includes('취약')) tips.push({ title: '취약', desc: '받는 피해가 30% 증가합니다.' });
    if (desc.includes('근력')) tips.push({ title: '근력', desc: '공격 피해가 증가합니다.' });
    if (desc.includes('민첩')) tips.push({ title: '민첩', desc: '방어 획득량이 증가합니다.' });
    if (tips.length === 0) return null;
    return (
      <div tabIndex="0" className="tooltip-trigger inline-flex ml-1 text-slate-400 cursor-help outline-none">
        <Info className="w-4 h-4" />
        <div className="tooltip-content absolute bottom-[120%] left-1/2 -translate-x-1/2 w-48 bg-slate-800 text-white text-xs p-2 rounded border border-slate-600 shadow-xl flex flex-col gap-1">
          {tips.map((t, i) => (<div key={i}><span className="font-bold text-orange-400">{t.title}:</span> {t.desc}</div>))}
        </div>
      </div>
    );
  };

  const renderCard = (card, count = null, isLocked = false, onAdd = null, onRemove = null, customClick = null) => {
    if (!card) return null;
    const isAtk = card.type === 'attack', rarity = card.rarity;
    const border = isAtk ? 'border-red-500' : 'border-blue-500';
    let shadow = '', nameCol = 'text-white', bg = 'bg-slate-900';
    if (rarity === 'uncommon') { shadow = 'shadow-[0_0_12px_cyan]'; nameCol = 'text-cyan-300'; }
    else if (rarity === 'rare') { shadow = 'shadow-[0_0_20px_yellow]'; nameCol = 'text-yellow-300'; bg = 'legendary-bg'; }
    else if (rarity === 'special') { shadow = 'shadow-[0_0_25px_fuchsia]'; nameCol = 'text-fuchsia-300'; bg = 'special-bg'; }
    if (card.isUpgraded) { nameCol = 'text-yellow-400'; shadow = 'shadow-[0_0_15px_gold]'; }
    const style = isLocked ? 'opacity-60 grayscale border-slate-700 bg-slate-900' : `${border} ${shadow} ${bg}`;
    return (
      <div key={card.id} onClick={customClick} className={`border-2 p-2 rounded-xl flex flex-col justify-between relative transition-all ${customClick ? 'cursor-pointer hover:-translate-y-2' : ''} ${style} w-full aspect-[3/4.2] max-w-[160px] mx-auto`}>
        {isLocked && <div className="absolute inset-0 bg-slate-900/80 z-10 flex items-center justify-center rounded-xl"><Lock className="w-8 h-8 text-slate-400"/></div>}
        <div className="z-10 flex justify-between items-start mb-1">
          <span className="font-bold text-[10px] bg-slate-800 px-1 py-0.5 rounded border border-slate-700">C {card.cost}</span>
          {isAtk ? <Sword className="w-4 h-4 text-red-400"/> : <Shield className="w-4 h-4 text-blue-400"/>}
        </div>
        <div className="text-center z-10 font-black text-sm leading-tight mb-1 drop-shadow-md {nameCol}">{card.name}</div>
        <div className="text-[10px] text-slate-200 text-center leading-tight bg-black/60 p-1.5 rounded flex-1 flex items-center justify-center font-medium z-10">
          <div>{card.desc} {renderTooltipIcon(card.desc)}</div>
        </div>
        {count !== null && (
          <div className="mt-2 flex items-center justify-between bg-slate-800/90 border border-slate-600 px-2 py-1 rounded-lg z-20">
            <button onClick={(e) => { e.stopPropagation(); onRemove(card.id); }} className="w-6 h-6 bg-slate-600 rounded-full">-</button>
            <span className="font-bold text-white">{count}</span>
            <button onClick={(e) => { e.stopPropagation(); onAdd(card.id); }} className="w-6 h-6 bg-slate-600 rounded-full">+</button>
          </div>
        )}
      </div>
    );
  };

  // --- 메인 화면 렌더링 함수들 ---
  const renderMenu = () => (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-slate-900 text-white p-4">
      <Sword className="w-24 h-24 mb-6 text-indigo-500 animate-pulse" />
      <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center tracking-tighter">로그라이크 택틱스</h1>
      <div className="flex items-center gap-2 text-yellow-400 font-bold mb-8 bg-slate-800 px-4 py-2 rounded-full border border-yellow-900">
        <Coins className="w-5 h-5"/> {credits} 크레딧
      </div>
      <div className="flex flex-col gap-3 w-full max-w-[280px]">
        <button onClick={openDeckBuilder} className="py-3 bg-slate-700 rounded-lg font-bold hover:bg-slate-600">덱 구성 ({getTotalCards()}/20)</button>
        <div className="flex gap-2">
          <button onClick={openEncyclopedia} className="py-3 bg-slate-800 rounded-lg font-bold flex-1 border border-slate-600">도감</button>
          <button onClick={openMonsterDex} className="py-3 bg-slate-800 rounded-lg font-bold flex-1 border border-slate-600">적 정보</button>
        </div>
        <button onClick={openShop} className="py-3 bg-yellow-600 rounded-lg font-bold shadow-lg">상점</button>
        <div className="flex gap-2">
          <button onClick={() => setTutorialModalOpen(true)} className="py-3 bg-blue-800 rounded-lg font-bold flex-1">방법</button>
          <button onClick={() => setGameState('SETTINGS')} className="py-3 bg-slate-800 rounded-lg font-bold flex-1 border border-slate-600">설정</button>
        </div>
        <hr className="border-slate-700 my-2" />
        <button onClick={() => startBattle('NORMAL')} disabled={getTotalCards() !== 20} className="py-3 bg-indigo-600 rounded-lg font-bold disabled:bg-slate-800">일반 모드 (100층)</button>
        {maxStageReached >= 50 && <button onClick={() => setSkipModalOpen(true)} className="py-3 bg-emerald-700 rounded-lg font-bold">스테이지 도약</button>}
      </div>
      {tutorialModalOpen && (
        <div className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center p-4" onClick={() => setTutorialModalOpen(false)}>
          <div className="bg-slate-800 p-6 rounded-2xl max-w-2xl overflow-y-auto max-h-[80vh] border-2 border-indigo-500" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-black mb-4 text-center">게임 방법</h2>
            <p className="text-slate-300 leading-relaxed mb-4">매 턴 마나를 소모해 카드를 사용하세요. 덱은 20장으로 고정되며 상점에서 강화하거나 새로운 카드를 뽑을 수 있습니다.</p>
            <button onClick={() => setTutorialModalOpen(false)} className="w-full py-3 bg-indigo-600 rounded-xl font-bold">닫기</button>
          </div>
        </div>
      )}
    </div>
  );

  const renderDeckBuilder = () => {
    const cards = getFilteredCards(filterType, filterEffect, filterRarity, filterOwnership, searchQuery);
    return (
      <div className="flex flex-col h-[100dvh] bg-slate-900 text-white p-4 pt-16">
        <div className="flex justify-between items-center mb-6 max-w-6xl mx-auto w-full">
          <h2 className="text-2xl font-bold">덱 구성 ({getTotalCards(tempDeckCounts)}/20)</h2>
          <div className="flex gap-2">
            <button onClick={() => { setDeckCounts(tempDeckCounts); saveGame({ deckCounts: tempDeckCounts }); setToastMsg('저장됨'); setTimeout(()=>setToastMsg(''),1000); }} className="px-4 py-2 bg-emerald-600 rounded-lg font-bold">저장</button>
            <button onClick={() => setGameState('MENU')} className="px-4 py-2 bg-indigo-600 rounded-lg font-bold">뒤로</button>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 overflow-y-auto pb-10 max-w-6xl mx-auto w-full">
          {cards.map(c => renderCard(getCardDef(c.id, shopUpgrades), tempDeckCounts[c.id] || 0, !unlockedCards.includes(c.id), handleAddCard, handleRemoveCard))}
        </div>
      </div>
    );
  };

  const renderBattle = () => {
    if (!combatState) return null;
    const { player, enemies, hand, turn, stage, drawPile, discardPile } = combatState;
    return (
      <div className="flex flex-col h-[100dvh] bg-slate-900 text-white p-4 overflow-hidden relative">
        <div className="flex justify-between items-center bg-slate-800 p-3 rounded-lg border border-slate-700 z-10">
          <div className="font-bold">STAGE {stage}</div>
          <button onClick={() => setGameState('MENU')} className="text-slate-500 text-sm">포기</button>
        </div>
        <div className="flex-1 flex items-end justify-center pb-20 gap-10">
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 bg-slate-700 rounded-full border-4 border-indigo-500 flex items-center justify-center relative mb-4">
              <Shield className="w-12 h-12 text-indigo-300" />
              {player.block > 0 && <div className="absolute -top-2 -right-2 bg-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-bold border border-blue-300">{player.block}</div>}
            </div>
            <div className="w-32 bg-slate-800 h-4 rounded-full overflow-hidden border border-slate-600">
              <div className="bg-green-500 h-full transition-all" style={{ width: `${(player.hp/player.maxHp)*100}%` }} />
            </div>
            <div className="text-xs font-bold mt-1">{player.hp}/{player.maxHp} HP</div>
          </div>
          <div className="text-3xl font-black text-slate-800 italic">VS</div>
          <div className="flex gap-6">
            {enemies.map((e, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <div className={`w-20 bg-slate-800 border-2 rounded p-1 text-[10px] text-center mb-2 ${e.intentCard.type.includes('attack') ? 'border-red-500' : 'border-blue-500'}`}>{e.intentCard.name}</div>
                <div className={`w-20 h-20 rounded-full flex items-center justify-center border-4 ${e.isBoss ? 'bg-red-950 border-red-500' : 'bg-slate-700 border-red-400'}`}>
                  <Skull className="w-10 h-10 text-red-300" />
                </div>
                <div className="w-24 bg-slate-800 h-3 rounded-full mt-2 overflow-hidden border border-slate-600">
                  <div className="bg-red-500 h-full transition-all" style={{ width: `${(e.hp/e.maxHp)*100}%` }} />
                </div>
                <div className="text-[10px] mt-1">{e.hp}/{e.maxHp}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="h-48 flex items-center justify-center gap-4 relative">
          <div className="absolute left-0 bottom-4 flex flex-col items-center">
            <div className="w-16 h-16 bg-blue-900 border-4 border-blue-400 rounded-full flex items-center justify-center text-2xl font-black">{player.mana}</div>
            <div className="text-[10px] font-bold text-blue-300 mt-1">MANA</div>
          </div>
          <div className="flex items-end -ml-10">
            {hand.map((c, i) => (
              <div key={i} onClick={() => player.mana >= c.cost && turn === 'PLAYER' && playCard(i)} className={`w-28 h-40 bg-slate-900 border-2 rounded-xl p-2 -ml-8 first:ml-0 transition-transform hover:-translate-y-10 cursor-pointer ${player.mana < c.cost ? 'opacity-50 grayscale' : 'border-indigo-500 shadow-xl'}`}>
                <div className="flex justify-between text-[10px] font-bold mb-1"><span>{c.cost}</span><Sword className="w-3 h-3"/></div>
                <div className="text-center font-black text-xs mb-2">{c.name}</div>
                <div className="text-[9px] text-slate-300 leading-tight text-center">{c.desc}</div>
              </div>
            ))}
          </div>
          <button onClick={() => setCombatState(prev => ({...prev, turn: 'ENEMY'}))} disabled={turn !== 'PLAYER'} className="absolute right-0 bottom-4 px-6 py-3 bg-amber-600 rounded-full font-bold shadow-lg">턴 종료</button>
        </div>
      </div>
    );
  };

  const renderShop = () => (
    <div className="flex flex-col min-h-[100dvh] bg-slate-900 text-white p-4 pt-16">
      <div className="flex justify-between items-center mb-8 max-w-6xl mx-auto w-full">
        <h2 className="text-3xl font-bold flex items-center gap-2"><Store className="text-yellow-500"/> 상점</h2>
        <div className="flex items-center gap-4">
          <span className="text-xl font-bold text-yellow-400">🪙 {credits}</span>
          <button onClick={() => setGameState('MENU')} className="px-4 py-2 bg-indigo-600 rounded-lg font-bold">메인</button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto w-full">
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col items-center">
          <Gift className="w-12 h-12 text-purple-400 mb-4" />
          <h3 className="text-xl font-bold mb-2">일반 카드 뽑기</h3>
          <p className="text-sm text-slate-400 text-center mb-6">랜덤하게 카드 3장을 획득합니다.</p>
          <button onClick={handleGacha} disabled={credits < 50} className="w-full py-3 bg-purple-600 rounded-lg font-bold disabled:bg-slate-700">50 크레딧</button>
        </div>
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col items-center">
          <Star className="w-12 h-12 text-cyan-400 mb-4" />
          <h3 className="text-xl font-bold mb-2">프리미엄 뽑기</h3>
          <p className="text-sm text-slate-400 text-center mb-6">3장의 카드 중 1장을 골라 획득합니다.</p>
          <button onClick={handlePremiumGacha} disabled={credits < 100} className="w-full py-3 bg-cyan-700 rounded-lg font-bold disabled:bg-slate-700">100 크레딧</button>
        </div>
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col items-center">
          <Heart className="w-12 h-12 text-red-500 mb-4" />
          <h3 className="text-xl font-bold mb-2">체력 증가</h3>
          <p className="text-sm text-slate-400 text-center mb-6">최대 체력을 영구적으로 15 늘립니다.</p>
          <button onClick={() => {
            const cost = 50 + (shopUpgrades.maxHp * 40);
            if (credits >= cost) {
              const nc = credits - cost, nu = { ...shopUpgrades, maxHp: shopUpgrades.maxHp + 1 };
              setCredits(nc); setShopUpgrades(nu); saveGame({ credits: nc, shopUpgrades: nu });
            }
          }} className="w-full py-3 bg-red-600 rounded-lg font-bold disabled:bg-slate-700">{50 + (shopUpgrades.maxHp * 40)} 크레딧</button>
        </div>
      </div>
      {gachaResult && (
        <div className="fixed inset-0 bg-black/90 z-[9999] flex flex-col items-center justify-center p-4" onClick={() => setGachaResult(null)}>
          <h2 className="text-3xl font-black text-purple-400 mb-8 animate-bounce">획득한 카드</h2>
          <div className="flex gap-4">{gachaResult.map((c, i) => renderCard(c))}</div>
          <button className="mt-10 px-8 py-3 bg-indigo-600 rounded-full font-bold">확인</button>
        </div>
      )}
    </div>
  );

  // --- 기타 상태 렌더링 ---
  const renderGameOver = () => (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-slate-900 text-white">
      <Skull className="w-24 h-24 text-red-500 mb-6" />
      <h1 className="text-5xl font-black text-red-600 mb-4">GAME OVER</h1>
      <p className="text-xl text-slate-400 mb-10">최고 스테이지: {combatState?.stage}</p>
      <button onClick={() => setGameState('MENU')} className="px-10 py-4 bg-indigo-600 rounded-lg font-bold text-xl">메인 메뉴로</button>
    </div>
  );

  const renderRewards = () => (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-slate-900 text-white p-4">
      <h2 className="text-4xl font-black text-yellow-400 mb-10">스테이지 클리어!</h2>
      <div className="flex gap-4">
        <button onClick={() => {
          const pool = CARD_LIBRARY.filter(c => c.rarity !== 'special');
          let res = []; for(let i=0; i<3; i++) res.push(getCardDef(pool[Math.floor(Math.random()*pool.length)].id, shopUpgrades));
          setRewardCards(res); setGameState('REWARD_CARD');
        }} className="p-8 bg-slate-800 border-2 border-indigo-500 rounded-2xl flex flex-col items-center w-64 hover:scale-105 transition-transform">
          <PlusCircle className="w-12 h-12 mb-4 text-indigo-400"/>
          <span className="text-xl font-bold">카드 추가</span>
        </button>
        <button onClick={() => {
          const p = {...combatState.player}; p.hp = Math.min(p.maxHp, p.hp + Math.floor(p.maxHp*0.3));
          startNextStage(p, combatState.baseDeck);
        }} className="p-8 bg-slate-800 border-2 border-green-500 rounded-2xl flex flex-col items-center w-64 hover:scale-105 transition-transform">
          <Heart className="w-12 h-12 mb-4 text-green-400"/>
          <span className="text-xl font-bold">체력 회복</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <style>{styles}</style>
      <div id="game-root" className={`font-sans antialiased selection:bg-indigo-500 selection:text-white ${isCssFullScreen ? 'fixed inset-0 z-[999999] w-[100vw] h-[100vh] overflow-auto' : ''}`}>
        {toastMsg && <div className="fixed top-10 left-1/2 -translate-x-1/2 bg-green-600 px-6 py-3 rounded-full shadow-lg font-bold z-[10000] animate-pulse text-white">{toastMsg}</div>}
        {gameState === 'MENU' && renderMenu()}
        {gameState === 'SETTINGS' && (
          <div className="flex flex-col min-h-[100dvh] bg-slate-900 text-white p-10">
            <h2 className="text-3xl font-bold mb-10">설정</h2>
            <div className="flex flex-col gap-4 max-w-md">
              <button onClick={handleExport} className="py-4 bg-slate-700 rounded-lg font-bold flex items-center justify-center gap-2"><Download/> 세이브 복사</button>
              <button onClick={() => setImportModalOpen(true)} className="py-4 bg-slate-700 rounded-lg font-bold flex items-center justify-center gap-2"><Upload/> 세이브 붙여넣기</button>
              <button onClick={handleExitGame} className="py-4 bg-red-700 rounded-lg font-bold mt-10">저장 후 종료</button>
              <button onClick={() => setGameState('MENU')} className="py-4 bg-indigo-600 rounded-lg font-bold">뒤로</button>
            </div>
          </div>
        )}
        {gameState === 'ENCYCLOPEDIA' && (
          <div className="flex flex-col min-h-[100dvh] bg-slate-900 text-white p-4 pt-16">
            <div className="flex justify-between items-center mb-6 max-w-6xl mx-auto w-full">
              <h2 className="text-3xl font-bold">카드 도감</h2>
              <button onClick={() => setGameState('MENU')} className="px-4 py-2 bg-indigo-600 rounded-lg font-bold">메인</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 overflow-y-auto max-w-6xl mx-auto w-full pb-10">
              {CARD_LIBRARY.map(c => renderCard(getCardDef(c.id, shopUpgrades), null, !unlockedCards.includes(c.id)))}
            </div>
          </div>
        )}
        {gameState === 'SHOP' && renderShop()}
        {gameState === 'DECK_BUILDING' && renderDeckBuilder()}
        {gameState === 'BATTLE' && renderBattle()}
        {gameState === 'REWARDS' && renderRewards()}
        {gameState === 'REWARD_CARD' && (
          <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-slate-900 text-white p-4">
            <h2 className="text-2xl font-bold mb-10">추가할 카드 선택</h2>
            <div className="flex gap-4">
              {rewardCards.map((c, i) => (
                <div key={i} onClick={() => {
                  const newDeck = [...combatState.baseDeck, c];
                  if (!unlockedCards.includes(c.id)) { setUnlockedCards([...unlockedCards, c.id]); saveGame({ unlockedCards: [...unlockedCards, c.id] }); }
                  startNextStage(combatState.player, newDeck);
                }}>{renderCard(c, null, false, null, null, () => {})}</div>
              ))}
            </div>
          </div>
        )}
        {gameState === 'GAME_OVER' && renderGameOver()}
        {gameState === 'GAME_CLEAR' && (
          <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-slate-900 text-white">
            <Trophy className="w-32 h-32 text-yellow-400 mb-6 animate-bounce" />
            <h1 className="text-5xl font-black text-yellow-400">ALL CLEAR!</h1>
            <button onClick={() => setGameState('MENU')} className="mt-10 px-12 py-4 bg-indigo-600 rounded-full font-bold text-2xl">메인으로</button>
          </div>
        )}
        {importModalOpen && (
          <div className="fixed inset-0 bg-black/80 z-[10000] flex items-center justify-center p-4">
            <div className="bg-slate-800 p-6 rounded-xl w-full max-w-md border-2 border-slate-600">
              <h3 className="text-xl font-bold mb-4">세이브 불러오기</h3>
              <textarea className="w-full h-32 bg-slate-900 border border-slate-700 rounded p-2 text-white text-xs mb-4" value={importText} onChange={e => setImportText(e.target.value)} />
              <div className="flex justify-end gap-2">
                <button onClick={() => setImportModalOpen(false)} className="px-4 py-2 bg-slate-700 rounded">취소</button>
                <button onClick={() => handleImport(importText)} className="px-4 py-2 bg-indigo-600 rounded">불러오기</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}