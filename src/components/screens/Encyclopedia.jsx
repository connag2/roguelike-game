import React, { useState } from 'react';
import { Maximize } from 'lucide-react';
import { CARD_LIBRARY } from '../../constants/gameData';
import { RELIC_LIBRARY } from '../../constants/relicData';
import Card from '../common/Card';
import FilterBar from '../common/FilterBar';

export default function Encyclopedia({
  unlockedCards, getCardDef, shopUpgrades, getFilteredCards, setGameState, toggleFullScreen, setTutorialModalOpen, unlockedRelics
}) {
  const [tab, setTab] = useState('cards'); 
  const [filterType, setFilterType] = useState('all');
  const [filterEffect, setFilterEffect] = useState('all');
  const [filterRarity, setFilterRarity] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCards = getFilteredCards(filterType, filterEffect, filterRarity, 'all', searchQuery);
  
  const filteredRelics = RELIC_LIBRARY.filter(r => {
    if (filterRarity !== 'all' && r.rarity !== filterRarity) return false;
    if (searchQuery && !r.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="flex flex-col h-[100dvh] bg-slate-900 text-white pt-16 md:pt-4 p-4 md:p-10 relative">
      <button onClick={toggleFullScreen} className="fixed top-4 left-4 z-50 flex items-center gap-2 bg-slate-800 px-3 py-2 rounded text-sm font-bold border border-slate-600">
        <Maximize className="w-4 h-4"/> <span className="hidden md:inline">전체화면</span>
      </button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pl-0 md:pl-32 gap-4">
        <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3 shrink-0">
          종합 도감 
          <span className="text-sm md:text-lg text-indigo-400 ml-2">
            {tab === 'cards' ? `카드 (${unlockedCards.length}/${CARD_LIBRARY.length})` : `유물 (${unlockedRelics.length}/${RELIC_LIBRARY.length})`}
          </span>
        </h2>
        <div className="flex gap-2">
          <button onClick={() => setTab('cards')} className={`py-2 px-4 rounded-xl font-bold transition-colors ${tab === 'cards' ? 'bg-indigo-600 shadow-lg' : 'bg-slate-700 hover:bg-slate-600'}`}>카드 도감</button>
          <button onClick={() => setTab('relics')} className={`py-2 px-4 rounded-xl font-bold transition-colors ${tab === 'relics' ? 'bg-amber-600 shadow-lg' : 'bg-slate-700 hover:bg-slate-600'}`}>유물 도감</button>
          <button onClick={() => setGameState('MENU')} className="py-2 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl font-bold shadow-md ml-2">메인으로</button>
        </div>
      </div>

      {tab === 'cards' && <FilterBar type={filterType} setType={setFilterType} effect={filterEffect} setEffect={setFilterEffect} rarity={filterRarity} setRarity={setFilterRarity} search={searchQuery} setSearch={setSearchQuery} />}
      
      <div className="flex-1 overflow-y-auto hide-scrollbar pb-10 w-full max-w-6xl mx-auto px-2 md:px-4 mt-4">
        {tab === 'cards' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
            {filteredCards.map(baseCard => (
              <Card key={baseCard.id} card={getCardDef(baseCard.id, shopUpgrades)} isLocked={!unlockedCards.includes(baseCard.id)} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredRelics.map(rel => {
              const isLocked = !unlockedRelics.includes(rel.id);
              let rColor = 'text-slate-400'; let borderColor = 'border-slate-600';
              if (!isLocked) {
                if(rel.rarity === 'uncommon') { rColor = 'text-cyan-400'; borderColor = 'border-cyan-700'; }
                else if(rel.rarity === 'rare') { rColor = 'text-yellow-400'; borderColor = 'border-yellow-600'; }
                else if(rel.rarity === 'special') { rColor = 'text-fuchsia-400'; borderColor = 'border-fuchsia-600'; }
                else if(rel.rarity === 'mythic') { rColor = 'text-red-500 font-black drop-shadow'; borderColor = 'border-red-600 bg-red-950/40 shadow-[0_0_15px_rgba(220,38,38,0.3)]'; }
              }
              return (
                <div key={rel.id} className={`p-5 rounded-xl border-2 transition-transform hover:-translate-y-1 ${isLocked ? 'bg-slate-900 border-slate-800 opacity-50 grayscale' : `bg-slate-800 ${borderColor}`}`}>
                  <div className={`text-xl font-bold mb-3 ${rColor}`}>{isLocked ? '???' : rel.name}</div>
                  <div className="text-sm text-slate-300 leading-relaxed font-medium break-keep">{isLocked ? '이 유물을 아직 발견하지 못했습니다.' : rel.desc}</div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  );
}