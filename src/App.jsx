import React, { useState, useEffect } from 'react';
import { Sword, Shield, Zap, Heart, RefreshCw, Skull, ArrowRightCircle, Lock, Save, PlusCircle, Trash2, Store, Coins, AlertTriangle, Info, Maximize, Gift, Book, Trophy, Settings, FastForward, Eraser, Download, Upload, Search, HelpCircle, FileQuestion, Star } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

// ============================================================
// 게임 상수 및 데이터 (constants/gameData.js 대체)
// ============================================================

const GAME_RULES = {
  MAX_HAND_SIZE: 10,
  STARTING_MANA: 3,
  CARDS_PER_TURN: 5,
};

const CARD_LIBRARY = [
  { id: 'strike', name: '타격', type: 'attack', rarity: 'common', cost: 1, damage: 6, desc: '6 피해를 입힙니다.' },
  { id: 'defend', name: '방어', type: 'skill', rarity: 'common', cost: 1, block: 5, desc: '5 방어도를 얻습니다.' },
  { id: 'heavy_strike', name: '강타', type: 'attack', rarity: 'common', cost: 2, damage: 12, desc: '12 피해를 입힙니다.' },
  { id: 'shield_bash', name: '방패 강타', type: 'attack', rarity: 'common', cost: 2, damage: 8, block: 4, desc: '8 피해, 4 방어도.' },
  { id: 'heal', name: '치유', type: 'skill', rarity: 'common', cost: 1, heal: 6, desc: '체력을 6 회복합니다.' },
  { id: 'mana_potion', name: '마나 물약', type: 'skill', rarity: 'common', cost: 0, manaGain: 2, desc: '마나를 2 얻습니다.' },
  { id: 'focus', name: '집중', type: 'skill', rarity: 'common', cost: 1, draw: 2, desc: '카드를 2장 뽑습니다.' },
  { id: 'rage', name: '분노', type: 'skill', rarity: 'uncommon', cost: 1, selfStrength: 2, desc: '힘 2를 얻습니다.' },
  { id: 'iron_wave', name: '강철 파도', type: 'attack', rarity: 'uncommon', cost: 2, damage: 8, block: 8, desc: '8 피해, 8 방어도.' },
  { id: 'twin_strike', name: '쌍둥이 타격', type: 'attack', rarity: 'uncommon', cost: 1, damage: 4, multiHit: 2, desc: '4 피해를 2번 입힙니다.' },
  { id: 'execute', name: '처형', type: 'attack', rarity: 'rare', cost: 3, damage: 25, desc: '25 피해를 입힙니다.' },
  { id: 'berserker', name: '광전사', type: 'attack', rarity: 'rare', cost: 2, damage: 15, selfDamage: 5, desc: '15 피해, 자신 5 피해.' },
  { id: 'divine_shield', name: '신성한 방패', type: 'skill', rarity: 'rare', cost: 3, block: 30, desc: '30 방어도를 얻습니다.' },
  { id: 'soul_strike', name: '영혼 타격', type: 'attack', rarity: 'special', cost: 2, damage: 20, heal: 5, desc: '20 피해, 5 회복.' },
];

const BASE_CARDS = ['strike', 'defend', 'heavy_strike', 'shield_bash', 'heal', 'mana_potion', 'focus'];

const ENEMIES = [
  { name: '슬라임', baseHp: 30, deck: [
    { name: '몸통 박치기', type: 'attack', damage: 6, desc: '6 피해' },
    { name: '점액 방어', type: 'defend', block: 4, desc: '4 방어도' },
  ]},
  { name: '고블린', baseHp: 40, deck: [
    { name: '단검 찌르기', type: 'attack', damage: 8, desc: '8 피해' },
    { name: '회피', type: 'defend', block: 6, desc: '6 방어도' },
  ]},
  { name: '오크', baseHp: 55, deck: [
    { name: '도끼 휘두르기', type: 'attack', damage: 12, desc: '12 피해' },
    { name: '전투 함성', type: 'buff', selfStrength: 2, desc: '힘 +2' },
  ]},
];

const NORMAL_BOSSES = [
  { name: '트롤 왕', baseHp: 120, isBoss: true, deck: [
    { name: '거대한 주먹', type: 'attack', damage: 18, desc: '18 피해' },
    { name: '재생', type: 'heal', heal: 10, desc: '10 회복' },
    { name: '분쇄', type: 'attack', damage: 25, desc: '25 피해' },
  ]},
  { name: '드래곤', baseHp: 200, isBoss: true, deck: [
    { name: '화염 브레스', type: 'attack', damage: 20, desc: '20 피해' },
    { name: '비늘 강화', type: 'defend', block: 15, desc: '15 방어도' },
    { name: '꼬리 휩쓸기', type: 'attack', damage: 12, desc: '12 피해' },
  ]},
];

const SPECIAL_BOSSES = {
  25: { name: '그림자 군주', baseHp: 150, isBoss: true, deck: [
    { name: '암흑 파동', type: 'attack', damage: 15, desc: '15 피해' },
    { name: '그림자 은신', type: 'defend', block: 20, desc: '20 방어도' },
  ]},
  50: { name: '번개의 신', baseHp: 250, isBoss: true, deck: [
    { name: '천둥 벼락', type: 'attack', damage: 25, desc: '25 피해' },
    { name: '번개 방패', type: 'defend', block: 25, desc: '25 방어도' },
  ]},
  75: { name: '빙결 여왕', baseHp: 350, isBoss: true, deck: [
    { name: '얼음 창', type: 'attack', damage: 30, desc: '30 피해' },
    { name: '빙결 장벽', type: 'defend', block: 30, desc: '30 방어도' },
  ]},
  100: { name: '최종 보스', baseHp: 500, isBoss: true, deck: [
    { name: '종말의 일격', type: 'attack', damage: 40, desc: '40 피해' },
    { name: '절대 방어', type: 'defend', block: 40, desc: '40 방어도' },
  ]},
};

// ============================================================
// 유틸리티 함수 (utils/gameLogic.js 대체)
// ============================================================

const shuffle = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const getCardDef = (id, shopUpgrades = {}) => {
  const base = CARD_LIBRARY.find(c => c.id === id);
  if (!base) return null;
  const card = { ...base, uid: Math.random().toString() };
  if (shopUpgrades.upgradedCards?.includes(id)) {
    card.isUpgraded = true;
    if (card.damage) card.damage = Math.floor(card.damage * 1.25);
    if (card.block) card.block = Math.floor(card.block * 1.25);
    if (card.heal) card.heal = Math.floor(card.heal * 1.25);
    card.name = card.name + '+';
  }
  return card;
};

const generateEnemies = (stage, mode) => {
  const hpScale = 1 + (stage - 1) * 0.1;
  
  if (SPECIAL_BOSSES[stage]) {
    const boss = { ...SPECIAL_BOSSES[stage] };
    boss.hp = Math.floor(boss.baseHp * hpScale);
    boss.maxHp = boss.hp;
    boss.block = 0;
    boss.debuffs = { weak: 0, vulnerable: 0 };
    boss.passives = [];
    boss.uid = Math.random().toString();
    boss.intentCard = boss.deck[Math.floor(Math.random() * boss.deck.length)];
    return [boss];
  }
  
  if (stage % 10 === 0) {
    const boss = { ...NORMAL_BOSSES[Math.floor(Math.random() * NORMAL_BOSSES.length)] };
    boss.hp = Math.floor(boss.baseHp * hpScale);
    boss.maxHp = boss.hp;
    boss.block = 0;
    boss.debuffs = { weak: 0, vulnerable: 0 };
    boss.passives = [];
    boss.uid = Math.random().toString();
    boss.intentCard = boss.deck[Math.floor(Math.random() * boss.deck.length)];
    return [boss];
  }
  
  const count = Math.min(1 + Math.floor(stage / 15), 3);
  const enemies = [];
  for (let i = 0; i < count; i++) {
    const template = ENEMIES[Math.floor(Math.random() * ENEMIES.length)];
    const enemy = {
      ...template,
      hp: Math.floor(template.baseHp * hpScale),
      maxHp: Math.floor(template.baseHp * hpScale),
      block: 0,
      debuffs: { weak: 0, vulnerable: 0 },
      passives: [],
      uid: Math.random().toString(),
      isBoss: false,
    };
    enemy.intentCard = enemy.deck[Math.floor(Math.random() * enemy.deck.length)];
    enemies.push(enemy);
  }
  return enemies;
};

// ============================================================
// Firebase 설정
// ============================================================

const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{"projectId":"dummy"}');
let app, auth, db;
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch(e) {
  console.log('Firebase init skipped');
}
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// ============================================================
// 전역 스타일
// ============================================================

const styles = `
  @keyframes drawCard { 0% { transform: translateY(100px) scale(0.8); opacity: 0; } 100% { transform: translateY(0) scale(1); opacity: 1; } }
  .animate-draw { animation: drawCard 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; opacity: 0; }
  .hide-scrollbar::-webkit-scrollbar { display: none; }
  .custom-scroll::-webkit-scrollbar { width: 6px; }
  .custom-scroll::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); border-radius: 3px; }
  .custom-scroll::-webkit-scrollbar-thumb { background: rgba(100,100,150,0.5); border-radius: 3px; }
  .tooltip-trigger { position: relative; z-index: 50; }
  .tooltip-trigger .tooltip-content { visibility: hidden; opacity: 0; transition: opacity 0.2s; position: absolute; z-index: 99999; }
  .tooltip-trigger:hover .tooltip-content, .tooltip-trigger:focus .tooltip-content { visibility: visible; opacity: 1; }
  .legendary-bg { background: linear-gradient(135deg, rgba(15,23,42,1) 0%, rgba(69,26,3,0.8) 100%); }
  .special-bg { background: linear-gradient(135deg, rgba(30,0,50,1) 0%, rgba(100,0,100,0.8) 100%); }
  html { -webkit-text-size-adjust: none; text-size-adjust: none; font-size: 14px; }
  @media (min-width: 768px) { html { font-size: 16px; } }
  #game-root { width: 100%; min-height: 100dvh; overflow-x: hidden; }
`;

// ============================================================
// 메인 앱 컴포넌트
// ============================================================

export default function App() {
  // --- 모든 상태(State) 변수 ---
  const [gameState, setGameState] = useState('MENU');
  const [user, setUser] = useState(null);
  const [toastMsg, setToastMsg] = useState('');
  const [credits, setCredits] = useState(100);
  const [shopUpgrades, setShopUpgrades] = useState({ maxHp: 0, upgradedCards: [] });
  const [unlockedCards, setUnlockedCards] = useState(BASE_CARDS);
  const [deckCounts, setDeckCounts] = useState({ strike: 3, defend: 3, heavy_strike: 2, shield_bash: 2, heal: 2, mana_potion: 2, focus: 2 });
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
  const [specialBossRewardCard, setSpecialBossRewardCard] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [filterRarity, setFilterRarity] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredCard, setHoveredCard] = useState(null);
  const [confirmSelection, setConfirmSelection] = useState(null);
  const [dexViewingEnemy, setDexViewingEnemy] = useState(null);
  const [isCssFullScreen, setIsCssFullScreen] = useState(false);

  // --- Firebase 인증 ---
  useEffect(() => {
    if (!auth) return;
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (e) {
        console.log('Auth error:', e);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // --- 로컬 스토리지 로드 ---
  useEffect(() => {
    try {
      const saved = localStorage.getItem('roguelike_tactics_save');
      if (saved) {
        const data = JSON.parse(saved);
        if (data.deckCounts) setDeckCounts(data.deckCounts);
        if (data.unlockedCards) setUnlockedCards(data.unlockedCards);
        if (data.credits !== undefined) setCredits(data.credits);
        if (data.shopUpgrades) setShopUpgrades(data.shopUpgrades);
        if (data.normalCleared) setNormalCleared(data.normalCleared);
        if (data.fastMode) setFastMode(data.fastMode);
        if (data.maxStageReached) setMaxStageReached(data.maxStageReached);
        if (data.seenEnemies) setSeenEnemies(data.seenEnemies);
        if (data.usedCoupons) setUsedCoupons(data.usedCoupons);
      }
    } catch (e) {
      console.log('Load error:', e);
    }
  }, []);

  // --- 세이브 함수 ---
  const saveGame = async (payload = {}) => {
    const currentSave = {
      deckCounts,
      unlockedCards,
      credits,
      shopUpgrades,
      normalCleared,
      fastMode,
      maxStageReached,
      usedCoupons,
      seenEnemies,
      ...payload
    };
    try {
      localStorage.setItem('roguelike_tactics_save', JSON.stringify(currentSave));
    } catch (e) {
      console.log('Save error:', e);
    }
    if (!user || !db) return;
    try {
      const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'gameSave', 'data');
      await setDoc(docRef, currentSave);
    } catch (e) {
      console.log('Firebase save error:', e);
    }
  };

  // --- 토스트 표시 ---
  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2000);
  };

  // --- 덱 총 카드 수 계산 ---
  const getTotalCards = (counts) => {
    return Object.values(counts).reduce((sum, n) => sum + n, 0);
  };

  // --- 덱 관리 함수 ---
  const handleAddCard = (id) => {
    if (getTotalCards(tempDeckCounts) >= 20) return;
    setTempDeckCounts(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const handleRemoveCard = (id) => {
    setTempDeckCounts(prev => {
      const newCounts = { ...prev };
      if (newCounts[id] > 0) newCounts[id]--;
      if (newCounts[id] === 0) delete newCounts[id];
      return newCounts;
    });
  };

  // --- 내보내기/가져오기 ---
  const handleExport = () => {
    const data = {
      deckCounts,
      unlockedCards,
      credits,
      shopUpgrades,
      normalCleared,
      maxStageReached,
      seenEnemies,
    };
    const encoded = btoa(JSON.stringify(data));
    navigator.clipboard.writeText(encoded);
    showToast('세이브 코드가 복사되었습니다!');
  };

  const handleImport = (text) => {
    try {
      const data = JSON.parse(atob(text));
      if (data.deckCounts) setDeckCounts(data.deckCounts);
      if (data.unlockedCards) setUnlockedCards(data.unlockedCards);
      if (data.credits !== undefined) setCredits(data.credits);
      if (data.shopUpgrades) setShopUpgrades(data.shopUpgrades);
      if (data.normalCleared) setNormalCleared(data.normalCleared);
      if (data.maxStageReached) setMaxStageReached(data.maxStageReached);
      if (data.seenEnemies) setSeenEnemies(data.seenEnemies);
      saveGame(data);
      setImportModalOpen(false);
      setImportText('');
      showToast('데이터를 불러왔습니다!');
    } catch (e) {
      showToast('잘못된 코드입니다.');
    }
  };

  // --- 전투 시작 ---
  const startBattle = (mode = 'NORMAL', startStage = 1) => {
    const baseMaxHp = 80 + (shopUpgrades.maxHp || 0) * 10;
    const baseDeck = [];
    
    Object.entries(deckCounts).forEach(([id, count]) => {
      for (let i = 0; i < count; i++) {
        const card = getCardDef(id, shopUpgrades);
        if (card) baseDeck.push({ ...card, uid: Math.random().toString() });
      }
    });

    if (baseDeck.length < 10) {
      showToast('덱에 최소 10장의 카드가 필요합니다!');
      return;
    }

    const enemies = generateEnemies(startStage, mode);
    const newSeen = [...new Set([...seenEnemies, ...enemies.map(e => e.name)])];
    setSeenEnemies(newSeen);
    saveGame({ seenEnemies: newSeen });

    const shuffledDeck = shuffle([...baseDeck]);
    const hand = [];
    for (let i = 0; i < GAME_RULES.CARDS_PER_TURN && shuffledDeck.length > 0; i++) {
      hand.push({ ...shuffledDeck.pop(), uid: Math.random().toString() });
    }

    setCombatState({
      mode,
      stage: startStage,
      turn: 'PLAYER',
      player: {
        hp: baseMaxHp,
        maxHp: baseMaxHp,
        mana: GAME_RULES.STARTING_MANA,
        block: 0,
        buffs: { strength: 0, dexterity: 0 },
        debuffs: { weak: 0, vulnerable: 0 },
      },
      enemies,
      hand,
      drawPile: shuffledDeck,
      discardPile: [],
      baseDeck: [...baseDeck],
    });

    setGameState('BATTLE');
  };

  // --- 다음 스테이지 시작 ---
  const startNextStage = (player, baseDeck) => {
    const nextStage = combatState.stage + 1;
    
    if (nextStage > maxStageReached) {
      setMaxStageReached(nextStage);
      saveGame({ maxStageReached: nextStage });
    }

    const enemies = generateEnemies(nextStage, combatState.mode);
    const newSeen = [...new Set([...seenEnemies, ...enemies.map(e => e.name)])];
    setSeenEnemies(newSeen);
    saveGame({ seenEnemies: newSeen });

    const shuffledDeck = shuffle([...baseDeck]);
    const hand = [];
    for (let i = 0; i < GAME_RULES.CARDS_PER_TURN && shuffledDeck.length > 0; i++) {
      hand.push({ ...shuffledDeck.pop(), uid: Math.random().toString() });
    }

    player.block = 0;
    player.mana = GAME_RULES.STARTING_MANA;

    setCombatState({
      ...combatState,
      stage: nextStage,
      turn: 'PLAYER',
      player,
      enemies,
      hand,
      drawPile: shuffledDeck,
      discardPile: [],
      baseDeck,
    });

    setGameState('BATTLE');
  };

  // --- 카드 사용 ---
  const playCard = (cardIndex) => {
    if (!combatState || combatState.turn !== 'PLAYER') return;
    const card = combatState.hand[cardIndex];
    if (!card || combatState.player.mana < card.cost) return;

    setCombatState(prev => {
      let p = { ...prev.player };
      let newEnemies = prev.enemies.map(e => ({ ...e, debuffs: { ...e.debuffs } }));
      let newHand = [...prev.hand];
      let newDiscard = [...prev.discardPile];
      let newDraw = [...prev.drawPile];

      p.mana -= card.cost;

      // 피해 처리
      const dealDamage = (amt) => {
        if (newEnemies.length === 0) return;
        let target = newEnemies[0];
        let dmg = amt + (p.buffs.strength || 0);
        if (p.debuffs.weak > 0) dmg = Math.floor(dmg * 0.75);
        if (target.debuffs.vulnerable > 0) dmg = Math.floor(dmg * 1.5);
        
        if (target.block >= dmg) {
          target.block -= dmg;
        } else {
          target.hp -= (dmg - target.block);
          target.block = 0;
        }
        
        if (target.hp <= 0) {
          newEnemies.shift();
        }
      };

      // 카드 효과 적용
      if (card.damage) {
        const hits = card.multiHit || 1;
        for (let i = 0; i < hits; i++) {
          dealDamage(card.damage);
        }
      }
      if (card.block) {
        p.block += card.block + (p.buffs.dexterity || 0);
      }
      if (card.heal) {
        p.hp = Math.min(p.maxHp, p.hp + card.heal);
      }
      if (card.manaGain) {
        p.mana += card.manaGain;
      }
      if (card.selfStrength) {
        p.buffs.strength += card.selfStrength;
      }
      if (card.selfDamage) {
        p.hp -= card.selfDamage;
      }
      if (card.draw) {
        for (let i = 0; i < card.draw; i++) {
          if (newHand.length >= GAME_RULES.MAX_HAND_SIZE) break;
          if (newDraw.length === 0) {
            if (newDiscard.length === 0) break;
            newDraw = shuffle(newDiscard);
            newDiscard = [];
          }
          if (newDraw.length > 0) {
            newHand.push({ ...newDraw.pop(), uid: Math.random().toString() });
          }
        }
      }

      // 카드를 손에서 버리기
      newHand.splice(cardIndex, 1);
      newDiscard.push(card);

      return {
        ...prev,
        player: p,
        enemies: newEnemies,
        hand: newHand,
        discardPile: newDiscard,
        drawPile: newDraw,
      };
    });
  };

  // --- 턴 종료 처리 ---
  useEffect(() => {
    if (!combatState || combatState.turn !== 'ENEMY') return;

    const timeout = setTimeout(() => {
      setCombatState(prev => {
        if (!prev) return prev;
        
        let p = { ...prev.player };
        let newEnemies = prev.enemies.map(e => ({ ...e, debuffs: { ...e.debuffs } }));

        // 적 행동
        newEnemies.forEach(enemy => {
          const action = enemy.intentCard;
          if (!action) return;

          if (action.damage) {
            let dmg = action.damage;
            if (enemy.debuffs.weak > 0) dmg = Math.floor(dmg * 0.75);
            if (p.debuffs.vulnerable > 0) dmg = Math.floor(dmg * 1.5);
            
            if (p.block >= dmg) {
              p.block -= dmg;
            } else {
              p.hp -= (dmg - p.block);
              p.block = 0;
            }
          }
          if (action.block) {
            enemy.block += action.block;
          }
          if (action.heal) {
            enemy.hp = Math.min(enemy.maxHp, enemy.hp + action.heal);
          }
          if (action.selfStrength) {
            if (!enemy.buffs) enemy.buffs = { strength: 0 };
            enemy.buffs.strength = (enemy.buffs.strength || 0) + action.selfStrength;
          }

          // 다음 의도 설정
          enemy.intentCard = enemy.deck[Math.floor(Math.random() * enemy.deck.length)];
        });

        // 플레이어 사망 체크
        if (p.hp <= 0) {
          setTimeout(() => setGameState('GAME_OVER'), 500);
          return prev;
        }

        // 적 전멸 체크
        if (newEnemies.length === 0) {
          const earnedCredits = 10 + prev.stage * 2;
          setCredits(c => {
            const newCredits = c + earnedCredits;
            saveGame({ credits: newCredits });
            return newCredits;
          });
          showToast(`+${earnedCredits} 크레딧!`);

          // 특수 보스 보상
          if (SPECIAL_BOSSES[prev.stage]) {
            const specialCards = CARD_LIBRARY.filter(c => c.rarity === 'special');
            const reward = specialCards[Math.floor(Math.random() * specialCards.length)];
            setSpecialBossRewardCard(getCardDef(reward.id, shopUpgrades));
            setTimeout(() => setGameState('BOSS_CLEAR_REWARD'), 500);
            return prev;
          }

          // 100층 클리어
          if (prev.mode === 'NORMAL' && prev.stage >= 100) {
            setNormalCleared(true);
            saveGame({ normalCleared: true });
            setTimeout(() => setGameState('GAME_CLEAR'), 500);
            return prev;
          }

          setTimeout(() => setGameState('REWARDS'), 500);
          return prev;
        }

        // 새 턴 시작
        p.block = 0;
        p.mana = GAME_RULES.STARTING_MANA;

        // 디버프 감소
        if (p.debuffs.weak > 0) p.debuffs.weak--;
        if (p.debuffs.vulnerable > 0) p.debuffs.vulnerable--;
        newEnemies.forEach(e => {
          if (e.debuffs.weak > 0) e.debuffs.weak--;
          if (e.debuffs.vulnerable > 0) e.debuffs.vulnerable--;
        });

        // 카드 드로우
        let newDraw = [...prev.drawPile];
        let newDiscard = [...prev.discardPile, ...prev.hand];
        let newHand = [];

        for (let i = 0; i < GAME_RULES.CARDS_PER_TURN; i++) {
          if (newDraw.length === 0) {
            if (newDiscard.length === 0) break;
            newDraw = shuffle(newDiscard);
            newDiscard = [];
          }
          if (newDraw.length > 0) {
            newHand.push({ ...newDraw.pop(), uid: Math.random().toString() });
          }
        }

        return {
          ...prev,
          turn: 'PLAYER',
          player: p,
          enemies: newEnemies,
          hand: newHand,
          drawPile: newDraw,
          discardPile: newDiscard,
        };
      });
    }, fastMode ? 500 : 1000);

    return () => clearTimeout(timeout);
  }, [combatState?.turn, fastMode]);

  // --- 카드 필터링 ---
  const getFilteredCards = (tFilter, rFilter, query) => {
    return CARD_LIBRARY.filter(c => {
      if (rFilter !== 'all' && c.rarity !== rFilter) return false;
      if (tFilter !== 'all' && c.type !== tFilter) return false;
      if (query) {
        const q = query.toLowerCase();
        if (!c.name.toLowerCase().includes(q) && !c.desc.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  };

  // --- 가챠 ---
  const handleGacha = () => {
    if (credits < 50) {
      showToast('크레딧이 부족합니다!');
      return;
    }

    let pulled = [];
    let refund = 0;
    const validPool = CARD_LIBRARY.filter(c => c.rarity !== 'special');

    for (let i = 0; i < 3; i++) {
      const r = Math.random();
      let targetRarity = r > 0.95 ? 'rare' : r > 0.75 ? 'uncommon' : 'common';
      let pool = validPool.filter(c => c.rarity === targetRarity);
      if (pool.length === 0) pool = validPool;
      const picked = pool[Math.floor(Math.random() * pool.length)];
      pulled.push({ ...picked });
    }

    pulled.forEach(c => {
      if (unlockedCards.includes(c.id)) {
        c.isDuplicate = true;
        refund += 10;
      }
    });

    const newUnlocked = [...new Set([...unlockedCards, ...pulled.map(c => c.id)])];
    const newCredits = credits - 50 + refund;
    
    setCredits(newCredits);
    setUnlockedCards(newUnlocked);
    setGachaResult(pulled.map(c => ({ ...getCardDef(c.id, shopUpgrades), isDuplicate: c.isDuplicate })));
    saveGame({ credits: newCredits, unlockedCards: newUnlocked });
  };

  // ============================================================
  // 렌더링 함수들
  // ============================================================

  // --- 카드 렌더링 ---
  const renderCard = (card, count = null, isLocked = false, onAdd = null, onRemove = null, customClick = null) => {
    if (!card) return null;
    
    const isAtk = card.type === 'attack';
    const rarity = card.rarity;
    const border = isAtk ? 'border-red-500' : 'border-blue-500';
    
    let shadow = '';
    let nameCol = 'text-white';
    let bg = 'bg-slate-900';
    let tag = '일반';

    if (rarity === 'uncommon') {
      shadow = 'shadow-[0_0_12px_rgba(34,211,238,0.4)]';
      nameCol = 'text-cyan-300';
      tag = '희귀';
    } else if (rarity === 'rare') {
      shadow = 'shadow-[0_0_20px_rgba(250,204,21,0.6)]';
      nameCol = 'text-yellow-300';
      bg = 'legendary-bg';
      tag = '전설';
    } else if (rarity === 'special') {
      shadow = 'shadow-[0_0_25px_rgba(217,70,239,0.7)]';
      nameCol = 'text-fuchsia-300';
      bg = 'special-bg';
      tag = '특수';
    }

    if (card.isUpgraded) {
      nameCol = 'text-yellow-400';
      shadow = 'shadow-[0_0_15px_rgba(234,179,8,0.5)]';
    }

    return (
      <div
        key={card.uid || card.id}
        onClick={customClick}
        className={`border-2 p-2 rounded-xl flex flex-col justify-between relative transition-all ${
          customClick ? 'cursor-pointer hover:-translate-y-2' : ''
        } ${
          isLocked
            ? 'opacity-40 grayscale border-slate-700 bg-slate-900'
            : `${border} ${shadow} ${bg}`
        } w-full aspect-[3/4.2] max-w-[160px] mx-auto overflow-hidden shadow-2xl`}
      >
        {isLocked && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[1px]">
            <Lock size={24} className="text-slate-500 mb-2" />
            <span className="text-[10px] font-black text-yellow-500 bg-black/60 px-2 py-0.5 rounded">
              미해금
            </span>
          </div>
        )}
        <div className="z-10 flex justify-between items-start">
          <span className="font-bold text-[10px] bg-slate-800/90 px-1.5 py-0.5 rounded border border-slate-700 text-white">
            Cost {card.cost}
          </span>
          <span className="text-[9px] font-black opacity-70 uppercase tracking-tighter">{tag}</span>
        </div>
        <div className={`text-center z-10 font-black text-sm leading-tight drop-shadow-md px-1 ${nameCol}`}>
          {card.name}
        </div>
        <div className="text-[10px] text-slate-200 text-center leading-tight bg-black/60 p-2 rounded flex-1 flex items-center justify-center font-medium z-10 mt-1 border border-slate-800/50">
          <div>{card.desc}</div>
        </div>
        {count !== null && onAdd && onRemove && !isLocked && (
          <div className="mt-2 flex items-center justify-between bg-slate-800/95 border border-slate-600 px-2 py-1 rounded-lg z-20 shadow-inner">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(card.id);
              }}
              className="w-7 h-7 bg-slate-700 hover:bg-slate-600 text-white rounded-full font-black shadow-md transition-colors"
            >
              -
            </button>
            <span className="font-black text-white text-sm w-4 text-center">{count}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAdd(card.id);
              }}
              className="w-7 h-7 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-black shadow-md transition-colors"
            >
              +
            </button>
          </div>
        )}
      </div>
    );
  };

  // --- 필터 UI ---
  const renderFiltersUI = () => (
    <div className="flex flex-wrap gap-3 items-center bg-slate-800/50 p-4 rounded-2xl border border-slate-700">
      <div className="flex items-center gap-2">
        <Search size={16} className="text-slate-500" />
        <input
          type="text"
          placeholder="검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-32"
        />
      </div>
      <select
        value={filterType}
        onChange={(e) => setFilterType(e.target.value)}
        className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none"
      >
        <option value="all">모든 타입</option>
        <option value="attack">공격</option>
        <option value="skill">스킬</option>
      </select>
      <select
        value={filterRarity}
        onChange={(e) => setFilterRarity(e.target.value)}
        className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none"
      >
        <option value="all">모든 등급</option>
        <option value="common">일반</option>
        <option value="uncommon">희귀</option>
        <option value="rare">전설</option>
        <option value="special">특수</option>
      </select>
    </div>
  );

  // --- 메인 메뉴 ---
  const renderMenu = () => (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-slate-950 text-white p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-transparent to-purple-900/20 pointer-events-none" />
      
      <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-2xl">
        ROGUE TACTICS
      </h1>
      <p className="text-slate-500 font-bold tracking-[0.3em] mb-16 uppercase text-sm">
        Deck Building Card Game
      </p>

      <div className="flex flex-col gap-4 w-full max-w-md">
        <button
          onClick={() => startBattle('NORMAL', 1)}
          className="py-5 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-black text-xl shadow-2xl shadow-indigo-900/40 transition-all border-b-4 border-indigo-800 active:border-b-0 active:translate-y-1 flex items-center justify-center gap-3"
        >
          <Sword size={24} /> 노말 모드 시작
        </button>

        {normalCleared && (
          <button
            onClick={() => startBattle('HARD', 1)}
            className="py-5 bg-red-700 hover:bg-red-600 rounded-2xl font-black text-xl shadow-2xl shadow-red-900/40 transition-all border-b-4 border-red-900 active:border-b-0 active:translate-y-1 flex items-center justify-center gap-3"
          >
            <Skull size={24} /> 하드 모드 시작
          </button>
        )}

        <div className="grid grid-cols-2 gap-3 mt-4">
          <button
            onClick={() => {
              setTempDeckCounts({ ...deckCounts });
              setGameState('DECK_BUILDING');
            }}
            className="py-4 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold shadow-lg transition-all border border-slate-700 flex items-center justify-center gap-2"
          >
            <Book size={18} /> 덱 편집
          </button>
          <button
            onClick={() => setGameState('SHOP')}
            className="py-4 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold shadow-lg transition-all border border-slate-700 flex items-center justify-center gap-2"
          >
            <Store size={18} /> 상점
          </button>
          <button
            onClick={() => setGameState('ENCYCLOPEDIA')}
            className="py-4 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold shadow-lg transition-all border border-slate-700 flex items-center justify-center gap-2"
          >
            <FileQuestion size={18} /> 도감
          </button>
          <button
            onClick={() => setGameState('MONSTER_DEX')}
            className="py-4 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold shadow-lg transition-all border border-slate-700 flex items-center justify-center gap-2"
          >
            <Skull size={18} /> 몬스터
          </button>
        </div>

        <button
          onClick={() => setGameState('SETTINGS')}
          className="py-3 bg-slate-900 hover:bg-slate-800 rounded-xl font-bold transition-all border border-slate-800 flex items-center justify-center gap-2 mt-4"
        >
          <Settings size={18} /> 설정
        </button>
      </div>

      <div className="absolute bottom-6 right-6 flex items-center gap-2 bg-yellow-500/20 px-4 py-2 rounded-full border border-yellow-500/30">
        <Coins size={18} className="text-yellow-400" />
        <span className="font-black text-yellow-300">{credits}</span>
      </div>

      <div className="absolute bottom-6 left-6 text-[10px] text-slate-600 font-bold">
        MAX STAGE: {maxStageReached}
      </div>
    </div>
  );

  // --- 덱 빌더 ---
  const renderDeckBuilder = () => {
    const cards = getFilteredCards(filterType, filterRarity, searchQuery);
    
    return (
      <div className="flex flex-col min-h-[100dvh] bg-slate-900 text-white p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-3xl font-black tracking-tighter">덱 편집</h2>
          <div className="flex flex-wrap items-center gap-3">
            <span className={`text-lg font-black ${getTotalCards(tempDeckCounts) >= 10 ? 'text-green-400' : 'text-yellow-500'}`}>
              TOTAL: {getTotalCards(tempDeckCounts)} / 20
            </span>
            <button
              onClick={() => setTempDeckCounts({})}
              className="px-3 py-2 bg-red-900/50 text-red-400 rounded-lg font-bold border border-red-900 hover:bg-red-900 hover:text-white transition-all"
            >
              <Eraser size={16} />
            </button>
            <button
              onClick={() => {
                if (getTotalCards(tempDeckCounts) < 10) {
                  showToast('최소 10장의 카드가 필요합니다!');
                  return;
                }
                setDeckCounts(tempDeckCounts);
                saveGame({ deckCounts: tempDeckCounts });
                showToast('덱이 저장되었습니다!');
              }}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold shadow-lg border-b-4 border-emerald-800"
            >
              저장
            </button>
            <button
              onClick={() => setGameState('MENU')}
              className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold border-b-4 border-slate-900"
            >
              뒤로
            </button>
          </div>
        </div>

        <div className="mb-6">{renderFiltersUI()}</div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5 overflow-y-auto pb-20 custom-scroll">
          {cards.map((c) => {
            const count = tempDeckCounts[c.id] || 0;
            const isLocked = !unlockedCards.includes(c.id);
            return (
              <div key={c.id}>
                {renderCard(getCardDef(c.id, shopUpgrades), count, isLocked, handleAddCard, handleRemoveCard)}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // --- 상점 ---
  const renderShop = () => (
    <div className="flex flex-col min-h-[100dvh] bg-slate-900 text-white p-4">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-black flex items-center gap-3 tracking-tighter">
          <Store size={32} className="text-yellow-400" /> 상점
        </h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-yellow-500/20 px-4 py-2 rounded-full border border-yellow-500/30">
            <Coins size={18} className="text-yellow-400" />
            <span className="font-black text-yellow-300">{credits}</span>
          </div>
          <button
            onClick={() => setGameState('MENU')}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold shadow-lg"
          >
            메인으로
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto w-full">
        {/* 가챠 */}
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <Gift size={24} className="text-purple-400" />
            <h3 className="text-xl font-black">카드 가챠</h3>
          </div>
          <p className="text-sm text-slate-400 mb-4">3장의 랜덤 카드를 획득합니다. 중복 시 10 크레딧 환불.</p>
          <button
            onClick={handleGacha}
            disabled={credits < 50}
            className={`w-full py-3 rounded-xl font-bold transition-all ${
              credits >= 50
                ? 'bg-purple-600 hover:bg-purple-500 shadow-lg'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
            }`}
          >
            50 크레딧
          </button>
        </div>

        {/* 체력 업그레이드 */}
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <Heart size={24} className="text-red-400" />
            <h3 className="text-xl font-black">최대 체력 +10</h3>
          </div>
          <p className="text-sm text-slate-400 mb-2">현재 보너스: +{(shopUpgrades.maxHp || 0) * 10} HP</p>
          <p className="text-xs text-slate-500 mb-4">영구적으로 최대 체력이 증가합니다.</p>
          <button
            onClick={() => {
              if (credits < 100) {
                showToast('크레딧이 부족합니다!');
                return;
              }
              const newUpgrades = { ...shopUpgrades, maxHp: (shopUpgrades.maxHp || 0) + 1 };
              const newCredits = credits - 100;
              setShopUpgrades(newUpgrades);
              setCredits(newCredits);
              saveGame({ shopUpgrades: newUpgrades, credits: newCredits });
              showToast('체력이 증가했습니다!');
            }}
            disabled={credits < 100}
            className={`w-full py-3 rounded-xl font-bold transition-all ${
              credits >= 100
                ? 'bg-red-600 hover:bg-red-500 shadow-lg'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
            }`}
          >
            100 크레딧
          </button>
        </div>
      </div>

      {/* 가챠 결과 모달 */}
      {gachaResult && (
        <div
          className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center p-4 backdrop-blur-md"
          onClick={() => setGachaResult(null)}
        >
          <div
            className="bg-slate-800 p-8 rounded-3xl max-w-4xl w-full border-2 border-purple-500/50 shadow-2xl animate-draw"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-3xl font-black text-center mb-8 text-purple-400">가챠 결과!</h3>
            <div className="flex flex-wrap justify-center gap-6 mb-8">
              {gachaResult.map((card, idx) => (
                <div key={idx} className="relative">
                  {renderCard(card)}
                  {card.isDuplicate && (
                    <div className="absolute -top-2 -right-2 bg-yellow-500 text-black px-2 py-0.5 rounded-full text-[10px] font-black">
                      중복 +10
                    </div>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={() => setGachaResult(null)}
              className="w-full py-4 bg-purple-600 hover:bg-purple-500 rounded-2xl font-black text-lg"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // --- 카드 도감 ---
  const renderEncyclopedia = () => {
    const cards = getFilteredCards(filterType, filterRarity, searchQuery);
    
    return (
      <div className="flex flex-col min-h-[100dvh] bg-slate-900 text-white p-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-black flex items-center gap-3 tracking-tighter">
            <Book size={32} className="text-blue-400" /> 카드 도감
          </h2>
          <button
            onClick={() => setGameState('MENU')}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold shadow-lg"
          >
            메인으로
          </button>
        </div>

        <div className="mb-6">{renderFiltersUI()}</div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 overflow-y-auto pb-20 custom-scroll">
          {cards.map((c) => renderCard(getCardDef(c.id, shopUpgrades), null, !unlockedCards.includes(c.id)))}
        </div>
      </div>
    );
  };

  // --- 몬스터 도감 ---
  const renderMonsterDex = () => {
    const allMonsters = [...ENEMIES, ...NORMAL_BOSSES, ...Object.values(SPECIAL_BOSSES)];
    
    return (
      <div className="flex flex-col min-h-[100dvh] bg-slate-900 text-white p-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-black flex items-center gap-3 tracking-tighter">
            <Skull size={32} className="text-red-500" /> 몬스터 도감
          </h2>
          <button
            onClick={() => setGameState('MENU')}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold shadow-lg"
          >
            메인으로
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 overflow-y-auto pb-20 custom-scroll">
          {allMonsters.map((m, i) => {
            const seen = seenEnemies.includes(m.name);
            return (
              <div
                key={i}
                onClick={() => seen && setDexViewingEnemy(m)}
                className={`p-6 rounded-2xl border-2 transition-all group ${
                  seen
                    ? 'cursor-pointer hover:bg-slate-800 border-slate-700 hover:border-red-500 bg-slate-800/50 shadow-xl'
                    : 'border-slate-800 bg-slate-950/50 opacity-40'
                }`}
              >
                {seen ? (
                  <>
                    <div className="flex items-center gap-4 mb-4 border-b border-slate-700 pb-4">
                      <div className={`p-3 rounded-full ${m.baseHp > 100 ? 'bg-red-900/30' : 'bg-slate-700/30'}`}>
                        <Skull className={m.baseHp > 100 ? 'text-red-400' : 'text-slate-400'} size={24} />
                      </div>
                      <div>
                        <div className="font-black text-lg group-hover:text-red-400 transition-colors">{m.name}</div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                          Base HP: {m.baseHp}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {m.deck.map((s, si) => (
                        <span
                          key={si}
                          className="text-[9px] bg-slate-900 px-2 py-1 rounded-md border border-slate-700 font-bold text-slate-400"
                        >
                          {s.name}
                        </span>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 opacity-20">
                    <Skull size={48} className="mb-2" />
                    <div className="font-black tracking-[0.3em]">UNKNOWN</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 몬스터 상세 모달 */}
        {dexViewingEnemy && (
          <div
            className="fixed inset-0 bg-black/95 z-[9999] flex items-center justify-center p-4 backdrop-blur-md animate-draw"
            onClick={() => setDexViewingEnemy(null)}
          >
            <div
              className="bg-slate-800 p-8 rounded-3xl max-w-3xl w-full border-2 border-red-600/50 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-8 border-b border-slate-700 pb-6">
                <div>
                  <h3 className="text-3xl font-black text-red-500 tracking-tighter">{dexViewingEnemy.name}</h3>
                  <div className="text-slate-400 font-bold mt-2 flex items-center gap-2">
                    <Heart size={14} className="text-red-600" /> Base HP: {dexViewingEnemy.baseHp}
                  </div>
                </div>
                <button
                  onClick={() => setDexViewingEnemy(null)}
                  className="p-3 hover:bg-slate-700 rounded-full transition-colors border border-slate-700"
                >
                  닫기
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto custom-scroll">
                {dexViewingEnemy.deck.map((s, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-xl border ${
                      s.type === 'attack' ? 'bg-red-950/20 border-red-900/30' : 'bg-slate-900 border-slate-700'
                    }`}
                  >
                    <div className="font-black text-indigo-400 text-sm mb-2 flex justify-between items-center">
                      {s.name}
                      <span className="text-[9px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-500 uppercase">
                        {s.type}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-300 leading-relaxed font-medium">{s.desc}</div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setDexViewingEnemy(null)}
                className="w-full mt-10 py-4 bg-red-700 hover:bg-red-600 rounded-2xl font-black text-lg shadow-xl"
              >
                닫기
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // --- 설정 ---
  const renderSettings = () => (
    <div className="flex flex-col min-h-[100dvh] bg-slate-900 text-white p-6 md:p-20">
      <div className="max-w-2xl mx-auto w-full">
        <h2 className="text-4xl font-black mb-12 flex items-center gap-4 tracking-tighter">
          <Settings size={40} className="text-slate-500" /> 설정
        </h2>

        <div className="space-y-6">
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 flex justify-between items-center shadow-xl">
            <div>
              <div className="font-black text-lg">빠른 전투 모드</div>
              <div className="text-xs text-slate-500">애니메이션 및 턴 전환 속도 증가</div>
            </div>
            <button
              onClick={() => {
                setFastMode(!fastMode);
                saveGame({ fastMode: !fastMode });
              }}
              className={`w-14 h-8 rounded-full transition-all relative ${fastMode ? 'bg-indigo-600' : 'bg-slate-600'}`}
            >
              <div
                className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-all ${
                  fastMode ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>

          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
            <div className="font-black text-lg mb-4 uppercase tracking-widest text-indigo-400">데이터 관리</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={handleExport}
                className="py-4 bg-slate-700 hover:bg-indigo-600 rounded-xl font-bold flex items-center justify-center gap-3 transition-all"
              >
                <Download size={20} /> 내보내기
              </button>
              <button
                onClick={() => setImportModalOpen(true)}
                className="py-4 bg-slate-700 hover:bg-indigo-600 rounded-xl font-bold flex items-center justify-center gap-3 transition-all"
              >
                <Upload size={20} /> 가져오기
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={() => setGameState('MENU')}
          className="mt-12 w-full py-4 bg-slate-800 hover:bg-slate-700 rounded-2xl font-black tracking-[0.2em] border border-slate-700 transition-all"
        >
          메인으로
        </button>
      </div>
    </div>
  );

  // --- 전투 화면 ---
  const renderBattle = () => {
    if (!combatState) return null;
    
    const { player, enemies, hand, turn, stage, drawPile, discardPile, baseDeck, mode } = combatState;
    const isPlayerTurn = turn === 'PLAYER';

    return (
      <div className="flex flex-col h-[100dvh] bg-slate-950 text-white p-2 md:p-4 overflow-hidden relative">
        {/* 상단 정보 패널 */}
        <div className="flex justify-between items-center bg-slate-900/90 backdrop-blur-md p-3 md:px-6 rounded-2xl border border-white/5 shadow-2xl z-30">
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-0.5">Stage</span>
              <div className="text-xl font-black text-white bg-indigo-600/20 px-3 py-0.5 rounded-lg border border-indigo-500/30">
                {stage}
              </div>
            </div>
            <div className="hidden md:flex flex-col">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Mode</span>
              <span className={`text-xs font-black ${mode === 'HARD' ? 'text-red-500' : 'text-emerald-500'}`}>
                {mode}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div
              className="flex flex-col items-end cursor-pointer group"
              onClick={() => setViewingPile('baseDeck')}
            >
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest group-hover:text-white transition-colors">
                Deck
              </span>
              <span className="text-sm font-black text-slate-300 group-hover:text-indigo-400">
                {baseDeck.length} cards
              </span>
            </div>
            <button
              onClick={() => setGameState('GAME_OVER')}
              className="bg-red-950/40 text-red-500 px-4 py-2 rounded-xl text-xs font-black border border-red-900/30 hover:bg-red-600 hover:text-white transition-all shadow-lg"
            >
              포기
            </button>
          </div>
        </div>

        {/* 메인 전투 무대 */}
        <div className="flex-1 flex flex-row justify-between items-center max-w-7xl mx-auto w-full px-6 relative z-10">
          {/* 플레이어 */}
          <div
            className={`flex flex-col items-center transition-all duration-700 ${
              isPlayerTurn ? 'scale-110' : 'opacity-40 scale-90'
            }`}
          >
            <div className="w-28 h-28 md:w-40 md:h-40 bg-slate-800 rounded-full border-4 border-indigo-500 shadow-[0_0_50px_rgba(79,70,229,0.4)] flex items-center justify-center relative mb-6">
              <Shield size={64} className="text-indigo-400" />
              {player.block > 0 && (
                <div className="absolute -top-3 -right-3 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center font-black border-4 border-blue-300 shadow-2xl animate-bounce text-lg">
                  {player.block}
                </div>
              )}
            </div>
            <div className="flex flex-col items-center">
              <div className="w-40 md:w-56 bg-slate-900 h-6 rounded-full border-2 border-slate-800 overflow-hidden relative shadow-2xl p-0.5">
                <div
                  className="bg-gradient-to-r from-emerald-600 to-green-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(player.hp / player.maxHp) * 100}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white drop-shadow-md">
                  {player.hp} / {player.maxHp}
                </div>
              </div>
              <div className="mt-4 flex gap-2 h-8 flex-wrap justify-center">
                {player.buffs.strength > 0 && (
                  <div className="bg-red-950/80 text-red-400 px-3 py-1 rounded-lg text-[10px] font-black border border-red-500/50 shadow-lg flex items-center gap-1">
                    <Zap size={10} /> STR {player.buffs.strength}
                  </div>
                )}
                {player.buffs.dexterity > 0 && (
                  <div className="bg-blue-950/80 text-blue-400 px-3 py-1 rounded-lg text-[10px] font-black border border-blue-500/50 shadow-lg flex items-center gap-1">
                    <Shield size={10} /> DEX {player.buffs.dexterity}
                  </div>
                )}
                {player.debuffs.weak > 0 && (
                  <div className="bg-orange-950/80 text-orange-400 px-3 py-1 rounded-lg text-[10px] font-black border border-orange-500/50 shadow-lg animate-pulse">
                    WEAK {player.debuffs.weak}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="text-4xl font-black italic text-slate-800 tracking-tighter opacity-50 px-4">VS</div>

          {/* 적 */}
          <div className="flex gap-8 items-end">
            {enemies.map((e, idx) => {
              const intent = e.intentCard;
              const isTarget = idx === 0;
              return (
                <div
                  key={e.uid}
                  className={`flex flex-col items-center transition-all duration-500 ${
                    isTarget ? 'scale-100' : 'scale-75 opacity-40 translate-x-10'
                  }`}
                >
                  {isTarget && (
                    <div className="text-red-500 font-black text-xs animate-bounce mb-4 tracking-[0.4em]">TARGET</div>
                  )}

                  {/* 의도 표시 */}
                  {intent && (
                    <div
                      className={`mb-6 p-3 bg-slate-900 border-2 rounded-2xl text-center w-28 md:w-36 shadow-2xl relative ${
                        intent.type === 'attack' ? 'border-red-600' : 'border-blue-600'
                      }`}
                    >
                      <div className="text-[11px] font-black text-white truncate mb-1">{intent.name}</div>
                      <div className="text-[9px] text-slate-400 leading-tight font-bold">{intent.desc}</div>
                    </div>
                  )}

                  <div
                    className={`w-24 h-24 md:w-36 md:h-36 bg-red-950/20 rounded-full border-4 flex items-center justify-center relative mb-4 transition-all duration-700 ${
                      isTarget ? 'border-red-600 shadow-[0_0_40px_rgba(220,38,38,0.4)]' : 'border-slate-800'
                    }`}
                  >
                    <Skull size={isTarget ? 56 : 32} className={isTarget ? 'text-red-500' : 'text-slate-700'} />
                    {e.block > 0 && (
                      <div className="absolute -top-2 -right-2 w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center font-black border-2 border-slate-500 text-xs shadow-xl">
                        {e.block}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-center w-full">
                    <div className="w-28 md:w-40 bg-slate-900 h-4 rounded-full border border-slate-800 overflow-hidden relative mb-2 shadow-inner">
                      <div
                        className="bg-gradient-to-r from-red-800 to-red-500 h-full transition-all duration-500"
                        style={{ width: `${(e.hp / e.maxHp) * 100}%` }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center text-[9px] font-black tracking-tighter">
                        {e.hp} / {e.maxHp}
                      </div>
                    </div>
                    <div className="text-[11px] font-black text-slate-400 tracking-tight">
                      {e.name} {e.isBoss && <span className="text-red-600 ml-1">BOSS</span>}
                    </div>

                    <div className="flex gap-1 mt-2 h-5">
                      {e.debuffs.vulnerable > 0 && (
                        <span className="bg-purple-900/50 text-purple-400 px-2 py-0.5 rounded text-[8px] font-black border border-purple-500/30 animate-pulse">
                          VULN {e.debuffs.vulnerable}
                        </span>
                      )}
                      {e.debuffs.weak > 0 && (
                        <span className="bg-orange-900/50 text-orange-400 px-2 py-0.5 rounded text-[8px] font-black border border-orange-500/30">
                          WEAK {e.debuffs.weak}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 하단 UI */}
        <div className="h-64 flex flex-col items-center justify-end pb-6 relative z-30 mt-auto">
          <div className="flex items-center gap-4 md:gap-14 w-full max-w-6xl px-4 md:px-12 relative h-full">
            {/* 마나 및 드로우 파일 */}
            <div className="flex flex-col items-center gap-6 shrink-0 h-full justify-center">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 md:w-24 md:h-24 bg-blue-950 border-4 border-blue-400 rounded-full flex flex-col items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.5)] relative">
                  <span className="text-xs font-black text-blue-300 uppercase tracking-tighter mb-[-4px]">Mana</span>
                  <span className="text-3xl md:text-5xl font-black text-white">{player.mana}</span>
                </div>
              </div>
              <div
                className="flex flex-col items-center gap-1 cursor-pointer group"
                onClick={() => setViewingPile('drawPile')}
              >
                <div className="w-12 h-16 bg-slate-800 border-2 border-slate-700 rounded-xl flex items-center justify-center font-black text-lg group-hover:-translate-y-2 group-hover:border-indigo-500 transition-all shadow-xl">
                  {drawPile.length}
                </div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-indigo-400 transition-colors">
                  Draw
                </span>
              </div>
            </div>

            {/* 카드 핸드 */}
            <div className="flex-1 flex justify-center items-end h-full pb-2 -space-x-8 md:-space-x-12 px-4 md:px-8 overflow-visible">
              {hand.map((c, i) => {
                const canPlay = player.mana >= c.cost && isPlayerTurn;
                const isHov = hoveredCard === i;

                let preDmg = (c.damage || 0) + (player.buffs.strength || 0);
                if (enemies[0]?.debuffs.vulnerable > 0) preDmg = Math.floor(preDmg * 1.5);
                if (player.debuffs.weak > 0) preDmg = Math.floor(preDmg * 0.75);

                return (
                  <div
                    key={c.uid}
                    onMouseEnter={() => setHoveredCard(i)}
                    onMouseLeave={() => setHoveredCard(null)}
                    onClick={() => canPlay && playCard(i)}
                    className={`relative transition-all duration-300 ease-out cursor-pointer origin-bottom ${
                      canPlay ? 'hover:z-50' : 'opacity-40 grayscale-[0.5]'
                    } ${isHov ? '-translate-y-16 scale-125 z-[100]' : 'translate-y-0 z-10'}`}
                    style={{
                      transform: isHov
                        ? 'translateY(-60px) scale(1.25)'
                        : `rotate(${(i - (hand.length - 1) / 2) * 3}deg) translateY(${
                            Math.abs(i - (hand.length - 1) / 2) * 4
                          }px)`,
                    }}
                  >
                    {isHov && preDmg > 0 && (
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-red-600 text-white font-black text-[10px] px-3 py-1 rounded-full whitespace-nowrap shadow-2xl border-2 border-red-400 animate-bounce">
                        ⚔️ {c.multiHit ? `${preDmg} x ${c.multiHit}` : preDmg}
                      </div>
                    )}
                    <div className="pointer-events-none transition-transform duration-300 shadow-[0_20px_40px_rgba(0,0,0,0.5)] rounded-xl">
                      {renderCard(c)}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 턴 종료 및 버리기 파일 */}
            <div className="flex flex-col items-center gap-6 shrink-0 h-full justify-center">
              <button
                onClick={() => setCombatState((p) => ({ ...p, turn: 'ENEMY' }))}
                disabled={!isPlayerTurn}
                className={`px-8 py-4 rounded-2xl font-black text-sm md:text-xl shadow-2xl transition-all border-b-8 active:border-b-0 active:translate-y-1 group ${
                  isPlayerTurn
                    ? 'bg-amber-600 hover:bg-amber-500 border-amber-800 text-white shadow-amber-900/40'
                    : 'bg-slate-800 border-slate-900 text-slate-600 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-3">
                  {isPlayerTurn ? (
                    <ArrowRightCircle className="group-hover:translate-x-1 transition-transform" />
                  ) : (
                    <RefreshCw className="animate-spin" size={20} />
                  )}
                  <span>{isPlayerTurn ? '턴 종료' : '대기중'}</span>
                </div>
              </button>
              <div
                className="flex flex-col items-center gap-1 cursor-pointer group"
                onClick={() => setViewingPile('discardPile')}
              >
                <div className="w-12 h-16 bg-slate-900 border-2 border-slate-800 rounded-xl flex items-center justify-center font-black text-lg opacity-60 group-hover:opacity-100 group-hover:border-red-900/50 group-hover:-translate-y-2 transition-all shadow-xl">
                  {discardPile.length}
                </div>
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest group-hover:text-red-500 transition-colors">
                  Discard
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 덱 확인 모달 */}
        {viewingPile && (
          <div
            className="fixed inset-0 bg-black/90 z-[200] flex items-center justify-center p-6 backdrop-blur-md animate-draw"
            onClick={() => setViewingPile(null)}
          >
            <div
              className="bg-slate-800 p-8 rounded-3xl max-w-6xl w-full max-h-[85vh] border-2 border-white/10 shadow-2xl overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-8 border-b border-slate-700 pb-6 shrink-0">
                <h3 className="text-3xl font-black tracking-tighter uppercase">
                  {viewingPile === 'baseDeck'
                    ? '전체 덱'
                    : viewingPile === 'drawPile'
                    ? '드로우 파일'
                    : '버린 카드'}
                </h3>
                <button
                  onClick={() => setViewingPile(null)}
                  className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold"
                >
                  닫기
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 overflow-y-auto custom-scroll pb-10">
                {(viewingPile === 'baseDeck'
                  ? baseDeck
                  : viewingPile === 'drawPile'
                  ? drawPile
                  : discardPile
                ).map((c, i) => (
                  <div key={i} className="scale-95 hover:scale-100 transition-transform">
                    {renderCard(c)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // --- 보상 화면 ---
  const renderRewards = () => (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-slate-950 text-white p-4">
      <h2 className="text-5xl font-black mb-2 text-yellow-400 tracking-tighter">승리!</h2>
      <p className="text-slate-500 font-bold tracking-widest mb-16 uppercase">보상을 선택하세요</p>

      <div className="flex flex-col md:flex-row gap-8 max-w-5xl w-full justify-center">
        <div
          onClick={() => {
            const pool = CARD_LIBRARY.filter((c) => c.rarity !== 'special');
            const res = [];
            for (let i = 0; i < 3; i++) {
              const picked = pool[Math.floor(Math.random() * pool.length)];
              res.push(getCardDef(picked.id, shopUpgrades));
            }
            setRewardCards(res);
            setGameState('REWARD_CARD');
          }}
          className="p-10 bg-slate-900 border-2 border-indigo-500 rounded-3xl flex flex-col items-center flex-1 hover:scale-105 hover:bg-indigo-950/20 transition-all cursor-pointer group shadow-2xl"
        >
          <PlusCircle size={64} className="text-indigo-400 mb-6 group-hover:rotate-90 transition-transform duration-500" />
          <span className="text-2xl font-black mb-2">카드 추가</span>
          <span className="text-sm text-slate-500 text-center">덱에 새 카드를 추가합니다</span>
        </div>

        <div
          onClick={() => {
            const p = { ...combatState.player };
            p.hp = Math.min(p.maxHp, p.hp + Math.floor(p.maxHp * 0.3));
            p.debuffs = { weak: 0, vulnerable: 0 };
            startNextStage(p, combatState.baseDeck);
          }}
          className="p-10 bg-slate-900 border-2 border-emerald-500 rounded-3xl flex flex-col items-center flex-1 hover:scale-105 hover:bg-emerald-950/20 transition-all cursor-pointer group shadow-2xl"
        >
          <Heart size={64} className="text-emerald-400 mb-6 group-hover:scale-110 transition-transform" />
          <span className="text-2xl font-black mb-2">회복</span>
          <span className="text-sm text-slate-500 text-center">30% HP 회복 및 디버프 해제</span>
        </div>

        <div
          onClick={() => setGameState('REWARD_REMOVE')}
          className="p-10 bg-slate-900 border-2 border-red-500 rounded-3xl flex flex-col items-center flex-1 hover:scale-105 hover:bg-red-950/20 transition-all cursor-pointer group shadow-2xl"
        >
          <Trash2 size={64} className="text-red-500 mb-6 group-hover:animate-bounce" />
          <span className="text-2xl font-black mb-2">카드 삭제</span>
          <span className="text-sm text-slate-500 text-center">덱에서 카드 1장을 영구 삭제</span>
        </div>
      </div>
    </div>
  );

  // --- 카드 추가 선택 ---
  const renderRewardCard = () => (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-slate-950 text-white p-4 relative">
      <div className="flex justify-between items-center mb-12 w-full max-w-5xl px-6">
        <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-indigo-400">카드 선택</h2>
        <button
          onClick={() => setGameState('REWARDS')}
          className="px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold border border-slate-700 shadow-lg transition-all"
        >
          뒤로
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8 justify-center w-full max-w-5xl px-4 animate-draw">
        {rewardCards.filter(Boolean).map((card, idx) => {
          const isNew = !unlockedCards.includes(card.id);
          return (
            <div key={idx} className="relative group scale-110 md:scale-125 mx-4">
              {renderCard(card, null, false, null, null, () => setConfirmSelection({ action: 'add', card, isNew }))}
              {isNew && (
                <div className="absolute -top-4 -right-4 bg-yellow-500 text-black px-3 py-1 rounded-full font-black text-[10px] shadow-lg animate-bounce z-30">
                  NEW
                </div>
              )}
            </div>
          );
        })}
      </div>

      {confirmSelection?.action === 'add' && (
        <div className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center p-4 backdrop-blur-xl">
          <div className="bg-slate-900 p-10 rounded-[3rem] border-2 border-indigo-500/50 w-full max-w-md text-center shadow-2xl animate-draw flex flex-col items-center">
            <h3 className="text-2xl font-black mb-8 tracking-tight">이 카드를 덱에 추가하시겠습니까?</h3>
            <div className="flex justify-center mb-10 pointer-events-none scale-125 shadow-2xl">
              {renderCard(confirmSelection.card)}
            </div>
            <div className="flex gap-4 w-full">
              <button
                onClick={() => setConfirmSelection(null)}
                className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 rounded-2xl font-bold transition-all border border-white/5"
              >
                취소
              </button>
              <button
                onClick={() => {
                  const newDeck = [...combatState.baseDeck, { ...confirmSelection.card }];
                  if (confirmSelection.isNew) {
                    const newUnlocked = [...unlockedCards, confirmSelection.card.id];
                    setUnlockedCards(newUnlocked);
                    saveGame({ unlockedCards: newUnlocked });
                  }
                  setConfirmSelection(null);
                  startNextStage(combatState.player, newDeck);
                }}
                className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-black shadow-xl shadow-indigo-900/40"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // --- 카드 삭제 선택 ---
  const renderRewardRemove = () => (
    <div className="flex flex-col min-h-[100dvh] bg-slate-950 text-white p-4 md:p-10 relative">
      <div className="flex justify-between items-center mb-10 w-full max-w-7xl mx-auto px-4 pt-10 md:pt-0">
        <h2 className="text-3xl font-black text-red-500 tracking-tighter uppercase">카드 삭제</h2>
        <button
          onClick={() => setGameState('REWARDS')}
          className="px-6 py-2 bg-slate-800 rounded-xl font-bold border border-slate-700 shadow-md"
        >
          취소
        </button>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 overflow-y-auto hide-scrollbar pb-20 max-w-7xl mx-auto px-4">
        {combatState.baseDeck.map((card, idx) => (
          <div
            key={idx}
            className="relative group cursor-pointer aspect-[3/4.2] shrink-0 transition-transform hover:-translate-y-2"
            onClick={() => setConfirmSelection({ action: 'remove', idx, card })}
          >
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
            <h3 className="text-2xl font-black mb-2 text-white">정말 삭제하시겠습니까?</h3>
            <p className="text-xs text-slate-500 font-bold mb-8 tracking-widest uppercase">
              이 작업은 되돌릴 수 없습니다
            </p>
            <div className="flex justify-center mb-10 pointer-events-none scale-110 grayscale-[0.5]">
              {renderCard(confirmSelection.card)}
            </div>
            <div className="flex gap-4 w-full">
              <button
                onClick={() => setConfirmSelection(null)}
                className="flex-1 py-4 bg-slate-800 rounded-2xl font-bold"
              >
                취소
              </button>
              <button
                onClick={() => {
                  const newDeck = [...combatState.baseDeck];
                  newDeck.splice(confirmSelection.idx, 1);
                  setConfirmSelection(null);
                  startNextStage(combatState.player, newDeck);
                }}
                className="flex-1 py-4 bg-red-700 hover:bg-red-600 rounded-2xl font-black shadow-lg shadow-red-900/40"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // --- 특수 보스 보상 ---
  const renderBossClearReward = () => {
    if (!specialBossRewardCard) return null;
    return (
      <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-slate-950 text-white p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-fuchsia-600/10 animate-pulse pointer-events-none" />
        <h2 className="text-5xl md:text-6xl font-black mb-4 text-fuchsia-400 tracking-tighter drop-shadow-[0_0_30px_fuchsia] animate-bounce">
          전설 카드 획득!
        </h2>
        <p className="text-slate-400 font-bold tracking-[0.3em] mb-16 uppercase">보스가 특별한 카드를 드롭했습니다</p>

        <div className="relative group w-64 h-80 mb-16 animate-draw">
          <div className="pointer-events-none w-full h-full scale-[1.7] origin-center shadow-[0_0_60px_rgba(217,70,239,0.3)]">
            {renderCard(specialBossRewardCard)}
          </div>
        </div>

        <button
          onClick={() => {
            const isOwned = unlockedCards.includes(specialBossRewardCard.id);
            const newUnlocked = isOwned ? unlockedCards : [...unlockedCards, specialBossRewardCard.id];
            setCombatState((prev) => ({
              ...prev,
              baseDeck: [...prev.baseDeck, { ...specialBossRewardCard }],
            }));
            setUnlockedCards(newUnlocked);
            saveGame({ unlockedCards: newUnlocked });
            setSpecialBossRewardCard(null);

            if (combatState.mode === 'NORMAL' && combatState.stage >= 100) {
              setGameState('GAME_CLEAR');
            } else {
              setGameState('REWARDS');
            }
          }}
          className="px-16 py-5 bg-fuchsia-700 hover:bg-fuchsia-600 rounded-full font-black text-2xl transition-all shadow-[0_0_40px_rgba(217,70,239,0.6)] border-b-8 border-fuchsia-900 active:border-b-0 active:translate-y-2 mt-12"
        >
          획득하기
        </button>
      </div>
    );
  };

  // --- 게임 오버 ---
  const renderGameOver = () => (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-black text-white p-4">
      <Skull size={120} className="text-red-700 mb-8 drop-shadow-[0_0_30px_red] animate-pulse" />
      <h1 className="text-7xl font-black text-red-600 tracking-tighter mb-4">패배</h1>
      <div className="text-xl font-bold text-slate-500 tracking-widest uppercase mb-16 flex items-center gap-4">
        도달 스테이지{' '}
        <span className="text-white bg-red-900/50 px-4 py-1 rounded-lg border border-red-500/30">
          {combatState?.stage}
        </span>
      </div>
      <button
        onClick={() => setGameState('MENU')}
        className="px-12 py-5 bg-white text-black rounded-2xl font-black text-xl hover:bg-slate-200 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] active:scale-95"
      >
        메인으로 돌아가기
      </button>
    </div>
  );

  // --- 게임 클리어 ---
  const renderGameClear = () => (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-slate-950 text-white p-4 relative">
      <Trophy size={150} className="text-yellow-400 mb-8 animate-bounce" />
      <h1 className="text-7xl font-black text-yellow-600 mb-6 text-center">축하합니다!</h1>
      <p className="text-xl text-slate-400 mb-12">100층을 클리어했습니다!</p>
      <button
        onClick={() => setGameState('MENU')}
        className="px-16 py-6 bg-yellow-600 text-black rounded-3xl font-black text-2xl"
      >
        메인으로
      </button>
    </div>
  );

  // ============================================================
  // 메인 렌더
  // ============================================================
  return (
    <>
      <style>{styles}</style>
      <div
        id="game-root"
        className={`font-sans antialiased selection:bg-indigo-500 selection:text-white ${
          isCssFullScreen
            ? 'fixed inset-0 z-[999999] w-[100vw] h-[100vh] overflow-auto bg-slate-950'
            : 'bg-slate-900 min-h-screen'
        }`}
      >
        {/* 토스트 메시지 */}
        {toastMsg && (
          <div className="fixed top-12 left-1/2 -translate-x-1/2 bg-green-600 px-8 py-4 rounded-full shadow-[0_0_30px_rgba(22,163,74,0.4)] font-black z-[10000] animate-pulse text-white text-sm border-2 border-white/20 backdrop-blur-md flex items-center gap-3">
            <Zap size={18} fill="currentColor" /> {toastMsg}
          </div>
        )}

        {/* 화면 라우팅 */}
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

        {/* 데이터 가져오기 모달 */}
        {importModalOpen && (
          <div className="fixed inset-0 bg-black/90 z-[10000] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-slate-800 p-8 rounded-3xl w-full max-w-lg border-2 border-slate-700 shadow-2xl animate-draw">
              <h3 className="text-2xl font-black mb-2 flex items-center gap-2">
                <Upload className="text-indigo-400" /> 데이터 가져오기
              </h3>
              <p className="text-xs text-slate-500 mb-6 font-bold uppercase tracking-widest">
                세이브 코드를 붙여넣으세요
              </p>
              <textarea
                className="w-full h-40 bg-slate-950 border-2 border-slate-800 rounded-2xl p-4 text-white text-[10px] font-mono mb-6 focus:border-indigo-500 outline-none transition-colors shadow-inner"
                placeholder="코드를 여기에 붙여넣으세요..."
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setImportModalOpen(false)}
                  className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold transition-all"
                >
                  취소
                </button>
                <button
                  onClick={() => handleImport(importText)}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-black shadow-lg shadow-indigo-900/40 transition-all"
                >
                  불러오기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
