const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/constants/gameData.js');
let data = fs.readFileSync(filePath, 'utf-8');

// Buffs
// 1. 돌진 (dash): cost 2, damage 12, block 12 -> damage 16, block 16
data = data.replace(
    /{ id: 'dash', name: '돌진', type: 'attack', cost: 2, rarity: 'uncommon', damage: 12, block: 12, desc: '방패를 앞세워 맹렬히 돌격합니다. 12의 피해를 주고 12의 방어도를 얻습니다.' },/,
    `{ id: 'dash', name: '돌진', type: 'attack', cost: 2, rarity: 'uncommon', damage: 16, block: 16, desc: '방패를 앞세워 맹렬히 돌격합니다. 16의 피해를 주고 16의 방어도를 얻습니다.' },`
);

// 2. 분쇄 (smash): cost 2, damage 14, draw 1 -> damage 18
data = data.replace(
    /{ id: 'smash', name: '분쇄', type: 'attack', cost: 2, rarity: 'uncommon', damage: 14, draw: 1, desc: '적의 장갑을 찌그러뜨리며 강하게 내리쳐 14의 피해를 주고 카드를 1장 뽑습니다.' },/,
    `{ id: 'smash', name: '분쇄', type: 'attack', cost: 2, rarity: 'uncommon', damage: 18, draw: 1, desc: '적의 장갑을 찌그러뜨리며 강하게 내리쳐 18의 피해를 주고 카드를 1장 뽑습니다.' },`
);

// 3. 선봉장 (vanguard): cost 2, damage 8, block 16 -> damage 14
data = data.replace(
    /{ id: 'vanguard', name: '선봉장', type: 'attack', cost: 2, rarity: 'uncommon', damage: 8, block: 16, desc: '적진 한가운데로 뛰어들어 진형을 붕괴시킵니다. 8의 피해를 주고 16의 방어도를 얻습니다.' },/,
    `{ id: 'vanguard', name: '선봉장', type: 'attack', cost: 2, rarity: 'uncommon', damage: 14, block: 16, desc: '적진 한가운데로 뛰어들어 진형을 붕괴시킵니다. 14의 피해를 주고 16의 방어도를 얻습니다.' },`
);

// 4. 불구 만들기 (crippling_strike): cost 2, damage 8, enemyWeak 2, enemyFrail 2 -> damage 14
data = data.replace(
    /{ id: 'crippling_strike', name: '불구 만들기', type: 'attack', cost: 2, rarity: 'uncommon', damage: 8, enemyWeak: 2, enemyFrail: 2, desc: '아킬레스건을 노려 베어내 8의 피해를 주고 약화 2, 허약 2를 부여합니다.' },/,
    `{ id: 'crippling_strike', name: '불구 만들기', type: 'attack', cost: 2, rarity: 'uncommon', damage: 14, enemyWeak: 2, enemyFrail: 2, desc: '아킬레스건을 노려 베어내 14의 피해를 주고 약화 2, 허약 2를 부여합니다.' },`
);

// 5. 흡혈의 일격 (vampiric_strike): cost 2, damage 12, heal 6 -> damage 18, heal 8
data = data.replace(
    /{ id: 'vampiric_strike', name: '흡혈의 일격', type: 'attack', cost: 2, rarity: 'uncommon', damage: 12, heal: 6, desc: '적의 생명력을 강제로 뜯어내어 12의 피해를 주고 체력을 6 회복합니다.' },/,
    `{ id: 'vampiric_strike', name: '흡혈의 일격', type: 'attack', cost: 2, rarity: 'uncommon', damage: 18, heal: 8, desc: '적의 생명력을 강제로 뜯어내어 18의 피해를 주고 체력을 8 회복합니다.' },`
);

// 6. 뼈 분쇄 (bone_shatter): cost 2, damage 12, frail 2 -> damage 18
data = data.replace(
    /{ id: 'bone_shatter', name: '뼈 분쇄', type: 'attack', cost: 2, rarity: 'uncommon', damage: 12, enemyFrail: 2, desc: '망치로 뼈를 부숴버려 12의 피해를 주고 허약 2를 부여합니다.' },/,
    `{ id: 'bone_shatter', name: '뼈 분쇄', type: 'attack', cost: 2, rarity: 'uncommon', damage: 18, enemyFrail: 2, desc: '망치로 뼈를 부숴버려 18의 피해를 주고 허약 2를 부여합니다.' },`
);

// Deletions & Replacements
// focus_fire -> ice_spike (Uncommon)
data = data.replace(
    /{ id: 'focus_fire', name: '집중 사격', type: 'attack', cost: 2, rarity: 'uncommon', damage: 10, enemyMark: 3, desc: '한 점을 정확히 꿰뚫어 10의 피해를 주고 표식 3을 부여합니다.' },/,
    `{ id: 'ice_spike', name: '얼음 쐐기', type: 'attack', cost: 2, rarity: 'uncommon', damage: 18, enemyFrost: 3, desc: '거대한 얼음 쐐기를 박아넣어 18의 피해를 주고 동상 3을 부여합니다.' },`
);

// bone_crush (Wait, bone_crush is Common, not Uncommon!)
// Let's replace bone_crush with heatwave (Uncommon? I'll just put heatwave in Common to replace it exactly)
data = data.replace(
    /{ id: 'bone_crush', name: '뼈 부수기', type: 'attack', cost: 2, rarity: 'common', damage: 12, enemyVuln: 1, desc: '무게중심을 실어 관절을 부수듯 타격합니다. 12의 피해를 주고 취약 1을 부여합니다.' },/,
    `{ id: 'heatwave', name: '폭염파', type: 'attack', cost: 2, rarity: 'common', damage: 16, enemyBurn: 8, desc: '주변의 공기를 불태워 16의 피해를 주고 화상 8을 부여합니다.' },`
);

// throat_chop -> blood_exploit (Rare)
data = data.replace(
    /{ id: 'throat_chop', name: '목 찌르기', type: 'attack', cost: 2, rarity: 'rare', damage: 8, enemySilence: 1, desc: '손날로 정확히 성대를 강타해 8의 피해를 주고 침묵 1을 부여합니다. \\(적 스킬 봉인\\)' },/,
    `{ id: 'blood_exploit', name: '피의 착취', type: 'attack', cost: 2, rarity: 'rare', damage: 24, enemyBleed: 5, heal: 10, desc: '적의 생명줄을 베어내 24의 피해를 주고 출혈 5를 부여하며, 흘러나온 피를 흡수해 체력을 10 회복합니다.' },`
);

fs.writeFileSync(filePath, data, 'utf-8');
console.log("Buffs and replacements applied.");
