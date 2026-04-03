import React, { useState } from 'react';
import { Activity, Skull, Coins, Award, Target, Trophy, Flame, Gamepad2, Crown, Zap, Star, Swords, Gift, CheckCircle } from 'lucide-react';
import { CARD_LIBRARY, ENEMIES, NORMAL_BOSSES, SPECIAL_BOSSES, HARD_MODE_BOSSES } from '../../constants/gameData';
import { RELIC_LIBRARY } from '../../constants/relicData';

export default function Statistics({
  maxStageReached, normalCleared, seenEnemies, unlockedCards, credits, unlockedRelics, gameStats, setGameState,
  claimedMilestones = [], // ✨ 추가: 수령한 보상 목록 (App.jsx에서 관리해야 함)
  handleClaimMilestone // ✨ 추가: 보상 수령 함수
}) {
  
  // 적 카드 종류 개수 계산
  const enemyCardsMap = {};
  const allEnemies = [ ...NORMAL_BOSSES, ...(HARD_MODE_BOSSES || []), ...Object.values(SPECIAL_BOSSES) ];
  allEnemies.forEach(enemy => {
    if (enemy?.deck) enemy.deck.forEach(c => { enemyCardsMap[c.name] = true; });
  });
  const enemyCardCount = Object.keys(enemyCardsMap).length;

  const totalCards = CARD_LIBRARY.length + enemyCardCount;
  const cardCompletion = ((unlockedCards.length / totalCards) * 100).toFixed(1);

  const totalEnemyCount = ENEMIES.length + NORMAL_BOSSES.length + (HARD_MODE_BOSSES ? HARD_MODE_BOSSES.length : 0) + Object.keys(SPECIAL_BOSSES).length;
  const enemyCompletion = ((seenEnemies.length / totalEnemyCount) * 100).toFixed(1);

  const relicCompletion = ((unlockedRelics.length / RELIC_LIBRARY.length) * 100).toFixed(1);

  const safeGameStats = {
    totalKills: gameStats?.totalKills || 0,
    totalBossKills: gameStats?.totalBossKills || 0,
    totalCreditsEarned: gameStats?.totalCreditsEarned || 0,
    totalRuns: gameStats?.totalRuns || 0
  };

  // ✨ 업적 대폭 추가 (쉬운 것 -> 어려운 것 순서)
  const ACHIEVEMENTS = [
    // [전투/처치]
    { id: 'kill_1', title: '첫 피', desc: '첫 번째 적을 처치하세요.', condition: safeGameStats.totalKills >= 1, icon: '🗡️', bg: 'from-red-900 to-red-700', border: 'border-red-500' },
    { id: 'kill_100', title: '학살자', desc: '적을 누적 100명 처치하세요.', condition: safeGameStats.totalKills >= 100, icon: '🩸', bg: 'from-red-800 to-rose-700', border: 'border-rose-500' },
    { id: 'kill_1000', title: '사신', desc: '적을 누적 1,000명 처치하세요.', condition: safeGameStats.totalKills >= 1000, icon: '☠️', bg: 'from-neutral-900 to-red-950', border: 'border-red-600' },
    
    // [보스 처치]
    { id: 'boss_1', title: '초보 사냥꾼', desc: '보스를 1회 처치하세요.', condition: safeGameStats.totalBossKills >= 1, icon: '👹', bg: 'from-orange-900 to-orange-700', border: 'border-orange-500' },
    { id: 'boss_10', title: '숙련된 사냥꾼', desc: '보스를 누적 10회 처치하세요.', condition: safeGameStats.totalBossKills >= 10, icon: '🏹', bg: 'from-purple-900 to-purple-700', border: 'border-purple-500' },
    { id: 'boss_50', title: '괴물 사냥꾼', desc: '보스를 누적 50회 처치하세요.', condition: safeGameStats.totalBossKills >= 50, icon: '🐲', bg: 'from-fuchsia-900 to-purple-800', border: 'border-fuchsia-500' },
    
    // [재화/크레딧]
    { id: 'rich_1', title: '저축의 시작', desc: '누적 1,000 크레딧을 모으세요.', condition: safeGameStats.totalCreditsEarned >= 1000, icon: '🪙', bg: 'from-yellow-900 to-yellow-700', border: 'border-yellow-500' },
    { id: 'rich_2', title: '자본주의', desc: '누적 10,000 크레딧을 모으세요.', condition: safeGameStats.totalCreditsEarned >= 10000, icon: '💰', bg: 'from-emerald-900 to-emerald-700', border: 'border-emerald-500' },
    { id: 'rich_3', title: '만수르', desc: '누적 100,000 크레딧을 모으세요.', condition: safeGameStats.totalCreditsEarned >= 100000, icon: '💎', bg: 'from-cyan-900 to-blue-800', border: 'border-cyan-400' },
    
    // [진행도/층수]
    { id: 'stage_10', title: '여정의 시작', desc: '10층에 도달하세요.', condition: maxStageReached >= 10, icon: '🚶', bg: 'from-stone-700 to-stone-500', border: 'border-stone-400' },
    { id: 'stage_50', title: '반환점', desc: '50층에 도달하세요.', condition: maxStageReached >= 50, icon: '🚩', bg: 'from-blue-900 to-blue-700', border: 'border-blue-500' },
    { id: 'stage_100', title: '정복자', desc: '100층을 클리어하세요.', condition: normalCleared, icon: '👑', bg: 'from-amber-600 to-yellow-500', border: 'border-yellow-300' },
    { id: 'stage_200', title: '심연 탐험가', desc: '200층에 도달하세요.', condition: maxStageReached >= 200, icon: '🌌', bg: 'from-indigo-950 to-purple-900', border: 'border-indigo-400' },
    { id: 'stage_300', title: '신을 넘어선 자', desc: '300층에 도달하세요.', condition: maxStageReached >= 300, icon: '✨', bg: 'from-slate-900 to-black', border: 'border-slate-500' },
    
    // [수집/도감]
    { id: 'relic_5', title: '호기심 많은 수집가', desc: '유물을 5개 이상 해금하세요.', condition: unlockedRelics.length >= 5, icon: '🏺', bg: 'from-stone-800 to-stone-600', border: 'border-stone-400' },
    { id: 'relic_20', title: '골동품 애호가', desc: '유물을 20개 이상 해금하세요.', condition: unlockedRelics.length >= 20, icon: '🎭', bg: 'from-orange-900 to-orange-600', border: 'border-orange-400' },
    { id: 'relic_all', title: '인디아나 존스', desc: '모든 유물을 해금하세요.', condition: unlockedRelics.length >= RELIC_LIBRARY.length, icon: '🤠', bg: 'from-amber-900 to-orange-700', border: 'border-yellow-400' },
    { id: 'card_50', title: '카드 수집가', desc: '도감의 카드를 50% 이상 해금하세요.', condition: unlockedCards.length >= (totalCards * 0.5), icon: '🎴', bg: 'from-blue-900 to-cyan-800', border: 'border-cyan-500' },
    { id: 'card_all', title: '카드 마스터', desc: '모든 카드를 해금하세요.', condition: unlockedCards.length >= totalCards, icon: '🃏', bg: 'from-indigo-900 to-blue-700', border: 'border-blue-400' },
    
    // [도전/다회차]
    { id: 'run_1', title: '첫 번째 죽음', desc: '게임을 1회 플레이하세요.', condition: safeGameStats.totalRuns >= 1, icon: '🌱', bg: 'from-green-900 to-green-700', border: 'border-green-500' },
    { id: 'run_10', title: '베테랑', desc: '게임을 누적 10회 플레이하세요.', condition: safeGameStats.totalRuns >= 10, icon: '🎖️', bg: 'from-slate-800 to-slate-600', border: 'border-slate-400' },
    { id: 'run_50', title: '불굴의 의지', desc: '게임을 누적 50회 플레이하세요.', condition: safeGameStats.totalRuns >= 50, icon: '🔥', bg: 'from-red-950 to-orange-800', border: 'border-red-500' },
    { id: 'run_100', title: '망령', desc: '게임을 누적 100회 플레이하세요.', condition: safeGameStats.totalRuns >= 100, icon: '👻', bg: 'from-zinc-800 to-zinc-600', border: 'border-zinc-300' },
  ];

  const unlockedAchievementsCount = ACHIEVEMENTS.filter(a => a.condition).length;

  // ✨ 업적 마일스톤 (달성도 보상)
  const MILESTONES = [
    { required: 5, rewardDesc: '1,000 크레딧', rewardAmount: 1000 },
    { required: 10, rewardDesc: '5,000 크레딧', rewardAmount: 5000 },
    { required: 15, rewardDesc: '10,000 크레딧', rewardAmount: 10000 },
    { required: 20, rewardDesc: '30,000 크레딧', rewardAmount: 30000 },
    { required: ACHIEVEMENTS.length, rewardDesc: '100,000 크레딧', rewardAmount: 100000 },
  ];

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
      
      {/* (기존 종합 요약 및 수집/조우 달성률 UI - 그대로 유지) */}
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

      {/* ✨ 추가된 마일스톤(업적 보상) 섹션 */}
      <div className="w-full max-w-6xl bg-gradient-to-r from-amber-900/40 to-orange-900/40 p-6 md:p-8 rounded-3xl border border-amber-700 shadow-2xl mb-10 shrink-0">
        <div className="flex items-center gap-3 border-b border-amber-700/50 pb-4 mb-6">
          <Gift className="text-amber-400 w-8 h-8" />
          <h2 className="text-2xl font-bold text-amber-100">업적 달성 보상</h2>
        </div>
        
        <div className="flex flex-col gap-4">
          {MILESTONES.map((ms, index) => {
            const isUnlocked = unlockedAchievementsCount >= ms.required;
            const isClaimed = claimedMilestones.includes(ms.required);
            
            return (
              <div key={index} className={`flex flex-col md:flex-row justify-between items-center p-4 rounded-xl border ${isUnlocked && !isClaimed ? 'bg-amber-900/60 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'bg-slate-900/80 border-slate-700'} transition-all`}>
                <div className="flex items-center gap-4 mb-3 md:mb-0 w-full md:w-auto">
                  <div className="text-xl font-black text-white bg-slate-800 w-12 h-12 flex justify-center items-center rounded-full border border-slate-600 shrink-0">
                    {ms.required}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-200">업적 {ms.required}개 달성</h3>
                    <p className="text-amber-400 font-medium">보상: {ms.rewardDesc}</p>
                  </div>
                </div>
                
                <div className="w-full md:w-auto flex justify-end">
                  {isClaimed ? (
                    <div className="flex items-center gap-2 text-emerald-400 font-bold px-4 py-2">
                      <CheckCircle className="w-5 h-5" /> 수령 완료
                    </div>
                  ) : isUnlocked ? (
                    <button 
                      onClick={() => handleClaimMilestone(ms.required, ms.rewardAmount)}
                      className="w-full md:w-auto bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-white font-bold py-2 px-6 rounded-xl shadow-lg transform hover:-translate-y-1 transition-all animate-pulse"
                    >
                      보상 수령
                    </button>
                  ) : (
                    <button disabled className="w-full md:w-auto bg-slate-800 text-slate-500 font-bold py-2 px-6 rounded-xl border border-slate-700 cursor-not-allowed">
                      조건 미달성
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 기존 업적 갤러리 */}
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