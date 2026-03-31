import React from 'react';
import { Sword, Shield, Lock, Star, Sparkles } from 'lucide-react';
import Tooltip from './Tooltip';

export default function Card({ card, count = null, isLocked = false, onAdd, onRemove, onClick, canAdd = true }) {
  // ... (상단 레어도/강화 로직 동일)
  if (!card) return null;
  
  const isAttack = card.type === 'attack';
  const rarity = card.rarity || 'common';
  let borderStyle = isAttack ? 'border-red-500' : 'border-blue-500';
  let rarityShadow = '';
  let nameColor = 'text-white';
  let tagUi = null;
  let bgStyle = 'bg-slate-900';
  
  // 레어도 스타일 설정
  if (rarity === 'uncommon') { 
    rarityShadow = 'shadow-[0_0_12px_rgba(34,211,238,0.4)]'; 
    nameColor = 'text-cyan-300';
    tagUi = <span className="text-[9px] md:text-[10px] text-cyan-400 font-bold bg-slate-800/80 px-1 rounded border border-cyan-800">희귀</span>;
  } else if (rarity === 'rare') {
    rarityShadow = 'shadow-[0_0_20px_rgba(250,204,21,0.6)]'; 
    nameColor = 'text-yellow-300 drop-shadow-[0_0_5px_rgba(250,204,21,0.8)]';
    tagUi = <span className="text-[9px] md:text-[10px] text-yellow-400 font-bold bg-slate-800/80 px-1 rounded border border-yellow-700">전설</span>;
    bgStyle = 'legendary-bg'; 
  } else if (rarity === 'mythic') { 
    rarityShadow = 'shadow-[0_0_30px_rgba(239,68,68,0.9)]'; 
    nameColor = 'text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]';
    tagUi = <span className="text-[9px] md:text-[10px] text-red-500 font-black bg-black/90 px-1.5 rounded border border-red-700">신화</span>;
    bgStyle = 'bg-gradient-to-br from-red-950 to-black'; 
  } else if (rarity === 'special') {
    rarityShadow = 'shadow-[0_0_25px_rgba(217,70,239,0.7)]'; 
    nameColor = 'text-fuchsia-300 drop-shadow-[0_0_8px_rgba(217,70,239,0.8)]';
    tagUi = <span className="text-[9px] md:text-[10px] text-fuchsia-400 font-bold bg-slate-800/80 px-1 rounded border border-fuchsia-800"><Star className="w-2 h-2 inline mb-0.5"/>특수</span>;
    bgStyle = 'special-bg'; 
  } else {
    tagUi = <span className="text-[9px] md:text-[10px] text-slate-400 font-bold bg-slate-800/80 px-1 rounded border border-slate-600">일반</span>;
  }

  // 강화 시 우측 상단 뱃지와 아이콘 색상 기본값
  let upBadgeBg = 'bg-yellow-400';
  let upBadgeText = 'text-yellow-900';
  let upBadgeShadow = 'shadow-[0_0_10px_rgba(250,204,21,0.8)]';
  let upIconColor = 'text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.8)]';

  if (card.isUpgraded) {
    if (rarity === 'uncommon') {
      borderStyle = 'border-cyan-400 ring-2 ring-cyan-400/50';
      rarityShadow = 'shadow-[0_0_30px_rgba(34,211,238,0.6)]';
      nameColor = 'text-cyan-100 drop-shadow-[0_0_8px_rgba(34,211,238,0.9)]';
      bgStyle = 'bg-gradient-to-br from-slate-900 to-cyan-900/40';
      upBadgeBg = 'bg-cyan-400'; upBadgeText = 'text-cyan-950'; upBadgeShadow = 'shadow-[0_0_10px_rgba(34,211,238,0.8)]';
      upIconColor = 'text-cyan-300 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]';
    } else if (rarity === 'rare') {
      borderStyle = 'border-yellow-400 ring-2 ring-yellow-400/60';
      rarityShadow = 'shadow-[0_0_35px_rgba(250,204,21,0.7)]';
      nameColor = 'text-yellow-100 drop-shadow-[0_0_10px_rgba(250,204,21,1)]';
      upBadgeBg = 'bg-yellow-400'; upBadgeText = 'text-yellow-950'; upBadgeShadow = 'shadow-[0_0_15px_rgba(250,204,21,1)]';
      upIconColor = 'text-yellow-300 drop-shadow-[0_0_5px_rgba(250,204,21,1)]';
    } else if (rarity === 'mythic') {
      borderStyle = 'border-red-500 ring-2 ring-red-500/60';
      rarityShadow = 'shadow-[0_0_40px_rgba(239,68,68,0.8)]';
      nameColor = 'text-red-100 drop-shadow-[0_0_12px_rgba(239,68,68,1)]';
      upBadgeBg = 'bg-red-500'; upBadgeText = 'text-white'; upBadgeShadow = 'shadow-[0_0_15px_rgba(239,68,68,1)]';
      upIconColor = 'text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,1)]';
    } else if (rarity === 'special') {
      borderStyle = 'border-fuchsia-400 ring-2 ring-fuchsia-400/60';
      rarityShadow = 'shadow-[0_0_35px_rgba(217,70,239,0.8)]';
      nameColor = 'text-fuchsia-100 drop-shadow-[0_0_10px_rgba(217,70,239,1)]';
      upBadgeBg = 'bg-fuchsia-400'; upBadgeText = 'text-fuchsia-950'; upBadgeShadow = 'shadow-[0_0_15px_rgba(217,70,239,1)]';
      upIconColor = 'text-fuchsia-300 drop-shadow-[0_0_8px_rgba(217,70,239,1)]';
    } else {
      // 일반 등급 (은빛/백금색)
      borderStyle = 'border-slate-300 ring-2 ring-slate-300/60';
      rarityShadow = 'shadow-[0_0_25px_rgba(203,213,225,0.5)]';
      nameColor = 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]';
      bgStyle = 'bg-gradient-to-br from-slate-900 to-slate-700/50';
      upBadgeBg = 'bg-slate-200'; upBadgeText = 'text-slate-900'; upBadgeShadow = 'shadow-[0_0_10px_rgba(203,213,225,0.8)]';
      upIconColor = 'text-slate-200 drop-shadow-[0_0_5px_rgba(203,213,225,0.8)]';
    }
  }

  const cardStatusStyle = isLocked 
    ? 'opacity-50 grayscale border-slate-700 bg-slate-900' 
    : `${borderStyle} ${rarityShadow} ${bgStyle}`;

  return (
    <div 
      onClick={onClick}
      className={`border-2 p-1.5 md:p-2 rounded-xl flex flex-col relative transition-all duration-300 ${onClick && !isLocked ? 'cursor-pointer hover:-translate-y-2 hover:scale-105' : ''} ${cardStatusStyle} w-full h-full aspect-[2/3] shrink-0 box-border 
      /* ✨ overflow-hidden을 제거하고 visible로 변경하여 자식 요소인 툴팁이 밖으로 나올 수 있게 함 */
      overflow-visible`}
    >
      {/* 📌 잠금 필터(isLocked) 사용 시에도 둥근 모서리가 유지되도록 오버레이에 rounded 적용 확인 */}
      {isLocked && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-xl bg-slate-950/90 backdrop-blur-sm pointer-events-none">
          <Lock className="w-8 h-8 md:w-10 md:h-10 text-slate-400 mb-1 drop-shadow-md"/>
          <span className="text-yellow-500 font-black text-[10px] md:text-xs bg-slate-900/90 px-2 py-1 rounded border border-slate-700 shadow-xl">미해금</span>
        </div>
      )}
      
      <div className="z-10 relative flex justify-between items-start shrink-0">
        <span className="font-bold text-[9px] md:text-xs bg-slate-800 px-1.5 py-0.5 rounded text-white shadow-inner border border-slate-700 leading-none">코스트 {card.cost}</span>
        <div className="flex flex-col items-end gap-1">
          {tagUi}
          {card.isUpgraded && <span className="text-[9px] md:text-[10px] text-yellow-900 font-black bg-yellow-400 px-1 rounded shadow-[0_0_10px_rgba(250,204,21,0.8)] flex items-center gap-0.5"><Sparkles className="w-2 h-2" />+{card.upgradeLevel}</span>}
          {isAttack ? <Sword className={`w-3 h-3 md:w-4 md:h-4 ${card.isUpgraded ? 'text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.8)]' : 'text-red-400'}`}/> : <Shield className={`w-3 h-3 md:w-4 md:h-4 ${card.isUpgraded ? 'text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.8)]' : 'text-blue-400'}`}/>}
        </div>
      </div>
      
      <div className="text-center z-10 shrink-0 mt-1 mb-1">
        <h4 className={`font-black text-[11px] sm:text-sm md:text-base leading-tight truncate break-keep ${nameColor}`}>{card.name.split(' +')[0]}</h4>
      </div>
      
      {/* 하단 설명 영역: 여기도 overflow-visible로 설정되어 있어야 합니다. */}
      <div className="text-[9px] md:text-[11px] text-slate-100 text-center leading-snug bg-slate-950/95 backdrop-blur-md p-1 md:p-1.5 rounded relative flex-1 min-h-[40px] flex flex-col items-center justify-center z-10 font-medium border border-white/10 w-full shadow-[inset_0_0_10px_rgba(0,0,0,0.8)] mb-1 overflow-visible">
        <div className="w-full flex flex-wrap items-center justify-center px-0.5 gap-x-0.5 break-keep relative">
          <span className="text-center leading-normal">{card.desc}</span>
          <Tooltip desc={card.desc} />
        </div>
      </div>
      
      {count !== null && onAdd && onRemove && !isLocked && (
        <div className="mt-auto flex items-center justify-between bg-slate-800/90 border border-slate-600 px-1 py-1 md:px-1.5 md:py-1.5 rounded-lg z-20 shrink-0 backdrop-blur-sm overflow-visible">
          <button onClick={(e) => { e.stopPropagation(); onRemove(card.id); }} className={`w-5 h-5 md:w-6 md:h-6 flex justify-center items-center rounded-full font-bold text-sm md:text-base transition-colors ${count > 0 ? 'bg-slate-600 hover:bg-slate-500 text-white' : 'bg-slate-800 text-slate-600'}`}>-</button>
          <span className="w-4 text-center font-bold text-xs md:text-sm text-white">{count}</span>
          <button onClick={(e) => { e.stopPropagation(); onAdd(card.id); }} className={`w-5 h-5 md:w-6 md:h-6 flex justify-center items-center rounded-full font-bold text-sm md:text-base transition-colors ${canAdd ? 'bg-slate-600 hover:bg-slate-500 text-white' : 'bg-slate-800 text-slate-600'}`}>+</button>
        </div>
      )}
    </div>
  );
}