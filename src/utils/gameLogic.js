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

export const getCardDef = (id, shopUpgrades) => {
  if (!id) return null;
  const base = CARD_LIBRARY.find(c => c.id === id);
  if (!base) return null;
  const upgradeLevel = (shopUpgrades?.upgradedCards || []).filter(cId => cId === id).length;
  
  if (upgradeLevel > 0) {
    const upgraded = { ...base, name: `${base.name} +${upgradeLevel}`, isUpgraded: true, upgradeLevel };
    
    const scale = (val, factor = 0.3) => val ? val + Math.floor(val * factor * upgradeLevel) : val;
    // interval 변수를 받아 특정 강화 수치마다 오르도록 조정
    const flat = (val, interval) => val ? val + Math.floor(upgradeLevel / interval) : val;

    // 대미지, 방어, 힐은 지속적으로 스케일링
    upgraded.damage = scale(base.damage);
    upgraded.block = scale(base.block);
    upgraded.heal = scale(base.heal);
    
    // ✨ 다단 히트(추가 타수): 4강마다 1타 추가 (밸런스를 위해 4강으로 설정)
    upgraded.multiHit = flat(base.multiHit, 4);

    // ✨ 버프/디버프: +4강마다 1씩 증가
    upgraded.enemyWeak = flat(base.enemyWeak, 4);
    upgraded.enemyVuln = flat(base.enemyVuln, 4);
    upgraded.enemyPoison = flat(base.enemyPoison, 4); 
    upgraded.selfStrength = flat(base.selfStrength, 4);
    upgraded.selfDex = flat(base.selfDex, 4);
    
    // ✨ 드로우/마나: +5강마다 1씩 증가
    upgraded.manaGain = flat(base.manaGain, 5);
    upgraded.draw = flat(base.draw, 5);

    // ✨ 텍스트(설명) 업데이트 로직 강화
    let upDesc = base.desc || '';
    if (base.damage) upDesc = upDesc.replace(`${base.damage}의 피해`, `${upgraded.damage}의 피해`);
    if (base.block) upDesc = upDesc.replace(`${base.block}의 방어`, `${upgraded.block}의 방어`);
    if (base.heal) upDesc = upDesc.replace(`체력을 ${base.heal}`, `체력을 ${upgraded.heal}`);
    
    // 카드 드로우 텍스트 교체
    if (base.draw) upDesc = upDesc.replace(`카드를 ${base.draw}장`, `카드를 ${upgraded.draw}장`);
    
    // 마나 텍스트 교체
    if (base.manaGain) {
      upDesc = upDesc.replace(`마나를 ${base.manaGain}`, `마나를 ${upgraded.manaGain}`)
                     .replace(`마나 ${base.manaGain}`, `마나 ${upgraded.manaGain}`);
    }

    // 다단 히트 텍스트 교체
    if (base.multiHit) {
      upDesc = upDesc.replace(`${base.multiHit}번 연속`, `${upgraded.multiHit}번 연속`);
      // "총 N" 대미지 계산 표기가 텍스트에 있다면 같이 업데이트
      if (upDesc.includes('(총')) {
        const oldTotal = base.damage * base.multiHit;
        const newTotal = upgraded.damage * upgraded.multiHit;
        upDesc = upDesc.replace(`(총 ${oldTotal})`, `(총 ${newTotal})`);
      }
    }

    // 버프/디버프 텍스트 교체
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