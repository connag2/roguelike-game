import React, { useState, useEffect, useRef } from 'react';
import { Shield, RefreshCw, Skull, ArrowRightCircle, HelpCircle, FastForward, Sword, Zap } from 'lucide-react';
import Card from '../common/Card';
import StatusIcon from '../common/StatusIcon';

// ✨ 이펙트 컴포넌트들 임포트
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

  // 비동기로 변경하여 타수만큼 시각적 효과 지연 처리
  const handlePlayCard = async (idx) => {
    if (playEffect && playEffect.name !== 'enemy_attack') return;

    const card = hand[idx];
    const hits = card.multiHit || 1;
    const tier = card.rarity || 'common';
    const delay = fastMode ? 100 : 200;

    // 논리적 데미지/상태 변경 함수 호출
    playCard(idx);

    // 시각적 연타 효과 루프
    for (let i = 0; i < hits; i++) {
      let effectName = null;
      if (card.id === 'furioso') effectName = 'furioso';
      else if (card.id === 'meteor_fall') effectName = 'meteor';
      else if (card.id === 'snipe') effectName = 'snipe';
      else effectName = tier === 'common' ? 'common_hit' : `${tier}_attack`;

      setPlayEffect({ id: Date.now() + i, name: effectName, tier, cardId: card.id, hits });
      await new Promise(r => setTimeout(r, delay));
    }
    
    setPlayEffect(null);
  };

  const isShaking = playEffect && ['enemy_attack', 'furioso', 'meteor', 'snipe', 'mythic', 'rare', 'special'].includes(playEffect.name);

  return (
    <div className={`flex flex-col h-[100dvh] bg-slate-900 text-white p-2 md:p-4 relative overflow-hidden ${isShaking ? 'animate-shake' : ''}`}>
      
      <style>{`
        @keyframes slashHit { 0% { transform: scaleX(0) scaleY(1); opacity: 0; } 10% { transform: scaleX(0.5) scaleY(3); opacity: 1; } 100% { transform: scaleX(1.5) scaleY(0); opacity: 0; } }
        .slash-line { animation: slashHit 0.25s ease-out forwards; opacity: 0; }
        @keyframes screenShake { 0% { transform: translate(0, 0); } 20% { transform: translate(-10px, 10px); } 40% { transform: translate(10px, -10px); } 60% { transform: translate(-10px, -10px); } 80% { transform: translate(10px, 10px); } 100% { transform: translate(0, 0); } }
        .animate-shake { animation: screenShake 0.4s ease-out; }
        @keyframes flashRed { 0% { background-color: rgba(220, 38, 38, 0.6); } 100% { background-color: transparent; } }
        .animate-flash-red { animation: flashRed 0.5s ease-out forwards; }
        @keyframes pulse-glow { 0%, 100% { text-shadow: 0 0 10px rgba(59, 130, 246, 0.8), 0 0 20px rgba(59, 130, 246, 0.4); } 50% { text-shadow: 0 0 25px rgba(59, 130, 246, 1), 0 0 40px rgba(59, 130, 246, 0.6); } }
        .mana-font { animation: pulse-glow 2s infinite; font-family: 'Arial Black', sans-serif; }
      `}</style>

      {/* 특수 이펙트들 (일반 Common은 타겟 내부로 이동됨) */}
      <TierEffects playEffect={playEffect} />
      <StatusEffects playEffect={playEffect} />
      <UniqueEffects playEffect={playEffect} />

      {/* 🩸 플레이어 피격 대미지 수치 */}
      {playEffect?.name === 'enemy_attack' && (
        <div className="fixed inset-0 z-[9999] pointer-events-none animate-flash-red flex items-center justify-center">
          <h1 className="text-[6rem] md:text-[10rem] text-red-500 font-black drop-shadow-[0_0_30px_black] animate-bounce">- {playEffect.damage}</h1>
        </div>
      )}

      {/* 팝업 UI들: 덱/무덤/적 정보 */}
      {viewingPile && (
        <div className="fixed inset-0 bg-black/95 z-[10000] flex flex-col p-4 md:p-10 backdrop-blur-xl" onClick={() => setViewingPile(null)}>
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-700">
            <h2 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tighter">
              {viewingPile === 'baseDeck' ? 'Full Deck' : viewingPile === 'drawPile' ? 'Draw Pile' : 'Discard Pile'} 
              <span className="text-indigo-400 ml-4 font-bold text-xl md:text-2xl">({combatState[viewingPile].length} CARDS)</span>
            </h2>
            <button onClick={() => setViewingPile(null)} className="text-slate-400 hover:text-white text-5xl font-bold">×</button>
          </div>
          <div className="flex-1 overflow-y-auto hide-scrollbar flex flex-wrap gap-4 md:gap-8 content-start justify-center" onClick={e => e.stopPropagation()}>
            {combatState[viewingPile].map((card, idx) => (<div key={idx} className="w-32 h-44 md:w-44 md:h-60 transform transition-all hover:scale-110 hover:-translate-y-2"><Card card={card} isLocked={false} /></div>))}
          </div>
        </div>
      )}

      {showEnemyDeck && viewingEnemy && (
        <div className="fixed inset-0 bg-black/95 z-[10001] flex items-center justify-center p-4 backdrop-blur-xl" onClick={() => { setViewingEnemy(null); setShowEnemyDeck(false); }}>
          <div className="bg-slate-900 p-8 rounded-3xl border-4 border-red-900/50 w-full max-w-2xl shadow-[0_0_50px_rgba(220,38,38,0.2)]" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-3xl md:text-5xl font-black text-red-500 uppercase tracking-tighter mb-2">{viewingEnemy.name}</h2>
                <div className="flex items-center gap-2">
                  <div className="bg-red-900/50 px-3 py-1 rounded-full border border-red-500/50 text-red-300 text-sm font-bold">HP {viewingEnemy.hp} / {viewingEnemy.maxHp}</div>
                  {viewingEnemy.isBoss && <div className="bg-amber-600 px-3 py-1 rounded-full text-white text-xs font-black animate-pulse">BOSS</div>}
                </div>
              </div>
              <button onClick={() => { setViewingEnemy(null); setShowEnemyDeck(false); }} className="text-slate-600 hover:text-white text-4xl font-bold transition-colors">×</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-xl font-black text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-2"><Zap className="w-5 h-5 text-amber-400"/> PASSIVE SKILLS</h3>
                <div className="space-y-3 max-h-[30vh] overflow-y-auto pr-2 hide-scrollbar">
                  {viewingEnemy.passives && viewingEnemy.passives.length > 0 ? viewingEnemy.passives.map(p => (
                    <div key={p.id} className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700 group hover:border-amber-500/50 transition-colors">
                      <div className="text-amber-400 font-black mb-1">{p.name}</div>
                      <div className="text-sm text-slate-400 leading-relaxed">{p.desc}</div>
                    </div>
                  )) : <div className="text-slate-600 font-bold italic py-4 text-center bg-slate-800/30 rounded-2xl">획득한 패시브가 없습니다.</div>}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-black text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-2"><Sword className="w-5 h-5 text-red-500"/> ATTACK PATTERN</h3>
                <div className="space-y-3 max-h-[30vh] overflow-y-auto pr-2 hide-scrollbar">
                  {viewingEnemy.template?.deck ? viewingEnemy.template.deck.map((card, idx) => (
                    <div key={idx} className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700 hover:border-red-500/50 transition-colors">
                      <div className="font-black text-white mb-1 flex justify-between">
                        <span>{card.name}</span>
                        {card.value && <span className="text-red-400">DMG {card.value}</span>}
                      </div>
                      <div className="text-xs text-slate-400 leading-relaxed">{card.desc}</div>
                    </div>
                  )) : <div className="text-slate-600 font-bold italic py-4 text-center">알 수 없는 패턴입니다.</div>}
                </div>
              </div>
            </div>
            
            <button onClick={() => { setViewingEnemy(null); setShowEnemyDeck(false); }} className="mt-10 w-full py-5 bg-gradient-to-r from-red-900 to-red-700 hover:from-red-800 hover:to-red-600 text-white rounded-2xl font-black text-xl shadow-xl transition-all active:scale-95">확인 완료</button>
          </div>
        </div>
      )}

      {/* 상단 유물 바 */}
      {playerRelics && playerRelics.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2 z-10 w-full px-2">
          {playerRelics.map((r, i) => (
            <div key={i} className="relative group cursor-help bg-slate-800/80 border-2 border-slate-600 p-1 rounded-lg shadow-lg hover:border-indigo-400 transition-colors">
              <span className="text-[10px] md:text-xs font-black text-slate-100 px-1 uppercase tracking-tighter">{r.name}</span>
              <div className="absolute top-full left-0 mt-3 hidden group-hover:block w-64 p-4 bg-slate-900 border-2 border-indigo-500/50 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-[100000] pointer-events-none">
                <div className="text-amber-400 font-black text-sm mb-2 border-b border-slate-800 pb-2">{r.name}</div>
                <div className="text-xs text-slate-300 leading-relaxed font-medium">{r.desc}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 상단 스테이지 바 */}
      <div className="flex justify-between items-center bg-slate-800/90 p-2 md:p-3 rounded-2xl border border-slate-700 shadow-2xl z-10 shrink-0 mb-4">
        <div className="font-black text-sm md:text-2xl flex items-center gap-2 text-indigo-400 tracking-tighter italic">
          <RefreshCw className="w-5 h-5 md:w-6 md:h-6 animate-spin-slow" /> {mode === 'HARD' ? 'INF MODE' : 'NORMAL'} STAGE {stage} 
        </div>
        <div className="flex items-center gap-2 md:gap-4 font-bold text-xs md:text-base">
          <button onClick={() => { setFastMode(!fastMode); saveGame({ fastMode: !fastMode }); }} className={`p-2.5 rounded-xl border transition-all ${fastMode ? 'bg-indigo-600 border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.6)]' : 'bg-slate-700 border-slate-600'}`}>
            <FastForward className={`w-5 h-5 ${fastMode ? 'text-white' : 'text-slate-400'}`} />
          </button>
          <button onClick={() => setTutorialModalOpen(true)} className="bg-slate-700 p-2.5 rounded-xl border border-slate-600 hover:bg-slate-600 transition-colors"><HelpCircle className="w-5 h-5 text-indigo-300" /></button>
          <span className="text-slate-300 cursor-pointer hover:text-indigo-300 bg-slate-950/80 px-4 py-2.5 rounded-xl border border-slate-700 font-black shadow-inner" onClick={() => setViewingPile('baseDeck')}>DECK: {baseDeck.length}</span>
          <button onClick={() => setGameState('GAME_OVER')} className="text-red-500/50 hover:text-red-500 transition-colors text-sm font-black px-2">EXIT</button>
        </div>
      </div>

      {/* 전투 필드 */}
      <div className="flex-1 flex flex-row justify-center items-end pb-8 border-b-2 border-slate-800/50 w-full max-w-7xl mx-auto mt-4 relative z-10">
        <div className={`flex flex-col items-center w-1/3 transition-all duration-500 ${isPlayerTurn ? 'scale-110 z-30' : 'scale-95 opacity-60'}`}>
          <div className="w-28 h-28 md:w-48 md:h-48 bg-gradient-to-br from-slate-700 to-slate-900 rounded-full flex justify-center items-center mb-6 border-4 border-indigo-500 relative shadow-[0_0_60px_rgba(79,70,229,0.4)]">
            <Skull className="w-14 h-14 md:w-24 md:h-24 text-indigo-500/80" />
            {player.block > 0 && <div className="absolute -top-2 -right-2 md:-top-4 md:-right-4 bg-blue-600 w-12 h-12 rounded-full flex justify-center items-center font-black border-2 border-blue-300 animate-bounce shadow-xl text-lg">{player.block}</div>}
          </div>
          <h3 className="text-base md:text-3xl font-black mb-2 text-indigo-400 tracking-tighter uppercase italic">PLAYER</h3>
          <div className="w-full max-w-[160px] md:max-w-[280px] bg-slate-950 h-6 md:h-8 rounded-full overflow-hidden border-2 border-slate-800 relative shadow-inner">
            <div className="bg-gradient-to-r from-emerald-600 via-green-400 to-emerald-600 h-full transition-all duration-700" style={{ width: `${(player.hp / player.maxHp) * 100}%` }}/>
            <span className="absolute inset-0 flex justify-center items-center text-[10px] md:text-sm font-black drop-shadow-lg tracking-widest">{player.hp} / {player.maxHp}</span>
          </div>
          <div className="flex gap-1.5 mt-3 flex-wrap justify-center max-w-[240px]">
            <StatusIcon type="strength" value={player.buffs?.strength} />
            <StatusIcon type="dexterity" value={player.buffs?.dexterity} />
            <StatusIcon type="thorns" value={player.buffs?.thorns} />
            <StatusIcon type="poison" value={player.debuffs?.poison} />
            <StatusIcon type="weak" value={player.debuffs?.weak} />
            <StatusIcon type="vulnerable" value={player.debuffs?.vulnerable} />
          </div>
        </div>

        <div className="text-5xl md:text-8xl font-black text-slate-800/40 italic px-10 pb-24 select-none tracking-tighter">VS</div>

        <div className="flex flex-row gap-8 md:gap-16 justify-center items-end flex-wrap w-1/2">
          {enemies.map((enemy, idx) => {
            const eCard = enemy.intentCard;
            const isTarget = idx === 0;
            return (
              <div key={enemy.uid} className={`flex flex-col items-center cursor-pointer transition-all duration-500 origin-bottom ${!isPlayerTurn ? 'scale-110 z-30' : isTarget ? 'scale-100 opacity-90' : 'scale-90 opacity-40'}`} onClick={() => { setViewingEnemy(enemy); setShowEnemyDeck(true); }}>
                {isTarget && <div className="text-red-500 font-black text-xs md:text-base animate-pulse mb-2 tracking-tighter">TARGET ▼</div>}
                
                <div className="mb-6 relative z-10">
                  <div className={`min-w-[120px] md:min-w-[140px] bg-slate-950 border-2 rounded-2xl p-3 shadow-2xl text-center flex flex-col items-center gap-2 ${eCard.type.includes('attack') ? 'border-red-600/60 shadow-red-900/30' : 'border-blue-600/60 shadow-blue-900/30'}`}>
                    <div className="text-[10px] md:text-xs font-black text-slate-100 uppercase tracking-tighter truncate w-full">{eCard.name}</div>
                    <div className="flex items-center gap-2 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
                      {eCard.type.includes('attack') ? <Sword className="w-3.5 h-3.5 text-red-500" /> : <Shield className="w-3.5 h-3.5 text-blue-500" />}
                      <span className="text-xs md:text-sm font-black text-white">
                        {eCard.value ? (eCard.multi ? `${eCard.value + (enemy.buffs?.strength || 0)}x${eCard.multi}` : (eCard.value + (enemy.buffs?.strength || 0))) : eCard.heal ? `+${eCard.heal}` : '?'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 🎯 이펙트 렌더링 위치 변경: 스컬 아이콘 위로 오버레이 되도록 내부 삽입 */}
                <div className={`rounded-full flex justify-center items-center mb-2 border-4 shadow-2xl relative transition-transform hover:scale-110 ${enemy.isBoss ? 'bg-red-950 border-red-500 w-28 h-28 md:w-44 md:h-44' : 'bg-slate-800 border-red-900/50 w-24 h-24 md:w-32 md:h-32'}`}>
                  <Skull className={`${enemy.isBoss ? 'w-16 h-16 md:w-28 md:h-28 text-red-500' : 'w-12 h-12 md:w-16 md:h-16 text-red-700/80'}`} />
                  {enemy.block > 0 && <div className="absolute -top-1 -right-1 bg-slate-600 w-10 h-10 rounded-full flex justify-center items-center font-black border-2 border-slate-400 text-xs shadow-xl">{enemy.block}</div>}
                  
                  {isTarget && playEffect && <CommonEffects key={playEffect.id} playEffect={playEffect} fastMode={fastMode} />}
                </div>

                <h3 className={`text-xs md:text-2xl font-black mb-2 ${enemy.isBoss ? 'text-red-500' : 'text-slate-300'} uppercase tracking-tighter`}>{enemy.name}</h3>
                <div className="w-full max-w-[120px] md:max-w-[200px] bg-slate-950 h-5 md:h-7 rounded-full overflow-hidden border-2 border-slate-800 relative shadow-inner">
                  <div className={`${enemy.isBoss ? 'bg-gradient-to-r from-red-800 to-red-600' : 'bg-red-700'} h-full transition-all duration-300`} style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }}/>
                  <span className="absolute inset-0 flex justify-center items-center text-[10px] md:text-xs font-black drop-shadow-lg tracking-widest">{enemy.hp}</span>
                </div>
                <div className="flex gap-1.5 mt-3 flex-wrap justify-center w-full min-h-[22px]">
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

      {/* 하단 마나 및 손패 UI */}
      <div className="h-[32dvh] min-h-[240px] shrink-0 flex flex-col items-center justify-end pb-6 relative w-full pt-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 text-center font-black text-slate-500 text-[10px] md:text-sm tracking-[0.2em] z-10 bg-slate-950/40 px-6 py-1 rounded-full border border-slate-800/50 shadow-xl backdrop-blur-sm">PLAYER HAND : {hand.length} / {MAX_HAND_SIZE}</div>
        
        <div className="flex w-full px-6 relative justify-center items-end h-full">
          <div className="absolute left-4 md:left-12 bottom-10 flex flex-col items-center gap-6 z-20">
            <div className="relative group">
              <div className="w-16 h-16 md:w-32 md:h-32 bg-blue-950 border-4 border-blue-400 rounded-full flex justify-center items-center shadow-[0_0_40px_rgba(59,130,246,0.6)] group-hover:shadow-[0_0_60px_rgba(59,130,246,0.9)] transition-all">
                <span className="text-3xl md:text-7xl font-black text-white italic mana-font">{player.mana}</span>
              </div>
              <div className="absolute -bottom-3 bg-slate-950 px-4 py-1 rounded-full border-2 border-blue-500/50 text-[10px] md:text-xs font-black text-blue-400 shadow-2xl tracking-widest">MANA</div>
            </div>
            <div className="flex flex-col items-center cursor-pointer group" onClick={() => setViewingPile('drawPile')}>
              <div className="w-14 h-20 md:w-24 md:h-36 bg-slate-800 border-2 border-slate-600 rounded-2xl flex items-center justify-center font-black text-2xl md:text-5xl shadow-[0_15px_35px_rgba(0,0,0,0.5)] group-hover:-translate-y-4 group-hover:border-indigo-500 transition-all duration-300">{drawPile.length}</div>
              <span className="text-slate-500 font-black mt-2 text-[10px] md:text-sm tracking-tighter group-hover:text-indigo-400 transition-colors uppercase">Draw</span>
            </div>
          </div>

          <div className="flex justify-center items-end w-full px-24 md:px-48 h-full pb-8 overflow-visible">
            {hand.map((card, idx) => {
              // ⛔ 애니메이션 도중 다른 카드 내기 방지
              const canPlay = isPlayerTurn && player.mana >= card.cost && !playEffect;
              const isHovered = hoveredCard === idx;
              const offset = idx - (hand.length - 1) / 2;
              const rotation = offset * 4.5;
              const translateY = Math.abs(offset) * 10; 
              return (
                <div key={card.uid} onMouseEnter={() => setHoveredCard(idx)} onMouseLeave={() => setHoveredCard(null)} 
                     className="relative transition-all duration-300 ease-out origin-bottom -ml-10 md:-ml-16 first:ml-0" 
                     style={{ zIndex: isHovered ? 100 : 10 + idx, transform: isHovered ? `translateY(-120px) scale(1.25) rotate(0deg)` : `translateY(${translateY}px) rotate(${rotation}deg)` }}>
                  <div onClick={() => canPlay && handlePlayCard(idx)} className={`w-36 h-52 md:w-52 md:h-72 shadow-2xl rounded-2xl transition-all ${canPlay ? 'cursor-pointer' : 'opacity-40 grayscale pointer-events-none'}`}>
                    <Card card={card} isLocked={false} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="absolute right-4 md:right-12 bottom-10 flex flex-col items-center gap-6 z-20">
            <button 
              onClick={() => setCombatState(prev => ({ ...prev, turn: 'ENEMY' }))} 
              disabled={!isPlayerTurn} 
              className={`py-4 px-6 md:py-6 md:px-12 rounded-3xl font-black text-sm md:text-2xl flex items-center gap-3 transition-all border-b-8 active:border-b-0 active:translate-y-2 ${isPlayerTurn ? 'bg-amber-600 hover:bg-amber-500 text-white border-amber-800 shadow-[0_15px_40px_rgba(245,158,11,0.3)]' : 'bg-slate-800 text-slate-600 border-slate-900 cursor-not-allowed'}`}
            >
              {isPlayerTurn ? 'TURN END' : 'WAITING...'} <ArrowRightCircle className="w-5 h-5 md:w-8 md:h-8"/>
            </button>
            <div className="flex flex-col items-center cursor-pointer group" onClick={() => setViewingPile('discardPile')}>
              <div className="w-14 h-20 md:w-24 md:h-36 bg-slate-950 border-2 border-slate-800 rounded-2xl flex items-center justify-center font-black text-2xl md:text-5xl shadow-2xl group-hover:-translate-y-4 group-hover:border-red-600 transition-all duration-300 text-slate-500">{discardPile.length}</div>
              <span className="text-slate-600 font-black mt-2 text-[10px] md:text-sm tracking-tighter group-hover:text-red-500 transition-colors uppercase">Discard</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}