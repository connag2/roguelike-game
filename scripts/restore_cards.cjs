const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/constants/gameData.js');
let data = fs.readFileSync(filePath, 'utf-8');

const gamblers_strike = `  { id: 'gamblers_strike', name: '도박의 일격', type: 'attack', cost: 1, rarity: 'common', gamble: true, gambleWinChance: 0.5, winDamage: 25, loseDamage: 1, desc: '감각에 의존해 운명의 타격을 날립니다. 50% 확률로 25의 피해를 주거나 빗맞아 1의 피해만 줍니다.' },\n`;
const sand_throw = `  { id: 'sand_throw', name: '모래 뿌리기', type: 'skill', cost: 1, rarity: 'common', damage: 3, enemyWeak: 1, desc: '발밑의 흙먼지를 걷어차 눈을 멉니다. 3의 피해를 주고 약화 1을 부여합니다.' },\n`;
const old_shield = `  { id: 'old_shield', name: '낡은 방패', type: 'skill', cost: 0, rarity: 'common', block: 5, desc: '금이 간 낡은 방패를 들어 올려 5의 방어도를 얻습니다.' },\n`;

const unstable_bomb = `  { id: 'unstable_bomb', name: '불안정한 폭약', type: 'attack', cost: 2, rarity: 'uncommon', gamble: true, gambleWinChance: 0.7, winDamage: 35, loseSelfDamage: 15, desc: '심지가 불량한 폭탄을 던집니다. 70% 확률로 35의 피해를 줍니다. 실패 시 내 체력을 15 잃습니다.' },\n`;
const lucky_coin = `  { id: 'lucky_coin', name: '행운의 동전', type: 'skill', cost: 1, rarity: 'uncommon', gamble: true, gambleWinChance: 0.5, winManaGain: 3, desc: '동전을 높이 튕깁니다. 앞면이 나오면 마나를 3 얻습니다. 실패 시 아무 효과도 없습니다.' },\n`;

const russian_roulette = `  { id: 'russian_roulette', name: '러시안 룰렛', type: 'attack', cost: 0, rarity: 'rare', gamble: true, gambleWinChance: 0.16, winDamage: 9999, winDamageBoss: 150, loseDamage: 1, loseDraw: 1, desc: '리볼버의 탄창을 돌리고 방아쇠를 당깁니다. 16% 확률로 적을 즉사시킵니다(보스 150). 실패 시 1의 피해를 줍니다.' },\n`;
const devils_dice = `  { id: 'devils_dice', name: '악마의 주사위', type: 'skill', cost: 2, rarity: 'rare', gamble: true, gambleWinChance: 0.5, winHeal: 50, losePercentMaxHpDamage: 0.2, desc: '영혼을 걸고 주사위를 굴립니다. 50% 확률로 체력을 50 회복합니다. 실패 시 최대 체력의 20%를 잃습니다.' },\n`;

// Append back
data = data.replace('// 희귀 (Uncommon)', `${gamblers_strike}${sand_throw}${old_shield}  // 희귀 (Uncommon)`);
data = data.replace('// 전설 (Rare)', `${unstable_bomb}${lucky_coin}  // 전설 (Rare)`);
data = data.replace('// 특수 (Special)', `${russian_roulette}${devils_dice}  // 특수 (Special)`);

fs.writeFileSync(filePath, data, 'utf-8');
console.log("Restored RNG cards");
