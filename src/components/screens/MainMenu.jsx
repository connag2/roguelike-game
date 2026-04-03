import { Maximize, BarChart2, HelpCircle, Bell, Settings } from 'lucide-react';

export default function MainMenu({ 
  credits, 
  getTotalCards, 
  openDeckBuilder, 
  openEncyclopedia, 
  openMonsterDex, 
  openShop, 
  setTutorialModalOpen, 
  setGameState, 
  startBattle, 
  normalCleared, 
  maxStageReached, 
  setSkipModalOpen,
  setHardSkipModalOpen, // ✨ 추가
  toggleFullScreen 
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-slate-900 text-white p-4 relative overflow-hidden">
      <button onClick={toggleFullScreen} className="fixed top-4 left-4 flex z-50 items-center gap-2 bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded text-sm font-bold transition-colors border border-slate-600">
        <Maximize className="w-4 h-4"/> <span className="hidden sm:inline">전체화면</span>
      </button>

      <img src={heroImg} alt="Hero" className="w-24 h-24 mb-6 drop-shadow-[0_0_20px_rgba(99,102,241,0.6)] animate-pulse" />
      <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-wider text-center">로그라이크 모험</h1>
      
      <div className="flex items-center gap-2 bg-yellow-900/50 text-yellow-400 px-4 py-2 rounded-full font-bold mb-8 border border-yellow-700 shadow-inner">
        <img src={coinImg} alt="Coin" className="w-5 h-5 drop-shadow-sm" /> {credits} 크레딧
      </div>
      
      <div className="flex flex-col gap-3 w-full max-w-[280px]">
        <button onClick={openDeckBuilder} className="py-3 px-6 bg-slate-700 hover:bg-slate-600 rounded-lg text-lg font-bold transition-all">
          덱 구성 ({getTotalCards()}/20)
        </button>
        
        <div className="grid grid-cols-3 gap-2">
          <button onClick={openEncyclopedia} className="py-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-bold transition-all flex flex-col justify-center items-center gap-1 border border-slate-600">
            <img src={scrollImg} alt="Encyclopedia" className="w-6 h-6 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]" /> 도감
          </button>
          <button onClick={openMonsterDex} className="py-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-bold transition-all flex flex-col justify-center items-center gap-1 border border-slate-600">
            <img src={skeletonImg} alt="Monster Dex" className="w-6 h-6 drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]" /> 적 정보
          </button>
          <button onClick={() => setGameState('STATISTICS')} className="py-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-bold transition-all flex flex-col justify-center items-center gap-1 border border-slate-600">
            <BarChart2 className="w-5 h-5 text-indigo-400"/> 통계
          </button>
        </div>

        <button onClick={openShop} className="py-3 px-6 bg-yellow-600 hover:bg-yellow-500 rounded-lg text-lg font-bold transition-all flex justify-center items-center gap-2 shadow-[0_0_10px_rgba(217,119,6,0.5)]">
          <img src={merchantImg} alt="Shop" className="w-6 h-6 drop-shadow-md" /> 상점
        </button>

        <div className="grid grid-cols-3 gap-2 mt-1">
          <button onClick={() => setTutorialModalOpen(true)} className="py-3 bg-blue-800 hover:bg-blue-700 rounded-lg text-base font-bold transition-all flex flex-col justify-center items-center gap-1 border border-blue-600">
            <HelpCircle className="w-5 h-5"/> 방법
          </button>
          <button onClick={() => setGameState('UPDATE_HISTORY')} className="py-3 bg-emerald-800 hover:bg-emerald-700 rounded-lg text-base font-bold transition-all flex flex-col justify-center items-center gap-1 border border-emerald-600">
            <Bell className="w-5 h-5"/> 업데이트
          </button>
          <button onClick={() => setGameState('SETTINGS')} className="py-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-base font-bold transition-all flex flex-col justify-center items-center gap-1 border border-slate-600">
            <Settings className="w-5 h-5"/> 설정
          </button>
        </div>
        
        <hr className="border-slate-700 my-2" />
        
        <button 
          onClick={() => startBattle('NORMAL')} 
          disabled={getTotalCards() !== 20} 
          className={`py-3 px-6 rounded-lg text-lg font-bold transition-all ${getTotalCards() === 20 ? 'bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.5)]' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
        >
          일반 모드 (100층)
        </button>

        {/* ✨ [수정] 하드 모드 버튼 - 300층 표시 */}
        <button 
          onClick={() => startBattle('HARD')} 
          disabled={!normalCleared || getTotalCards() !== 20} 
          className={`py-2 px-6 rounded-lg text-base font-bold transition-all flex flex-col items-center ${normalCleared && getTotalCards() === 20 ? 'bg-red-700 hover:bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)]' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
        >
          하드 모드 (300층)
          {!normalCleared && <span className="text-[10px] text-red-400 mt-1">일반 100층 클리어 시 개방</span>}
        </button>
        
        {/* ✨ [수정] 일반 모드 건너뛰기 - maxStageReached >= 50 */}
        {maxStageReached >= 50 && !normalCleared && (
          <button onClick={() => setSkipModalOpen(true)} className="mt-2 py-2 px-6 rounded-lg text-base font-bold transition-all bg-emerald-700 hover:bg-emerald-600 shadow-[0_0_15px_rgba(16,185,128,0.5)] flex flex-col items-center">
            ⭐ 일반 모드 도약
            <span className="text-[10px] text-emerald-200 mt-1">원하는 층에서 시작</span>
          </button>
        )}

        {/* ✨ [추가] 하드 모드 건너뛰기 - normalCleared && maxStageReached >= 50 */}
        {normalCleared && maxStageReached >= 50 && (
          <button onClick={() => setHardSkipModalOpen(true)} className="mt-2 py-2 px-6 rounded-lg text-base font-bold transition-all bg-red-700 hover:bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)] flex flex-col items-center">
            🔥 하드 모드 도약
            <span className="text-[10px] text-red-200 mt-1">원하는 층에서 시작</span>
          </button>
        )}
      </div>
    </div>
  );
}