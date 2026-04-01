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
          // 수정 후
<button 
  onClick={() => { setTab('cards'); setFilterRarity('all'); setSearchQuery(''); }} 
  className={`py-2 px-4 rounded-xl font-bold transition-colors ${tab === 'cards' ? 'bg-indigo-600 shadow-lg' : 'bg-slate-700 hover:bg-slate-600'}`}>
  카드 도감
</button>
<button 
  onClick={() => { setTab('relics'); setFilterRarity('all'); setSearchQuery(''); }} 
  className={`py-2 px-4 rounded-xl font-bold transition-colors ${tab === 'relics' ? 'bg-amber-600 shadow-lg' : 'bg-slate-700 hover:bg-slate-600'}`}>
  유물 도감
</button>
          <button onClick={() => setGameState('MENU')} className="py-2 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl font-bold shadow-md ml-2">메인으로</button>
        </div>
      </div>

      {/* 카드 탭일 때는 기존 FilterBar, 유물 탭일 때는 유물 전용 필터 렌더링 */}
      {tab === 'cards' ? (
        <FilterBar 
          type={filterType} setType={setFilterType} 
          effect={filterEffect} setEffect={setFilterEffect} 
          rarity={filterRarity} setRarity={setFilterRarity} 
          search={searchQuery} setSearch={setSearchQuery} 
        />
      ) : (
        <div className="flex flex-wrap items-center gap-2 mb-4 px-2 md:px-4 max-w-6xl mx-auto w-full">
          {['all', 'common', 'uncommon', 'rare', 'special', 'mythic'].map((r) => {
            const labels = { all: '전체', common: '일반', uncommon: '희귀', rare: '전설', special: '특수', mythic: '신화' };
            return (
              <button
                key={r}
                onClick={() => setFilterRarity(r)}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                  filterRarity === r 
                    ? 'bg-amber-600 text-white' 
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700'
                }`}
              >
                {labels[r]}
              </button>
            );
          })}
          
          <input
            type="text"
            placeholder="유물 이름 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ml-auto px-4 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-500 w-full sm:w-auto mt-2 sm:mt-0"
          />
        </div>
              )
            })
          </div>
        )}
      