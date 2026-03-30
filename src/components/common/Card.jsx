import React from 'react';
import { Sword, Shield, Lock, Star, Sparkles } from 'lucide-react';
import Tooltip from './Tooltip';

export default function Card({ card, count = null, isLocked = false, onAdd, onRemove, onClick, canAdd = true }) {
  if (!card) return null;
  
  const isAttack = card.type === 'attack';
  const rarity = card.rarity || 'common';
  
  // 기본 테두리 설정
  let borderStyle = isAttack ? 'border-red-500' : 'border-blue-500';
  
  let rarityShadow = '';
  let nameColor = 'text-white';
  let tagUi = null;
  let bgStyle = 'bg-slate-900';
  
  // 레어도별 스타일링
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

  // 강화 효과 적용
  if (card.isUpgraded) {
    borderStyle = 'border-yellow-400 ring-2 ring-yellow-400/50'; 
    rarityShadow = 'shadow-[0_0_25px_rgba(250,204,21,0.6)] animate-pulse'; 
    nameColor = 'text-yellow-300 drop-shadow-[0_0_8px_rgba(250,204,21,0.9)]'; 
    if (rarity !== 'mythic' && rarity !== 'special' && rarity !== 'rare') {
      bgStyle = 'bg-gradient-to-br from-slate-900 to-yellow-900/30';
    }
  }

  const cardStatusStyle = isLocked 
    ? 'opacity-50 grayscale border-slate-700 bg-slate-900' 
    : `${borderStyle} ${rarityShadow} ${bgStyle}`;

  return (
    <div 
      onClick={onClick}
      className={`border-2 p-1.5 md:p-2 rounded-xl flex flex-col relative transition-all duration-300 overflow-hidden ${onClick && !isLocked ? 'cursor-pointer hover:-translate-y-2 hover:scale-105' : ''} ${cardStatusStyle} w-full h-full aspect-[2/3] shrink-0 box-border`}
    >
      {isLocked && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-xl bg-slate-950/90 backdrop-blur-sm pointer-events-none">
          <Lock className="w-8 h-8 md:w-10 md:h-10 text-slate-400 mb-1 drop-shadow-md"/>
          <span className="text-yellow-500 font-black text-[10px] md:text-xs bg-slate-900/90 px-2 py-1 rounded border border-slate-700 shadow-xl">미해금</span>
        </div>
      )}
      
      {/* 상단 코스트 및 뱃지 */}
      <div className="z-10 relative flex justify-between items-start shrink-0">
        <span className="font-bold text-[9px] md:text-xs bg-slate-800 px-1.5 py-0.5 rounded text-white shadow-inner border border-slate-700 leading-none">
          코스트 {card.cost}
        </span>
        
        <div className="flex flex-col items-end gap-1">
          {tagUi}
          {card.isUpgraded && (
            <span className="text-[9px] md:text-[10px] text-yellow-900 font-black bg-yellow-400 px-1 rounded shadow-[0_0_10px_rgba(250,204,21,0.8)] flex items-center gap-0.5">
              <Sparkles className="w-2 h-2" />
              +{card.upgradeLevel}
            </span>
          )}
          
          {isAttack ? (
            <Sword className={`w-3 h-3 md:w-4 md:h-4 ${card.isUpgraded ? 'text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.8)]' : 'text-red-400'}`}/>
          ) : (
            <Shield className={`w-3 h-3 md:w-4 md:h-4 ${card.isUpgraded ? 'text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.8)]' : 'text-blue-400'}`}/>
          )}
        </div>
      </div>
      
      {/* 카드 이름 */}
      <div className="text-center z-10 shrink-0 mt-1 mb-1">
        <h4 className={`font-black text-[11px] sm:text-sm md:text-base leading-tight truncate break-keep ${nameColor}`}>
          {card.name.split(' +')[0]} 
        </h4>
      </div>
      
      {/* ✨ 설명 영역: overflow-visible로 설정하여 툴팁이 잘리지 않게 함 */}
      <div className="text-[9px] md:text-[11px] text-slate-100 text-center leading-snug bg-slate-950/95 backdrop-blur-md p-1 md:p-1.5 rounded relative flex-1 min-h-[40px] flex flex-col items-center justify-center z-10 font-medium border border-white/10 w-full shadow-[inset_0_0_10px_rgba(0,0,0,0.8)] mb-1 overflow-visible">
        <div className="w-full flex flex-wrap items-center justify-center px-0.5 gap-x-0.5 break-keep relative">
          <span className="text-center leading-normal">{card.desc}</span>
          <Tooltip desc={card.desc} />
        </div>
      </div>
      
      {/* 덱 빌딩 버튼 */}
      {count !== null && onAdd && onRemove && !isLocked && (
        <div className="mt-auto flex items-center justify-between bg-slate-800/90 border border-slate-600 px-1 py-1 md:px-1.5 md:py-1.5 rounded-lg z-20 shrink-0 backdrop-blur-sm overflow-visible">
          <button 
            onClick={(e) => { e.stopPropagation(); onRemove(card.id); }} 
            className={`w-5 h-5 md:w-6 md:h-6 flex justify-center items-center rounded-full font-bold text-sm md:text-base transition-colors ${count > 0 ? 'bg-slate-600 hover:bg-slate-500 text-white' : 'bg-slate-800 text-slate-600'}`}
          >
            -
          </button>
          <span className="w-4 text-center font-bold text-xs md:text-sm text-white">{count}</span>
          <button 
            onClick={(e) => { e.stopPropagation(); onAdd(card.id); }} 
            className={`w-5 h-5 md:w-6 md:h-6 flex justify-center items-center rounded-full font-bold text-sm md:text-base transition-colors ${canAdd ? 'bg-slate-600 hover:bg-slate-500 text-white' : 'bg-slate-800 text-slate-600'}`}
          >
            +
          </button>
        </div>
      )}
    </div>
  );
}