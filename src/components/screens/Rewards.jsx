// src/components/screens/Rewards.jsx
import React from 'react';
import { Trash2, AlertTriangle, Star } from 'lucide-react';
import Card from '../common/Card';
import { CARD_LIBRARY } from '../../constants/gameData';

import scrollImg from '../../assets/images/items/scroll.svg';
import potionImg from '../../assets/images/items/potion.svg';
import shieldImg from '../../assets/images/items/shield.svg';

export default function Rewards({
  gameState,
  rewardCards,
  setRewardCards,
  combatState,
  unlockedCards,
  setUnlockedCards,
  saveGame,
  setGameState,
  confirmSelection,
  setConfirmSelection,
  startNextStage,
  getCardDef,
  shopUpgrades,
  specialBossRewardCard,
  handleSpecialBossRewardClaim,
  pendingRelicReward,         
  handleRelicRewardClaim,     
  enemyDropCard,        // 🌟 [추가] 몬스터 드랍 카드 정보
  setEnemyDropCard,     // 🌟 [추가] 몬스터 드랍 카드 초기화용
  customCards,          // 🌟 [추가] 전리품 보관 풀
  setCustomCards        // 🌟 [추가] 전리품 보관 함수
}) {
  if (!combatState) return null;

  // 🌟 0. 유물 발견 보상 화면 (최우선 표시)
  if (gameState === 'RELIC_REWARD' && pendingRelicReward) {
    let rColor = 'text-slate-400';
    let rBorder = 'border-slate-400';
    if (pendingRelicReward.rarity === 'uncommon') { rColor = 'text-cyan-400'; rBorder = 'border-cyan-400'; }
    if (pendingRelicReward.rarity === 'rare') { rColor = 'text-yellow-400'; rBorder = 'border-yellow-400'; }
    if (pendingRelicReward.rarity === 'special') { rColor = 'text-fuchsia-400'; rBorder = 'border-fuchsia-400'; }
    if (pendingRelicReward.rarity === 'mythic') { rColor = 'text-red-500 font-black'; rBorder = 'border-red-500'; }

    return (
      <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-slate-900 text-white p-4 relative overflow-hidden">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-[100px] pointer-events-none animate-pulse`}></div>
        <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-amber-500 mb-12 animate-[bounce_1s_ease-in-out_infinite] drop-shadow-[0_0_20px_rgba(251,191,36,0.8)]">
          🌟 유물 발견! 🌟
        </h1>
        <div 
          onClick={handleRelicRewardClaim} 
          className={`z-10 bg-slate-800/80 backdrop-blur-md p-8 md:p-10 rounded-3xl border-4 ${rBorder} shadow-[0_0_50px_rgba(245,158,11,0.3)] max-w-sm w-full text-center transform transition-all duration-300 hover:scale-110 cursor-pointer animate-[scale-in_0.5s_ease-out] flex flex-col items-center`}
        >
          <img src={shieldImg} alt="Relic" className="w-20 h-20 mb-4 drop-shadow-[0_0_15px_rgba(251,191,36,0.6)] animate-pulse" />
          <h2 className={`text-3xl md:text-4xl mb-6 ${rColor} drop-shadow-lg`}>{pendingRelicReward.name}</h2>
          <p className="text-slate-200 text-base md:text-lg bg-black/50 p-6 rounded-xl border border-white/10 shadow-inner break-keep leading-relaxed w-full">
            {pendingRelicReward.desc}
          </p>
          <div className="mt-8 text-amber-400 font-bold animate-pulse text-sm">
            클릭하여 장착하기 (취소 불가)
          </div>
        </div>
      </div>
    );
  }

  // 1. 기본 보상 선택 화면
  if (gameState === 'REWARDS') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-slate-900 text-white p-4">
        <h2 className="text-4xl md:text-5xl font-black mb-4 text-yellow-400 tracking-wider text-center drop-shadow-2xl">스테이지 클리어!</h2>
        <p className="text-lg md:text-xl mb-10 text-slate-300">원하는 보상을 하나 선택하세요.</p>
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 w-full max-w-4xl justify-center items-center">
          
          <button onClick={() => {
            const currentManaCount = combatState.baseDeck.filter(c => ['mana_potion', 'overcharge', 'meditate', 'dark_bargain', 'catalyst', 'blood_ritual', 'mana_amp', 'mana_spring', 'mana_burst', 'lucky_coin'].includes(c.id)).length;
            const pool = CARD_LIBRARY.filter(c => {
               const count = combatState.baseDeck.filter(dc => dc.id === c.id).length;
               if (count >= 3) return false;
               if (['mana_potion', 'overcharge', 'meditate', 'dark_bargain', 'catalyst', 'blood_ritual', 'mana_amp', 'mana_spring', 'mana_burst', 'lucky_coin'].includes(c.id) && currentManaCount >= 2) return false;
               return true;
            });
            const legendProb = Math.floor(combatState.stage / 10) * 0.01;
            let selected = [];
            let avPool = [...pool];
            for(let i=0; i<3; i++) {
              if(avPool.length === 0) break;
              const r = Math.random();
              let t = r < legendProb ? 'rare' : r < legendProb + 0.15 ? 'uncommon' : 'common';
              let pList = avPool.filter(c => c.rarity === t);
              if (pList.length === 0) pList = avPool;
              const picked = pList[Math.floor(Math.random() * pList.length)];
              selected.push(getCardDef(picked.id, shopUpgrades));
              avPool = avPool.filter(c => c.id !== picked.id);
            }
            setRewardCards(selected);
            setGameState('REWARD_CARD');
          }} className="p-6 md:p-8 bg-slate-800 hover:bg-slate-700 border-2 border-indigo-500 rounded-2xl flex flex-col items-center w-full md:w-64 transition-all shadow-xl hover:-translate-y-1 group">
            <img src={scrollImg} alt="Add Card" className="w-12 h-12 md:w-16 md:h-16 mb-4 drop-shadow-[0_0_10px_rgba(129,140,248,0.5)] group-hover:scale-110 transition-transform" />
            <span className="text-xl md:text-2xl font-bold">카드 추가</span>
          </button>

          <button onClick={() => {
            const p = { ...combatState.player };
            p.hp = Math.min(p.maxHp, p.hp + Math.floor(p.maxHp * 0.3));
            p.debuffs = { weak: 0, vulnerable: 0, poison: 0 }; 
            startNextStage(p, combatState.baseDeck);
          }} className="p-6 md:p-8 bg-slate-800 hover:bg-slate-700 border-2 border-green-500 rounded-2xl flex flex-col items-center w-full md:w-64 transition-all shadow-xl hover:-translate-y-1 group">
            <img src={potionImg} alt="Heal" className="w-12 h-12 md:w-16 md:h-16 mb-4 drop-shadow-[0_0_10px_rgba(74,222,128,0.5)] group-hover:scale-110 transition-transform" />
            <span className="text-xl md:text-2xl font-bold">회복 & 정화</span>
          </button>

          <button onClick={() => setGameState('REWARD_REMOVE')} className="p-6 md:p-8 bg-slate-800 hover:bg-slate-700 border-2 border-red-500 rounded-2xl flex flex-col items-center w-full md:w-64 transition-all shadow-xl hover:-translate-y-1 group">
            <Trash2 className="w-12 h-12 md:w-16 md:h-16 mb-4 text-red-400 group-hover:scale-110 transition-transform"/>
            <span className="text-xl md:text-2xl font-bold">카드 삭제</span>
          </button>

          {/* 🌟 [추가] 몬스터가 카드를 떨궜을 때만 나타나는 버튼 */}
          {enemyDropCard && (
            <button onClick={() => {
              setConfirmSelection({ action: 'add', card: enemyDropCard, isNew: !unlockedCards.includes(enemyDropCard.id) });
            }} className="p-6 md:p-8 bg-slate-800 hover:bg-slate-700 border-2 border-emerald-500 rounded-2xl flex flex-col items-center w-full md:w-64 transition-all shadow-xl hover:-translate-y-1 group">
              <Star className="w-12 h-12 md:w-16 md:h-16 mb-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="text-xl md:text-2xl font-bold text-emerald-400">전리품 획득</span>
              <span className="text-sm text-emerald-500 mt-2 font-bold truncate w-full px-2">{enemyDropCard.name}</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // 2. 카드 추가 선택 화면
  if (gameState === 'REWARD_CARD') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-slate-900 text-white p-4 relative">
        <h2 className="text-2xl md:text-3xl font-bold mb-8">추가할 카드를 선택하세요</h2>
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 flex-wrap justify-center w-full max-w-4xl px-4">
          {rewardCards.map((card, idx) => {
            const isNew = !unlockedCards.includes(card.id);
            return (
              <div key={idx} className="relative group w-32 h-44 md:w-44 md:h-60">
                <Card card={card} onClick={() => setConfirmSelection({ action: 'add', card, isNew })} />
                {isNew && <span className="absolute -top-3 -right-3 bg-yellow-500 text-black px-2 py-1 rounded-full font-black text-[10px] md:text-xs animate-bounce z-30 shadow-lg">NEW!</span>}
              </div>
            );
          })}
        </div>
        {confirmSelection?.action === 'add' && (
          <div className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-slate-800 p-8 rounded-xl border-2 border-slate-600 w-full max-w-md text-center shadow-2xl animate-draw flex flex-col items-center">
              <h3 className="text-xl font-bold mb-6">덱에 추가하시겠습니까?</h3>
              <div className="w-36 h-48 mb-8"><Card card={confirmSelection.card} /></div>
              <div className="flex gap-4 w-full">
                <button onClick={() => setConfirmSelection(null)} className="px-6 py-3 bg-slate-700 hover:bg-slate-600 transition-colors rounded-lg font-bold flex-1">취소</button>
                <button onClick={() => {
                  const newDeck = [...combatState.baseDeck, { ...confirmSelection.card }];
                  let newUnlocked = unlockedCards;
                  let newCustomCards = customCards; // 🌟 추가

                  // 1. 도감 해금
                  if (confirmSelection.isNew || !unlockedCards.includes(confirmSelection.card.id)) {
                    newUnlocked = [...unlockedCards, confirmSelection.card.id];
                    setUnlockedCards(newUnlocked);
                  }
                  
                  // 2. 전리품 카드일 경우 도감에 영구 저장 (중복 방지)
                  if (confirmSelection.card.id.startsWith('drop_') && !customCards.some(c => c.id === confirmSelection.card.id)) {
                    newCustomCards = [...customCards, confirmSelection.card];
                    setCustomCards(newCustomCards);
                  }

                  saveGame({ unlockedCards: newUnlocked, customCards: newCustomCards });
                  setConfirmSelection(null);
                  if (setEnemyDropCard) setEnemyDropCard(null); // 다음 스테이지를 위해 상태 초기화
                  startNextStage(combatState.player, newDeck);
                }} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 transition-colors rounded-lg font-bold flex-1 shadow-lg shadow-indigo-500/30">추가</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 3. 카드 삭제 선택 화면
  if (gameState === 'REWARD_REMOVE') {
    return (
      <div className="flex flex-col min-h-[100dvh] bg-slate-900 text-white p-4 md:p-10 relative">
        <div className="flex justify-between items-center mb-6 w-full max-w-6xl mx-auto px-2">
          <h2 className="text-2xl md:text-3xl font-bold text-red-400">삭제할 카드를 선택하세요</h2>
          <button onClick={() => setGameState('REWARDS')} className="py-2 px-4 bg-slate-700 hover:bg-slate-600 transition-colors rounded-lg font-bold border border-slate-500 shadow-md">돌아가기</button>
        </div>
        <div className="flex flex-wrap justify-center gap-3 overflow-y-auto hide-scrollbar pb-10 max-w-6xl mx-auto px-2">
          {combatState.baseDeck.map((card, idx) => (
            <div key={idx} className="relative group cursor-pointer w-28 h-40 md:w-36 md:h-48" onClick={() => setConfirmSelection({ action: 'remove', idx, card })}>
              <Card card={card} />
              <div className="absolute inset-0 bg-red-900/0 group-hover:bg-red-900/70 rounded-xl transition-all flex items-center justify-center border-2 border-transparent group-hover:border-red-500 z-30">
                 <Trash2 className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ))}
        </div>
        {confirmSelection?.action === 'remove' && (
          <div className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-slate-800 p-8 rounded-xl border-2 border-red-900 w-full max-w-md text-center shadow-2xl animate-draw flex flex-col items-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
              <h3 className="text-xl font-bold mb-6">정말로 삭제하시겠습니까?</h3>
              <div className="w-36 h-48 mb-6"><Card card={confirmSelection.card} /></div>
              <div className="flex gap-4 w-full">
                <button onClick={() => setConfirmSelection(null)} className="px-6 py-3 bg-slate-700 hover:bg-slate-600 transition-colors rounded-lg font-bold flex-1">취소</button>
                <button onClick={() => {
                  const newDeck = [...combatState.baseDeck];
                  newDeck.splice(confirmSelection.idx, 1);
                  setConfirmSelection(null);
                  startNextStage(combatState.player, newDeck);
                }} className="px-6 py-3 bg-red-700 hover:bg-red-600 transition-colors rounded-lg font-bold flex-1 shadow-lg">삭제</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 4. 보스 클리어 특수 보상 화면
  if (gameState === 'BOSS_CLEAR_REWARD' && specialBossRewardCard) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-slate-900 text-white p-4 relative z-50 overflow-hidden">
        <div className="absolute inset-0 bg-fuchsia-600/10 animate-pulse pointer-events-none" />
        <h2 className="text-4xl md:text-5xl font-black mb-4 text-fuchsia-400 tracking-wider text-center drop-shadow-lg animate-bounce">특수 보스 처치 보상!</h2>
        <p className="text-lg md:text-xl mb-10 text-slate-300 text-center">압도적인 적을 물리친 증표로<br/>새로운 특수 카드를 획득했습니다.</p>
        <div className="relative group w-48 h-64 md:w-64 md:h-80 mb-10 animate-draw">
          <div className="scale-125 md:scale-150 origin-top h-full w-full">
            <Card card={specialBossRewardCard} />
          </div>
          <div className="absolute inset-0 border-4 border-fuchsia-500/50 rounded-xl animate-pulse" />
        </div>
        <button onClick={handleSpecialBossRewardClaim} className="px-10 py-4 bg-fuchsia-700 hover:bg-fuchsia-600 rounded-full font-bold text-xl md:text-2xl shadow-fuchsia-500/40 shadow-2xl mt-24 transition-transform hover:scale-105">수락하기</button>
      </div>
    );
  }

  return null;
}