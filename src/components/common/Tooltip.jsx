import React from 'react';
import { Info } from 'lucide-react';

export default function Tooltip({ desc }) {
  if (!desc) return null;
  
  const tooltips = [];
  if (desc.includes('약화')) tooltips.push({ title: '약화', desc: '가하는 피해가 3% 감소합니다. (턴마다 수치 비례 감소)' });
  if (desc.includes('취약')) tooltips.push({ title: '취약', desc: '받는 피해가 30% 증가합니다. (턴마다 수치 비례 감소)' });
  if (desc.includes('근력')) tooltips.push({ title: '근력', desc: '공격 카드의 피해량이 증가합니다. (턴마다 수치 비례 감소)' });
  if (desc.includes('민첩')) tooltips.push({ title: '민첩', desc: '방어 카드의 방어도가 증가합니다. (턴마다 수치 비례 감소)' });
  if (desc.includes('도박')) tooltips.push({ title: '도박', desc: '확률에 따라 추가 효과가 발생하거나 패널티를 받습니다.' });
  if (desc.includes('중독')) tooltips.push({ title: '중독', desc: '턴 시작 시 수치만큼 피해를 입고, 중독 수치가 1 감소합니다.' });
  if (desc.includes('가시')) tooltips.push({ title: '가시', desc: '피격 시 공격자에게 수치만큼 피해를 반사합니다.' });

  if (tooltips.length === 0) return null;

  return (
    <div tabIndex="0" className="tooltip-trigger inline-flex items-center ml-1 text-slate-400 cursor-help relative z-[9999] outline-none">
      <Info className="w-4 h-4" />
      <div className="tooltip-content absolute bottom-[120%] left-1/2 -translate-x-1/2 mb-1 w-56 bg-slate-800 text-white text-xs p-2 rounded border border-slate-600 shadow-xl pointer-events-none z-[9999] flex flex-col gap-1.5">
        {tooltips.map((t, i) => (
          <div key={i} className="text-left leading-tight">
            <span className="font-bold text-orange-400">{t.title}:</span> {t.desc}
          </div>
        ))}
      </div>
    </div>
  );
}