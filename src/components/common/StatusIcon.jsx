import React from 'react';

const statusConfig = {
  // --- 기존 버프 ---
  strength: { name: '근력', color: 'bg-red-900 border-red-500 text-red-100', desc: '가하는 피해량이 증가합니다.' },
  dexterity: { name: '민첩', color: 'bg-blue-900 border-blue-500 text-blue-100', desc: '얻는 방어도가 증가합니다.' },
  thorns: { name: '가시', color: 'bg-emerald-900 border-emerald-500 text-emerald-100', desc: '피격 시 공격자에게 피해를 반사합니다.' },
  
  // ✨ 신규 버프 4종 추가
  intangible: { name: '무형', color: 'bg-slate-200 border-slate-400 text-slate-900', desc: '받는 모든 타격 피해가 1로 고정됩니다.' },
  regen: { name: '재생', color: 'bg-lime-900 border-lime-500 text-lime-100', desc: '턴 종료 시 수치만큼 체력을 회복합니다.' },
  rage: { name: '격노', color: 'bg-rose-900 border-rose-500 text-rose-100', desc: '공격 카드를 사용할 때마다 방어도를 획득합니다.' },
  insight: { name: '통찰', color: 'bg-cyan-900 border-cyan-500 text-cyan-100', desc: '다음 턴 시작 시 카드를 추가로 뽑습니다.' },

  // --- 기존 디버프 ---
  poison: { name: '중독', color: 'bg-green-900 border-green-500 text-green-100', desc: '턴 시작 시 수치만큼 피해를 입습니다.' },
  weak: { name: '약화', color: 'bg-orange-800 border-orange-500 text-white', desc: '가하는 피해량이 3% 감소합니다.', pulse: true }, // Tooltip과 설명 통일 (3%)
  vulnerable: { name: '취약', color: 'bg-purple-800 border-purple-500 text-white', desc: '받는 피해량이 30% 증가합니다.', pulse: true },

  // ✨ 신규 디버프 4종 추가
  mark: { name: '표식', color: 'bg-fuchsia-900 border-fuchsia-500 text-fuchsia-100', desc: '타격 당할 때마다 추가 고정 피해를 받습니다.', pulse: true },
  frail: { name: '허약', color: 'bg-yellow-900 border-yellow-600 text-yellow-100', desc: '방어도 획득량이 25% 감소합니다.', pulse: true },
  silence: { name: '침묵', color: 'bg-gray-800 border-gray-500 text-white', desc: '스킬 카드를 사용할 수 없습니다.', pulse: true },
  bind: { name: '속박', color: 'bg-zinc-800 border-zinc-500 text-white', desc: '공격 카드를 사용할 수 없습니다.', pulse: true }
};

export default function StatusIcon({ type, value, isEnemy = false }) {
  if (!value || value <= 0) return null;
  const config = statusConfig[type];
  if (!config) return null;

  // 몬스터 아이콘은 살짝 더 작게 처리
  const sizeClasses = isEnemy ? "text-[8px] px-1" : "text-[10px] px-2 py-0.5";

  return (
    <div className={`relative group cursor-help ${config.color} ${sizeClasses} rounded-full border shadow-md ${config.pulse ? 'animate-pulse' : ''}`}>
      {config.name} {type === 'strength' || type === 'dexterity' ? '+' : ''}{value}
      
      {/* 툴팁 (마우스 호버 시 표시) */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-32 p-2 bg-slate-900 border border-slate-600 rounded-lg shadow-xl z-[99999] pointer-events-none text-center whitespace-normal">
        <span className="text-amber-400 font-bold block mb-1">{config.name}</span>
        <span className="text-slate-300 text-[10px] leading-tight block">{config.desc}</span>
      </div>
    </div>
  );
}