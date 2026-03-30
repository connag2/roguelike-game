import React from 'react';
import { 
  Sword, Shield, Zap, Heart, Target, RefreshCw, Scissors, 
  FlaskConical, Wind, AlertCircle, MoveRight, Ghost, 
  Flame, Sparkles, Skull, Target as Aim, Crosshair, Box
} from 'lucide-react';

export default function CommonEffects({ playEffect, fastMode }) {
  if (!playEffect || playEffect.tier !== 'common') return null;

  const duration = fastMode ? "duration-100" : "duration-200";
  const { cardId, hits } = playEffect;

  // 💥 공통 타격 연출 도구 함수들 (CSS 미세 조정)
  const renderSharpSlash = (color, angle = "rotate-45") => (
    <div className={`absolute inset-0 flex items-center justify-center pointer-events-none z-[9999] mix-blend-screen ${duration}`}>
      <div className={`w-[90vw] h-[2px] md:h-[4px] ${color} blur-[0.5px] slash-hit ${angle}`} style={{ animationDuration: fastMode ? '0.1s' : '0.2s' }} />
    </div>
  );

  const renderImpact = (color, scale = "scale-100") => (
    <div className={`absolute inset-0 flex items-center justify-center pointer-events-none z-[9999] mix-blend-color-dodge ${duration}`}>
      <div className={`w-32 h-32 md:w-48 md:h-48 rounded-full ${color} blur-xl animate-out fade-out zoom-out ${scale}`} />
    </div>
  );

  return (
    <>
      <style>{`
        @keyframes sharpSlash { 
          0% { transform: scaleX(0) scaleY(1); opacity: 0; }
          10% { transform: scaleX(0.5) scaleY(4); opacity: 1; }
          100% { transform: scaleX(1.8) scaleY(0.1); opacity: 0; }
        }
        .slash-hit { animation: sharpSlash linear forwards; }
      `}</style>

      {/* ====== ⚔️ 공격 계열: 적을 베거나 찌르는 모션 ====== */}
      {/* strike: 정석 대각선 베기 */}
      {cardId === 'strike' && renderSharpSlash('bg-white shadow-[0_0_10px_white]')}
      {/* old_sword: 약하고 둔탁한 베기 */}
      {cardId === 'old_sword' && renderSharpSlash('bg-slate-300 shadow-[0_0_8px_white]', 'rotate-30')}
      {/* quick_strike: 매우 빠르고 얇은 베기 */}
      {cardId === 'quick_strike' && renderSharpSlash('bg-indigo-200 shadow-[0_0_10px_indigo]', 'rotate-12')}
      {/* stab: 날카롭고 수평으로 찌르기 */}
      {cardId === 'stab' && renderSharpSlash('bg-cyan-200 shadow-[0_0_12px_cyan]', 'rotate-0')}
      {/* poison_dart: 독침 찌르기 (초록색) */}
      {cardId === 'poison_dart' && <div className="relative">{renderSharpSlash('bg-green-300', 'rotate-0')}{renderImpact('bg-green-600/30')}</div>}
      
      {/* double_cut / twin_strike: 다단 히트 ( hits 수만큼 루프도는것은 BattleScreen에서 제어) */}
      {(cardId === 'double_cut' || cardId === 'twin_strike') && (
         <div className="absolute inset-0 flex items-center justify-center">{renderSharpSlash('bg-white', 'rotate-[35deg]')}{renderSharpSlash('bg-white', 'rotate-[-35deg]')}</div>
      )}
      {/* sweeping_strike / sweep: 넓게 휘두르기 (수평으로 넓게) */}
      {(cardId === 'sweeping_strike' || cardId === 'sweep') && renderSharpSlash('bg-slate-200', 'rotate-0 scale-y-125 scale-x-150')}
      {/* smash: 묵직하게 내려치기 (수직) */}
      {cardId === 'smash' && renderSharpSlash('bg-orange-400', 'rotate-90 scale-x-150')}
      {/* bone_crush: 관절 부수기 (수직, 둔탁) */}
      {cardId === 'bone_crush' && renderSharpSlash('bg-slate-400', 'rotate-90 scale-x-125 scale-y-150')}
      {/* fatal_strike: 치명타 (정중앙 얇게 찌르기) */}
      {cardId === 'fatal_strike' && renderSharpSlash('bg-yellow-100 shadow-[0_0_15px_yellow]', 'rotate-0 scale-y-50')}
      {/* reckless_charge: 돌진 (적에게 박는 충격) */}
      {cardId === 'reckless_charge' && <div className="absolute inset-0 flex items-center justify-center"><Aim className="w-48 h-48 text-red-500 opacity-60 animate-ping" />{renderImpact('bg-red-600', 'scale-150')}</div>}
      {/* gamblers_strike: 도박 공격 (중앙에 주사위 아이콘) */}
      {cardId === 'gamblers_strike' && <div className="absolute inset-0 flex items-center justify-center text-8xl opacity-80 animate-bounce">🎲</div>}
      
      {/* ====== 🛡️ 스킬/방어 계열: 적의 기세를 꺾거나 아군을 보호하는 모션 ====== */}
      {/* shield_bash: 방패로 가격 (피격 충격) */}
      {cardId === 'shield_bash' && <div className="absolute inset-0 flex items-center justify-center"><Shield className={`w-36 h-36 text-blue-400 opacity-60 animate-in zoom-in ${duration}`} />{renderImpact('bg-blue-600/50')}</div>}
      {/* counters: 적의 의도를 읽음 (경고 오버레이) */}
      {cardId === 'counters' && <div className="absolute inset-0 flex items-center justify-center"><Aim className={`w-40 h-40 text-red-600 opacity-50 animate-ping ${duration}`} /></div>}
      {/* vital_strike: 정밀 사격/공격 (조준점) */}
      {cardId === 'vital_strike' && <div className="absolute inset-0 flex items-center justify-center"><Box className={`w-32 h-32 text-cyan-400 opacity-50 animate-spin ${duration}`} />{renderSharpSlash('bg-cyan-100', 'rotate-0 scale-y-50')}</div>}
      {/* throwing_dagger: 단검 투척 (투척 궤적) */}
      {cardId === 'throwing_dagger' && <div className="absolute inset-0 flex items-center justify-center"><Sword className={`w-16 h-16 text-slate-300 rotate-90 animate-out slide-out-to-right-full ${duration}`} /></div>}
      {/* kihap: 기합 (적을 위압) */}
      {cardId === 'kihap' && <div className="absolute inset-0 flex items-center justify-center font-black text-6xl text-amber-400 animate-ping">氣!</div>}
      {/* taunt / sand_throw / toxic_strike / poison_flask / warcry: 디버프 모션 */}
      {cardId === 'taunt' && <div className="absolute inset-0 flex items-center justify-center"><Crosshair className={`w-40 h-40 text-purple-600 opacity-40 animate-ping ${duration}`} /></div>}
      {cardId === 'sand_throw' && <div className="absolute inset-0 bg-yellow-900/10 flex items-center justify-center text- yellow-100 animate-pulse">모래 투척!</div>}
      {cardId === 'warcry' && <div className="absolute inset-0 border-8 border-white/20 rounded-full animate-ping" />}
      {cardId === 'combat_prep' && <div className="absolute inset-0 flex items-center justify-center"><Sparkles className={`w-24 h-24 text-amber-300 animate-spin ${duration}`} /></div>}
      {cardId === 'maintenance' && <div className="absolute inset-0 flex items-center justify-center"><RefreshCw className={`w-20 h-20 text-slate-400 animate-spin ${duration}`} /></div>}
      {cardId === 'focus' && <div className="absolute inset-0 flex items-center justify-center"><Zap className={`w-20 h-20 text-yellow-400 animate-bounce ${duration}`} /></div>}
      {cardId === 'crouch' && <div className="absolute inset-0 flex items-center justify-center"><Shield className={`w-48 h-48 text-slate-500 opacity-30 animate-in slide-in-from-bottom-10 ${duration}`} /></div>}
      {cardId === 'old_shield' && <div className="absolute inset-0 flex items-center justify-center"><Shield className={`w-32 h-32 text-blue-500 opacity-30 animate-pulse ${duration}`} /></div>}
      {cardId === 'counter' && <div className="absolute inset-0 flex items-center justify-center"><AlertCircle className={`w-32 h-32 text-red-500 animate-ping ${duration}`} /></div>}
      {cardId === 'firm_stand' && <div className="absolute inset-0 border-[10px] border-blue-900/30 animate-in fade-in ${duration}" />}
      {cardId === 'defend' && <div className="absolute inset-0 flex items-center justify-center"><Shield className={`w-32 h-32 text-blue-400 opacity-40 animate-in zoom-in ${duration}`} /></div>}
      {cardId === 'poison_flask' && <div className="absolute inset-0 flex items-center justify-center"><FlaskConical className={`w-24 h-24 text-green-400 animate-bounce ${duration}`} /></div>}
      {cardId === 'poison_dart' && <div className="relative">{renderSharpSlash('bg-green-300', 'rotate-0')}{renderImpact('bg-green-600/30')}</div>}
      {cardId === 'toxic_strike' && <div className="absolute inset-0">{renderSharpSlash('bg-green-400', 'rotate-[15deg]')}{renderSharpSlash('bg-green-400', 'rotate-[-15deg]')}</div>}

      {/* ====== 💚 회복/스킬 계열 (적 대신 아군에게 연출되나, user 요청대로 적 중앙에 피격감으로 표시) ====== */}
      {cardId === 'first_aid' && <div className="absolute inset-0 flex items-center justify-center"><Heart className={`w-24 h-24 text-green-400 opacity-50 animate-ping ${duration}`} /></div>}
      {cardId === 'short_rest' && <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-30 animate-pulse">💚</div>}
    </>
  );
}