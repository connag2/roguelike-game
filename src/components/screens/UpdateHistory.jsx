import React, { useState } from 'react';
import { Bell, ArrowLeft, Star, Zap, Crown, ChevronDown, ChevronUp, AlertTriangle, Monitor, Gift, CheckCircle, X } from 'lucide-react';

// ⚠️ App.jsx에서 usedCoupons 배열을 props로 넘겨주어야 "사용 완료" 여부가 정확히 뜹니다.
export default function UpdateHistory({ setGameState, usedCoupons = [] }) {
  const [expandedVersions, setExpandedVersions] = useState(['v1.1.3']);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);

  // ✨ 현재 유저에게 공개할 쿠폰 목록 (50층 워프, 50층/75층 보상 등 비밀 코드는 제외됨)
  const PUBLIC_COUPONS = [
    { code: 'WELCOME', desc: '신규 유저 환영 패키지 (크레딧 지급)' },
    { code: 'SHOWMETHEMONEY', desc: '대량의 크레딧 지원금' },
    { code: 'GIVEMERELIC', desc: '무작위 유물 1개 획득' },
    { code: 'HEALME', desc: '체력 전체 즉시 회복' },
    // 필요에 따라 App.jsx에 설정하신 실제 공개용 코드 이름으로 수정해서 사용하세요!
  ];

  const toggleVersion = (version) => {
    if (expandedVersions.includes(version)) {
      setExpandedVersions(expandedVersions.filter(v => v !== version));
    } else {
      setExpandedVersions([...expandedVersions, version]);
    }
  };

  const updates = [
    {
      version: 'v1.1.3',
      title: '신규 상태이상 및 도감 필터 대규모 패치',
      tag: '최신',
      date: '2026.04.01',
      changes: [
        { icon: <Star className="w-4 h-4 text-emerald-400" />, text: "도감 편의성 개선: 카드 및 유물 도감에 [전체 / 보유 / 미보유] 필터가 추가되었습니다.", color: "text-emerald-400 font-bold" },
        { icon: <Zap className="w-4 h-4 text-amber-400" />, text: "신규 버프 4종 추가: 무형(피해 1 고정), 재생(턴당 회복), 격노(공격시 방어도), 통찰(추가 드로우) 효과가 추가되었습니다." },
        { icon: <AlertTriangle className="w-4 h-4 text-red-400" />, text: "신규 디버프 4종 추가: 표식(추가 타격 피해), 허약(방어도 획득 감소), 침묵(스킬 불가), 속박(공격 불가) 효과가 추가되었습니다." },
        { icon: <Monitor className="w-4 h-4 text-cyan-400" />, text: "전투 UI 업데이트: 플레이어 및 적 개체의 신규 상태이상 8종 아이콘이 전투 화면에 직관적으로 표시되도록 개선되었습니다." }
      ]
    },
    {
      version: 'v1.1.2',
      title: '밸런스 및 UI 최적화 패치',
      date: '2026.03.31',
      changes: [
        { icon: <AlertTriangle className="w-4 h-4 text-red-400" />, text: "약화 밸런스 조정: 중첩 효율 과부하 방지를 위해 대미지 감소율을 25% → 3%로 하향 조정했습니다." },
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
    <div className="flex flex-col items-center justify-start min-h-[100dvh] bg-slate-900 text-white p-4 md:p-10 pt-10 overflow-y-auto hide-scrollbar relative">
      <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-4xl mb-10 gap-4">
        <h1 className="text-3xl md:text-5xl font-black text-emerald-400 drop-shadow-lg flex items-center gap-3">
          <Bell className="w-8 h-8 md:w-12 md:h-12" /> 업데이트 내역
        </h1>
        
        {/* ✨ 쿠폰 보기 버튼 추가 */}
        <button 
          onClick={() => setIsCouponModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 rounded-xl font-black text-white shadow-lg transition-transform hover:-translate-y-1 active:scale-95 border border-amber-400"
        >
          <Gift className="w-5 h-5" /> 현재 공개된 쿠폰 보기
        </button>
      </div>

      <div className="w-full max-w-4xl space-y-4 mb-10">
        {updates.map((update) => {
          const isExpanded = expandedVersions.includes(update.version);
          return (
            <div key={update.version} className={`bg-slate-800 rounded-2xl border transition-all duration-300 ${isExpanded ? 'border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.2)]' : 'border-slate-700 opacity-80'}`}>
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

      {/* ✨ 쿠폰 목록 모달창 */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-800 w-full max-w-lg rounded-3xl border-2 border-amber-500/50 shadow-[0_0_40px_rgba(245,158,11,0.2)] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-slate-900 p-5 border-b border-slate-700 flex justify-between items-center">
              <h2 className="text-2xl font-black text-amber-400 flex items-center gap-2">
                <Gift className="w-6 h-6" /> 배포된 쿠폰 코드
              </h2>
              <button onClick={() => setIsCouponModalOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                <X className="w-7 h-7" />
              </button>
            </div>
            
            <div className="p-5 max-h-[60vh] overflow-y-auto hide-scrollbar space-y-3 bg-slate-800">
              {PUBLIC_COUPONS.map((coupon, idx) => {
                const isUsed = usedCoupons.includes(coupon.code.toUpperCase());
                return (
                  <div key={idx} className={`flex items-center justify-between p-4 rounded-xl border ${isUsed ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-700 border-slate-600 shadow-md'}`}>
                    <div>
                      <div className={`font-black text-lg tracking-wider mb-1 ${isUsed ? 'text-slate-500 line-through' : 'text-indigo-300 select-all'}`}>
                        {coupon.code}
                      </div>
                      <div className={`text-sm font-medium ${isUsed ? 'text-slate-600' : 'text-slate-300'}`}>
                        {coupon.desc}
                      </div>
                    </div>
                    
                    <div className="shrink-0 ml-4">
                      {isUsed ? (
                        <div className="flex flex-col items-center gap-1 text-slate-500">
                          <CheckCircle className="w-6 h-6" />
                          <span className="text-[10px] font-bold">사용 완료</span>
                        </div>
                      ) : (
                        <div className="bg-emerald-600/20 text-emerald-400 border border-emerald-500/50 px-3 py-1.5 rounded-lg text-xs font-bold animate-pulse">
                          사용 가능!
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              
              <div className="mt-4 p-3 bg-slate-900/50 rounded-lg text-center border border-slate-700">
                <p className="text-xs text-slate-400">💡 코드는 <span className="text-amber-400 font-bold">설정 메뉴</span>에서 입력할 수 있습니다.<br/>(드래그해서 복사 가능!)</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}