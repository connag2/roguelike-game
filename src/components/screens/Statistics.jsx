import React from 'react';
import { Activity, Skull, Coins, Award, Target, Trophy, Flame, Gamepad2, Crown, Zap, Star, Swords } from 'lucide-react';
// ✨ HARD_MODE_BOSSES 임포트 추가
import { CARD_LIBRARY, ENEMIES, NORMAL_BOSSES, SPECIAL_BOSSES, HARD_MODE_BOSSES } from '../../constants/gameData';
import { RELIC_LIBRARY } from '../../constants/relicData';

export default function Statistics({
  maxStageReached, normalCleared, seenEnemies, unlockedCards, credits, unlockedRelics, gameStats, setGameState 
}) {
  
  // ✨ 적 카드 종류 개수를 계산합니다.
  const enemyCardsMap = {};
  const allEnemies = [ 
    ...ENEMIES, 
    ...NORMAL_BOSSES, 
    ...(HARD_MODE_BOSSES || []), 
    ...Object.values(SPECIAL_BOSSES) 
  ];
  
  allEnemies.forEach(enemy => {
    if (enemy?.deck) {
      enemy.deck.forEach(c => {
        if (!enemyCardsMap[c.name]) {
          enemyCardsMap[c.name] = true;
        }
      });
    }
  });
  const enemyCardCount = Object.keys(enemyCardsMap).length;

  // ✨ 총 카드 수에 적 카드 개수(enemyCardCount)를 더해줍니다.
  const totalCards = CARD_LIBRARY.length + enemyCardCount;
  const cardCompletion = ((unlockedCards.length / totalCards) * 100).toFixed(1);

  // 몬스터 총 마릿수 계산 (하드모드 보스 포함)
  const totalEnemyCount = ENEMIES.length + NORMAL_BOSSES.length + (HARD_MODE_BOSSES ? HARD_MODE_BOSSES.length : 0) + Object.keys(SPECIAL_BOSSES).length;
  const enemyCompletion = ((seenEnemies.length / totalEnemyCount) * 100).toFixed(1);

  const relicCompletion = ((unlockedRelics.length / RELIC_LIBRARY.length) * 100).toFixed(1);

  const safeGameStats = {
    totalKills: gameStats?.totalKills || 0,
    totalBossKills: gameStats?.totalBossKills || 0,
    totalCreditsEarned: gameStats?.totalCreditsEarned || 0,
    totalRuns: gameStats?.totalRuns || 0
  };

  const ACHIEVEMENTS = [
    { id: 'first_blood', title: '첫 피', desc: '첫 번째 적을 처치하세요.', condition: safeGameStats.totalKills >= 1, icon: '🗡️', bg: 'from-red-900 to-red-700', border: 'border-red-500' },
    { id: 'boss_slayer_1', title: '초보 사냥꾼', desc: '보스를 1회 처치하세요.', condition: safeGameStats.totalBossKills >= 1, icon: '👹', bg: 'from-orange-900 to-orange-700', border: 'border-orange-500' },
    { id: 'boss_slayer_2', title: '숙련된 사냥꾼', desc: '보스를 10회 처치하세요.', condition: safeGameStats.totalBossKills >= 10, icon: '💀', bg: 'from-purple-900 to-purple-700', border: 'border-purple-500' },
    { id: 'rich_1', title: '자본주의', desc: '누적 1,000 크레딧을 모으세요.', condition: safeGameStats.totalCreditsEarned >= 1000, icon: '💰', bg: 'from-yellow-900 to-yellow-700', border: 'border-yellow-500' },
    { id: 'rich_2', title: '만수르', desc: '누적 10,000 크레딧을 모으세요.', condition: safeGameStats.totalCreditsEarned >= 10000, icon: '💎', bg: 'from-cyan-900 to-cyan-700', border: 'border-cyan-500' },
    { id: 'stage_50', title: '반환점', desc: '50층에 도달하세요.', condition: maxStageReached >= 50, icon: '🚩', bg: 'from-emerald-900 to-emerald-700', border: 'border-emerald-500' },
    { id: 'stage_100', title: '정복자', desc: '100층을 클리어하세요.', condition: normalCleared, icon: '👑', bg: 'from-amber-600 to-yellow-500', border: 'border-yellow-300' },
    { id: 'relic_collector_1', title: '유물 수집가', desc: '유물을 5개 이상 해금하세요.', condition: unlockedRelics.length >= 5, icon: '🏺', bg: 'from-stone-800 to-stone-600', border: 'border-stone-400' },
    { id: 'relic_collector_2', title: '인디아나 존스', desc: '모든 유물을 해금하세요.', condition: unlockedRelics.length >= RELIC_LIBRARY.length, icon: '🤠', bg: 'from-amber-900 to-orange-700', border: 'border-orange-400' },
    { id: 'card_collector', title: '카드 마스터', desc: '모든 카드를 해금하세요.', condition: unlockedCards.length >= totalCards, icon: '🃏', bg: 'from-indigo-900 to-blue-700', border: 'border-blue-400' },
    { id: 'veteran', title: '베테랑', desc: '게임을 10회 이상 시작하세요.', condition: safeGameStats.totalRuns >= 10, icon: '🎖️', bg: 'from-slate-800 to-slate-600', border: 'border-slate-400' },
    { id: 'die_hard', title: '불굴의 의지', desc: '게임을 50회 이상 시작하세요.', condition: safeGameStats.totalRuns >= 50, icon: '🔥', bg: 'from-red-950 to-orange-800', border: 'border-red-500' },
  ];

  const unlockedAchievementsCount = ACHIEVEMENTS.filter(a => a.condition).length;

  return (
    <div className="flex flex-col items-center justify-start min-h-[100dvh] bg-slate-900 text-white p-4 md:p-8 pt-8 overflow-y-auto hide-scrollbar relative">
      <div className="w-full max-w-6xl flex justify-between items-center mb-8 shrink-0 relative z-10">
        <h1 className="text-3xl md:text-5xl font-black text-indigo-400 drop-shadow-lg flex items-center gap-3">
          <Activity className="w-8 h-8 md:w-12 md:h-12" /> 플레이어 기록실
        </h1>
        <button onClick={() => setGameState('MENU')} className="py-2 px-6 md:py-3 md:px-8 bg-slate-700 hover:bg-slate-600 border border-slate-500 rounded-xl font-bold md:text-xl shadow-lg transition-all hover:-translate-y-1 flex items-center gap-2">
          메인으로
        </button>
      </div>
      
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10 shrink-0">
        <div className="lg:col-span-4 bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-2xl flex flex-col gap-4">
          <div className="flex items-center gap-3 border-b border-slate-600 pb-3 mb-2">
            <Trophy className="w-8 h-8 text-yellow-400" />
            <h2 className="text-2xl font-bold text-white">종합 요약</h2>
          </div>
          
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 flex justify-between items-center hover:border-yellow-500 transition-colors">
            <div className="flex items-center gap-3"><Award className="text-yellow-400 w-6 h-6"/><span className="font-bold text-slate-300">최고 층수</span></div>
            <span className="text-2xl font-black text-white">{maxStageReached} 층</span>
          </div>
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 flex justify-between items-center hover:border-emerald-500 transition-colors">
            <div className="flex items-center gap-3"><Crown className="text-emerald-400 w-6 h-6"/><span className="font-bold text-slate-300">정복(100층) 여부</span></div>
            <span className={`text-lg font-black ${normalCleared ? 'text-emerald-400 drop-shadow' : 'text-slate-500'}`}>{normalCleared ? '완료' : '미달성'}</span>
          </div>
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 flex justify-between items-center hover:border-blue-400 transition-colors">
            <div className="flex items-center gap-3"><Gamepad2 className="text-blue-400 w-6 h-6"/><span className="font-bold text-slate-300">총 플레이 횟수</span></div>
            <span className="text-2xl font-black text-white">{safeGameStats.totalRuns} 회</span>
          </div>
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 flex justify-between items-center hover:border-red-500 transition-colors">
            <div className="flex items-center gap-3"><Skull className="text-red-500 w-6 h-6"/><span className="font-bold text-slate-300">누적 처치 (적/보스)</span></div>
            <span className="text-xl font-black text-white">{safeGameStats.totalKills} / {safeGameStats.totalBossKills}</span>
          </div>
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 flex justify-between items-center hover:border-amber-400 transition-colors">
            <div className="flex items-center gap-3"><Coins className="text-amber-400 w-6 h-6"/><span className="font-bold text-slate-300">누적 획득 크레딧</span></div>
            <span className="text-2xl font-black text-yellow-300">{safeGameStats.totalCreditsEarned.toLocaleString()}</span>
          </div>
        </div>

        <div className="lg:col-span-8 bg-slate-800 p-6 md:p-8 rounded-3xl border border-slate-700 shadow-2xl flex flex-col justify-center">
          <div className="flex items-center gap-3 border-b border-slate-600 pb-3 mb-6">
            <Target className="text-red-400 w-8 h-8" />
            <h2 className="text-2xl font-bold text-white">수집 및 조우 달성률</h2>
          </div>

          <div className="space-y-8">
             <div>
               <div className="flex justify-between text-lg font-bold mb-2">
                 <span className="flex items-center gap-2"><Zap className="w-5 h-5 text-indigo-400"/> 카드 도감 해금</span>
                 <span className="text-indigo-300">{unlockedCards.length} / {totalCards} ({cardCompletion}%)</span>
               </div>
               <div className="w-full bg-slate-900 h-5 rounded-full overflow-hidden border border-slate-700 shadow-inner">
                 <div className="bg-gradient-to-r from-indigo-700 to-indigo-400 h-full transition-all duration-1000" style={{ width: `${cardCompletion}%` }}></div>
               </div>
             </div>
             <div>
               <div className="flex justify-between text-lg font-bold mb-2">
                 <span className="flex items-center gap-2"><Star className="w-5 h-5 text-amber-400"/> 유물 도감 해금</span>
                 <span className="text-amber-300">{unlockedRelics.length} / {RELIC_LIBRARY.length} ({relicCompletion}%)</span>
               </div>
               <div className="w-full bg-slate-900 h-5 rounded-full overflow-hidden border border-slate-700 shadow-inner">
                 <div className="bg-gradient-to-r from-amber-700 to-amber-400 h-full transition-all duration-1000" style={{ width: `${relicCompletion}%` }}></div>
               </div>
             </div>
             <div>
               <div className="flex justify-between text-lg font-bold mb-2">
                 <span className="flex items-center gap-2"><Swords className="w-5 h-5 text-red-400"/> 조우한 몬스터</span>
                 <span className="text-red-300">{seenEnemies.length} / {totalEnemyCount} ({enemyCompletion}%)</span>
               </div>
               <div className="w-full bg-slate-900 h-5 rounded-full overflow-hidden border border-slate-700 shadow-inner">
                 <div className="bg-gradient-to-r from-red-700 to-red-400 h-full transition-all duration-1000" style={{ width: `${enemyCompletion}%` }}></div>
               </div>
             </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-6xl bg-slate-800 p-6 md:p-8 rounded-3xl border border-slate-700 shadow-2xl mb-10 shrink-0">
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-600 pb-4 mb-6 gap-4">
          <div className="flex items-center gap-3">
            <Flame className="text-orange-500 w-8 h-8" />
            <h2 className="text-2xl font-bold text-white">업적 갤러리</h2>
          </div>
          <div className="text-slate-400 font-bold bg-slate-900 px-4 py-2 rounded-xl border border-slate-700 shadow-inner">
            달성도: <span className="text-orange-400 text-xl">{unlockedAchievementsCount}</span> / {ACHIEVEMENTS.length}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {ACHIEVEMENTS.map(ach => {
            const isUnlocked = ach.condition;
            return (
              <div 
                key={ach.id} 
                className={`relative p-4 rounded-2xl border-2 transition-all duration-500 overflow-hidden group 
                  ${isUnlocked ? `bg-gradient-to-br ${ach.bg} ${ach.border} shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:-translate-y-1 hover:shadow-xl` : 'bg-slate-900 border-slate-800 opacity-60 grayscale hover:grayscale-0 hover:opacity-100'}`}
              >
                {isUnlocked && <div className="absolute -right-4 -bottom-4 text-6xl opacity-20 pointer-events-none transform -rotate-12 group-hover:scale-110 transition-transform">{ach.icon}</div>}
                
                <div className="flex items-center gap-3 mb-2 relative z-10">
                  <div className={`w-12 h-12 flex justify-center items-center text-3xl bg-black/30 rounded-xl shadow-inner border border-white/10 shrink-0`}>
                    {isUnlocked ? ach.icon : '🔒'}
                  </div>
                  <div>
                    <h3 className={`font-black text-base md:text-lg leading-tight ${isUnlocked ? 'text-white drop-shadow-md' : 'text-slate-400'}`}>
                      {ach.title}
                    </h3>
                    <div className={`text-[10px] md:text-xs font-bold mt-0.5 ${isUnlocked ? 'text-amber-200' : 'text-slate-500'}`}>
                      {isUnlocked ? '달성 완료!' : '미달성'}
                    </div>
                  </div>
                </div>
                
                <p className={`text-xs mt-2 relative z-10 break-keep ${isUnlocked ? 'text-slate-100' : 'text-slate-500'}`}>
                  {ach.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}