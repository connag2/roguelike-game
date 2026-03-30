import React, { useState, useEffect, useRef } from 'react';
import { Shield, RefreshCw, Skull, ArrowRightCircle, HelpCircle, FastForward, Sword } from 'lucide-react';
import Card from '../common/Card';
import StatusIcon from '../common/StatusIcon';

import CommonEffects from '../effects/CommonEffects';
import TierEffects from '../effects/TierEffects';
import StatusEffects from '../effects/StatusEffects';
import UniqueEffects from '../effects/UniqueEffects';

export default function BattleScreen({
  combatState, isPlayerTurn, setViewingPile, viewingPile, setGameState, hoveredCard, setHoveredCard,
  playCard, setCombatState, MAX_HAND_SIZE, setShowEnemyDeck, setViewingEnemy, setTutorialModalOpen,
  viewingEnemy, showEnemyDeck, playerRelics, fastMode, setFastMode, saveGame
}) {
  const [playEffect, setPlayEffect] = useState(null);
  const prevHpRef = useRef(combatState?.player?.hp);

  useEffect(() => {
    if (combatState?.player?.hp < prevHpRef.current) {
      const dmg = prevHpRef.current - combatState.player.hp;
      const effectId = Date.now();
      setPlayEffect({ id: effectId, name: 'enemy_attack', damage: dmg });
      setTimeout(() => setPlayEffect(prev => prev?.id === effectId ? null : prev), 600);
    }
    prevHpRef.current = combatState?.player?.hp;
  }, [combatState?.player?.hp]);

  if (!combatState) return null;
  const { player, enemies, hand, stage, drawPile, discardPile, baseDeck, mode } = combatState;

  const handlePlayCard = (idx) => {
    const card = hand[idx];
    const hits = card.multiHit || 1;
    const effectId = Date.now();
    const tier = card.rarity || 'common';
    let duration = fastMode ? 300 : 600;

    let effectName = null;
    if (card.id === 'furioso') { effectName = 'furioso'; duration = fastMode ? 800 : 1500; }
    else if (card.id === 'meteor_fall') { effectName = 'meteor'; duration = 900; }
    else if (card.id === 'snipe') { effectName = 'snipe'; duration = 800; }
    else { effectName = tier === 'common' ? 'common_hit' : `${tier}_attack`; }

    setPlayEffect({ id: effectId, name: effectName, tier, cardId: card.id, hits });
    setTimeout(() => setPlayEffect(prev => prev?.id === effectId ? null : prev), duration);
    playCard(idx);
  };

  const isShaking = playEffect && ['enemy_attack', 'furioso', 'meteor', 'snipe', 'mythic', 'rare', 'special'].includes(playEffect.name);

  return (
    <div className={`flex flex-col h-[100dvh] bg-slate-900 text-white p-2 md:p-4 relative overflow-hidden ${isShaking ? 'animate-shake' : ''}`}>
      <style>{`
        @keyframes slashHit { 0% { transform: scaleX(0) scaleY(1); opacity: 0; } 10% { transform: scaleX(0.5) scaleY(3); opacity: 1; } 100% { transform: scaleX(1.5) scaleY(0); opacity: 0; } }
        .slash-line { animation: slashHit 0.25s ease-out forwards; opacity: 0; }
        @keyframes screenShake { 0% { transform: translate(0, 0); } 20% { transform: translate(-8px, 8px); } 40% { transform: translate(8px, -8px); } 60% { transform: translate(-8px, -8px); } 80% { transform: translate(8px, 8px); } 100% { transform: translate(0, 0); } }
        .animate-shake { animation: screenShake 0.3s ease-out; }
        @keyframes flashRed { 0% { background-color: rgba(220, 38, 38, 0.4); } 100% { background-color: transparent; } }
        .animate-flash-red { animation: flashRed 0.5s ease-out forwards; }
      `}</style>

      <CommonEffects playEffect={playEffect} fastMode={fastMode} />
      <TierEffects playEffect={playEffect} />
      <StatusEffects playEffect={playEffect} />
      <UniqueEffects playEffect={playEffect} />

      {playEffect?.name === 'enemy_attack' && (
        <div className="fixed inset-0 z-[9999] pointer-events-none animate-flash-red flex items-center justify-center">
          <h1 className="text-[6rem] md:text-[10rem] text-red-500 font-black drop-shadow-[0_0_30px_black] animate-bounce">- {playEffect.damage}</h1>
        </div>
      )}

      {/* 팝업 오버레이들 (기존 로직 유지) */}
      {viewingPile && (
        <div className="fixed inset-0 bg-black/90 z-[10000] flex flex-col p-4 md:p-10 backdrop-blur-md" onClick={() => setViewingPile(null)}>
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-700">
            <h2 className="text-2xl md:text-4xl font-black text-white">{viewingPile === 'baseDeck' ? '총 덱' : viewingPile === 'drawPile' ? '뽑을 패' : '무덤'} <span className="text-indigo-400 ml-3">({combatState[viewingPile].length}장)</span></h2>
            <button onClick={() => setViewingPile(null)} className="text-slate-400 hover:text-white text-4xl font-bold">×</button>
          </div>
          <div className="flex-1 overflow-y-auto hide-scrollbar flex flex-wrap gap-4 content-start justify-center" onClick={e => e.stopPropagation()}>
            {combatState[viewingPile].map((card, idx) => (<div key={idx} className="w-28 h-40 md:w-36 md:h-48 transform transition-transform hover:scale-105"><Card card={card} isLocked={false} /></div>))}
          </div>
        </div>
      )}

      {/* 상단바 개선 */}
      <div className="flex justify-between items-center bg-slate-800/90 p-2 md:p-3 rounded-xl border border-slate-700 shadow-2xl z-10 shrink-0">
        <div className="font-black text-sm md:text-xl flex items-center gap-2 text-indigo-400 tracking-tighter">
          <RefreshCw className="w-5 h-5 animate-spin-slow" /> {mode === 'HARD' ? 'INF MODE' : 'NORMAL'} - STAGE {stage} 
        </div>
        <div className="flex items-center gap-2 md:gap-4 font-bold text-xs md:text-base">
          <button onClick={() => { setFastMode(!fastMode); saveGame({ fastMode: !fastMode }); }} className={`p-2 rounded-lg border transition-all ${fastMode ? 'bg-indigo-600 border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'bg-slate-700 border-slate-600'}`}>
            <FastForward className={`w-4 h-4 md:w-5 md:h-5 ${fastMode ? 'text-white' : 'text-slate-400'}`} />
          </button>
          <button onClick={() => setTutorialModalOpen(true)} className="bg-slate-700 p-2 rounded-lg border border-slate-600"><HelpCircle className="w-4 h-4 md:w-5 md:h-5 text-indigo-300" /></button>
          <span className="text-slate-300 cursor-pointer hover:text-indigo-300 bg-slate-900/80 px-3 py-2 rounded-lg border border-slate-700" onClick={() => setViewingPile('baseDeck')}>DECK: {baseDeck.length}</span>
          <button onClick={() => setGameState('GAME_OVER')} className="text-red-400/60 hover:text-red-400 px-2 py-1 border border-red-900/50 rounded">포기</button>
        </div>
      </div>

      {/* 전투 필드 개선 */}
      <div className="flex-1 flex flex-row justify-center items-end pb-8 border-b-2 border-slate-700/30 w-full max-w-6xl mx-auto mt-6 relative z-10">
        {/* 플레이어 섹션 */}
        <div className={`flex flex-col items-center w-1/3 transition-all duration-500 ${isPlayerTurn ? 'scale-110 z-30' : 'scale-95 opacity-60'}`}>
          <div className="w-24 h-24 md:w-40 md:h-40 bg-gradient-to-b from-slate-700 to-slate-800 rounded-full flex justify-center items-center mb-4 border-4 border-indigo-500 relative shadow-[0_0_50px_rgba(79,70,229,0.3)]">
            <Skull className="w-12 h-12 md:w-20 md:h-20 text-indigo-400 opacity-80" />
            {player.block > 0 && <div className="absolute -top-2 -right-2 md:-top-4 md:-right-4 bg-blue-600 w-10 h-10 rounded-full flex justify-center items-center font-black border-2 border-blue-300 animate-bounce shadow-lg">{player.block}</div>}
          </div>
          <h3 className="text-base md:text-2xl font-black mb-2 text-indigo-300 uppercase tracking-widest">PLAYER</h3>
          <div className="w-full max-w-[140px] md:max-w-[240px] bg-slate-950 h-5 md:h-7 rounded-full overflow-hidden border-2 border-slate-700 relative shadow-inner">
            <div className="bg-gradient-to-r from-emerald-600 to-green-400 h-full transition-all duration-500" style={{ width: `${(player.hp / player.maxHp) * 100}%` }}/>
            <span className="absolute inset-0 flex justify-center items-center text-[10px] md:text-xs font-black drop-shadow-md tracking-tighter">{player.hp} / {player.maxHp}</span>
          </div>
          <div className="flex gap-1 mt-2 flex-wrap justify-center max-w-[200px]">
            <StatusIcon type="strength" value={player.buffs?.strength} />
            <StatusIcon type="dexterity" value={player.buffs?.dexterity} />
            <StatusIcon type="thorns" value={player.buffs?.thorns} />
            <StatusIcon type="poison" value={player.debuffs?.poison} />
            <StatusIcon type="weak" value={player.debuffs?.weak} />
            <StatusIcon type="vulnerable" value={player.debuffs?.vulnerable} />
          </div>
        </div>

        <div className="text-4xl md:text-7xl font-black text-slate-800 italic px-8 pb-20 select-none">VS</div>

        {/* 적 섹션 */}
        <div className="flex flex-row gap-6 md:gap-12 justify-center items-end flex-wrap w-1/2">
          {enemies.map((enemy, idx) => {
            const eCard = enemy.intentCard;
            const isTarget = idx === 0;
            return (
              <div key={enemy.uid} className={`flex flex-col items-center cursor-pointer transition-all duration-500 origin-bottom ${!isPlayerTurn ? 'scale-110 z-30' : isTarget ? 'scale-100 opacity-90' : 'scale-90 opacity-40'}`} onClick={() => { setViewingEnemy(enemy); setShowEnemyDeck(true); }}>
                {isTarget && <div className="text-red-500 font-black text-xs md:text-sm animate-pulse mb-1 tracking-tighter">TARGET ▼</div>}
                
                {/* ✨ 적 의도 표시창 강화 */}
                <div className="mb-4 relative z-10">
                  <div className={`min-w-[100px] md:min-w-[120px] bg-slate-950 border-2 rounded-xl p-2 shadow-2xl text-center flex flex-col items-center gap-1 ${eCard.type.includes('attack') ? 'border-red-500/50 shadow-red-900/20' : 'border-blue-500/50 shadow-blue-900/20'}`}>
                    <div className="text-[10px] md:text-xs font-black text-slate-100 truncate">{eCard.name}</div>
                    <div className="flex items-center gap-1.5 bg-slate-900 px-2 py-0.5 rounded-full">
                      {eCard.type.includes('attack') && <Sword className="w-3 h-3 text-red-500" />}
                      {eCard.type.includes('defend') && <Shield className="w-3 h-3 text-blue-500" />}
                      <span className="text-[11px] md:text-xs font-black text-white">
                        {/* 데미지 계산 미리보기: (기본대미지 + 적 근력) x 연타횟수 */}
                        {eCard.value ? (eCard.multi ? `${eCard.value + (enemy.buffs?.strength || 0)}x${eCard.multi}` : (eCard.value + (enemy.buffs?.strength || 0))) : ''}
                        {eCard.type === 'heal' && `+${eCard.heal}`}
                        {eCard.type.includes('debuff') && `(${eCard.debuff})`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={`rounded-full flex justify-center items-center mb-2 border-4 shadow-2xl relative ${enemy.isBoss ? 'bg-red-950 border-red-500 w-24 h-24 md:w-36 md:h-36' : 'bg-slate-800 border-red-700/50 w-20 h-20 md:w-28 md:h-28'}`}>
                  <Skull className={`${enemy.isBoss ? 'w-12 h-12 md:w-20 md:h-20 text-red-400' : 'w-10 h-10 md:w-14 md:h-14 text-red-500/70'}`} />
                  {enemy.block > 0 && <div className="absolute -top-1 -right-1 bg-slate-600 w-8 h-8 rounded-full flex justify-center items-center font-black border-2 border-slate-400 text-xs shadow-md">{enemy.block}</div>}
                </div>
                <h3 className={`text-xs md:text-xl font-black mb-1 ${enemy.isBoss ? 'text-red-400' : 'text-slate-300'} uppercase tracking-tight`}>{enemy.name}</h3>
                <div className="w-full max-w-[110px] md:max-w-[160px] bg-slate-950 h-4 md:h-6 rounded-full overflow-hidden border border-slate-800 relative">
                  <div className={`${enemy.isBoss ? 'bg-red-600' : 'bg-red-500'} h-full transition-all duration-300 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]`} style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }}/>
                  <span className="absolute inset-0 flex justify-center items-center text-[9px] md:text-xs font-black drop-shadow-md">{enemy.hp}</span>
                </div>
                {/* 적 상태창 아이콘 추가 */}
                <div className="flex gap-1 mt-2 flex-wrap justify-center w-full min-h-[18px]">
                  <StatusIcon type="strength" value={enemy.buffs?.strength} isEnemy={true} />
                  <StatusIcon type="dexterity" value={enemy.buffs?.dexterity} isEnemy={true} />
                  <StatusIcon type="thorns" value={enemy.buffs?.thorns} isEnemy={true} />
                  <StatusIcon type="poison" value={enemy.debuffs?.poison} isEnemy={true} />
                  <StatusIcon type="weak" value={enemy.debuffs?.weak} isEnemy={true} />
                  <StatusIcon type="vulnerable" value={enemy.debuffs?.vulnerable} isEnemy={true} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 하단 마나 및 카드 영역 */}
      <div className="h-[30dvh] min-h-[220px] shrink-0 flex flex-col items-center justify-end pb-4 relative w-full pt-4">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 text-center font-black text-slate-400 text-[10px] md:text-sm tracking-widest z-10 border border-slate-700/50 bg-slate-800/50 px-4 py-1 rounded-full backdrop-blur-sm shadow-xl">HAND: {hand.length} / {MAX_HAND_SIZE}</div>
        
        <div className="flex w-full px-4 relative justify-center items-end h-full">
          {/* 마나 & 드로우 더미 */}
          <div className="absolute left-2 md:left-8 bottom-6 flex flex-col items-center gap-4 z-20">
            <div className="relative group">
              <div className="w-14 h-14 md:w-24 md:h-24 bg-blue-900 border-4 border-blue-400 rounded-full flex justify-center items-center shadow-[0_0_30px_rgba(59,130,246,0.5)] animate-pulse-slow">
                <span className="text-2xl md:text-5xl font-black text-white italic">{player.mana}</span>
              </div>
              <div className="absolute -bottom-2 bg-slate-900 px-3 py-0.5 rounded-full border border-blue-500/50 text-[10px] font-black text-blue-300 shadow-lg">MANA</div>
            </div>
            <div className="flex flex-col items-center cursor-pointer group" onClick={() => setViewingPile('drawPile')}>
              <div className="w-12 h-16 md:w-20 md:h-28 bg-slate-800 border-2 border-slate-600 rounded-xl flex items-center justify-center font-black text-xl md:text-3xl shadow-2xl group-hover:-translate-y-2 group-hover:border-indigo-500 transition-all">{drawPile.length}</div>
              <span className="text-slate-500 font-black mt-1 text-[10px] md:text-xs tracking-tighter group-hover:text-indigo-400">DRAW</span>
            </div>
          </div>

          {/* 손패 카드 렌더링 */}
          <div className="flex justify-center items-end w-full px-20 md:px-32 h-full pb-6 overflow-visible">
            {hand.map((card, idx) => {
              const canPlay = isPlayerTurn && player.mana >= card.cost;
              const isHovered = hoveredCard === idx;
              const offset = idx - (hand.length - 1) / 2;
              const rotation = offset * 4;
              const translateY = Math.abs(offset) * 8; 
              return (
                <div key={card.uid} onMouseEnter={() => setHoveredCard(idx)} onMouseLeave={() => setHoveredCard(null)} 
                     className="relative transition-all duration-300 ease-out origin-bottom -ml-8 md:-ml-12 first:ml-0" 
                     style={{ zIndex: isHovered ? 100 : 10 + idx, transform: isHovered ? `translateY(-100px) scale(1.2)` : `translateY(${translateY}px) rotate(${rotation}deg)` }}>
                  <div onClick={() => canPlay && handlePlayCard(idx)} className={`w-32 h-44 md:w-44 md:h-60 shadow-2xl rounded-xl transition-all ${canPlay ? 'cursor-pointer' : 'opacity-40 grayscale pointer-events-none'}`}>
                    <Card card={card} isLocked={false} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* 턴종료 & 무덤 더미 */}
          <div className="absolute right-2 md:right-8 bottom-6 flex flex-col items-center gap-4 z-20">
            <button 
              onClick={() => setCombatState(prev => ({ ...prev, turn: 'ENEMY' }))} 
              disabled={!isPlayerTurn} 
              className={`py-3 px-4 md:py-4 md:px-8 rounded-2xl font-black text-xs md:text-xl flex items-center gap-2 transition-all border-b-4 active:border-b-0 active:translate-y-1 ${isPlayerTurn ? 'bg-amber-600 hover:bg-amber-500 text-white border-amber-800 shadow-[0_0_20px_rgba(245,158,11,0.3)]' : 'bg-slate-800 text-slate-600 border-slate-900 cursor-not-allowed'}`}
            >
              {isPlayerTurn ? 'TURN END' : 'WAITING...'} <ArrowRightCircle className="w-4 h-4 md:w-6 md:h-6"/>
            </button>
            <div className="flex flex-col items-center cursor-pointer group" onClick={() => setViewingPile('discardPile')}>
              <div className="w-12 h-16 md:w-20 md:h-28 bg-slate-900 border-2 border-slate-700 rounded-xl flex items-center justify-center font-black text-xl md:text-3xl shadow-2xl group-hover:-translate-y-2 group-hover:border-red-500 transition-all text-slate-500">{discardPile.length}</div>
              <span className="text-slate-600 font-black mt-1 text-[10px] md:text-xs tracking-tighter group-hover:text-red-500">DISCARD</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}