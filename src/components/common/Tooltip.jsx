import React from 'react';
import { HelpCircle } from 'lucide-react';

export default function Tooltip({ desc }) {
  if (!desc) return null;
  
  const tooltips = [];
  if (desc.includes('약화')) tooltips.push({ title: '약화', desc: '공격력이 3% 감소합니다.' });
  if (desc.includes('취약')) tooltips.push({ title: '취약', desc: '받는 피해가 30% 증가합니다.' });
  if (desc.includes('중독')) tooltips.push({ title: '중독', desc: '턴 시작 시 피해를 입고 수치가 1 감소합니다.' });
  if (desc.includes('가시')) tooltips.push({ title: '가시', desc: '피격 시 공격자에게 수치만큼 피해를 반사합니다.' });

  if (tooltips.length === 0) return null;

  return (
    <div className="relative inline-block group ml-1 align-middle">
      <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-help hover:text-indigo-400 transition-colors" />
      
      {/* group-hover 시에만 노출되는 툴팁 상자 */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl z-[9999] pointer-events-none">
        {tooltips.map((t, i) => (
          <div key={i} className="text-[10px] leading-tight mb-1.5 last:mb-0 border-b border-slate-800 last:border-0 pb-1 last:pb-0">
            <span className="text-orange-400 font-bold block mb-0.5">{t.title}</span>
            <span className="text-slate-300">{t.desc}</span>
          </div>
        ))}
        {/* 화살표 모양 */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900"></div>
      </div>
    </div>
  );
}