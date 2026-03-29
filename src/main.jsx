// src/components/screens/MainMenu.jsx
import React from 'react';
import { Sword, Coins, Book, Skull, Store, HelpCircle, Settings, Maximize, BarChart2 } from 'lucide-react'; // 💡 BarChart2 추가됨

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
  toggleFullScreen 
}) {
  return (

    
    <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-slate-900 text-white p-4 relative overflow-hidden">
      <button onClick={toggleFullScreen} className="fixed top-4 left-4 flex z-50 items-center gap-2 bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded text-sm font-bold transition-colors border border-slate-600">
        <Maximize className="w-4 h-4"/> <span className="hidden sm:inline">전체화면</span>
      </button>

      <Sword className="w-24 h-24 mb-6 text-indigo-500 animate-pulse" />
      <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-wider text-center">로그라이크 택틱스</h1>
      
      <div className="flex items-center gap-2 bg-yellow-900/50 text-yellow-400 px-4 py-2 rounded-full font-bold mb-8 border border-yellow-700 shadow-inner">
        <Coins className="w-5 h-5"/> {credits} 크레딧
      </div>
      
      <div className="flex flex-col gap-3 w-full max-w-[320px]">
        <button onClick={openDeckBuilder} className="py-3 px-6 bg-slate-700 hover:bg-slate-600 rounded-lg text-lg font-bold transition-all">
          덱 구성 ({getTotalCards()}/20)
        </button>
        {gameState === 'STATISTICS' && (
  <Statistics
    maxStageReached={maxStageReached}
    normalCleared={normalCleared}
    seenEnemies={seenEnemies}
    unlockedCards={unlockedCards}
    credits={credits}
    setGameState={setGameState}
  />
)}
        
        {/* 💡 도감, 적 정보, 통계를 3열 그리드로 변경 */}
        <div className="grid grid-cols-3 gap-2">
          <button onClick={openEncyclopedia} className="py-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-bold transition-all flex flex-col justify-center items-center gap-1 border border-slate-600">
            <Book className="w-5 h-5 text-blue-400"/> 도감
          </button>
          <button onClick={openMonsterDex} className="py-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-bold transition-all flex flex-col justify-center items-center gap-1 border border-slate-600">
            <Skull className="w-5 h-5 text-red-400"/> 적 정보
          </button>
          <button onClick={() => setGameState('STATISTICS')} className="py-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-bold transition-all flex flex-col justify-center items-center gap-1 border border-slate-600">
            <BarChart2 className="w-5 h-5 text-indigo-400"/> 통계
          </button>
        </div>

        <button onClick={openShop} className="py-3 px-6 bg-yellow-600 hover:bg-yellow-500 rounded-lg text-lg font-bold transition-all flex justify-center items-center gap-2 shadow-[0_0_10px_rgba(202,138,4,0.3)] mt-1">
          <Store className="w-5 h-5"/> 상점
        </button>

        <div className="flex gap-2 mt-1">
          <button onClick={() => setTutorialModalOpen(true)} className="py-3 bg-blue-800 hover:bg-blue-700 rounded-lg text-lg font-bold transition-all flex justify-center items-center gap-2 border border-blue-600 flex-1">
            <HelpCircle className="w-5 h-5"/> 방법
          </button>
          <button onClick={() => setGameState('SETTINGS')} className="py-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-lg font-bold transition-all flex justify-center items-center gap-2 border border-slate-600 flex-1">
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

        <button 
          onClick={() => startBattle('HARD')} 
          disabled={!normalCleared || getTotalCards() !== 20} 
          className={`py-2 px-6 rounded-lg text-base font-bold transition-all flex flex-col items-center ${normalCleared && getTotalCards() === 20 ? 'bg-red-700 hover:bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)] text-white' : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'}`}
        >
          하드 모드 (무한)
          {!normalCleared && <span className="text-[10px] text-red-400 mt-1">일반 100층 클리어 시 개방</span>}
        </button>
        
        {maxStageReached >= 50 && (
          <button onClick={() => setSkipModalOpen(true)} className="mt-2 py-2 px-6 rounded-lg text-base font-bold transition-all bg-emerald-700 hover:bg-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.4)] text-white flex flex-col items-center">
            스테이지 도약 (Skip)
            <span className="text-[10px] text-emerald-200 mt-1">원하는 층에서 시작</span>
          </button>
        )}
      </div>
    </div>
  );
}