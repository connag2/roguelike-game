import React from 'react';

export default function TierEffects({ playEffect }) {
  if (!playEffect) return null;

  // ✨ 타수(Hits)만큼 찰진 검기를 렌더링하는 함수 (여기서만 관리합니다)
  const renderSlashes = (hits, colorClass) => {
    return Array.from({ length: hits }).map((_, i) => {
      const rot = (i % 2 === 0 ? 25 : -25) + (Math.random() * 20 - 10);
      return (
        <div key={i} className="absolute inset-0 flex items-center justify-center pointer-events-none z-[10000]" style={{ transform: `rotate(${rot}deg)` }}>
           <div 
             className={`w-[150vw] h-[20px] md:h-[40px] ${colorClass} slash-line blur-[1px]`} 
             style={{ animationDelay: `${i * 120}ms` }} 
           />
        </div>
      );
    });
  };

  return (
    <>
      {/* 💥 [일반/희귀] 타수 비례 다단히트 */}
      {playEffect.name === 'common_attack' && renderSlashes(playEffect.hits, 'bg-white shadow-[0_0_15px_white]')}
      {playEffect.name === 'uncommon_attack' && renderSlashes(playEffect.hits, 'bg-cyan-300 shadow-[0_0_15px_cyan]')}
      
      {/* 💥 [전설] */}
      {playEffect.name === 'rare' && (
        <div className="fixed inset-0 z-[9999] pointer-events-none flex items-center justify-center mix-blend-screen">
          <div className="absolute inset-0 bg-yellow-600/10 border-[15px] border-yellow-400/60 animate-[ping_0.5s_ease-out_1]"></div>
          {renderSlashes(playEffect.hits, 'bg-yellow-400 shadow-[0_0_30px_yellow]')}
          <div className="text-[5rem] md:text-[8rem] text-yellow-300 font-black drop-shadow-[0_0_50px_yellow] animate-bounce tracking-widest z-10">⚡ CRITICAL ⚡</div>
        </div>
      )}
      
      {/* 💥 [특수] */}
      {playEffect.name === 'special' && (
        <div className="fixed inset-0 z-[9999] pointer-events-none flex items-center justify-center">
          <div className="absolute w-[150vw] h-[150vw] md:w-[100vw] md:h-[100vh] bg-[radial-gradient(circle,rgba(217,70,239,0.4)_0%,transparent_60%)] animate-pulse"></div>
          {renderSlashes(playEffect.hits, 'bg-fuchsia-400 shadow-[0_0_30px_fuchsia]')}
          <div className="text-[4rem] md:text-[7rem] text-fuchsia-300 font-black drop-shadow-[0_0_50px_fuchsia] animate-ping z-10">✨ EX SKILL ✨</div>
        </div>
      )}
      
      {/* 💥 [신화] */}
      {playEffect.name === 'mythic' && (
        <div className="fixed inset-0 z-[9999] pointer-events-none flex items-center justify-center mix-blend-color-dodge">
          <div className="absolute inset-0 bg-red-950/40"></div>
          {renderSlashes(playEffect.hits, 'bg-red-500 shadow-[0_0_40px_red]')}
          <h1 className="text-[6rem] md:text-[10rem] text-red-500 font-black drop-shadow-[0_0_50px_red] animate-pulse z-10">신화의 일격!</h1>
        </div>
      )}
    </>
  );
}