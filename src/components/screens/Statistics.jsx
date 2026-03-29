import React from 'react';
import { BarChart2, Trophy, Skull, BookOpen, Coins, Star } from 'lucide-react';
import { CARD_LIBRARY, ENEMIES, NORMAL_BOSSES, SPECIAL_BOSSES } from '../../constants/gameData';

export default function Statistics({
  maxStageReached,
  normalCleared,
  seenEnemies,
  unlockedCards,
  credits,
  setGameState
}) {
  const totalCards = CARD_LIBRARY?.length || 0;
  const totalEnemies = (ENEMIES?.length || 0) + (NORMAL_BOSSES?.length || 0) + Object.keys(SPECIAL_BOSSES || {}).length;

  return (
    <div className="flex flex-col min-h-[100dvh] bg-slate-900 text-white p-6 md:p-10 relative">
      <div className="flex justify-between items-center mb-10 w-full max-w-4xl mx-auto pt-10 md:pt-0">
        <h2 className="text-3xl md:text-4xl font-black flex items-center gap-3 text-indigo-400">
          <BarChart2 className="w-10 h-10"/> 게임 통계
        </h2>
        <button onClick={() => setGameState('MENU')} className="py-2 px-6 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-bold shadow-lg transition-all">메인으로</button>
      </div>

      <div className="w-full max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6 overflow-y-auto hide-scrollbar pb-10">
        {/* 1. 최고 도달 층수 */}
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl flex items-center gap-4 transform transition-all hover:scale-105">
          <div className="p-4 bg-blue-900/50 rounded-full border border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.4)]">
            <Star className="w-8 h-8 text-blue-400"/>
          </div>
          <div>
            <p className="text-slate-400 text-sm font-bold mb-1">최고 도달 층수</p>
            <p className="text-3xl font-black text-white">{maxStageReached} <span className="text-lg text-slate-500 font-normal">층</span></p>
          </div>
        </div>

        {/* 2. 일반 모드 클리어 */}
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl flex items-center gap-4 transform transition-all hover:scale-105">
          <div className={`p-4 rounded-full border ${normalCleared ? 'bg-yellow-900/50 border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.4)]' : 'bg-slate-900/50 border-slate-600'}`}>
            <Trophy className={`w-8 h-8 ${normalCleared ? 'text-yellow-400' : 'text-slate-600'}`}/>
          </div>
          <div>
            <p className="text-slate-400 text-sm font-bold mb-1">일반 모드 (100층) 클리어</p>
            <p className={`text-2xl font-black ${normalCleared ? 'text-yellow-400' : 'text-slate-500'}`}>{normalCleared ? '달성 완료!' : '미달성'}</p>
          </div>
        </div>

        {/* 3. 해금한 카드 (진척도) */}
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl flex items-center gap-4 sm:col-span-2 transform transition-all hover:scale-[1.02]">
          <div className="p-4 bg-emerald-900/50 rounded-full border border-emerald-500">
            <BookOpen className="w-8 h-8 text-emerald-400"/>
          </div>
          <div className="w-full pl-2">
            <div className="flex justify-between items-end mb-2">
              <p className="text-slate-300 font-bold">해금된 카드</p>
              <p className="text-2xl font-black text-white">{unlockedCards.length} <span className="text-sm text-slate-500 font-bold">/ {totalCards}</span></p>
            </div>
            <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-700 relative">
              <div className="bg-emerald-500 h-full transition-all duration-1000" style={{ width: `${totalCards > 0 ? (unlockedCards.length / totalCards) * 100 : 0}%` }} />
            </div>
          </div>
        </div>

        {/* 4. 조우한 적 (진척도) */}
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl flex items-center gap-4 sm:col-span-2 transform transition-all hover:scale-[1.02]">
          <div className="p-4 bg-red-900/50 rounded-full border border-red-500">
            <Skull className="w-8 h-8 text-red-400"/>
          </div>
          <div className="w-full pl-2">
            <div className="flex justify-between items-end mb-2">
              <p className="text-slate-300 font-bold">도감 발견율 (적)</p>
              <p className="text-2xl font-black text-white">{seenEnemies.length} <span className="text-sm text-slate-500 font-bold">/ {totalEnemies}</span></p>
            </div>
            <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-700 relative">
              <div className="bg-red-500 h-full transition-all duration-1000" style={{ width: `${totalEnemies > 0 ? (seenEnemies.length / totalEnemies) * 100 : 0}%` }} />
            </div>
          </div>
        </div>

        {/* 5. 누적 크레딧 */}
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl flex items-center gap-4 sm:col-span-2 transform transition-all hover:scale-[1.02]">
          <div className="p-4 bg-amber-900/50 rounded-full border border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
            <Coins className="w-8 h-8 text-amber-400"/>
          </div>
          <div>
            <p className="text-slate-400 text-sm font-bold mb-1">현재 보유 크레딧</p>
            <p className="text-3xl font-black text-amber-400">{credits.toLocaleString()} <span className="text-lg text-slate-500 font-normal">C</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}