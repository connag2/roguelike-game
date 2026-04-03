import React, { useMemo } from 'react';
import { Eraser, Download, Upload, Save, Maximize, HelpCircle, Layers } from 'lucide-react';
import Card from '../common/Card';
import FilterBar from '../common/FilterBar';
import { RELIC_LIBRARY } from '../../constants/relicData';

// ✨ 프로젝트 내의 SVG 이미지 임포트
import scrollImg from '../../assets/images/items/scroll.svg';
import shieldImg from '../../assets/images/items/shield.svg';

export default function DeckBuilder({
  toggleFullScreen,
  getTotalCards,
  tempDeckCounts,
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
  normalCleared, unlockedRelics, startingRelic, setStartingRelic
}) {
  const currentCardCount = getTotalCards(tempDeckCounts);
  const isDeckFull = currentCardCount === 20;

  // ✨ 편의성 개선: 현재 덱에 포함된 카드들을 정렬하여 리스트로 뽑아냅니다.
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
        // 1. 코스트 순
        if (a.cardDef.cost !== b.cardDef.cost) return a.cardDef.cost - b.cardDef.cost;
        // 2. 타입 순
        if (a.cardDef.type !== b.cardDef.type) return a.cardDef.type.localeCompare(b.cardDef.type);
        // 3. 이름 순
        return a.cardDef.name.localeCompare(b.cardDef.name);
      });
  }, [tempDeckCounts, getCardDef, shopUpgrades]);

  return (
    // 전체 레이아웃을 overflow-hidden으로 잡고 내부에서 스크롤되도록 구조 변경
    <div className="flex flex-col h-[100dvh] bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white pt-16 md:pt-4 p-4 md:p-6 lg:p-8 relative overflow-hidden">
      <button onClick={toggleFullScreen} className="fixed top-4 left-4 z-50 flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700 px-3 py-2 rounded text-sm font-bold transition-colors border border-slate-600 backdrop-blur-sm shadow-md">
        <Maximize className="w-4 h-4"/> <span className="hidden md:inline">전체화면</span>
      </button>

      {/* 헤더 영역 (버튼 및 정보 유지) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 pl-0 md:pl-32 gap-4 relative z-10 shrink-0">
        <h2 className="text-2xl md:text-3xl font-black flex items-center gap-3 shrink-0 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]">
          <img src={scrollImg} alt="Deck" className="w-8 h-8 md:w-10 md:h-10 drop-shadow-lg" />
          시작 덱 구성
        </h2>
        
        <div className="flex flex-wrap items-center gap-2 md:gap-3 shrink-0 w-full md:w-auto justify-end">
          <div className={`flex items-center justify-center px-4 py-1.5 md:py-2 rounded-full border-2 shadow-inner font-black text-sm md:text-lg mr-2 transition-all duration-300 ${isDeckFull ? 'bg-emerald-900/40 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.5)]' : 'bg-yellow-900/40 border-yellow-500 text-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.3)]'}`}>
            총 {currentCardCount} <span className="text-slate-500 mx-1">/</span> 20장
          </div>
          
          <button onClick={() => setTutorialModalOpen(true)} className="p-2 md:p-2.5 bg-slate-800/80 hover:bg-slate-700 rounded-lg border border-slate-600 transition-colors backdrop-blur-sm shadow-sm">
            <HelpCircle className="w-5 h-5 text-indigo-400" />
          </button>

          <button onClick={handleClearDeck} className="flex items-center gap-1 md:gap-2 py-2 px-3 md:px-4 bg-red-900/80 hover:bg-red-800 rounded-lg font-bold transition-all text-xs md:text-sm border border-red-700 text-red-100 shadow-[0_0_10px_rgba(220,38,38,0.2)] backdrop-blur-sm">
            <Eraser className="w-4 h-4"/> 비우기
          </button>

          <button onClick={handleDeckExport} className="flex items-center gap-1 md:gap-2 py-2 px-3 md:px-4 bg-slate-800/80 hover:bg-slate-700 rounded-lg font-bold transition-all text-xs md:text-sm border border-slate-600 shadow-sm backdrop-blur-sm">
            <Download className="w-4 h-4 text-cyan-400"/> 복사
          </button>

          <button onClick={() => setDeckImportModalOpen(true)} className="flex items-center gap-1 md:gap-2 py-2 px-3 md:px-4 bg-slate-800/80 hover:bg-slate-700 rounded-lg font-bold transition-all text-xs md:text-sm border border-slate-600 shadow-sm backdrop-blur-sm">
            <Upload className="w-4 h-4 text-cyan-400"/> 붙여넣기
          </button>

          <button onClick={() => {
            setDeckCounts(tempDeckCounts);
            saveGame({ deckCounts: tempDeckCounts });
          }} className="flex items-center gap-1 md:gap-2 py-2 px-3 md:px-5 bg-emerald-700 hover:bg-emerald-600 rounded-lg font-bold transition-all text-sm md:text-base border border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)] text-white">
            <Save className="w-4 h-4 md:w-5 md:h-5"/> 저장
          </button>
          
          <button onClick={() => setGameState('MENU')} className="py-2 px-3 md:px-5 bg-indigo-700 hover:bg-indigo-600 rounded-lg font-bold text-sm md:text-base border border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-colors">
            메인으로
          </button>
        </div>
      </div>

      <div className="relative z-10 mb-2 shrink-0">
        <FilterBar 
          type={filterType} setType={setFilterType}
          effect={filterEffect} setEffect={setEffect}
          rarity={filterRarity} setRarity={setRarity}
          search={searchQuery} setSearch={setSearchQuery}
        />
      </div>

      {normalCleared && unlockedRelics && unlockedRelics.length > 0 && (
        <div className="w-full max-w-[1600px] mx-auto mb-2 flex items-center gap-3 bg-slate-900/80 p-3 md:p-4 rounded-2xl border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.1)] overflow-x-auto hide-scrollbar backdrop-blur-md relative z-10 shrink-0">
          <div className="flex items-center gap-2 shrink-0">
            <img src={shieldImg} alt="Relic" className="w-5 h-5 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
            <span className="text-amber-400 font-black text-sm drop-shadow-md">시작 유물 선택:</span>
          </div>
          
          <div className="flex items-center gap-3 pl-2">
            <button onClick={() => setStartingRelic(null)} className={`text-xs px-3 py-1.5 rounded-lg border font-bold transition-all whitespace-nowrap ${startingRelic === null ? 'bg-amber-600 border-amber-400 text-white shadow-[0_0_10px_orange]' : 'bg-slate-800 border-slate-600 text-slate-400 hover:bg-slate-700 hover:text-white'}`}>
              선택 안함
            </button>
            {unlockedRelics.map(rid => {
              const relDef = RELIC_LIBRARY.find(r => r.id === rid);
              if (!relDef) return null;
              const isSelected = startingRelic === rid;
              return (
                <div key={rid} className="flex items-center gap-1 group/btn">
                  <button onClick={() => setStartingRelic(rid)} className={`text-xs px-3 py-1.5 rounded-lg border font-bold transition-all whitespace-nowrap ${isSelected ? 'bg-amber-600 border-amber-400 text-white shadow-[0_0_10px_orange]' : 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-indigo-500'}`}>
                    {relDef.name}
                  </button>
                  <div className="relative group cursor-help flex items-center">
                    <HelpCircle className="w-4 h-4 text-slate-500 hover:text-amber-400 transition-colors" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-56 p-3 bg-slate-900 border-2 border-indigo-500 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] z-[100000] pointer-events-none">
                      <div className="text-amber-400 font-bold text-xs mb-1 border-b border-slate-700 pb-1">{relDef.name}</div>
                      <div className="text-[10px] text-slate-300 leading-relaxed whitespace-pre-wrap">{relDef.desc}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ✨ 메인 콘텐츠 영역 (좌측: 전체 카드 풀, 우측: 내 덱 요약 리스트) */}
      <div className="flex-1 flex flex-col lg:flex-row w-full max-w-[1600px] mx-auto overflow-hidden relative z-10 mt-2 gap-4">
        
        {/* 왼쪽: 카드 풀 */}
        <div className="flex-1 overflow-y-auto hide-scrollbar pb-[40vh] lg:pb-10 px-2 lg:px-4">
          <div className="flex flex-wrap gap-4 md:gap-6 content-start justify-center">
            {filteredCards.map(baseCard => {
              const count = tempDeckCounts[baseCard.id] || 0;
              const card = getCardDef(baseCard.id, shopUpgrades); 
              if (!card) return null;
              return (
                <div key={baseCard.id} className="w-32 h-48 sm:w-36 sm:h-56 md:w-44 md:h-[260px] lg:w-48 lg:h-[280px] shrink-0 transition-transform hover:scale-105 origin-center">
                  <Card 
                    card={card} 
                    count={count} 
                    isLocked={false} 
                    onAdd={handleAddCard} 
                    onRemove={handleRemoveCard}
                    canAdd={!isDeckFull}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* ✨ 오른쪽: 내 덱 현황 (사이드바 / 모바일용 하단 패널) */}
        <div className="fixed bottom-0 left-0 right-0 lg:static lg:w-[320px] xl:w-[360px] h-[35vh] lg:h-full shrink-0 flex flex-col bg-slate-900/95 lg:bg-slate-900/60 backdrop-blur-xl rounded-t-3xl lg:rounded-2xl border-t lg:border border-slate-600 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] lg:shadow-xl z-50">
          
          {/* 사이드바 헤더 */}
          <div className="bg-slate-800/80 p-3 lg:p-4 flex justify-between items-center border-b border-slate-600 rounded-t-3xl lg:rounded-t-2xl shrink-0">
            <h3 className="font-bold text-indigo-300 flex items-center gap-2">
              <Layers className="w-5 h-5"/>
              <span>내 덱 리스트</span>
            </h3>
            <span className="text-[10px] md:text-xs text-slate-400">비용/타입 정렬됨</span>
          </div>
          
          {/* 덱 카드 리스트 */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 hide-scrollbar">
            {deckCardsList.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-3 opacity-60">
                <Layers className="w-10 h-10" />
                <span className="text-sm font-medium">덱에 카드가 없습니다.</span>
              </div>
            ) : (
              deckCardsList.map(({ id, count, cardDef }) => (
                <div key={id} className="flex justify-between items-center bg-slate-800/60 p-2 rounded-lg border border-slate-700/80 hover:border-indigo-500/50 hover:bg-slate-750 transition-all group">
                  <div className="flex items-center gap-2.5 overflow-hidden flex-1">
                    <span className={`text-[11px] px-1.5 py-0.5 rounded font-black shrink-0 ${cardDef.type === 'attack' ? 'bg-red-900/80 text-red-300 border border-red-800' : 'bg-blue-900/80 text-blue-300 border border-blue-800'}`}>
                      {cardDef.cost}
                    </span>
                    <span className={`text-sm font-medium truncate ${cardDef.isUpgraded ? 'text-yellow-400 drop-shadow-[0_0_2px_rgba(250,204,21,0.5)]' : 'text-slate-200'}`} title={cardDef.name}>
                      {cardDef.name.split(' +')[0]}
                      {cardDef.isUpgraded && <span className="text-xs ml-1 text-yellow-500 font-bold">+{cardDef.upgradeLevel}</span>}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 md:gap-3 shrink-0 pl-2">
                    <span className="text-sm font-black text-indigo-300 min-w-[1.5rem] text-right">x{count}</span>
                    <div className="flex gap-1">
                      <button onClick={() => handleRemoveCard(id)} className="w-7 h-7 flex items-center justify-center bg-slate-700 hover:bg-red-600 text-slate-300 hover:text-white rounded-md transition-colors font-black border border-slate-600 hover:border-red-500">-</button>
                      <button onClick={() => handleAddCard(id)} disabled={isDeckFull} className="w-7 h-7 flex items-center justify-center bg-slate-700 hover:bg-blue-600 text-slate-300 hover:text-white rounded-md transition-colors font-black border border-slate-600 hover:border-blue-500 disabled:opacity-30 disabled:cursor-not-allowed">+</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}