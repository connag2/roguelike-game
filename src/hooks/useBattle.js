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
        // 모드에 맞춰 보스 여부 판정 업데이트
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

        const determineReward = (st) => {
          const roll = Math.random();
          
          if (isSpecialBoss) {
            // 1% 확률로는 대박 카드 '퓨리오소' 지급
            if (roll < 0.01) return CARD_LIBRARY.find(c => c.id === 'furioso');
            
            // 100층(일반), 300층(하드) 보상
            if ((prevCombat.mode === 'NORMAL' && st === 100) || (prevCombat.mode === 'HARD' && st === 300)) {
              return roll < 0.25 ? CARD_LIBRARY.find(c => c.id === 'furioso') : CARD_LIBRARY.find(c => c.id === 'slime_snot');
            }
            
            // 그 외 특수 보스는 보스 테마 카드 중 랜덤 지급
            const specialCards = ['spider_queen_poison', 'twerking', 'power_of_asura'];
            return CARD_LIBRARY.find(c => c.id === specialCards[Math.floor(Math.random() * specialCards.length)]);
          }
          
          // 일반 보스 클리어 시 10% 확률로 희귀 카드 지급
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
          if (spReward) {
            setTimeout(() => setGameState('BOSS_CLEAR_REWARD'), 600);
          } else if ((prevCombat.mode === 'NORMAL' && prevCombat.stage >= 100) || (prevCombat.mode === 'HARD' && prevCombat.stage >= 300)) { 
            // 일반 모드 100층 또는 하드 모드 300층 클리어 시
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

    // ✨ 하드 CC(침묵, 속박) 확인: 조건에 걸리면 카드 사용 완전 차단 및 종료
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
    const delay = fastMode ? 100 : 200;

    setCombatState(prev => {
      let p = { ...prev.player };
      p.buffs = p.buffs || {};
      p.debuffs = p.debuffs || {};

      let newHand = [...prev.hand];
      let newDiscard = [...prev.discardPile];
      let newDraw = [...prev.drawPile];

      p.mana -= card.cost;

      // ✨ 격노(Rage) 효과: 공격 카드 사용 시 방어도 즉시 획득
      if (card.type === 'attack' && (p.buffs.rage || 0) > 0) {
        p.block += p.buffs.rage;
      }
      
      if (isWin) {
        // ✨ 허약(frail) 수치를 calculateBlock에 전달
        if (card.block && !card.doubleBlock && !card.percentBlockMaxHp) {
            p.block += calculateBlock(card.block, p.buffs.dexterity, p.debuffs.frail || 0);
        }
        if (card.doubleBlock) p.block *= 2;
        if (card.percentBlockMaxHp) p.block += Math.floor(p.maxHp * (card.percentBlockMaxHp / 100)) + (p.buffs.dexterity || 0);
        
        if (card.heal && !card.gamble) p.hp = Math.min(p.maxHp, p.hp + (Number(card.heal) || 0));
        if (card.manaGain && !card.gamble) p.mana = clampStack(p.mana + (Number(card.manaGain) || 0), p.maxMana + 99);
        if (card.winManaGain) p.mana += (Number(card.winManaGain) || 0);
        
        if (card.selfStrength) p.buffs.strength = clampStack((p.buffs.strength || 0) + card.selfStrength);
        if (card.selfDex) p.buffs.dexterity = clampStack((p.buffs.dexterity || 0) + card.selfDex);
        if (card.selfThorns) p.buffs.thorns = clampStack((p.buffs.thorns || 0) + card.selfThorns);
        if (card.selfDamage) p.hp -= (Number(card.selfDamage) || 0);

        // ✨ 신규 버프 플레이어에게 적용
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
      
      // ✨ 소멸(exhaust) 키워드 적용: 소멸 카드가 아니면 버린 패로 이동
      if (!card.exhaust) {
        newDiscard.push(card);
      }

      return { ...prev, player: p, hand: newHand, discardPile: newDiscard, drawPile: newDraw };
    });

    let currentDamage = Number(card.damage) || 0;

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
          target.buffs = target.buffs || {};
          target.debuffs = target.debuffs || {};

          // ✨ 표식(mark) 및 무형(intangible)을 반영한 대미지 계산 적용
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
            if (card.winDamage) deal(newEnemies[0]?.isBoss ? card.winDamageBoss : card.winDamage);
            if (card.missingHpDamage) deal((Number(card.damage) || 0) + Math.floor((p.maxHp - p.hp) * card.missingHpDamage));
            else if (card.consumeAllMana) { 
                deal((Number(card.damage) || 0) + Math.floor(prev.player.mana * (card.manaMultiplier || 0))); 
                p.mana = 0; 
            }
            
            // 기존 디버프
            if (card.enemyWeak) newEnemies[0].debuffs.weak = (newEnemies[0].debuffs.weak || 0) + card.enemyWeak;
            if (card.enemyVuln) newEnemies[0].debuffs.vulnerable = (newEnemies[0].debuffs.vulnerable || 0) + card.enemyVuln;
            if (card.enemyPoison) newEnemies[0].debuffs.poison = (newEnemies[0].debuffs.poison || 0) + card.enemyPoison;
            
            // ✨ 신규 디버프 적에게 적용
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
          setToastMsg("실패...");
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
  }, [combatState, checkRevive, setToastMsg, GAME_RULES, handleVictory, fastMode]);

  return { playCard, checkRevive };
}