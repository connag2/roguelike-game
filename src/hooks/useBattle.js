// src/hooks/useBattle.js
import { useCallback } from 'react'; 
import { shuffle, calculateDamage, calculateBlock, clampStack } from '../utils/gameLogic';
import { GAME_RULES, CARD_LIBRARY, BOSS_LOOT_CARDS } from '../constants/gameData';
import { RELIC_LIBRARY } from '../constants/relicData';

export function useBattle({
  combatState, setCombatState,
  playerRelics, setPlayerRelics,
  fastMode, setToastMsg, setGameState, saveGame,
  gameStats, setGameStats,
  credits, setCredits,
  maxStageReached, setMaxStageReached,
  setPendingRelicReward, setSpecialBossRewardCard, setNormalCleared,
  setEnemyDropCard,
  setPendingRelicChoices
}) {

  const checkRevive = useCallback((target, enemiesArray) => {
    if (target.hp <= 0) {
      const rev = target.passives?.findIndex(ps => ps.id === 'revive');
      if (rev !== undefined && rev > -1) { 
        target.hp = Math.floor(target.maxHp / 2); 
        target.passives.splice(rev, 1); 
        setToastMsg(`${target.name} 부활!`); 
      } else if (enemiesArray) {
        const idx = enemiesArray.findIndex(e => e.uid === target.uid);
        if (idx > -1) enemiesArray.splice(idx, 1);
      }
    }
  }, [setToastMsg]);

  const handleVictory = useCallback((prevCombat, p) => {
    try {
      const isSpecialBoss = prevCombat.mode === 'HARD' ? (prevCombat.stage % 50 === 0) : [25, 50, 75, 100].includes(prevCombat.stage);
      const isNormalBoss = prevCombat.mode === 'HARD' ? (prevCombat.stage % 10 === 0 && !isSpecialBoss) : (prevCombat.stage % 5 === 0 && !isSpecialBoss);
      
      let newStats = { ...gameStats, totalKills: (gameStats?.totalKills || 0) + 1 };
      if (isNormalBoss || isSpecialBoss) newStats.totalBossKills = (newStats.totalBossKills || 0) + 1;
      
      if (prevCombat.stage >= maxStageReached) setMaxStageReached(prevCombat.stage + 1);
      
      let extraCredits = 0, healAmount = 0;
      (playerRelics || []).forEach(r => {
        if (r.effect?.type === 'END_COMBAT_CREDITS') extraCredits += r.effect.bonus;
        if (r.effect?.type === 'END_COMBAT_HEAL') healAmount += r.effect.heal;
      });

      let earned = 5 + prevCombat.stage + (Math.floor(prevCombat.stage / 5) * 5) + extraCredits;
      if (isNormalBoss || isSpecialBoss) earned += 15;
      p.hp = Math.min(p.maxHp, p.hp + healAmount);
      
      newStats.totalCreditsEarned = (newStats.totalCreditsEarned || 0) + earned;
      setGameStats(newStats);
      setCredits(credits + earned);

      const isAnyBoss = isNormalBoss || isSpecialBoss || (prevCombat.stage > 0 && prevCombat.stage % 10 === 0);
      const availableRelics = RELIC_LIBRARY.filter(r => !(playerRelics || []).some(pr => pr?.id === r.id));

      let droppedRelic = null;
      let droppedRelicChoices = [];
      
      if (isAnyBoss) {
        let choices = [];
        let pool = [...availableRelics];
        for (let i = 0; i < 3; i++) {
          if (pool.length === 0) break;
          const rIdx = Math.floor(Math.random() * pool.length);
          choices.push(pool[rIdx]);
          pool.splice(rIdx, 1);
        }
        droppedRelicChoices = choices;
      } else {
        let relicDropChance = 0.05;
        if (Math.random() < relicDropChance && availableRelics.length > 0) {
          droppedRelic = availableRelics[Math.floor(availableRelics.length * Math.random())];
        }
      }

      // 🌟 [추가 로직] 적 및 보스 카드 무작위 드랍 시스템 (밸런스 패치 적용 + 전용 전리품)
      let enemyDroppedCards = [];
      let bossDroppedCards = [];

      prevCombat.enemies.forEach(enemy => {
        const isThisEnemyBoss = enemy.isBoss || isNormalBoss || isSpecialBoss;
        const dropChance = isThisEnemyBoss ? 1.0 : 0.10; // 보스 100% 확정, 일반 적 10%

        if (Math.random() < dropChance && enemy.template && enemy.template.deck && enemy.template.deck.length > 0) {
          
          let selectedCard = null;

          if (isThisEnemyBoss) {
            // ✨ 100층 이상에서 5% 확률로 퓨리오소 드랍 (기존 10%에서 너프)
            if (prevCombat.stage >= 100 && Math.random() < 0.05) {
              const furiosoCard = CARD_LIBRARY.find(c => c.id === 'furioso');
              if (furiosoCard) selectedCard = furiosoCard;
            }

            if (!selectedCard) {
              // ✨ 보스 이름이 포함된 고유 전리품 필터링
              const specificLoots = BOSS_LOOT_CARDS.filter(c => c.desc && c.desc.includes(`[${enemy.template.name}]`));
              
              if (specificLoots.length > 0) {
                selectedCard = specificLoots[Math.floor(Math.random() * specificLoots.length)];
              } else {
                // 전용 전리품이 없다면 덱에서 하나 드랍
                const randomIdx = Math.floor(Math.random() * enemy.template.deck.length);
                selectedCard = enemy.template.deck[randomIdx];
              }
            }
          } else {
            // 패턴 중 하나를 무작위 선택
            const randomIdx = Math.floor(Math.random() * enemy.template.deck.length);
            selectedCard = enemy.template.deck[randomIdx];
          }

          if (selectedCard) {
            // ⚖️ 밸런스 패치: 적의 기본 수치가 플레이어 스케일을 파괴하지 않도록 조정
            let rawDamage = selectedCard.value || selectedCard.damage || 0;
            let rawBlock = selectedCard.type === 'defend' ? (selectedCard.value || selectedCard.block || 0) : 0;
            let rawHeal = selectedCard.heal || 0;
            let rawMulti = selectedCard.multi || selectedCard.multiHit || 1;

            let nerfedDamage = isThisEnemyBoss ? Math.min(30, Math.ceil(rawDamage * 0.4)) : Math.min(15, Math.ceil(rawDamage * 0.8));
            let nerfedBlock = isThisEnemyBoss ? Math.min(30, Math.ceil(rawBlock * 0.4)) : Math.min(15, Math.ceil(rawBlock * 0.8));
            let nerfedHeal = isThisEnemyBoss ? Math.min(20, Math.ceil(rawHeal * 0.05)) : Math.min(10, Math.ceil(rawHeal * 0.5));
            let nerfedMulti = Math.min(4, rawMulti); 

            const convertedCard = {
              ...selectedCard,
              id: selectedCard.id && !selectedCard.id.startsWith('drop_') ? `drop_${enemy.name}_${selectedCard.id}` : selectedCard.id, // ✨ 무작위 난수 제거 (중복 파밍 가능하게 변경)
              name: `${enemy.name}의 ${selectedCard.name}`,
              type: (selectedCard.type && selectedCard.type.includes('attack')) ? 'attack' : 'skill',
              cost: isThisEnemyBoss ? 2 : 1, 
              rarity: 'loot', // ✨ 전리품 전용 카테고리로 묶음
              desc: `(전리품) ${selectedCard.desc}`,
              damage: nerfedDamage,
              multiHit: nerfedMulti,
              block: nerfedBlock,
              heal: nerfedHeal,
              isFromBoss: isThisEnemyBoss
            };

            if (selectedCard.debuff) {
              const turns = Math.min(3, selectedCard.turns || 1); 
              if (selectedCard.debuff === 'weak') convertedCard.enemyWeak = turns;
              if (selectedCard.debuff === 'vulnerable') convertedCard.enemyVuln = turns;
              if (selectedCard.debuff === 'poison') convertedCard.enemyPoison = turns;
              if (selectedCard.debuff === 'mark') convertedCard.enemyMark = turns;
              if (selectedCard.debuff === 'frail') convertedCard.enemyFrail = turns;
              if (selectedCard.debuff === 'silence') convertedCard.enemySilence = turns;
              if (selectedCard.debuff === 'bind') convertedCard.enemyBind = turns;
            }

            if (selectedCard.buff) {
              const val = Math.min(2, selectedCard.buffValue || selectedCard.amount || 1);
              if (selectedCard.buff === 'strength') convertedCard.selfStrength = val;
            }

            if (isThisEnemyBoss) {
              bossDroppedCards.push(convertedCard);
            } else {
              enemyDroppedCards.push(convertedCard);
            }
          }
        }
      });

      // 층별 확정 카드 보상 로직
      const determineReward = (st) => {
        const roll = Math.random();
        
        if (isSpecialBoss) {
          if (roll < 0.005 && maxStageReached >= 30) return CARD_LIBRARY.find(c => c.id === 'furioso');
          
          if ((prevCombat.mode === 'NORMAL' && st === 100) || (prevCombat.mode === 'HARD' && st === 300)) {
            return roll < 0.10 ? CARD_LIBRARY.find(c => c.id === 'furioso') : CARD_LIBRARY.find(c => c.id === 'slime_snot');
          }
          
          const specialCards = ['spider_queen_poison', 'twerking', 'power_of_asura'];
          return CARD_LIBRARY.find(c => c.id === specialCards[Math.floor(Math.random() * specialCards.length)]);
        }
        
        if (isNormalBoss && roll < 0.05 && maxStageReached >= 10) {
          const strongCards = ['vampire_sword', 'absolute_defense', 'execute', 'snipe'];
          return CARD_LIBRARY.find(c => c.id === strongCards[Math.floor(Math.random() * strongCards.length)]);
        }
        
        return null;
      };

      const spReward = determineReward(prevCombat.stage);
      
      // 보스가 드랍한 카드를 1순위로, 기존 보상을 2순위로 뽓스카드에 할당
      let finalBossCard = null;
      if (bossDroppedCards.length > 0) {
        finalBossCard = bossDroppedCards[0];
        setSpecialBossRewardCard(finalBossCard);
      } else if (spReward) {
        finalBossCard = spReward;
        setSpecialBossRewardCard(spReward);
      }

      // 일반 적이 드랍한 카드를 상태에 저장
      if (enemyDroppedCards.length > 0 && typeof setEnemyDropCard === 'function') {
        setEnemyDropCard(enemyDroppedCards[0]); 
      }

      saveGame({ credits: credits + earned, maxStageReached: prevCombat.stage >= maxStageReached ? prevCombat.stage + 1 : maxStageReached, gameStats: newStats });
      
      if (droppedRelicChoices && droppedRelicChoices.length > 0) {
        if (typeof setPendingRelicChoices === 'function') {
           setPendingRelicChoices(droppedRelicChoices);
        }
        setTimeout(() => setGameState('BOSS_RELIC_CHOICE'), 600);
      } else if (droppedRelic) {
        setPendingRelicReward(droppedRelic);
        setTimeout(() => setGameState('RELIC_REWARD'), 600);
      } else {
        if (finalBossCard) {
          setTimeout(() => setGameState('BOSS_CLEAR_REWARD'), 600);
        } else if ((prevCombat.mode === 'NORMAL' && prevCombat.stage >= 100) || (prevCombat.mode === 'HARD' && prevCombat.stage >= 300)) { 
          if (prevCombat.mode === 'NORMAL') {
            setNormalCleared(true);
            saveGame({ normalCleared: true });
          }
          else if (prevCombat.mode === 'HARD' && prevCombat.stage >= 300) {
            setToastMsg('🎉 하드 모드 완전 클리어! 유물 3개를 선택하세요!');
            setTimeout(() => setGameState('HARD_CLEAR_RELIC_CHOICE'), 600);
            return;
          }
          setGameState('GAME_CLEAR'); 
        } else {
          setTimeout(() => setGameState('REWARDS'), 600);
        }
      }
    } catch (err) {
      console.error("보상 처리 중 에러 발생:", err);
      setTimeout(() => setGameState('REWARDS'), 600);
    }
  }, [gameStats, maxStageReached, playerRelics, credits, setGameStats, setCredits, setMaxStageReached, setPendingRelicReward, setSpecialBossRewardCard, saveGame, setGameState, setNormalCleared, setToastMsg]);

  // ✨ 플레이어 카드 사용 로직 안정화 (버그 방지)
  const playCard = useCallback(async (cardIndex, targetIndex = 0) => {
    if (!combatState || combatState.turn !== 'PLAYER') return;
    
    // 카드가 존재하는지 안전 검사
    const card = combatState.hand[cardIndex];
    if (!card) return;

    const pDebuffs = combatState.player.debuffs || {};

    if (card.type === 'attack' && (pDebuffs.bind || 0) > 0) {
      setToastMsg("속박되어 공격 카드를 사용할 수 없습니다!");
      return;
    }
    if (card.type === 'skill' && (pDebuffs.silence || 0) > 0) {
      setToastMsg("침묵 상태라 스킬 카드를 사용할 수 없습니다!");
      return;
    }

    if (combatState.player.mana < card.cost) {
      setToastMsg("마나가 부족합니다!");
      return;
    }

    // 카드 사용 처리를 동기적으로 한 번에 모아서 State를 업데이트합니다.
    
    let currentState = combatState;
    const mutate = async (updater) => {
      currentState = updater(currentState);
      setCombatState(currentState);
    };

    let p = { ...currentState.player, buffs: { ...currentState.player.buffs }, debuffs: { ...currentState.player.debuffs } };
    p.mana -= (card.cost || 0);
    let newHand = [...currentState.hand];
    let newDraw = [...currentState.drawPile];
    let newDiscard = [...currentState.discardPile];
    let newExhaust = [...(currentState.exhaustPile || [])];
    let newEnemies = currentState.enemies.map(e => ({ ...e, buffs: { ...e.buffs }, debuffs: { ...e.debuffs }, block: e.block }));
    
    newHand.splice(cardIndex, 1);
    if (card.exhaust) newExhaust.push(card);
    else if (!card.consumeAllMana) newDiscard.push(card);

    // 1. 유물 효과
    if (playerRelics) {
      playerRelics.forEach(relic => {
        if (relic.effect?.type === 'ON_CARD_PLAY') {
           if (relic.effect.specificCardId && relic.effect.specificCardId !== card.id) return;
           if (!relic.effect.cardType || relic.effect.cardType === card.type) {
              const chance = relic.effect.chance || 1.0;
              if (Math.random() <= chance) {
                 if (relic.effect.strength) p.buffs.strength = clampStack((p.buffs.strength || 0) + relic.effect.strength);
                 if (relic.effect.insight) p.buffs.insight = clampStack((p.buffs.insight || 0) + relic.effect.insight);
                 if (relic.effect.heal) p.hp = Math.min(p.maxHp, p.hp + relic.effect.heal);
                 if (relic.effect.mana) p.mana = clampStack(p.mana + relic.effect.mana, p.maxMana + 99);
                 if (relic.effect.block) p.block += relic.effect.block;
              }
           }
        }
      });
    }

    const isWin = !card.gamble || Math.random() < card.gambleWinChance;
    
    if (card.type === 'attack' && (p.buffs.rage || 0) > 0) p.block += p.buffs.rage;
    
    if (isWin) {
      if (card.gamble) setToastMsg('도박 성공!');
      if (card.block && !card.doubleBlock && !card.percentBlockMaxHp) p.block += calculateBlock(card.block, p.buffs.dexterity, p.debuffs.frail || 0);
      if (card.doubleBlock) p.block *= 2;
      if (card.percentBlockMaxHp) p.block += Math.floor(p.maxHp * (card.percentBlockMaxHp / 100)) + (p.buffs.dexterity || 0);
      if (card.cleanse) {
          p.debuffs = { weak: 0, vulnerable: 0, poison: 0, mark: 0, frail: 0, silence: 0, bind: 0, burn: 0, bleed: 0, frost: 0 };
          setToastMsg('모든 상태 이상이 해제되었습니다!');
      }
      if (card.heal && !card.gamble) p.hp = Math.min(p.maxHp, p.hp + (Number(card.heal) || 0));
      if (card.manaGain && !card.gamble) p.mana = clampStack(p.mana + (Number(card.manaGain) || 0), p.maxMana + 99);
      if (card.winManaGain) p.mana += (Number(card.winManaGain) || 0);
      if (card.selfStrength) p.buffs.strength = clampStack((p.buffs.strength || 0) + card.selfStrength);
      if (card.selfDex) p.buffs.dexterity = clampStack((p.buffs.dexterity || 0) + card.selfDex);
      if (card.selfThorns) p.buffs.thorns = clampStack((p.buffs.thorns || 0) + card.selfThorns);
      if (card.selfDamage) p.hp -= (Number(card.selfDamage) || 0);
      if (card.selfIntangible) p.buffs.intangible = clampStack((p.buffs.intangible || 0) + card.selfIntangible, 999, true); 
      if (card.selfRegen) p.buffs.regen = clampStack((p.buffs.regen || 0) + card.selfRegen);
      if (card.selfRage) p.buffs.rage = clampStack((p.buffs.rage || 0) + card.selfRage);
      if (card.selfInsight) p.buffs.insight = clampStack((p.buffs.insight || 0) + card.selfInsight);
      if (card.id === 'offensive_stance') p.stance = 'offensive';
      if (card.id === 'defensive_stance') p.stance = 'defensive';
      if (card.id === 'summon_golem') p.minion = { id: 'golem', name: '바위 골렘', hp: 40, maxHp: 40 };
      if (card.id === 'summon_fairy') p.minion = { id: 'fairy', name: '숲의 요정', hp: 15, maxHp: 15 };
    } else {
      setToastMsg('도박 실패...');
      if (card.loseSelfDamage) p.hp -= (Number(card.loseSelfDamage) || 0);
      if (card.losePercentMaxHpDamage) p.hp -= Math.floor(p.maxHp * card.losePercentMaxHpDamage);
    }

    for (let i = 0; i < (card.draw || 0); i++) {
      if (newHand.length >= (GAME_RULES?.MAX_HAND_SIZE || 10)) break;
      if (newDraw.length === 0) { 
        if (newDiscard.length === 0) break; 
        newDraw = shuffle(newDiscard); 
        newDiscard = []; 
      }
      if (newDraw.length > 0) newHand.push({ ...newDraw.pop(), uid: Math.random().toString() });
    }

    await mutate(prev => ({ ...prev, player: p, hand: newHand, discardPile: newDiscard, drawPile: newDraw, exhaustPile: newExhaust, enemies: newEnemies }));

    if (newEnemies.length > 0) {
      let currentDamage = Number(card.damage) || 0;
      if (p.stance === 'offensive' && currentDamage > 0) currentDamage = Math.floor(currentDamage * 1.5);
      if (p.stance === 'defensive' && currentDamage > 0) currentDamage = Math.floor(currentDamage * 0.75);

      const hits = (card.damage && isWin) ? (card.multiHit || 1) : 1;
      let currentTargetIdx = targetIndex;

      for (let i = 0; i < hits; i++) {
        if (newEnemies.length === 0) break;
        if (currentTargetIdx >= newEnemies.length) currentTargetIdx = 0;
        let target = newEnemies[currentTargetIdx];

        if (isWin) {
          if (i === 0) {
            const applySpecialDamage = (amt) => {
              let dmg = calculateDamage(amt, p.buffs?.strength || 0, p.debuffs?.weak || 0, target.debuffs?.vulnerable || 0, target.debuffs?.mark || 0, target.buffs?.intangible || 0);
              if (target.block >= dmg) target.block -= dmg; 
              else { target.hp = Math.max(0, target.hp - (dmg - target.block)); target.block = 0; }
              checkRevive(target, newEnemies);
            };
            if (card.winDamage) applySpecialDamage(target.isBoss ? card.winDamageBoss : card.winDamage);
            if (card.missingHpDamage) applySpecialDamage((Number(card.damage) || 0) + Math.floor((p.maxHp - p.hp) * card.missingHpDamage));
            else if (card.consumeAllMana) { 
                applySpecialDamage((Number(card.damage) || 0) + Math.floor(currentState.player.mana * (card.manaMultiplier || 0))); 
                p.mana = 0; 
            }
            if (card.exhaustStackDamage) applySpecialDamage((Number(card.damage) || 0) + Math.floor(newExhaust.length * card.exhaustStackDamage));
            if (card.doubleDamageIfVuln && target.debuffs?.vulnerable > 0) currentDamage *= 2;

            if (card.enemyWeak) target.debuffs.weak = clampStack((target.debuffs.weak || 0) + card.enemyWeak);
            if (card.enemyVuln) target.debuffs.vulnerable = clampStack((target.debuffs.vulnerable || 0) + card.enemyVuln);
            if (card.enemyPoison) target.debuffs.poison = clampStack((target.debuffs.poison || 0) + card.enemyPoison);
            if (card.enemyMark) target.debuffs.mark = clampStack((target.debuffs.mark || 0) + card.enemyMark);
            if (card.enemyFrail) target.debuffs.frail = clampStack((target.debuffs.frail || 0) + card.enemyFrail);
            if (card.enemyBurn) target.debuffs.burn = clampStack((target.debuffs.burn || 0) + card.enemyBurn);
            if (card.enemyBleed) target.debuffs.bleed = clampStack((target.debuffs.bleed || 0) + card.enemyBleed);
            if (card.enemyFrost) target.debuffs.frost = clampStack((target.debuffs.frost || 0) + card.enemyFrost);
            if (card.enemySilence) target.debuffs.silence = clampStack((target.debuffs.silence || 0) + card.enemySilence, 999, true);
            if (card.enemyBind) target.debuffs.bind = clampStack((target.debuffs.bind || 0) + card.enemyBind, 999, true);
          }

          if (card.damage && !card.missingHpDamage && !card.consumeAllMana && !card.exhaustStackDamage) { 
            let dmg = calculateDamage(currentDamage, p.buffs?.strength || 0, p.debuffs?.weak || 0, target.debuffs?.vulnerable || 0, target.debuffs?.mark || 0, target.buffs?.intangible || 0);
            if (target.block >= dmg) target.block -= dmg; 
            else { target.hp = Math.max(0, target.hp - (dmg - target.block)); target.block = 0; }
            checkRevive(target, newEnemies);
            if (card.increasingDamage) currentDamage += (Number(card.increasingDamage) || 0); 
          }
        } else if (i === 0) {
          if (card.loseDamage) {
            let dmg = calculateDamage(card.loseDamage, p.buffs?.strength || 0, p.debuffs?.weak || 0, target.debuffs?.vulnerable || 0, target.debuffs?.mark || 0, target.buffs?.intangible || 0);
            if (target.block >= dmg) target.block -= dmg; 
            else { target.hp = Math.max(0, target.hp - (dmg - target.block)); target.block = 0; }
            checkRevive(target, newEnemies);
          }
        }
        
        await mutate(prev => ({ ...prev, player: p, enemies: [...newEnemies], hitEffect: { targetUid: target.uid, type: 'hit' } }));
        await new Promise(r => setTimeout(r, 150)); // 💥 다단히트 지연
        await mutate(prev => ({ ...prev, hitEffect: null }));
      }
    }

    if (p.hp <= 0) {
      setGameState('GAME_OVER');
    } else if (newEnemies.length === 0) {
      handleVictory(currentState, p);
    }
  }, [combatState, checkRevive, setToastMsg, handleVictory, setGameState]);

  return { playCard, checkRevive };
}
