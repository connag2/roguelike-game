import React, { useState, useEffect } from 'react';
import { auth, db, appId } from './config/firebase';
import { onAuthStateChanged, signInAnonymously, signInWithCustomToken } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

// 데이터 및 로직 Import
import { CARD_LIBRARY, BASE_CARDS, GAME_RULES, MANA_CARD_IDS } from './constants/gameData';
import { shuffle, decayStack, getCardDef, generateEnemies, generateEnemyIntent } from './utils/gameLogic';

// 분리한 컴포넌트들 Import
import MainMenu from './components/screens/MainMenu';
import BattleScreen from './components/screens/BattleScreen';
import ShopScreen from './components/screens/ShopScreen';
import DeckBuilder from './components/screens/DeckBuilder';
import Encyclopedia from './components/screens/Encyclopedia';
import MonsterDex from './components/screens/MonsterDex';
import Rewards from './components/screens/Rewards';
import Settings from './components/screens/Settings';

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

  // 토스트 메시지 타이머
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
    // 첫 핸드 드로우
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

  // --- [6. 전투 로직 (전투 화면에서 호출)] ---
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

  // 적 턴 효과 (useEffect)
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

  
  // --- [추가: 화면 이동 / 유틸리티 / 핸들러 함수] ---

  const openDeckBuilder = () => {
    setTempDeckCounts({ ...deckCounts });
    setGameState('DECK_BUILDING');
  };

  const openEncyclopedia = () => {
    setGameState('ENCYCLOPEDIA');
  };

  const openMonsterDex = () => {
    setGameState('MONSTER_DEX');
  };

  const openShop = () => {
    setGameState('SHOP');
  };

  const getTotalCards = (counts = deckCounts) => {
    return Object.values(counts || {}).reduce((a, b) => a + b, 0);
  };

  const handleCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;

    if (usedCoupons.includes(code)) {
      setToastMsg('이미 사용한 쿠폰입니다.');
      return;
    }

    let valid = false;
    let msg = '';
    let creditsToAdd = 0;
    let unlockedToAdd = null;

    if (code === 'WELCOME') {
      creditsToAdd = 1000;
      msg = '웰컴 쿠폰: 1000 크레딧 획득!';
      valid = true;
    } else if (code === 'LEGENDARY') {
      unlockedToAdd = 'true_dragon_slayer';
      msg = '전설 쿠폰: 진·용살검 해금!';
      valid = true;
    } else if (code === 'GEMS') {
      creditsToAdd = 500;
      msg = '보석 쿠폰: 500 크레딧 획득!';
      valid = true;
    }

    if (!valid) {
      setToastMsg('유효하지 않은 쿠폰 코드입니다.');
      return;
    }

    const updatedCoupons = [...usedCoupons, code];
    const updatedUnlocked =
      unlockedToAdd && !unlockedCards.includes(unlockedToAdd)
        ? [...unlockedCards, unlockedToAdd]
        : unlockedCards;

    if (creditsToAdd > 0) setCredits(prev => prev + creditsToAdd);
    if (updatedUnlocked !== unlockedCards) setUnlockedCards(updatedUnlocked);
    setUsedCoupons(updatedCoupons);
    setCouponInput('');
    setToastMsg(msg);

    saveGame({
      usedCoupons: updatedCoupons,
      unlockedCards: updatedUnlocked,
      credits: credits + creditsToAdd
    });
  };

  const handleAdminUnlock = () => {
    if (adminCodeInput === '20090324') {
      setIsAdminUnlocked(true);
      setToastMsg('개발자 권한 활성화됨');
    } else {
      setToastMsg('잘못된 코드입니다.');
    }
  };

  const adminGiveMoney = () => {
    const nextCredits = credits + 99999;
    setCredits(nextCredits);
    saveGame({ credits: nextCredits });
    setToastMsg('99,999 크레딧 지급됨');
  };

  const adminUnlockAllCards = () => {
    const allIds = CARD_LIBRARY.map(c => c.id);
    setUnlockedCards(allIds);
    saveGame({ unlockedCards: allIds });
    setToastMsg('모든 카드 해금됨');
  };

  const handleExport = () => {
    const data = JSON.stringify({
      deckCounts,
      unlockedCards,
      credits,
      shopUpgrades,
      normalCleared,
      maxStageReached,
      seenEnemies,
      usedCoupons
    });
    navigator.clipboard.writeText(btoa(encodeURIComponent(data)));
    setToastMsg('세이브 코드가 복사되었습니다!');
  };

  const handleExitGame = async () => {
    setToastMsg('저장 중...');
    await saveGame();
    if (window.require) window.close();
    else setGameState('MENU');
  };

  const handleSpecialBossRewardClaim = () => {
    if (!specialBossRewardCard || !combatState) return;

    const alreadyOwned = unlockedCards.includes(specialBossRewardCard.id);
    const updatedUnlocked = alreadyOwned
      ? unlockedCards
      : [...unlockedCards, specialBossRewardCard.id];

    setCombatState(prev => ({
      ...prev,
      baseDeck: [...prev.baseDeck, { ...specialBossRewardCard }]
    }));
    setUnlockedCards(updatedUnlocked);
    setToastMsg(`${specialBossRewardCard.name}을(를) 덱에 추가했습니다!`);
    setSpecialBossRewardCard(null);

    if (combatState.stage >= 100) {
      setNormalCleared(true);
      saveGame({ unlockedCards: updatedUnlocked, normalCleared: true });
      setGameState('GAME_CLEAR');
    } else {
      saveGame({ unlockedCards: updatedUnlocked });
      setGameState('REWARDS');
    }
  };

  return (
    <div id="game-root" className={`font-sans antialiased selection:bg-indigo-500 selection:text-white ${isCssFullScreen ? 'fixed inset-0 z-[999999] w-[100vw] h-[100vh] overflow-auto bg-slate-950' : 'bg-slate-900 min-h-screen'}`}>
      {toastMsg && <div className="fixed top-10 left-1/2 -translate-x-1/2 bg-green-600 px-6 py-3 rounded shadow-lg font-bold animate-pulse z-50 whitespace-nowrap">{toastMsg}</div>}

      {gameState === 'MENU' && (
        <MainMenu
          credits={credits}
          getTotalCards={getTotalCards}
          openDeckBuilder={openDeckBuilder}
          openEncyclopedia={openEncyclopedia}
          openMonsterDex={openMonsterDex}
          openShop={openShop}
          setTutorialModalOpen={setTutorialModalOpen}
          setGameState={setGameState}
          handleCoupon={handleCoupon}
          startBattle={startBattle}
          normalCleared={normalCleared}
          maxStageReached={maxStageReached}
          setSkipModalOpen={setSkipModalOpen}
          toggleFullScreen={() => setIsCssFullScreen(!isCssFullScreen)}
        />
      )}

      {gameState === 'DECK_BUILDING' && (
        <DeckBuilder
          toggleFullScreen={() => setIsCssFullScreen(!isCssFullScreen)}
          getTotalCards={getTotalCards}
          tempDeckCounts={tempDeckCounts}
          handleClearDeck={() => setTempDeckCounts({})}
          handleDeckExport={() => {}}
          setDeckImportModalOpen={setDeckImportModalOpen}
          setDeckCounts={setDeckCounts}
          saveGame={saveGame}
          setGameState={setGameState}
          filterType={filterType}
          setFilterType={setFilterType}
          filterEffect={filterEffect}
          setEffect={setFilterEffect}
          filterRarity={filterRarity}
          setRarity={setFilterRarity}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filteredCards={getFilteredCards(filterType, filterEffect, filterRarity, 'owned', searchQuery)}
          getCardDef={getCardDef}
          shopUpgrades={shopUpgrades}
          handleAddCard={(id) => {
            const currentTotal = Object.values(tempDeckCounts).reduce((a, b) => a + b, 0);
            if (currentTotal >= 20 || (tempDeckCounts[id] || 0) >= 3) return;
            setTempDeckCounts({ ...tempDeckCounts, [id]: (tempDeckCounts[id] || 0) + 1 });
          }}
          handleRemoveCard={(id) =>
            setTempDeckCounts({ ...tempDeckCounts, [id]: Math.max(0, (tempDeckCounts[id] || 0) - 1) })
          }
        />
      )}

      {gameState === 'SHOP' && (
        <ShopScreen
          credits={credits}
          setCredits={setCredits}
          shopUpgrades={shopUpgrades}
          setShopUpgrades={setShopUpgrades}
          unlockedCards={unlockedCards}
          setUnlockedCards={setUnlockedCards}
          saveGame={saveGame}
          setGameState={setGameState}
          toggleFullScreen={() => setIsCssFullScreen(!isCssFullScreen)}
          setToastMsg={setToastMsg}
          getCardDef={getCardDef}
          handleGacha={() => {}}
          handlePremiumGacha={() => {}}
          gachaResult={gachaResult}
          setGachaResult={setGachaResult}
          premiumGachaResult={premiumGachaResult}
          setPremiumGachaResult={setPremiumGachaResult}
          selectPremiumCard={() => {}}
        />
      )}

      {gameState === 'ENCYCLOPEDIA' && (
        <Encyclopedia
          unlockedCards={unlockedCards}
          getCardDef={getCardDef}
          shopUpgrades={shopUpgrades}
          getFilteredCards={getFilteredCards}
          setGameState={setGameState}
          toggleFullScreen={() => setIsCssFullScreen(!isCssFullScreen)}
        />
      )}

      {gameState === 'MONSTER_DEX' && (
        <MonsterDex
          seenEnemies={seenEnemies}
          dexViewingEnemy={dexViewingEnemy}
          setDexViewingEnemy={setDexViewingEnemy}
          toggleFullScreen={() => setIsCssFullScreen(!isCssFullScreen)}
          setGameState={setGameState}
        />
      )}

      {gameState === 'BATTLE' && (
        <BattleScreen
          combatState={combatState}
          isPlayerTurn={combatState?.turn === 'PLAYER'}
          setViewingPile={setViewingPile}
          setGameState={setGameState}
          hoveredCard={hoveredCard}
          setHoveredCard={setHoveredCard}
          playCard={playCard}
          setCombatState={setCombatState}
          MAX_HAND_SIZE={GAME_RULES.MAX_HAND_SIZE}
          setShowEnemyDeck={setShowEnemyDeck}
          setViewingEnemy={setViewingEnemy}
        />
      )}

      {(gameState === 'REWARDS' ||
        gameState === 'REWARD_CARD' ||
        gameState === 'REWARD_REMOVE' ||
        gameState === 'BOSS_CLEAR_REWARD') && (
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
          getCardDef={getCardDef}
          shopUpgrades={shopUpgrades}
          specialBossRewardCard={specialBossRewardCard}
          handleSpecialBossRewardClaim={handleSpecialBossRewardClaim}
        />
      )}

      {gameState === 'SETTINGS' && (
        <Settings
          setGameState={setGameState}
          fastMode={fastMode}
          setFastMode={setFastMode}
          saveGame={saveGame}
          handleExport={handleExport}
          setImportModalOpen={setImportModalOpen}
          couponInput={couponInput}
          setCouponInput={setCouponInput}
          handleCoupon={handleCoupon}
          handleExitGame={handleExitGame}
          isAdminUnlocked={isAdminUnlocked}
          adminCodeInput={adminCodeInput}
          setAdminCodeInput={setAdminCodeInput}
          handleAdminUnlock={handleAdminUnlock}
          adminUnlockAllCards={adminUnlockAllCards}
          adminGiveMoney={adminGiveMoney}
          warpStage={warpStage}
          setWarpStage={setWarpStage}
          startBattle={startBattle}
          getTotalCards={getTotalCards}
        />
      )}

      {gameState === 'GAME_OVER' && (
        <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-slate-900 text-white p-4">
          <h1 className="text-6xl font-black text-red-600 mb-8">GAME OVER</h1>
          <button onClick={() => setGameState('MENU')} className="py-4 px-12 bg-indigo-600 rounded-full text-2xl font-bold">메인으로</button>
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
