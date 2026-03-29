import React from 'react';
import { Skull, Maximize, Heart, Zap, Sword } from 'lucide-react';
import Tooltip from '../common/Tooltip';
import { ENEMIES, NORMAL_BOSSES, SPECIAL_BOSSES } from '../../constants/gameData';

export default function MonsterDex({
  seenEnemies,
  dexViewingEnemy,
  setDexViewingEnemy,
  toggleFullScreen,
  setGameState
}) {
  // 모든 몬스터 목록 합치기
  const allMonsters = [
    ...ENEMIES.map(e => ({ ...e, isBoss: false, hint: "일반 스테이지에서 무작위로 등장합니다." })),
    ...NORMAL_BOSSES.map((b, i) => ({ ...b, isBoss: true, hint: `${(i+1)*5}층 등에서 등장하는 강력 보스` })),
    { ...SPECIAL_BOSSES[25], isBoss: true, hint: "25층에서 등장하는 특수 보스" },
    { ...SPECIAL_BOSSES[50], isBoss: true, hint: "50층에서 등장하는 특수 보스" },
    { ...SPECIAL_BOSSES[75], isBoss: true, hint: "75층에서 등장하는 특수 보스" },
    { ...SPECIAL_BOSSES[100], isBoss: true, hint: "100층을 지키는 최종 보스" },
  ];

  return (
    <div className="flex flex-col min-h-[100dvh] bg-slate-900 text-white pt-16 md:pt-4 p-4 md:p-10 relative">
      <button onClick={toggleFullScreen} className="fixed top-4 left-4 z-50 flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded text-sm font-bold border border-slate-600">
        <Maximize className="w-4 h-4"/> <span className="hidden md:inline">전체화면</span>
      </button>
      
      <div className="flex justify-between items-center mb-8 pl-0 md:pl-32">
        <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
          <Skull className="w-8 h-8 text-red-400"/> 몬스터 도감
        </h2>
        <button onClick={() => setGameState('MENU')} className="py-2 px-4 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-bold shadow-md">메인으로</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 overflow-y-auto hide-scrollbar pb-10 w-full max-w-6xl mx-auto px-2">
        {allMonsters.map((monster, idx) => {
          const isSeen = seenEnemies.includes(monster.name);
          return (
            <div 
              key={idx} 
              onClick={() => isSeen && setDexViewingEnemy(monster)} 
              className={`p-5 rounded-xl border-2 flex flex-col relative transition-all min-h-[280px] shadow-lg group ${isSeen ? 'cursor-pointer hover:-translate-y-2 hover:shadow-white/10 ' + (monster.isBoss ? 'border-red-500 bg-red-950/40' : 'border-slate-600 bg-slate-800') : 'border-slate-800 bg-slate-900'}`}
            >
              {isSeen ? (
                <>
                  <div className="flex items-center gap-4 mb-4 border-b border-slate-700 pb-4">
                    <Skull className={`w-10 h-10 md:w-12 md:h-12 ${monster.isBoss ? 'text-red-400' : 'text-slate-300'}`} />
                    <div>
                      <div className={`font-black text-xl ${monster.isBoss ? 'text-red-300' : 'text-white'}`}>{monster.name}</div>
                      <div className="text-sm text-slate-400 mt-1">기본 체력: {monster.baseHp}</div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-slate-300 mb-2">사용 스킬:</div>
                    <div className="flex flex-wrap gap-2">
                      {monster.deck.map((skill, i) => (
                        <span key={i} className="text-xs font-bold bg-slate-700 text-slate-200 px-2.5 py-1.5 rounded relative tooltip-trigger cursor-help">
                          {skill.name}
                          <Tooltip desc={skill.desc} />
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl backdrop-blur-sm">
                    <span className="bg-indigo-600 text-white font-bold px-5 py-2.5 rounded-full shadow-lg">상세 정보 보기</span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full opacity-60">
                  <Skull className="w-16 h-16 text-slate-600 blur-sm mb-4" />
                  <h3 className="text-xl font-black text-slate-500 tracking-widest mb-3">???</h3>
                  <p className="text-sm text-slate-400 text-center px-4">{monster.hint}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* 몬스터 상세 모달 */}
      {dexViewingEnemy && (
        <div className="fixed inset-0 bg-black/85 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setDexViewingEnemy(null)}>
          <div className="bg-slate-800 p-6 rounded-2xl border-2 border-slate-600 w-full max-w-4xl max-h-[90vh] flex flex-col animate-draw shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 border-b border-slate-600 pb-4">
              <div className="flex items-center gap-3">
                <Skull className={`w-10 h-10 ${dexViewingEnemy.isBoss ? 'text-red-400' : 'text-slate-300'}`} />
                <h3 className={`text-3xl font-black ${dexViewingEnemy.isBoss ? 'text-red-400' : 'text-white'}`}>{dexViewingEnemy.name}</h3>
              </div>
              <button onClick={() => setDexViewingEnemy(null)} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-bold border border-slate-500">닫기</button>
            </div>
            <div className="overflow-y-auto hide-scrollbar flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {dexViewingEnemy.deck.map((eCard, idx) => (
                  <div key={idx} className={`p-5 rounded-2xl border-2 flex flex-col justify-between shadow-lg ${eCard.type.includes('attack') ? 'border-red-500/50 bg-red-950/30' : 'border-blue-500/50 bg-blue-950/30'}`}>
                    <div className="font-black text-xl mb-3 text-white">{eCard.name}</div>
                    <div className="text-sm text-slate-200 bg-black/60 p-3 rounded-xl relative border border-slate-700/50">
                      {eCard.desc} <Tooltip desc={eCard.desc} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}