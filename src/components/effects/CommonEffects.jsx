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

  // 💥 타격 이펙트 도구: 날카로운 베기
  const renderSharpSlash = (color, angle = "rotate-45", scale = "") => (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[9999] mix-blend-screen">
      <div className={`w-[85vw] h-[3px] md:h-[5px] ${color} blur-[0.5px] slash-hit ${angle} ${scale}`} 
           style={{ animationDuration: fastMode ? '0.1s' : '0.2s' }} />
    </div>
  );

  // 💥 타격 이펙트 도구: 원형 충격파
  const renderImpact = (color, scale = "scale-100") => (
    <div className={`absolute inset-0 flex items-center justify-center pointer-events-none z-[9999] mix-blend-color-dodge`}>
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

      {/* ⚔️ 일반 카드 36종 개별 이펙트 리스트 */}
      {cardId === 'strike' && renderSharpSlash('bg-white shadow-[0_0_10px_white]')} {/* 1. 타격: 기본 하얀색 베기 */}
      {cardId === 'defend' && <div className="absolute inset-0 flex items-center justify-center"><Shield className="w-32 h-32 text-blue-400/40 animate-ping" /></div>} {/* 2. 방어: 파란 방패 파동 */}
      {cardId === 'heavy_strike' && renderSharpSlash('bg-red-500 shadow-[0_0_20px_red]', 'rotate-[110deg]', 'scale-y-150')} {/* 3. 강타: 묵직한 빨간 베기 */}
      {cardId === 'shield_bash' && <div className="absolute inset-0 flex items-center justify-center"><Shield className="w-36 h-36 text-blue-400 animate-in zoom-in" />{renderImpact('bg-blue-600/40')}</div>} {/* 4. 방패 밀치기: 방패 충돌 이펙트 */}
      {cardId === 'focus' && <div className="absolute inset-0 flex items-center justify-center"><Zap className="w-20 h-20 text-yellow-400 animate-bounce" /></div>} {/* 5. 집중: 번개 아이콘 튀어오름 */}
      {cardId === 'stab' && renderSharpSlash('bg-cyan-200 shadow-[0_0_12px_cyan]', 'rotate-0')} {/* 6. 찌르기: 날카로운 수평 궤적 */}
      {cardId === 'uppercut' && renderSharpSlash('bg-orange-400', '-rotate-90')} {/* 7. 올려치기: 주황색 수직 베기 */}
      {cardId === 'club_smash' && renderSharpSlash('bg-amber-900', 'rotate-90 scale-x-125')} {/* 8. 몽둥이 찜질: 갈색의 둔탁한 타격 */}
      {cardId === 'quick_strike' && renderSharpSlash('bg-indigo-300 opacity-60', 'rotate-12')} {/* 9. 신속한 타격: 얇고 빠른 보랏빛 선 */}
      {cardId === 'angry_strike' && <div className="absolute inset-0 bg-red-900/20">{renderSharpSlash('bg-red-600', 'rotate-45')}</div>} {/* 10. 분노의 일격: 배경 붉게 반전 및 베기 */}
      {cardId === 'sweep' && renderSharpSlash('bg-slate-200', 'rotate-0 scale-x-150')} {/* 11. 휩쓸기: 넓은 범위 수평 베기 */}
      {cardId === 'counter' && <div className="absolute inset-0 flex items-center justify-center"><AlertCircle className="w-32 h-32 text-red-600 animate-ping" /></div>} {/* 12. 카운터: 붉은색 경고 느낌의 파동 */}
      {cardId === 'crouch' && <div className="absolute inset-0 flex items-center justify-center"><Shield className="w-48 h-48 text-slate-500/30 animate-in slide-in-from-bottom-10" /></div>} {/* 13. 웅크리기: 거대한 회색 방패가 아래에서 위로 */}
      {cardId === 'dodge' && <div className="absolute inset-0 flex items-center justify-center"><Ghost className="w-32 h-32 text-cyan-400/30 animate-pulse" /></div>} {/* 14. 회피: 잔상 느낌의 유령 아이콘 */}
      {cardId === 'taunt' && <div className="absolute inset-0 flex items-center justify-center"><Crosshair className="w-40 h-40 text-purple-600/30 animate-ping" /></div>} {/* 15. 도발: 보라색 조준점 확대 */}
      {cardId === 'combat_prep' && <div className="absolute inset-0 flex items-center justify-center"><Sparkles className="w-24 h-24 text-amber-300 animate-spin" /></div>} {/* 16. 전투 준비: 반짝이는 강화 이펙트 */}
      {cardId === 'first_aid' && <div className="absolute inset-0 flex items-center justify-center"><Heart className="w-24 h-24 text-green-400 animate-ping" /></div>} {/* 17. 응급 처치: 초록색 하트 재생 */}
      {cardId === 'maintenance' && <div className="absolute inset-0 flex items-center justify-center"><RefreshCw className="w-20 h-20 text-slate-400 animate-spin" /></div>} {/* 18. 정비: 회색 톱니바퀴 회전 */}
      {cardId === 'poison_dart' && <div className="relative">{renderSharpSlash('bg-green-400', 'rotate-0')}{renderImpact('bg-green-700/30')}</div>} {/* 19. 독침: 초록색 찌르기 및 독 충격 */}
      {cardId === 'meditate' && <div className="absolute inset-0 flex items-center justify-center"><div className="w-64 h-64 border-2 border-blue-400/20 rounded-full animate-ping" /></div>} {/* 20. 명상: 넓게 퍼지는 푸른 원형 파동 */}
      {cardId === 'reckless_charge' && <div className="absolute inset-0 flex items-center justify-center"><MoveRight className="w-32 h-32 text-red-500 animate-out slide-out-to-right-full" /></div>} {/* 21. 무모한 돌진: 붉은 화살표가 적을 관통 */}
      {cardId === 'toxic_strike' && <div className="absolute inset-0">{renderSharpSlash('bg-green-300', 'rotate-15')}{renderSharpSlash('bg-green-300', 'rotate-[-15deg]')}</div>} {/* 22. 맹독 타격: X자 모양의 초록 베기 */}
      {cardId === 'warcry' && <div className="absolute inset-0 border-[15px] border-white/5 rounded-full animate-ping" />} {/* 23. 전장의 함성: 화면을 울리는 백색 충격파 */}
      {cardId === 'sand_throw' && <div className="absolute inset-0 bg-yellow-900/10 flex items-center justify-center text-yellow-200/50 font-bold">SAND!</div>} {/* 24. 모래 뿌리기: 노란 연기 및 텍스트 효과 */}
      {cardId === 'bone_crush' && renderSharpSlash('bg-slate-400', 'rotate-90')} {/* 25. 뼈 부수기: 회색의 수직 타격 */}
      {cardId === 'throwing_dagger' && <div className="absolute inset-0 flex items-center justify-center"><Sword className="w-12 h-12 text-slate-300 rotate-90 animate-out slide-out-to-right-full" /></div>} {/* 26. 투척 단검: 작은 칼날이 적에게 날아감 */}
      {cardId === 'double_cut' && <div className="absolute inset-0">{renderSharpSlash('bg-white', 'rotate-[30deg]')}{renderSharpSlash('bg-white', 'rotate-[-30deg]')}</div>} {/* 27. 이중 베기: 두 줄의 하얀 베기 */}
      {cardId === 'vital_strike' && <div className="absolute inset-0 flex items-center justify-center"><Aim className="w-32 h-32 text-yellow-400 opacity-50 animate-spin" />{renderSharpSlash('bg-yellow-100', 'rotate-0')}</div>} {/* 28. 급소 찌르기: 조준점 회전 후 수평 찌르기 */}
      {cardId === 'old_shield' && <div className="absolute inset-0 flex items-center justify-center"><Shield className="w-28 h-28 text-slate-600/40 animate-pulse" /></div>} {/* 29. 낡은 방패: 작고 어두운 방패 아이콘 */}
      {cardId === 'firm_stand' && <div className="absolute inset-0 border-x-[30px] border-blue-900/20 animate-in fade-in" />} {/* 30. 굳건한 버티기: 화면 옆면을 고정하는 푸른 바 */}
      {cardId === 'kihap' && <div className="absolute inset-0 flex items-center justify-center font-black text-6xl text-orange-500 animate-ping">氣!</div>} {/* 31. 기합: 주황색 '기' 텍스트 폭발 */}
      {cardId === 'short_rest' && <div className="absolute inset-0 bg-green-900/10 flex items-center justify-center text-6xl">💚</div>} {/* 32. 짧은 휴식: 화면 배경 초록빛 및 하트 이모지 */}
      {cardId === 'gamblers_strike' && <div className="absolute inset-0 flex items-center justify-center text-7xl animate-bounce">🎲</div>} {/* 33. 도박의 일격: 통통 튀는 주사위 아이콘 */}
      {cardId === 'poison_flask' && <div className="absolute inset-0 flex items-center justify-center"><FlaskConical className="w-24 h-24 text-green-500 animate-bounce" /></div>} {/* 34. 맹독 플라스크: 흔들리는 독약병 */}
      {cardId === 'spiked_shield' && <div className="absolute inset-0 flex items-center justify-center"><div className="relative"><Shield className="w-32 h-32 text-indigo-400/50" /><Scissors className="absolute -top-4 -right-4 w-12 h-12 text-red-400 rotate-180" /></div></div>} {/* 35. 가시 방패: 방패와 날카로운 가시 모양 */}
      {cardId === 'twin_strike' && <div className="absolute inset-0">{renderSharpSlash('bg-white', 'rotate-45')}{renderSharpSlash('bg-white', 'rotate-45')}</div>} {/* 36. 쌍발 타격: 동시에 겹쳐 터지는 베기 */}
    </>
  );
}