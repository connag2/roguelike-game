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
    
    // 업그레이드 수치 증가 도우미 (작은 수치도 점진적으로 상승하도록 처리)
    const incAttr = (attr, forceOneEvery = 2) => {
       if (upgraded[attr] !== undefined) {
           let baseVal = base[attr];
           let inc = Math.floor(baseVal * ratePerLevel * upgradeLevel);
           if (inc === 0 && upgradeLevel >= forceOneEvery) inc = Math.floor(upgradeLevel / forceOneEvery);
           upgraded[attr] += inc;
       }
    };

    if (upgraded.damage) incAttr('damage', 1);
    if (upgraded.block) incAttr('block', 1);
    if (upgraded.heal) incAttr('heal', 1);
    
    incAttr('enemyWeak', 2);
    incAttr('enemyVuln', 2);
    incAttr('enemyPoison', 1);
    incAttr('selfStrength', 2);
    incAttr('selfDex', 2);
    incAttr('selfThorns', 1);
    incAttr('manaGain', 3);
    incAttr('draw', 3);
    incAttr('multiHit', 4);
    
    let upDesc = base.desc;
    if (base.damage) upDesc = upDesc.replace(`${base.damage}의 피해`, `${upgraded.damage}의 피해`);
    if (base.block) upDesc = upDesc.replace(`${base.block}의 방어`, `${upgraded.block}의 방어`);
    if (base.heal) upDesc = upDesc.replace(`체력을 ${base.heal} 회복`, `체력을 ${upgraded.heal} 회복`);
    if (base.enemyWeak) upDesc = upDesc.replace(`약화 ${base.enemyWeak}`, `약화 ${upgraded.enemyWeak}`);
    if (base.enemyVuln) upDesc = upDesc.replace(`취약 ${base.enemyVuln}`, `취약 ${upgraded.enemyVuln}`);
    if (base.enemyPoison) upDesc = upDesc.replace(`중독 ${base.enemyPoison}`, `중독 ${upgraded.enemyPoison}`);
    if (base.selfStrength) upDesc = upDesc.replace(`근력 ${base.selfStrength}`, `근력 ${upgraded.selfStrength}`).replace(`근력을 ${base.selfStrength}`, `근력을 ${upgraded.selfStrength}`);
    if (base.selfDex) upDesc = upDesc.replace(`민첩 ${base.selfDex}`, `민첩 ${upgraded.selfDex}`).replace(`민첩을 ${base.selfDex}`, `민첩을 ${upgraded.selfDex}`);
    if (base.manaGain) upDesc = upDesc.replace(`마나를 ${base.manaGain}`, `마나를 ${upgraded.manaGain}`);
    if (base.draw) upDesc = upDesc.replace(`카드를 ${base.draw}장 뽑`, `카드를 ${upgraded.draw}장 뽑`);
    
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

  if (stage === 100) {
    enemyTemplates = [SPECIAL_BOSSES[100], SPECIAL_BOSSES[100], SPECIAL_BOSSES[100]];
  }
  else if ([25, 50, 75].includes(stage)) {
    enemyTemplates = [SPECIAL_BOSSES[stage]];
  } 
  else if (stage % 5 === 0) {
    enemyTemplates = [NORMAL_BOSSES[Math.floor(Math.random() * NORMAL_BOSSES.length)]];
  } 
  else {
    enemyTemplates = [ENEMIES[Math.floor(Math.random() * ENEMIES.length)]];
  }

  return enemyTemplates.map((template, idx) => {
    const isNamedBoss = [25, 50, 75, 100].includes(stage);
    const isNormalBoss = stage % 5 === 0 && !isNamedBoss;
    
    let hpBase = template.baseHp + (stage * 12);
    let hpFinal = hpBase;
    
    if (isNamedBoss) hpFinal = Math.floor(hpBase * 2.2);
    else if (isNormalBoss) hpFinal = Math.floor(hpBase * 1.6);
    
    let name = template.name;
    if (stage === 100) name += ` ${['A', 'B', 'C'][idx]}`;

    return {
      uid: Math.random().toString(),
      name: name,
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