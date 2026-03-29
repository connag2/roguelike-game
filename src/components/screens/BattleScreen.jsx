import React, { useEffect } from 'react';
import { Shield, RefreshCw, Skull, ArrowRightCircle, HelpCircle } from 'lucide-react';
import Card from '../common/Card';

export default function BattleScreen({
  combatState,
  isPlayerTurn,
  setViewingPile,
  setGameState,
  hoveredCard,
  setHoveredCard,
  playCard,
  setCombatState,
  MAX_HAND_SIZE,
  setShowEnemyDeck,
  setViewingEnemy,
  setTutorialModalOpen
}) {
  if (!combatState) return null;
  const { player, enemies, hand, stage, drawPile, discardPile, baseDeck, mode } = combatState;

  return (
    <div className="flex flex-col h-[100dvh] bg-slate-900 text-white p-2 md:p-4 relative overflow-hidden">
      {/* 상단 정보바 */}
      <div className="flex justify-between items-center bg-slate-800/80 p-2 md:p-3 rounded-lg border border-slate-700 shadow-md z-10 shrink-0">
        <div className="font-bold text-sm md:text-lg flex items-center gap-1 md:gap-2 text-indigo-300">
          <RefreshCw className="w-4 h-4 md:w-5 md:h-5" /> {mode === 'HARD' ? '하드 모드' : '일반 모드'} - STAGE {stage} 
        </div>
        <div className="flex items-center gap-2 md:gap-4 font-bold text-xs md:text-base">
          <button 
            onClick={() => setTutorialModalOpen(true)}
            className="bg-slate-700 hover:bg-slate-600 p-2 rounded-full border border-slate-500 transition-colors"
            title="전투 방법"
          >
            <HelpCircle className="w-4 h-4 md:w-5 md:h-5 text-indigo-300" />
          </button>
          <span 
            className="text-slate-400 cursor-pointer hover:text-white transition-colors bg-slate-700/50 px-2 py-1 rounded border border-slate-600"
            onClick={() => setViewingPile('baseDeck')}
          >
            총 덱: {baseDeck.length}장 (보기)
          </span>
          <button onClick={() => setGameState('GAME_OVER')} className="text-slate-500 hover:text-red-500 opacity-60 hover:opacity-100 transition-all border border-slate-600 rounded px-2 py-1">포기</button>
        </div>
      </div>

      {/* 턴 배경 텍스트 */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0 opacity-[0.03]">
        <h1 className="text-[8rem] md:text-[12rem] font-black italic whitespace-nowrap tracking-tighter">
          {isPlayerTurn ? 'PLAYER TURN' : 'ENEMY TURN'}
        </h1>
      </div>

      {/* 중앙 전투 영역 */}
      <div className="flex-1 flex flex-row justify-center items-end pb-8 border-b-2 border-slate-700/50 w-full max-w-5xl mx-auto mt-10 relative z-10">
        
        {/* 플레이어 영역 */}
        <div className={`flex flex-col items-center w-1/3 min-w-[120px] transition-all duration-500 origin-bottom ${isPlayerTurn ? 'scale-110 z-30' : 'scale-95 opacity-50 z-10'}`}>
          <div className="w-20 h-20 md:w-32 md:h-32 bg-slate-700 rounded-full flex justify-center items-center mb-2 md:mb-4 border-4 border-indigo-500 relative shadow-2xl">
            <Shield className="w-10 h-10 md:w-16 md:h-16 text-indigo-300" />
            {player.block > 0 && <div className="absolute -top-2 -right-2 md:-top-4 md:-right-4 bg-blue-600 w-8 h-8 md:w-10 md:h-10 rounded-full flex justify-center items-center font-bold border-2 border-blue-300 animate-bounce text-xs md:text-base">{player.block}</div>}
          </div>
          <h3 className="text-base md:text-xl font-bold mb-1 md:mb-2 text-indigo-300">플레이어</h3>
          <div className="w-full max-w-[120px] md:max-w-[200px] bg-slate-800 h-4 md:h-6 rounded-full overflow-hidden border border-slate-600 relative">
            <div className="bg-green-500 h-full transition-all duration-300" style={{ width: `${(player.hp / player.maxHp) * 100}%` }}/>
            <span className="absolute inset-0 flex justify-center items-center text-[9px] md:text-xs font-bold drop-shadow-md">{player.hp} / {player.maxHp}</span>
          </div>

          {/* 플레이어 버프/디버프 */}
          <div className="flex gap-1 md:gap-2 h-8 mt-1 flex-wrap justify-center">
            {player.buffs?.strength > 0 && <span className="bg-red-900 text-red-100 text-[10px] px-2 py-0.5 rounded-full border border-red-500 shadow-md">근력 +{player.buffs.strength}</span>}
            {player.buffs?.dexterity > 0 && <span className="bg-blue-900 text-blue-100 text-[10px] px-2 py-0.5 rounded-full border border-blue-500 shadow-md">민첩 +{player.buffs.dexterity}</span>}
            {player.buffs?.thorns > 0 && <span className="bg-emerald-900 text-emerald-100 text-[10px] px-2 py-0.5 rounded-full border border-emerald-500 shadow-md">가시 {player.buffs.thorns}</span>}
            {player.debuffs?.poison > 0 && <span className="bg-green-900 text-green-100 text-[10px] px-2 py-0.5 rounded-full border border-green-500 shadow-md">중독 {player.debuffs.poison}</span>}
            {player.debuffs?.weak > 0 && <span className="bg-orange-800 text-white text-[10px] px-2 py-0.5 rounded-full border border-orange-500 animate-pulse">약화 {player.debuffs.weak}</span>}
            {player.debuffs?.vulnerable > 0 && <span className="bg-purple-800 text-white text-[10px] px-2 py-0.5 rounded-full border border-purple-500 animate-pulse">취약 {player.debuffs.vulnerable}</span>}
          </div>
        </div>

        <div className="text-3xl md:text-5xl font-black text-slate-700 italic px-6 pb-16">VS</div>

        {/* 적 영역 */}
        <div className="flex flex-row gap-4 md:gap-8 justify-center items-end flex-wrap w-1/2">
          {enemies.map((enemy, idx) => {
            const isVanguard = idx === 0;
            const eCard = enemy.intentCard;
            return (
              <div key={enemy.uid} className={`flex flex-col items-center cursor-pointer transition-all duration-500 origin-bottom w-[110px] md:w-auto ${!isPlayerTurn ? 'scale-110 z-30' : isVanguard ? 'scale-100 opacity-80' : 'scale-90 opacity-50'}`} onClick={() => { setViewingEnemy(enemy); setShowEnemyDeck(true); }}>
                {isVanguard && <div className="text-red-500 font-black text-[10px] md:text-base animate-bounce mb-1 tracking-widest">▼ 타겟</div>}
                <div className="mb-4 md:mb-6 relative z-10">
                  <div className={`w-24 md:w-28 bg-slate-900 border-2 rounded-lg p-2 shadow-xl text-center ${eCard.type.includes('attack') ? 'border-red-500' : 'border-blue-500'}`}>
                    <div className="text-[10px] md:text-sm font-bold truncate text-white">{eCard.name}</div>
                    <div className="text-[8px] md:text-[10px] text-slate-400 mt-1 line-clamp-2">{eCard.desc}</div>
                  </div>
                </div>
                <div className={`rounded-full flex justify-center items-center mb-1 md:mb-2 border-4 shadow-2xl relative ${enemy.isBoss ? 'bg-red-950 border-red-400 w-20 h-20 md:w-32 md:h-32' : 'bg-red-900/40 border-red-500 w-16 h-16 md:w-24 md:h-24'}`}>
                  <Skull className={`${enemy.isBoss ? 'w-10 h-10 md:w-16 md:h-16 text-red-300' : 'w-8 h-8 md:w-12 md:h-12 text-red-400'}`} />
                  {enemy.block > 0 && <div className="absolute -top-1 -right-1 md:-top-2 md:-right-2 bg-slate-600 w-6 h-6 md:w-8 md:h-8 rounded-full flex justify-center items-center font-bold border-2 border-slate-400 text-[10px] md:text-sm">{enemy.block}</div>}
                </div>
                <h3 className={`text-xs md:text-lg font-bold mb-1 ${enemy.isBoss ? 'text-red-300' : 'text-red-400'} truncate w-full text-center`}>{enemy.name}</h3>
                <div className="w-full max-w-[100px] md:max-w-[140px] bg-slate-800 h-3 md:h-5 rounded-full overflow-hidden border border-slate-600 relative">
                  <div className={`${enemy.isBoss ? 'bg-red-600' : 'bg-red-500'} h-full transition-all duration-300`} style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }}/>
                  <span className="absolute inset-0 flex justify-center items-center text-[8px] md:text-[10px] font-bold drop-shadow-md">{enemy.hp} / {enemy.maxHp}</span>
                </div>
                <div className="flex gap-1 h-5 md:h-6 mt-1 flex-wrap justify-center w-full">
                  {enemy.debuffs?.poison > 0 && <span className="bg-green-900 text-green-400 text-[8px] px-1 rounded-full border border-green-500">중독 {enemy.debuffs.poison}</span>}
                  {enemy.debuffs?.weak > 0 && <span className="bg-orange-800 text-white text-[8px] px-1 rounded-full border border-orange-500">약화 {enemy.debuffs.weak}</span>}
                  {enemy.debuffs?.vulnerable > 0 && <span className="bg-purple-800 text-white text-[8px] px-1 rounded-full border border-purple-500">취약 {enemy.debuffs.vulnerable}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 하단 패널 */}
      <div className="h-[30vh] min-h-[200px] shrink-0 flex flex-col items-center justify-end pb-2 md:pb-4 relative w-full pt-4">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 text-center font-bold text-slate-300 text-[10px] md:text-sm mb-1 md:mb-2 z-10 border border-slate-700 bg-slate-800/80 px-3 py-1 rounded-full shadow-lg">손패: {hand.length} / {MAX_HAND_SIZE}장</div>

        <div className="flex w-full px-2 md:px-4 relative justify-center items-end h-full">
          {/* 마나 & 뽑을 패 */}
          <div className="absolute left-0 md:left-4 bottom-4 flex flex-col items-center gap-2 md:gap-6 z-20">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 md:w-20 md:h-20 bg-blue-900 border-[3px] md:border-4 border-blue-400 rounded-full flex justify-center items-center shadow-[0_0_20px_rgba(59,130,246,0.8)]">
                <span className="text-xl md:text-4xl font-black text-white">{player.mana}</span>
              </div>
              <span className="bg-slate-900/80 px-2 md:px-3 py-0.5 rounded-full text-[9px] md:text-xs font-bold text-blue-300 mt-1 border border-slate-700">마나</span>
            </div>
            <div className="flex flex-col items-center cursor-pointer group" onClick={() => setViewingPile('drawPile')}>
               <div className="w-10 h-14 md:w-16 md:h-24 bg-slate-700 border-2 border-slate-500 rounded-lg flex items-center justify-center font-black text-lg md:text-2xl shadow-xl group-hover:-translate-y-2 transition-transform">{drawPile.length}</div>
               <span className="text-slate-300 font-bold mt-1 text-[9px] md:text-sm">뽑을 패</span>
            </div>
          </div>

          {/* 카드 핸드 */}
          <div className="flex justify-center items-end w-full px-16 h-full pb-4 overflow-visible">
            {hand.map((card, idx) => {
              const canPlay = isPlayerTurn && player.mana >= card.cost;
              const isHovered = hoveredCard === idx;
              const offset = idx - (hand.length - 1) / 2;
              const rotation = offset * 4; 
              const translateY = Math.abs(offset) * 6; 

              return (
                <div 
                  key={card.uid} 
                  onMouseEnter={() => setHoveredCard(idx)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className="relative transition-all duration-300 ease-out origin-bottom -ml-6 md:-ml-10 first:ml-0"
                  style={{ 
                    zIndex: isHovered ? 100 : 10 + idx, 
                    transform: isHovered ? `translateY(-80px) scale(1.15)` : `translateY(${translateY}px) rotate(${rotation}deg)`
                  }}
                >
                  <div onClick={() => canPlay && playCard(idx)} className={`w-28 h-40 md:w-36 md:h-48 ${canPlay ? '' : 'opacity-50 grayscale'}`}>
                    <Card card={card} isLocked={false} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* 턴 종료 & 무덤 */}
          <div className="absolute right-0 md:right-4 bottom-4 flex flex-col items-center gap-2 md:gap-6 z-20">
            <button onClick={() => setCombatState(prev => ({ ...prev, turn: 'ENEMY' }))} disabled={!isPlayerTurn} className={`py-2 px-3 md:py-3 md:px-6 rounded-full font-bold text-[10px] md:text-lg flex items-center gap-1 transition-all border ${isPlayerTurn ? 'bg-amber-600 hover:bg-amber-500 text-white border-amber-400' : 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'}`}>
              {isPlayerTurn ? '턴 종료' : '적 턴...'} <ArrowRightCircle className="w-3 h-3 md:w-5 md:h-5"/>
            </button>
            <div className="flex flex-col items-center cursor-pointer group" onClick={() => setViewingPile('discardPile')}>
               <div className="w-10 h-14 md:w-16 md:h-24 bg-slate-800 border-2 border-slate-600 rounded-lg flex items-center justify-center font-black text-lg md:text-2xl shadow-xl group-hover:-translate-y-2 transition-transform">{discardPile.length}</div>
               <span className="text-slate-400 font-bold mt-1 text-[9px] md:text-sm">무덤</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}