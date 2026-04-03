import React, { useState } from 'react';
import { Maximize, Zap, HelpCircle, CheckSquare } from 'lucide-react';
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
  handlePremiumGacha,
  gachaResult, setGachaResult,
  premiumGachaResult, setPremiumGachaResult,
  selectPremiumCard,
  setTutorialModalOpen
}) {
  const [filterType, setFilterType] = useState('all');
  const [filterEffect, setFilterEffect] = useState('all');
  const [filterRarity, setFilterRarity] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [hideMaxedUpgrades, setHideMaxedUpgrades] = useState(false);
  const [isUpgradesCollapsed, setIsUpgradesCollapsed] = useState(false);
  
  // ✨ 일괄 강화를 위한 선택된 카드 상태 추가
  const [selectedCards, setSelectedCards] = useState([]);

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

  // ✨ 현재 레벨부터 5레벨(MAX)까지 필요한 총 비용 계산
  const getMaxUpgradeCost = (rarity, currentLevel) => {
    let total = 0;
    for (let i = currentLevel; i < 5; i++) {
      total += getUpgradeCost(rarity, i);
    }
    return total;
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

  // ✨ 다중 선택 토글 로직
  const toggleSelectAll = () => {
    if (selectedCards.length === upgradableIds.length) {
      setSelectedCards([]); // 전체 해제
    } else {
      setSelectedCards(upgradableIds); // 전체 선택
    }
  };

  const toggleCardSelect = (id) => {
    if (selectedCards.includes(id)) {
      setSelectedCards(selectedCards.filter(cid => cid !== id));
    } else {
      setSelectedCards([...selectedCards, id]);
    }
  };

  // ✨ 선택 일괄 강화 로직 (toMax 여부에 따라 1강 or 풀강)
  const handleBatchUpgrade = (toMax = false) => {
    if (selectedCards.length === 0) {
      setToastMsg('선택된 카드가 없습니다.');
      return;
    }

    let currentCredits = credits;
    let newUpgradedCards = [...shopUpgrades.upgradedCards];
    let totalSpent = 0;
    let upgradeCount = 0;

    selectedCards.forEach(id => {
      const cardDef = CARD_LIBRARY.find(c => c.id === id);
      let level = newUpgradedCards.filter(c => c === id).length;
      const targetLevel = toMax ? 5 : Math.min(5, level + 1);

      while (level < targetLevel) {
        const cost = getUpgradeCost(cardDef.rarity, level);
        if (currentCredits >= cost) {
          currentCredits -= cost;
          totalSpent += cost;
          newUpgradedCards.push(id);
          level++;
          upgradeCount++;
        } else {
          break; // 돈이 모자라면 해당 카드의 강화를 멈춤
        }
      }
    });

    if (totalSpent > 0) {
      const nu = { ...shopUpgrades, upgradedCards: newUpgradedCards };
      setCredits(currentCredits);
      setShopUpgrades(nu);
      saveGame({ credits: currentCredits, shopUpgrades: nu });
      setToastMsg(`${upgradeCount}회 강화 성공! (-${totalSpent} 크레딧)`);
      if (toMax || hideMaxedUpgrades) setSelectedCards([]); // 풀강이거나 풀강숨김 상태면 선택 초기화
    } else {
      setToastMsg('크레딧이 부족하여 강화할 수 없습니다.');
    }
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
          <button onClick={handleGacha} disabled={credits < 50} className={`mt-auto py-3 px-8 rounded-lg font-bold text-lg w-full transition-all ${credits >= 50 ? 'bg-purple-600 hover:bg-purple-500 shadow-[0_0_15px_rgba(147,51,234,0.3)]' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}>50 크레딧</button>
        </div>

        {/* 프리미엄 뽑기 */}
        <div className="bg-slate-900/90 p-6 rounded-xl border-2 border-cyan-700/80 flex flex-col items-center text-center lg:col-span-2 shadow-[0_0_30px_rgba(34,211,238,0.15)] backdrop-blur-md">
          <img src={shieldImg} alt="Premium Gacha" className="w-16 h-16 mb-4 animate-pulse drop-shadow-[0_0_20px_rgba(34,211,238,0.6)] hover:scale-110 transition-transform" />
          <h3 className="text-2xl font-bold mb-2 text-cyan-300">프리미엄 뽑기</h3>
          <p className="text-slate-300 mb-6 text-sm md:text-base">3장 중 1장 선택 획득<br/><span className="text-yellow-400 font-bold">전설/희귀 등장 확률 대폭 상승!</span></p>
          <button onClick={handlePremiumGacha} disabled={credits < 100} className={`mt-auto py-3 px-8 rounded-lg font-bold text-lg w-full max-w-sm transition-all ${credits >= 100 ? 'bg-cyan-700 hover:bg-cyan-600 shadow-[0_0_20px_rgba(14,116,144,0.4)]' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}>100 크레딧</button>
        </div>

        {/* 카드 강화 영역 */}
        <div className="bg-slate-900/85 p-4 md:p-6 rounded-xl border-2 border-slate-700 lg:col-span-4 flex flex-col shadow-lg transition-all mt-4 backdrop-blur-md relative">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4 border-b border-slate-700 pb-4">
            <div>
              <h3 className="text-2xl font-bold flex items-center gap-2"><Zap className="w-6 h-6 text-yellow-400"/> 카드 영구 강화</h3>
              <p className="text-slate-400 text-sm md:text-base">등급에 따라 강화 비용이 다르며, 최대 +5까지 강화됩니다.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {/* ✨ 일괄 강화 컨트롤 UI */}
              {!isUpgradesCollapsed && (
                <div className="flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-lg border border-slate-600">
                  <button onClick={toggleSelectAll} className="px-3 py-1.5 text-sm font-bold bg-slate-700 hover:bg-slate-600 rounded flex items-center gap-1 transition-colors">
                    <CheckSquare className="w-4 h-4"/> {selectedCards.length === upgradableIds.length && upgradableIds.length > 0 ? '해제' : '전체선택'}
                  </button>
                  <button onClick={() => handleBatchUpgrade(false)} disabled={selectedCards.length === 0} className="px-3 py-1.5 text-sm font-bold bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 rounded transition-colors">
                    선택 1강
                  </button>
                  <button onClick={() => handleBatchUpgrade(true)} disabled={selectedCards.length === 0} className="px-3 py-1.5 text-sm font-bold bg-yellow-600 hover:bg-yellow-500 text-white disabled:bg-slate-700 disabled:text-slate-500 rounded transition-colors">
                    선택 MAX
                  </button>
                </div>
              )}

              <label className="flex items-center gap-2 cursor-pointer text-sm font-bold bg-slate-800 px-3 py-2 rounded-lg border border-slate-600">
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
                  
                  // ✨ 등급별 비용 계산 로직 반영
                  const nextCost = getUpgradeCost(cardDef.rarity, level);
                  const maxCost = getMaxUpgradeCost(cardDef.rarity, level);
                  const isSelected = selectedCards.includes(id);

                  return (
                    <div key={id} className={`relative p-4 rounded-xl border-2 flex flex-col justify-between transition-colors ${isSelected ? 'border-yellow-400 bg-yellow-900/20' : level > 0 ? 'border-yellow-600/60 bg-yellow-900/10' : 'border-slate-700 bg-slate-800/50'}`}>
                      {/* ✨ 개별 카드 선택용 체크박스 */}
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
                          {/* 1강 버튼 */}
                          <button 
                            onClick={() => {
                              if (credits >= nextCost) {
                                const nc = credits - nextCost;
                                const nu = { ...shopUpgrades, upgradedCards: [...shopUpgrades.upgradedCards, id] };
                                setCredits(nc); setShopUpgrades(nu); saveGame({ credits: nc, shopUpgrades: nu });
                                setToastMsg(`${cardDef.name} 1강 완료!`);
                              }
                            }}
                            disabled={credits < nextCost}
                            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex flex-col items-center justify-center ${credits >= nextCost ? 'bg-indigo-600 hover:bg-indigo-500 shadow-md' : 'bg-slate-700 text-slate-500'}`}
                          >
                            <span>1강화</span>
                            <span className="flex items-center gap-1 text-[10px]"><img src={coinImg} alt="c" className="w-2.5 h-2.5 opacity-80" /> {nextCost}</span>
                          </button>
                          
                          {/* 빠른 5강 (MAX) 버튼 */}
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
                            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex flex-col items-center justify-center ${credits >= maxCost ? 'bg-yellow-600 hover:bg-yellow-500 text-white shadow-md' : 'bg-slate-700 text-slate-500'}`}
                          >
                            <span>MAX</span>
                            <span className="flex items-center gap-1 text-[10px]"><img src={coinImg} alt="c" className="w-2.5 h-2.5 opacity-80" /> {maxCost}</span>
                          </button>
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

      {/* 가챠 결과창 */}
      {gachaResult && (
        <div className="fixed inset-0 bg-black/85 z-[9999] flex flex-col items-center justify-center p-4 backdrop-blur-md" onClick={() => setGachaResult(null)}>
          <h2 className="text-3xl md:text-5xl font-black mb-8 text-purple-400 animate-bounce">✨ 신규 카드 획득! ✨</h2>
          <div className="flex flex-wrap justify-center gap-4 md:gap-8">
            {gachaResult.map((card, idx) => (
              <div key={idx} className="relative">
                {card.isDuplicate && <span className="absolute -top-4 -right-4 bg-slate-700 border border-slate-500 text-white px-3 py-1 rounded-full font-black text-xs shadow-lg z-10 animate-pulse flex items-center gap-1">중복 <img src={coinImg} alt="c" className="w-3 h-3"/>+10</span>}
                <Card card={card} />
              </div>
            ))}
          </div>
          <button onClick={() => setGachaResult(null)} className="mt-12 py-3 px-10 bg-indigo-600 hover:bg-indigo-500 transition-colors rounded-full text-xl font-bold shadow-[0_0_15px_rgba(79,70,229,0.5)]">확인</button>
        </div>
      )}

      {/* 프리미엄 가챠 선택창 */}
      {premiumGachaResult && (
        <div className="fixed inset-0 bg-black/90 z-[9999] flex flex-col items-center justify-center p-4 backdrop-blur-md">
          <h2 className="text-3xl md:text-5xl font-black mb-2 text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">프리미엄 뽑기</h2>
          <p className="text-slate-300 text-lg mb-8">가장 마음에 드는 <span className="text-white font-bold bg-slate-800 px-2 py-0.5 rounded">1장</span>을 선택하세요!</p>
          <div className="flex flex-wrap justify-center gap-4 md:gap-8">
            {premiumGachaResult.map((card, idx) => (
              <div key={idx} className="relative group hover:-translate-y-2 transition-transform cursor-pointer">
                <Card card={card} onClick={() => selectPremiumCard(card)} />
                {unlockedCards.includes(card.id) && <span className="absolute -top-3 -left-3 bg-slate-800 text-white px-2 py-1 rounded text-xs font-bold border border-slate-600 shadow-md z-10">보유 중</span>}
              </div>
            ))}
          </div>
          <button onClick={() => setPremiumGachaResult(null)} className="mt-12 py-3 px-10 bg-slate-700 hover:bg-slate-600 transition-colors rounded-full text-lg font-bold border border-slate-500">포기</button>
        </div>
      )}
    </div>
  );
}