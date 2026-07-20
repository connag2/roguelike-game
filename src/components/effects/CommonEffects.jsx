import React from 'react';
import { 
  Sword, Shield, Zap, Heart, Target, RefreshCw, Scissors, 
  FlaskConical, Wind, AlertCircle, MoveRight, Ghost, 
  Flame, Sparkles, Skull, Crosshair, Box, Target as Aim,
  Dna, ZapOff, ShieldAlert, Footprints, FastForward, Droplet, Plus
} from 'lucide-react';

export default function CommonEffects({ playEffect, fastMode }) {
  if (!playEffect || playEffect.tier !== 'common') return null;

  const duration = fastMode ? "duration-100" : "duration-200";
  const { cardId } = playEffect;

  // 💥 1. 공격 계열 (물리적 타격) - 불투명하게 뚜렷한 선
  const renderSlash = (color = 'bg-slate-200', angle = 'rotate-45', height = 'h-[3px]', extra = '') => (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[9999]">
      <div className={`w-[200%] ${height} ${color} slash-hit ${angle} ${extra}`} 
           style={{ animationDuration: fastMode ? '0.2s' : '0.4s' }} />
    </div>
  );

  const renderPierce = (color = 'bg-slate-300') => (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[9999]">
      <div className={`w-8 h-8 rounded-full ${color} pierce-hit`} 
           style={{ animationDuration: fastMode ? '0.2s' : '0.4s' }} />
    </div>
  );

  // 🛡️ 2. 방어 계열 (단단함, 보호막) - 투명도 제거
  const renderShield = (color = 'text-blue-400', Icon = Shield, extra = '') => (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[9999]">
      <Icon className={`w-3/4 h-3/4 ${color} shield-pop ${extra}`} 
            style={{ animationDuration: fastMode ? '0.3s' : '0.5s' }} />
    </div>
  );

  // ⚡ 3. 마나/기력 회복 계열 (기운이 모이며 퍼지는 회복 모션)
  const renderEnergy = (color = 'text-yellow-400', Icon = Zap) => (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[9999]">
      {/* 중앙 아이콘 팝업 */}
      <Icon className={`absolute w-1/2 h-1/2 ${color} energy-recharge`} 
            style={{ animationDuration: fastMode ? '0.3s' : '0.6s' }} />
      {/* 바깥으로 퍼져나가는 기운 링 */}
      <div className={`absolute w-3/4 h-3/4 border-[6px] rounded-full border-current ${color} energy-ring`}
           style={{ animationDuration: fastMode ? '0.3s' : '0.6s' }} />
    </div>
  );

  // 💚 4. 체력 회복 계열 (따뜻한 고동) - 투명도 제거
  const renderHeal = (Icon = Plus) => (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[9999]">
      <Icon className="w-1/2 h-1/2 text-green-400 heal-pulse" 
            style={{ animationDuration: fastMode ? '0.3s' : '0.6s' }} />
    </div>
  );

  // 🧪 5. 상태이상/독 계열 - 투명도 제거
  const renderPoison = () => (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[9999]">
      <Droplet className="w-1/2 h-1/2 text-green-500 poison-splash" 
               style={{ animationDuration: fastMode ? '0.3s' : '0.6s' }} />
    </div>
  );

  return (
    <>
      <style>{`
        /* 타격 (부드럽고 뚜렷하게 베어짐) */
        @keyframes sharpSlash { 
          0% { transform: scaleX(0) scaleY(1); opacity: 0; filter: blur(0px); }
          15% { transform: scaleX(0.5) scaleY(2); opacity: 0.8; filter: blur(1px); }
          30% { transform: scaleX(1) scaleY(1.5); opacity: 1; filter: blur(2px); }
          60% { transform: scaleX(1.3) scaleY(0.5); opacity: 1; filter: blur(1px); }
          100% { transform: scaleX(1.5) scaleY(0.1); opacity: 0; filter: blur(0px); }
        }
        .slash-hit { animation: sharpSlash cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }

        /* 찌르기 (잔상 남기며 찌름) */
        @keyframes pierceHit {
          0% { transform: scale(0.1); opacity: 0; }
          20% { transform: scale(1.6); opacity: 0.9; }
          40% { transform: scale(1.2); opacity: 1; }
          70% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(0.5); opacity: 0; }
        }
        .pierce-hit { animation: pierceHit cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }

        /* 방어 (선명하게 팝업) */
        @keyframes shieldPop {
          0% { transform: scale(0.5); opacity: 0; }
          30% { transform: scale(1.15); opacity: 1; }
          60% { transform: scale(0.95); opacity: 1; }
          85% { transform: scale(1.05); opacity: 0.8; }
          100% { transform: scale(1.1); opacity: 0; }
        }
        .shield-pop { animation: shieldPop cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }

        /* ⚡ 마나/에너지 회복 (모였다가 흡수되는 느낌) */
        @keyframes energyRecharge {
          0% { transform: scale(0.5); opacity: 0; }
          40% { transform: scale(1.2); opacity: 1; }
          80% { transform: scale(1); opacity: 1; }
          100% { transform: scale(0.8); opacity: 0; }
        }
        /* 마나 회복 링 효과 (밖으로 퍼짐) */
        @keyframes energyRing {
          0% { transform: scale(0.3); opacity: 1; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        .energy-recharge { animation: energyRecharge ease-out forwards; }
        .energy-ring { animation: energyRing ease-out forwards; }

        /* 회복 (강한 심장 박동 느낌) */
        @keyframes healPulse {
          0% { transform: scale(0.8); opacity: 0; }
          30% { transform: scale(1.3); opacity: 1; }
          80% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        .heal-pulse { animation: healPulse ease-out forwards; }

        /* 독/디버프 */
        @keyframes poisonSplash {
          0% { transform: translateY(-10px) scale(0.5); opacity: 0; }
          30% { transform: translateY(0) scale(1.2); opacity: 1; }
          80% { transform: translateY(5px) scale(1.1); opacity: 1; }
          100% { transform: translateY(10px) scale(1.5); opacity: 0; }
        }
        .poison-splash { animation: poisonSplash ease-in forwards; }
      `}</style>

      {/* ⚔️ 공격 계열 */}
      {cardId === 'strike' && renderSlash('bg-slate-200', 'rotate-45')}
      {cardId === 'heavy_strike' && renderSlash('bg-slate-400', 'rotate-[60deg]', 'h-[6px]')}
      {cardId === 'stab' && renderPierce('bg-slate-300')}
      {cardId === 'uppercut' && renderSlash('bg-slate-300', '-rotate-90')}
      {cardId === 'club_smash' && renderSlash('bg-orange-900', 'rotate-90', 'h-[8px]')}
      {cardId === 'quick_strike' && renderSlash('bg-cyan-200', 'rotate-15', 'h-[2px]')}
      {cardId === 'angry_strike' && renderSlash('bg-red-500', 'rotate-45')}
      {cardId === 'sweep' && renderSlash('bg-slate-200', 'rotate-0', 'h-[3px]', 'w-[300%]')}
      {cardId === 'bone_crush' && renderSlash('bg-stone-400', 'rotate-45', 'h-[8px]')}
      {cardId === 'throwing_dagger' && renderSlash('bg-slate-300', 'rotate-0 w-[50%] ml-[-50%]')}
      {cardId === 'double_cut' && <div className="absolute inset-0">{renderSlash('bg-slate-200', 'rotate-[30deg]')}{renderSlash('bg-slate-200', 'rotate-[-30deg]')}</div>}
      {cardId === 'vital_strike' && <div className="absolute inset-0">{renderPierce('bg-red-400')}{renderSlash('bg-slate-100', 'rotate-0')}</div>}
      {cardId === 'twin_strike' && <div className="absolute inset-0">{renderSlash('bg-slate-200', 'rotate-45 mt-[-20px]')}{renderSlash('bg-slate-200', 'rotate-45 mt-[20px]')}</div>}
      {cardId === 'gamblers_strike' && <div className="absolute inset-0 flex items-center justify-center text-3xl animate-bounce">🎲</div>}

      {/* 🛡️ 방어 계열 */}
      {cardId === 'defend' && renderShield('text-blue-400')}
      {cardId === 'shield_bash' && <div className="absolute inset-0">{renderShield('text-blue-500')}{renderPierce('bg-blue-300')}</div>}
      {cardId === 'crouch' && renderShield('text-slate-500', Shield, 'translate-y-4 scale-y-75')}
      {cardId === 'old_shield' && renderShield('text-stone-500', Shield)}
      {cardId === 'firm_stand' && renderShield('text-slate-600', Box, 'scale-x-125')}
      {cardId === 'spiked_shield' && renderShield('text-red-500', ShieldAlert)}

      {/* ⚡ 마나 & 유틸리티 계열 */}
      {cardId === 'focus' && renderEnergy('text-yellow-400', Zap)}
      {cardId === 'meditate' && renderEnergy('text-cyan-400', Wind)}
      {cardId === 'kihap' && renderEnergy('text-orange-500', Flame)}
      {cardId === 'combat_prep' && renderEnergy('text-amber-400', Sparkles)}
      {cardId === 'maintenance' && renderEnergy('text-slate-400', RefreshCw)}
      
      {/* 💚 체력 회복 계열 */}
      {cardId === 'first_aid' && renderHeal(Plus)}
      {cardId === 'short_rest' && renderHeal(Heart)}

      {/* 🧪 상태이상 & 디버프 계열 */}
      {cardId === 'poison_dart' && <div className="absolute inset-0">{renderSlash('bg-green-400', 'rotate-0')}{renderPoison()}</div>}
      {cardId === 'toxic_strike' && <div className="absolute inset-0">{renderSlash('bg-green-500', 'rotate-45')}</div>}
      {cardId === 'poison_flask' && renderPoison()}

      {/* 💨 이동 & 특수 계열 */}
      {cardId === 'dodge' && <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[9999]"><Ghost className="w-1/2 h-1/2 text-slate-400 animate-out slide-out-to-right duration-200" /></div>}
      {cardId === 'reckless_charge' && <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[9999]"><FastForward className="w-1/2 h-1/2 text-red-500 animate-out slide-out-to-right duration-200" /></div>}
      {cardId === 'taunt' && renderShield('text-red-500', Crosshair)}
      {cardId === 'counter' && <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[9999]"><AlertCircle className="w-1/2 h-1/2 text-red-500 animate-ping duration-200" /></div>}
      {cardId === 'warcry' && <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[9999]"><Wind className="w-3/4 h-3/4 text-red-400 animate-ping duration-300" /></div>}
      {cardId === 'sand_throw' && <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[9999]"><Sparkles className="w-1/2 h-1/2 text-yellow-500 animate-out zoom-out duration-200" /></div>}
    </>
  );
}