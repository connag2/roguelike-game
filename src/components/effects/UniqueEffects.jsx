import React from 'react';

export default function UniqueEffects({ playEffect }) {
  if (!playEffect) return null;

  return (
    <>
      {/* 🩸 [흡혈] (뱀파이어 계열) */}
      {playEffect.name === 'vampire' && (
        <div className="fixed inset-0 z-[9999] pointer-events-none flex items-center justify-center bg-red-950/60 overflow-hidden mix-blend-multiply">
          <div className="w-[200vw] h-[20vh] bg-red-600 blur-2xl animate-bounce shadow-[0_0_100px_red] opacity-70"></div>
          <h1 className="absolute text-[5rem] md:text-[8rem] text-red-500 font-black drop-shadow-[0_0_20px_black] tracking-widest scale-125 animate-ping opacity-80">BLOOD DRAIN</h1>
        </div>
      )}

      {/* 🎰 [도박] (갬블 계열) */}
      {playEffect.name === 'gamble' && (
        <div className="fixed inset-0 z-[9999] pointer-events-none flex items-center justify-center bg-black/70 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-yellow-500/30 via-red-500/30 to-purple-500/30 animate-pulse delay-75"></div>
          <div className="flex gap-4 animate-bounce">
            <div className="text-[5rem] font-black text-yellow-400 animate-spin">?</div>
            <div className="text-[5rem] font-black text-red-400 animate-ping delay-100">!</div>
            <div className="text-[5rem] font-black text-purple-400 animate-spin delay-200">?</div>
          </div>
        </div>
      )}

      {/* ☄️ [운석] (운석 낙하) */}
      {playEffect.name === 'meteor' && (
        <div className="fixed inset-0 z-[9999] pointer-events-none flex items-center justify-center bg-orange-950/30">
          <div className="w-[100vw] h-[100vh] absolute top-[-50vh] right-[-50vw] bg-gradient-to-bl from-orange-500 via-red-600 to-transparent rounded-full blur-xl animate-bounce shadow-[0_0_100px_orange]"></div>
          <div className="text-[4rem] md:text-[7rem] text-orange-400 font-black drop-shadow-[0_0_30px_orange] tracking-widest animate-pulse delay-200">METEOR FALL</div>
        </div>
      )}

      {/* 🎯 [저격] (스나이프) */}
      {playEffect.name === 'snipe' && (
        <div className="fixed inset-0 z-[9999] pointer-events-none flex items-center justify-center bg-black/60">
          <div className="absolute w-64 h-64 border-4 border-red-500 rounded-full animate-ping flex items-center justify-center">
            <div className="w-full h-1 bg-red-500 absolute"></div><div className="h-full w-1 bg-red-500 absolute"></div>
            <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse shadow-[0_0_20px_red]"></div>
          </div>
          <div className="absolute inset-0 bg-white opacity-0 animate-[pulse_0.2s_ease-in-out_2]"></div>
        </div>
      )}

      {/* ⚔️ [퓨리오소] (초필살기 연출은 TierEffects의 slashes와 조합되거나 여기서 독자 연출 가능) */}
      {playEffect.name === 'furioso' && (
        <div className="fixed inset-0 z-[9999] pointer-events-none flex items-center justify-center bg-black/60">
          <h1 className="text-[5rem] md:text-[9rem] text-red-100 font-black drop-shadow-[0_0_30px_red] opacity-90 scale-150 animate-bounce delay-300 z-10">FURIOSO!</h1>
        </div>
      )}
    </>
  );
}