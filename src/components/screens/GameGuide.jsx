import React from 'react';
import { X, Zap, Shield, Heart, Brain } from 'lucide-react';

export default function GameGuide({ isOpen, onClose }) {
  if (!isOpen) return null;

  const guides = [
    {
      title: "🎮 게임 기본 설명",
      icon: <Brain className="w-6 h-6" />,
      content: `로그라이크 전술 게임입니다. 매 전투마다 새로운 카드 조합으로 도전하세요.
      
목표: 최대한 높은 층수까지 진행하기
난이도: 층이 높아질수록 적의 체력과 공격력이 증가합니다.

✨ 팁: 균형 잡힌 덱 구성(공격+방어+회복)이 중요합니다!`
    },
    {
      title: "⚔️ 전투 시스템",
      icon: <Zap className="w-6 h-6" />,
      content: `• 플레이어 차례: 카드를 선택하고 마나를 소비합니다
• 적 차례: 적의 의도(Icon)를 읽고 준비하세요
• 상태이상: 약화, 취약, 중독, 표식, 허약, 침묵, 속박

🎯 팁: 적의 다음 행동을 예측하고 방어하세요!`
    },
    {
      title: "🛡️ 방어 및 상태 시스템",
      icon: <Shield className="w-6 h-6" />,
      content: `방어도: 한 차례에만 적용되며, 턴 종료 시 초기화됩니다
약화(약): 자신의 공격력 -25%
취약(취): 적의 공격력 +30%
중독: 매 턴마다 해당 수치만큼 피해

📌 전략: 취약 상태에서는 높은 마나 카드를 자제하세요`
    },
    {
      title: "❤️ 회복 및 유지",
      icon: <Heart className="w-6 h-6" />,
      content: `• 전투 중: 치유 카드로 즉시 회복
• 전투 후: 보스 격파 시 일부 회복
• 유물 효과: 유물에 따라 추가 회복 가능

💡 팁: HP가 50% 이하면 보수적으로 플레이하세요`
    },
    {
      title: "🏆 보스 및 보상",
      icon: <Zap className="w-6 h-6" />,
      content: `일반 모드:
• 5층마다: 일반 보스 (10% 확률로 스킬 드롭)
• 25, 50, 75층: 특수 보스 (100% 확률로 스킬 드롭)
• 100층: 게임 클리어

하드 모드:
• 10층마다: 일반 보스 (10% 확률로 스킬 드롭)
• 50층마다: 특수 보스 (100% 확률로 스킬 드롭)
• 300층: 게임 클리어

✨ 보스 스킬은 랜덤으로 선택되어 드롭됩니다!`
    },
    {
      title: "🎯 덱 구성 팁",
      icon: <Brain className="w-6 h-6" />,
      content: `추천 구성:
• 공격 카드 40-50%
• 방어 카드 30-40%
• 회복 카드 10-20%

마나 관련 카드는 최대 2장까지만 추가 가능합니다.
시너지를 맞춰서 덱을 꾸려보세요!`
    },
    {
      title: "🌟 상급 전략",
      icon: <Zap className="w-6 h-6" />,
      content: `• 카운팅: 적의 의도 패턴을 파악하세요
• 버프 최대화: 근력+민첩 조합으로 공격력 증대
• 디버프 관리: 취약 상태에서 고비용 카드 피하기
• 카드 신너지: 같은 타입의 카드들을 조합하기

💪 숙달하면 어려운 층도 충분히 클리어 가능합니다!`
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border-2 border-indigo-500 rounded-2xl w-full max-w-2xl shadow-2xl my-8">
        <div className="flex justify-between items-center p-6 border-b border-slate-700 bg-slate-800/50">
          <h2 className="text-2xl font-black text-indigo-400">📖 게임 가이드</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white bg-slate-700 hover:bg-slate-600 p-2 rounded-lg transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto hide-scrollbar">
          {guides.map((guide, idx) => (
            <div key={idx} className="bg-slate-800 border border-slate-700 rounded-xl p-4 hover:border-indigo-500 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-indigo-400">{guide.icon}</div>
                <h3 className="text-lg font-bold text-white">{guide.title}</h3>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap break-keep">
                {guide.content}
              </p>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-slate-700 bg-slate-800/50 flex justify-end">
          <button onClick={onClose} className="py-2 px-6 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-bold transition-colors">
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}