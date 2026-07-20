// src/components/screens/BattleScreen.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Shield, RefreshCw, ArrowRightCircle, HelpCircle, FastForward, Sword, Zap, Heart } from 'lucide-react'; 
import { getDynamicCardDef } from '../../utils/gameLogic';
import Card from '../common/Card';
import StatusIcon from '../common/StatusIcon';
import CommonEffects from '../effects/CommonEffects';
import TierEffects from '../effects/TierEffects';
import StatusEffects from '../effects/StatusEffects';
import UniqueEffects from '../effects/UniqueEffects';
import Tooltip from '../common/Tooltip'; 
import WeatherLayer from '../common/WeatherLayer';
import UltimateCutscene from '../effects/UltimateCutscene';

import heroImg from '../../assets/images/characters/hero.svg';
import slimeImg from '../../assets/images/monsters/slime.svg';
import skeletonImg from '../../assets/images/monsters/skeleton.svg';

export default function BattleScreen({
  combatState, isPlayerTurn, setViewingPile, viewingPile, setGameState, hoveredCard, setHoveredCard,
  playCard, setCombatState, MAX_HAND_SIZE, setShowEnemyDeck, setViewingEnemy, setTutorialModalOpen,
  viewingEnemy, showEnemyDeck, playerRelics, fastMode, setFastMode, saveGame
}) {
  const [playEffect, setPlayEffect] = useState(null);
  const prevHpRef = useRef(combatState?.player?.hp);
  
  const [animatingCardIndex, setAnimatingCardIndex] = useState(null);
  const [turnBanner, setTurnBanner] = useState(null);
  
  const [discardingHand, setDiscardingHand] = useState(false);

  const [targetIndex, setTargetIndex] = useState(0);
  const [showUltimate, setShowUltimate] = useState(null);

  // ✨ 추가: 적이 죽어서 몬스터 배열 길이가 타겟 인덱스보다 작아질 경우 방지
  useEffect(() => {
    if (combatState?.enemies && targetIndex >= combatState.enemies.length) {
      setTargetIndex(Math.max(0, combatState.enemies.length - 1));
    }
  }, [combatState?.enemies?.length, targetIndex]);

  useEffect(() => {
    if (combatState?.turn) {
      setTurnBanner(combatState.turn === 'PLAYER' ? 'YOUR TURN' : 'ENEMY TURN');
      
      if (combatState.turn === 'PLAYER') {
        setDiscardingHand(false);
      }

      const timer = setTimeout(() => setTurnBanner(null), 800); 
      return () => clearTimeout(timer);
    }
  }, [combatState?.turn]);

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
  const isEnemyTurn = combatState.turn === 'ENEMY';

  const handleTurnEndClick = async () => {
    if (!isPlayerTurn || discardingHand) return;
    
    setDiscardingHand(true);
    await new Promise(r => setTimeout(r, 300 + hand.length * 50)); 
    setCombatState(prev => ({ ...prev, turn: 'ENEMY' }));
  };

  const handlePlayCard = async (idx) => {
    if (playEffect && playEffect.name !== 'enemy_attack') return;
    if (discardingHand) return; 

    const card = hand[idx];
    const isAttack = card.type === 'attack';
    const hits = card.multiHit || 1;
    const tier = card.rarity || 'common';
    const delay = fastMode ? 20 : (isAttack ? 50 : 30);

    setAnimatingCardIndex(idx);
    await new Promise(r => setTimeout(r, 20)); 

    // 🌟 궁극기(신화) 카드 컷신 연출
    if (card.rarity === 'mythic' && !fastMode) {
      setShowUltimate(card);
      await new Promise(r => setTimeout(r, 2800)); // 컷신 종료 대기
      setShowUltimate(null);
    }
    
    playCard(idx, targetIndex);
    setAnimatingCardIndex(null);

    if (isAttack || card.id === 'mana_potion' || card.id === 'purify') {
      for (let i = 0; i < hits; i++) {
        let effectName = null;
        if (card.id === 'mana_potion') effectName = 'mana_potion'; 
        else if (card.id === 'purify') effectName = 'purify_effect';
        else if (card.id === 'furioso') effectName = 'furioso';
        else if (card.id === 'meteor_fall') effectName = 'meteor';
        else if (card.id === 'snipe') effectName = 'snipe';
        else effectName = tier === 'common' ? 'common_hit' : `${tier}_attack`;

        setPlayEffect({ id: Date.now() + i, name: effectName, tier, cardId: card.id, hits });
        await new Promise(r => setTimeout(r, delay));
      }
    } else {
      await new Promise(r => setTimeout(r, delay));
    }
    
    setPlayEffect(null);
  };

  const isShaking = playEffect && ['enemy_attack', 'furioso', 'meteor', 'snipe', 'mythic', 'rare', 'special'].includes(playEffect.name);

  const getEnemyImage = (name) => {
    if (!name) return slimeImg;
    if (name.includes('스켈레톤') || name.includes('리치')) return skeletonImg;
    return slimeImg;
  };

  return (
    <div className={`flex flex-col h-[100dvh] bg-slate-900 text-white p-2 md:p-4 relative overflow-hidden ${isShaking ? 'animate-shake' : ''}`}>
      <WeatherLayer stage={combatState?.stage || 1} />
      
      <style>{`
        @keyframes slashHit { 0% { transform: scaleX(0) scaleY(1); opacity: 0; } 10% { transform: scaleX(0.5) scaleY(3); opacity: 1; } 100% { transform: scaleX(1.5) scaleY(0); opacity: 0; } }
        .slash-line { animation: slashHit 0.25s ease-out forwards; opacity: 0; }
        @keyframes screenShake { 0% { transform: translate(0, 0); } 20% { transform: translate(-10px, 10px); } 40% { transform: translate(10px, -10px); } 60% { transform: translate(-10px, -10px); } 80% { transform: translate(10px, 10px); } 100% { transform: translate(0, 0); } }
        .animate-shake { animation: screenShake 0.4s ease-out; }
        @keyframes flashRed { 0% { background-color: rgba(220, 38, 38, 0.6); } 100% { background-color: transparent; } }
        .animate-flash-red { animation: flashRed 0.5s ease-out forwards; }
        @keyframes pulse-glow { 0%, 100% { text-shadow: 0 0 10px rgba(59, 130, 246, 0.8), 0 0 20px rgba(59, 130, 246, 0.4); } 50% { text-shadow: 0 0 25px rgba(59, 130, 246, 1), 0 0 40px rgba(59, 130, 246, 0.6); } }
        .mana-font { animation: pulse-glow 2s infinite; font-family: 'Arial Black', sans-serif; }
        
        @keyframes manaSooth {
          0% { transform: scale(0.5) translateY(20px); opacity: 0; }
          50% { transform: scale(1.5) translateY(-20px); opacity: 1; filter: drop-shadow(0 0 20px #06b6d4); }
          100% { transform: scale(2) translateY(-40px); opacity: 0; }
        }
        .mana-sooth { animation: manaSooth 0.6s ease-out forwards; }

        @keyframes drawCardAnim {
          0% { opacity: 0; transform: translate(-30vw, 30vh) scale(0.1) rotate(-30deg); }
          100% { opacity: 1; transform: translate(0, 0) scale(1) rotate(0deg); }
        }
        .animate-draw-card { 
          animation: drawCardAnim 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; 
        }
        
        @keyframes bannerSlide {
          0% { transform: translateX(-100%) skewX(-15deg); opacity: 0; }
          20% { transform: translateX(0) skewX(-15deg); opacity: 1; }
          80% { transform: translateX(0) skewX(-15deg); opacity: 1; }
          100% { transform: translateX(100%) skewX(-15deg); opacity: 0; }
        }
        .animate-turn-banner { 
          animation: bannerSlide 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; 
        }

        @keyframes enemyActionPulse {
          0%, 100% { filter: drop-shadow(0 0 15px rgba(220,38,38,0.4)); transform: scale(1.1); }
          50% { filter: drop-shadow(0 0 40px rgba(239,68,68,0.9)); transform: scale(1.15); }
        }
        .animate-pulse-enemy {
          animation: enemyActionPulse 1.5s infinite ease-in-out;
        }
      `}</style>

      {turnBanner && (
        <div className="fixed inset-0 z-[10005] pointer-events-none flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="w-full bg-gradient-to-r from-transparent via-slate-900/90 to-transparent py-8 flex justify-center animate-turn-banner shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <h1 className={`text-6xl md:text-8xl font-black italic tracking-widest ${
              turnBanner.includes('ENEMY') 
                ? 'text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,1)]' 
                : 'text-indigo-400 drop-shadow-[0_0_20px_rgba(99,102,241,1)]'
            }`}>
              {turnBanner}
            </h1>
          </div>
        </div>
      )}

      {combatState?.cutsceneData && (
        <div className="fixed inset-0 z-[10010] pointer-events-none flex items-center justify-center bg-black/60 backdrop-blur-md transition-all duration-300">
          <div className="w-full bg-gradient-to-r from-transparent via-red-950/90 to-transparent py-16 flex flex-col justify-center items-center shadow-[0_0_100px_rgba(220,38,38,0.8)] border-y-4 border-red-500/50">
            <h2 className="text-3xl md:text-5xl font-black text-slate-300 drop-shadow-[0_0_10px_white] mb-4 animate-pulse">{combatState.cutsceneData.name}</h2>
            <h1 className="text-6xl md:text-9xl font-black italic tracking-tighter text-red-500 drop-shadow-[0_0_40px_rgba(239,68,68,1)] transform scale-110">
              {combatState.cutsceneData.skillName}
            </h1>
          </div>
        </div>
      )}

      {playEffect?.name !== 'mana_potion' && playEffect?.name !== 'purify_effect' && <TierEffects playEffect={playEffect} />}
      <StatusEffects playEffect={playEffect} />
      <UniqueEffects playEffect={playEffect} />

      {playEffect?.name === 'mana_potion' && (
        <div className="fixed inset-0 z-[9999] pointer-events-none flex items-center justify-center">
          <div className="absolute w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
          <Zap className="w-32 h-32 text-cyan-300 mana-sooth" />
        </div>
      )}

      {playEffect?.name === 'purify_effect' && (
        <div className="fixed inset-0 z-[9999] pointer-events-none flex items-center justify-center">
          <div className="absolute w-64 h-64 bg-green-500/20 rounded-full blur-3xl animate-pulse" />
          <Shield className="w-32 h-32 text-green-300 mana-sooth" />
        </div>
      )}

      {playEffect?.name === 'enemy_attack' && (
        <div className="fixed inset-0 z-[9999] pointer-events-none animate-flash-red flex items-center justify-center">
          <h1 className="text-[5rem] md:text-[8rem] text-red-500 font-black drop-shadow-[0_0_30px_black] animate-bounce">- {playEffect.damage}</h1>
        </div>
      )}

      {showUltimate && (
        <UltimateCutscene cardName={showUltimate.name} heroImg={heroImg} onComplete={() => setShowUltimate(null)} />
      )}

      {viewingPile && (
        <div className="fixed inset-0 bg-black/95 z-[10000] flex flex-col p-4 md:p-10 backdrop-blur-xl" onClick={() => setViewingPile(null)}>
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-700">
            <h2 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tighter">
              {viewingPile === 'baseDeck' ? 'Full Deck' : viewingPile === 'drawPile' ? 'Draw Pile' : 'Discard Pile'} 
              <span className="text-indigo-400 ml-4 font-bold text-xl md:text-2xl">({combatState[viewingPile].length} CARDS)</span>
            </h2>
            <button onClick={() => setViewingPile(null)} className="text-slate-400 hover:text-white text-5xl font-bold">×</button>
          </div>
          <div className="flex-1 overflow-y-auto hide-scrollbar flex flex-wrap gap-4 md:gap-6 content-start justify-center" onClick={e => e.stopPropagation()}>
            {combatState[viewingPile].map((card, idx) => (<div key={idx} className="w-28 h-40 md:w-36 md:h-52 transform transition-all hover:scale-110 hover:-translate-y-2"><Card card={card} isLocked={false} /></div>))}
          </div>
        </div>
      )}

      {showEnemyDeck && viewingEnemy && (
        <div className="fixed inset-0 bg-black/95 z-[10001] flex items-center justify-center p-4 backdrop-blur-xl" onClick={() => { setViewingEnemy(null); setShowEnemyDeck(false); }}>
          <div className="bg-slate-900 p-6 rounded-3xl border-4 border-red-900/50 w-full max-w-2xl shadow-[0_0_50px_rgba(220,38,38,0.2)]" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl md:text-4xl font-black text-red-500 uppercase tracking-tighter mb-2">{viewingEnemy.name}</h2>
                <div className="flex items-center gap-2">
                  <div className="bg-red-900/50 px-3 py-1 rounded-full border border-red-500/50 text-red-300 text-sm font-bold">HP {viewingEnemy.hp} / {viewingEnemy.maxHp}</div>
                  {viewingEnemy.isBoss && <div className="bg-amber-600 px-3 py-1 rounded-full text-white text-xs font-black animate-pulse">BOSS</div>}
                </div>
              </div>
              <button onClick={() => { setViewingEnemy(null); setShowEnemyDeck(false); }} className="text-slate-600 hover:text-white text-4xl font-bold transition-colors">×</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-black text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-2"><Zap className="w-5 h-5 text-amber-400"/> PASSIVE SKILLS</h3>
                <div className="space-y-3 max-h-[30vh] overflow-y-auto pr-2 hide-scrollbar">
                  {viewingEnemy.passives && viewingEnemy.passives.length > 0 ? viewingEnemy.passives.map(p => (
                    <div key={p.id} className="bg-slate-800/50 p-3 rounded-xl border border-slate-700 group hover:border-amber-500/50 transition-colors">
                      <div className="text-amber-400 font-bold mb-1 text-sm">{p.name}</div>
                      <div className="text-xs text-slate-400 leading-relaxed">{p.desc}</div>
                    </div>
                  )) : <div className="text-slate-600 font-bold italic py-4 text-center bg-slate-800/30 rounded-xl text-sm">획득한 패시브가 없습니다.</div>}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-black text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-2"><Sword className="w-5 h-5 text-red-500"/> ATTACK PATTERN</h3>
                <div className="space-y-3 max-h-[30vh] overflow-y-auto pr-2 hide-scrollbar">
                  {viewingEnemy.template?.deck ? viewingEnemy.template.deck.map((card, idx) => (
                    <div key={idx} className="bg-slate-800/50 p-3 rounded-xl border border-slate-700 hover:border-red-500/50 transition-colors">
                      <div className="font-bold text-white mb-1 flex justify-between text-sm">
                        <span>{card.name}</span>
                        {card.value && <span className="text-red-400">DMG {card.value}</span>}
                      </div>
                      <div className="text-xs text-slate-400 leading-relaxed">{card.desc}</div>
                    </div>
                  )) : <div className="text-slate-600 font-bold italic py-4 text-center text-sm">알 수 없는 패턴입니다.</div>}
                </div>
              </div>
            </div>
            
            <button onClick={() => { setViewingEnemy(null); setShowEnemyDeck(false); }} className="mt-8 w-full py-4 bg-gradient-to-r from-red-900 to-red-700 hover:from-red-800 hover:to-red-600 text-white rounded-xl font-black text-lg shadow-xl transition-all active:scale-95">확인 완료</button>
          </div>
        </div>
      )}

      {/* --- 상단 정보 영역 (shrink-0) --- */}
      <div className="shrink-0 flex flex-col w-full z-10">
        {playerRelics && playerRelics.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2 w-full px-2">
            {playerRelics.map((r, i) => (
              <div key={i} className="relative group bg-slate-800/80 border-2 border-slate-600 p-1 rounded-lg shadow-sm hover:border-indigo-400 transition-colors flex items-center">
                <span className="text-[10px] font-bold text-slate-100 px-1 uppercase tracking-tighter cursor-help">
                  {r.name}
                </span>
                <Tooltip desc={r.desc} direction="down" />
                
                <div className="absolute top-full left-0 mt-2 hidden group-hover:block w-48 p-3 bg-slate-900 border-2 border-indigo-500/50 rounded-xl shadow-2xl z-[100000] pointer-events-none">
                  <div className="text-amber-400 font-bold text-xs mb-1 border-b border-slate-800 pb-1">{r.name}</div>
                  <div className="text-[10px] text-slate-300 leading-relaxed">{r.desc}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-between items-center bg-slate-800/90 p-2 md:p-3 rounded-xl border border-slate-700 shadow-lg mb-4">
          <div className="font-black text-sm md:text-xl flex items-center gap-2 text-indigo-400 tracking-tighter italic">
            <RefreshCw className="w-4 h-4 md:w-5 md:h-5 animate-spin-slow" /> {mode === 'ENDLESS' ? '무한 모드' : mode === 'HARD' ? '하드 모드' : '일반 모드'} STAGE {stage} 
          </div>
          <div className="flex items-center gap-2 md:gap-4 font-bold text-xs md:text-sm">
            <button onClick={() => { setFastMode(!fastMode); saveGame({ fastMode: !fastMode }); }} className={`p-2 rounded-lg border transition-all ${fastMode ? 'bg-indigo-600 border-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.6)]' : 'bg-slate-700 border-slate-600'}`}>
              <FastForward className={`w-4 h-4 ${fastMode ? 'text-white' : 'text-slate-400'}`} />
            </button>
            <button onClick={() => setTutorialModalOpen(true)} className="bg-slate-700 p-2 rounded-lg border border-slate-600 hover:bg-slate-600 transition-colors"><HelpCircle className="w-4 h-4 text-indigo-300" /></button>
            <span className="text-slate-300 cursor-pointer hover:text-indigo-300 bg-slate-950/80 px-3 py-2 rounded-lg border border-slate-700 font-bold shadow-inner" onClick={() => setViewingPile('baseDeck')}>DECK: {baseDeck.length}</span>
            <button onClick={() => setGameState('GAME_OVER')} className="text-red-500/50 hover:text-red-500 transition-colors text-xs font-bold px-2">EXIT</button>
          </div>
        </div>
      </div>

      {/* --- 핵심 변경: 몬스터 영역 (flex-1, 스크롤 처리) --- */}
      <div className="flex-1 overflow-y-auto min-h-0 w-full relative z-10 hide-scrollbar px-2">
        <div className="flex flex-row justify-center items-end pb-8 md:pb-16 w-full max-w-6xl mx-auto min-h-full">
          
          {/* 플레이어 */}
          <div className={`flex flex-col items-center w-1/3 transition-all duration-500 ${isPlayerTurn && !discardingHand ? 'scale-105 z-30' : 'scale-95 opacity-60'}`}>
            <div className={`w-20 h-20 md:w-32 md:h-32 bg-gradient-to-br from-slate-700 to-slate-900 rounded-full flex justify-center items-center mb-4 border-4 border-indigo-500 relative shadow-[0_0_30px_rgba(79,70,229,0.3)] ${combatState?.hitEffect?.targetUid === 'player' ? 'animate-hit-shake animate-hit-flash' : ''}`}>
              <img src={heroImg} alt="Player" className="w-12 h-12 md:w-20 md:h-20 drop-shadow-[0_0_15px_rgba(79,70,229,0.5)]" />
              
              {player.block > 0 && (
                <div className="absolute -top-3 -right-3 bg-blue-600 w-10 h-10 md:w-12 md:h-12 rounded-full flex justify-center items-center font-black border-2 border-white shadow-[0_0_15px_blue] z-50">
                  <Shield className="absolute text-white/30 w-full h-full p-1" />
                  <span className="relative z-10 text-white text-xs md:text-sm">{player.block}</span>
                </div>
              )}

              {/* 🐾 하수인 위젯 */}
              {player.minion && (
                <div className="absolute -left-10 -top-8 md:-left-16 md:-top-12 flex flex-col items-center animate-bounce z-40">
                  <div className="w-10 h-10 md:w-14 md:h-14 bg-slate-800 rounded-full border-2 border-emerald-400 flex justify-center items-center shadow-[0_0_15px_rgba(52,211,153,0.5)] text-lg md:text-2xl">
                    {player.minion.id === 'golem' ? '🪨' : '🧚'}
                  </div>
                  <div className="bg-slate-900 px-2 py-0.5 rounded-full text-[8px] md:text-[10px] font-black text-emerald-300 mt-1 border border-emerald-500 shadow-md">
                    {player.minion.hp}/{player.minion.maxHp}
                  </div>
                </div>
              )}
            </div>
            <h3 className="text-sm md:text-xl font-black mb-1 text-indigo-400 tracking-tighter uppercase italic">PLAYER</h3>
            
            {/* ⚔️ 태세 표시 */}
            {player.stance && player.stance !== 'normal' && (
              <div className={`mb-2 px-3 py-0.5 rounded-full text-[10px] md:text-xs font-black border flex items-center gap-1 ${
                player.stance === 'offensive' ? 'bg-red-900/60 text-red-400 border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' 
                : 'bg-blue-900/60 text-blue-400 border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]'
              }`}>
                {player.stance === 'offensive' ? '⚔️ 공격 태세 (+50% / +25%)' : '🛡️ 방어 태세 (-25% / -50%)'}
              </div>
            )}

            <div className="w-full max-w-[120px] md:max-w-[200px] bg-slate-950 h-4 md:h-5 rounded-full overflow-hidden border border-slate-800 relative shadow-inner">
              <div className="bg-gradient-to-r from-emerald-600 via-green-400 to-emerald-600 h-full transition-all duration-700" style={{ width: `${(player.hp / player.maxHp) * 100}%` }}/>
              <span className="absolute inset-0 flex justify-center items-center text-[9px] md:text-[11px] font-black drop-shadow-md tracking-widest">{player.hp} / {player.maxHp}</span>
            </div>
            
            <div className="flex gap-1 mt-2 flex-wrap justify-center max-w-[200px] scale-90">
              <StatusIcon type="strength" value={player.buffs?.strength} />
              <StatusIcon type="dexterity" value={player.buffs?.dexterity} />
              <StatusIcon type="thorns" value={player.buffs?.thorns} />
              <StatusIcon type="intangible" value={player.buffs?.intangible} />
              <StatusIcon type="regen" value={player.buffs?.regen} />
              <StatusIcon type="rage" value={player.buffs?.rage} />
              <StatusIcon type="insight" value={player.buffs?.insight} />
              <StatusIcon type="poison" value={player.debuffs?.poison} />
              <StatusIcon type="weak" value={player.debuffs?.weak} />
              <StatusIcon type="vulnerable" value={player.debuffs?.vulnerable} />
              <StatusIcon type="mark" value={player.debuffs?.mark} />
              <StatusIcon type="frail" value={player.debuffs?.frail} />
              <StatusIcon type="silence" value={player.debuffs?.silence} />
              <StatusIcon type="bind" value={player.debuffs?.bind} />
            </div>
          </div>

          <div className="text-3xl md:text-6xl font-black text-slate-800/40 italic px-6 md:px-12 mb-8 md:mb-12 select-none tracking-tighter">VS</div>

          {/* 몬스터 */}
          <div className="flex flex-row gap-6 md:gap-12 justify-center items-end flex-wrap flex-1 min-w-[40%]">
            {enemies.map((enemy, idx) => {
              const isTarget = idx === targetIndex; // ✅ 0 대신 targetIndex 상태값을 바라보게 수정
              const intents = enemy.intentCards || [];
              
              return (
                <div key={enemy.uid} className={`flex flex-col items-center cursor-pointer transition-all duration-500 origin-bottom ${isEnemyTurn ? 'scale-110 z-40 animate-pulse-enemy' : isTarget ? 'scale-100 opacity-90 hover:scale-105' : 'scale-90 opacity-40 hover:scale-95'}`} onClick={() => setTargetIndex(idx)}>
                {isTarget && <div className="text-red-500 font-black text-[10px] md:text-sm animate-pulse mb-1 tracking-tighter">TARGET ▼</div>}

                  <div className={`mb-4 relative z-10 flex gap-2 transition-all duration-500 ${isEnemyTurn ? 'scale-125 -translate-y-4 drop-shadow-[0_0_20px_rgba(220,38,38,0.8)]' : ''}`}>
                    {intents.map((eCard, cardIdx) => {
                      let finalDmg = eCard.value ? eCard.value + (enemy.buffs?.strength || 0) : 0;
                      if (finalDmg > 0 && enemy.debuffs?.weak > 0) finalDmg = Math.floor(finalDmg * 0.97);
                      if (finalDmg > 0 && player.debuffs?.vulnerable > 0) finalDmg = Math.floor(finalDmg * 1.30);
                      if (finalDmg > 0 && (player.debuffs?.mark || 0) > 0) finalDmg += player.debuffs.mark;
                      if (finalDmg > 0 && (player.buffs?.intangible || 0) > 0) finalDmg = 1;

                      return (
                        <div key={eCard.uid || `intent-${cardIdx}`} className={`min-w-[90px] md:min-w-[110px] bg-slate-950 border-2 rounded-xl p-2 shadow-lg text-center flex flex-col items-center gap-1.5 transition-colors ${isEnemyTurn ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.6)]' : eCard.type.includes('attack') ? 'border-red-600/60 shadow-red-900/30' : eCard.type.includes('heal') ? 'border-emerald-600/60 shadow-emerald-900/30' : eCard.type.includes('debuff') ? 'border-fuchsia-600/60 shadow-fuchsia-900/30' : 'border-blue-600/60 shadow-blue-900/30'}`}>
                          <div className="text-[9px] md:text-[11px] font-bold text-slate-100 uppercase tracking-tighter truncate w-full">{eCard.name}</div>
                          
                          <div className="flex flex-wrap justify-center items-center gap-1">
                            {(eCard.value !== undefined || eCard.heal !== undefined || eCard.type === 'defend') && (
                              <div className="flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">
                                {eCard.type.includes('attack') ? <Sword className="w-3 h-3 text-red-500" /> : eCard.type.includes('heal') ? <Heart className="w-3 h-3 text-emerald-500" /> : <Shield className="w-3 h-3 text-blue-500" />}
                                <span className={`text-[10px] md:text-xs font-black ${finalDmg > (eCard.value || 0) ? 'text-red-400' : finalDmg < (eCard.value || 0) ? 'text-green-400' : 'text-white'}`}>
                                  {eCard.value ? (eCard.multi ? `${finalDmg}x${eCard.multi}` : finalDmg) : eCard.heal ? `+${eCard.heal}` : eCard.type === 'defend' ? 'DEF' : ''}
                                </span>
                              </div>
                            )}

                            {eCard.debuff && (
                              <div className="flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">
                                <span className={`text-[9px] md:text-[10px] font-black ${
                                  eCard.debuff === 'vulnerable' ? 'text-fuchsia-400' : 
                                  eCard.debuff === 'weak' ? 'text-blue-300' : 
                                  eCard.debuff === 'bind' ? 'text-yellow-400' :
                                  eCard.debuff === 'silence' ? 'text-slate-400' :
                                  'text-green-400'
                                }`}>
                                  {eCard.debuff === 'vulnerable' ? '취약' : 
                                   eCard.debuff === 'weak' ? '약화' : 
                                   eCard.debuff === 'bind' ? '속박' : 
                                   eCard.debuff === 'silence' ? '침묵' : 
                                   '중독'} {eCard.turns}
                                </span>
                              </div>
                            )}

                            {eCard.buff && (
                              <div className="flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">
                                <span className="text-[9px] md:text-[10px] font-black text-amber-400">
                                  {eCard.buff === 'strength' ? '근력' : '버프'} +{eCard.buffValue}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className={`rounded-full flex justify-center items-center mb-2 border-2 md:border-4 shadow-lg relative transition-transform hover:scale-105 ${enemy.isBoss ? 'bg-red-950 border-red-500 w-24 h-24 md:w-36 md:h-36' : 'bg-slate-800 border-red-900/50 w-16 h-16 md:w-24 md:h-24'} ${combatState?.hitEffect?.targetUid === enemy.uid ? 'animate-hit-shake animate-hit-flash' : ''}`}>
                    <img src={getEnemyImage(enemy.name)} alt={enemy.name} className={`${enemy.isBoss ? 'w-16 h-16 md:w-24 md:h-24' : 'w-10 h-10 md:w-16 md:h-16'} drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]`} />
                    {enemy.block > 0 && <div className="absolute -top-1 -right-1 bg-slate-600 w-7 h-7 md:w-8 md:h-8 rounded-full flex justify-center items-center font-black border border-slate-400 text-[10px] md:text-xs shadow-md">{enemy.block}</div>}
                    {isTarget && playEffect && playEffect.name !== 'mana_potion' && playEffect.name !== 'purify_effect' && <CommonEffects key={playEffect.id} playEffect={playEffect} fastMode={fastMode} />}
                  </div>

                {/* ✨ 변경: 적 이름과 정보 보기(덱 확인) 버튼을 나란히 배치 */}
                <div className="flex items-center justify-center gap-1 mb-1">
                  <h3 className={`text-[10px] md:text-base font-black ${enemy.isBoss ? 'text-red-500' : 'text-slate-300'} uppercase tracking-tighter`}>
                    {enemy.name}
                  </h3>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setViewingEnemy(enemy); setShowEnemyDeck(true); }} 
                    className="p-0.5 rounded-full hover:bg-slate-700 hover:text-indigo-300 transition-colors text-slate-500"
                    title="적 정보 보기"
                  >
                    <HelpCircle className="w-3 h-3 md:w-4 md:h-4" />
                  </button>
                </div>

                <div className="w-full max-w-[80px] md:max-w-[140px] bg-slate-950 h-3 md:h-4 rounded-full overflow-hidden border border-slate-800 relative shadow-inner">
                  <div className={`${enemy.isBoss ? 'bg-gradient-to-r from-red-800 to-red-600' : 'bg-red-700'} h-full transition-all duration-300`} style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }}/>
                  <span className="absolute inset-0 flex justify-center items-center text-[8px] md:text-[10px] font-black drop-shadow-md tracking-widest">{enemy.hp}</span>
                </div>
                  
                  <div className="flex gap-1 mt-2 flex-wrap justify-center w-full min-h-[18px] scale-90">
                    {enemy.passives && enemy.passives.map((p, pIdx) => (
                      <div key={`passive-${pIdx}`} className="relative group w-5 h-5 md:w-6 md:h-6 rounded-full bg-amber-900/80 border border-amber-500 flex justify-center items-center cursor-help">
                        <Zap className="w-3 h-3 text-amber-400" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-32 md:w-48 p-2 bg-slate-900 border-2 border-amber-500/50 rounded-xl shadow-2xl z-[1000] pointer-events-none text-left">
                          <div className="text-amber-400 font-bold text-[10px] md:text-xs mb-1 border-b border-slate-700 pb-1">{p.name}</div>
                          <div className="text-[9px] md:text-[10px] text-slate-300 whitespace-normal leading-relaxed">{p.desc}</div>
                        </div>
                      </div>
                    ))}
                    <StatusIcon type="strength" value={enemy.buffs?.strength} isEnemy={true} />
                    <StatusIcon type="dexterity" value={enemy.buffs?.dexterity} isEnemy={true} />
                    <StatusIcon type="thorns" value={enemy.buffs?.thorns} isEnemy={true} />
                    <StatusIcon type="intangible" value={enemy.buffs?.intangible} isEnemy={true} />
                    <StatusIcon type="regen" value={enemy.buffs?.regen} isEnemy={true} />
                    <StatusIcon type="rage" value={enemy.buffs?.rage} isEnemy={true} />
                    <StatusIcon type="insight" value={enemy.buffs?.insight} isEnemy={true} />
                    <StatusIcon type="poison" value={enemy.debuffs?.poison} isEnemy={true} />
                    <StatusIcon type="weak" value={enemy.debuffs?.weak} isEnemy={true} />
                    <StatusIcon type="vulnerable" value={enemy.debuffs?.vulnerable} isEnemy={true} />
                    <StatusIcon type="mark" value={enemy.debuffs?.mark} isEnemy={true} />
                    <StatusIcon type="frail" value={enemy.debuffs?.frail} isEnemy={true} />
                    <StatusIcon type="silence" value={enemy.debuffs?.silence} isEnemy={true} />
                    <StatusIcon type="bind" value={enemy.debuffs?.bind} isEnemy={true} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* --- 하단 플레이어 덱 및 UI 영역 (shrink-0, z-30 적용) --- */}
      <div className="h-[28dvh] min-h-[200px] shrink-0 flex flex-col items-center justify-end pb-4 relative w-full pt-4 bg-slate-900 border-t border-slate-800/50 z-30 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        

        
        <div className="flex w-full px-4 relative justify-center items-end h-full">
          <div className="absolute left-2 md:left-8 bottom-6 flex flex-col items-center gap-4 z-20">
            <div className="relative group">
              <div className="w-14 h-14 md:w-20 md:h-20 bg-blue-950 border-[3px] border-blue-400 rounded-full flex justify-center items-center shadow-[0_0_20px_rgba(59,130,246,0.5)] group-hover:shadow-[0_0_30px_rgba(59,130,246,0.8)] transition-all">
                <span className="text-2xl md:text-4xl font-black text-white mana-font">{player.mana}</span>
              </div>
              <div className="absolute -bottom-2 bg-slate-950 px-3 py-0.5 rounded-full border border-blue-500/50 text-[9px] md:text-[10px] font-black text-blue-400 shadow-lg tracking-widest">MANA</div>
            </div>
            <div className="flex flex-col items-center cursor-pointer group" onClick={() => setViewingPile('drawPile')}>
              <div className="w-12 h-16 md:w-16 md:h-24 bg-slate-800 border-2 border-slate-600 rounded-xl flex items-center justify-center font-black text-xl md:text-3xl shadow-[0_10px_20px_rgba(0,0,0,0.5)] group-hover:-translate-y-2 group-hover:border-indigo-500 transition-all duration-300">{drawPile.length}</div>
              <span className="text-slate-500 font-bold mt-1 text-[9px] md:text-xs tracking-tighter group-hover:text-indigo-400 transition-colors uppercase">Draw</span>
            </div>
          </div>

          <div className="flex justify-center items-end w-full px-20 md:px-40 h-full pb-4 overflow-visible">
            {hand.map((card, idx) => {
              const canPlay = isPlayerTurn && player.mana >= card.cost && !playEffect;
              const isHovered = hoveredCard === idx && !discardingHand; 
              const offset = idx - (hand.length - 1) / 2;
              
              const rotation = isHovered ? 0 : offset * 4.5;
              const translateY = isHovered ? -60 : Math.abs(offset) * 8; 

              let cardTransform = '';
              let cardOpacity = 1;

              if (discardingHand) {
                cardTransform = `translate(35vw, 20vh) scale(0.1) rotate(180deg)`;
                cardOpacity = 0;
              } else if (animatingCardIndex === idx) {
                cardTransform = 'translateY(-40vh) scale(0.5)';
                cardOpacity = 0;
              } else {
                cardTransform = `translateY(${translateY}px) rotate(${rotation}deg) scale(${isHovered ? 1.15 : 1})`;
              }

              return (
                <div key={card.uid} 
                     onMouseEnter={() => !discardingHand && setHoveredCard(idx)} 
                     onMouseLeave={() => !discardingHand && setHoveredCard(null)} 
                     className="relative origin-bottom -ml-6 md:-ml-10 first:ml-0 px-2" 
                     style={{ 
                       zIndex: isHovered ? 100 : 10 + idx, 
                       transform: cardTransform,
                       opacity: cardOpacity,
                       transition: discardingHand 
                          ? `all 0.5s cubic-bezier(0.55, 0.085, 0.68, 0.53) ${idx * 0.05}s` 
                          : 'all 0.3s ease-out',
                       pointerEvents: discardingHand ? 'none' : 'auto'
                     }}>
                  
                  <div className="animate-draw-card w-full h-full" 
                       style={{ 
                         animationDelay: `${idx * 0.03}s`, 
                         animationFillMode: 'backwards' 
                       }}>
                    <div onClick={() => canPlay && handlePlayCard(idx)} className={`w-28 h-40 md:w-40 md:h-56 bg-slate-900 shadow-xl rounded-xl transition-all ${canPlay ? 'cursor-pointer hover:ring-4 ring-indigo-400' : 'cursor-not-allowed brightness-75'}`}>
                      <Card card={getDynamicCardDef(card, player)} isLocked={false} />
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

          <div className="absolute right-2 md:right-8 bottom-6 flex flex-col items-end gap-3 z-20">
            <div className="text-center font-bold text-slate-100 text-[10px] md:text-sm tracking-widest bg-slate-900/90 px-4 py-2 rounded-xl border border-slate-600 shadow-xl backdrop-blur-md">
              손패 : <span className="text-indigo-400">{hand.length}</span> / {MAX_HAND_SIZE}장
            </div>
            <div className="flex gap-4 items-end">
              <div className="flex flex-col items-center cursor-pointer group" onClick={() => setViewingPile('discardPile')}>
                <div className="w-12 h-16 md:w-16 md:h-20 bg-slate-950 border-2 border-slate-800 rounded-xl flex items-center justify-center font-black text-xl md:text-3xl shadow-lg group-hover:-translate-y-2 group-hover:border-red-600 transition-all duration-300 text-slate-500">{discardPile.length}</div>
                <span className="text-slate-600 font-bold mt-1 text-[9px] md:text-xs tracking-tighter group-hover:text-red-500 transition-colors uppercase">Discard</span>
              </div>
              <button 
                onClick={handleTurnEndClick} 
                disabled={!isPlayerTurn || discardingHand} 
                className={`py-3 px-5 md:py-4 md:px-8 h-16 md:h-20 rounded-2xl font-black text-xs md:text-lg flex items-center justify-center gap-2 transition-all border-b-[6px] active:border-b-0 active:translate-y-1 ${isPlayerTurn && !discardingHand ? 'bg-amber-600 hover:bg-amber-500 text-white border-amber-800 shadow-[0_10px_20px_rgba(245,158,11,0.3)]' : 'bg-slate-800 text-slate-600 border-slate-900 cursor-not-allowed'}`}
              >
                {isPlayerTurn && !discardingHand ? 'TURN END' : 'WAIT...'} <ArrowRightCircle className="w-4 h-4 md:w-6 md:h-6"/>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}