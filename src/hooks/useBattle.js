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
  setPendingRelicReward, setSpecialBossRewardCard, setNormalCleared
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

  // 승리 보상 처리 로직 분리
  const handleVictory = useCallback((prevCombat, p) => {
    try {
        const isSpecialBoss = [25, 50, 75, 100].includes(prevCombat.stage);
        const isNormalBoss = prevCombat.stage % 5 === 0 && !isSpecialBoss;
        
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
          if (availableRelics.length > 0) droppedRelic = availableRelics[Math.floor(Math.random() * availableRelics.length)];
        }

        const determineReward = (st) => {
          const roll = Math.random();
          if ([25, 50, 75].includes(st)) {
            if (roll < 0.01) return CARD_LIBRARY.find(c => c.id === 'furioso');
            if (roll < 0.11) {
              if (st === 25) return CARD_LIBRARY.find(c => c.id === 'spider_queen_poison');
              if (st === 50) return CARD_LIBRARY.find(c => c.id === 'twerking');
              if (st === 75) return CARD_LIBRARY.find(c => c.id === 'power_of_asura');
            }
          }
          if (st === 100) return roll < 0.25 ? CARD_LIBRARY.find(c => c.id === 'furioso') : CARD_LIBRARY.find(c => c.id === 'slime_snot');
          if (isNormalBoss && roll < 0.10) {
            const strongCards = ['vampire_sword', 'absolute_defense', 'execute', 'snipe'];
            return CARD_LIBRARY.find(c => c.id === strongCards[Math.floor(Math.random() * strongCards.length)]);
          }
          return null;
        };

        const spReward = determineReward(prevCombat.stage);
        if (spReward) setSpecialBossRewardCard(spReward);

        saveGame({ credits: credits + earned, maxStageReached: prevCombat.stage >= maxStageReached ? prevCombat.stage + 1 : maxStageReached, gameStats: newStats });
        
        if (droppedRelic) {
          setPendingRelicReward(droppedRelic);
          setTimeout(() => setGameState('RELIC_REWARD'), 600);
        } else {
          if (spReward) setTimeout(() => setGameState('BOSS_CLEAR_REWARD'), 600);
          else if (prevCombat.mode === 'NORMAL' && prevCombat.stage >= 100) { setNormalCleared(true); saveGame({ normalCleared: true }); setGameState('GAME_CLEAR'); }
          else setTimeout(() => setGameState('REWARDS'), 600);
        }
      } catch (err) {
        console.error("보상 처리 중 에러 발생:", err);
        setTimeout(() => setGameState('REWARDS'), 600);
      }
  }, [gameStats, maxStageReached, playerRelics, credits, setGameStats, setCredits, setMaxStageReached, setPendingRelicReward, setSpecialBossRewardCard, saveGame, setGameState, setNormalCleared]);

  // 비동기 루프로 변경되어 데미지 순차 적용 구현
  const playCard = useCallback(async (cardIndex) => {
    if (combatState.turn !== 'PLAYER') return;
    const card = combatState.hand[cardIndex];
    if (combatState.player.mana < card.cost) {
      setToastMsg("마나가 부족합니다!");
      return;
    }

    const isWin = !card.gamble || Math.random() < card.gambleWinChance;
    const hits = (card.damage && isWin) ? (card.multiHit || 1) : 1;
    const delay = fastMode ? 100 : 200;

    // 1. 카드 비용 지불, 버프 및 드로우 로직 선행 처리 (1회)
    setCombatState(prev => {
      let p = { ...prev.player };
      let newHand = [...prev.hand];
      let newDiscard = [...prev.discardPile];
      let newDraw = [...prev.drawPile];

      p.mana -= card.cost;
      
      if (isWin) {
        if (card.block && !card.doubleBlock && !card.percentBlockMaxHp) p.block += calculateBlock(card.block, p.buffs.dexterity);
        if (card.doubleBlock) p.block *= 2;
        if (card.percentBlockMaxHp) p.block += Math.floor(p.maxHp * (card.percentBlockMaxHp / 100)) + (p.buffs.dexterity || 0);
        if (card.heal && !card.gamble) p.hp = Math.min(p.maxHp, p.hp + card.heal);
        if (card.manaGain && !card.gamble) p.mana = clampStack(p.mana + card.manaGain, p.maxMana + 99);
        if (card.winManaGain) p.mana += card.winManaGain;
        if (card.selfStrength) p.buffs.strength = clampStack(p.buffs.strength + card.selfStrength);
        if (card.selfDex) p.buffs.dexterity = clampStack(p.buffs.dexterity + card.selfDex);
        if (card.selfThorns) p.buffs.thorns = clampStack(p.buffs.thorns + card.selfThorns);
      }

      for(let i=0; i<(card.draw || 0); i++) {
        if(newHand.length >= (GAME_RULES?.MAX_HAND_SIZE || 10) - 1) break;
        if(newDraw.length === 0) { if(newDiscard.length === 0) break; newDraw = shuffle(newDiscard); newDiscard = []; }
        if(newDraw.length > 0) newHand.push({ ...newDraw.pop(), uid: Math.random().toString() });
      }
      newHand.splice(cardIndex, 1); 
      newDiscard.push(card);

      return { ...prev, player: p, hand: newHand, discardPile: newDiscard, drawPile: newDraw };
    });

    // 2. 다단 히트 루프 (시각 효과 시간인 delay 만큼 대기하며 1대씩 대미지 깎기)
    let currentDamage = card.damage || 0;

    for (let i = 0; i < hits; i++) {
      if (i > 0) {
        await new Promise(r => setTimeout(r, delay));
      }

      setCombatState(prev => {
        if (prev.enemies.length === 0) return prev; 

        let p = { ...prev.player };
        let newEnemies = prev.enemies.map(e => ({...e, buffs: {...e.buffs}, debuffs: {...e.debuffs}}));

        const deal = (amt) => {
          if (newEnemies.length === 0) return;
          let target = newEnemies[0];
          let dmg = calculateDamage(amt, p.buffs.strength, p.debuffs.weak, target.debuffs.vulnerable);
          
          if (target.block >= dmg) {
            target.block -= dmg; 
          } else { 
            target.hp -= (dmg - target.block); 
            target.block = 0; 
          }
          checkRevive(target, newEnemies);
        };

        if (isWin) {
          // 특수 딜 및 디버프는 첫 타에 일괄 적용
          if (i === 0) {
            if (card.winDamage) deal(newEnemies[0]?.isBoss ? card.winDamageBoss : card.winDamage);
            if (card.missingHpDamage) deal((card.damage || 0) + Math.floor((p.maxHp - p.hp) * card.missingHpDamage));
            else if (card.consumeAllMana) { deal((card.damage || 0) + prev.player.mana * card.manaMultiplier); p.mana = 0; }
            
            if (card.enemyWeak) newEnemies[0].debuffs.weak += card.enemyWeak;
            if (card.enemyVuln) newEnemies[0].debuffs.vulnerable += card.enemyVuln;
            if (card.enemyPoison) newEnemies[0].debuffs.poison += card.enemyPoison;
          }

          // 기본 타격 및 증가하는 딜은 타수마다 순차 적용
          if (card.damage && !card.missingHpDamage && !card.consumeAllMana) { 
            deal(currentDamage); 
            if (card.increasingDamage) currentDamage += card.increasingDamage; 
          }
        } else if (i === 0) {
          // 겜블 실패 페널티도 첫 타 판정에만 1회 적용
          setToastMsg("실패...");
          if (card.loseDamage) deal(card.loseDamage);
          if (card.loseSelfDamage) p.hp -= card.loseSelfDamage;
          if (card.losePercentMaxHpDamage) p.hp -= Math.floor(p.maxHp * card.losePercentMaxHpDamage);
        }

        // 몬스터 전멸 시 승리 처리
        if (newEnemies.length === 0) {
          handleVictory(prev, p);
          return { ...prev, player: p, enemies: [] };
        }
        return { ...prev, player: p, enemies: newEnemies };
      });
    }
  }, [combatState, checkRevive, setToastMsg, GAME_RULES, handleVictory, fastMode]);

  return { playCard, checkRevive };
}