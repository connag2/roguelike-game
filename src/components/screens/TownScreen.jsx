import React from 'react';
import { Home, Hammer, Heart, Shield, ArrowLeft } from 'lucide-react';
import coinImg from '../../assets/images/ui/coin.svg';

export default function TownScreen({ 
  setGameState, credits, setCredits, saveGame, townUpgrades, setTownUpgrades 
}) {
  const upgrades = [
    {
      id: 'inn',
      name: '여관 (Inn)',
      desc: '편안한 휴식으로 최대 체력을 증가시킵니다.',
      effect: '레벨당 시작 최대 체력 +5',
      icon: <Heart className="w-8 h-8 text-red-400" />,
      maxLevel: 5,
      costBase: 100,
      costMult: 1.5
    },
    {
      id: 'blacksmith',
      name: '대장간 (Blacksmith)',
      desc: '시작 시 기본 덱의 카드들을 무작위로 강화합니다.',
      effect: '레벨당 시작 시 카드 1장 강화',
      icon: <Hammer className="w-8 h-8 text-orange-400" />,
      maxLevel: 3,
      costBase: 200,
      costMult: 2
    },
    {
      id: 'alchemist',
      name: '연금술사의 집 (Alchemist)',
      desc: '알 수 없는 영약의 힘으로 무작위 버프를 얻고 시작합니다.',
      effect: '레벨당 무작위 버프 1스택 (재생, 통찰, 힘)',
      icon: <Shield className="w-8 h-8 text-emerald-400" />,
      maxLevel: 3,
      costBase: 300,
      costMult: 2
    }
  ];

  const handleUpgrade = (id, cost) => {
    if (credits >= cost) {
      const newCredits = credits - cost;
      const newUpgrades = { ...townUpgrades, [id]: (townUpgrades[id] || 0) + 1 };
      
      setCredits(newCredits);
      setTownUpgrades(newUpgrades);
      saveGame({ credits: newCredits, townUpgrades: newUpgrades });
    }
  };

  return (
    <div className="flex flex-col min-h-[100dvh] bg-slate-950 text-white p-4 relative z-50">
      <div className="max-w-4xl w-full mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Home className="w-8 h-8 text-emerald-500" />
            <h2 className="text-3xl md:text-4xl font-black text-emerald-400 drop-shadow-md">마을 (Town)</h2>
          </div>
          <button onClick={() => setGameState('MENU')} className="py-2 px-4 bg-slate-800 hover:bg-slate-700 transition-colors rounded-lg font-bold border border-slate-600 flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" /> 돌아가기
          </button>
        </div>

        <div className="flex items-center gap-2 bg-yellow-900/50 text-yellow-400 px-4 py-2 rounded-full font-bold mb-8 border border-yellow-700 shadow-inner w-max">
          <img src={coinImg} alt="Coin" className="w-5 h-5 drop-shadow-sm" /> 보유 크레딧: {credits}
        </div>

        <p className="text-slate-300 mb-8">
          크레딧을 소모하여 마을 건물을 건설하고 업그레이드 하세요.<br/>
          마을 업그레이드는 모든 캐릭터의 <span className="text-emerald-400 font-bold">다음 모험에 영구적으로 적용</span>됩니다.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {upgrades.map(upg => {
            const currentLevel = townUpgrades?.[upg.id] || 0;
            const isMax = currentLevel >= upg.maxLevel;
            const nextCost = Math.floor(upg.costBase * Math.pow(upg.costMult, currentLevel));
            const canAfford = credits >= nextCost;

            return (
              <div key={upg.id} className="bg-slate-900 border border-slate-700 rounded-2xl p-5 flex flex-col relative overflow-hidden">
                {isMax && <div className="absolute top-3 right-3 text-xs font-black bg-emerald-600 text-white px-2 py-1 rounded">MAX</div>}
                
                <div className="flex gap-4 items-start mb-4">
                  <div className="bg-slate-800 p-3 rounded-xl border border-slate-600 shadow-inner">
                    {upg.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                      {upg.name} <span className="text-emerald-400 text-sm">Lv.{currentLevel}</span>
                    </h3>
                    <p className="text-sm text-slate-400 mt-1 leading-relaxed">{upg.desc}</p>
                  </div>
                </div>

                <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800 mb-4 flex-1">
                  <span className="text-xs font-bold text-indigo-400">업그레이드 효과</span>
                  <p className="text-sm text-slate-300 mt-1">{upg.effect}</p>
                </div>

                <button 
                  onClick={() => handleUpgrade(upg.id, nextCost)}
                  disabled={isMax || !canAfford}
                  className={`w-full py-3 rounded-xl font-bold flex justify-center items-center gap-2 transition-all shadow-md
                    ${isMax ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                    : canAfford ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(5,150,105,0.4)]' 
                    : 'bg-slate-700 text-slate-400 cursor-not-allowed'}
                  `}
                >
                  {isMax ? '최대 레벨 도달' : (
                    <>
                      업그레이드 <img src={coinImg} alt="C" className="w-4 h-4 opacity-80"/> <span className={canAfford ? 'text-yellow-300' : 'text-red-400'}>{nextCost}</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
