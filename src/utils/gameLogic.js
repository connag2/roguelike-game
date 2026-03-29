import { CARD_LIBRARY, ENEMIES, NORMAL_BOSSES, SPECIAL_BOSSES, MANA_CARD_IDS, GAME_RULES } from '../constants/gameData';

export const shuffle = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const decayStack = (val) => {
  if (!val || val <= 0) return 0;
  let drop = 1;
  if (val >= 10) drop = Math.floor(val / 3);
  else if (val >= 5) drop = 2;
  return Math.max(0, val - drop);
};

export const getCardDef = (id, shopUpgrades) => {
  if (!id) return null;
  const base = CARD_LIBRARY.find(c => c.id === id);
  if (!base) return null;
  const upgradeLevel = (shopUpgrades?.upgradedCards || []).filter(cId => cId === id).length;
  
  if (upgradeLevel > 0) {
    let ratePerLevel = 0.3;
    if (base.rarity === 'uncommon') ratePerLevel = 0.4; 
    else if (base.rarity === 'rare') ratePerLevel = 0.5; 
    else if (base.rarity === 'special') ratePerLevel = 0.6; 
    else if (base.rarity === 'mythic') ratePerLevel = 0.8;

    const upgraded = { ...base, name: `${base.name} +${upgradeLevel}`, isUpgraded: true, upgradeLevel };
    const getFlatInc = (val) => Math.max(1, Math.round(val * ratePerLevel));

    if (upgraded.damage) upgraded.damage = base.damage + getFlatInc(base.damage) * upgradeLevel;
    if (upgraded.block) upgraded.block = base.block + getFlatInc(base.block) * upgradeLevel;
    if (upgraded.heal) upgraded.heal = base.heal + getFlatInc(base.heal) * upgradeLevel;
    if (upgraded.percentBlockMaxHp) upgraded.percentBlockMaxHp = base.percentBlockMaxHp + getFlatInc(base.percentBlockMaxHp) * upgradeLevel;
    
    if (upgraded.missingHpDamage) {
      const inc = Math.max(0.05, base.missingHpDamage * ratePerLevel);
      upgraded.missingHpDamage = Number((base.missingHpDamage + inc * upgradeLevel).toFixed(2));
    }
    
    if (upgraded.manaMultiplier) upgraded.manaMultiplier = base.manaMultiplier + getFlatInc(base.manaMultiplier) * upgradeLevel;
    if (upgraded.increasingDamage) upgraded.increasingDamage = base.increasingDamage + getFlatInc(base.increasingDamage) * upgradeLevel;
    if (upgraded.winDamage) upgraded.winDamage = base.winDamage + getFlatInc(base.winDamage) * upgradeLevel;
    if (upgraded.loseDamage) upgraded.loseDamage = base.loseDamage + getFlatInc(base.loseDamage) * upgradeLevel;
    
    const debuffBonus = Math.max(0, upgradeLevel - 2); 
    if (debuffBonus > 0) {
      if (base.enemyWeak) upgraded.enemyWeak = base.enemyWeak + debuffBonus;
      if (base.enemyVuln) upgraded.enemyVuln = base.enemyVuln + debuffBonus;
      if (base.enemyPoison) upgraded.enemyPoison = base.enemyPoison + debuffBonus * 2;
    }

    const buffBonus = Math.max(0, upgradeLevel - 3); 
    if (buffBonus > 0) {
      if (base.selfStrength) upgraded.selfStrength = base.selfStrength + buffBonus;
      if (base.selfDex) upgraded.selfDex = base.selfDex + buffBonus;
      if (base.selfThorns) upgraded.selfThorns = base.selfThorns + buffBonus + 1;
    }

    if (upgradeLevel >= 5) {
      if (base.manaGain) upgraded.manaGain = base.manaGain + 1;
      upgraded.draw = (base.draw || 0) + 1;
    }

    let upDesc = base.desc;
    if (base.damage) upDesc = upDesc.replace(`${base.damage}의 피해`, `${upgraded.damage}의 피해`);
    if (base.block) upDesc = upDesc.replace(`${base.block}의 방어`, `${upgraded.block}의 방어`);
    if (base.enemyPoison) upDesc = upDesc.replace(`중독 ${base.enemyPoison}`, `중독 ${upgraded.enemyPoison}`);
    
    upgraded.desc = upDesc;
    return upgraded;
  }
  return base;
};

export const generateEnemyIntent = (template, stage) => {
  const baseCard = template.deck[Math.floor(Math.random() * template.deck.length)];
  let scaledValue = (baseCard.value || 0) + Math.floor(stage * 0.7);
  let scaledHeal = (baseCard.heal || 0) + Math.floor(stage * 1.5);
  let scaledDesc = baseCard.desc.replace(baseCard.value?.toString(), scaledValue.toString()).replace(baseCard.heal?.toString(), scaledHeal.toString());
  return { ...baseCard, value: scaledValue, heal: scaledHeal, desc: scaledDesc };
};

export const generateEnemies = (stage) => {
  let enemyTemplates = [];

  // 1. 네임드 전설 보스 (25, 50, 75, 100층)
  if ([25, 50, 75, 100].includes(stage)) {
    enemyTemplates = [SPECIAL_BOSSES[stage]];
  } 
  // 2. 일반 보스 (5층 단위)
  else if (stage % 5 === 0) {
    enemyTemplates = [NORMAL_BOSSES[Math.floor(Math.random() * NORMAL_BOSSES.length)]];
  } 
  // 3. 일반 몬스터
  else {
    enemyTemplates = [ENEMIES[Math.floor(Math.random() * ENEMIES.length)]];
  }

  return enemyTemplates.map((template, i) => {
    // 체력 밸런스 조정
    const hpBase = template.baseHp + (stage * 10);
    const hpFinal = stage > 50 ? Math.floor(hpBase * 1.5) : hpBase;

    return {
      uid: Math.random().toString(),
      name: template.name,
      hp: hpFinal,
      maxHp: hpFinal,
      block: 0,
      isBoss: stage % 5 === 0 || [25, 50, 75, 100].includes(stage),
      template,
      intentCard: generateEnemyIntent(template, stage),
      debuffs: { weak: 0, vulnerable: 0, poison: 0 },
      buffs: { strength: 0 },
      passives: template.passives ? JSON.parse(JSON.stringify(template.passives)) : []
    };
  });
};

export const validateDeckStatus = (deckCounts) => {
  const total = Object.values(deckCounts || {}).reduce((a, b) => a + b, 0);
  const manaCount = MANA_CARD_IDS.reduce((acc, id) => acc + (deckCounts[id] || 0), 0);
  return { total, isManaValid: manaCount <= GAME_RULES.MAX_MANA_CARDS };
};