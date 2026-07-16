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
          <button onClick={() => setEffect('debuff')} className={`px-3 py-1.5 rounded-full font-bold text-xs shrink-0 transition-all ${effect.startsWith('debuff') ? 'bg-purple-600 text-white shadow-md' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}`}>디버프 (적 약화)</button>
          <button onClick={() => setEffect('buff')} className={`px-3 py-1.5 rounded-full font-bold text-xs shrink-0 transition-all ${effect.startsWith('buff') ? 'bg-green-600 text-white shadow-md' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}`}>버프 (내 강화)</button>
        </div>

        {/* 디버프 세부 필터 */}
        {effect.startsWith('debuff') && (
          <div className="flex gap-2 overflow-x-auto hide-scrollbar py-1 items-center ml-12 border-l-2 border-purple-500/50 pl-3">
            <button onClick={() => setEffect('debuff')} className={`px-2 py-1 rounded font-bold text-xs shrink-0 transition-all ${effect === 'debuff' ? 'bg-purple-500 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>전체</button>
            <button onClick={() => setEffect('debuff_burn')} className={`px-2 py-1 rounded font-bold text-xs shrink-0 transition-all ${effect === 'debuff_burn' ? 'bg-purple-500 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>화상</button>
            <button onClick={() => setEffect('debuff_bleed')} className={`px-2 py-1 rounded font-bold text-xs shrink-0 transition-all ${effect === 'debuff_bleed' ? 'bg-purple-500 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>출혈</button>
            <button onClick={() => setEffect('debuff_poison')} className={`px-2 py-1 rounded font-bold text-xs shrink-0 transition-all ${effect === 'debuff_poison' ? 'bg-purple-500 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>중독</button>
            <button onClick={() => setEffect('debuff_frost')} className={`px-2 py-1 rounded font-bold text-xs shrink-0 transition-all ${effect === 'debuff_frost' ? 'bg-purple-500 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>동상</button>
            <button onClick={() => setEffect('debuff_weak')} className={`px-2 py-1 rounded font-bold text-xs shrink-0 transition-all ${effect === 'debuff_weak' ? 'bg-purple-500 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>약화</button>
            <button onClick={() => setEffect('debuff_vuln')} className={`px-2 py-1 rounded font-bold text-xs shrink-0 transition-all ${effect === 'debuff_vuln' ? 'bg-purple-500 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>취약</button>
            <button onClick={() => setEffect('debuff_silence')} className={`px-2 py-1 rounded font-bold text-xs shrink-0 transition-all ${effect === 'debuff_silence' ? 'bg-purple-500 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>침묵</button>
            <button onClick={() => setEffect('debuff_bind')} className={`px-2 py-1 rounded font-bold text-xs shrink-0 transition-all ${effect === 'debuff_bind' ? 'bg-purple-500 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>속박</button>
          </div>
        )}

        {/* 버프 세부 필터 */}
        {effect.startsWith('buff') && (
          <div className="flex gap-2 overflow-x-auto hide-scrollbar py-1 items-center ml-12 border-l-2 border-green-500/50 pl-3">
            <button onClick={() => setEffect('buff')} className={`px-2 py-1 rounded font-bold text-xs shrink-0 transition-all ${effect === 'buff' ? 'bg-green-500 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>전체</button>
            <button onClick={() => setEffect('buff_str')} className={`px-2 py-1 rounded font-bold text-xs shrink-0 transition-all ${effect === 'buff_str' ? 'bg-green-500 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>근력</button>
            <button onClick={() => setEffect('buff_dex')} className={`px-2 py-1 rounded font-bold text-xs shrink-0 transition-all ${effect === 'buff_dex' ? 'bg-green-500 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>민첩</button>
            <button onClick={() => setEffect('buff_thorns')} className={`px-2 py-1 rounded font-bold text-xs shrink-0 transition-all ${effect === 'buff_thorns' ? 'bg-green-500 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>가시</button>
            <button onClick={() => setEffect('buff_regen')} className={`px-2 py-1 rounded font-bold text-xs shrink-0 transition-all ${effect === 'buff_regen' ? 'bg-green-500 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>재생</button>
            <button onClick={() => setEffect('buff_insight')} className={`px-2 py-1 rounded font-bold text-xs shrink-0 transition-all ${effect === 'buff_insight' ? 'bg-green-500 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>통찰</button>
          </div>
        )}

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