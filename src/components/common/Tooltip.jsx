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
    // ✨ inline-block과 고정 크기를 사용하여 레이아웃 흔들림을 원천 차단합니다.
    <div className="relative group inline-block w-4 h-4 ml-1 align-middle leading-none">
      <HelpCircle 
        // ✨ fixed size를 부여하고 flex-none으로 설정하여 크기 변화를 막습니다.
        className="w-full h-full text-slate-400 hover:text-indigo-400 transition-colors cursor-help flex-none"
        style={{ 
          WebkitAppRegion: 'no-drag',
          pointerEvents: 'auto'
        }}
      />
      
      {/* 📌 툴팁 박스: transition-all 대신 opacity/transform만 개별 적용하여 최적화 */}
      <div 
        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 invisible opacity-0 group-hover:visible group-hover:opacity-100 w-48 p-2.5 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl z-[99999] pointer-events-none transition-[opacity,transform] duration-200 ease-out transform scale-95 group-hover:scale-100"
        style={{ 
          WebkitAppRegion: 'no-drag',
        }}
      >
        <div className="text-xs">
          <span className="text-amber-400 font-bold block mb-1 border-b border-slate-800 pb-1 text-left">
            {getTitle()}
          </span>
          <span className="text-slate-300 leading-relaxed break-keep block text-left font-medium">
            {desc}
          </span>
        </div>
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900"></div>
      </div>
    </div>
  );
}