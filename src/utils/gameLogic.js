import { CARD_LIBRARY, ENEMIES, NORMAL_BOSSES, SPECIAL_BOSSES, MANA_CARD_IDS, GAME_RULES } from '../constants/gameData';

// 1. 배열 섞기
export const shuffle = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// 2. 수치 감소 로직 (비례 감소)
export const decayStack = (val) => {
  if (!val || val <= 0) return 0;
  let drop = 1;
  if (val >= 10) drop = Math.floor(val / 3);
  else if (val >= 5) drop = 2;
  return Math.max(0, val - drop);
};

// 3. 카드 정보 가져오기 (강화 수치 포함)
export const getCardDef = (id, shopUpgrades) => {
  if (!id) return null;
  const base = CARD_LIBRARY.find(c => c.id === id);
  if (!base) return null;

  const upgradeLevel = (shopUpgrades?.upgradedCards || []).filter(cId => cId === id).length;
  if (upgradeLevel <= 0) return base;

  let ratePerLevel = 0.4; 
  if (base.rarity === 'common') ratePerLevel = 0.3; 
  else if (base.rarity === 'uncommon') ratePerLevel = 0.4; 
  else if (base.rarity === 'rare') ratePerLevel = 0.6; 
  else if (base.rarity === 'special') ratePerLevel = 0.7; 

  const multiplier = 1 + (ratePerLevel * upgradeLevel); 
  const upgraded = { ...base, name: `${base.name} +${upgradeLevel}`, isUpgraded: true, upgradeLevel };

  if (upgraded.damage) upgraded.damage = Math.ceil(base.damage * multiplier);
  if (upgraded.block) upgraded.block = Math.ceil(base.block * multiplier);
  if (upgraded.heal) upgraded.heal = Math.ceil(base.heal * multiplier);
  if (upgraded.percentBlockMaxHp) upgraded.percentBlockMaxHp = Math.ceil(base.percentBlockMaxHp * multiplier);
  if (upgraded.missingHpDamage) upgraded.missingHpDamage = Number((base.missingHpDamage * multiplier).toFixed(2));
  if (upgraded.manaMultiplier) upgraded.manaMultiplier = Math.ceil(base.manaMultiplier * multiplier);
  if (upgraded.increasingDamage) upgraded.increasingDamage = Math.ceil(base.increasingDamage * multiplier);
  if (upgraded.winDamage) upgraded.winDamage = Math.ceil(base.winDamage * multiplier);
  if (upgraded.loseDamage) upgraded.loseDamage = Math.ceil(base.loseDamage * multiplier);
  if (upgraded.winHeal) upgraded.winHeal = Math.ceil(base.winHeal * multiplier);
  if (upgraded.winDamageBoss) upgraded.winDamageBoss = Math.ceil(base.winDamageBoss * multiplier);

  if (upgradeLevel >= 3) {
    if (base.enemyWeak) upgraded.enemyWeak = base.enemyWeak + 1;
    if (base.enemyVuln) upgraded.enemyVuln = base.enemyVuln + 1;
  }
  if (upgradeLevel >= 4) {
    if (base.selfStrength) upgraded.selfStrength = base.selfStrength + 1;
    if (base.selfDex) upgraded.selfDex = base.selfDex + 1;
  }
  if (upgradeLevel >= 5) {
    if (base.manaGain) upgraded.manaGain = base.manaGain + 1;
    if (base.draw) upgraded.draw = (base.draw || 0) + 1;
  }

  let upDesc = base.desc;
  if (base.damage) upDesc = upDesc.replace(`${base.damage}의 피해`, `${upgraded.damage}의 피해`);
  if (base.block) upDesc = upDesc.replace(`${base.block}의 방어도`, `${upgraded.block}의 방어도`);
  if (base.heal) upDesc = upDesc.replace(`체력을 ${base.heal}`, `체력을 ${upgraded.heal}`);
  if (base.percentBlockMaxHp) upDesc = upDesc.replace(`${base.percentBlockMaxHp}%`, `${upgraded.percentBlockMaxHp}%`);
  if (base.missingHpDamage) upDesc = upDesc.replace(`${base.missingHpDamage * 100}%`, `${Math.round(upgraded.missingHpDamage * 100)}%`);
  
  if (base.manaMultiplier) upDesc = upDesc.replace(`(소모한 마나 x ${base.manaMultiplier})`, `(소모한 마나 x ${upgraded.manaMultiplier})`);
  if (base.increasingDamage) upDesc = upDesc.replace(`피해량이 ${base.increasingDamage}씩`, `피해량이 ${upgraded.increasingDamage}씩`);
  if (base.winDamage) upDesc = upDesc.replace(`${base.winDamage}의 피해`, `${upgraded.winDamage}의 피해`);
  if (base.winDamageBoss) upDesc = upDesc.replace(`보스 ${base.winDamageBoss}`, `보스 ${upgraded.winDamageBoss}`);
  if (base.winHeal) upDesc = upDesc.replace(`체력을 ${base.winHeal}`, `체력을 ${upgraded.winHeal}`);
  
  if (base.multiHit && base.damage) {
      const oldTotal = base.damage * base.multiHit;
      const newTotal = upgraded.damage * base.multiHit;
      upDesc = upDesc.replace(`(총 ${oldTotal})`, `(총 ${newTotal})`);
  }

  if (base.enemyWeak && upgraded.enemyWeak > base.enemyWeak) upDesc = upDesc.replace(`약화 ${base.enemyWeak}`, `약화 ${upgraded.enemyWeak}`);
  if (base.enemyVuln && upgraded.enemyVuln > base.enemyVuln) upDesc = upDesc.replace(`취약 ${base.enemyVuln}`, `취약 ${upgraded.enemyVuln}`);
  if (base.selfStrength && upgraded.selfStrength > base.selfStrength) {
    upDesc = upDesc.replace(`근력을 ${base.selfStrength}`, `근력을 ${upgraded.selfStrength}`)
                   .replace(`근력 ${base.selfStrength}`, `근력 ${upgraded.selfStrength}`);
  }
  if (base.selfDex && upgraded.selfDex > base.selfDex) {
    upDesc = upDesc.replace(`민첩을 ${base.selfDex}`, `민첩을 ${upgraded.selfDex}`)
                   .replace(`민첩 ${base.selfDex}`, `민첩 ${upgraded.selfDex}`);
  }
  if (base.selfStrength && base.selfDex && upgraded.selfStrength > base.selfStrength) {
      upDesc = upDesc.replace(`각각 ${base.selfStrength}`, `각각 ${upgraded.selfStrength}`);
  }
  if (base.manaGain && upgraded.manaGain > base.manaGain) {
    upDesc = upDesc.replace(`마나를 ${base.manaGain}`, `마나를 ${upgraded.manaGain}`)
                   .replace(`마나 ${base.manaGain}`, `마나 ${upgraded.manaGain}`);
  }
  if (base.draw && upgraded.draw > base.draw) {
    upDesc = upDesc.replace(`카드를 ${base.draw}장 뽑`, `카드를 ${upgraded.draw}장 뽑`)
                   .replace(`${base.draw}장 뽑`, `${upgraded.draw}장 뽑`);
  }

  upgraded.desc = upDesc;
  return upgraded;
};

// 4. 적 의도 생성 및 스케일링
export const generateEnemyIntent = (template, stage) => {
  const baseCard = template.deck[Math.floor(Math.random() * template.deck.length)];
  let scaledValue = baseCard.value || 0;
  let scaledHeal = baseCard.heal || 0;

  if (scaledValue > 0) {
    scaledValue += Math.floor(stage * 0.8);
    if (stage > 20) scaledValue += Math.floor((stage - 20) * 0.7); 
  }
  if (scaledHeal > 0) {
    scaledHeal += Math.floor(stage * 2);
  }
  
  let scaledDesc = baseCard.desc;
  if (baseCard.value && scaledValue > 0) scaledDesc = scaledDesc.replace(baseCard.value.toString(), scaledValue.toString());
  if (baseCard.heal && scaledHeal > 0) scaledDesc = scaledDesc.replace(baseCard.heal.toString(), scaledHeal.toString());
  
  return { ...baseCard, value: scaledValue, heal: scaledHeal, desc: scaledDesc };
};

// 5. 스테이지별 적 생성
export const generateEnemies = (stage) => {
  let templates = [];
  if (SPECIAL_BOSSES[stage]) {
    const bossData = SPECIAL_BOSSES[stage];
    templates = stage === 100 ? [bossData, bossData, bossData] : [bossData];
  } else if (stage % 5 === 0) {
    templates = [NORMAL_BOSSES[Math.floor(Math.random() * NORMAL_BOSSES.length)]];
  } else {
    templates = [ENEMIES[Math.floor(Math.random() * ENEMIES.length)]];
  }

  return templates.map((template, i) => {
    let hp = template.baseHp + (stage * 8);
    if (stage > 20) hp += (stage - 20) * 10;
    if (stage > 50) hp += (stage - 50) * 15; 
    
    return {
      uid: Math.random().toString(),
      name: templates.length > 1 ? `${template.name} ${String.fromCharCode(65+i)}` : template.name,
      hp: hp, maxHp: hp, block: 0, isBoss: stage % 5 === 0, template,
      intentCard: generateEnemyIntent(template, stage),
      debuffs: { weak: 0, vulnerable: 0 },
      buffs: { strength: 0 },
      passives: template.passives ? JSON.parse(JSON.stringify(template.passives)) : []
    };
  });
};

// 6. 덱 상태 체크
export const validateDeckStatus = (deckCounts) => {
  const total = Object.values(deckCounts || {}).reduce((a, b) => a + b, 0);
  const manaCount = MANA_CARD_IDS.reduce((acc, id) => acc + (deckCounts[id] || 0), 0);
  return { total, manaCount, isManaValid: manaCount <= GAME_RULES.MAX_MANA_CARDS };
};