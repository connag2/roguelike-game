import React from 'react';
import { Settings as SettingsIcon, FastForward, Download, Upload, Gift, AlertTriangle, Save, Terminal } from 'lucide-react';

export default function Settings({
  setGameState,
  fastMode, setFastMode,
  saveGame,
  handleExport,
  setImportModalOpen,
  couponInput, setCouponInput,
  handleCoupon,
  handleExitGame,
  isAdminUnlocked,
  adminCodeInput, setAdminCodeInput,
  handleAdminUnlock,
  adminUnlockAllCards,
  adminGiveMoney,
  warpStage, setWarpStage,
  startBattle,
  getTotalCards
}) {
  return (
    <div className="flex flex-col min-h-[100dvh] bg-slate-900 text-white p-6 md:p-10 relative">
      <div className="flex justify-between items-center mb-8 w-full max-w-3xl mx-auto pt-10 md:pt-0">
        <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-slate-400"/> 게임 설정
        </h2>
        <button onClick={() => setGameState('MENU')} className="py-2 px-4 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-bold shadow-md">메인으로</button>
      </div>

      <div className="w-full max-w-3xl mx-auto flex flex-col gap-6 overflow-y-auto hide-scrollbar pb-10">
        
        {/* 일반 옵션 */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-600 shadow-lg">
          <h3 className="text-xl font-bold mb-4 border-b border-slate-700 pb-2 text-indigo-300">옵션</h3>
          <div className="flex justify-between items-center">
            <div>
              <div className="font-bold flex items-center gap-2"><FastForward className="w-5 h-5 text-indigo-400"/> 빠른 전투 모드</div>
              <div className="text-sm text-slate-400 mt-1">적의 턴 진행과 애니메이션을 가속합니다.</div>
            </div>
            <button onClick={() => {
              const newVal = !fastMode;
              setFastMode(newVal);
              saveGame({ fastMode: newVal });
            }} className={`w-14 h-8 rounded-full transition-colors relative ${fastMode ? 'bg-indigo-500' : 'bg-slate-600'}`}>
              <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-transform ${fastMode ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        </div>

        {/* 세이브 데이터 관리 */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-600 shadow-lg">
          <h3 className="text-xl font-bold mb-4 border-b border-slate-700 pb-2 text-indigo-300">데이터 관리</h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <button onClick={handleExport} className="py-3 px-4 bg-slate-700 hover:bg-slate-600 rounded-lg font-bold flex-1 flex justify-center items-center gap-2 border border-slate-500 transition-colors">
              <Download className="w-5 h-5"/> 세이브 복사
            </button>
            <button onClick={() => setImportModalOpen(true)} className="py-3 px-4 bg-slate-700 hover:bg-slate-600 rounded-lg font-bold flex-1 flex justify-center items-center gap-2 border border-slate-500 transition-colors">
              <Upload className="w-5 h-5"/> 세이브 불러오기
            </button>
          </div>
        </div>

        {/* 쿠폰 코드 */}
        <div className="bg-slate-800 p-6 rounded-xl border border-yellow-700 shadow-lg">
          <h3 className="text-xl font-bold mb-4 border-b border-slate-700 pb-2 text-yellow-400 flex items-center gap-2">
            <Gift className="w-5 h-5"/> 쿠폰 코드 입력
          </h3>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="코드를 입력하세요" 
              className="flex-1 bg-slate-900 border border-slate-600 rounded-lg p-3 text-white outline-none focus:border-yellow-500 uppercase font-bold"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
            />
            <button onClick={handleCoupon} className="bg-yellow-600 hover:bg-yellow-500 px-6 py-2 rounded-lg font-bold text-white shadow-md">사용</button>
          </div>
        </div>

        {/* 시스템 종료 */}
        <div className="bg-gray-950 p-6 rounded-xl border-2 border-red-900 mt-6 shadow-red-900/20 shadow-2xl">
          <h3 className="text-xl font-bold mb-4 text-red-400 flex items-center gap-2 border-b border-red-900/30 pb-2">
            <AlertTriangle className="w-5 h-5"/> 프로그램 관리
          </h3>
          <button onClick={handleExitGame} className="w-full py-4 bg-red-700 hover:bg-red-600 rounded-xl font-black text-xl flex justify-center items-center gap-3 shadow-lg">
            <Save className="w-6 h-6"/> 저장 후 게임 종료
          </button>
        </div>

        {/* 관리자 콘솔 */}
        <div className="bg-gray-950 p-6 rounded-xl border border-red-900 mt-2">
          <h3 className="text-xl font-bold mb-4 border-b border-red-900 pb-2 flex items-center gap-2 text-red-400">
            <Terminal className="w-5 h-5"/> 관리자 모드
          </h3>
          {!isAdminUnlocked ? (
            <div className="flex gap-2">
              <input 
                type="password" 
                placeholder="관리자 코드 입력" 
                className="flex-1 bg-slate-800 border border-slate-600 rounded p-2 text-white outline-none focus:border-red-500"
                value={adminCodeInput}
                onChange={(e) => setAdminCodeInput(e.target.value)}
              />
              <button onClick={handleAdminUnlock} className="bg-red-700 hover:bg-red-600 px-4 py-2 rounded font-bold">인증</button>
            </div>
          ) : (
            <div className="flex flex-col gap-4 animate-draw">
              <div className="text-green-400 font-bold bg-green-900/30 border border-green-800 p-2 rounded text-center">✅ 개발자 권한 승인됨</div>
              <div className="flex gap-2">
                <button onClick={adminUnlockAllCards} className="flex-1 bg-slate-700 hover:bg-slate-600 py-3 rounded font-bold text-sm">모든 카드 해금</button>
                <button onClick={adminGiveMoney} className="flex-1 bg-yellow-700 hover:bg-yellow-600 py-3 rounded font-bold text-sm">크레딧 +99,999</button>
              </div>
              <div className="flex gap-2 items-center bg-slate-800 p-3 rounded border border-slate-700 mt-2">
                <span className="font-bold text-slate-300 whitespace-nowrap">층수 워프:</span>
                <input 
                  type="number" 
                  min="1" 
                  className="w-20 bg-slate-900 border border-slate-600 rounded p-2 text-center text-lg font-bold outline-none"
                  value={warpStage}
                  onChange={(e) => setWarpStage(parseInt(e.target.value) || 1)}
                />
                <button onClick={() => startBattle('NORMAL', warpStage)} disabled={getTotalCards() !== 20} className="flex-1 bg-indigo-700 hover:bg-indigo-600 py-2 rounded font-bold transition-colors">
                  해당 층으로 이동
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}