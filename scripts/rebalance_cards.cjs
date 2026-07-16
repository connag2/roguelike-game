const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/constants/gameData.js');
let data = fs.readFileSync(filePath, 'utf-8');

const cardsToRemove = [
    'gamblers_strike', 'sand_throw', 'old_shield', 
    'unstable_bomb', 'lucky_coin', 
    'russian_roulette', 'devils_dice'
];

// Remove cards using regex. We look for `{ id: 'card_id', ... },`
cardsToRemove.forEach(cardId => {
    // Regex matches `{ id: 'cardId', ... },` ignoring whitespace/newlines in between
    const regex = new RegExp(`\\s*\\{\\s*id:\\s*'${cardId}'.*?\\},`, 'gs');
    data = data.replace(regex, '');
});

// Add new common cards right after // 일반 (Common)
const newCommon = `
  { id: 'flame_slash', name: '화염 베기', type: 'attack', cost: 1, rarity: 'common', damage: 6, enemyBurn: 2, desc: '검에 불꽃을 머금고 베어 6의 피해를 주고 화상 2를 부여합니다.' },
  { id: 'frost_arrow', name: '빙결 화살', type: 'attack', cost: 1, rarity: 'common', damage: 5, enemyFrost: 2, desc: '얼어붙은 화살을 쏘아 5의 피해를 주고 동상 2를 부여합니다.' },
  { id: 'frozen_shield', name: '얼어붙은 방패', type: 'skill', cost: 1, rarity: 'common', block: 8, enemyFrost: 1, desc: '냉기를 뿜는 방패를 들어 8의 방어도를 얻고 적에게 동상 1을 부여합니다.' },`;
data = data.replace('// 일반 (Common)', `// 일반 (Common)${newCommon}`);

// Add new uncommon cards right after // 희귀 (Uncommon)
const newUncommon = `
  { id: 'vein_cut', name: '혈관 절개', type: 'attack', cost: 1, rarity: 'uncommon', damage: 7, enemyBleed: 3, desc: '적의 핏줄을 깊게 그어 7의 피해를 주고 출혈 3을 부여합니다.' },
  { id: 'pillar_of_fire', name: '불기둥', type: 'skill', cost: 2, rarity: 'uncommon', enemyBurn: 8, desc: '적의 발밑에서 맹렬한 불기둥을 솟구치게 하여 화상 8을 부여합니다.' },`;
data = data.replace('// 희귀 (Uncommon)', `// 희귀 (Uncommon)${newUncommon}`);

fs.writeFileSync(filePath, data, 'utf-8');
console.log("Cards rebalanced successfully.");
