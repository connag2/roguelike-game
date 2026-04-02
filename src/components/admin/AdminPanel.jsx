import React, { useState, useEffect, useRef } from 'react';
import { hashPassword } from '../utils/crypto';

// 복사한 해시값 유지
const ADMIN_PASSWORD_HASH = ""; 

const AdminPanel = ({ 
  gameState, 
  credits, setCredits, 
  unlockedCards, setUnlockedCards, 
  unlockedRelics, setUnlockedRelics,
  combatState, setCombatState, setGameState, 
  setToastMsg, saveGame,
  CARD_LIBRARY, RELIC_LIBRARY,
  deckCounts, setDeckCounts,
  playerRelics, setPlayerRelics,
  startBattle
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');

  // UI 상태 관리
  const [activeTab, setActiveTab] = useState('combat'); // combat, deck, system, inspect
  const [isMinimized, setIsMinimized] = useState(false);

  // 고도화 기능 상태 관리
  const [selectedCardId, setSelectedCardId] = useState('');
  const [selectedRelicId, setSelectedRelicId] = useState('');
  const [warpMode, setWarpMode] = useState('NORMAL'); // 신규: 워프 모드 (NORMAL / HARD)
  const [warpStageInput, setWarpStageInput] = useState(1);
  const [targetGameState, setTargetGameState] = useState('');

  // 버그 리포터 상태 관리
  const [bugReportState, setBugReportState] = useState({ isOpen: false, text: '' });

  // 창 드래그 상태 관리
  const [position, setPosition] = useState({ x: window.innerWidth - 420, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });

  // 단축키: Ctrl + Shift + A (표시/숨기기)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
        setIsVisible(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 창 드래그 로직
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      setPosition({
        x: e.clientX - dragStartPos.current.x,
        y: e.clientY - dragStartPos.current.y
      });
    };
    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleDragStart = (e) => {
    if (e.target.closest('button') || e.target.closest('input') || e.target.closest('select') || e.target.closest('textarea')) return;
    setIsDragging(true);
    dragStartPos.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  // 버그 리포트 생성기
  const handleContextMenu = (e) => {
    e.preventDefault(); 
    const currentStatus = `
[버그/테스트 리포트]
발생 시간: ${new Date().toLocaleString()}
현재 화면 (GameState): ${gameState || '알 수 없음'}
현재 크레딧: ${credits}

[전투 상태]
전투 중 여부: ${combatState ? `O (스테이지: ${combatState.stage}, 모드: ${combatState.mode})` : 'X'}
플레이어 체력: ${combatState ? `${combatState.player.hp} / ${combatState.player.maxHp}` : 'N/A'}
플레이어 마나: ${combatState ? `${combatState.player.mana} / ${combatState.player.maxMana}` : 'N/A'}
적 생존 수: ${combatState ? combatState.enemies.length : 0} 명

[보유 아이템]
덱 크기: ${Object.values(deckCounts).reduce((a, b) => a + b, 0)} 장
장착 유물 수: ${playerRelics ? playerRelics.length : 0} 개
`.trim();

    setBugReportState({ isOpen: true, text: currentStatus });
  };

  const handleCopyBugReport = () => {
    navigator.clipboard.writeText(bugReportState.text);
    setToastMsg("버그 리포트가 클립보드에 복사되었습니다!");
    setBugReportState(prev => ({ ...prev, isOpen: false }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const hash = await hashPassword(passwordInput);
    if (hash === ADMIN_PASSWORD_HASH || ADMIN_PASSWORD_HASH === "") {
      setIsAuthenticated(true);
      setPasswordInput('');
    } else {
      setToastMsg("접근 거부: 권한이 없습니다.");
      setPasswordInput('');
    }
  };

  // ---------------- [관리자 세부 기능 로직] ----------------
  const checkCombat = () => {
    if (!combatState) { setToastMsg("전투 중에만 사용 가능한 기능입니다."); return false; }
    return true;
  };

  // 1. 전투/스탯 조작 기능
  const handleMaxHealth = () => { if(checkCombat()) setCombatState(prev => ({ ...prev, player: { ...prev.player, hp: prev.player.maxHp } })); };
  const handleKillPlayer = () => { if(checkCombat()) setCombatState(prev => ({ ...prev, player: { ...prev.player, hp: 1 } })); };
  const handleInfiniteMana = () => { if(checkCombat()) setCombatState(prev => ({ ...prev, player: { ...prev.player, mana: 99, maxMana: 99 } })); setToastMsg("마나 99 세팅!"); };
  const handleForceWin = () => { if(checkCombat()) { setGameState('REWARDS'); setToastMsg("전투 강제 승리!"); } };
  const handleGodMode = () => { if(checkCombat()) setCombatState(prev => ({ ...prev, player: { ...prev.player, block: prev.player.block + 9999 } })); setToastMsg("방어도 9999 부여 (무적)"); };
  const handleKillAllEnemies = () => { if(checkCombat()) setCombatState(prev => ({ ...prev, enemies: [] })); setToastMsg("모든 적 즉사 처리"); };
  const handleEnemies1HP = () => { if(checkCombat()) setCombatState(prev => ({ ...prev, enemies: prev.enemies.map(e => ({ ...e, hp: 1, block: 0 })) })); setToastMsg("모든 적 체력 1로 변경"); };
  
  const handleAddBuffs = () => {
    if(checkCombat()) {
      setCombatState(prev => ({ ...prev, player: { ...prev.player, buffs: { ...prev.player.buffs, strength: (prev.player.buffs.strength||0)+50, dexterity: (prev.player.buffs.dexterity||0)+50 } } }));
      setToastMsg("힘/민첩 +50 폭증!");
    }
  };
  const handleClearDebuffs = () => {
    if(checkCombat()) {
      setCombatState(prev => ({ ...prev, player: { ...prev.player, debuffs: { weak:0, vulnerable:0, poison:0, frail:0, mark:0, silence:0, bind:0 } } }));
      setToastMsg("모든 디버프 해제!");
    }
  };
  
  const handleSpecialBuffs = () => {
    if(checkCombat()) {
      setCombatState(prev => ({ 
        ...prev, player: { ...prev.player, buffs: { ...prev.player.buffs, intangible: (prev.player.buffs.intangible||0)+1, regen: (prev.player.buffs.regen||0)+5, insight: (prev.player.buffs.insight||0)+2 } } 
      }));
      setToastMsg("무형+1, 재생+5, 통찰+2 부여!");
    }
  };

  const handleMaxManaChange = (amount) => {
    if(checkCombat()) {
      setCombatState(prev => ({ ...prev, player: { ...prev.player, maxMana: Math.max(1, prev.player.maxMana + amount), mana: Math.max(0, prev.player.mana + amount) } }));
      setToastMsg(`최대 마나 ${amount > 0 ? '+'+amount : amount}`);
    }
  };

  const handleDrawCards = (count) => {
    if(!checkCombat()) return;
    setCombatState(prev => {
      let drawPile = [...prev.drawPile];
      let hand = [...prev.hand];
      for(let i=0; i<count; i++) { if(drawPile.length > 0) hand.push(drawPile.pop()); }
      return { ...prev, drawPile, hand };
    });
    setToastMsg(`${count}장 강제 드로우!`);
  };
  const handleDiscardHand = () => {
    if(!checkCombat()) return;
    setCombatState(prev => ({ ...prev, discardPile: [...prev.discardPile, ...prev.hand], hand: [] }));
    setToastMsg("손패를 모두 버렸습니다.");
  };
  const handleEnemyDebuffBomb = () => {
    if(!checkCombat()) return;
    setCombatState(prev => ({
      ...prev, enemies: prev.enemies.map(e => ({ ...e, debuffs: { ...e.debuffs, vulnerable: (e.debuffs?.vulnerable||0)+99, weak: (e.debuffs?.weak||0)+99, poison: (e.debuffs?.poison||0)+99 } }))
    }));
    setToastMsg("모든 적에게 디버프 99 부여!");
  };
  const handleMaxHpChange = (amount) => {
    if(checkCombat()) {
      setCombatState(prev => ({ ...prev, player: { ...prev.player, maxHp: Math.max(1, prev.player.maxHp + amount), hp: Math.max(1, prev.player.hp + amount) } }));
      setToastMsg(`최대 체력 ${amount > 0 ? '+'+amount : amount}`);
    }
  };

  // 2. 아이템/덱 기능 (saveGame 버그 수정)
  const handleAddSpecificCard = () => {
    if (!selectedCardId) return;
    const cardDef = CARD_LIBRARY.find(c => c.id === selectedCardId);
    if (combatState) {
      setCombatState(prev => ({ ...prev, hand: [...prev.hand, { ...cardDef, uid: Math.random().toString() }], baseDeck: [...prev.baseDeck, cardDef] }));
      setToastMsg(`전투 중 [${cardDef.name}] 패에 추가!`);
    } else {
      const newCounts = { ...deckCounts, [selectedCardId]: (deckCounts[selectedCardId] || 0) + 1 };
      setDeckCounts(newCounts);
      setToastMsg(`[${cardDef.name}] 기본 덱에 추가!`); 
      saveGame({ deckCounts: newCounts }); // 수정: 변경된 상태를 즉시 저장
    }
  };
  
  const handleRemoveSpecificCard = () => {
    if (!selectedCardId) return;
    const newCounts = { ...deckCounts };
    if (newCounts[selectedCardId] > 0) {
      newCounts[selectedCardId]--;
      if (newCounts[selectedCardId] === 0) delete newCounts[selectedCardId];
      setDeckCounts(newCounts);
      setToastMsg(`덱에서 1장 제거`);
      saveGame({ deckCounts: newCounts }); // 수정: 변경된 상태 즉시 저장
    } else {
      setToastMsg("소지하지 않은 카드입니다.");
    }
  };

  const handleAddSpecificRelic = () => {
    if (!selectedRelicId) return;
    const relicDef = RELIC_LIBRARY.find(r => r.id === selectedRelicId);
    if(playerRelics?.find(r => r.id === selectedRelicId)) { setToastMsg("이미 보유한 유물입니다."); return; }
    setPlayerRelics(prev => [...(prev || []), relicDef]);
    setToastMsg(`[${relicDef.name}] 장착!`);
  };
  
  const handleRemoveSpecificRelic = () => {
    if (!selectedRelicId) return;
    setPlayerRelics(prev => {
      const filtered = (prev || []).filter(r => r.id !== selectedRelicId);
      if(filtered.length === (prev||[]).length) setToastMsg("소지하지 않은 유물입니다.");
      else setToastMsg(`유물 삭제 완료`);
      return filtered;
    });
  };
  
  const handleAddRandomRelic = () => {
    const unowned = RELIC_LIBRARY.filter(r => !playerRelics?.find(pr => pr.id === r.id));
    if(unowned.length > 0) {
      const randomRelic = unowned[Math.floor(Math.random() * unowned.length)];
      setPlayerRelics(prev => [...(prev || []), randomRelic]);
      setToastMsg(`[${randomRelic.name}] 무작위 획득!`); 
    } else setToastMsg("모든 유물을 이미 소지하고 있습니다.");
  };
  
  const handleDuplicateHand = () => {
    if(!checkCombat()) return;
    setCombatState(prev => ({ ...prev, hand: [...prev.hand, ...prev.hand.map(c => ({...c, uid: Math.random().toString()}))] }));
    setToastMsg("현재 손패 복제 완료!");
  };

  const handleClearRelics = () => { setPlayerRelics([]); setToastMsg("모든 장착 유물 삭제!"); };
  const handleClearDeck = () => { setDeckCounts({}); setToastMsg("덱 모두 비우기 완료!"); saveGame({ deckCounts: {} }); };

  // 3. 시스템/자원/이동 기능 (saveGame 버그 수정 및 하드모드 워프 추가)
  const handleAddGold = (amount) => { 
    const newAmount = Math.max(0, credits + amount);
    setCredits(newAmount); 
    setToastMsg(`${amount > 0 ? '+'+amount : amount} 크레딧!`); 
    saveGame({ credits: newAmount }); // 수정됨
  };
  
  const handleResetGold = () => { 
    setCredits(0); 
    setToastMsg("크레딧 0으로 초기화!"); 
    saveGame({ credits: 0 }); // 수정됨
  };
  
  const handleUnlockAll = () => { 
    const allCards = CARD_LIBRARY.map(c => c.id);
    const allRelics = RELIC_LIBRARY.map(r => r.id);
    setUnlockedCards(allCards); 
    setUnlockedRelics(allRelics); 
    setToastMsg("모든 도감 강제 해금 완료!"); 
    saveGame({ unlockedCards: allCards, unlockedRelics: allRelics }); // 수정됨
  };
  
  const handleWarp = () => {
    const stage = Number(warpStageInput);
    if (stage < 1) return;
    // 수정: 선택된 warpMode를 넘겨 하드 모드 워프 가능!
    startBattle(warpMode, stage);
    setToastMsg(`${warpMode} ${stage}층 강제 워프!`);
  };

  const handleForceGameState = () => {
    if(targetGameState) {
      setGameState(targetGameState);
      setToastMsg(`화면 강제 이동: ${targetGameState}`);
    }
  };

  if (!isVisible) return null;

  // 인스펙터용 전체 상태 모음
  const inspectData = {
    CurrentScreen: gameState,
    PlayerCredits: credits,
    UnlockedCardsCount: unlockedCards.length,
    UnlockedRelicsCount: unlockedRelics.length,
    BaseDeckCounts: deckCounts,
    PlayerRelics: playerRelics?.map(r => r.id),
    CombatState: combatState ? {
      Mode: combatState.mode,
      Stage: combatState.stage,
      Turn: combatState.turn,
      PlayerHP: `${combatState.player.hp} / ${combatState.player.maxHp}`,
      PlayerMana: `${combatState.player.mana} / ${combatState.player.maxMana}`,
      PlayerBlock: combatState.player.block,
      PlayerBuffs: combatState.player.buffs,
      PlayerDebuffs: combatState.player.debuffs,
      EnemiesInfo: combatState.enemies.map(e => ({ name: e.template.name, hp: e.hp, block: e.block, intent: e.intentCard?.name })),
      DeckSizes: { Draw: combatState.drawPile.length, Hand: combatState.hand.length, Discard: combatState.discardPile.length }
    } : "Not in combat"
  };

  return (
    <div 
      className="fixed z-[99999] bg-slate-900/95 backdrop-blur-md border border-fuchsia-600 rounded-lg shadow-2xl overflow-hidden flex flex-col text-white font-sans"
      style={{ left: position.x, top: position.y, width: '420px', maxHeight: '90vh', opacity: isDragging ? 0.8 : 1 }}
      onContextMenu={handleContextMenu}
    >
      {/* 헤더 */}
      <div className="bg-fuchsia-900/50 p-3 flex justify-between items-center cursor-move border-b border-fuchsia-700" onMouseDown={handleDragStart}>
        <div className="flex items-center gap-2 pointer-events-none">
          <span className="text-lg">⚙️</span>
          <h2 className="font-bold text-fuchsia-300 text-sm tracking-wide">디버그 패널 (God Mode)</h2>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsMinimized(!isMinimized)} className="text-slate-300 hover:text-white px-2 py-1 text-xs bg-slate-800 rounded">{isMinimized ? '열기' : '최소화'}</button>
          <button onClick={() => setIsVisible(false)} className="text-red-400 hover:text-red-300 font-bold px-2">✕</button>
        </div>
      </div>

      {!isMinimized && (
        <div className="relative p-4 overflow-y-auto custom-scrollbar" style={{ maxHeight: 'calc(90vh - 50px)' }}>
          {bugReportState.isOpen && (
            <div className="absolute inset-0 bg-slate-900/95 z-50 flex flex-col p-4 backdrop-blur-sm">
              <h3 className="text-amber-400 font-bold mb-2">📝 상태 스냅샷 (버그리포트)</h3>
              <textarea className="flex-1 bg-slate-800 border border-slate-600 rounded p-2 text-xs text-green-300 resize-none mb-3 font-mono" value={bugReportState.text} onChange={(e) => setBugReportState(prev => ({ ...prev, text: e.target.value }))} />
              <div className="flex gap-2">
                <button onClick={() => setBugReportState({ isOpen: false, text: '' })} className="flex-1 py-2 bg-slate-700 rounded text-sm hover:bg-slate-600">닫기</button>
                <button onClick={handleCopyBugReport} className="flex-1 py-2 bg-indigo-600 rounded text-sm font-bold hover:bg-indigo-500">복사하기</button>
              </div>
            </div>
          )}

          {!isAuthenticated ? (
            <form onSubmit={handleLogin} className="flex flex-col gap-3">
              <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} placeholder="보안 키를 입력하세요" className="p-2 bg-slate-800 border border-slate-600 rounded text-sm text-white" autoFocus />
              <button type="submit" className="bg-fuchsia-700 hover:bg-fuchsia-600 p-2 rounded text-sm font-bold">인증 접속</button>
            </form>
          ) : (
            <>
              {/* 탭 네비게이션 */}
              <div className="flex gap-1 mb-4 border-b border-slate-700 pb-2">
                <button onClick={() => setActiveTab('combat')} className={`flex-1 py-1.5 text-[11px] font-bold rounded ${activeTab === 'combat' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400'}`}>전투/스탯</button>
                <button onClick={() => setActiveTab('deck')} className={`flex-1 py-1.5 text-[11px] font-bold rounded ${activeTab === 'deck' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400'}`}>덱/아이템</button>
                <button onClick={() => setActiveTab('system')} className={`flex-1 py-1.5 text-[11px] font-bold rounded ${activeTab === 'system' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'}`}>시스템</button>
                <button onClick={() => setActiveTab('inspect')} className={`flex-1 py-1.5 text-[11px] font-bold rounded ${activeTab === 'inspect' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>조회</button>
              </div>

              {/* 탭 1: 전투 및 스탯 제어 */}
              {activeTab === 'combat' && (
                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={handleMaxHealth} className="bg-green-700 hover:bg-green-600 p-2 rounded text-[11px] font-bold">❤️ HP 풀회복</button>
                    <button onClick={handleGodMode} className="bg-blue-700 hover:bg-blue-600 p-2 rounded text-[11px] font-bold">🛡️ 방어도 9999</button>
                    <button onClick={handleInfiniteMana} className="bg-cyan-600 hover:bg-cyan-500 p-2 rounded text-[11px] font-bold">🔵 마나 99 고정</button>
                    <button onClick={handleKillPlayer} className="bg-red-900 hover:bg-red-800 p-2 rounded text-[11px] border border-red-500 text-red-200">🩸 내 체력 1로</button>
                  </div>
                  
                  <div className="flex gap-2">
                    <button onClick={() => handleMaxHpChange(10)} className="flex-1 bg-green-900 hover:bg-green-800 p-1.5 rounded text-[11px] border border-green-600">최대 체력 +10</button>
                    <button onClick={() => handleMaxHpChange(-10)} className="flex-1 bg-red-900 hover:bg-red-800 p-1.5 rounded text-[11px] border border-red-600">최대 체력 -10</button>
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => handleMaxManaChange(1)} className="flex-1 bg-cyan-900 hover:bg-cyan-800 p-1.5 rounded text-[11px] border border-cyan-600">최대 마나 +1</button>
                    <button onClick={() => handleMaxManaChange(-1)} className="flex-1 bg-slate-700 hover:bg-slate-600 p-1.5 rounded text-[11px] border border-slate-500">최대 마나 -1</button>
                  </div>

                  <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                    <p className="text-xs text-sky-300 font-bold mb-2">패/버프 조작</p>
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      <button onClick={() => handleDrawCards(1)} className="bg-slate-700 hover:bg-slate-600 p-1.5 rounded text-[11px]">1장 드로우</button>
                      <button onClick={() => handleDrawCards(3)} className="bg-slate-700 hover:bg-slate-600 p-1.5 rounded text-[11px]">3장 드로우</button>
                      <button onClick={handleDiscardHand} className="bg-slate-700 hover:bg-slate-600 p-1.5 rounded text-[11px] text-red-300">패 모두 버림</button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={handleAddBuffs} className="bg-slate-700 hover:bg-slate-600 p-2 rounded text-[11px] text-green-300">힘/민첩 +50 부여</button>
                      <button onClick={handleSpecialBuffs} className="bg-fuchsia-800 hover:bg-fuchsia-700 p-2 rounded text-[11px] text-fuchsia-200 border border-fuchsia-500 font-bold">✨ 특수 버프 (무형 등)</button>
                      <button onClick={handleClearDebuffs} className="col-span-2 bg-slate-700 hover:bg-slate-600 p-2 rounded text-[11px] text-blue-300 border border-blue-800">내 디버프 모두 해제</button>
                    </div>
                  </div>

                  <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                    <p className="text-xs text-red-300 font-bold mb-2">적/필드 조작</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={handleEnemies1HP} className="bg-slate-700 hover:bg-slate-600 p-2 rounded text-[11px]">적 전체 체력 1로</button>
                      <button onClick={handleKillAllEnemies} className="bg-red-800 hover:bg-red-700 p-2 rounded text-[11px] font-bold text-white">필드 적 즉사</button>
                      <button onClick={handleEnemyDebuffBomb} className="col-span-2 bg-purple-800 hover:bg-purple-700 p-2 rounded text-[11px] font-bold text-white border border-purple-500">☠️ 적 전체 디버프 폭탄 (99중첩)</button>
                      <button onClick={handleForceWin} className="col-span-2 bg-yellow-600 hover:bg-yellow-500 p-2 rounded text-xs font-bold text-black mt-1">🏆 즉시 전투 승리 (보상창)</button>
                    </div>
                  </div>
                </div>
              )}

              {/* 탭 2: 덱 및 아이템 제어 */}
              {activeTab === 'deck' && (
                <div className="flex flex-col gap-4">
                  <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700 flex flex-col gap-2">
                    <p className="text-xs text-amber-300 font-bold">카드 개별 제어</p>
                    <select value={selectedCardId} onChange={e => setSelectedCardId(e.target.value)} className="bg-slate-900 border border-slate-600 rounded p-1.5 text-xs text-white">
                      <option value="">카드를 선택하세요</option>
                      {[...CARD_LIBRARY].sort((a,b) => a.name.localeCompare(b.name)).map(c => (
                        <option key={c.id} value={c.id}>[{c.rarity}] {c.name}</option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      <button onClick={handleAddSpecificCard} className="flex-1 bg-amber-700 hover:bg-amber-600 py-1.5 rounded text-[11px] font-bold">덱/패에 추가</button>
                      <button onClick={handleRemoveSpecificCard} className="flex-1 bg-slate-700 hover:bg-slate-600 py-1.5 rounded text-[11px]">덱에서 제거</button>
                    </div>
                    <button onClick={handleDuplicateHand} className="w-full bg-cyan-800 hover:bg-cyan-700 py-1.5 mt-1 rounded text-[11px] font-bold border border-cyan-500">전투 중: 현재 손패 복제</button>
                  </div>

                  <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700 flex flex-col gap-2">
                    <p className="text-xs text-indigo-300 font-bold">유물 제어</p>
                    <button onClick={handleAddRandomRelic} className="w-full bg-indigo-900 hover:bg-indigo-800 py-1.5 rounded text-[11px] mb-1 border border-indigo-500">🎁 무작위 유물 1개 획득</button>
                    <select value={selectedRelicId} onChange={e => setSelectedRelicId(e.target.value)} className="bg-slate-900 border border-slate-600 rounded p-1.5 text-xs text-white">
                      <option value="">유물을 선택하세요</option>
                      {[...RELIC_LIBRARY].sort((a,b) => a.name.localeCompare(b.name)).map(r => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      <button onClick={handleAddSpecificRelic} className="flex-1 bg-indigo-700 hover:bg-indigo-600 py-1.5 rounded text-[11px] font-bold">강제 장착</button>
                      <button onClick={handleRemoveSpecificRelic} className="flex-1 bg-slate-700 hover:bg-slate-600 py-1.5 rounded text-[11px]">지정 해제</button>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button onClick={handleClearRelics} className="flex-1 bg-red-900 hover:bg-red-800 p-2 rounded text-[11px] border border-red-700 text-white">장착 유물 초기화</button>
                    <button onClick={handleClearDeck} className="flex-1 bg-red-900 hover:bg-red-800 p-2 rounded text-[11px] border border-red-700 text-white">소지 덱 비우기</button>
                  </div>
                </div>
              )}

              {/* 탭 3: 시스템 및 스테이지 제어 */}
              {activeTab === 'system' && (
                <div className="flex flex-col gap-4">
                  <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700 flex flex-col gap-2">
                    <p className="text-xs text-emerald-300 font-bold">🚀 스테이지 강제 워프 (난이도 지정 가능)</p>
                    <div className="flex gap-2 items-center">
                      <select value={warpMode} onChange={e => setWarpMode(e.target.value)} className="bg-slate-900 border border-slate-600 rounded p-1.5 text-xs text-white flex-1 font-bold">
                        <option value="NORMAL">NORMAL (일반)</option>
                        <option value="HARD">HARD (어려움)</option>
                      </select>
                      <input type="number" min="1" max="999" value={warpStageInput} onChange={e => setWarpStageInput(e.target.value)} className="w-16 bg-slate-900 border border-slate-600 rounded p-1.5 text-center text-sm font-bold text-white" />
                      <span className="text-sm text-slate-300">층</span>
                    </div>
                    <button onClick={handleWarp} className="w-full bg-emerald-700 hover:bg-emerald-600 py-2 rounded text-xs font-bold shadow-lg border border-emerald-400">워프 시작!</button>
                  </div>

                  <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                    <p className="text-xs text-yellow-300 font-bold mb-2">재화 및 도감 조작</p>
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      <button onClick={() => handleAddGold(1000)} className="bg-yellow-800 hover:bg-yellow-700 p-1.5 rounded text-[11px]">+1,000</button>
                      <button onClick={() => handleAddGold(-1000)} className="bg-slate-700 hover:bg-slate-600 p-1.5 rounded text-[11px]">-1,000</button>
                      <button onClick={handleResetGold} className="bg-slate-700 hover:bg-slate-600 p-1.5 rounded text-[11px]">0 (초기화)</button>
                    </div>
                    <button onClick={() => handleAddGold(999999)} className="w-full mb-2 bg-yellow-600 hover:bg-yellow-500 text-black p-2 rounded text-xs font-bold">💰 +999,999 크레딧</button>
                    <button onClick={handleUnlockAll} className="w-full bg-fuchsia-700 hover:bg-fuchsia-600 p-2 rounded text-xs font-bold shadow-lg">🔓 모든 도감 (카드/유물) 강제 해금</button>
                  </div>

                  <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700 flex flex-col gap-2">
                    <p className="text-xs text-sky-300 font-bold">화면(Game State) 강제 이동</p>
                    <div className="flex gap-2">
                      <select value={targetGameState} onChange={e => setTargetGameState(e.target.value)} className="flex-1 bg-slate-900 border border-slate-600 rounded p-1.5 text-xs text-white">
                        <option value="">화면 선택</option>
                        <option value="MENU">메인 메뉴</option>
                        <option value="SHOP">상점</option>
                        <option value="DECK_BUILDING">덱 빌딩</option>
                        <option value="REWARDS">전투 보상</option>
                        <option value="STATISTICS">통계 화면</option>
                        <option value="GAME_OVER">게임 오버</option>
                      </select>
                      <button onClick={handleForceGameState} className="bg-sky-700 hover:bg-sky-600 px-3 py-1.5 rounded text-xs font-bold">이동</button>
                    </div>
                  </div>
                </div>
              )}

              {/* 탭 4: 실시간 상태 조회 (Inspector) */}
              {activeTab === 'inspect' && (
                <div className="flex flex-col h-full gap-2">
                  <p className="text-xs text-indigo-300 font-bold px-1">상태 스코프 체커 (Real-time JSON)</p>
                  <div className="bg-slate-950 border border-slate-700 rounded-lg p-3 overflow-auto" style={{ maxHeight: '350px' }}>
                    <pre className="text-[10px] leading-relaxed font-mono text-green-400">
                      {JSON.stringify(inspectData, null, 2)}
                    </pre>
                  </div>
                  <button 
                    onClick={() => { navigator.clipboard.writeText(JSON.stringify(inspectData, null, 2)); setToastMsg('JSON 복사 완료'); }}
                    className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-xs text-slate-300"
                  >
                    JSON 클립보드에 복사
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;