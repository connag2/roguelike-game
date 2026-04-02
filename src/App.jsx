import React, { useState, useEffect } from 'react';
import { auth, db, appId } from './config/firebase';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

import { CARD_LIBRARY, BASE_CARDS, GAME_RULES, MANA_CARD_IDS } from './constants/gameData';
import { RELIC_LIBRARY } from './constants/relicData';
import { shuffle, decayStack, getCardDef, generateEnemies, generateEnemyIntent } from './utils/gameLogic';
import { useBattle } from './hooks/useBattle'; 

import MainMenu from './components/screens/MainMenu';
import BattleScreen from './components/screens/BattleScreen';
import ShopScreen from './components/screens/ShopScreen';
import DeckBuilder from './components/screens/DeckBuilder';
import Encyclopedia from './components/screens/Encyclopedia';
import MonsterDex from './components/screens/MonsterDex';
import Rewards from './components/screens/Rewards';
import Settings from './components/screens/Settings';
import Statistics from './components/screens/Statistics';
import UpdateHistory from './components/screens/UpdateHistory';
import GameGuide from './components/screens/GameGuide';
import AdminPanel from './components/admin/AdminPanel'; 

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', backgroundColor: '#0f172a', minHeight: '100vh', color: 'white' }}>
          <h1 style={{ fontSize: '2rem', color: '#ef4444', fontWeight: 'bold' }}>🚨 화면 오류(크래시) 발생!</h1>
          <pre style={{ marginTop: '20px', backgroundColor: 'black', padding: '20px', color: '#fca5a5', whiteSpace: 'pre-wrap' }}>
            {this.state.error?.toString()}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [gameState, setGameState] = useState('MENU');
  const [user, setUser] = useState(null);
  const [toastMsg, setToastMsg] = useState('');
  const [credits, setCredits] = useState(0);
  const [shopUpgrades, setShopUpgrades] = useState({ maxHp: 0, upgradedCards: [] });
  const [unlockedCards, setUnlockedCards] = useState(BASE_CARDS);
  const [deckCounts, setDeckCounts] = useState({ strike: 3, defend: 3, heavy_strike: 3, shield_bash: 3, heal: 2, mana_potion: 3, focus: 3 });
  
  const [playerRelics, setPlayerRelics] = useState([]);
  const [unlockedRelics, setUnlockedRelics] = useState([]); 
  const [startingRelic, setStartingRelic] = useState(null); 
  const [pendingRelicReward, setPendingRelicReward] = useState(null); 

  const [normalCleared, setNormalCleared] = useState(false);
  const [fastMode, setFastMode] = useState(false);
  const [maxStageReached, setMaxStageReached] = useState(1);
  const [seenEnemies, setSeenEnemies] = useState([]);
  const [usedCoupons, setUsedCoupons] = useState([]);
  
  const [gameStats, setGameStats] = useState({ totalKills: 0, totalBossKills: 0, totalCreditsEarned: 0, totalRuns: 0 });

  const [combatState, setCombatState] = useState(null);
  const [rewardCards, setRewardCards] = useState([]);
  const [tempDeckCounts, setTempDeckCounts] = useState({});
  const [viewingPile, setViewingPile] = useState(null);
  const [gachaResult, setGachaResult] = useState(null);
  const [premiumGachaResult, setPremiumGachaResult] = useState(null);
  const [specialBossRewardCard, setSpecialBossRewardCard] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [confirmSelection, setConfirmSelection] = useState(null);
  const [skipModalOpen, setSkipModalOpen] = useState(false);
  const [warpStage, setWarpStage] = useState(1);
  const [tutorialModalOpen, setTutorialModalOpen] = useState(false);
  const [dexViewingEnemy, setDexViewingEnemy] = useState(null);
  const [isCssFullScreen, setIsCssFullScreen] = useState(false);
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [adminCodeInput, setAdminCodeInput] = useState('');
  const [couponInput, setCouponInput] = useState('');
  const [deckImportModalOpen, setDeckImportModalOpen] = useState(false);
  const [deckImportText, setDeckImportText] = useState('');
  const [showEnemyDeck, setShowEnemyDeck] = useState(false);
  const [viewingEnemy, setViewingEnemy] = useState(null);
  
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importText, setImportText] = useState('');

  const [filterType, setFilterType] = useState('all');
  const [filterEffect, setFilterEffect] = useState('all');
  const [filterRarity, setFilterRarity] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    document.body.style.margin = '0';
    document.body.style.backgroundColor = '#0f172a';
  }, []);

  useEffect(() => {
    if (!auth) return;
    signInAnonymously(auth).catch(() => {});
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('roguelike_tactics_save');
      if (saved) {
        const d = JSON.parse(saved);
        if (d.credits !== undefined) setCredits(d.credits);
        if (d.shopUpgrades) setShopUpgrades(d.shopUpgrades);
        if (d.unlockedCards) setUnlockedCards(d.unlockedCards);
        if (d.deckCounts) setDeckCounts(d.deckCounts);
        if (d.unlockedRelics) setUnlockedRelics(d.unlockedRelics);
        if (d.startingRelic) setStartingRelic(d.startingRelic);
        if (d.gameStats) setGameStats(d.gameStats);
        if (d.normalCleared !== undefined) setNormalCleared(d.normalCleared);
        if (d.fastMode !== undefined) setFastMode(d.fastMode);
        if (d.maxStageReached !== undefined) setMaxStageReached(d.maxStageReached);
        if (d.seenEnemies) setSeenEnemies(d.seenEnemies);
        if (d.usedCoupons) setUsedCoupons(d.usedCoupons);
      }
    } catch (e) {
      console.error("세이브 데이터 로드 실패", e);
    }
  }, []);

  const saveGame = async (payload = {}) => {
    const data = { credits, shopUpgrades, unlockedCards, deckCounts, unlockedRelics, startingRelic, gameStats, normalCleared, fastMode, maxStageReached, seenEnemies, usedCoupons, ...payload };
    localStorage.setItem('roguelike_tactics_save', JSON.stringify(data));
    if (user && db) await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'gameSave', 'data'), data);
  };

  useEffect(() => {
    if (toastMsg) {
      const t = setTimeout(() => setToastMsg(''), 2500);
      return () => clearTimeout(t);
    }
  }, [toastMsg]);

  const applyStartCombatRelics = (basePlayer, activeRelics) => {
    let p = { ...basePlayer };
    (activeRelics || []).forEach(r => {
      if (['START_COMBAT', 'START_COMBAT_AND_TURN'].includes(r.effect?.type)) {
        if (r.effect.strength) p.buffs.strength += r.effect.strength;
        if (r.effect.dexterity) p.buffs.dexterity += r.effect.dexterity;
        if (r.effect.block) p.block += r.effect.block;
        if (r.effect.thorns) p.buffs.thorns += r.effect.thorns;
      }
      if (r.effect?.type === 'START_COMBAT_HEAL') p.hp = Math.min(p.maxHp, p.hp + r.effect.heal);
    });
    return p;
  };

  const startBattle = (mode = 'NORMAL', stage = 1) => {
    let fullDeck = [];
    Object.keys(deckCounts).forEach(id => {
      const def = getCardDef(id, shopUpgrades);
      for (let i = 0; i < deckCounts[id]; i++) fullDeck.push({ ...def });
    });
    const basePlayerHp = 100 + (shopUpgrades.maxHp * 15);
    const enemies = generateEnemies(stage);
    updateSeenEnemies(enemies);

    let initialRelics = [];
    if (startingRelic) {
      const relDef = RELIC_LIBRARY.find(r => r.id === startingRelic);
      if (relDef) initialRelics.push(relDef);
    }
    setPlayerRelics(initialRelics);

    let initialPlayer = { hp: basePlayerHp, maxHp: basePlayerHp, mana: 3, maxMana: 3, block: 0, debuffs: { weak: 0, vulnerable: 0, poison: 0 }, buffs: { strength: 0, dexterity: 0, thorns: 0 } };
    initialPlayer = applyStartCombatRelics(initialPlayer, initialRelics); 

    const newStats = { ...gameStats, totalRuns: (gameStats?.totalRuns || 0) + 1 };
    setGameStats(newStats);
    saveGame({ gameStats: newStats });

    setCombatState({
      mode, stage, baseDeck: fullDeck, drawPile: shuffle(fullDeck),
      hand: [], discardPile: [], turn: 'PLAYER', player: initialPlayer, enemies: enemies
    });
    
    setCombatState(prev => {
      const newDraw = [...prev.drawPile];
      const newHand = [];
      for(let i=0; i<5; i++) if(newDraw.length > 0) newHand.push({ ...newDraw.pop(), uid: Math.random().toString() });
      return { ...prev, hand: newHand, drawPile: newDraw };
    });
    setSkipModalOpen(false);
    setGameState('BATTLE');
  };

  const startNextStage = (newPlayer, newBaseDeck) => {
    const nextStage = combatState.stage + 1;
    const enemies = generateEnemies(nextStage);
    updateSeenEnemies(enemies);
    const newDraw = shuffle([...newBaseDeck]);
    const newHand = [];
    for(let i=0; i<5; i++) if(newDraw.length > 0) newHand.push({ ...newDraw.pop(), uid: Math.random().toString() });

    let refreshedPlayer = { ...newPlayer, block: 0, mana: newPlayer.maxMana, debuffs: { weak: 0, vulnerable: 0, poison: 0 }, buffs: newPlayer.buffs };
    refreshedPlayer = applyStartCombatRelics(refreshedPlayer, playerRelics); 

    setCombatState({
      ...combatState, stage: nextStage, enemies, baseDeck: newBaseDeck,
      drawPile: newDraw, hand: newHand, discardPile: [], turn: 'PLAYER', player: refreshedPlayer
    });
    setRewardCards([]);
    setGameState('BATTLE');
  };

  const updateSeenEnemies = (list) => {
    const newSeen = [...seenEnemies];
    let changed = false;
    list.forEach(e => { if (!newSeen.includes(e.template?.name)) { newSeen.push(e.template?.name); changed = true; } });
    if (changed) { setSeenEnemies(newSeen); saveGame({ seenEnemies: newSeen }); }
  };

  const { playCard, checkRevive } = useBattle({
    combatState, setCombatState,
    playerRelics, setPlayerRelics,
    fastMode, setToastMsg, setGameState, saveGame,
    gameStats, setGameStats,
    credits, setCredits,
    maxStageReached, setMaxStageReached,
    setPendingRelicReward, setSpecialBossRewardCard, setNormalCleared
  });

  const handleRelicRewardClaim = () => {
    if (!pendingRelicReward) return;
    const updatedRelics = [...(playerRelics || []), pendingRelicReward];
    setPlayerRelics(updatedRelics);
    let newUnlocked = [...(unlockedRelics || [])];
    if (!newUnlocked.includes(pendingRelicReward.id)) newUnlocked.push(pendingRelicReward.id);
    setUnlockedRelics(newUnlocked);
    saveGame({ unlockedRelics: newUnlocked });
    setToastMsg(`🌟 ${pendingRelicReward.name} 장착 완료!`);
    setPendingRelicReward(null);
    if (specialBossRewardCard) { setGameState('BOSS_CLEAR_REWARD'); } 
    else if (combatState.mode === 'NORMAL' && combatState.stage >= 100) { setNormalCleared(true); saveGame({ normalCleared: true }); setGameState('GAME_CLEAR'); } 
    else { setGameState('REWARDS'); }
  };

  useEffect(() => {
    if (gameState !== 'BATTLE' || !combatState || combatState.turn !== 'ENEMY') return;
    const timer = setTimeout(() => {
      setCombatState(prev => {
        let p = { ...prev.player };
        let newEnemies = prev.enemies.map(e => ({ ...e, block: 0 }));
        newEnemies.forEach(e => {
          if (e.debuffs?.poison > 0) { e.hp -= e.debuffs.poison; e.debuffs.poison = Math.max(0, e.debuffs.poison - 1); checkRevive(e, null); }
          if (e.hp <= 0) return;
          if (e.passives?.some(ps => ps.id === 'scaling_strength')) e.buffs.strength = (e.buffs.strength || 0) + 3;
          let intent = e.intentCard;
          if (intent.type.includes('attack')) {
            let dmg = intent.value + (e.buffs.strength || 0);
            if (p.debuffs.vulnerable > 0) dmg = Math.floor(dmg * 1.3);
            if (e.debuffs.weak > 0) dmg = Math.floor(dmg * 0.97); 
            for(let i=0; i<(intent.multi || 1); i++) {
              if (p.block >= dmg) p.block -= dmg; else { p.hp -= (dmg - p.block); p.block = 0; }
              if (p.buffs?.thorns > 0) { e.hp -= p.buffs.thorns; checkRevive(e, null); }
            }
          }
          if (e.hp <= 0) return;
          if (intent.type.includes('debuff')) {
            if (intent.debuff === 'weak') p.debuffs.weak += intent.turns;
            if (intent.debuff === 'vulnerable') p.debuffs.vulnerable += intent.turns;
          }
          if (intent.type.includes('defend')) e.block += intent.value;
          if (intent.type.includes('buff') && intent.buff === 'strength') e.buffs.strength += intent.buffValue;
          if (intent.type.includes('heal')) e.hp = Math.min(e.maxHp, e.hp + (intent.heal || 0));
          e.debuffs.weak = decayStack(e.debuffs.weak); e.debuffs.vulnerable = decayStack(e.debuffs.vulnerable); e.buffs.strength = decayStack(e.buffs.strength);
          e.intentCard = generateEnemyIntent(e.template, prev.stage);
        });
        newEnemies = newEnemies.filter(e => e.hp > 0);
        if (p.hp <= 0) { setGameState('GAME_OVER'); return prev; }
        if (newEnemies.length === 0) { setTimeout(() => setGameState('REWARDS'), 600); return { ...prev, player: p, enemies: [], hand: [], discardPile: [], drawPile: [] }; }
        p.block = 0; p.mana = p.maxMana;
        ['weak', 'vulnerable', 'poison'].forEach(k => p.debuffs[k] = decayStack(p.debuffs[k]));
        ['strength', 'dexterity', 'thorns'].forEach(k => p.buffs[k] = decayStack(p.buffs[k]));
        let turnBlock = 0, turnMana = 0, turnDraw = 0, turnStrength = 0, selfDamage = 0;
        (playerRelics || []).forEach(r => {
          if (r.effect?.type === 'START_TURN') { if (r.effect.block) turnBlock += r.effect.block; if (r.effect.draw) turnDraw += r.effect.draw; }
          if (r.effect?.type === 'START_TURN_ADVANCED') { if (r.effect.block) turnBlock += r.effect.block; if (r.effect.poison) newEnemies.forEach(e => e.debuffs.poison += r.effect.poison); if (r.effect.selfDamage) selfDamage += r.effect.selfDamage; }
          if (r.effect?.type === 'START_TURN_CONDITION' && r.effect.condition === 'HP_50' && p.hp <= p.maxHp / 2) { if (r.effect.strength) turnStrength += r.effect.strength; }
          if (r.effect?.type === 'START_TURN_MYTHIC') { turnMana += r.effect.mana; turnDraw += r.effect.draw; turnStrength += r.effect.strength; }
          if (r.effect?.type === 'START_COMBAT_AND_TURN') { if (r.effect.selfDamage) selfDamage += r.effect.selfDamage; }
        });
        p.hp -= selfDamage;
        if (p.hp <= 0) { setGameState('GAME_OVER'); return prev; } 
        p.block += turnBlock; p.mana = p.maxMana + turnMana; p.buffs.strength += turnStrength;
        let newDiscard = [...prev.discardPile, ...prev.hand], newDraw = [...prev.drawPile], newHand = [];
        let drawAmount = 5 + turnDraw;
        for (let i = 0; i < drawAmount; i++) {
          if (newHand.length >= (GAME_RULES?.MAX_HAND_SIZE || 10)) break;
          if (newDraw.length === 0) { if (newDiscard.length === 0) break; newDraw = shuffle(newDiscard); newDiscard = []; }
          if (newDraw.length > 0) newHand.push({ ...newDraw.pop(), uid: Math.random().toString() });
        }
        return { ...prev, player: p, enemies: newEnemies, hand: newHand, drawPile: newDraw, discardPile: newDiscard, turn: 'PLAYER' };
      });
    }, fastMode ? 500 : 1500);
    return () => clearTimeout(timer);
  }, [gameState, combatState?.turn, fastMode, checkRevive]);

  const getFilteredCards = (t, e, r, o, q) => {
    return CARD_LIBRARY.filter(c => {
      if (r !== 'all' && c.rarity !== r) return false;
      if (t !== 'all' && c.type !== t) return false;
      if (e === 'debuff' && !(c.enemyWeak || c.enemyVuln || c.enemyPoison)) return false;
      if (e === 'buff' && !(c.selfStrength || c.selfDex || c.selfThorns)) return false;
      if (o === 'owned' && !unlockedCards.includes(c.id)) return false;
      if (o === 'unowned' && unlockedCards.includes(c.id)) return false;
      if (q) { const def = getCardDef(c.id, shopUpgrades); if (def && !(def.name || '').toLowerCase().includes(q.toLowerCase()) && !(def.desc || '').toLowerCase().includes(q.toLowerCase())) return false; }
      return true;
    });
  };

  const openDeckBuilder = () => { setTempDeckCounts({ ...deckCounts }); setGameState('DECK_BUILDING'); };
  const openEncyclopedia = () => { setGameState('ENCYCLOPEDIA'); };
  const openMonsterDex = () => { setGameState('MONSTER_DEX'); };
  const openShop = () => { setGameState('SHOP'); };
  const getTotalCards = (counts = deckCounts) => Object.values(counts || {}).reduce((a, b) => a + b, 0);

  // 🐛 [버그 수정 1] 가챠에서 카드 뽑을 때 로컬스토리지 저장이 꼬이는 현상 완전 수정
  const handleGacha = () => {
    if (credits < 50) return;
    const result = [];
    const pool = CARD_LIBRARY.filter(c => ['common', 'uncommon', 'rare'].includes(c.rarity));
    let duplicateRefund = 0;
    
    // 현재 보유 카드 배열의 복사본을 만들어 루프 내에서 실시간 동기화
    let currentUnlocked = [...unlockedCards]; 

    for (let i = 0; i < 3; i++) {
      const roll = Math.random();
      let r = 'common';
      if (roll < 0.05) r = 'rare'; 
      else if (roll < 0.3) r = 'uncommon';
      const cPool = pool.filter(c => c.rarity === r);
      const card = cPool[Math.floor(Math.random() * cPool.length)];
      
      if (currentUnlocked.includes(card.id)) { 
        result.push({ ...card, isDuplicate: true }); 
        duplicateRefund += 10; 
      } else { 
        result.push({ ...card, isDuplicate: false }); 
        currentUnlocked.push(card.id); // 복사본에 즉시 추가
      }
    }
    const newCredits = credits - 50 + duplicateRefund;
    setCredits(newCredits);
    setUnlockedCards(currentUnlocked); // 업데이트된 복사본 통째로 반영
    if (duplicateRefund > 0) setToastMsg(`${duplicateRefund} 크레딧 환급됨!`);
    setGachaResult(result); 
    
    // 세이브 데이터에도 확실히 최신 복사본을 전달
    saveGame({ credits: newCredits, unlockedCards: currentUnlocked }); 
  };

  // 🐛 [버그 수정 2] 쿠폰 기능에서 unlockedCards 배열에 배열이 중첩되는 치명적 오타 수정
  const handleCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    if (usedCoupons.includes(code)) { setToastMsg('이미 사용한 쿠폰입니다.'); return; }
    let valid = false, msg = '', creditsToAdd = 0, unlockedToAdd = null;
    if (code === 'WELCOME') { creditsToAdd = 1000; msg = '웰컴 쿠폰: 1000 크레딧 획득!'; valid = true; } 
    else if (code === 'LEGENDARY') { unlockedToAdd = 'true_dragon_slayer'; msg = '전설 쿠폰: 진·용살검 해금!'; valid = true; } 
    else if (code === 'WARP50') {
      if (getTotalCards() !== 20) { setToastMsg('덱이 20장이 아닙니다.'); return; }
      handleWarp(50); msg = '워프 쿠폰: 50층으로 이동!'; valid = true;
    }
    if (!valid) { setToastMsg('유효하지 않은 쿠폰 코드입니다.'); return; }
    const updatedCoupons = [...usedCoupons, code];
    
    // 여기가 문제였습니다. [...unlockedCards, unlockedCards] -> [...unlockedCards, unlockedToAdd] 로 수정
    const updatedUnlocked = unlockedToAdd && !unlockedCards.includes(unlockedToAdd) ? [...unlockedCards, unlockedToAdd] : unlockedCards;
    
    if (creditsToAdd > 0) setCredits(prev => prev + creditsToAdd);
    if (updatedUnlocked !== unlockedCards) setUnlockedCards(updatedUnlocked);
    setUsedCoupons(updatedCoupons); setCouponInput(''); setToastMsg(msg);
    saveGame({ usedCoupons: updatedCoupons, unlockedCards: updatedUnlocked, credits: credits + creditsToAdd });
  };

  const handleWarp = (targetStage) => {
    if (getTotalCards() !== 20) { setToastMsg('덱이 20장이 아닙니다.'); return; }
    setWarpStage(targetStage); startBattle('NORMAL', targetStage);
    setToastMsg(`관리자 권한: ${targetStage}층으로 워프!`);
  };

  const handleExport = () => { const data = JSON.stringify({ credits, shopUpgrades, unlockedCards, deckCounts, unlockedRelics, startingRelic, gameStats, normalCleared, fastMode, maxStageReached, seenEnemies, usedCoupons }); navigator.clipboard.writeText(btoa(encodeURIComponent(data))); setToastMsg('세이브 코드가 복사되었습니다!'); };
  const handleExitGame = async () => { setToastMsg('저장 중...'); await saveGame(); if (window.require) window.close(); else setGameState('MENU'); };

  const handlePremiumGacha = () => {
    if (credits < 100) { setToastMsg('크레딧이 부족합니다.'); return; }
    const result = [];
    setCredits(prev => prev - 100);
    for (let i = 0; i < 3; i++) {
      const roll = Math.random();
      let rarity = roll < 0.03 ? 'rare' : 'uncommon'; 
      const pool = CARD_LIBRARY.filter(c => c.rarity === rarity || (rarity === 'rare' && c.rarity === 'special'));
      const card = pool[Math.floor(Math.random() * pool.length)];
      result.push(card);
    }
    setPremiumGachaResult(result);
    saveGame({ credits: credits - 100 });
  };

  const handleAddCard = (id) => {
    const total = getTotalCards(tempDeckCounts);
    const isManaCard = MANA_CARD_IDS.includes(id);
    const currentManaCount = MANA_CARD_IDS.reduce((acc, mid) => acc + (tempDeckCounts[mid] || 0), 0);

    if (total >= 20) { setToastMsg('덱은 최대 20장까지만 가능합니다.'); return; }
    if ((tempDeckCounts[id] || 0) >= 3) { setToastMsg('동일 카드는 최대 3장까지 가능합니다.'); return; }
    if (isManaCard && currentManaCount >= 2) {
      setToastMsg('마나 관련 카드는 덱에 최대 2장까지만 넣을 수 있습니다.');
      return;
    }

    setTempDeckCounts({ ...tempDeckCounts, [id]: (tempDeckCounts[id] || 0) + 1 });
  };

  return (
    <ErrorBoundary>
      <div className={isCssFullScreen ? 'fixed inset-0 z-50 bg-slate-950' : 'bg-slate-900 min-h-screen text-white'}>
        {toastMsg && <div className="fixed top-10 left-1/2 -translate-x-1/2 bg-indigo-600 px-6 py-3 rounded-full z-[9999] shadow-2xl animate-bounce font-bold">{toastMsg}</div>}

        <GameGuide isOpen={tutorialModalOpen} onClose={() => setTutorialModalOpen(false)} />

        <AdminPanel
          gameState={gameState} // 👈 이 줄을 추가하세요!
          credits={credits}
          setCredits={setCredits}
          unlockedCards={unlockedCards}
          setUnlockedCards={setUnlockedCards}
          unlockedRelics={unlockedRelics}
          setUnlockedRelics={setUnlockedRelics}
          combatState={combatState}
          setCombatState={setCombatState}
          setGameState={setGameState}
          setToastMsg={setToastMsg}
          saveGame={saveGame}
          CARD_LIBRARY={CARD_LIBRARY}
          RELIC_LIBRARY={RELIC_LIBRARY}
          deckCounts={deckCounts}
          setDeckCounts={setDeckCounts}
          playerRelics={playerRelics}
          setPlayerRelics={setPlayerRelics}
          startBattle={startBattle}
        />

        {deckImportModalOpen && (
          <div className="fixed inset-0 bg-black/90 z-[10000] flex items-center justify-center p-4" onClick={() => setDeckImportModalOpen(false)}>
            <div className="bg-slate-800 p-6 rounded-xl border-2 border-indigo-500 w-full max-w-md" onClick={e => e.stopPropagation()}>
              <h3 className="text-xl font-bold mb-4">덱 불러오기</h3>
              <textarea className="w-full h-32 bg-slate-900 border border-slate-600 rounded-lg p-3 text-white" value={deckImportText} onChange={e => setDeckImportText(e.target.value)} />
              <div className="flex gap-3 mt-4">
                <button onClick={() => setDeckImportModalOpen(false)} className="flex-1 py-3 bg-slate-700 rounded-lg">취소</button>
                <button onClick={() => { try { const data = JSON.parse(decodeURIComponent(atob(deckImportText.trim()))); setTempDeckCounts(data); setDeckImportModalOpen(false); setToastMsg('덱 성공!'); } catch(e) { setToastMsg('오류!'); } }} className="flex-1 py-3 bg-indigo-600 rounded-lg">확인</button>
              </div>
            </div>
          </div>
        )}

        {skipModalOpen && (
          <div className="fixed inset-0 bg-black/90 z-[10000] flex items-center justify-center p-4" onClick={() => setSkipModalOpen(false)}>
            <div className="bg-slate-800 p-6 rounded-xl border-2 border-emerald-500 w-full max-w-md text-center" onClick={e => e.stopPropagation()}>
              <h3 className="text-2xl font-black mb-2 text-emerald-400">스테이지 도약</h3>
              <p className="text-slate-300 text-xs mb-6 break-keep">
                최대 도달 층({maxStageReached}층)을 기준으로, 이전에 돌파했던 보스 층에서 바로 시작할 수 있습니다.
              </p>
              
              <div className="grid grid-cols-4 gap-2 mb-6 max-h-[40vh] overflow-y-auto pr-1">
                {Array.from({ length: Math.floor(maxStageReached / 5) }, (_, i) => (i + 1) * 5).map(floor => (
                  <button 
                    key={floor}
                    onClick={() => {
                      if (getTotalCards() !== 20) { 
                        setToastMsg('덱을 20장 꽉 채워야 시작할 수 있습니다.'); 
                        setSkipModalOpen(false); 
                        return; 
                      }
                      startBattle('NORMAL', floor);
                      setSkipModalOpen(false);
                      setToastMsg(`${floor}층부터 도약을 시작합니다!`);
                    }}
                    className="py-2 bg-slate-900 hover:bg-emerald-600 border border-slate-600 hover:border-emerald-400 rounded-lg text-sm font-bold transition-all text-slate-200 hover:text-white"
                  >
                    {floor}층
                  </button>
                ))}
              </div>

              <button onClick={() => setSkipModalOpen(false)} className="w-full py-3 bg-slate-700 hover:bg-slate-600 border border-slate-500 rounded-lg font-bold transition-colors">
                취소
              </button>
            </div>
          </div>
        )}

        {importModalOpen && (
          <div className="fixed inset-0 bg-black/90 z-[10000] flex items-center justify-center p-4" onClick={() => setImportModalOpen(false)}>
            <div className="bg-slate-800 p-6 rounded-xl border-2 border-amber-500 w-full max-w-md" onClick={e => e.stopPropagation()}>
              <h3 className="text-xl font-bold mb-4 text-amber-400">세이브 정보 불러오기</h3>
              <p className="text-xs text-slate-400 mb-2">복사해둔 세이브 코드를 아래에 붙여넣어주세요.</p>
              <textarea className="w-full h-32 bg-slate-900 border border-slate-600 rounded-lg p-3 text-white" value={importText} onChange={e => setImportText(e.target.value)} />
              <div className="flex gap-3 mt-4">
                <button onClick={() => setImportModalOpen(false)} className="flex-1 py-3 bg-slate-700 rounded-lg font-bold">취소</button>
                <button onClick={() => { 
                  try { 
                    const d = JSON.parse(decodeURIComponent(atob(importText.trim()))); 
                    if (d.credits !== undefined) setCredits(d.credits);
                    if (d.shopUpgrades) setShopUpgrades(d.shopUpgrades);
                    if (d.unlockedCards) setUnlockedCards(d.unlockedCards);
                    if (d.deckCounts) setDeckCounts(d.deckCounts);
                    if (d.unlockedRelics) setUnlockedRelics(d.unlockedRelics);
                    if (d.startingRelic) setStartingRelic(d.startingRelic);
                    if (d.gameStats) setGameStats(d.gameStats);
                    if (d.normalCleared !== undefined) setNormalCleared(d.normalCleared);
                    if (d.fastMode !== undefined) setFastMode(d.fastMode);
                    if (d.maxStageReached !== undefined) setMaxStageReached(d.maxStageReached);
                    if (d.seenEnemies) setSeenEnemies(d.seenEnemies);
                    if (d.usedCoupons) setUsedCoupons(d.usedCoupons);
                    saveGame(d);
                    setImportModalOpen(false); 
                    setToastMsg('세이브 불러오기 성공!'); 
                  } catch(e) { 
                    setToastMsg('잘못된 세이브 코드입니다!'); 
                  } 
                }} className="flex-1 py-3 bg-amber-600 text-white rounded-lg font-bold hover:bg-amber-500">불러오기 적용</button>
              </div>
            </div>
          </div>
        )}

        {gameState === 'MENU' && (
          <MainMenu credits={credits} getTotalCards={getTotalCards} openDeckBuilder={openDeckBuilder} openEncyclopedia={openEncyclopedia} openMonsterDex={openMonsterDex} openShop={openShop} setTutorialModalOpen={setTutorialModalOpen} setGameState={setGameState} startBattle={startBattle} normalCleared={normalCleared} maxStageReached={maxStageReached} setSkipModalOpen={setSkipModalOpen} toggleFullScreen={() => setIsCssFullScreen(!isCssFullScreen)} />
        )}
        {gameState === 'UPDATE_HISTORY' && (
          <UpdateHistory 
            setGameState={setGameState} 
            usedCoupons={usedCoupons}          
            couponInput={couponInput}          
            setCouponInput={setCouponInput}    
            handleCoupon={handleCoupon}        
          />
        )}
        {gameState === 'STATISTICS' && <Statistics maxStageReached={maxStageReached} normalCleared={normalCleared} seenEnemies={seenEnemies} unlockedCards={unlockedCards} credits={credits} unlockedRelics={unlockedRelics} gameStats={gameStats} setGameState={setGameState} />}
        
        {/* 🐛 [버그 수정 3] Settings의 관리자 버튼 클릭 시 세이브가 안 되던 현상 수정 */}
        {gameState === 'SETTINGS' && <Settings setGameState={setGameState} fastMode={fastMode} setFastMode={setFastMode} saveGame={saveGame} handleExport={handleExport} setImportModalOpen={setImportModalOpen} couponInput={couponInput} setCouponInput={setCouponInput} handleCoupon={handleCoupon} handleExitGame={handleExitGame} isAdminUnlocked={isAdminUnlocked} adminCodeInput={adminCodeInput} setAdminCodeInput={setAdminCodeInput} handleAdminUnlock={() => adminCodeInput==='20090324' ? setIsAdminUnlocked(true) : setToastMsg('틀림')} 
          adminUnlockAllCards={() => {
            const all = CARD_LIBRARY.map(c=>c.id); 
            setUnlockedCards(all); 
            saveGame({unlockedCards: all}); 
            setToastMsg('완료');
          }} 
          adminGiveMoney={() => {
            const nc = credits + 99999; 
            setCredits(nc); 
            saveGame({credits: nc}); 
            setToastMsg('완료');
          }} 
          adminUnlockAllRelics={() => {
            const all = RELIC_LIBRARY.map(r=>r.id); 
            setUnlockedRelics(all); 
            saveGame({unlockedRelics: all}); 
            setToastMsg('완료');
          }} 
          adminClearSave={() => {localStorage.removeItem('roguelike_tactics_save'); window.location.reload();}} handleWarp={handleWarp} warpStage={warpStage} setWarpStage={setWarpStage} />}
        
        {gameState === 'DECK_BUILDING' && <DeckBuilder toggleFullScreen={() => setIsCssFullScreen(!isCssFullScreen)} getTotalCards={getTotalCards} tempDeckCounts={tempDeckCounts} handleClearDeck={() => setTempDeckCounts({})} handleDeckExport={() => {navigator.clipboard.writeText(btoa(encodeURIComponent(JSON.stringify(tempDeckCounts)))); setToastMsg('복사!');}} setDeckImportModalOpen={setDeckImportModalOpen} setDeckCounts={setDeckCounts} saveGame={saveGame} setGameState={setGameState} filterType={filterType} setFilterType={setFilterType} filterEffect={filterEffect} setEffect={setFilterEffect} filterRarity={filterRarity} setRarity={setFilterRarity} searchQuery={searchQuery} setSearchQuery={setSearchQuery} filteredCards={getFilteredCards(filterType, filterEffect, filterRarity, 'owned', searchQuery)} getCardDef={getCardDef} shopUpgrades={shopUpgrades} handleAddCard={handleAddCard} handleRemoveCard={(id) => setTempDeckCounts({...tempDeckCounts, [id]: Math.max(0, (tempDeckCounts[id]||0)-1)})} setTutorialModalOpen={setTutorialModalOpen} normalCleared={normalCleared} unlockedRelics={unlockedRelics} startingRelic={startingRelic} setStartingRelic={setStartingRelic} />}
        
        {/* 🐛 [버그 수정 4] 프리미엄 가챠 보상 수령 시 최신 상태 세이브 연동 */}
        {gameState === 'SHOP' && <ShopScreen credits={credits} setCredits={setCredits} shopUpgrades={shopUpgrades} setShopUpgrades={setShopUpgrades} unlockedCards={unlockedCards} setUnlockedCards={setUnlockedCards} saveGame={saveGame} setGameState={setGameState} toggleFullScreen={() => setIsCssFullScreen(!isCssFullScreen)} setToastMsg={setToastMsg} getCardDef={getCardDef} handleGacha={handleGacha} handlePremiumGacha={handlePremiumGacha} gachaResult={gachaResult} setGachaResult={setGachaResult} premiumGachaResult={premiumGachaResult} setPremiumGachaResult={setPremiumGachaResult} 
          selectPremiumCard={(card) => { 
            let newUnlocked = unlockedCards;
            if(!unlockedCards.includes(card.id)) {
              newUnlocked = [...unlockedCards, card.id];
              setUnlockedCards(newUnlocked);
            }
            setPremiumGachaResult(null); 
            setToastMsg('획득!'); 
            saveGame({ unlockedCards: newUnlocked }); 
          }} 
          setTutorialModalOpen={setTutorialModalOpen} />}
        
        {gameState === 'BATTLE' && <BattleScreen combatState={combatState} isPlayerTurn={combatState?.turn === 'PLAYER'} setViewingPile={setViewingPile} viewingPile={viewingPile} setGameState={setGameState} hoveredCard={hoveredCard} setHoveredCard={setHoveredCard} playCard={playCard} setCombatState={setCombatState} MAX_HAND_SIZE={GAME_RULES?.MAX_HAND_SIZE || 10} setShowEnemyDeck={setShowEnemyDeck} setViewingEnemy={setViewingEnemy} setTutorialModalOpen={setTutorialModalOpen} viewingEnemy={viewingEnemy} showEnemyDeck={showEnemyDeck} playerRelics={playerRelics} fastMode={fastMode} setFastMode={setFastMode} saveGame={saveGame} />}
        {gameState === 'ENCYCLOPEDIA' && <Encyclopedia unlockedCards={unlockedCards} getCardDef={getCardDef} shopUpgrades={shopUpgrades} getFilteredCards={getFilteredCards} setGameState={setGameState} toggleFullScreen={() => setIsCssFullScreen(!isCssFullScreen)} setTutorialModalOpen={setTutorialModalOpen} unlockedRelics={unlockedRelics} />}
        {gameState === 'MONSTER_DEX' && <MonsterDex seenEnemies={seenEnemies} dexViewingEnemy={dexViewingEnemy} setDexViewingEnemy={setDexViewingEnemy} toggleFullScreen={() => setIsCssFullScreen(!isCssFullScreen)} setGameState={setGameState} setTutorialModalOpen={setTutorialModalOpen} />}
        
        {/* 🐛 [버그 수정 5] 보스 클리어 보상 수령 시 최신 상태 세이브 연동 */}
        {(['REWARDS', 'REWARD_CARD', 'REWARD_REMOVE', 'BOSS_CLEAR_REWARD', 'RELIC_REWARD'].includes(gameState)) && <Rewards gameState={gameState} rewardCards={rewardCards} setRewardCards={setRewardCards} combatState={combatState} unlockedCards={unlockedCards} setUnlockedCards={setUnlockedCards} saveGame={saveGame} setGameState={setGameState} confirmSelection={confirmSelection} setConfirmSelection={setConfirmSelection} startNextStage={startNextStage} getCardDef={getCardDef} shopUpgrades={shopUpgrades} specialBossRewardCard={specialBossRewardCard} 
          handleSpecialBossRewardClaim={() => { 
            if(specialBossRewardCard) { 
              let newUnlocked = unlockedCards;
              if(!unlockedCards.includes(specialBossRewardCard.id)) {
                newUnlocked = [...unlockedCards, specialBossRewardCard.id];
                setUnlockedCards(newUnlocked);
              }
              setCombatState(prev=>({...prev, baseDeck: [...prev.baseDeck, specialBossRewardCard]})); 
              setSpecialBossRewardCard(null); 
              setGameState('REWARDS'); 
              saveGame({ unlockedCards: newUnlocked }); 
            } 
          }} 
          pendingRelicReward={pendingRelicReward} handleRelicRewardClaim={handleRelicRewardClaim} />}
        
        {gameState === 'GAME_OVER' && <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-slate-900 text-white p-4"><h1 className="text-6xl md:text-8xl font-black text-red-600 mb-6">GAME OVER</h1><p className="text-2xl text-slate-300 mb-12">STAGE {combatState?.stage || 1}</p><button onClick={() => setGameState('MENU')} className="py-4 px-12 bg-indigo-600 rounded-full text-2xl font-bold">메인으로</button></div>}
        {gameState === 'GAME_CLEAR' && <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-slate-900 text-white p-4"><h1 className="text-6xl font-black text-yellow-400 mb-8 animate-pulse">CONQUEROR!</h1><p className="text-xl text-slate-300 mb-8">이제 시작 덱에서 유물 1개를 선택할 수 있습니다!</p><button onClick={() => setGameState('MENU')} className="py-4 px-12 bg-indigo-600 rounded-full text-2xl font-bold">메인으로</button></div>}
      </div>
    </ErrorBoundary>
  );
}