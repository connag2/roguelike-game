import React, { useState, useEffect } from 'react';
import { Shield, Heart, Zap, Coins, ArrowRight } from 'lucide-react';
import { shuffle } from '../../utils/gameLogic';

const EVENTS = [
  {
    id: 'mystic_shrine',
    title: '신비한 제단',
    desc: '숲의 깊은 곳에서 고대의 에너지가 흐르는 제단을 발견했습니다. 제단은 당신의 생명력을 요구하는 듯 합니다.',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1000&auto=format&fit=crop',
    options: [
      {
        text: '체력을 15 잃고 최대 체력을 10 증가시킵니다.',
        action: (player, deck, credits, setPlayer, setDeck, setCredits, setRelics, relics, setToast) => {
          setPlayer({ ...player, hp: player.hp - 15, maxHp: player.maxHp + 10 });
          setToast('최대 체력이 증가했습니다!');
        },
        req: (player) => player.hp > 15
      },
      {
        text: '체력을 10 잃고 50 크레딧을 얻습니다.',
        action: (player, deck, credits, setPlayer, setDeck, setCredits, setRelics, relics, setToast) => {
          setPlayer({ ...player, hp: player.hp - 10 });
          setCredits(credits + 50);
          setToast('50 크레딧을 획득했습니다!');
        },
        req: (player) => player.hp > 10
      },
      {
        text: '제단을 무시하고 지나갑니다.',
        action: () => {}
      }
    ]
  },
  {
    id: 'wandering_merchant',
    title: '떠돌이 상인',
    desc: '기괴한 가면을 쓴 상인이 짐을 풀고 앉아 있습니다. 그는 당신을 보며 의미심장한 웃음을 짓습니다.',
    image: 'https://images.unsplash.com/photo-1533081014849-c188b8cc8400?q=80&w=1000&auto=format&fit=crop',
    options: [
      {
        text: '30 크레딧을 지불하고 덱의 무작위 카드 1장을 강화합니다.',
        action: (player, deck, credits, setPlayer, setDeck, setCredits, setRelics, relics, setToast) => {
          setCredits(credits - 30);
          const unupgraded = deck.filter(c => !c.name.includes('+'));
          if (unupgraded.length > 0) {
            shuffle(unupgraded);
            unupgraded[0].name += '+';
            if (unupgraded[0].damage) unupgraded[0].damage += 3;
            if (unupgraded[0].block) unupgraded[0].block += 3;
            setDeck([...deck]);
            setToast(`${unupgraded[0].name} 카드가 강화되었습니다!`);
          } else {
            setToast('강화할 카드가 없습니다!');
          }
        },
        req: (player, credits) => credits >= 30
      },
      {
        text: '20 크레딧을 지불하고 체력을 20 회복합니다.',
        action: (player, deck, credits, setPlayer, setDeck, setCredits, setRelics, relics, setToast) => {
          setCredits(credits - 20);
          setPlayer({ ...player, hp: Math.min(player.maxHp, player.hp + 20) });
          setToast('체력을 회복했습니다!');
        },
        req: (player, credits) => credits >= 20
      },
      {
        text: '상인을 지나쳐 길을 재촉합니다.',
        action: () => {}
      }
    ]
  },
  {
    id: 'cursed_treasure',
    title: '저주받은 보물상자',
    desc: '낡은 보물상자에서 불길한 보랏빛 기운이 스며나옵니다. 열면 무언가 끔찍한 대가를 치러야 할 것 같습니다.',
    image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=1000&auto=format&fit=crop',
    options: [
      {
        text: '최대 체력을 10 잃고 100 크레딧을 얻습니다.',
        action: (player, deck, credits, setPlayer, setDeck, setCredits, setRelics, relics, setToast) => {
          setPlayer({ ...player, hp: Math.max(1, player.hp - 10), maxHp: Math.max(10, player.maxHp - 10) });
          setCredits(credits + 100);
          setToast('저주를 받았지만 큰 돈을 얻었습니다!');
        },
        req: (player) => player.maxHp > 20
      },
      {
        text: '보물상자를 건드리지 않습니다.',
        action: () => {}
      }
    ]
  }
];

export default function EventScreen({ combatState, setCombatState, credits, setCredits, saveGame, setToastMsg, setGameState }) {
  const [eventData, setEventData] = useState(null);
  
  useEffect(() => {
    // 무작위 이벤트 선택
    const randomEvent = EVENTS[Math.floor(Math.random() * EVENTS.length)];
    setEventData(randomEvent);
  }, []);

  const handleOption = (option) => {
    let p = { ...combatState.player };
    let d = [ ...combatState.baseDeck ];
    
    option.action(
      p, d, credits, 
      (newPlayer) => { p = newPlayer; },
      (newDeck) => { d = newDeck; },
      (newCredits) => { setCredits(newCredits); saveGame({ credits: newCredits }); },
      null, null,
      (msg) => setToastMsg(msg)
    );

    // 이벤트 종료 후 REWARDS 씬으로 이동하여 다음 전투를 위한 준비 (보상 획득)
    setCombatState({ ...combatState, player: p, baseDeck: d });
    setGameState('REWARDS'); 
  };

  if (!eventData) return null;

  return (
    <div className="flex flex-col h-[100dvh] bg-slate-950 text-white p-4 md:p-8 relative justify-center items-center">
      <div className="absolute inset-0 bg-cover bg-center opacity-20 blur-sm" style={{ backgroundImage: `url(${eventData.image})` }} />
      
      <div className="relative z-10 max-w-2xl w-full bg-slate-900/90 border border-slate-700 rounded-3xl p-6 md:p-10 shadow-2xl backdrop-blur-md">
        <h2 className="text-3xl md:text-4xl font-black text-emerald-400 mb-6 drop-shadow-md text-center">
          {eventData.title}
        </h2>
        
        <p className="text-lg text-slate-300 mb-10 leading-relaxed text-center italic">
          "{eventData.desc}"
        </p>
        
        <div className="flex flex-col gap-4">
          {eventData.options.map((opt, i) => {
            const canAfford = !opt.req || opt.req(combatState.player, credits);
            return (
              <button
                key={i}
                onClick={() => handleOption(opt)}
                disabled={!canAfford}
                className={`py-4 px-6 rounded-xl font-bold flex justify-between items-center transition-all ${
                  canAfford 
                    ? 'bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white shadow-md' 
                    : 'bg-slate-900 border border-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <span>{opt.text}</span>
                {canAfford && <ArrowRight className="w-5 h-5 text-emerald-500" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
