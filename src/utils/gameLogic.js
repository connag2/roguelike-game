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

export const getCardDef = (id) => {
    if (!id) return null;
    const base = CARD_LIBRARY.find(c => c.id === id);
    if (!base) return null;
    
    const upgradeLevel = (shopUpgrades?.upgradedCards || []).filter(cId => cId === id).length;
    
    if (upgradeLevel > 0) {
      let ratePerLevel = 0.3; // 일반
      if (base.rarity === 'uncommon') ratePerLevel = 0.4; 
      else if (base.rarity === 'rare') ratePerLevel = 0.5; 
      else if (base.rarity === 'special') ratePerLevel = 0.6; 
      else if (base.rarity === 'mythic') ratePerLevel = 0.8; // [신화 등급 배율 추가]

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
      if (upgraded.winHeal) upgraded.winHeal = base.winHeal + getFlatInc(base.winHeal) * upgradeLevel;
      if (upgraded.winDamageBoss) upgraded.winDamageBoss = base.winDamageBoss + getFlatInc(base.winDamageBoss) * upgradeLevel;

      // [신규 상태이상 추가] 디버프 강화 (+3강부터)
      const debuffBonus = Math.max(0, upgradeLevel - 2); 
      if (debuffBonus > 0) {
        if (base.enemyWeak) upgraded.enemyWeak = base.enemyWeak + debuffBonus;
        if (base.enemyVuln) upgraded.enemyVuln = base.enemyVuln + debuffBonus;
        if (base.enemyPoison) upgraded.enemyPoison = base.enemyPoison + debuffBonus * 2; // 중독은 디버프 보너스의 2배씩 증가
      }

      // [신규 상태이상 추가] 버프 강화 (+4강부터)
      const buffBonus = Math.max(0, upgradeLevel - 3); 
      if (buffBonus > 0) {
        if (base.selfStrength) upgraded.selfStrength = base.selfStrength + buffBonus;
        if (base.selfDex) upgraded.selfDex = base.selfDex + buffBonus;
        if (base.selfThorns) upgraded.selfThorns = base.selfThorns + buffBonus + 1; // 가시 보너스
      }

      if (upgradeLevel >= 5) {
        if (base.manaGain) upgraded.manaGain = base.manaGain + 1;
        if (base.winManaGain) upgraded.winManaGain = base.winManaGain + 1;
        upgraded.draw = (base.draw || 0) + 1; 
      }

      let upDesc = base.desc;
      if (base.damage) upDesc = upDesc.replace(`${base.damage}의 피해`, `${upgraded.damage}의 피해`);
      if (base.block) upDesc = upDesc.replace(`${base.block}의 방어도`, `${upgraded.block}의 방어도`);
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

      if (upgradeLevel >= 5) {
        if (base.draw) upDesc = upDesc.replace(`카드를 ${base.draw}장 뽑`, `카드를 ${upgraded.draw}장 뽑`).replace(`${base.draw}장 뽑`, `${upgraded.draw}장 뽑`);
        else upDesc += ' 카드를 1장 뽑습니다.';
      }
      
      upgraded.desc = upDesc;
      return upgraded;
    }
    return base;
  };
export const validateDeckStatus = (deckCounts) => {
  const total = Object.values(deckCounts || {}).reduce((a, b) => a + b, 0);
  const manaCount = MANA_CARD_IDS.reduce((acc, id) => acc + (deckCounts[id] || 0), 0);
  return { total, isManaValid: manaCount <= GAME_RULES.MAX_MANA_CARDS };
};