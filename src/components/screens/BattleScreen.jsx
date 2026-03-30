import React, { useState, useEffect, useRef } from 'react';
import { Shield, RefreshCw, Skull, ArrowRightCircle, HelpCircle, FastForward } from 'lucide-react';
import Card from '../common/Card';
import StatusIcon from '../common/StatusIcon';

// ✨ 분리한 이펙트 컴포넌트들 임포트
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
    let effectName = null;
    let duration = 800;

    if (card.id === 'furioso') { effectName = 'furioso'; duration = 1200 + (hits * 100); }
    else if (card.id === 'meteor_fall') { effectName = 'meteor'; duration = 900; }
    else if (card.id === 'snipe') { effectName = 'snipe'; duration = 800; }
    else if (card.id === 'vampire_sword' || card.id === 'vampiric_strike' || card.id === 'soul_slash') { effectName = 'vampire'; duration = 800; }
    else if (card.gamble) { effectName = 'gamble'; duration = 1000; }
    else if (card.enemyPoison && card.enemyPoison > 0) { effectName = 'poison'; duration = 800; }
    else if (card.block && card.block > 0 && !card.type.includes('attack')) { effectName = 'block'; duration = 600; }
    else if (card.heal && card.heal > 0 && !card.type.includes('attack')) { effectName = 'heal'; duration = 700; }
    else if (card.type.includes('attack')) {
      if (card.rarity === 'mythic') { effectName = 'mythic'; duration = 800 + (hits * 150); }
      else if (card.rarity === 'rare') { effectName = 'rare'; duration = 600 + (hits * 150); }
      else if (card.rarity === 'special') { effectName = 'special'; duration = 700 + (hits * 150); }
      else if (card.rarity === 'uncommon') { effectName = 'uncommon_attack'; duration = 500 + (hits * 150); }
      else { effectName = 'common_attack'; duration = 400 + (hits * 150); }
    }

    if (effectName) {
      setPlayEffect({ id: effectId, name: effectName, hits });
      setTimeout(() => setPlayEffect(prev => prev?.id === effectId ? null : prev), duration);
    }
    playCard(idx);
  };

  const isShaking = playEffect && ['enemy_attack', 'furioso', 'meteor', 'snipe', 'mythic', 'rare', 'special'].includes(playEffect.name);

  return (
    <div className={`flex flex-col h-[100dvh] bg-slate-900 text-white p-2 md:p-4 relative overflow-hidden ${isShaking ? 'animate-shake' : ''}`}>
      
      {/* 🎨 CSS 애니메이션 스타일 (TierEffects 등에서 공통 사용) */}
      <style>{`
        @keyframes slashHit { 0% { transform: scaleX(0) scaleY(1); opacity: 0; } 10% { transform: scaleX(0.5) scaleY(3); opacity: 1; } 100% { transform: scaleX(1.5) scaleY(0); opacity: 0; } }
        .slash-line { animation: slashHit 0.25s ease-out forwards; opacity: 0; }
        @keyframes screenShake { 0% { transform: translate(0, 0); } 20% { transform: translate(-10px, 10px); } 40% { transform: translate(10px, -10px); } 60% { transform: translate(-10px, -10px); } 80% { transform: translate(10px, 10px); } 100% { transform: translate(0, 0); } }
        .animate-shake { animation: screenShake 0.4s ease-out; }
        @keyframes flashRed { 0% { background-color: rgba(220, 38, 38, 0.6); } 100% { background-color: transparent; } }
        .animate-flash-red { animation: flashRed 0.5s ease-out forwards; }
      `}</style>

      {/* ✨ 컴포넌트로 분리된 이펙트들 (코드가 엄청 깔끔해졌습니다!) */}
      <TierEffects playEffect={playEffect} />
      <StatusEffects playEffect={playEffect} />
      <UniqueEffects playEffect={playEffect} />

      {/* 🩸 [적 공격 피격] 연출은 구조상 여기에 유지 (BattleScreen의 상태와 밀접함) */}
      {playEffect?.name === 'enemy_attack' && (
        <div className="fixed inset-0 z-[9999] pointer-events-none animate-flash-red flex items-center justify-center">
          <h1 className="text-[6rem] md:text-[10rem] text-red-500 font-black drop-shadow-[0_0_30px_black] animate-bounce">- {playEffect.damage}</h1>
        </div>
      )}

      {/* ====== 이하 UI 렌더링 로직 (동일) ====== */}
      {/* ... (기존 렌더링 코드 유지) ... */}
      
      {/* 덱/무덤 팝업 */}
      {viewingPile && (
        <div className="fixed inset-0 bg-black/90 z-[10000] flex flex-col p-4 md:p-10 backdrop-blur-md" onClick={() => setViewingPile(null)}>
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-700">
            <h2 className="text-2xl md:text-4xl font-black text-white">{viewingPile === 'baseDeck' ? '총 덱' : viewingPile === 'drawPile' ? '뽑을 패' : '무덤'} <span className="text-indigo-400 text-xl md:text-2xl ml-3">({combatState[viewingPile].length}장)</span></h2>
            <button onClick={() => setViewingPile(null)} className="text-slate-400 hover:text-white text-4xl font-bold transition-colors">×</button>
          </div>
          <div className="flex-1 overflow-y-auto hide-scrollbar flex flex-wrap gap-4 md:gap-6 content-start justify-center" onClick={e => e.stopPropagation()}>
            {combatState[viewingPile].map((card, idx) => (<div key={idx} className="w-28 h-40 md:w-36 md:h-48 transform transition-transform hover:scale-105 origin-center"><Card card={card} isLocked={false} /></div>))}
          </div>
        </div>
      )}

      {/* 적 정보 팝업 */}
      {showEnemyDeck && viewingEnemy && (
        <div className="fixed inset-0 bg-black/90 z-[10000] flex flex-col items-center justify-center p-4 backdrop-blur-md" onClick={() => { setViewingEnemy(null); setShowEnemyDeck(false); }}>
          <div className="bg-slate-800 p-6 rounded-xl border-2 border-red-500 w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-red-400 mb-4">{viewingEnemy.name} 정보</h2>
            <div className="mb-4">
              <h3 className="text-lg font-bold text-slate-300 mb-2">패시브 스킬</h3>
              {viewingEnemy.passives && viewingEnemy.passives.length > 0 ? viewingEnemy.passives.map(p => (<div key={p.id} className="bg-slate-900 p-2 rounded mb-2 border border-slate-700"><span className="text-orange-400 font-bold">{p.name}</span>: <span className="text-sm text-slate-400">{p.desc}</span></div>)) : <div className="text-sm text-slate-500">없음</div>}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-300 mb-2">사용 스킬 (덱)</h3>
              <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2 hide-scrollbar">
                {viewingEnemy.template.deck.map((card, idx) => (<div key={idx} className="bg-slate-900 p-3 rounded border border-slate-700"><div className="font-bold text-white text-sm mb-1">{card.name}</div><div className="text-xs text-slate-400">{card.desc}</div></div>))}
              </div>
            </div>
            <button onClick={() => { setViewingEnemy(null); setShowEnemyDeck(false); }} className="mt-6 w-full py-3 bg-red-800 hover:bg-red-700 rounded-lg font-bold transition-all">닫기</button>
          </div>
        </div>
      )}

      {/* 상단 유물 바 */}
      {playerRelics && playerRelics.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2 z-10 w-full pl-1">
          {playerRelics.map((r, i) => {
            let rBorder = 'border-slate-500'; let rText = 'text-white';
            if (r.rarity === 'uncommon') { rBorder = 'border-cyan-500'; rText = 'text-cyan-200'; }
            if (r.rarity === 'rare') { rBorder = 'border-yellow-500'; rText = 'text-yellow-200'; }
            if (r.rarity === 'special') { rBorder = 'border-fuchsia-500'; rText = 'text-fuchsia-200'; }
            if (r.rarity === 'mythic') { rBorder = 'border-red-500'; rText = 'text-red-300'; }
            return (
              <div key={i} className={`relative group cursor-help bg-slate-800 border-2 ${rBorder} px-2 py-0.5 md:py-1 rounded-lg flex items-center shadow-md hover:bg-slate-700 transition-colors`}>
                <span className={`text-[10px] md:text-xs font-bold ${rText}`}>{r.name}</span>
                <div className="absolute top-full left-0 mt-2 hidden group-hover:block w-56 p-3 bg-slate-900 border-2 border-slate-600 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] z-[99999] pointer-events-none">
                  <div className="text-xs leading-relaxed text-slate-300 break-keep">
                    <span className="text-amber-400 font-black block mb-1.5 border-b border-slate-700 pb-1">{r.name}</span>
                    {r.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 상단 스테이지 바 */}
      <div className="flex justify-between items-center bg-slate-800/80 p-2 md:p-3 rounded-lg border border-slate-700 shadow-md z-10 shrink-0">
        <div className="font-bold text-sm md:text-lg flex items-center gap-1 md:gap-2 text-indigo-300">
          <RefreshCw className="w-4 h-4 md:w-5 md:h-5" /> {mode === 'HARD' ? '하드 모드' : '일반 모드'} - STAGE {stage} 
        </div>
        <div className="flex items-center gap-2 md:gap-4 font-bold text-xs md:text-base">
          <button onClick={() => { setFastMode(!fastMode); saveGame({ fastMode: !fastMode }); }} className={`p-1.5 md:p-2 rounded-full border transition-colors ${fastMode ? 'bg-indigo-600 border-indigo-400' : 'bg-slate-700 border-slate-500 hover:bg-slate-600'}`} title="빠른 전투 토글">
            <FastForward className={`w-4 h-4 md:w-5 md:h-5 ${fastMode ? 'text-white' : 'text-slate-400'}`} />
          </button>
          <button onClick={() => setTutorialModalOpen(true)} className="bg-slate-700 hover:bg-slate-600 p-1.5 md:p-2 rounded-full border border-slate-500 transition-colors"><HelpCircle className="w-4 h-4 md:w-5 md:h-5 text-indigo-300" /></button>
          <span className="text-slate-300 cursor-pointer hover:text-indigo-300 transition-colors bg-slate-700/50 px-3 py-1.5 rounded-lg border border-slate-600 font-black shadow-inner" onClick={() => setViewingPile('baseDeck')}>총 덱: {baseDeck.length}장</span>
          <button onClick={() => setGameState('GAME_OVER')} className="text-slate-500 hover:text-red-500 opacity-60 hover:opacity-100 transition-all border border-slate-600 rounded px-2 py-1">포기</button>
        </div>
      </div>

      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0 opacity-[0.03]">
        <h1 className="text-[8rem] md:text-[12rem] font-black italic whitespace-nowrap tracking-tighter">{isPlayerTurn ? 'PLAYER TURN' : 'ENEMY TURN'}</h1>
      </div>

      {/* 전투 필드 (플레이어 vs 적) */}
      <div className="flex-1 flex flex-row justify-center items-end pb-8 border-b-2 border-slate-700/50 w-full max-w-5xl mx-auto mt-10 relative z-10">
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
          <div className="flex gap-1 md:gap-2 h-8 mt-1 flex-wrap justify-center">
            <StatusIcon type="strength" value={player.buffs?.strength} />
            <StatusIcon type="dexterity" value={player.buffs?.dexterity} />
            <StatusIcon type="thorns" value={player.buffs?.thorns} />
            <StatusIcon type="poison" value={player.debuffs?.poison} />
            <StatusIcon type="weak" value={player.debuffs?.weak} />
            <StatusIcon type="vulnerable" value={player.debuffs?.vulnerable} />
          </div>
        </div>

        <div className="text-3xl md:text-5xl font-black text-slate-700 italic px-6 pb-16">VS</div>

        <div className="flex flex-row gap-4 md:gap-8 justify-center items-end flex-wrap w-1/2">
          {enemies.map((enemy, idx) => {
            const isVanguard = idx === 0; const eCard = enemy.intentCard;
            return (
              <div key={enemy.uid} className={`flex flex-col items-center cursor-pointer transition-all duration-500 origin-bottom w-[110px] md:w-auto ${!isPlayerTurn ? 'scale-110 z-30' : isVanguard ? 'scale-100 opacity-80' : 'scale-90 opacity-50'}`} onClick={() => { setViewingEnemy(enemy); setShowEnemyDeck(true); }}>
                {isVanguard && <div className="text-red-500 font-black text-[10px] md:text-base animate-bounce mb-1 tracking-widest">▼ 타겟</div>}
                <div className="mb-4 md:mb-6 relative z-10"><div className={`w-24 md:w-28 bg-slate-900 border-2 rounded-lg p-2 shadow-xl text-center ${eCard.type.includes('attack') ? 'border-red-500' : 'border-blue-500'}`}><div className="text-[10px] md:text-sm font-bold truncate text-white">{eCard.name}</div><div className="text-[8px] md:text-[10px] text-slate-400 mt-1 line-clamp-2">{eCard.desc}</div></div></div>
                <div className={`rounded-full flex justify-center items-center mb-1 md:mb-2 border-4 shadow-2xl relative ${enemy.isBoss ? 'bg-red-950 border-red-400 w-20 h-20 md:w-32 md:h-32' : 'bg-red-900/40 border-red-500 w-16 h-16 md:w-24 md:h-24'}`}>
                  <Skull className={`${enemy.isBoss ? 'w-10 h-10 md:w-16 md:h-16 text-red-300' : 'w-8 h-8 md:w-12 md:h-12 text-red-400'}`} />
                  {enemy.block > 0 && <div className="absolute -top-1 -right-1 md:-top-2 md:-right-2 bg-slate-600 w-6 h-6 md:w-8 md:h-8 rounded-full flex justify-center items-center font-bold border-2 border-slate-400 text-[10px] md:text-sm">{enemy.block}</div>}
                </div>
                <h3 className={`text-xs md:text-lg font-bold mb-1 ${enemy.isBoss ? 'text-red-300' : 'text-red-400'} truncate w-full text-center`}>{enemy.name}</h3>
                <div className="w-full max-w-[100px] md:max-w-[140px] bg-slate-800 h-3 md:h-5 rounded-full overflow-hidden border border-slate-600 relative"><div className={`${enemy.isBoss ? 'bg-red-600' : 'bg-red-500'} h-full transition-all duration-300`} style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }}/><span className="absolute inset-0 flex justify-center items-center text-[8px] md:text-[10px] font-bold drop-shadow-md">{enemy.hp} / {enemy.maxHp}</span></div>
                <div className="flex gap-1 mt-1 flex-wrap justify-center w-full min-h-[16px]">
                  <StatusIcon type="poison" value={enemy.debuffs?.poison} isEnemy={true} />
                  <StatusIcon type="weak" value={enemy.debuffs?.weak} isEnemy={true} />
                  <StatusIcon type="vulnerable" value={enemy.debuffs?.vulnerable} isEnemy={true} />
                  <StatusIcon type="strength" value={enemy.buffs?.strength} isEnemy={true} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 하단 마나 및 손패 */}
      <div className="h-[30vh] min-h-[200px] shrink-0 flex flex-col items-center justify-end pb-2 md:pb-4 relative w-full pt-4">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 text-center font-bold text-slate-300 text-[10px] md:text-sm mb-1 md:mb-2 z-10 border border-slate-700 bg-slate-800/80 px-3 py-1 rounded-full shadow-lg">손패: {hand.length} / {MAX_HAND_SIZE}장</div>
        <div className="flex w-full px-2 md:px-4 relative justify-center items-end h-full">
          <div className="absolute left-0 md:left-4 bottom-4 flex flex-col items-center gap-2 md:gap-6 z-20">
            <div className="flex flex-col items-center"><div className="w-12 h-12 md:w-20 md:h-20 bg-blue-900 border-[3px] md:border-4 border-blue-400 rounded-full flex justify-center items-center shadow-[0_0_20px_rgba(59,130,246,0.8)]"><span className="text-xl md:text-4xl font-black text-white">{player.mana}</span></div><span className="bg-slate-900/80 px-2 md:px-3 py-0.5 rounded-full text-[9px] md:text-xs font-bold text-blue-300 mt-1 border border-slate-700">마나</span></div>
            <div className="flex flex-col items-center cursor-pointer group" onClick={() => setViewingPile('drawPile')}><div className="w-10 h-14 md:w-16 md:h-24 bg-slate-700 border-2 border-slate-500 rounded-lg flex items-center justify-center font-black text-lg md:text-2xl shadow-xl group-hover:-translate-y-2 transition-transform hover:border-indigo-400">{drawPile.length}</div><span className="text-slate-300 font-bold mt-1 text-[9px] md:text-sm group-hover:text-indigo-300">뽑을 패</span></div>
          </div>
          <div className="flex justify-center items-end w-full px-16 h-full pb-4 overflow-visible">
            {hand.map((card, idx) => {
              const canPlay = isPlayerTurn && player.mana >= card.cost; const isHovered = hoveredCard === idx; const offset = idx - (hand.length - 1) / 2; const rotation = offset * 4; const translateY = Math.abs(offset) * 6; 
              return (
                <div key={card.uid} onMouseEnter={() => setHoveredCard(idx)} onMouseLeave={() => setHoveredCard(null)} className="relative transition-all duration-300 ease-out origin-bottom -ml-6 md:-ml-10 first:ml-0" style={{ zIndex: isHovered ? 100 : 10 + idx, transform: isHovered ? `translateY(-80px) scale(1.15)` : `translateY(${translateY}px) rotate(${rotation}deg)` }}>
                  <div onClick={() => canPlay && handlePlayCard(idx)} className={`w-28 h-40 md:w-36 md:h-48 ${canPlay ? '' : 'opacity-50 grayscale'}`}><Card card={card} isLocked={false} /></div>
                </div>
              );
            })}
          </div>
          <div className="absolute right-0 md:right-4 bottom-4 flex flex-col items-center gap-2 md:gap-6 z-20">
            <button onClick={() => setCombatState(prev => ({ ...prev, turn: 'ENEMY' }))} disabled={!isPlayerTurn} className={`py-2 px-3 md:py-3 md:px-6 rounded-full font-bold text-[10px] md:text-lg flex items-center gap-1 transition-all border ${isPlayerTurn ? 'bg-amber-600 hover:bg-amber-500 text-white border-amber-400' : 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'}`}>{isPlayerTurn ? '턴 종료' : '적 턴...'} <ArrowRightCircle className="w-3 h-3 md:w-5 md:h-5"/></button>
            <div className="flex flex-col items-center cursor-pointer group" onClick={() => setViewingPile('discardPile')}><div className="w-10 h-14 md:w-16 md:h-24 bg-slate-800 border-2 border-slate-600 rounded-lg flex items-center justify-center font-black text-lg md:text-2xl shadow-xl group-hover:-translate-y-2 transition-transform hover:border-red-400">{discardPile.length}</div><span className="text-slate-400 font-bold mt-1 text-[9px] md:text-sm group-hover:text-red-300">무덤</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}