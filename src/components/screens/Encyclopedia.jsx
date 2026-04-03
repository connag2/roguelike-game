import React, { useState } from 'react';
import { Maximize } from 'lucide-react';
import { CARD_LIBRARY, ENEMIES, NORMAL_BOSSES, SPECIAL_BOSSES, HARD_MODE_BOSSES, UNPLAYABLE_MONSTER_SKILLS } from '../../constants/gameData';
import { RELIC_LIBRARY } from '../../constants/relicData';
import Card from '../common/Card';
import FilterBar from '../common/FilterBar';

export default function Encyclopedia({
  unlockedCards = [], 
  customCards = [],
  getCardDef, 
  shopUpgrades, 
  getFilteredCards, 
  setGameState, 
  toggleFullScreen, 
  setTutorialModalOpen, 
  unlockedRelics = [] 
}) {
  const [tab, setTab] = useState('cards'); 
  const [filterType, setFilterType] = useState('all');
  const [filterEffect, setFilterEffect] = useState('all');
  const [filterRarity, setFilterRarity] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterUnlock, setFilterUnlock] = useState('all');

  // ✨ 적 카드 데이터를 추출 (일반 몹 제외, 보스몹만! + 플레이어 사용 불가 카드 제거!)
  const enemyCardsMap = {};
  const allEnemies = [ 
    ...NORMAL_BOSSES, 
    ...(HARD_MODE_BOSSES || []), 
    ...Object.values(SPECIAL_BOSSES) 
  ];
  
  allEnemies.forEach(enemy => {
    if (enemy?.deck) {
      enemy.deck.forEach(c => {
        // ✨ 플레이어 사용 불가 카드 필터링
        if (UNPLAYABLE_MONSTER_SKILLS.includes(c.id)) return;
        
        if (!enemyCardsMap[c.name]) {
          enemyCardsMap[c.name] = {
            id: `enemy_${c.name}`,
            name: c.name,
            type: c.type?.includes('attack') ? 'attack' : 'skill',
            rarity: 'special',
            cost: '보스',
            desc: c.desc,
            isEnemyCard: true
          };
        }
      });
    }
  });
  const ENEMY_CARDS = Object.values(enemyCardsMap);

  // ✨ 도감의 기준이 되는 "전체 카드 목록"
  const FULL_CARD_LIBRARY = [...CARD_LIBRARY, ...customCards, ...ENEMY_CARDS];

  const validUnlockedCards = [...new Set(unlockedCards)].filter(id => FULL_CARD_LIBRARY.some(c => c.id === id));
  const validUnlockedRelics = [...new Set(unlockedRelics)].filter(id => RELIC_LIBRARY.some(r => r.id === id));

  // 1. 기존 플레이어 카드 필터링
  let filteredCards = getFilteredCards(filterType, filterEffect, filterRarity, 'all', searchQuery);
  
  // 2. ✨ 보스 카드도 동일한 조건으로 필터링
  let filteredEnemyCards = ENEMY_CARDS.filter(c => {
    if (filterType !== 'all' && c.type !== filterType) return false;
    if (filterRarity !== 'all' && c.rarity !== filterRarity) return false;
    if (searchQuery && !c.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // 3. ✨ 플레이어 카드와 보스 카드를 하나의 리스트로 합침
  filteredCards = [...filteredCards, ...filteredEnemyCards];

  // 4. 보유/미보유 필터 적용
  if (filterUnlock === 'unlocked') {
    filteredCards = filteredCards.filter(c => validUnlockedCards.includes(c.id));
  } else if (filterUnlock === 'locked') {
    filteredCards = filteredCards.filter(c => !validUnlockedCards.includes(c.id));
  }
  
  const filteredRelics = RELIC_LIBRARY.filter(r => {
    if (filterRarity !== 'all' && r.rarity !== filterRarity) return false;
    if (searchQuery && !r.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterUnlock === 'unlocked' && !validUnlockedRelics.includes(r.id)) return false;
    if (filterUnlock === 'locked' && validUnlockedRelics.includes(r.id)) return false;
    return true;
  });

  const renderUnlockFilter = (activeColor) => (
    <div className="flex gap-2">
      {['all', 'unlocked', 'locked'].map((status) => {
        const labels = { all: '전체', unlocked: '보유', locked: '미보유' };
        return (
          <button
            key={status}
            onClick={() => setFilterUnlock(status)}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-colors ${
              filterUnlock === status 
                ? `${activeColor} text-white` 
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700'
            }`}
          >
            {labels[status]}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="flex flex-col h-[100dvh] bg-slate-900 text-white pt-16 md:pt-4 p-4 md:p-10 relative">
      <button onClick={toggleFullScreen} className="fixed top-4 left-4 z-50 flex items-center gap-2 bg-slate-800 px-3 py-2 rounded text-sm font-bold border border-slate-600">
        <Maximize className="w-4 h-4"/> <span className="hidden md:inline">전체화면</span>
      </button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pl-0 md:pl-32 gap-4">
        <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3 shrink-0">
          종합 도감 
          <span className="text-sm md:text-lg text-indigo-400 ml-2">
            {tab === 'cards' ? `카드 (${validUnlockedCards.length}/${FULL_CARD_LIBRARY.length})` : `유물 (${validUnlockedRelics.length}/${RELIC_LIBRARY.length})`}
          </span>
        </h2>
        <div className="flex gap-2">
          <button onClick={() => { setTab('cards'); setFilterRarity('all'); setSearchQuery(''); setFilterUnlock('all'); }} className={`py-2 px-4 rounded-xl font-bold transition-colors ${tab === 'cards' ? 'bg-indigo-600 text-white' : 'bg-slate-800 hover:bg-slate-700 border border-slate-600'}`}>카드</button>
          <button onClick={() => { setTab('relics'); setFilterRarity('all'); setSearchQuery(''); setFilterUnlock('all'); }} className={`py-2 px-4 rounded-xl font-bold transition-colors ${tab === 'relics' ? 'bg-amber-600 text-white' : 'bg-slate-800 hover:bg-slate-700 border border-slate-600'}`}>유물</button>
          <button onClick={() => setGameState('MENU')} className="py-2 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl font-bold shadow-md ml-2">메인으로</button>
        </div>
      </div>

      {tab === 'cards' ? (
        <div className="flex flex-col gap-3 mb-4 px-2 md:px-4 max-w-6xl mx-auto w-full">
          <FilterBar type={filterType} setType={setFilterType} effect={filterEffect} setEffect={setFilterEffect} rarity={filterRarity} setRarity={setFilterRarity} search={searchQuery} setSearch={setSearchQuery} />
          <div className="flex justify-start">
            {renderUnlockFilter('bg-indigo-600')}
          </div>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row flex-wrap items-start md:items-center gap-3 mb-4 px-2 md:px-4 max-w-6xl mx-auto w-full">
          <div className="flex flex-wrap items-center gap-2">
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
          </div>
          {renderUnlockFilter('bg-amber-600')}
          <input
            type="text"
            placeholder="유물 이름 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="md:ml-auto px-4 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-500 w-full md:w-auto"
          />
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto hide-scrollbar pb-10 w-full max-w-6xl mx-auto px-2 md:px-4 mt-4">
        {tab === 'cards' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
            {filteredCards.map(baseCard => {
              const cardData = baseCard.isEnemyCard ? baseCard : getCardDef(baseCard.id, shopUpgrades);
              const isLocked = baseCard.isEnemyCard ? false : !validUnlockedCards.includes(baseCard.id);
              
              return (
                <Card 
                  key={baseCard.id} 
                  card={cardData} 
                  isLocked={isLocked} 
                />
              )
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredRelics.map(rel => {
              const isLocked = !validUnlockedRelics.includes(rel.id);
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