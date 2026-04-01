import React, { useState, useEffect } from 'react';
import { hashPassword } from '../../utils/crypto';

// 나중에 혼자 계실 때 브라우저 콘솔(F12)에 아래 코드를 쳐서 나온 긴 영어+숫자 조합을 여기에 넣으세요.
const ADMIN_PASSWORD_HASH = ""; // <-- 여기에 복사한 해시값 붙여넣기

const AdminPanel = ({ 
  credits, setCredits, 
  unlockedCards, setUnlockedCards, 
  unlockedRelics, setUnlockedRelics,
  combatState, setCombatState, setGameState, 
  setToastMsg, saveGame,
  CARD_LIBRARY, RELIC_LIBRARY,
  // 새로 추가된 기능들을 위한 데이터
  deckCounts, setDeckCounts,
  playerRelics, setPlayerRelics,
  startBattle
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');

  // 고도화 기능 상태 관리
  const [selectedCardId, setSelectedCardId] = useState('');
  const [selectedRelicId, setSelectedRelicId] = useState('');
  const [warpStageInput, setWarpStageInput] = useState(1);

  // 단축키: Ctrl + Shift + A
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
        setIsVisible(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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

  const handleAddGold = () => { setCredits(prev => prev + 99999); setToastMsg("관리자: 99,999 크레딧 추가!"); saveGame(); };
  const handleMaxHealth = () => {
    if (combatState?.player) {
      setCombatState(prev => ({ ...prev, player: { ...prev.player, hp: prev.player.maxHp } }));
      setToastMsg("관리자: 체력이 모두 회복되었습니다!");
    } else setToastMsg("전투 중에만 체력을 회복할 수 있습니다.");
  };
  const handleUnlockAll = () => {
    setUnlockedCards(CARD_LIBRARY.map(c => c.id));
    setUnlockedRelics(RELIC_LIBRARY.map(r => r.id));
    setToastMsg("관리자: 모든 카드와 유물이 해금되었습니다!");
    saveGame();
  };
  const handleForceWin = () => {
    if (combatState?.enemies?.length > 0) {
      setGameState('REWARDS');
      setToastMsg("관리자: 현재 전투를 강제 승리 처리합니다!");
    } else setToastMsg("진행 중인 전투가 없습니다.");
  };

  // ---------------- [신규 기능 로직] ----------------
  const handleAddSpecificCard = () => {
    if (!selectedCardId) return;
    const cardDef = CARD_LIBRARY.find(c => c.id === selectedCardId);
    if (!cardDef) return;

    if (combatState) {
      // 전투 중: 현재 패와 덱에 즉시 추가
      setCombatState(prev => ({
        ...prev,
        hand: [...prev.hand, { ...cardDef, uid: Math.random().toString() }],
        baseDeck: [...prev.baseDeck, cardDef]
      }));
      setToastMsg(`관리자: 전투 중 [${cardDef.name}] 카드를 패에 꽂아 넣었습니다!`);
    } else {
      // 비전투 중: 시작 덱 카운트 증가
      setDeckCounts(prev => ({ ...prev, [selectedCardId]: (prev[selectedCardId] || 0) + 1 }));
      setToastMsg(`관리자: [${cardDef.name}] 카드를 기본 덱에 추가했습니다!`);
      saveGame();
    }
  };

  const handleAddSpecificRelic = () => {
    if (!selectedRelicId) return;
    const relicDef = RELIC_LIBRARY.find(r => r.id === selectedRelicId);
    if (!relicDef) return;
    setPlayerRelics(prev => [...(prev || []), relicDef]);
    setToastMsg(`관리자: [${relicDef.name}] 유물을 강제 장착했습니다!`);
    saveGame();
  };

  const handleWarp = () => {
    const stage = Number(warpStageInput);
    if (stage < 1) return;
    startBattle('NORMAL', stage);
    setToastMsg(`관리자: ${stage}층으로 강제 워프!`);
    setIsVisible(false); // 워프 후 창 닫기
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-black bg-opacity-80 flex items-center justify-center p-4">
      <div className="bg-slate-900 border-2 border-fuchsia-600 rounded-lg max-w-lg w-full text-white shadow-2xl relative max-h-[90vh] flex flex-col">
        
        {/* 헤더 부분 */}
        <div className="p-6 pb-4 border-b border-slate-700">
          <button onClick={() => setIsVisible(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white font-bold text-xl">✕</button>
          <h2 className="text-2xl font-black text-fuchsia-500">시스템 관리자 모드</h2>
        </div>

        {/* 컨텐츠 스크롤 영역 */}
        <div className="p-6 overflow-y-auto">
          {!isAuthenticated ? (
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="보안 키를 입력하세요"
                className="p-3 bg-slate-800 border border-slate-600 rounded text-white focus:outline-none focus:border-fuchsia-500"
                autoFocus
              />
              <button type="submit" className="bg-fuchsia-700 hover:bg-fuchsia-600 p-3 rounded-lg font-bold transition-colors shadow-lg">인증</button>
            </form>
          ) : (
            <div className="flex flex-col gap-6">
              
              {/* 1. 기본 기능 패널 */}
              <div className="grid grid-cols-2 gap-3">
                <button onClick={handleAddGold} className="bg-blue-600 hover:bg-blue-500 p-2 rounded shadow font-bold text-sm">💰 크레딧 MAX</button>
                <button onClick={handleMaxHealth} className="bg-green-600 hover:bg-green-500 p-2 rounded shadow font-bold text-sm">❤️ 전투중 풀피</button>
                <button onClick={handleUnlockAll} className="bg-amber-600 hover:bg-amber-500 p-2 rounded shadow font-bold text-sm">🔓 도감 올클리어</button>
                <button onClick={handleForceWin} className="bg-red-600 hover:bg-red-500 p-2 rounded shadow font-bold text-sm">💀 즉시 전투 승리</button>
              </div>

              {/* 2. 카드 주입기 */}
              <div className="bg-slate-800 p-3 rounded border border-slate-600">
                <h3 className="text-fuchsia-400 font-bold mb-2 text-sm">특정 카드 강제 획득 (전투/비전투 연동)</h3>
                <div className="flex gap-2">
                  <select value={selectedCardId} onChange={e => setSelectedCardId(e.target.value)} className="flex-1 bg-slate-900 border border-slate-600 rounded p-2 text-sm text-white">
                    <option value="">카드를 선택하세요</option>
                    {[...CARD_LIBRARY].sort((a,b) => a.name.localeCompare(b.name)).map(c => (
                      <option key={c.id} value={c.id}>[{c.type === 'attack' ? '공격' : c.type === 'skill' ? '스킬' : '특수'}] {c.name}</option>
                    ))}
                  </select>
                  <button onClick={handleAddSpecificCard} className="bg-fuchsia-600 hover:bg-fuchsia-500 px-4 py-2 rounded font-bold text-sm whitespace-nowrap">획득</button>
                </div>
              </div>

              {/* 3. 유물 주입기 */}
              <div className="bg-slate-800 p-3 rounded border border-slate-600">
                <h3 className="text-amber-400 font-bold mb-2 text-sm">특정 유물 강제 장착</h3>
                <div className="flex gap-2">
                  <select value={selectedRelicId} onChange={e => setSelectedRelicId(e.target.value)} className="flex-1 bg-slate-900 border border-slate-600 rounded p-2 text-sm text-white">
                    <option value="">유물을 선택하세요</option>
                    {[...RELIC_LIBRARY].sort((a,b) => a.name.localeCompare(b.name)).map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                  <button onClick={handleAddSpecificRelic} className="bg-amber-600 hover:bg-amber-500 px-4 py-2 rounded font-bold text-sm whitespace-nowrap">장착</button>
                </div>
              </div>

              {/* 4. 스테이지 워프 */}
              <div className="bg-slate-800 p-3 rounded border border-slate-600">
                <h3 className="text-emerald-400 font-bold mb-2 text-sm">원하는 스테이지(보스)로 즉시 워프</h3>
                <div className="flex gap-2">
                  <input type="number" min="1" max="999" value={warpStageInput} onChange={e => setWarpStageInput(e.target.value)} className="w-24 bg-slate-900 border border-slate-600 rounded p-2 text-center text-white" />
                  <span className="py-2 text-sm text-slate-300">층</span>
                  <button onClick={handleWarp} className="flex-1 bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded font-bold text-sm">해당 층 전투 시작</button>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;