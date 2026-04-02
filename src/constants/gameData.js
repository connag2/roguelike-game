// --- 게임 규칙 및 설정값 ---
export const GAME_RULES = {
  MAX_DECK_SIZE: 20,
  MAX_MANA_CARDS: 2,
  MAX_HAND_SIZE: 10,
  BASE_HP: 100,
  HP_PER_UPGRADE: 15
};

export const MANA_CARD_IDS = [
  'mana_potion', 'overcharge', 'meditate', 'dark_bargain', 'catalyst', 
  'blood_ritual', 'mana_amp', 'mana_spring', 'mana_burst', 'lucky_coin'
];

export const BASE_CARDS = ['strike', 'defend', 'heavy_strike', 'shield_bash', 'heal', 'mana_potion', 'focus'];

// --- 플레이어 카드 라이브러리 ---
export const CARD_LIBRARY = [
  { id: 'strike', name: '타격', type: 'attack', cost: 1, rarity: 'common', damage: 8, desc: '적에게 8의 피해를 줍니다.' },
  { id: 'defend', name: '방어', type: 'skill', cost: 1, rarity: 'common', block: 6, desc: '6의 방어도를 얻습니다.' },
  { id: 'heavy_strike', name: '강타', type: 'attack', cost: 2, rarity: 'common', damage: 18, desc: '적에게 18의 피해를 줍니다.' },
  { id: 'shield_bash', name: '방패 밀치기', type: 'attack', cost: 1, rarity: 'common', damage: 7, block: 7, desc: '7의 피해를 주고 7의 방어도를 얻습니다.' },
  { id: 'focus', name: '집중', type: 'skill', cost: 1, rarity: 'common', draw: 2, desc: '카드를 2장 뽑습니다.' },
  { id: 'stab', name: '찌르기', type: 'attack', cost: 1, rarity: 'common', damage: 6, draw: 1, desc: '6의 피해를 주고 카드를 1장 뽑습니다.' },
  { id: 'uppercut', name: '올려치기', type: 'attack', cost: 2, rarity: 'common', damage: 15, desc: '적에게 15의 피해를 줍니다.' },
  { id: 'club_smash', name: '몽둥이 찜질', type: 'attack', cost: 2, rarity: 'common', damage: 14, enemyWeak: 1, desc: '14의 피해를 주고 약화 1을 부여합니다.' },
  { id: 'quick_strike', name: '신속한 타격', type: 'attack', cost: 0, rarity: 'common', damage: 4, desc: '적에게 4의 피해를 줍니다.' },
  { id: 'angry_strike', name: '분노의 일격', type: 'attack', cost: 1, rarity: 'common', damage: 12, selfDamage: 2, desc: '12의 피해를 주지만 체력을 2 잃습니다.' },
  { id: 'sweep', name: '휩쓸기', type: 'attack', cost: 1, rarity: 'common', damage: 5, multiHit: 2, desc: '5의 피해를 2번 연속 줍니다.' },
  { id: 'counter', name: '카운터', type: 'attack', cost: 1, rarity: 'common', damage: 4, block: 8, desc: '4의 피해를 주고 8의 방어도를 얻습니다.' },
  { id: 'crouch', name: '웅크리기', type: 'skill', cost: 2, rarity: 'common', block: 14, desc: '14의 방어도를 얻습니다.' },
  { id: 'dodge', name: '회피', type: 'skill', cost: 0, rarity: 'common', block: 4, desc: '4의 방어도를 얻습니다.' },
  { id: 'taunt', name: '도발', type: 'skill', cost: 1, rarity: 'common', enemyVuln: 1, enemyWeak: 1, desc: '적에게 약화 1, 취약 1을 부여합니다.' },
  { id: 'combat_prep', name: '전투 준비', type: 'skill', cost: 1, rarity: 'common', block: 4, selfStrength: 1, desc: '4의 방어도를 얻고 근력을 1 얻습니다.' },
  { id: 'first_aid', name: '응급 처치', type: 'skill', cost: 1, rarity: 'common', heal: 8, desc: '체력을 8 회복합니다.' },
  { id: 'maintenance', name: '정비', type: 'skill', cost: 1, rarity: 'common', block: 5, draw: 1, desc: '5의 방어도를 얻고 카드를 1장 뽑습니다.' },
  { id: 'poison_dart', name: '독침', type: 'attack', cost: 1, rarity: 'common', damage: 5, draw: 1, desc: '5의 피해를 주고 카드를 1장 뽑습니다.' },
  { id: 'meditate', name: '명상', type: 'skill', cost: 1, rarity: 'common', manaGain: 2, block: 5, desc: '마나를 2 회복하고 5의 방어도를 얻습니다.' },
  { id: 'reckless_charge', name: '무모한 돌진', type: 'attack', cost: 1, rarity: 'common', damage: 15, selfDamage: 2, desc: '15의 피해를 주지만 체력을 2 잃습니다.' },
  { id: 'toxic_strike', name: '맹독 타격', type: 'attack', cost: 1, rarity: 'common', damage: 4, multiHit: 2, enemyVuln: 1, desc: '4의 피해를 2번 연속 주고 취약 1을 부여합니다.' },
  { id: 'warcry', name: '전장의 함성', type: 'skill', cost: 1, rarity: 'common', block: 8, draw: 2, desc: '8의 방어도를 얻고 카드를 2장 뽑습니다.' },
  { id: 'sand_throw', name: '모래 뿌리기', type: 'skill', cost: 1, rarity: 'common', damage: 3, enemyWeak: 1, desc: '3의 피해를 주고 약화 1을 부여합니다.' },
  { id: 'bone_crush', name: '뼈 부수기', type: 'attack', cost: 2, rarity: 'common', damage: 12, enemyVuln: 1, desc: '12의 피해를 주고 취약 1을 부여합니다.' },
  { id: 'throwing_dagger', name: '투척 단검', type: 'attack', cost: 0, rarity: 'common', damage: 5, draw: 1, desc: '5의 피해를 주고 카드를 1장 뽑습니다.' },
  { id: 'double_cut', name: '이중 베기', type: 'attack', cost: 2, rarity: 'common', damage: 7, multiHit: 2, desc: '7의 피해를 2번 연속 줍니다.' },
  { id: 'vital_strike', name: '급소 찌르기', type: 'attack', cost: 1, rarity: 'common', damage: 10, enemyWeak: 1, desc: '10의 피해를 주고 약화 1을 부여합니다.' },
  { id: 'old_shield', name: '낡은 방패', type: 'skill', cost: 0, rarity: 'common', block: 5, desc: '5의 방어도를 얻습니다.' },
  { id: 'firm_stand', name: '굳건한 버티기', type: 'skill', cost: 1, rarity: 'common', block: 12, selfDamage: 1, desc: '12의 방어도를 얻지만 체력을 1 잃습니다.' },
  { id: 'kihap', name: '기합', type: 'skill', cost: 1, rarity: 'common', manaGain: 1, selfStrength: 1, desc: '마나를 1 얻고 근력을 1 얻습니다.' },
  { id: 'short_rest', name: '짧은 휴식', type: 'skill', cost: 1, rarity: 'common', manaGain: 1, heal: 8, desc: '마나를 1 얻고 체력을 8 회복합니다.' },
  { id: 'gamblers_strike', name: '도박의 일격', type: 'attack', cost: 1, rarity: 'common', gamble: true, gambleWinChance: 0.5, winDamage: 25, loseDamage: 1, desc: '50% 확률로 25의 피해를 주거나, 실패 시 1의 피해를 줍니다.' },
  { id: 'poison_flask', name: '맹독 플라스크', type: 'skill', cost: 1, rarity: 'common', enemyPoison: 4, desc: '적에게 중독 4를 부여합니다.' },
  { id: 'spiked_shield', name: '가시 방패', type: 'skill', cost: 1, rarity: 'common', block: 5, selfThorns: 2, desc: '5의 방어도를 얻고 가시 2를 얻습니다.' },
  { id: 'twin_strike', name: '쌍발 타격', type: 'attack', cost: 1, rarity: 'common', damage: 4, multiHit: 2, desc: '4의 피해를 2번 연속 줍니다.' },
  { id: 'heal', name: '치유', type: 'skill', cost: 2, rarity: 'uncommon', heal: 12, desc: '체력을 12 회복합니다.' },
  { id: 'mana_potion', name: '마나 물약', type: 'skill', cost: 1, rarity: 'uncommon', manaGain: 3, desc: '마나를 1 소모하여 마나 3을 얻습니다.' },
  { id: 'wind_slash', name: '순풍 베기', type: 'attack', cost: 1, rarity: 'uncommon', damage: 7, draw: 1, desc: '7의 피해를 주고 카드를 1장 뽑습니다.' },
  { id: 'overcharge', name: '과부하', type: 'skill', cost: 0, rarity: 'uncommon', manaGain: 3, selfDamage: 3, desc: '마나를 3 얻고 체력을 3 잃습니다.' },
  { id: 'fireball', name: '화염구', type: 'attack', cost: 2, rarity: 'uncommon', damage: 22, desc: '적에게 22의 피해를 줍니다.' },
  { id: 'blood_pact', name: '피의 계약', type: 'skill', cost: 0, rarity: 'uncommon', draw: 3, selfDamage: 5, desc: '카드를 3장 뽑고 체력을 5 잃습니다.' },
  { id: 'iron_wall', name: '철벽', type: 'skill', cost: 2, rarity: 'uncommon', block: 18, desc: '18의 방어도를 얻습니다.' },
  { id: 'double_strike', name: '연속 베기', type: 'attack', cost: 2, rarity: 'uncommon', damage: 9, multiHit: 2, desc: '9의 피해를 2번 연속 줍니다.' },
  { id: 'dash', name: '돌진', type: 'attack', cost: 2, rarity: 'uncommon', damage: 12, block: 12, desc: '12의 피해를 주고 12의 방어도를 얻습니다.' },
  { id: 'divine_shield', name: '신의 방패', type: 'skill', cost: 2, rarity: 'uncommon', block: 15, heal: 5, desc: '15의 방어도를 얻고 체력을 5 회복합니다.' },
  { id: 'smash', name: '분쇄', type: 'attack', cost: 2, rarity: 'uncommon', damage: 14, draw: 1, desc: '14의 피해를 주고 카드를 1장 뽑습니다.' },
  { id: 'vanguard', name: '선봉장', type: 'attack', cost: 2, rarity: 'uncommon', damage: 8, block: 16, desc: '8의 피해를 주고 16의 방어도를 얻습니다.' },
  { id: 'dark_bargain', name: '어둠의 거래', type: 'skill', cost: 0, rarity: 'uncommon', manaGain: 1, draw: 1, selfDamage: 2, desc: '마나를 1 얻고 카드를 1장 뽑지만 체력을 2 잃습니다.' },
  { id: 'barrier', name: '결계', type: 'skill', cost: 2, rarity: 'uncommon', block: 25, desc: '25의 방어도를 얻습니다.' },
  { id: 'adrenaline', name: '아드레날린', type: 'skill', cost: 1, rarity: 'uncommon', draw: 3, selfDamage: 3, desc: '카드를 3장 뽑지만 체력을 3 잃습니다.' },
  { id: 'blade_dance', name: '검무', type: 'attack', cost: 2, rarity: 'uncommon', damage: 6, multiHit: 3, desc: '6의 피해를 3번 연속 줍니다.' },
  { id: 'panic_button', name: '비상 버튼', type: 'skill', cost: 0, rarity: 'uncommon', block: 20, selfDamage: 5, desc: '20의 방어도를 얻지만 체력을 5 잃습니다.' },
  { id: 'blood_blade', name: '피의 칼날', type: 'attack', cost: 1, rarity: 'uncommon', damage: 18, selfDamage: 4, desc: '18의 피해를 주지만 체력을 4 잃습니다.' },
  { id: 'muscle_training', name: '근력 단련', type: 'skill', cost: 1, rarity: 'uncommon', selfStrength: 2, desc: '근력을 2 얻습니다.' },
  { id: 'iron_skin', name: '철의 피부', type: 'skill', cost: 1, rarity: 'uncommon', block: 5, selfDex: 1, desc: '5의 방어도를 얻고 민첩을 1 얻습니다.' },
  { id: 'neutralize', name: '무력화', type: 'skill', cost: 1, rarity: 'uncommon', enemyWeak: 3, desc: '적에게 약화 3을 부여합니다.' },
  { id: 'expose_weakness', name: '약점 노출', type: 'skill', cost: 1, rarity: 'uncommon', enemyVuln: 3, desc: '적에게 취약 3을 부여합니다.' },
  { id: 'catalyst', name: '촉매', type: 'skill', cost: 1, rarity: 'uncommon', manaGain: 2, desc: '마나를 2 회복합니다.' },
  { id: 'vitality_shield', name: '활력의 방패', type: 'skill', cost: 2, rarity: 'uncommon', percentBlockMaxHp: 10, desc: '내 최대 체력의 10%만큼 방어도를 얻습니다.' },
  { id: 'blood_strike', name: '피의 일격', type: 'attack', cost: 1, rarity: 'uncommon', missingHpDamage: 0.3, desc: '내가 잃은 체력의 30%만큼 적에게 피해를 줍니다.' },
  { id: 'dig_in', name: '파고들기', type: 'attack', cost: 1, rarity: 'uncommon', damage: 8, enemyWeak: 1, enemyVuln: 1, desc: '8의 피해를 주고 약화 1, 취약 1을 부여합니다.' },
  { id: 'vampiric_strike', name: '흡혈의 일격', type: 'attack', cost: 2, rarity: 'uncommon', damage: 12, heal: 6, desc: '12의 피해를 주고 체력을 6 회복합니다.' },
  { id: 'beast_tear', name: '맹수 찢기', type: 'attack', cost: 2, rarity: 'uncommon', damage: 18, enemyVuln: 2, desc: '18의 피해를 주고 취약 2를 부여합니다.' },
  { id: 'magic_shield', name: '마력 방패', type: 'skill', cost: 1, rarity: 'uncommon', block: 15, draw: 1, desc: '15의 방어도를 얻고 카드를 1장 뽑습니다.' },
  { id: 'blood_ritual', name: '피의 제사', type: 'skill', cost: 0, rarity: 'uncommon', manaGain: 2, selfDamage: 5, desc: '마나를 2 얻지만 체력을 5 잃습니다.' },
  { id: 'ice_wall', name: '얼음 장벽', type: 'skill', cost: 2, rarity: 'uncommon', block: 20, enemyWeak: 1, desc: '20의 방어도를 얻고 적에게 약화 1을 부여합니다.' },
  { id: 'smoke_bomb', name: '연막탄', type: 'skill', cost: 0, rarity: 'uncommon', block: 5, enemyVuln: 2, desc: '5의 방어도를 얻고 취약 2를 부여합니다.' },
  { id: 'tactical_retreat', name: '전술적 후퇴', type: 'skill', cost: 2, rarity: 'uncommon', block: 15, draw: 3, enemyWeak: 1, desc: '15의 방어도를 얻고 카드를 3장 뽑으며 약화 1을 부여합니다.' },
  { id: 'mana_amp', name: '마나 증폭', type: 'skill', cost: 0, rarity: 'uncommon', manaGain: 3, enemyVuln: 1, desc: '마나를 3 얻고 적에게 취약 1을 부여합니다.' },
  { id: 'unstable_bomb', name: '불안정한 폭약', type: 'attack', cost: 2, rarity: 'uncommon', gamble: true, gambleWinChance: 0.7, winDamage: 35, loseSelfDamage: 15, desc: '70% 확률로 35의 피해를 줍니다. 실패 시 내 체력을 15 잃습니다.' },
  { id: 'lucky_coin', name: '행운의 동전', type: 'skill', cost: 1, rarity: 'uncommon', gamble: true, gambleWinChance: 0.5, winManaGain: 3, desc: '50% 확률로 마나를 3 얻습니다. 실패 시 아무 효과도 없습니다.' },
  // 신규 디버프/버프 카드들
  { id: 'target_locked', name: '조준 완료', type: 'skill', cost: 1, rarity: 'uncommon', enemyMark: 4, desc: '적에게 표식 4를 부여합니다. (타격당 표식만큼 추가 고정 피해)' },
  { id: 'bone_shatter', name: '뼈 분쇄', type: 'attack', cost: 2, rarity: 'uncommon', damage: 12, enemyFrail: 2, desc: '12의 피해를 주고 허약 2를 부여합니다. (방어도 획득량 25% 감소)' },
  { id: 'blood_rage', name: '피의 분노', type: 'skill', cost: 1, rarity: 'uncommon', selfRage: 4, desc: '격노 4를 얻습니다. (이번 턴에 공격 카드를 사용할 때마다 4의 방어도를 획득)' },
  { id: 'premonition', name: '예지', type: 'skill', cost: 1, rarity: 'uncommon', selfInsight: 2, desc: '통찰 2를 얻습니다. (다음 턴 시작 시 카드를 2장 추가 드로우)' },
// --- 신규 추가: 언커먼 (25종 / 마나, 드로우, 버프, 디버프 위주) ---
  { id: 'arcane_intellect', name: '신비한 지능', type: 'skill', cost: 1, rarity: 'uncommon', manaGain: 1, draw: 2, desc: '마나를 1 얻고 카드를 2장 뽑습니다.' },
  { id: 'mind_read', name: '독심술', type: 'skill', cost: 1, rarity: 'uncommon', draw: 2, enemyWeak: 1, desc: '카드를 2장 뽑고 적에게 약화 1을 부여합니다.' },
  { id: 'weak_point_scan', name: '약점 스캔', type: 'skill', cost: 0, rarity: 'uncommon', enemyVuln: 2, draw: 1, desc: '적에게 취약 2를 부여하고 카드를 1장 뽑습니다.' },
  { id: 'mana_drain', name: '마나 흡수', type: 'attack', cost: 1, rarity: 'uncommon', damage: 5, manaGain: 2, desc: '5의 피해를 주고 마나를 2 얻습니다.' },
  { id: 'paralyzing_dart', name: '마비 독침', type: 'attack', cost: 1, rarity: 'uncommon', damage: 3, enemyFrail: 2, enemyWeak: 1, desc: '3의 피해를 주고 허약 2와 약화 1을 부여합니다.' },
  { id: 'tactical_planning', name: '전술 수립', type: 'skill', cost: 1, rarity: 'uncommon', selfInsight: 2, block: 5, desc: '5의 방어도를 얻고 통찰 2를 얻습니다.' },
  { id: 'blood_alchemy', name: '피의 연금술', type: 'skill', cost: 0, rarity: 'uncommon', selfDamage: 3, manaGain: 2, draw: 1, desc: '체력을 3 잃지만 마나를 2 얻고 카드를 1장 뽑습니다.' },
  { id: 'empower', name: '힘 부여', type: 'skill', cost: 1, rarity: 'uncommon', selfStrength: 1, draw: 1, desc: '근력을 1 얻고 카드를 1장 뽑습니다.' },
  { id: 'haste', name: '가속', type: 'skill', cost: 1, rarity: 'uncommon', selfDex: 1, draw: 1, desc: '민첩을 1 얻고 카드를 1장 뽑습니다.' },
  { id: 'cursed_word', name: '저주의 말', type: 'skill', cost: 1, rarity: 'uncommon', enemyWeak: 2, enemyVuln: 2, selfDamage: 2, desc: '체력을 2 잃고 적에게 약화 2, 취약 2를 부여합니다.' },
  { id: 'venom_coating', name: '맹독 바르기', type: 'skill', cost: 1, rarity: 'uncommon', enemyPoison: 3, selfThorns: 2, desc: '적에게 중독 3을 부여하고 가시 2를 얻습니다.' },
  { id: 'focus_fire', name: '집중 사격', type: 'attack', cost: 2, rarity: 'uncommon', damage: 10, enemyMark: 3, desc: '10의 피해를 주고 표식 3을 부여합니다.' },
  { id: 'energy_shield', name: '에너지 방패', type: 'skill', cost: 2, rarity: 'uncommon', block: 10, manaGain: 1, desc: '10의 방어도를 얻고 마나를 1 얻습니다.' },
  { id: 'blinding_flash', name: '섬광탄', type: 'skill', cost: 1, rarity: 'uncommon', enemyWeak: 2, enemyFrail: 1, desc: '적에게 약화 2와 허약 1을 부여합니다.' },
  { id: 'magic_trick', name: '마술 장난', type: 'skill', cost: 0, rarity: 'uncommon', draw: 2, selfDamage: 1, desc: '체력을 1 잃고 카드를 2장 뽑습니다.' },
  { id: 'mana_shield', name: '마력 보호막', type: 'skill', cost: 1, rarity: 'uncommon', block: 8, manaGain: 1, desc: '8의 방어도를 얻고 마나를 1 얻습니다.' },
  { id: 'toxic_cloud', name: '독구름', type: 'skill', cost: 2, rarity: 'uncommon', enemyPoison: 5, enemyWeak: 1, desc: '적에게 중독 5와 약화 1을 부여합니다.' },
  { id: 'rage_injection', name: '분노 주입', type: 'skill', cost: 1, rarity: 'uncommon', selfRage: 3, draw: 1, desc: '격노 3을 얻고 카드를 1장 뽑습니다.' },
  { id: 'soul_harvest', name: '영혼 수확', type: 'attack', cost: 1, rarity: 'uncommon', damage: 6, manaGain: 1, heal: 2, desc: '6의 피해를 주고 마나 1과 체력 2를 회복합니다.' },
  { id: 'meditative_trance', name: '무아지경', type: 'skill', cost: 2, rarity: 'uncommon', manaGain: 3, selfInsight: 1, desc: '마나를 3 얻고 통찰 1을 얻습니다.' },
  { id: 'shadow_cloak', name: '그림자 망토', type: 'skill', cost: 1, rarity: 'uncommon', block: 7, selfRegen: 1, desc: '7의 방어도를 얻고 재생 1을 얻습니다.' },
  { id: 'crippling_strike', name: '불구 만들기', type: 'attack', cost: 2, rarity: 'uncommon', damage: 8, enemyWeak: 2, enemyFrail: 2, desc: '8의 피해를 주고 약화 2, 허약 2를 부여합니다.' },
  { id: 'mark_of_death', name: '죽음의 표식', type: 'skill', cost: 1, rarity: 'uncommon', enemyMark: 4, enemyVuln: 1, desc: '적에게 표식 4와 취약 1을 부여합니다.' },
  { id: 'refresh', name: '재정비', type: 'skill', cost: 1, rarity: 'uncommon', heal: 5, draw: 2, desc: '체력을 5 회복하고 카드를 2장 뽑습니다.' },
  { id: 'mana_infusion', name: '마나 주입', type: 'skill', cost: 0, rarity: 'uncommon', manaGain: 2, enemyFrail: 1, desc: '마나를 2 얻고 적에게 허약 1을 부여합니다.' },


  { id: 'vampire_sword', name: '뱀파이어의 검', type: 'attack', cost: 2, rarity: 'rare', damage: 20, heal: 10, enemyWeak: 1, desc: '20의 피해를 주고 체력을 10 회복하며 약화 1을 부여합니다.' },
  { id: 'absolute_defense', name: '절대 방어', type: 'skill', cost: 2, rarity: 'rare', block: 30, enemyWeak: 2, desc: '30의 방어도를 얻고 적에게 약화 2를 부여합니다.' },
  { id: 'execute', name: '처형', type: 'attack', cost: 2, rarity: 'rare', damage: 30, enemyVuln: 2, desc: '적에게 30의 피해를 주고 취약 2를 부여합니다.' },
  { id: 'snipe', name: '저격', type: 'attack', cost: 3, rarity: 'rare', damage: 60, enemyVuln: 2, desc: '적에게 60의 피해를 주고 취약 2를 부여합니다.' },
  { id: 'onslaught', name: '맹공', type: 'attack', cost: 3, rarity: 'rare', damage: 12, multiHit: 5, enemyVuln: 1, desc: '12의 피해를 5번 연속 주고 취약 1을 부여합니다. (총 60)' },
  { id: 'berserker_axe', name: '광전사의 도끼', type: 'attack', cost: 2, rarity: 'rare', damage: 40, selfDamage: 3, enemyVuln: 2, desc: '40의 피해를 주지만 체력을 3 잃고 적에게 취약 2를 부여합니다.' },
  { id: 'destruction_ray', name: '파괴 광선', type: 'attack', cost: 3, rarity: 'rare', damage: 80, selfDamage: 10, enemyWeak: 2, desc: '적에게 80의 피해를 주지만 체력을 10 잃고 약화 2를 부여합니다.' },
  { id: 'lightning_strike', name: '번개 일격', type: 'attack', cost: 3, rarity: 'rare', damage: 40, draw: 2, enemyWeak: 1, desc: '40의 피해를 주고 카드를 2장 뽑으며 약화 1을 부여합니다.' },
  { id: 'soul_slash', name: '영혼 베기', type: 'attack', cost: 2, rarity: 'rare', damage: 30, heal: 20, enemyWeak: 1, desc: '30의 피해를 주고 체력을 20 회복하며 약화 1을 부여합니다.' },
  { id: 'meteor_fall', name: '운석 낙하', type: 'attack', cost: 3, rarity: 'rare', damage: 60, enemyWeak: 3, desc: '60의 피해를 주고 약화 3을 부여합니다.' },
  { id: 'holy_light', name: '신성한 빛', type: 'skill', cost: 3, rarity: 'rare', heal: 40, enemyWeak: 2, desc: '체력을 40 회복하고 적에게 약화 2를 부여합니다.' },
  { id: 'demonic_dance', name: '악마의 춤', type: 'skill', cost: 2, rarity: 'rare', selfStrength: 5, selfDamage: 5, enemyVuln: 3, desc: '근력을 5 얻지만 체력을 5 잃고 적에게 취약 3을 부여합니다.' },
  { id: 'angels_blessing', name: '천사의 축복', type: 'skill', cost: 3, rarity: 'rare', selfStrength: 4, selfDex: 4, enemyWeak: 2, desc: '근력을 4, 민첩을 4 얻고 적에게 약화 2를 부여합니다.' },
  { id: 'will_of_steel', name: '강철의 의지', type: 'skill', cost: 2, rarity: 'rare', selfDex: 5, enemyWeak: 2, desc: '민첩을 5 얻고 적에게 약화 2를 부여합니다.' },
  { id: 'soul_shield', name: '영혼의 방패', type: 'skill', cost: 3, rarity: 'rare', block: 50, heal: 10, enemyWeak: 2, desc: '50의 방어도를 얻고 체력을 10 회복하며 약화 2를 부여합니다.' },
  { id: 'regeneration', name: '재생', type: 'skill', cost: 2, rarity: 'rare', heal: 20, manaGain: 1, enemyWeak: 1, desc: '체력을 20 회복하고 마나를 1 얻으며 약화 1을 부여합니다.' },
  { id: 'barricade', name: '절대 장벽', type: 'skill', cost: 3, rarity: 'rare', doubleBlock: true, desc: '내가 현재 가진 방어도를 정확히 2배로 증폭시킵니다.' },
  { id: 'mana_burst', name: '마나 폭발', type: 'attack', cost: 0, rarity: 'rare', manaMultiplier: 12, consumeAllMana: true, desc: '모든 마나를 소모하여, (소모한 마나 x 12)의 피해를 줍니다.' },
  { id: 'sword_of_ruin', name: '파멸의 검', type: 'attack', cost: 3, rarity: 'rare', damage: 70, selfDamage: 5, enemyWeak: 2, desc: '70의 피해를 주고 약화 2를 부여하지만 체력을 5 잃습니다.' },
  { id: 'chain_explosion', name: '연속 폭발', type: 'attack', cost: 3, rarity: 'rare', damage: 25, multiHit: 3, selfDamage: 10, desc: '25의 피해를 3번 연속 주지만 체력을 10 잃습니다.' },
  { id: 'time_reverse', name: '시간 역행', type: 'skill', cost: 3, rarity: 'rare', draw: 7, desc: '카드를 7장 뽑습니다.' },
  { id: 'paladin_shield', name: '성기사의 방패', type: 'skill', cost: 3, rarity: 'rare', block: 40, heal: 15, desc: '40의 방어도를 얻고 체력을 15 회복합니다.' },
  { id: 'panacea', name: '만능 비약', type: 'skill', cost: 2, rarity: 'rare', heal: 20, selfStrength: 2, selfDex: 2, desc: '체력을 20 회복하고 근력과 민첩을 각각 2 얻습니다.' },
  { id: 'mana_spring', name: '마나의 샘', type: 'skill', cost: 0, rarity: 'rare', manaGain: 5, enemyWeak: 2, desc: '마나를 5 얻고 적에게 약화 2를 부여합니다.' },
  { id: 'absolute_domain', name: '절대 영역', type: 'skill', cost: 3, rarity: 'rare', block: 50, selfDex: 3, enemyWeak: 1, desc: '50의 방어도를 얻고 민첩을 3 얻으며 약화 1을 부여합니다.' },
  { id: 'russian_roulette', name: '러시안 룰렛', type: 'attack', cost: 0, rarity: 'rare', gamble: true, gambleWinChance: 0.16, winDamage: 9999, winDamageBoss: 150, loseDamage: 1, loseDraw: 1, desc: '16% 확률로 적을 즉사시킵니다(보스 150). 실패 시 1의 피해를 주고 1장 뽑습니다.' },
  { id: 'devils_dice', name: '악마의 주사위', type: 'skill', cost: 2, rarity: 'rare', gamble: true, gambleWinChance: 0.5, winHeal: 50, losePercentMaxHpDamage: 0.2, desc: '50% 확률로 체력을 50 회복합니다. 실패 시 최대 체력의 20%를 잃습니다.' },
  { id: 'venom_nova', name: '맹독 폭발', type: 'skill', cost: 2, rarity: 'rare', enemyPoison: 12, enemyWeak: 2, desc: '적에게 중독 12와 약화 2를 부여합니다.' },
  { id: 'bramble_armor', name: '덩굴 갑옷', type: 'skill', cost: 2, rarity: 'rare', block: 20, selfThorns: 6, desc: '20의 방어도를 얻고 가시 6을 얻습니다.' },
  { id: 'toxic_strike_legend', name: '역병의 일격', type: 'attack', cost: 2, rarity: 'rare', damage: 15, enemyPoison: 8, desc: '15의 피해를 주고 중독 8을 부여합니다.' },
  { id: 'throat_chop', name: '목 찌르기', type: 'attack', cost: 2, rarity: 'rare', damage: 8, enemySilence: 1, desc: '8의 피해를 주고 침묵 1을 부여합니다. (적의 스킬을 1턴간 봉인)' },
  { id: 'shadow_bind', name: '그림자 묶기', type: 'skill', cost: 2, rarity: 'rare', enemyBind: 1, desc: '적에게 속박 1을 부여합니다. (적의 공격을 1턴간 봉인)' },
  { id: 'troll_blood', name: '트롤의 피', type: 'skill', cost: 2, rarity: 'rare', selfRegen: 5, desc: '재생 5를 얻습니다. (턴 종료 시 체력 회복 후 재생 1 감소)' },
  { id: 'meditation_advanced', name: '심연의 명상', type: 'skill', cost: 2, rarity: 'rare', manaGain: 2, selfInsight: 3, desc: '마나를 2 얻고 통찰 3을 얻습니다. (다음 턴 3장 추가 드로우)' },
// --- 신규 추가: 레어 (15종 / 극대화된 시너지, 대량 마나/드로우) ---
  { id: 'grand_strategy', name: '대전략', type: 'skill', cost: 2, rarity: 'rare', selfInsight: 4, selfStrength: 1, selfDex: 1, desc: '통찰 4를 얻고 근력과 민첩을 각각 1 얻습니다.' },
  { id: 'time_warp', name: '시간 왜곡', type: 'skill', cost: 3, rarity: 'rare', draw: 5, manaGain: 3, desc: '카드를 5장 뽑고 마나를 3 얻습니다.' },
  { id: 'mass_hysteria', name: '집단 광기', type: 'skill', cost: 2, rarity: 'rare', enemyWeak: 4, enemyVuln: 4, enemyFrail: 4, desc: '적에게 약화 4, 취약 4, 허약 4를 부여합니다.' },
  { id: 'elixir_of_life', name: '생명의 영약', type: 'skill', cost: 2, rarity: 'rare', heal: 20, selfRegen: 4, desc: '체력을 20 회복하고 재생 4를 얻습니다.' },
  { id: 'mana_tide', name: '마나 해일', type: 'skill', cost: 2, rarity: 'rare', manaGain: 4, draw: 2, desc: '마나를 4 얻고 카드를 2장 뽑습니다.' },
  { id: 'seal_of_binding', name: '구속의 인장', type: 'skill', cost: 2, rarity: 'rare', enemyBind: 1, enemyMark: 5, desc: '적에게 속박 1과 표식 5를 부여합니다.' },
  { id: 'silencing_strike', name: '침묵의 일격', type: 'attack', cost: 2, rarity: 'rare', damage: 15, enemySilence: 1, desc: '15의 피해를 주고 침묵 1을 부여합니다.' },
  { id: 'echo_of_magic', name: '마법의 메아리', type: 'skill', cost: 1, rarity: 'rare', manaGain: 2, draw: 3, selfDamage: 2, desc: '마나를 2 얻고 카드를 3장 뽑지만 체력을 2 잃습니다.' },
  { id: 'absolute_focus', name: '절대 집중', type: 'skill', cost: 2, rarity: 'rare', selfInsight: 5, block: 15, desc: '15의 방어도를 얻고 통찰 5를 얻습니다.' },
  { id: 'venom_eruption', name: '맹독 분출', type: 'skill', cost: 2, rarity: 'rare', enemyPoison: 10, enemyFrail: 3, desc: '적에게 중독 10과 허약 3을 부여합니다.' },
  { id: 'blood_frenzy', name: '피의 광란', type: 'skill', cost: 2, rarity: 'rare', selfRage: 6, selfStrength: 2, selfDamage: 5, desc: '체력을 5 잃지만 근력 2와 격노 6을 얻습니다.' },
  { id: 'astral_projection', name: '유체 이탈', type: 'skill', cost: 3, rarity: 'rare', selfIntangible: 1, draw: 2, desc: '카드를 2장 뽑고 1턴 동안 무형 상태가 됩니다.' },
  { id: 'leech_seed', name: '씨앗 뿌리기', type: 'skill', cost: 2, rarity: 'rare', enemyPoison: 5, selfRegen: 3, desc: '적에게 중독 5를 부여하고 재생 3을 얻습니다.' },
  { id: 'mind_control', name: '정신 지배', type: 'skill', cost: 3, rarity: 'rare', enemyBind: 1, enemyWeak: 3, enemyVuln: 3, desc: '적에게 속박 1, 약화 3, 취약 3을 부여합니다.' },
  { id: 'overload', name: '한계 돌파', type: 'skill', cost: 0, rarity: 'rare', manaGain: 5, selfDamage: 10, desc: '체력을 10 잃고 마나를 5 얻습니다.' },

  // --- 신규 추가: 스페셜 (9종 / 보스급 사기 능력) ---
  { id: 'gods_eye', name: '신의 눈', type: 'skill', cost: 2, rarity: 'special', enemyMark: 10, enemyVuln: 5, desc: '적에게 표식 10과 취약 5를 부여합니다.' },
  { id: 'dragon_blood', name: '용의 피', type: 'skill', cost: 3, rarity: 'special', selfRegen: 10, selfStrength: 5, desc: '재생 10과 근력 5를 얻습니다.' },
  { id: 'infinite_mana_reactor', name: '무한 마나 원자로', type: 'skill', cost: 3, rarity: 'special', manaGain: 8, draw: 4, desc: '마나를 8 얻고 카드를 4장 뽑습니다.' },
  { id: 'time_stop', name: '시간 정지', type: 'skill', cost: 3, rarity: 'special', enemyBind: 2, enemySilence: 2, desc: '적에게 속박 2와 침묵 2를 부여합니다. (2턴간 모든 행동 불가)' },
  { id: 'chaos_magic', name: '혼돈 마법', type: 'skill', cost: 2, rarity: 'special', draw: 5, manaGain: 5, selfDamage: 15, desc: '체력을 15 잃지만 카드를 5장 뽑고 마나를 5 얻습니다.' },
  { id: 'abyssal_gaze', name: '심연의 응시', type: 'skill', cost: 2, rarity: 'special', enemyWeak: 10, enemyFrail: 10, desc: '적에게 약화 10과 허약 10을 부여합니다.' },
  { id: 'slimes_greed', name: '슬라임의 탐욕', type: 'skill', cost: 1, rarity: 'special', draw: 4, manaGain: 2, heal: 10, desc: '체력을 10 회복하고 마나 2를 얻으며 카드를 4장 뽑습니다.' },
  { id: 'asuras_wrath', name: '수라의 분노', type: 'skill', cost: 3, rarity: 'special', selfRage: 10, selfStrength: 5, desc: '격노 10과 근력 5를 얻습니다.' },
  { id: 'spider_queens_web', name: '여왕 거미의 거미줄', type: 'skill', cost: 2, rarity: 'special', enemyBind: 1, enemyPoison: 15, desc: '적에게 속박 1과 중독 15를 부여합니다.' },
  { id: 'super_tiger_slash', name: '초절맹호살격난참', type: 'attack', cost: 3, rarity: 'special', damage: 15, multiHit: 6, enemyVuln: 2, desc: '15의 피해를 6번 연속 주고 취약 2를 부여합니다. (총 90)' },
  { id: 'true_dragon_slayer', name: '진·용살검', type: 'attack', cost: 3, rarity: 'special', damage: 80, selfStrength: 3, enemyVuln: 2, desc: '80의 피해를 주고 근력을 3 얻으며 취약 2를 부여합니다.' },
  { id: 'absolute_zero', name: '절대영도', type: 'skill', cost: 3, rarity: 'special', block: 40, enemyWeak: 4, enemyVuln: 4, desc: '40의 방어도를 얻고 적에게 약화 4, 취약 4를 부여합니다.' },
  { id: 'heavenly_judgment', name: '신천벌', type: 'attack', cost: 3, rarity: 'special', damage: 50, heal: 30, draw: 3, enemyWeak: 3, desc: '50의 피해를 주고 체력을 30 회복하며 카드를 3장 뽑습니다. 약화 3을 부여합니다.' },
  { id: 'supreme_blade_storm', name: '패왕의 검풍', type: 'attack', cost: 3, rarity: 'special', damage: 15, multiHit: 8, enemyVuln: 3, desc: '15의 피해를 8번 연속 주고 취약 3을 부여합니다. (총 120)' },
  { id: 'blood_of_phoenix', name: '불사조의 피', type: 'skill', cost: 3, rarity: 'special', heal: 100, selfDamage: 10, enemyWeak: 3, desc: '체력을 100 회복하지만 즉시 체력을 10 잃습니다. 약화 3을 부여합니다.' },
  { id: 'descent_of_demon_lord', name: '진·마왕의 강림', type: 'skill', cost: 3, rarity: 'special', selfStrength: 5, selfDex: 5, selfDamage: 15, enemyVuln: 2, desc: '근력 5, 민첩 5를 얻고 취약 2를 부여하지만 체력을 15 잃습니다.' },
  { id: 'spider_queen_poison', name: '거미 여왕의 맹독', type: 'attack', cost: 2, rarity: 'special', damage: 20, enemyWeak: 3, enemyVuln: 3, desc: '20의 피해를 주고 적에게 약화 3, 취약 3을 부여합니다.' },
  { id: 'twerking', name: '트월킹', type: 'attack', cost: 2, rarity: 'special', damage: 50, enemyVuln: 3, desc: '격렬한 움직임으로 적에게 50의 피해를 주고 취약 3을 부여합니다.' },
  { id: 'power_of_asura', name: '수라의 힘', type: 'skill', cost: 3, rarity: 'special', selfStrength: 8, block: 30, desc: '분노를 일깨워 근력을 8 얻고 30의 방어도를 얻습니다.' },
  { id: 'slime_snot', name: '슬라임의 콧물', type: 'skill', cost: 0, rarity: 'special', heal: 50, block: 50, draw: 3, manaGain: 3, desc: '매우 더럽지만 신비한 힘! 체력과 방어도를 50 얻고 카드 3장과 마나 3을 얻습니다.' },
  
  { id: 'omniscience', name: '전지전능', type: 'skill', cost: 3, rarity: 'mythic', draw: 5, manaGain: 5, selfInsight: 5, enemyWeak: 5, enemyVuln: 5, desc: '카드를 5장 뽑고 마나 5, 통찰 5를 얻습니다. 적에게 약화 5, 취약 5를 부여합니다.' },
  { id: 'phantom_walk', name: '환영 보법', type: 'skill', cost: 3, rarity: 'mythic', selfIntangible: 1, exhaust: true, desc: '1턴 동안 무형 상태가 됩니다. (받는 모든 타격 피해가 1로 고정, 사용 후 소멸)' },
  { id: 'furioso', name: 'Furioso (퓨리오소)', type: 'attack', cost: 3, rarity: 'mythic', damage: 12, multiHit: 9, increasingDamage: 7, desc: '12의 피해를 9번 연속 줍니다. (타격 시마다 피해량이 7씩 증가합니다.)' },
];

// --- 적 및 보스 라이브러리 ---
// --- 적 및 보스 라이브러리 ---
export const ENEMIES = [
  // 기존 15종
  { name: '슬라임', baseHp: 30, deck: [{ name: '몸통 박치기', type: 'attack', value: 8, desc: '8의 피해를 줍니다.' }, { name: '점액 세례', type: 'attack', value: 4, multi: 2, desc: '4의 피해를 2번 줍니다.' }, { name: '끈적임', type: 'debuff', debuff: 'weak', turns: 2, desc: '약화 2를 부여합니다.' }] },
  { name: '박쥐', baseHp: 25, deck: [{ name: '흡혈 송곳니', type: 'attack_heal', value: 7, heal: 5, desc: '7의 피해를 주고 체력을 5 회복합니다.' }, { name: '초음파', type: 'debuff', debuff: 'vulnerable', turns: 1, desc: '취약 1을 부여합니다.' }] },
  { name: '고블린', baseHp: 35, deck: [{ name: '단검 찌르기', type: 'attack', value: 10, desc: '10의 피해를 줍니다.' }, { name: '방어 태세', type: 'defend', value: 10, desc: '10의 방어도를 얻습니다.' }, { name: '모래 뿌리기', type: 'debuff', debuff: 'weak', turns: 2, desc: '약화 2를 부여합니다.' }] },
  { name: '늑대', baseHp: 40, deck: [{ name: '물어뜯기', type: 'attack', value: 12, desc: '12의 피해를 줍니다.' }, { name: '울부짖기', type: 'debuff', debuff: 'vulnerable', turns: 2, desc: '취약 2를 부여합니다.' }] },
  { name: '스켈레톤', baseHp: 45, deck: [{ name: '뼈 던지기', type: 'attack', value: 14, desc: '14의 피해를 줍니다.' }, { name: '방패 올리기', type: 'defend', value: 12, desc: '12의 방어도를 얻습니다.' }, { name: '2연참', type: 'attack', value: 7, multi: 2, desc: '7의 피해를 2번 줍니다.' }] },
  { name: '유령', baseHp: 38, deck: [{ name: '원혼의 손길', type: 'attack_debuff', value: 8, debuff: 'weak', turns: 1, desc: '8의 피해를 주고 약화 1을 부여합니다.' }, { name: '꿰뚫기', type: 'attack', value: 16, desc: '16의 피해를 줍니다.' }] },
  { name: '오크', baseHp: 60, deck: [{ name: '도끼 강타', type: 'attack', value: 20, desc: '20의 피해를 줍니다.' }, { name: '전투의 함성', type: 'defend_debuff', value: 10, debuff: 'vulnerable', turns: 1, desc: '10의 방어도를 얻고 취약 1을 부여합니다.' }] },
  { name: '거미', baseHp: 42, deck: [{ name: '맹독 이빨', type: 'attack', value: 14, desc: '14의 피해를 줍니다.' }, { name: '거미줄 치기', type: 'debuff', debuff: 'weak', turns: 3, desc: '약화 3을 부여합니다.' }] },
  { name: '광신도', baseHp: 55, deck: [{ name: '어둠의 의식', type: 'attack', value: 22, desc: '22의 피해를 줍니다.' }, { name: '어둠의 치유', type: 'heal', heal: 15, desc: '체력을 15 회복합니다.' }, { name: '저주', type: 'debuff', debuff: 'vulnerable', turns: 2, desc: '취약 2를 부여합니다.' }] },
  { name: '가고일', baseHp: 70, deck: [{ name: '석화', type: 'defend', value: 25, desc: '25의 방어도를 얻습니다.' }, { name: '강하', type: 'attack', value: 18, desc: '18의 피해를 줍니다.' }] },
  { name: '머드맨', baseHp: 50, deck: [{ name: '진흙 던지기', type: 'attack_debuff', value: 10, debuff: 'weak', turns: 1, desc: '10의 피해를 주고 약화 1을 부여합니다.' }, { name: '재생', type: 'heal', heal: 10, desc: '체력을 10 회복합니다.' }] },
  { name: '미믹', baseHp: 65, deck: [{ name: '깜짝 물기', type: 'attack', value: 18, desc: '18의 피해를 줍니다.' }, { name: '굳게 닫기', type: 'defend', value: 20, desc: '20의 방어도를 얻습니다.' }] },
  { name: '밴시', baseHp: 45, deck: [{ name: '침묵의 비명', type: 'debuff', debuff: 'silence', turns: 1, desc: '침묵 1을 부여합니다. (다음 턴 스킬 불가)' }, { name: '영혼 흡수', type: 'attack_heal', value: 12, heal: 10, desc: '12의 피해를 주고 체력을 10 회복합니다.' }] },
  { name: '골렘', baseHp: 80, deck: [{ name: '바위 주먹', type: 'attack', value: 25, desc: '25의 피해를 줍니다.' }, { name: '묵직한 가드', type: 'defend_debuff', value: 30, debuff: 'weak', turns: 1, desc: '30의 방어도를 얻고 약화 1을 부여합니다.' }] },
  { name: '켄타우로스', baseHp: 60, deck: [{ name: '돌격', type: 'attack', value: 20, desc: '20의 피해를 줍니다.' }, { name: '연속 화살', type: 'attack', value: 8, multi: 3, desc: '8의 피해를 3번 줍니다.' }] },
  
  // 신규 추가 15종 (총 30마리)
  { name: '불의 정령', baseHp: 45, deck: [{ name: '화염구', type: 'attack', value: 12, desc: '12의 피해를 줍니다.' }, { name: '화상', type: 'debuff', debuff: 'vulnerable', turns: 2, desc: '취약 2를 부여합니다.' }, { name: '불꽃 장벽', type: 'defend', value: 15, desc: '15의 방어도를 얻습니다.' }] },
  { name: '물의 정령', baseHp: 55, deck: [{ name: '물대포', type: 'attack', value: 10, desc: '10의 피해를 줍니다.' }, { name: '치유의 물결', type: 'heal', heal: 15, desc: '체력을 15 회복합니다.' }, { name: '동결', type: 'debuff', debuff: 'weak', turns: 2, desc: '약화 2를 부여합니다.' }] },
  { name: '서큐버스', baseHp: 65, deck: [{ name: '생기 흡수', type: 'attack_heal', value: 15, heal: 15, desc: '15의 피해를 주고 체력을 15 회복합니다.' }, { name: '매혹', type: 'debuff', debuff: 'weak', turns: 3, desc: '약화 3을 부여합니다.' }] },
  { name: '듀라한', baseHp: 85, deck: [{ name: '참수', type: 'attack', value: 25, desc: '25의 피해를 줍니다.' }, { name: '공포', type: 'debuff', debuff: 'vulnerable', turns: 3, desc: '취약 3을 부여합니다.' }, { name: '강철 갑옷', type: 'defend', value: 20, desc: '20의 방어도를 얻습니다.' }] },
  { name: '뱀파이어 헌터', baseHp: 75, deck: [{ name: '은탄환', type: 'attack', value: 18, desc: '18의 피해를 줍니다.' }, { name: '성수', type: 'debuff', debuff: 'weak', turns: 2, desc: '약화 2를 부여합니다.' }, { name: '난사', type: 'attack', value: 6, multi: 3, desc: '6의 피해를 3번 줍니다.' }] },
  { name: '리자드맨', baseHp: 60, deck: [{ name: '꼬리치기', type: 'attack', value: 14, desc: '14의 피해를 줍니다.' }, { name: '비늘 강화', type: 'defend', value: 15, desc: '15의 방어도를 얻습니다.' }, { name: '재생력', type: 'heal', heal: 12, desc: '체력을 12 회복합니다.' }] },
  { name: '하피', baseHp: 40, deck: [{ name: '발톱 베기', type: 'attack', value: 8, multi: 2, desc: '8의 피해를 2번 연속 줍니다.' }, { name: '귀청 찢기', type: 'debuff', debuff: 'silence', turns: 1, desc: '침묵 1을 부여합니다.' }] },
  { name: '만드라고라', baseHp: 50, deck: [{ name: '비명소리', type: 'attack_debuff', value: 5, debuff: 'vulnerable', turns: 2, desc: '5의 피해를 주고 취약 2를 부여합니다.' }, { name: '뿌리 묶기', type: 'debuff', debuff: 'bind', turns: 1, desc: '속박 1을 부여합니다.' }] },
  { name: '트롤', baseHp: 90, deck: [{ name: '몽둥이 찜질', type: 'attack', value: 22, desc: '22의 피해를 줍니다.' }, { name: '트롤의 피', type: 'heal', heal: 25, desc: '체력을 25 회복합니다.' }] },
  { name: '그림 리퍼', baseHp: 70, deck: [{ name: '영혼 수확', type: 'attack_heal', value: 20, heal: 10, desc: '20의 피해를 주고 체력을 10 회복합니다.' }, { name: '죽음의 선고', type: 'debuff', debuff: 'vulnerable', turns: 3, desc: '취약 3을 부여합니다.' }, { name: '망령화', type: 'defend', value: 30, desc: '30의 방어도를 얻습니다.' }] },
  { name: '코카트리스', baseHp: 55, deck: [{ name: '부리 쪼기', type: 'attack', value: 12, desc: '12의 피해를 줍니다.' }, { name: '석화의 눈', type: 'debuff', debuff: 'bind', turns: 1, desc: '속박 1을 부여합니다.' }, { name: '날개 치기', type: 'attack', value: 15, desc: '15의 피해를 줍니다.' }] },
  { name: '다크 나이트', baseHp: 85, deck: [{ name: '암흑 검격', type: 'attack', value: 18, desc: '18의 피해를 줍니다.' }, { name: '어둠의 방패', type: 'defend', value: 25, desc: '25의 방어도를 얻습니다.' }, { name: '칠흑의 기운', type: 'buff', buff: 'strength', buffValue: 2, turns: 1, desc: '근력을 2 얻습니다.' }] },
  { name: '환영술사', baseHp: 45, deck: [{ name: '정신 파괴', type: 'attack_debuff', value: 10, debuff: 'weak', turns: 3, desc: '10의 피해를 주고 약화 3을 부여합니다.' }, { name: '환영 분신', type: 'defend', value: 40, desc: '40의 방어도를 얻습니다.' }] },
  { name: '데몬 쥐', baseHp: 35, deck: [{ name: '갉아먹기', type: 'attack', value: 5, multi: 3, desc: '5의 피해를 3번 줍니다.' }, { name: '역병 전파', type: 'debuff', debuff: 'vulnerable', turns: 2, desc: '취약 2를 부여합니다.' }] },
  { name: '폭탄 고블린', baseHp: 40, deck: [{ name: '자폭 투척', type: 'attack', value: 25, desc: '25의 피해를 줍니다.' }, { name: '불안정한 화약', type: 'buff', buff: 'strength', buffValue: 3, turns: 1, desc: '근력을 3 얻습니다.' }] }
];


 // --- 하드 모드 10층 단위 전용 보스 (총 20종, 약함 -> 강함 순서) ---
export const HARD_MODE_BOSSES = [
  // 1~5 티어: 귀엽거나 비교적 상대하기 쉬운 초반 보스들
  { name: '솜뭉치 유령', baseHp: 200, deck: [
    { name: '솜뭉치 펀치', type: 'attack', value: 15, desc: '15의 피해를 줍니다.' }, 
    { name: '폭신폭신', type: 'defend', value: 30, desc: '30의 방어도를 얻습니다.' }, 
    { name: '재채기 가루', type: 'debuff', debuff: 'weak', turns: 2, desc: '약화 2를 부여합니다.' }
  ]},
  { name: '심술쟁이 요정', baseHp: 250, deck: [
    { name: '요정의 장난', type: 'attack', value: 8, multi: 2, desc: '8의 피해를 2번 줍니다.' }, 
    { name: '눈부신 가루', type: 'debuff', debuff: 'frail', turns: 2, desc: '허약 2를 부여합니다.' }, 
    { name: '반짝반짝', type: 'heal', heal: 30, desc: '체력을 30 회복합니다.' }
  ]},
  { name: '서큐버스 동생 리리', baseHp: 300, deck: [
    { name: '하트 브레이커', type: 'attack_debuff', value: 20, debuff: 'vulnerable', turns: 2, desc: '20의 피해를 주고 취약 2를 부여합니다.' }, 
    { name: '달콤한 속삭임', type: 'debuff', debuff: 'silence', turns: 1, desc: '침묵 1을 부여합니다. (스킬 봉인)' }, 
    { name: '언니 도와줘!', type: 'defend_buff', value: 40, buff: 'strength', buffValue: 2, desc: '40의 방어도를 얻고 근력을 2 얻습니다.' }
  ]},
  { name: '서큐버스 언니 롤라', baseHp: 350, deck: [
    { name: '사랑의 채찍', type: 'attack', value: 12, multi: 3, desc: '12의 피해를 3번 줍니다.' }, 
    { name: '정기 흡수', type: 'attack_heal', value: 25, heal: 25, desc: '25의 피해를 주고 체력을 25 회복합니다.' }, 
    { name: '위험한 매력', type: 'debuff', debuff: 'bind', turns: 1, desc: '속박 1을 부여합니다. (공격 봉인)' }
  ]},
  { name: '화가 난 호박 기사', baseHp: 400, deck: [
    { name: '호박 머리 박치기', type: 'attack', value: 35, desc: '35의 피해를 줍니다.' }, 
    { name: '넝쿨 묶기', type: 'attack_debuff', value: 15, debuff: 'frail', turns: 3, desc: '15의 피해를 주고 허약 3을 부여합니다.' }, 
    { name: '단단한 껍질', type: 'defend', value: 50, desc: '50의 방어도를 얻습니다.' }
  ]},

  // 6~10 티어: 중간 단계의 위협적인 보스들
  { name: '거대 꿀벌 여왕', baseHp: 450, deck: [
    { name: '독침 찌르기', type: 'attack_debuff', value: 25, debuff: 'poison', turns: 4, desc: '25의 피해를 주고 중독 4를 부여합니다.' }, 
    { name: '페로몬 살포', type: 'debuff', debuff: 'mark', turns: 3, desc: '표식 3을 부여합니다.' }, 
    { name: '일벌 소환', type: 'defend', value: 60, desc: '60의 방어도를 얻습니다.' }
  ]},
  { name: '달빛 늑대인간', baseHp: 500, deck: [
    { name: '광란의 발톱', type: 'attack', value: 20, multi: 2, desc: '20의 피해를 2번 줍니다.' }, 
    { name: '피의 갈증', type: 'buff', buff: 'strength', buffValue: 3, desc: '근력을 3 얻습니다.' }, 
    { name: '물어뜯기', type: 'attack_heal', value: 30, heal: 20, desc: '30의 피해를 주고 체력을 20 회복합니다.' }
  ]},
  { name: '광기의 연금술사', baseHp: 550, deck: [
    { name: '화학 물질 투척', type: 'attack', value: 45, desc: '45의 피해를 줍니다.' }, 
    { name: '유독 가스', type: 'debuff', debuff: 'poison', turns: 5, desc: '중독 5를 부여합니다.' }, 
    { name: '돌연변이 물약', type: 'defend_buff', value: 40, buff: 'strength', buffValue: 4, desc: '40의 방어도를 얻고 근력을 4 얻습니다.' }
  ]},
  { name: '고대 유적의 파수꾼', baseHp: 600, deck: [
    { name: '레이저 빔', type: 'attack', value: 50, desc: '50의 피해를 줍니다.' }, 
    { name: '강제 제압', type: 'attack_debuff', value: 20, debuff: 'bind', turns: 1, desc: '20의 피해를 주고 속박 1을 부여합니다.' }, 
    { name: '방어막 전개', type: 'defend', value: 80, desc: '80의 방어도를 얻습니다.' }
  ]},
  { name: '빙결의 마녀', baseHp: 650, deck: [
    { name: '얼음 송곳', type: 'attack', value: 15, multi: 3, desc: '15의 피해를 3번 줍니다.' }, 
    { name: '눈보라', type: 'debuff', debuff: 'weak', turns: 4, desc: '약화 4를 부여합니다.' }, 
    { name: '절대 영도', type: 'debuff', debuff: 'silence', turns: 1, desc: '침묵 1을 부여합니다.' }
  ]},

  // 11~15 티어: 본격적인 하드 모드의 악랄한 보스들
  { name: '심해의 악몽', baseHp: 700, deck: [
    { name: '먹물 뿜기', type: 'attack_debuff', value: 35, debuff: 'frail', turns: 4, desc: '35의 피해를 주고 허약 4를 부여합니다.' }, 
    { name: '촉수 난타', type: 'attack', value: 18, multi: 4, desc: '18의 피해를 4번 줍니다.' }, 
    { name: '심해의 재생', type: 'heal', heal: 80, desc: '체력을 80 회복합니다.' }
  ]},
  { name: '타락한 성녀', baseHp: 750, deck: [
    { name: '신성한 불꽃', type: 'attack', value: 60, desc: '60의 피해를 줍니다.' }, 
    { name: '거짓된 축복', type: 'attack_debuff', value: 30, debuff: 'vulnerable', turns: 3, desc: '30의 피해를 주고 취약 3을 부여합니다.' }, 
    { name: '기적의 방패', type: 'defend', value: 100, desc: '100의 방어도를 얻습니다.' }
  ]},
  { name: '강철 거수', baseHp: 800, deck: [
    { name: '지진 일으키기', type: 'attack_debuff', value: 45, debuff: 'weak', turns: 3, desc: '45의 피해를 주고 약화 3을 부여합니다.' }, 
    { name: '초고열 용광로', type: 'buff', buff: 'strength', buffValue: 5, desc: '근력을 5 얻습니다.' }, 
    { name: '육중한 돌진', type: 'attack', value: 70, desc: '70의 피해를 줍니다.' }
  ]},
  { name: '핏빛 군단장', baseHp: 850, deck: [
    { name: '참수격', type: 'attack', value: 80, desc: '80의 피해를 줍니다.' }, 
    { name: '출혈 강요', type: 'attack_debuff', value: 40, debuff: 'mark', turns: 5, desc: '40의 피해를 주고 표식 5를 부여합니다.' }, 
    { name: '군단의 방진', type: 'defend', value: 120, desc: '120의 방어도를 얻습니다.' }
  ]},
  { name: '역병의 사도', baseHp: 900, deck: [
    { name: '부패의 숨결', type: 'attack_debuff', value: 30, debuff: 'poison', turns: 6, desc: '30의 피해를 주고 중독 6을 부여합니다.' }, 
    { name: '질병 전파', type: 'debuff', debuff: 'frail', turns: 5, desc: '허약 5를 부여합니다.' }, 
    { name: '죽음의 포옹', type: 'attack_heal', value: 50, heal: 50, desc: '50의 피해를 주고 체력을 50 회복합니다.' }
  ]},

  // 16~20 티어: 최상위 종말급 보스들
  { name: '그림자 군주', baseHp: 950, deck: [
    { name: '어둠의 장막', type: 'debuff', debuff: 'silence', turns: 1, desc: '침묵 1을 부여합니다.' }, 
    { name: '그림자 베기', type: 'attack', value: 25, multi: 4, desc: '25의 피해를 4번 줍니다.' }, 
    { name: '허구의 방패', type: 'defend', value: 150, desc: '150의 방어도를 얻습니다.' }
  ]},
  { name: '고대 용의 망령', baseHp: 1000, deck: [
    { name: '망령 브레스', type: 'attack_debuff', value: 70, debuff: 'vulnerable', turns: 4, desc: '70의 피해를 주고 취약 4를 부여합니다.' }, 
    { name: '원혼 폭발', type: 'attack', value: 100, desc: '100의 피해를 줍니다.' }, 
    { name: '영혼 착취', type: 'attack_heal', value: 40, heal: 80, desc: '40의 피해를 주고 체력을 80 회복합니다.' }
  ]},
  { name: '지옥의 재판관', baseHp: 1100, deck: [
    { name: '사형 선고', type: 'debuff', debuff: 'mark', turns: 10, desc: '표식 10을 부여합니다.' }, 
    { name: '죄악 심판', type: 'attack', value: 30, multi: 5, desc: '30의 피해를 5번 줍니다.' }, 
    { name: '구속구 채우기', type: 'attack_debuff', value: 50, debuff: 'bind', turns: 1, desc: '50의 피해를 주고 속박 1을 부여합니다.' }
  ]},
  { name: '공허의 파괴자', baseHp: 1200, deck: [
    { name: '차원 분쇄', type: 'attack', value: 120, desc: '120의 피해를 줍니다.' }, 
    { name: '존재 소멸', type: 'debuff', debuff: 'silence', turns: 2, desc: '침묵 2를 부여합니다.' }, 
    { name: '공허 흡수', type: 'defend_buff', value: 200, buff: 'strength', buffValue: 5, desc: '200의 방어도를 얻고 근력을 5 얻습니다.' }
  ]},
  { name: '종말의 전령', baseHp: 1500, deck: [
    { name: '종말의 도래', type: 'attack_debuff', value: 150, debuff: 'frail', turns: 5, desc: '150의 피해를 주고 허약 5를 부여합니다.' }, 
    { name: '절망의 빛', type: 'attack', value: 40, multi: 5, desc: '40의 피해를 5번 줍니다.' }, 
    { name: '불가역의 시간', type: 'heal', heal: 200, desc: '체력을 200 회복합니다.' }
  ]}
];
export const NORMAL_BOSSES = [
  // 기존 8종
  { name: '킹 슬라임', baseHp: 150, deck: [{ name: '대지진', type: 'attack', value: 25, desc: '25의 피해를 줍니다.' }, { name: '굳어지기', type: 'defend', value: 30, desc: '30의 방어도를 얻습니다.' }, { name: '강산성 점액', type: 'attack_debuff', value: 15, debuff: 'weak', turns: 3, desc: '15의 피해를 주고 약화 3을 부여합니다.' }] }, 
  { name: '고블린 족장', baseHp: 250, deck: [{ name: '연속 찌르기', type: 'attack', value: 10, multi: 3, desc: '10의 피해를 3번 줍니다.' }, { name: '총공격 지시', type: 'debuff', debuff: 'vulnerable', turns: 3, desc: '취약 3을 부여합니다.' }, { name: '철벽 방어', type: 'defend', value: 40, desc: '40의 방어도를 얻습니다.' }] }, 
  { name: '오크 대장군', baseHp: 400, deck: [{ name: '참수', type: 'attack', value: 40, desc: '40의 피해를 줍니다.' }, { name: '피의 굶주림', type: 'attack_debuff', value: 25, debuff: 'vulnerable', turns: 2, desc: '25의 피해를 주고 취약 2를 부여합니다.' }, { name: '대장군의 기백', type: 'defend', value: 50, desc: '50의 방어도를 얻습니다.' }] }, 
  { name: '뱀파이어 로드', baseHp: 650, deck: [{ name: '생명 흡수', type: 'attack_heal', value: 35, heal: 20, desc: '35의 피해를 주고 체력을 20 회복합니다.' }, { name: '피의 안개', type: 'debuff', debuff: 'weak', turns: 4, desc: '약화 4를 부여합니다.' }, { name: '절망의 시선', type: 'debuff', debuff: 'vulnerable', turns: 4, desc: '취약 4를 부여합니다.' }] }, 
  { name: '고대 드래곤', baseHp: 1000, deck: [{ name: '드래곤 브레스', type: 'attack', value: 60, desc: '60의 피해를 줍니다.' }, { name: '비늘 강화', type: 'defend', value: 80, desc: '80의 방어도를 얻습니다.' }, { name: '압도적 공포', type: 'debuff', debuff: 'weak', turns: 5, desc: '약화 5를 부여합니다.' }] },
  { name: '미노타우로스', baseHp: 300, deck: [{ name: '뿔 들이받기', type: 'attack', value: 45, desc: '45의 피해를 줍니다.' }, { name: '광폭화', type: 'buff', buff: 'strength', buffValue: 3, turns: 1, desc: '근력을 3 얻습니다.' }, { name: '도끼 휩쓸기', type: 'attack', value: 30, desc: '30의 피해를 줍니다.' }] },
  { name: '마스터 리치', baseHp: 500, deck: [{ name: '죽음의 광선', type: 'attack', value: 50, desc: '50의 피해를 줍니다.' }, { name: '저주받은 구속', type: 'debuff', debuff: 'bind', turns: 1, desc: '속박 1을 부여합니다. (다음 턴 공격 불가)' }, { name: '생명력 착취', type: 'attack_heal', value: 30, heal: 30, desc: '30의 피해를 주고 30 회복합니다.' }] },
  { name: '돌연변이 키메라', baseHp: 800, deck: [{ name: '독사 꼬리', type: 'attack_debuff', value: 20, debuff: 'weak', turns: 3, desc: '20의 피해를 주고 약화 3을 부여합니다.' }, { name: '사자후', type: 'debuff', debuff: 'vulnerable', turns: 3, desc: '취약 3을 부여합니다.' }, { name: '무자비한 찢기', type: 'attack', value: 40, desc: '40의 피해를 줍니다.' }] },
  
  // 신규 추가 보스 5종
  { name: '타락한 성기사', baseHp: 450, deck: [{ name: '신성한 심판', type: 'attack', value: 35, desc: '35의 피해를 줍니다.' }, { name: '타락한 축복', type: 'buff', buff: 'strength', buffValue: 3, turns: 1, desc: '근력을 3 얻습니다.' }, { name: '절대 방어', type: 'defend', value: 50, desc: '50의 방어도를 얻습니다.' }] },
  { name: '지옥의 파수견', baseHp: 550, deck: [{ name: '물어뜯기', type: 'attack', value: 20, multi: 2, desc: '20의 피해를 2번 줍니다.' }, { name: '지옥의 불꽃', type: 'attack_debuff', value: 30, debuff: 'vulnerable', turns: 3, desc: '30의 피해를 주고 취약 3을 부여합니다.' }, { name: '포효', type: 'debuff', debuff: 'weak', turns: 3, desc: '약화 3을 부여합니다.' }] },
  { name: '고대 골렘 마스터', baseHp: 700, deck: [{ name: '대지 분쇄', type: 'attack', value: 45, desc: '45의 피해를 줍니다.' }, { name: '바위 방패', type: 'defend', value: 60, desc: '60의 방어도를 얻습니다.' }, { name: '압도', type: 'debuff', debuff: 'weak', turns: 4, desc: '약화 4를 부여합니다.' }] },
  { name: '맹독의 여왕', baseHp: 600, deck: [{ name: '맹독 가시', type: 'attack', value: 15, multi: 3, desc: '15의 피해를 3번 줍니다.' }, { name: '마비 독', type: 'debuff', debuff: 'bind', turns: 1, desc: '속박 1을 부여합니다.' }, { name: '산성 늪', type: 'attack_debuff', value: 25, debuff: 'vulnerable', turns: 4, desc: '25의 피해를 주고 취약 4를 부여합니다.' }] },
  { name: '심연의 주시자', baseHp: 850, deck: [{ name: '파멸의 광선', type: 'attack', value: 55, desc: '55의 피해를 줍니다.' }, { name: '정신 붕괴', type: 'debuff', debuff: 'silence', turns: 1, desc: '침묵 1을 부여합니다.' }, { name: '공허의 장막', type: 'defend', value: 70, desc: '70의 방어도를 얻습니다.' }] }
];

export const SPECIAL_BOSSES = {
  // rewardCards 속성을 추가하여 해당 보스를 클리어했을 때 전용 카드를 얻게 설정합니다.
  25: { name: '거미 여왕', baseHp: 500, rewardCards: ['spider_queens_web', 'spider_queen_poison'], passives: [], deck: [{ name: '맹독 샤워', type: 'attack_debuff', value: 15, multi: 2, debuff: 'weak', turns: 2, desc: '15의 피해를 2번 주고 약화 2를 부여합니다.' }, { name: '여왕의 명령', type: 'defend_debuff', value: 50, debuff: 'vulnerable', turns: 2, desc: '50의 방어도를 얻고 취약 2를 부여합니다.' }] },
  50: { name: '김삠삐', baseHp: 1500, rewardCards: ['twerking'], passives: [{ id: 'revive', name: '1회 부활', desc: '사망 시 체력을 50% 회복하고 1회 부활합니다.' }], deck: [{ name: '트월킹', type: 'attack_debuff', value: 30, debuff: 'vulnerable', turns: 2, desc: '30의 피해를 주고 취약 2를 부여합니다.' }, { name: '도발', type: 'defend_buff', value: 50, buff: 'strength', buffValue: 6, desc: '50의 방어도를 얻고 근력을 6 얻습니다.' }, { name: '회보오옥!', type: 'heal', heal: 200, desc: '체력을 200 회복합니다.' }] },
  75: { name: '수라의 왕', baseHp: 2500, rewardCards: ['asuras_wrath', 'power_of_asura', 'supreme_blade_storm'], passives: [{ id: 'scaling_strength', name: '끝없는 분노', desc: '매 턴 시작 시 근력이 3 증가합니다.' }], deck: [{ name: '육도윤회', type: 'attack', value: 15, multi: 6, desc: '15의 피해를 6번 줍니다.' }, { name: '금강불괴', type: 'defend', value: 100, desc: '100의 방어도를 얻습니다.' }, { name: '파괴의 눈', type: 'debuff', debuff: 'vulnerable', turns: 5, desc: '취약 5를 부여합니다.' }] },
  100: { name: '스스스슬라임', baseHp: 800, rewardCards: ['slime_snot', 'slimes_greed'], passives: [{ id: 'revive', name: '1회 부활', desc: '사망 시 체력을 50% 회복하고 1회 부활합니다.' }], deck: [{ name: '트리플 어택', type: 'attack', value: 20, multi: 3, desc: '20의 피해를 3번 줍니다.' }, { name: '산성비', type: 'attack_debuff', value: 40, debuff: 'weak', turns: 3, desc: '40의 피해를 주고 약화 3을 부여합니다.' }, { name: '단단한 결속', type: 'defend_buff', value: 100, buff: 'strength', buffValue: 5, desc: '100의 방어도를 얻고 근력을 5 얻습니다.' }] },

  // src/constants/gameData.js 내 SPECIAL_BOSSES 수정 (하드 모드 부분만 교체)

  // --- 하드 모드 전용 보스 ---
  H50: { 
    name: '초월한 슬라임', 
    baseHp: 3000, 
    passives: [{ id: 'scaling_strength', name: '분열하는 마력', desc: '매 턴 근력이 2씩 상승합니다.' }], 
    deck: [
      { name: '초월 낙하', type: 'attack', value: 30 },
      { name: '마력 재생', type: 'heal', heal: 250 },
      { name: '강산성 점액', type: 'attack_debuff', value: 15, debuff: 'frail', turns: 2 },
      { name: '분열 타격', type: 'attack', value: 10, multi: 4 },
      { name: '끈적한 늪', type: 'debuff', debuff: 'bind', turns: 1 },
      { name: '탄성 강화', type: 'defend', value: 150 },
      { name: '슬라임 웨이브', type: 'attack_debuff', value: 20, debuff: 'weak', turns: 2 },
      { name: '맹독 뱉기', type: 'attack_debuff', value: 10, debuff: 'poison', turns: 5 }
    ] 
  },
  H100: { 
    name: '기계화된 골렘', 
    baseHp: 5000, 
    passives: [{ id: 'iron_skin', name: '강철 장갑', desc: '받는 모든 피해가 25% 감소합니다.' }], 
    deck: [
      { name: '섬멸 레이저', type: 'attack', value: 25, multi: 3 },
      { name: '철벽 가동', type: 'defend', value: 300 },
      { name: '동력 충전', type: 'buff', buff: 'strength', amount: 5 },
      { name: '지진 일으키기', type: 'attack_debuff', value: 40, debuff: 'vulnerable', turns: 3 },
      { name: '오토 리페어', type: 'heal', heal: 400 },
      { name: '로켓 펀치', type: 'attack', value: 70 },
      { name: '방출', type: 'attack', value: 15, multi: 5 },
      { name: '타겟 록온', type: 'debuff', debuff: 'mark', turns: 10 }
    ] 
  },
  H150: { 
    name: '@#!%#', 
    baseHp: 7000, 
    passives: [{ id: 'glitch', name: '데이터 변조', desc: '매 턴 무작위 디버프를 부여합니다.' }], 
    deck: [
      { name: 'Fatal Error', type: 'attack_debuff', value: 60, debuff: 'vulnerable', turns: 5 },
      { name: 'Null Pointer', type: 'debuff', debuff: 'silence', turns: 1 },
      { name: 'Memory Leak', type: 'attack_debuff', value: 20, debuff: 'poison', turns: 10 },
      { name: 'Overflow', type: 'attack', value: 80 },
      { name: '0x00000000', type: 'attack', value: 0, multi: 15 },
      { name: 'System Restoring', type: 'heal', heal: 500 },
      { name: 'Corrupted File', type: 'attack_debuff', value: 30, debuff: 'bind', turns: 1 },
      { name: 'Blue Screen', type: 'attack_debuff', value: 50, debuff: 'frail', turns: 3 }
    ] 
  },
  H200: { 
    name: '종말의 정적', 
    baseHp: 9000, 
    passives: [{ id: 'silence_aura', name: '침묵의 오라', desc: '항상 플레이어의 스킬을 방해합니다.' }], 
    deck: [
      { name: '무의 세계', type: 'debuff', debuff: 'silence', turns: 2 },
      { name: '종말의 일격', type: 'attack', value: 120 },
      { name: '고요한 외침', type: 'attack_debuff', value: 40, debuff: 'weak', turns: 3 },
      { name: '생명력 흡수', type: 'attack_heal', value: 50, heal: 500 },
      { name: '정신 붕괴', type: 'attack_debuff', value: 30, multi: 3, debuff: 'vulnerable', turns: 3 },
      { name: '공허의 방패', type: 'defend', value: 500 },
      { name: '잊혀진 기억', type: 'debuff', debuff: 'mark', turns: 20 },
      { name: '사라지는 시간', type: 'attack', value: 25, multi: 4 }
    ] 
  },
  // ✨ 서큐버스 자매: 언니(물리/출혈 위주)
  H250_A: { 
    name: '릴리스 (서큐버스 언니)', 
    baseHp: 8000, 
    passives: [{ id: 'blood_thirst', name: '피의 갈증', desc: '공격 시 체력을 회복합니다.' }], 
    deck: [
      { name: '채찍질', type: 'attack', value: 30, multi: 3 },
      { name: '피의 향연', type: 'attack_heal', value: 60, heal: 300 },
      { name: '치명적인 발톱', type: 'attack_debuff', value: 45, debuff: 'frail', turns: 3 },
      { name: '가학적 쾌감', type: 'buff', buff: 'strength', amount: 8 },
      { name: '광란의 춤', type: 'attack', value: 20, multi: 5 },
      { name: '언니의 보호', type: 'defend', value: 400 },
      { name: '선혈 베기', type: 'attack', value: 90 }
    ] 
  },
  // ✨ 서큐버스 자매: 동생(마법/디버프 위주)
  H250_B: { 
    name: '모리건 (서큐버스 동생)', 
    baseHp: 7000, 
    passives: [{ id: 'charm_aura', name: '매혹의 오라', desc: '매 턴 플레이어에게 약화를 부여합니다.' }], 
    deck: [
      { name: '유혹의 입맞춤', type: 'attack_debuff', value: 20, debuff: 'weak', turns: 3 },
      { name: '악몽 주입', type: 'attack_debuff', value: 30, debuff: 'silence', turns: 1 },
      { name: '그림자 늪', type: 'debuff', debuff: 'bind', turns: 1 },
      { name: '환락의 저주', type: 'attack_debuff', value: 40, debuff: 'vulnerable', turns: 3 },
      { name: '동생의 응원', type: 'heal', heal: 400 }, // 언니도 회복시킬 수 있음
      { name: '영혼 흡취', type: 'attack_heal', value: 50, heal: 200 },
      { name: '어둠의 장막', type: 'defend', value: 300 }
    ] 
  },
  H300: { 
    name: '태초의 아케인: 에이온', 
    baseHp: 25000, 
    passives: [
      { id: 'arcane_mastery', name: '아케인의 지배자', desc: '방어도를 지속 획득합니다.' }, 
      { id: 'eternal_loop', name: '영원한 회귀', desc: '사망 시 1회 부활합니다.' }
    ], 
    deck: [
      { name: '빅뱅', type: 'attack', value: 25, multi: 8 },
      { name: '세계선 붕괴', type: 'attack_debuff', value: 80, debuff: 'vulnerable', turns: 5 },
      { name: '공허의 시선', type: 'debuff', debuff: 'silence', turns: 1 },
      { name: '별의 탄생', type: 'heal', heal: 999 },
      { name: '차원 단절', type: 'defend', value: 999 },
      { name: '은하 분쇄', type: 'attack', value: 200 },
      { name: '인과율 조작', type: 'debuff', debuff: 'bind', turns: 2 },
      { name: '태초의 빛', type: 'attack', value: 50, multi: 3 },
      { name: '절대 권력', type: 'buff', buff: 'strength', amount: 10 },
      { name: '종말 카운트다운', type: 'attack_debuff', value: 99, debuff: 'mark', turns: 10 }
    ] 
  }
};