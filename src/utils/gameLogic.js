// src/utils/gameLogic.js
import { CARD_LIBRARY, ENEMIES, NORMAL_BOSSES, SPECIAL_BOSSES, MANA_CARD_IDS, GAME_RULES } from '../constants/gameData';

export const shuffle = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// 버프/디버프 최대 중첩치 제한
export const clampStack = (val, max = 999) => Math.min(Math.max(0, val), max);

export const decayStack = (val) => {
  if (!val || val <= 0) return 0;
  let drop = 1;
  if (val >= 10) drop = Math.floor(val / 3);
  else if (val >= 5) drop = 2;
  return clampStack(val - drop);
};

// ✨ 수정됨: 모든 입력값을 숫자로 강제 변환하고 계산 결과에 floor 적용하여 NaN 방지
export const calculateDamage = (baseDamage, attackerStrength = 0, attackerWeak = 0, targetVuln = 0) => {
  const base = Number(baseDamage) || 0;
  const strength = Number(attackerStrength) || 0;
  const weak = Number(attackerWeak) || 0;
  const vuln = Number(targetVuln) || 0;

  let dmg = base + strength;
  
  // ⚠️ 약화는 중첩 효율 때문에 3% 감소 유지, 결과를 정수로 변환
  if (weak > 0) dmg = Math.floor(dmg * 0.97); 
  
  // 취약 시 대미지 30% 증가, 결과를 정수로 변환
  if (vuln > 0) dmg = Math.floor(dmg * 1.30); 
  
  return Math.max(0, dmg);
};

// 통합 방어도 계산기
export const calculateBlock = (baseBlock, dex = 0) => {
  return Math.max(0, (Number(baseBlock) || 0) + (Number(dex) || 0));
};

export const getCardDef = (id, shopUpgrades) => {
  if (!id) return null;
  const base = CARD_LIBRARY.find(c => c.id === id);
  if (!base) return null;
  const upgradeLevel = (shopUpgrades?.upgradedCards || []).filter(cId => cId === id).length;
  
  if (upgradeLevel > 0) {
    const upgraded = { ...base, name: `${base.name} +${upgradeLevel}`, isUpgraded: true, upgradeLevel };
    
    // ✨ 안전한 스케일링 함수: 값이 없을 경우 0으로 처리하여 NaN 방지
    const scale = (val, factor = 0.3) => {
      const numVal = Number(val) || 0;
      return numVal > 0 ? numVal + Math.floor(numVal * factor * upgradeLevel) : val;
    };
    const flat = (val, interval) => {
      const numVal = Number(val) || 0;
      return numVal > 0 ? numVal + Math.floor(upgradeLevel / interval) : val;
    };

    // 대미지, 방어, 힐 스케일링
    upgraded.damage = scale(base.damage);
    upgraded.block = scale(base.block);
    upgraded.heal = scale(base.heal);
    
    // 다단 히트 및 버프/디버프 수치 업데이트
    upgraded.multiHit = flat(base.multiHit, 4);
    upgraded.enemyWeak = flat(base.enemyWeak, 4);
    upgraded.enemyVuln = flat(base.enemyVuln, 4);
    upgraded.enemyPoison = flat(base.enemyPoison, 4); 
    upgraded.selfStrength = flat(base.selfStrength, 4);
    upgraded.selfDex = flat(base.selfDex, 4);
    upgraded.manaGain = flat(base.manaGain, 5);
    upgraded.draw = flat(base.draw, 5);

    // 텍스트(설명) 업데이트 로직
    let upDesc = base.desc || '';
    if (base.damage) upDesc = upDesc.replace(`${base.damage}의 피해`, `${upgraded.damage}의 피해`);
    if (base.block) upDesc = upDesc.replace(`${base.block}의 방어`, `${upgraded.block}의 방어`);
    if (base.heal) upDesc = upDesc.replace(`체력을 ${base.heal}`, `체력을 ${upgraded.heal}`);
    if (base.draw) upDesc = upDesc.replace(`카드를 ${base.draw}장`, `카드를 ${upgraded.draw}장`);
    
    if (base.manaGain) {
      upDesc = upDesc.replace(`마나를 ${base.manaGain}`, `마나를 ${upgraded.manaGain}`)
                     .replace(`마나 ${base.manaGain}`, `마나 ${upgraded.manaGain}`);
    }

    if (base.multiHit) {
      upDesc = upDesc.replace(`${base.multiHit}번 연속`, `${upgraded.multiHit}번 연속`);
      if (upDesc.includes('(총')) {
        const oldTotal = base.damage * base.multiHit;
        const newTotal = upgraded.damage * upgraded.multiHit;
        upDesc = upDesc.replace(`(총 ${oldTotal})`, `(총 ${newTotal})`);
      }
    }

    if (base.enemyWeak) upDesc = upDesc.replace(`약화 ${base.enemyWeak}`, `약화 ${upgraded.enemyWeak}`);
    if (base.enemyVuln) upDesc = upDesc.replace(`취약 ${base.enemyVuln}`, `취약 ${upgraded.enemyVuln}`);
    if (base.enemyPoison) upDesc = upDesc.replace(`중독 ${base.enemyPoison}`, `중독 ${upgraded.enemyPoison}`);
    if (base.selfStrength) upDesc = upDesc.replace(`근력을 ${base.selfStrength}`, `근력을 ${upgraded.selfStrength}`);
    if (base.selfDex) upDesc = upDesc.replace(`민첩을 ${base.selfDex}`, `민첩을 ${upgraded.selfDex}`);

    upgraded.desc = upDesc;
    return upgraded;
  }
  return base;
};

export const generateEnemyIntent = (template, stage) => {
  if (!template || !template.deck || template.deck.length === 0) {
    return { name: '오류 방지', type: 'attack', value: 0, desc: '행동을 읽을 수 없습니다.' };
  }
  
  const baseCard = template.deck[Math.floor(Math.random() * template.deck.length)];
  let newIntent = { ...baseCard };
  let newDesc = baseCard.desc || '';
  
  if (baseCard.value !== undefined) {
    newIntent.value = Number(baseCard.value) + Math.floor(stage * 0.75);
    newDesc = newDesc.replace(baseCard.value.toString(), newIntent.value.toString());
  } else {
    delete newIntent.value; 
  }
  
  if (baseCard.heal !== undefined) {
    newIntent.heal = Number(baseCard.heal); 
  }
  
  newIntent.desc = newDesc;
  return newIntent;
};

export const generateEnemies = (stage) => {
  const s = Number(stage) || 1;
  let enemyTemplates = [];
  try {
    if (s === 100) {
      enemyTemplates = [SPECIAL_BOSSES[100], SPECIAL_BOSSES[100], SPECIAL_BOSSES[100]];
    } else if ([25, 50, 75].includes(s)) {
      enemyTemplates = [SPECIAL_BOSSES[s]];
    } else if (s % 5 === 0) {
      enemyTemplates = [NORMAL_BOSSES[Math.floor(Math.random() * NORMAL_BOSSES.length)]];
    } else {
      enemyTemplates = [ENEMIES[Math.floor(Math.random() * ENEMIES.length)]];
    }
  } catch (error) {
    console.error("적 생성 중 오류 발생:", error);
    enemyTemplates = [ENEMIES[0]]; 
  }

  enemyTemplates = enemyTemplates.filter(Boolean);
  if (enemyTemplates.length === 0) enemyTemplates = [ENEMIES[0]];

  return enemyTemplates.map((template, idx) => {
    const isNamedBoss = [25, 50, 75, 100].includes(s);
    const isNormalBoss = s % 5 === 0 && !isNamedBoss;
    
    let hpBase = Number(template.baseHp) || 50;
    let hpFinal = Math.floor(hpBase + (s * 12));
    
    if (isNamedBoss) hpFinal = Math.floor(hpFinal * 2.2);
    else if (isNormalBoss) hpFinal = Math.floor(hpFinal * 1.6);
    
    let name = template.name || '알 수 없는 적';
    if (s === 100) name += ` (${String.fromCharCode(65 + idx)})`; 

    return {
      uid: Math.random().toString() + idx,
      name: name,
      hp: hpFinal,
      maxHp: hpFinal,
      block: 0,
      isBoss: isNamedBoss || isNormalBoss,
      template,
      intentCard: generateEnemyIntent(template, s),
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