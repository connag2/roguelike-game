import React, { useMemo } from 'react';

export default function WeatherLayer({ stage }) {
  const particles = useMemo(() => {
    const count = 30; // 화면에 렌더링할 파티클 개수
    const arr = [];
    
    // 층수(Biome)에 따른 날씨 결정
    let biome = 'plains';
    if (stage > 80) biome = 'void';
    else if (stage > 60) biome = 'volcano';
    else if (stage > 40) biome = 'snow';
    else if (stage > 20) biome = 'desert';

    for (let i = 0; i < count; i++) {
      const left = Math.random() * 100;
      const animationDuration = 5 + Math.random() * 10;
      const animationDelay = Math.random() * -10;
      const size = 0.5 + Math.random() * 1.5;

      let style = {
        left: `${left}vw`,
        animationDuration: `${animationDuration}s`,
        animationDelay: `${animationDelay}s`,
        width: `${size}rem`,
        height: `${size}rem`,
      };

      let className = "absolute rounded-full pointer-events-none opacity-60 z-0 ";
      
      switch (biome) {
        case 'plains':
          className += "bg-emerald-400 particle-fall";
          style.borderRadius = "0 50% 50% 50%"; // 나뭇잎 모양
          style.width = `${size * 0.5}rem`;
          style.height = `${size}rem`;
          break;
        case 'desert':
          className += "bg-yellow-600 particle-blow";
          style.width = `${size * 0.2}rem`;
          style.height = `${size * 0.2}rem`;
          break;
        case 'snow':
          className += "bg-white particle-fall blur-[1px]";
          break;
        case 'volcano':
          className += "bg-red-500 particle-float blur-[1px]";
          style.boxShadow = "0 0 10px 2px rgba(239,68,68,0.8)";
          style.width = `${size * 0.3}rem`;
          style.height = `${size * 0.3}rem`;
          break;
        case 'void':
          className += "bg-indigo-300 particle-float";
          style.boxShadow = "0 0 8px 1px rgba(165,180,252,0.8)";
          style.width = `${size * 0.2}rem`;
          style.height = `${size * 0.2}rem`;
          break;
        default:
          break;
      }

      arr.push(<div key={i} style={style} className={className} />);
    }
    return arr;
  }, [stage]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden mix-blend-screen">
      {particles}
    </div>
  );
}
