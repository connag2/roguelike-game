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

// ✨ 버프/디버프 최대 중첩치 제한 (침묵, 속박, 무형 등은 1로 강제 고정하여 버그 방지)
export const clampStack = (val, max = 999, isHardCC = false) => {
  if (isHardCC) return Math.min(Math.max(0, val), 1);
  return Math.min(Math.max(0, val), max);
};

// ✨ 디버프/버프 감소 로직 (하드 CC나 1턴 지속 효과는 턴 종료 시 무조건 0으로 해제)
export const decayStack = (val, isHardCC = false) => {
  if (!val || val <= 0) return 0;
  if (isHardCC) return 0; // 침묵, 속박, 무형 등은 1턴 후 즉시 풀림
  
  let drop = 1;
  if (val >= 10) drop = Math.floor(val / 3);
  else if (val >= 5) drop = 2;
  return clampStack(val - drop);
};

// ✨ 대미지 계산 로직: 표식(mark)과 무형(intangible) 효과 추가 적용
export const calculateDamage = (baseDamage, attackerStrength = 0, attackerWeak = 0, targetVuln = 0, targetMark = 0, targetIntangible = 0) => {
  const base = Number(baseDamage) || 0;
  const strength = Number(attackerStrength) || 0;
  const weak = Number(attackerWeak) || 0;
  const vuln = Number(targetVuln) || 0;
  const mark = Number(targetMark) || 0;

  let dmg = base + strength;
  
  // 약화는 중첩 효율 때문에 3% 감소 유지, 결과를 정수로 변환
  if (weak > 0) dmg = Math.floor(dmg * 0.97); 
  
  // 취약 시 대미지 30% 증가, 결과를 정수로 변환
  if (vuln > 0) dmg = Math.floor(dmg * 1.30); 
  
  // 표식 효과: 타격당 추가 고정 피해
  dmg += mark;
  
  // 무형 효과: 최종 대미지가 0보다 크면 무조건 1로 고정 (신화 카드/특수 보스용)
  if (targetIntangible > 0 && dmg > 0) {
    dmg = 1;
  }
  
  return Math.max(0, dmg);
};

// ✨ 방어도 계산 로직: 허약(frail) 효과 추가 적용
export const calculateBlock = (baseBlock, dex = 0, frail = 0) => {
  let block = Math.max(0, (Number(baseBlock) || 0) + (Number(dex) || 0));
  
  // 허약 효과: 방어도 획득량 25% 감소
  if (frail > 0) block = Math.floor(block * 0.75);
  
  return block;
};

export const getCardDef = (id, shopUpgrades) => {
  if (!id) return null;
  const base = CARD_LIBRARY.find(c => c.id === id);
  if (!base) return null;
  const upgradeLevel = (shopUpgrades?.upgradedCards || []).filter(cId => cId === id).length;
  
  if (upgradeLevel > 0) {
    const upgraded = { ...base, name: `${base.name} +${upgradeLevel}`, isUpgraded: true, upgradeLevel };
    
    // 안전한 스케일링 함수: 값이 없을 경우 0으로 처리하여 NaN 방지
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
    
    // 다단 히트 및 기본 버프/디버프 수치 업데이트
    upgraded.multiHit = flat(base.multiHit, 4);
    upgraded.enemyWeak = flat(base.enemyWeak, 4);
    upgraded.enemyVuln = flat(base.enemyVuln, 4);
    upgraded.enemyPoison = flat(base.enemyPoison, 4); 
    upgraded.selfStrength = flat(base.selfStrength, 4);
    upgraded.selfDex = flat(base.selfDex, 4);
    upgraded.manaGain = flat(base.manaGain, 5);
    upgraded.draw = flat(base.draw, 5);

    // ✨ 신규 상태 이상 스케일링 추가
    upgraded.enemyMark = flat(base.enemyMark, 4);
    upgraded.enemyFrail = flat(base.enemyFrail, 4);
    upgraded.selfRegen = flat(base.selfRegen, 4);
    upgraded.selfRage = flat(base.selfRage, 4);
    upgraded.selfInsight = flat(base.selfInsight, 4);

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
    
    // 신규 효과 텍스트 변환
    if (base.enemyMark) upDesc = upDesc.replace(`표식 ${base.enemyMark}`, `표식 ${upgraded.enemyMark}`);
    if (base.enemyFrail) upDesc = upDesc.replace(`허약 ${base.enemyFrail}`, `허약 ${upgraded.enemyFrail}`);
    if (base.selfRegen) upDesc = upDesc.replace(`재생 ${base.selfRegen}`, `재생 ${upgraded.selfRegen}`);
    if (base.selfRage) upDesc = upDesc.replace(`방어도를 ${base.selfRage}`, `방어도를 ${upgraded.selfRage}`);
    if (base.selfInsight) upDesc = upDesc.replace(`카드를 ${base.selfInsight}장`, `카드를 ${upgraded.selfInsight}장`);

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

export const generateEnemies = (stage, mode = 'NORMAL') => {
  const s = Number(stage) || 1;
  let enemyTemplates = [];
  try {
    if (mode === 'HARD') {
      // 하드 모드: 300층 최종 보스, 250층 자매 보스, 50층마다 특수 보스, 10층마다 일반 보스
      if (s === 300) {
        enemyTemplates = [SPECIAL_BOSSES['H300']]; // 태초의 아케인: 에이온 출현
      } else if (s === 250) {
        enemyTemplates = [SPECIAL_BOSSES['H250_A'], SPECIAL_BOSSES['H250_B']]; // 서큐버스 자매 동시 출현
      } else if (s % 50 === 0) {
        // 하드 모드 전용 층수에 맞는 특수 보스 (H50, H100, H150, H200) 확정 출현
        enemyTemplates = [SPECIAL_BOSSES[`H${s}`]]; 
      } else if (s % 10 === 0) {
        // ✨ 수정된 부분: 하드 모드에서는 층수 진행도에 맞춰서 HARD_MODE_BOSSES 배열에서 순차적 또는 랜덤하게 등장
        const hardBossIndex = Math.min(Math.floor(s / 10) - 1, HARD_MODE_BOSSES.length - 1);
        enemyTemplates = [HARD_MODE_BOSSES[hardBossIndex]]; 
      } else {
        enemyTemplates = [ENEMIES[Math.floor(Math.random() * ENEMIES.length)]];
      }
    } else {
      // 일반 모드
      if (s === 100) {
        enemyTemplates = [SPECIAL_BOSSES[100], SPECIAL_BOSSES[100], SPECIAL_BOSSES[100]];
      } else if ([25, 50, 75].includes(s)) {
        enemyTemplates = [SPECIAL_BOSSES[s]];
      } else if (s % 5 === 0) {
        enemyTemplates = [NORMAL_BOSSES[Math.floor(Math.random() * NORMAL_BOSSES.length)]];
      } else {
        enemyTemplates = [ENEMIES[Math.floor(Math.random() * ENEMIES.length)]];
      }
    }
  } catch (error) {
    console.error("적 생성 중 오류 발생:", error);
    enemyTemplates = [ENEMIES[0]]; 
  }

  enemyTemplates = enemyTemplates.filter(Boolean);
  if (enemyTemplates.length === 0) enemyTemplates = [ENEMIES[0]];

  return enemyTemplates.map((template, idx) => {
    const isNamedBoss = mode === 'HARD' ? (s % 50 === 0) : [25, 50, 75, 100].includes(s);
    const isNormalBoss = mode === 'HARD' ? (s % 10 === 0 && !isNamedBoss) : (s % 5 === 0 && !isNamedBoss);
    
    let hpBase = Number(template.baseHp) || 50;
    let hpFinal = Math.floor(hpBase + (s * 12));
    
    if (isNamedBoss) hpFinal = Math.floor(hpFinal * 2.2);
    else if (isNormalBoss) hpFinal = Math.floor(hpFinal * 1.6);
    
    let name = template.name || '알 수 없는 적';
    // 서큐버스 등 다수 출현하는 하드 모드 보스를 위해 조건 완화
    if ((mode === 'NORMAL' && s === 100) || (mode === 'HARD' && s === 250)) name += ` (${String.fromCharCode(65 + idx)})`; 

    return {
      uid: Math.random().toString() + idx,
      name: name,
      hp: hpFinal,
      maxHp: hpFinal,
      block: 0,
      isBoss: isNamedBoss || isNormalBoss,
      template,
      intentCard: generateEnemyIntent(template, s),
      debuffs: { weak: 0, vulnerable: 0, poison: 0, mark: 0, frail: 0, silence: 0, bind: 0 },
      buffs: { strength: 0, intangible: 0, regen: 0, rage: 0 },
      passives: template.passives ? JSON.parse(JSON.stringify(template.passives)) : []
    };
  });
};

export const validateDeckStatus = (deckCounts) => {
  const total = Object.values(deckCounts || {}).reduce((a, b) => a + b, 0);
  const manaCount = MANA_CARD_IDS.reduce((acc, id) => acc + (deckCounts[id] || 0), 0);
  return { total, isManaValid: manaCount <= GAME_RULES.MAX_MANA_CARDS };
};