export const RELIC_LIBRARY = [
  // --- 일반 (Common) : 7개 ---
  { id: 'old_whetstone', name: '낡은 숫돌', rarity: 'common', desc: '전투 시작 시 근력을 1 얻습니다.', effect: { type: 'START_COMBAT', strength: 1 } },
  { id: 'leather_boots', name: '가죽 장화', rarity: 'common', desc: '전투 시작 시 민첩을 1 얻습니다.', effect: { type: 'START_COMBAT', dexterity: 1 } },
  { id: 'rusty_shield', name: '녹슨 방패', rarity: 'common', desc: '전투 시작 시 방어도를 5 얻습니다.', effect: { type: 'START_COMBAT', block: 5 } },
  { id: 'lucky_coin_relic', name: '행운의 동전', rarity: 'common', desc: '전투 승리 시 크레딧을 5 더 얻습니다.', effect: { type: 'END_COMBAT_CREDITS', bonus: 5 } },
  { id: 'minor_potion', name: '작은 물약병', rarity: 'common', desc: '전투 승리 시 체력을 3 회복합니다.', effect: { type: 'END_COMBAT_HEAL', heal: 3 } },
  { id: 'thorny_vine', name: '가시 덩굴', rarity: 'common', desc: '전투 시작 시 가시를 2 얻습니다.', effect: { type: 'START_COMBAT', thorns: 2 } },
  { id: 'sturdy_belt', name: '튼튼한 벨트', rarity: 'common', desc: '전투 시작 시 체력을 2 회복합니다.', effect: { type: 'START_COMBAT_HEAL', heal: 2 } },
  
  // --- 희귀 (Uncommon) : 6개 ---
  { id: 'mana_shard', name: '마나석 조각', rarity: 'uncommon', desc: '매 턴 시작 시 방어도를 3 얻습니다.', effect: { type: 'START_TURN', block: 3 } },
  { id: 'vampire_fang', name: '흡혈귀의 송곳니', rarity: 'uncommon', desc: '전투 승리 시 체력을 6 회복합니다.', effect: { type: 'END_COMBAT_HEAL', heal: 6 } },
  { id: 'assassins_dagger', name: '암살자의 단검', rarity: 'uncommon', desc: '전투 시작 시 근력을 2 얻습니다.', effect: { type: 'START_COMBAT', strength: 2 } },
  { id: 'swift_cloak', name: '신속의 망토', rarity: 'uncommon', desc: '전투 시작 시 민첩을 2 얻습니다.', effect: { type: 'START_COMBAT', dexterity: 2 } },
  { id: 'golden_idol', name: '황금 우상', rarity: 'uncommon', desc: '전투 승리 시 크레딧을 10 더 얻습니다.', effect: { type: 'END_COMBAT_CREDITS', bonus: 10 } },
  { id: 'poisoned_apple', name: '독사과', rarity: 'uncommon', desc: '매 턴 시작 시 적 전체에게 중독 1을 부여합니다.', effect: { type: 'START_TURN_ADVANCED', poison: 1 } },

  // --- 전설 (Rare) : 4개 ---
  { id: 'slime_crown', name: '킹 슬라임의 왕관', rarity: 'rare', desc: '매 턴 시작 시 방어도를 5 얻고 적 전체에게 중독 1을 부여합니다.', effect: { type: 'START_TURN_ADVANCED', block: 5, poison: 1 } },
  { id: 'asura_blood', name: '수라의 피', rarity: 'rare', desc: '턴 시작 시 체력이 50% 이하라면 근력을 2 얻습니다.', effect: { type: 'START_TURN_CONDITION', condition: 'HP_50', strength: 2 } },
  { id: 'dragon_scale', name: '용의 비늘', rarity: 'rare', desc: '전투 시작 시 방어도를 15, 민첩을 2 얻습니다.', effect: { type: 'START_COMBAT', block: 15, dexterity: 2 } },
  { id: 'philosopher_stone', name: '현자의 돌', rarity: 'rare', desc: '매 턴 시작 시 카드를 1장 더 뽑습니다.', effect: { type: 'START_TURN', draw: 1 } },

  // --- 특수 (Special) : 2개 ---
  { id: 'golden_ticket', name: '황금 가챠 티켓', rarity: 'special', desc: '전투 승리 시 크레딧을 20 더 얻습니다.', effect: { type: 'END_COMBAT_CREDITS', bonus: 20 } },
  { id: 'cursed_pendant', name: '저주받은 펜던트', rarity: 'special', desc: '전투 시작 시 근력을 4 얻지만, 매 턴 시작 시 체력을 2 잃습니다.', effect: { type: 'START_COMBAT_AND_TURN', strength: 4, selfDamage: 2 } },

  // --- 신화 (Mythic) : 단 1개 ---
  { id: 'black_silence_gloves', name: '검은 침묵의 장갑', rarity: 'mythic', desc: '매 턴 시작 시 마나 1, 드로우 1, 근력을 1 얻습니다.', effect: { type: 'START_TURN_MYTHIC', mana: 1, draw: 1, strength: 1 } }
];