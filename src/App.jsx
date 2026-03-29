import React, { useState, useEffect } from 'react';
import { Sword, Shield, Zap, Heart, RefreshCw, Skull, ArrowRightCircle, Lock, Save, PlusCircle, Trash2, Store, Coins, AlertTriangle, Info, Maximize, Gift, Book, Trophy, Settings, FastForward, Eraser, Download, Upload, Search, HelpCircle, FileQuestion, Star, Terminal } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

// 오직 순수 데이터와 로직만 외부에서 가져옵니다.
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

// 글로벌 애니메이션 및 세밀한 스타일 (이전 버전의 퀄리티 완전 복구)
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
  
  /* --- 툴팁(i 아이콘) 무조건 최상단 노출 패치 --- */
  .tooltip-trigger {
    position: relative;
    z-index: 50; /* i 아이콘 자체가 위로 올라오게 */
  }
  .tooltip-trigger .tooltip-content {
    visibility: hidden; 
    opacity: 0; 
    transition: opacity 0.2s;
    position: absolute;
    z-index: 99999; /* 말풍선이 우주 끝까지 뚫고 나오게 설정! */
  }
  
  .tooltip-trigger:hover .tooltip-content,
  .tooltip-trigger:focus .tooltip-content,
  .tooltip-trigger:focus-within .tooltip-content,
  .tooltip-trigger:active .tooltip-content {
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
  }
  #game-root {
    width: 100%;
    min-height: 100dvh;
    overflow-x: hidden;
  }
`;

const MAX_HAND_SIZE = 10;

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

  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => {
        setToastMsg('');
      }, 2500); // 2500 = 2.5초 (원하는 시간으로 조절 가능)
      return () => clearTimeout(timer);
    }
  }, [toastMsg]);

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
        console.log("종료 신호 감지: 자동 저장 시작");
        saveGame({
          deckCounts,
          unlockedCards,
          credits,
          shopUpgrades,
          normalCleared,
          fastMode,
          maxStageReached,
          usedCoupons,
          seenEnemies
        });
      };

      ipcRenderer.on('save-request', handleSaveRequest);
      
      return () => {
        ipcRenderer.removeListener('save-request', handleSaveRequest);
      };
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
          if (data.unlockedCards) {
            const safeCards = (data.unlockedCards || []).filter(id => CARD_LIBRARY.some(c => c.id === id));
            setUnlockedCards(safeCards);
          }
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
        if (data.unlockedCards) {
          const safeCards = (data.unlockedCards || []).filter(id => CARD_LIBRARY.some(c => c.id === id));
          setUnlockedCards(safeCards);
        }
        if (data.credits !== undefined) setCredits(data.credits);
        if (data.shopUpgrades) setShopUpgrades(data.shopUpgrades);
        if (data.normalCleared !== undefined) setNormalCleared(data.normalCleared);
        if (data.fastMode !== undefined) setFastMode(data.fastMode);
        if (data.maxStageReached !== undefined) setMaxStageReached(data.maxStageReached);
        if (data.usedCoupons) setUsedCoupons(data.usedCoupons);
        if (data.seenEnemies) setSeenEnemies(data.seenEnemies);
      }
    } catch (e) {
      console.warn('로컬 데이터 불러오기 실패', e);
    }
  }, []);

  const saveGame = async (payload = {}) => {
    const currentSave = { deckCounts, unlockedCards, credits, shopUpgrades, normalCleared, fastMode, maxStageReached, usedCoupons, seenEnemies, ...payload };
    
    try {
      localStorage.setItem('roguelike_tactics_save', JSON.stringify(currentSave));
    } catch (e) {
      console.warn('로컬 저장 실패', e);
    }

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

  // --- 유틸리티 함수 ---
  const getCardDef = (id) => {
    if (!id) return null;
    const base = CARD_LIBRARY.find(c => c.id === id);
    if (!base) return null;
    
    const upgradeLevel = (shopUpgrades?.upgradedCards || []).filter(cId => cId === id).length;
    
    if (upgradeLevel > 0) {
      let ratePerLevel = 0.3; // 일반
      if (base.rarity === 'uncommon') ratePerLevel = 0.4; 
      else if (base.rarity === 'rare') ratePerLevel = 0.5; 
      else if (base.rarity === 'special') ratePerLevel = 0.6; 

      const upgraded = { ...base, name: `${base.name} +${upgradeLevel}`, isUpgraded: true, upgradeLevel };
      
      // 1. 기본 수치 선형 증가 로직 (들쭉날쭉하게 오르는 현상 완벽 해결)
      // 매 레벨마다 일정하게 증가하도록 베이스 값 기반의 고정 증가량을 계산합니다.
      const getFlatInc = (val) => Math.max(1, Math.round(val * ratePerLevel));

      if (upgraded.damage) upgraded.damage = base.damage + getFlatInc(base.damage) * upgradeLevel;
      if (upgraded.block) upgraded.block = base.block + getFlatInc(base.block) * upgradeLevel;
      if (upgraded.heal) upgraded.heal = base.heal + getFlatInc(base.heal) * upgradeLevel;
      if (upgraded.percentBlockMaxHp) upgraded.percentBlockMaxHp = base.percentBlockMaxHp + getFlatInc(base.percentBlockMaxHp) * upgradeLevel;
      
      if (upgraded.missingHpDamage) {
        const inc = Math.max(0.05, base.missingHpDamage * ratePerLevel);
        upgraded.missingHpDamage = Number((base.missingHpDamage + inc * upgradeLevel).toFixed(2));
      }
      
      if (upgraded.manaMultiplier) upgraded.manaMultiplier = base.manaMultiplier + getFlatInc(base.manaMultiplier) * upgradeLevel;
      if (upgraded.increasingDamage) upgraded.increasingDamage = base.increasingDamage + getFlatInc(base.increasingDamage) * upgradeLevel;
      if (upgraded.winDamage) upgraded.winDamage = base.winDamage + getFlatInc(base.winDamage) * upgradeLevel;
      if (upgraded.loseDamage) upgraded.loseDamage = base.loseDamage + getFlatInc(base.loseDamage) * upgradeLevel;
      if (upgraded.winHeal) upgraded.winHeal = base.winHeal + getFlatInc(base.winHeal) * upgradeLevel;
      if (upgraded.winDamageBoss) upgraded.winDamageBoss = base.winDamageBoss + getFlatInc(base.winDamageBoss) * upgradeLevel;

      // 2. 디버프(약화/취약) 강화: +3강부터 1씩 증가
      const debuffBonus = Math.max(0, upgradeLevel - 2); // Lv3=1, Lv4=2, Lv5=3
      if (debuffBonus > 0) {
        if (base.enemyWeak) upgraded.enemyWeak = base.enemyWeak + debuffBonus;
        if (base.enemyVuln) upgraded.enemyVuln = base.enemyVuln + debuffBonus;
      }

      // 3. 버프(근력/민첩) 강화: +4강부터 1씩 증가
      const buffBonus = Math.max(0, upgradeLevel - 3); // Lv4=1, Lv5=2
      if (buffBonus > 0) {
        if (base.selfStrength) upgraded.selfStrength = base.selfStrength + buffBonus;
        if (base.selfDex) upgraded.selfDex = base.selfDex + buffBonus;
      }

      // 4. 마나 및 편의성 강화: +5강 달성 시 획득량 1 증가
      if (upgradeLevel >= 5) {
        if (base.manaGain) upgraded.manaGain = base.manaGain + 1;
        if (base.winManaGain) upgraded.winManaGain = base.winManaGain + 1;
        upgraded.draw = (base.draw || 0) + 1; // 5강 시 무조건 1장 드로우 추가
      }

      // 5. 텍스트 치환 로직
      let upDesc = base.desc;
      if (base.damage) upDesc = upDesc.replace(`${base.damage}의 피해`, `${upgraded.damage}의 피해`);
      if (base.block) upDesc = upDesc.replace(`${base.block}의 방어도`, `${upgraded.block}의 방어도`);
      if (base.heal) upDesc = upDesc.replace(`체력을 ${base.heal}`, `체력을 ${upgraded.heal}`);
      if (base.percentBlockMaxHp) upDesc = upDesc.replace(`${base.percentBlockMaxHp}%`, `${upgraded.percentBlockMaxHp}%`);
      if (base.missingHpDamage) upDesc = upDesc.replace(`${Math.round(base.missingHpDamage * 100)}%`, `${Math.round(upgraded.missingHpDamage * 100)}%`);
      
      if (base.manaMultiplier) upDesc = upDesc.replace(`(소모한 마나 x ${base.manaMultiplier})`, `(소모한 마나 x ${upgraded.manaMultiplier})`);
      if (base.increasingDamage) upDesc = upDesc.replace(`피해량이 ${base.increasingDamage}씩`, `피해량이 ${upgraded.increasingDamage}씩`);
      if (base.winDamage) upDesc = upDesc.replace(`${base.winDamage}의 피해`, `${upgraded.winDamage}의 피해`);
      if (base.winDamageBoss) upDesc = upDesc.replace(`보스 ${base.winDamageBoss}`, `보스 ${upgraded.winDamageBoss}`);
      if (base.winHeal) upDesc = upDesc.replace(`체력을 ${base.winHeal}`, `체력을 ${upgraded.winHeal}`);
      
      if (base.multiHit && base.damage) {
          const oldTotal = base.damage * base.multiHit;
          const newTotal = upgraded.damage * base.multiHit;
          upDesc = upDesc.replace(`(총 ${oldTotal})`, `(총 ${newTotal})`);
      }

      // 상태이상 텍스트 치환
      if (base.enemyWeak && upgraded.enemyWeak > base.enemyWeak) {
        upDesc = upDesc.replace(`약화 ${base.enemyWeak}`, `약화 ${upgraded.enemyWeak}`);
      }
      if (base.enemyVuln && upgraded.enemyVuln > base.enemyVuln) {
        upDesc = upDesc.replace(`취약 ${base.enemyVuln}`, `취약 ${upgraded.enemyVuln}`);
      }
      if (base.selfStrength && upgraded.selfStrength > base.selfStrength) {
        if (upDesc.includes(`각각 ${base.selfStrength}`)) {
            upDesc = upDesc.replace(`각각 ${base.selfStrength}`, `각각 ${upgraded.selfStrength}`);
        } else {
            upDesc = upDesc.replace(`근력을 ${base.selfStrength}`, `근력을 ${upgraded.selfStrength}`)
                           .replace(`근력 ${base.selfStrength}`, `근력 ${upgraded.selfStrength}`);
        }
      }
      if (base.selfDex && upgraded.selfDex > base.selfDex) {
        if (!upDesc.includes(`각각 ${upgraded.selfDex}`)) {
          upDesc = upDesc.replace(`민첩을 ${base.selfDex}`, `민첩을 ${upgraded.selfDex}`)
                         .replace(`민첩 ${base.selfDex}`, `민첩 ${upgraded.selfDex}`);
        }
      }
      
      if (base.manaGain && upgraded.manaGain > base.manaGain) {
        upDesc = upDesc.replace(`마나를 ${base.manaGain}`, `마나를 ${upgraded.manaGain}`)
                       .replace(`마나 ${base.manaGain}`, `마나 ${upgraded.manaGain}`);
      }
      if (base.winManaGain && upgraded.winManaGain > base.winManaGain) {
        upDesc = upDesc.replace(`마나를 ${base.winManaGain}`, `마나를 ${upgraded.winManaGain}`);
      }

      // 드로우 텍스트 치환
      if (upgradeLevel >= 5) {
        if (base.draw) {
          upDesc = upDesc.replace(`카드를 ${base.draw}장 뽑`, `카드를 ${upgraded.draw}장 뽑`)
                         .replace(`${base.draw}장 뽑`, `${upgraded.draw}장 뽑`);
        } else {
          upDesc += ' 카드를 1장 뽑습니다.';
        }
      }
      
      upgraded.desc = upDesc;
      return upgraded;
    }
    return base;
  };

  const toggleFullScreen = () => {
    const doc = window.document;
    const docEl = doc.documentElement;

    const requestFullScreen = docEl.requestFullscreen || docEl.webkitRequestFullscreen || docEl.mozRequestFullScreen || docEl.msRequestFullscreen;
    const cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

    if (!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
      if (requestFullScreen) {
        requestFullScreen.call(docEl).catch(err => {
          setIsCssFullScreen(!isCssFullScreen);
        });
      } else {
          setIsCssFullScreen(!isCssFullScreen);
      }
    } else {
      if (cancelFullScreen) {
        cancelFullScreen.call(doc);
      }
      setIsCssFullScreen(false);
    }
  };

  const handleExport = () => {
    const data = JSON.stringify({ deckCounts, unlockedCards, credits, shopUpgrades, normalCleared, fastMode, maxStageReached, usedCoupons, seenEnemies });
    const encoded = btoa(encodeURIComponent(data));
    const textArea = document.createElement("textarea");
    textArea.value = encoded;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    textArea.remove();
    setToastMsg('전체 세이브 코드가 복사되었습니다!');
    setTimeout(() => setToastMsg(''), 2000);
  };

  const handleImport = (encoded) => {
    try {
      const decoded = decodeURIComponent(atob(encoded));
      const data = JSON.parse(decoded);
      if (data.deckCounts && data.unlockedCards) {
        setDeckCounts(data.deckCounts);
        const safeCards = (data.unlockedCards || []).filter(id => CARD_LIBRARY.some(c => c.id === id));
        setUnlockedCards(safeCards);
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
      } else throw new Error('Invalid format');
    } catch(e) {
      setToastMsg('잘못된 세이브 코드입니다.');
      setTimeout(() => setToastMsg(''), 2000);
    }
  };

  const handleDeckExport = () => {
    const data = JSON.stringify({ type: 'deck_only', deckCounts: tempDeckCounts });
    const encoded = btoa(encodeURIComponent(data));
    const textArea = document.createElement("textarea");
    textArea.value = encoded;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    textArea.remove();
    setToastMsg('덱 코드가 복사되었습니다!');
    setTimeout(() => setToastMsg(''), 2000);
  };

  const handleDeckImport = () => {
    try {
      const decoded = decodeURIComponent(atob(deckImportText));
      const data = JSON.parse(decoded);
      if (data.type === 'deck_only' && data.deckCounts) {
        setTempDeckCounts(data.deckCounts);
        setToastMsg('덱을 성공적으로 불러왔습니다! (저장 필수)');
        setDeckImportModalOpen(false);
        setDeckImportText('');
      } else throw new Error('Invalid format');
    } catch(e) {
      setToastMsg('잘못된 덱 코드입니다.');
      setTimeout(() => setToastMsg(''), 2000);
    }
  };

  const handleCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    if ((usedCoupons || []).includes(code)) {
      setToastMsg('이미 사용한 쿠폰입니다.');
      setTimeout(() => setToastMsg(''), 2000);
      return;
    }

    let newCredits = credits;
    let newUnlocked = [...(unlockedCards || [])];
    let valid = false;
    let msg = '';

    if (code === 'WELCOME') {
      newCredits += 1000;
      msg = '웰컴 쿠폰: 1000 크레딧 획득!';
      valid = true;
    } else if (code === 'LEGENDARY') {
      if (!newUnlocked.includes('true_dragon_slayer')) newUnlocked.push('true_dragon_slayer');
      msg = '전설 쿠폰: 진·용살검 획득!';
      valid = true;
    } else if (code === 'GEMS') {
      newCredits += 500;
      msg = '보석 쿠폰: 500 크레딧 획득!';
      valid = true;
    } else if (code === 'EZ') {
      newCredits += 500;
      msg = '버그 보상: 500 크레딧 획득!';
      valid = true;
    }

    if (valid) {
      const updatedCoupons = [...(usedCoupons || []), code];
      setCredits(newCredits);
      setUnlockedCards(newUnlocked);
      setUsedCoupons(updatedCoupons);
      saveGame({ credits: newCredits, unlockedCards: newUnlocked, usedCoupons: updatedCoupons });
      setToastMsg(msg);
      setCouponInput('');
    } else {
      setToastMsg('유효하지 않은 쿠폰 코드입니다.');
      setTimeout(() => setToastMsg(''), 2000);
    }
  };

  const openDeckBuilder = () => { 
    setTempDeckCounts({ ...deckCounts }); 
    setFilterType('all');
    setFilterEffect('all');
    setFilterRarity('all');
    setFilterOwnership('all');
    setSearchQuery('');
    setGameState('DECK_BUILDING'); 
  };

  const openEncyclopedia = () => {
    setFilterType('all');
    setFilterEffect('all');
    setFilterRarity('all');
    setFilterOwnership('all');
    setSearchQuery('');
    setGameState('ENCYCLOPEDIA');
  };

  const openMonsterDex = () => {
    setGameState('MONSTER_DEX');
  };

  const openShop = () => {
    setShopFilterType('all');
    setShopFilterEffect('all');
    setShopFilterRarity('all');
    setShopFilterOwnership('all');
    setShopSearchQuery('');
    setGameState('SHOP');
  };
  
  const handleAddCard = (id) => {
    if (isActionLocked) return;
    if (!(unlockedCards || []).includes(id)) return; 
    
    setIsActionLocked(true);
    setTempDeckCounts(prev => {
      const currentTotal = Object.values(prev || {}).reduce((a, b) => a + b, 0);
      if (currentTotal >= 20) return prev;
      if ((prev[id] || 0) >= 3) return prev;
      
      const manaCards = ['mana_potion', 'overcharge', 'meditate', 'dark_bargain', 'catalyst', 'blood_ritual', 'mana_amp', 'mana_spring', 'mana_burst', 'lucky_coin'];
      if (manaCards.includes(id)) {
        const totalMana = manaCards.reduce((acc, cId) => acc + (prev[cId] || 0), 0);
        if (totalMana >= 2) {
          setToastMsg('마나 관련 카드는 덱에 최대 2장까지만 넣을 수 있습니다.');
          setTimeout(() => setToastMsg(''), 2000);
          return prev;
        }
      }
      return { ...prev, [id]: (prev[id] || 0) + 1 };
    });
    setTimeout(() => setIsActionLocked(false), 50); 
  };

  const handleRemoveCard = (id) => {
    if (isActionLocked) return;
    setIsActionLocked(true);
    setTempDeckCounts(prev => {
      if ((prev[id] || 0) <= 0) return prev;
      return { ...prev, [id]: prev[id] - 1 };
    });
    setTimeout(() => setIsActionLocked(false), 50);
  };

  const handleClearDeck = () => {
    setTempDeckCounts({});
  };

  const handleAdminUnlock = () => {
    if (adminCodeInput === '20090324') {
        setIsAdminUnlocked(true);
        setToastMsg('개발자 권한이 활성화되었습니다.');
    } else {
        setToastMsg('잘못된 코드입니다.');
    }
    setTimeout(() => setToastMsg(''), 2000);
  };

  const adminGiveMoney = () => {
      const newCredits = credits + 99999;
      setCredits(newCredits);
      saveGame({credits: newCredits});
      setToastMsg('크레딧 99,999 지급 완료!');
      setTimeout(() => setToastMsg(''), 2000);
  };

  const handleExitGame = async () => {
    setToastMsg('데이터를 안전하게 저장 중입니다...');
    await saveGame({
      deckCounts, unlockedCards, credits, shopUpgrades, 
      normalCleared, fastMode, maxStageReached, usedCoupons, seenEnemies 
    });

    if (window.require) {
      window.close();
    } else {
      setGameState('MENU');
      setToastMsg('저장 완료!');
      setTimeout(() => setToastMsg(''), 2000);
    }
  };

  const adminUnlockAllCards = () => {
      const allIds = CARD_LIBRARY.map(c => c.id);
      setUnlockedCards(allIds);
      saveGame({unlockedCards: allIds});
      setToastMsg('모든 카드가 해금되었습니다!');
      setTimeout(() => setToastMsg(''), 2000);
  };

  // --- 뽑기 관련 ---
  const handleGacha = () => {
    if (credits < 50) return;
    
    let pulled = [];
    let refund = 0;
    
    const validPool = CARD_LIBRARY.filter(c => c.rarity !== 'special');

    const getWeighted = (pool) => {
      const r = Math.random();
      let t = 'common';
      if (r > 0.89 && r <= 0.99) t = 'uncommon'; 
      else if (r > 0.99) t = 'rare'; 
      
      let filtered = pool.filter(c => c.rarity === t);
      if (filtered.length === 0) filtered = pool; 
      return filtered[Math.floor(Math.random() * filtered.length)];
    };

    for(let i=0; i<3; i++) {
      const picked = getWeighted(validPool);
      if (picked) pulled.push({...picked}); 
    }

    pulled.forEach(c => {
      if ((unlockedCards || []).includes(c.id)) {
        c.isDuplicate = true;
        refund += 10;
      }
    });

    const newCredits = credits - 50 + refund;
    const newUnlockedIds = pulled.map(c => c.id);
    const newUnlockedCards = [...new Set([...(unlockedCards || []), ...newUnlockedIds])]; 
    
    setCredits(newCredits);
    setUnlockedCards(newUnlockedCards);
    setGachaResult(pulled.map(c => ({ ...getCardDef(c.id, shopUpgrades), isDuplicate: c.isDuplicate }))); 
    saveGame({ credits: newCredits, unlockedCards: newUnlockedCards });
  };

  const handlePremiumGacha = () => {
    if (credits < 100) return;
    setCredits(prev => prev - 100);

    let pulled = [];
    const validPool = CARD_LIBRARY.filter(c => c.rarity !== 'special');

    const getWeighted = () => {
      const r = Math.random();
      let t = 'common';
      if (r > 0.78 && r <= 0.98) t = 'uncommon'; 
      else if (r > 0.98) t = 'rare'; 
      
      let filtered = validPool.filter(c => c.rarity === t);
      if (filtered.length === 0) filtered = validPool;
      return filtered[Math.floor(Math.random() * filtered.length)];
    };

    for(let i=0; i<3; i++) {
      const picked = getWeighted();
      if (picked) pulled.push({...picked});
    }
    setPremiumGachaResult(pulled.map(c => getCardDef(c.id, shopUpgrades)));
  };

  const selectPremiumCard = (cardDef) => {
    const isOwned = (unlockedCards || []).includes(cardDef.id);
    const newUnlocked = isOwned ? unlockedCards : [...(unlockedCards || []), cardDef.id];
    if (isOwned) {
      setCredits(prev => prev + 20); 
      setToastMsg('중복 카드를 선택하여 20 크레딧을 돌려받았습니다.');
    } else {
      setToastMsg(`${cardDef.name} 획득!`);
    }
    setUnlockedCards(newUnlocked);
    setPremiumGachaResult(null);
    saveGame({ unlockedCards: newUnlocked });
  };

  // --- 전투 초기화 및 진행 ---
  const startBattle = (mode = 'NORMAL', startingStage = 1) => {
    let fullDeck = [];
    Object.keys(deckCounts || {}).forEach(id => {
      const count = deckCounts[id];
      const cardDef = getCardDef(id, shopUpgrades);
      for (let i = 0; i < count; i++) {
        if (cardDef) fullDeck.push({ ...cardDef });
      }
    });

    const shuffled = shuffle(fullDeck);
    let initialDrawPile = [...shuffled];
    let initialHand = [];
    for(let i=0; i<5; i++) {
      if(initialDrawPile.length > 0) initialHand.push({ ...initialDrawPile.pop(), uid: Math.random().toString() });
    }

    const playerMaxHp = 100 + ((shopUpgrades?.maxHp || 0) * 15); 
    const generatedEnemies = generateEnemies(startingStage);
    updateSeenEnemies(generatedEnemies);

    setCombatState({
      mode, 
      player: { hp: playerMaxHp, maxHp: playerMaxHp, mana: 3, maxMana: 3, block: 0, debuffs: { weak: 0, vulnerable: 0 }, buffs: { strength: 0, dexterity: 0 } },
      enemies: generatedEnemies,
      hand: initialHand,
      drawPile: initialDrawPile,
      discardPile: [],
      turn: 'PLAYER',
      stage: startingStage,
      baseDeck: fullDeck
    });
    setSkipModalOpen(false);
    setRewardCards([]); 
    setGameState('BATTLE');
  };

  const startNextStage = (newPlayer, newBaseDeck) => {
    const nextStage = combatState.stage + 1;
    const nextEnemies = generateEnemies(nextStage);
    updateSeenEnemies(nextEnemies);

    const reshuffled = shuffle([...newBaseDeck]);
    let startHand = [];
    let startDraw = [...reshuffled];
    for(let i=0; i<5; i++) {
      if(startDraw.length > 0) startHand.push({ ...startDraw.pop(), uid: Math.random().toString() });
    }

    setCombatState({
      ...combatState,
      stage: nextStage,
      player: { ...newPlayer, block: 0, mana: newPlayer.maxMana, debuffs: {weak: 0, vulnerable: 0}, buffs: newPlayer.buffs || { strength: 0, dexterity: 0 } },
      enemies: nextEnemies,
      baseDeck: newBaseDeck,
      hand: startHand,
      drawPile: startDraw,
      discardPile: [],
      turn: 'PLAYER'
    });
    setRewardCards([]);
    setGameState('BATTLE');
  };

  useEffect(() => {
    if (gameState !== 'BATTLE' || !combatState || combatState.turn !== 'ENEMY') return;

    const timer = setTimeout(() => {
      setCombatState(prev => {
        let p = { ...prev.player };
        let newEnemies = prev.enemies.map(e => ({ ...e, block: 0 }));

        // 1. 중독 데미지 처리 및 적 패시브 처리
        newEnemies.forEach(e => {
          if (e.debuffs?.poison > 0) {
            e.hp -= e.debuffs.poison; // 중독 데미지 적용
            e.debuffs.poison = Math.max(0, e.debuffs.poison - 1); // 수치 1 감소
          }
          e.passives?.forEach(pass => {
            if (pass.id === 'scaling_strength') e.buffs.strength = (e.buffs.strength || 0) + 3;
          });
        });

        // 2. 적 공격 및 가시(Thorns) 반사 데미지 처리
        newEnemies.forEach(e => {
          if (e.hp <= 0) return; // 중독 데미지로 죽었으면 행동 스킵

          let card = e.intentCard;

          if (card.type.includes('attack')) {
            let baseDmg = card.value + (e.buffs.strength || 0);
            if (p.debuffs.vulnerable > 0) baseDmg = Math.floor(baseDmg * 1.3); 
            if (e.debuffs.weak > 0) baseDmg = Math.floor(baseDmg * 0.97);

            let hits = card.multi || 1;
            for(let i=0; i<hits; i++) {
              if (e.hp <= 0) break; // 가시 데미지로 연타 도중 죽으면 멈춤
              
              if (p.block >= baseDmg) p.block -= baseDmg;
              else { let leftover = baseDmg - p.block; p.block = 0; p.hp -= leftover; }
              
              // [신규] 가시 데미지 반사 로직
              if (p.buffs?.thorns > 0) {
                e.hp -= p.buffs.thorns;
              }
            }
          }
          if (card.type.includes('debuff')) {
            if (card.debuff === 'weak') p.debuffs.weak += card.turns;
            if (card.debuff === 'vulnerable') p.debuffs.vulnerable += card.turns;
          }
          if (card.type.includes('defend')) {
            e.block += card.value; 
          }
          if (card.type.includes('buff')) {
            if (card.buff === 'strength') e.buffs.strength = (e.buffs.strength || 0) + card.buffValue;
          }
          if (card.type.includes('heal')) {
            e.hp = Math.min(e.maxHp, e.hp + (card.heal || 0));
          }

          e.debuffs.weak = decayStack(e.debuffs.weak);
          e.debuffs.vulnerable = decayStack(e.debuffs.vulnerable);
          e.buffs.strength = decayStack(e.buffs.strength);
          
          e.intentCard = generateEnemyIntent(e.template, prev.stage);
        });

        // 3. 중독/가시 반사로 적이 사망했을 경우(부활 처리 포함)
        newEnemies.forEach(e => {
          if (e.hp <= 0) {
            const reviveIdx = e.passives?.findIndex(pass => pass.id === 'revive');
            if (reviveIdx > -1) {
              e.hp = Math.floor(e.maxHp / 2);
              e.passives.splice(reviveIdx, 1);
            }
          }
        });
        
        // 진짜 죽은 몬스터 배열에서 제거
        newEnemies = newEnemies.filter(e => e.hp > 0);

        if (p.hp <= 0) {
          setGameState('GAME_OVER');
          return prev;
        }

        // 중독/가시로 적이 전멸했을 경우 (적 턴에 승리)
        if (newEnemies.length === 0) {
          if (prev.stage >= maxStageReached) {
            setMaxStageReached(prev.stage + 1);
            saveGame({ maxStageReached: prev.stage + 1 });
          }
          let earned = 5 + Math.floor(prev.stage * 1) + (Math.floor(prev.stage / 5) * 5);
          if (prev.stage % 5 === 0) earned += 15;
          if (prev.mode === 'HARD') earned *= 2; 
          
          const newCredits = credits + earned;
          setCredits(newCredits);
          saveGame({ credits: newCredits }); 
          
          // 승리 시 체력/디버프 자동 갱신
          p.block = 0; p.mana = p.maxMana;
          p.debuffs = { weak: 0, vulnerable: 0, poison: 0 };
          p.buffs = { strength: 0, dexterity: 0, thorns: 0 };
          
          setTimeout(() => setGameState('REWARDS'), fastMode ? 200 : 600);
          return { ...prev, player: p, enemies: [], hand: [], discardPile: [], drawPile: [] };
        }

        p.block = 0;
        p.mana = p.maxMana;
        p.debuffs.weak = decayStack(p.debuffs.weak);
        p.debuffs.vulnerable = decayStack(p.debuffs.vulnerable);
        p.buffs.strength = decayStack(p.buffs.strength);
        p.buffs.dexterity = decayStack(p.buffs.dexterity);

        let newDiscard = [...prev.discardPile, ...prev.hand];
        let newDraw = [...prev.drawPile];
        let newHand = [];

        let drawAmount = 5;
        for (let i = 0; i < drawAmount; i++) {
          if (newHand.length >= MAX_HAND_SIZE) break;
          if (newDraw.length === 0) {
            if (newDiscard.length === 0) break;
            newDraw = shuffle(newDiscard);
            newDiscard = [];
          }
          if (newDraw.length > 0) newHand.push({ ...newDraw.pop(), uid: Math.random().toString() });
        }

        return { ...prev, player: p, enemies: newEnemies, hand: newHand, drawPile: newDraw, discardPile: newDiscard, turn: 'PLAYER' };
      });
    }, fastMode ? 500 : 1500);

    return () => clearTimeout(timer);
  }, [gameState, combatState?.turn, fastMode]);

  useEffect(() => {
    if (gameState === 'BATTLE' && combatState?.turn === 'PLAYER') {
      const { player, hand } = combatState;
      if (player.mana === 0 && !hand.some(card => card.cost === 0)) {
        const timer = setTimeout(() => {
          setCombatState(prev => {
            if (prev.turn === 'PLAYER' && prev.player.mana === 0) return { ...prev, turn: 'ENEMY' };
            return prev;
          });
        }, fastMode ? 300 : 800); 
        return () => clearTimeout(timer);
      }
    }
  }, [gameState, combatState?.turn, combatState?.player?.mana, combatState?.hand, fastMode]);

  const getSpecialBossReward = (stage, killingCard = null) => {
    switch(stage) {
        case 25: return CARD_LIBRARY.find(c => c.id === 'spider_queen_poison');
        case 50: return CARD_LIBRARY.find(c => c.id === 'twerking');
        case 75: return CARD_LIBRARY.find(c => c.id === 'power_of_asura');
        case 100: 
            const isMythicKill = killingCard && (killingCard.rarity === 'special' || killingCard.rarity === 'rare');
            if (isMythicKill && Math.random() <= 0.25) {
                return CARD_LIBRARY.find(c => c.id === 'furioso');
            }
            return CARD_LIBRARY.find(c => c.id === 'slime_snot');
        default: return null;
    }
  };

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

      let isGambleWin = true;
      if (card.gamble) {
        isGambleWin = Math.random() < card.gambleWinChance;
      }

      const dealDamageToFront = (amount) => {
        if (newEnemies.length === 0) return;
        let target = newEnemies[0];
        
        let dmg = amount + (p.buffs.strength || 0);
        if (p.debuffs.weak > 0) dmg = Math.floor(dmg * 0.97); 
        if (target.debuffs.vulnerable > 0) dmg = Math.floor(dmg * 1.3); 
        
        if (target.block >= dmg) { target.block -= dmg; } 
        else { target.hp -= (dmg - target.block); target.block = 0; }

        if (target.hp <= 0) {
          const reviveIdx = target.passives.findIndex(pass => pass.id === 'revive');
          if (reviveIdx > -1) {
            target.hp = Math.floor(target.maxHp / 2);
            target.passives.splice(reviveIdx, 1);
            setToastMsg(`${target.name} 부활!`);
            setTimeout(()=>setToastMsg(''), 1500);
          } else {
            newEnemies.shift(); 
          }
        }
      };

      const gainBlock = (amount) => {
        p.block += amount + (p.buffs.dexterity || 0);
      };

      if (card.gamble) {
        if (isGambleWin) {
           setToastMsg("도박 성공! 🎉");
           if (card.winDamage) {
             if (newEnemies.length > 0 && newEnemies[0].isBoss && card.winDamageBoss) {
               dealDamageToFront(card.winDamageBoss);
             } else {
               dealDamageToFront(card.winDamage);
             }
           }
           if (card.winManaGain) p.mana += card.winManaGain;
           if (card.winHeal) p.hp = Math.min(p.maxHp, p.hp + card.winHeal);
        } else {
           setToastMsg("도박 실패... 💀");
           if (card.loseDamage) dealDamageToFront(card.loseDamage);
           if (card.loseSelfDamage) p.hp -= card.loseSelfDamage;
           if (card.losePercentMaxHpDamage) p.hp -= Math.floor(p.maxHp * card.losePercentMaxHpDamage);
           if (card.loseDraw) {
             for(let i=0; i<card.loseDraw; i++){
                if(newHand.length >= MAX_HAND_SIZE) break;
                if(newDraw.length === 0) {
                  if(newDiscard.length === 0) break;
                  newDraw = shuffle(newDiscard);
                  newDiscard = [];
                }
                if(newDraw.length > 0) newHand.push({ ...newDraw.pop(), uid: Math.random().toString() });
             }
           }
        }
      } else {
        if (card.percentBlockMaxHp) gainBlock(Math.floor(p.maxHp * (card.percentBlockMaxHp / 100)));
        if (card.doubleBlock) p.block *= 2; 
        
        if (card.missingHpDamage) {
          let baseDmg = card.damage || 0;
          baseDmg += Math.floor((p.maxHp - p.hp) * card.missingHpDamage);
          dealDamageToFront(baseDmg);
        } else if (card.consumeAllMana) {
          let baseDmg = card.damage || 0;
          baseDmg += p.mana * card.manaMultiplier;
          p.mana = 0;
          dealDamageToFront(baseDmg);
        } else if (card.damage) {
          const hits = card.multiHit || 1;
          let currentDmg = card.damage;
          for(let i=0; i<hits; i++) {
            dealDamageToFront(currentDmg);
            if (card.increasingDamage) currentDmg += card.increasingDamage;
          }
        }
      }

      // ... playCard 함수 내부의 버프/디버프 적용 구역 ...
      if (card.block && !card.doubleBlock && !card.percentBlockMaxHp) gainBlock(card.block);
      if (card.heal && !card.gamble) p.hp = Math.min(p.maxHp, p.hp + card.heal);
      if (card.manaGain && !card.gamble) p.mana += card.manaGain;
      if (card.selfDamage && !card.gamble) p.hp -= card.selfDamage;
      if (card.selfStrength) p.buffs.strength += card.selfStrength;
      if (card.selfDex) p.buffs.dexterity += card.selfDex;
      
      // [신규] 나에게 가시(Thorns) 부여
      if (card.selfThorns) p.buffs.thorns = (p.buffs.thorns || 0) + card.selfThorns;

      if (newEnemies.length > 0) {
        let target = newEnemies[0];
        if (card.enemyWeak) target.debuffs.weak += card.enemyWeak;
        if (card.enemyVuln) target.debuffs.vulnerable += card.enemyVuln;
        // [신규] 타겟 적에게 중독(Poison) 부여
        if (card.enemyPoison) target.debuffs.poison = (target.debuffs.poison || 0) + card.enemyPoison;
      }

      let drawCount = card.draw || 0;
      for(let i=0; i<drawCount; i++) {
        if(newHand.length >= MAX_HAND_SIZE - 1) break; 
        if(newDraw.length === 0) {
          if(newDiscard.length === 0) break;
          newDraw = shuffle(newDiscard);
          newDiscard = [];
        }
        if(newDraw.length > 0) newHand.push({ ...newDraw.pop(), uid: Math.random().toString() });
      }

      newHand.splice(cardIndex, 1);
      newDiscard.push(card);

      if (newEnemies.length === 0) {
        if (prev.stage >= maxStageReached) {
            setMaxStageReached(prev.stage + 1);
            saveGame({ maxStageReached: prev.stage + 1 });
        }

        let bossBonus = Math.floor(prev.stage / 5) * 5; 
        let earned = 5 + Math.floor(prev.stage * 1) + bossBonus;
        if (prev.stage % 5 === 0) earned += 15;
        if (prev.mode === 'HARD') earned *= 2; 
        
        const newCredits = credits + earned;
        setCredits(newCredits);
        saveGame({ credits: newCredits }); 

        setHoveredCard(null); 

        const specialReward = getSpecialBossReward(prev.stage, card);
        if (specialReward) {
          setSpecialBossRewardCard(specialReward);
          setTimeout(() => setGameState('BOSS_CLEAR_REWARD'), fastMode ? 200 : 600);
          return { ...prev, player: p, enemies: [], hand: [], discardPile: [], drawPile: [] };
        }

        if (prev.mode === 'NORMAL' && prev.stage >= 100) {
          setNormalCleared(true);
          saveGame({ normalCleared: true });
          setGameState('GAME_CLEAR');
          return { ...prev, player: p, enemies: [], hand: [], discardPile: [], drawPile: [] };
        }

        setTimeout(() => setGameState('REWARDS'), fastMode ? 200 : 600);
        return { ...prev, player: p, enemies: [], hand: [], discardPile: [], drawPile: [] };
      }

      return { ...prev, player: p, enemies: newEnemies, hand: newHand, discardPile: newDiscard, drawPile: newDraw };
    });
  };

  const handleSpecialBossRewardClaim = () => {
    if (specialBossRewardCard && combatState) {
      const isOwned = (unlockedCards || []).includes(specialBossRewardCard.id);
      const newUnlocked = isOwned ? unlockedCards : [...(unlockedCards || []), specialBossRewardCard.id];
      
      setCombatState(prev => {
        if (!prev) return prev;
        return { ...prev, baseDeck: [...prev.baseDeck, { ...specialBossRewardCard }] };
      });
      
      setUnlockedCards(newUnlocked);
      saveGame({ unlockedCards: newUnlocked });
      
      setToastMsg(`${specialBossRewardCard.name}을(를) 덱에 추가했습니다!`);
      setSpecialBossRewardCard(null);

      if (combatState.mode === 'NORMAL' && combatState.stage >= 100) {
        setNormalCleared(true);
        saveGame({ normalCleared: true });
        setGameState('GAME_CLEAR');
      } else {
        setGameState('REWARDS');
      }
    }
  };

  const getFilteredCards = (targetFilterType = filterType, targetFilterEffect = filterEffect, targetFilterRarity = filterRarity, targetFilterOwnership = filterOwnership, targetSearchQuery = searchQuery) => {
    return CARD_LIBRARY.filter(c => {
      if (targetFilterRarity !== 'all' && c.rarity !== targetFilterRarity) return false;
      if (targetFilterType !== 'all' && c.type !== targetFilterType) return false;
      // 디버프 필터에 중독(enemyPoison) 추가
      if (targetFilterEffect === 'debuff' && !(c.enemyWeak || c.enemyVuln || c.enemyPoison)) return false;
      // 버프 필터에 가시(selfThorns) 추가
      if (targetFilterEffect === 'buff' && !(c.selfStrength || c.selfDex || c.selfThorns)) return false;
      if (targetFilterOwnership === 'owned' && !(unlockedCards || []).includes(c.id)) return false;
      if (targetFilterOwnership === 'unowned' && (unlockedCards || []).includes(c.id)) return false;
      if (targetSearchQuery) {
        const query = targetSearchQuery.toLowerCase();
        const cardDef = getCardDef(c.id, shopUpgrades); 
        if (cardDef && !(cardDef.name || '').toLowerCase().includes(query) && !(cardDef.desc || '').toLowerCase().includes(query)) return false;
      }
      return true;
    });
  };

  const renderTooltipIcon = (desc) => {
    if (!desc) return null;
    const tooltips = [];
    if (desc.includes('약화')) tooltips.push({ title: '약화', desc: '가하는 피해가 3% 감소합니다. (턴마다 수치 비례 감소)' });
    if (desc.includes('취약')) tooltips.push({ title: '취약', desc: '받는 피해가 30% 증가합니다. (턴마다 수치 비례 감소)' });
    if (desc.includes('근력')) tooltips.push({ title: '근력', desc: '공격 카드의 피해량이 증가합니다. (턴마다 수치 비례 감소)' });
    if (desc.includes('민첩')) tooltips.push({ title: '민첩', desc: '방어 카드의 방어도가 증가합니다. (턴마다 수치 비례 감소)' });
    if (desc.includes('도박')) tooltips.push({ title: '도박', desc: '확률에 따라 추가 효과가 발생하거나 패널티를 받습니다.' });
    // 신규 도움말 추가
    if (desc.includes('중독')) tooltips.push({ title: '중독 (디버프)', desc: '턴 시작 시 수치만큼 피해를 입고, 중독 수치가 1 감소합니다.' });
    if (desc.includes('가시')) tooltips.push({ title: '가시 (버프)', desc: '피격 시 공격자에게 수치만큼의 피해를 반사합니다.' });

    if (tooltips.length === 0) return null;

    return (
      <div tabIndex="0" className="tooltip-trigger inline-flex items-center ml-1 text-slate-400 cursor-help relative z-[9999] outline-none">
        <Info className="w-4 h-4" />
        <div className="tooltip-content absolute bottom-[120%] left-1/2 -translate-x-1/2 mb-1 w-56 bg-slate-800 text-white text-xs p-2 rounded border border-slate-600 shadow-xl pointer-events-none z-[9999] flex flex-col gap-1.5">
          {tooltips.map((t, i) => (
            <div key={i} className="text-left leading-tight"><span className="font-bold text-orange-400">{t.title}:</span> {t.desc}</div>
          ))}
        </div>
      </div>
    );
  };

  const renderFiltersUI = (type, setType, effect, setEffect, rarity, setRarity, ownership, setOwnership, search, setSearch) => (
    <div className="flex flex-col gap-4 mb-6 w-full max-w-6xl mx-auto px-4 bg-slate-800/40 p-4 rounded-xl border border-slate-700 shadow-inner">
      <div className="flex items-center bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 w-full md:w-1/2">
        <Search className="w-5 h-5 text-slate-400 mr-2 shrink-0" />
        <input 
          type="text" 
          placeholder="카드 이름이나 효과 검색..." 
          className="bg-transparent border-none outline-none text-white w-full font-bold text-sm placeholder-slate-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      
      <div className="flex flex-wrap gap-x-6 gap-y-3">
        <div className="flex gap-2 overflow-x-auto hide-scrollbar py-1 items-center">
          <span className="text-slate-400 text-sm font-bold w-10 shrink-0">종류</span>
          <button onClick={()=>setType('all')} className={`px-3 py-1.5 rounded-full font-bold text-xs shrink-0 transition-colors ${type === 'all' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}`}>전체</button>
          <button onClick={()=>setType('attack')} className={`px-3 py-1.5 rounded-full font-bold text-xs shrink-0 transition-colors ${type === 'attack' ? 'bg-red-600 text-white shadow-md' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}`}>전투 (공격)</button>
          <button onClick={()=>setType('skill')} className={`px-3 py-1.5 rounded-full font-bold text-xs shrink-0 transition-colors ${type === 'skill' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}`}>보조 (스킬)</button>
        </div>
        <div className="flex gap-2 overflow-x-auto hide-scrollbar py-1 items-center">
          <span className="text-slate-400 text-sm font-bold w-10 shrink-0">효과</span>
          <button onClick={()=>setEffect('all')} className={`px-3 py-1.5 rounded-full font-bold text-xs shrink-0 transition-colors ${effect === 'all' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}`}>모든 효과</button>
          <button onClick={()=>setEffect('debuff')} className={`px-3 py-1.5 rounded-full font-bold text-xs shrink-0 transition-colors ${effect === 'debuff' ? 'bg-purple-600 text-white shadow-md' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}`}>디버프 (약화/취약/중독)</button>
          <button onClick={()=>setEffect('buff')} className={`px-3 py-1.5 rounded-full font-bold text-xs shrink-0 transition-colors ${effect === 'buff' ? 'bg-green-600 text-white shadow-md' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}`}>버프 (근력/민첩/가시)</button>
        </div>
        <div className="flex gap-2 overflow-x-auto hide-scrollbar py-1 items-center">
          <span className="text-slate-400 text-sm font-bold w-10 shrink-0">등급</span>
          <button onClick={()=>setRarity('all')} className={`px-3 py-1.5 rounded-full font-bold text-xs shrink-0 transition-colors ${rarity === 'all' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}`}>전체</button>
          <button onClick={()=>setRarity('common')} className={`px-3 py-1.5 rounded-full font-bold text-xs shrink-0 transition-colors ${rarity === 'common' ? 'bg-slate-500 text-white shadow-md' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}`}>일반</button>
          <button onClick={()=>setRarity('uncommon')} className={`px-3 py-1.5 rounded-full font-bold text-xs shrink-0 transition-colors ${rarity === 'uncommon' ? 'bg-cyan-600 text-white shadow-md' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}`}>희귀</button>
          <button onClick={()=>setRarity('rare')} className={`px-3 py-1.5 rounded-full font-bold text-xs shrink-0 transition-colors ${rarity === 'rare' ? 'bg-yellow-600 text-white shadow-md' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}`}>전설</button>
          <button onClick={()=>setRarity('special')} className={`px-3 py-1.5 rounded-full font-bold text-xs shrink-0 transition-colors ${rarity === 'special' ? 'bg-fuchsia-900 text-white shadow-md' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}`}>특수/보스</button>
        </div>
        
        {setOwnership && (
          <div className="flex gap-2 overflow-x-auto hide-scrollbar py-1 items-center">
            <span className="text-slate-400 text-sm font-bold w-10 shrink-0">보유</span>
            <button onClick={()=>setOwnership('all')} className={`px-3 py-1.5 rounded-full font-bold text-xs shrink-0 transition-colors ${ownership === 'all' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}`}>전체</button>
            <button onClick={()=>setOwnership('owned')} className={`px-3 py-1.5 rounded-full font-bold text-xs shrink-0 transition-colors ${ownership === 'owned' ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}`}>보유</button>
            <button onClick={()=>setOwnership('unowned')} className={`px-3 py-1.5 rounded-full font-bold text-xs shrink-0 transition-colors ${ownership === 'unowned' ? 'bg-red-800 text-white shadow-md' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}`}>미보유</button>
          </div>
        )}
      </div>
    </div>
  );

 const renderCard = (card, count = null, isLocked = false, onAdd = null, onRemove = null, customClick = null) => {
    if (!card) return null;
    const isAttack = card.type === 'attack';
    const borderStyle = isAttack ? 'border-red-500' : 'border-blue-500';
    let rarityShadow = '';
    let nameColor = 'text-white';
    let tagUi = null;
    let bgStyle = 'bg-slate-900';
    
    if (card.rarity === 'uncommon') { 
      rarityShadow = 'shadow-[0_0_12px_rgba(34,211,238,0.4)]'; nameColor = 'text-cyan-300';
      tagUi = <span className="text-[9px] md:text-[10px] text-cyan-400 font-bold bg-slate-800/80 px-1 rounded border border-cyan-800">희귀</span>;
    } else if (card.rarity === 'rare') {
      rarityShadow = 'shadow-[0_0_20px_rgba(250,204,21,0.6)]'; nameColor = 'text-yellow-300 drop-shadow-[0_0_5px_rgba(250,204,21,0.8)]';
      tagUi = <span className="text-[9px] md:text-[10px] text-yellow-400 font-bold bg-slate-800/80 px-1 rounded border border-yellow-700">전설</span>;
      bgStyle = 'legendary-bg'; 
    } else if (card.rarity === 'special') {
      rarityShadow = 'shadow-[0_0_25px_rgba(217,70,239,0.7)]'; nameColor = 'text-fuchsia-300 drop-shadow-[0_0_8px_rgba(217,70,239,0.8)]';
      tagUi = <span className="text-[9px] md:text-[10px] text-fuchsia-400 font-bold bg-slate-800/80 px-1 rounded border border-fuchsia-800"><Star className="w-2 h-2 inline mb-0.5"/>특수</span>;
      bgStyle = 'special-bg'; 
    } else {
      tagUi = <span className="text-[9px] md:text-[10px] text-slate-400 font-bold bg-slate-800/80 px-1 rounded border border-slate-600">일반</span>;
    }

    if (card.isUpgraded) {
      rarityShadow = 'shadow-[0_0_15px_rgba(234,179,8,0.4)]';
      nameColor = 'text-yellow-400';
      bgStyle = card.rarity === 'special' ? 'special-bg' : 'bg-slate-900';
    }

    // 미해금(isLocked) 상태일 때 카드를 전체적으로 회색빛(grayscale) 및 반투명(opacity-50)으로 만듭니다.
    const lockStyle = isLocked ? 'opacity-50 grayscale border-slate-700 bg-slate-900' : `${borderStyle} ${rarityShadow} ${bgStyle}`;

    return (
      <div 
        key={card.uid || card.id} 
        onClick={customClick}
        className={`border-2 p-2 md:p-3 rounded-xl flex flex-col justify-between relative transition-all ${customClick && !isLocked ? 'cursor-pointer hover:-translate-y-2' : ''} ${lockStyle} w-full h-[220px] md:h-[280px] shrink-0 overflow-hidden`}
      >
        {/* 수정된 부분: 배경 블러를 지우고 중앙에 자물쇠만 배치하여 텍스트가 보이게 함 */}
        {isLocked && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center justify-center pointer-events-none">
            <Lock className="w-8 h-8 md:w-10 md:h-10 text-slate-400 mb-1 drop-shadow-md"/>
            <span className="text-yellow-500 font-black text-[10px] md:text-xs bg-slate-900/90 px-2 py-1 rounded border border-slate-700 shadow-xl">미해금</span>
          </div>
        )}
        
        <div className="z-10 relative">
          <div className="flex justify-between items-start mb-2">
            <span className="font-bold text-[10px] md:text-sm bg-slate-800 px-2 py-1 rounded text-white shadow-inner border border-slate-700">코스트 {card.cost}</span>
            <div className="flex flex-col items-end gap-1">
              {tagUi}
              {isAttack ? <Sword className={`w-4 h-4 md:w-5 md:h-5 ${card.isUpgraded?'text-yellow-400': card.rarity==='rare'?'text-yellow-300' : card.rarity==='special'?'text-fuchsia-300' : 'text-red-400'}`}/> : <Shield className={`w-4 h-4 md:w-5 md:h-5 ${card.isUpgraded?'text-yellow-400': card.rarity==='rare'?'text-yellow-300' : card.rarity==='special'?'text-fuchsia-300' : 'text-blue-400'}`}/>}
            </div>
          </div>
          <div className="text-center mb-auto mt-1">
            <h4 className={`font-extrabold text-sm md:text-base leading-tight drop-shadow-md ${nameColor}`}>{card.name}</h4>
          </div>
        </div>
        
        <div className="text-[10px] md:text-xs text-slate-200 text-center leading-tight bg-black/60 p-2 rounded relative mt-2 flex-1 flex items-center justify-center overflow-visible z-10 font-medium">
          <div>{card.desc} {renderTooltipIcon(card.desc)}</div>
        </div>
        
        {count !== null && onAdd && onRemove && !isLocked && (
          <div className="mt-2 flex items-center justify-between bg-slate-800/90 border border-slate-600 px-2 py-1.5 rounded-lg z-20 shrink-0 backdrop-blur-sm">
            <button onClick={(e) => { e.stopPropagation(); onRemove(card.id); }} className={`w-6 h-6 md:w-8 md:h-8 flex justify-center items-center rounded-full font-bold text-base md:text-lg ${count > 0 ? 'bg-slate-600 hover:bg-slate-500 text-white' : 'bg-slate-800 text-slate-600'}`}>-</button>
            <span className="w-4 text-center font-bold text-sm md:text-base text-white">{count}</span>
            <button onClick={(e) => { e.stopPropagation(); onAdd(card.id); }} className={`w-6 h-6 md:w-8 md:h-8 flex justify-center items-center rounded-full font-bold text-base md:text-lg ${count < 3 && getTotalCards(tempDeckCounts) < 20 ? 'bg-slate-600 hover:bg-slate-500 text-white' : 'bg-slate-800 text-slate-600'}`}>+</button>
          </div>
        )}
      </div>
    );
  };
  const renderTutorialModal = () => (
    <div className="fixed inset-0 bg-black/90 z-[9999] flex flex-col items-center justify-center p-4 backdrop-blur-md">
      <div className="bg-slate-800 p-6 md:p-10 rounded-2xl border-2 border-slate-500 w-full max-w-3xl overflow-y-auto max-h-[90vh] shadow-[0_0_30px_rgba(0,0,0,0.8)] animate-draw">
        <h2 className="text-3xl md:text-4xl font-black mb-6 text-center text-white flex items-center justify-center gap-3"><HelpCircle className="w-8 h-8 text-indigo-400"/> 게임 방법</h2>
        
        <div className="space-y-6 text-slate-300 leading-relaxed text-sm md:text-base">
          <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
            <h3 className="text-xl font-bold text-indigo-300 mb-2">⚔️ 전투 진행</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>플레이어는 매 턴 3의 <strong>마나</strong>를 회복하고, 최대 10장까지 카드를 뽑습니다.</li>
              <li>공격 카드는 항상 <strong>가장 앞(▼ 타겟)</strong>에 있는 적을 향합니다. 적을 쓰러뜨리면 뒤의 적이 앞으로 당겨집니다.</li>
              <li>내 턴이 끝나면 손에 남은 카드는 모두 무덤으로 버려집니다. 카드를 다 쓰면 무덤의 카드를 섞어 다시 뽑습니다.</li>
            </ul>
          </div>
          
          <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
            <h3 className="text-xl font-bold text-purple-300 mb-2">✨ 버프와 디버프</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong className="text-red-400">근력</strong>: 공격 카드의 최종 피해량이 타수마다 증가합니다. (턴마다 수치 비례 감소)</li>
              <li><strong className="text-blue-400">민첩</strong>: 방어 카드의 방어도 획득량이 증가합니다. (턴마다 수치 비례 감소)</li>
              <li><strong className="text-orange-400">약화</strong>: 공격 시 가하는 피해가 3% 감소합니다. (턴마다 수치 비례 감소)</li>
              <li><strong className="text-purple-400">취약</strong>: 공격 받을 때 입는 피해가 30% 증가합니다. (턴마다 수치 비례 감소)</li>
            </ul>
          </div>

          <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
            <h3 className="text-xl font-bold text-yellow-400 mb-2">🎁 상점과 등급</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>적을 쓰러뜨리고 얻은 크레딧으로 <strong>최대 체력 증가</strong>, <strong>카드 영구 강화</strong>, <strong>새로운 카드 뽑기(가챠)</strong>를 할 수 있습니다.</li>
              <li>카드 등급: <span className="text-slate-400 font-bold">일반(Common)</span> / <span className="text-cyan-400 font-bold">희귀(Uncommon)</span> / <span className="text-yellow-400 font-bold">전설(Rare)</span></li>
              <li>전설 카드는 엄청난 성능을 자랑하며 배경과 테두리 효과로 구별됩니다!</li>
            </ul>
          </div>

          <div className="bg-red-950/50 p-5 rounded-lg border-2 border-red-600 shadow-[0_0_15px_rgba(220,38,38,0.3)]">
            <h3 className="text-xl font-black text-red-400 mb-2 flex items-center gap-2"><AlertTriangle className="w-6 h-6"/> 세이브 데이터 안내 (필독!)</h3>
            <p className="font-bold text-white mb-2">게임 진행 상황은 브라우저 환경에 따라 초기화될 위험이 있습니다.</p>
            <p>안전한 플레이를 위해 <strong>[설정]</strong> 메뉴에서 주기적으로 <strong className="text-emerald-400">[전체 세이브 복사]</strong>를 눌러 텍스트 코드를 메모장 등에 보관해 주세요!</p>
          </div>
        </div>

        <button onClick={() => setTutorialModalOpen(false)} className="mt-8 w-full py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xl font-bold transition-all shadow-[0_0_15px_rgba(79,70,229,0.5)]">
          확인했습니다
        </button>
      </div>
    </div>
  );

  const renderMenu = () => (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-slate-900 text-white p-4 relative overflow-hidden">
      <button onClick={toggleFullScreen} className="fixed top-4 left-4 flex z-50 items-center gap-2 bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded text-sm font-bold transition-colors border border-slate-600">
        <Maximize className="w-4 h-4"/> <span className="hidden sm:inline">전체화면</span>
      </button>

      {toastMsg && <div className="fixed top-10 left-1/2 -translate-x-1/2 bg-green-600 px-6 py-3 rounded shadow-lg font-bold animate-pulse z-50 whitespace-nowrap">{toastMsg}</div>}
      <Sword className="w-24 h-24 mb-6 text-indigo-500 animate-pulse" />
      <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-wider text-center">로그라이크 택틱스</h1>
      <div className="flex items-center gap-2 bg-yellow-900/50 text-yellow-400 px-4 py-2 rounded-full font-bold mb-8 border border-yellow-700 shadow-inner">
        <Coins className="w-5 h-5"/> {credits} 크레딧
      </div>
      
      <div className="flex flex-col gap-3 w-full max-w-[280px]">
        <button onClick={openDeckBuilder} className="py-3 px-6 bg-slate-700 hover:bg-slate-600 rounded-lg text-lg font-bold transition-all">
          덱 구성 ({getTotalCards()}/20)
        </button>
        <div className="flex gap-2">
          <button onClick={openEncyclopedia} className="py-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-lg font-bold transition-all flex justify-center items-center gap-2 border border-slate-600 flex-1">
            <Book className="w-5 h-5"/> 도감
          </button>
          <button onClick={openMonsterDex} className="py-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-lg font-bold transition-all flex justify-center items-center gap-2 border border-slate-600 flex-1">
            <Skull className="w-5 h-5 text-red-400"/> 적 정보
          </button>
        </div>
        <button onClick={openShop} className="py-3 px-6 bg-yellow-600 hover:bg-yellow-500 rounded-lg text-lg font-bold transition-all flex justify-center items-center gap-2 shadow-[0_0_10px_rgba(202,138,4,0.3)]">
          <Store className="w-5 h-5"/> 상점
        </button>
        <div className="flex gap-2">
          <button onClick={() => setTutorialModalOpen(true)} className="py-3 bg-blue-800 hover:bg-blue-700 rounded-lg text-lg font-bold transition-all flex justify-center items-center gap-2 border border-blue-600 flex-1">
            <HelpCircle className="w-5 h-5"/> 방법
          </button>
          <button onClick={() => setGameState('SETTINGS')} className="py-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-lg font-bold transition-all flex justify-center items-center gap-2 border border-slate-600 flex-1">
            <Settings className="w-5 h-5"/> 설정
          </button>
        </div>
        
        <hr className="border-slate-700 my-2" />
        <button onClick={() => startBattle('NORMAL')} disabled={getTotalCards() !== 20} className={`py-3 px-6 rounded-lg text-lg font-bold transition-all ${getTotalCards() === 20 ? 'bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.5)]' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}>
          일반 모드 (100층)
        </button>
        <button onClick={() => startBattle('HARD')} disabled={!normalCleared || getTotalCards() !== 20} className={`py-2 px-6 rounded-lg text-base font-bold transition-all flex flex-col items-center ${normalCleared && getTotalCards() === 20 ? 'bg-red-700 hover:bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)] text-white' : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'}`}>
          하드 모드 (무한)
          {!normalCleared && <span className="text-[10px] text-red-400 mt-1">일반 100층 클리어 시 개방</span>}
        </button>
        
        {/* 층 도약 (Skip) 버튼 */}
        {maxStageReached >= 50 && (
          <button onClick={() => setSkipModalOpen(true)} className="mt-2 py-2 px-6 rounded-lg text-base font-bold transition-all bg-emerald-700 hover:bg-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.4)] text-white flex flex-col items-center">
            스테이지 도약 (Skip)
            <span className="text-[10px] text-emerald-200 mt-1">원하는 층에서 시작</span>
          </button>
        )}
      </div>

      {tutorialModalOpen && renderTutorialModal()}

      {skipModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-800 p-6 rounded-xl border-2 border-emerald-600 w-full max-w-md animate-draw shadow-2xl">
            <h3 className="text-2xl font-bold mb-4 text-emerald-400">스테이지 도약</h3>
            <p className="text-slate-300 text-sm mb-4">도달했던 최고 층({maxStageReached}층)까지 건너뛸 수 있습니다. 단, 중간 보상(카드 추가, 영구 삭제 등)은 획득하지 못한 채 덱 구성 그대로 시작하게 됩니다.</p>
            <div className="flex gap-4 items-center bg-slate-900 p-4 rounded-lg mb-6 border border-slate-700">
              <span className="font-bold whitespace-nowrap">시작할 층:</span>
              <input 
                type="number" 
                min="1" 
                max={maxStageReached}
                value={warpStage}
                onChange={(e) => {
                  let val = parseInt(e.target.value) || 1;
                  if (val > maxStageReached) val = maxStageReached;
                  setWarpStage(val);
                }}
                className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-xl font-bold text-center outline-none focus:border-emerald-500"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setSkipModalOpen(false)} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded font-bold">취소</button>
              <button onClick={() => {
                if (getTotalCards() === 20) {
                  startBattle('NORMAL', warpStage);
                } else {
                  setToastMsg('덱을 20장 구성해야 합니다.');
                  setTimeout(()=>setToastMsg(''),2000);
                }
              }} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded font-bold shadow-[0_0_15px_rgba(16,185,129,0.5)]">출발하기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderMonsterDex = () => {
    const allMonsters = [
      ...ENEMIES.map(e => ({ ...e, isBoss: false, hint: "일반 스테이지에서 무작위로 등장합니다." })),
      ...NORMAL_BOSSES.map((b, i) => ({ ...b, isBoss: true, hint: `${(i+1)*5}층 등에서 등장하는 강력 보스` })),
      { ...SPECIAL_BOSSES[25], isBoss: true, hint: "25층에서 등장하는 특수 보스" },
      { ...SPECIAL_BOSSES[50], isBoss: true, hint: "50층에서 등장하는 특수 보스" },
      { ...SPECIAL_BOSSES[75], isBoss: true, hint: "75층에서 등장하는 특수 보스" },
      { ...SPECIAL_BOSSES[100], isBoss: true, hint: "100층을 지키는 최종 보스" },
    ];

    return (
      <div className="flex flex-col min-h-[100dvh] bg-slate-900 text-white pt-16 md:pt-4 p-4 md:p-10 relative">
        <button onClick={toggleFullScreen} className="fixed top-4 left-4 z-50 flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded text-sm font-bold transition-colors border border-slate-600">
          <Maximize className="w-4 h-4"/> <span className="hidden md:inline">전체화면</span>
        </button>
        
        <div className="flex justify-between items-center mb-8 pl-0 md:pl-32">
          <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3"><FileQuestion className="w-8 h-8 text-red-400"/> 몬스터 도감</h2>
          <button onClick={() => setGameState('MENU')} className="py-2 px-4 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-bold text-sm md:text-base shrink-0 shadow-md">메인으로</button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 overflow-y-auto hide-scrollbar pb-10 w-full max-w-6xl mx-auto px-2">
          {allMonsters.map((monster, idx) => {
            const isSeen = seenEnemies.includes(monster.name);
            return (
              <div key={idx} onClick={() => isSeen && setDexViewingEnemy(monster)} className={`p-5 rounded-xl border-2 flex flex-col relative overflow-visible transition-all h-auto min-h-[280px] shadow-lg group ${isSeen ? 'cursor-pointer hover:-translate-y-2 hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] ' + (monster.isBoss ? 'border-red-500 bg-red-950/40' : 'border-slate-600 bg-slate-800') : 'border-slate-800 bg-slate-900'}`}>
                {isSeen ? (
                  <>
                    <div className="flex items-center gap-4 mb-4 border-b border-slate-700 pb-4">
                      <Skull className={`w-10 h-10 md:w-12 md:h-12 ${monster.isBoss ? 'text-red-400' : 'text-slate-300'}`} />
                      <div>
                        <div className={`font-black text-xl md:text-2xl ${monster.isBoss ? 'text-red-300 drop-shadow-md' : 'text-white'}`}>{monster.name} {monster.isBoss && <span className="text-xs bg-red-800 px-1.5 py-0.5 rounded ml-2 align-middle border border-red-500">BOSS</span>}</div>
                        <div className="text-sm text-slate-400 mt-1">기본 체력: {monster.baseHp}</div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-slate-300 mb-2">사용 스킬:</div>
                      <div className="flex flex-wrap gap-2">
                        {monster.deck.map((skill, i) => (
                          <span tabIndex="0" key={i} className="text-xs font-bold bg-slate-700 text-slate-200 px-2.5 py-1.5 rounded shadow-sm tooltip-trigger relative cursor-help z-50">
                            {skill.name}
                            <div className="tooltip-content absolute bottom-[120%] left-1/2 -translate-x-1/2 w-48 bg-slate-800 p-2 rounded text-center z-[9999] pointer-events-none text-white whitespace-normal shadow-xl border border-slate-600 font-normal leading-snug">
                              {skill.desc}
                            </div>
                          </span>
                        ))}
                      </div>
                      {monster.passives && monster.passives.length > 0 && (
                        <div className="mt-4">
                          <div className="text-sm font-bold text-yellow-400 mb-2">패시브:</div>
                          {monster.passives.map(p => <div key={p.id} className="text-xs text-yellow-200 bg-yellow-900/30 border border-yellow-700/50 p-2 rounded leading-snug"><span className="font-bold">{p.name}</span>: {p.desc}</div>)}
                        </div>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl backdrop-blur-sm z-20">
                      <span className="bg-indigo-600 text-white font-bold px-5 py-2.5 rounded-full shadow-[0_0_15px_rgba(79,70,229,0.6)]">클릭하여 스킬 상세 보기</span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full opacity-60">
                    <div className="blur-md mb-4"><Skull className="w-16 h-16 text-slate-600" /></div>
                    <h3 className="text-xl font-black text-slate-500 tracking-widest mb-3">???</h3>
                    <p className="text-sm text-slate-400 text-center px-4">{monster.hint}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {dexViewingEnemy && (
          <div className="fixed inset-0 bg-black/85 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setDexViewingEnemy(null)}>
            <div className="bg-slate-800 p-4 md:p-6 rounded-2xl border-2 border-slate-600 w-full max-w-4xl max-h-[90vh] flex flex-col animate-draw shadow-2xl" onClick={e => e.stopPropagation()}>
              
              <div className="flex justify-between items-center mb-4 md:mb-6 border-b border-slate-600 pb-4 shrink-0">
                <div className="flex items-center gap-3">
                  <Skull className={`w-8 h-8 md:w-10 md:h-10 ${dexViewingEnemy.isBoss ? 'text-red-400' : 'text-slate-300'}`} />
                  <h3 className={`text-2xl md:text-3xl font-black tracking-tight ${dexViewingEnemy.isBoss ? 'text-red-400' : 'text-white'}`}>
                    {dexViewingEnemy.name}
                    {dexViewingEnemy.isBoss && <span className="text-xs md:text-sm bg-red-800 text-white px-2 py-1 rounded ml-3 align-middle border border-red-500 font-bold">BOSS</span>}
                  </h3>
                </div>
                <button onClick={() => setDexViewingEnemy(null)} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-bold text-sm md:text-base border border-slate-500 transition-colors">닫기</button>
              </div>

              <div className="overflow-y-auto hide-scrollbar flex-1 pr-2">
                <div className="mb-6 flex flex-wrap items-center gap-4">
                  <span className="text-sm md:text-base text-slate-200 font-bold bg-slate-900 px-4 py-2 rounded-lg border border-slate-700 shadow-inner">기본 체력: <span className="text-green-400">{dexViewingEnemy.baseHp}</span></span>
                </div>

                {dexViewingEnemy.passives && dexViewingEnemy.passives.length > 0 && (
                  <div className="mb-8">
                    <h4 className="text-lg md:text-xl font-bold text-yellow-400 mb-3 flex items-center gap-2"><Zap className="w-5 h-5"/> 패시브 스킬</h4>
                    <div className="flex flex-col gap-3">
                      {dexViewingEnemy.passives.map(p => (
                        <div key={p.id} className="bg-yellow-900/20 border border-yellow-700/50 p-4 rounded-xl flex flex-col shadow-inner">
                          <span className="font-black text-yellow-400 text-base md:text-lg drop-shadow-md">{p.name}</span>
                          <span className="text-sm md:text-base text-yellow-100/80 mt-1">{p.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="text-lg md:text-xl font-bold text-slate-200 mb-4 flex items-center gap-2"><Sword className="w-5 h-5"/> 사용 스킬 (패턴)</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                    {dexViewingEnemy.deck.map((eCard, idx) => (
                      <div key={idx} className={`p-4 md:p-5 rounded-2xl border-2 flex flex-col justify-between shadow-lg transition-transform hover:-translate-y-1 ${eCard.type.includes('attack') ? 'border-red-500/50 bg-red-950/30' : eCard.type.includes('defend') ? 'border-blue-500/50 bg-blue-950/30' : 'border-purple-500/50 bg-purple-950/30'}`}>
                        <div className="font-black text-lg md:text-xl mb-3 text-white drop-shadow-md">{eCard.name}</div>
                        <div className="text-xs md:text-sm text-slate-200 bg-black/60 p-3 rounded-xl relative leading-relaxed border border-slate-700/50 flex items-center h-full">
                          <div className="w-full text-center">{eCard.desc} {renderTooltipIcon(eCard.desc)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSettings = () => (
    <div className="flex flex-col min-h-[100dvh] bg-slate-900 text-white p-6 md:p-10 relative">
      {toastMsg && <div className="fixed top-10 left-1/2 transform -translate-x-1/2 bg-green-600 px-6 py-3 rounded shadow-lg font-bold z-[9999] animate-pulse">{toastMsg}</div>}
      
      <div className="flex justify-between items-center mb-8 pl-0 w-full max-w-3xl mx-auto pt-10 md:pt-0">
        <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3"><Settings className="w-8 h-8 text-slate-400"/> 게임 설정</h2>
        <button onClick={() => setGameState('MENU')} className="py-2 px-4 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-bold text-sm md:text-base shadow-md">메인으로</button>
      </div>

      <div className="w-full max-w-3xl mx-auto flex flex-col gap-6 overflow-y-auto hide-scrollbar pb-10">
        
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-600 shadow-lg">
          <h3 className="text-xl font-bold mb-4 border-b border-slate-700 pb-2">옵션</h3>
          <div className="flex justify-between items-center">
            <div>
              <div className="font-bold flex items-center gap-2"><FastForward className="w-5 h-5 text-indigo-400"/> 빠른 전투 모드</div>
              <div className="text-sm text-slate-400 mt-1">적의 턴 진행과 애니메이션을 가속합니다.</div>
            </div>
            <button onClick={() => {
              const newVal = !fastMode;
              setFastMode(newVal);
              saveGame({ fastMode: newVal });
            }} className={`w-14 h-8 rounded-full transition-colors relative ${fastMode ? 'bg-indigo-500' : 'bg-slate-600'}`}>
              <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-transform ${fastMode ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        </div>

        <div className="bg-slate-800 p-6 rounded-xl border border-slate-600 shadow-lg">
          <h3 className="text-xl font-bold mb-4 border-b border-slate-700 pb-2">전체 데이터 관리</h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <button onClick={handleExport} className="py-3 px-4 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-bold flex-1 flex justify-center items-center gap-2 transition-colors border border-slate-500"><Download className="w-5 h-5"/>전체 세이브 복사</button>
            <button onClick={() => setImportModalOpen(true)} className="py-3 px-4 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-bold flex-1 flex justify-center items-center gap-2 transition-colors border border-slate-500"><Upload className="w-5 h-5"/>전체 세이브 붙여넣기</button>
          </div>
        </div>

        <div className="bg-slate-800 p-6 rounded-xl border border-yellow-700 shadow-[0_0_15px_rgba(202,138,4,0.15)]">
          <h3 className="text-xl font-bold mb-4 border-b border-slate-700 pb-2 flex items-center gap-2 text-yellow-400">
            <Gift className="w-5 h-5"/> 쿠폰 코드 입력
          </h3>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="코드를 입력하세요 (예: WELCOME)" 
              className="flex-1 bg-slate-900 border border-slate-600 rounded-lg p-3 text-white outline-none focus:border-yellow-500 uppercase font-bold"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
            />
            <button onClick={handleCoupon} className="bg-yellow-600 hover:bg-yellow-500 px-6 py-2 rounded-lg font-bold transition-colors shadow-md text-white whitespace-nowrap">보상 받기</button>
          </div>
          <p className="text-xs text-slate-400 mt-3">* 쿠폰은 계정당 1회만 사용할 수 있습니다.</p>
        </div>
        
        <div className="bg-gray-950 p-6 rounded-xl border-2 border-red-900 mt-6 shadow-[0_0_25px_rgba(153,27,27,0.3)] animate-draw">
        <h3 className="text-xl font-bold mb-4 text-red-400 flex items-center gap-2 border-b border-red-900/30 pb-2">
          <AlertTriangle className="w-5 h-5"/> 프로그램 안전 종료
        </h3>
        <button 
          onClick={handleExitGame}
          className="w-full py-4 bg-red-700 hover:bg-red-600 rounded-xl font-black text-xl flex justify-center items-center gap-3 transition-all active:scale-95 shadow-[0_0_20px_rgba(185,28,28,0.4)]"
        >
          <Save className="w-6 h-6"/> 저장하고 완전히 나가기
        </button>
        <p className="text-center text-slate-500 text-xs mt-3">
          ※ 클릭 시 모든 진행 상황을 저장하고 게임을 종료합니다.
        </p>
      </div>

        <div className="bg-gray-950 p-6 rounded-xl border border-red-900 mt-2 shadow-[0_0_20px_rgba(153,27,27,0.2)]">
          <h3 className="text-xl font-bold mb-4 border-b border-red-900 pb-2 flex items-center gap-2 text-red-400">
            <AlertTriangle className="w-5 h-5"/> 시스템 관리자
          </h3>
          
          {!isAdminUnlocked ? (
            <div className="flex gap-2">
              <input 
                type="password" 
                placeholder="관리자 코드 입력" 
                className="flex-1 bg-slate-800 border border-slate-600 rounded p-2 text-white outline-none focus:border-red-500"
                value={adminCodeInput}
                onChange={(e) => setAdminCodeInput(e.target.value)}
              />
              <button onClick={handleAdminUnlock} className="bg-red-700 hover:bg-red-600 px-4 py-2 rounded font-bold">인증</button>
            </div>
          ) : (
            <div className="flex flex-col gap-4 animate-draw">
              <div className="text-green-400 font-bold mb-2 bg-green-900/30 border border-green-800 p-2 rounded text-center">✅ 개발자 권한이 승인되었습니다.</div>
              <div className="flex gap-2">
                <button onClick={adminUnlockAllCards} className="flex-1 bg-slate-700 hover:bg-slate-600 py-3 rounded font-bold text-sm">모든 카드 해금</button>
                <button onClick={adminGiveMoney} className="flex-1 bg-yellow-700 hover:bg-yellow-600 py-3 rounded font-bold text-sm">크레딧 +99,999</button>
              </div>
              <div className="flex gap-2 items-center bg-slate-800 p-3 rounded border border-slate-700 mt-2">
                <span className="font-bold text-slate-300 whitespace-nowrap">워프(층수):</span>
                <input 
                  type="number" 
                  min="1" 
                  className="w-20 bg-slate-900 border border-slate-600 rounded p-2 text-center text-lg font-bold outline-none"
                  value={warpStage}
                  onChange={(e) => setWarpStage(parseInt(e.target.value) || 1)}
                />
                <button onClick={() => startBattle('NORMAL', warpStage)} disabled={getTotalCards() !== 20} className="flex-1 bg-indigo-700 hover:bg-indigo-600 py-2 rounded font-bold transition-colors">
                  바로 출발
                </button>
              </div>
              {getTotalCards() !== 20 && <div className="text-red-400 text-xs text-right mt-1">워프하려면 먼저 덱을 구성해야 합니다.</div>}
            </div>
          )}
        </div>

      </div>

      {importModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center p-4">
          <div className="bg-slate-800 p-6 rounded-xl border-2 border-slate-600 w-full max-w-md animate-draw shadow-2xl">
            <h3 className="text-2xl font-bold mb-4">세이브 코드 불러오기</h3>
            <textarea className="w-full h-32 bg-slate-900 text-white p-3 rounded mb-4 focus:outline-none focus:border-indigo-500 border border-slate-700" placeholder="여기에 복사한 세이브 코드를 붙여넣으세요..." value={importText} onChange={(e) => setImportText(e.target.value)} />
            <div className="flex justify-end gap-3">
              <button onClick={() => setImportModalOpen(false)} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded font-bold">취소</button>
              <button onClick={() => handleImport(importText)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded font-bold">불러오기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderEncyclopedia = () => {
    const filteredCards = getFilteredCards(filterType, filterEffect, filterRarity, filterOwnership, searchQuery);

    return (
      <div className="flex flex-col min-h-[100dvh] bg-slate-900 text-white pt-16 md:pt-4 p-4 md:p-10 relative">
        <button onClick={toggleFullScreen} className="fixed top-4 left-4 z-50 flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded text-sm font-bold transition-colors border border-slate-600">
          <Maximize className="w-4 h-4"/> <span className="hidden md:inline">전체화면</span>
        </button>

        <div className="flex justify-between items-center mb-4 pl-0 md:pl-32">
          <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3"><Book className="w-8 h-8 text-blue-400"/> 카드 도감</h2>
          <button onClick={() => setGameState('MENU')} className="py-2 px-4 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-bold text-sm md:text-base shrink-0 shadow-md">메인으로</button>
        </div>

        {renderFiltersUI(filterType, setFilterType, filterEffect, setFilterEffect, filterRarity, setFilterRarity, filterOwnership, setFilterOwnership, searchQuery, setSearchQuery)}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 overflow-y-auto hide-scrollbar pb-10 w-full max-w-6xl mx-auto px-4">
          {filteredCards.map(baseCard => {
            const isOwned = (unlockedCards || []).includes(baseCard.id);
            const card = getCardDef(baseCard.id);
            if (!card) return null;
            return (
              // React 렌더링 에러를 막기 위해 key를 명시한 div로 감싸줍니다.
              <div key={baseCard.id} className="flex justify-center items-center w-full h-full">
                {renderCard(card, null, !isOwned)}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDeckBuilder = () => {
    // 수정된 부분: 'owned' 를 하드코딩으로 넣어 내가 가진 카드만 필터링합니다.
    const filteredCards = getFilteredCards(filterType, filterEffect, filterRarity, 'owned', searchQuery);

    return (
      <div className="flex flex-col h-[100dvh] bg-slate-900 text-white pt-16 md:pt-4 p-4 md:p-10 relative">
        <button onClick={toggleFullScreen} className="fixed top-4 left-4 z-50 flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded text-sm font-bold transition-colors border border-slate-600">
          <Maximize className="w-4 h-4"/> <span className="hidden md:inline">전체화면</span>
        </button>

        {toastMsg && <div className="fixed top-10 left-1/2 transform -translate-x-1/2 bg-green-600 px-6 py-3 rounded shadow-lg font-bold z-[9999] animate-pulse">{toastMsg}</div>}
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 pl-0 md:pl-32 gap-4">
          <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3 shrink-0">시작 덱 구성</h2>
          
          <div className="flex flex-wrap items-center gap-2 md:gap-3 shrink-0 w-full md:w-auto justify-end">
            <span className={`text-sm md:text-lg font-bold mr-2 ${getTotalCards(tempDeckCounts) === 20 ? 'text-green-400' : 'text-yellow-400'}`}>총 {getTotalCards(tempDeckCounts)}/20장</span>
            
            <button onClick={handleClearDeck} className="flex items-center gap-1 md:gap-2 py-2 px-3 bg-red-800 hover:bg-red-700 rounded-lg font-bold transition-all text-xs md:text-sm border border-red-600">
              <Eraser className="w-4 h-4"/> 비우기
            </button>

            <button onClick={handleDeckExport} className="flex items-center gap-1 md:gap-2 py-2 px-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-bold transition-all text-xs md:text-sm border border-slate-500" title="덱 복사">
              <Download className="w-4 h-4"/> 덱 복사
            </button>

            <button onClick={() => setDeckImportModalOpen(true)} className="flex items-center gap-1 md:gap-2 py-2 px-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-bold transition-all text-xs md:text-sm border border-slate-500" title="덱 붙여넣기">
              <Upload className="w-4 h-4"/> 덱 붙여넣기
            </button>

            <button onClick={() => {
              setDeckCounts(tempDeckCounts);
              saveGame({ deckCounts: tempDeckCounts });
              setToastMsg('덱이 저장되었습니다!');
              setTimeout(()=>setToastMsg(''), 2000);
            }} className="flex items-center gap-1 md:gap-2 py-2 px-3 md:px-4 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-bold transition-all text-sm md:text-base shadow-md">
              <Save className="w-4 h-4 md:w-5 md:h-5"/> 저장
            </button>
            
            <button onClick={() => setGameState('MENU')} className="py-2 px-3 md:px-4 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-bold text-sm md:text-base shadow-md">메인으로</button>
          </div>
        </div>

        {/* 수정된 부분: 보유/미보유 필터 버튼을 없애기 위해 뒤에 null, null 을 전달합니다. */}
        {renderFiltersUI(filterType, setFilterType, filterEffect, setFilterEffect, filterRarity, setFilterRarity, null, null, searchQuery, setSearchQuery)}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 overflow-y-auto hide-scrollbar pb-10 w-full max-w-6xl mx-auto px-4">
          {filteredCards.map(baseCard => {
            const count = tempDeckCounts[baseCard.id] || 0;
            const card = getCardDef(baseCard.id, shopUpgrades); 
            if (!card) return null;
            // 보유한 카드만 나오기 때문에 isLocked는 무조건 false로 고정합니다.
            return renderCard(card, count, false, handleAddCard, handleRemoveCard);
          })}
        </div>

        {deckImportModalOpen && (
          <div className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-slate-800 p-6 rounded-xl border-2 border-slate-600 w-full max-w-md animate-draw shadow-2xl">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2"><Upload className="w-6 h-6 text-indigo-400"/> 덱 코드 붙여넣기</h3>
              <p className="text-sm text-slate-400 mb-4">공유받은 덱 코드(문자열)를 붙여넣어 현재 덱을 덮어씁니다.</p>
              <textarea className="w-full h-32 bg-slate-900 text-white p-3 rounded mb-4 focus:outline-none focus:border-indigo-500 border border-slate-700" placeholder="여기에 덱 코드를 붙여넣으세요..." value={deckImportText} onChange={(e) => setDeckImportText(e.target.value)} />
              <div className="flex justify-end gap-3">
                <button onClick={() => setDeckImportModalOpen(false)} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded font-bold">취소</button>
                <button onClick={handleDeckImport} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded font-bold">덱 불러오기</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderBattleUI = () => {
    if (!combatState) return null;
    const { player, enemies, hand, turn, stage, drawPile, discardPile, baseDeck, mode } = combatState;
    
    let pileCards = [];
    let pileTitle = "";
    if (viewingPile === 'baseDeck') { pileCards = baseDeck; pileTitle = "전체 덱"; }
    else if (viewingPile === 'drawPile') { pileCards = drawPile; pileTitle = "뽑을 패"; }
    else if (viewingPile === 'discardPile') { pileCards = discardPile; pileTitle = "무덤 (버린 패)"; }

    const isPlayerTurn = turn === 'PLAYER';

    return (
      <div className="flex flex-col h-[100dvh] bg-slate-900 text-white p-2 md:p-4 relative overflow-hidden">
        {/* 상단 정보바 */}
        <div className="flex justify-between items-center bg-slate-800/80 p-2 md:p-3 rounded-lg border border-slate-700 shadow-md z-10 shrink-0">
          <div className="font-bold text-sm md:text-lg flex items-center gap-1 md:gap-2 text-indigo-300">
            <RefreshCw className="w-4 h-4 md:w-5 md:h-5" /> {mode === 'HARD' ? '하드 모드' : '일반 모드'} - STAGE {stage} 
          </div>
          <div className="flex items-center gap-2 md:gap-6 font-bold text-xs md:text-base">
            <span 
              className="text-slate-400 cursor-pointer hover:text-white transition-colors bg-slate-700/50 px-2 py-1 rounded border border-slate-600"
              onClick={() => setViewingPile('baseDeck')}
            >
              총 덱: {baseDeck.length}장 (보기)
            </span>
            <button onClick={() => setGameState('GAME_OVER')} className="text-slate-500 hover:text-red-500 opacity-60 hover:opacity-100 transition-all border border-slate-600 rounded px-2 py-1" title="전투 포기">포기</button>
          </div>
        </div>

        {/* 턴 인디케이터 (배경 애니메이션) */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0 opacity-[0.03]">
          <h1 className="text-[8rem] md:text-[12rem] font-black italic whitespace-nowrap tracking-tighter">
            {isPlayerTurn ? 'PLAYER TURN' : 'ENEMY TURN'}
          </h1>
        </div>

        {/* 중앙 전투 영역 (바닥 정렬) */}
        <div className="flex-1 flex flex-row justify-center items-end pb-8 border-b-2 border-slate-700/50 w-full max-w-5xl mx-auto mt-10 relative z-10">
          
          {/* 플레이어 영역 */}
          <div className={`flex flex-col items-center w-1/3 min-w-[120px] transition-all duration-500 origin-bottom ${isPlayerTurn ? 'scale-110 opacity-100 z-30 drop-shadow-[0_0_30px_rgba(79,70,229,0.5)]' : 'scale-95 opacity-50 z-10'}`}>
            <div className="w-20 h-20 md:w-32 md:h-32 bg-slate-700 rounded-full flex justify-center items-center mb-2 md:mb-4 border-4 border-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.3)] relative">
              <Shield className="w-10 h-10 md:w-16 md:h-16 text-indigo-300" />
              {player.block > 0 && <div className="absolute -top-2 -right-2 md:-top-4 md:-right-4 bg-blue-600 w-8 h-8 md:w-10 md:h-10 rounded-full flex justify-center items-center font-bold border-2 border-blue-300 shadow-lg animate-bounce z-20 text-xs md:text-base">{player.block}</div>}
            </div>
            <h3 className="text-base md:text-xl font-bold mb-1 md:mb-2">플레이어</h3>
            <div className="w-full max-w-[120px] md:max-w-[200px] bg-slate-800 h-4 md:h-6 rounded-full overflow-hidden border border-slate-600 relative mb-1 md:mb-2">
              <div className="bg-green-500 h-full transition-all duration-300" style={{ width: `${(player.hp / player.maxHp) * 100}%` }}/>
              <span className="absolute inset-0 flex justify-center items-center text-[9px] md:text-xs font-bold shadow-black drop-shadow-md">{player.hp} / {player.maxHp}</span>
            </div>
            {/* 플레이어 버프/디버프 렌더링 */}
            {/* 플레이어 버프/디버프 렌더링 */}
            <div className="flex gap-1 md:gap-2 h-8 mt-1 flex-wrap justify-center">
              {player.buffs?.strength > 0 && <span tabIndex="0" className="bg-red-900 text-red-100 text-[10px] md:text-xs px-2 py-1 md:px-3 md:py-1.5 rounded-full font-bold border border-red-500 shadow-md flex items-center tooltip-trigger relative cursor-help outline-none">근력 +{player.buffs.strength}<div className="tooltip-content absolute bottom-[120%] left-1/2 -translate-x-1/2 w-32 bg-slate-800 p-2 rounded text-center z-[9999] pointer-events-none text-white whitespace-normal font-normal text-xs">공격 피해 증가 (턴마다 비례 감소)</div></span>}
              {player.buffs?.dexterity > 0 && <span tabIndex="0" className="bg-blue-900 text-blue-100 text-[10px] md:text-xs px-2 py-1 md:px-3 md:py-1.5 rounded-full font-bold border border-blue-500 shadow-md flex items-center tooltip-trigger relative cursor-help outline-none">민첩 +{player.buffs.dexterity}<div className="tooltip-content absolute bottom-[120%] left-1/2 -translate-x-1/2 w-32 bg-slate-800 p-2 rounded text-center z-[9999] pointer-events-none text-white whitespace-normal font-normal text-xs">방어도 획득량 증가 (턴마다 비례 감소)</div></span>}
              
              {/* [신규] 가시 버프 뱃지 추가 */}
              {player.buffs?.thorns > 0 && <span tabIndex="0" className="bg-emerald-900 text-emerald-100 text-[10px] md:text-xs px-2 py-1 md:px-3 md:py-1.5 rounded-full font-bold border border-emerald-500 shadow-md flex items-center tooltip-trigger relative cursor-help outline-none">가시 {player.buffs.thorns}<div className="tooltip-content absolute bottom-[120%] left-1/2 -translate-x-1/2 w-32 bg-slate-800 p-2 rounded text-center z-[9999] pointer-events-none text-white whitespace-normal font-normal text-xs">피격 시 공격자에게 피해 반사</div></span>}
              
              {player.debuffs?.weak > 0 && <span tabIndex="0" className="bg-orange-800 text-white text-[10px] md:text-xs px-2 py-1 md:px-3 md:py-1.5 rounded-full font-black border-2 border-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.8)] animate-pulse tooltip-trigger relative cursor-help flex items-center outline-none">약화 {player.debuffs.weak}<div className="tooltip-content absolute bottom-[120%] left-1/2 -translate-x-1/2 w-32 md:w-40 bg-slate-800 p-2 rounded text-center z-[9999] pointer-events-none font-normal text-xs">가하는 피해 3% 감소 (턴마다 비례 감소)</div></span>}
              {player.debuffs?.vulnerable > 0 && <span tabIndex="0" className="bg-purple-800 text-white text-[10px] md:text-xs px-2 py-1 md:px-3 md:py-1.5 rounded-full font-black border-2 border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.8)] animate-pulse tooltip-trigger relative cursor-help flex items-center outline-none">취약 {player.debuffs.vulnerable}<div className="tooltip-content absolute bottom-[120%] left-1/2 -translate-x-1/2 w-32 md:w-40 bg-slate-800 p-2 rounded text-center z-[9999] pointer-events-none font-normal text-xs">받는 피해 30% 증가 (턴마다 비례 감소)</div></span>}
            </div>
          </div>

          <div className="text-3xl md:text-5xl font-black text-slate-700 italic px-6 pb-16">VS</div>

          {/* 다중 적(Enemies) 렌더링 */}
          <div className="flex flex-row gap-4 md:gap-8 justify-center items-end flex-wrap w-1/2">
            {enemies.map((enemy, idx) => {
              const eCard = enemy.intentCard;
              const isVanguard = idx === 0;

              let actualDmg = 0;
              if (eCard.type.includes('attack')) {
                actualDmg = eCard.value + (enemy.buffs.strength || 0);
                if (player.debuffs?.vulnerable > 0) actualDmg = Math.floor(actualDmg * 1.3);
                if (enemy.debuffs?.weak > 0) actualDmg = Math.floor(actualDmg * 0.97);
              }

              return (
                <div key={enemy.uid} className={`flex flex-col items-center cursor-pointer group transition-all duration-500 origin-bottom w-[110px] md:w-auto ${!isPlayerTurn ? 'scale-110 opacity-100 z-30 drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]' : isVanguard ? 'scale-100 opacity-80 z-20' : 'scale-90 opacity-50 z-10'}`} onClick={() => { setViewingEnemy(enemy); setShowEnemyDeck(true); }}>
                  
                  {isVanguard && <div className="text-red-500 font-black text-[10px] md:text-base animate-bounce mb-1 tracking-widest drop-shadow-md">▼ 타겟</div>}
                  
                  <div className="mb-4 md:mb-6 relative z-10 animate-pulse transition-transform group-hover:-translate-y-2">
                    <div className={`w-24 md:w-28 bg-slate-900 border-2 rounded-lg p-2 shadow-xl text-center ${eCard.type.includes('attack') ? 'border-red-500' : eCard.type.includes('defend') ? 'border-blue-500' : 'border-purple-500'}`}>
                      <div className="text-[8px] md:text-[10px] bg-slate-800 rounded px-1 mb-1 font-bold">사용 예정</div>
                      <div className="text-[10px] md:text-sm font-bold truncate text-white">{eCard.name}</div>
                      {actualDmg > 0 && (
                        <div className="mt-1 bg-red-950 border border-red-800 rounded text-red-400 font-black text-[9px] md:text-xs py-0.5">
                          피해: {actualDmg} {eCard.multi ? `x ${eCard.multi}` : ''}
                        </div>
                      )}
                      <div className="text-[8px] md:text-[10px] text-slate-400 mt-1 leading-tight line-clamp-2">{eCard.desc}</div>
                    </div>
                  </div>
                  
                  <div className={`rounded-full flex justify-center items-center mb-1 md:mb-2 border-4 shadow-[0_0_20px_rgba(239,68,68,0.2)] relative transition-all ${enemy.isBoss ? 'bg-red-950 border-red-400 w-20 h-20 md:w-32 md:h-32' : 'bg-red-900/40 border-red-500 group-hover:border-red-400 w-16 h-16 md:w-24 md:h-24'}`}>
                    <Skull className={`${enemy.isBoss ? 'w-10 h-10 md:w-16 md:h-16 text-red-300' : 'w-8 h-8 md:w-12 md:h-12 text-red-400'}`} />
                    {enemy.block > 0 && <div className="absolute -top-1 -right-1 md:-top-2 md:-right-2 bg-slate-600 w-6 h-6 md:w-8 md:h-8 rounded-full flex justify-center items-center font-bold border-2 border-slate-400 shadow-lg animate-bounce z-20 text-[10px] md:text-sm">{enemy.block}</div>}
                    
                    <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[9px] md:text-xs font-bold bg-black/80 px-1 md:px-2 py-1 rounded text-white border border-slate-500">덱 보기</span>
                    </div>
                  </div>
                  
                  <h3 className={`text-xs md:text-lg font-bold mb-1 ${enemy.isBoss ? 'text-red-300' : 'text-red-400'} truncate w-full text-center`}>{enemy.name}</h3>
                  <div className="w-full max-w-[100px] md:max-w-[140px] bg-slate-800 h-3 md:h-5 rounded-full overflow-hidden border border-slate-600 relative">
                    <div className={`${enemy.isBoss ? 'bg-red-600' : 'bg-red-500'} h-full transition-all duration-300`} style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }}/>
                    <span className="absolute inset-0 flex justify-center items-center text-[8px] md:text-[10px] font-bold drop-shadow-md">{enemy.hp} / {enemy.maxHp}</span>
                  </div>
                  
                  {/* 패시브 및 버프/디버프 */}
                  {/* 적 패시브 및 버프/디버프 렌더링 */}
                  <div className="flex gap-1 h-5 md:h-6 mt-1 flex-wrap justify-center w-full">
                    {enemy.passives?.map(p => <span tabIndex="0" key={p.id} className="bg-yellow-800 text-yellow-200 text-[8px] md:text-[9px] px-1 md:px-2 py-0.5 rounded-full font-bold border border-yellow-500 shadow-md truncate max-w-full tooltip-trigger relative cursor-help outline-none" title={p.desc}>{p.name}
                      <div className="tooltip-content absolute bottom-[120%] left-1/2 -translate-x-1/2 w-32 bg-slate-800 p-2 rounded text-center z-[9999] pointer-events-none text-white whitespace-normal font-normal text-xs">{p.desc}</div>
                    </span>)}
                    {enemy.buffs?.strength > 0 && <span tabIndex="0" className="bg-red-900 text-red-100 text-[8px] md:text-[9px] px-1 md:px-2 py-0.5 rounded-full font-bold border border-red-500 shadow-md tooltip-trigger relative cursor-help outline-none">근력 +{enemy.buffs.strength}
                      <div className="tooltip-content absolute bottom-[120%] left-1/2 -translate-x-1/2 w-32 bg-slate-800 p-2 rounded text-center z-[9999] pointer-events-none text-white whitespace-normal font-normal text-xs">공격 피해 증가 (턴마다 비례 감소)</div>
                    </span>}
                    
                    {/* [신규] 중독 디버프 뱃지 추가 */}
                    {enemy.debuffs?.poison > 0 && <span tabIndex="0" className="bg-green-900 text-green-400 text-[8px] md:text-[9px] px-1 md:px-2 py-0.5 rounded-full font-black border border-green-500 tooltip-trigger relative cursor-help outline-none">중독 {enemy.debuffs.poison}
                      <div className="tooltip-content absolute bottom-[120%] left-1/2 -translate-x-1/2 w-32 bg-slate-800 p-2 rounded text-center z-[9999] pointer-events-none text-white whitespace-normal font-normal text-xs">턴 시작 시 피해 (매 턴 1 감소)</div>
                    </span>}

                    {enemy.debuffs?.weak > 0 && <span tabIndex="0" className="bg-orange-800 text-white text-[8px] md:text-[9px] px-1 md:px-2 py-0.5 rounded-full font-black border border-orange-500 tooltip-trigger relative cursor-help outline-none">약화 {enemy.debuffs.weak}
                      <div className="tooltip-content absolute bottom-[120%] left-1/2 -translate-x-1/2 w-32 bg-slate-800 p-2 rounded text-center z-[9999] pointer-events-none text-white whitespace-normal font-normal text-xs">가하는 피해 3% 감소 (턴마다 비례 감소)</div>
                    </span>}
                    {enemy.debuffs?.vulnerable > 0 && <span tabIndex="0" className="bg-purple-800 text-white text-[8px] md:text-[9px] px-1 md:px-2 py-0.5 rounded-full font-black border border-purple-500 tooltip-trigger relative cursor-help outline-none">취약 {enemy.debuffs.vulnerable}
                      <div className="tooltip-content absolute bottom-[120%] left-1/2 -translate-x-1/2 w-32 bg-slate-800 p-2 rounded text-center z-[9999] pointer-events-none text-white whitespace-normal font-normal text-xs">받는 피해 30% 증가 (턴마다 비례 감소)</div>
                    </span>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 하단 패널 (마나, 카드, 무덤 등) */}
        <div className="h-[30vh] min-h-[200px] shrink-0 flex flex-col items-center justify-end pb-2 md:pb-4 relative w-full pt-4 overflow-visible">
          
          <div className="absolute top-0 left-1/2 -translate-x-1/2 text-center font-bold text-slate-300 text-[10px] md:text-sm mb-1 md:mb-2 z-10 border border-slate-700 bg-slate-800/80 px-3 py-1 rounded-full">손패: {hand.length} / {MAX_HAND_SIZE}장</div>

          <div className="flex w-full px-2 md:px-4 relative justify-center items-end h-full">
            
            {/* 좌측: 마나 & 뽑을 패 */}
            <div className="absolute left-0 md:left-4 bottom-4 flex flex-col items-center gap-2 md:gap-6 z-20">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 md:w-20 md:h-20 bg-blue-900 border-[3px] md:border-4 border-blue-400 rounded-full flex justify-center items-center shadow-[0_0_20px_rgba(59,130,246,0.8)]">
                  <span className="text-xl md:text-4xl font-black text-white drop-shadow-md">{player.mana}</span>
                </div>
                <span className="bg-slate-900/80 px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[9px] md:text-xs font-bold text-blue-300 mt-1 md:mt-2 border border-slate-700">마나 / {player.maxMana}</span>
              </div>

              <div className="flex flex-col items-center cursor-pointer group" onClick={() => setViewingPile('drawPile')}>
                 <div className="w-10 h-14 md:w-16 md:h-24 bg-slate-700 border-2 border-slate-500 rounded-lg flex items-center justify-center font-black text-lg md:text-2xl shadow-[3px_3px_0px_rgba(0,0,0,0.5)] group-hover:-translate-y-2 transition-transform">
                   {drawPile.length}
                 </div>
                 <span className="text-slate-300 font-bold mt-1 md:mt-2 text-[9px] md:text-sm group-hover:text-white transition-colors">뽑을 패</span>
              </div>
            </div>

            {/* 중앙: 카드 핸드 (가림 현상 해결 & 데미지 프리뷰 추가) */}
            <div className="flex justify-center items-end w-full px-16 h-full pb-4">
              {hand.map((card, idx) => {
                if (!card) return null;
                const canPlay = turn === 'PLAYER' && player.mana >= card.cost;
                const isAttack = card.type === 'attack';
                const rarityStyle = card.rarity === 'uncommon' ? 'shadow-[0_0_12px_rgba(34,211,238,0.4)] border-cyan-500' : card.rarity === 'rare' ? 'shadow-[0_0_20px_rgba(250,204,21,0.6)] border-yellow-400' : card.rarity === 'special' ? 'shadow-[0_0_25px_rgba(217,70,239,0.7)] border-fuchsia-500' : isAttack ? 'border-red-500' : 'border-blue-500';
                const cardColor = card.isUpgraded ? "border-yellow-400 bg-slate-900" : `bg-slate-900 ${rarityStyle}`;
                const bgSpecial = card.rarity === 'rare' && !card.isUpgraded ? 'legendary-bg' : card.rarity === 'special' && !card.isUpgraded ? 'special-bg' : ''; 

                const offset = idx - (hand.length - 1) / 2;
                const rotation = offset * 4; 
                const translateY = Math.abs(offset) * 6; 
                const isHovered = hoveredCard === idx;

                // 예상 데미지 계산 로직
                let actualDmg = 0;
                if (card.gamble) {
                    actualDmg = card.winDamage || 0;
                    if (actualDmg > 0 && enemies.length > 0 && enemies[0].isBoss && card.winDamageBoss) {
                        actualDmg = card.winDamageBoss;
                    }
                } else if (card.missingHpDamage) {
                    actualDmg = (card.damage || 0) + Math.floor((player.maxHp - player.hp) * card.missingHpDamage);
                } else if (card.consumeAllMana) {
                    actualDmg = (card.damage || 0) + (player.mana * card.manaMultiplier);
                } else {
                    actualDmg = card.damage || 0;
                }

                if (actualDmg > 0) {
                    actualDmg += (player.buffs?.strength || 0);
                    if (player.debuffs?.weak > 0) actualDmg = Math.floor(actualDmg * 0.97); 
                    if (enemies.length > 0 && enemies[0].debuffs?.vulnerable > 0) actualDmg = Math.floor(actualDmg * 1.3);
                }

                // 예상 데미지 프리뷰 텍스트 구성
                let previewText = `⚔️ ${actualDmg}`;
                if (card.multiHit) {
                    if (card.increasingDamage) {
                        let total = 0;
                        let currentBase = card.damage || 0;
                        for (let i = 0; i < card.multiHit; i++) {
                            let hitDmg = currentBase + (player.buffs?.strength || 0);
                            if (player.debuffs?.weak > 0) hitDmg = Math.floor(hitDmg * 0.97);
                            if (enemies.length > 0 && enemies[0].debuffs?.vulnerable > 0) hitDmg = Math.floor(hitDmg * 1.3);
                            total += hitDmg;
                            currentBase += card.increasingDamage;
                        }
                        previewText = `⚔️ ${actualDmg} ~ 총합 ${total}`;
                    } else {
                        previewText = `⚔️ ${actualDmg} x ${card.multiHit} = ${actualDmg * card.multiHit}`;
                    }
                }

                // 예상 방어도 계산
                let actualBlock = card.block || 0;
                if (card.percentBlockMaxHp && !card.gamble) {
                    actualBlock += Math.floor(player.maxHp * (card.percentBlockMaxHp / 100));
                }
                if (actualBlock > 0) {
                    actualBlock += (player.buffs?.dexterity || 0);
                }

                return (
                  <div 
                    key={card.uid} 
                    onMouseEnter={() => setHoveredCard(idx)}
                    onMouseLeave={() => setHoveredCard(null)}
                    className="relative transition-all duration-300 ease-out origin-bottom -ml-6 md:-ml-10 first:ml-0"
                    style={{ 
                      animationDelay: `${idx * 0.05}s`,
                      zIndex: isHovered ? 100 : 10 + idx, 
                      transform: isHovered 
                          ? `translateY(-80px) scale(1.15) rotate(0deg)` 
                          : `translateY(${translateY}px) rotate(${rotation}deg)`
                    }}
                  >
                    {/* 카드 프리뷰 인디케이터 */}
                    {actualDmg > 0 && (
                      <div className="absolute -top-4 md:-top-5 left-1/2 -translate-x-1/2 bg-red-950 text-red-300 border border-red-500 rounded-full px-2 py-0.5 text-[9px] md:text-[11px] font-black whitespace-nowrap shadow-[0_0_10px_rgba(239,68,68,0.5)] z-20">
                        {previewText} {card.gamble && ' (성공 시)'}
                      </div>
                    )}
                    {actualBlock > 0 && (
                      <div className={`absolute ${actualDmg > 0 ? '-top-10 md:-top-12' : '-top-4 md:-top-5'} left-1/2 -translate-x-1/2 bg-blue-950 text-blue-300 border border-blue-500 rounded-full px-2 py-0.5 text-[9px] md:text-[11px] font-black whitespace-nowrap shadow-[0_0_10px_rgba(59,130,246,0.5)] z-20 transition-all`}>
                        🛡️ {actualBlock} {card.doubleBlock ? '(현재 방어도x2)' : ''}
                      </div>
                    )}
                    {card.doubleBlock && actualBlock === 0 && (
                        <div className={`absolute -top-4 md:-top-5 left-1/2 -translate-x-1/2 bg-blue-950 text-blue-300 border border-blue-500 rounded-full px-2 py-0.5 text-[9px] md:text-[11px] font-black whitespace-nowrap shadow-[0_0_10px_rgba(59,130,246,0.5)] z-20 transition-all`}>
                        🛡️ 방어도 2배!
                      </div>
                    )}

                    <div 
                      onClick={() => canPlay && playCard(idx)} 
                      className={`w-28 h-40 md:w-36 md:h-48 rounded-xl border-2 p-2 md:p-3 flex flex-col justify-between cursor-pointer shadow-2xl bg-slate-900 ${cardColor} ${bgSpecial} ${canPlay ? '' : 'opacity-50 grayscale cursor-not-allowed'}`} 
                    >
                      <div className="flex justify-between items-start z-10">
                        <span className="font-bold text-[10px] md:text-sm bg-slate-800 px-2 py-1 rounded text-white shadow-inner border border-slate-700">코스트 {card.cost}</span>
                        <div className="flex flex-col items-end gap-1">
                          {card.gamble && <span className="text-[8px] md:text-[10px] text-green-400 font-bold bg-slate-800/80 px-1 rounded border border-green-800">🎲 도박</span>}
                          {card.rarity === 'uncommon' && <span className="text-[8px] md:text-[10px] text-cyan-400 font-bold bg-slate-800/80 px-1 rounded border border-cyan-800">희귀</span>}
                          {card.rarity === 'rare' && <span className="text-[8px] md:text-[10px] text-yellow-400 font-bold bg-slate-800/80 px-1 rounded border border-yellow-700">전설</span>}
                          {card.rarity === 'special' && <span className="text-[8px] md:text-[10px] text-fuchsia-400 font-bold bg-slate-800/80 px-1 rounded border border-fuchsia-800"><Star className="w-2 h-2 inline mb-0.5"/>특수</span>}
                          {isAttack ? <Sword className={`w-4 h-4 md:w-5 md:h-5 ${card.isUpgraded?'text-yellow-400':'text-red-300'}`}/> : <Shield className={`w-4 h-4 md:w-5 md:h-5 ${card.isUpgraded?'text-yellow-400':'text-blue-300'}`}/>}
                        </div>
                      </div>
                      <div className="text-center z-10"><h4 className={`font-extrabold text-sm md:text-lg drop-shadow-md ${card.isUpgraded?'text-yellow-400': card.rarity==='rare'?'text-yellow-300' : card.rarity==='special'?'text-fuchsia-300' : 'text-white'}`}>{card.name}</h4></div>
                      <div className="text-[9px] md:text-xs text-slate-200 text-center leading-tight bg-black/60 p-1 md:p-2 rounded relative border border-slate-700 flex-1 flex items-center justify-center mt-1 z-10">
                        <div>{card.desc} {renderTooltipIcon(card.desc)}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 우측: 턴 종료 & 무덤 */}
            <div className="absolute right-0 md:right-4 bottom-4 flex flex-col items-center gap-2 md:gap-6 z-20">
              <button onClick={() => setCombatState(prev => ({ ...prev, turn: 'ENEMY' }))} disabled={turn !== 'PLAYER'} className={`py-2 px-3 md:py-3 md:px-6 rounded-full font-bold text-[10px] md:text-lg flex items-center gap-1 md:gap-2 transition-all shadow-lg border ${turn === 'PLAYER' ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-[0_0_15px_rgba(217,119,6,0.6)] border-amber-400' : 'bg-slate-800 text-slate-500 cursor-not-allowed border-slate-700'}`}>
                {turn === 'PLAYER' ? '턴 종료' : '적 턴...'} <ArrowRightCircle className="w-3 h-3 md:w-5 md:h-5"/>
              </button>

              <div className="flex flex-col items-center cursor-pointer group" onClick={() => setViewingPile('discardPile')}>
                 <div className="w-10 h-14 md:w-16 md:h-24 bg-slate-800 border-2 border-slate-600 rounded-lg flex items-center justify-center font-black text-lg md:text-2xl shadow-lg opacity-80 group-hover:-translate-y-2 group-hover:opacity-100 transition-all">
                   {discardPile.length}
                 </div>
                 <span className="text-slate-400 font-bold mt-1 md:mt-2 text-[9px] md:text-sm group-hover:text-white transition-colors">무덤</span>
              </div>
            </div>
            
          </div>
        </div>

        {/* 플레이어 덱/무덤 확인 모달 */}
        {viewingPile && (
          <div className="fixed inset-0 bg-black/80 z-[150] flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setViewingPile(null)}>
            <div className="bg-slate-800 p-4 md:p-6 rounded-xl border-2 border-slate-600 w-full max-w-5xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4 md:mb-6 border-b border-slate-600 pb-2 shrink-0">
                <h3 className="text-xl md:text-2xl font-bold text-white">{pileTitle} ({pileCards.length}장)</h3>
                <button onClick={() => setViewingPile(null)} className="px-3 py-1 md:px-4 md:py-2 bg-slate-700 hover:bg-slate-600 rounded font-bold text-sm md:text-base border border-slate-500">닫기</button>
              </div>
              <div className="flex flex-wrap gap-3 md:gap-4 overflow-y-auto hide-scrollbar pb-4 p-2 justify-center items-start">
                {pileCards.map((card, idx) => {
                  return <div key={idx} className="w-28 h-40 md:w-36 md:h-48 pointer-events-none">{renderCard(card)}</div>; 
                })}
              </div>
            </div>
          </div>
        )}

        {/* 적 덱 확인 모달 */}
        {showEnemyDeck && viewingEnemy && (
          <div className="fixed inset-0 bg-black/80 z-[150] flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => { setShowEnemyDeck(false); setViewingEnemy(null); }}>
            <div className="bg-slate-800 p-4 md:p-6 rounded-xl border-2 border-slate-600 w-full max-w-3xl" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4 md:mb-6 border-b border-slate-600 pb-2">
                <h3 className="text-xl md:text-2xl font-bold text-red-400">[{viewingEnemy.name}]의 덱 정보</h3>
                <button onClick={() => { setShowEnemyDeck(false); setViewingEnemy(null); }} className="px-3 py-1 md:px-4 md:py-2 bg-slate-700 hover:bg-slate-600 rounded font-bold text-sm md:text-base border border-slate-500">닫기</button>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 overflow-y-auto max-h-[60vh] hide-scrollbar">
                {viewingEnemy.template.deck.map((eCard, idx) => (
                  <div key={idx} className={`p-3 md:p-4 rounded-lg border flex flex-col justify-between ${eCard.type.includes('attack') ? 'border-red-500 bg-red-900/30' : eCard.type.includes('defend') ? 'border-blue-500 bg-blue-900/30' : 'border-purple-500 bg-purple-900/30'}`}>
                    <div className="font-bold text-sm md:text-lg mb-1 md:mb-2">{eCard.name}</div>
                    <div className="text-xs md:text-sm text-slate-300 bg-black/40 p-2 rounded relative">{eCard.desc} {renderTooltipIcon(eCard.desc)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
// ==========================================
  // [보상 및 종료 화면 렌더링 함수 모음]
  // ==========================================

  const renderRewards = () => {
    if (!combatState) return null;
    return (
      <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-slate-900 text-white p-4">
        <h2 className="text-4xl md:text-5xl font-black mb-4 text-yellow-400 tracking-wider text-center drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]">스테이지 클리어!</h2>
        <p className="text-lg md:text-xl mb-10 text-slate-300">원하는 보상을 하나 선택하세요.</p>
        
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 w-full max-w-4xl justify-center items-center">
          <button onClick={() => {
            if (rewardCards.length === 0) {
              const currentDeckCounts = {};
              combatState.baseDeck.forEach(c => currentDeckCounts[c.id] = (currentDeckCounts[c.id] || 0) + 1);
              const manaCards = ['mana_potion', 'overcharge', 'meditate', 'dark_bargain', 'catalyst', 'blood_ritual', 'mana_amp', 'mana_spring', 'mana_burst', 'lucky_coin'];
              const currentManaCount = combatState.baseDeck.filter(c => manaCards.includes(c.id)).length;
              
              const pool = CARD_LIBRARY.filter(c => {
                if ((currentDeckCounts[c.id] || 0) >= 3) return false;
                if (manaCards.includes(c.id) && currentManaCount >= 2) return false;
                return true;
              });

              const legendProb = Math.floor(combatState.stage / 10) * 0.01;
              
              const getWeighted = (availablePool) => {
                const r = Math.random();
                let t = 'common';
                if (r < legendProb) t = 'rare'; 
                else if (r < legendProb + 0.15) t = 'uncommon'; 
                
                let p = availablePool.filter(c => c.rarity === t);
                if (p.length === 0) p = availablePool; 
                return p[Math.floor(Math.random() * p.length)];
              };

              let selected = [];
              let avPool = [...pool];
              for(let i=0; i<3; i++) {
                if(avPool.length === 0) break;
                const picked = getWeighted(avPool);
                if (picked) selected.push(getCardDef(picked.id, shopUpgrades));
                avPool = avPool.filter(c => c.id !== picked.id);
              }
              setRewardCards(selected);
            }
            setGameState('REWARD_CARD');
          }} className="p-6 md:p-8 bg-slate-800 hover:bg-slate-700 border-2 border-indigo-500 rounded-2xl flex flex-col items-center w-full md:w-64 transition-transform hover:-translate-y-2 shadow-lg">
            <PlusCircle className="w-12 h-12 md:w-16 md:h-16 mb-4 text-indigo-400"/>
            <span className="text-xl md:text-2xl font-bold">카드 추가</span>
            <span className="text-xs md:text-sm text-slate-400 mt-2 text-center">진행 중인 덱에<br/>새로운 카드를 1장 추가합니다.</span>
          </button>

          <button onClick={() => {
            const p = { ...combatState.player };
            p.hp = Math.min(p.maxHp, p.hp + Math.floor(p.maxHp * 0.3));
            p.debuffs = { weak: 0, vulnerable: 0 }; 
            startNextStage(p, combatState.baseDeck);
          }} className="p-6 md:p-8 bg-slate-800 hover:bg-slate-700 border-2 border-green-500 rounded-2xl flex flex-col items-center w-full md:w-64 transition-transform hover:-translate-y-2 shadow-lg">
            <Heart className="w-12 h-12 md:w-16 md:h-16 mb-4 text-green-400"/>
            <span className="text-xl md:text-2xl font-bold">체력 회복 & 정화</span>
            <span className="text-xs md:text-sm text-slate-400 mt-2 text-center">최대 체력의 30%를 회복하고<br/>모든 디버프를 즉시 제거합니다.</span>
          </button>

          <button onClick={() => setGameState('REWARD_REMOVE')} className="p-6 md:p-8 bg-slate-800 hover:bg-slate-700 border-2 border-red-500 rounded-2xl flex flex-col items-center w-full md:w-64 transition-transform hover:-translate-y-2 shadow-lg">
            <Trash2 className="w-12 h-12 md:w-16 md:h-16 mb-4 text-red-400"/>
            <span className="text-xl md:text-2xl font-bold">카드 삭제</span>
            <span className="text-xs md:text-sm text-slate-400 mt-2 text-center">덱에서 원하지 않는 카드를<br/>1장 영구 제거합니다.</span>
          </button>
        </div>
      </div>
    );
  };

  const renderRewardCard = () => {
    if (!combatState) return null;
    return (
      <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-slate-900 text-white p-4 relative">
        <div className="flex justify-between items-center mb-8 w-full max-w-4xl px-4 mt-10 md:mt-0">
          <h2 className="text-2xl md:text-3xl font-bold text-center flex-1">추가할 카드를 선택하세요</h2>
          <button onClick={() => setGameState('REWARDS')} className="absolute top-6 right-6 md:static py-2 px-4 bg-slate-700 hover:bg-slate-600 rounded-lg font-bold text-sm md:text-base transition-colors border border-slate-500 shadow-md z-40">돌아가기</button>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 flex-wrap justify-center w-full max-w-4xl px-4">
          {rewardCards.filter(Boolean).map((card, idx) => {
            const isNew = !(unlockedCards || []).includes(card.id);
            return (
              <div key={idx} className="relative group">
                {renderCard(card, null, false, null, null, () => setConfirmSelection({ action: 'add', card, isNew }))}
                {isNew && <span className="absolute -top-3 -right-3 bg-yellow-500 text-black px-2 py-1 rounded-full font-black text-xs md:text-sm shadow-lg animate-bounce z-30">NEW 해금!</span>}
                <div className="absolute inset-0 border-4 border-white/30 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none scale-105" />
              </div>
            );
          })}
        </div>

        {/* 카드 추가 확인 모달 */}
        {confirmSelection?.action === 'add' && (
          <div className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-slate-800 p-8 rounded-xl border-2 border-slate-600 w-full max-w-md text-center shadow-2xl animate-draw flex flex-col items-center">
              <h3 className="text-xl md:text-2xl font-bold mb-6">이 카드를 덱에 추가하시겠습니까?</h3>
              <div className="flex justify-center mb-8 pointer-events-none w-48 h-64 scale-110">
                {renderCard(confirmSelection.card)}
              </div>
              <div className="flex gap-4 justify-center mt-4 w-full">
                <button onClick={() => setConfirmSelection(null)} className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-bold text-lg transition-colors flex-1 border border-slate-500">취소</button>
                <button onClick={() => {
                  const newDeck = [...combatState.baseDeck, { ...confirmSelection.card }];
                  if (confirmSelection.isNew) {
                    const newUnlocked = [...(unlockedCards || []), confirmSelection.card.id];
                    setUnlockedCards(newUnlocked);
                    saveGame({ unlockedCards: newUnlocked });
                  }
                  setConfirmSelection(null);
                  startNextStage(combatState.player, newDeck);
                }} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-bold text-lg transition-colors flex-1 shadow-[0_0_15px_rgba(79,70,229,0.5)]">추가하기</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderRewardRemove = () => {
    if (!combatState) return null;
    return (
      <div className="flex flex-col min-h-[100dvh] bg-slate-900 text-white p-4 md:p-10 relative">
        <div className="flex justify-between items-center mb-6 pt-10 md:pt-0 w-full max-w-6xl mx-auto px-2">
          <h2 className="text-2xl md:text-3xl font-bold text-red-400">삭제할 카드를 선택하세요</h2>
          <button onClick={() => setGameState('REWARDS')} className="py-2 px-4 bg-slate-700 hover:bg-slate-600 rounded-lg font-bold text-sm md:text-base transition-colors border border-slate-500 shadow-md">돌아가기</button>
        </div>
        
        <div className="flex flex-wrap justify-center gap-3 overflow-y-auto hide-scrollbar pb-10 max-w-6xl mx-auto px-2">
          {combatState.baseDeck.map((card, idx) => {
            if (!card) return null;
            return (
              <div key={idx} className="relative group cursor-pointer w-28 h-40 md:w-36 md:h-48 shrink-0" onClick={() => setConfirmSelection({ action: 'remove', idx, card })}>
                <div className="pointer-events-none w-full h-full">
                  {renderCard(card)}
                </div>
                <div className="absolute inset-0 bg-red-900/0 group-hover:bg-red-900/70 rounded-xl transition-colors flex items-center justify-center border-2 border-transparent group-hover:border-red-500 z-30">
                   <Trash2 className="w-10 h-10 md:w-12 md:h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
                </div>
              </div>
            );
          })}
        </div>

        {/* 카드 삭제 확인 모달 */}
        {confirmSelection?.action === 'remove' && (
          <div className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-slate-800 p-8 rounded-xl border-2 border-red-900 w-full max-w-md text-center shadow-2xl animate-draw flex flex-col items-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl md:text-2xl font-bold mb-6">정말로 이 카드를 삭제하시겠습니까?</h3>
              <div className="flex justify-center mb-6 pointer-events-none w-48 h-64 scale-110">
                {renderCard(confirmSelection.card)}
              </div>
              <p className="text-slate-400 text-sm mb-6">이 작업은 되돌릴 수 없습니다.</p>
              <div className="flex gap-4 justify-center w-full">
                <button onClick={() => setConfirmSelection(null)} className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-bold text-lg transition-colors flex-1 border border-slate-500">취소</button>
                <button onClick={() => {
                  const newDeck = [...combatState.baseDeck];
                  newDeck.splice(confirmSelection.idx, 1);
                  setConfirmSelection(null);
                  startNextStage(combatState.player, newDeck);
                }} className="px-6 py-3 bg-red-700 hover:bg-red-600 rounded-lg font-bold text-lg transition-colors flex-1 shadow-[0_0_15px_rgba(220,38,38,0.5)]">영구 삭제</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderBossClearReward = () => {
    if (!combatState || !specialBossRewardCard) return null;
    return (
      <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-slate-900 text-white p-4 relative z-50">
        <h2 className="text-4xl md:text-5xl font-black mb-4 text-fuchsia-400 tracking-wider text-center drop-shadow-[0_0_20px_rgba(217,70,239,0.8)] animate-bounce">특수 보스 처치 보상!</h2>
        <p className="text-lg md:text-xl mb-10 text-slate-300 text-center">압도적인 적을 물리친 증표로<br/>새로운 특수 카드를 획득했습니다.</p>
        
        <div className="relative group w-48 h-64 md:w-64 md:h-80 mb-10 animate-draw">
          <div className="pointer-events-none w-full h-full scale-125 md:scale-150 origin-top">
            {renderCard(specialBossRewardCard)}
          </div>
          <div className="absolute inset-0 border-4 border-fuchsia-500/50 rounded-xl pointer-events-none scale-125 md:scale-150 animate-pulse" />
        </div>
        
        <button onClick={handleSpecialBossRewardClaim} className="px-10 py-4 bg-fuchsia-700 hover:bg-fuchsia-600 rounded-full font-bold text-xl md:text-2xl transition-colors shadow-[0_0_25px_rgba(217,70,239,0.8)] mt-10 md:mt-24">
          수락하기
        </button>
      </div>
    );
  };

  const renderGameOver = () => (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-slate-900 text-white p-4">
      <Skull className="w-24 h-24 md:w-32 md:h-32 text-red-500 mb-6 drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]" />
      <h1 className="text-5xl md:text-6xl font-black mb-4 text-red-500 tracking-widest text-center drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]">GAME OVER</h1>
      <p className="text-lg md:text-xl mb-12 text-slate-400">도달한 스테이지: <span className="text-white font-bold">{combatState?.stage}</span></p>
      <button onClick={() => setGameState('MENU')} className="py-3 px-8 md:py-4 md:px-10 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xl md:text-2xl font-bold transition-all shadow-[0_0_20px_rgba(79,70,229,0.4)]">
        메인 메뉴로 돌아가기
      </button>
    </div>
  );

  const renderGameClear = () => (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-slate-900 text-white p-4">
      <Trophy className="w-32 h-32 text-yellow-400 mb-6 animate-bounce drop-shadow-[0_0_20px_rgba(250,204,21,0.8)]" />
      <h1 className="text-5xl md:text-6xl font-black mb-4 text-yellow-400 tracking-widest text-center drop-shadow-[0_0_20px_rgba(250,204,21,0.5)]">GAME CLEAR!</h1>
      <p className="text-xl md:text-2xl mb-12 text-slate-300">모든 100개의 스테이지를 정복했습니다!</p>
      <button onClick={() => setGameState('MENU')} className="py-4 px-12 bg-indigo-600 hover:bg-indigo-500 rounded-full text-2xl font-bold transition-all shadow-[0_0_20px_rgba(79,70,229,0.8)]">
        메인 메뉴로 돌아가기
      </button>
    </div>
  );
  // ==========================================
  // [여기까지 입니다!]
  // ==========================================
  // ==========================================
  // [상점 화면 렌더링 함수]
  // ==========================================
  const renderShop = () => {
    const hpCost = 50 + ((shopUpgrades?.maxHp || 0) * 40); 

    const filteredUpgrades = (unlockedCards || []).filter(id => {
      if (shopFilterOwnership === 'unowned') return false;
      const c = CARD_LIBRARY.find(card => card.id === id);
      if (!c) return false;
      if (shopFilterRarity !== 'all' && c.rarity !== shopFilterRarity) return false;
      if (shopFilterType !== 'all' && c.type !== shopFilterType) return false;
      if (shopFilterEffect === 'debuff' && !(c.enemyWeak || c.enemyVuln)) return false;
      if (shopFilterEffect === 'buff' && !(c.selfStrength || c.selfDex)) return false;
      
      // 검색어 필터링 시 데이터가 없어도 앱이 터지지 않도록 방어 장치 적용
      if (shopSearchQuery) {
        const query = shopSearchQuery.toLowerCase();
        const cardDef = getCardDef(c.id, shopUpgrades); 
        if (cardDef && !(cardDef.name || '').toLowerCase().includes(query) && !(cardDef.desc || '').toLowerCase().includes(query)) return false;
      }
      
      if (hideMaxedUpgrades) {
        const upgradeLevel = (shopUpgrades?.upgradedCards || []).filter(upId => upId === id).length;
        if (upgradeLevel >= 5) return false;
      }
      
      return true;
    });

    return (
      <div className="flex flex-col min-h-[100dvh] bg-slate-900 text-white pt-16 md:pt-4 p-4 md:p-10 relative">
        <button onClick={toggleFullScreen} className="fixed top-4 left-4 md:flex hidden z-50 items-center gap-2 bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded text-sm font-bold transition-colors border border-slate-600">
          <Maximize className="w-4 h-4"/> 전체화면
        </button>

        {toastMsg && <div className="fixed top-10 left-1/2 transform -translate-x-1/2 bg-green-600 px-6 py-3 rounded shadow-lg font-bold z-[9999] animate-pulse">{toastMsg}</div>}
        <div className="flex justify-between items-center mb-8 pl-0 md:pl-32 pt-12 md:pt-0">
          <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3"><Store className="w-8 h-8 text-yellow-500"/> 크레딧 상점</h2>
          <div className="flex items-center gap-4 md:gap-6">
            <span className="text-xl md:text-2xl font-bold text-yellow-400 flex items-center gap-2 bg-slate-800 px-3 py-1 rounded-full border border-yellow-900"><Coins className="w-5 h-5 md:w-6 md:h-6"/> {credits}</span>
            <button onClick={() => setGameState('MENU')} className="py-2 px-4 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-bold text-sm md:text-base shadow-md">메인으로</button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 w-full max-w-6xl mx-auto h-full pb-10 overflow-y-auto hide-scrollbar">
          
          <div className="bg-slate-800 p-6 rounded-xl border-2 border-slate-600 flex flex-col items-center text-center lg:col-span-1 shadow-lg">
            <Heart className="w-16 h-16 text-red-500 mb-4"/>
            <h3 className="text-2xl font-bold mb-2">최대 체력 증가</h3>
            <p className="text-slate-400 mb-6 text-sm md:text-base">시작 최대 체력을 영구적으로 15 증가시킵니다.<br/>(현재: {100 + (shopUpgrades?.maxHp || 0) * 15})</p>
            <button 
              onClick={() => {
                if (credits >= hpCost) {
                  const newCredits = credits - hpCost;
                  const newUpgrades = { ...shopUpgrades, maxHp: (shopUpgrades?.maxHp || 0) + 1 };
                  setCredits(newCredits);
                  setShopUpgrades(newUpgrades);
                  saveGame({ credits: newCredits, shopUpgrades: newUpgrades });
                  setToastMsg('최대 체력이 증가했습니다!');
                  setTimeout(() => setToastMsg(''), 2000);
                }
              }}
              disabled={credits < hpCost}
              className={`mt-auto py-3 px-8 rounded-lg font-bold text-lg w-full ${credits >= hpCost ? 'bg-yellow-600 hover:bg-yellow-500 text-white' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}
            >
              {hpCost} 크레딧
            </button>
          </div>

          <div className="bg-slate-800 p-6 rounded-xl border-2 border-slate-600 flex flex-col items-center text-center lg:col-span-1 shadow-lg">
            <Gift className="w-16 h-16 text-purple-500 mb-4"/>
            <h3 className="text-2xl font-bold mb-2">일반 뽑기</h3>
            <p className="text-slate-400 mb-6 text-sm md:text-base">모든 카드 중 랜덤으로 3장 획득합니다.<br/>(전설 1% / 희귀 10%)</p>
            <button 
              onClick={handleGacha}
              disabled={credits < 50}
              className={`mt-auto py-3 px-8 rounded-lg font-bold text-lg w-full ${credits >= 50 ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_15px_rgba(147,51,234,0.5)]' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}
            >
              50 크레딧
            </button>
          </div>

          <div className="bg-slate-900/80 p-6 rounded-xl border-2 border-cyan-700 flex flex-col items-center text-center lg:col-span-2 shadow-[0_0_20px_rgba(14,116,144,0.4)]">
            <Gift className="w-16 h-16 text-cyan-400 mb-4 animate-pulse"/>
            <h3 className="text-2xl font-bold mb-2 text-cyan-300">프리미엄 뽑기</h3>
            <p className="text-slate-300 mb-6 text-sm md:text-base">제시되는 3장의 카드 중 1장만 선택하여 획득합니다.<br/><span className="text-yellow-400 font-bold">전설 등장 확률 2% / 희귀 등장 확률 20%</span></p>
            <button 
              onClick={handlePremiumGacha}
              disabled={credits < 100}
              className={`mt-auto py-3 px-8 rounded-lg font-bold text-lg w-full max-w-sm ${credits >= 100 ? 'bg-cyan-700 hover:bg-cyan-600 text-white shadow-[0_0_15px_rgba(34,211,238,0.4)]' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}
            >
              100 크레딧
            </button>
          </div>

          {/* 카드 영구 강화 스테이션 */}
          <div className="bg-slate-800 p-4 md:p-6 rounded-xl border-2 border-slate-600 lg:col-span-4 flex flex-col shadow-lg transition-all">
            <div className="flex flex-col mb-4 border-b border-slate-700 pb-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                <div>
                  <h3 className="text-2xl font-bold flex items-center gap-2"><Zap className="w-6 h-6 text-yellow-400"/> 카드 영구 강화</h3>
                  <p className="text-slate-400 text-sm md:text-base mt-1">해금된 카드를 강화(+)하여 위력을 중첩시킵니다. (최대 +5 강화)</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-bold bg-slate-900 px-3 py-2 rounded-lg hover:bg-slate-700 transition-colors border border-slate-600 select-none">
                    <input type="checkbox" checked={hideMaxedUpgrades} onChange={(e) => setHideMaxedUpgrades(e.target.checked)} className="w-4 h-4 accent-yellow-500" />
                    풀업글 숨기기
                  </label>
                  <button onClick={() => setIsUpgradesCollapsed(!isUpgradesCollapsed)} className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-2 shadow-md">
                    {isUpgradesCollapsed ? '펼치기 ▼' : '접기 ▲'}
                  </button>
                </div>
              </div>
              
              {!isUpgradesCollapsed && renderFiltersUI(shopFilterType, setShopFilterType, shopFilterEffect, setShopFilterEffect, shopFilterRarity, setShopFilterRarity, shopFilterOwnership, setShopFilterOwnership, shopSearchQuery, setShopSearchQuery)}
            </div>
            
            {!isUpgradesCollapsed && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto hide-scrollbar pr-2 flex-1 max-h-[60vh] min-h-[400px]">
                {filteredUpgrades.map(id => {
                  const upgradeLevel = (shopUpgrades?.upgradedCards || []).filter(c => c === id).length;
                  const isUpgraded = upgradeLevel > 0;
                  const isMaxed = upgradeLevel >= 5;
                  
                  const cardDef = getCardDef(id, shopUpgrades); 
                  if (!cardDef) return null;
                  const baseCost = cardDef.rarity === 'rare' ? 200 : cardDef.rarity === 'uncommon' ? 150 : 100;
                  const upgradeCost = baseCost + (upgradeLevel * 50); 
                  
                  return (
                    <div key={id} className={`p-4 rounded-xl border-2 ${isUpgraded ? 'border-yellow-500 bg-yellow-900/20' : 'border-slate-600 bg-slate-900'} relative flex flex-col justify-between shadow-md`}>
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <span className={`font-extrabold text-lg ${isUpgraded ? 'text-yellow-400' : 'text-white'}`}>{cardDef.name}</span>
                          <span className="text-xs bg-slate-700 px-2 py-1 rounded text-white font-bold border border-slate-600">코스트 {cardDef.cost}</span>
                        </div>
                        <div className="text-[10px] md:text-xs text-slate-300 leading-tight bg-slate-800/80 p-2 rounded relative mt-2 border border-slate-700 min-h-[40px] flex items-center justify-center">
                          <div>{cardDef.desc} {renderTooltipIcon(cardDef.desc)}</div>
                        </div>
                      </div>
                      {!isMaxed ? (
                        <button 
                          onClick={() => {
                            if (credits >= upgradeCost) {
                              const newCredits = credits - upgradeCost;
                              const newUpgrades = { ...shopUpgrades, upgradedCards: [...(shopUpgrades?.upgradedCards || []), id] };
                              setCredits(newCredits);
                              setShopUpgrades(newUpgrades);
                              saveGame({ credits: newCredits, shopUpgrades: newUpgrades });
                              setToastMsg(`${cardDef.name} 강화 완료!`);
                              setTimeout(() => setToastMsg(''), 2000);
                            }
                          }}
                          disabled={credits < upgradeCost}
                          className={`w-full mt-4 py-2 rounded-lg text-sm font-bold transition-colors ${credits >= upgradeCost ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-slate-700 text-slate-500 cursor-not-allowed border border-slate-600'}`}
                        >
                          강화 ({upgradeLevel}/5) - <Coins className="w-4 h-4 inline mb-0.5"/> {upgradeCost}
                        </button>
                      ) : (
                        <div className="w-full mt-4 py-2 text-center text-sm font-bold text-yellow-500 bg-yellow-900/40 rounded-lg border border-yellow-700">최대 강화 (5/5)</div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* 전설 카드 확정 구매 (암시장) */}
          <div className="bg-gray-950 text-white p-6 rounded-xl border-2 border-yellow-600 lg:col-span-4 flex flex-col shadow-[0_0_25px_rgba(202,138,4,0.3)]">
            <h3 className="text-2xl font-bold mb-2 flex items-center gap-2 text-yellow-400"><Store className="w-6 h-6"/> 전설 카드 암시장</h3>
            <p className="text-slate-400 mb-6 text-sm md:text-base border-b border-slate-800 pb-4">엄청난 위력을 가진 특수 전설 카드를 확정으로 구매합니다.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {['super_tiger_slash', 'true_dragon_slayer', 'absolute_zero', 'heavenly_judgment'].map(id => {
                const cardDef = getCardDef(id, shopUpgrades);
                if (!cardDef) return null;
                const isOwned = (unlockedCards || []).includes(id);
                const cost = 3000;

                return (
                  <div key={id} className={`p-4 rounded-xl border-2 flex flex-col justify-between text-white ${isOwned ? 'border-slate-700 bg-slate-900 opacity-60' : 'border-yellow-500 bg-slate-900 shadow-[0_0_10px_rgba(234,179,8,0.3)]'} relative`}>
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-black text-yellow-400 text-lg md:text-xl drop-shadow-md leading-tight">{cardDef.name}</span>
                        <span className="text-xs bg-slate-700 px-2 py-1 rounded text-white shrink-0 font-bold border border-slate-600">코스트 {cardDef.cost}</span>
                      </div>
                      <p className="text-xs md:text-sm text-slate-300 leading-tight mb-4 min-h-[40px]">{cardDef.desc}</p>
                    </div>
                    
                    {!isOwned ? (
                      <button 
                        onClick={() => {
                          if (credits >= cost) {
                            const newCredits = credits - cost;
                            const newUnlocked = [...(unlockedCards || []), id];
                            setCredits(newCredits);
                            setUnlockedCards(newUnlocked);
                            saveGame({ credits: newCredits, unlockedCards: newUnlocked });
                            setToastMsg(`${cardDef.name} 획득!`);
                            setTimeout(() => setToastMsg(''), 2000);
                          }
                        }}
                        disabled={credits < cost}
                        className={`w-full py-2.5 rounded-lg text-sm font-bold transition-colors ${credits >= cost ? 'bg-yellow-600 hover:bg-yellow-500 text-white shadow-[0_0_10px_rgba(202,138,4,0.5)]' : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'}`}
                      >
                        {cost} 크레딧
                      </button>
                    ) : (
                      <div className="w-full py-2.5 text-center text-sm font-bold text-slate-500 border border-slate-700 bg-slate-800 rounded-lg">보유 중</div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* 가챠 결과 팝업창 */}
        {gachaResult && (
          <div className="fixed inset-0 bg-black/85 z-[9999] flex flex-col items-center justify-center p-4 backdrop-blur-sm" onClick={() => setGachaResult(null)}>
            <h2 className="text-3xl md:text-5xl font-black mb-8 text-purple-400 animate-bounce drop-shadow-[0_0_15px_rgba(168,85,247,0.8)]">✨ 신규 카드 획득! ✨</h2>
            <div className="flex flex-wrap justify-center gap-4 md:gap-8 w-full max-w-4xl px-4">
              {gachaResult.filter(Boolean).map((card, idx) => {
                return (
                  <div key={idx} onClick={(e) => e.stopPropagation()} className="relative">
                    {card.isDuplicate && <span className="absolute -top-4 -right-4 bg-slate-600 border border-slate-400 text-white px-3 py-1 rounded-full font-black text-[10px] md:text-xs shadow-lg z-10 animate-pulse">중복! (+10원)</span>}
                    {renderCard(card)}
                  </div>
                );
              })}
            </div>
            <button onClick={() => setGachaResult(null)} className="mt-12 py-3 px-10 bg-indigo-600 hover:bg-indigo-500 rounded-full text-xl md:text-2xl font-bold shadow-[0_0_20px_rgba(79,70,229,0.5)]">확인</button>
          </div>
        )}

        {/* 프리미엄 가챠 결과 팝업창 */}
        {premiumGachaResult && (
          <div className="fixed inset-0 bg-black/90 z-[9999] flex flex-col items-center justify-center p-4 backdrop-blur-md">
            <h2 className="text-3xl md:text-5xl font-black mb-2 text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]">프리미엄 뽑기</h2>
            <p className="text-slate-300 text-lg mb-8">가장 마음에 드는 <span className="text-white font-bold">1장</span>만 선택하세요!</p>
            
            <div className="flex flex-wrap justify-center gap-4 md:gap-8 w-full max-w-4xl px-4">
              {premiumGachaResult.filter(Boolean).map((card, idx) => {
                const isOwned = (unlockedCards || []).includes(card.id);
                return (
                  <div key={idx} className="relative group">
                    {renderCard(card, null, false, null, null, () => selectPremiumCard(card))}
                    {isOwned && <span className="absolute -top-3 -left-3 bg-slate-700 text-white px-2 py-1 rounded text-xs font-bold border border-slate-500 z-10">보유 중</span>}
                    <div className="absolute inset-0 border-4 border-cyan-400 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none scale-105" />
                  </div>
                );
              })}
            </div>
            <button onClick={() => setPremiumGachaResult(null)} className="mt-12 py-3 px-10 bg-slate-700 hover:bg-slate-600 rounded-full text-lg font-bold border border-slate-500">포기 (환불 불가)</button>
          </div>
        )}
      </div>
    );
  };
  return (
    <>
      <style>{styles}</style>
      <div id="game-root" className={`font-sans antialiased selection:bg-indigo-500 selection:text-white ${isCssFullScreen ? 'fixed inset-0 z-[999999] w-[100vw] h-[100vh] overflow-auto bg-slate-950' : 'bg-slate-900 min-h-screen'}`}>
        {gameState === 'MENU' && renderMenu()}
        {gameState === 'DECK_BUILDING' && renderDeckBuilder()}
        {gameState === 'SHOP' && renderShop()}
        {gameState === 'ENCYCLOPEDIA' && renderEncyclopedia()}
        {gameState === 'MONSTER_DEX' && renderMonsterDex()}
        {gameState === 'BATTLE' && renderBattleUI()}
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