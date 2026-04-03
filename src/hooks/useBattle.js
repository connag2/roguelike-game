// src/hooks/useBattle.js
import { useEffect, useCallback } from 'react';
import { shuffle, decayStack, calculateDamage, calculateBlock, clampStack } from '../utils/gameLogic';
import { GAME_RULES, CARD_LIBRARY } from '../constants/gameData';
import { RELIC_LIBRARY } from '../constants/relicData';

export function useBattle({
  combatState, setCombatState,
  playerRelics, setPlayerRelics,
  fastMode, setToastMsg, setGameState, saveGame,
  gameStats, setGameStats,
  credits, setCredits,
  maxStageReached, setMaxStageReached,
  setPendingRelicReward, setSpecialBossRewardCard, setNormalCleared,
  setEnemyDropCard // 🌟 일반 적이 떨군 카드를 처리하기 위한 함수
}) {

  const checkRevive = useCallback((target, enemiesArray) => {
    if (target.hp <= 0) {
      const rev = target.passives?.findIndex(ps => ps.id === 'revive');
      if (rev !== undefined && rev > -1) { 
        target.hp = Math.floor(target.maxHp / 2); 
        target.passives.splice(rev, 1); 
        setToastMsg(`${target.name} 부활!`); 
      } else if (enemiesArray) {
        const idx = enemiesArray.indexOf(target);
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

        let relicDropChance = isSpecialBoss ? 0.50 : isNormalBoss ? 0.20 : 0.05;
        let droppedRelic = null;
        
        if (Math.random() < relicDropChance) {
          const availableRelics = RELIC_LIBRARY.filter(r => !(playerRelics || []).some(pr => pr?.id === r.id));
          if (availableRelics.length > 0) droppedRelic = availableRelics[Math.floor(availableRelics.length * Math.random())];
        }

        // 🌟 [추가 로직] 적 및 보스 카드 무작위 드랍 시스템 (밸런스 패치 적용)
        let enemyDroppedCards = [];
        let bossDroppedCards = [];

        prevCombat.enemies.forEach(enemy => {
          const isThisEnemyBoss = enemy.isBoss || isNormalBoss || isSpecialBoss;
          const dropChance = isThisEnemyBoss ? 1.0 : 0.10; // 보스 100% 확정, 일반 적 10%

          if (Math.random() < dropChance && enemy.template && enemy.template.deck && enemy.template.deck.length > 0) {
            
            // 패턴 중 하나를 무작위 선택
            const randomIdx = Math.floor(Math.random() * enemy.template.deck.length);
            const enemyCardDef = enemy.template.deck[randomIdx];

            // ⚖️ 밸런스 패치: 적의 기본 수치가 플레이어 스케일을 파괴하지 않도록 조정
            let rawDamage = enemyCardDef.value || 0;
            let rawBlock = enemyCardDef.type === 'defend' ? (enemyCardDef.value || 0) : 0;
            let rawHeal = enemyCardDef.heal || 0;
            let rawMulti = enemyCardDef.multi || 1;

            let nerfedDamage = isThisEnemyBoss ? Math.min(30, Math.ceil(rawDamage * 0.4)) : Math.min(15, Math.ceil(rawDamage * 0.8));
            let nerfedBlock = isThisEnemyBoss ? Math.min(30, Math.ceil(rawBlock * 0.4)) : Math.min(15, Math.ceil(rawBlock * 0.8));
            let nerfedHeal = isThisEnemyBoss ? Math.min(20, Math.ceil(rawHeal * 0.05)) : Math.min(10, Math.ceil(rawHeal * 0.5));
            let nerfedMulti = Math.min(4, rawMulti); 

            const convertedCard = {
              id: `drop_${enemy.name}_${enemyCardDef.name}`, // ✨ 무작위 난수 제거 (중복 파밍 가능하게 변경)
              name: `${enemy.name}의 ${enemyCardDef.name}`,
              type: (enemyCardDef.type && enemyCardDef.type.includes('attack')) ? 'attack' : 'skill',
              cost: isThisEnemyBoss ? 2 : 1, 
              rarity: 'loot', // ✨ 전리품 전용 카테고리로 묶음
              desc: `(전리품) ${enemyCardDef.desc}`,
              damage: nerfedDamage,
              multiHit: nerfedMulti,
              block: nerfedBlock,
              heal: nerfedHeal,
            };c

            if (enemyCardDef.debuff) {
              const turns = Math.min(3, enemyCardDef.turns || 1); 
              if (enemyCardDef.debuff === 'weak') convertedCard.enemyWeak = turns;
              if (enemyCardDef.debuff === 'vulnerable') convertedCard.enemyVuln = turns;
              if (enemyCardDef.debuff === 'poison') convertedCard.enemyPoison = turns;
              if (enemyCardDef.debuff === 'mark') convertedCard.enemyMark = turns;
              if (enemyCardDef.debuff === 'frail') convertedCard.enemyFrail = turns;
              if (enemyCardDef.debuff === 'silence') convertedCard.enemySilence = turns;
              if (enemyCardDef.debuff === 'bind') convertedCard.enemyBind = turns;
            }

            if (enemyCardDef.buff) {
              const val = Math.min(2, enemyCardDef.buffValue || enemyCardDef.amount || 1);
              if (enemyCardDef.buff === 'strength') convertedCard.selfStrength = val;
            }

            if (isThisEnemyBoss) {
              bossDroppedCards.push(convertedCard);
            } else {
              enemyDroppedCards.push(convertedCard);
            }
          }
        });

        // 층별 확정 카드 보상 로직
        const determineReward = (st) => {
          const roll = Math.random();
          
          if (isSpecialBoss) {
            if (roll < 0.01) return CARD_LIBRARY.find(c => c.id === 'furioso');
            
            if ((prevCombat.mode === 'NORMAL' && st === 100) || (prevCombat.mode === 'HARD' && st === 300)) {
              return roll < 0.25 ? CARD_LIBRARY.find(c => c.id === 'furioso') : CARD_LIBRARY.find(c => c.id === 'slime_snot');
            }
            
            const specialCards = ['spider_queen_poison', 'twerking', 'power_of_asura'];
            return CARD_LIBRARY.find(c => c.id === specialCards[Math.floor(Math.random() * specialCards.length)]);
          }
          
          if (isNormalBoss && roll < 0.10) {
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
        
        if (droppedRelic) {
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
            setGameState('GAME_CLEAR'); 
          } else {
            setTimeout(() => setGameState('REWARDS'), 600);
          }
        }
      } catch (err) {
        console.error("보상 처리 중 에러 발생:", err);
        setTimeout(() => setGameState('REWARDS'), 600);
      }
  }, [gameStats, maxStageReached, playerRelics, credits, setGameStats, setCredits, setMaxStageReached, setPendingRelicReward, setSpecialBossRewardCard, saveGame, setGameState, setNormalCleared, setEnemyDropCard]);

  const playCard = useCallback(async (cardIndex) => {
    if (combatState.turn !== 'PLAYER') return;
    const card = combatState.hand[cardIndex];
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

    const isWin = !card.gamble || Math.random() < card.gambleWinChance;
    const hits = (card.damage && isWin) ? (card.multiHit || 1) : 1;

    setCombatState(prev => {
      let p = { ...prev.player };
      
      p.buffs = { ...(prev.player.buffs || {}) };
      p.debuffs = { ...(prev.player.debuffs || {}) };

      let newHand = [...prev.hand];
      let newDiscard = [...prev.discardPile];
      let newDraw = [...prev.drawPile];

      p.mana -= card.cost;

      if (card.type === 'attack' && (p.buffs.rage || 0) > 0) {
        p.block += p.buffs.rage;
      }
      
      if (isWin) {
        if (card.block && !card.doubleBlock && !card.percentBlockMaxHp) {
            p.block += calculateBlock(card.block, p.buffs.dexterity, p.debuffs.frail || 0);
        }
        if (card.doubleBlock) p.block *= 2;
        if (card.percentBlockMaxHp) p.block += Math.floor(p.maxHp * (card.percentBlockMaxHp / 100)) + (p.buffs.dexterity || 0);
        
        if (card.cleanse) {
            p.debuffs = { weak: 0, vulnerable: 0, poison: 0, mark: 0, frail: 0, silence: 0, bind: 0 };
            setToastMsg("모든 상태 이상이 해제되었습니다!");
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
      }

      newHand.splice(cardIndex, 1); 

      for(let i=0; i<(card.draw || 0); i++) {
        if(newHand.length >= (GAME_RULES?.MAX_HAND_SIZE || 10)) break;
        if(newDraw.length === 0) { if(newDiscard.length === 0) break; newDraw = shuffle(newDiscard); newDiscard = []; }
        if(newDraw.length > 0) newHand.push({ ...newDraw.pop(), uid: Math.random().toString() });
      }
      
      if (!card.exhaust) {
        newDiscard.push(card);
      }

      return { ...prev, player: p, hand: newHand, discardPile: newDiscard, drawPile: newDraw };
    });

    let currentDamage = Number(card.damage) || 0;

    for (let i = 0; i < hits; i++) {
      if (i > 0) await new Promise(r => setTimeout(r, 0));

      setCombatState(prev => {
        if (prev.enemies.length === 0) return prev; 

        let p = { ...prev.player };
        let newEnemies = prev.enemies.map(e => ({...e, buffs: {...e.buffs}, debuffs: {...e.debuffs}}));

        const deal = (amt) => {
          if (newEnemies.length === 0) return;
          let target = newEnemies[0];
          target.buffs = target.buffs || {};
          target.debuffs = target.debuffs || {};

          let dmg = calculateDamage(
              amt, 
              p.buffs?.strength || 0, 
              p.debuffs?.weak || 0, 
              target.debuffs?.vulnerable || 0,
              target.debuffs?.mark || 0,
              target.buffs?.intangible || 0
          );
          
          if (target.block >= dmg) {
            target.block -= dmg; 
          } else { 
            const remainingDmg = dmg - target.block;
            target.hp = Math.max(0, Math.floor(target.hp - remainingDmg)); 
            target.block = 0; 
          }
          checkRevive(target, newEnemies);
        };

        if (isWin) {
          if (i === 0) {
            if (card.gamble) setToastMsg("도박 성공!");

            if (card.winDamage) deal(newEnemies[0]?.isBoss ? card.winDamageBoss : card.winDamage);
            if (card.missingHpDamage) deal((Number(card.damage) || 0) + Math.floor((p.maxHp - p.hp) * card.missingHpDamage));
            else if (card.consumeAllMana) { 
                deal((Number(card.damage) || 0) + Math.floor(prev.player.mana * (card.manaMultiplier || 0))); 
                p.mana = 0; 
            }
            
            if (card.enemyWeak) newEnemies[0].debuffs.weak = clampStack((newEnemies[0].debuffs.weak || 0) + card.enemyWeak);
            if (card.enemyVuln) newEnemies[0].debuffs.vulnerable = clampStack((newEnemies[0].debuffs.vulnerable || 0) + card.enemyVuln);
            if (card.enemyPoison) newEnemies[0].debuffs.poison = clampStack((newEnemies[0].debuffs.poison || 0) + card.enemyPoison);
            if (card.enemyMark) newEnemies[0].debuffs.mark = clampStack((newEnemies[0].debuffs.mark || 0) + card.enemyMark);
            if (card.enemyFrail) newEnemies[0].debuffs.frail = clampStack((newEnemies[0].debuffs.frail || 0) + card.enemyFrail);
            
            if (card.enemySilence) newEnemies[0].debuffs.silence = clampStack((newEnemies[0].debuffs.silence || 0) + card.enemySilence, 999, true);
            if (card.enemyBind) newEnemies[0].debuffs.bind = clampStack((newEnemies[0].debuffs.bind || 0) + card.enemyBind, 999, true);
          }

          if (card.damage && !card.missingHpDamage && !card.consumeAllMana) { 
            deal(currentDamage); 
            if (card.increasingDamage) currentDamage += (Number(card.increasingDamage) || 0); 
          }
        } else if (i === 0) {
          setToastMsg("도박 실패...");
          if (card.loseDamage) deal(card.loseDamage);
          if (card.loseSelfDamage) p.hp -= (Number(card.loseSelfDamage) || 0);
          if (card.losePercentMaxHpDamage) p.hp -= Math.floor(p.maxHp * card.losePercentMaxHpDamage);
        }

        if (newEnemies.length === 0) {
          handleVictory(prev, p);
          return { ...prev, player: p, enemies: [] };
        }
        return { ...prev, player: p, enemies: newEnemies };
      });
    }
  }, [combatState, checkRevive, setToastMsg, GAME_RULES, handleVictory]);

  return { playCard, checkRevive };
}