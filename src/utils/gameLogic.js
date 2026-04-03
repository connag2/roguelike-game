// src/utils/gameLogic.js
import { CARD_LIBRARY, ENEMIES, NORMAL_BOSSES, SPECIAL_BOSSES, MANA_CARD_IDS, GAME_RULES, HARD_MODE_BOSSES } from '../constants/gameData';

export const shuffle = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// ✨ 버프/디버프 최대 중첩치 제한
export const clampStack = (val, max = 999, isHardCC = false) => {
  if (isHardCC) return Math.min(Math.max(0, val), 1);
  return Math.min(Math.max(0, val), max);
};

// ✨ 디버프/버프 감소 로직
export const decayStack = (val, isHardCC = false) => {
  if (!val || val <= 0) return 0;
  if (isHardCC) return 0; 
  
  let drop = 1;
  if (val >= 10) drop = Math.floor(val / 3);
  else if (val >= 5) drop = 2;
  return clampStack(val - drop);
};

// ✨ 대미지 계산 로직
export const calculateDamage = (baseDamage, attackerStrength = 0, attackerWeak = 0, targetVuln = 0, targetMark = 0, targetIntangible = 0) => {
  const base = Number(baseDamage) || 0;
  const strength = Number(attackerStrength) || 0;
  const weak = Number(attackerWeak) || 0;
  const vuln = Number(targetVuln) || 0;
  const mark = Number(targetMark) || 0;

  let dmg = base + strength;
  
  // 약화(weak) 디버프 수치 정상적인 감소폭(25%)
  if (weak > 0) dmg = Math.floor(dmg * 0.75); 
  if (vuln > 0) dmg = Math.floor(dmg * 1.30); 
  dmg += mark;
  
  if (targetIntangible > 0 && dmg > 0) {
    dmg = 1;
  }
  return Math.max(0, dmg);
};

// ✨ 방어도 계산 로직
export const calculateBlock = (baseBlock, dex = 0, frail = 0) => {
  let block = Math.max(0, (Number(baseBlock) || 0) + (Number(dex) || 0));
  if (frail > 0) block = Math.floor(block * 0.75);
  return block;
};

// ✨ 카드 업그레이드 수치 반영
export const getCardDef = (id, shopUpgrades) => {
  if (!id) return null;
  const base = CARD_LIBRARY.find(c => c.id === id);
  if (!base) return null;
  const upgradeLevel = (shopUpgrades?.upgradedCards || []).filter(cId => cId === id).length;
  
  if (upgradeLevel > 0) {
    const upgraded = { ...base, name: `${base.name} +${upgradeLevel}`, isUpgraded: true, upgradeLevel };
    
    const scale = (val, factor = 0.3) => {
      const numVal = Number(val) || 0;
      return numVal > 0 ? numVal + Math.floor(numVal * factor * upgradeLevel) : val;
    };
    const flat = (val, interval) => {
      const numVal = Number(val) || 0;
      return numVal > 0 ? numVal + Math.floor(upgradeLevel / interval) : val;
    };

    upgraded.damage = scale(base.damage);
    upgraded.block = scale(base.block);
    upgraded.heal = scale(base.heal);
    
    upgraded.multiHit = flat(base.multiHit, 4);
    upgraded.enemyWeak = flat(base.enemyWeak, 4);
    upgraded.enemyVuln = flat(base.enemyVuln, 4);
    upgraded.enemyPoison = flat(base.enemyPoison, 4); 
    upgraded.selfStrength = flat(base.selfStrength, 4);
    upgraded.selfDex = flat(base.selfDex, 4);
    upgraded.manaGain = flat(base.manaGain, 5);
    upgraded.draw = flat(base.draw, 5);

    upgraded.enemyMark = flat(base.enemyMark, 4);
    upgraded.enemyFrail = flat(base.enemyFrail, 4);
    upgraded.selfRegen = flat(base.selfRegen, 4);
    upgraded.selfRage = flat(base.selfRage, 4);
    upgraded.selfInsight = flat(base.selfInsight, 4);

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

// ✨ 덱 리필 시스템 및 다중 드로우(하드보스 전용) 처리
export const generateEnemyIntent = (enemy, dmgMulti = 1) => {
  if (!enemy.template || !enemy.template.deck || enemy.template.deck.length === 0) {
    return [{ name: '오류 방지', type: 'attack', value: Math.floor(5 * dmgMulti), desc: '기본 공격을 합니다.', uid: Math.random().toString() }];
  }
  
  // enemy 객체에 설정된 턴당 카드 사용 장수를 가져옵니다.
  let cardsToDraw = enemy.cardsPerTurn || 1;
  let drawnCards = [];

  for (let i = 0; i < cardsToDraw; i++) {
    // 덱이 비어있다면 템플릿에서 다시 가져와 셔플 (리필)
    if (!enemy.drawPile || enemy.drawPile.length === 0) {
      enemy.drawPile = shuffle([...enemy.template.deck]);
    }
    
    // 카드 한 장 뽑기
    const baseCard = enemy.drawPile.pop();
    let newIntent = { ...baseCard, uid: Math.random().toString() + i };
    let newDesc = baseCard.desc || '';
    
    // 스케일링
    if (baseCard.value !== undefined) {
      let finalValue = Number(baseCard.value);
      if (baseCard.type && baseCard.type.includes('attack')) {
        finalValue = Math.floor(finalValue * dmgMulti);
      } 
      else if (baseCard.type && baseCard.type.includes('defend')) {
        finalValue = Math.floor(finalValue * (1 + (dmgMulti - 1) * 0.5));
      }
      newIntent.value = finalValue;
      newDesc = newDesc.replace(baseCard.value.toString(), newIntent.value.toString());
    } else {
      delete newIntent.value; 
    }
    
    if (baseCard.heal !== undefined) newIntent.heal = Number(baseCard.heal); 
    newIntent.desc = newDesc;
    
    drawnCards.push(newIntent);
  }
  
  return drawnCards; 
};

// ✨ 스테이지에 맞는 스폰 및 모드별 스케일링 (특수 보스 + 무한 모드 적용)
export const generateEnemies = (stage, mode = 'NORMAL') => {
  const s = Number(stage) || 1;
  let enemyTemplates = [];
  
  let hpMulti = 1 + (s * 0.01);
  let dmgMulti = 1 + (s * 0.01);

  try {
    if (mode === 'ENDLESS') {
      hpMulti = 1 + (s * 0.06) + Math.pow(s / 35, 1.15);
      dmgMulti = 1 + (s * 0.04) + Math.pow(s / 45, 1.1);
      
      if (s > 300) {
        if (s % 50 === 0) {
          const normalBoss = NORMAL_BOSSES[Math.floor(Math.random() * NORMAL_BOSSES.length)] || SPECIAL_BOSSES[100];
          const hardBoss = HARD_MODE_BOSSES[Math.floor(Math.random() * HARD_MODE_BOSSES.length)] || SPECIAL_BOSSES[100];
          enemyTemplates = [normalBoss, hardBoss];
        } else {
          const spawnCount = Math.floor(Math.random() * 2) + 2; 
          for(let i=0; i<spawnCount; i++) enemyTemplates.push(ENEMIES[Math.floor(Math.random() * ENEMIES.length)]);
        }
      } else {
        if (s === 300) enemyTemplates = [SPECIAL_BOSSES['H300'] || SPECIAL_BOSSES[100]]; 
        else if (s === 250) enemyTemplates = [SPECIAL_BOSSES['H250_A'] || SPECIAL_BOSSES[50], SPECIAL_BOSSES['H250_B'] || SPECIAL_BOSSES[75]]; 
        else if (s % 50 === 0) enemyTemplates = [SPECIAL_BOSSES[`H${s}`] || SPECIAL_BOSSES[s]]; 
        else if (s % 10 === 0) {
          const hardBossIndex = Math.min(Math.floor(s / 10) - 1, HARD_MODE_BOSSES.length - 1);
          enemyTemplates = [HARD_MODE_BOSSES[hardBossIndex]]; 
        } else {
          enemyTemplates = [ENEMIES[Math.floor(Math.random() * ENEMIES.length)]];
        }
      }
    } 
    else if (mode === 'HARD') {
      hpMulti = 1 + (s * 0.05) + Math.pow(s / 40, 1.1);
      dmgMulti = 1 + (s * 0.03) + Math.pow(s / 50, 1.04);

      if (s === 300) enemyTemplates = [SPECIAL_BOSSES['H300'] || SPECIAL_BOSSES[100]]; 
      else if (s === 250) enemyTemplates = [SPECIAL_BOSSES['H250_A'] || SPECIAL_BOSSES[50], SPECIAL_BOSSES['H250_B'] || SPECIAL_BOSSES[75]]; 
      else if (s % 50 === 0) enemyTemplates = [SPECIAL_BOSSES[`H${s}`] || SPECIAL_BOSSES[s]]; 
      else if (s % 10 === 0) {
        const hardBossIndex = Math.min(Math.floor(s / 10) - 1, HARD_MODE_BOSSES.length - 1);
        enemyTemplates = [HARD_MODE_BOSSES[hardBossIndex]]; 
      } else {
        enemyTemplates = [ENEMIES[Math.floor(Math.random() * ENEMIES.length)]];
      }
    } 
    else { // NORMAL
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
    let isNamedBoss = false;
    let isNormalBoss = false;

    if (mode === 'ENDLESS' && s > 300) {
        if (s % 50 === 0) isNamedBoss = true;
    } else if (mode === 'HARD' || mode === 'ENDLESS') {
        isNamedBoss = (s % 50 === 0);
        isNormalBoss = (s % 10 === 0 && !isNamedBoss);
    } else {
        isNamedBoss = [25, 50, 75, 100].includes(s);
        isNormalBoss = (s % 5 === 0 && !isNamedBoss);
    }
    
    let hpBase = Number(template.baseHp) || 50;
    let hpFinal = Math.floor(hpBase * hpMulti);
    
    if (isNamedBoss) hpFinal = Math.floor(hpFinal * 1.0); 
    else if (isNormalBoss) hpFinal = Math.floor(hpFinal * 0.5); 
    
    let name = template.name || '알 수 없는 적';
    if (enemyTemplates.length > 1) name += ` (${String.fromCharCode(65 + idx)})`; 

    // ✨ 하드 보스에게만 턴당 2장 사용 권한 부여
    let cardsPerTurn = 1;
    if ((mode === 'HARD' || mode === 'ENDLESS') && (isNamedBoss || isNormalBoss)) {
        cardsPerTurn = 2;
    }

    const newEnemy = {
      uid: Math.random().toString() + idx,
      name: name,
      hp: hpFinal,
      maxHp: hpFinal,
      block: 0,
      isBoss: isNamedBoss || isNormalBoss,
      dmgMultiplier: dmgMulti,
      template,
      cardsPerTurn, // 턴당 카드 장수 저장
      debuffs: { weak: 0, vulnerable: 0, poison: 0, mark: 0, frail: 0, silence: 0, bind: 0 },
      buffs: { strength: 0, intangible: 0, regen: 0, rage: 0 },
      passives: template.passives ? JSON.parse(JSON.stringify(template.passives)) : [],
      drawPile: shuffle(template.deck ? [...template.deck] : []) // 몬스터 덱 초기화
    };

    // ✨ 단일 intentCard 대신 배열 형태의 intentCards 할당
    newEnemy.intentCards = generateEnemyIntent(newEnemy, dmgMulti);

    return newEnemy;
  });
};

export const validateDeckStatus = (deckCounts) => {
  const total = Object.values(deckCounts || {}).reduce((a, b) => a + b, 0);
  const manaCount = MANA_CARD_IDS.reduce((acc, id) => acc + (deckCounts[id] || 0), 0);
  return { total, isManaValid: manaCount <= GAME_RULES.MAX_MANA_CARDS };
};