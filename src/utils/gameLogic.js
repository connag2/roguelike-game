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
    // 1. 신화(mythic) 등급 및 각 등급별 기본 강화 배율
    let ratePerLevel = 0.3; // 일반(common)
    if (base.rarity === 'uncommon') ratePerLevel = 0.4; 
    else if (base.rarity === 'rare') ratePerLevel = 0.5; 
    else if (base.rarity === 'special') ratePerLevel = 0.6; 
    else if (base.rarity === 'mythic') ratePerLevel = 0.8; // 신화 등급 (압도적 수치)

    const upgraded = { ...base, name: `${base.name} +${upgradeLevel}`, isUpgraded: true, upgradeLevel };
    
    // 2. 고정 수치 선형 증가 (수치가 이상하게 오르던 버그 해결)
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
    if (upgraded.winHeal) upgraded.winHeal = base.winHeal + getFlatInc(base.winHeal) * upgradeLevel;
    if (upgraded.winDamageBoss) upgraded.winDamageBoss = base.winDamageBoss + getFlatInc(base.winDamageBoss) * upgradeLevel;

    // 3. 디버프 강화 (+3강부터) - 중독(Poison) 추가
    const debuffBonus = Math.max(0, upgradeLevel - 2); 
    if (debuffBonus > 0) {
      if (base.enemyWeak) upgraded.enemyWeak = base.enemyWeak + debuffBonus;
      if (base.enemyVuln) upgraded.enemyVuln = base.enemyVuln + debuffBonus;
      if (base.enemyPoison) upgraded.enemyPoison = base.enemyPoison + debuffBonus * 2; // 중독은 강력하게 증가
    }

    // 4. 버프 강화 (+4강부터) - 가시(Thorns) 추가
    const buffBonus = Math.max(0, upgradeLevel - 3); 
    if (buffBonus > 0) {
      if (base.selfStrength) upgraded.selfStrength = base.selfStrength + buffBonus;
      if (base.selfDex) upgraded.selfDex = base.selfDex + buffBonus;
      if (base.selfThorns) upgraded.selfThorns = base.selfThorns + buffBonus + 1;
    }

    // 5. 궁극의 강화 (+5강 달성 시) - 마나 & 드로우 추가
    if (upgradeLevel >= 5) {
      if (base.manaGain) upgraded.manaGain = base.manaGain + 1;
      if (base.winManaGain) upgraded.winManaGain = base.winManaGain + 1;
      upgraded.draw = (base.draw || 0) + 1; // 5강 시 무조건 1장 드로우 추가
    }

    // 6. 설명(desc) 텍스트 정교한 치환 로직
    let upDesc = base.desc;
    if (base.damage) upDesc = upDesc.replace(`${base.damage}의 피해`, `${upgraded.damage}의 피해`);
    // '방어' 또는 '방어도' 글자를 모두 캐치합니다.
    if (base.block) upDesc = upDesc.replace(`${base.block}의 방어도`, `${upgraded.block}의 방어도`).replace(`${base.block}의 방어`, `${upgraded.block}의 방어`);
    if (base.heal) upDesc = upDesc.replace(`체력을 ${base.heal}`, `체력을 ${upgraded.heal}`);
    if (base.percentBlockMaxHp) upDesc = upDesc.replace(`${base.percentBlockMaxHp}%`, `${upgraded.percentBlockMaxHp}%`);
    if (base.missingHpDamage) upDesc = upDesc.replace(`${Math.round(base.missingHpDamage * 100)}%`, `${Math.round(upgraded.missingHpDamage * 100)}%`);
    
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

    // 상태이상 및 버프 텍스트 치환
    if (base.enemyWeak && upgraded.enemyWeak > base.enemyWeak) upDesc = upDesc.replace(`약화 ${base.enemyWeak}`, `약화 ${upgraded.enemyWeak}`);
    if (base.enemyVuln && upgraded.enemyVuln > base.enemyVuln) upDesc = upDesc.replace(`취약 ${base.enemyVuln}`, `취약 ${upgraded.enemyVuln}`);
    if (base.enemyPoison && upgraded.enemyPoison > base.enemyPoison) upDesc = upDesc.replace(`중독 ${base.enemyPoison}`, `중독 ${upgraded.enemyPoison}`);
    
    if (base.selfStrength && upgraded.selfStrength > base.selfStrength) {
      if (upDesc.includes(`각각 ${base.selfStrength}`)) upDesc = upDesc.replace(`각각 ${base.selfStrength}`, `각각 ${upgraded.selfStrength}`);
      else upDesc = upDesc.replace(`근력을 ${base.selfStrength}`, `근력을 ${upgraded.selfStrength}`).replace(`근력 ${base.selfStrength}`, `근력 ${upgraded.selfStrength}`);
    }
    if (base.selfDex && upgraded.selfDex > base.selfDex) {
      if (!upDesc.includes(`각각 ${upgraded.selfDex}`)) upDesc = upDesc.replace(`민첩을 ${base.selfDex}`, `민첩을 ${upgraded.selfDex}`).replace(`민첩 ${base.selfDex}`, `민첩 ${upgraded.selfDex}`);
    }
    if (base.selfThorns && upgraded.selfThorns > base.selfThorns) upDesc = upDesc.replace(`가시 ${base.selfThorns}`, `가시 ${upgraded.selfThorns}`);
    
    if (base.manaGain && upgraded.manaGain > base.manaGain) upDesc = upDesc.replace(`마나를 ${base.manaGain}`, `마나를 ${upgraded.manaGain}`).replace(`마나 ${base.manaGain}`, `마나 ${upgraded.manaGain}`);
    if (base.winManaGain && upgraded.winManaGain > base.winManaGain) upDesc = upDesc.replace(`마나를 ${base.winManaGain}`, `마나를 ${upgraded.winManaGain}`);

    // 드로우 텍스트 치환
    if (upgradeLevel >= 5) {
      if (base.draw) upDesc = upDesc.replace(`카드를 ${base.draw}장 뽑`, `카드를 ${upgraded.draw}장 뽑`).replace(`${base.draw}장 뽑`, `${upgraded.draw}장 뽑`);
      else upDesc += ' 카드를 1장 뽑습니다.';
    }
    
    upgraded.desc = upDesc;
    return upgraded;
  }
  
  return base;
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
      debuffs: { weak: 0, vulnerable: 0, poison: 0 }, buffs: { strength: 0 }, // poison 스탯 추가됨
      passives: template.passives ? JSON.parse(JSON.stringify(template.passives)) : []
    };
  });
};

export const validateDeckStatus = (deckCounts) => {
  const total = Object.values(deckCounts || {}).reduce((a, b) => a + b, 0);
  const manaCount = MANA_CARD_IDS.reduce((acc, id) => acc + (deckCounts[id] || 0), 0);
  return { total, isManaValid: manaCount <= GAME_RULES.MAX_MANA_CARDS };
};