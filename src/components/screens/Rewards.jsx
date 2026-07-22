// src/components/screens/Rewards.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Trash2, AlertTriangle, Star, ChevronDown } from 'lucide-react';
import Card from '../common/Card';
import { CARD_LIBRARY, BOSS_LOOT_CARDS } from '../../constants/gameData';
import { RELIC_LIBRARY } from '../../constants/relicData';

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
  pendingRelicChoices,
  handleRelicChoiceClaim,
  enemyDropCard,
  setEnemyDropCard,
  customCards,
  setCustomCards,
  playerRelics,
  unlockedRelics,
  handleEnemyDropClaim,
  handleSpecialBossRewardClaim: handleSpecialClaim,
  autoReward = false,
  autoRewardType = 'card',
  autoRelic = true,
}) {
  const [expandedCards, setExpandedCards] = useState({});
  const [selectedRelics, setSelectedRelics] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const processedRef = useRef(false);
  const combatStateRef = useRef(combatState); // 항상 최신 combatState를 참조
  combatStateRef.current = combatState; // 매 렌더마다 업데이트

  // gameState 바뀔 때마다 처리 플래그 리셋
  useEffect(() => {
    processedRef.current = false;
    setIsProcessing(false);
  }, [gameState]);

  // 🤖 AUTO 보상 자동 선택 (안전한 단순 타이머 방식)
  useEffect(() => {
    if (!autoReward || !combatState || isProcessing || processedRef.current) return;

    // 유물 자동 획득
    if (gameState === 'RELIC_REWARD' && autoRelic && pendingRelicReward && handleRelicRewardClaim) {
      processedRef.current = true;
      const t = setTimeout(() => handleRelicRewardClaim(), 500);
      return () => clearTimeout(t);
    }

    // 보스 유물 3지선다 자동 선택 (첫 번째 유물)
    if (gameState === 'BOSS_RELIC_CHOICE' && autoRelic && pendingRelicChoices && pendingRelicChoices.length > 0 && handleRelicChoiceClaim) {
      processedRef.current = true;
      const t = setTimeout(() => handleRelicChoiceClaim(pendingRelicChoices[0]), 500);
      return () => clearTimeout(t);
    }

    // 기본 보상 화면 (카드 추가 or 회복)
    if (gameState === 'REWARDS') {
      processedRef.current = true;
      const t = setTimeout(() => {
        setIsProcessing(true);
        const cs = combatStateRef.current; // ✅ 최신 combatState 사용
        if (!cs || !cs.player) return;

        if (autoRewardType === 'heal') {
          const p = { ...cs.player };
          p.hp = Math.min(p.maxHp, p.hp + Math.floor(p.maxHp * 0.3));
          p.debuffs = { weak: 0, vulnerable: 0, poison: 0 };
          startNextStage(p, cs.baseDeck);
        } else {
          // 카드 추가: 카드 3장 생성 후 최고 등급 자동 선택
          const baseDeck = cs.baseDeck || [];
          const pool = CARD_LIBRARY.filter(c => {
            if (!c || !c.id) return false;
            // 특수(special) 타입과 loot 유형은 보상에서 제외
            if (c.type === 'special' || c.rarity === 'special' || c.rarity === 'loot') return false;
            const count = baseDeck.filter(dc => dc && dc.id === c.id).length;
            return count < 3;
          });
          const avPool = pool.length > 0 ? [...pool] : [...CARD_LIBRARY];
          const stage = cs.stage || 1;
          const legendProb = Math.floor(stage / 10) * 0.01;
          const selected = [];
          const remaining = [...avPool];
          for (let i = 0; i < 3 && remaining.length > 0; i++) {
            const r = Math.random();
            const t = r < legendProb ? 'rare' : r < legendProb + 0.15 ? 'uncommon' : 'common';
            let pList = remaining.filter(c => c.rarity === t);
            if (pList.length === 0) pList = remaining;
            const picked = pList[Math.floor(Math.random() * pList.length)];
            if (picked) {
              const def = typeof getCardDef === 'function' ? getCardDef(picked.id, shopUpgrades) : null;
              selected.push(def && def.id ? def : picked);
              const idx = remaining.findIndex(c => c.id === picked.id);
              if (idx > -1) remaining.splice(idx, 1);
            }
          }
          const valid = selected.filter(Boolean);
          if (valid.length === 0) {
            const p = { ...cs.player };
            p.hp = Math.min(p.maxHp, p.hp + Math.floor(p.maxHp * 0.3));
            startNextStage(p, cs.baseDeck);
            return;
          }
          const rarityRank = { mythic: 5, rare: 4, special: 4, loot: 4, uncommon: 3, common: 2 };
          const best = [...valid].sort((a, b) => (rarityRank[b.rarity] || 1) - (rarityRank[a.rarity] || 1))[0];
          const newDeck = [...baseDeck, { ...best }];
          let newUnlocked = unlockedCards || [];
          let newCustomCards = customCards || [];
          if (!newUnlocked.includes(best.id)) {
            newUnlocked = [...newUnlocked, best.id];
            setUnlockedCards(newUnlocked);
          }
          if ((best.id.startsWith('loot_') || best.rarity === 'loot') && !newCustomCards.some(c => c.id === best.id)) {
            newCustomCards = [...newCustomCards, best];
            setCustomCards(newCustomCards);
          }
          saveGame({ unlockedCards: newUnlocked, customCards: newCustomCards });
          startNextStage(cs.player, newDeck);
        }
      }, 600);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState, autoReward, autoRewardType, autoRelic, isProcessing]);

  if (!combatState) return null;

  // 🌟 0. 유물 발견 보상 화면 (최우선 표시)
  if (gameState === 'RELIC_REWARD') {
    // 데이터 아직 없으면 로딩 표시 (검은화면 방지)
    if (!pendingRelicReward) {
      return <div className="flex items-center justify-center min-h-[100dvh] bg-slate-900 text-white text-2xl font-bold animate-pulse">🌟 유물 로딩 중...</div>;
    }
    let rColor = 'text-slate-400';
    let rBorder = 'border-slate-400';
    if (pendingRelicReward.rarity === 'uncommon') { rColor = 'text-cyan-400'; rBorder = 'border-cyan-400'; }
    if (pendingRelicReward.rarity === 'rare') { rColor = 'text-yellow-400'; rBorder = 'border-yellow-400'; }
    if (pendingRelicReward.rarity === 'special') { rColor = 'text-fuchsia-400'; rBorder = 'border-fuchsia-400'; }
    if (pendingRelicReward.rarity === 'mythic') { rColor = 'text-red-500 font-black'; rBorder = 'border-red-500'; }

    return (
      <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-slate-900 text-white p-4 relative overflow-hidden">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-[100px] pointer-events-none animate-pulse`}></div>
        <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-amber-500 mb-12 animate-bounce drop-shadow-[0_0_20px_rgba(251,191,36,0.6)]">
          🌟 유물 발견! 🌟
        </h1>
        <div 
          onClick={handleRelicRewardClaim} 
          className="z-10 bg-slate-800/80 backdrop-blur-md p-8 md:p-10 rounded-3xl border-4 border-amber-500 shadow-[0_0_50px_rgba(245,158,11,0.3)] max-w-sm w-full text-center transform transition-all hover:scale-105 cursor-pointer"
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

  // 🌟 0.5 보스 유물 3지선다 화면
  if (gameState === 'BOSS_RELIC_CHOICE') {
    if (!pendingRelicChoices || pendingRelicChoices.length === 0) {
      return <div className="flex items-center justify-center min-h-[100dvh] bg-slate-900 text-white text-2xl font-bold animate-pulse">🏆 보스 보상 로딩 중...</div>;
    }
    return (
      <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-slate-900 text-white p-4 relative overflow-hidden">
        <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-amber-500 mb-8 animate-bounce drop-shadow-[0_0_20px_rgba(251,191,36,0.6)] text-center">
          보스 격파 보상!
        </h1>
        <p className="text-xl text-amber-200 mb-8 font-bold">원하는 유물을 하나 선택하세요</p>
        
        <div className="flex flex-col md:flex-row gap-6 justify-center items-stretch w-full max-w-5xl z-10">
          {pendingRelicChoices.map(relic => (
            <div 
              key={relic.id}
              onClick={() => handleRelicChoiceClaim(relic)}
              className="bg-slate-800/80 backdrop-blur-md p-6 rounded-2xl border-2 border-amber-500/50 hover:border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.2)] hover:shadow-[0_0_50px_rgba(245,158,11,0.5)] w-full md:w-1/3 text-center transform transition-all hover:-translate-y-2 cursor-pointer flex flex-col items-center group"
            >
              <img src={shieldImg} alt="Relic" className="w-16 h-16 mb-4 drop-shadow-[0_0_15px_rgba(251,191,36,0.4)] group-hover:animate-pulse" />
              <h2 className="text-xl md:text-2xl font-bold text-amber-400 mb-4">{relic.name}</h2>
              <p className="text-slate-300 text-sm bg-black/40 p-4 rounded-xl border border-white/5 flex-grow w-full break-keep flex items-center justify-center">
                {relic.desc}
              </p>
            </div>
          ))}
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
              // 특수(special) 타입과 loot 유형은 보상에서 제외 (전설 확정 시도 특수카드 표시 방지)
              if (c.type === 'special' || c.rarity === 'special' || c.rarity === 'loot') return false;
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
          }} className="p-6 md:p-8 bg-slate-800 hover:bg-slate-700 border-2 border-indigo-500 rounded-2xl flex flex-col items-center w-full md:w-64 transition-all shadow-xl hover:-translate-y-1 group cursor-pointer">
            <img src={scrollImg} alt="Add Card" className="w-12 h-12 md:w-16 md:h-16 mb-4 drop-shadow-[0_0_10px_rgba(129,140,248,0.5)] group-hover:scale-110 transition-transform" />
            <span className="text-xl md:text-2xl font-bold">카드 추가</span>
          </button>

          <button onClick={() => {
            const p = { ...combatState.player };
            p.hp = Math.min(p.maxHp, p.hp + Math.floor(p.maxHp * 0.3));
            p.debuffs = { weak: 0, vulnerable: 0, poison: 0 }; 
            startNextStage(p, combatState.baseDeck);
          }} className="p-6 md:p-8 bg-slate-800 hover:bg-slate-700 border-2 border-green-500 rounded-2xl flex flex-col items-center w-full md:w-64 transition-all shadow-xl hover:-translate-y-1 group cursor-pointer">
            <img src={potionImg} alt="Heal" className="w-12 h-12 md:w-16 md:h-16 mb-4 drop-shadow-[0_0_10px_rgba(74,222,128,0.5)] group-hover:scale-110 transition-transform" />
            <span className="text-xl md:text-2xl font-bold">회복 & 정화</span>
          </button>

          <button onClick={() => setGameState('REWARD_REMOVE')} className="p-6 md:p-8 bg-slate-800 hover:bg-slate-700 border-2 border-red-500 rounded-2xl flex flex-col items-center w-full md:w-64 transition-all shadow-xl hover:-translate-y-1 group cursor-pointer">
            <Trash2 className="w-12 h-12 md:w-16 md:h-16 mb-4 text-red-400 group-hover:scale-110 transition-transform"/>
            <span className="text-xl md:text-2xl font-bold">카드 삭제</span>
          </button>

          {enemyDropCard && (
            <button onClick={handleEnemyDropClaim} className="p-6 md:p-8 bg-slate-800 hover:bg-slate-700 border-2 border-emerald-500 rounded-2xl flex flex-col items-center w-full md:w-64 transition-all shadow-xl hover:-translate-y-1 group cursor-pointer">
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
            const isExpanded = expandedCards[idx];
            return (
              <div key={idx} className="relative group">
                <div className="w-32 h-44 md:w-44 md:h-60 relative">
                  <Card card={card} onClick={() => setConfirmSelection({ action: 'add', card, isNew })} />
                  {isNew && <span className="absolute -top-3 -right-3 bg-yellow-500 text-black px-2 py-1 rounded-full font-black text-[10px] md:text-xs animate-bounce z-30 shadow-lg">NEW!</span>}
                  {/* ✨ 카드 상세 정보 토글 */}
                  <button 
                    onClick={() => setExpandedCards({...expandedCards, [idx]: !isExpanded})}
                    className="absolute bottom-2 right-2 bg-slate-700 hover:bg-slate-600 p-1 rounded z-20"
                  >
                    <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>
                </div>
                {/* ✨ 카드 상세 정보 (접기/펴기) */}
                {isExpanded && (
                  <div className="absolute top-full mt-2 bg-slate-800 border-2 border-indigo-500 p-3 rounded-lg w-64 z-50 shadow-xl">
                    <p className="text-xs text-slate-300 break-keep mb-2">{card.desc}</p>
                    <div className="flex flex-wrap gap-1">
                      {card.damage && <span className="text-red-400 text-xs bg-red-900/30 px-2 py-1 rounded">공격: {card.damage}</span>}
                      {card.block && <span className="text-blue-400 text-xs bg-blue-900/30 px-2 py-1 rounded">방어: {card.block}</span>}
                      {card.heal && <span className="text-green-400 text-xs bg-green-900/30 px-2 py-1 rounded">회복: {card.heal}</span>}
                      {card.draw && <span className="text-purple-400 text-xs bg-purple-900/30 px-2 py-1 rounded">드로우: {card.draw}</span>}
                    </div>
                  </div>
                )}
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
                  if (isProcessing) return;
                  setIsProcessing(true);
                  const newDeck = [...combatState.baseDeck, { ...confirmSelection.card }];
                  let newUnlocked = unlockedCards;
                  let newCustomCards = customCards;

                  if (confirmSelection.isNew || !unlockedCards.includes(confirmSelection.card.id)) {
                    newUnlocked = [...unlockedCards, confirmSelection.card.id];
                    setUnlockedCards(newUnlocked);
                  }
                  
                  if ((confirmSelection.card.id.startsWith('loot_') || confirmSelection.card.rarity === 'loot') && !customCards.some(c => c.id === confirmSelection.card.id)) {
                    newCustomCards = [...customCards, confirmSelection.card];
                    setCustomCards(newCustomCards);
                  }

                  saveGame({ unlockedCards: newUnlocked, customCards: newCustomCards });
                  setConfirmSelection(null);
                  if (setEnemyDropCard) setEnemyDropCard(null);
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
              <div className="absolute inset-0 bg-red-900/0 group-hover:bg-red-900/70 rounded-xl transition-all flex items-center justify-center border-2 border-transparent group-hover:border-red-500">
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
                  if (isProcessing) return;
                  setIsProcessing(true);
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
  if (gameState === 'BOSS_CLEAR_REWARD') {
    if (!specialBossRewardCard) {
      return <div className="flex items-center justify-center min-h-[100dvh] bg-slate-900 text-white text-2xl font-bold animate-pulse">✨ 특수 보상 로딩 중...</div>;
    }
    return (
      <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-slate-900 text-white p-4 relative z-50 overflow-hidden">
        <div className="absolute inset-0 bg-fuchsia-600/10 animate-pulse pointer-events-none" />
        <h2 className="text-4xl md:text-5xl font-black mb-4 text-fuchsia-400 tracking-wider text-center drop-shadow-lg animate-bounce">특수 보스 처치 보상!</h2>
        <p className="text-lg md:text-xl mb-10 text-slate-300 text-center">압도적인 적을 물리친 증표로<br/>새로운 특수 카드를 획득했습니다.</p>
        <div className="relative group mb-10 animate-draw flex justify-center items-center">
          <div className="relative w-40 sm:w-48 md:w-56 scale-110 md:scale-125 origin-center transition-transform hover:scale-125 md:hover:scale-150">
            <Card card={specialBossRewardCard} />
            <div className="absolute inset-0 border-[3px] border-fuchsia-500/50 rounded-xl animate-pulse pointer-events-none" />
          </div>
        </div>
        <button onClick={handleSpecialClaim} className="px-10 py-4 bg-fuchsia-700 hover:bg-fuchsia-600 rounded-full font-bold text-xl md:text-2xl shadow-fuchsia-500/40 shadow-2xl mt-24 transition-all hover:scale-110">
          획득하기
        </button>
      </div>
    );
  }

  // ✨ [수정] 하드 300층 유물 3개 선택 (return을 if 블록 내에 이동)
  if (gameState === 'HARD_CLEAR_RELIC_CHOICE') {
    const availableRelics = RELIC_LIBRARY.filter(r => !(playerRelics || []).some(pr => pr?.id === r.id));
    
    return (
      <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950 text-white p-4">
        <div className="max-w-4xl w-full">
          <h1 className="text-5xl font-black text-center mb-2 text-purple-300 drop-shadow-lg">🎉 하드 모드 완전 클리어!</h1>
          <p className="text-center text-slate-300 mb-8">축하합니다! 유물 3개를 선택해서 획득하세요!</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {availableRelics.slice(0, 15).map((relic) => (
              <div 
                key={relic.id}
                onClick={() => {
                  if (!selectedRelics.includes(relic.id) && selectedRelics.length < 3) {
                    setSelectedRelics([...selectedRelics, relic.id]);
                  } else if (selectedRelics.includes(relic.id)) {
                    setSelectedRelics(selectedRelics.filter(id => id !== relic.id));
                  }
                }}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedRelics.includes(relic.id) 
                    ? 'bg-purple-600/40 border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.5)]' 
                    : 'bg-slate-800 border-slate-600 hover:border-purple-400'
                }`}
              >
                <div className="font-bold text-purple-300 text-lg">{relic.name}</div>
                <div className="text-sm text-slate-300 mt-2">{relic.desc}</div>
                {selectedRelics.includes(relic.id) && <div className="text-center text-purple-300 font-bold mt-2">✓ 선택됨</div>}
              </div>
            ))}
          </div>
          
          <button
            onClick={() => {
              const selectedRelicObjects = RELIC_LIBRARY.filter(r => selectedRelics.includes(r.id));
              const updatedRelics = [...(playerRelics || []), ...selectedRelicObjects];
              let newUnlocked = [...(unlockedRelics || [])];
              selectedRelicObjects.forEach(r => {
                if (!newUnlocked.includes(r.id)) newUnlocked.push(r.id);
              });
              setUnlockedRelics(newUnlocked);
              saveGame({ unlockedRelics: newUnlocked });
              setSelectedRelics([]);
              setGameState('GAME_CLEAR');
            }}
            disabled={selectedRelics.length !== 3}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
              selectedRelics.length === 3 
                ? 'bg-purple-600 hover:bg-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.5)]' 
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
            }`}
          >
            3개 선택 완료 ({selectedRelics.length}/3)
          </button>
        </div>
      </div>
    );
  }

  return null;
}