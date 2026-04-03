import React, { useState, useEffect, useRef } from 'react';
import { HelpCircle } from 'lucide-react';

const EFFECT_RULES = {
  '약화': '가하는 피해량이 3% 감소합니다.',
  '취약': '받는 피해량이 30% 증가합니다.',
  '중독': '턴 시작 시 수치만큼 체력이 감소하고 수치가 1 줄어듭니다.',
  '근력': '공격 시 수치만큼 추가 피해를 입힙니다.',
  '민첩': '방어 시 수치만큼 추가 방어도를 얻습니다.',
  '가시': '피격 시 공격자에게 수치만큼 피해를 반사합니다.',
  '무형': '받는 모든 타격 피해가 1로 고정됩니다.',
  '재생': '턴 종료 시 수치만큼 체력을 회복하고 수치가 1 줄어듭니다.',
  '격노': '공격 카드를 사용할 때마다 수치만큼 방어도를 획득합니다.',
  '통찰': '다음 턴 시작 시 수치만큼 카드를 추가로 뽑습니다.',
  '표식': '타격 당할 때마다 수치만큼 추가 고정 피해를 받습니다.',
  '허약': '방어도 획득량이 25% 감소합니다.',
  '침묵': '스킬 카드를 사용할 수 없습니다.',
  '속박': '공격 카드를 사용할 수 없습니다.'
};

export default function Tooltip({ desc, direction = 'up' }) {
  const [isOpen, setIsOpen] = useState(false);
  const tooltipRef = useRef(null);

  // 화면의 다른 곳을 클릭하면 툴팁이 닫히도록 처리
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!desc) return null;
  const targetKeyword = Object.keys(EFFECT_RULES).find(key => desc.includes(key));
  if (!targetKeyword) return null;

  // 방향에 따른 클래스 설정
  const positionClass = direction === 'down' ? 'top-full mt-3' : 'bottom-full mb-3';
  const arrowClass = direction === 'down' ? 'bottom-full left-1/2 -translate-x-1/2 border-b-slate-900' : 'top-full left-1/2 -translate-x-1/2 border-t-slate-900';

  return (
    <div className="relative inline-block align-middle ml-1 leading-none" ref={tooltipRef}>
      <HelpCircle 
        className={`w-3 h-3 md:w-3.5 md:h-3.5 transition-colors cursor-pointer ${isOpen ? 'text-indigo-300' : 'text-indigo-400 hover:text-indigo-300'}`}
        style={{ WebkitAppRegion: 'no-drag', pointerEvents: 'auto' }}
        onClick={(e) => {
          e.stopPropagation(); // 부모 요소(적 의도 박스)의 클릭 이벤트가 실행되지 않도록 막음
          e.preventDefault();
          setIsOpen(!isOpen);
        }}
      />
      
      <div 
        className={`absolute ${positionClass} left-1/2 -translate-x-1/2 w-48 p-2.5 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl z-[100000] pointer-events-auto transition-all duration-200 transform ${
          isOpen ? 'visible opacity-100 scale-100' : 'invisible opacity-0 scale-95'
        }`}
        style={{ WebkitAppRegion: 'no-drag' }}
        onClick={(e) => e.stopPropagation()} // 툴팁 말풍선 자체를 클릭했을 때 닫히지 않게 함
      >
        <div className="text-xs">
          <span className="text-amber-400 font-bold block mb-1 border-b border-slate-800 pb-1 text-left">
            {targetKeyword}
          </span>
          <span className="text-slate-300 leading-relaxed break-keep block text-left font-medium">
            {EFFECT_RULES[targetKeyword]}
          </span>
        </div>
        <div className={`absolute border-8 border-transparent ${arrowClass}`}></div>
      </div>
    </div>
  );
}