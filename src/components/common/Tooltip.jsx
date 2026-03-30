import React from 'react';
import { HelpCircle } from 'lucide-react';

export default function Tooltip({ desc }) {
  if (!desc) return null;

  // 설명문 키워드 추출 제목 함수 (생략 가능, 기존 유지)
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
    <div className="relative group inline-block ml-1">
      {/* 1. ? 아이콘: 드래그 방지 및 클릭 활성화 */}
      <HelpCircle 
        className="w-3 h-3 md:w-3.5 md:h-3.5 text-slate-400 hover:text-indigo-400 transition-colors cursor-help"
        style={{ 
          WebkitAppRegion: 'no-drag', // 📌 Electron 드래그 방지
          pointerEvents: 'auto'       // 📌 마우스 이벤트 활성화
        }}
      />
      
      {/* 2. 툴팁 내용 박스: 여기에 no-drag를 확실히 추가해야 합니다. */}
      <div 
        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2.5 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl z-[9999] pointer-events-none animate-in fade-in zoom-in duration-200"
        style={{ 
          WebkitAppRegion: 'no-drag', // 📌 [핵심 고정] 박스 자체도 드래그 영역에서 제외
          pointerEvents: 'auto'       // 📌 툴팁 박스 내부 이벤트 활성화
        }}
      >
        <div className="text-xs">
          <span className="text-amber-400 font-bold block mb-1 border-b border-slate-800 pb-1">
            {getTitle()}
          </span>
          <span className="text-slate-300 leading-relaxed break-keep block">
            {desc}
          </span>
        </div>
        
        {/* 말꼬리 화살표 */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900"></div>
      </div>
    </div>
  );
}