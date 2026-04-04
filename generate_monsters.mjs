import fs from 'fs';
import path from 'path';

// 1. 저장할 폴더 경로 설정 (없으면 자동 생성)
const dir = './src/assets/images/monsters';
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

// 2. 30마리 몬스터의 파일명과 SVG 데이터
const monsters = {
  "slime.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="100%" height="100%" shape-rendering="crispEdges">
  <path fill="#4ade80" d="M6 3h4v2h2v2h1v3h-1v2H4v-2H3V7h1V5h2V3z"/>
  <path fill="#16a34a" d="M4 11h8v1H4v-1z M3 10h1v1H3v-1z M12 10h1v1h-1v-1z"/>
  <path fill="#111827" d="M5 7h2v2H5V7z M9 7h2v2H9V7z"/>
  <path fill="#86efac" d="M5 4h2v1H5V4z M11 6h1v1h-1V6z"/>
</svg>`,

  "bat.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="100%" height="100%" shape-rendering="crispEdges">
  <path fill="#4b5563" d="M7 4h2v5H7V4z M2 3h1v1h1v1h1v1h1v2H5V7H4V6H3V5H2V3z M13 3h1v2h-1v1h-1v1h-1v1h-1V6h1V5h1V4h1V3z"/>
  <path fill="#374151" d="M3 6h1v2h1v1h2v1h2V9h2V8h1V6h1v2h-1v2h-1v1H9v1H7v-1H5v-1H4V6H3z"/>
  <path fill="#ef4444" d="M7 6h1v1H7V6z M9 6h1v1H9V6z"/>
  <path fill="#e5e7eb" d="M7 8h1v1H7V8z M9 8h1v1H9V8z"/>
</svg>`,

  "goblin.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="100%" height="100%" shape-rendering="crispEdges">
  <path fill="#22c55e" d="M6 3h4v4H6V3z M4 4h2v1H4V4z M10 4h2v1h-2V4z M6 10h4v2H6v-2z M5 12h2v2H5v-2z M9 12h2v2H9v-2z"/>
  <path fill="#111827" d="M7 5h1v1H7V5z M9 5h1v1H9V5z M6 7h4v1H6V7z"/>
  <path fill="#b45309" d="M6 8h4v2H6V8z"/>
  <path fill="#9ca3af" d="M12 7h1v4h-1V7z M11 11h3v1h-3v-1z"/>
</svg>`,

  "wolf.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="100%" height="100%" shape-rendering="crispEdges">
  <path fill="#6b7280" d="M4 6h7v4H4V6z M10 4h2v2h-2V4z M11 5h3v2h-3V5z M3 6h1v2H3V6z M4 10h2v3H4v-3z M9 10h2v3H9v-3z M2 7h1v4H2V7z"/>
  <path fill="#4b5563" d="M4 11h1v2H4v-2z M9 11h1v2H9v-2z"/>
  <path fill="#111827" d="M12 6h1v1h-1V6z M13 7h1v1h-1V7z"/>
</svg>`,

  "skeleton.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="100%" height="100%" shape-rendering="crispEdges">
  <path fill="#f3f4f6" d="M6 2h4v4H6V2z M7 6h2v1H7V6z M5 8h6v2H5V8z M7 10h2v2H7v-2z M5 12h2v3H5v-3z M9 12h2v3H9v-3z M4 8h1v3H4V8z M11 8h1v3h-1V8z"/>
  <path fill="#111827" d="M7 4h1v1H7V4z M9 4h1v1H9V4z M7 7h2v1H7V7z"/>
  <path fill="#9ca3af" d="M12 5h1v6h-1V5z M11 10h3v1h-3v-1z"/>
</svg>`,

  "ghost.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="100%" height="100%" shape-rendering="crispEdges">
  <path fill="#e0f2fe" d="M6 2h4v1H6V2z M5 3h6v1H5V3z M4 4h8v7H4V4z M4 11h1v2H4v-2z M6 11h1v2H6v-2z M8 11h1v2H8v-2z M10 11h1v2h-1v-2z M3 6h1v3H3V6z M12 6h1v3h-1V6z"/>
  <path fill="#111827" d="M6 6h1v2H6V6z M9 6h1v2H9V6z M7 9h2v1H7V9z"/>
</svg>`,

  "orc.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="100%" height="100%" shape-rendering="crispEdges">
  <path fill="#15803d" d="M6 2h4v4H6V2z M5 6h6v4H5V6z M4 6h1v3H4V6z M11 6h1v3h-1V6z M6 10h4v2H6v-2z M5 12h2v3H5v-3z M9 12h2v3H9v-3z"/>
  <path fill="#111827" d="M7 4h1v1H7V4z M9 4h1v1H9V4z"/>
  <path fill="#f3f4f6" d="M6 6h1v1H6V6z M9 6h1v1H9V6z"/>
  <path fill="#78350f" d="M5 8h6v2H5V8z M12 4h1v8h-1V4z M13 4h2v3h-2V4z"/>
</svg>`,

  "spider.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="100%" height="100%" shape-rendering="crispEdges">
  <path fill="#111827" d="M6 6h4v4H6V6z M5 7h1v2H5V7z M10 7h1v2h-1V7z M4 5h1v1H4V5z M3 6h1v1H3V6z M2 7h1v1H2V7z M11 5h1v1h-1V5z M12 6h1v1h-1V6z M13 7h1v1h-1V7z M4 10h1v1H4v-1z M3 9h1v1H3V9z M2 8h1v1H2V8z M11 10h1v1h-1v-1z M12 9h1v1h-1V9z M13 8h1v1h-1V8z M5 10h1v2H5v-2z M10 10h1v2h-1v-2z M4 12h1v2H4v-2z M11 12h1v2h-1v-2z"/>
  <path fill="#dc2626" d="M7 8h1v1H7V8z M9 8h1v1H9V8z"/>
</svg>`,

  "cultist.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="100%" height="100%" shape-rendering="crispEdges">
  <path fill="#4c1d95" d="M6 2h4v4H6V2z M5 6h6v8H5V6z M4 7h1v3H4V7z M11 7h1v3h-1V7z"/>
  <path fill="#111827" d="M7 4h2v2H7V4z"/>
  <path fill="#fbbf24" d="M7 5h1v1H7V5z M9 5h1v1H9V5z M6 8h4v1H6V8z M7 9h2v3H7V9z"/>
</svg>`,

  "gargoyle.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="100%" height="100%" shape-rendering="crispEdges">
  <path fill="#6b7280" d="M6 3h4v3H6V3z M5 6h6v4H5V6z M6 10h4v2H6v-2z M5 12h2v3H5v-3z M9 12h2v3H9v-3z M4 6h1v3H4V6z M11 6h1v3h-1V6z M3 4h2v2H3V4z M11 4h2v2h-2V4z M2 3h1v2H2V3z M13 3h1v2h-1V3z"/>
  <path fill="#111827" d="M7 4h1v1H7V4z M9 4h1v1H9V4z M4 3h1v1H4V3z M11 3h1v1h-1V3z"/>
  <path fill="#4b5563" d="M5 8h6v1H5V8z M4 12h8v1H4v-1z"/>
</svg>`,

  "mudman.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="100%" height="100%" shape-rendering="crispEdges">
  <path fill="#78350f" d="M5 3h5v2h2v5h-1v2h-2v3h-3v-3h-2v-2h-1v-4h2V3z"/>
  <path fill="#92400e" d="M6 4h3v1H6V4z M9 8h2v1H9V8z M4 9h2v1H4V9z"/>
  <path fill="#111827" d="M6 6h1v1H6V6z M9 6h1v1H9V6z M7 9h2v1H7V9z"/>
</svg>`,

  "mimic.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="100%" height="100%" shape-rendering="crispEdges">
  <path fill="#b45309" d="M3 5h10v6H3V5z"/>
  <path fill="#fbbf24" d="M3 5h10v1H3V5z M3 10h10v1H3v-1z M3 6h1v4H3V6z M12 6h1v4h-1V6z M7 6h2v2H7V6z"/>
  <path fill="#111827" d="M4 7h8v2H4V7z"/>
  <path fill="#f3f4f6" d="M4 7h1v1H4V7z M6 7h1v1H6V7z M8 7h1v1H8V7z M10 7h1v1h-1V7z M5 8h1v1H5V8z M7 8h1v1H7V8z M9 8h1v1H9V8z M11 8h1v1h-1V8z"/>
</svg>`,

  "banshee.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="100%" height="100%" shape-rendering="crispEdges">
  <path fill="#a78bfa" d="M6 2h4v3H6V2z M5 5h6v4H5V5z M4 9h8v3H4V9z M3 12h10v2H3v-2z M2 14h12v2H2v-2z M4 6h1v3H4V6z M11 6h1v3h-1V6z"/>
  <path fill="#111827" d="M6 4h1v2H6V4z M9 4h1v2H9V4z M7 7h2v3H7V7z"/>
</svg>`,

  "golem.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="100%" height="100%" shape-rendering="crispEdges">
  <path fill="#9ca3af" d="M5 2h6v3H5V2z M3 5h10v5H3V5z M4 10h8v2H4v-2z M5 12h2v3H5v-3z M9 12h2v3H9v-3z M2 5h1v4H2V5z M13 5h1v4h-1V5z M1 6h1v2H1V6z M14 6h1v2h-1V6z"/>
  <path fill="#4b5563" d="M6 4h4v1H6V4z M5 7h6v1H5V7z M6 10h4v1H6v-1z"/>
  <path fill="#3b82f6" d="M6 3h1v1H6V3z M9 3h1v1H9V3z M7 5h2v1H7V5z"/>
</svg>`,

  "centaur.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="100%" height="100%" shape-rendering="crispEdges">
  <path fill="#fcd34d" d="M6 2h3v3H6V2z M6 5h3v3H6V5z"/>
  <path fill="#111827" d="M7 3h1v1H7V3z"/>
  <path fill="#b45309" d="M4 8h7v4H4V8z M4 12h2v4H4v-4z M9 12h2v4H9v-4z M11 9h2v1h-2V9z M12 10h1v3h-1v-3z"/>
  <path fill="#9ca3af" d="M10 4h1v7h-1V4z M9 5h3v1H9V5z M11 10h2v1h-2v-1z"/>
</svg>`,

  "fire_elemental.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="100%" height="100%" shape-rendering="crispEdges">
  <path fill="#ef4444" d="M7 2h2v1H7V2z M6 3h4v1H6V3z M5 4h6v2H5V4z M4 6h8v5H4V6z M5 11h6v2H5v-2z M6 13h4v1H6v-1z"/>
  <path fill="#f59e0b" d="M7 5h2v1H7V5z M6 6h4v4H6V6z M7 10h2v1H7v-1z"/>
  <path fill="#fbbf24" d="M7 7h2v2H7V7z"/>
  <path fill="#111827" d="M5 7h1v1H5V7z M10 7h1v1h-1V7z"/>
</svg>`,

  "water_elemental.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="100%" height="100%" shape-rendering="crispEdges">
  <path fill="#3b82f6" d="M7 2h2v2H7V2z M6 4h4v2H6V4z M5 6h6v2H5V6z M4 8h8v4H4V8z M3 12h10v2H3v-2z"/>
  <path fill="#93c5fd" d="M7 5h2v2H7V5z M6 7h4v3H6V7z M7 10h2v1H7v-1z M4 13h8v1H4v-1z"/>
  <path fill="#1e3a8a" d="M5 9h1v1H5V9z M10 9h1v1h-1V9z M7 11h2v1H7v-1z"/>
</svg>`,

  "succubus.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="100%" height="100%" shape-rendering="crispEdges">
  <path fill="#fca5a5" d="M6 3h4v3H6V3z M6 7h4v2H6V7z M5 9h6v3H5V9z M6 12h1v3H6v-3z M9 12h1v3H9v-3z"/>
  <path fill="#a855f7" d="M5 2h2v1H5V2z M9 2h2v1H9V2z M3 6h2v1H3V6z M2 7h2v1H2V7z M11 6h2v1h-2V6z M12 7h2v1h-2V7z M4 10h1v1H4v-1z M11 10h1v1h-1v-1z"/>
  <path fill="#111827" d="M6 8h4v1H6V8z M5 3h1v3H5V3z M10 3h1v3h-1V3z"/>
  <path fill="#ec4899" d="M7 5h1v1H7V5z M9 5h1v1H9V5z M7 10h2v1H7v-1z"/>
</svg>`,

  "dullahan.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="100%" height="100%" shape-rendering="crispEdges">
  <path fill="#1f2937" d="M5 4h6v6H5V4z M4 6h1v4H4V6z M11 6h1v4h-1V6z M6 10h4v2H6v-2z M5 12h2v3H5v-3z M9 12h2v3H9v-3z"/>
  <path fill="#374151" d="M6 5h4v1H6V5z M5 7h6v1H5V7z M7 10h2v2H7v-2z"/>
  <path fill="#ea580c" d="M1 5h3v3H1V5z"/>
  <path fill="#fcd34d" d="M1 6h1v1H1V6z M3 6h1v1H3V6z M2 7h1v1H2V7z M14 2h1v9h-1V2z M13 3h3v1h-3V3z"/>
  <path fill="#991b1b" d="M7 4h2v1H7V4z"/>
</svg>`,

  "vampire_hunter.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="100%" height="100%" shape-rendering="crispEdges">
  <path fill="#b45309" d="M4 3h8v1H4V3z M5 2h6v1H5V2z M4 7h8v5H4V7z M3 8h1v3H3V8z M12 8h1v3h-1V8z"/>
  <path fill="#fca5a5" d="M6 4h4v3H6V4z"/>
  <path fill="#111827" d="M5 12h2v3H5v-3z M9 12h2v3H9v-3z M6 5h1v1H6V5z M9 5h1v1H9V5z M1 8h2v1H1V8z M13 8h2v1h-2V8z M14 7h1v1h-1V7z"/>
  <path fill="#f3f4f6" d="M7 7h2v5H7V7z"/>
</svg>`,

  "lizardman.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="100%" height="100%" shape-rendering="crispEdges">
  <path fill="#22c55e" d="M6 3h4v4H6V3z M5 7h6v4H5V7z M6 11h4v2H6v-2z M5 13h2v2H5v-2z M9 13h2v2H9v-2z M11 8h2v1h-2V8z M12 9h2v1h-2V9z M13 10h2v1h-2v-1z M14 11h2v1h-2v-1z"/>
  <path fill="#16a34a" d="M5 4h1v3H5V4z M4 5h1v2H4V5z M3 6h1v2H3V6z"/>
  <path fill="#111827" d="M7 5h1v1H7V5z M10 5h1v1h-1V5z"/>
  <path fill="#fcd34d" d="M7 8h2v3H7V8z"/>
</svg>`,

  "harpy.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="100%" height="100%" shape-rendering="crispEdges">
  <path fill="#fca5a5" d="M6 3h4v3H6V3z M6 7h4v2H6V7z"/>
  <path fill="#eab308" d="M5 6h1v2H5V6z M4 7h1v2H4V7z M3 8h1v2H3V8z M10 6h1v2h-1V6z M11 7h1v2h-1V7z M12 8h1v2h-1V8z"/>
  <path fill="#c2410c" d="M5 9h6v3H5V9z M7 12h2v3H7v-3z M6 14h1v1H6v-1z M9 14h1v1H9v-1z M5 2h6v1H5V2z M4 3h1v2H4V3z M11 3h1v2h-1V3z"/>
  <path fill="#111827" d="M7 5h1v1H7V5z M9 5h1v1H9V5z M2 9h1v1H2V9z M13 9h1v1h-1V9z"/>
</svg>`,

  "mandragora.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="100%" height="100%" shape-rendering="crispEdges">
  <path fill="#15803d" d="M7 1h2v3H7V1z M5 2h2v1H5V2z M9 2h2v1H9V2z M4 3h1v1H4V3z M11 3h1v1h-1V3z M8 4h1v3H8V4z"/>
  <path fill="#d97706" d="M6 6h4v4H6V6z M5 7h1v2H5V7z M10 7h1v2h-1V7z M6 10h4v2H6v-2z M5 11h1v3H5v-3z M10 11h1v3h-1v-3z M7 12h2v3H7v-3z"/>
  <path fill="#111827" d="M7 8h1v1H7V8z M9 8h1v1H9V8z M7 10h2v1H7v-1z"/>
</svg>`,

  "troll.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="100%" height="100%" shape-rendering="crispEdges">
  <path fill="#166534" d="M5 2h5v4H5V2z M4 5h7v5H4V5z M3 6h1v3H3V6z M11 6h1v3h-1V6z M4 10h6v3H4v-3z M4 13h2v2H4v-2z M8 13h2v2H8v-2z"/>
  <path fill="#111827" d="M6 4h1v1H6V4z M8 4h1v1H8V4z M6 7h3v1H6V7z"/>
  <path fill="#78350f" d="M12 2h2v7h-2V2z M11 8h1v1h-1V8z"/>
  <path fill="#8b5cf6" d="M4 10h6v1H4v-1z M5 11h4v1H5v-1z"/>
</svg>`,

  "grim_reaper.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="100%" height="100%" shape-rendering="crispEdges">
  <path fill="#111827" d="M5 2h6v5H5V2z M4 5h8v8H4V5z M3 7h1v5H3V7z M12 7h1v5h-1V7z M5 13h6v2H5v-2z M4 14h1v2H4v-2z M11 14h1v2h-1v-2z"/>
  <path fill="#9ca3af" d="M14 1h1v4h-1V1z M11 1h3v1h-3V1z M12 2h1v1h-1V2z M13 5h1v10h-1V5z"/>
  <path fill="#fbbf24" d="M7 4h1v1H7V4z M9 4h1v1H9V4z"/>
</svg>`,

  "cockatrice.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="100%" height="100%" shape-rendering="crispEdges">
  <path fill="#ca8a04" d="M5 3h3v3H5V3z M6 6h4v4H6V6z M5 7h1v2H5V7z M10 7h1v2h-1V7z M4 8h1v2H4V8z M11 8h1v2h-1V8z M6 10h4v2H6v-2z M7 12h2v2H7v-2z"/>
  <path fill="#b91c1c" d="M5 1h2v2H5V1z M4 2h1v1H4V2z M6 4h1v1H6V4z"/>
  <path fill="#111827" d="M7 4h1v1H7V4z"/>
  <path fill="#22c55e" d="M12 9h2v1h-2V9z M13 10h2v1h-2v-1z M14 11h2v1h-2v-1z"/>
</svg>`,

  "dark_knight.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="100%" height="100%" shape-rendering="crispEdges">
  <path fill="#1f2937" d="M6 2h4v4H6V2z M5 5h6v4H5V5z M4 6h1v3H4V6z M11 6h1v3h-1V6z M5 9h6v3H5V9z M5 12h2v3H5v-3z M9 12h2v3H9v-3z"/>
  <path fill="#4b5563" d="M7 3h2v1H7V3z M6 6h4v1H6V6z M6 8h4v1H6V8z M7 10h2v2H7v-2z"/>
  <path fill="#991b1b" d="M7 5h1v1H7V5z M9 5h1v1H9V5z M6 2h1v1H6V2z M9 2h1v1H9V2z"/>
  <path fill="#d1d5db" d="M13 1h1v10h-1V1z M12 2h3v1h-3V2z M12 3h1v1h-1V3z M14 3h1v1h-1V3z M12 11h3v1h-3v-1z"/>
</svg>`,

  "illusionist.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="100%" height="100%" shape-rendering="crispEdges">
  <path fill="#7e22ce" d="M6 2h4v3H6V2z M5 5h6v8H5V5z M4 6h1v4H4V6z M11 6h1v4h-1V6z"/>
  <path fill="#c084fc" d="M6 6h4v1H6V6z M7 7h2v5H7V7z M5 13h6v2H5v-2z M2 8h2v2H2V8z M12 8h2v2h-2V8z M3 7h1v1H3V7z M12 7h1v1h-1V7z"/>
  <path fill="#fca5a5" d="M7 4h2v1H7V4z"/>
  <path fill="#111827" d="M7 4h1v1H7V4z M9 4h1v1H9V4z"/>
</svg>`,

  "demon_rat.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="100%" height="100%" shape-rendering="crispEdges">
  <path fill="#52525b" d="M5 8h6v3H5V8z M4 9h1v2H4V9z M11 9h2v2h-2V9z M5 11h6v2H5v-2z M6 13h1v2H6v-2z M9 13h1v2H9v-2z M13 10h2v1h-2v-1z M14 11h2v1h-2v-1z M15 12h1v2h-1v-2z"/>
  <path fill="#3f3f46" d="M4 6h2v2H4V6z M10 6h2v2h-2V6z M6 7h4v1H6V7z"/>
  <path fill="#ef4444" d="M5 7h1v1H5V7z M10 7h1v1h-1V7z M4 5h1v1H4V5z M11 5h1v1h-1V5z"/>
  <path fill="#fca5a5" d="M4 10h1v1H4v-1z M11 10h1v1h-1v-1z M7 12h2v1H7v-1z"/>
</svg>`,

  "bomb_goblin.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="100%" height="100%" shape-rendering="crispEdges">
  <path fill="#22c55e" d="M7 2h3v3H7V2z M6 3h1v1H6V3z M10 3h1v1h-1V3z M7 8h3v2H7V8z M8 10h1v2H8v-2z M6 12h1v2H6v-2z M10 12h1v2h-1v-2z"/>
  <path fill="#111827" d="M8 4h1v1H8V4z M7 6h3v1H7V6z M2 7h4v4H2V7z M1 8h1v2H1V8z M6 8h1v2H6V8z M3 11h2v1H3v-1z M3 6h2v1H3V6z"/>
  <path fill="#9ca3af" d="M3 5h1v1H3V5z M4 4h1v1H4V4z"/>
  <path fill="#f59e0b" d="M5 3h1v1H5V3z M4 2h1v1H4V2z M6 2h1v1H6V2z M5 1h1v1H5V1z"/>
</svg>`
};

// 3. 파일 자동 생성 루프
for (const [fileName, content] of Object.entries(monsters)) {
  fs.writeFileSync(path.join(dir, fileName), content.trim());
  console.log(`✅ ${fileName} 생성 완료!`);
}

console.log(`🎉 총 ${Object.keys(monsters).length}개의 몬스터 도트가 성공적으로 폴더에 저장되었습니다!`);