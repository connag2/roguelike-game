import fs from 'fs';
import path from 'path';

// 1. 저장할 폴더 경로 설정 (없으면 자동 생성)
const dir = './src/assets/images/monsters';
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

// 2. 30마리 몬스터의 파일명과 SVG 데이터
const monsters = {

  "boss_king_slime.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="100%" height="100%" shape-rendering="crispEdges">
  <path fill="#f59e0b" d="M20 8h4v12h-4z M40 8h4v12h-4z M30 4h4v16h-4z"/>
  <path fill="#fbbf24" d="M22 10h24v10H22z M28 6h8v4h-8z"/>
  <path fill="#22c55e" d="M16 28h32v4H16z M12 32h40v8H12z M8 40h48v16H8z M12 56h40v4H12z"/>
  <path fill="#16a34a" d="M8 50h48v6H8z M12 56h40v4H12z"/>
  <path fill="#4ade80" d="M16 30h8v4h-8z M12 36h6v6h-6z M28 26h12v4H28z"/>
  <path fill="#ffffff" opacity="0.6" d="M30 36h4v4h-4z M28 42h8v2h-8z M32 44h2v6h-2z"/>
  <path fill="#111827" d="M20 44h6v6h-6z M38 44h6v6h-6z M28 52h8v4h-8z"/>
  <path fill="#ffffff" opacity="0.8" d="M22 46h2v2h-2z M40 46h2v2h-2z"/>
</svg>`,

  "boss_lich.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="100%" height="100%" shape-rendering="crispEdges">
  <path fill="#8b5cf6" opacity="0.3" d="M8 8h48v48H8z"/>
  <path fill="#a855f7" opacity="0.5" d="M16 16h32v32H16z"/>
  <path fill="#3b0764" d="M24 16h16v8H24z M20 24h24v12H20z M16 36h32v24H16z"/>
  <path fill="#581c87" d="M22 36h20v24H22z"/>
  <path fill="#7e22ce" d="M26 14h12v4H26z M18 36h6v12h-6z M40 36h6v12h-6z"/>
  <path fill="#e5e7eb" d="M26 22h12v10H26z"/>
  <path fill="#9ca3af" d="M28 32h8v4h-8z"/>
  <path fill="#111827" d="M28 26h2v2h-2z M34 26h2v2h-2z M30 30h4v2h-4z"/>
  <path fill="#06b6d4" d="M28 26h1v1h-1z M34 26h1v1h-1z"/>
  <path fill="#78350f" d="M46 16h4v48h-4z"/>
  <path fill="#22d3ee" d="M44 8h8v8h-8z"/>
  <path fill="#67e8f9" d="M46 10h4v4h-4z"/>
</svg>`,

  "boss_orc_warlord.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="100%" height="100%" shape-rendering="crispEdges">
  <path fill="#14532d" d="M20 24h24v16H20z M16 32h32v12H16z M22 48h20v12H22z"/>
  <path fill="#166534" d="M24 24h16v16H24z"/>
  <path fill="#1f2937" d="M12 30h10v12H12z M42 30h10v12H42z M20 40h24v8H20z M24 48h16v4H24z"/>
  <path fill="#374151" d="M14 28h6v4h-6z M44 28h6v4h-6z"/>
  <path fill="#15803d" d="M26 16h12v10H26z"/>
  <path fill="#111827" d="M28 20h2v2h-2z M34 20h2v2h-2z M28 24h8v2h-8z"/>
  <path fill="#f3f4f6" d="M28 24v-4h-2v4z M36 24v-4h2v4z"/> 
  <path fill="#78350f" d="M16 12h4v48h-4z"/>
  <path fill="#4b5563" d="M8 16h20v12H8z M12 12h12v4H12z M12 28h12v4H12z"/>
  <path fill="#9ca3af" d="M6 18h18v8H6z"/>
  <path fill="#dc2626" d="M6 18h4v4H6z M8 22h4v2H8z"/>
</svg>`,

  "boss_dragon.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="100%" height="100%" shape-rendering="crispEdges">
  <path fill="#7f1d1d" d="M4 12h16v16H4z M44 12h16v16H44z"/>
  <path fill="#991b1b" d="M8 8h12v12H8z M44 8h12v12H44z M0 20h20v12H0z M44 20h20v12H44z"/>
  <path fill="#450a0a" d="M12 12h2v16h-2z M50 12h2v16h-2z"/>
  <path fill="#b91c1c" d="M24 24h16v28H24z M20 32h24v16H20z M28 52h8v8h-8z"/>
  <path fill="#dc2626" d="M26 26h12v20H26z"/>
  <path fill="#fcd34d" d="M28 30h8v16h-8z"/>
  <path fill="#fbbf24" d="M30 32h4v12h-4z"/>
  <path fill="#f59e0b" d="M24 12h4v8h-4z M36 12h4v8h-4z"/>
  <path fill="#b91c1c" d="M26 16h12v12H26z M22 20h20v8H22z"/>
  <path fill="#fef08a" d="M28 22h2v2h-2z M34 22h2v2h-2z"/>
  <path fill="#000000" d="M29 22h1v2h-1z M35 22h1v2h-1z M30 26h4v2h-4z"/>
  <path fill="#ef4444" d="M30 28h4v8h-4z M28 36h8v8h-8z M26 44h12v12H26z"/>
  <path fill="#f97316" d="M30 32h4v6h-4z M28 38h8v10h-8z"/>
  <path fill="#fef08a" d="M30 40h4v6h-4z"/>
</svg>`,

  "boss_arch_demon.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="100%" height="100%" shape-rendering="crispEdges">
  <path fill="#111827" d="M4 16h20v16H4z M40 16h20v16H40z M0 24h16v16H0z M48 24h16v16H48z"/>
  <path fill="#1f2937" d="M8 20h12v12H8z M44 20h12v12H44z"/>
  <path fill="#7f1d1d" d="M24 24h16v24H24z M20 32h24v12H20z M28 48h8v12h-8z"/>
  <path fill="#991b1b" d="M26 26h12v16H26z M28 30h8v8h-8z"/>
  <path fill="#111827" d="M22 8h4v12h-4z M38 8h4v12h-4z M20 12h4v8h-4z M40 12h4v8h-4z"/>
  <path fill="#991b1b" d="M26 16h12v12H26z"/>
  <path fill="#ef4444" d="M28 20h2v2h-2z M34 20h2v2h-2z"/>
  <path fill="#f97316" d="M28 20h1v1h-1z M34 20h1v1h-1z"/>
  <path fill="#111827" d="M30 24h4v2h-4z"/>
  <path fill="#ef4444" d="M16 56h32v8H16z M20 52h24v4H20z"/>
  <path fill="#f97316" d="M24 58h16v6H24z"/>
</svg>`

};

// 3. 파일 자동 생성 루프
for (const [fileName, content] of Object.entries(monsters)) {
  fs.writeFileSync(path.join(dir, fileName), content.trim());
  console.log(`✅ ${fileName} 생성 완료!`);
}

console.log(`🎉 총 ${Object.keys(monsters).length}개의 몬스터 도트가 성공적으로 폴더에 저장되었습니다!`);