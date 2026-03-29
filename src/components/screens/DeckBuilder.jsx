import React from 'react';
import { Eraser, Download, Upload, Save, Maximize } from 'lucide-react';
import Card from '../common/Card';
import FilterBar from '../common/FilterBar';

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
  filteredCards, // 부모에서 계산해서 넘겨줌
  getCardDef,
  shopUpgrades,
  handleAddCard,
  handleRemoveCard
}) {
  return (
    <div className="flex flex-col h-[100dvh] bg-slate-900 text-white pt-16 md:pt-4 p-4 md:p-10 relative">
      <button onClick={toggleFullScreen} className="fixed top-4 left-4 z-50 flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded text-sm font-bold transition-colors border border-slate-600">
        <Maximize className="w-4 h-4"/> <span className="hidden md:inline">전체화면</span>
      </button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 pl-0 md:pl-32 gap-4">
        <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3 shrink-0">시작 덱 구성</h2>
        
        <div className="flex flex-wrap items-center gap-2 md:gap-3 shrink-0 w-full md:w-auto justify-end">
          <span className={`text-sm md:text-lg font-bold mr-2 ${getTotalCards(tempDeckCounts) === 20 ? 'text-green-400' : 'text-yellow-400'}`}>
            총 {getTotalCards(tempDeckCounts)}/20장
          </span>
          
          <button onClick={handleClearDeck} className="flex items-center gap-1 md:gap-2 py-2 px-3 bg-red-800 hover:bg-red-700 rounded-lg font-bold transition-all text-xs md:text-sm border border-red-600">
            <Eraser className="w-4 h-4"/> 비우기
          </button>

          <button onClick={handleDeckExport} className="flex items-center gap-1 md:gap-2 py-2 px-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-bold transition-all text-xs md:text-sm border border-slate-500">
            <Download className="w-4 h-4"/> 덱 복사
          </button>

          <button onClick={() => setDeckImportModalOpen(true)} className="flex items-center gap-1 md:gap-2 py-2 px-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-bold transition-all text-xs md:text-sm border border-slate-500">
            <Upload className="w-4 h-4"/> 덱 붙여넣기
          </button>

          <button onClick={() => {
            setDeckCounts(tempDeckCounts);
            saveGame({ deckCounts: tempDeckCounts });
          }} className="flex items-center gap-1 md:gap-2 py-2 px-3 md:px-4 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-bold transition-all text-sm md:text-base shadow-md">
            <Save className="w-4 h-4 md:w-5 md:h-5"/> 저장
          </button>
          
          <button onClick={() => setGameState('MENU')} className="py-2 px-3 md:px-4 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-bold text-sm md:text-base shadow-md">
            메인으로
          </button>
        </div>
      </div>

      <FilterBar 
        type={filterType} setType={setFilterType}
        effect={filterEffect} setEffect={setEffect}
        rarity={filterRarity} setRarity={setRarity}
        search={searchQuery} setSearch={setSearchQuery}
      />
      // DeckBuilder.jsx 상단 버튼 그룹
<div className="flex items-center gap-2">
  <button onClick={() => setTutorialModalOpen(true)} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-600">
    <HelpCircle className="w-5 h-5 text-indigo-400" />
  </button>
  {/* 나머지 저장/복사 버튼들... */}
</div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 overflow-y-auto hide-scrollbar pb-10 w-full max-w-6xl mx-auto px-4">
        {filteredCards.map(baseCard => {
          const count = tempDeckCounts[baseCard.id] || 0;
          const card = getCardDef(baseCard.id, shopUpgrades); 
          if (!card) return null;
          return (
            <Card 
              key={baseCard.id}
              card={card} 
              count={count} 
              isLocked={false} 
              onAdd={handleAddCard} 
              onRemove={handleRemoveCard}
              canAdd={getTotalCards(tempDeckCounts) < 20}
            />
          );
        })}
      </div>
    </div>
  );
}