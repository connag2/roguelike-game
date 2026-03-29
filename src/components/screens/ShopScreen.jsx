import React, { useState } from 'react';
import { Store, Heart, Gift, Coins, Maximize, Zap, Star } from 'lucide-react';
import Card from '../common/Card';
import FilterBar from '../common/FilterBar';
import { CARD_LIBRARY } from '../../constants/gameData';

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
  selectPremiumCard
}) {
  // 상점 내부 전용 필터 상태
  const [filterType, setFilterType] = useState('all');
  const [filterEffect, setFilterEffect] = useState('all');
  const [filterRarity, setFilterRarity] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [hideMaxedUpgrades, setHideMaxedUpgrades] = useState(false);
  const [isUpgradesCollapsed, setIsUpgradesCollapsed] = useState(false);

  const hpCost = 50 + (shopUpgrades.maxHp * 40);

  // 강화 가능한 카드 필터링
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

  return (
    <div className="flex flex-col min-h-[100dvh] bg-slate-900 text-white pt-16 md:pt-4 p-4 md:p-10 relative">
      <button onClick={toggleFullScreen} className="fixed top-4 left-4 md:flex hidden z-50 items-center gap-2 bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded text-sm font-bold transition-colors border border-slate-600">
        <Maximize className="w-4 h-4"/> 전체화면
      </button>

      <div className="flex justify-between items-center mb-8 pl-0 md:pl-32 pt-12 md:pt-0">
        <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3"><Store className="w-8 h-8 text-yellow-500"/> 크레딧 상점</h2>
        <div className="flex items-center gap-4 md:gap-6">
          <span className="text-xl md:text-2xl font-bold text-yellow-400 flex items-center gap-2 bg-slate-800 px-3 py-1 rounded-full border border-yellow-900">
            <Coins className="w-5 h-5 md:w-6 md:h-6"/> {credits}
          </span>
          <button onClick={() => setGameState('MENU')} className="py-2 px-4 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-bold text-sm md:text-base shadow-md">메인으로</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 w-full max-w-6xl mx-auto h-full pb-10 overflow-y-auto hide-scrollbar">
        {/* 최대 체력 증가 */}
        <div className="bg-slate-800 p-6 rounded-xl border-2 border-slate-600 flex flex-col items-center text-center shadow-lg">
          <Heart className="w-16 h-16 text-red-500 mb-4"/>
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
            className={`mt-auto py-3 px-8 rounded-lg font-bold text-lg w-full ${credits >= hpCost ? 'bg-yellow-600 hover:bg-yellow-500' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}
          >
            {hpCost} 크레딧
          </button>
        </div>

        {/* 일반 뽑기 */}
        <div className="bg-slate-800 p-6 rounded-xl border-2 border-slate-600 flex flex-col items-center text-center shadow-lg">
          <Gift className="w-16 h-16 text-purple-500 mb-4"/>
          <h3 className="text-2xl font-bold mb-2">일반 뽑기</h3>
          <p className="text-slate-400 mb-6 text-sm md:text-base">랜덤 카드 3장 획득<br/>(중복 시 10원 환급)</p>
          <button onClick={handleGacha} disabled={credits < 50} className={`mt-auto py-3 px-8 rounded-lg font-bold text-lg w-full ${credits >= 50 ? 'bg-purple-600 hover:bg-purple-500 shadow-purple-500/20' : 'bg-slate-700 text-slate-500'}`}>50 크레딧</button>
        </div>

        {/* 프리미엄 뽑기 */}
        <div className="bg-slate-900/80 p-6 rounded-xl border-2 border-cyan-700 flex flex-col items-center text-center lg:col-span-2 shadow-cyan-900/20 shadow-xl">
          <Gift className="w-16 h-16 text-cyan-400 mb-4 animate-pulse"/>
          <h3 className="text-2xl font-bold mb-2 text-cyan-300">프리미엄 뽑기</h3>
          <p className="text-slate-300 mb-6 text-sm md:text-base">3장 중 1장 선택 획득<br/><span className="text-yellow-400 font-bold">전설/희귀 등장 확률 대폭 상승!</span></p>
          <button onClick={handlePremiumGacha} disabled={credits < 100} className={`mt-auto py-3 px-8 rounded-lg font-bold text-lg w-full max-w-sm ${credits >= 100 ? 'bg-cyan-700 hover:bg-cyan-600 shadow-cyan-500/20' : 'bg-slate-700 text-slate-500'}`}>100 크레딧</button>
        </div>

        {/* 카드 강화 영역 */}
        <div className="bg-slate-800 p-4 md:p-6 rounded-xl border-2 border-slate-600 lg:col-span-4 flex flex-col shadow-lg transition-all mt-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4 border-b border-slate-700 pb-4">
            <div>
              <h3 className="text-2xl font-bold flex items-center gap-2"><Zap className="w-6 h-6 text-yellow-400"/> 카드 영구 강화</h3>
              <p className="text-slate-400 text-sm md:text-base">해금된 카드를 강화하여 성능을 영구적으로 올립니다. (최대 +5)</p>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-bold bg-slate-900 px-3 py-2 rounded-lg border border-slate-600">
                <input type="checkbox" checked={hideMaxedUpgrades} onChange={(e) => setHideMaxedUpgrades(e.target.checked)} className="w-4 h-4 accent-yellow-500" />
                풀강 제외
              </label>
              <button onClick={() => setIsUpgradesCollapsed(!isUpgradesCollapsed)} className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg font-bold text-sm shadow-md">
                {isUpgradesCollapsed ? '펼치기' : '접기'}
              </button>
            </div>
          </div>
          
          {!isUpgradesCollapsed && (
            <>
              <FilterBar 
                type={filterType} setType={setFilterType}
                effect={filterEffect} setEffect={setFilterEffect}
                rarity={filterRarity} setRarity={setFilterRarity}
                search={searchQuery} setSearch={setSearchQuery}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto max-h-[50vh] pr-2 mt-4">
                {upgradableIds.map(id => {
                  const level = shopUpgrades.upgradedCards.filter(c => c === id).length;
                  const cardDef = getCardDef(id, shopUpgrades);
                  if (!cardDef) return null;
                  const baseCost = cardDef.rarity === 'rare' ? 200 : cardDef.rarity === 'uncommon' ? 150 : 100;
                  const upgradeCost = baseCost + (level * 50);

                  return (
                    <div key={id} className={`p-4 rounded-xl border-2 flex flex-col justify-between ${level > 0 ? 'border-yellow-500 bg-yellow-900/10' : 'border-slate-600 bg-slate-900'}`}>
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <span className={`font-black text-lg ${level > 0 ? 'text-yellow-400' : 'text-white'}`}>{cardDef.name}</span>
                          <span className="text-xs bg-slate-700 px-2 py-1 rounded text-white border border-slate-600">LV.{level}</span>
                        </div>
                        <p className="text-xs text-slate-400 leading-tight mb-4 min-h-[40px]">{cardDef.desc}</p>
                      </div>
                      {level < 5 ? (
                        <button 
                          onClick={() => {
                            if (credits >= upgradeCost) {
                              const nc = credits - upgradeCost;
                              const nu = { ...shopUpgrades, upgradedCards: [...shopUpgrades.upgradedCards, id] };
                              setCredits(nc); setShopUpgrades(nu); saveGame({ credits: nc, shopUpgrades: nu });
                              setToastMsg(`${cardDef.name} 강화 완료!`);
                            }
                          }}
                          disabled={credits < upgradeCost}
                          className={`w-full py-2 rounded-lg text-sm font-bold transition-all ${credits >= upgradeCost ? 'bg-indigo-600 hover:bg-indigo-500 shadow-md' : 'bg-slate-700 text-slate-500'}`}
                        >
                          강화 - 🪙 {upgradeCost}
                        </button>
                      ) : (
                        <div className="w-full py-2 text-center text-sm font-bold text-yellow-500 bg-yellow-900/40 rounded-lg border border-yellow-700">MAX LEVEL</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* 암시장 */}
        <div className="bg-gray-950 p-6 rounded-xl border-2 border-yellow-600 lg:col-span-4 flex flex-col shadow-yellow-600/20 shadow-2xl mt-4">
          <h3 className="text-2xl font-bold mb-2 text-yellow-400">전설 카드 암시장</h3>
          <p className="text-slate-400 mb-6 text-sm border-b border-slate-800 pb-4">특수 전설 카드를 확정 구매합니다. (3,000 크레딧)</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {['super_tiger_slash', 'true_dragon_slayer', 'absolute_zero', 'heavenly_judgment'].map(id => {
              const cardDef = getCardDef(id, shopUpgrades);
              if (!cardDef) return null;
              const isOwned = unlockedCards.includes(id);
              return (
                <div key={id} className={`p-4 rounded-xl border-2 flex flex-col justify-between ${isOwned ? 'border-slate-700 bg-slate-900 opacity-60' : 'border-yellow-500 bg-slate-900'}`}>
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
                      className={`w-full py-2 rounded-lg text-sm font-bold ${credits >= 3000 ? 'bg-yellow-600 hover:bg-yellow-500' : 'bg-slate-800 text-slate-500'}`}
                    >
                      3000 크레딧
                    </button>
                  ) : <div className="w-full py-2 text-center text-sm font-bold text-slate-500 bg-slate-800 rounded-lg">보유 중</div>}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 가챠 결과창 */}
      {gachaResult && (
        <div className="fixed inset-0 bg-black/85 z-[9999] flex flex-col items-center justify-center p-4 backdrop-blur-sm" onClick={() => setGachaResult(null)}>
          <h2 className="text-3xl md:text-5xl font-black mb-8 text-purple-400 animate-bounce">✨ 신규 카드 획득! ✨</h2>
          <div className="flex flex-wrap justify-center gap-4 md:gap-8">
            {gachaResult.map((card, idx) => (
              <div key={idx} className="relative">
                {card.isDuplicate && <span className="absolute -top-4 -right-4 bg-slate-600 border border-slate-400 text-white px-3 py-1 rounded-full font-black text-xs shadow-lg z-10 animate-pulse">중복 (+10원)</span>}
                <Card card={card} />
              </div>
            ))}
          </div>
          <button onClick={() => setGachaResult(null)} className="mt-12 py-3 px-10 bg-indigo-600 rounded-full text-xl font-bold">확인</button>
        </div>
      )}
      // ShopScreen.jsx 상단 우측 버튼 그룹
<div className="flex items-center gap-3">
  <button onClick={() => setTutorialModalOpen(true)} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-600 transition-colors">
    <HelpCircle className="w-5 h-5 text-yellow-500" />
  </button>
  <button onClick={() => setGameState('MENU')} className="...">메인으로</button>
</div>

      {/* 프리미엄 가챠 선택창 */}
      {premiumGachaResult && (
        <div className="fixed inset-0 bg-black/90 z-[9999] flex flex-col items-center justify-center p-4">
          <h2 className="text-3xl md:text-5xl font-black mb-2 text-cyan-400">프리미엄 뽑기</h2>
          <p className="text-slate-300 text-lg mb-8">가장 마음에 드는 <span className="text-white font-bold">1장</span>을 선택하세요!</p>
          <div className="flex flex-wrap justify-center gap-4 md:gap-8">
            {premiumGachaResult.map((card, idx) => (
              <div key={idx} className="relative group">
                <Card card={card} onClick={() => selectPremiumCard(card)} />
                {unlockedCards.includes(card.id) && <span className="absolute -top-3 -left-3 bg-slate-700 text-white px-2 py-1 rounded text-xs font-bold border border-slate-500 z-10">보유 중</span>}
              </div>
            ))}
          </div>
          <button onClick={() => setPremiumGachaResult(null)} className="mt-12 py-3 px-10 bg-slate-700 rounded-full text-lg font-bold">포기</button>
        </div>
      )}
    </div>
  );
}