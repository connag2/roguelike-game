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
    
    let upDesc = base.desc;
    if (base.damage) upDesc = upDesc.replace(`${base.damage}의 피해`, `${upgraded.damage}의 피해`);
    if (base.block) upDesc = upDesc.replace(`${base.block}의 방어`, `${upgraded.block}의 방어`);
    
    upgraded.desc = upDesc;
    return upgraded;
  }
  return base;
};

export const generateEnemyIntent = (template, stage) => {
  const baseCard = template.deck[Math.floor(Math.random() * template.deck.length)];
  let scaledValue = (baseCard.value || 0) + Math.floor(stage * 0.75);
  let scaledHeal = (baseCard.heal || 0) + Math.floor(stage * 1.5);
  let scaledDesc = baseCard.desc.replace(baseCard.value?.toString(), scaledValue.toString()).replace(baseCard.heal?.toString(), scaledHeal.toString());
  return { ...baseCard, value: scaledValue, heal: scaledHeal, desc: scaledDesc };
};

export const generateEnemies = (stage) => {
  let enemyTemplates = [];

  // 1. 네임드 전설 보스 (25, 50, 75, 100층 고정)
  if ([25, 50, 75, 100].includes(stage)) {
    enemyTemplates = [SPECIAL_BOSSES[stage]];
  } 
  // 2. 일반 보스 (그 외 5층 단위: 5, 10, 15, 20, 30...)
  else if (stage % 5 === 0) {
    enemyTemplates = [NORMAL_BOSSES[Math.floor(Math.random() * NORMAL_BOSSES.length)]];
  } 
  // 3. 일반 몬스터 (그 외 모든 층)
  else {
    enemyTemplates = [ENEMIES[Math.floor(Math.random() * ENEMIES.length)]];
  }

  return enemyTemplates.map((template) => {
    // 층수 및 등급에 따른 체력 스케일링
    const isNamedBoss = [25, 50, 75, 100].includes(stage);
    const isNormalBoss = stage % 5 === 0 && !isNamedBoss;
    
    let hpBase = template.baseHp + (stage * 12);
    let hpFinal = hpBase;
    
    if (isNamedBoss) hpFinal = Math.floor(hpBase * 2.2); // 네임드는 매우 강력하게
    else if (isNormalBoss) hpFinal = Math.floor(hpBase * 1.6); // 일반 보스

    return {
      uid: Math.random().toString(),
      name: template.name,
      hp: hpFinal,
      maxHp: hpFinal,
      block: 0,
      isBoss: isNamedBoss || isNormalBoss,
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