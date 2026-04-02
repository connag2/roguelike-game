// src/hooks/useBattle.js
import { useEffect, useCallback } from 'react';
import { shuffle, decayStack, calculateDamage, calculateBlock, clampStack } from '../utils/gameLogic';
import { GAME_RULES, CARD_LIBRARY, SPECIAL_BOSSES } from '../constants/gameData'; // ✨ SPECIAL_BOSSES 임포트 추가
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

        // ✨ 보상 지급 로직 수정 (보스 전용 카드 + 신화 카드 조합 반환)
        const determineReward = (st) => {
          if (isSpecialBoss) {
            // 처치한 보스 정보를 찾아냄
            const deadBoss = prevCombat.enemies.find(e => e.isBoss) || prevCombat.enemies[0];
            const sBossInfo = Object.values(SPECIAL_BOSSES).find(b => b.name === deadBoss?.name);

            if (prevCombat.mode === 'HARD') {
              let rewards = [];
              // 1. 하드 보스의 전용 카드 ('명의' 등급 등) 추가
              if (sBossInfo && sBossInfo.rewardCards) {
                 rewards.push(CARD_LIBRARY.find(c => c.id === sBossInfo.rewardCards[0]));
              }
              // 2. 신화(mythic) 카드 중 랜덤 1개 추가
              const mythicPool = CARD_LIBRARY.filter(c => c.rarity === 'mythic');
              if (mythicPool.length > 0) {
                rewards.push(mythicPool[Math.floor(Math.random() * mythicPool.length)]);
              }
              return rewards.filter(Boolean); // null 값 필터링 후 배열로 반환
            } else {
              // 일반 모드의 스페셜 보스
              if (sBossInfo && sBossInfo.rewardCards) {
                 const pickedId = sBossInfo.rewardCards[Math.floor(Math.random() * sBossInfo.rewardCards.length)];
                 return [CARD_LIBRARY.find(c => c.id === pickedId)].filter(Boolean);
              }
              
              // 매칭 실패 시 폴백
              const roll = Math.random();
              if (roll < 0.01) return [CARD_LIBRARY.find(c => c.id === 'furioso')];
              if (st === 100) return [roll < 0.25 ? CARD_LIBRARY.find(c => c.id === 'furioso') : CARD_LIBRARY.find(c => c.id === 'slime_snot')];
              const specialCards = ['spider_queen_poison', 'twerking', 'power_of_asura'];
              return [CARD_LIBRARY.find(c => c.id === specialCards[Math.floor(Math.random() * specialCards.length)])];
            }
          }
          
          if (isNormalBoss) {
            const strongCards = ['vampire_sword', 'absolute_defense', 'execute', 'snipe', 'meteor_fall', 'soul_shield', 'time_reverse'];
            return [CARD_LIBRARY.find(c => c.id === strongCards[Math.floor(Math.random() * strongCards.length)])].filter(Boolean);
          }
          
          return null;
        };

        let spReward = determineReward(prevCombat.stage);

        // ✨ 획득 생략 로직: 이미 베이스 덱에 가지고 있는 카드는 보상에서 뺌
        if (spReward && spReward.length > 0) {
          spReward = spReward.filter(rewardCard => !prevCombat.baseDeck.some(deckCard => deckCard.id === rewardCard.id));
          // 보상 배열이 비어버리면 (이미 카드를 다 가지고 있다면) 창을 띄우지 않도록 null 처리
          if (spReward.length === 0) spReward = null; 
        }

        if (spReward) setSpecialBossRewardCard(spReward);

        saveGame({ credits: credits + earned, maxStageReached: prevCombat.stage >= maxStageReached ? prevCombat.stage + 1 : maxStageReached, gameStats: newStats });
        
        if (droppedRelic) {
          setPendingRelicReward(droppedRelic);
          setTimeout(() => setGameState('RELIC_REWARD'), 600);
        } else {
          if (spReward) {
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
  }, [gameStats, maxStageReached, playerRelics, credits, setGameStats, setCredits, setMaxStageReached, setPendingRelicReward, setSpecialBossRewardCard, saveGame, setGameState, setNormalCleared]);

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
      p.buffs = p.buffs || {};
      p.debuffs = p.debuffs || {};

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
            
            if (card.enemyWeak) newEnemies[0].debuffs.weak = (newEnemies[0].debuffs.weak || 0) + card.enemyWeak;
            if (card.enemyVuln) newEnemies[0].debuffs.vulnerable = (newEnemies[0].debuffs.vulnerable || 0) + card.enemyVuln;
            if (card.enemyPoison) newEnemies[0].debuffs.poison = (newEnemies[0].debuffs.poison || 0) + card.enemyPoison;
            
            if (card.enemyMark) newEnemies[0].debuffs.mark = (newEnemies[0].debuffs.mark || 0) + card.enemyMark;
            if (card.enemyFrail) newEnemies[0].debuffs.frail = (newEnemies[0].debuffs.frail || 0) + card.enemyFrail;
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