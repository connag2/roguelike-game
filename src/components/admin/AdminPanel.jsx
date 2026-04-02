import React, { useState, useEffect, useRef } from 'react';
import { hashPassword } from '../utils/crypto';

// 복사한 해시값 유지
const ADMIN_PASSWORD_HASH = ""; 

const AdminPanel = ({ 
  gameState, // App.jsx에서 새로 넘겨받는 prop
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
  const [activeTab, setActiveTab] = useState('combat'); // combat, deck, system
  const [isMinimized, setIsMinimized] = useState(false);

  // 고도화 기능 상태 관리
  const [selectedCardId, setSelectedCardId] = useState('');
  const [selectedRelicId, setSelectedRelicId] = useState('');
  const [warpStageInput, setWarpStageInput] = useState(1);

  // 버그 리포터 상태 관리
  const [bugReportState, setBugReportState] = useState({ isOpen: false, text: '' });

  // 창 드래그 상태 관리
  const [position, setPosition] = useState({ x: window.innerWidth - 380, y: 50 });
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

  // 버그 리포트 생성기 (우클릭)
  const handleContextMenu = (e) => {
    e.preventDefault(); // 기본 브라우저 우클릭 메뉴 방지
    
    // 현재 상태 수집
    const currentStatus = `
[버그/테스트 리포트]
발생 시간: ${new Date().toLocaleString()}
현재 화면 (GameState): ${gameState || '알 수 없음'}
현재 크레딧: ${credits}

[전투 상태]
전투 중 여부: ${combatState ? `O (스테이지: ${combatState.stage}, 모드: ${combatState.mode})` : 'X'}
플레이어 체력: ${combatState ? `${combatState.player.hp} / ${combatState.player.maxHp}` : 'N/A'}
플레이어 마나: ${combatState ? `${combatState.player.mana}` : 'N/A'}
적 생존 수: ${combatState ? combatState.enemies.length : 0} 명

[보유 아이템]
덱 크기: ${Object.values(deckCounts).reduce((a, b) => a + b, 0)} 장
장착 유물 수: ${playerRelics ? playerRelics.length : 0} 개

[상세 버그 내용 및 재현 방법]
여기에 내용을 입력하세요...
`.trim();

    setBugReportState({ isOpen: true, text: currentStatus });
  };

  const handleCopyBugReport = () => {
    navigator.clipboard.writeText(bugReportState.text);
    setToastMsg("버그 리포트가 클립보드에 복사되었습니다!");
    setBugReportState(prev => ({ ...prev, isOpen: false }));
  };

  // 로그인 인증
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

  // 시스템/자원 기능
  const handleAddGold = () => { setCredits(prev => prev + 99999); setToastMsg("99,999 크레딧 추가!"); saveGame(); };
  const handleResetGold = () => { setCredits(0); setToastMsg("크레딧 초기화!"); saveGame(); };
  const handleUnlockAll = () => { setUnlockedCards(CARD_LIBRARY.map(c => c.id)); setUnlockedRelics(RELIC_LIBRARY.map(r => r.id)); setToastMsg("모든 도감 해금!"); saveGame(); };
  
  // 스탯/전투 조작 기능
  const handleMaxHealth = () => { if(checkCombat()) setCombatState(prev => ({ ...prev, player: { ...prev.player, hp: prev.player.maxHp } })); };
  const handleKillPlayer = () => { if(checkCombat()) setCombatState(prev => ({ ...prev, player: { ...prev.player, hp: 1 } })); };
  const handleInfiniteMana = () => { if(checkCombat()) setCombatState(prev => ({ ...prev, player: { ...prev.player, mana: 999 } })); };
  const handleForceWin = () => { if(checkCombat()) { setGameState('REWARDS'); setToastMsg("전투 강제 승리!"); } };
  const handleEnemies1HP = () => { 
    if(checkCombat()) {
      setCombatState(prev => ({ ...prev, enemies: prev.enemies.map(e => ({ ...e, hp: 1, block: 0 })) }));
      setToastMsg("모든 적의 체력이 1이 되었습니다.");
    }
  };
  
  // 버프/디버프 제어
  const handleAddBuffs = () => {
    if(checkCombat()) {
      setCombatState(prev => ({ ...prev, player: { ...prev.player, buffs: { ...prev.player.buffs, strength: (prev.player.buffs.strength||0)+10, dexterity: (prev.player.buffs.dexterity||0)+10 } } }));
      setToastMsg("힘/민첩 +10 증가!");
    }
  };
  const handleClearDebuffs = () => {
    if(checkCombat()) {
      setCombatState(prev => ({ ...prev, player: { ...prev.player, debuffs: { weak:0, vulnerable:0, poison:0, frail:0, mark:0 } } }));
      setToastMsg("모든 디버프 해제!");
    }
  };

  // 아이템 주입 기능
  const handleAddSpecificCard = () => {
    if (!selectedCardId) return;
    const cardDef = CARD_LIBRARY.find(c => c.id === selectedCardId);
    if (combatState) {
      setCombatState(prev => ({ ...prev, hand: [...prev.hand, { ...cardDef, uid: Math.random().toString() }], baseDeck: [...prev.baseDeck, cardDef] }));
      setToastMsg(`전투 중 [${cardDef.name}] 패에 추가!`);
    } else {
      setDeckCounts(prev => ({ ...prev, [selectedCardId]: (prev[selectedCardId] || 0) + 1 }));
      setToastMsg(`[${cardDef.name}] 기본 덱에 추가!`); saveGame();
    }
  };

  const handleAddSpecificRelic = () => {
    if (!selectedRelicId) return;
    const relicDef = RELIC_LIBRARY.find(r => r.id === selectedRelicId);
    setPlayerRelics(prev => [...(prev || []), relicDef]);
    setToastMsg(`[${relicDef.name}] 강제 장착!`); saveGame();
  };
  
  const handleClearRelics = () => { setPlayerRelics([]); setToastMsg("모든 장착 유물 초기화!"); saveGame(); };

  const handleWarp = () => {
    const stage = Number(warpStageInput);
    if (stage < 1) return;
    startBattle('NORMAL', stage);
    setToastMsg(`${stage}층 강제 워프!`);
  };

  if (!isVisible) return null;

  return (
    <div 
      className="fixed z-[99999] bg-slate-900/95 backdrop-blur-md border border-fuchsia-600 rounded-lg shadow-2xl overflow-hidden flex flex-col text-white"
      style={{ left: position.x, top: position.y, width: '360px', maxHeight: '85vh', opacity: isDragging ? 0.8 : 1 }}
      onContextMenu={handleContextMenu}
    >
      {/* 헤더 (드래그 영역) */}
      <div 
        className="bg-fuchsia-900/40 p-3 flex justify-between items-center cursor-move border-b border-fuchsia-700"
        onMouseDown={handleDragStart}
      >
        <div className="flex items-center gap-2 pointer-events-none">
          <span className="text-lg">🛠️</span>
          <h2 className="font-bold text-fuchsia-400 text-sm">시스템 컨트롤 (우클릭: 버그리포트)</h2>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsMinimized(!isMinimized)} className="text-slate-300 hover:text-white px-2 py-1 text-xs bg-slate-800 rounded">
            {isMinimized ? '열기' : '최소화'}
          </button>
          <button onClick={() => setIsVisible(false)} className="text-red-400 hover:text-red-300 font-bold px-2">✕</button>
        </div>
      </div>

      {/* 내부 컨텐츠 (최소화 시 숨김) */}
      {!isMinimized && (
        <div className="relative p-4 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 50px)' }}>
          
          {/* 버그 리포트 오버레이 */}
          {bugReportState.isOpen && (
            <div className="absolute inset-0 bg-slate-900 z-50 flex flex-col p-4">
              <h3 className="text-amber-400 font-bold mb-2">📝 버그 리포트 생성기</h3>
              <p className="text-xs text-slate-400 mb-2">현재 상태가 자동으로 기록되었습니다. 상세 내용을 덧붙인 후 복사하세요.</p>
              <textarea 
                className="flex-1 bg-slate-800 border border-slate-600 rounded p-2 text-xs text-white resize-none mb-3"
                value={bugReportState.text}
                onChange={(e) => setBugReportState(prev => ({ ...prev, text: e.target.value }))}
              />
              <div className="flex gap-2">
                <button onClick={() => setBugReportState({ isOpen: false, text: '' })} className="flex-1 py-2 bg-slate-700 rounded text-sm">취소</button>
                <button onClick={handleCopyBugReport} className="flex-1 py-2 bg-indigo-600 rounded text-sm font-bold">복사하기</button>
              </div>
            </div>
          )}

          {!isAuthenticated ? (
            <form onSubmit={handleLogin} className="flex flex-col gap-3">
              <p className="text-xs text-slate-400">명령을 실행하려면 보안 키가 필요합니다.</p>
              <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} placeholder="비밀번호" className="p-2 bg-slate-800 border border-slate-600 rounded text-sm text-white" autoFocus />
              <button type="submit" className="bg-fuchsia-700 hover:bg-fuchsia-600 p-2 rounded text-sm font-bold">인증</button>
            </form>
          ) : (
            <>
              {/* 탭 네비게이션 */}
              <div className="flex gap-1 mb-4 border-b border-slate-700 pb-2">
                <button onClick={() => setActiveTab('combat')} className={`flex-1 py-1 text-xs font-bold rounded ${activeTab === 'combat' ? 'bg-fuchsia-600' : 'bg-slate-800 hover:bg-slate-700'}`}>전투/스탯</button>
                <button onClick={() => setActiveTab('deck')} className={`flex-1 py-1 text-xs font-bold rounded ${activeTab === 'deck' ? 'bg-amber-600' : 'bg-slate-800 hover:bg-slate-700'}`}>아이템/덱</button>
                <button onClick={() => setActiveTab('system')} className={`flex-1 py-1 text-xs font-bold rounded ${activeTab === 'system' ? 'bg-emerald-600' : 'bg-slate-800 hover:bg-slate-700'}`}>시스템</button>
              </div>

              {/* 탭 1: 전투 및 스탯 제어 */}
              {activeTab === 'combat' && (
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={handleMaxHealth} className="bg-green-700 hover:bg-green-600 p-2 rounded text-xs font-bold">❤️ 풀피 회복</button>
                    <button onClick={handleKillPlayer} className="bg-red-900 hover:bg-red-800 p-2 rounded text-xs font-bold border border-red-500">🩸 내 체력 1로</button>
                    <button onClick={handleInfiniteMana} className="bg-blue-600 hover:bg-blue-500 p-2 rounded text-xs font-bold">🔵 마나 999 세팅</button>
                    <button onClick={handleForceWin} className="bg-yellow-600 hover:bg-yellow-500 p-2 rounded text-xs font-bold text-black">💀 즉시 승리</button>
                  </div>
                  
                  <div className="bg-slate-800 p-2 rounded border border-slate-700">
                    <p className="text-xs text-slate-400 mb-2">심화 전투 조작</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={handleEnemies1HP} className="bg-slate-700 hover:bg-slate-600 p-2 rounded text-xs">적 전체 체력 1</button>
                      <button onClick={handleAddBuffs} className="bg-slate-700 hover:bg-slate-600 p-2 rounded text-xs text-green-300">힘/민첩 +10 부여</button>
                      <button onClick={handleClearDebuffs} className="bg-slate-700 hover:bg-slate-600 p-2 rounded text-xs text-blue-300">내 디버프 모두 해제</button>
                    </div>
                  </div>
                </div>
              )}

              {/* 탭 2: 덱 및 아이템 제어 */}
              {activeTab === 'deck' && (
                <div className="flex flex-col gap-4">
                  <div className="bg-slate-800 p-2 rounded border border-slate-700 flex flex-col gap-2">
                    <p className="text-xs text-slate-400">특정 카드 강제 획득</p>
                    <select value={selectedCardId} onChange={e => setSelectedCardId(e.target.value)} className="bg-slate-900 border border-slate-600 rounded p-1 text-xs text-white">
                      <option value="">카드를 선택하세요</option>
                      {[...CARD_LIBRARY].sort((a,b) => a.name.localeCompare(b.name)).map(c => (
                        <option key={c.id} value={c.id}>[{c.rarity}] {c.name}</option>
                      ))}
                    </select>
                    <button onClick={handleAddSpecificCard} className="bg-amber-700 hover:bg-amber-600 py-1 rounded text-xs font-bold">획득 (전투중엔 패로)</button>
                  </div>

                  <div className="bg-slate-800 p-2 rounded border border-slate-700 flex flex-col gap-2">
                    <p className="text-xs text-slate-400">유물 강제 조작</p>
                    <select value={selectedRelicId} onChange={e => setSelectedRelicId(e.target.value)} className="bg-slate-900 border border-slate-600 rounded p-1 text-xs text-white">
                      <option value="">유물을 선택하세요</option>
                      {[...RELIC_LIBRARY].sort((a,b) => a.name.localeCompare(b.name)).map(r => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      <button onClick={handleAddSpecificRelic} className="flex-1 bg-indigo-700 hover:bg-indigo-600 py-1 rounded text-xs font-bold">장착</button>
                      <button onClick={handleClearRelics} className="flex-1 bg-red-800 hover:bg-red-700 py-1 rounded text-xs font-bold border border-red-500">모든 유물 삭제</button>
                    </div>
                  </div>
                </div>
              )}

              {/* 탭 3: 시스템 및 스테이지 제어 */}
              {activeTab === 'system' && (
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={handleAddGold} className="bg-yellow-500 hover:bg-yellow-400 text-black p-2 rounded text-xs font-bold">💰 +99,999 크레딧</button>
                    <button onClick={handleResetGold} className="bg-slate-700 hover:bg-slate-600 p-2 rounded text-xs text-slate-300">크레딧 0으로 만들기</button>
                    <button onClick={handleUnlockAll} className="col-span-2 bg-fuchsia-700 hover:bg-fuchsia-600 p-2 rounded text-xs font-bold">🔓 모든 도감 강제 해금</button>
                  </div>

                  <div className="bg-slate-800 p-2 rounded border border-slate-700 flex flex-col gap-2">
                    <p className="text-xs text-emerald-400 font-bold">원하는 스테이지 즉시 워프</p>
                    <div className="flex gap-2 items-center">
                      <input type="number" min="1" max="999" value={warpStageInput} onChange={e => setWarpStageInput(e.target.value)} className="w-16 bg-slate-900 border border-slate-600 rounded p-1 text-center text-xs text-white" />
                      <span className="text-xs text-slate-300">층</span>
                      <button onClick={handleWarp} className="flex-1 bg-emerald-700 hover:bg-emerald-600 py-1 rounded text-xs font-bold">워프 시작</button>
                    </div>
                  </div>
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