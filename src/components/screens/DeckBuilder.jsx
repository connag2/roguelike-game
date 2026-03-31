import React from 'react';
import { Eraser, Download, Upload, Save, Maximize, HelpCircle } from 'lucide-react';
import Card from '../common/Card';
import FilterBar from '../common/FilterBar';
import { RELIC_LIBRARY } from '../../constants/relicData'; // ✅ ../../ 로 수정

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
  normalCleared, unlockedRelics, startingRelic, setStartingRelic // 100층 클리어 프롭스
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
          
          <button 
            onClick={() => setTutorialModalOpen(true)}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-600 transition-colors"
          >
            <HelpCircle className="w-5 h-5 text-indigo-400" />
          </button>

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

      {/* ✨ 100층 클리어 유저를 위한 '시작 유물 선택' 영역 */}
      {normalCleared && unlockedRelics && unlockedRelics.length > 0 && (
        <div className="w-full max-w-7xl mx-auto px-4 mt-2 mb-2 flex items-center gap-3 bg-slate-800/80 p-3 rounded-xl border border-amber-500/50 overflow-x-auto hide-scrollbar">
          <span className="text-amber-400 font-black text-sm shrink-0 drop-shadow-md">🎁 시작 유물 선택:</span>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setStartingRelic(null)} 
              className={`text-xs px-3 py-1.5 rounded-lg border font-bold transition-all whitespace-nowrap ${startingRelic === null ? 'bg-amber-600 border-amber-400 text-white shadow-[0_0_10px_orange]' : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'}`}
            >
              선택 안함
            </button>
            {unlockedRelics.map(rid => {
              const relDef = RELIC_LIBRARY.find(r => r.id === rid);
              if (!relDef) return null;
              const isSelected = startingRelic === rid;
              return (
                <div key={rid} className="flex items-center gap-1">
                  <button 
                    onClick={() => setStartingRelic(rid)}
                    className={`text-xs px-3 py-1.5 rounded-lg border font-bold transition-all whitespace-nowrap ${isSelected ? 'bg-amber-600 border-amber-400 text-white shadow-[0_0_10px_orange]' : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'}`}
                  >
                    {relDef.name}
                  </button>
                  {/* ✨ 오직 ? 아이콘 위에서만 상단(bottom-full)으로 팝업 */}
                  <div className="relative group cursor-help flex items-center">
                    <HelpCircle className="w-4 h-4 text-slate-400 hover:text-indigo-400 transition-colors" />
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

      <div className="flex-1 overflow-y-auto hide-scrollbar flex flex-wrap gap-4 md:gap-6 content-start justify-center pb-24 w-full max-w-7xl mx-auto px-4 mt-4">
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
                canAdd={getTotalCards(tempDeckCounts) < 20}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}