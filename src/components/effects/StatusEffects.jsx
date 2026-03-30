import React from 'react';
import { Shield } from 'lucide-react';

export default function StatusEffects({ playEffect }) {
  if (!playEffect) return null;

  return (
    <>
      {/* 🛡️ [방어] (버프 계열) */}
      {playEffect.name === 'block' && (
        <div className="fixed inset-0 z-[9999] pointer-events-none flex items-center justify-center">
          <div className="absolute inset-0 bg-blue-900/20 mix-blend-screen"></div>
          <div className="w-[60vw] h-[60vw] border-[20px] border-blue-400 rounded-full blur-md animate-ping opacity-50"></div>
          <Shield className="absolute w-64 h-64 text-blue-300 drop-shadow-[0_0_50px_blue] animate-pulse" />
        </div>
      )}

      {/* 💚 [회복] (버프 계열) */}
      {playEffect.name === 'heal' && (
        <div className="fixed inset-0 z-[9999] pointer-events-none flex items-center justify-center mix-blend-screen bg-green-900/10 shadow-[inset_0_0_150px_rgba(34,197,94,0.5)]">
          <div className="text-[4rem] md:text-[6rem] text-green-300 font-black drop-shadow-[0_0_30px_green] animate-bounce">+ HEAL +</div>
        </div>
      )}

      {/* 🧪 [중독] (디버프 계열) */}
      {playEffect.name === 'poison' && (
        <div className="fixed inset-0 z-[9999] pointer-events-none flex items-center justify-center bg-green-950/40">
          <div className="text-[6rem] md:text-[10rem] text-green-500 font-black drop-shadow-[0_0_40px_green] animate-[bounce_0.5s_ease-in-out_infinite] opacity-90 blur-[2px]">TOXIC</div>
        </div>
      )}

      {/* 💥 [취약/약화 디버프] - 임시로 붉은 번뜩임으로 처리 */}
      {playEffect.name === 'debuff' && (
        <div className="fixed inset-0 z-[9999] pointer-events-none flex items-center justify-center bg-purple-950/40 mix-blend-multiply">
           <h1 className="text-[6rem] text-purple-400 font-black animate-ping">저주!</h1>
        </div>
      )}
    </>
  );
}