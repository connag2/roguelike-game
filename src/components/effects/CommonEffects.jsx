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

  // 💥 타격 이펙트 도구: 날카로운 베기 (타겟 중심 크기로 변경)
  const renderSharpSlash = (color, angle = "rotate-45", scale = "") => (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[9999] mix-blend-screen">
      <div className={`w-[250%] h-[3px] md:h-[5px] ${color} blur-[0.5px] slash-hit ${angle} ${scale}`} 
           style={{ animationDuration: fastMode ? '0.1s' : '0.2s' }} />
    </div>
  );

  // 💥 타격 이펙트 도구: 원형 충격파 (부모 크기에 맞게 변경)
  const renderImpact = (color, scale = "scale-100") => (
    <div className={`absolute inset-0 flex items-center justify-center pointer-events-none z-[9999] mix-blend-color-dodge`}>
      <div className={`w-full h-full rounded-full ${color} blur-xl animate-out fade-out zoom-out ${duration} ${scale}`} />
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

      {/* ⚔️ 일반 카드 36종 개별 이펙트 리스트 */}
      {cardId === 'strike' && renderSharpSlash('bg-white shadow-[0_0_10px_white]')}
      {cardId === 'defend' && <div className="absolute inset-0 flex items-center justify-center"><Shield className="w-full h-full text-blue-400/40 animate-ping" /></div>}
      {cardId === 'heavy_strike' && renderSharpSlash('bg-red-500 shadow-[0_0_20px_red]', 'rotate-[110deg]', 'scale-y-150')}
      {cardId === 'shield_bash' && <div className="absolute inset-0 flex items-center justify-center"><Shield className="w-[120%] h-[120%] text-blue-400 animate-in zoom-in" />{renderImpact('bg-blue-600/40')}</div>}
      {cardId === 'focus' && <div className="absolute inset-0 flex items-center justify-center"><Zap className="w-full h-full text-yellow-400 animate-bounce" /></div>}
      {cardId === 'stab' && renderSharpSlash('bg-cyan-200 shadow-[0_0_12px_cyan]', 'rotate-0')}
      {cardId === 'uppercut' && renderSharpSlash('bg-orange-400', '-rotate-90')}
      {cardId === 'club_smash' && renderSharpSlash('bg-amber-900', 'rotate-90 scale-x-125')}
      {cardId === 'quick_strike' && renderSharpSlash('bg-indigo-300 opacity-60', 'rotate-12')}
      {cardId === 'angry_strike' && <div className="absolute inset-0 bg-red-900/20 rounded-full">{renderSharpSlash('bg-red-600', 'rotate-45')}</div>}
      {cardId === 'sweep' && renderSharpSlash('bg-slate-200', 'rotate-0 scale-x-150')}
      {cardId === 'counter' && <div className="absolute inset-0 flex items-center justify-center"><AlertCircle className="w-full h-full text-red-600 animate-ping" /></div>}
      {cardId === 'crouch' && <div className="absolute inset-0 flex items-center justify-center"><Shield className="w-[150%] h-[150%] text-slate-500/30 animate-in slide-in-from-bottom-10" /></div>}
      {cardId === 'dodge' && <div className="absolute inset-0 flex items-center justify-center"><Ghost className="w-full h-full text-cyan-400/30 animate-pulse" /></div>}
      {cardId === 'taunt' && <div className="absolute inset-0 flex items-center justify-center"><Crosshair className="w-[120%] h-[120%] text-purple-600/30 animate-ping" /></div>}
      {cardId === 'combat_prep' && <div className="absolute inset-0 flex items-center justify-center"><Sparkles className="w-3/4 h-3/4 text-amber-300 animate-spin" /></div>}
      {cardId === 'first_aid' && <div className="absolute inset-0 flex items-center justify-center"><Heart className="w-3/4 h-3/4 text-green-400 animate-ping" /></div>}
      {cardId === 'maintenance' && <div className="absolute inset-0 flex items-center justify-center"><RefreshCw className="w-3/4 h-3/4 text-slate-400 animate-spin" /></div>}
      {cardId === 'poison_dart' && <div className="relative w-full h-full">{renderSharpSlash('bg-green-400', 'rotate-0')}{renderImpact('bg-green-700/30')}</div>}
      {cardId === 'meditate' && <div className="absolute inset-0 flex items-center justify-center"><div className="w-[200%] h-[200%] border-2 border-blue-400/20 rounded-full animate-ping" /></div>}
      {cardId === 'reckless_charge' && <div className="absolute inset-0 flex items-center justify-center"><MoveRight className="w-full h-full text-red-500 animate-out slide-out-to-right-full" /></div>}
      {cardId === 'toxic_strike' && <div className="absolute inset-0">{renderSharpSlash('bg-green-300', 'rotate-15')}{renderSharpSlash('bg-green-300', 'rotate-[-15deg]')}</div>}
      {cardId === 'warcry' && <div className="absolute inset-0 border-[8px] border-white/5 rounded-full animate-ping" />}
      {cardId === 'sand_throw' && <div className="absolute inset-0 bg-yellow-900/10 flex items-center justify-center text-yellow-200/50 font-bold rounded-full">SAND!</div>}
      {cardId === 'bone_crush' && renderSharpSlash('bg-slate-400', 'rotate-90')}
      {cardId === 'throwing_dagger' && <div className="absolute inset-0 flex items-center justify-center"><Sword className="w-1/2 h-1/2 text-slate-300 rotate-90 animate-out slide-out-to-right-full" /></div>}
      {cardId === 'double_cut' && <div className="absolute inset-0">{renderSharpSlash('bg-white', 'rotate-[30deg]')}{renderSharpSlash('bg-white', 'rotate-[-30deg]')}</div>}
      {cardId === 'vital_strike' && <div className="absolute inset-0 flex items-center justify-center"><Aim className="w-full h-full text-yellow-400 opacity-50 animate-spin" />{renderSharpSlash('bg-yellow-100', 'rotate-0')}</div>}
      {cardId === 'old_shield' && <div className="absolute inset-0 flex items-center justify-center"><Shield className="w-3/4 h-3/4 text-slate-600/40 animate-pulse" /></div>}
      {cardId === 'firm_stand' && <div className="absolute inset-0 border-x-[15px] border-blue-900/20 animate-in fade-in rounded-full" />}
      {cardId === 'kihap' && <div className="absolute inset-0 flex items-center justify-center font-black text-3xl text-orange-500 animate-ping">氣!</div>}
      {cardId === 'short_rest' && <div className="absolute inset-0 bg-green-900/10 flex items-center justify-center text-3xl rounded-full">💚</div>}
      {cardId === 'gamblers_strike' && <div className="absolute inset-0 flex items-center justify-center text-4xl animate-bounce">🎲</div>}
      {cardId === 'poison_flask' && <div className="absolute inset-0 flex items-center justify-center"><FlaskConical className="w-3/4 h-3/4 text-green-500 animate-bounce" /></div>}
      {cardId === 'spiked_shield' && <div className="absolute inset-0 flex items-center justify-center"><div className="relative w-full h-full flex items-center justify-center"><Shield className="w-full h-full text-indigo-400/50" /><Scissors className="absolute -top-2 -right-2 w-1/2 h-1/2 text-red-400 rotate-180" /></div></div>}
      {cardId === 'twin_strike' && <div className="absolute inset-0">{renderSharpSlash('bg-white', 'rotate-45')}{renderSharpSlash('bg-white', 'rotate-45')}</div>}
    </>
  );
}