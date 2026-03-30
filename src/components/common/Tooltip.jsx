import React from 'react';
import { HelpCircle } from 'lucide-react';

// 게임 내 상태 효과 규칙 정의
const EFFECT_RULES = {
  '약화': '가하는 피해량이 25% 감소합니다.',
  '취약': '받는 피해량이 30% 증가합니다.',
  '중독': '턴 시작 시 수치만큼 체력이 감소하고 수치가 1 줄어듭니다.',
  '근력': '공격 시 수치만큼 추가 피해를 입힙니다.',
  '민첩': '방어 시 수치만큼 추가 방어도를 얻습니다.',
  '가시': '피격 시 공격자에게 수치만큼 피해를 반사합니다.'
};

export default function Tooltip({ desc }) {
  if (!desc) return null;

  // 설명문에서 어떤 키워드에 대한 설명이 필요한지 찾기
  const targetKeyword = Object.keys(EFFECT_RULES).find(key => desc.includes(key));

  // 관련 키워드가 없으면 아이콘 자체를 렌더링하지 않음 (중복 방지 핵심)
  if (!targetKeyword) return null;

  return (
    <div className="relative group inline-block align-middle ml-1 leading-none">
      <HelpCircle 
        className="w-3 h-3 md:w-3.5 md:h-3.5 text-indigo-400 hover:text-indigo-300 transition-colors cursor-help"
        style={{ WebkitAppRegion: 'no-drag', pointerEvents: 'auto' }}
      />
      
      {/* 툴팁 박스: 해당 키워드의 '규칙'을 보여줌 */}
      <div 
        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 invisible opacity-0 group-hover:visible group-hover:opacity-100 w-48 p-2.5 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl z-[99999] pointer-events-auto transition-all duration-200 transform scale-95 group-hover:scale-100"
        style={{ WebkitAppRegion: 'no-drag' }}
      >
        <div className="text-xs">
          <span className="text-amber-400 font-bold block mb-1 border-b border-slate-800 pb-1 text-left">
            {targetKeyword} 효과란?
          </span>
          <span className="text-slate-300 leading-relaxed break-keep block text-left font-medium">
            {EFFECT_RULES[targetKeyword]}
          </span>
        </div>
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900"></div>
      </div>
    </div>
  );
}