import React, { useState } from 'react';
import { Bell, ArrowLeft, Star, Zap, Crown, ChevronDown, ChevronUp, AlertTriangle, Monitor } from 'lucide-react';

export default function UpdateHistory({ setGameState }) {
  // 접고 펴기 상태 관리 (최신 버전은 기본으로 열어둠)
  const [expandedVersions, setExpandedVersions] = useState(['v1.1.2']);

  const toggleVersion = (version) => {
    if (expandedVersions.includes(version)) {
      setExpandedVersions(expandedVersions.filter(v => v !== version));
    } else {
      setExpandedVersions([...expandedVersions, version]);
    }
  };

  const updates = [
    {
      version: 'v1.1.2',
      title: '밸런스 및 UI 최적화 패치',
      tag: '최신',
      date: '2026.03.31',
      changes: [
        { icon: <AlertTriangle className="w-4 h-4 text-red-400" />, text: "약화 밸런스 조정: 중첩 효율 과부하 방지를 위해 대미지 감소율을 25% → 3%로 하향 조정했습니다.", color: "text-red-400 font-bold" },
        { icon: <Monitor className="w-4 h-4 text-cyan-400" />, text: "툴팁 UI 개선: 설명창이 카드 틀에 갇히지 않도록 레이아웃을 수정하고 디자인을 간결하게 변경했습니다." },
        { icon: <Zap className="w-4 h-4 text-yellow-400" />, text: "이펙트 최적화: 일반/희귀 등급 공격 이펙트의 크기를 줄여 전투 시인성을 높였습니다." }
      ]
    },
    {
      version: 'v1.1.0',
      title: '유물 및 도감 대규모 업데이트',
      date: '2026.03.25',
      changes: [
        { icon: <Star className="w-4 h-4 text-yellow-400" />, text: "신규 시스템 '유물': 적 처치 시 확률적으로 강력한 효과를 지닌 유물 드랍 기능 추가." },
        { icon: <Zap className="w-4 h-4 text-indigo-400" />, text: "도감 강화: 유물 도감 및 상세 업적 통계 기능 추가." },
        { icon: <Crown className="w-4 h-4 text-amber-400" />, text: "100층 클리어 특전: 클리어 유저 대상 '시작 유물 선택권' 부여." }
      ]
    },
    {
      version: 'v1.0.0',
      title: '로그라이크 택틱스 정식 출시',
      date: '2026.03.10',
      changes: [
        { icon: <Star className="w-4 h-4 text-emerald-400" />, text: "기본 전투 시스템 및 덱 빌딩 시스템 구축." },
        { icon: <Star className="w-4 h-4 text-emerald-400" />, text: "100층 돌파 모드 및 카드 상점 시스템 추가." }
      ]
    }
  ];

  return (
    <div className="flex flex-col items-center justify-start min-h-[100dvh] bg-slate-900 text-white p-4 md:p-10 pt-10 overflow-y-auto hide-scrollbar">
      <h1 className="text-3xl md:text-5xl font-black mb-10 text-emerald-400 drop-shadow-lg flex items-center gap-3">
        <Bell className="w-8 h-8 md:w-12 md:h-12" /> 업데이트 내역
      </h1>

      <div className="w-full max-w-4xl space-y-4 mb-10">
        {updates.map((update) => {
          const isExpanded = expandedVersions.includes(update.version);
          return (
            <div key={update.version} className={`bg-slate-800 rounded-2xl border transition-all duration-300 ${isExpanded ? 'border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.2)]' : 'border-slate-700 opacity-80'}`}>
              {/* 헤더 섹션 (클릭 시 토글) */}
              <button 
                onClick={() => toggleVersion(update.version)}
                className="w-full p-5 md:p-6 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-3">
                  {update.tag && <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">{update.tag}</span>}
                  <span className={`text-lg md:text-xl font-bold ${isExpanded ? 'text-white' : 'text-slate-400'}`}>{update.version}</span>
                  <h2 className={`text-base md:text-lg font-bold ${isExpanded ? 'text-indigo-300' : 'text-slate-500'}`}>{update.title}</h2>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-slate-500 hidden md:block">{update.date}</span>
                  {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </div>
              </button>

              {/* 상세 내용 섹션 (애니메이션 적용) */}
              {isExpanded && (
                <div className="px-5 md:px-8 pb-6 space-y-4 border-t border-slate-700/50 pt-4 animate-in slide-in-from-top-2 duration-300">
                  <ul className="space-y-3">
                    {update.changes.map((change, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm md:text-base text-slate-300 leading-relaxed">
                        <div className="mt-1 shrink-0">{change.icon}</div>
                        <span className={change.color || ""}>{change.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button onClick={() => setGameState('MENU')} className="py-4 px-10 bg-indigo-600 hover:bg-indigo-500 rounded-full font-bold text-xl shadow-lg transition-all flex items-center gap-2 hover:-translate-y-1 active:scale-95">
        <ArrowLeft className="w-6 h-6" /> 메인으로 돌아가기
      </button>
    </div>
  );
}