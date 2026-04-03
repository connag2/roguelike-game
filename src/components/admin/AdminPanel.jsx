// src/components/admin/AdminPanel.jsx
import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

const ADMIN_PASSWORD_HASH = ""; 

const AdminPanel = ({ 
  gameState, 
  credits, setCredits, 
  unlockedCards, setUnlockedCards, 
  unlockedRelics, setUnlockedRelics,
  isAdminUnlocked,
  adminCodeInput,
  setAdminCodeInput,
  setIsAdminUnlocked,
  handleWarp,
  setGameState,
  maxStageReached,
  setMaxStageReached,
  shopUpgrades,
  setShopUpgrades,
  saveGame,
  setToastMsg,
  combatState,
  setCombatState,
  startBattle,
  deckCounts,
  setDeckCounts,
  playerRelics,
  setPlayerRelics
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('combat');
  const [isMinimized, setIsMinimized] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});
  
  const [selectedCardId, setSelectedCardId] = useState('');
  const [selectedRelicId, setSelectedRelicId] = useState('');
  const [warpMode, setWarpMode] = useState('NORMAL');
  const [warpStageInput, setWarpStageInput] = useState(1);
  const [targetGameState, setTargetGameState] = useState('');
  
  const [position, setPosition] = useState({ x: window.innerWidth - 420, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });

  // ✨ [추가] 보스 전리품 카드 Import (require 에러 해결)
  let BOSS_LOOT_CARDS = [];
  let CARD_LIBRARY = [];
  let RELIC_LIBRARY = [];
  
  try {
    const gameDataModule = require('../../constants/gameData');
    BOSS_LOOT_CARDS = gameDataModule.BOSS_LOOT_CARDS || [];
    CARD_LIBRARY = gameDataModule.CARD_LIBRARY || [];
  } catch(e) {
    console.warn("gameData 동적 로드 실패:", e);
  }

  try {
    const relicDataModule = require('../../constants/relicData');
    RELIC_LIBRARY = relicDataModule.RELIC_LIBRARY || [];
  } catch(e) {
    console.warn("relicData 동적 로드 실패:", e);
  }

  // Ctrl+Shift+A 단축키
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
        setIsVisible(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 드래그 로직
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
    if (e.target.closest('button') || e.target.closest('input') || e.target.closest('select')) return;
    setIsDragging(true);
    dragStartPos.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  // ✨ [추가] 섹션 접기/펴기 토글
  const toggleSection = (sectionName) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  const checkCombat = () => {
    if (!combatState) { 
      setToastMsg("전투 중에만 사용 가능한 기능입니다."); 
      return false; 
    }
    return true;
  };

  // ✨ [추가] 모든 카드 해금 (보스 전리품 포함)
  const handleUnlockAllCards = () => {
    const allCardIds = [
      ...CARD_LIBRARY.map(c => c.id),
      ...BOSS_LOOT_CARDS.map(c => c.id)
    ];
    const uniqueCardIds = [...new Set(allCardIds)];
    setUnlockedCards(uniqueCardIds);
    saveGame({ unlockedCards: uniqueCardIds });
    setToastMsg(`✨ ${uniqueCardIds.length}개 모든 카드 해금!`);
  };

  // ✨ [추가] 모든 유물 해금
  const handleUnlockAllRelics = () => {
    const allRelicIds = RELIC_LIBRARY.map(r => r.id);
    setUnlockedRelics(allRelicIds);
    saveGame({ unlockedRelics: allRelicIds });
    setToastMsg(`✨ ${allRelicIds.length}개 모든 유물 해금!`);
  };

  // ✨ [추가] 모든 도감 해금
  const handleUnlockAll = () => {
    handleUnlockAllCards();
    handleUnlockAllRelics();
  };

  // 전투 조작
  const handleMaxHealth = () => { 
    if(checkCombat()) { 
      setCombatState(prev => ({ ...prev, player: { ...prev.player, hp: prev.player.maxHp } })); 
      setToastMsg("체력 풀회복!");
    } 
  };
  const handleGodMode = () => { 
    if(checkCombat()) { 
      setCombatState(prev => ({ ...prev, player: { ...prev.player, block: 9999 } })); 
      setToastMsg("방어도 9999!");
    } 
  };
  const handleInfiniteMana = () => { 
    if(checkCombat()) { 
      setCombatState(prev => ({ ...prev, player: { ...prev.player, mana: 99, maxMana: 99 } })); 
      setToastMsg("마나 99!");
    } 
  };
  const handleKillAllEnemies = () => { 
    if(checkCombat()) { 
      setCombatState(prev => ({ ...prev, enemies: [] })); 
      setToastMsg("모든 적 제거!");
    } 
  };
  const handleForceWin = () => { 
    if(checkCombat()) { 
      setGameState('REWARDS'); 
      setToastMsg("전투 즉시 승리!");
    } 
  };

  const handleAddBuffs = () => {
    if(checkCombat()) {
      setCombatState(prev => ({ 
        ...prev, 
        player: { 
          ...prev.player, 
          buffs: { 
            ...prev.player.buffs, 
            strength: (prev.player.buffs.strength||0)+50, 
            dexterity: (prev.player.buffs.dexterity||0)+50 
          } 
        } 
      }));
      setToastMsg("힘/민첩 +50!");
    }
  };

  const handleClearDebuffs = () => {
    if(checkCombat()) {
      setCombatState(prev => ({ 
        ...prev, 
        player: { 
          ...prev.player, 
          debuffs: { weak:0, vulnerable:0, poison:0, frail:0, mark:0, silence:0, bind:0 } 
        } 
      }));
      setToastMsg("모든 디버프 제거!");
    }
  };

  // 카드 추가
  const handleAddCard = () => {
    if (!selectedCardId) return;
    const allCards = [...CARD_LIBRARY, ...BOSS_LOOT_CARDS];
    const cardDef = allCards.find(c => c.id === selectedCardId);
    if (!cardDef) return;

    if (combatState) {
      setCombatState(prev => ({ 
        ...prev, 
        hand: [...prev.hand, { ...cardDef, uid: Math.random().toString() }], 
        baseDeck: [...prev.baseDeck, cardDef] 
      }));
      setToastMsg(`[${cardDef.name}] 추가!`);
    } else {
      const newCounts = { ...deckCounts, [selectedCardId]: (deckCounts[selectedCardId] || 0) + 1 };
      setDeckCounts(newCounts);
      setToastMsg(`[${cardDef.name}] 추가!`);
      saveGame({ deckCounts: newCounts });
    }
  };

  // 시스템 관리
  const handleAddGold = (amount) => { 
    const newAmount = Math.max(0, credits + amount);
    setCredits(newAmount); 
    setToastMsg(`크레딧 ${amount > 0 ? '+'+amount : amount}!`); 
    saveGame({ credits: newAmount });
  };

  const handleWarpToStage = () => {
    const stage = Number(warpStageInput);
    if (stage < 1) return;
    startBattle(warpMode, stage);
    setToastMsg(`${warpMode} ${stage}층 워프!`);
  };

  if (!isVisible) return null;

  const allCards = [...CARD_LIBRARY, ...BOSS_LOOT_CARDS].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div 
      className="fixed z-[99999] bg-slate-900/95 backdrop-blur-md border-2 border-fuchsia-600 rounded-lg shadow-2xl overflow-hidden flex flex-col text-white font-sans"
      style={{ left: position.x, top: position.y, width: '480px', maxHeight: '90vh', opacity: isDragging ? 0.8 : 1 }}
    >
      {/* 헤더 */}
      <div className="bg-fuchsia-900/50 p-3 flex justify-between items-center cursor-move border-b border-fuchsia-700" onMouseDown={handleDragStart}>
        <div className="flex items-center gap-2 pointer-events-none">
          <span className="text-lg">⚙️</span>
          <h2 className="font-bold text-fuchsia-300 text-sm">관리자 패널 (God Mode)</h2>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsMinimized(!isMinimized)} className="text-slate-300 hover:text-white px-2 py-1 text-xs bg-slate-800 rounded">
            {isMinimized ? '▼' : '▲'}
          </button>
          <button onClick={() => setIsVisible(false)} className="text-red-400 hover:text-red-300 font-bold px-2">✕</button>
        </div>
      </div>

      {!isMinimized && (
        <div className="p-4 overflow-y-auto custom-scrollbar" style={{ maxHeight: 'calc(90vh - 50px)' }}>
          {/* 탭 네비게이션 */}
          <div className="flex gap-1 mb-4 border-b border-slate-700 pb-2">
            <button onClick={() => setActiveTab('combat')} className={`flex-1 py-1.5 text-[11px] font-bold rounded ${activeTab === 'combat' ? 'bg-red-600' : 'bg-slate-800'}`}>
              ⚔️ 전투
            </button>
            <button onClick={() => setActiveTab('items')} className={`flex-1 py-1.5 text-[11px] font-bold rounded ${activeTab === 'items' ? 'bg-amber-600' : 'bg-slate-800'}`}>
              🎁 아이템
            </button>
            <button onClick={() => setActiveTab('system')} className={`flex-1 py-1.5 text-[11px] font-bold rounded ${activeTab === 'system' ? 'bg-emerald-600' : 'bg-slate-800'}`}>
              🔧 시스템
            </button>
          </div>

          {/* 탭 1: 전투 */}
          {activeTab === 'combat' && (
            <div className="flex flex-col gap-3">
              {/* 체력/방어 */}
              <div className="bg-slate-800/80 p-3 rounded border border-slate-700">
                <button 
                  onClick={() => toggleSection('health')} 
                  className="w-full flex items-center justify-between text-xs font-bold text-green-300 mb-2"
                >
                  ❤️ 체력/방어
                  <ChevronDown className={`w-3 h-3 transition-transform ${expandedSections['health'] ? 'rotate-180' : ''}`} />
                </button>
                {expandedSections['health'] && (
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={handleMaxHealth} className="bg-green-700 hover:bg-green-600 p-2 rounded text-[10px] font-bold">✅ 체력 MAX</button>
                    <button onClick={handleGodMode} className="bg-blue-700 hover:bg-blue-600 p-2 rounded text-[10px] font-bold">🛡️ 방어도 9999</button>
                  </div>
                )}
              </div>

              {/* 마나/버프 */}
              <div className="bg-slate-800/80 p-3 rounded border border-slate-700">
                <button 
                  onClick={() => toggleSection('buffs')} 
                  className="w-full flex items-center justify-between text-xs font-bold text-cyan-300 mb-2"
                >
                  ✨ 마나/버프
                  <ChevronDown className={`w-3 h-3 transition-transform ${expandedSections['buffs'] ? 'rotate-180' : ''}`} />
                </button>
                {expandedSections['buffs'] && (
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={handleInfiniteMana} className="bg-cyan-700 hover:bg-cyan-600 p-2 rounded text-[10px] font-bold">🔵 마나 99</button>
                    <button onClick={handleAddBuffs} className="bg-purple-700 hover:bg-purple-600 p-2 rounded text-[10px] font-bold">💪 힘+50</button>
                    <button onClick={handleClearDebuffs} className="col-span-2 bg-blue-800 hover:bg-blue-700 p-2 rounded text-[10px] font-bold">❌ 디버프 제거</button>
                  </div>
                )}
              </div>

              {/* 적 조작 */}
              <div className="bg-slate-800/80 p-3 rounded border border-slate-700">
                <button 
                  onClick={() => toggleSection('enemies')} 
                  className="w-full flex items-center justify-between text-xs font-bold text-red-300 mb-2"
                >
                  ☠️ 적 조작
                  <ChevronDown className={`w-3 h-3 transition-transform ${expandedSections['enemies'] ? 'rotate-180' : ''}`} />
                </button>
                {expandedSections['enemies'] && (
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={handleKillAllEnemies} className="bg-red-800 hover:bg-red-700 p-2 rounded text-[10px] font-bold">💀 즉사</button>
                    <button onClick={handleForceWin} className="bg-yellow-600 hover:bg-yellow-500 p-2 rounded text-[10px] font-bold text-black">🏆 승리</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 탭 2: 아이템 */}
          {activeTab === 'items' && (
            <div className="flex flex-col gap-3">
              {/* 카드 추가 */}
              <div className="bg-slate-800/80 p-3 rounded border border-slate-700">
                <p className="text-xs font-bold text-amber-300 mb-2">📜 카드 추가</p>
                <select 
                  value={selectedCardId} 
                  onChange={e => setSelectedCardId(e.target.value)} 
                  className="w-full bg-slate-900 border border-slate-600 rounded p-1.5 text-xs text-white mb-2"
                >
                  <option value="">카드 선택</option>
                  {allCards.map(c => (
                    <option key={c.id} value={c.id}>[{c.rarity}] {c.name}</option>
                  ))}
                </select>
                <button onClick={handleAddCard} className="w-full bg-amber-700 hover:bg-amber-600 p-2 rounded text-xs font-bold">➕ 추가</button>
              </div>

              {/* 도감 해금 */}
              <div className="bg-slate-800/80 p-3 rounded border border-slate-700">
                <button 
                  onClick={() => toggleSection('unlock')} 
                  className="w-full flex items-center justify-between text-xs font-bold text-fuchsia-300 mb-2"
                >
                  🔓 도감 해금
                  <ChevronDown className={`w-3 h-3 transition-transform ${expandedSections['unlock'] ? 'rotate-180' : ''}`} />
                </button>
                {expandedSections['unlock'] && (
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={handleUnlockAllCards} className="bg-fuchsia-700 hover:bg-fuchsia-600 p-2 rounded text-[10px] font-bold">🎴 카드 전부</button>
                    <button onClick={handleUnlockAllRelics} className="bg-indigo-700 hover:bg-indigo-600 p-2 rounded text-[10px] font-bold">💎 유물 전부</button>
                    <button onClick={handleUnlockAll} className="col-span-2 bg-fuchsia-900 hover:bg-fuchsia-800 p-2 rounded text-[10px] font-bold border border-fuchsia-500">🌟 모두 해금</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 탭 3: 시스템 */}
          {activeTab === 'system' && (
            <div className="flex flex-col gap-3">
              {/* 크레딧 */}
              <div className="bg-slate-800/80 p-3 rounded border border-slate-700">
                <button 
                  onClick={() => toggleSection('gold')} 
                  className="w-full flex items-center justify-between text-xs font-bold text-yellow-300 mb-2"
                >
                  💰 크레딧
                  <ChevronDown className={`w-3 h-3 transition-transform ${expandedSections['gold'] ? 'rotate-180' : ''}`} />
                </button>
                {expandedSections['gold'] && (
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => handleAddGold(1000)} className="bg-yellow-800 hover:bg-yellow-700 p-2 rounded text-[10px]">+1,000</button>
                    <button onClick={() => handleAddGold(999999)} className="bg-yellow-600 hover:bg-yellow-500 p-2 rounded text-[10px] font-bold text-black">+999,999</button>
                  </div>
                )}
              </div>

              {/* 스테이지 워프 */}
              <div className="bg-slate-800/80 p-3 rounded border border-slate-700">
                <button 
                  onClick={() => toggleSection('warp')} 
                  className="w-full flex items-center justify-between text-xs font-bold text-emerald-300 mb-2"
                >
                  🚀 워프
                  <ChevronDown className={`w-3 h-3 transition-transform ${expandedSections['warp'] ? 'rotate-180' : ''}`} />
                </button>
                {expandedSections['warp'] && (
                  <div>
                    <div className="flex gap-2 mb-2">
                      <select 
                        value={warpMode} 
                        onChange={e => setWarpMode(e.target.value)} 
                        className="flex-1 bg-slate-900 border border-slate-600 rounded p-1.5 text-xs text-white"
                      >
                        <option value="NORMAL">NORMAL</option>
                        <option value="HARD">HARD</option>
                      </select>
                      <input 
                        type="number" 
                        min="1" 
                        max="300" 
                        value={warpStageInput} 
                        onChange={e => setWarpStageInput(e.target.value)} 
                        className="w-16 bg-slate-900 border border-slate-600 rounded p-1.5 text-xs"
                      />
                    </div>
                    <button onClick={handleWarpToStage} className="w-full bg-emerald-700 hover:bg-emerald-600 p-2 rounded text-xs font-bold">워프!</button>
                  </div>
                )}
              </div>

              {/* 화면 이동 */}
              <div className="bg-slate-800/80 p-3 rounded border border-slate-700">
                <button 
                  onClick={() => toggleSection('gamestate')} 
                  className="w-full flex items-center justify-between text-xs font-bold text-sky-300 mb-2"
                >
                  🎬 화면 이동
                  <ChevronDown className={`w-3 h-3 transition-transform ${expandedSections['gamestate'] ? 'rotate-180' : ''}`} />
                </button>
                {expandedSections['gamestate'] && (
                  <div className="flex gap-2">
                    <select 
                      value={targetGameState} 
                      onChange={e => setTargetGameState(e.target.value)} 
                      className="flex-1 bg-slate-900 border border-slate-600 rounded p-1.5 text-xs text-white"
                    >
                      <option value="">화면</option>
                      <option value="MENU">메뉴</option>
                      <option value="DECK_BUILDING">덱빌딩</option>
                      <option value="SHOP">상점</option>
                      <option value="REWARDS">보상</option>
                    </select>
                    <button 
                      onClick={() => targetGameState && setGameState(targetGameState)} 
                      className="bg-sky-700 hover:bg-sky-600 px-3 rounded text-xs font-bold"
                    >
                      이동
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;