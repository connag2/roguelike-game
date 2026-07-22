// src/components/screens/DeckBuilder.jsx
import React, { useMemo, useState } from 'react';
import { Eraser, Download, Upload, Save, Maximize2, HelpCircle, Layers, X, ChevronDown, Sparkles, TrendingUp, BookOpen } from 'lucide-react';
import Card from '../common/Card';
import FilterBar from '../common/FilterBar';
import { RELIC_LIBRARY } from '../../constants/relicData';

import scrollImg from '../../assets/images/items/scroll.svg';
import shieldImg from '../../assets/images/items/shield.svg';

// 🏆 큐레이팅된 강한 덱 프리셋 (공격+방어+마나+회복 균형)
const DECK_PRESETS = [
  {
    id: 'aggro_bleed',
    name: '🩸 출혈 학살자',
    tier: 'S',
    style: '공격형',
    color: 'border-red-500 shadow-red-900/50',
    headerColor: 'from-red-900 to-slate-900',
    tagColor: 'bg-red-500',
    desc: '출혈 스택 + 취약 디버프로 데미지를 폭발적으로 증폭. 마나/회복 카드로 지속력도 확보.',
    tips: '취약(Vuln) 상태에서 weakness_exploit 사용 시 데미지 2배!',
    cards: {
      vein_cut: 3,         // 7 피해 + 출혈 3
      bleed_cut: 3,        // 8 피해 + 출혈 2
      weakness_exploit: 2, // 10 피해 (취약 시 20)
      expose_weakness: 2,  // 취약 3 부여
      beast_tear: 2,       // 18 피해 + 취약 2
      counter: 2,          // 4 피해 + 방어 8
      meditate: 2,         // 마나 2 + 방어 5 ← 마나 공급
      short_rest: 2,       // 마나 1 + 회복 8 ← 회복/마나
      focus: 2             // 드로우 2
    }
  },
  {
    id: 'tank_wall',
    name: '🛡️ 철벽 돌격대',
    tier: 'S',
    style: '공방일체',
    color: 'border-blue-500 shadow-blue-900/50',
    headerColor: 'from-blue-900 to-slate-900',
    tagColor: 'bg-blue-500',
    desc: '공방 겸용 카드 + 마나 회복으로 턴마다 여러 장을 플레이하는 균형 덱.',
    tips: 'dash(16공+16방)와 meditate(마나2+방어5)를 조합하면 마나가 넘칩니다.',
    cards: {
      dash: 3,             // 16 피해 + 16 방어
      vanguard: 2,         // 14 피해 + 16 방어
      shield_bash: 3,      // 7 피해 + 7 방어
      counter: 2,          // 4 피해 + 방어 8
      spiked_shield: 2,    // 방어 5 + 가시 2
      barrier: 2,          // 방어 25
      meditate: 3,         // 마나 2 + 방어 5 ← 핵심 마나원
      first_aid: 3         // 회복 8 ← 회복
    }
  },
  {
    id: 'poison_dot',
    name: '🧪 맹독 지옥',
    tier: 'A',
    style: '지속+공격',
    color: 'border-green-500 shadow-green-900/50',
    headerColor: 'from-green-900 to-slate-900',
    tagColor: 'bg-green-500',
    desc: '독을 쌓으며 직접 공격도 하는 균형 덱. 마나 카드로 연속 독 부여가 가능합니다.',
    tips: 'meditate로 마나를 채우면 한 턴에 독 카드를 여러 장 플레이 가능!',
    cards: {
      poison_flask: 3,     // 독 4
      toxic_strike: 3,     // 4×2 피해 + 취약 1
      poison_dart: 2,      // 5 피해 + 드로우 1
      venom_coating: 2,    // 독 3 + 가시 2
      toxic_cloud: 2,      // 독 5 + 약화 1
      neutralize: 2,       // 약화 3
      meditate: 3,         // 마나 2 + 방어 5 ← 마나 공급
      short_rest: 3        // 마나 1 + 회복 8 ← 회복/마나
    }
  },
  {
    id: 'mana_engine',
    name: '⚡ 마나 폭격',
    tier: 'A',
    style: '콤보·공격',
    color: 'border-purple-500 shadow-purple-900/50',
    headerColor: 'from-purple-900 to-slate-900',
    tagColor: 'bg-purple-500',
    desc: '마나를 폭발적으로 확보해 강력한 공격을 연속으로 퍼붓는 콤보 덱.',
    tips: 'overcharge+catalyst로 마나를 채운 뒤 execute+fireball로 폭격!',
    cards: {
      overcharge: 2,       // 마나 3 (체력 -3)
      catalyst: 3,         // 마나 2
      meditate: 2,         // 마나 2 + 방어 5
      execute: 3,          // 25 피해 + 취약 2
      fireball: 3,         // 22 피해
      blade_dance: 3,      // 6×3 피해
      arcane_intellect: 2, // 마나 1 + 드로우 2
      first_aid: 2         // 회복 8 ← 회복
    }
  },
  {
    id: 'vampire_regen',
    name: '🧛 흡혈 재생',
    tier: 'A',
    style: '공격·지속',
    color: 'border-fuchsia-500 shadow-fuchsia-900/50',
    headerColor: 'from-fuchsia-900 to-slate-900',
    tagColor: 'bg-fuchsia-500',
    desc: '공격과 동시에 체력을 회복하는 자립형 덱. 마나도 충분해 연속 공격이 가능합니다.',
    tips: 'soul_harvest(공격+마나1+회복)로 마나 자급자족하며 연속 흡혈!',
    cards: {
      vampire_sword: 3,    // 20 피해 + 회복 10 + 약화 1
      vampiric_strike: 3,  // 18 피해 + 회복 8
      soul_harvest: 3,     // 6 피해 + 마나 1 + 회복 2 ← 마나 자급
      blood_strike: 2,     // 잃은 체력의 30% 피해
      shadow_cloak: 2,     // 방어 7 + 재생 1
      divine_shield: 2,    // 방어 15 + 회복 5
      short_rest: 3,       // 마나 1 + 회복 8 ← 회복/마나
      first_aid: 2         // 회복 8 ← 추가 회복
    }
  },
  {
    id: 'strength_rush',
    name: '💪 근력 폭주',
    tier: 'B',
    style: '버프·공격',
    color: 'border-orange-500 shadow-orange-900/50',
    headerColor: 'from-orange-900 to-slate-900',
    tagColor: 'bg-orange-600',
    desc: '근력 버프로 모든 공격을 강화. 마나/회복으로 버프 후 강타 연속 사용이 가능합니다.',
    tips: '근력 3~4 스택 후 blade_dance(6×3)면 거의 원턴킬 수준!',
    cards: {
      muscle_training: 3,  // 근력 2
      kihap: 3,            // 마나 1 + 근력 1 ← 마나 자급
      empower: 2,          // 근력 1 + 드로우 1
      heavy_strike: 2,     // 18 피해
      blade_dance: 3,      // 6×3 피해
      execute: 3,          // 25 피해 + 취약 2
      combat_prep: 2,      // 방어 4 + 근력 1
      short_rest: 2        // 마나 1 + 회복 8 ← 회복/마나
    }
  }

const TIER_COLOR = { S: 'bg-yellow-500 text-black', A: 'bg-orange-500 text-white', B: 'bg-blue-600 text-white' };


export default function DeckBuilder({
  toggleFullScreen,
  getTotalCards,
  tempDeckCounts,
  setTempDeckCounts,
  handleClearDeck,
  handleDeckExport,
  setDeckImportModalOpen,
  setDeckCounts,
  saveGame,
  setGameState,
  filterType, setFilterType,
  filterEffect, setEffect,
  filterRarity, setRarity,
  searchQuery, setSearchQuery,
  filteredCards,
  getCardDef,
  shopUpgrades,
  handleAddCard,
  handleRemoveCard,
  setTutorialModalOpen,
  normalCleared, unlockedRelics, startingRelic, setStartingRelic,
  allUnlockedCards = []
}) {
  const currentCardCount = getTotalCards(tempDeckCounts);
  const isDeckFull = currentCardCount === 20;

  const [isRelicModalOpen, setIsRelicModalOpen] = useState(false);
  const [showAutoFillMenu, setShowAutoFillMenu] = useState(false);
  const [previewCard, setPreviewCard] = useState(null);
  const [activeTab, setActiveTab] = useState('list');
  const [showDeckRecommend, setShowDeckRecommend] = useState(false);

  const deckCardsList = useMemo(() => {
    return Object.entries(tempDeckCounts)
      .filter(([id, count]) => count > 0)
      .map(([id, count]) => ({
        id,
        count,
        cardDef: getCardDef(id, shopUpgrades)
      }))
      .filter(item => item.cardDef)
      .sort((a, b) => {
        if (a.cardDef.type !== b.cardDef.type) return a.cardDef.type.localeCompare(b.cardDef.type);
        if (a.cardDef.cost !== b.cardDef.cost) return a.cardDef.cost - b.cardDef.cost;
        return a.cardDef.name.localeCompare(b.cardDef.name);
      });
  }, [tempDeckCounts, getCardDef, shopUpgrades]);

  const deckStats = useMemo(() => {
    const allCards = deckCardsList.flatMap(({ cardDef, count }) => Array(count).fill(cardDef));
    if (allCards.length === 0) return null;

    const totalCost = allCards.reduce((s, c) => s + (c.cost || 0), 0);
    const avgCost = (totalCost / allCards.length).toFixed(1);

    const typeCount = {};
    allCards.forEach(c => { typeCount[c.type] = (typeCount[c.type] || 0) + 1; });

    const rarityCount = {};
    allCards.forEach(c => { rarityCount[c.rarity] = (rarityCount[c.rarity] || 0) + 1; });

    const manaCurve = [0, 0, 0, 0, 0, 0];
    allCards.forEach(c => { manaCurve[Math.min(c.cost || 0, 5)]++; });

    const synergies = [];
    if (allCards.filter(c => c.enemyPoison).length >= 3) synergies.push({ label: '🧪 맹독 시너지', color: 'text-green-400', desc: `중독 ${allCards.filter(c => c.enemyPoison).length}장` });
    if (allCards.filter(c => c.enemyBleed).length >= 3) synergies.push({ label: '🩸 출혈 시너지', color: 'text-red-400', desc: `출혈 ${allCards.filter(c => c.enemyBleed).length}장` });
    if (allCards.filter(c => c.enemyBurn).length >= 3) synergies.push({ label: '🔥 화상 시너지', color: 'text-orange-400', desc: `화상 ${allCards.filter(c => c.enemyBurn).length}장` });
    if (allCards.filter(c => c.block || c.selfThorns || c.selfRegen).length >= 5) synergies.push({ label: '🛡️ 철벽 시너지', color: 'text-blue-400', desc: `방어 ${allCards.filter(c => c.block || c.selfThorns || c.selfRegen).length}장` });
    if (allCards.filter(c => c.draw).length >= 3) synergies.push({ label: '🃏 드로우 엔진', color: 'text-cyan-400', desc: `드로우 ${allCards.filter(c => c.draw).length}장` });
    if (allCards.filter(c => c.type === 'special').length >= 2) synergies.push({ label: '✨ 정화 특화', color: 'text-emerald-400', desc: `특수 ${allCards.filter(c => c.type === 'special').length}장` });

    return { avgCost, typeCount, rarityCount, manaCurve, synergies, total: allCards.length };
  }, [deckCardsList]);

  const manaCurveMax = deckStats ? Math.max(...deckStats.manaCurve, 1) : 1;

  const handleAutoBuild = (theme = 'random') => {
    const availableCards = allUnlockedCards.length > 0 ? allUnlockedCards : filteredCards;
    const allIds = new Set(availableCards.map(c => c.id));

    // 테마별 핵심 카드 ID 정의 — 공격+방어+유틸 균형
    const THEME_PRIORITY = {
      // 출혈: 공격(출혈부여) + 취약부여 + 드로우
      bleed:    ['vein_cut','bleed_cut','weakness_exploit','expose_weakness','beast_tear','dig_in','focus','counter'],
      // 방어: 공방겸용 카드 우선 + 순수방어 + 가시
      block:    ['dash','vanguard','shield_bash','counter','spiked_shield','magic_shield','barrier','warcry'],
      // 독: 독부여 + 직접공격 + 약화 + 드로우
      poison:   ['poison_flask','toxic_strike','poison_dart','venom_coating','toxic_cloud','neutralize','sweep','vital_strike'],
      // 마나: 마나충전 + 강력한 공격 피니셔 + 드로우
      mana:     ['overcharge','catalyst','execute','fireball','blade_dance','arcane_intellect','adrenaline','mana_drain'],
      // 흡혈: 공격+회복 카드 + 방어+회복 카드
      vampire:  ['vampire_sword','vampiric_strike','soul_harvest','blood_strike','shadow_cloak','divine_shield','short_rest'],
      // 근력: 버프 + 강한 공격 + 드로우+방어 보조
      strength: ['muscle_training','kihap','empower','heavy_strike','blade_dance','execute','smash','combat_prep'],
      // 화상: 화상부여 + 직접공격 + 약화
      burn:     ['heatwave','pillar_of_fire','flame_slash','fireball','toxic_cloud','neutralize','sweep','warcry'],
      // 정화: 특수카드 + 직접공격 + 방어
      special:  ['adversity_power','primal_roar','pain_lash','pain_conversion','vital_absorption','second_wind','execute','barrier'],
    };

    // 보조 카드 (어떤 테마든 유용한 카드)
    const UTILITY_BONUS = [
      'focus','warcry','adrenaline','arcane_intellect','blood_pact','mind_read',
      'mana_drain','energy_shield','tactical_retreat','meditate','kihap'
    ];

    const newCounts = {};

    if (theme === 'random') {
      // 무작위: 희귀도 점수 기반으로 랜덤 선택
      const scored = availableCards.map(c => {
        const def = getCardDef(c.id, shopUpgrades);
        if (!def) return null;
        const rarityScore = { mythic:80, rare:50, uncommon:30, common:10 }[def.rarity] || 10;
        return { id: c.id, def, score: rarityScore + Math.random() * 40 };
      }).filter(Boolean).sort((a,b) => b.score - a.score);

      let rem = 20;
      for (const { id, def } of scored) {
        if (rem <= 0) break;
        const max = def.rarity === 'mythic' ? 1 : 3;
        const add = Math.min(max, rem);
        newCounts[id] = add;
        rem -= add;
      }
    } else {
      // 테마 덧: 핵심 카드를 먼저 채워넣음 (3장씩)
      const priority = THEME_PRIORITY[theme] || [];
      let rem = 20;

      // 1단계: 핵심 카드 (3장씩, 최대 18장)
      for (const id of priority) {
        if (rem <= 0) break;
        const def = getCardDef(id, shopUpgrades);
        if (!def) continue;
        const add = Math.min(3, rem);
        newCounts[id] = add;
        rem -= add;
      }

      // 2단계: 보조 카드 (해당 테마와 관련된 유효 카드로 나머지 체워넣기)
      if (rem > 0) {
        // 테마별 버퀴 카드군
        const themeBonus = {
          bleed:    c => c.enemyBleed || c.enemyVuln || c.draw,
          block:    c => c.block || c.selfThorns || c.selfRegen || c.selfDex,
          poison:   c => c.enemyPoison || c.enemyWeak || c.draw,
          mana:     c => c.manaGain || c.draw,
          vampire:  c => c.heal || c.manaGain || c.block,
          strength: c => c.selfStrength || c.damage > 12 || c.draw,
          burn:     c => c.enemyBurn || c.enemyWeak || c.damage > 10,
          special:  c => c.type === 'special' || c.cleanse || c.draw,
        }[theme] || (() => true);

        const filler = availableCards
          .filter(c => !newCounts[c.id])
          .map(c => {
            const def = getCardDef(c.id, shopUpgrades);
            if (!def) return null;
            let score = { mythic:80, rare:50, uncommon:25, common:10 }[def.rarity] || 10;
            if (themeBonus(def)) score += 60;
            if (UTILITY_BONUS.includes(c.id)) score += 30;
            if (def.isUpgraded) score += 20;
            return { id: c.id, def, score };
          })
          .filter(Boolean)
          .sort((a,b) => b.score - a.score);

        for (const { id, def } of filler) {
          if (rem <= 0) break;
          const max = def.rarity === 'mythic' ? 1 : 3;
          const add = Math.min(max, rem);
          newCounts[id] = (newCounts[id] || 0) + add;
          rem -= add;
        }
      }
    }

    setTempDeckCounts(newCounts);
  };

  // 🏆 프리셋 덱 적용 (보유한 카드만 적용, 없으면 기본 적용)
  const applyPreset = (preset) => {
    const newCounts = {};
    Object.entries(preset.cards).forEach(([id, count]) => {
      // allUnlockedCards에 있으면 사용, 없어도 일단 적용 (덱빌더는 허용)
      const cardDef = getCardDef(id, shopUpgrades);
      if (cardDef) newCounts[id] = count;
    });
    setTempDeckCounts(newCounts);
    setShowDeckRecommend(false);
  };

  const typeColor = (type) => {
    if (type === 'attack') return 'bg-red-900/80 text-red-300 border-red-800';
    if (type === 'special') return 'bg-emerald-900/80 text-emerald-300 border-emerald-800';
    return 'bg-blue-900/80 text-blue-300 border-blue-800';
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white pt-16 md:pt-4 p-4 md:p-6 lg:p-8 relative overflow-hidden">
      <button onClick={toggleFullScreen} className="fixed top-4 left-4 z-50 flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700 px-3 py-2 rounded text-sm font-bold transition-colors border border-slate-600 md:border-0">
        <Maximize2 className="w-4 h-4"/><span className="hidden md:inline">전체화면</span>
      </button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 pl-0 md:pl-32 gap-4 relative z-50 shrink-0">
        <h2 className="text-2xl md:text-3xl font-black flex items-center gap-3 shrink-0 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]">
          <img src={scrollImg} alt="Deck" className="w-8 h-8 md:w-10 md:h-10 drop-shadow-lg" />
          시작 덱 구성
        </h2>
        <div className="flex flex-wrap items-center gap-2 md:gap-3 shrink-0 w-full md:w-auto justify-end">
          <div className={`flex items-center justify-center px-4 py-1.5 md:py-2 rounded-full border-2 shadow-inner font-black text-sm md:text-lg mr-2 transition-all duration-300 ${isDeckFull ? 'bg-emerald-900/40 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.5)]' : currentCardCount >= 15 ? 'bg-yellow-900/40 border-yellow-500 text-yellow-400' : 'bg-slate-800/60 border-slate-600 text-slate-300'}`}>
            {isDeckFull ? '✅' : '📋'} {currentCardCount} <span className="text-slate-500 mx-1">/</span> 20장
          </div>
          <button onClick={() => setTutorialModalOpen(true)} className="p-2 md:p-2.5 bg-slate-800/80 hover:bg-slate-700 rounded-lg border border-slate-600 transition-colors backdrop-blur-sm shadow-sm">
            <HelpCircle className="w-5 h-5 text-indigo-400" />
          </button>
          <button onClick={() => setShowDeckRecommend(true)} className="flex items-center gap-1 md:gap-2 py-2 px-3 md:px-4 bg-amber-900/80 hover:bg-amber-800 rounded-lg font-bold transition-all text-xs md:text-sm border border-amber-700 text-amber-100 shadow-[0_0_10px_rgba(245,158,11,0.3)] backdrop-blur-sm">
            <BookOpen className="w-4 h-4"/> 덱 추천
          </button>
          <div className="relative z-50">
            <button onClick={() => setShowAutoFillMenu(!showAutoFillMenu)} className="flex items-center gap-1 md:gap-2 py-2 px-3 md:px-4 bg-fuchsia-900/80 hover:bg-fuchsia-800 rounded-lg font-bold transition-all text-xs md:text-sm border border-fuchsia-700 text-fuchsia-100 shadow-[0_0_10px_rgba(217,70,239,0.3)] backdrop-blur-sm">
              <Sparkles className="w-4 h-4"/> 자동 편성 <ChevronDown className="w-4 h-4" />
            </button>
            {showAutoFillMenu && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-[999] overflow-hidden">
                <div className="px-3 py-2 text-[10px] text-slate-500 font-bold border-b border-slate-800 bg-slate-950">🎯 테마 선택 후 20장으로 자동 완성</div>
                {[
                  ['random',   '🎲 무작위',      'slate-400',  'hover:bg-slate-800'],
                  ['bleed',    '🩸 출혈 학살자',  'red-400',    'hover:bg-red-900/30'],
                  ['block',    '🛡️ 철벽 요새',   'blue-400',   'hover:bg-blue-900/30'],
                  ['poison',   '🧪 맹독 지옥',   'green-400',  'hover:bg-green-900/30'],
                  ['mana',     '⚡ 마나 엔진',    'purple-400', 'hover:bg-purple-900/30'],
                  ['vampire',  '🧛 흡혈 재생',   'fuchsia-400','hover:bg-fuchsia-900/30'],
                  ['strength', '💪 근력 폭주',   'orange-400', 'hover:bg-orange-900/30'],
                  ['burn',     '🔥 화상 특화',   'amber-400',  'hover:bg-amber-900/30'],
                  ['special',  '✨ 정화 특화',   'emerald-400','hover:bg-emerald-900/30'],
                ].map(([theme, label, textColor, hoverBg]) => (
                  <button key={theme}
                    onClick={() => { handleAutoBuild(theme); setShowAutoFillMenu(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm font-bold border-b border-slate-800 last:border-0 text-${textColor} ${hoverBg} transition-colors`}>
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button onClick={handleClearDeck} className="flex items-center gap-1 md:gap-2 py-2 px-3 md:px-4 bg-red-900/80 hover:bg-red-800 rounded-lg font-bold transition-all text-xs md:text-sm border border-red-700 text-red-100 backdrop-blur-sm">
            <Eraser className="w-4 h-4"/> 비우기
          </button>
          <button onClick={handleDeckExport} className="flex items-center gap-1 md:gap-2 py-2 px-3 md:px-4 bg-slate-800/80 hover:bg-slate-700 rounded-lg font-bold transition-all text-xs md:text-sm border border-slate-600 backdrop-blur-sm">
            <Download className="w-4 h-4 text-cyan-400"/> 복사
          </button>
          <button onClick={() => setDeckImportModalOpen(true)} className="flex items-center gap-1 md:gap-2 py-2 px-3 md:px-4 bg-slate-800/80 hover:bg-slate-700 rounded-lg font-bold transition-all text-xs md:text-sm border border-slate-600 backdrop-blur-sm">
            <Upload className="w-4 h-4 text-cyan-400"/> 붙여넣기
          </button>
          <button onClick={() => { setDeckCounts(tempDeckCounts); saveGame({ deckCounts: tempDeckCounts }); }} className="flex items-center gap-1 md:gap-2 py-2 px-3 md:px-5 bg-emerald-700 hover:bg-emerald-600 rounded-lg font-bold transition-all text-sm md:text-base border border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)] text-white">
            <Save className="w-4 h-4 md:w-5 md:h-5"/> 저장
          </button>
          <button onClick={() => setGameState('MENU')} className="py-2 px-3 md:px-5 bg-indigo-700 hover:bg-indigo-600 rounded-lg font-bold text-sm md:text-base border border-indigo-500 transition-colors">
            메인으로
          </button>
        </div>
      </div>

      <div className="relative z-10 mb-2 shrink-0 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 w-full max-w-[1600px] mx-auto">
        <FilterBar type={filterType} setType={setFilterType} effect={filterEffect} setEffect={setEffect} rarity={filterRarity} setRarity={setRarity} search={searchQuery} setSearch={setSearchQuery} />
        {normalCleared && unlockedRelics && unlockedRelics.length > 0 && (
          <button onClick={() => setIsRelicModalOpen(true)} className="flex items-center gap-3 bg-slate-900/90 hover:bg-slate-800 px-4 py-2.5 rounded-xl border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.15)] transition-all backdrop-blur-md group">
            <img src={shieldImg} alt="Relic" className="w-5 h-5 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)] group-hover:scale-110 transition-transform" />
            <div className="flex flex-col items-start">
              <span className="text-[10px] text-amber-400/80 font-bold -mb-1">시작 유물 변경</span>
              <span className="text-amber-400 font-black text-sm">{startingRelic ? RELIC_LIBRARY.find(r => r.id === startingRelic)?.name : '선택 안함'}</span>
            </div>
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col lg:flex-row w-full max-w-[1600px] mx-auto overflow-hidden relative z-10 mt-2 gap-4">
        {/* 카드 목록 */}
        <div className="relative flex-1 flex flex-col min-h-0 bg-slate-900/30 rounded-2xl border border-slate-700/50">
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 pointer-events-none opacity-60">
            <span className="text-[10px] text-indigo-300 font-bold bg-slate-900/80 px-2 py-0.5 rounded-full border border-indigo-500/30">스크롤하여 더 보기</span>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar pb-[40vh] lg:pb-10 px-2 lg:px-4 pt-10 relative z-10">
            <div className="flex flex-wrap gap-4 md:gap-6 content-start justify-center">
              {filteredCards.map(baseCard => {
                const count = tempDeckCounts[baseCard.id] || 0;
                const card = getCardDef(baseCard.id, shopUpgrades);
                if (!card) return null;
                return (
                  <div key={baseCard.id} className="w-32 h-48 sm:w-36 sm:h-56 md:w-44 md:h-[260px] lg:w-48 lg:h-[280px] shrink-0 transition-transform hover:scale-105 origin-center">
                    <Card card={card} count={count} isLocked={false} onAdd={handleAddCard} onRemove={handleRemoveCard} canAdd={!isDeckFull} />
                  </div>
                );
              })}
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent pointer-events-none z-20 rounded-b-2xl"></div>
        </div>

        {/* 우측 패널 */}
        <div className="fixed bottom-0 left-0 right-0 lg:static lg:w-[340px] xl:w-[380px] h-[45vh] lg:h-full shrink-0 flex flex-col bg-slate-900/95 lg:bg-slate-900/60 backdrop-blur-xl rounded-t-3xl lg:rounded-2xl border-t lg:border border-slate-600 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-50 overflow-hidden">
          {/* 탭 */}
          <div className="bg-slate-800/80 p-3 flex justify-between items-center border-b border-slate-600 rounded-t-3xl lg:rounded-t-2xl shrink-0">
            <div className="flex gap-1">
              <button onClick={() => setActiveTab('list')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                <Layers className="w-3.5 h-3.5"/> 목록
              </button>
              <button onClick={() => setActiveTab('stats')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'stats' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                <TrendingUp className="w-3.5 h-3.5"/> 통계
              </button>
            </div>
            <span className={`text-xs font-black px-2 py-1 rounded-full border ${isDeckFull ? 'text-emerald-300 bg-emerald-900/50 border-emerald-700' : 'text-indigo-300 bg-indigo-900/50 border-indigo-700'}`}>{currentCardCount}/20</span>
          </div>

          {/* 덱 목록 탭 */}
          {activeTab === 'list' && (
            <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
              {deckCardsList.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-3 opacity-60">
                  <Layers className="w-10 h-10" />
                  <span className="text-sm font-medium">덱에 카드가 없습니다.</span>
                  <span className="text-xs text-center">왼쪽 카드를 클릭해 추가하세요</span>
                </div>
              ) : (
                ['attack','skill','special'].map(type => {
                  const group = deckCardsList.filter(({ cardDef }) => cardDef.type === type);
                  if (group.length === 0) return null;
                  const labels = { attack: '⚔️ 공격', skill: '🔮 스킬', special: '✨ 특수' };
                  return (
                    <div key={type} className="mb-2">
                      <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1 py-1.5 border-b border-slate-700/50 mb-1">{labels[type]} ({group.reduce((s, g) => s + g.count, 0)}장)</div>
                      {group.map(({ id, count, cardDef }) => (
                        <div key={id} className={`flex justify-between items-center bg-slate-800/60 p-2 rounded-lg border border-slate-700/80 hover:border-indigo-500/50 transition-all group cursor-pointer mb-1 ${previewCard?.id === id ? 'border-indigo-400 bg-indigo-900/20' : ''}`} onClick={() => setPreviewCard(previewCard?.id === id ? null : cardDef)}>
                          <div className="flex items-center gap-2 overflow-hidden flex-1">
                            <span className={`text-[11px] px-1.5 py-0.5 rounded font-black shrink-0 border ${typeColor(cardDef.type)}`}>{cardDef.cost}</span>
                            <span className={`text-xs font-bold truncate ${cardDef.rarity === 'mythic' ? 'text-red-400' : cardDef.rarity === 'rare' ? 'text-yellow-300' : cardDef.rarity === 'uncommon' ? 'text-cyan-300' : cardDef.type === 'special' ? 'text-emerald-300' : 'text-slate-200'}`} title={cardDef.name}>
                              {cardDef.name.split(' +')[0]}
                              {cardDef.isUpgraded && <span className="text-[10px] ml-1 text-yellow-500 font-bold">+{cardDef.upgradeLevel}</span>}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 pl-1">
                            <span className="text-xs font-black text-indigo-300 min-w-[1.5rem] text-right">x{count}</span>
                            <div className="flex gap-0.5">
                              <button onClick={(e) => { e.stopPropagation(); handleRemoveCard(id); }} className="w-6 h-6 flex items-center justify-center bg-slate-700 hover:bg-red-600 text-slate-300 hover:text-white rounded transition-colors font-black border border-slate-600 text-xs">-</button>
                              <button onClick={(e) => { e.stopPropagation(); handleAddCard(id); }} disabled={isDeckFull} className="w-6 h-6 flex items-center justify-center bg-slate-700 hover:bg-blue-600 text-slate-300 hover:text-white rounded transition-colors font-black border border-slate-600 disabled:opacity-30 text-xs">+</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* 통계 탭 */}
          {activeTab === 'stats' && (
            <div className="flex-1 overflow-y-auto p-3 custom-scrollbar space-y-3">
              {!deckStats ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-3 opacity-60">
                  <TrendingUp className="w-10 h-10" />
                  <span className="text-sm">덱을 구성하면 통계가 표시됩니다</span>
                </div>
              ) : (
                <>
                  <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50 flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-bold">⚡ 평균 마나 코스트</span>
                    <span className="text-2xl font-black text-indigo-300">{deckStats.avgCost}</span>
                  </div>

                  <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
                    <div className="text-xs text-slate-400 font-bold mb-3">📊 마나 곡선</div>
                    <div className="flex items-end gap-1 h-14">
                      {deckStats.manaCurve.map((count, cost) => {
                        const colors = ['#6366f1','#22c55e','#eab308','#f97316','#ef4444','#a855f7'];
                        return (
                          <div key={cost} className="flex-1 flex flex-col items-center gap-0.5">
                            <span className="text-[9px] text-slate-400 font-bold">{count > 0 ? count : ''}</span>
                            <div className="w-full rounded-t-sm" style={{ height: `${count > 0 ? Math.max((count / manaCurveMax) * 40, 4) : 2}px`, backgroundColor: colors[cost] }} />
                            <span className="text-[9px] text-slate-500 font-bold">{cost === 5 ? '5+' : cost}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
                    <div className="text-xs text-slate-400 font-bold mb-2">🎯 타입 분포</div>
                    {[{k:'attack',l:'⚔️ 공격',c:'bg-red-500'},{k:'skill',l:'🔮 스킬',c:'bg-blue-500'},{k:'special',l:'✨ 특수',c:'bg-emerald-500'}].map(({k,l,c}) => {
                      const cnt = deckStats.typeCount[k] || 0;
                      const pct = Math.round((cnt / deckStats.total) * 100);
                      return cnt > 0 ? (
                        <div key={k} className="mb-2">
                          <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                            <span className="font-bold">{l}</span><span>{cnt}장 ({pct}%)</span>
                          </div>
                          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div className={`h-full ${c} rounded-full`} style={{width:`${pct}%`}} />
                          </div>
                        </div>
                      ) : null;
                    })}
                  </div>

                  <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
                    <div className="text-xs text-slate-400 font-bold mb-2">🌟 등급 분포</div>
                    <div className="flex flex-wrap gap-1.5">
                      {[{k:'common',l:'일반',c:'bg-slate-600 text-slate-200'},{k:'uncommon',l:'희귀',c:'bg-cyan-900/80 text-cyan-300'},{k:'rare',l:'전설',c:'bg-yellow-900/80 text-yellow-300'},{k:'special',l:'특수',c:'bg-fuchsia-900/80 text-fuchsia-300'},{k:'mythic',l:'신화',c:'bg-red-900/80 text-red-300'}].map(({k,l,c}) => {
                        const cnt = deckStats.rarityCount[k] || 0;
                        return cnt > 0 ? <span key={k} className={`text-[11px] font-black px-2 py-0.5 rounded-full ${c}`}>{l} {cnt}</span> : null;
                      })}
                    </div>
                  </div>

                  {deckStats.synergies.length > 0 && (
                    <div className="bg-slate-800/60 rounded-xl p-3 border border-emerald-700/30">
                      <div className="text-xs text-slate-400 font-bold mb-2">💡 감지된 시너지</div>
                      {deckStats.synergies.map((syn, i) => (
                        <div key={i} className="flex justify-between items-center mb-1">
                          <span className={`text-xs font-bold ${syn.color}`}>{syn.label}</span>
                          <span className="text-[10px] text-slate-500">{syn.desc}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {currentCardCount < 20 && (
                    <div className="bg-yellow-900/30 rounded-xl p-3 border border-yellow-700/50">
                      <div className="text-xs text-yellow-400 font-bold">⚠️ {20 - currentCardCount}장 더 필요합니다</div>
                      <div className="text-[10px] text-yellow-600 mt-1">20장을 채워야 게임을 시작할 수 있습니다</div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 카드 미리보기 */}
      {previewCard && (
        <div className="fixed bottom-[46vh] lg:bottom-4 left-4 z-[200] pointer-events-none">
          <div className="w-40 h-56 drop-shadow-[0_0_20px_rgba(99,102,241,0.8)]">
            <Card card={previewCard} />
          </div>
          <div className="mt-2 bg-slate-900/95 border border-slate-600 rounded-xl p-2.5 max-w-[180px] backdrop-blur-sm">
            <p className="text-[10px] text-slate-300 leading-relaxed">{previewCard.desc}</p>
          </div>
        </div>
      )}

      {isRelicModalOpen && normalCleared && unlockedRelics && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border-2 border-amber-500/50 rounded-2xl w-full max-w-3xl flex flex-col max-h-[85vh] shadow-[0_0_40px_rgba(245,158,11,0.3)]">
            <div className="flex justify-between items-center p-4 border-b border-slate-700 shrink-0 bg-slate-800/50 rounded-t-2xl">
              <h3 className="text-xl font-black text-amber-400 flex items-center gap-3">
                <img src={shieldImg} alt="Relic" className="w-7 h-7" /> 시작 유물 선택
              </h3>
              <button onClick={() => setIsRelicModalOpen(false)} className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-2 rounded-lg transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto custom-scrollbar flex flex-col gap-3">
              <button onClick={() => { setStartingRelic(null); setIsRelicModalOpen(false); }} className={`w-full p-4 rounded-xl border text-left transition-all ${startingRelic === null ? 'bg-amber-600/20 border-amber-400 text-amber-200' : 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700'}`}>
                <div className="font-bold text-lg">선택 안함</div>
                <div className="text-sm text-slate-500 mt-1">유물 없이 게임을 시작합니다.</div>
              </button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {unlockedRelics.map(rid => {
                  const relDef = RELIC_LIBRARY.find(r => r.id === rid);
                  if (!relDef) return null;
                  const isSelected = startingRelic === rid;
                  return (
                    <button key={rid} onClick={() => { setStartingRelic(rid); setIsRelicModalOpen(false); }} className={`flex flex-col p-4 rounded-xl border text-left transition-all ${isSelected ? 'bg-amber-600/20 border-amber-400 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.3)] scale-[1.02]' : 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-amber-500/50'}`}>
                      <div className="font-bold text-amber-400 text-base mb-1">{relDef.name}</div>
                      <div className="text-xs text-slate-300 leading-relaxed">{relDef.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🏆 덱 추천 모달 */}
      {showDeckRecommend && (
        <div className="fixed inset-0 bg-black/80 z-[9999] flex items-start justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-4xl my-4">
            <div className="bg-slate-900 border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden">
              {/* 헤더 */}
              <div className="bg-gradient-to-r from-amber-900 to-slate-900 p-5 flex justify-between items-center border-b border-amber-500/30">
                <div>
                  <h2 className="text-2xl font-black text-amber-400 flex items-center gap-2">
                    <BookOpen className="w-6 h-6"/> 강한 덱 추천
                  </h2>
                  <p className="text-sm text-slate-400 mt-1">클릭 한 번으로 바로 적용 · 기존 덱은 초기화됩니다</p>
                </div>
                <button onClick={() => setShowDeckRecommend(false)} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-600 transition-colors">
                  <X className="w-5 h-5 text-slate-400"/>
                </button>
              </div>

              {/* 덱 카드 목록 */}
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
                {DECK_PRESETS.map(preset => {
                  const totalCards = Object.values(preset.cards).reduce((a, b) => a + b, 0);
                  return (
                    <div key={preset.id} className={`bg-slate-800 border-2 ${preset.color} rounded-xl overflow-hidden shadow-lg transition-all hover:-translate-y-1 hover:brightness-110 cursor-pointer group`}
                      onClick={() => applyPreset(preset)}>
                      {/* 덱 헤더 */}
                      <div className={`bg-gradient-to-r ${preset.headerColor} p-4`}>
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-lg font-black text-white">{preset.name}</h3>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-black px-2 py-0.5 rounded ${TIER_COLOR[preset.tier]}`}>
                              {preset.tier} 티어
                            </span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${preset.tagColor} text-white`}>
                              {preset.style}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">{preset.desc}</p>
                      </div>

                      {/* 카드 목록 */}
                      <div className="p-3">
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {Object.entries(preset.cards).map(([id, count]) => {
                            const def = getCardDef(id, shopUpgrades);
                            if (!def) return null;
                            const rarityColor = {
                              mythic: 'bg-red-900/60 text-red-300 border-red-700',
                              rare: 'bg-yellow-900/60 text-yellow-300 border-yellow-700',
                              uncommon: 'bg-indigo-900/60 text-indigo-300 border-indigo-700',
                              common: 'bg-slate-700/60 text-slate-300 border-slate-600'
                            }[def.rarity] || 'bg-slate-700/60 text-slate-300 border-slate-600';
                            return (
                              <span key={id} className={`text-[11px] font-bold px-2 py-0.5 rounded border ${rarityColor}`}>
                                {def.name} ×{count}
                              </span>
                            );
                          })}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-xs text-amber-400/80">
                            <span>💡</span>
                            <span className="text-slate-400">{preset.tips}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500">{totalCards}장</span>
                            <span className="text-xs font-bold text-amber-400 bg-amber-900/40 px-2 py-1 rounded-lg border border-amber-700/50 group-hover:bg-amber-800/60 transition-colors">
                              적용하기 →
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
