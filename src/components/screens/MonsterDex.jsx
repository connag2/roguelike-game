import React, { useState } from 'react';
import { Skull, Maximize2 } from 'lucide-react';
import Tooltip from '../common/Tooltip';
import { ENEMIES, NORMAL_BOSSES, SPECIAL_BOSSES } from '../../constants/gameData';

export default function MonsterDex({ 
  seenEnemies = [], // ✨ 에러 방지를 위해 기본값 빈 배열 설정
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

  // ✨ 전체 몬스터 수와 내가 본 유효한 몬스터 수를 계산합니다.
  const allMonsterNames = categories.flatMap(cat => cat.list.map(m => m.name));
  const validSeenEnemies = [...new Set(seenEnemies)].filter(name => allMonsterNames.includes(name));

  // 누락된 스킬 설명(desc)을 상세 수치를 기반으로 자동 생성하는 헬퍼 함수
  const getDetailedDescription = (skill) => {
    if (skill.desc) return skill.desc;
    
    const parts = [];
    
    // 💡 버그 수정: value가 0인 경우(H150 보스 등)에도 정상적으로 인식하도록 !== undefined 처리
    if (skill.value !== undefined && skill.type?.includes('attack')) {
      parts.push(`${skill.value}의 피해를 ${skill.multi ? skill.multi + '번 연속 ' : ''}줍니다.`);
    }
    
    if (skill.value !== undefined && skill.type?.includes('defend')) {
      parts.push(`${skill.value}의 방어도를 얻습니다.`);
    }
    
    if (skill.heal) {
      parts.push(`체력을 ${skill.heal} 회복합니다.`);
    }
    
    if (skill.debuff) {
      const debuffMap = {
        weak: '약화', frail: '허약', vulnerable: '취약',
        poison: '중독', mark: '표식', bind: '속박', silence: '침묵'
      };
      const debuffName = debuffMap[skill.debuff] || skill.debuff;
      const turnText = skill.turns ? ` ${skill.turns}` : '';
      parts.push(`적에게 ${debuffName}${turnText}을(를) 부여합니다.`);
    }
    
    if (skill.buff) {
      const buffMap = { strength: '근력' };
      const buffName = buffMap[skill.buff] || skill.buff;
      const amount = skill.buffValue || skill.amount;
      const buffAmountText = amount ? ` ${amount}` : '';
      parts.push(`${buffName}${buffAmountText}을(를) 얻습니다.`);
    }

    return parts.length > 0 ? parts.join(' ') : '특수한 행동을 취합니다.';
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-900 text-white p-4 md:p-10 relative">
      {/* 상단바 */}
      <div className="flex justify-between items-center mb-8 pl-0 md:pl-10">
        <h2 className="text-2xl md:text-3xl font-black flex items-center gap-3 shrink-0">
          <Skull className="w-8 h-8 text-red-500 animate-pulse"/> 
          몬스터 도감
          {/* ✨ 타이틀 옆에 도감 진행도(조우한 수 / 전체 수)를 추가했습니다. */}
          <span className="text-sm md:text-lg text-red-400 ml-2 font-bold tracking-widest">
            ({validSeenEnemies.length}/{allMonsterNames.length})
          </span>
        </h2>
        <div className="flex gap-2">
          <button onClick={toggleFullScreen} className="bg-slate-800 p-2 rounded border border-slate-600 hover:bg-slate-700">
            <Maximize2 className="w-5 h-5"/>
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

             {/* 💡 핵심 추가: 보스의 패시브 스킬이 있을 경우 화면 상단에 렌더링해 줍니다. */}
             {dexViewingEnemy.passives && dexViewingEnemy.passives.length > 0 && (
               <div className="mb-8">
                 <h4 className="text-lg font-bold text-yellow-400 mb-3 border-l-4 border-yellow-500 pl-3">패시브 특성</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                   {dexViewingEnemy.passives.map((passive, pi) => (
                     <div key={pi} className="bg-yellow-900/10 p-4 rounded-xl border border-yellow-700/50 flex flex-col">
                       <span className="font-bold text-yellow-300 mb-1">{passive.name}</span>
                       <span className="text-sm text-slate-300 leading-snug">{passive.desc}</span>
                     </div>
                   ))}
                 </div>
               </div>
             )}
             
             <h4 className="text-lg font-bold text-indigo-400 mb-3 border-l-4 border-indigo-500 pl-3">사용 스킬 패턴</h4>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {dexViewingEnemy.deck.map((skill, si) => (
                 <div key={si} className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                   <div className="flex justify-between items-center mb-2">
                     <span className="font-bold text-indigo-300">{skill.name}</span>
                     {/* 💡 버그 방지: type이 비어있어 발생하는 크래시를 방지하기 위해 옵셔널 체이닝(?.) 적용 */}
                     <span className={`text-[10px] px-2 py-0.5 rounded-full ${skill.type?.includes('attack') ? 'bg-red-900/50 text-red-400' : 'bg-blue-900/50 text-blue-400'}`}>
                       {skill.type?.includes('attack') ? '공격' : '보조'}
                     </span>
                   </div>
                   <p className="text-sm text-slate-400 leading-snug">{getDetailedDescription(skill)}</p>
                 </div>
               ))}
             </div>
          </div>
        </div>
      )}
    </div>
  );
}