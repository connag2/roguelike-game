import React, { useState } from 'react';
import { Maximize, Zap, HelpCircle, CheckSquare, Star, CheckCircle, X, Sparkles } from 'lucide-react';
import Card from '../common/Card';
import FilterBar from '../common/FilterBar';
import { CARD_LIBRARY } from '../../constants/gameData';

// ✨ 프로젝트 내의 SVG 및 배경 이미지 임포트
import merchantImg from '../../assets/images/shop/merchant.svg';
import coinImg from '../../assets/images/ui/coin.svg';
import potionImg from '../../assets/images/items/potion.svg';
import scrollImg from '../../assets/images/items/scroll.svg';
import shieldImg from '../../assets/images/items/shield.svg';
import shopBgImg from '../../assets/images/shop/shop_background.png';

export default function ShopScreen({
  credits, setCredits,
  shopUpgrades, setShopUpgrades,
  unlockedCards, setUnlockedCards,
  saveGame, setGameState,
  toggleFullScreen,
  setToastMsg,
  getCardDef,
  handleGacha,
  gachaResult, setGachaResult,
  setTutorialModalOpen
}) {
  const [filterType, setFilterType] = useState('all');
  const [filterEffect, setFilterEffect] = useState('all');
  const [filterRarity, setFilterRarity] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [hideMaxedUpgrades, setHideMaxedUpgrades] = useState(false);
  const [isUpgradesCollapsed, setIsUpgradesCollapsed] = useState(false);
  
  // 일괄 강화를 위한 선택된 카드 상태
  const [selectedCards, setSelectedCards] = useState([]);

  // ✨ 프리미엄 뽑기 관련 로컬 상태 (버그 방지 및 로직 독립)
  const [localPremiumGachaResult, setLocalPremiumGachaResult] = useState(null);
  const [showPityModal, setShowPityModal] = useState(false);
  
  // 천장 카운트 로드
  const pityCount = shopUpgrades.pityCount || 0;
  const PITY_TARGET = 30;

  const hpCost = 50 + (shopUpgrades.maxHp * 40);

  // ✨ 등급별 1회 강화 비용 계산 함수
  const getUpgradeCost = (rarity, level) => {
    const costMap = {
      common: { base: 50, inc: 20 },
      uncommon: { base: 100, inc: 50 },
      rare: { base: 200, inc: 100 },
      special: { base: 400, inc: 200 },
      mythic: { base: 800, inc: 400 },
    };
    const stats = costMap[rarity] || costMap.common;
    return stats.base + (level * stats.inc);
  };

  // 현재 레벨부터 5레벨(MAX)까지 필요한 총 비용 계산
  const getMaxUpgradeCost = (rarity, currentLevel) => {
    let total = 0;
    for (let i = currentLevel; i < 5; i++) {
      total += getUpgradeCost(rarity, i);
    }
    return total;
  };

  // ✨ 카드 속성 판별 유틸리티 (버그 6)
  const isManaDrawOnly = (c) => (c.manaGain || c.draw) && !c.damage && !c.block && !c.heal;
  const isBuffDebuffOnly = (c) => (c.selfStrength || c.selfDex || c.enemyWeak || c.enemyVuln || c.enemyPoison) && !c.damage && !c.block && !c.heal && !c.manaGain && !c.draw;

  // ✨ 특수 강화 도약 로직 계산 (버그 6)
  const getNextLevelAndCost = (cardId, currentLevel) => {
    const cardDef = CARD_LIBRARY.find(c => c.id === cardId);
    if (!cardDef) return { nextLevel: currentLevel, cost: 0, isJump: false };

    // 1. 마나/드로우 카드: 무조건 MAX(5)로 직행
    if (isManaDrawOnly(cardDef)) {
      let cost = 0;
      for (let i = currentLevel; i < 5; i++) cost += getUpgradeCost(cardDef.rarity, i);
      return { nextLevel: 5, cost, isJump: true, label: 'MAX 강화' };
    } 
    
    // 2. 버프/디버프 카드: 0강일 땐 +4로 직행, 그 이후엔 MAX(5)
    if (isBuffDebuffOnly(cardDef)) {
      if (currentLevel === 0) {
        let cost = 0;
        for (let i = 0; i < 4; i++) cost += getUpgradeCost(cardDef.rarity, i);
        return { nextLevel: 4, cost, isJump: true, label: '+4 강화' };
      } else if (currentLevel < 5) {
        let cost = 0;
        for (let i = currentLevel; i < 5; i++) cost += getUpgradeCost(cardDef.rarity, i);
        return { nextLevel: 5, cost, isJump: true, label: 'MAX 강화' };
      }
    }

    // 기본: +1 레벨 상승
    return { nextLevel: currentLevel + 1, cost: getUpgradeCost(cardDef.rarity, currentLevel), isJump: false, label: '1강화' };
  };

  const upgradableIds = unlockedCards.filter(id => {
    const c = CARD_LIBRARY.find(item => item.id === id);
    if (!c) return false;
    if (filterRarity !== 'all' && c.rarity !== filterRarity) return false;
    if (filterType !== 'all' && c.type !== filterType) return false;
    if (filterEffect === 'debuff' && !(c.enemyWeak || c.enemyVuln || c.enemyPoison)) return false;
    if (filterEffect === 'buff' && !(c.selfStrength || c.selfDex || c.selfThorns)) return false;
    
    if (searchQuery) {
      const def = getCardDef(id, shopUpgrades);
      if (def && !(def.name || '').toLowerCase().includes(searchQuery.toLowerCase()) && 
               !(def.desc || '').toLowerCase().includes(searchQuery.toLowerCase())) return false;
    }
    if (hideMaxedUpgrades) {
      const level = shopUpgrades.upgradedCards.filter(uid => uid === id).length;
      if (level >= 5) return false;
    }
    return true;
  });

  const toggleSelectAll = () => {
    if (selectedCards.length === upgradableIds.length) setSelectedCards([]); 
    else setSelectedCards(upgradableIds); 
  };

  const toggleCardSelect = (id) => {
    if (selectedCards.includes(id)) setSelectedCards(selectedCards.filter(cid => cid !== id));
    else setSelectedCards([...selectedCards, id]);
  };

  // ✨ 선택 일괄 강화 로직 (비용 표시 및 알림창 추가)
  const handleBatchUpgrade = (toMax = false) => {
    if (selectedCards.length === 0) {
      setToastMsg('선택된 카드가 없습니다.');
      return;
    }

    let simulatedCredits = credits;
    let newUpgradedCards = [...shopUpgrades.upgradedCards];
    let totalSpent = 0;
    let upgradeSteps = 0;

    selectedCards.forEach(id => {
      const cardDef = CARD_LIBRARY.find(c => c.id === id);
      let level = newUpgradedCards.filter(c => c === id).length;

      while (level < 5) {
        if (!toMax) {
          // 선택 1단계 강화 (특수 도약 포함)
          const { nextLevel, cost } = getNextLevelAndCost(id, level);
          if (simulatedCredits >= cost) {
            simulatedCredits -= cost;
            totalSpent += cost;
            for(let i=level; i<nextLevel; i++) newUpgradedCards.push(id);
            upgradeSteps += (nextLevel - level);
            level = nextLevel;
          }
          break; // toMax가 아니면 1번(혹은 1번의 도약)만 실행 후 중단
        } else {
          // 끝까지 (MAX) 일괄 강화
          const cost = getUpgradeCost(cardDef.rarity, level);
          if (simulatedCredits >= cost) {
            simulatedCredits -= cost;
            totalSpent += cost;
            newUpgradedCards.push(id);
            level++;
            upgradeSteps++;
          } else {
            break; // 돈 부족 시 중단
          }
        }
      }
    });

    if (totalSpent > 0) {
      // ✨ 유저가 요청한 강화 전 비용 알림
      if (window.confirm(`선택한 카드들의 일괄 강화를 진행합니다.\n총 ${upgradeSteps} 레벨이 오르며, [ ${totalSpent} 크레딧 ]이 소모됩니다.\n진행하시겠습니까?`)) {
        const nu = { ...shopUpgrades, upgradedCards: newUpgradedCards };
        setCredits(simulatedCredits);
        setShopUpgrades(nu);
        saveGame({ credits: simulatedCredits, shopUpgrades: nu });
        setToastMsg(`일괄 강화 성공! (-${totalSpent} 크레딧)`);
        if (toMax || hideMaxedUpgrades) setSelectedCards([]); 
      }
    } else {
      setToastMsg('크레딧이 부족하거나, 이미 최대로 강화된 카드들입니다.');
    }
  };

  // ✨ 프리미엄 가챠 로직 (버그 7 해결 및 천장 스택 적용)
  const localHandlePremiumGacha = () => {
    if (credits < 100) { setToastMsg('크레딧이 부족합니다.'); return; }
    
    setCredits(credits - 100);
    const result = [];
    for (let i = 0; i < 3; i++) {
      const roll = Math.random();
      let rarity = roll < 0.15 ? 'rare' : 'uncommon'; 
      const pool = CARD_LIBRARY.filter(c => c.rarity === rarity || (rarity === 'rare' && c.rarity === 'special'));
      const card = pool[Math.floor(Math.random() * pool.length)];
      result.push(card);
    }
    setLocalPremiumGachaResult(result);
    saveGame({ credits: credits - 100 });
  };

  // ✨ 프리미엄 가챠 선택 처리 로직 (버그 7: 환급 및 천장)
  const selectLocalPremiumCard = (card) => {
    const isDuplicate = unlockedCards.includes(card.id);
    let newUnlocked = [...unlockedCards];
    let refund = 0;
    
    if (isDuplicate) refund = 30; // 중복 환급
    else newUnlocked.push(card.id);
    
    const newPityCount = pityCount + 1;
    const newCredits = credits + refund;
    const newUpgrades = { ...shopUpgrades, pityCount: newPityCount };
    
    setCredits(newCredits);
    setUnlockedCards(newUnlocked);
    setShopUpgrades(newUpgrades);
    setLocalPremiumGachaResult(null);
    saveGame({ credits: newCredits, unlockedCards: newUnlocked, shopUpgrades: newUpgrades });
    
    if (isDuplicate) setToastMsg(`중복 카드! 30 크레딧이 환급되었습니다. (천장 ${newPityCount}/${PITY_TARGET})`);
    else setToastMsg(`${card.name} 획득! (천장 ${newPityCount}/${PITY_TARGET})`);
  };

  // ✨ 천장(Pity) 전설 카드 선택
  const claimPityCard = (cardId) => {
    const newUnlocked = [...unlockedCards, cardId];
    const newUpgrades = { ...shopUpgrades, pityCount: 0 };
    setUnlockedCards(newUnlocked);
    setShopUpgrades(newUpgrades);
    setShowPityModal(false);
    saveGame({ unlockedCards: newUnlocked, shopUpgrades: newUpgrades });
    setToastMsg('✨ 확정 전설 카드를 획득했습니다!');
  };

  return (
    <div 
      className="flex flex-col min-h-[100dvh] bg-slate-950/90 text-white pt-16 md:pt-4 p-4 md:p-10 relative bg-blend-overlay"
      style={{ backgroundImage: `url(${shopBgImg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <button onClick={toggleFullScreen} className="fixed top-4 left-4 md:flex hidden z-50 items-center gap-2 bg-slate-800/80 hover:bg-slate-700 px-3 py-2 rounded text-sm font-bold transition-colors border border-slate-600 backdrop-blur-sm">
        <Maximize className="w-4 h-4"/> 전체화면
      </button>

      <div className="flex justify-between items-center mb-8 pl-0 md:pl-32 pt-12 md:pt-0 relative z-10">
        <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
          <img src={merchantImg} alt="Shop" className="w-10 h-10 drop-shadow-[0_0_15px_rgba(234,179,8,0.4)]" /> 
          크레딧 상점
        </h2>
        <div className="flex items-center gap-3 md:gap-6">
          <button onClick={() => setTutorialModalOpen(true)} className="p-2 bg-slate-800/80 hover:bg-slate-700 rounded-lg border border-slate-600 transition-colors backdrop-blur-sm">
            <HelpCircle className="w-5 h-5 text-yellow-500" />
          </button>
          <span className="text-xl md:text-2xl font-bold text-yellow-400 flex items-center gap-2 bg-slate-800/80 px-4 py-1.5 rounded-full border border-yellow-900/50 backdrop-blur-sm shadow-inner">
            <img src={coinImg} alt="Coin" className="w-5 h-5 md:w-6 md:h-6 drop-shadow-md" /> {credits}
          </span>
          <button onClick={() => setGameState('MENU')} className="py-2 px-4 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-bold text-sm md:text-base shadow-md backdrop-blur-sm">메인으로</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 w-full max-w-6xl mx-auto h-full pb-10 overflow-y-auto hide-scrollbar relative z-10">
        {/* 최대 체력 증가 */}
        <div className="bg-slate-900/80 p-6 rounded-xl border-2 border-slate-700 flex flex-col items-center text-center shadow-lg backdrop-blur-md">
          <img src={potionImg} alt="Max HP" className="w-16 h-16 mb-4 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)] hover:scale-110 transition-transform" />
          <h3 className="text-2xl font-bold mb-2">최대 체력 증가</h3>
          <p className="text-slate-400 mb-6 text-sm md:text-base">기본 체력 +15 증가<br/>(현재 보너스: +{shopUpgrades.maxHp * 15})</p>
          <button 
            onClick={() => {
              if (credits >= hpCost) {
                const nc = credits - hpCost;
                const nu = { ...shopUpgrades, maxHp: shopUpgrades.maxHp + 1 };
                setCredits(nc); setShopUpgrades(nu); saveGame({ credits: nc, shopUpgrades: nu });
                setToastMsg('최대 체력이 증가했습니다!');
              }
            }}
            disabled={credits < hpCost}
            className={`mt-auto py-3 px-8 rounded-lg font-bold text-lg w-full transition-all ${credits >= hpCost ? 'bg-yellow-600 hover:bg-yellow-500 text-white' : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'}`}
          >
            {hpCost} 크레딧
          </button>
        </div>

        {/* 일반 뽑기 */}
        <div className="bg-slate-900/80 p-6 rounded-xl border-2 border-slate-700 flex flex-col items-center text-center shadow-lg backdrop-blur-md">
          <img src={scrollImg} alt="Gacha" className="w-16 h-16 mb-4 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)] hover:scale-110 transition-transform" />
          <h3 className="text-2xl font-bold mb-2">일반 뽑기</h3>
          <p className="text-slate-400 mb-6 text-sm md:text-base">랜덤 카드 3장 획득<br/>(중복 시 10원 환급)</p>
          <div className="mt-auto flex gap-2 w-full">
            <button onClick={() => handleGacha(1)} disabled={credits < 50} className={`flex-1 py-3 px-2 rounded-lg font-bold text-sm md:text-base transition-all ${credits >= 50 ? 'bg-purple-600 hover:bg-purple-500 shadow-[0_0_15px_rgba(147,51,234,0.3)]' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}>1회 (50)</button>
            <button onClick={() => handleGacha(10)} disabled={credits < 500} className={`flex-1 py-3 px-2 rounded-lg font-bold text-sm md:text-base transition-all ${credits >= 500 ? 'bg-fuchsia-600 hover:bg-fuchsia-500 shadow-[0_0_15px_rgba(192,38,211,0.3)]' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}>10회 (500)</button>
          </div>
        </div>

        {/* 프리미엄 뽑기 (천장 게이지 추가) */}
        <div className="bg-slate-900/90 p-6 rounded-xl border-2 border-cyan-700/80 flex flex-col items-center text-center lg:col-span-2 shadow-[0_0_30px_rgba(34,211,238,0.15)] backdrop-blur-md">
          <img src={shieldImg} alt="Premium Gacha" className="w-16 h-16 mb-2 animate-pulse drop-shadow-[0_0_20px_rgba(34,211,238,0.6)] hover:scale-110 transition-transform" />
          <h3 className="text-2xl font-bold mb-1 text-cyan-300">프리미엄 뽑기</h3>
          <p className="text-slate-300 mb-4 text-sm md:text-base">3장 중 1장 선택 획득 (중복 시 30원 환급)<br/><span className="text-yellow-400 font-bold">전설/희귀 등장 확률 대폭 상승!</span></p>
          
          {/* ✨ 천장(Pity) UI 바 */}
          <div className="w-full max-w-sm mb-4">
            <div className="flex justify-between text-xs text-cyan-300 font-bold mb-1">
              <span>전설 확정 천장 (30회)</span>
              <span>{pityCount} / {PITY_TARGET}</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2.5 border border-slate-700 overflow-hidden shadow-inner">
              <div className="bg-gradient-to-r from-cyan-500 to-fuchsia-500 h-full transition-all duration-300" style={{ width: `${Math.min(100, (pityCount / PITY_TARGET) * 100)}%` }}></div>
            </div>
          </div>

          {pityCount >= PITY_TARGET ? (
            <button onClick={() => setShowPityModal(true)} className="mt-auto py-3 px-8 rounded-lg font-bold text-lg w-full max-w-sm transition-all bg-fuchsia-600 hover:bg-fuchsia-500 text-white shadow-[0_0_20px_rgba(192,38,211,0.5)] animate-pulse">
              ✨ 전설 확정 선택! ✨
            </button>
          ) : (
            <button onClick={localHandlePremiumGacha} disabled={credits < 100} className={`mt-auto py-3 px-8 rounded-lg font-bold text-lg w-full max-w-sm transition-all ${credits >= 100 ? 'bg-cyan-700 hover:bg-cyan-600 shadow-[0_0_20px_rgba(14,116,144,0.4)]' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}>
              100 크레딧 뽑기
            </button>
          )}
        </div>

        {/* 카드 강화 영역 */}
        <div className="bg-slate-900/85 p-4 md:p-6 rounded-xl border-2 border-slate-700 lg:col-span-4 flex flex-col shadow-lg transition-all mt-4 backdrop-blur-md relative">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4 border-b border-slate-700 pb-4">
            <div>
              <h3 className="text-2xl font-bold flex items-center gap-2"><Zap className="w-6 h-6 text-yellow-400"/> 카드 영구 강화</h3>
              <p className="text-slate-400 text-sm md:text-base">카드 특성에 따라 비용과 단축 구간이 자동으로 적용됩니다.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {!isUpgradesCollapsed && (
                <div className="flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-lg border border-slate-600 shadow-inner">
                  <button onClick={toggleSelectAll} className="px-3 py-1.5 text-sm font-bold bg-slate-700 hover:bg-slate-600 rounded flex items-center gap-1 transition-colors border border-slate-600">
                    <CheckSquare className="w-4 h-4"/> {selectedCards.length === upgradableIds.length && upgradableIds.length > 0 ? '해제' : '전체선택'}
                  </button>
                  <button onClick={() => handleBatchUpgrade(false)} disabled={selectedCards.length === 0} className="px-3 py-1.5 text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white disabled:bg-slate-700 disabled:text-slate-500 rounded transition-colors shadow-md">
                    선택 1단계
                  </button>
                  <button onClick={() => handleBatchUpgrade(true)} disabled={selectedCards.length === 0} className="px-3 py-1.5 text-sm font-bold bg-yellow-600 hover:bg-yellow-500 text-white disabled:bg-slate-700 disabled:text-slate-500 rounded transition-colors shadow-md">
                    선택 MAX
                  </button>
                </div>
              )}

              <label className="flex items-center gap-2 cursor-pointer text-sm font-bold bg-slate-800 px-3 py-2 rounded-lg border border-slate-600 hover:bg-slate-700 transition-colors">
                <input type="checkbox" checked={hideMaxedUpgrades} onChange={(e) => setHideMaxedUpgrades(e.target.checked)} className="w-4 h-4 accent-yellow-500" />
                풀강 제외
              </label>
              <button onClick={() => setIsUpgradesCollapsed(!isUpgradesCollapsed)} className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg font-bold text-sm shadow-md transition-colors border border-slate-500">
                {isUpgradesCollapsed ? '펼치기' : '접기'}
              </button>
            </div>
          </div>
          
          {!isUpgradesCollapsed && (
            <>
              <div className="mb-4">
                <FilterBar 
                  type={filterType} setType={setFilterType}
                  effect={filterEffect} setEffect={setFilterEffect}
                  rarity={filterRarity} setRarity={setFilterRarity}
                  search={searchQuery} setSearch={setSearchQuery}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto max-h-[50vh] pr-2 mt-2 hide-scrollbar">
                {upgradableIds.map(id => {
                  const level = shopUpgrades.upgradedCards.filter(c => c === id).length;
                  const cardDef = getCardDef(id, shopUpgrades);
                  if (!cardDef) return null;
                  
                  // ✨ 도약 여부 및 비용이 계산된 객체 가져오기
                  const { nextLevel, cost: stepCost, isJump, label } = getNextLevelAndCost(id, level);
                  const maxCost = getMaxUpgradeCost(cardDef.rarity, level);
                  const isSelected = selectedCards.includes(id);

                  return (
                    <div key={id} className={`relative p-4 rounded-xl border-2 flex flex-col justify-between transition-colors ${isSelected ? 'border-yellow-400 bg-yellow-900/30' : level > 0 ? 'border-yellow-600/60 bg-yellow-900/10' : 'border-slate-700 bg-slate-800/50'}`}>
                      {level < 5 && (
                        <div className="absolute top-3 right-3 z-10 cursor-pointer">
                           <input type="checkbox" checked={isSelected} onChange={() => toggleCardSelect(id)} className="w-5 h-5 accent-yellow-500 cursor-pointer" />
                        </div>
                      )}

                      <div>
                        <div className="flex justify-between items-start mb-2 pr-6">
                          <span className={`font-black text-lg ${level > 0 ? 'text-yellow-400' : 'text-white'}`}>{cardDef.name}</span>
                          <span className="text-xs bg-slate-700 px-2 py-1 rounded text-white border border-slate-600 shadow-inner">LV.{level}</span>
                        </div>
                        <p className="text-xs text-slate-400 leading-tight mb-4 min-h-[40px]">{cardDef.desc}</p>
                      </div>

                      {level < 5 ? (
                        <div className="flex gap-2 mt-auto">
                          {/* 1단계 (또는 도약) 버튼 */}
                          <button 
                            onClick={() => {
                              if (credits >= stepCost) {
                                const nc = credits - stepCost;
                                const nu = { ...shopUpgrades, upgradedCards: [...shopUpgrades.upgradedCards] };
                                for(let i = level; i < nextLevel; i++) nu.upgradedCards.push(id);
                                setCredits(nc); setShopUpgrades(nu); saveGame({ credits: nc, shopUpgrades: nu });
                                setToastMsg(`${cardDef.name} ${label} 완료!`);
                              }
                            }}
                            disabled={credits < stepCost}
                            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex flex-col items-center justify-center ${credits >= stepCost ? (isJump ? 'bg-fuchsia-600 hover:bg-fuchsia-500 shadow-[0_0_10px_rgba(192,38,211,0.5)]' : 'bg-indigo-600 hover:bg-indigo-500 shadow-md') : 'bg-slate-700 text-slate-500'}`}
                          >
                            <span>{label}</span>
                            <span className="flex items-center gap-1 text-[10px]"><img src={coinImg} alt="c" className="w-2.5 h-2.5 opacity-80" /> {stepCost}</span>
                          </button>
                          
                          {/* 빠른 5강 (MAX) 버튼 (이미 도약으로 MAX가 예정된 카드는 렌더링 생략) */}
                          {(!isJump || nextLevel < 5) && (
                            <button 
                              onClick={() => {
                                if (credits >= maxCost) {
                                  const nc = credits - maxCost;
                                  const newUpgrades = [...shopUpgrades.upgradedCards];
                                  for(let i = level; i < 5; i++) newUpgrades.push(id);
                                  const nu = { ...shopUpgrades, upgradedCards: newUpgrades };
                                  setCredits(nc); setShopUpgrades(nu); saveGame({ credits: nc, shopUpgrades: nu });
                                  setToastMsg(`${cardDef.name} 풀강 완료!`);
                                }
                              }}
                              disabled={credits < maxCost}
                              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex flex-col items-center justify-center ${credits >= maxCost ? 'bg-yellow-600 hover:bg-yellow-500 text-white shadow-[0_0_10px_rgba(202,138,4,0.4)]' : 'bg-slate-700 text-slate-500'}`}
                            >
                              <span>MAX</span>
                              <span className="flex items-center gap-1 text-[10px]"><img src={coinImg} alt="c" className="w-2.5 h-2.5 opacity-80" /> {maxCost}</span>
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="w-full py-2.5 text-center text-sm font-bold text-yellow-500 bg-yellow-900/40 rounded-lg border border-yellow-700/50 mt-auto">MAX LEVEL</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* 암시장 */}
        <div className="bg-gray-950/90 p-6 rounded-xl border-2 border-yellow-600/80 lg:col-span-4 flex flex-col shadow-[0_0_30px_rgba(202,138,4,0.15)] mt-4 backdrop-blur-md">
          <h3 className="text-2xl font-bold mb-2 text-yellow-400">전설 카드 암시장</h3>
          <p className="text-slate-400 mb-6 text-sm border-b border-slate-800 pb-4">특수 전설 카드를 확정 구매합니다. (3,000 크레딧)</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-h-[60vh] overflow-y-auto hide-scrollbar">
            {[
              'gods_eye', 'dragon_blood', 'infinite_mana_reactor', 'time_stop', 
              'chaos_magic', 'abyssal_gaze', 'super_tiger_slash', 'true_dragon_slayer', 
              'absolute_zero', 'heavenly_judgment', 'blood_of_phoenix', 'descent_of_demon_lord'
            ].map(id => {
              const cardDef = getCardDef(id, shopUpgrades);
              if (!cardDef) return null;
              const isOwned = unlockedCards.includes(id);
              return (
                <div key={id} className={`p-4 rounded-xl border-2 flex flex-col justify-between transition-colors ${isOwned ? 'border-slate-700 bg-slate-800/50 opacity-60' : 'border-yellow-600/50 bg-slate-900/80 hover:border-yellow-500'}`}>
                  <div>
                    <span className="font-black text-yellow-400 text-lg block mb-1">{cardDef.name}</span>
                    <p className="text-xs text-slate-300 leading-tight mb-4">{cardDef.desc}</p>
                  </div>
                  {!isOwned ? (
                    <button 
                      onClick={() => {
                        if (credits >= 3000) {
                          const nc = credits - 3000;
                          const nu = [...unlockedCards, id];
                          setCredits(nc); setUnlockedCards(nu); saveGame({ credits: nc, unlockedCards: nu });
                          setToastMsg(`${cardDef.name} 획득!`);
                        }
                      }}
                      disabled={credits < 3000}
                      className={`w-full py-2.5 rounded-lg text-sm font-bold flex justify-center items-center gap-1 transition-colors ${credits >= 3000 ? 'bg-yellow-600 hover:bg-yellow-500 text-white' : 'bg-slate-800 text-slate-500'}`}
                    >
                      <img src={coinImg} alt="c" className="w-3 h-3 opacity-60" /> 3000
                    </button>
                  ) : <div className="w-full py-2.5 text-center text-sm font-bold text-slate-500 bg-slate-800/80 rounded-lg">보유 중</div>}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ✨ 일반 가챠 결과창 */}
      {gachaResult && (
        <div className="fixed inset-0 bg-black/90 z-[9999] flex flex-col items-center justify-center p-4 backdrop-blur-xl animate-in fade-in duration-200" onClick={() => setGachaResult(null)}>
          <div className="text-center mb-6">
            <h2 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-300 to-indigo-400 drop-shadow-[0_0_20px_rgba(168,85,247,0.6)] mb-2">
              ✨ 신규 카드 획득! ✨
            </h2>
            <p className="text-slate-400 text-sm">획득한 카드는 덱 빌더에서 등록할 수 있습니다.</p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 md:gap-6 max-w-6xl w-full px-4" onClick={e => e.stopPropagation()}>
            {gachaResult.map((card, idx) => (
              <div key={idx} className="relative w-40 h-60 sm:w-44 sm:h-64 md:w-48 md:h-72 shrink-0 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                {card.isDuplicate && (
                  <div className="absolute top-2 right-2 bg-slate-900/90 border border-amber-500 text-amber-300 px-2 py-0.5 rounded-full font-black text-xs shadow-lg z-30 flex items-center gap-1 backdrop-blur-sm">
                    <img src={coinImg} alt="c" className="w-3 h-3"/> +10
                  </div>
                )}
                <Card card={card} />
              </div>
            ))}
          </div>

          <button onClick={() => setGachaResult(null)} className="mt-8 py-3 px-10 bg-indigo-600 hover:bg-indigo-500 transition-colors rounded-xl text-lg font-black text-white shadow-[0_0_20px_rgba(79,70,229,0.5)] border border-indigo-400">
            확인
          </button>
        </div>
      )}

      {/* ✨ 프리미엄 가챠 3장 선택 획득 모달 */}
      {localPremiumGachaResult && (
        <div className="fixed inset-0 bg-black/90 z-[9999] flex flex-col items-center justify-center p-4 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="text-center mb-6 max-w-xl">
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 font-bold text-xs mb-3 shadow-[0_0_15px_rgba(34,211,238,0.3)]">
              <Sparkles className="w-4 h-4 text-cyan-400" /> PREMIUM GACHA RESULT
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-fuchsia-400 drop-shadow-[0_0_25px_rgba(34,211,238,0.6)] mb-2">
              프리미엄 뽑기 결과
            </h2>
            <p className="text-slate-300 text-sm md:text-base">
              마음에 드는 카드 <span className="text-cyan-300 font-black underline underline-offset-4">1장</span>을 클릭하여 선택하세요!
            </p>
          </div>

          {/* 3장 카드 가로 배치 */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-8 max-w-6xl w-full px-4 items-stretch">
            {localPremiumGachaResult.map((card, idx) => {
              const isOwned = unlockedCards.includes(card.id);
              return (
                <div 
                  key={idx} 
                  onClick={() => selectLocalPremiumCard(card)}
                  className="flex flex-col items-center group cursor-pointer transition-all duration-300 hover:scale-105"
                >
                  {/* 카드 용기 (정확한 px 규격 지정) */}
                  <div className="w-44 h-64 sm:w-48 sm:h-72 md:w-56 md:h-84 relative rounded-2xl transition-all duration-300 group-hover:shadow-[0_0_35px_rgba(34,211,238,0.6)] border-2 border-transparent group-hover:border-cyan-400">
                    <Card card={card} />

                    {/* 중복 뱃지 */}
                    {isOwned && (
                      <div className="absolute top-2 right-2 z-30 bg-slate-900/90 text-yellow-400 px-2.5 py-1 rounded-full text-xs font-black border border-yellow-500 shadow-xl flex items-center gap-1 backdrop-blur-sm">
                        <img src={coinImg} className="w-3.5 h-3.5" alt="c"/>
                        <span>+30 환급</span>
                      </div>
                    )}

                    {/* 카드 선택 가이드 오버레이 */}
                    <div className="absolute inset-0 bg-gradient-to-t from-cyan-950/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-end justify-center pb-4 z-20 pointer-events-none">
                      <span className="bg-cyan-500 text-slate-950 px-4 py-2 rounded-xl font-black text-sm shadow-[0_0_15px_rgba(34,211,238,0.8)] flex items-center gap-1.5 animate-bounce">
                        <CheckCircle className="w-4 h-4" /> 이 카드 선택
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button 
            onClick={() => setLocalPremiumGachaResult(null)} 
            className="mt-8 py-2.5 px-8 bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors rounded-xl font-bold text-sm border border-slate-700 backdrop-blur-sm"
          >
            선택 취소 (포기)
          </button>
        </div>
      )}

      {/* ✨ 천장 전설 카드 선택 모달 (크기 축소 및 그리드 배열) */}
      {showPityModal && (
        <div className="fixed inset-0 bg-black/95 z-[9999] flex flex-col items-center justify-center p-4 backdrop-blur-md" onClick={() => setShowPityModal(false)}>
          <div className="bg-slate-900 border-2 border-fuchsia-500 rounded-2xl p-6 w-full max-w-[90vw] md:max-w-6xl h-[85vh] flex flex-col shadow-[0_0_50px_rgba(192,38,211,0.3)]" onClick={e=>e.stopPropagation()}>
            <div className="flex justify-between items-center border-b border-slate-700 pb-4 mb-6">
              <div>
                <h2 className="text-2xl font-black text-fuchsia-400 flex items-center gap-2"><Star className="fill-fuchsia-400"/> 확정 전설 선택권</h2>
                <p className="text-sm text-slate-400 mt-1">원하는 카드를 선택하세요. (보유 중인 카드는 선택 불가)</p>
              </div>
              <button onClick={() => setShowPityModal(false)} className="text-slate-400 hover:text-white"><X size={28}/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto hide-scrollbar grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 p-2 justify-items-center">
              {CARD_LIBRARY.filter(c => c.rarity === 'rare' || c.rarity === 'special').map(card => {
                const isOwned = unlockedCards.includes(card.id);
                return (
                  <div key={card.id} onClick={() => !isOwned && claimPityCard(card.id)} className={`relative cursor-pointer transition-transform hover:-translate-y-2 transform scale-75 origin-top ${isOwned ? 'opacity-40 grayscale hover:translate-y-0' : ''}`}>
                    <Card card={card} />
                    {isOwned && <div className="absolute inset-0 flex items-center justify-center z-10"><CheckCircle className="text-emerald-500 drop-shadow-lg w-16 h-16 bg-slate-900/50 rounded-full"/></div>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}