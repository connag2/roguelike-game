// src/components/screens/DeckBuilder.jsx
import React, { useMemo, useState } from 'react';
import { Eraser, Download, Upload, Save, Maximize2, HelpCircle, Layers, X, ChevronDown, Sparkles, TrendingUp } from 'lucide-react';
import Card from '../common/Card';
import FilterBar from '../common/FilterBar';
import { RELIC_LIBRARY } from '../../constants/relicData';

import scrollImg from '../../assets/images/items/scroll.svg';
import shieldImg from '../../assets/images/items/shield.svg';

export default function DeckBuilder({
  toggleFullScreen,
  getTotalCards,
  tempDeckCounts,
  setTempDeckCounts,
  handleClearDeck,
  handleDeckExport,
  setDeckImportModalOpen,
  setDeckCounts,
  saveGame,
  setGameState,
  filterType, setFilterType,
  filterEffect, setEffect,
  filterRarity, setRarity,
  searchQuery, setSearchQuery,
  filteredCards,
  getCardDef,
  shopUpgrades,
  handleAddCard,
  handleRemoveCard,
  setTutorialModalOpen,
  normalCleared, unlockedRelics, startingRelic, setStartingRelic,
  allUnlockedCards = []
}) {
  const currentCardCount = getTotalCards(tempDeckCounts);
  const isDeckFull = currentCardCount === 20;

  const [isRelicModalOpen, setIsRelicModalOpen] = useState(false);
  const [showAutoFillMenu, setShowAutoFillMenu] = useState(false);
  const [previewCard, setPreviewCard] = useState(null);
  const [activeTab, setActiveTab] = useState('list');

  const deckCardsList = useMemo(() => {
    return Object.entries(tempDeckCounts)
      .filter(([id, count]) => count > 0)
      .map(([id, count]) => ({
        id,
        count,
        cardDef: getCardDef(id, shopUpgrades)
      }))
      .filter(item => item.cardDef)
      .sort((a, b) => {
        if (a.cardDef.type !== b.cardDef.type) return a.cardDef.type.localeCompare(b.cardDef.type);
        if (a.cardDef.cost !== b.cardDef.cost) return a.cardDef.cost - b.cardDef.cost;
        return a.cardDef.name.localeCompare(b.cardDef.name);
      });
  }, [tempDeckCounts, getCardDef, shopUpgrades]);

  const deckStats = useMemo(() => {
    const allCards = deckCardsList.flatMap(({ cardDef, count }) => Array(count).fill(cardDef));
    if (allCards.length === 0) return null;

    const totalCost = allCards.reduce((s, c) => s + (c.cost || 0), 0);
    const avgCost = (totalCost / allCards.length).toFixed(1);

    const typeCount = {};
    allCards.forEach(c => { typeCount[c.type] = (typeCount[c.type] || 0) + 1; });

    const rarityCount = {};
    allCards.forEach(c => { rarityCount[c.rarity] = (rarityCount[c.rarity] || 0) + 1; });

    const manaCurve = [0, 0, 0, 0, 0, 0];
    allCards.forEach(c => { manaCurve[Math.min(c.cost || 0, 5)]++; });

    const synergies = [];
    if (allCards.filter(c => c.enemyPoison).length >= 3) synergies.push({ label: '🧪 맹독 시너지', color: 'text-green-400', desc: `중독 ${allCards.filter(c => c.enemyPoison).length}장` });
    if (allCards.filter(c => c.enemyBleed).length >= 3) synergies.push({ label: '🩸 출혈 시너지', color: 'text-red-400', desc: `출혈 ${allCards.filter(c => c.enemyBleed).length}장` });
    if (allCards.filter(c => c.enemyBurn).length >= 3) synergies.push({ label: '🔥 화상 시너지', color: 'text-orange-400', desc: `화상 ${allCards.filter(c => c.enemyBurn).length}장` });
    if (allCards.filter(c => c.block || c.selfThorns || c.selfRegen).length >= 5) synergies.push({ label: '🛡️ 철벽 시너지', color: 'text-blue-400', desc: `방어 ${allCards.filter(c => c.block || c.selfThorns || c.selfRegen).length}장` });
    if (allCards.filter(c => c.draw).length >= 3) synergies.push({ label: '🃏 드로우 엔진', color: 'text-cyan-400', desc: `드로우 ${allCards.filter(c => c.draw).length}장` });
    if (allCards.filter(c => c.type === 'special').length >= 2) synergies.push({ label: '✨ 정화 특화', color: 'text-emerald-400', desc: `특수 ${allCards.filter(c => c.type === 'special').length}장` });

    return { avgCost, typeCount, rarityCount, manaCurve, synergies, total: allCards.length };
  }, [deckCardsList]);

  const manaCurveMax = deckStats ? Math.max(...deckStats.manaCurve, 1) : 1;

  const handleAutoBuild = (theme = 'random') => {
    const currentCount = getTotalCards(tempDeckCounts);
    let remaining = 20 - currentCount;
    if (remaining <= 0) return;
    const availableCards = allUnlockedCards.length > 0 ? allUnlockedCards : filteredCards;
    const scoredCards = availableCards.map(baseCard => {
      const cardDef = getCardDef(baseCard.id, shopUpgrades);
      if (!cardDef) return null;
      let score = Math.random() * 20;
      if (theme === 'poison' && cardDef.enemyPoison) score += 150;
      if (theme === 'bleed' && cardDef.enemyBleed) score += 150;
      if (theme === 'burn' && cardDef.enemyBurn) score += 150;
      if (theme === 'block' && (cardDef.block || cardDef.selfThorns || cardDef.selfRegen)) score += 150;
      if (theme === 'special' && cardDef.type === 'special') score += 150;
      if (cardDef.isUpgraded) score += 30;
      const rarityScores = { mythic: 60, special: 40, rare: 30, uncommon: 15, common: 5 };
      score += rarityScores[cardDef.rarity] || 0;
      if (cardDef.draw) score += 20;
      if (cardDef.manaGain) score += 20;
      return { id: baseCard.id, cardDef, score };
    }).filter(Boolean).sort((a, b) => b.score - a.score);
    const newCounts = { ...tempDeckCounts };
    for (const sc of scoredCards) {
      if (remaining <= 0) break;
      const cur = newCounts[sc.id] || 0;
      const maxCopies = sc.cardDef.rarity === 'mythic' ? 1 : 3;
      const canAdd = maxCopies - cur;
      if (canAdd > 0) { const toAdd = Math.min(canAdd, remaining); newCounts[sc.id] = cur + toAdd; remaining -= toAdd; }
    }
    setTempDeckCounts(newCounts);
  };

  const typeColor = (type) => {
    if (type === 'attack') return 'bg-red-900/80 text-red-300 border-red-800';
    if (type === 'special') return 'bg-emerald-900/80 text-emerald-300 border-emerald-800';
    return 'bg-blue-900/80 text-blue-300 border-blue-800';
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white pt-16 md:pt-4 p-4 md:p-6 lg:p-8 relative overflow-hidden">
      <button onClick={toggleFullScreen} className="fixed top-4 left-4 z-50 flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700 px-3 py-2 rounded text-sm font-bold transition-colors border border-slate-600 md:border-0">
        <Maximize2 className="w-4 h-4"/><span className="hidden md:inline">전체화면</span>
      </button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 pl-0 md:pl-32 gap-4 relative z-50 shrink-0">
        <h2 className="text-2xl md:text-3xl font-black flex items-center gap-3 shrink-0 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]">
          <img src={scrollImg} alt="Deck" className="w-8 h-8 md:w-10 md:h-10 drop-shadow-lg" />
          시작 덱 구성
        </h2>
        <div className="flex flex-wrap items-center gap-2 md:gap-3 shrink-0 w-full md:w-auto justify-end">
          <div className={`flex items-center justify-center px-4 py-1.5 md:py-2 rounded-full border-2 shadow-inner font-black text-sm md:text-lg mr-2 transition-all duration-300 ${isDeckFull ? 'bg-emerald-900/40 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.5)]' : currentCardCount >= 15 ? 'bg-yellow-900/40 border-yellow-500 text-yellow-400' : 'bg-slate-800/60 border-slate-600 text-slate-300'}`}>
            {isDeckFull ? '✅' : '📋'} {currentCardCount} <span className="text-slate-500 mx-1">/</span> 20장
          </div>
          <button onClick={() => setTutorialModalOpen(true)} className="p-2 md:p-2.5 bg-slate-800/80 hover:bg-slate-700 rounded-lg border border-slate-600 transition-colors backdrop-blur-sm shadow-sm">
            <HelpCircle className="w-5 h-5 text-indigo-400" />
          </button>
          <div className="relative z-50">
            <button onClick={() => setShowAutoFillMenu(!showAutoFillMenu)} className="flex items-center gap-1 md:gap-2 py-2 px-3 md:px-4 bg-fuchsia-900/80 hover:bg-fuchsia-800 rounded-lg font-bold transition-all text-xs md:text-sm border border-fuchsia-700 text-fuchsia-100 shadow-[0_0_10px_rgba(217,70,239,0.3)] backdrop-blur-sm">
              <Sparkles className="w-4 h-4"/> 자동 편성 <ChevronDown className="w-4 h-4" />
            </button>
            {showAutoFillMenu && (
              <div className="absolute top-full right-0 mt-2 w-52 bg-slate-800 border border-slate-600 rounded-lg shadow-2xl z-[999] overflow-hidden">
                {[['random','🎲 무작위 채우기','slate'],['poison','🧪 추천: 맹독 덱','green'],['bleed','🩸 추천: 출혈 덱','red'],['burn','🔥 추천: 화상 덱','orange'],['block','🛡️ 추천: 철벽 덱','blue'],['special','✨ 추천: 정화 특화','emerald']].map(([theme, label, color]) => (
                  <button key={theme} onClick={() => { handleAutoBuild(theme); setShowAutoFillMenu(false); }} className={`w-full text-left px-4 py-3 text-sm font-bold hover:bg-${color}-900/40 border-b border-slate-700 last:border-0 text-${color === 'slate' ? 'slate-200' : color + '-400'}`}>{label}</button>
                ))}
              </div>
            )}
          </div>
          <button onClick={handleClearDeck} className="flex items-center gap-1 md:gap-2 py-2 px-3 md:px-4 bg-red-900/80 hover:bg-red-800 rounded-lg font-bold transition-all text-xs md:text-sm border border-red-700 text-red-100 backdrop-blur-sm">
            <Eraser className="w-4 h-4"/> 비우기
          </button>
          <button onClick={handleDeckExport} className="flex items-center gap-1 md:gap-2 py-2 px-3 md:px-4 bg-slate-800/80 hover:bg-slate-700 rounded-lg font-bold transition-all text-xs md:text-sm border border-slate-600 backdrop-blur-sm">
            <Download className="w-4 h-4 text-cyan-400"/> 복사
          </button>
          <button onClick={() => setDeckImportModalOpen(true)} className="flex items-center gap-1 md:gap-2 py-2 px-3 md:px-4 bg-slate-800/80 hover:bg-slate-700 rounded-lg font-bold transition-all text-xs md:text-sm border border-slate-600 backdrop-blur-sm">
            <Upload className="w-4 h-4 text-cyan-400"/> 붙여넣기
          </button>
          <button onClick={() => { setDeckCounts(tempDeckCounts); saveGame({ deckCounts: tempDeckCounts }); }} className="flex items-center gap-1 md:gap-2 py-2 px-3 md:px-5 bg-emerald-700 hover:bg-emerald-600 rounded-lg font-bold transition-all text-sm md:text-base border border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)] text-white">
            <Save className="w-4 h-4 md:w-5 md:h-5"/> 저장
          </button>
          <button onClick={() => setGameState('MENU')} className="py-2 px-3 md:px-5 bg-indigo-700 hover:bg-indigo-600 rounded-lg font-bold text-sm md:text-base border border-indigo-500 transition-colors">
            메인으로
          </button>
        </div>
      </div>

      <div className="relative z-10 mb-2 shrink-0 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 w-full max-w-[1600px] mx-auto">
        <FilterBar type={filterType} setType={setFilterType} effect={filterEffect} setEffect={setEffect} rarity={filterRarity} setRarity={setRarity} search={searchQuery} setSearch={setSearchQuery} />
        {normalCleared && unlockedRelics && unlockedRelics.length > 0 && (
          <button onClick={() => setIsRelicModalOpen(true)} className="flex items-center gap-3 bg-slate-900/90 hover:bg-slate-800 px-4 py-2.5 rounded-xl border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.15)] transition-all backdrop-blur-md group">
            <img src={shieldImg} alt="Relic" className="w-5 h-5 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)] group-hover:scale-110 transition-transform" />
            <div className="flex flex-col items-start">
              <span className="text-[10px] text-amber-400/80 font-bold -mb-1">시작 유물 변경</span>
              <span className="text-amber-400 font-black text-sm">{startingRelic ? RELIC_LIBRARY.find(r => r.id === startingRelic)?.name : '선택 안함'}</span>
            </div>
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col lg:flex-row w-full max-w-[1600px] mx-auto overflow-hidden relative z-10 mt-2 gap-4">
        {/* 카드 목록 */}
        <div className="relative flex-1 flex flex-col min-h-0 bg-slate-900/30 rounded-2xl border border-slate-700/50">
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 pointer-events-none opacity-60">
            <span className="text-[10px] text-indigo-300 font-bold bg-slate-900/80 px-2 py-0.5 rounded-full border border-indigo-500/30">스크롤하여 더 보기</span>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar pb-[40vh] lg:pb-10 px-2 lg:px-4 pt-10 relative z-10">
            <div className="flex flex-wrap gap-4 md:gap-6 content-start justify-center">
              {filteredCards.map(baseCard => {
                const count = tempDeckCounts[baseCard.id] || 0;
                const card = getCardDef(baseCard.id, shopUpgrades);
                if (!card) return null;
                return (
                  <div key={baseCard.id} className="w-32 h-48 sm:w-36 sm:h-56 md:w-44 md:h-[260px] lg:w-48 lg:h-[280px] shrink-0 transition-transform hover:scale-105 origin-center">
                    <Card card={card} count={count} isLocked={false} onAdd={handleAddCard} onRemove={handleRemoveCard} canAdd={!isDeckFull} />
                  </div>
                );
              })}
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent pointer-events-none z-20 rounded-b-2xl"></div>
        </div>

        {/* 우측 패널 */}
        <div className="fixed bottom-0 left-0 right-0 lg:static lg:w-[340px] xl:w-[380px] h-[45vh] lg:h-full shrink-0 flex flex-col bg-slate-900/95 lg:bg-slate-900/60 backdrop-blur-xl rounded-t-3xl lg:rounded-2xl border-t lg:border border-slate-600 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-50 overflow-hidden">
          {/* 탭 */}
          <div className="bg-slate-800/80 p-3 flex justify-between items-center border-b border-slate-600 rounded-t-3xl lg:rounded-t-2xl shrink-0">
            <div className="flex gap-1">
              <button onClick={() => setActiveTab('list')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                <Layers className="w-3.5 h-3.5"/> 목록
              </button>
              <button onClick={() => setActiveTab('stats')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'stats' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                <TrendingUp className="w-3.5 h-3.5"/> 통계
              </button>
            </div>
            <span className={`text-xs font-black px-2 py-1 rounded-full border ${isDeckFull ? 'text-emerald-300 bg-emerald-900/50 border-emerald-700' : 'text-indigo-300 bg-indigo-900/50 border-indigo-700'}`}>{currentCardCount}/20</span>
          </div>

          {/* 덱 목록 탭 */}
          {activeTab === 'list' && (
            <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
              {deckCardsList.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-3 opacity-60">
                  <Layers className="w-10 h-10" />
                  <span className="text-sm font-medium">덱에 카드가 없습니다.</span>
                  <span className="text-xs text-center">왼쪽 카드를 클릭해 추가하세요</span>
                </div>
              ) : (
                ['attack','skill','special'].map(type => {
                  const group = deckCardsList.filter(({ cardDef }) => cardDef.type === type);
                  if (group.length === 0) return null;
                  const labels = { attack: '⚔️ 공격', skill: '🔮 스킬', special: '✨ 특수' };
                  return (
                    <div key={type} className="mb-2">
                      <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1 py-1.5 border-b border-slate-700/50 mb-1">{labels[type]} ({group.reduce((s, g) => s + g.count, 0)}장)</div>
                      {group.map(({ id, count, cardDef }) => (
                        <div key={id} className={`flex justify-between items-center bg-slate-800/60 p-2 rounded-lg border border-slate-700/80 hover:border-indigo-500/50 transition-all group cursor-pointer mb-1 ${previewCard?.id === id ? 'border-indigo-400 bg-indigo-900/20' : ''}`} onClick={() => setPreviewCard(previewCard?.id === id ? null : cardDef)}>
                          <div className="flex items-center gap-2 overflow-hidden flex-1">
                            <span className={`text-[11px] px-1.5 py-0.5 rounded font-black shrink-0 border ${typeColor(cardDef.type)}`}>{cardDef.cost}</span>
                            <span className={`text-xs font-bold truncate ${cardDef.rarity === 'mythic' ? 'text-red-400' : cardDef.rarity === 'rare' ? 'text-yellow-300' : cardDef.rarity === 'uncommon' ? 'text-cyan-300' : cardDef.type === 'special' ? 'text-emerald-300' : 'text-slate-200'}`} title={cardDef.name}>
                              {cardDef.name.split(' +')[0]}
                              {cardDef.isUpgraded && <span className="text-[10px] ml-1 text-yellow-500 font-bold">+{cardDef.upgradeLevel}</span>}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 pl-1">
                            <span className="text-xs font-black text-indigo-300 min-w-[1.5rem] text-right">x{count}</span>
                            <div className="flex gap-0.5">
                              <button onClick={(e) => { e.stopPropagation(); handleRemoveCard(id); }} className="w-6 h-6 flex items-center justify-center bg-slate-700 hover:bg-red-600 text-slate-300 hover:text-white rounded transition-colors font-black border border-slate-600 text-xs">-</button>
                              <button onClick={(e) => { e.stopPropagation(); handleAddCard(id); }} disabled={isDeckFull} className="w-6 h-6 flex items-center justify-center bg-slate-700 hover:bg-blue-600 text-slate-300 hover:text-white rounded transition-colors font-black border border-slate-600 disabled:opacity-30 text-xs">+</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* 통계 탭 */}
          {activeTab === 'stats' && (
            <div className="flex-1 overflow-y-auto p-3 custom-scrollbar space-y-3">
              {!deckStats ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-3 opacity-60">
                  <TrendingUp className="w-10 h-10" />
                  <span className="text-sm">덱을 구성하면 통계가 표시됩니다</span>
                </div>
              ) : (
                <>
                  <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50 flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-bold">⚡ 평균 마나 코스트</span>
                    <span className="text-2xl font-black text-indigo-300">{deckStats.avgCost}</span>
                  </div>

                  <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
                    <div className="text-xs text-slate-400 font-bold mb-3">📊 마나 곡선</div>
                    <div className="flex items-end gap-1 h-14">
                      {deckStats.manaCurve.map((count, cost) => {
                        const colors = ['#6366f1','#22c55e','#eab308','#f97316','#ef4444','#a855f7'];
                        return (
                          <div key={cost} className="flex-1 flex flex-col items-center gap-0.5">
                            <span className="text-[9px] text-slate-400 font-bold">{count > 0 ? count : ''}</span>
                            <div className="w-full rounded-t-sm" style={{ height: `${count > 0 ? Math.max((count / manaCurveMax) * 40, 4) : 2}px`, backgroundColor: colors[cost] }} />
                            <span className="text-[9px] text-slate-500 font-bold">{cost === 5 ? '5+' : cost}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
                    <div className="text-xs text-slate-400 font-bold mb-2">🎯 타입 분포</div>
                    {[{k:'attack',l:'⚔️ 공격',c:'bg-red-500'},{k:'skill',l:'🔮 스킬',c:'bg-blue-500'},{k:'special',l:'✨ 특수',c:'bg-emerald-500'}].map(({k,l,c}) => {
                      const cnt = deckStats.typeCount[k] || 0;
                      const pct = Math.round((cnt / deckStats.total) * 100);
                      return cnt > 0 ? (
                        <div key={k} className="mb-2">
                          <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                            <span className="font-bold">{l}</span><span>{cnt}장 ({pct}%)</span>
                          </div>
                          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div className={`h-full ${c} rounded-full`} style={{width:`${pct}%`}} />
                          </div>
                        </div>
                      ) : null;
                    })}
                  </div>

                  <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
                    <div className="text-xs text-slate-400 font-bold mb-2">🌟 등급 분포</div>
                    <div className="flex flex-wrap gap-1.5">
                      {[{k:'common',l:'일반',c:'bg-slate-600 text-slate-200'},{k:'uncommon',l:'희귀',c:'bg-cyan-900/80 text-cyan-300'},{k:'rare',l:'전설',c:'bg-yellow-900/80 text-yellow-300'},{k:'special',l:'특수',c:'bg-fuchsia-900/80 text-fuchsia-300'},{k:'mythic',l:'신화',c:'bg-red-900/80 text-red-300'}].map(({k,l,c}) => {
                        const cnt = deckStats.rarityCount[k] || 0;
                        return cnt > 0 ? <span key={k} className={`text-[11px] font-black px-2 py-0.5 rounded-full ${c}`}>{l} {cnt}</span> : null;
                      })}
                    </div>
                  </div>

                  {deckStats.synergies.length > 0 && (
                    <div className="bg-slate-800/60 rounded-xl p-3 border border-emerald-700/30">
                      <div className="text-xs text-slate-400 font-bold mb-2">💡 감지된 시너지</div>
                      {deckStats.synergies.map((syn, i) => (
                        <div key={i} className="flex justify-between items-center mb-1">
                          <span className={`text-xs font-bold ${syn.color}`}>{syn.label}</span>
                          <span className="text-[10px] text-slate-500">{syn.desc}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {currentCardCount < 20 && (
                    <div className="bg-yellow-900/30 rounded-xl p-3 border border-yellow-700/50">
                      <div className="text-xs text-yellow-400 font-bold">⚠️ {20 - currentCardCount}장 더 필요합니다</div>
                      <div className="text-[10px] text-yellow-600 mt-1">20장을 채워야 게임을 시작할 수 있습니다</div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 카드 미리보기 */}
      {previewCard && (
        <div className="fixed bottom-[46vh] lg:bottom-4 left-4 z-[200] pointer-events-none">
          <div className="w-40 h-56 drop-shadow-[0_0_20px_rgba(99,102,241,0.8)]">
            <Card card={previewCard} />
          </div>
          <div className="mt-2 bg-slate-900/95 border border-slate-600 rounded-xl p-2.5 max-w-[180px] backdrop-blur-sm">
            <p className="text-[10px] text-slate-300 leading-relaxed">{previewCard.desc}</p>
          </div>
        </div>
      )}

      {isRelicModalOpen && normalCleared && unlockedRelics && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border-2 border-amber-500/50 rounded-2xl w-full max-w-3xl flex flex-col max-h-[85vh] shadow-[0_0_40px_rgba(245,158,11,0.3)]">
            <div className="flex justify-between items-center p-4 border-b border-slate-700 shrink-0 bg-slate-800/50 rounded-t-2xl">
              <h3 className="text-xl font-black text-amber-400 flex items-center gap-3">
                <img src={shieldImg} alt="Relic" className="w-7 h-7" /> 시작 유물 선택
              </h3>
              <button onClick={() => setIsRelicModalOpen(false)} className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-2 rounded-lg transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto custom-scrollbar flex flex-col gap-3">
              <button onClick={() => { setStartingRelic(null); setIsRelicModalOpen(false); }} className={`w-full p-4 rounded-xl border text-left transition-all ${startingRelic === null ? 'bg-amber-600/20 border-amber-400 text-amber-200' : 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700'}`}>
                <div className="font-bold text-lg">선택 안함</div>
                <div className="text-sm text-slate-500 mt-1">유물 없이 게임을 시작합니다.</div>
              </button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {unlockedRelics.map(rid => {
                  const relDef = RELIC_LIBRARY.find(r => r.id === rid);
                  if (!relDef) return null;
                  const isSelected = startingRelic === rid;
                  return (
                    <button key={rid} onClick={() => { setStartingRelic(rid); setIsRelicModalOpen(false); }} className={`flex flex-col p-4 rounded-xl border text-left transition-all ${isSelected ? 'bg-amber-600/20 border-amber-400 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.3)] scale-[1.02]' : 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-amber-500/50'}`}>
                      <div className="font-bold text-amber-400 text-base mb-1">{relDef.name}</div>
                      <div className="text-xs text-slate-300 leading-relaxed">{relDef.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
