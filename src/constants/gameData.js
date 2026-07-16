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

export const BASE_CARDS = ['strike', 'defend', 'heavy_strike', 'shield_bash', 'heal', 'mana_potion', 'focus', 'purify'];

// --- 플레이어 카드 라이브러리 ---
export const CARD_LIBRARY = [
  // 일반 (Common)
  { id: 'purify', name: '정화', type: 'skill', cost: 1, rarity: 'common', cleanse: true, desc: '성스러운 빛을 몸에 둘러 모든 해로운 효과(디버프)를 씻어냅니다.' },
  { id: 'strike', name: '타격', type: 'attack', cost: 1, rarity: 'common', damage: 8, desc: '무기를 가볍게 휘둘러 적에게 8의 피해를 줍니다.' },
  { id: 'defend', name: '방어', type: 'skill', cost: 1, rarity: 'common', block: 6, desc: '단단한 방어 자세를 취해 6의 방어도를 얻습니다.' },
  { id: 'heavy_strike', name: '강타', type: 'attack', cost: 2, rarity: 'common', damage: 18, desc: '온 힘을 다해 무기를 크게 내리쳐 적에게 18의 피해를 줍니다.' },
  { id: 'shield_bash', name: '방패 밀치기', type: 'attack', cost: 1, rarity: 'common', damage: 7, block: 7, desc: '들고 있는 방패로 적을 거칠게 밀쳐 7의 피해를 주고 7의 방어도를 얻습니다.' },
  { id: 'focus', name: '집중', type: 'skill', cost: 1, rarity: 'common', draw: 2, desc: '눈을 감고 호흡을 가다듬어 카드를 2장 뽑습니다.' },
  { id: 'stab', name: '찌르기', type: 'attack', cost: 1, rarity: 'common', damage: 6, draw: 1, desc: '빈틈을 노려 날카롭게 찔러 6의 피해를 주고 다음 행동을 준비해 카드를 1장 뽑습니다.' },
  { id: 'uppercut', name: '올려치기', type: 'attack', cost: 2, rarity: 'common', damage: 15, desc: '아래에서 위로 강력하게 턱을 걷어차 올려 15의 피해를 줍니다.' },
  { id: 'club_smash', name: '몽둥이 찜질', type: 'attack', cost: 2, rarity: 'common', damage: 14, enemyWeak: 1, desc: '둔탁한 무기로 사정없이 두들겨 패 14의 피해를 주고 적의 기운을 빼 약화 1을 부여합니다.' },
  { id: 'quick_strike', name: '신속한 타격', type: 'attack', cost: 0, rarity: 'common', damage: 4, desc: '눈에 보이지 않을 만큼 빠른 속도로 잽을 날려 4의 피해를 줍니다.' },
  { id: 'angry_strike', name: '분노의 일격', type: 'attack', cost: 1, rarity: 'common', damage: 12, selfDamage: 2, desc: '근육이 찢어지는 것을 감수하며 무기를 휘두릅니다. 12의 피해를 주지만 체력을 2 잃습니다.' },
  { id: 'sweep', name: '휩쓸기', type: 'attack', cost: 1, rarity: 'common', damage: 5, multiHit: 2, desc: '무기를 넓게 가로저어 5의 피해를 2번 연속 줍니다.' },
  { id: 'counter', name: '카운터', type: 'attack', cost: 1, rarity: 'common', damage: 4, block: 8, desc: '적의 공격을 흘려내며 반격합니다. 4의 피해를 주고 8의 방어도를 얻습니다.' },
  { id: 'crouch', name: '웅크리기', type: 'skill', cost: 2, rarity: 'common', block: 14, desc: '몸을 둥글게 말아 치명상을 피합니다. 14의 방어도를 얻습니다.' },
  { id: 'dodge', name: '회피', type: 'skill', cost: 0, rarity: 'common', block: 4, desc: '가벼운 발놀림으로 공격을 피할 준비를 하여 4의 방어도를 얻습니다.' },
  { id: 'taunt', name: '도발', type: 'skill', cost: 1, rarity: 'common', enemyVuln: 1, enemyWeak: 1, desc: '적을 조롱하며 이성을 잃게 만듭니다. 약화 1, 취약 1을 부여합니다.' },
  { id: 'combat_prep', name: '전투 준비', type: 'skill', cost: 1, rarity: 'common', block: 4, selfStrength: 1, desc: '무기를 고쳐 쥐고 전의를 불태웁니다. 4의 방어도를 얻고 근력을 1 얻습니다.' },
  { id: 'first_aid', name: '응급 처치', type: 'skill', cost: 1, rarity: 'common', heal: 8, desc: '붕대와 연고를 빠르게 발라 지혈합니다. 체력을 8 회복합니다.' },
  { id: 'maintenance', name: '정비', type: 'skill', cost: 1, rarity: 'common', block: 5, draw: 1, desc: '전투 장비를 점검하며 5의 방어도를 얻고 카드를 1장 뽑습니다.' },
  { id: 'poison_dart', name: '독침', type: 'attack', cost: 1, rarity: 'common', damage: 5, draw: 1, desc: '숨겨둔 독침을 훅 불어 5의 피해를 주고 재빠르게 카드를 1장 뽑습니다.' },
  { id: 'meditate', name: '명상', type: 'skill', cost: 1, rarity: 'common', manaGain: 2, block: 5, desc: '가부좌를 틀고 기운을 느낍니다. 마나를 2 회복하고 5의 방어도를 얻습니다.' },
  { id: 'reckless_charge', name: '무모한 돌진', type: 'attack', cost: 1, rarity: 'common', damage: 15, selfDamage: 2, desc: '앞뒤 가리지 않고 어깨로 들이받습니다. 15의 피해를 주지만 체력을 2 잃습니다.' },
  { id: 'toxic_strike', name: '맹독 타격', type: 'attack', cost: 1, rarity: 'common', damage: 4, multiHit: 2, enemyVuln: 1, desc: '독이 묻은 칼날로 두 번 교차하여 베어냅니다. 4의 피해를 2번 연속 주고 취약 1을 부여합니다.' },
  { id: 'warcry', name: '전장의 함성', type: 'skill', cost: 1, rarity: 'common', block: 8, draw: 2, desc: '목청껏 포효하여 사기를 끌어올립니다. 8의 방어도를 얻고 카드를 2장 뽑습니다.' },
  { id: 'sand_throw', name: '모래 뿌리기', type: 'skill', cost: 1, rarity: 'common', damage: 3, enemyWeak: 1, desc: '발밑의 흙먼지를 걷어차 눈을 멉니다. 3의 피해를 주고 약화 1을 부여합니다.' },
  { id: 'bone_crush', name: '뼈 부수기', type: 'attack', cost: 2, rarity: 'common', damage: 12, enemyVuln: 1, desc: '무게중심을 실어 관절을 부수듯 타격합니다. 12의 피해를 주고 취약 1을 부여합니다.' },
  { id: 'throwing_dagger', name: '투척 단검', type: 'attack', cost: 0, rarity: 'common', damage: 5, draw: 1, desc: '손목 스냅으로 날카로운 단검을 던져 5의 피해를 주고 카드를 1장 뽑습니다.' },
  { id: 'double_cut', name: '이중 베기', type: 'attack', cost: 2, rarity: 'common', damage: 7, multiHit: 2, desc: '순식간에 엑스자(X)로 두 번 연속 베어내 7의 피해를 2번 줍니다.' },
  { id: 'vital_strike', name: '급소 찌르기', type: 'attack', cost: 1, rarity: 'common', damage: 10, enemyWeak: 1, desc: '가장 취약한 급소를 정확히 찔러 10의 피해를 주고 약화 1을 부여합니다.' },
  { id: 'old_shield', name: '낡은 방패', type: 'skill', cost: 0, rarity: 'common', block: 5, desc: '금이 간 낡은 방패를 들어 올려 5의 방어도를 얻습니다.' },
  { id: 'firm_stand', name: '굳건한 버티기', type: 'skill', cost: 1, rarity: 'common', block: 12, selfDamage: 1, desc: '두 발을 땅에 박고 타격을 버텨냅니다. 12의 방어도를 얻지만 체력을 1 잃습니다.' },
  { id: 'kihap', name: '기합', type: 'skill', cost: 1, rarity: 'common', manaGain: 1, selfStrength: 1, desc: '단전에 힘을 주고 기합을 내지릅니다. 마나를 1 얻고 근력을 1 얻습니다.' },
  { id: 'short_rest', name: '짧은 휴식', type: 'skill', cost: 1, rarity: 'common', manaGain: 1, heal: 8, desc: '전투 중 잠깐 숨을 돌립니다. 마나를 1 얻고 체력을 8 회복합니다.' },
  { id: 'gamblers_strike', name: '도박의 일격', type: 'attack', cost: 1, rarity: 'common', gamble: true, gambleWinChance: 0.5, winDamage: 25, loseDamage: 1, desc: '감각에 의존해 운명의 타격을 날립니다. 50% 확률로 25의 피해를 주거나 빗맞아 1의 피해만 줍니다.' },
  { id: 'poison_flask', name: '맹독 플라스크', type: 'skill', cost: 1, rarity: 'common', enemyPoison: 4, desc: '부식성 맹독 병을 적중시켜 산산조각 냅니다. 적에게 중독 4를 부여합니다.' },
  { id: 'spiked_shield', name: '가시 방패', type: 'skill', cost: 1, rarity: 'common', block: 5, selfThorns: 2, desc: '가시 돋친 방패를 앞세웁니다. 5의 방어도를 얻고 가시 2를 얻습니다.' },
  { id: 'twin_strike', name: '쌍발 타격', type: 'attack', cost: 1, rarity: 'common', damage: 4, multiHit: 2, desc: '양손의 무기를 번갈아 휘둘러 4의 피해를 2번 연속 줍니다.' },

  // 희귀 (Uncommon)
  { id: 'heal', name: '치유', type: 'skill', cost: 2, rarity: 'uncommon', heal: 12, desc: '손끝에서 은은한 생명의 빛을 피워내 체력을 12 회복합니다.' },
  { id: 'mana_potion', name: '마나 물약', type: 'skill', cost: 1, rarity: 'uncommon', manaGain: 3, desc: '푸른빛이 감도는 물약을 단숨에 들이켜 마나 3을 얻습니다.' },
  { id: 'wind_slash', name: '순풍 베기', type: 'attack', cost: 1, rarity: 'uncommon', damage: 7, draw: 1, desc: '바람을 가르는 날렵한 검격으로 7의 피해를 주고 흐름을 타 카드를 1장 뽑습니다.' },
  { id: 'overcharge', name: '과부하', type: 'skill', cost: 0, rarity: 'uncommon', manaGain: 3, selfDamage: 3, desc: '심장에 전격을 가해 한계를 돌파합니다. 마나를 3 얻고 체력을 3 잃습니다.' },
  { id: 'fireball', name: '화염구', type: 'attack', cost: 2, rarity: 'uncommon', damage: 22, desc: '거대한 불덩이를 압축해 적의 안면에 던져 22의 폭발 피해를 줍니다.' },
  { id: 'blood_pact', name: '피의 계약', type: 'skill', cost: 0, rarity: 'uncommon', draw: 3, selfDamage: 5, desc: '손바닥을 그어 피로 마법진을 그립니다. 체력을 5 잃고 카드를 3장 뽑습니다.' },
  { id: 'iron_wall', name: '철벽', type: 'skill', cost: 2, rarity: 'uncommon', block: 18, desc: '거대한 강철의 방벽을 땅에 꽂아 세워 18의 방어도를 얻습니다.' },
  { id: 'double_strike', name: '연속 베기', type: 'attack', cost: 2, rarity: 'uncommon', damage: 9, multiHit: 2, desc: '보이지 않는 궤적으로 난도질해 9의 피해를 2번 줍니다.' },
  { id: 'dash', name: '돌진', type: 'attack', cost: 2, rarity: 'uncommon', damage: 12, block: 12, desc: '방패를 앞세워 맹렬히 돌격합니다. 12의 피해를 주고 12의 방어도를 얻습니다.' },
  { id: 'divine_shield', name: '신의 방패', type: 'skill', cost: 2, rarity: 'uncommon', block: 15, heal: 5, desc: '신성한 기운이 몸을 감싸 안습니다. 15의 방어도를 얻고 체력을 5 회복합니다.' },
  { id: 'smash', name: '분쇄', type: 'attack', cost: 2, rarity: 'uncommon', damage: 14, draw: 1, desc: '적의 장갑을 찌그러뜨리며 강하게 내리쳐 14의 피해를 주고 카드를 1장 뽑습니다.' },
  { id: 'vanguard', name: '선봉장', type: 'attack', cost: 2, rarity: 'uncommon', damage: 8, block: 16, desc: '적진 한가운데로 뛰어들어 진형을 붕괴시킵니다. 8의 피해를 주고 16의 방어도를 얻습니다.' },
  { id: 'dark_bargain', name: '어둠의 거래', type: 'skill', cost: 0, rarity: 'uncommon', manaGain: 1, draw: 1, selfDamage: 2, desc: '심연과 거래하여 체력을 2 잃는 대가로 마나를 1 얻고 카드를 1장 뽑습니다.' },
  { id: 'barrier', name: '결계', type: 'skill', cost: 2, rarity: 'uncommon', block: 25, desc: '투명한 마력 결계를 펼쳐 외부 충격을 차단하는 25의 방어도를 얻습니다.' },
  { id: 'adrenaline', name: '아드레날린', type: 'skill', cost: 1, rarity: 'uncommon', draw: 3, selfDamage: 3, desc: '혈관에 뜨거운 아드레날린을 주입해 체력을 3 잃고 반응 속도를 올려 카드를 3장 뽑습니다.' },
  { id: 'blade_dance', name: '검무', type: 'attack', cost: 2, rarity: 'uncommon', damage: 6, multiHit: 3, desc: '아름답고 치명적인 칼춤을 추며 6의 피해를 3번 연속 줍니다.' },
  { id: 'panic_button', name: '비상 버튼', type: 'skill', cost: 0, rarity: 'uncommon', block: 20, selfDamage: 5, desc: '다급하게 비상 장치를 눌러 20의 방어도를 얻지만 체력을 5 잃습니다.' },
  { id: 'blood_blade', name: '피의 칼날', type: 'attack', cost: 1, rarity: 'uncommon', damage: 18, selfDamage: 4, desc: '검신에 피를 먹여 날카로움을 극한으로 올립니다. 체력을 4 잃고 18의 피해를 줍니다.' },
  { id: 'muscle_training', name: '근력 단련', type: 'skill', cost: 1, rarity: 'uncommon', selfStrength: 2, desc: '순간적으로 근섬유를 팽창시켜 펌핑을 유도합니다. 근력을 2 얻습니다.' },
  { id: 'iron_skin', name: '철의 피부', type: 'skill', cost: 1, rarity: 'uncommon', block: 5, selfDex: 1, desc: '피부를 강철처럼 단단하게 경화시킵니다. 5의 방어도를 얻고 민첩을 1 얻습니다.' },
  { id: 'neutralize', name: '무력화', type: 'skill', cost: 1, rarity: 'uncommon', enemyWeak: 3, desc: '관절 부위를 타격해 힘을 쓰지 못하게 만들어 적에게 약화 3을 부여합니다.' },
  { id: 'expose_weakness', name: '약점 노출', type: 'skill', cost: 1, rarity: 'uncommon', enemyVuln: 3, desc: '적의 장갑 틈새를 찾아 방어구의 끈을 끊어버립니다. 적에게 취약 3을 부여합니다.' },
  { id: 'catalyst', name: '촉매', type: 'skill', cost: 1, rarity: 'uncommon', manaGain: 2, desc: '공기 중의 마나 입자를 흡수하는 촉매제를 터뜨려 마나를 2 회복합니다.' },
  { id: 'vitality_shield', name: '활력의 방패', type: 'skill', cost: 2, rarity: 'uncommon', percentBlockMaxHp: 10, desc: '생명력을 방어막으로 전환합니다. 내 최대 체력의 10%만큼 방어도를 얻습니다.' },
  { id: 'blood_strike', name: '피의 일격', type: 'attack', cost: 1, rarity: 'uncommon', missingHpDamage: 0.3, desc: '고통을 분노로 바꾸어 타격합니다. 내가 잃은 체력의 30%만큼 적에게 피해를 줍니다.' },
  { id: 'dig_in', name: '파고들기', type: 'attack', cost: 1, rarity: 'uncommon', damage: 8, enemyWeak: 1, enemyVuln: 1, desc: '품으로 파고들어 8의 피해를 주고 밸런스를 무너뜨려 약화 1, 취약 1을 부여합니다.' },
  { id: 'vampiric_strike', name: '흡혈의 일격', type: 'attack', cost: 2, rarity: 'uncommon', damage: 12, heal: 6, desc: '적의 생명력을 강제로 뜯어내어 12의 피해를 주고 체력을 6 회복합니다.' },
  { id: 'beast_tear', name: '맹수 찢기', type: 'attack', cost: 2, rarity: 'uncommon', damage: 18, enemyVuln: 2, desc: '야수처럼 발톱을 세워 살점을 뜯어내 18의 피해를 주고 취약 2를 부여합니다.' },
  { id: 'magic_shield', name: '마력 방패', type: 'skill', cost: 1, rarity: 'uncommon', block: 15, draw: 1, desc: '푸른빛의 마력 방패를 소환해 15의 방어도를 얻고 카드를 1장 뽑습니다.' },
  { id: 'blood_ritual', name: '피의 제사', type: 'skill', cost: 0, rarity: 'uncommon', manaGain: 2, selfDamage: 5, desc: '스스로의 피를 제물로 바쳐 마나를 2 얻지만 체력을 5 잃습니다.' },
  { id: 'ice_wall', name: '얼음 장벽', type: 'skill', cost: 2, rarity: 'uncommon', block: 20, enemyWeak: 1, desc: '냉기를 뿜는 얼음 벽을 세워 20의 방어도를 얻고 동상으로 약화 1을 부여합니다.' },
  { id: 'smoke_bomb', name: '연막탄', type: 'skill', cost: 0, rarity: 'uncommon', block: 5, enemyVuln: 2, desc: '짙은 연막을 터뜨려 은신하며 5의 방어도를 얻고 적의 배후를 잡아 취약 2를 부여합니다.' },
  { id: 'tactical_retreat', name: '전술적 후퇴', type: 'skill', cost: 2, rarity: 'uncommon', block: 15, draw: 3, enemyWeak: 1, desc: '안전거리를 확보하며 15의 방어도를 얻고 카드를 3장 뽑으며 견제하여 약화 1을 부여합니다.' },
  { id: 'mana_amp', name: '마나 증폭', type: 'skill', cost: 0, rarity: 'uncommon', manaGain: 3, enemyVuln: 1, desc: '마나 회로를 강제로 폭주시켜 마나를 3 얻고 적을 불안정하게 만들어 취약 1을 부여합니다.' },
  { id: 'unstable_bomb', name: '불안정한 폭약', type: 'attack', cost: 2, rarity: 'uncommon', gamble: true, gambleWinChance: 0.7, winDamage: 35, loseSelfDamage: 15, desc: '심지가 불량한 폭탄을 던집니다. 70% 확률로 35의 피해를 줍니다. 실패 시 내 체력을 15 잃습니다.' },
  { id: 'lucky_coin', name: '행운의 동전', type: 'skill', cost: 1, rarity: 'uncommon', gamble: true, gambleWinChance: 0.5, winManaGain: 3, desc: '동전을 높이 튕깁니다. 앞면이 나오면 마나를 3 얻습니다. 실패 시 아무 효과도 없습니다.' },
  { id: 'target_locked', name: '조준 완료', type: 'skill', cost: 1, rarity: 'uncommon', enemyMark: 4, desc: '레이저 포인트로 적의 미간을 조준합니다. 적에게 표식 4를 부여합니다.' },
  { id: 'bone_shatter', name: '뼈 분쇄', type: 'attack', cost: 2, rarity: 'uncommon', damage: 12, enemyFrail: 2, desc: '망치로 뼈를 부숴버려 12의 피해를 주고 허약 2를 부여합니다.' },
  { id: 'blood_rage', name: '피의 분노', type: 'skill', cost: 1, rarity: 'uncommon', selfRage: 4, desc: '광전사처럼 피를 갈구하며 격노 4를 얻습니다.' },
  { id: 'premonition', name: '예지', type: 'skill', cost: 1, rarity: 'uncommon', selfInsight: 2, desc: '미래의 조각을 엿보아 통찰 2를 얻습니다.' },
  { id: 'arcane_intellect', name: '신비한 지능', type: 'skill', cost: 1, rarity: 'uncommon', manaGain: 1, draw: 2, desc: '고대의 지식을 떠올려 마나를 1 얻고 카드를 2장 뽑습니다.' },
  { id: 'mind_read', name: '독심술', type: 'skill', cost: 1, rarity: 'uncommon', draw: 2, enemyWeak: 1, desc: '적의 생각을 읽어내 카드를 2장 뽑고 적의 공격 의지를 꺾어 약화 1을 부여합니다.' },
  { id: 'weak_point_scan', name: '약점 스캔', type: 'skill', cost: 0, rarity: 'uncommon', enemyVuln: 2, draw: 1, desc: '적의 방어망을 스캔하여 취약 2를 부여하고 카드를 1장 뽑습니다.' },
  { id: 'mana_drain', name: '마나 흡수', type: 'attack', cost: 1, rarity: 'uncommon', damage: 5, manaGain: 2, desc: '마력을 빨아들이는 일격으로 5의 피해를 주고 마나를 2 얻습니다.' },
  { id: 'paralyzing_dart', name: '마비 독침', type: 'attack', cost: 1, rarity: 'uncommon', damage: 3, enemyFrail: 2, enemyWeak: 1, desc: '근육을 굳게 만드는 독침을 쏴 3의 피해를 주고 허약 2와 약화 1을 부여합니다.' },
  { id: 'tactical_planning', name: '전술 수립', type: 'skill', cost: 1, rarity: 'uncommon', selfInsight: 2, block: 5, desc: '주변 지형을 살피며 5의 방어도를 얻고 통찰 2를 얻습니다.' },
  { id: 'blood_alchemy', name: '피의 연금술', type: 'skill', cost: 0, rarity: 'uncommon', selfDamage: 3, manaGain: 2, draw: 1, desc: '피를 매개로 마력을 연성해 체력을 3 잃지만 마나를 2 얻고 카드를 1장 뽑습니다.' },
  { id: 'empower', name: '힘 부여', type: 'skill', cost: 1, rarity: 'uncommon', selfStrength: 1, draw: 1, desc: '오오라를 발산해 근력을 1 얻고 카드를 1장 뽑습니다.' },
  { id: 'haste', name: '가속', type: 'skill', cost: 1, rarity: 'uncommon', selfDex: 1, draw: 1, desc: '시간의 흐름을 빠르게 조작해 민첩을 1 얻고 카드를 1장 뽑습니다.' },
  { id: 'cursed_word', name: '저주의 말', type: 'skill', cost: 1, rarity: 'uncommon', enemyWeak: 2, enemyVuln: 2, selfDamage: 2, desc: '금지된 주술을 읊어 체력을 2 잃고 적에게 약화 2, 취약 2를 부여합니다.' },
  { id: 'venom_coating', name: '맹독 바르기', type: 'skill', cost: 1, rarity: 'uncommon', enemyPoison: 3, selfThorns: 2, desc: '무기와 갑옷에 독을 발라 중독 3을 부여하고 가시 2를 얻습니다.' },
  { id: 'focus_fire', name: '집중 사격', type: 'attack', cost: 2, rarity: 'uncommon', damage: 10, enemyMark: 3, desc: '한 점을 정확히 꿰뚫어 10의 피해를 주고 표식 3을 부여합니다.' },
  { id: 'energy_shield', name: '에너지 방패', type: 'skill', cost: 2, rarity: 'uncommon', block: 10, manaGain: 1, desc: '충격을 마력으로 흡수하는 실드를 전개해 10의 방어도를 얻고 마나를 1 얻습니다.' },
  { id: 'blinding_flash', name: '섬광탄', type: 'skill', cost: 1, rarity: 'uncommon', enemyWeak: 2, enemyFrail: 1, desc: '눈부신 빛을 터뜨려 적에게 약화 2와 허약 1을 부여합니다.' },
  { id: 'magic_trick', name: '마술 장난', type: 'skill', cost: 0, rarity: 'uncommon', draw: 2, selfDamage: 1, desc: '위험한 손장난을 부려 체력을 1 잃고 카드를 2장 뽑습니다.' },
  { id: 'mana_shield', name: '마력 보호막', type: 'skill', cost: 1, rarity: 'uncommon', block: 8, manaGain: 1, desc: '마나로 이루어진 얇은 막을 씌워 8의 방어도를 얻고 마나를 1 얻습니다.' },
  { id: 'toxic_cloud', name: '독구름', type: 'skill', cost: 2, rarity: 'uncommon', enemyPoison: 5, enemyWeak: 1, desc: '콜록거리게 만드는 독가스를 살포해 중독 5와 약화 1을 부여합니다.' },
  { id: 'rage_injection', name: '분노 주입', type: 'skill', cost: 1, rarity: 'uncommon', selfRage: 3, draw: 1, desc: '억눌린 분노를 방출하며 격노 3을 얻고 카드를 1장 뽑습니다.' },
  { id: 'soul_harvest', name: '영혼 수확', type: 'attack', cost: 1, rarity: 'uncommon', damage: 6, manaGain: 1, heal: 2, desc: '영혼의 파편을 뜯어내 6의 피해를 주고 마나 1과 체력 2를 회복합니다.' },
  { id: 'meditative_trance', name: '무아지경', type: 'skill', cost: 2, rarity: 'uncommon', manaGain: 3, selfInsight: 1, desc: '잡념을 비우고 우주와 동화되어 마나를 3 얻고 통찰 1을 얻습니다.' },
  { id: 'shadow_cloak', name: '그림자 망토', type: 'skill', cost: 1, rarity: 'uncommon', block: 7, selfRegen: 1, desc: '그림자 속으로 몸을 숨기며 7의 방어도를 얻고 재생 1을 얻습니다.' },
  { id: 'crippling_strike', name: '불구 만들기', type: 'attack', cost: 2, rarity: 'uncommon', damage: 8, enemyWeak: 2, enemyFrail: 2, desc: '아킬레스건을 노려 베어내 8의 피해를 주고 약화 2, 허약 2를 부여합니다.' },
  { id: 'mark_of_death', name: '죽음의 표식', type: 'skill', cost: 1, rarity: 'uncommon', enemyMark: 4, enemyVuln: 1, desc: '핏빛 십자가 문양을 띄워 표식 4와 취약 1을 부여합니다.' },
  { id: 'refresh', name: '재정비', type: 'skill', cost: 1, rarity: 'uncommon', heal: 5, draw: 2, desc: '호흡을 가다듬고 자세를 바로잡아 체력을 5 회복하고 카드를 2장 뽑습니다.' },
  { id: 'mana_infusion', name: '마나 주입', type: 'skill', cost: 0, rarity: 'uncommon', manaGain: 2, enemyFrail: 1, desc: '불안정한 마력을 적의 체내에 주입시켜 마나를 2 얻고 허약 1을 부여합니다.' },

  // 전설 (Rare)
  { id: 'vampire_sword', name: '뱀파이어의 검', type: 'attack', cost: 2, rarity: 'rare', damage: 20, heal: 10, enemyWeak: 1, desc: '피를 갈구하는 마검을 휘둘러 20의 피해를 주고 체력을 10 회복하며 약화 1을 부여합니다.' },
  { id: 'absolute_defense', name: '절대 방어', type: 'skill', cost: 2, rarity: 'rare', block: 30, enemyWeak: 2, desc: '어떤 타격도 허용하지 않는 철벽의 자세로 30의 방어도를 얻고 적을 좌절시켜 약화 2를 부여합니다.' },
  { id: 'execute', name: '처형', type: 'attack', cost: 2, rarity: 'rare', damage: 30, enemyVuln: 2, desc: '자비 없이 적의 숨통을 끊어버릴 기세로 참수합니다. 30의 피해를 주고 취약 2를 부여합니다.' },
  { id: 'snipe', name: '저격', type: 'attack', cost: 3, rarity: 'rare', damage: 60, enemyVuln: 2, desc: '숨을 참고 완벽한 타이밍에 흉부를 꿰뚫는 일격을 날려 60의 피해를 주고 취약 2를 부여합니다.' },
  { id: 'onslaught', name: '맹공', type: 'attack', cost: 3, rarity: 'rare', damage: 12, multiHit: 5, enemyVuln: 1, desc: '폭풍처럼 휘몰아치는 5연격을 가해 12의 피해를 5번 연속 주고 취약 1을 부여합니다.' },
  { id: 'berserker_axe', name: '광전사의 도끼', type: 'attack', cost: 2, rarity: 'rare', damage: 40, selfDamage: 3, enemyVuln: 2, desc: '피를 흩뿌리며 광기 어린 도끼질을 해 40의 피해를 주지만 체력을 3 잃고 적에게 취약 2를 부여합니다.' },
  { id: 'destruction_ray', name: '파괴 광선', type: 'attack', cost: 3, rarity: 'rare', damage: 80, selfDamage: 10, enemyWeak: 2, desc: '모든 것을 잿더미로 만드는 광선을 쏴 80의 피해를 주지만 반동으로 체력을 10 잃고 약화 2를 부여합니다.' },
  { id: 'lightning_strike', name: '번개 일격', type: 'attack', cost: 3, rarity: 'rare', damage: 40, draw: 2, enemyWeak: 1, desc: '벼락과도 같은 속도로 내리쳐 40의 피해를 주고 감전시켜 약화 1을 부여하며 카드를 2장 뽑습니다.' },
  { id: 'soul_slash', name: '영혼 베기', type: 'attack', cost: 2, rarity: 'rare', damage: 30, heal: 20, enemyWeak: 1, desc: '물질을 통과하여 영혼을 직접 베어냅니다. 30의 피해를 주고 체력을 20 회복하며 약화 1을 부여합니다.' },
  { id: 'meteor_fall', name: '운석 낙하', type: 'attack', cost: 3, rarity: 'rare', damage: 60, enemyWeak: 3, desc: '하늘을 찢고 불타는 운석을 소환해 떨어뜨립니다. 60의 피해를 주고 약화 3을 부여합니다.' },
  { id: 'holy_light', name: '신성한 빛', type: 'skill', cost: 3, rarity: 'rare', heal: 40, enemyWeak: 2, desc: '찬란한 성스러운 빛기둥을 내려 체력을 40 회복하고 사악한 기운을 태워 약화 2를 부여합니다.' },
  { id: 'demonic_dance', name: '악마의 춤', type: 'skill', cost: 2, rarity: 'rare', selfStrength: 5, selfDamage: 5, enemyVuln: 3, desc: '기괴한 춤사위로 악마와 동화되어 체력을 5 잃고 근력을 5 얻으며 적에게 취약 3을 부여합니다.' },
  { id: 'angels_blessing', name: '천사의 축복', type: 'skill', cost: 3, rarity: 'rare', selfStrength: 4, selfDex: 4, enemyWeak: 2, desc: '깃털이 휘날리며 성운의 축복을 받아 근력과 민첩을 4 얻고 적에게 약화 2를 부여합니다.' },
  { id: 'will_of_steel', name: '강철의 의지', type: 'skill', cost: 2, rarity: 'rare', selfDex: 5, enemyWeak: 2, desc: '어떤 역경에도 꺾이지 않는 정신력으로 민첩을 5 얻고 적의 전의를 꺾어 약화 2를 부여합니다.' },
  { id: 'soul_shield', name: '영혼의 방패', type: 'skill', cost: 3, rarity: 'rare', block: 50, heal: 10, enemyWeak: 2, desc: '영혼 에너지를 응집시킨 방패로 50의 방어도를 얻고 체력을 10 회복하며 약화 2를 부여합니다.' },
  { id: 'regeneration', name: '재생', type: 'skill', cost: 2, rarity: 'rare', heal: 20, manaGain: 1, enemyWeak: 1, desc: '세포가 폭발적으로 재생하여 체력을 20 회복하고 마나를 1 얻으며 약화 1을 부여합니다.' },
  { id: 'barricade', name: '절대 장벽', type: 'skill', cost: 3, rarity: 'rare', doubleBlock: true, desc: '마력을 끌어모아 난공불락의 성벽을 형상화합니다. 내가 현재 가진 방어도를 정확히 2배로 증폭시킵니다.' },
  { id: 'mana_burst', name: '마나 폭발', type: 'attack', cost: 0, rarity: 'rare', manaMultiplier: 12, consumeAllMana: true, desc: '체내의 모든 마나를 한계까지 압축했다가 폭발시켜, (소모한 마나 x 12)의 막대한 피해를 줍니다.' },
  { id: 'sword_of_ruin', name: '파멸의 검', type: 'attack', cost: 3, rarity: 'rare', damage: 70, selfDamage: 5, enemyWeak: 2, desc: '금지된 파멸의 힘이 깃든 검을 내리쳐 70의 피해를 주고 약화 2를 부여하지만 체력을 5 잃습니다.' },
  { id: 'chain_explosion', name: '연속 폭발', type: 'attack', cost: 3, rarity: 'rare', damage: 25, multiHit: 3, selfDamage: 10, desc: '지면에 연쇄 폭발 진을 깔아 25의 피해를 3번 연속 주지만 화염에 휩싸여 체력을 10 잃습니다.' },
  { id: 'time_reverse', name: '시간 역행', type: 'skill', cost: 3, rarity: 'rare', draw: 7, desc: '모래시계를 거꾸로 돌려 과거의 가능성을 현재로 끌어옵니다. 카드를 7장 뽑습니다.' },
  { id: 'paladin_shield', name: '성기사의 방패', type: 'skill', cost: 3, rarity: 'rare', block: 40, heal: 15, desc: '십자군 문양이 새겨진 대형 방패로 40의 방어도를 얻고 신앙의 힘으로 체력을 15 회복합니다.' },
  { id: 'panacea', name: '만능 비약', type: 'skill', cost: 2, rarity: 'rare', heal: 20, selfStrength: 2, selfDex: 2, desc: '전설 속의 만병통치약을 들이켜 체력을 20 회복하고 근력과 민첩을 각각 2 얻습니다.' },
  { id: 'mana_spring', name: '마나의 샘', type: 'skill', cost: 0, rarity: 'rare', manaGain: 5, enemyWeak: 2, desc: '마나의 기맥을 뚫어 마나를 5 얻고 뿜어져 나오는 마력의 압박으로 약화 2를 부여합니다.' },
  { id: 'absolute_domain', name: '절대 영역', type: 'skill', cost: 3, rarity: 'rare', block: 50, selfDex: 3, enemyWeak: 1, desc: '자신만의 고유 결계를 전개하여 50의 방어도를 얻고 민첩을 3 얻으며 약화 1을 부여합니다.' },
  { id: 'russian_roulette', name: '러시안 룰렛', type: 'attack', cost: 0, rarity: 'rare', gamble: true, gambleWinChance: 0.16, winDamage: 9999, winDamageBoss: 150, loseDamage: 1, loseDraw: 1, desc: '리볼버의 탄창을 돌리고 방아쇠를 당깁니다. 16% 확률로 적을 즉사시킵니다(보스 150). 실패 시 1의 피해를 줍니다.' },
  { id: 'devils_dice', name: '악마의 주사위', type: 'skill', cost: 2, rarity: 'rare', gamble: true, gambleWinChance: 0.5, winHeal: 50, losePercentMaxHpDamage: 0.2, desc: '영혼을 걸고 주사위를 굴립니다. 50% 확률로 체력을 50 회복합니다. 실패 시 최대 체력의 20%를 잃습니다.' },
  { id: 'venom_nova', name: '맹독 폭발', type: 'skill', cost: 2, rarity: 'rare', enemyPoison: 12, enemyWeak: 2, desc: '사방으로 치명적인 맹독 포자를 흩뿌려 중독 12와 약화 2를 부여합니다.' },
  { id: 'bramble_armor', name: '덩굴 갑옷', type: 'skill', cost: 2, rarity: 'rare', block: 20, selfThorns: 6, desc: '가시 돋친 마계 덩굴로 온몸을 감싸 20의 방어도를 얻고 가시 6을 얻습니다.' },
  { id: 'toxic_strike_legend', name: '역병의 일격', type: 'attack', cost: 2, rarity: 'rare', damage: 15, enemyPoison: 8, desc: '살이 썩어들어가는 역병균을 칼에 발라 15의 피해를 주고 중독 8을 부여합니다.' },
  { id: 'throat_chop', name: '목 찌르기', type: 'attack', cost: 2, rarity: 'rare', damage: 8, enemySilence: 1, desc: '손날로 정확히 성대를 강타해 8의 피해를 주고 침묵 1을 부여합니다. (적 스킬 봉인)' },
  { id: 'shadow_bind', name: '그림자 묶기', type: 'skill', cost: 2, rarity: 'rare', enemyBind: 1, desc: '적의 발밑 그림자를 사슬로 변성시켜 속박 1을 부여합니다. (적 공격 봉인)' },
  { id: 'troll_blood', name: '트롤의 피', type: 'skill', cost: 2, rarity: 'rare', selfRegen: 5, desc: '역겨운 냄새가 나는 끈적한 수액을 주사해 재생 5를 얻습니다.' },
  { id: 'meditation_advanced', name: '심연의 명상', type: 'skill', cost: 2, rarity: 'rare', manaGain: 2, selfInsight: 3, desc: '정신의 심해까지 가라앉아 마나를 2 얻고 통찰 3을 얻습니다.' },
  { id: 'grand_strategy', name: '대전략', type: 'skill', cost: 2, rarity: 'rare', selfInsight: 4, selfStrength: 1, selfDex: 1, desc: '완벽한 전투 플랜을 머릿속에 그려 통찰 4를 얻고 근력과 민첩을 각각 1 얻습니다.' },
  { id: 'time_warp', name: '시간 왜곡', type: 'skill', cost: 3, rarity: 'rare', draw: 5, manaGain: 3, desc: '주변의 시공간을 비틀어 자신만의 시간을 가속해 카드를 5장 뽑고 마나를 3 얻습니다.' },
  { id: 'mass_hysteria', name: '집단 광기', type: 'skill', cost: 2, rarity: 'rare', enemyWeak: 4, enemyVuln: 4, enemyFrail: 4, desc: '뇌리에 직접 미치광이의 환청을 들려주어 약화 4, 취약 4, 허약 4를 부여합니다.' },
  { id: 'elixir_of_life', name: '생명의 영약', type: 'skill', cost: 2, rarity: 'rare', heal: 20, selfRegen: 4, desc: '황금빛 엘릭서를 한 모금 마셔 체력을 20 회복하고 재생 4를 얻습니다.' },
  { id: 'mana_tide', name: '마나 해일', type: 'skill', cost: 2, rarity: 'rare', manaGain: 4, draw: 2, desc: '거대한 마나의 파도를 불러일으켜 마나를 4 얻고 카드를 2장 뽑습니다.' },
  { id: 'seal_of_binding', name: '구속의 인장', type: 'skill', cost: 2, rarity: 'rare', enemyBind: 1, enemyMark: 5, desc: '허공에 빛나는 구속구를 띄워 적을 압박합니다. 속박 1과 표식 5를 부여합니다.' },
  { id: 'silencing_strike', name: '침묵의 일격', type: 'attack', cost: 2, rarity: 'rare', damage: 15, enemySilence: 1, desc: '소리를 지우는 결계가 코팅된 일격으로 15의 피해를 주고 침묵 1을 부여합니다.' },
  { id: 'echo_of_magic', name: '마법의 메아리', type: 'skill', cost: 1, rarity: 'rare', manaGain: 2, draw: 3, selfDamage: 2, desc: '스스로의 잔상을 찢어내 체력을 2 잃고 마나를 2 얻으며 카드를 3장 뽑습니다.' },
  { id: 'absolute_focus', name: '절대 집중', type: 'skill', cost: 2, rarity: 'rare', selfInsight: 5, block: 15, desc: '시간이 멈춘 듯한 감각 속에서 15의 방어도를 얻고 통찰 5를 얻습니다.' },
  { id: 'venom_eruption', name: '맹독 분출', type: 'skill', cost: 2, rarity: 'rare', enemyPoison: 10, enemyFrail: 3, desc: '지면에서 부식성 맹독 간헐천을 터뜨려 중독 10과 허약 3을 부여합니다.' },
  { id: 'blood_frenzy', name: '피의 광란', type: 'skill', cost: 2, rarity: 'rare', selfRage: 6, selfStrength: 2, selfDamage: 5, desc: '이성을 버리고 살육 본능에 몸을 맡겨 체력을 5 잃지만 근력 2와 격노 6을 얻습니다.' },
  { id: 'astral_projection', name: '유체 이탈', type: 'skill', cost: 3, rarity: 'rare', selfIntangible: 1, draw: 2, desc: '혼백을 물리적 육체에서 분리하여 1턴 동안 무형 상태가 되고 카드를 2장 뽑습니다.' },
  { id: 'leech_seed', name: '씨앗 뿌리기', type: 'skill', cost: 2, rarity: 'rare', enemyPoison: 5, selfRegen: 3, desc: '적의 체내에 기생하는 마계 씨앗을 심어 중독 5를 부여하고 재생 3을 얻습니다.' },
  { id: 'mind_control', name: '정신 지배', type: 'skill', cost: 3, rarity: 'rare', enemyBind: 1, enemyWeak: 3, enemyVuln: 3, desc: '적의 뇌파를 해킹해 조종합니다. 속박 1, 약화 3, 취약 3을 부여합니다.' },
  { id: 'overload', name: '한계 돌파', type: 'skill', cost: 0, rarity: 'rare', manaGain: 5, selfDamage: 10, desc: '생명 유지 장치를 꺼버리고 마력핵을 과부하시켜 체력을 10 잃고 마나를 5 얻습니다.' },

  // 특수 (Special)
  { id: 'gods_eye', name: '신의 눈', type: 'skill', cost: 2, rarity: 'special', enemyMark: 10, enemyVuln: 5, desc: '하늘에 거대한 눈동자를 띄워 적의 모든 약점을 발가벗깁니다. 표식 10과 취약 5를 부여합니다.' },
  { id: 'dragon_blood', name: '용의 피', type: 'skill', cost: 3, rarity: 'special', selfRegen: 10, selfStrength: 5, desc: '펄펄 끓는 용의 피를 심장에 주입하여 혈관이 터질듯한 재생 10과 근력 5를 얻습니다.' },
  { id: 'infinite_mana_reactor', name: '무한 마나 원자로', type: 'skill', cost: 3, rarity: 'special', manaGain: 8, draw: 4, desc: '가슴에 이식된 원자로를 최대 출력으로 가동하여 마나를 8 얻고 카드를 4장 뽑습니다.' },
  { id: 'time_stop', name: '시간 정지', type: 'skill', cost: 3, rarity: 'special', enemyBind: 2, enemySilence: 2, desc: '공간의 흐름을 멈춰 세워 적에게 속박 2와 침묵 2를 부여합니다.' },
  { id: 'chaos_magic', name: '혼돈 마법', type: 'skill', cost: 2, rarity: 'special', draw: 5, manaGain: 5, selfDamage: 15, desc: '통제 불가능한 에너지를 다루어 체력을 15 잃지만 카드를 5장 뽑고 마나를 5 얻습니다.' },
  { id: 'abyssal_gaze', name: '심연의 응시', type: 'skill', cost: 2, rarity: 'special', enemyWeak: 10, enemyFrail: 10, desc: '끝없는 나락을 들여다보게 만들어 정신을 붕괴시킵니다. 약화 10과 허약 10을 부여합니다.' },
  { id: 'slimes_greed', name: '슬라임의 탐욕', type: 'skill', cost: 1, rarity: 'special', draw: 4, manaGain: 2, heal: 10, desc: '모든 것을 집어삼키는 탐욕스러운 점액을 뿌려 체력을 10 회복하고 마나 2, 카드를 4장 뽑습니다.' },
  { id: 'asuras_wrath', name: '수라의 분노', type: 'skill', cost: 3, rarity: 'special', selfRage: 10, selfStrength: 5, desc: '수라의 업화를 몸에 두르고 격노 10과 근력 5를 얻습니다.' },
  { id: 'spider_queens_web', name: '여왕 거미의 거미줄', type: 'skill', cost: 2, rarity: 'special', enemyBind: 1, enemyPoison: 15, desc: '절대 끊어지지 않는 강철 같은 독거미줄로 적을 친친 감아 속박 1과 중독 15를 부여합니다.' },
  { id: 'super_tiger_slash', name: '초절맹호살격난참', type: 'attack', cost: 3, rarity: 'special', damage: 15, multiHit: 6, enemyVuln: 2, desc: '호랑이의 형상을 한 기운을 뿜어내며 15의 피해를 6번 연속 주고 취약 2를 부여합니다.' },
  { id: 'true_dragon_slayer', name: '진·용살검', type: 'attack', cost: 3, rarity: 'special', damage: 80, selfStrength: 3, enemyVuln: 2, desc: '드래곤의 비늘마저 종잇장처럼 베어버리는 일격으로 80의 피해를 주고 근력을 3 얻으며 취약 2를 부여합니다.' },
  { id: 'absolute_zero', name: '절대영도', type: 'skill', cost: 3, rarity: 'special', block: 40, enemyWeak: 4, enemyVuln: 4, desc: '분자 운동마저 정지시키는 냉기로 40의 방어도를 얻고 약화 4, 취약 4를 부여합니다.' },
  { id: 'heavenly_judgment', name: '신천벌', type: 'attack', cost: 3, rarity: 'special', damage: 50, heal: 30, draw: 3, enemyWeak: 3, desc: '하늘의 심판을 내려 50의 피해를 주고 체력을 30 회복하며 카드를 3장 뽑습니다. 약화 3을 부여합니다.' },
  { id: 'supreme_blade_storm', name: '패왕의 검풍', type: 'attack', cost: 3, rarity: 'special', damage: 15, multiHit: 8, enemyVuln: 3, desc: '모든 것을 찢어발기는 검의 소용돌이를 생성해 15의 피해를 8번 연속 주고 취약 3을 부여합니다.' },
  { id: 'blood_of_phoenix', name: '불사조의 피', type: 'skill', cost: 3, rarity: 'special', heal: 100, selfDamage: 10, enemyWeak: 3, desc: '자신을 불태우고 잿더미에서 부활하여 체력을 100 회복하지만 즉시 체력을 10 잃습니다. 약화 3을 부여합니다.' },
  { id: 'descent_of_demon_lord', name: '진·마왕의 강림', type: 'skill', cost: 3, rarity: 'special', selfStrength: 5, selfDex: 5, selfDamage: 15, enemyVuln: 2, desc: '마왕의 힘을 빙의시켜 근력 5, 민첩 5를 얻고 취약 2를 부여하지만 체력을 15 잃습니다.' },
  { id: 'spider_queen_poison', name: '거미 여왕의 맹독', type: 'attack', cost: 2, rarity: 'special', damage: 20, enemyWeak: 3, enemyVuln: 3, desc: '신경을 마비시키는 보라색 맹독을 뿜어 20의 피해를 주고 약화 3, 취약 3을 부여합니다.' },
  { id: 'twerking', name: '트월킹', type: 'attack', cost: 2, rarity: 'special', damage: 50, enemyVuln: 3, desc: '숨막히도록 유연하고 격렬한 엉덩이 춤을 춰 충격파로 50의 피해를 줍니다. 혼을 쏙 빼놓아 취약 3을 부여합니다.' },
  { id: 'power_of_asura', name: '수라의 힘', type: 'skill', cost: 3, rarity: 'special', selfStrength: 8, block: 30, desc: '붉은 투기가 솟구쳐 오르며 근력을 8 얻고 30의 방어도를 얻습니다.' },
  { id: 'slime_snot', name: '슬라임의 콧물', type: 'skill', cost: 0, rarity: 'special', heal: 20, block: 20, draw: 2, manaGain: 2, desc: '매우 끈적하고 역겹지만 기적의 효능을 가진 콧물을 뒤집어씁니다! 체력과 방어도를 20 얻고 카드 2장과 마나 2를 얻습니다.' },
  
  // 신화 (Mythic)
  { id: 'omniscience', name: '전지전능', type: 'skill', cost: 3, rarity: 'mythic', draw: 5, manaGain: 5, selfInsight: 5, enemyWeak: 5, enemyVuln: 5, desc: '우주의 모든 이치를 꿰뚫어 보는 제3의 눈을 뜹니다. 카드를 5장 뽑고 마나 5, 통찰 5를 얻습니다. 적에게 약화 5, 취약 5를 부여합니다.' },
  { id: 'phantom_walk', name: '환영 보법', type: 'skill', cost: 3, rarity: 'mythic', selfIntangible: 1, exhaust: true, desc: '몸이 수많은 잔상으로 나뉘며 1턴 동안 무형 상태가 됩니다. (사용 후 소멸)' },
  { id: 'furioso', name: 'Furioso (퓨리오소)', type: 'attack', cost: 3, rarity: 'mythic', damage: 12, multiHit: 9, increasingDamage: 7, desc: '미친듯한 템포로 춤추듯 적을 찢어발깁니다. 12의 피해를 9번 연속 주며 타격 시마다 피해량이 7씩 증가합니다.' },
];

export const ENEMIES = [
  { name: '슬라임', baseHp: 30, deck: [
    { name: '몸통 박치기', type: 'attack', value: 8, desc: '탄성 있는 몸을 한껏 부풀린 뒤 강하게 튕겨져와 8의 피해를 줍니다.' }, 
    { name: '점액 세례', type: 'attack', value: 4, multi: 2, desc: '끈적하고 산성을 띈 점액을 연속으로 뱉어내어 4의 피해를 2번 줍니다.' }, 
    { name: '끈적임', type: 'debuff', debuff: 'weak', turns: 2, desc: '끈적이는 타르 같은 액체를 뿌려 발을 묶습니다. 약화 2를 부여합니다.' }
  ]},
  { name: '박쥐', baseHp: 25, deck: [
    { name: '흡혈 송곳니', type: 'attack_heal', value: 7, heal: 5, desc: '날카로운 송곳니로 목덜미를 깊게 물어뜯어 7의 피해를 주고 자신의 체력을 5 회복합니다.' }, 
    { name: '초음파', type: 'debuff', debuff: 'vulnerable', turns: 1, desc: '귀를 찢는 듯한 고주파 비명을 질러 고막을 터뜨립니다. 취약 1을 부여합니다.' }
  ]},
  { name: '고블린', baseHp: 35, deck: [
    { name: '단검 찌르기', type: 'attack', value: 10, desc: '품속에서 녹슨 단검을 꺼내 비열하고 교묘하게 찔러넣어 10의 피해를 줍니다.' }, 
    { name: '방어 태세', type: 'defend', value: 10, desc: '나무 방패 뒤로 몸을 잔뜩 웅크리며 10의 방어도를 얻습니다.' }, 
    { name: '모래 뿌리기', type: 'debuff', debuff: 'weak', turns: 2, desc: '발밑의 흙먼지를 걷어차 시야를 가립니다. 약화 2를 부여합니다.' }
  ]},
  { name: '늑대', baseHp: 40, deck: [
    { name: '물어뜯기', type: 'attack', value: 12, desc: '굶주린 턱을 크게 벌려 팔다리를 으스러지게 물어뜯어 12의 피해를 줍니다.' }, 
    { name: '울부짖기', type: 'debuff', debuff: 'vulnerable', turns: 2, desc: '소름 끼치는 하울링으로 뼈를 스미는 공포를 줍니다. 취약 2를 부여합니다.' }
  ]},
  { name: '스켈레톤', baseHp: 45, deck: [
    { name: '뼈 던지기', type: 'attack', value: 14, desc: '자신의 갈비뼈를 하나 뽑아 날카로운 투창처럼 던져 14의 피해를 줍니다.' }, 
    { name: '방패 올리기', type: 'defend', value: 12, desc: '낡은 철제 방패를 굳건히 들어 올려 12의 방어도를 얻습니다.' }, 
    { name: '2연참', type: 'attack', value: 7, multi: 2, desc: '녹슨 검을 X자로 빠르게 두 번 휘둘러 7의 피해를 2번 줍니다.' }
  ]},
  { name: '유령', baseHp: 38, deck: [
    { name: '원혼의 손길', type: 'attack_debuff', value: 8, debuff: 'weak', turns: 1, desc: '얼어붙은 손아귀로 영혼을 쓰다듬어 8의 피해를 주고 약화 1을 부여합니다.' }, 
    { name: '꿰뚫기', type: 'attack', value: 16, desc: '반투명한 몸으로 쏜살같이 날아와 가슴을 관통하며 16의 피해를 줍니다.' }
  ]},
  { name: '오크', baseHp: 60, deck: [
    { name: '도끼 강타', type: 'attack', value: 20, desc: '거대한 피 묻은 도끼를 머리 위에서부터 무자비하게 내리찍어 20의 피해를 줍니다.' }, 
    { name: '전투의 함성', type: 'defend_debuff', value: 10, debuff: 'vulnerable', turns: 1, desc: '피의 갈증을 담아 포효하며 10의 방어도를 얻고 압도적인 기백으로 취약 1을 부여합니다.' }
  ]},
  { name: '거미', baseHp: 42, deck: [
    { name: '맹독 이빨', type: 'attack', value: 14, desc: '독액이 뚝뚝 떨어지는 거대한 턱으로 살점을 뜯어내 14의 피해를 줍니다.' }, 
    { name: '거미줄 치기', type: 'debuff', debuff: 'weak', turns: 3, desc: '끈끈하고 질긴 거미줄을 뿜어내어 전신을 포박합니다. 약화 3을 부여합니다.' }
  ]},
  { name: '광신도', baseHp: 55, deck: [
    { name: '어둠의 의식', type: 'attack', value: 22, desc: '사악한 주문을 외우며 검은 구체를 만들어 쏘아내 22의 피해를 줍니다.' }, 
    { name: '어둠의 치유', type: 'heal', heal: 15, desc: '피의 제물을 바치고 어둠의 기운을 흡수해 체력을 15 회복합니다.' }, 
    { name: '저주', type: 'debuff', debuff: 'vulnerable', turns: 2, desc: '소름 돋는 눈빛으로 불길한 문양을 새겨 취약 2를 부여합니다.' }
  ]},
  { name: '가고일', baseHp: 70, deck: [
    { name: '석화', type: 'defend', value: 25, desc: '날개를 접고 몸을 돌덩이처럼 단단하게 굳혀 25의 방어도를 얻습니다.' }, 
    { name: '강하', type: 'attack', value: 18, desc: '공중으로 치솟았다가 운석처럼 떨어지며 덮쳐 18의 피해를 줍니다.' }
  ]},
  { name: '머드맨', baseHp: 50, deck: [
    { name: '진흙 던지기', type: 'attack_debuff', value: 10, debuff: 'weak', turns: 1, desc: '자신의 몸에서 악취 나는 진흙을 뭉쳐 던져 10의 피해를 주고 약화 1을 부여합니다.' }, 
    { name: '재생', type: 'heal', heal: 10, desc: '주변의 흙을 끌어모아 몸의 형태를 복구해 체력을 10 회복합니다.' }
  ]},
  { name: '미믹', baseHp: 65, deck: [
    { name: '깜짝 물기', type: 'attack', value: 18, desc: '순식간에 보물상자 뚜껑을 열고 날카로운 이빨로 물어뜯어 18의 피해를 줍니다.' }, 
    { name: '굳게 닫기', type: 'defend', value: 20, desc: '상자를 쾅 하고 닫아버려 어떠한 공격도 튕겨내는 20의 방어도를 얻습니다.' }
  ]},
  { name: '밴시', baseHp: 45, deck: [
    { name: '침묵의 비명', type: 'debuff', debuff: 'silence', turns: 1, desc: '입을 찢어지게 벌려 유령의 비명을 질러 영혼을 마비시킵니다. 침묵 1을 부여합니다.' }, 
    { name: '영혼 흡수', type: 'attack_heal', value: 12, heal: 10, desc: '생명력을 유령의 형태로 빨아들여 12의 피해를 주고 체력을 10 회복합니다.' }
  ]},
  { name: '골렘', baseHp: 80, deck: [
    { name: '바위 주먹', type: 'attack', value: 25, desc: '거대한 바위 덩어리 같은 주먹을 휘둘러 25의 피해를 줍니다.' }, 
    { name: '묵직한 가드', type: 'defend_debuff', value: 30, debuff: 'weak', turns: 1, desc: '두 팔을 교차해 30의 방어도를 얻고 압도적인 무게감으로 약화 1을 부여합니다.' }
  ]},
  { name: '켄타우로스', baseHp: 60, deck: [
    { name: '돌격', type: 'attack', value: 20, desc: '말의 하반신을 이용해 엄청난 속도로 돌진하여 창으로 찔러 20의 피해를 줍니다.' }, 
    { name: '연속 화살', type: 'attack', value: 8, multi: 3, desc: '활시위를 눈에 보이지 않게 당겨 화살 3발을 꽂아 8의 피해를 3번 줍니다.' }
  ]},
  { name: '불의 정령', baseHp: 45, deck: [
    { name: '화염구', type: 'attack', value: 12, desc: '이글거리는 불덩이를 모아 집어던져 12의 피해를 줍니다.' }, 
    { name: '화상', type: 'debuff', debuff: 'vulnerable', turns: 2, desc: '주변 온도를 높여 살갗을 데이게 만듭니다. 취약 2를 부여합니다.' }, 
    { name: '불꽃 장벽', type: 'defend', value: 15, desc: '자신의 주위에 화염의 장막을 두루며 15의 방어도를 얻습니다.' }
  ]},
  { name: '물의 정령', baseHp: 55, deck: [
    { name: '물대포', type: 'attack', value: 10, desc: '고압의 물줄기를 쏘아내어 10의 피해를 줍니다.' }, 
    { name: '치유의 물결', type: 'heal', heal: 15, desc: '청명한 물의 기운으로 자신의 상처를 씻어내며 체력을 15 회복합니다.' }, 
    { name: '동결', type: 'debuff', debuff: 'weak', turns: 2, desc: '차디찬 한기를 불어넣어 몸을 굳게 만듭니다. 약화 2를 부여합니다.' }
  ]},
  { name: '서큐버스', baseHp: 65, deck: [
    { name: '생기 흡수', type: 'attack_heal', value: 15, heal: 15, desc: '매혹적인 키스로 정기를 빨아들여 15의 피해를 주고 체력을 15 회복합니다.' }, 
    { name: '매혹', type: 'debuff', debuff: 'weak', turns: 3, desc: '관능적인 몸짓으로 시선을 빼앗아 전의를 상실하게 만들어 약화 3을 부여합니다.' }
  ]},
  { name: '듀라한', baseHp: 85, deck: [
    { name: '참수', type: 'attack', value: 25, desc: '머리 없는 기사가 대검을 섬뜩하게 휘둘러 목을 노리며 25의 피해를 줍니다.' }, 
    { name: '공포', type: 'debuff', debuff: 'vulnerable', turns: 3, desc: '들고 있는 머리가 소름 끼치게 웃어재낍니다. 취약 3을 부여합니다.' }, 
    { name: '강철 갑옷', type: 'defend', value: 20, desc: '입고 있는 검은 철갑옷의 틈새를 닫아 20의 방어도를 얻습니다.' }
  ]},
  { name: '뱀파이어 헌터', baseHp: 75, deck: [
    { name: '은탄환', type: 'attack', value: 18, desc: '장총을 정조준하고 축복받은 은탄환을 쏴 18의 피해를 줍니다.' }, 
    { name: '성수', type: 'debuff', debuff: 'weak', turns: 2, desc: '성수가 든 병을 던져 깨뜨려 신성한 불길로 피부를 태우고 약화 2를 부여합니다.' }, 
    { name: '난사', type: 'attack', value: 6, multi: 3, desc: '쌍권총을 뽑아들고 무자비하게 방아쇠를 당겨 6의 피해를 3번 줍니다.' }
  ]},
  { name: '리자드맨', baseHp: 60, deck: [
    { name: '꼬리치기', type: 'attack', value: 14, desc: '가시 돋친 굵고 강력한 꼬리로 다리를 후려쳐 14의 피해를 줍니다.' }, 
    { name: '비늘 강화', type: 'defend', value: 15, desc: '몸의 비늘을 곤두세워 방어력을 높여 15의 방어도를 얻습니다.' }, 
    { name: '재생력', type: 'heal', heal: 12, desc: '도마뱀의 뛰어난 회복력으로 상처 부위의 살을 돋아내게 해 체력을 12 회복합니다.' }
  ]},
  { name: '하피', baseHp: 40, deck: [
    { name: '발톱 베기', type: 'attack', value: 8, multi: 2, desc: '날카로운 발톱을 세우고 활강하여 8의 피해를 2번 연속 줍니다.' }, 
    { name: '귀청 찢기', type: 'debuff', debuff: 'silence', turns: 1, desc: '괴상한 톤의 새된 비명을 질러 정신 집중을 깹니다. 침묵 1을 부여합니다.' }
  ]},
  { name: '만드라고라', baseHp: 50, deck: [
    { name: '비명소리', type: 'attack_debuff', value: 5, debuff: 'vulnerable', turns: 2, desc: '땅에서 뽑히며 고막을 찢는 비명을 질러 5의 피해를 주고 취약 2를 부여합니다.' }, 
    { name: '뿌리 묶기', type: 'debuff', debuff: 'bind', turns: 1, desc: '꿈틀거리는 잔뿌리들이 발목을 옥죄어 옵니다. 속박 1을 부여합니다.' }
  ]},
  { name: '트롤', baseHp: 90, deck: [
    { name: '몽둥이 찜질', type: 'attack', value: 22, desc: '사람만한 통나무를 집어들고 사정없이 후려갈겨 22의 피해를 줍니다.' }, 
    { name: '트롤의 피', type: 'heal', heal: 25, desc: '잘려나간 살덩이가 눈에 보일 속도로 빠르게 엉겨붙어 체력을 25 회복합니다.' }
  ]},
  { name: '그림 리퍼', baseHp: 70, deck: [
    { name: '영혼 수확', type: 'attack_heal', value: 20, heal: 10, desc: '거대한 낫으로 영혼의 일부를 베어내 20의 피해를 주고 자신의 체력을 10 회복합니다.' }, 
    { name: '죽음의 선고', type: 'debuff', debuff: 'vulnerable', turns: 3, desc: '뼈만 남은 손가락으로 가리키며 죽음을 예언해 취약 3을 부여합니다.' }, 
    { name: '망령화', type: 'defend', value: 30, desc: '물리적인 형태를 버리고 검은 안개로 흩어져 30의 방어도를 얻습니다.' }
  ]},
  { name: '코카트리스', baseHp: 55, deck: [
    { name: '부리 쪼기', type: 'attack', value: 12, desc: '단단하고 뾰족한 부리로 신경질적으로 쪼아대어 12의 피해를 줍니다.' }, 
    { name: '석화의 눈', type: 'debuff', debuff: 'bind', turns: 1, desc: '기분 나쁜 붉은 눈으로 노려보아 관절을 돌로 굳게 만듭니다. 속박 1을 부여합니다.' }, 
    { name: '날개 치기', type: 'attack', value: 15, desc: '퍼덕거리는 날개로 거센 바람과 함께 타격을 가해 15의 피해를 줍니다.' }
  ]},
  { name: '다크 나이트', baseHp: 85, deck: [
    { name: '암흑 검격', type: 'attack', value: 18, desc: '검은 오오라를 두른 대검을 수직으로 내려찍어 18의 피해를 줍니다.' }, 
    { name: '어둠의 방패', type: 'defend', value: 25, desc: '빛을 굴절시키는 어두운 방패를 세워 25의 방어도를 얻습니다.' }, 
    { name: '칠흑의 기운', type: 'buff', buff: 'strength', buffValue: 2, turns: 1, desc: '갑옷 사이로 칠흑의 연기가 새어나오며 근력을 2 얻습니다.' }
  ]},
  { name: '환영술사', baseHp: 45, deck: [
    { name: '정신 파괴', type: 'attack_debuff', value: 10, debuff: 'weak', turns: 3, desc: '수많은 환영들이 속삭이며 두통을 유발해 10의 피해를 주고 약화 3을 부여합니다.' }, 
    { name: '환영 분신', type: 'defend', value: 40, desc: '주변에 똑같이 생긴 환영 분신을 다수 소환해 공격을 교란하며 40의 방어도를 얻습니다.' }
  ]},
  { name: '데몬 쥐', baseHp: 35, deck: [
    { name: '갉아먹기', type: 'attack', value: 5, multi: 3, desc: '시뻘건 눈으로 달려들어 갑옷과 살점을 마구잡이로 갉아먹어 5의 피해를 3번 줍니다.' }, 
    { name: '역병 전파', type: 'debuff', debuff: 'vulnerable', turns: 2, desc: '더러운 벼룩과 병균을 사방에 흩뿌려 면역계를 약화시킵니다. 취약 2를 부여합니다.' }
  ]},
  { name: '폭탄 고블린', baseHp: 40, deck: [
    { name: '자폭 투척', type: 'attack', value: 25, desc: '도화선에 불이 붙은 화약통을 낄낄대며 굴려 던져 25의 피해를 줍니다.' }, 
    { name: '불안정한 화약', type: 'buff', buff: 'strength', buffValue: 3, turns: 1, desc: '가방 속의 폭약이 부글부글 끓어오르며 위험 수위에 도달해 근력을 3 얻습니다.' }
  ]}
];
 
export const NORMAL_BOSSES = [
  { name: '킹 슬라임', baseHp: 150, deck: [
    { name: '대지진', type: 'attack', value: 25, desc: '산더미 같은 덩치를 하늘 높이 띄웠다가 땅을 강하게 내리찍어 충격파로 25의 피해를 줍니다.' }, 
    { name: '굳어지기', type: 'defend', value: 30, desc: '몸통의 표면 장력을 극대화하여 바위처럼 단단하게 만들어 30의 방어도를 얻습니다.' }, 
    { name: '강산성 점액', type: 'attack_debuff', value: 15, debuff: 'weak', turns: 3, desc: '부글부글 끓어오르는 맹독 산성액을 뿜어내어 15의 피해를 주고 장갑을 부식시켜 약화 3을 부여합니다.' }
  ]}, 
  { name: '고블린 족장', baseHp: 250, deck: [
    { name: '연속 찌르기', type: 'attack', value: 10, multi: 3, desc: '크고 화려한 창을 보이지 않는 속도로 세 번 연속 찔러 10의 피해를 3번 줍니다.' }, 
    { name: '총공격 지시', type: 'debuff', debuff: 'vulnerable', turns: 3, desc: '나팔을 불어 부하들에게 공격을 지시하며 위협을 가해 취약 3을 부여합니다.' }, 
    { name: '철벽 방어', type: 'defend', value: 40, desc: '족장의 거대한 황금 방패 뒤에 숨어 40의 방어도를 얻습니다.' }
  ]}, 
  { name: '오크 대장군', baseHp: 400, deck: [
    { name: '참수', type: 'attack', value: 40, desc: '숨통을 끊어버릴 듯한 기세로 대검을 수평으로 크게 휘둘러 40의 피해를 줍니다.' }, 
    { name: '피의 굶주림', type: 'attack_debuff', value: 25, debuff: 'vulnerable', turns: 2, desc: '피 냄새를 맡고 광기에 사로잡혀 무자비하게 후려칩니다. 25의 피해를 주고 취약 2를 부여합니다.' }, 
    { name: '대장군의 기백', type: 'defend', value: 50, desc: '전장의 공기를 짓누르는 압도적인 위압감을 뿜어내며 50의 방어도를 얻습니다.' }
  ]}, 
  { name: '뱀파이어 로드', baseHp: 650, deck: [
    { name: '생명 흡수', type: 'attack_heal', value: 35, heal: 20, desc: '붉은 기운의 촉수로 생명력을 강제로 빨아들여 35의 피해를 주고 체력을 20 회복합니다.' }, 
    { name: '피의 안개', type: 'debuff', debuff: 'weak', turns: 4, desc: '전투 공간 전체를 질식할 듯한 피 안개로 뒤덮어 약화 4를 부여합니다.' }, 
    { name: '절망의 시선', type: 'debuff', debuff: 'vulnerable', turns: 4, desc: '눈을 마주친 자의 영혼을 얼어붙게 만드는 시선으로 취약 4를 부여합니다.' }
  ]}, 
  { name: '고대 드래곤', baseHp: 1000, deck: [
    { name: '드래곤 브레스', type: 'attack', value: 60, desc: '턱 밑에서부터 모아온 거대한 화염의 숨결을 토해내 모든 것을 태워버리는 60의 피해를 줍니다.' }, 
    { name: '비늘 강화', type: 'defend', value: 80, desc: '마력을 방출해 강철보다 단단한 비늘을 한층 더 경화시켜 80의 방어도를 얻습니다.' }, 
    { name: '압도적 공포', type: 'debuff', debuff: 'weak', turns: 5, desc: '최상위 포식자의 진정한 포효를 내질러 존재만으로 공포에 떨게 만듭니다. 약화 5를 부여합니다.' }
  ]},
  { name: '미노타우로스', baseHp: 300, deck: [
    { name: '뿔 들이받기', type: 'attack', value: 45, desc: '거대한 두 개의 뿔을 앞세우고 지축을 울리며 돌진해 45의 피해를 줍니다.' }, 
    { name: '광폭화', type: 'buff', buff: 'strength', buffValue: 3, turns: 1, desc: '눈이 붉게 충혈되고 콧김을 거칠게 뿜어내며 분노로 근력을 3 얻습니다.' }, 
    { name: '도끼 휩쓸기', type: 'attack', value: 30, desc: '주위를 통째로 베어버리듯 거대한 도끼를 가로로 휘둘러 30의 피해를 줍니다.' }
  ]},
  { name: '마스터 리치', baseHp: 500, deck: [
    { name: '죽음의 광선', type: 'attack', value: 50, desc: '마른 뼈에서 녹색빛의 불길한 광선을 응축해 쏘아 50의 피해를 줍니다.' }, 
    { name: '저주받은 구속', type: 'debuff', debuff: 'bind', turns: 1, desc: '바닥에서 썩어가는 손아귀들을 소환해 발목을 잡아당겨 속박 1을 부여합니다.' }, 
    { name: '생명력 착취', type: 'attack_heal', value: 30, heal: 30, desc: '영혼의 파편을 강제로 뜯어내 30의 피해를 주고 썩은 뼈에 생기를 불어넣어 30 회복합니다.' }
  ]},
  { name: '돌연변이 키메라', baseHp: 800, deck: [
    { name: '독사 꼬리', type: 'attack_debuff', value: 20, debuff: 'weak', turns: 3, desc: '꼬리의 독사가 번개처럼 머리를 내밀어 물고 독을 퍼뜨려 20의 피해와 약화 3을 부여합니다.' }, 
    { name: '사자후', type: 'debuff', debuff: 'vulnerable', turns: 3, desc: '사자 머리가 귀를 찢을 듯한 거대한 포효를 내뱉어 정신을 혼미하게 만듭니다. 취약 3을 부여합니다.' }, 
    { name: '무자비한 찢기', type: 'attack', value: 40, desc: '사자와 염소의 뿔, 그리고 발톱으로 무자비하게 유린하여 40의 피해를 줍니다.' }
  ]},
  { name: '타락한 성기사', baseHp: 450, deck: [
    { name: '신성한 심판', type: 'attack', value: 35, desc: '어둠에 물든 신성 마법을 대검에 둘러 내리쳐 35의 피해를 줍니다.' }, 
    { name: '타락한 축복', type: 'buff', buff: 'strength', buffValue: 3, turns: 1, desc: '사악한 신에게 기도를 올려 피의 축복을 받아 근력을 3 얻습니다.' }, 
    { name: '절대 방어', type: 'defend', value: 50, desc: '검은 오오라를 뿜어내는 거대한 타워 실드로 전면을 완벽히 막아 50의 방어도를 얻습니다.' }
  ]},
  { name: '지옥의 파수견', baseHp: 550, deck: [
    { name: '물어뜯기', type: 'attack', value: 20, multi: 2, desc: '세 개의 머리 중 두 개가 동시에 달려들어 사지를 으스러뜨리며 20의 피해를 2번 줍니다.' }, 
    { name: '지옥의 불꽃', type: 'attack_debuff', value: 30, debuff: 'vulnerable', turns: 3, desc: '유황 냄새가 나는 지옥불을 입에서 토해내어 30의 피해를 주고 갑옷을 녹여 취약 3을 부여합니다.' }, 
    { name: '포효', type: 'debuff', debuff: 'weak', turns: 3, desc: '세 머리가 화음이 맞지 않는 기괴한 포효를 지르며 약화 3을 부여합니다.' }
  ]},
  { name: '고대 골렘 마스터', baseHp: 700, deck: [
    { name: '대지 분쇄', type: 'attack', value: 45, desc: '집채만한 바위 주먹으로 땅을 으깨버리듯 강타해 45의 피해를 줍니다.' }, 
    { name: '바위 방패', type: 'defend', value: 60, desc: '지면에서 거대한 돌기둥을 솟아오르게 해 방벽을 치고 60의 방어도를 얻습니다.' }, 
    { name: '압도', type: 'debuff', debuff: 'weak', turns: 4, desc: '지축을 울리는 발걸음만으로도 상대의 전의를 꺾어버려 약화 4를 부여합니다.' }
  ]},
  { name: '맹독의 여왕', baseHp: 600, deck: [
    { name: '맹독 가시', type: 'attack', value: 15, multi: 3, desc: '등에 돋친 독가시를 기관총처럼 쏘아내어 15의 피해를 3번 연속 줍니다.' }, 
    { name: '마비 독', type: 'debuff', debuff: 'bind', turns: 1, desc: '보라색 가루를 흩뿌려 호흡기를 통해 마비시켜 속박 1을 부여합니다.' }, 
    { name: '산성 늪', type: 'attack_debuff', value: 25, debuff: 'vulnerable', turns: 4, desc: '발밑을 부글거리는 산성 늪으로 만들어 25의 피해를 주고 피부를 녹여 취약 4를 부여합니다.' }
  ]},
  { name: '심연의 주시자', baseHp: 850, deck: [
    { name: '파멸의 광선', type: 'attack', value: 55, desc: '거대한 단일 안구에서 공간을 일그러뜨리는 보라색 광선을 쏴 55의 피해를 줍니다.' }, 
    { name: '정신 붕괴', type: 'debuff', debuff: 'silence', turns: 1, desc: '뇌리에 직접 끔찍한 환상을 욱여넣어 미치게 만듭니다. 침묵 1을 부여합니다.' }, 
    { name: '공허의 장막', type: 'defend', value: 70, desc: '존재를 비틀어 물리적 공격이 닿지 않는 공허의 장막을 쳐 70의 방어도를 얻습니다.' }
  ]}
];

export const HARD_MODE_BOSSES = [
  { name: '솜뭉치 유령', baseHp: 200, deck: [
    { name: '솜뭉치 펀치', type: 'attack', value: 15, desc: '가벼워 보이지만 은근히 묵직한 솜주먹을 뻗어 얼굴을 강타해 15의 피해를 줍니다.' }, 
    { name: '폭신폭신', type: 'defend', value: 30, desc: '몸을 더욱 거대하고 푹신하게 부풀려 모든 충격을 흡수할 30의 방어도를 얻습니다.' }, 
    { name: '재채기 가루', type: 'debuff', debuff: 'weak', turns: 2, desc: '콧구멍을 간지럽히는 저주받은 솜털을 훅 불어넣어 약화 2를 부여합니다.' }
  ]},
  { name: '심술쟁이 요정', baseHp: 250, deck: [
    { name: '요정의 장난', type: 'attack', value: 8, multi: 2, desc: '눈에 보이지 않을 속도로 날아다니며 머리카락을 잡아당기고 꼬집어 8의 피해를 2번 줍니다.' }, 
    { name: '눈부신 가루', type: 'debuff', debuff: 'frail', turns: 2, desc: '눈을 멀게 하는 반짝이는 요정 가루를 뿌려 허약 2를 부여합니다.' }, 
    { name: '반짝반짝', type: 'heal', heal: 30, desc: '빛무리에 휩싸이며 상처를 마법같이 회복해 체력을 30 회복합니다.' }
  ]},
  { name: '서큐버스 동생 리리', baseHp: 300, deck: [
    { name: '하트 브레이커', type: 'attack_debuff', value: 20, debuff: 'vulnerable', turns: 2, desc: '손키스를 날려 파괴적인 핑크빛 하트를 터뜨려 20의 피해를 주고 취약 2를 부여합니다.' }, 
    { name: '달콤한 속삭임', type: 'debuff', debuff: 'silence', turns: 1, desc: '귓가에 달콤하고 음탕한 말을 속삭여 정신을 잃게 만들어 침묵 1을 부여합니다.' }, 
    { name: '언니 도와줘!', type: 'defend_buff', value: 40, buff: 'strength', buffValue: 2, desc: '애처로운 목소리로 울먹이며 방어 자세를 취해 40의 방어도를 얻고 분노하여 근력을 2 얻습니다.' }
  ]},
  { name: '서큐버스 언니 롤라', baseHp: 350, deck: [
    { name: '사랑의 채찍', type: 'attack', value: 12, multi: 3, desc: '가죽 채찍을 사디스틱하게 휘둘러 찰진 소리와 함께 12의 피해를 3번 줍니다.' }, 
    { name: '정기 흡수', type: 'attack_heal', value: 25, heal: 25, desc: '강제로 입을 맞춰 생명 에너지를 진득하게 빨아들여 25의 피해를 주고 체력을 25 회복합니다.' }, 
    { name: '위험한 매력', type: 'debuff', debuff: 'bind', turns: 1, desc: '도발적인 포즈와 눈웃음으로 발을 얼어붙게 만들어 속박 1을 부여합니다.' }
  ]},
  { name: '화가 난 호박 기사', baseHp: 400, deck: [
    { name: '호박 머리 박치기', type: 'attack', value: 35, desc: '불타는 호박 머리를 들이밀며 무식하게 박치기를 해 35의 피해를 줍니다.' }, 
    { name: '넝쿨 묶기', type: 'attack_debuff', value: 15, debuff: 'frail', turns: 3, desc: '바닥에서 가시 넝쿨을 피워내 사지를 묶어 15의 피해를 주고 허약 3을 부여합니다.' }, 
    { name: '단단한 껍질', type: 'defend', value: 50, desc: '호박 껍질을 더욱 두껍고 단단하게 경화시켜 50의 방어도를 얻습니다.' }
  ]},
  { name: '거대 꿀벌 여왕', baseHp: 450, deck: [
    { name: '독침 찌르기', type: 'attack_debuff', value: 25, debuff: 'poison', turns: 4, desc: '창만큼 거대한 독침을 몸에 푹 박아넣어 25의 피해를 주고 중독 4를 부여합니다.' }, 
    { name: '페로몬 살포', type: 'debuff', debuff: 'mark', turns: 3, desc: '타겟을 지정하는 특수 페로몬 가루를 흩날려 표식 3을 부여합니다.' }, 
    { name: '일벌 소환', type: 'defend', value: 60, desc: '수백 마리의 일벌 떼를 몸 주위에 뭉치게 해 60의 방어도를 얻습니다.' }
  ]},
  { name: '달빛 늑대인간', baseHp: 500, deck: [
    { name: '광란의 발톱', type: 'attack', value: 20, multi: 2, desc: '이성을 잃고 짐승처럼 울부짖으며 앞발을 마구 휘둘러 20의 피해를 2번 줍니다.' }, 
    { name: '피의 갈증', type: 'buff', buff: 'strength', buffValue: 3, desc: '피 냄새에 취해 근육이 비정상적으로 부풀어 오르며 근력을 3 얻습니다.' }, 
    { name: '물어뜯기', type: 'attack_heal', value: 30, heal: 20, desc: '목덜미를 짐승의 턱으로 잔인하게 물어뜯어 30의 피해를 주고 체력을 20 회복합니다.' }
  ]},
  { name: '광기의 연금술사', baseHp: 550, deck: [
    { name: '화학 물질 투척', type: 'attack', value: 45, desc: '정체불명의 폭발성 플라스크를 마구 집어던져 45의 피해를 줍니다.' }, 
    { name: '유독 가스', type: 'debuff', debuff: 'poison', turns: 5, desc: '녹색의 숨막히는 유독 가스 밸브를 열어 중독 5를 부여합니다.' }, 
    { name: '돌연변이 물약', type: 'defend_buff', value: 40, buff: 'strength', buffValue: 4, desc: '기괴한 약물을 들이켜 40의 방어도를 얻고 몸집이 비대해지며 근력을 4 얻습니다.' }
  ]},
  { name: '고대 유적의 파수꾼', baseHp: 600, deck: [
    { name: '레이저 빔', type: 'attack', value: 50, desc: '외눈에서 모든 것을 태우는 고열의 붉은 레이저를 발사해 50의 피해를 줍니다.' }, 
    { name: '강제 제압', type: 'attack_debuff', value: 20, debuff: 'bind', turns: 1, desc: '기계 팔로 강하게 짓눌러 20의 피해를 주고 움직임을 봉쇄해 속박 1을 부여합니다.' }, 
    { name: '방어막 전개', type: 'defend', value: 80, desc: '푸른 육각형의 에너지 쉴드를 전면에 전개하여 80의 방어도를 얻습니다.' }
  ]},
  { name: '빙결의 마녀', baseHp: 650, deck: [
    { name: '얼음 송곳', type: 'attack', value: 15, multi: 3, desc: '공기 중의 수분을 얼려 날카로운 얼음창을 세 발 연속 발사해 15의 피해를 3번 줍니다.' }, 
    { name: '눈보라', type: 'debuff', debuff: 'weak', turns: 4, desc: '시야를 가리는 혹한의 눈보라를 몰아쳐 뼛속까지 얼리며 약화 4를 부여합니다.' }, 
    { name: '절대 영도', type: 'debuff', debuff: 'silence', turns: 1, desc: '마력 회로마저 얼어붙게 만드는 냉기를 내뿜어 침묵 1을 부여합니다.' }
  ]},
  { name: '심해의 악몽', baseHp: 700, deck: [
    { name: '먹물 뿜기', type: 'attack_debuff', value: 35, debuff: 'frail', turns: 4, desc: '정신을 오염시키는 칠흑 같은 먹물을 직사로 내뿜어 35의 피해를 주고 허약 4를 부여합니다.' }, 
    { name: '촉수 난타', type: 'attack', value: 18, multi: 4, desc: '어둠 속에서 수많은 촉수가 튀어나와 채찍처럼 사정없이 후려칩니다. 18의 피해를 4번 줍니다.' }, 
    { name: '심해의 재생', type: 'heal', heal: 80, desc: '몸을 비틀며 심연의 기운을 흡수해 뜯겨나간 살점을 복구합니다. 체력을 80 회복합니다.' }
  ]},
  { name: '타락한 성녀', baseHp: 750, deck: [
    { name: '신성한 불꽃', type: 'attack', value: 60, desc: '검게 물든 성화로 죄인을 태우듯 십자가 형상의 불길을 일으켜 60의 피해를 줍니다.' }, 
    { name: '거짓된 축복', type: 'attack_debuff', value: 30, debuff: 'vulnerable', turns: 3, desc: '축복을 가장한 저주를 내려 30의 피해를 주고 피부를 썩어들어가게 해 취약 3을 부여합니다.' }, 
    { name: '기적의 방패', type: 'defend', value: 100, desc: '기도를 올려 어둠의 빛줄기가 막아내는 절대적인 장막을 형성해 100의 방어도를 얻습니다.' }
  ]},
  { name: '강철 거수', baseHp: 800, deck: [
    { name: '지진 일으키기', type: 'attack_debuff', value: 45, debuff: 'weak', turns: 3, desc: '강철 기둥 같은 다리로 땅을 내리찍어 지진을 일으켜 45의 피해를 주고 약화 3을 부여합니다.' }, 
    { name: '초고열 용광로', type: 'buff', buff: 'strength', buffValue: 5, desc: '체내의 엔진이 굉음을 내며 시뻘겋게 과열되어 근력을 5 얻습니다.' }, 
    { name: '육중한 돌진', type: 'attack', value: 70, desc: '브레이크 없이 모든 것을 부수며 맹렬하게 전진하여 70의 피해를 줍니다.' }
  ]},
  { name: '핏빛 군단장', baseHp: 850, deck: [
    { name: '참수격', type: 'attack', value: 80, desc: '피로 물든 대검을 단숨에 휘둘러 머리를 노리는 필살의 일격으로 80의 피해를 줍니다.' }, 
    { name: '출혈 강요', type: 'attack_debuff', value: 40, debuff: 'mark', turns: 5, desc: '살점을 도려내어 멈추지 않는 출혈을 일으켜 40의 피해를 주고 표식 5를 부여합니다.' }, 
    { name: '군단의 방진', type: 'defend', value: 120, desc: '유령 군단병들을 소환해 철통같은 방진을 짜 120의 방어도를 얻습니다.' }
  ]},
  { name: '역병의 사도', baseHp: 900, deck: [
    { name: '부패의 숨결', type: 'attack_debuff', value: 30, debuff: 'poison', turns: 6, desc: '고름이 터지는 소리와 함께 썩은 숨을 뱉어내 30의 피해를 주고 중독 6을 부여합니다.' }, 
    { name: '질병 전파', type: 'debuff', debuff: 'frail', turns: 5, desc: '지팡이를 쾅 찍어 쥐떼와 병균을 온 사방에 퍼뜨려 허약 5를 부여합니다.' }, 
    { name: '죽음의 포옹', type: 'attack_heal', value: 50, heal: 50, desc: '뼈만 남은 팔로 껴안으며 생명력을 흡수해 50의 피해를 주고 체력을 50 회복합니다.' }
  ]},
  { name: '그림자 군주', baseHp: 950, deck: [
    { name: '어둠의 장막', type: 'debuff', debuff: 'silence', turns: 1, desc: '빛이 존재하지 않는 완전한 어둠 속으로 끌고 들어가 침묵 1을 부여합니다.' }, 
    { name: '그림자 베기', type: 'attack', value: 25, multi: 4, desc: '사방의 그림자에서 시퍼런 칼날들이 솟구쳐나와 25의 피해를 4번 연속 줍니다.' }, 
    { name: '허구의 방패', type: 'defend', value: 150, desc: '실체가 없는 환영으로 공간을 일그러뜨려 150의 방어도를 얻습니다.' }
  ]},
  { name: '고대 용의 망령', baseHp: 1000, deck: [
    { name: '망령 브레스', type: 'attack_debuff', value: 70, debuff: 'vulnerable', turns: 4, desc: '푸른 혼백이 섞인 차가운 불꽃을 토해내 70의 피해를 주고 영혼을 얼려 취약 4를 부여합니다.' }, 
    { name: '원혼 폭발', type: 'attack', value: 100, desc: '주변의 원혼들을 닥치는 대로 빨아들였다가 한 번에 폭발시켜 100의 피해를 줍니다.' }, 
    { name: '영혼 착취', type: 'attack_heal', value: 40, heal: 80, desc: '거대한 영체의 발톱으로 정신을 짓누르고 생명력을 뜯어내어 40의 피해를 주고 체력을 80 회복합니다.' }
  ]},
  { name: '지옥의 재판관', baseHp: 1100, deck: [
    { name: '사형 선고', type: 'debuff', debuff: 'mark', turns: 10, desc: '불타는 망치를 두드리며 영혼에 지워지지 않는 죄인 낙인을 찍어 표식 10을 부여합니다.' }, 
    { name: '죄악 심판', type: 'attack', value: 30, multi: 5, desc: '단두대의 칼날이 쉴 새 없이 떨어져내리는 듯한 환상과 함께 30의 피해를 5번 줍니다.' }, 
    { name: '구속구 채우기', type: 'attack_debuff', value: 50, debuff: 'bind', turns: 1, desc: '시뻘겋게 달아오른 쇠사슬을 휘감아 살을 지지며 50의 피해를 주고 속박 1을 부여합니다.' }
  ]},
  { name: '공허의 파괴자', baseHp: 1200, deck: [
    { name: '차원 분쇄', type: 'attack', value: 120, desc: '손짓 한 번으로 공간 자체를 쪼개버려 방어 불가 수준의 120의 피해를 줍니다.' }, 
    { name: '존재 소멸', type: 'debuff', debuff: 'silence', turns: 2, desc: '기억과 마력 회로를 강제로 끊어버리는 파동을 뿜어 침묵 2를 부여합니다.' }, 
    { name: '공허 흡수', type: 'defend_buff', value: 200, buff: 'strength', buffValue: 5, desc: '주변의 모든 빛과 마력을 빨아들이는 블랙홀을 형성해 200의 방어도를 얻고 근력을 5 얻습니다.' }
  ]},
  { name: '종말의 전령', baseHp: 1500, deck: [
    { name: '종말의 도래', type: 'attack_debuff', value: 150, debuff: 'frail', turns: 5, desc: '하늘이 무너져내리는 환상과 함께 압도적인 재앙을 선사해 150의 피해를 주고 허약 5를 부여합니다.' }, 
    { name: '절망의 빛', type: 'attack', value: 40, multi: 5, desc: '검은 태양에서 쏟아지는 절망적인 광선을 쏘아 40의 피해를 5번 줍니다.' }, 
    { name: '불가역의 시간', type: 'heal', heal: 200, desc: '시계태엽이 거꾸로 돌아가는 기괴한 소리와 함께 상처 입기 전의 시간으로 돌아가 체력을 200 회복합니다.' }
  ]}
];

export const SPECIAL_BOSSES = {
  25: { name: '거미 여왕', baseHp: 500, rewardCards: ['spider_queens_web', 'spider_queen_poison'], passives: [], deck: [
    { name: '맹독 샤워', type: 'attack_debuff', value: 15, multi: 2, debuff: 'weak', turns: 2, desc: '천장에서 독액 비를 쏟아내려 피부를 태웁니다. 15의 피해를 2번 주고 약화 2를 부여합니다.' }, 
    { name: '여왕의 명령', type: 'defend_debuff', value: 50, debuff: 'vulnerable', turns: 2, desc: '기분 나쁜 울음소리로 새끼 거미들을 방패막이로 세웁니다. 50의 방어도를 얻고 취약 2를 부여합니다.' }
  ]},
  50: { name: '김삠삐', baseHp: 1500, rewardCards: ['twerking'], passives: [{ id: 'revive', name: '1회 부활', desc: '사망 시 체력을 50% 회복하고 1회 부활합니다.' }], deck: [
    { name: '트월킹', type: 'attack_debuff', value: 30, debuff: 'vulnerable', turns: 2, desc: '도저히 눈 뜨고 볼 수 없는 격렬한 엉덩이 흔들기로 충격파를 생성해 30의 피해를 주고 넋을 빼놓아 취약 2를 부여합니다.' }, 
    { name: '도발', type: 'defend_buff', value: 50, buff: 'strength', buffValue: 6, desc: '건방진 포즈로 약을 올리며 방어 태세를 갖춥니다. 50의 방어도를 얻고 분노 에너지로 근력을 6 얻습니다.' }, 
    { name: '회보오옥!', type: 'heal', heal: 200, desc: '이상한 소리를 지르며 빛줄기에 감싸여 상처를 꿰매 체력을 200 회복합니다.' }
  ]},
  75: { name: '수라의 왕', baseHp: 2500, rewardCards: ['asuras_wrath', 'power_of_asura', 'supreme_blade_storm'], passives: [{ id: 'scaling_strength', name: '끝없는 분노', desc: '매 턴 시작 시 근력이 3 증가합니다.' }], deck: [
    { name: '육도윤회', type: 'attack', value: 15, multi: 6, desc: '여섯 개의 팔이 눈에 보이지 않는 궤적으로 쏟아져 내려 15의 피해를 6번 연속으로 줍니다.' }, 
    { name: '금강불괴', type: 'defend', value: 100, desc: '전신의 근육을 바위처럼 경화시켜 어떤 공격도 튕겨낼 듯한 100의 방어도를 얻습니다.' }, 
    { name: '파괴의 눈', type: 'debuff', debuff: 'vulnerable', turns: 5, desc: '이마에 위치한 제3의 눈을 번쩍 떠서 영혼을 짓누릅니다. 취약 5를 부여합니다.' }
  ]},
  100: { name: '스스스슬라임', baseHp: 800, rewardCards: ['slime_snot', 'slimes_greed'], passives: [{ id: 'revive', name: '1회 부활', desc: '사망 시 체력을 50% 회복하고 1회 부활합니다.' }], deck: [
    { name: '트리플 어택', type: 'attack', value: 20, multi: 3, desc: '세 갈래로 거대하게 분열하여 동시에 짓눌러 20의 피해를 3번 줍니다.' }, 
    { name: '산성비', type: 'attack_debuff', value: 40, debuff: 'weak', turns: 3, desc: '온몸의 독액을 하늘로 뿜어내어 산성비를 내리게 해 40의 피해를 주고 약화 3을 부여합니다.' }, 
    { name: '단단한 결속', type: 'defend_buff', value: 100, buff: 'strength', buffValue: 5, desc: '흩어진 점액들을 한 점으로 초압축하여 100의 방어도를 얻고 밀도를 높여 근력을 5 얻습니다.' }
  ]},

  H50: {  
    name: '초월한 슬라임', 
    baseHp: 3000, 
    passives: [{ id: 'scaling_strength', name: '분열하는 마력', desc: '매 턴 근력이 2씩 상승합니다.' }], 
    deck: [
      { name: '초월 낙하', type: 'attack', value: 30, desc: '구름 위까지 도약했다가 유성처럼 떨어져 30의 피해를 줍니다.' },
      { name: '마력 재생', type: 'heal', heal: 250, desc: '대지의 마맥을 빨아들여 투명하게 빛나며 체력을 250 회복합니다.' },
      { name: '강산성 점액', type: 'attack_debuff', value: 15, debuff: 'frail', turns: 2, desc: '닿기만 해도 뼈가 삭는 점액질을 뿜어 15의 피해를 주고 허약 2를 부여합니다.' },
      { name: '분열 타격', type: 'attack', value: 10, multi: 4, desc: '수십 개의 미니 슬라임으로 나뉘어 일제히 융단 폭격을 가해 10의 피해를 4번 줍니다.' },
      { name: '끈적한 늪', type: 'debuff', debuff: 'bind', turns: 1, desc: '전투 공간을 온통 끈적이는 슬라임 지대로 만들어 발을 묶어 속박 1을 부여합니다.' },
      { name: '탄성 강화', type: 'defend', value: 150, desc: '젤리 같은 몸통을 진동시켜 모든 충격을 무효화하는 150의 방어도를 얻습니다.' },
      { name: '슬라임 웨이브', type: 'attack_debuff', value: 20, debuff: 'weak', turns: 2, desc: '거대한 점액의 해일을 일으켜 20의 피해를 주고 휩쓸리게 해 약화 2를 부여합니다.' },
      { name: '맹독 뱉기', type: 'attack_debuff', value: 10, debuff: 'poison', turns: 5, desc: '응축된 맹독 구슬을 기관총처럼 뱉어내 10의 피해를 주고 중독 5를 부여합니다.' }
    ] 
  },
  H100: { 
    name: '기계화된 골렘', 
    baseHp: 5000, 
    passives: [{ id: 'iron_skin', name: '강철 장갑', desc: '받는 모든 피해가 25% 감소합니다.' }], 
    deck: [
      { name: '섬멸 레이저', type: 'attack', value: 25, multi: 3, desc: '가슴이 열리며 세 가닥의 섬멸 레이저가 교차하며 25의 피해를 3번 줍니다.' },
      { name: '철벽 가동', type: 'defend', value: 300, desc: '전면 장갑을 육각형 쉴드로 덮으며 절대적인 300의 방어도를 전개합니다.' },
      { name: '동력 충전', type: 'buff', buff: 'strength', amount: 5, desc: '엔진이 굉음을 내며 시뻘겋게 달아오르고 리미터가 해제되어 근력을 5 얻습니다.' },
      { name: '지진 일으키기', type: 'attack_debuff', value: 40, debuff: 'vulnerable', turns: 3, desc: '거대한 강철 다리로 대지를 짓밟아 40의 피해를 주고 균형을 무너뜨려 취약 3을 부여합니다.' },
      { name: '오토 리페어', type: 'heal', heal: 400, desc: '나노 로봇을 가동해 찌그러진 장갑을 즉각 복구하며 체력을 400 회복합니다.' },
      { name: '로켓 펀치', type: 'attack', value: 70, desc: '팔뚝에서 부스터가 뿜어져 나오며 날아가는 펀치로 70의 묵직한 피해를 줍니다.' },
      { name: '방출', type: 'attack', value: 15, multi: 5, desc: '과열된 증기와 쇳조각들을 사방으로 뿜어내어 15의 피해를 5번 줍니다.' },
      { name: '타겟 록온', type: 'debuff', debuff: 'mark', turns: 10, desc: '붉은 조준점이 끈질기게 따라붙으며 미사일 타겟으로 지정해 표식 10을 부여합니다.' }
    ] 
  },
  H150: { 
    name: '@#!%#', 
    baseHp: 7000, 
    passives: [{ id: 'glitch', name: '데이터 변조', desc: '매 턴 무작위 디버프를 부여합니다.' }], 
    deck: [
      { name: 'Fatal Error', type: 'attack_debuff', value: 60, debuff: 'vulnerable', turns: 5, desc: '공간의 픽셀이 깨지며 끔찍한 노이즈와 함께 60의 피해를 주고 취약 5를 부여합니다.' },
      { name: 'Null Pointer', type: 'debuff', debuff: 'silence', turns: 1, desc: '존재의 좌표를 삭제하려 들어 의식을 일시적으로 끊어버립니다. 침묵 1을 부여합니다.' },
      { name: 'Memory Leak', type: 'attack_debuff', value: 20, debuff: 'poison', turns: 10, desc: '생명력을 서서히 갉아먹는 바이러스 코드를 주입해 20의 피해를 주고 중독 10을 부여합니다.' },
      { name: 'Overflow', type: 'attack', value: 80, desc: '처리 용량을 초과하는 에너지를 강제로 욱여넣어 내부에서 터지게 해 80의 피해를 줍니다.' },
      { name: '0x00000000', type: 'attack', value: 0, multi: 15, desc: '알 수 없는 에러 코드가 허공을 메우며 보이지 않는 타격을 15번 연속으로 가합니다.' },
      { name: 'System Restoring', type: 'heal', heal: 500, desc: '과거의 세이브 포인트로 데이터를 강제 롤백시켜 체력을 500 회복합니다.' },
      { name: 'Corrupted File', type: 'attack_debuff', value: 30, debuff: 'bind', turns: 1, desc: '오염된 데이터를 뒤집어씌워 관절을 굳게 만들어 30의 피해와 속박 1을 부여합니다.' },
      { name: 'Blue Screen', type: 'attack_debuff', value: 50, debuff: 'frail', turns: 3, desc: '망막에 파란 화면이 강제로 띄워지며 시스템을 다운시켜 50의 피해와 허약 3을 부여합니다.' }
    ] 
  },
  H200: { 
    name: '종말의 정적', 
    baseHp: 9000, 
    passives: [{ id: 'silence_aura', name: '침묵의 오라', desc: '항상 플레이어의 스킬을 방해합니다.' }], 
    deck: [
      { name: '무의 세계', type: 'debuff', debuff: 'silence', turns: 2, desc: '모든 소리와 색채를 빼앗는 회색 결계를 펼쳐 침묵 2를 부여합니다.' },
      { name: '종말의 일격', type: 'attack', value: 120, desc: '시계의 초침이 멈추는 소리와 함께 인지할 수 없는 참격을 날려 120의 피해를 줍니다.' },
      { name: '고요한 외침', type: 'attack_debuff', value: 40, debuff: 'weak', turns: 3, desc: '소리 없는 비명이 영혼을 직접 타격해 40의 피해를 주고 전의를 꺾어 약화 3을 부여합니다.' },
      { name: '생명력 흡수', type: 'attack_heal', value: 50, heal: 500, desc: '주변의 모든 생동감을 빨아들여 사막처럼 메마르게 해 50의 피해를 주고 체력을 500 회복합니다.' },
      { name: '정신 붕괴', type: 'attack_debuff', value: 30, multi: 3, debuff: 'vulnerable', turns: 3, desc: '끝없는 심연의 환각을 보여주며 30의 피해를 3번 주고 미쳐버리게 해 취약 3을 부여합니다.' },
      { name: '공허의 방패', type: 'defend', value: 500, desc: '공격 자체가 존재하지 않았던 것처럼 무효화시키는 절대적인 500의 방어도를 전개합니다.' },
      { name: '잊혀진 기억', type: 'debuff', debuff: 'mark', turns: 20, desc: '지워진 존재들의 원념이 들러붙어 영원히 벗어날 수 없는 표식 20을 부여합니다.' },
      { name: '사라지는 시간', type: 'attack', value: 25, multi: 4, desc: '시공간이 깎여나가며 몸의 일부가 먼지로 변해 25의 피해를 4번 연속 받습니다.' }
    ] 
  },
  H250_A: { 
    name: '릴리스 (서큐버스 언니)', 
    baseHp: 8000, 
    passives: [{ id: 'blood_thirst', name: '피의 갈증', desc: '공격 시 체력을 회복합니다.' }], 
    deck: [
      { name: '채찍질', type: 'attack', value: 30, multi: 3, desc: '가시 박힌 채찍이 눈에 보이지 않게 휘둘러지며 30의 피해를 3번 연속 줍니다.' },
      { name: '피의 향연', type: 'attack_heal', value: 60, heal: 300, desc: '황홀할 정도로 잔인하게 피를 들이마셔 60의 피해를 주고 체력을 300 회복합니다.' },
      { name: '치명적인 발톱', type: 'attack_debuff', value: 45, debuff: 'frail', turns: 3, desc: '아름답지만 치명적인 손톱으로 동맥을 그어버려 45의 피해를 주고 허약 3을 부여합니다.' },
      { name: '가학적 쾌감', type: 'buff', buff: 'strength', amount: 8, desc: '비명소리를 들으며 희열에 차올라 웃음을 터뜨리며 근력을 8 얻습니다.' },
      { name: '광란의 춤', type: 'attack', value: 20, multi: 5, desc: '피바람 속에서 춤을 추듯 우아하게 다가와 20의 피해를 5번 연속 줍니다.' },
      { name: '언니의 보호', type: 'defend', value: 400, desc: '박쥐 떼를 거대한 망토처럼 둘러 모든 공격을 대신 맞게 해 400의 방어도를 얻습니다.' },
      { name: '선혈 베기', type: 'attack', value: 90, desc: '피로 만들어진 거대한 낫을 허공에 긋듯 휘둘러 90의 묵직한 피해를 줍니다.' }
    ] 
  },
  H250_B: { 
    name: '모리건 (서큐버스 동생)', 
    baseHp: 7000, 
    passives: [{ id: 'charm_aura', name: '매혹의 오라', desc: '매 턴 플레이어에게 약화를 부여합니다.' }], 
    deck: [
      { name: '유혹의 입맞춤', type: 'attack_debuff', value: 20, debuff: 'weak', turns: 3, desc: '달콤한 독이 묻은 몽환적인 입맞춤을 날려 20의 피해를 주고 약화 3을 부여합니다.' },
      { name: '악몽 주입', type: 'attack_debuff', value: 30, debuff: 'silence', turns: 1, desc: '정신을 갉아먹는 달콤한 악몽을 머릿속에 욱여넣어 30의 피해를 주고 침묵 1을 부여합니다.' },
      { name: '그림자 늪', type: 'debuff', debuff: 'bind', turns: 1, desc: '발밑의 그림자가 끈적한 촉수로 변해 몸을 휘감으며 속박 1을 부여합니다.' },
      { name: '환락의 저주', type: 'attack_debuff', value: 40, debuff: 'vulnerable', turns: 3, desc: '고통조차 쾌락으로 느끼게 만드는 핑크빛 안개를 뿜어 40의 피해를 주고 취약 3을 부여합니다.' },
      { name: '동생의 응원', type: 'heal', heal: 400, desc: '언니를 응원하며 자신과 언니 주변에 치유의 오라를 둘러 체력을 400 회복합니다.' }, 
      { name: '영혼 흡취', type: 'attack_heal', value: 50, heal: 200, desc: '가까이 다가와 영혼의 에너지를 깊게 들이마셔 50의 피해를 주고 체력을 200 회복합니다.' },
      { name: '어둠의 장막', type: 'defend', value: 300, desc: '그림자 속에 완전히 몸을 숨겨 일체의 타격을 받지 않는 300의 방어도를 얻습니다.' }
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
      { name: '빅뱅', type: 'attack', value: 25, multi: 8, desc: '우주가 탄생하는 순간의 압도적인 에너지를 압축하여 터뜨려 25의 피해를 8번 연속 줍니다.' },
      { name: '세계선 붕괴', type: 'attack_debuff', value: 80, debuff: 'vulnerable', turns: 5, desc: '주변의 시공간 차원을 찢어발기며 80의 피해를 주고 존재 자체를 취약하게 만들어 취약 5를 부여합니다.' },
      { name: '공허의 시선', type: 'debuff', debuff: 'silence', turns: 1, desc: '모든 마법을 무로 돌리는 절대자의 시선으로 짓눌러 침묵 1을 부여합니다.' },
      { name: '별의 탄생', type: 'heal', heal: 999, desc: '초신성이 폭발하듯 눈부신 빛무리에 휩싸이며 손상된 몸의 입자를 재구성해 체력을 999 회복합니다.' },
      { name: '차원 단절', type: 'defend', value: 999, desc: '자신과 세상을 분리하는 차원의 벽을 쳐 어떠한 간섭도 허용하지 않는 999의 방어도를 얻습니다.' },
      { name: '은하 분쇄', type: 'attack', value: 200, desc: '거대한 은하계를 축소시켜 적의 머리 위로 그대로 내리꽂아 200의 파멸적인 피해를 줍니다.' },
      { name: '인과율 조작', type: 'debuff', debuff: 'bind', turns: 2, desc: '행동의 결과값을 강제로 삭제해 아무것도 하지 못하게 만들어 속박 2를 부여합니다.' },
      { name: '태초의 빛', type: 'attack', value: 50, multi: 3, desc: '시작과 끝을 알리는 성스러운 광선을 세 갈래로 쏘아내어 50의 피해를 3번 줍니다.' },
      { name: '절대 권력', type: 'buff', buff: 'strength', amount: 10, desc: '우주의 이치를 거스르는 압도적인 권능을 발현해 스스로의 한계를 부수고 근력을 10 얻습니다.' },
      { name: '종말 카운트다운', type: 'attack_debuff', value: 99, debuff: 'mark', turns: 10, desc: '머리 위에 파멸을 예고하는 거대한 모래시계를 띄워 99의 피해를 주고 지워지지 않는 표식 10을 부여합니다.' }
    ] 
  }
};