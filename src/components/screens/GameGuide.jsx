import React, { useState } from 'react';
import { HelpCircle, Sword, Shield, Zap, Skull, ChevronDown, ChevronUp, Info } from 'lucide-react';

export default function GameGuide({ isOpen, onClose }) {
  const [expandedSection, setExpandedSection] = useState('rules');

  if (!isOpen) return null;

  const sections = [
    {
      id: 'rules',
      title: '⚔️ 기본 전투 규칙',
      icon: <Sword className="w-5 h-5 text-indigo-400" />,
      content: (
        <ul className="list-disc list-inside space-y-2 text-slate-300 text-sm md:text-base">
          <li>매 턴 카드를 <span className="text-white font-bold">5장</span>씩 뽑으며 마나는 3으로 충전됩니다.</li>
          <li><span className="text-blue-400 font-bold">방어도:</span> 적의 공격을 막아주지만, 내 턴 시작 시 0으로 초기화됩니다.</li>
          <li><span className="text-red-400 font-bold">몬스터:</span> 5층마다 보스, 25/50/75/100층에는 강력한 전설 보스가 등장합니다.</li>
        </ul>
      )
    },
    {
      id: 'debuffs',
      title: '🧪 상태 효과 (디버프)',
      icon: <Skull className="w-5 h-5 text-red-400" />,
      content: (
        <div className="space-y-3 text-sm md:text-base">
          <p><span className="text-orange-400 font-bold">약화:</span> 가하는 피해량이 <span className="text-white font-bold">3%</span> 감소합니다. (중첩 가능)</p>
          <p><span className="text-purple-400 font-bold">취약:</span> 받는 피해량이 <span className="text-white font-bold">30%</span> 증가합니다.</p>
          <p><span className="text-green-400 font-bold">중독:</span> 턴 시작 시 수치만큼 피해를 입고 수치가 1 감소합니다.</p>
        </div>
      )
    },
    {
      id: 'buffs',
      title: '✨ 상태 효과 (버프)',
      icon: <Zap className="w-5 h-5 text-yellow-400" />,
      content: (
        <div className="space-y-3 text-sm md:text-base">
          <p><span className="text-red-400 font-bold">근력:</span> 공격 시 대미지가 수치만큼 영구적으로 증가합니다.</p>
          <p><span className="text-blue-400 font-bold">민첩:</span> 방어 시 방어도가 수치만큼 영구적으로 증가합니다.</p>
          <p><span className="text-emerald-400 font-bold">가시:</span> 적에게 공격받을 때 수치만큼 대미지를 반사합니다.</p>
        </div>
      )
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/90 z-[10000] flex items-center justify-center p-4 backdrop-blur-md" onClick={onClose}>
      <div className="bg-slate-800 w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl border-2 border-indigo-500 shadow-2xl animate-draw p-6 md:p-8" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-8 border-b border-slate-700 pb-4">
          <h2 className="text-2xl md:text-3xl font-black text-indigo-400 flex items-center gap-2">
            <HelpCircle className="w-8 h-8" /> 게임 가이드
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-3xl font-bold transition-colors">×</button>
        </div>

        <div className="space-y-4">
          {sections.map((section) => {
            const isExpanded = expandedSection === section.id;
            return (
              <div key={section.id} className={`rounded-xl border transition-all ${isExpanded ? 'bg-slate-900/50 border-indigo-500' : 'bg-slate-800 border-slate-700 hover:border-slate-500'}`}>
                <button 
                  onClick={() => setExpandedSection(isExpanded ? '' : section.id)}
                  className="w-full p-4 flex items-center justify-between font-bold text-lg"
                >
                  <div className="flex items-center gap-3">
                    {section.icon}
                    <span>{section.title}</span>
                  </div>
                  {isExpanded ? <ChevronUp /> : <ChevronDown />}
                </button>
                {isExpanded && (
                  <div className="p-4 pt-0 border-t border-slate-700/50 animate-in fade-in slide-in-from-top-1">
                    {section.content}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8 p-4 bg-indigo-900/20 rounded-xl border border-indigo-500/30 flex gap-3">
          <Info className="w-5 h-5 text-indigo-400 shrink-0" />
          <p className="text-xs text-indigo-200 leading-relaxed">
            카드 도감이나 전투 중 카드 위의 <span className="text-indigo-400 font-bold">?</span> 아이콘에 마우스를 올리면 각 효과의 상세 규칙을 언제든 확인할 수 있습니다.
          </p>
        </div>

        <button onClick={onClose} className="mt-8 w-full py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-xl shadow-lg transition-all active:scale-95">확인</button>
      </div>
    </div>
  );
}