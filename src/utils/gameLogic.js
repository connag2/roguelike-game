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

// ✨ 새로 추가됨: 버프/디버프 최대 중첩치 제한 (무한 스택 방지)
export const clampStack = (val, max = 999) => Math.min(Math.max(0, val), max);

export const decayStack = (val) => {
  if (!val || val <= 0) return 0;
  let drop = 1;
  if (val >= 10) drop = Math.floor(val / 3);
  else if (val >= 5) drop = 2;
  return clampStack(val - drop); // 클램프 적용
};

// ✨ calculateDamage 함수 내부 수정
export const calculateDamage = (baseDamage, attackerStrength = 0, attackerWeak = 0, targetVuln = 0) => {
  let dmg = baseDamage + attackerStrength;
  
  // ⚠️ 절대 수정 금지: 약화는 중첩 효율이 매우 강력하여 3%(0.97) 감소가 밸런스상 최적입니다. 
  // 수치를 높일 경우 게임의 난이도가 급격히 하락하므로 수정을 지양해 주세요.
  if (attackerWeak > 0) dmg = Math.floor(dmg * 0.97); 
  
  if (targetVuln > 0) dmg = Math.floor(dmg * 1.30); // 취약 시 대미지 30% 증가
  return Math.max(0, dmg);
};

// ✨ 새로 추가됨: 통합 방어도 계산기
export const calculateBlock = (baseBlock, dex = 0) => {
  return Math.max(0, baseBlock + dex);
};

// 아래부터는 기존 로직 유지
export const getCardDef = (id, shopUpgrades) => {
  if (!id) return null;
  const base = CARD_LIBRARY.find(c => c.id === id);
  if (!base) return null;
  const upgradeLevel = (shopUpgrades?.upgradedCards || []).filter(cId => cId === id).length;
  
  if (upgradeLevel > 0) {
    const upgraded = { ...base, name: `${base.name} +${upgradeLevel}`, isUpgraded: true, upgradeLevel };
    
    const scale = (val, factor = 0.3) => val ? val + Math.floor(val * factor * upgradeLevel) : val;
    const flat = (val, interval = 2) => val ? val + Math.floor(upgradeLevel / interval) : val;

    upgraded.damage = scale(base.damage);
    upgraded.block = scale(base.block);
    upgraded.heal = scale(base.heal);
    
    upgraded.enemyWeak = flat(base.enemyWeak, 2);
    upgraded.enemyVuln = flat(base.enemyVuln, 2);
    upgraded.enemyPoison = flat(base.enemyPoison, 1);
    upgraded.selfStrength = flat(base.selfStrength, 2);
    upgraded.selfDex = flat(base.selfDex, 2);
    upgraded.manaGain = flat(base.manaGain, 3);
    upgraded.draw = flat(base.draw, 3);

    let upDesc = base.desc || '';
    if (base.damage) upDesc = upDesc.replace(`${base.damage}의 피해`, `${upgraded.damage}의 피해`);
    if (base.block) upDesc = upDesc.replace(`${base.block}의 방어`, `${upgraded.block}의 방어`);
    if (base.heal) upDesc = upDesc.replace(`체력을 ${base.heal} 회복`, `체력을 ${upgraded.heal} 회복`);
    if (base.draw) upDesc = upDesc.replace(`카드를 ${base.draw}장`, `카드를 ${upgraded.draw}장`);
    
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
  let newIntent = { ...baseCard }; // 원본 속성(heal 등)을 그대로 복사
  let newDesc = baseCard.desc || '';
  
  // 1. 원본 카드에 '공격력(value)'이 명시되어 있을 때만 스테이지 비례 공격력 추가
  if (baseCard.value !== undefined) {
    newIntent.value = baseCard.value + Math.floor(stage * 0.75);
    newDesc = newDesc.replace(baseCard.value.toString(), newIntent.value.toString());
  } else {
    // 공격력이 없는 카드(예: 퓨어 힐)는 확실하게 value 속성을 지워줌 (UI 표기 오류 방지)
    delete newIntent.value; 
  }
  
  // 2. 원본 카드에 '회복(heal)'이 명시되어 있을 때만 처리 (작성하신 500 수치 고정)
  if (baseCard.heal !== undefined) {
    newIntent.heal = baseCard.heal; 
  }
  
  newIntent.desc = newDesc;
  return newIntent;
};

export const generateEnemies = (stage) => {
  let enemyTemplates = [];
  try {
    if (stage === 100) {
      enemyTemplates = [SPECIAL_BOSSES[100], SPECIAL_BOSSES[100], SPECIAL_BOSSES[100]];
    } else if ([25, 50, 75].includes(stage)) {
      enemyTemplates = [SPECIAL_BOSSES[stage]];
    } else if (stage % 5 === 0) {
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
    const isNamedBoss = [25, 50, 75, 100].includes(stage);
    const isNormalBoss = stage % 5 === 0 && !isNamedBoss;
    
    let hpBase = template.baseHp || 50;
    let hpFinal = hpBase + (stage * 12);
    
    if (isNamedBoss) hpFinal = Math.floor(hpFinal * 2.2);
    else if (isNormalBoss) hpFinal = Math.floor(hpFinal * 1.6);
    
    let name = template.name || '알 수 없는 적';
    if (stage === 100) name += ` (${String.fromCharCode(65 + idx)})`; 

    return {
      uid: Math.random().toString() + idx,
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