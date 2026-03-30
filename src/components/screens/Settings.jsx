import React from 'react';
import { Settings as SettingsIcon, Download, Upload, Trash2, Key, FastForward, SkipForward, ArrowLeft, Unlock, Coins, Star, Bomb } from 'lucide-react';

export default function Settings({
  setGameState, fastMode, setFastMode, saveGame, handleExport, setImportModalOpen,
  couponInput, setCouponInput, handleCoupon, handleExitGame, isAdminUnlocked,
  adminCodeInput, setAdminCodeInput, handleAdminUnlock, adminUnlockAllCards,
  adminGiveMoney, adminUnlockAllRelics, adminClearSave, warpStage, setWarpStage, startBattle, getTotalCards, normalCleared
}) {
  return (
    <div className="flex flex-col items-center justify-start min-h-[100dvh] bg-slate-900 text-white p-4 md:p-10 pt-10 overflow-y-auto hide-scrollbar">
      <div className="w-full max-w-2xl flex justify-between items-center mb-8 shrink-0 relative z-10">
        <h1 className="text-3xl md:text-4xl font-black text-slate-300 flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-slate-400" /> 게임 설정
        </h1>
        <button onClick={() => setGameState('MENU')} className="py-2 px-6 bg-slate-700 hover:bg-slate-600 border border-slate-500 rounded-xl font-bold shadow-lg transition-all flex items-center gap-2">
          <ArrowLeft className="w-5 h-5"/> 메인으로
        </button>
      </div>

      <div className="w-full max-w-2xl flex flex-col gap-6">
        
        {/* 일반 설정 */}
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-4 border-b border-slate-600 pb-2">일반 설정</h2>
          <div className="flex justify-between items-center bg-slate-900 p-4 rounded-xl border border-slate-700">
            <div>
              <div className="font-bold text-indigo-400 flex items-center gap-2"><FastForward className="w-4 h-4"/> 빠른 전투 모드</div>
              <div className="text-xs text-slate-400 mt-1">적의 턴 애니메이션 속도를 대폭 높입니다.</div>
            </div>
            <button onClick={() => { setFastMode(!fastMode); saveGame({ fastMode: !fastMode }); }} className={`px-4 py-2 rounded-lg font-bold transition-colors ${fastMode ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-400'}`}>
              {fastMode ? '켜짐' : '꺼짐'}
            </button>
          </div>
        </div>

        {/* 쿠폰 입력 */}
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-4 border-b border-slate-600 pb-2">쿠폰 입력</h2>
          <div className="flex gap-2">
            <input type="text" value={couponInput} onChange={(e) => setCouponInput(e.target.value)} placeholder="쿠폰 코드를 입력하세요" className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white outline-none focus:border-amber-500 uppercase"/>
            <button onClick={handleCoupon} className="px-6 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg shadow-md transition-colors">확인</button>
          </div>
        </div>

        {/* 데이터 관리 */}
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-4 border-b border-slate-600 pb-2">데이터 관리</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <button onClick={handleExport} className="py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-bold flex items-center justify-center gap-2 border border-slate-600"><Download className="w-4 h-4"/> 세이브 백업 (복사)</button>
            <button onClick={() => setImportModalOpen(true)} className="py-3 bg-emerald-800 hover:bg-emerald-700 rounded-lg font-bold flex items-center justify-center gap-2 border border-emerald-600"><Upload className="w-4 h-4"/> 세이브 불러오기</button>
          </div>
          <button onClick={adminClearSave} className="w-full py-3 bg-red-900/50 hover:bg-red-800 rounded-lg font-bold text-red-400 hover:text-white flex items-center justify-center gap-2 border border-red-800 transition-colors">
            <Trash2 className="w-4 h-4"/> 모든 세이브 데이터 삭제 (초기화)
          </button>
        </div>

        {/* 개발자 도구 (관리자) */}
        <div className={`p-6 rounded-2xl border transition-all ${isAdminUnlocked ? 'bg-indigo-900/20 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'bg-slate-800 border-slate-700'}`}>
          <h2 className={`text-xl font-bold mb-4 border-b pb-2 flex items-center gap-2 ${isAdminUnlocked ? 'text-indigo-400 border-indigo-700' : 'text-slate-500 border-slate-600'}`}>
            <Key className="w-5 h-5"/> 개발자 테스트 도구
          </h2>
          
          {!isAdminUnlocked ? (
            <div className="flex gap-2">
              <input type="password" value={adminCodeInput} onChange={(e) => setAdminCodeInput(e.target.value)} placeholder="접근 코드가 필요합니다" className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white outline-none focus:border-indigo-500"/>
              <button onClick={handleAdminUnlock} className="px-6 bg-slate-700 hover:bg-indigo-600 text-white font-bold rounded-lg transition-colors">인증</button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button onClick={adminGiveMoney} className="py-2 bg-amber-600 hover:bg-amber-500 rounded-lg font-bold flex items-center justify-center gap-1 shadow-md"><Coins className="w-4 h-4"/> 돈 무한</button>
                <button onClick={adminUnlockAllCards} className="py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold flex items-center justify-center gap-1 shadow-md"><Unlock className="w-4 h-4"/> 모든 카드 해금</button>
                <button onClick={adminUnlockAllRelics} className="py-2 bg-fuchsia-600 hover:bg-fuchsia-500 rounded-lg font-bold flex items-center justify-center gap-1 shadow-md"><Star className="w-4 h-4"/> 모든 유물 해금</button>
              </div>
              
              {normalCleared && (
                <div className="bg-slate-900 p-4 rounded-xl border border-indigo-700 flex gap-2 items-center">
                   <div className="text-indigo-300 font-bold flex items-center gap-1 shrink-0"><SkipForward className="w-4 h-4"/> 스테이지 점프 :</div>
                   <input type="number" min="1" max="100" value={warpStage} onChange={(e) => setWarpStage(Number(e.target.value))} className="w-20 bg-slate-800 border border-slate-600 rounded p-1 text-center font-bold text-white outline-none"/>
                   <button onClick={() => { if(getTotalCards() !== 20) { alert('덱이 20장이 아닙니다.'); return; } startBattle('NORMAL', warpStage); }} className="flex-1 bg-indigo-600 hover:bg-indigo-500 py-2 rounded-lg font-bold">해당 층에서 시작</button>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}