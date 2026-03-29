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
  if (upgradeLevel <= 0) return base;

  let ratePerLevel = base.rarity === 'common' ? 0.3 : base.rarity === 'uncommon' ? 0.4 : base.rarity === 'rare' ? 0.6 : 0.7;
  const multiplier = 1 + (ratePerLevel * upgradeLevel); 
  const upgraded = { ...base, name: `${base.name} +${upgradeLevel}`, isUpgraded: true, upgradeLevel };

  const props = ['damage', 'block', 'heal', 'percentBlockMaxHp', 'manaMultiplier', 'increasingDamage', 'winDamage', 'loseDamage', 'winHeal', 'winDamageBoss'];
  props.forEach(p => { if(upgraded[p]) upgraded[p] = Math.ceil(base[p] * multiplier); });
  if (upgraded.missingHpDamage) upgraded.missingHpDamage = Number((base.missingHpDamage * multiplier).toFixed(2));

  if (upgradeLevel >= 3) { if(base.enemyWeak) upgraded.enemyWeak = (base.enemyWeak || 0) + 1; if(base.enemyVuln) upgraded.enemyVuln = (base.enemyVuln || 0) + 1; }
  if (upgradeLevel >= 4) { if(base.selfStrength) upgraded.selfStrength = (base.selfStrength || 0) + 1; if(base.selfDex) upgraded.selfDex = (base.selfDex || 0) + 1; }
  if (upgradeLevel >= 5) { if(base.manaGain) upgraded.manaGain = (base.manaGain || 0) + 1; upgraded.draw = (base.draw || 0) + 1; }

  let upDesc = base.desc;
  if (base.damage) upDesc = upDesc.replace(`${base.damage}의 피해`, `${upgraded.damage}의 피해`);
  if (base.block) upDesc = upDesc.replace(`${base.block}의 방어`, `${upgraded.block}의 방어`);
  if (base.heal) upDesc = upDesc.replace(`체력을 ${base.heal}`, `체력을 ${upgraded.heal}`);

  upgraded.desc = upDesc;
  return upgraded;
};

export const generateEnemyIntent = (template, stage) => {
  const baseCard = template.deck[Math.floor(Math.random() * template.deck.length)];
  let scaledValue = (baseCard.value || 0) + Math.floor(stage * 0.8 + (stage > 20 ? (stage-20)*0.7 : 0));
  let scaledHeal = (baseCard.heal || 0) + Math.floor(stage * 2);
  let scaledDesc = baseCard.desc.replace(baseCard.value?.toString(), scaledValue.toString()).replace(baseCard.heal?.toString(), scaledHeal.toString());
  return { ...baseCard, value: scaledValue, heal: scaledHeal, desc: scaledDesc };
};

export const generateEnemies = (stage) => {
  let templates = SPECIAL_BOSSES[stage] ? (stage === 100 ? [SPECIAL_BOSSES[stage], SPECIAL_BOSSES[stage], SPECIAL_BOSSES[stage]] : [SPECIAL_BOSSES[stage]]) :
                  stage % 5 === 0 ? [NORMAL_BOSSES[Math.floor(Math.random() * NORMAL_BOSSES.length)]] :
                  [ENEMIES[Math.floor(Math.random() * ENEMIES.length)]];

  return templates.map((template, i) => {
    let hp = template.baseHp + (stage * 8) + (stage > 20 ? (stage-20)*10 : 0) + (stage > 50 ? (stage-50)*15 : 0);
    return {
      uid: Math.random().toString(),
      name: templates.length > 1 ? `${template.name} ${String.fromCharCode(65+i)}` : template.name,
      hp: hp, maxHp: hp, block: 0, isBoss: stage % 5 === 0, template,
      intentCard: generateEnemyIntent(template, stage),
      debuffs: { weak: 0, vulnerable: 0 }, buffs: { strength: 0 },
      passives: template.passives ? JSON.parse(JSON.stringify(template.passives)) : []
    };
  });
};

export const validateDeckStatus = (deckCounts) => {
  const total = Object.values(deckCounts || {}).reduce((a, b) => a + b, 0);
  const manaCount = MANA_CARD_IDS.reduce((acc, id) => acc + (deckCounts[id] || 0), 0);
  return { total, isManaValid: manaCount <= GAME_RULES.MAX_MANA_CARDS };
};