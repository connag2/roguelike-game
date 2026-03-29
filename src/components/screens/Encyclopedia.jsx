import React, { useState } from 'react';
import { Book, Maximize } from 'lucide-react';
import Card from '../common/Card';
import FilterBar from '../common/FilterBar';

export default function Encyclopedia({
  unlockedCards,
  getCardDef,
  shopUpgrades,
  getFilteredCards, // 부모의 필터링 로직 사용
  setGameState,
  toggleFullScreen
}) {
  const [type, setType] = useState('all');
  const [effect, setEffect] = useState('all');
  const [rarity, setRarity] = useState('all');
  const [ownership, setOwnership] = useState('all');
  const [search, setSearch] = useState('');

  // 현재 필터링된 카드 목록 가져오기
  const filteredCards = getFilteredCards(type, effect, rarity, ownership, search);

  return (
    <div className="flex flex-col min-h-[100dvh] bg-slate-900 text-white pt-16 md:pt-4 p-4 md:p-10 relative">
      <button onClick={toggleFullScreen} className="fixed top-4 left-4 z-50 flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded text-sm font-bold border border-slate-600">
        <Maximize className="w-4 h-4"/> <span className="hidden md:inline">전체화면</span>
      </button>

      <div className="flex justify-between items-center mb-4 pl-0 md:pl-32">
        <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3"><Book className="w-8 h-8 text-blue-400"/> 카드 도감</h2>
        <button onClick={() => setGameState('MENU')} className="py-2 px-4 bg-indigo-600 rounded-lg font-bold shadow-md">메인으로</button>
      </div>

      <FilterBar 
        type={type} setType={setType}
        effect={effect} setEffect={setEffect}
        rarity={rarity} setRarity={setRarity}
        ownership={ownership} setOwnership={setOwnership}
        search={search} setSearch={setSearch}
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 overflow-y-auto hide-scrollbar pb-10 w-full max-w-6xl mx-auto px-4">
        {filteredCards.map(baseCard => {
          const isOwned = unlockedCards.includes(baseCard.id);
          const card = getCardDef(baseCard.id, shopUpgrades);
          if (!card) return null;
          return (
            <div key={baseCard.id} className="w-full h-full">
              <Card card={card} isLocked={!isOwned} />
            </div>
          );
        })}
      </div>
    </div>
  );
}