// src/components/common/FilterBar.jsx
import React from 'react';
import { Search } from 'lucide-react';

export default function FilterBar({ 
  type, setType, 
  effect, setEffect, 
  rarity, setRarity, 
  ownership, setOwnership, 
  search, setSearch 
}) {
  return (
    <div className="flex flex-col gap-4 mb-6 w-full max-w-6xl mx-auto px-4 bg-slate-800/40 p-4 rounded-xl border border-slate-700 shadow-inner">
      {/* 검색 바 */}
      <div className="flex items-center bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 w-full md:w-1/2 focus-within:border-indigo-500 transition-all">
        <Search className="w-5 h-5 text-slate-400 mr-2 shrink-0" />
        <input 
          type="text" 
          placeholder="카드 이름이나 효과 검색..." 
          className="bg-transparent border-none outline-none text-white w-full font-bold text-sm placeholder-slate-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      
      {/* 필터 버튼 그룹 */}
      <div className="flex flex-wrap gap-x-6 gap-y-3">
        {/* 종류 필터 */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar py-1 items-center">
          <span className="text-slate-400 text-sm font-bold w-10 shrink-0">종류</span>
          {['all', 'attack', 'skill'].map((v) => (
            <button 
              key={v} 
              onClick={() => setType(v)} 
              className={`px-3 py-1.5 rounded-full font-bold text-xs shrink-0 transition-all ${type === v ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}`}
            >
              {v === 'all' ? '전체' : v === 'attack' ? '전투 (공격)' : '보조 (스킬)'}
            </button>
          ))}
        </div>

        {/* 효과 필터 (중독/가시 포함) */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar py-1 items-center">
          <span className="text-slate-400 text-sm font-bold w-10 shrink-0">효과</span>
          <button onClick={() => setEffect('all')} className={`px-3 py-1.5 rounded-full font-bold text-xs shrink-0 transition-all ${effect === 'all' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}`}>모든 효과</button>
          <button onClick={() => setEffect('debuff')} className={`px-3 py-1.5 rounded-full font-bold text-xs shrink-0 transition-all ${effect === 'debuff' ? 'bg-purple-600 text-white shadow-md' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}`}>디버프 (약화/취약/중독)</button>
          <button onClick={() => setEffect('buff')} className={`px-3 py-1.5 rounded-full font-bold text-xs shrink-0 transition-all ${effect === 'buff' ? 'bg-green-600 text-white shadow-md' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}`}>버프 (근력/민첩/가시)</button>
        </div>

        {/* 🌟 [수정] 등급 필터에 '전리품(loot)' 추가 */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar py-1 items-center">
          <span className="text-slate-400 text-sm font-bold w-10 shrink-0">등급</span>
          {['all', 'common', 'uncommon', 'rare', 'special', 'mythic', 'loot'].map((v) => (
            <button 
              key={v} 
              onClick={() => setRarity(v)} 
              className={`px-3 py-1.5 rounded-full font-bold text-xs shrink-0 transition-all ${rarity === v ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}`}
            >
              {v === 'all' ? '전체' : v === 'common' ? '일반' : v === 'uncommon' ? '희귀' : v === 'rare' ? '전설' : v === 'special' ? '특수' : v === 'mythic' ? '신화' : '전리품'}
            </button>
          ))}
        </div>
        
        {/* 보유 여부 필터 (부모에서 setOwnership을 줬을 때만 표시) */}
        {setOwnership && (
          <div className="flex gap-2 overflow-x-auto hide-scrollbar py-1 items-center">
            <span className="text-slate-400 text-sm font-bold w-10 shrink-0">보유</span>
            {['all', 'owned', 'unowned'].map((v) => (
              <button 
                key={v} 
                onClick={() => setOwnership(v)} 
                className={`px-3 py-1.5 rounded-full font-bold text-xs shrink-0 transition-all ${ownership === v ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}`}
              >
                {v === 'all' ? '전체' : v === 'owned' ? '보유' : '미보유'}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}