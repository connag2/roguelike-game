import React from 'react';
import { Bell, ArrowLeft, Star, Zap, Crown } from 'lucide-react';

export default function UpdateHistory({ setGameState }) {
  return (
    <div className="flex flex-col items-center justify-start min-h-[100dvh] bg-slate-900 text-white p-4 md:p-10 pt-10 overflow-y-auto hide-scrollbar">
      <h1 className="text-3xl md:text-5xl font-black mb-10 text-emerald-400 drop-shadow-lg flex items-center gap-3">
        <Bell className="w-8 h-8 md:w-12 md:h-12" /> 업데이트 내역
      </h1>

      <div className="w-full max-w-4xl bg-slate-800 p-6 md:p-8 rounded-3xl border border-slate-700 shadow-2xl mb-10">
        <div className="space-y-10">
          
          {/* 최신 업데이트 */}
          <div className="border-b border-slate-700 pb-8 last:border-0 last:pb-0">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-emerald-600 text-white text-xs font-bold px-2 py-1 rounded-md">최신</span>
              <h2 className="text-2xl font-bold text-emerald-400">v1.1.0 - 유물 및 도감 대규모 업데이트</h2>
            </div>
            <ul className="space-y-4 text-slate-300 text-sm md:text-base">
              <li className="flex items-start gap-2">
                <Star className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-yellow-400">신규 시스템 '유물':</span> 적 처치 시 확률적으로 강력한 효과를 지닌 유물 드랍! <br/>
                  <span className="text-xs text-slate-400">(일반 몬스터 5%, 일반 보스 20%, 전설 보스 50%)</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Zap className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-indigo-400">도감 및 통계 강화:</span> 유물 도감 추가, 업적 갤러리 및 상세 달성률 확인 기능 추가.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Crown className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-400">100층 클리어 특전:</span> 게임 클리어 시, 다음 게임부터 <b>원하는 시작 유물 1개</b>를 선택 가능.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-black shrink-0 mt-0.5 text-lg leading-none">!!!</span>
                <div>
                  <span className="font-bold text-red-400">신화 등급 도입:</span> 100층 보스 처치 시 25% 확률로 신화 등급 특수 카드 <span className="text-white">Furioso</span> 획득!
                </div>
              </li>
            </ul>
          </div>

          {/* 이전 업데이트 */}
          <div className="border-b border-slate-700 pb-8 last:border-0 last:pb-0 opacity-70">
            <h2 className="text-xl font-bold text-slate-400 mb-3">v1.0.0 - 정식 출시</h2>
            <ul className="list-disc list-inside space-y-2 text-slate-500 text-sm md:text-base ml-2">
              <li>로그라이크 택틱스 기본 전투 시스템 구축</li>
              <li>덱 빌딩, 카드 상점, 100층 돌파 모드 추가</li>
              <li>다양한 상태 이상 및 몬스터 패턴 추가</li>
            </ul>
          </div>

        </div>
      </div>

      <button onClick={() => setGameState('MENU')} className="py-4 px-10 bg-indigo-600 hover:bg-indigo-500 rounded-full font-bold text-xl shadow-lg transition-all flex items-center gap-2 hover:-translate-y-1">
        <ArrowLeft className="w-6 h-6" /> 메인으로 돌아가기
      </button>
    </div>
  );
}