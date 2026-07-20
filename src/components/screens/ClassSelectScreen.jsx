import React from 'react';
import { PLAYER_CLASSES } from '../../constants/gameData';
import { Shield, Zap, Info } from 'lucide-react';

export default function ClassSelectScreen({ setGameState, selectedClass, setSelectedClass, saveGame }) {
  const handleSelect = (classId) => {
    setSelectedClass(classId);
    saveGame({ selectedClass: classId });
    setGameState('MENU');
  };

  return (
    <div className="flex flex-col min-h-[100dvh] bg-slate-950 text-white p-4 relative z-50">
      <div className="max-w-4xl w-full mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl md:text-4xl font-black text-indigo-400 drop-shadow-md">✨ 직업(클래스) 선택</h2>
          <button onClick={() => setGameState('MENU')} className="py-2 px-4 bg-slate-800 hover:bg-slate-700 transition-colors rounded-lg font-bold border border-slate-600">돌아가기</button>
        </div>

        <p className="text-slate-300 mb-8 text-center md:text-left">
          다양한 직업을 선택하여 색다른 시너지와 플레이 스타일을 경험해 보세요.<br />
          <span className="text-sm text-slate-500">(모든 직업은 덱 빌더에서 구성한 카드로 시작합니다)</span>
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLAYER_CLASSES.map(cls => {
            const isSelected = selectedClass === cls.id;
            return (
              <div 
                key={cls.id}
                onClick={() => handleSelect(cls.id)}
                className={`relative p-6 rounded-2xl cursor-pointer transition-all duration-300 border-2 overflow-hidden group
                  ${isSelected ? 'border-indigo-500 bg-indigo-950/40 shadow-[0_0_20px_rgba(99,102,241,0.3)] scale-105' : 'border-slate-700 bg-slate-900/50 hover:bg-slate-800 hover:border-slate-500'}
                `}
              >
                {/* Background overlay */}
                <div className={`absolute inset-0 opacity-20 transition-opacity ${isSelected ? 'bg-gradient-to-br from-indigo-600 to-purple-600' : 'group-hover:bg-slate-700'}`} />
                
                <div className="relative z-10 flex flex-col h-full">
                  <h3 className={`text-2xl font-black mb-2 ${isSelected ? 'text-indigo-300' : 'text-slate-200'}`}>
                    {cls.name}
                  </h3>
                  
                  <p className="text-sm text-slate-400 mb-4 flex-1">
                    {cls.desc}
                  </p>

                  <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800 mb-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">기본 체력</span>
                      <span className="font-bold text-red-400">{cls.baseHp}</span>
                    </div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">기본 마나</span>
                      <span className="font-bold text-blue-400">{cls.baseMana}</span>
                    </div>
                    {cls.passive && (
                      <div className="mt-2 pt-2 border-t border-slate-700">
                        <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1"><Zap className="w-3 h-3"/> 패시브</span>
                        <p className="text-xs text-slate-300 mt-1">{cls.passiveDesc}</p>
                      </div>
                    )}
                  </div>

                  <div className="text-center">
                    <button className={`w-full py-2 rounded-lg font-bold transition-all ${isSelected ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-700 text-slate-300 group-hover:bg-slate-600'}`}>
                      {isSelected ? '현재 선택됨' : '선택하기'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
