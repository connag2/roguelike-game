import React from 'react';
import { HelpCircle } from 'lucide-react';

export default function Tooltip({ desc }) {
  if (!desc) return null;

  const getTitle = () => {
    if (desc.includes('피해')) return '공격';
    if (desc.includes('방어')) return '방어';
    if (desc.includes('회복')) return '회복';
    if (desc.includes('약화')) return '약화';
    if (desc.includes('취약')) return '취약';
    if (desc.includes('중독')) return '중독';
    if (desc.includes('근력')) return '근력';
    if (desc.includes('민첩')) return '민첩';
    return '효과 정보';
  };

  return (
    // ✨ inline-block과 align-middle을 사용하여 하단 여백 문제 해결
    <div className="relative group inline-block align-middle ml-1 leading-none">
      <HelpCircle 
        className="w-3 h-3 md:w-3.5 md:h-3.5 text-slate-400 hover:text-indigo-400 transition-colors cursor-help"
        style={{ 
          WebkitAppRegion: 'no-drag',
          pointerEvents: 'auto'
        }}
      />
      
      {/* ✨ invisible/opacity-0를 사용하여 레이아웃을 미리 확보하고 점프 현상 방지 */}
      <div 
        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 invisible opacity-0 group-hover:visible group-hover:opacity-100 w-48 p-2.5 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl z-[99999] pointer-events-auto transition-all duration-200 transform scale-95 group-hover:scale-100"
        style={{ 
          WebkitAppRegion: 'no-drag',
        }}
      >
        <div className="text-xs">
          <span className="text-amber-400 font-bold block mb-1 border-b border-slate-800 pb-1 text-left">
            {getTitle()}
          </span>
          <span className="text-slate-300 leading-relaxed break-keep block text-left">
            {desc}
          </span>
        </div>
        
        {/* 말꼬리 화살표 */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900"></div>
      </div>
    </div>
  );
}