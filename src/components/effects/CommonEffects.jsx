import React from 'react';
import { 
  Sword, Shield, Zap, Heart, Target, RefreshCw, Scissors, 
  FlaskConical, Wind, AlertCircle, MoveRight, Ghost, 
  Flame, Sparkles, Skull, Crosshair, Box, Target as Aim,
  Dna, ZapOff, ShieldAlert, Footprints, FastForward
} from 'lucide-react';

export default function CommonEffects({ playEffect, fastMode }) {
  if (!playEffect || playEffect.tier !== 'common') return null;

  const duration = fastMode ? "duration-100" : "duration-200";
  const { cardId } = playEffect;

  // 💥 기본 베기/타격 연출 도구
  const renderSharpSlash = (color, angle = "rotate-45", scale = "") => (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[9999] mix-blend-screen">
      <div className={`w-[85vw] h-[3px] md:h-[5px] ${color} blur-[0.5px] slash-hit ${angle} ${scale}`} 
           style={{ animationDuration: fastMode ? '0.1s' : '0.2s' }} />
    </div>
  );

  // 💥 원형 충격파 연출 도구
  const renderImpact = (color, scale = "scale-100") => (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[9999] mix-blend-color-dodge">
      <div className={`w-32 h-32 md:w-48 md:h-48 rounded-full ${color} blur-xl animate-out fade-out zoom-out ${duration} ${scale}`} />
    </div>
  );

  return (
    <>
      <style>{`
        @keyframes sharpSlash { 
          0% { transform: scaleX(0) scaleY(1); opacity: 0; }
          15% { transform: scaleX(0.6) scaleY(4); opacity: 1; }
          100% { transform: scaleX(1.5) scaleY(0.1); opacity: 0; }
        }
        .slash-hit { animation: sharpSlash linear forwards; }
      `}</style>

      {/* ⚔️ [공격형 카드 18종] - 적에게 직접적인 타격을 가함 */}
      {cardId === 'strike' && renderSharpSlash('bg-white shadow-[0_0_10px_white]')}
      {cardId === 'heavy_strike' && renderSharpSlash('bg-red-500 shadow-[0_0_20px_red]', 'rotate-[110deg]', 'scale-y-150')}
      {cardId === 'shield_bash' && <div className="absolute inset-0 flex items-center justify-center"><Shield className="w-36 h-36 text-blue-400 animate-in zoom-in" />{renderImpact('bg-blue-600/40')}</div>}
      {cardId === 'stab' && renderSharpSlash('bg-cyan-200 shadow-[0_0_12px_cyan]', 'rotate-0')}
      {cardId === 'uppercut' && renderSharpSlash('bg-orange-400', '-rotate-90')}
      {cardId === 'club_smash' && renderSharpSlash('bg-amber-900', 'rotate-90 scale-x-125')}
      {cardId === 'quick_strike' && renderSharpSlash('bg-indigo-300 opacity-60', 'rotate-12')}
      {cardId === 'angry_strike' && <div className="absolute inset-0 bg-red-900/20">{renderSharpSlash('bg-red-600', 'rotate-45')}</div>}
      {cardId === 'sweep' && renderSharpSlash('bg-slate-200', 'rotate-0 scale-x-150')}
      {cardId === 'poison_dart' && <div className="relative">{renderSharpSlash('bg-green-400', 'rotate-0')}{renderImpact('bg-green-700/30')}</div>}
      {cardId === 'reckless_charge' && <div className="absolute inset-0 flex items-center justify-center"><MoveRight className="w-32 h-32 text-red-500 animate-out slide-out-to-right-full" /></div>}
      {cardId === 'toxic_strike' && <div className="absolute inset-0">{renderSharpSlash('bg-green-300', 'rotate-15')}{renderSharpSlash('bg-green-300', 'rotate-[-15deg]')}</div>}
      {cardId === 'bone_crush' && renderSharpSlash('bg-slate-400', 'rotate-90')}
      {cardId === 'throwing_dagger' && <div className="absolute inset-0 flex items-center justify-center"><Sword className="w-12 h-12 text-slate-300 rotate-90 animate-out slide-out-to-right-full" /></div>}
      {cardId === 'double_cut' && <div className="absolute inset-0">{renderSharpSlash('bg-white', 'rotate-[30deg]')}{renderSharpSlash('bg-white', 'rotate-[-30deg]')}</div>}
      {cardId === 'vital_strike' && <div className="absolute inset-0 flex items-center justify-center"><Aim className="w-32 h-32 text-yellow-400 opacity-50 animate-spin" />{renderSharpSlash('bg-yellow-100', 'rotate-0')}</div>}
      {cardId === 'gamblers_strike' && <div className="absolute inset-0 flex items-center justify-center text-7xl animate-bounce">🎲</div>}
      {cardId === 'twin_strike' && <div className="absolute inset-0">{renderSharpSlash('bg-white', 'rotate-45')}{renderSharpSlash('bg-white', 'rotate-45')}</div>}

      {/* 🛡️ [방어/스킬 카드 18종] - 버프 및 보조 효과 */}
      {cardId === 'defend' && <div className="absolute inset-0 flex items-center justify-center"><Shield className="w-32 h-32 text-blue-400/40 animate-ping" /></div>}
      {cardId === 'focus' && <div className="absolute inset-0 flex items-center justify-center"><Zap className="w-20 h-20 text-yellow-400 animate-bounce" /></div>}
      {cardId === 'crouch' && <div className="absolute inset-0 flex items-center justify-center"><Shield className="w-48 h-48 text-slate-500/30 animate-in slide-in-from-bottom-10" /></div>}
      {cardId === 'dodge' && <div className="absolute inset-0 flex items-center justify-center"><Ghost className="w-32 h-32 text-cyan-400/30 animate-pulse" /></div>}
      {cardId === 'taunt' && <div className="absolute inset-0 flex items-center justify-center"><Crosshair className="w-40 h-40 text-purple-600/30 animate-ping" /></div>}
      {cardId === 'combat_prep' && <div className="absolute inset-0 flex items-center justify-center"><Sparkles className="w-24 h-24 text-amber-300 animate-spin" /></div>}
      {cardId === 'first_aid' && <div className="absolute inset-0 flex items-center justify-center"><Heart className="w-24 h-24 text-green-400 animate-ping" /></div>}
      {cardId === 'maintenance' && <div className="absolute inset-0 flex items-center justify-center"><RefreshCw className="w-20 h-20 text-slate-400 animate-spin" /></div>}
      {cardId === 'meditate' && <div className="absolute inset-0 flex items-center justify-center"><div className="w-64 h-64 border-2 border-blue-400/20 rounded-full animate-ping" /></div>}
      {cardId === 'warcry' && <div className="absolute inset-0 border-[15px] border-white/5 rounded-full animate-ping" />}
      {cardId === 'sand_throw' && <div className="absolute inset-0 bg-yellow-900/10 flex items-center justify-center text-yellow-200/50 font-bold">SAND!</div>}
      {cardId === 'old_shield' && <div className="absolute inset-0 flex items-center justify-center"><Shield className="w-28 h-28 text-slate-600/40 animate-pulse" /></div>}
      {cardId === 'firm_stand' && <div className="absolute inset-0 border-x-[30px] border-blue-900/20 animate-in fade-in" />}
      {cardId === 'kihap' && <div className="absolute inset-0 flex items-center justify-center font-black text-6xl text-orange-500 animate-ping">氣!</div>}
      {cardId === 'short_rest' && <div className="absolute inset-0 bg-green-900/10 flex items-center justify-center text-6xl">💚</div>}
      {cardId === 'poison_flask' && <div className="absolute inset-0 flex items-center justify-center"><FlaskConical className="w-24 h-24 text-green-500 animate-bounce" /></div>}
      {cardId === 'spiked_shield' && <div className="absolute inset-0 flex items-center justify-center"><div className="relative"><Shield className="w-32 h-32 text-indigo-400/50" /><Scissors className="absolute -top-4 -right-4 w-12 h-12 text-red-500 rotate-180" /></div></div>}
      {cardId === 'counter' && <div className="absolute inset-0 flex items-center justify-center"><AlertCircle className="w-32 h-32 text-red-600 animate-ping" /></div>}
    </>
  );
}