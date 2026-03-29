import React, { useState } from 'react';
import { Skull, Maximize, Heart, Sword, Shield, Zap } from 'lucide-react';
import Tooltip from '../common/Tooltip';
import { ENEMIES, NORMAL_BOSSES, SPECIAL_BOSSES } from '../../constants/gameData';

export default function MonsterDex({ 
  seenEnemies, 
  dexViewingEnemy, 
  setDexViewingEnemy, 
  toggleFullScreen, 
  setGameState 
}) {
  
  // 카테고리별 데이터 정리
  const categories = [
    { 
      title: "전설의 네임드 보스", 
      desc: "25, 50, 75, 100층을 지키는 강력한 수호자들입니다.",
      list: Object.values(SPECIAL_BOSSES) 
    },
    { 
      title: "지역 보스", 
      desc: "매 5층마다 무작위로 등장하는 강력한 적들입니다.",
      list: NORMAL_BOSSES 
    },
    { 
      title: "일반 몬스터", 
      desc: "각 층에서 마주치는 일반적인 적들입니다.",
      list: ENEMIES 
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-900 text-white p-4 md:p-10 relative">
      {/* 상단바 */}
      <div className="flex justify-between items-center mb-8 pl-0 md:pl-10">
        <h2 className="text-2xl md:text-3xl font-black flex items-center gap-3">
          <Skull className="w-8 h-8 text-red-500 animate-pulse"/> 몬스터 도감
        </h2>
        <div className="flex gap-2">
          <button onClick={toggleFullScreen} className="bg-slate-800 p-2 rounded border border-slate-600 hover:bg-slate-700">
            <Maximize className="w-5 h-5"/>
          </button>
          <button onClick={() => setGameState('MENU')} className="py-2 px-6 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-bold shadow-lg transition-all">
            메인으로
          </button>
        </div>
      </div>

      {/* 리스트 영역 */}
      <div className="overflow-y-auto hide-scrollbar pb-20 space-y-12">
        {categories.map((cat, i) => (
          <div key={i} className="animate-draw">
            <div className="mb-4">
              <h3 className="text-xl font-black text-indigo-400 border-l-4 border-indigo-500 pl-4 mb-1">{cat.title}</h3>
              <p className="text-xs text-slate-500 pl-5">{cat.desc}</p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 px-2">
              {cat.list.map((monster, idx) => {
                const isSeen = seenEnemies.includes(monster.name);
                return (
                  <div 
                    key={idx} 
                    onClick={() => isSeen && setDexViewingEnemy(monster)}
                    className={`group p-4 rounded-xl border-2 transition-all relative overflow-hidden ${
                      isSeen 
                      ? 'cursor-pointer hover:border-indigo-500 bg-slate-800 border-slate-700 hover:-translate-y-1' 
                      : 'bg-slate-950 border-slate-900 opacity-40'
                    }`}
                  >
                    <div className="relative z-10">
                      <div className="text-sm md:text-base font-bold mb-1 truncate">
                        {isSeen ? monster.name : "???"}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {isSeen ? `기본 체력: ${monster.baseHp}` : "아직 조우하지 못함"}
                      </div>
                    </div>
                    {isSeen && (
                      <Skull className="absolute -right-2 -bottom-2 w-12 h-12 text-slate-700/30 group-hover:text-indigo-500/20 transition-colors" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* 몬스터 상세 모달 (선택 시 노출) */}
      {dexViewingEnemy && (
        <div className="fixed inset-0 bg-black/90 z-[10000] flex items-center justify-center p-4 backdrop-blur-md" onClick={() => setDexViewingEnemy(null)}>
          <div className="bg-slate-800 p-6 md:p-8 rounded-2xl border-2 border-slate-600 max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
             <div className="flex justify-between items-start mb-6 border-b border-slate-700 pb-4">
               <div>
                 <h3 className="text-3xl font-black text-white flex items-center gap-3">
                   <Skull className="w-8 h-8 text-red-500" /> {dexViewingEnemy.name}
                 </h3>
                 <p className="text-slate-400 mt-1">기본 HP: {dexViewingEnemy.baseHp}</p>
               </div>
               <button onClick={() => setDexViewingEnemy(null)} className="p-2 bg-slate-700 rounded-lg hover:bg-slate-600">닫기</button>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {dexViewingEnemy.deck.map((skill, si) => (
                 <div key={si} className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                   <div className="flex justify-between items-center mb-2">
                     <span className="font-bold text-indigo-300">{skill.name}</span>
                     <span className={`text-[10px] px-2 py-0.5 rounded-full ${skill.type.includes('attack') ? 'bg-red-900/50 text-red-400' : 'bg-blue-900/50 text-blue-400'}`}>
                       {skill.type.includes('attack') ? '공격' : '보조'}
                     </span>
                   </div>
                   <p className="text-sm text-slate-400 leading-snug">{skill.desc}</p>
                 </div>
               ))}
             </div>
          </div>
        </div>
      )}
    </div>
  );
}