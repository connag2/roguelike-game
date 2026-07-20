import React, { useEffect, useState } from 'react';

export default function UltimateCutscene({ cardName, heroImg, onComplete }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    // 컷신 페이즈 진행
    const t1 = setTimeout(() => setPhase(1), 200);   // 화면 어두워짐 + 집중선
    const t2 = setTimeout(() => setPhase(2), 1000);  // 캐릭터 컷인 + 카드 이름
    const t3 = setTimeout(() => setPhase(3), 2500);  // 번쩍이며 종료
    const t4 = setTimeout(() => onComplete(), 2800); // 완전 종료

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[100000] pointer-events-none flex items-center justify-center overflow-hidden">
      
      {/* 1. 배경 암전 및 집중선 */}
      <div className={`absolute inset-0 bg-black transition-opacity duration-500 ${phase >= 1 && phase < 3 ? 'opacity-80' : 'opacity-0'}`} />
      
      {phase >= 1 && phase < 3 && (
        <div className="absolute inset-0 flex items-center justify-center animate-spin-slow opacity-30">
          <div className="w-[200vw] h-[200vw] bg-[repeating-conic-gradient(rgba(255,255,255,0.2)_0_10deg,transparent_10deg_20deg)]" />
        </div>
      )}

      {/* 2. 캐릭터 컷인 및 스킬 이름 */}
      {phase >= 2 && phase < 3 && (
        <div className="relative w-full h-full flex flex-col items-center justify-center">
          
          <div className="absolute inset-0 flex items-center justify-center" style={{
            animation: 'cutinSlide 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards'
          }}>
            <div className="w-full h-48 md:h-64 bg-red-900/80 border-y-4 border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.8)] flex items-center justify-between px-10 md:px-32 transform -skew-y-3">
              <img src={heroImg} alt="Hero" className="w-40 h-40 md:w-64 md:h-64 drop-shadow-[0_0_30px_white] animate-pulse" />
              <div className="flex flex-col items-end">
                <span className="text-xl md:text-3xl font-bold text-red-300 tracking-[0.5em] mb-2 uppercase">Ultimate</span>
                <span className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-red-500 drop-shadow-[0_0_20px_rgba(255,255,255,1)] italic">
                  {cardName}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. 화이트아웃 종료 */}
      <div className={`absolute inset-0 bg-white transition-opacity duration-300 ${phase === 3 ? 'opacity-100' : 'opacity-0'}`} />

      <style>{`
        @keyframes cutinSlide {
          0% { transform: translateX(-100%) scale(1.2); opacity: 0; }
          100% { transform: translateX(0) scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
