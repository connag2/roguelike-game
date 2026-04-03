// src/hooks/useBattle.js
import { useCallback } from 'react'; // useEffect 제거 (App.jsx에서 턴 관리를 하므로 불필요)
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
  setEnemyDropCard
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

      let relicDropChance = isSpecialBoss ? 0.50 : isNormalBoss ? 0.20 : 0.05;
      let droppedRelic = null;
      
      if (Math.random() < relicDropChance) {
        const availableRelics = RELIC_LIBRARY.filter(r => !(playerRelics || []).some(pr => pr?.id === r.id));
        if (availableRelics.length > 0) droppedRelic = availableRelics[Math.floor(availableRelics.length * Math.random())];
      }

      let bossDroppedCards = [];

      prevCombat.enemies.forEach(enemy => {
        let dropChance = 0;
        if (isSpecialBoss) dropChance = 1.0;
        else if (isNormalBoss) dropChance = 0.10;

        if (Math.random() < dropChance && enemy.template && enemy.template.deck && enemy.template.deck.length > 0) {
          let selectedCard = null;
          
          if (isSpecialBoss) {
            const lootPool = BOSS_LOOT_CARDS.filter(c => c.rarity === 'loot');
            if (lootPool.length > 0) {
              selectedCard = lootPool[Math.floor(Math.random() * lootPool.length)];
            }
          } else if (isNormalBoss) {
            const randomIdx = Math.floor(Math.random() * enemy.template.deck.length);
            selectedCard = enemy.template.deck[randomIdx];
          }

          if (selectedCard) {
            const cardToAdd = { ...selectedCard, id: selectedCard.id, rarity: 'loot', isFromBoss: true };
            bossDroppedCards.push(cardToAdd);
          }
        }
      });

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
      
      let finalBossCard = null;
      if (bossDroppedCards.length > 0) {
        finalBossCard = bossDroppedCards[0];
        setSpecialBossRewardCard(finalBossCard);
      } else if (spReward) {
        finalBossCard = spReward;
        setSpecialBossRewardCard(spReward);
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
  const playCard = useCallback(async (cardIndex) => {
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
    setCombatState(prev => {
      let p = { ...prev.player };
      p.buffs = { ...(p.buffs || {}) };
      p.debuffs = { ...(p.debuffs || {}) };

      let newHand = [...prev.hand];
      let newDiscard = [...prev.discardPile];
      let newDraw = [...prev.drawPile];
      let newEnemies = prev.enemies.map(e => ({ ...e, buffs: { ...e.buffs }, debuffs: { ...e.debuffs } }));

      // 1. 마나 소모 및 카드 덱 이동
      p.mana -= card.cost;
      const playedCard = newHand.splice(cardIndex, 1)[0];
      
      if (!card.exhaust) {
        newDiscard.push(playedCard);
      }

      // 2. 도박 (Gamble) 확률 계산
      const isWin = !card.gamble || Math.random() < card.gambleWinChance;
      
      // 3. 플레이어 버프/디버프 및 회복/마나 획득 처리
      if (card.type === 'attack' && (p.buffs.rage || 0) > 0) {
        p.block += p.buffs.rage;
      }
      
      if (isWin) {
        if (card.gamble) setToastMsg("도박 성공!");

        // 방어도
        if (card.block && !card.doubleBlock && !card.percentBlockMaxHp) {
            p.block += calculateBlock(card.block, p.buffs.dexterity, p.debuffs.frail || 0);
        }
        if (card.doubleBlock) p.block *= 2;
        if (card.percentBlockMaxHp) p.block += Math.floor(p.maxHp * (card.percentBlockMaxHp / 100)) + (p.buffs.dexterity || 0);
        
        if (card.cleanse) {
            p.debuffs = { weak: 0, vulnerable: 0, poison: 0, mark: 0, frail: 0, silence: 0, bind: 0 };
            setToastMsg("모든 상태 이상이 해제되었습니다!");
        }
        
        // 회복 및 마나
        if (card.heal && !card.gamble) p.hp = Math.min(p.maxHp, p.hp + (Number(card.heal) || 0));
        if (card.manaGain && !card.gamble) p.mana = clampStack(p.mana + (Number(card.manaGain) || 0), p.maxMana + 99);
        if (card.winManaGain) p.mana += (Number(card.winManaGain) || 0);
        
        // 자가 버프/디버프 적용
        if (card.selfStrength) p.buffs.strength = clampStack((p.buffs.strength || 0) + card.selfStrength);
        if (card.selfDex) p.buffs.dexterity = clampStack((p.buffs.dexterity || 0) + card.selfDex);
        if (card.selfThorns) p.buffs.thorns = clampStack((p.buffs.thorns || 0) + card.selfThorns);
        if (card.selfDamage) p.hp -= (Number(card.selfDamage) || 0);

        if (card.selfIntangible) p.buffs.intangible = clampStack((p.buffs.intangible || 0) + card.selfIntangible, 999, true); 
        if (card.selfRegen) p.buffs.regen = clampStack((p.buffs.regen || 0) + card.selfRegen);
        if (card.selfRage) p.buffs.rage = clampStack((p.buffs.rage || 0) + card.selfRage);
        if (card.selfInsight) p.buffs.insight = clampStack((p.buffs.insight || 0) + card.selfInsight);
      } else {
        setToastMsg("도박 실패...");
        if (card.loseSelfDamage) p.hp -= (Number(card.loseSelfDamage) || 0);
        if (card.losePercentMaxHpDamage) p.hp -= Math.floor(p.maxHp * card.losePercentMaxHpDamage);
      }

      // 4. 드로우 처리
      for (let i = 0; i < (card.draw || 0); i++) {
        if (newHand.length >= (GAME_RULES?.MAX_HAND_SIZE || 10)) break;
        if (newDraw.length === 0) { 
          if (newDiscard.length === 0) break; 
          newDraw = shuffle(newDiscard); 
          newDiscard = []; 
        }
        if (newDraw.length > 0) newHand.push({ ...newDraw.pop(), uid: Math.random().toString() });
      }

      // 5. 적에게 가하는 대미지 및 디버프 처리 (다단히트 포함)
      if (newEnemies.length > 0) {
        let currentDamage = Number(card.damage) || 0;
        const hits = (card.damage && isWin) ? (card.multiHit || 1) : 1;

        for (let i = 0; i < hits; i++) {
          if (newEnemies.length === 0) break;
          
          let target = newEnemies[0];

          if (isWin) {
            // 첫 번째 타격에만 들어가는 특수 대미지/디버프
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
                  applySpecialDamage((Number(card.damage) || 0) + Math.floor(prev.player.mana * (card.manaMultiplier || 0))); 
                  p.mana = 0; 
              }

              if (card.enemyWeak) target.debuffs.weak = clampStack((target.debuffs.weak || 0) + card.enemyWeak);
              if (card.enemyVuln) target.debuffs.vulnerable = clampStack((target.debuffs.vulnerable || 0) + card.enemyVuln);
              if (card.enemyPoison) target.debuffs.poison = clampStack((target.debuffs.poison || 0) + card.enemyPoison);
              if (card.enemyMark) target.debuffs.mark = clampStack((target.debuffs.mark || 0) + card.enemyMark);
              if (card.enemyFrail) target.debuffs.frail = clampStack((target.debuffs.frail || 0) + card.enemyFrail);
              
              if (card.enemySilence) target.debuffs.silence = clampStack((target.debuffs.silence || 0) + card.enemySilence, 999, true);
              if (card.enemyBind) target.debuffs.bind = clampStack((target.debuffs.bind || 0) + card.enemyBind, 999, true);
            }

            // 기본 타격 로직 (다단 히트 반복)
            if (card.damage && !card.missingHpDamage && !card.consumeAllMana) { 
              let dmg = calculateDamage(currentDamage, p.buffs?.strength || 0, p.debuffs?.weak || 0, target.debuffs?.vulnerable || 0, target.debuffs?.mark || 0, target.buffs?.intangible || 0);
              if (target.block >= dmg) target.block -= dmg; 
              else { target.hp = Math.max(0, target.hp - (dmg - target.block)); target.block = 0; }
              checkRevive(target, newEnemies);
              
              if (card.increasingDamage) currentDamage += (Number(card.increasingDamage) || 0); 
            }
          } else if (i === 0) { // 도박 실패 시
            if (card.loseDamage) {
              let dmg = calculateDamage(card.loseDamage, p.buffs?.strength || 0, p.debuffs?.weak || 0, target.debuffs?.vulnerable || 0, target.debuffs?.mark || 0, target.buffs?.intangible || 0);
              if (target.block >= dmg) target.block -= dmg; 
              else { target.hp = Math.max(0, target.hp - (dmg - target.block)); target.block = 0; }
              checkRevive(target, newEnemies);
            }
          }
        }
      }

      // 6. 적 전멸 시 승리 처리
      if (newEnemies.length === 0) {
        handleVictory(prev, p);
      } else if (p.hp <= 0) {
        setGameState('GAME_OVER');
      }

      return { ...prev, player: p, hand: newHand, discardPile: newDiscard, drawPile: newDraw, enemies: newEnemies };
    });

  }, [combatState, checkRevive, setToastMsg, GAME_RULES, handleVictory, setGameState]);

  return { playCard, checkRevive };
}