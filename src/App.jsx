// src/App.jsx
import React, { useState, useEffect } from 'react';
import { auth, db, appId } from './config/firebase';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

import { CARD_LIBRARY, BASE_CARDS, GAME_RULES, MANA_CARD_IDS, BOSS_LOOT_CARDS, PLAYER_CLASSES } from './constants/gameData';
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
import ClassSelectScreen from './components/screens/ClassSelectScreen';
import TownScreen from './components/screens/TownScreen';
import EventScreen from './components/screens/EventScreen';

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
  const [selectedClass, setSelectedClass] = useState('adventurer'); // ⚔️ 추가된 직업 상태
  const [townUpgrades, setTownUpgrades] = useState({ inn: 0, blacksmith: 0, alchemist: 0 }); // ⛺ 추가된 마을 건물 레벨
  
  const [gameStats, setGameStats] = useState({ totalKills: 0, totalBossKills: 0, totalCreditsEarned: 0, totalRuns: 0 });

  const [combatState, setCombatState] = useState(null);
  const [rewardCards, setRewardCards] = useState([]);
  const [tempDeckCounts, setTempDeckCounts] = useState({});
  const [viewingPile, setViewingPile] = useState(null);
  const [gachaResult, setGachaResult] = useState(null);
  const [premiumGachaResult, setPremiumGachaResult] = useState(null);
  const [specialBossRewardCard, setSpecialBossRewardCard] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [pendingRelicChoices, setPendingRelicChoices] = useState(null);
  const [confirmSelection, setConfirmSelection] = useState(null);
  const [skipModalOpen, setSkipModalOpen] = useState(false);
  const [hardSkipModalOpen, setHardSkipModalOpen] = useState(false); 
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
  const [hardClearRelicSelection, setHardClearRelicSelection] = useState([]); 
  
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importText, setImportText] = useState('');

  const [filterType, setFilterType] = useState('all');
  const [filterEffect, setFilterEffect] = useState('all');
  const [filterRarity, setFilterRarity] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [enemyDropCard, setEnemyDropCard] = useState(null); 
  const [customCards, setCustomCards] = useState([]); 
  
  const [autoPlay, setAutoPlay] = useState(false);
  const [autoReward, setAutoReward] = useState(false);
  const [autoRewardType, setAutoRewardType] = useState('card'); // 'card' | 'heal'
  const [autoRelic, setAutoRelic] = useState(true);
  const [autoEventType, setAutoEventType] = useState('safe'); // 'safe' | 'greedy'
  const [claimedMilestones, setClaimedMilestones] = useState([]);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {
        setIsCssFullScreen(!isCssFullScreen);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

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
        if (d.autoPlay !== undefined) setAutoPlay(d.autoPlay);
        if (d.autoReward !== undefined) setAutoReward(d.autoReward);
        if (d.autoRewardType !== undefined) setAutoRewardType(d.autoRewardType);
        if (d.autoRelic !== undefined) setAutoRelic(d.autoRelic);
        if (d.autoEventType !== undefined) setAutoEventType(d.autoEventType);
        if (d.maxStageReached !== undefined) setMaxStageReached(d.maxStageReached);
        if (d.seenEnemies) setSeenEnemies(d.seenEnemies);
        if (d.usedCoupons) setUsedCoupons(d.usedCoupons);
        if (d.customCards) setCustomCards(d.customCards); 
        if (d.claimedMilestones) setClaimedMilestones(d.claimedMilestones);
        if (d.selectedClass) setSelectedClass(d.selectedClass);
        if (d.townUpgrades) setTownUpgrades(d.townUpgrades);
      }
    } catch (e) {
      console.error("세이브 데이터 로드 실패", e);
    }
  }, []);

  const saveGame = async (payload = {}) => {
    const data = { credits, shopUpgrades, unlockedCards, deckCounts, unlockedRelics, startingRelic, gameStats, normalCleared, fastMode, autoPlay, autoReward, autoRewardType, autoRelic, autoEventType, maxStageReached, seenEnemies, usedCoupons, customCards, claimedMilestones, selectedClass, townUpgrades, ...payload };
    localStorage.setItem('roguelike_tactics_save', JSON.stringify(data));
    if (user && db) await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'gameSave', 'data'), data);
  };

  useEffect(() => {
    if (toastMsg) {
      const t = setTimeout(() => setToastMsg(''), 2500);
      return () => clearTimeout(t);
    }
  }, [toastMsg]);

  const enhancedGetCardDef = (id, upgrades) => {
    const baseDef = getCardDef(id, upgrades);
    if (baseDef && baseDef.name) return baseDef;

    const custom = customCards.find(c => c.id === id);
    if (custom) {
      let upgCard = { ...custom, isUpgraded: false, upgradeLevel: 0 };
      const upgRecord = upgrades?.upgradedCards?.find(u => u.id === id);
      if (upgRecord) {
        const lvl = upgRecord.level;
        upgCard.isUpgraded = true;
        upgCard.upgradeLevel = lvl;
        if (upgCard.damage) upgCard.damage += (3 * lvl);
        if (upgCard.block) upgCard.block += (3 * lvl);
        if (upgCard.heal) upgCard.heal += (2 * lvl);
      }
      return upgCard;
    }
    
    const lootCard = BOSS_LOOT_CARDS.find(c => c.id === id);
    if (lootCard) return lootCard;

    return { id, name: 'Unknown', type: 'skill', cost: 1, desc: 'Error' };
  };

  const getFilteredCards = (t, e, r, o, q) => {
    const LOOT_CARDS = BOSS_LOOT_CARDS.filter(card => card.rarity === 'loot');
    const FULL_CARD_LIBRARY = [...CARD_LIBRARY, ...customCards, ...LOOT_CARDS];
    
    return FULL_CARD_LIBRARY.filter(c => {
      if (r !== 'all' && c.rarity !== r) return false;
      if (t !== 'all' && c.type !== t) return false;
      if (e.startsWith('debuff')) {
         if (e === 'debuff') {
             if (!(c.enemyWeak || c.enemyVuln || c.enemyPoison || c.enemyBurn || c.enemyBleed || c.enemyFrost || c.enemySilence || c.enemyBind)) return false;
         } else {
             if (e === 'debuff_poison' && !c.enemyPoison) return false;
             if (e === 'debuff_burn' && !c.enemyBurn) return false;
             if (e === 'debuff_bleed' && !c.enemyBleed) return false;
             if (e === 'debuff_frost' && !c.enemyFrost) return false;
             if (e === 'debuff_weak' && !c.enemyWeak) return false;
             if (e === 'debuff_vuln' && !c.enemyVuln) return false;
             if (e === 'debuff_silence' && !c.enemySilence) return false;
             if (e === 'debuff_bind' && !c.enemyBind) return false;
         }
      }
      if (e.startsWith('buff')) {
         if (e === 'buff') {
             if (!(c.selfStrength || c.selfDex || c.selfThorns || c.selfRegen || c.selfInsight)) return false;
         } else {
             if (e === 'buff_str' && !c.selfStrength) return false;
             if (e === 'buff_dex' && !c.selfDex) return false;
             if (e === 'buff_thorns' && !c.selfThorns) return false;
             if (e === 'buff_regen' && !c.selfRegen) return false;
             if (e === 'buff_insight' && !c.selfInsight) return false;
         }
      }
      if (o === 'owned' && !unlockedCards.includes(c.id)) return false;
      if (o === 'unowned' && unlockedCards.includes(c.id)) return false;
      if (q) { 
        const def = enhancedGetCardDef(c.id, shopUpgrades); 
        if (def && !(def.name || '').toLowerCase().includes(q.toLowerCase()) && !(def.desc || '').toLowerCase().includes(q.toLowerCase())) return false; 
      }
      return true;
    });
  };

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
    if (mode === 'HARD' && stage > 300) {
      setToastMsg('하드 모드는 300층까지만 진행 가능합니다!');
      return;
    }

    const classData = PLAYER_CLASSES.find(c => c.id === selectedClass) || PLAYER_CLASSES[0];

    let fullDeck = [];
    Object.keys(deckCounts).forEach(id => {
      const def = enhancedGetCardDef(id, shopUpgrades);
      if (def) {
        for (let i = 0; i < deckCounts[id]; i++) fullDeck.push({ ...def });
      }
    });

    // ⛺ 대장간(Blacksmith) 마을 업그레이드: 레벨당 카드 1장 무작위 강화
    if (townUpgrades?.blacksmith > 0) {
      let upgCount = townUpgrades.blacksmith * 2;
      const unupgraded = fullDeck.filter(c => !c.name.includes('+'));
      shuffle(unupgraded);
      for (let i = 0; i < Math.min(upgCount, unupgraded.length); i++) {
        unupgraded[i].name += '+';
        if (unupgraded[i].damage) unupgraded[i].damage += 3;
        if (unupgraded[i].block) unupgraded[i].block += 3;
      }
    }

    // ⛺ 여관(Inn) 마을 업그레이드: 레벨당 최대 체력 +5
    const basePlayerHp = classData.baseHp + (shopUpgrades.maxHp * 20) + ((townUpgrades?.inn || 0) * 30);
    const enemies = generateEnemies(stage, mode);
    updateSeenEnemies(enemies);

    let initialRelics = [];
    if (startingRelic) {
      const relDef = RELIC_LIBRARY.find(r => r.id === startingRelic);
      if (relDef) initialRelics.push(relDef);
    }
    setPlayerRelics(initialRelics);

    // ⛺ 연금술사(Alchemist) 마을 업그레이드: 시작 시 무작위 버프 부여
    let alchemistBuffs = { regen: 0, insight: 0, strength: 0 };
    if (townUpgrades?.alchemist > 0) {
       for(let i=0; i<townUpgrades.alchemist; i++) {
          const r = Math.random();
          if (r < 0.33) alchemistBuffs.regen += 1;
          else if (r < 0.66) alchemistBuffs.insight += 1;
          else alchemistBuffs.strength += 1;
       }
    }

    let initialPlayer = { 
      hp: basePlayerHp, maxHp: basePlayerHp, mana: classData.baseMana, maxMana: classData.baseMana, block: 0, 
      debuffs: { weak: 0, vulnerable: 0, poison: 0, mark: 0, frail: 0, silence: 0, bind: 0, bleed: 0, frost: 0, burn: 0 }, 
      buffs: { strength: alchemistBuffs.strength, dexterity: 0, thorns: 0, intangible: 0, regen: alchemistBuffs.regen, rage: 0, insight: (classData.id === 'mage' ? 1 : 0) + alchemistBuffs.insight },
      classId: classData.id,
      minion: null,
      stance: 'normal'
    };
    initialPlayer = applyStartCombatRelics(initialPlayer, initialRelics); 

    const newStats = { ...gameStats, totalRuns: (gameStats?.totalRuns || 0) + 1 };
    setGameStats(newStats);
    saveGame({ gameStats: newStats });

    setCombatState({
      mode, stage, baseDeck: fullDeck, drawPile: shuffle(fullDeck),
      hand: [], discardPile: [], exhaustPile: [], turn: 'PLAYER', player: initialPlayer, enemies: enemies
    });
    
    setCombatState(prev => {
      const newDraw = [...prev.drawPile];
      const newHand = [];
      for(let i=0; i<5; i++) if(newDraw.length > 0) newHand.push({ ...newDraw.pop(), uid: Math.random().toString() });
      return { ...prev, hand: newHand, drawPile: newDraw };
    });
    setSkipModalOpen(false);
    setHardSkipModalOpen(false);
    setGameState('BATTLE');
  };

  const startNextStage = (newPlayer, newBaseDeck) => {
    const nextStage = combatState.stage + 1;
    const isBoss = nextStage % 10 === 0;
    // 5% chance for an event, not on boss stages, not on stage 1, and NEVER >= 100 on NORMAL
    const isEvent = !isBoss && nextStage > 1 && Math.random() < 0.05 && !(combatState.mode === 'NORMAL' && nextStage >= 100);

    const enemies = generateEnemies(nextStage, combatState.mode);
    updateSeenEnemies(enemies);

    const newDraw = shuffle([...newBaseDeck]);
    const newHand = [];
    for(let i=0; i<5; i++) if(newDraw.length > 0) newHand.push({ ...newDraw.pop(), uid: Math.random().toString() });

    let refreshedPlayer = { 
      ...newPlayer, block: 0, mana: newPlayer.maxMana, 
      debuffs: { weak: 0, vulnerable: 0, poison: 0, mark: 0, frail: 0, silence: 0, bind: 0, bleed: 0, frost: 0, burn: 0 }, 
      buffs: { ...newPlayer.buffs, strength: newPlayer.buffs?.strength || 0, regen: newPlayer.buffs?.regen || 0, insight: newPlayer.buffs?.insight || 0 },
      minion: null,
      stance: 'normal'
    };
    refreshedPlayer = applyStartCombatRelics(refreshedPlayer, playerRelics); 

    setCombatState({
      ...combatState, stage: nextStage, enemies, baseDeck: newBaseDeck,
      drawPile: newDraw, hand: newHand, discardPile: [], exhaustPile: [], turn: 'PLAYER', player: refreshedPlayer
    });
    setRewardCards([]);
    setGameState(isEvent ? 'EVENT' : 'BATTLE');
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
    setPendingRelicReward, setSpecialBossRewardCard, setNormalCleared,
    setEnemyDropCard,
    setPendingRelicChoices
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
    else if (combatState.mode === 'NORMAL' && combatState.stage >= 100) { 
      setNormalCleared(true); saveGame({ normalCleared: true }); setGameState('GAME_CLEAR'); 
    } 
    else { setGameState('REWARDS'); }
  };

  const handleRelicChoiceClaim = (relic) => {
    if (!relic) return;
    const updatedRelics = [...(playerRelics || []), relic];
    setPlayerRelics(updatedRelics);
    let newUnlocked = [...(unlockedRelics || [])];
    if (!newUnlocked.includes(relic.id)) newUnlocked.push(relic.id);
    setUnlockedRelics(newUnlocked);
    saveGame({ unlockedRelics: newUnlocked });
    setToastMsg(`🌟 ${relic.name} 획득!`);
    setPendingRelicChoices(null);
    if (specialBossRewardCard) { setGameState('BOSS_CLEAR_REWARD'); } 
    else if (combatState.mode === 'NORMAL' && combatState.stage >= 100) { 
      setNormalCleared(true); saveGame({ normalCleared: true }); setGameState('GAME_CLEAR'); 
    } 
    else { setGameState('REWARDS'); }
  };

  // ✨ 적 턴 (다중 카드 사용 로직 적용)
  useEffect(() => {
    if (gameState !== 'BATTLE' || !combatState || combatState.turn !== 'ENEMY') return;
    
    let isCancelled = false;

    let currentState = combatState;
    const mutate = async (updater) => {
      currentState = updater(currentState);
      setCombatState(currentState);
    };

    const processEnemyTurn = async () => {
      await new Promise(r => setTimeout(r, fastMode ? 200 : 500));
      if (isCancelled) return;

      
      let p = { ...currentState.player, buffs: { ...currentState.player.buffs }, debuffs: { ...currentState.player.debuffs } };
      
      // 🔥 화상 및 도트 적용
      if ((p.debuffs?.burn || 0) > 0) { 
         p.hp -= p.debuffs.burn; 
         if (p.classId === 'warrior') p.buffs.rage = (p.buffs.rage || 0) + 1;
         if (p.hp <= 0) { setGameState('GAME_OVER'); return; }
      }
      
      ['weak', 'vulnerable', 'mark', 'frail', 'silence', 'bind', 'bleed', 'frost', 'burn'].forEach(k => { p.debuffs[k] = decayStack(p.debuffs[k] || 0, ['silence', 'bind'].includes(k), k); });
      ['strength', 'dexterity', 'thorns', 'regen', 'rage', 'insight'].forEach(k => { p.buffs[k] = decayStack(p.buffs[k] || 0, false); });

      if ((p.debuffs?.poison || 0) > 0) { 
        p.hp -= p.debuffs.poison; 
        if (p.classId === 'warrior') p.buffs.rage = (p.buffs.rage || 0) + 1;
        p.debuffs.poison = Math.max(0, p.debuffs.poison - 1); 
      }

      let newEnemies = currentState.enemies.map(e => ({ ...e, buffs: { ...e.buffs }, debuffs: { ...e.debuffs }, block: 0 }));
      
      for(let i=0; i<newEnemies.length; i++) {
        let e = newEnemies[i];
        if (e.debuffs?.poison > 0) { e.hp -= e.debuffs.poison; e.debuffs.poison = Math.max(0, e.debuffs.poison - 1); checkRevive(e, null); }
        if (e.debuffs?.burn > 0) { e.hp -= e.debuffs.burn; checkRevive(e, null); } 
        if (e.hp <= 0) continue;
        if ((e.buffs?.regen || 0) > 0) { e.hp = Math.min(e.maxHp, e.hp + e.buffs.regen); }
        if (e.passives?.some(ps => ps.id === 'scaling_strength')) e.buffs.strength = (e.buffs.strength || 0) + 3;
        
        let intents = e.intentCards || [{ type: 'attack', value: 5, uid: 'fallback' }]; 
        let frostAmount = e.debuffs?.frost || 0;
        if (frostAmount > 0) intents = intents.slice(0, Math.max(0, intents.length - frostAmount));
        
        for (const intent of intents) {
          const isAttack = intent.type.includes('attack');
          const isSkill = intent.type.includes('debuff') || intent.type.includes('defend') || intent.type.includes('buff') || intent.type.includes('heal');
          
          let canAct = true;
          if (isAttack && (e.debuffs?.bind || 0) > 0) canAct = false;
          if (isSkill && (e.debuffs?.silence || 0) > 0) canAct = false;

          if (canAct) {
            if ((e.debuffs?.bleed || 0) > 0) {
              e.hp -= e.debuffs.bleed;
              checkRevive(e, null);
            }
            if (e.hp <= 0) break;

            // 🎬 컷씬 체크
            if (intent.cutscene || (e.isBoss && intent.type.includes('attack') && intent.value >= 25 && !fastMode)) {
              await mutate(prev => ({ ...prev, cutsceneData: { name: e.name, skillName: intent.name || '치명적인 공격' } }));
              await new Promise(r => setTimeout(r, 1500)); // 컷씬 지속 시간
              await mutate(prev => ({ ...prev, cutsceneData: null }));
            }
            
            if (intent.type.includes('attack')) {
              let dmg = intent.value + (e.buffs.strength || 0);
              if (p.debuffs.vulnerable > 0) dmg = Math.floor(dmg * 1.3);
              if (e.debuffs.weak > 0) dmg = Math.floor(dmg * 0.97); 
              if ((p.debuffs?.mark || 0) > 0) dmg += p.debuffs.mark;
              if ((p.buffs?.intangible || 0) > 0) { dmg = 1; }
              if (p.stance === 'defensive') dmg = Math.floor(dmg * 0.5);
              if (p.stance === 'offensive') dmg = Math.floor(dmg * 1.25);

              for(let k=0; k<(intent.multi || 1); k++) {
                let actualDmg = dmg;
                if (p.minion) {
                  if (p.minion.hp > actualDmg) { p.minion.hp -= actualDmg; actualDmg = 0; } 
                  else { actualDmg -= p.minion.hp; p.minion = null; }
                }
                if (p.block >= actualDmg) p.block -= actualDmg; else { 
                  p.hp -= (actualDmg - p.block); p.block = 0; 
                  if (p.classId === 'warrior') p.buffs.rage = (p.buffs.rage || 0) + 1;
                }
                if (p.buffs?.thorns > 0) { e.hp -= p.buffs.thorns; checkRevive(e, null); }

                await mutate(prev => ({ ...prev, player: p, enemies: [...newEnemies], hitEffect: { targetUid: 'player', type: 'hit' } }));
                await new Promise(r => setTimeout(r, fastMode ? 100 : 200));
                await mutate(prev => ({ ...prev, hitEffect: null }));
                if (p.hp <= 0) { setGameState('GAME_OVER'); return; }
              }
            } else {
              await new Promise(r => setTimeout(r, 150));
            }
            
            if (e.hp <= 0) break; 
            
            if (intent.type.includes('debuff')) {
              ['weak', 'vulnerable', 'silence', 'bind', 'frail', 'poison', 'mark', 'burn', 'bleed', 'frost'].forEach(dbf => {
                if (intent.debuff === dbf) p.debuffs[dbf] = (p.debuffs[dbf] || 0) + (intent.turns || 1);
              });
            }
            if (intent.type.includes('defend')) {
              let gainedBlock = intent.value;
              if ((e.debuffs?.frail || 0) > 0) gainedBlock = Math.floor(gainedBlock * 0.75);
              e.block += gainedBlock;
            }
            if (intent.type.includes('buff') && intent.buff === 'strength') e.buffs.strength += (intent.buffValue || intent.amount || 0);
            if (intent.type.includes('heal')) e.hp = Math.min(e.maxHp, e.hp + (intent.heal || 0));
          }
        } 

        ['weak', 'vulnerable', 'mark', 'frail', 'silence', 'bind', 'bleed', 'frost', 'burn'].forEach(k => { e.debuffs[k] = decayStack(e.debuffs[k] || 0, ['silence', 'bind'].includes(k), k); });
        ['strength', 'intangible', 'regen', 'rage'].forEach(k => { e.buffs[k] = decayStack(e.buffs[k] || 0, k === 'intangible'); });
        e.intentCards = generateEnemyIntent(e, e.dmgMultiplier || 1);
      }

      newEnemies = newEnemies.filter(e => e.hp > 0);
      if (p.hp <= 0) { setGameState('GAME_OVER'); return; }
      if (newEnemies.length === 0) { setTimeout(() => setGameState('REWARDS'), 600); await mutate(prev => ({ ...prev, player: p, enemies: [], hand: [], discardPile: [], drawPile: [] })); return; }
      
      p.block = 0; p.mana = p.maxMana;
      if ((p.buffs?.regen || 0) > 0) { p.hp = Math.min(p.maxHp, p.hp + p.buffs.regen); }
      p.buffs.intangible = decayStack(p.buffs.intangible || 0, true);

      if (p.minion) {
        if (p.minion.id === 'golem') { p.block += 5; } 
        else if (p.minion.id === 'fairy') { p.hp = Math.min(p.maxHp, p.hp + 3); }
      }

      let turnBlock = 0, turnMana = 0, turnDraw = 0, turnStrength = 0, selfDamage = 0;
      (playerRelics || []).forEach(r => {
        if (r.effect?.type === 'START_TURN') { if (r.effect.block) turnBlock += r.effect.block; if (r.effect.draw) turnDraw += r.effect.draw; }
        if (r.effect?.type === 'START_TURN_ADVANCED') { if (r.effect.block) turnBlock += r.effect.block; if (r.effect.poison) newEnemies.forEach(e => e.debuffs.poison += r.effect.poison); if (r.effect.selfDamage) selfDamage += r.effect.selfDamage; }
        if (r.effect?.type === 'START_TURN_CONDITION' && r.effect.condition === 'HP_50' && p.hp <= p.maxHp / 2) { if (r.effect.strength) turnStrength += r.effect.strength; }
        if (r.effect?.type === 'START_TURN_MYTHIC') { turnMana += r.effect.mana; turnDraw += r.effect.draw; turnStrength += r.effect.strength; }
        if (r.effect?.type === 'START_COMBAT_AND_TURN') { if (r.effect.selfDamage) selfDamage += r.effect.selfDamage; }
      });
      
      p.hp -= selfDamage;
      if (p.hp <= 0) { setGameState('GAME_OVER'); return; } 
      p.block += turnBlock; p.mana = p.maxMana + turnMana; p.buffs.strength += turnStrength;
      turnDraw += (p.buffs?.insight || 0);

      await mutate(prev => {
        let newDiscard = [...prev.discardPile, ...prev.hand], newDraw = [...prev.drawPile], newHand = [];
        let drawAmount = Math.max(0, 5 + turnDraw - (p.debuffs?.frost || 0));
        for (let i = 0; i < drawAmount; i++) {
          if (newHand.length >= (GAME_RULES?.MAX_HAND_SIZE || 10)) break;
          if (newDraw.length === 0) { if (newDiscard.length === 0) break; newDraw = shuffle(newDiscard); newDiscard = []; }
          if (newDraw.length > 0) newHand.push({ ...newDraw.pop(), uid: Math.random().toString() });
        }
        return { ...prev, player: p, enemies: newEnemies, turn: 'PLAYER', hand: newHand, drawPile: newDraw, discardPile: newDiscard };
      });
    };
    
    processEnemyTurn();
    
    return () => { isCancelled = true; };
  }, [gameState, combatState?.turn, fastMode, checkRevive, setGameState, playerRelics]);

  const openDeckBuilder = () => { setTempDeckCounts({ ...deckCounts }); setGameState('DECK_BUILDING'); };
  const openEncyclopedia = () => { setGameState('ENCYCLOPEDIA'); };
  const openMonsterDex = () => { setGameState('MONSTER_DEX'); };
  const openShop = () => { setGameState('SHOP'); };
  const getTotalCards = (counts = deckCounts) => Object.values(counts || {}).reduce((a, b) => a + b, 0);

  const handleGacha = (times = 1) => {
    const cost = 50 * times;
    if (credits < cost) return;
    const result = [];
    // 특수(special) 타입 및 loot/special 등급은 모두 제외
    const pool = CARD_LIBRARY.filter(c =>
      ['common', 'uncommon', 'rare'].includes(c.rarity) && c.type !== 'special'
    );
    let duplicateRefund = 0;
    let currentUnlocked = [...unlockedCards]; 

    for (let i = 0; i < 3 * times; i++) {
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
        currentUnlocked.push(card.id); 
      }
    }
    const newCredits = credits - cost + duplicateRefund;
    setCredits(newCredits);
    setUnlockedCards(currentUnlocked); 
    if (duplicateRefund > 0) setToastMsg(`${duplicateRefund} 크레딧 환급됨!`);
    setGachaResult(result); 
    saveGame({ credits: newCredits, unlockedCards: currentUnlocked }); 
  };

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

  const handleExport = () => { const data = JSON.stringify({ credits, shopUpgrades, unlockedCards, deckCounts, unlockedRelics, startingRelic, gameStats, normalCleared, fastMode, maxStageReached, seenEnemies, usedCoupons, customCards, claimedMilestones }); const encoded = btoa(encodeURIComponent(data)); navigator.clipboard.writeText(encoded); setToastMsg('세이브 코드 복사됨!'); };
  const handleExitGame = async () => { setToastMsg('저장 중...'); await saveGame(); if (window.require) window.close(); else setGameState('MENU'); };

  const handlePremiumGacha = () => {
    if (credits < 100) { setToastMsg('크레딧이 부족합니다.'); return; }
    const result = [];
    setCredits(prev => prev - 100);
    for (let i = 0; i < 3; i++) {
      const roll = Math.random();
      let rarity = (roll < 0.015 && maxStageReached >= 10) ? 'rare' : 'uncommon';
      // 특수(special) 타입과 loot/special 등급 제외
      const pool = CARD_LIBRARY.filter(c => c.rarity === rarity && c.type !== 'special');
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

  const handleClaimMilestone = (requiredCount, amount) => {
    if (claimedMilestones.includes(requiredCount)) return;
    
    const newCredits = credits + amount;
    const newClaimed = [...claimedMilestones, requiredCount];
    
    setCredits(newCredits);
    setClaimedMilestones(newClaimed);
    
    saveGame({ credits: newCredits, claimedMilestones: newClaimed });
    setToastMsg(`✨ 업적 보상으로 ${amount.toLocaleString()} 크레딧을 획득했습니다! ✨`);
  };

  return (
    <ErrorBoundary>
      <div className={isCssFullScreen ? 'fixed inset-0 z-50 bg-slate-950' : 'bg-slate-900 min-h-screen text-white'}>
        {toastMsg && <div className="fixed top-10 left-1/2 -translate-x-1/2 bg-indigo-600 px-6 py-3 rounded-full z-[9999] shadow-2xl animate-bounce font-bold">{toastMsg}</div>}

        <GameGuide isOpen={tutorialModalOpen} onClose={() => setTutorialModalOpen(false)} />

        <AdminPanel 
          gameState={gameState} 
          credits={credits} 
          setCredits={setCredits} 
          unlockedCards={unlockedCards} 
          setUnlockedCards={setUnlockedCards} 
          unlockedRelics={unlockedRelics} 
          setUnlockedRelics={setUnlockedRelics}
          isAdminUnlocked={isAdminUnlocked}
          combatState={combatState}
          setCombatState={setCombatState}
          setGameState={setGameState}
          setToastMsg={setToastMsg}
          saveGame={saveGame}
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
                <button onClick={() => { try { const data = JSON.parse(decodeURIComponent(atob(deckImportText.trim()))); setTempDeckCounts(data); setDeckImportModalOpen(false); setToastMsg('덱 로드 성공!'); } catch(e) { setToastMsg('잘못된 덱 코드입니다!'); } }} className="flex-1 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-500">로드</button>
              </div>
            </div>
          </div>
        )}

        {skipModalOpen && (
          <div className="fixed inset-0 bg-black/90 z-[10000] flex items-center justify-center p-4" onClick={() => setSkipModalOpen(false)}>
            <div className="bg-slate-800 p-6 rounded-xl border-2 border-emerald-500 w-full max-w-md text-center" onClick={e => e.stopPropagation()}>
              <h3 className="text-2xl font-black mb-2 text-emerald-400">⭐ 일반 모드 - 스테이지 도약</h3>
              <p className="text-slate-300 text-xs mb-6 break-keep">
                최대 도달 층({maxStageReached}층)을 기준으로, 이전에 돌파했던 보스 층(5층마다)에서 바로 시작할 수 있습니다.
              </p>
              
              <div className="grid grid-cols-4 gap-2 mb-6 max-h-[40vh] overflow-y-auto pr-1">
                {Array.from({ length: Math.floor(Math.min(100, maxStageReached) / 5) }, (_, i) => (i + 1) * 5).map(floor => (
                  <button 
                    key={floor}
                    onClick={() => {
                      if (getTotalCards() !== 20) { setToastMsg('덱을 20장 꽉 채워야 시작할 수 있습니다.'); setSkipModalOpen(false); return; }
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
              <button onClick={() => setSkipModalOpen(false)} className="w-full py-3 bg-slate-700 hover:bg-slate-600 border border-slate-500 rounded-lg font-bold transition-colors">취소</button>
            </div>
          </div>
        )}

        {hardSkipModalOpen && (
          <div className="fixed inset-0 bg-black/90 z-[10000] flex items-center justify-center p-4" onClick={() => setHardSkipModalOpen(false)}>
            <div className="bg-slate-800 p-6 rounded-xl border-2 border-red-500 w-full max-w-md text-center" onClick={e => e.stopPropagation()}>
              <h3 className="text-2xl font-black mb-2 text-red-400">🔥 하드 모드 - 스테이지 도약</h3>
              <p className="text-slate-300 text-xs mb-6 break-keep">
                최대 도달 층({maxStageReached}층)을 기준으로, 이전에 돌파했던 보스 층(10층마다)에서 바로 시작할 수 있습니다.
              </p>
              
              <div className="grid grid-cols-3 gap-2 mb-6 max-h-[40vh] overflow-y-auto pr-1">
                {Array.from({ length: Math.floor(Math.min(300, maxStageReached) / 10) }, (_, i) => (i + 1) * 10).map(floor => (
                  <button 
                    key={floor}
                    onClick={() => {
                      if (getTotalCards() !== 20) { setToastMsg('덱을 20장 꽉 채워야 시작할 수 있습니다.'); setHardSkipModalOpen(false); return; }
                      startBattle('HARD', floor); 
                      setHardSkipModalOpen(false); 
                      setToastMsg(`${floor}층부터 도약을 시작합니다!`);
                    }}
                    className="py-2 bg-slate-900 hover:bg-red-600 border border-slate-600 hover:border-red-400 rounded-lg text-sm font-bold transition-all text-slate-200 hover:text-white"
                  >
                    {floor}층
                  </button>
                ))}
              </div>
              <button onClick={() => setHardSkipModalOpen(false)} className="w-full py-3 bg-slate-700 hover:bg-slate-600 border border-slate-500 rounded-lg font-bold transition-colors">취소</button>
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
                    if (d.customCards) setCustomCards(d.customCards);
                    if (d.claimedMilestones) setClaimedMilestones(d.claimedMilestones);
                    saveGame(d);
                    setImportModalOpen(false); 
                    setToastMsg('세이브 불러오기 성공!'); 
                  } catch(e) { setToastMsg('잘못된 세이브 코드입니다!'); } 
                }} className="flex-1 py-3 bg-amber-600 text-white rounded-lg font-bold hover:bg-amber-500">불러오기 적용</button>
              </div>
            </div>
          </div>
        )}

        {gameState === 'HARD_CLEAR_RELIC_CHOICE' && (
          <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950 text-white p-4">
            <div className="max-w-4xl w-full">
              <h1 className="text-5xl font-black text-center mb-2 text-purple-300 drop-shadow-lg">🎉 하드 모드 완전 클리어!</h1>
              <p className="text-center text-slate-300 mb-8">축하합니다! 유물 3개를 선택해서 획득하세요!</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {RELIC_LIBRARY.filter(r => !(playerRelics || []).some(pr => pr?.id === r.id)).slice(0, 15).map((relic) => (
                  <div 
                    key={relic.id}
                    onClick={() => {
                      if (!hardClearRelicSelection.includes(relic.id) && hardClearRelicSelection.length < 3) {
                        setHardClearRelicSelection([...hardClearRelicSelection, relic.id]);
                      } else if (hardClearRelicSelection.includes(relic.id)) {
                        setHardClearRelicSelection(hardClearRelicSelection.filter(id => id !== relic.id));
                      }
                    }}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      hardClearRelicSelection.includes(relic.id) 
                        ? 'bg-purple-600/40 border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.5)]' 
                        : 'bg-slate-800 border-slate-600 hover:border-purple-400'
                    }`}
                  >
                    <div className="font-bold text-purple-300 text-lg">{relic.name}</div>
                    <div className="text-sm text-slate-300 mt-2">{relic.desc}</div>
                    {hardClearRelicSelection.includes(relic.id) && <div className="text-center text-purple-300 font-bold mt-2">✓ 선택됨</div>}
                  </div>
                ))}
              </div>
              
              <button
                onClick={() => {
                  const selectedRelics = RELIC_LIBRARY.filter(r => hardClearRelicSelection.includes(r.id));
                  const updatedRelics = [...(playerRelics || []), ...selectedRelics];
                  setPlayerRelics(updatedRelics);
                  let newUnlocked = [...(unlockedRelics || [])];
                  selectedRelics.forEach(r => {
                    if (!newUnlocked.includes(r.id)) newUnlocked.push(r.id);
                  });
                  setUnlockedRelics(newUnlocked);
                  saveGame({ unlockedRelics: newUnlocked });
                  setHardClearRelicSelection([]);
                  setToastMsg('🎉 유물 3개가 추가되었습니다!');
                  setGameState('GAME_CLEAR');
                }}
                disabled={hardClearRelicSelection.length !== 3}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                  hardClearRelicSelection.length === 3 
                    ? 'bg-purple-600 hover:bg-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.5)]' 
                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                }`}
              >
                3개 선택 완료 ({hardClearRelicSelection.length}/3)
              </button>
            </div>
          </div>
        )}

        {gameState === 'MENU' && <MainMenu credits={credits} getTotalCards={getTotalCards} openDeckBuilder={openDeckBuilder} openEncyclopedia={openEncyclopedia} openMonsterDex={openMonsterDex} openShop={openShop} setTutorialModalOpen={setTutorialModalOpen} setGameState={setGameState} startBattle={startBattle} normalCleared={normalCleared} maxStageReached={maxStageReached} setSkipModalOpen={setSkipModalOpen} setHardSkipModalOpen={setHardSkipModalOpen} toggleFullScreen={toggleFullScreen} selectedClass={selectedClass} setSelectedClass={setSelectedClass} />}
        
        {gameState === 'CLASS_SELECT' && <ClassSelectScreen setGameState={setGameState} selectedClass={selectedClass} setSelectedClass={setSelectedClass} saveGame={saveGame} />}
        
        {gameState === 'EVENT' && <EventScreen combatState={combatState} setCombatState={setCombatState} credits={credits} setCredits={setCredits} saveGame={saveGame} setToastMsg={setToastMsg} setGameState={setGameState} startNextStage={startNextStage} autoReward={autoReward} autoEventType={autoEventType} />}
        
        {gameState === 'TOWN' && <TownScreen setGameState={setGameState} credits={credits} setCredits={setCredits} saveGame={saveGame} townUpgrades={townUpgrades} setTownUpgrades={setTownUpgrades} />}
        
        {gameState === 'UPDATE_HISTORY' && <UpdateHistory setGameState={setGameState} usedCoupons={usedCoupons} couponInput={couponInput} setCouponInput={setCouponInput} handleCoupon={handleCoupon} />}
        
        {gameState === 'STATISTICS' && (
          <Statistics 
            maxStageReached={maxStageReached} 
            normalCleared={normalCleared} 
            seenEnemies={seenEnemies} 
            unlockedCards={unlockedCards} 
            credits={credits} 
            unlockedRelics={unlockedRelics} 
            gameStats={gameStats} 
            setGameState={setGameState} 
            claimedMilestones={claimedMilestones}
            handleClaimMilestone={handleClaimMilestone}
          />
        )}
        
        {gameState === 'SETTINGS' && <Settings setGameState={setGameState} fastMode={fastMode} setFastMode={setFastMode} saveGame={saveGame} handleExport={handleExport} setImportModalOpen={setImportModalOpen} handleExitGame={handleExitGame} autoReward={autoReward} setAutoReward={setAutoReward} autoRewardType={autoRewardType} setAutoRewardType={setAutoRewardType} autoRelic={autoRelic} setAutoRelic={setAutoRelic} autoEventType={autoEventType} setAutoEventType={setAutoEventType} />}
        
        {gameState === 'DECK_BUILDING' && <DeckBuilder toggleFullScreen={toggleFullScreen} getTotalCards={getTotalCards} tempDeckCounts={tempDeckCounts} setTempDeckCounts={setTempDeckCounts} handleClearDeck={() => setTempDeckCounts({})} handleDeckExport={() => { const encoded = btoa(encodeURIComponent(JSON.stringify(tempDeckCounts))); navigator.clipboard.writeText(encoded); setToastMsg('덱 코드 복사됨!'); }} setDeckImportModalOpen={setDeckImportModalOpen} setDeckCounts={setDeckCounts} saveGame={saveGame} setGameState={setGameState} filterType={filterType} setFilterType={setFilterType} filterEffect={filterEffect} setEffect={setFilterEffect} filterRarity={filterRarity} setRarity={setFilterRarity} searchQuery={searchQuery} setSearchQuery={setSearchQuery} filteredCards={getFilteredCards(filterType, filterEffect, filterRarity, 'owned', searchQuery)} allUnlockedCards={getFilteredCards('all', 'all', 'all', 'owned', '')} getCardDef={enhancedGetCardDef} shopUpgrades={shopUpgrades} handleAddCard={handleAddCard} handleRemoveCard={(id) => setTempDeckCounts({ ...tempDeckCounts, [id]: Math.max(0, (tempDeckCounts[id] || 0) - 1) })} setTutorialModalOpen={setTutorialModalOpen} normalCleared={normalCleared} unlockedRelics={unlockedRelics} startingRelic={startingRelic} setStartingRelic={setStartingRelic} />}
        
        {gameState === 'SHOP' && <ShopScreen credits={credits} setCredits={setCredits} shopUpgrades={shopUpgrades} setShopUpgrades={setShopUpgrades} unlockedCards={unlockedCards} setUnlockedCards={setUnlockedCards} saveGame={saveGame} setGameState={setGameState} getCardDef={enhancedGetCardDef} handleGacha={handleGacha} handlePremiumGacha={handlePremiumGacha} gachaResult={gachaResult} setGachaResult={setGachaResult} premiumGachaResult={premiumGachaResult} setPremiumGachaResult={setPremiumGachaResult} setToastMsg={setToastMsg} />}
        
        {gameState === 'BATTLE' && (
          <BattleScreen 
            combatState={combatState} 
            setCombatState={setCombatState} 
            isPlayerTurn={combatState?.turn === 'PLAYER'} 
            setViewingPile={setViewingPile} 
            viewingPile={viewingPile} 
            setGameState={setGameState} 
            playCard={playCard} 
            setToastMsg={setToastMsg} 
            getCardDef={enhancedGetCardDef} 
            toggleFullScreen={toggleFullScreen} 
            shopUpgrades={shopUpgrades}
            hoveredCard={hoveredCard}
            setHoveredCard={setHoveredCard}
            playerRelics={playerRelics}
            fastMode={fastMode}
            setFastMode={setFastMode}
            autoPlay={autoPlay}
            setAutoPlay={(val) => {
              const next = typeof val === 'function' ? val(autoPlay) : val;
              setAutoPlay(next);
              saveGame({ autoPlay: next });
            }}
            saveGame={saveGame}
            viewingEnemy={viewingEnemy}
            setViewingEnemy={setViewingEnemy}
            showEnemyDeck={showEnemyDeck}
            setShowEnemyDeck={setShowEnemyDeck}
            setTutorialModalOpen={setTutorialModalOpen}
            MAX_HAND_SIZE={GAME_RULES?.MAX_HAND_SIZE || 10}
          />
        )}
        
        {gameState === 'ENCYCLOPEDIA' && <Encyclopedia unlockedCards={unlockedCards} customCards={customCards} getCardDef={enhancedGetCardDef} shopUpgrades={shopUpgrades} getFilteredCards={getFilteredCards} setGameState={setGameState} toggleFullScreen={toggleFullScreen} setTutorialModalOpen={setTutorialModalOpen} unlockedRelics={unlockedRelics} />}
        
        {gameState === 'MONSTER_DEX' && <MonsterDex seenEnemies={seenEnemies} dexViewingEnemy={dexViewingEnemy} setDexViewingEnemy={setDexViewingEnemy} toggleFullScreen={toggleFullScreen} setGameState={setGameState} />}
        
        {(['REWARDS', 'REWARD_CARD', 'REWARD_REMOVE', 'BOSS_CLEAR_REWARD', 'RELIC_REWARD', 'BOSS_RELIC_CHOICE'].includes(gameState)) && (
          <Rewards 
            gameState={gameState} 
            rewardCards={rewardCards} 
            setRewardCards={setRewardCards} 
            combatState={combatState} 
            unlockedCards={unlockedCards} 
            setUnlockedCards={setUnlockedCards} 
            saveGame={saveGame} 
            setGameState={setGameState} 
            confirmSelection={confirmSelection} 
            setConfirmSelection={setConfirmSelection} 
            startNextStage={startNextStage} 
            getCardDef={enhancedGetCardDef} 
            shopUpgrades={shopUpgrades} 
            specialBossRewardCard={specialBossRewardCard} 
            pendingRelicReward={pendingRelicReward} 
            handleRelicRewardClaim={handleRelicRewardClaim}
            pendingRelicChoices={pendingRelicChoices}
            handleRelicChoiceClaim={handleRelicChoiceClaim}
            enemyDropCard={enemyDropCard} 
            setEnemyDropCard={setEnemyDropCard} 
            customCards={customCards} 
            setCustomCards={setCustomCards}
            autoReward={autoReward}
            autoRewardType={autoRewardType}
            autoRelic={autoRelic}
            handleEnemyDropClaim={() => {
              if (enemyDropCard) {
                let newUnlocked = unlockedCards;
                let newCustomCards = customCards;

                if (!unlockedCards.includes(enemyDropCard.id)) {
                  newUnlocked = [...unlockedCards, enemyDropCard.id];
                  setUnlockedCards(newUnlocked);
                }
                if (!customCards.some(c => c.id === enemyDropCard.id)) {
                  newCustomCards = [...customCards, enemyDropCard];
                  setCustomCards(newCustomCards);
                }

                setCombatState(prev => ({ ...prev, baseDeck: [...prev.baseDeck, enemyDropCard] }));
                setEnemyDropCard(null);
                saveGame({ unlockedCards: newUnlocked, customCards: newCustomCards });
              }
            }}
            handleSpecialBossRewardClaim={() => { 
              if(specialBossRewardCard) { 
                let newUnlocked = unlockedCards;
                let newCustomCards = customCards;

                if(!unlockedCards.includes(specialBossRewardCard.id)) {
                  newUnlocked = [...unlockedCards, specialBossRewardCard.id];
                  setUnlockedCards(newUnlocked);
                }
                if (!customCards.some(c => c.id === specialBossRewardCard.id)) {
                  newCustomCards = [...customCards, specialBossRewardCard];
                  setCustomCards(newCustomCards);
                }

                setCombatState(prev=>({...prev, baseDeck: [...prev.baseDeck, specialBossRewardCard]})); 
                setSpecialBossRewardCard(null); 
                
                if (combatState.mode === 'NORMAL' && combatState.stage >= 100) {
                  setNormalCleared(true);
                  saveGame({ unlockedCards: newUnlocked, customCards: newCustomCards, normalCleared: true });
                  setGameState('GAME_CLEAR');
                } else if (combatState.mode === 'HARD' && combatState.stage >= 300) {
                  setGameState('HARD_CLEAR_RELIC_CHOICE');
                  saveGame({ unlockedCards: newUnlocked, customCards: newCustomCards });
                } else {
                  setGameState('REWARDS'); 
                  saveGame({ unlockedCards: newUnlocked, customCards: newCustomCards }); 
                }
              } 
            }}
          />
        )}
        
        {gameState === 'GAME_OVER' && (
          <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-slate-900 text-white p-4">
            <h1 className="text-6xl md:text-8xl font-black text-red-500 mb-2">💀 게임 오버</h1>
            <p className="text-2xl text-slate-400 mb-6">더 강해져서 다시 도전하세요!</p>
            
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-8 text-center shadow-xl">
               <div className="text-sm text-slate-500 font-bold mb-1">진행한 모드</div>
               <div className="text-xl font-black text-indigo-400 mb-4">{combatState?.mode === 'ENDLESS' ? '무한 모드' : combatState?.mode === 'HARD' ? '하드 모드' : '일반 모드'}</div>
               <div className="text-sm text-slate-500 font-bold mb-1">도달한 스테이지</div>
               <div className="text-3xl font-black text-red-400">{combatState?.stage || 1} 층</div>
            </div>

            <button onClick={() => { setGameState('MENU'); }} className="py-3 px-10 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-xl shadow-[0_0_20px_rgba(79,70,229,0.4)]">메인으로</button>
          </div>
        )}
        
        {gameState === 'GAME_CLEAR' && <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-gradient-to-b from-yellow-900 to-slate-900 text-white p-4"><h1 className="text-6xl font-black text-yellow-400 mb-4 drop-shadow-lg">🎊 클리어!</h1><p className="text-2xl text-slate-300 mb-8">정말 훌륭한 성과입니다!</p><button onClick={() => { setGameState('MENU'); }} className="py-3 px-8 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-lg">메인으로</button></div>}
      </div>
    </ErrorBoundary>
  );
}