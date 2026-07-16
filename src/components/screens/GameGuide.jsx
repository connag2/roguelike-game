import React, { useState } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';

export default function GameGuide({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState(null);

  if (!isOpen) return null;

  const toggleTab = (tab) => {
    setActiveTab(activeTab === tab ? null : tab);
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-[99999] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-slate-900 border-2 border-indigo-500 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-[0_0_30px_rgba(99,102,241,0.3)] overflow-hidden" onClick={e => e.stopPropagation()}>
        
        <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800">
          <h2 className="text-2xl font-black text-indigo-400">게임 가이드</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-full transition-colors text-slate-300">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scroll text-slate-200">
          
          {/* 섹션 1: 기본 룰 */}
          <div className="mb-4 bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <button onClick={() => toggleTab('basics')} className="w-full p-4 flex justify-between items-center font-bold text-lg hover:bg-slate-700 transition-colors">
              <span>📖 기본 게임플레이</span>
              {activeTab === 'basics' ? <ChevronUp /> : <ChevronDown />}
            </button>
            {activeTab === 'basics' && (
              <div className="p-4 bg-slate-900 text-sm leading-relaxed border-t border-slate-700">
                - 플레이어는 매 턴 <strong>정해진 마나</strong>를 소모하여 카드를 사용합니다.<br/>
                - 내 턴이 끝나면 적들의 <strong>행동(의도)</strong>이 실행됩니다.<br/>
                - 덱을 20장 꽉 채워야 전투에 진입할 수 있습니다.<br/>
                - 체력이 0이 되면 게임 오버이며, 클리어 시 스테이지에 따라 보상을 받습니다.
              </div>
            )}
          </div>

          {/* 섹션 2: 버프 (Buffs) */}
          <div className="mb-4 bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <button onClick={() => toggleTab('buffs')} className="w-full p-4 flex justify-between items-center font-bold text-lg hover:bg-slate-700 transition-colors text-blue-400">
              <span>🟢 버프 효과 (강화)</span>
              {activeTab === 'buffs' ? <ChevronUp /> : <ChevronDown />}
            </button>
            {activeTab === 'buffs' && (
              <div className="p-4 bg-slate-900 text-sm leading-relaxed border-t border-slate-700 space-y-2">
                <div><span className="bg-red-900/50 text-red-400 px-2 py-1 rounded font-bold text-xs">근력 (Strength)</span> 공격 카드의 피해량이 증가합니다.</div>
                <div><span className="bg-blue-900/50 text-blue-400 px-2 py-1 rounded font-bold text-xs">민첩 (Dexterity)</span> 방어 카드의 방어도 획득량이 증가합니다.</div>
                <div><span className="bg-green-900/50 text-green-400 px-2 py-1 rounded font-bold text-xs">가시 (Thorns)</span> 피격 시 스택만큼 적에게 피해를 반사합니다.</div>
                <div><span className="bg-pink-900/50 text-pink-400 px-2 py-1 rounded font-bold text-xs">재생 (Regen)</span> 턴 종료 시 스택만큼 체력을 회복합니다.</div>
                <div><span className="bg-gray-700/50 text-white px-2 py-1 rounded font-bold text-xs">무형 (Intangible)</span> 받는 모든 피해가 1로 고정됩니다.</div>
              </div>
            )}
          </div>

          {/* 섹션 3: 디버프 (Debuffs) */}
          <div className="mb-4 bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <button onClick={() => toggleTab('debuffs')} className="w-full p-4 flex justify-between items-center font-bold text-lg hover:bg-slate-700 transition-colors text-red-400">
              <span>🔴 디버프 효과 (약화)</span>
              {activeTab === 'debuffs' ? <ChevronUp /> : <ChevronDown />}
            </button>
            {activeTab === 'debuffs' && (
              <div className="p-4 bg-slate-900 text-sm leading-relaxed border-t border-slate-700 space-y-2">
                <div><span className="bg-orange-900/50 text-orange-400 px-2 py-1 rounded font-bold text-xs">약화 (Weak)</span> 가하는 공격 피해량이 3% 감소합니다. (중첩당 시간 증가)</div>
                <div><span className="bg-purple-900/50 text-purple-400 px-2 py-1 rounded font-bold text-xs">취약 (Vulnerable)</span> 받는 피해량이 30% 증가합니다.</div>
                <div><span className="bg-emerald-900/50 text-emerald-400 px-2 py-1 rounded font-bold text-xs">독 (Poison)</span> 턴 시작 시 스택만큼 방어도를 무시하는 피해를 입습니다.</div>
                <div><span className="bg-amber-900/50 text-amber-500 px-2 py-1 rounded font-bold text-xs">쇠약 (Frail)</span> 방어 카드 사용 시 획득하는 방어도가 25% 감소합니다.</div>
                <div><span className="bg-slate-700 text-slate-300 px-2 py-1 rounded font-bold text-xs">침묵 (Silence)</span> 스킬/주문 카드를 사용할 수 없습니다.</div>
                <div><span className="bg-red-950 text-red-500 px-2 py-1 rounded font-bold text-xs">속박 (Bind)</span> 공격 카드를 사용할 수 없습니다.</div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}