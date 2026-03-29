import React, { useState, useEffect } from 'react';
import { auth, db, appId } from './config/firebase';
import { onAuthStateChanged, signInAnonymously, signInWithCustomToken } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { HelpCircle } from 'lucide-react'; 

// 데이터 및 로직 Import
import { CARD_LIBRARY, BASE_CARDS, GAME_RULES, MANA_CARD_IDS } from './constants/gameData';
import { shuffle, decayStack, getCardDef, generateEnemies, generateEnemyIntent } from './utils/gameLogic';

// 💡 분리한 컴포넌트들을 중복 없이 딱 1번씩만 불러오도록 정리했습니다.
import MainMenu from './components/screens/MainMenu';
import BattleScreen from './components/screens/BattleScreen';
import ShopScreen from './components/screens/ShopScreen';
import DeckBuilder from './components/screens/DeckBuilder';
import Encyclopedia from './components/screens/Encyclopedia';
import MonsterDex from './components/screens/MonsterDex';
import Rewards from './components/screens/Rewards';
import Settings from './components/screens/Settings';
import Statistics from './components/screens/Statistics';

export default function App() {
  // --- [1. 상태 관리 - 영구 데이터] ---
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

  // --- [2. 상태 관리 - 게임 진행용] ---
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
  const [isActionLocked, setIsActionLocked] = useState(false);
  const [deckImportModalOpen, setDeckImportModalOpen] = useState(false);
  const [deckImportText, setDeckImportText] = useState('');
  const [showEnemyDeck, setShowEnemyDeck] = useState(false);
  const [viewingEnemy, setViewingEnemy] = useState(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importText, setImportText] = useState('');

  // --- [3. 필터 상태] ---
  const [filterType, setFilterType] = useState('all');
  const [filterEffect, setFilterEffect] = useState('all');
  const [filterRarity, setFilterRarity] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // --- [4. 초기화 및 세이브 로직] ---
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
      if (d.normalCleared !== undefined) setNormalCleared(d.normalCleared);
      if (d.fastMode !== undefined) setFastMode(d.fastMode);
      if (d.maxStageReached !== undefined) setMaxStageReached(d.maxStageReached);
      if (d.seenEnemies) setSeenEnemies(d.seenEnemies);
      if (d.usedCoupons) setUsedCoupons(d.usedCoupons);
    }
  }, []);

  const saveGame = async (payload = {}) => {
    const data = { credits, shopUpgrades, unlockedCards, deckCounts, normalCleared, fastMode, maxStageReached, seenEnemies, usedCoupons, ...payload };
    localStorage.setItem('roguelike_tactics_save', JSON.stringify(data));
    if (user && db) {
      await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'gameSave', 'data'), data);
    }
  };

  useEffect(() => {
    if (toastMsg) {
      const t = setTimeout(() => setToastMsg(''), 2500);
      return () => clearTimeout(t);
    }
  }, [toastMsg]);

  // --- [5. 게임 핵심 핸들러] ---
  const startBattle = (mode = 'NORMAL', stage = 1) => {
    let fullDeck = [];
    Object.keys(deckCounts).forEach(id => {
      const def = getCardDef(id, shopUpgrades);
      for (let i = 0; i < deckCounts[id]; i++) fullDeck.push({ ...def });
    });
    const playerMaxHp = 100 + (shopUpgrades.maxHp * 15);
    const enemies = generateEnemies(stage);
    updateSeenEnemies(enemies);

    setCombatState({
      mode, stage, baseDeck: fullDeck, drawPile: shuffle(fullDeck),
      hand: [], discardPile: [], turn: 'PLAYER',
      player: { hp: playerMaxHp, maxHp: playerMaxHp, mana: 3, maxMana: 3, block: 0, debuffs: { weak: 0, vulnerable: 0, poison: 0 }, buffs: { strength: 0, dexterity: 0, thorns: 0 } },
      enemies: enemies
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

    setCombatState({
      ...combatState, stage: nextStage, enemies, baseDeck: newBaseDeck,
      drawPile: newDraw, hand: newHand, discardPile: [], turn: 'PLAYER',
      player: { ...newPlayer, block: 0, mana: newPlayer.maxMana, debuffs: { weak: 0, vulnerable: 0, poison: 0 }, buffs: newPlayer.buffs }
    });
    setRewardCards([]);
    setGameState('BATTLE');
  };

  const updateSeenEnemies = (list) => {
    const newSeen = [...seenEnemies];
    let changed = false;
    list.forEach(e => { if (!newSeen.includes(e.template.name)) { newSeen.push(e.template.name); changed = true; } });
    if (changed) { setSeenEnemies(newSeen); saveGame({ seenEnemies: newSeen }); }
  };

  // --- [6. 전투 로직 완벽 복원] ---
  const playCard = (cardIndex) => {
    if (combatState.turn !== 'PLAYER') return;
    const card = combatState.hand[cardIndex];
    if (combatState.player.mana < card.cost) return;

    setCombatState(prev => {
      let p = { ...prev.player };
      let newEnemies = [...prev.enemies];
      let newHand = [...prev.hand];
      let newDiscard = [...prev.discardPile];
      let newDraw = [...prev.drawPile];

      p.mana -= card.cost;
      const isWin = !card.gamble || Math.random() < card.gambleWinChance;

      const deal = (amt) => {
        if (newEnemies.length === 0) return;
        let target = newEnemies[0];
        let dmg = amt + (p.buffs.strength || 0);
        if (p.debuffs.weak > 0) dmg = Math.floor(dmg * 0.97);
        if (target.debuffs.vulnerable > 0) dmg = Math.floor(dmg * 1.3);
        if (target.block >= dmg) target.block -= dmg; else { target.hp -= (dmg - target.block); target.block = 0; }
        if (target.hp <= 0) {
          const rev = target.passives.findIndex(ps => ps.id === 'revive');
          if (rev > -1) { target.hp = Math.floor(target.maxHp / 2); target.passives.splice(rev, 1); setToastMsg('부활!'); }
          else newEnemies.shift();
        }
      };

      if (isWin) {
        if (card.winDamage) deal(newEnemies[0]?.isBoss ? card.winDamageBoss : card.winDamage);
        if (card.missingHpDamage) deal((card.damage || 0) + Math.floor((p.maxHp - p.hp) * card.missingHpDamage));
        else if (card.consumeAllMana) { deal((card.damage || 0) + p.mana * card.manaMultiplier); p.mana = 0; }
        else if (card.damage) {
          let cur = card.damage;
          for(let i=0; i<(card.multiHit || 1); i++) { deal(cur); if (card.increasingDamage) cur += card.increasingDamage; }
        }
        if (card.block && !card.doubleBlock && !card.percentBlockMaxHp) p.block += card.block + (p.buffs.dexterity || 0);
        if (card.doubleBlock) p.block *= 2;
        if (card.percentBlockMaxHp) p.block += Math.floor(p.maxHp * (card.percentBlockMaxHp / 100)) + (p.buffs.dexterity || 0);
        if (card.heal && !card.gamble) p.hp = Math.min(p.maxHp, p.hp + card.heal);
        if (card.manaGain && !card.gamble) p.mana += card.manaGain;
        if (card.winManaGain) p.mana += card.winManaGain;
        if (card.selfStrength) p.buffs.strength += card.selfStrength;
        if (card.selfDex) p.buffs.dexterity += card.selfDex;
        if (card.selfThorns) p.buffs.thorns += card.selfThorns;
        if (newEnemies.length > 0) {
          if (card.enemyWeak) newEnemies[0].debuffs.weak += card.enemyWeak;
          if (card.enemyVuln) newEnemies[0].debuffs.vulnerable += card.enemyVuln;
          if (card.enemyPoison) newEnemies[0].debuffs.poison += card.enemyPoison;
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
          if (st === 100) return Math.random() < 0.25 ? CARD_LIBRARY.find(c => c.id === 'furioso') : CARD_LIBRARY.find(c => c.id === 'slime_snot');
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
        let p = { ...prev.player };
        let newEnemies = prev.enemies.map(e => ({ ...e, block: 0 }));

        newEnemies.forEach(e => {
          if (e.debuffs?.poison > 0) { e.hp -= e.debuffs.poison; e.debuffs.poison = Math.max(0, e.debuffs.poison - 1); }
          if (e.hp <= 0) return;
          if (e.passives?.some(ps => ps.id === 'scaling_strength')) e.buffs.strength = (e.buffs.strength || 0) + 3;
          let intent = e.intentCard;
          if (intent.type.includes('attack')) {
            let dmg = intent.value + (e.buffs.strength || 0);
            if (p.debuffs.vulnerable > 0) dmg = Math.floor(dmg * 1.3);
            if (e.debuffs.weak > 0) dmg = Math.floor(dmg * 0.97);
            for(let i=0; i<(intent.multi || 1); i++) {
              if (p.block >= dmg) p.block -= dmg; else { p.hp -= (dmg - p.block); p.block = 0; }
              if (p.buffs?.thorns > 0) e.hp -= p.buffs.thorns;
            }
          }
          if (intent.type.includes('debuff')) {
            if (intent.debuff === 'weak') p.debuffs.weak += intent.turns;
            if (intent.debuff === 'vulnerable') p.debuffs.vulnerable += intent.turns;
          }
          if (intent.type.includes('defend')) e.block += intent.value;
          if (intent.type.includes('buff') && intent.buff === 'strength') e.buffs.strength += intent.buffValue;
          if (intent.type.includes('heal')) e.hp = Math.min(e.maxHp, e.hp + (intent.heal || 0));
          e.debuffs.weak = decayStack(e.debuffs.weak);
          e.debuffs.vulnerable = decayStack(e.debuffs.vulnerable);
          e.buffs.strength = decayStack(e.buffs.strength);
          e.intentCard = generateEnemyIntent(e.template, prev.stage);
        });

        newEnemies = newEnemies.filter(e => e.hp > 0);
        if (p.hp <= 0) { setGameState('GAME_OVER'); return prev; }
        if (newEnemies.length === 0) { setTimeout(() => setGameState('REWARDS'), 600); return { ...prev, player: p, enemies: [], hand: [], discardPile: [], drawPile: [] }; }

        p.block = 0; p.mana = p.maxMana;
        ['weak', 'vulnerable', 'poison'].forEach(k => p.debuffs[k] = decayStack(p.debuffs[k]));
        ['strength', 'dexterity', 'thorns'].forEach(k => p.buffs[k] = decayStack(p.buffs[k]));
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

  // --- [7. 기타 기능] ---
  const getFilteredCards = (t, e, r, o, q) => {
    return CARD_LIBRARY.filter(c => {
      if (r !== 'all' && c.rarity !== r) return false;
      if (t !== 'all' && c.type !== t) return false;
      if (e === 'debuff' && !(c.enemyWeak || c.enemyVuln || c.enemyPoison)) return false;
      if (e === 'buff' && !(c.selfStrength || c.selfDex || c.selfThorns)) return false;
      if (o === 'owned' && !unlockedCards.includes(c.id)) return false;
      if (o === 'unowned' && unlockedCards.includes(c.id)) return false;
      if (q) {
        const def = getCardDef(c.id, shopUpgrades);
        if (def && !(def.name || '').toLowerCase().includes(q.toLowerCase()) && !(def.desc || '').toLowerCase().includes(q.toLowerCase())) return false;
      }
      return true;
    });
  };

  const openDeckBuilder = () => { setTempDeckCounts({ ...deckCounts }); setGameState('DECK_BUILDING'); };
  const openEncyclopedia = () => { setGameState('ENCYCLOPEDIA'); };
  const openMonsterDex = () => { setGameState('MONSTER_DEX'); };
  const openShop = () => { setGameState('SHOP'); };
  const getTotalCards = (counts = deckCounts) => Object.values(counts || {}).reduce((a, b) => a + b, 0);

  const handleCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    if (usedCoupons.includes(code)) { setToastMsg('이미 사용한 쿠폰입니다.'); return; }

    let valid = false, msg = '', creditsToAdd = 0, unlockedToAdd = null;
    if (code === 'WELCOME') { creditsToAdd = 1000; msg = '웰컴 쿠폰: 1000 크레딧 획득!'; valid = true; } 
    else if (code === 'LEGENDARY') { unlockedToAdd = 'true_dragon_slayer'; msg = '전설 쿠폰: 진·용살검 해금!'; valid = true; } 
    else if (code === 'GEMS') { creditsToAdd = 500; msg = '보석 쿠폰: 500 크레딧 획득!'; valid = true; }

    if (!valid) { setToastMsg('유효하지 않은 쿠폰 코드입니다.'); return; }

    const updatedCoupons = [...usedCoupons, code];
    const updatedUnlocked = unlockedToAdd && !unlockedCards.includes(unlockedToAdd) ? [...unlockedCards, unlockedToAdd] : unlockedCards;

    if (creditsToAdd > 0) setCredits(prev => prev + creditsToAdd);
    if (updatedUnlocked !== unlockedCards) setUnlockedCards(updatedUnlocked);
    setUsedCoupons(updatedCoupons); setCouponInput(''); setToastMsg(msg);
    saveGame({ usedCoupons: updatedCoupons, unlockedCards: updatedUnlocked, credits: credits + creditsToAdd });
  };

  const handleAdminUnlock = () => {
    if (adminCodeInput === '20090324') { setIsAdminUnlocked(true); setToastMsg('개발자 권한 활성화됨'); } 
    else setToastMsg('잘못된 코드입니다.');
  };
  const adminGiveMoney = () => { const nextCredits = credits + 99999; setCredits(nextCredits); saveGame({ credits: nextCredits }); setToastMsg('99,999 크레딧 지급됨'); };
  const adminUnlockAllCards = () => { const allIds = CARD_LIBRARY.map(c => c.id); setUnlockedCards(allIds); saveGame({ unlockedCards: allIds }); setToastMsg('모든 카드 해금됨'); };

  const handleExport = () => {
    const data = JSON.stringify({ credits, shopUpgrades, unlockedCards, deckCounts, normalCleared, fastMode, maxStageReached, seenEnemies, usedCoupons });
    navigator.clipboard.writeText(btoa(encodeURIComponent(data)));
    setToastMsg('세이브 코드가 복사되었습니다!');
  };

  const handleDeckExport = () => {
    const data = JSON.stringify(tempDeckCounts);
    navigator.clipboard.writeText(btoa(encodeURIComponent(data)));
    setToastMsg('현재 덱이 복사되었습니다!');
  };

  const handleExitGame = async () => {
    setToastMsg('저장 중...'); await saveGame();
    if (window.require) window.close(); else setGameState('MENU');
  };

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
    <div className={isCssFullScreen ? 'fixed inset-0 z-50 bg-slate-950' : 'bg-slate-900 min-h-screen text-white'}>
      {toastMsg && <div className="fixed top-10 left-1/2 -translate-x-1/2 bg-indigo-600 px-6 py-3 rounded-full z-[9999] shadow-2xl animate-bounce font-bold">{toastMsg}</div>}

      {tutorialModalOpen && (
        <div className="fixed inset-0 bg-black/90 z-[10000] flex items-center justify-center p-4 backdrop-blur-md" onClick={() => setTutorialModalOpen(false)}>
          <div className="bg-slate-800 p-6 md:p-8 rounded-2xl border-2 border-indigo-500 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl animate-draw" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-4">
              <h2 className="text-2xl md:text-3xl font-black text-indigo-400 flex items-center gap-2">
                <HelpCircle className="w-8 h-8" />
                {gameState === 'MENU' ? "게임 가이드" : 
                 gameState === 'BATTLE' ? "전투 가이드" : 
                 gameState === 'SHOP' ? "상점 이용 가이드" : 
                 gameState === 'DECK_BUILDING' ? "덱 구성 가이드" : 
                 (gameState === 'ENCYCLOPEDIA' || gameState === 'MONSTER_DEX') ? "도감 가이드" : "도움말"}
              </h2>
              <button onClick={() => setTutorialModalOpen(false)} className="text-slate-400 hover:text-white text-3xl font-bold transition-colors">×</button>
            </div>

            <div className="space-y-6 text-slate-200 text-sm md:text-base leading-relaxed">
              {(gameState === 'MENU' || gameState === 'BATTLE') && (
                <section>
                  <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">⚔️ 기본 전투 규칙</h3>
                  <ul className="list-disc list-inside space-y-1 text-slate-300">
                    <li>매 턴 카드를 5장씩 뽑으며 마나는 3으로 충전됩니다.</li>
                    <li><b>방어도:</b> 적의 공격을 막아주지만, 내 턴이 시작될 때 0으로 초기화됩니다.</li>
                    <li><b>몬스터:</b> 5층마다 보스가 등장하며, 25/50/75/100층은 전설 보스가 등장합니다.</li>
                  </ul>
                </section>
              )}

              {gameState === 'SHOP' && (
                <section>
                  <h3 className="text-lg font-bold text-yellow-400 mb-2">💰 상점 이용법</h3>
                  <ul className="list-disc list-inside space-y-1 text-slate-300">
                    <li>전투에서 얻은 크레딧으로 <b>카드 강화</b>를 하거나 <b>뽑기</b>를 할 수 있습니다.</li>
                    <li>강화된 카드의 효과는 덱에 있는 동일한 모든 카드에 영구적으로 적용됩니다.</li>
                    <li>프리미엄 뽑기에서는 전설과 희귀 카드가 나올 확률이 대폭 상승합니다.</li>
                  </ul>
                </section>
              )}

              {gameState === 'DECK_BUILDING' && (
                <section>
                  <h3 className="text-lg font-bold text-indigo-400 mb-2">🃏 덱 구성 팁</h3>
                  <ul className="list-disc list-inside space-y-1 text-slate-300">
                    <li>모험을 시작하려면 덱이 반드시 <b>20장</b>이어야 합니다.</li>
                    <li>카드를 클릭하여 덱에 추가하거나 제거할 수 있습니다.</li>
                    <li>마나 카드, 방어 카드, 공격 카드의 비율을 적절히 섞는 것이 생존의 핵심입니다.</li>
                  </ul>
                </section>
              )}

              {(gameState === 'ENCYCLOPEDIA' || gameState === 'MONSTER_DEX') && (
                <section>
                  <h3 className="text-lg font-bold text-blue-400 mb-2">📖 도감 이용법</h3>
                  <ul className="list-disc list-inside space-y-1 text-slate-300">
                    <li>지금까지 만난 적과 해금한 카드들의 상세 정보를 확인할 수 있습니다.</li>
                    <li>적을 클릭하면 해당 적이 사용하는 스킬(의도) 덱을 미리 엿볼 수 있습니다.</li>
                  </ul>
                </section>
              )}

              <section className="bg-slate-900/50 p-4 rounded-xl border border-slate-700 mt-6">
                <h3 className="text-lg font-bold text-orange-400 mb-3 underline underline-offset-4">✨ 상태 효과 상세 설명</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs md:text-sm">
                  <div className="space-y-2">
                    <p><span className="text-orange-400 font-bold">약화:</span> 가하는 피해량이 3% 감소합니다.</p>
                    <p><span className="text-purple-400 font-bold">취약:</span> 받는 피해량이 30% 증가합니다.</p>
                    <p><span className="text-green-400 font-bold">중독:</span> 턴 시작 시 수치만큼 피해를 입고 수치가 1 감소합니다.</p>
                  </div>
                  <div className="space-y-2">
                    <p><span className="text-red-400 font-bold">근력:</span> 가하는 피해량이 수치만큼 영구적으로 증가합니다.</p>
                    <p><span className="text-blue-400 font-bold">민첩:</span> 얻는 방어도가 수치만큼 영구적으로 증가합니다.</p>
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
            <textarea 
              className="w-full h-32 bg-slate-900 border border-slate-600 rounded-lg p-3 text-white text-sm mb-4 outline-none focus:border-indigo-400"
              placeholder="여기에 복사한 덱 코드를 붙여넣으세요..."
              value={deckImportText}
              onChange={e => setDeckImportText(e.target.value)}
            />
            <div className="flex gap-3">
              <button onClick={() => setDeckImportModalOpen(false)} className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-bold transition-colors">취소</button>
              <button onClick={() => {
                try {
                  const data = JSON.parse(decodeURIComponent(atob(deckImportText.trim())));
                  setTempDeckCounts(data);
                  setToastMsg('덱을 성공적으로 불러왔습니다!');
                  setDeckImportModalOpen(false);
                  setDeckImportText('');
                } catch(e) {
                  setToastMsg('잘못된 덱 코드입니다.');
                }
              }} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-bold transition-colors shadow-lg">불러오기</button>
            </div>
          </div>
        </div>
      )}

      {importModalOpen && (
        <div className="fixed inset-0 bg-black/90 z-[10000] flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setImportModalOpen(false)}>
          <div className="bg-slate-800 p-6 rounded-xl border-2 border-emerald-500 w-full max-w-md animate-draw" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4 text-white">세이브 데이터 불러오기</h3>
            <textarea 
              className="w-full h-32 bg-slate-900 border border-slate-600 rounded-lg p-3 text-white text-sm mb-4 outline-none focus:border-emerald-400"
              placeholder="여기에 복사한 세이브 코드를 붙여넣으세요..."
              value={importText}
              onChange={e => setImportText(e.target.value)}
            />
            <div className="flex gap-3">
              <button onClick={() => setImportModalOpen(false)} className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-bold transition-colors">취소</button>
              <button onClick={() => {
                try {
                  const data = JSON.parse(decodeURIComponent(atob(importText.trim())));
                  if(data.credits !== undefined) setCredits(data.credits);
                  if(data.shopUpgrades) setShopUpgrades(data.shopUpgrades);
                  if(data.unlockedCards) setUnlockedCards(data.unlockedCards);
                  if(data.deckCounts) setDeckCounts(data.deckCounts);
                  if(data.normalCleared !== undefined) setNormalCleared(data.normalCleared);
                  if(data.maxStageReached !== undefined) setMaxStageReached(data.maxStageReached);
                  if(data.seenEnemies) setSeenEnemies(data.seenEnemies);
                  if(data.usedCoupons) setUsedCoupons(data.usedCoupons);
                  saveGame(data);
                  setToastMsg('세이브를 성공적으로 불러왔습니다!');
                  setImportModalOpen(false);
                  setImportText('');
                } catch(e) {
                  setToastMsg('잘못된 세이브 데이터입니다.');
                }
              }} className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-bold transition-colors shadow-lg">불러오기</button>
            </div>
          </div>
        </div>
      )}

      {/* 💡 화면 컴포넌트들 */}
      {gameState === 'MENU' && (
        <MainMenu
          credits={credits} getTotalCards={getTotalCards}
          openDeckBuilder={openDeckBuilder} openEncyclopedia={openEncyclopedia}
          openMonsterDex={openMonsterDex} openShop={openShop}
          setTutorialModalOpen={setTutorialModalOpen} 
          setGameState={setGameState} handleCoupon={handleCoupon} startBattle={startBattle}
          normalCleared={normalCleared} maxStageReached={maxStageReached}
          setSkipModalOpen={setSkipModalOpen} toggleFullScreen={() => setIsCssFullScreen(!isCssFullScreen)}
        />
      )}

      {gameState === 'STATISTICS' && (
        <Statistics
          maxStageReached={maxStageReached}
          normalCleared={normalCleared}
          seenEnemies={seenEnemies}
          unlockedCards={unlockedCards}
          credits={credits}
          setGameState={setGameState}
        />
      )}

      {gameState === 'DECK_BUILDING' && (
        <DeckBuilder
          toggleFullScreen={() => setIsCssFullScreen(!isCssFullScreen)}
          getTotalCards={getTotalCards} tempDeckCounts={tempDeckCounts}
          handleClearDeck={() => setTempDeckCounts({})} 
          handleDeckExport={handleDeckExport} 
          setDeckImportModalOpen={setDeckImportModalOpen} 
          setDeckCounts={setDeckCounts} saveGame={saveGame} setGameState={setGameState}
          filterType={filterType} setFilterType={setFilterType}
          filterEffect={filterEffect} setEffect={setFilterEffect}
          filterRarity={filterRarity} setRarity={setFilterRarity}
          searchQuery={searchQuery} setSearchQuery={setSearchQuery}
          filteredCards={getFilteredCards(filterType, filterEffect, filterRarity, 'owned', searchQuery)}
          getCardDef={getCardDef} shopUpgrades={shopUpgrades}
          handleAddCard={(id) => {
            const currentTotal = Object.values(tempDeckCounts).reduce((a, b) => a + b, 0);
            if (currentTotal >= 20 || (tempDeckCounts[id] || 0) >= 3) return;
            setTempDeckCounts({ ...tempDeckCounts, [id]: (tempDeckCounts[id] || 0) + 1 });
          }}
          handleRemoveCard={(id) => setTempDeckCounts({ ...tempDeckCounts, [id]: Math.max(0, (tempDeckCounts[id] || 0) - 1) })}
          setTutorialModalOpen={setTutorialModalOpen} 
        />
      )}

      {gameState === 'SHOP' && (
        <ShopScreen
          credits={credits} setCredits={setCredits} shopUpgrades={shopUpgrades} setShopUpgrades={setShopUpgrades}
          unlockedCards={unlockedCards} setUnlockedCards={setUnlockedCards} saveGame={saveGame} setGameState={setGameState}
          toggleFullScreen={() => setIsCssFullScreen(!isCssFullScreen)} setToastMsg={setToastMsg} getCardDef={getCardDef}
          handleGacha={() => {}} handlePremiumGacha={() => {}} gachaResult={gachaResult} setGachaResult={setGachaResult}
          premiumGachaResult={premiumGachaResult} setPremiumGachaResult={setPremiumGachaResult} selectPremiumCard={() => {}}
          setTutorialModalOpen={setTutorialModalOpen} 
        />
      )}

      {gameState === 'BATTLE' && (
        <BattleScreen
          combatState={combatState} isPlayerTurn={combatState?.turn === 'PLAYER'}
          setViewingPile={setViewingPile} viewingPile={viewingPile}
          setGameState={setGameState} hoveredCard={hoveredCard} setHoveredCard={setHoveredCard}
          playCard={playCard} setCombatState={setCombatState} MAX_HAND_SIZE={GAME_RULES.MAX_HAND_SIZE}
          setShowEnemyDeck={setShowEnemyDeck} setViewingEnemy={setViewingEnemy} setTutorialModalOpen={setTutorialModalOpen} 
        />
      )}

      {gameState === 'ENCYCLOPEDIA' && (
        <Encyclopedia
          unlockedCards={unlockedCards} getCardDef={getCardDef} shopUpgrades={shopUpgrades} getFilteredCards={getFilteredCards} 
          setGameState={setGameState} toggleFullScreen={() => setIsCssFullScreen(!isCssFullScreen)} setTutorialModalOpen={setTutorialModalOpen} 
        />
      )}

      {gameState === 'MONSTER_DEX' && (
        <MonsterDex
          seenEnemies={seenEnemies} dexViewingEnemy={dexViewingEnemy} setDexViewingEnemy={setDexViewingEnemy}
          toggleFullScreen={() => setIsCssFullScreen(!isCssFullScreen)} setGameState={setGameState} setTutorialModalOpen={setTutorialModalOpen} 
        />
      )}

      {(['REWARDS', 'REWARD_CARD', 'REWARD_REMOVE', 'BOSS_CLEAR_REWARD'].includes(gameState)) && (
        <Rewards
          gameState={gameState} rewardCards={rewardCards} setRewardCards={setRewardCards} combatState={combatState} 
          unlockedCards={unlockedCards} setUnlockedCards={setUnlockedCards} saveGame={saveGame} setGameState={setGameState} 
          confirmSelection={confirmSelection} setConfirmSelection={setConfirmSelection} startNextStage={startNextStage}
          getCardDef={getCardDef} shopUpgrades={shopUpgrades} specialBossRewardCard={specialBossRewardCard} handleSpecialBossRewardClaim={handleSpecialBossRewardClaim}
        />
      )}

      {gameState === 'SETTINGS' && (
        <Settings
          setGameState={setGameState} fastMode={fastMode} setFastMode={setFastMode} saveGame={saveGame}
          handleExport={handleExport} 
          setImportModalOpen={setImportModalOpen} 
          couponInput={couponInput} setCouponInput={setCouponInput} handleCoupon={handleCoupon}
          handleExitGame={handleExitGame} isAdminUnlocked={isAdminUnlocked} adminCodeInput={adminCodeInput}
          setAdminCodeInput={setAdminCodeInput} handleAdminUnlock={handleAdminUnlock}
          adminUnlockAllCards={adminUnlockAllCards} adminGiveMoney={adminGiveMoney}
          warpStage={warpStage} setWarpStage={setWarpStage} startBattle={startBattle} getTotalCards={getTotalCards}
        />
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
          <h1 className="text-6xl font-black text-yellow-400 mb-8">CONQUEROR!</h1>
          <button onClick={() => setGameState('MENU')} className="py-4 px-12 bg-indigo-600 rounded-full text-2xl font-bold">메인으로</button>
        </div>
      )}
    </div>
  );
}