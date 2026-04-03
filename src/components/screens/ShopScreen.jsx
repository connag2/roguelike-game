import React, { useState } from 'react';
import { Store, Coins, X, ArrowUpCircle, Sparkles, CheckCircle, Star } from 'lucide-react';
import { CARD_LIBRARY } from '../../constants/gameData';

export default function ShopScreen({ 
  credits, setCredits, shopUpgrades, setShopUpgrades, unlockedCards, setUnlockedCards, 
  saveGame, setGameState, getCardDef, handleGacha, gachaResult, setGachaResult, 
  premiumGachaResult, setPremiumGachaResult, setToastMsg 
}) {
  const [activeTab, setActiveTab] = useState('GACHA'); // 'GACHA' or 'UPGRADE'
  const [showPityModal, setShowPityModal] = useState(false);

  const pityCount = shopUpgrades.pityCount || 0;
  const PITY_TARGET = 30;

  // ✨ 프리미엄 뽑기 (중복 환급 및 천장 카운트 적용)
  const localHandlePremiumGacha = () => {
    if (credits < 100) { setToastMsg('크레딧이 부족합니다.'); return; }
    
    let duplicateRefund = 0;
    let currentUnlocked = [...unlockedCards];
    const result = [];

    for (let i = 0; i < 3; i++) {
      const roll = Math.random();
      // 프리미엄 확률 조정: 15% 전설/특수, 85% 희귀
      let rarity = roll < 0.15 ? 'rare' : 'uncommon'; 
      const pool = CARD_LIBRARY.filter(c => c.rarity === rarity || (rarity === 'rare' && c.rarity === 'special'));
      const card = pool[Math.floor(Math.random() * pool.length)];

      if (currentUnlocked.includes(card.id)) {
        result.push({ ...card, isDuplicate: true });
        duplicateRefund += 30; // 프리미엄 환급액
      } else {
        result.push({ ...card, isDuplicate: false });
        currentUnlocked.push(card.id);
      }
    }

    const newCredits = credits - 100 + duplicateRefund;
    const newPity = pityCount + 1;
    const newUpgrades = { ...shopUpgrades, pityCount: newPity };

    setCredits(newCredits);
    setUnlockedCards(currentUnlocked);
    setShopUpgrades(newUpgrades);
    setPremiumGachaResult(result);
    saveGame({ credits: newCredits, unlockedCards: currentUnlocked, shopUpgrades: newUpgrades });

    if (duplicateRefund > 0) setToastMsg(`중복 카드 변환: ${duplicateRefund} 크레딧 환급됨!`);
  };

  // ✨ 카드 강화 로직 (마나 카드 즉시 MAX, 버프 카드는 4강부터)
  const handleUpgradeCard = (cardId) => {
    const cardBase = CARD_LIBRARY.find(c => c.id === cardId);
    if (!cardBase) return;

    const existing = shopUpgrades.upgradedCards?.find(u => u.id === cardId);
    const currentLevel = existing ? existing.level : 0;
    if (currentLevel >= 5) { setToastMsg('이미 최대 레벨입니다!'); return; }

    const cost = 50 + (currentLevel * 50);
    if (credits < cost) { setToastMsg('크레딧이 부족합니다!'); return; }

    const isManaDrawOnly = (c) => (c.manaGain || c.draw) && !c.damage && !c.block && !c.heal;
    const isBuffDebuffOnly = (c) => (c.selfStrength || c.selfDex || c.enemyWeak || c.enemyVuln || c.enemyPoison) && !c.damage && !c.block && !c.heal && !c.manaGain && !c.draw;

    let nextLevel = currentLevel + 1;
    if (isManaDrawOnly(cardBase)) {
      nextLevel = 5; // 무조건 MAX
    } else if (isBuffDebuffOnly(cardBase)) {
      if (currentLevel === 0) nextLevel = 4; // 0강이면 무조건 4강으로
      else nextLevel = 5; // 그 다음은 MAX
    }

    const newUpgradedCards = [...(shopUpgrades.upgradedCards || []).filter(u => u.id !== cardId), { id: cardId, level: nextLevel }];
    const newUpgrades = { ...shopUpgrades, upgradedCards: newUpgradedCards };

    setCredits(credits - cost);
    setShopUpgrades(newUpgrades);
    saveGame({ credits: credits - cost, shopUpgrades: newUpgrades });
    setToastMsg(`[${cardBase.name}] 강화 완료!`);
  };

  // 천장 보상 선택
  const handleClaimPity = (cardId) => {
    let currentUnlocked = [...unlockedCards];
    if (!currentUnlocked.includes(cardId)) {
      currentUnlocked.push(cardId);
    } else {
      setToastMsg('이미 보유한 전설 카드입니다! 다른 카드를 선택하세요.');
      return;
    }

    const newUpgrades = { ...shopUpgrades, pityCount: 0 }; // 천장 스택 초기화
    setUnlockedCards(currentUnlocked);
    setShopUpgrades(newUpgrades);
    saveGame({ unlockedCards: currentUnlocked, shopUpgrades: newUpgrades });
    setToastMsg('전설 카드를 획득했습니다!');
    setShowPityModal(false);
  };

  // 간단한 카드 렌더링 컴포넌트
  const SimpleCard = ({ card, level, onUpgrade, cost, isOwned }) => {
    const isMax = level >= 5;
    const displayLevel = level === 5 ? 'MAX' : `+${level}`;
    const def = getCardDef(card.id, shopUpgrades) || card;
    
    return (
      <div className={`p-3 rounded-xl border-2 flex flex-col items-center justify-between min-h-[140px] bg-slate-800 transition-all ${isOwned ? 'border-indigo-500 hover:-translate-y-1 shadow-lg' : 'border-slate-700 opacity-40 grayscale'}`}>
        <div className="font-black text-sm text-center mb-2">{def.name} {level > 0 && <span className="text-yellow-400 ml-1">{displayLevel}</span>}</div>
        <div className="text-[10px] text-slate-300 text-center flex-1 px-1 bg-slate-900 rounded p-2 border border-slate-700 w-full">{def.desc}</div>
        {onUpgrade && isOwned && (
           <button onClick={() => onUpgrade(card.id)} disabled={isMax} className={`mt-3 w-full py-1.5 rounded text-xs font-bold transition-colors ${isMax ? 'bg-slate-700 text-slate-500' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,128,0.3)]'}`}>
             {isMax ? '최대 레벨' : `${cost} CR 강화`}
           </button>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-[100dvh] bg-slate-900 text-white p-4 pt-16 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 max-w-6xl mx-auto w-full px-4">
        <h2 className="text-3xl font-black flex items-center gap-3 tracking-tighter text-yellow-500">
          <Store size={32} /> 암시장 상점
        </h2>
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-full font-bold border border-slate-700 shadow-inner">
            <Coins size={18} className="text-yellow-400" /> {credits} 크레딧
          </div>
          <button onClick={() => setGameState('MENU')} className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold shadow-lg transition-all border border-slate-600">돌아가기</button>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="flex justify-center gap-4 mb-8 max-w-6xl mx-auto w-full">
        <button onClick={() => setActiveTab('GACHA')} className={`flex-1 py-3 font-bold rounded-xl transition-all border-b-4 ${activeTab === 'GACHA' ? 'bg-indigo-600 border-indigo-800 shadow-lg text-white' : 'bg-slate-800 border-slate-900 text-slate-400 hover:bg-slate-700'}`}>카드 뽑기 (GACHA)</button>
        <button onClick={() => setActiveTab('UPGRADE')} className={`flex-1 py-3 font-bold rounded-xl transition-all border-b-4 ${activeTab === 'UPGRADE' ? 'bg-emerald-600 border-emerald-800 shadow-lg text-white' : 'bg-slate-800 border-slate-900 text-slate-400 hover:bg-slate-700'}`}>성장 & 강화 (UPGRADE)</button>
      </div>

      <div className="max-w-6xl mx-auto w-full flex-1 overflow-y-auto hide-scrollbar pb-20">
        
        {/* 뽑기(Gacha) 탭 */}
        {activeTab === 'GACHA' && (
          <div className="flex flex-col gap-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 일반 뽑기 */}
              <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 flex flex-col items-center text-center shadow-xl">
                 <Sparkles size={48} className="text-blue-400 mb-4"/>
                 <h3 className="text-2xl font-black mb-2">스탠다드 팩</h3>
                 <p className="text-sm text-slate-400 mb-6">일반 ~ 희귀 카드가 무작위로 3장 등장합니다. 중복 카드는 10 크레딧으로 환급됩니다.</p>
                 <button onClick={handleGacha} className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-black text-lg shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-transform active:scale-95">50 CR 뽑기</button>
              </div>
              
              {/* 프리미엄 뽑기 */}
              <div className="bg-slate-800 p-8 rounded-3xl border-2 border-indigo-500 flex flex-col items-center text-center shadow-[0_0_30px_rgba(79,70,229,0.2)]">
                 <Star size={48} className="text-indigo-400 mb-4"/>
                 <h3 className="text-2xl font-black mb-2">프리미엄 팩</h3>
                 <p className="text-sm text-slate-400 mb-6">희귀 ~ 전설 카드가 3장 등장합니다! 중복 시 30 크레딧 환급. (전설 확률 15%)</p>
                 <button onClick={localHandlePremiumGacha} className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-black text-lg shadow-[0_0_20px_rgba(79,70,229,0.5)] transition-transform active:scale-95">100 CR 고급 뽑기</button>
              </div>
            </div>

            {/* 천장 시스템 UI */}
            <div className="bg-slate-800 p-6 rounded-2xl border border-fuchsia-500/50 shadow-lg text-center mt-4">
              <h4 className="text-lg font-bold text-fuchsia-400 mb-2">프리미엄 천장 시스템</h4>
              <div className="w-full bg-slate-950 h-4 rounded-full overflow-hidden mb-2 border border-slate-700">
                <div className="bg-gradient-to-r from-fuchsia-600 to-purple-400 h-full transition-all duration-500" style={{width: `${Math.min(100, (pityCount / PITY_TARGET) * 100)}%`}}></div>
              </div>
              <div className="text-sm text-slate-300 font-bold mb-4">{pityCount} / {PITY_TARGET} 회 진행</div>
              <button 
                onClick={() => setShowPityModal(true)} 
                disabled={pityCount < PITY_TARGET}
                className={`px-8 py-3 rounded-lg font-bold transition-all ${pityCount >= PITY_TARGET ? 'bg-fuchsia-600 hover:bg-fuchsia-500 text-white shadow-[0_0_20px_rgba(192,38,211,0.5)] animate-pulse' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}
              >
                전설 카드 확정 선택권 사용
              </button>
            </div>
          </div>
        )}

        {/* 강화(Upgrade) 탭 */}
        {activeTab === 'UPGRADE' && (
          <div>
            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 flex justify-between items-center mb-8 shadow-lg">
               <div>
                 <div className="font-black text-lg text-red-400 flex items-center gap-2"><ArrowUpCircle/> 기본 체력 한계 돌파</div>
                 <div className="text-xs text-slate-400 mt-1">현재 등급: {shopUpgrades.maxHp} (추가 체력: +{shopUpgrades.maxHp * 20})</div>
               </div>
               <button onClick={() => {
                 const cost = 100 + (shopUpgrades.maxHp * 100);
                 if (credits >= cost) {
                   setCredits(credits - cost);
                   const upg = { ...shopUpgrades, maxHp: shopUpgrades.maxHp + 1 };
                   setShopUpgrades(upg);
                   saveGame({ credits: credits - cost, shopUpgrades: upg });
                   setToastMsg('최대 체력이 +20 증가했습니다!');
                 } else setToastMsg('크레딧이 부족합니다.');
               }} className="px-6 py-3 bg-red-700 hover:bg-red-600 rounded-lg font-bold text-sm shadow-lg">
                 {100 + (shopUpgrades.maxHp * 100)} CR 훈련
               </button>
            </div>

            <h3 className="font-black text-xl mb-4 border-b border-slate-700 pb-2">보유 카드 강화 (마나/버프 카드 초고속 강화 적용)</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {CARD_LIBRARY.filter(c => unlockedCards.includes(c.id)).map(card => {
                const existing = shopUpgrades.upgradedCards?.find(u => u.id === card.id);
                const level = existing ? existing.level : 0;
                const cost = 50 + (level * 50);
                return <SimpleCard key={card.id} card={card} level={level} onUpgrade={handleUpgradeCard} cost={cost} isOwned={true} />;
              })}
            </div>
          </div>
        )}
      </div>

      {/* 가시성을 개선한 콤팩트한 뽑기 결과 모달 */}
      {(gachaResult || premiumGachaResult) && (
        <div className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => { setGachaResult(null); setPremiumGachaResult(null); }}>
          <div className="bg-slate-900 border-2 border-indigo-500 rounded-2xl p-6 md:p-10 w-full max-w-3xl text-center shadow-[0_0_50px_rgba(79,70,229,0.3)] animate-draw" onClick={e=>e.stopPropagation()}>
            <h2 className="text-3xl font-black mb-2 text-indigo-400">획득 결과</h2>
            <p className="text-slate-400 text-sm mb-8">중복된 카드는 크레딧으로 자동 환급되었습니다.</p>
            
            <div className="grid grid-cols-3 gap-3 md:gap-6 mb-8 justify-items-center">
              {(gachaResult || premiumGachaResult).map((card, idx) => (
                <div key={idx} className="relative w-full max-w-[150px]">
                  <SimpleCard card={card} level={0} isOwned={true} />
                  {card.isDuplicate && (
                    <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center backdrop-blur-[1px]">
                      <span className="font-black text-yellow-400 bg-slate-900 px-2 py-1 rounded text-xs border border-yellow-600">중복 변환</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <button onClick={() => { setGachaResult(null); setPremiumGachaResult(null); }} className="w-full md:w-1/2 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold transition-colors">확인</button>
          </div>
        </div>
      )}

      {/* 천장 시스템 - 전설 카드 선택 모달 */}
      {showPityModal && (
        <div className="fixed inset-0 bg-black/95 z-[9999] flex flex-col items-center justify-center p-4 backdrop-blur-md" onClick={() => setShowPityModal(false)}>
          <div className="bg-slate-900 border-2 border-fuchsia-500 rounded-2xl p-6 w-full max-w-5xl h-[80vh] flex flex-col shadow-[0_0_50px_rgba(192,38,211,0.3)]" onClick={e=>e.stopPropagation()}>
            <div className="flex justify-between items-center border-b border-slate-700 pb-4 mb-6">
              <h2 className="text-2xl font-black text-fuchsia-400 flex items-center gap-2"><Star/> 확정 획득 선택</h2>
              <button onClick={() => setShowPityModal(false)} className="text-slate-400 hover:text-white"><X size={24}/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto hide-scrollbar grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 p-2">
              {CARD_LIBRARY.filter(c => c.rarity === 'rare' || c.rarity === 'special').map(card => {
                const isOwned = unlockedCards.includes(card.id);
                return (
                  <div key={card.id} onClick={() => !isOwned && handleClaimPity(card.id)} className={`relative cursor-pointer transition-transform hover:-translate-y-2 ${isOwned ? 'opacity-30' : ''}`}>
                    <SimpleCard card={card} level={0} isOwned={!isOwned} />
                    {isOwned && <div className="absolute inset-0 flex items-center justify-center"><CheckCircle className="text-emerald-500 drop-shadow-md" size={48}/></div>}
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