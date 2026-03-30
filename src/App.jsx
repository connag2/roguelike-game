import React, { useState, useEffect } from 'react';
import { auth, db, appId } from './config/firebase';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { HelpCircle } from 'lucide-react'; 

import { CARD_LIBRARY, BASE_CARDS, GAME_RULES } from './constants/gameData';
import { RELIC_LIBRARY } from './constants/relicData';
import { shuffle, decayStack, getCardDef, generateEnemies, generateEnemyIntent } from './utils/gameLogic';
import { useBattle } from './hooks/useBattle'; // ✨ 새로 추가된 전투 전용 훅

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

  // ✨ 삭제된 수백 줄의 전투 처리 로직을 이 훅이 전부 대신합니다!
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

    if (specialBossRewardCard) {
      setGameState('BOSS_CLEAR_REWARD');
    } else if (combatState.mode === 'NORMAL' && combatState.stage >= 100) {
      setNormalCleared(true); saveGame({ normalCleared: true }); setGameState('GAME_CLEAR');
    } else {
      setGameState('REWARDS');
    }
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

  const handleGacha = () => {
    if (credits < 50) return;
    const result = [];
    const pool = CARD_LIBRARY.filter(c => ['common', 'uncommon', 'rare'].includes(c.rarity));
    let duplicateRefund = 0;
    
    for (let i = 0; i < 3; i++) {
      const roll = Math.random();
      let r = 'common';
      if (roll < 0.05) r = 'rare';
      else if (roll < 0.3) r = 'uncommon';
      
      const cPool = pool.filter(c => c.rarity === r);
      const card = cPool[Math.floor(Math.random() * cPool.length)];
      
      if (unlockedCards.includes(card.id)) { result.push({ ...card, isDuplicate: true }); duplicateRefund += 10; } 
      else { result.push({ ...card, isDuplicate: false }); setUnlockedCards(prev => [...prev, card.id]); }
    }
    const newCredits = credits - 50 + duplicateRefund;
    setCredits(newCredits);
    if (duplicateRefund > 0) setToastMsg(`${duplicateRefund} 크레딧 환급됨!`);
    setGachaResult(result); saveGame({ credits: newCredits, unlockedCards });
  };

  const handlePremiumGacha = () => {
    if (credits < 100) return;
    const pool = CARD_LIBRARY.filter(c => ['uncommon', 'rare', 'special'].includes(c.rarity));
    const result = [];
    for (let i = 0; i < 3; i++) {
      const roll = Math.random();
      let r = 'uncommon';
      if (roll < 0.1) r = 'special';
      else if (roll < 0.4) r = 'rare';
      const cPool = pool.filter(c => c.rarity === r);
      const card = cPool[Math.floor(Math.random() * cPool.length)];
      result.push(card);
    }
    setCredits(prev => prev - 100); setPremiumGachaResult(result); saveGame({ credits: credits - 100 });
  };

  const selectPremiumCard = (card) => {
    if (!unlockedCards.includes(card.id)) {
      const next = [...unlockedCards, card.id]; setUnlockedCards(next); saveGame({ unlockedCards: next }); setToastMsg(`${card.name} 획득!`);
    } else {
      setCredits(prev => prev + 30); setToastMsg(`중복 보상 30 크레딧 획득!`); saveGame({ credits: credits + 30 });
    }
    setPremiumGachaResult(null);
  };

  const handleCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    if (usedCoupons.includes(code)) { setToastMsg('이미 사용한 쿠폰입니다.'); return; }
    let valid = false, msg = '', creditsToAdd = 0, unlockedToAdd = null;
    if (code === 'WELCOME') { creditsToAdd = 1000; msg = '웰컴 쿠폰: 1000 크레딧 획득!'; valid = true; } 
    else if (code === 'LEGENDARY') { unlockedToAdd = 'true_dragon_slayer'; msg = '전설 쿠폰: 진·용살검 해금!'; valid = true; } 
    else if (code === 'GEMS') { creditsToAdd = 500; msg = '보석 쿠폰: 500 크레딧 획득!'; valid = true; }
    else if (code === '50STAGEAWARD') { creditsToAdd = 10000; msg = '50 스테이지 보상: 10,000 크레딧 획득!'; valid = true; }
    else if (code === '75STAGEREWARD') { unlockedToAdd = 'furioso'; msg = '75 스테이지 보상: Furioso 카드 해금!'; valid = true; }
    else if (code === 'WARP50') {
    if (getTotalCards() !== 20) {
      setToastMsg('덱이 20장이 아닙니다. 먼저 덱을 20장으로 맞춰주세요.');
      return;
    }
    handleWarp(50); // 50층으로 이동하는 함수 호출
    msg = '워프 쿠폰: 50층 보스에게 이동합니다!';
    valid = true;
  }
    if (!valid) { setToastMsg('유효하지 않은 쿠폰 코드입니다.'); return; }
    const updatedCoupons = [...usedCoupons, code];
    const updatedUnlocked = unlockedToAdd && !unlockedCards.includes(unlockedToAdd) ? [...unlockedCards, unlockedToAdd] : unlockedCards;
    if (creditsToAdd > 0) setCredits(prev => prev + creditsToAdd);
    if (updatedUnlocked !== unlockedCards) setUnlockedCards(updatedUnlocked);
    setUsedCoupons(updatedCoupons); setCouponInput(''); setToastMsg(msg);
    saveGame({ usedCoupons: updatedCoupons, unlockedCards: updatedUnlocked, credits: credits + creditsToAdd });
  };

  const handleAdminUnlock = () => { if (adminCodeInput === '20090324') { setIsAdminUnlocked(true); setToastMsg('개발자 권한 활성화됨'); } else setToastMsg('잘못된 코드입니다.'); };
  const adminGiveMoney = () => { const nextCredits = credits + 99999; setCredits(nextCredits); saveGame({ credits: nextCredits }); setToastMsg('99,999 크레딧 지급됨'); };
  const adminUnlockAllCards = () => { const allIds = CARD_LIBRARY.map(c => c.id); setUnlockedCards(allIds); saveGame({ unlockedCards: allIds }); setToastMsg('모든 카드 해금됨'); };
  const adminUnlockAllRelics = () => { const allIds = RELIC_LIBRARY.map(r => r.id); setUnlockedRelics(allIds); saveGame({ unlockedRelics: allIds }); setToastMsg('모든 유물 해금됨'); };
  const adminClearSave = () => { localStorage.removeItem('roguelike_tactics_save'); window.location.reload(); };
  
  const adminCheatStats = () => { 
    setShopUpgrades({...shopUpgrades, maxHp: 600}); 
    setToastMsg('관리자 권한: 최대 체력이 9000 증가했습니다!'); 
    saveGame({ shopUpgrades: {...shopUpgrades, maxHp: 600} });
  };

  const handleWarp = (targetStage) => {
    if (getTotalCards() !== 20) { setToastMsg('덱이 20장이 아닙니다. 먼저 덱을 20장으로 맞춰주세요.'); return; }
    setWarpStage(targetStage);
    startBattle('NORMAL', targetStage);
    setToastMsg(`관리자 권한: ${targetStage}층으로 워프했습니다!`);
  };

  const handleExport = () => { const data = JSON.stringify({ credits, shopUpgrades, unlockedCards, deckCounts, unlockedRelics, startingRelic, gameStats, normalCleared, fastMode, maxStageReached, seenEnemies, usedCoupons }); navigator.clipboard.writeText(btoa(encodeURIComponent(data))); setToastMsg('세이브 코드가 복사되었습니다!'); };
  const handleDeckExport = () => { const data = JSON.stringify(tempDeckCounts); navigator.clipboard.writeText(btoa(encodeURIComponent(data))); setToastMsg('현재 덱이 복사되었습니다!'); };
  const handleExitGame = async () => { setToastMsg('저장 중...'); await saveGame(); if (window.require) window.close(); else setGameState('MENU'); };

  const handleSpecialBossRewardClaim = () => {
    if (!specialBossRewardCard || !combatState) return;
    const updatedUnlocked = unlockedCards.includes(specialBossRewardCard.id) ? unlockedCards : [...unlockedCards, specialBossRewardCard.id];
    setCombatState(prev => ({ ...prev, baseDeck: [...prev.baseDeck, { ...specialBossRewardCard }] }));
    setUnlockedCards(updatedUnlocked);
    setToastMsg(`${specialBossRewardCard.name}을(를) 덱에 추가했습니다!`);
    setSpecialBossRewardCard(null);

    if (combatState.stage >= 100) { setNormalCleared(true); saveGame({ unlockedCards: updatedUnlocked, normalCleared: true }); setGameState('GAME_CLEAR'); } 
    else { saveGame({ unlockedCards: updatedUnlocked }); setGameState('REWARDS'); }
  };

  return (
    <ErrorBoundary>
      <div className={isCssFullScreen ? 'fixed inset-0 z-50 bg-slate-950' : 'bg-slate-900 min-h-screen text-white'}>
        {toastMsg && <div className="fixed top-10 left-1/2 -translate-x-1/2 bg-indigo-600 px-6 py-3 rounded-full z-[9999] shadow-2xl animate-bounce font-bold">{toastMsg}</div>}

        {tutorialModalOpen && (
          <div className="fixed inset-0 bg-black/90 z-[10000] flex items-center justify-center p-4 backdrop-blur-md" onClick={() => setTutorialModalOpen(false)}>
            <div className="bg-slate-800 p-6 md:p-8 rounded-2xl border-2 border-indigo-500 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl animate-draw" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-4">
                <h2 className="text-2xl md:text-3xl font-black text-indigo-400 flex items-center gap-2"><HelpCircle className="w-8 h-8" /> 게임 가이드</h2>
                <button onClick={() => setTutorialModalOpen(false)} className="text-slate-400 hover:text-white text-3xl font-bold transition-colors">×</button>
              </div>
              <div className="space-y-6 text-slate-200 text-sm md:text-base leading-relaxed">
                <section>
                  <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">⚔️ 기본 전투 규칙</h3>
                  <ul className="list-disc list-inside space-y-1 text-slate-300">
                    <li>매 턴 카드를 5장씩 뽑으며 마나는 3으로 충전됩니다.</li>
                    <li><b>방어도:</b> 적의 공격을 막아주지만, 내 턴이 시작될 때 0으로 초기화됩니다.</li>
                    <li><b>몬스터:</b> 5층마다 보스가 등장하며, 25/50/75/100층은 전설 보스가 등장합니다.</li>
                  </ul>
                </section>
                <section className="bg-slate-900/50 p-4 rounded-xl border border-slate-700 mt-6">
                  <h3 className="text-lg font-bold text-orange-400 mb-3 underline underline-offset-4">✨ 상태 효과 상세 설명</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs md:text-sm">
                    <div className="space-y-2">
                      <p><span className="text-orange-400 font-bold">약화:</span> 가하는 피해량이 25% 감소합니다.</p>
                      <p><span className="text-purple-400 font-bold">취약:</span> 받는 피해량이 30% 증가합니다.</p>
                      <p><span className="text-green-400 font-bold">중독:</span> 턴 시작 시 수치만큼 피해를 입고 1 감소합니다.</p>
                    </div>
                    <div className="space-y-2">
                      <p><span className="text-red-400 font-bold">근력:</span> 피해량이 수치만큼 영구적으로 증가합니다.</p>
                      <p><span className="text-blue-400 font-bold">민첩:</span> 방어도가 수치만큼 영구적으로 증가합니다.</p>
                      <p><span className="text-emerald-400 font-bold">가시:</span> 피격 시 공격자에게 수치만큼 피해를 반사합니다.</p>
                    </div>
                  </div>
                </section>
              </div>
              <button onClick={() => setTutorialModalOpen(false)} className="mt-8 w-full py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-xl shadow-lg transition-all">확인</button>
            </div>
          </div>
        )}

        {deckImportModalOpen && (
          <div className="fixed inset-0 bg-black/90 z-[10000] flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setDeckImportModalOpen(false)}>
            <div className="bg-slate-800 p-6 rounded-xl border-2 border-indigo-500 w-full max-w-md animate-draw" onClick={e => e.stopPropagation()}>
              <h3 className="text-xl font-bold mb-4 text-white">덱 불러오기</h3>
              <textarea className="w-full h-32 bg-slate-900 border border-slate-600 rounded-lg p-3 text-white text-sm mb-4 outline-none focus:border-indigo-400" placeholder="여기에 복사한 덱 코드를 붙여넣으세요..." value={deckImportText} onChange={e => setDeckImportText(e.target.value)} />
              <div className="flex gap-3">
                <button onClick={() => setDeckImportModalOpen(false)} className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-bold transition-colors">취소</button>
                <button onClick={() => { try { const data = JSON.parse(decodeURIComponent(atob(deckImportText.trim()))); setTempDeckCounts(data); setToastMsg('덱을 성공적으로 불러왔습니다!'); setDeckImportModalOpen(false); setDeckImportText(''); } catch(e) { setToastMsg('잘못된 덱 코드입니다.'); } }} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-bold transition-colors shadow-lg">불러오기</button>
              </div>
            </div>
          </div>
        )}

        {importModalOpen && (
          <div className="fixed inset-0 bg-black/90 z-[10000] flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setImportModalOpen(false)}>
            <div className="bg-slate-800 p-6 rounded-xl border-2 border-emerald-500 w-full max-w-md animate-draw" onClick={e => e.stopPropagation()}>
              <h3 className="text-xl font-bold mb-4 text-white">세이브 데이터 불러오기</h3>
              <textarea className="w-full h-32 bg-slate-900 border border-slate-600 rounded-lg p-3 text-white text-sm mb-4 outline-none focus:border-emerald-400" placeholder="여기에 복사한 세이브 코드를 붙여넣으세요..." value={importText} onChange={e => setImportText(e.target.value)} />
              <div className="flex gap-3">
                <button onClick={() => setImportModalOpen(false)} className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-bold transition-colors">취소</button>
                <button onClick={() => { try { const data = JSON.parse(decodeURIComponent(atob(importText.trim()))); if(data.credits !== undefined) setCredits(data.credits); if(data.shopUpgrades) setShopUpgrades(data.shopUpgrades); if(data.unlockedCards) setUnlockedCards(data.unlockedCards); if(data.deckCounts) setDeckCounts(data.deckCounts); if(data.playerRelics) setPlayerRelics(data.playerRelics); if(data.normalCleared !== undefined) setNormalCleared(data.normalCleared); if(data.maxStageReached !== undefined) setMaxStageReached(data.maxStageReached); if(data.seenEnemies) setSeenEnemies(data.seenEnemies); if(data.usedCoupons) setUsedCoupons(data.usedCoupons); saveGame(data); setToastMsg('세이브를 성공적으로 불러왔습니다!'); setImportModalOpen(false); setImportText(''); } catch(e) { setToastMsg('잘못된 세이브 데이터입니다.'); } }} className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-bold transition-colors shadow-lg">불러오기</button>
              </div>
            </div>
          </div>
        )}

        {gameState === 'MENU' && (
          <MainMenu credits={credits} getTotalCards={getTotalCards} openDeckBuilder={openDeckBuilder} openEncyclopedia={openEncyclopedia} openMonsterDex={openMonsterDex} openShop={openShop} setTutorialModalOpen={setTutorialModalOpen} setGameState={setGameState} startBattle={startBattle} normalCleared={normalCleared} maxStageReached={maxStageReached} setSkipModalOpen={setSkipModalOpen} toggleFullScreen={() => setIsCssFullScreen(!isCssFullScreen)} />
        )}

        {gameState === 'UPDATE_HISTORY' && (
          <UpdateHistory setGameState={setGameState} />
        )}

        {gameState === 'STATISTICS' && (
          <Statistics maxStageReached={maxStageReached} normalCleared={normalCleared} seenEnemies={seenEnemies} unlockedCards={unlockedCards} credits={credits} unlockedRelics={unlockedRelics} gameStats={gameStats} setGameState={setGameState} />
        )}

        {gameState === 'SETTINGS' && (
          <Settings 
            setGameState={setGameState} fastMode={fastMode} setFastMode={setFastMode} saveGame={saveGame} handleExport={handleExport} setImportModalOpen={setImportModalOpen} 
            couponInput={couponInput} setCouponInput={setCouponInput} handleCoupon={handleCoupon} handleExitGame={handleExitGame} isAdminUnlocked={isAdminUnlocked} 
            adminCodeInput={adminCodeInput} setAdminCodeInput={setAdminCodeInput} handleAdminUnlock={handleAdminUnlock} adminUnlockAllCards={adminUnlockAllCards} 
            adminGiveMoney={adminGiveMoney} adminUnlockAllRelics={adminUnlockAllRelics} adminClearSave={adminClearSave} adminCheatStats={adminCheatStats}
            handleWarp={handleWarp} warpStage={warpStage} setWarpStage={setWarpStage}
          />
        )}

        {gameState === 'DECK_BUILDING' && (
          <DeckBuilder toggleFullScreen={() => setIsCssFullScreen(!isCssFullScreen)} getTotalCards={getTotalCards} tempDeckCounts={tempDeckCounts} handleClearDeck={() => setTempDeckCounts({})} handleDeckExport={handleDeckExport} setDeckImportModalOpen={setDeckImportModalOpen} setDeckCounts={setDeckCounts} saveGame={saveGame} setGameState={setGameState} filterType={filterType} setFilterType={setFilterType} filterEffect={filterEffect} setEffect={setFilterEffect} filterRarity={filterRarity} setRarity={setFilterRarity} searchQuery={searchQuery} setSearchQuery={setSearchQuery} filteredCards={getFilteredCards(filterType, filterEffect, filterRarity, 'owned', searchQuery)} getCardDef={getCardDef} shopUpgrades={shopUpgrades} handleAddCard={(id) => { const currentTotal = Object.values(tempDeckCounts).reduce((a, b) => a + b, 0); if (currentTotal >= 20 || (tempDeckCounts[id] || 0) >= 3) return; setTempDeckCounts({ ...tempDeckCounts, [id]: (tempDeckCounts[id] || 0) + 1 }); }} handleRemoveCard={(id) => setTempDeckCounts({ ...tempDeckCounts, [id]: Math.max(0, (tempDeckCounts[id] || 0) - 1) })} setTutorialModalOpen={setTutorialModalOpen} normalCleared={normalCleared} unlockedRelics={unlockedRelics} startingRelic={startingRelic} setStartingRelic={setStartingRelic} />
        )}

        {gameState === 'SHOP' && (
          <ShopScreen credits={credits} setCredits={setCredits} shopUpgrades={shopUpgrades} setShopUpgrades={setShopUpgrades} unlockedCards={unlockedCards} setUnlockedCards={setUnlockedCards} saveGame={saveGame} setGameState={setGameState} toggleFullScreen={() => setIsCssFullScreen(!isCssFullScreen)} setToastMsg={setToastMsg} getCardDef={getCardDef} handleGacha={handleGacha} handlePremiumGacha={handlePremiumGacha} gachaResult={gachaResult} setGachaResult={setGachaResult} premiumGachaResult={premiumGachaResult} setPremiumGachaResult={setPremiumGachaResult} selectPremiumCard={selectPremiumCard} setTutorialModalOpen={setTutorialModalOpen} />
        )}

        {gameState === 'BATTLE' && (
          <BattleScreen combatState={combatState} isPlayerTurn={combatState?.turn === 'PLAYER'} setViewingPile={setViewingPile} viewingPile={viewingPile} setGameState={setGameState} hoveredCard={hoveredCard} setHoveredCard={setHoveredCard} playCard={playCard} setCombatState={setCombatState} MAX_HAND_SIZE={GAME_RULES?.MAX_HAND_SIZE || 10} setShowEnemyDeck={setShowEnemyDeck} setViewingEnemy={setViewingEnemy} setTutorialModalOpen={setTutorialModalOpen} viewingEnemy={viewingEnemy} showEnemyDeck={showEnemyDeck} playerRelics={playerRelics} fastMode={fastMode} setFastMode={setFastMode} saveGame={saveGame} />
        )}

        {gameState === 'ENCYCLOPEDIA' && (
          <Encyclopedia unlockedCards={unlockedCards} getCardDef={getCardDef} shopUpgrades={shopUpgrades} getFilteredCards={getFilteredCards} setGameState={setGameState} toggleFullScreen={() => setIsCssFullScreen(!isCssFullScreen)} setTutorialModalOpen={setTutorialModalOpen} unlockedRelics={unlockedRelics} />
        )}

        {gameState === 'MONSTER_DEX' && (
          <MonsterDex seenEnemies={seenEnemies} dexViewingEnemy={dexViewingEnemy} setDexViewingEnemy={setDexViewingEnemy} toggleFullScreen={() => setIsCssFullScreen(!isCssFullScreen)} setGameState={setGameState} setTutorialModalOpen={setTutorialModalOpen} />
        )}

        {(['REWARDS', 'REWARD_CARD', 'REWARD_REMOVE', 'BOSS_CLEAR_REWARD', 'RELIC_REWARD'].includes(gameState)) && (
          <Rewards gameState={gameState} rewardCards={rewardCards} setRewardCards={setRewardCards} combatState={combatState} unlockedCards={unlockedCards} setUnlockedCards={setUnlockedCards} saveGame={saveGame} setGameState={setGameState} confirmSelection={confirmSelection} setConfirmSelection={setConfirmSelection} startNextStage={startNextStage} getCardDef={getCardDef} shopUpgrades={shopUpgrades} specialBossRewardCard={specialBossRewardCard} handleSpecialBossRewardClaim={handleSpecialBossRewardClaim} pendingRelicReward={pendingRelicReward} handleRelicRewardClaim={handleRelicRewardClaim} />
        )}

        {gameState === 'GAME_OVER' && (
          <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-slate-900 text-white p-4">
            <h1 className="text-6xl md:text-8xl font-black text-red-600 mb-6 drop-shadow-2xl">GAME OVER</h1>
            <p className="text-2xl md:text-3xl text-slate-300 font-bold mb-12">도달한 층수: <span className="text-yellow-400">STAGE {combatState?.stage || 1}</span></p>
            <button onClick={() => setGameState('MENU')} className="py-4 px-12 bg-indigo-600 hover:bg-indigo-500 rounded-full text-2xl font-bold shadow-xl transition-all hover:scale-105">메인으로</button>
          </div>
        )}

        {gameState === 'GAME_CLEAR' && (
          <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-slate-900 text-white p-4">
            <h1 className="text-6xl font-black text-yellow-400 mb-8 animate-pulse">CONQUEROR!</h1>
            <p className="text-xl text-slate-300 mb-8">이제 시작 덱에서 유물 1개를 선택할 수 있습니다!</p>
            <button onClick={() => setGameState('MENU')} className="py-4 px-12 bg-indigo-600 rounded-full text-2xl font-bold">메인으로</button>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}