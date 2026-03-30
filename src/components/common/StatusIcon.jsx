import React from 'react';

const statusConfig = {
  strength: { name: '근력', color: 'bg-red-900 border-red-500 text-red-100', desc: '가하는 피해량이 증가합니다.' },
  dexterity: { name: '민첩', color: 'bg-blue-900 border-blue-500 text-blue-100', desc: '얻는 방어도가 증가합니다.' },
  thorns: { name: '가시', color: 'bg-emerald-900 border-emerald-500 text-emerald-100', desc: '피격 시 공격자에게 피해를 반사합니다.' },
  poison: { name: '중독', color: 'bg-green-900 border-green-500 text-green-100', desc: '턴 시작 시 수치만큼 피해를 입습니다.' },
  weak: { name: '약화', color: 'bg-orange-800 border-orange-500 text-white', desc: '가하는 피해량이 25% 감소합니다.', pulse: true },
  vulnerable: { name: '취약', color: 'bg-purple-800 border-purple-500 text-white', desc: '받는 피해량이 30% 증가합니다.', pulse: true }
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