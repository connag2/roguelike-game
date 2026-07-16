// src/constants/relicData.js
export const RELIC_LIBRARY = [
  {
    "id": "old_whetstone",
    "name": "낡은 숫돌",
    "rarity": "common",
    "category": "buff",
    "desc": "전투 시작 시 근력을 1 얻습니다.",
    "effect": {
      "type": "START_COMBAT",
      "strength": 1
    }
  },
  {
    "id": "leather_boots",
    "name": "가죽 장화",
    "rarity": "common",
    "category": "buff",
    "desc": "전투 시작 시 민첩을 1 얻습니다.",
    "effect": {
      "type": "START_COMBAT",
      "dexterity": 1
    }
  },
  {
    "id": "rusty_shield",
    "name": "녹슨 방패",
    "rarity": "common",
    "category": "buff",
    "desc": "전투 시작 시 방어도를 5 얻습니다.",
    "effect": {
      "type": "START_COMBAT",
      "block": 5
    }
  },
  {
    "id": "lucky_coin_relic",
    "name": "행운의 동전",
    "rarity": "common",
    "category": "utility",
    "desc": "전투 승리 시 크레딧을 5 더 얻습니다.",
    "effect": {
      "type": "END_COMBAT_CREDITS",
      "bonus": 5
    }
  },
  {
    "id": "minor_potion",
    "name": "작은 물약병",
    "rarity": "common",
    "category": "utility",
    "desc": "전투 승리 시 체력을 3 회복합니다.",
    "effect": {
      "type": "END_COMBAT_HEAL",
      "heal": 3
    }
  },
  {
    "id": "thorny_vine",
    "name": "가시 덩굴",
    "rarity": "common",
    "category": "buff",
    "desc": "전투 시작 시 가시를 2 얻습니다.",
    "effect": {
      "type": "START_COMBAT",
      "thorns": 2
    }
  },
  {
    "id": "sturdy_belt",
    "name": "튼튼한 벨트",
    "rarity": "common",
    "category": "utility",
    "desc": "전투 시작 시 체력을 2 회복합니다.",
    "effect": {
      "type": "START_COMBAT_HEAL",
      "heal": 2
    }
  },
  {
    "id": "mana_shard",
    "name": "마나석 조각",
    "rarity": "uncommon",
    "category": "buff",
    "desc": "매 턴 시작 시 방어도를 3 얻습니다.",
    "effect": {
      "type": "START_TURN",
      "block": 3
    }
  },
  {
    "id": "vampire_fang",
    "name": "흡혈귀의 송곳니",
    "rarity": "uncommon",
    "category": "utility",
    "desc": "전투 승리 시 체력을 6 회복합니다.",
    "effect": {
      "type": "END_COMBAT_HEAL",
      "heal": 6
    }
  },
  {
    "id": "assassins_dagger",
    "name": "암살자의 단검",
    "rarity": "uncommon",
    "category": "buff",
    "desc": "전투 시작 시 근력을 2 얻습니다.",
    "effect": {
      "type": "START_COMBAT",
      "strength": 2
    }
  },
  {
    "id": "swift_cloak",
    "name": "신속의 망토",
    "rarity": "uncommon",
    "category": "buff",
    "desc": "전투 시작 시 민첩을 2 얻습니다.",
    "effect": {
      "type": "START_COMBAT",
      "dexterity": 2
    }
  },
  {
    "id": "golden_idol",
    "name": "황금 우상",
    "rarity": "uncommon",
    "category": "utility",
    "desc": "전투 승리 시 크레딧을 10 더 얻습니다.",
    "effect": {
      "type": "END_COMBAT_CREDITS",
      "bonus": 10
    }
  },
  {
    "id": "poisoned_apple",
    "name": "독사과",
    "rarity": "uncommon",
    "category": "debuff",
    "desc": "매 턴 시작 시 적 전체에게 중독 1을 부여합니다.",
    "effect": {
      "type": "START_TURN_ADVANCED",
      "poison": 1
    }
  },
  {
    "id": "slime_crown",
    "name": "킹 슬라임의 왕관",
    "rarity": "rare",
    "category": "debuff",
    "desc": "매 턴 시작 시 방어도를 5 얻고 적 전체에게 중독 1을 부여합니다.",
    "effect": {
      "type": "START_TURN_ADVANCED",
      "block": 5,
      "poison": 1
    }
  },
  {
    "id": "asura_blood",
    "name": "수라의 피",
    "rarity": "rare",
    "category": "buff",
    "desc": "턴 시작 시 체력이 50% 이하라면 근력을 2 얻습니다.",
    "effect": {
      "type": "START_TURN_CONDITION",
      "condition": "HP_50",
      "strength": 2
    }
  },
  {
    "id": "dragon_scale",
    "name": "용의 비늘",
    "rarity": "rare",
    "category": "buff",
    "desc": "전투 시작 시 방어도를 15, 민첩을 2 얻습니다.",
    "effect": {
      "type": "START_COMBAT",
      "block": 15,
      "dexterity": 2
    }
  },
  {
    "id": "philosopher_stone",
    "name": "현자의 돌",
    "rarity": "rare",
    "category": "utility",
    "desc": "매 턴 시작 시 카드를 1장 더 뽑습니다.",
    "effect": {
      "type": "START_TURN",
      "draw": 1
    }
  },
  {
    "id": "golden_ticket",
    "name": "황금 가챠 티켓",
    "rarity": "special",
    "category": "utility",
    "desc": "전투 승리 시 크레딧을 20 더 얻습니다.",
    "effect": {
      "type": "END_COMBAT_CREDITS",
      "bonus": 20
    }
  },
  {
    "id": "cursed_pendant",
    "name": "저주받은 펜던트",
    "rarity": "special",
    "category": "buff",
    "desc": "전투 시작 시 근력을 4 얻지만, 매 턴 시작 시 체력을 2 잃습니다.",
    "effect": {
      "type": "START_COMBAT_AND_TURN",
      "strength": 4,
      "selfDamage": 2
    }
  },
  {
    "id": "black_silence_gloves",
    "name": "검은 침묵의 장갑",
    "rarity": "mythic",
    "category": "utility",
    "desc": "매 턴 시작 시 마나 1, 드로우 1, 근력을 1 얻습니다.",
    "effect": {
      "type": "START_TURN_MYTHIC",
      "mana": 1,
      "draw": 1,
      "strength": 1
    }
  },
  {
    "id": "bear_pelt",
    "name": "곰가죽 망토",
    "rarity": "common",
    "category": "buff",
    "desc": "전투 시작 시 체력을 5 회복하고 방어도를 3 얻습니다.",
    "effect": {
      "type": "START_COMBAT",
      "heal": 5,
      "block": 3
    }
  },
  {
    "id": "iron_spikes",
    "name": "무쇠 징",
    "rarity": "common",
    "category": "buff",
    "desc": "전투 시작 시 가시를 3 얻습니다.",
    "effect": {
      "type": "START_COMBAT",
      "thorns": 3
    }
  },
  {
    "id": "troll_blood",
    "name": "트롤의 피",
    "rarity": "uncommon",
    "category": "buff",
    "desc": "전투 시작 시 재생 2를 얻습니다.",
    "effect": {
      "type": "START_COMBAT",
      "regen": 2
    }
  },
  {
    "id": "owl_feather",
    "name": "부엉이 깃털",
    "rarity": "uncommon",
    "category": "buff",
    "desc": "전투 시작 시 통찰 1을 얻습니다.",
    "effect": {
      "type": "START_COMBAT",
      "insight": 1
    }
  },
  {
    "id": "gladiator_helm",
    "name": "검투사의 투구",
    "rarity": "uncommon",
    "category": "buff",
    "desc": "전투 시작 시 근력을 1, 민첩을 1 얻습니다.",
    "effect": {
      "type": "START_COMBAT",
      "strength": 1,
      "dexterity": 1
    }
  },
  {
    "id": "emerald_core",
    "name": "에메랄드 코어",
    "rarity": "rare",
    "category": "buff",
    "desc": "매 턴 시작 시 방어도를 5 얻습니다.",
    "effect": {
      "type": "START_TURN",
      "block": 5
    }
  },
  {
    "id": "phoenix_ash",
    "name": "불사조의 재",
    "rarity": "rare",
    "category": "buff",
    "desc": "전투 시작 시 근력을 3 얻고 매 턴 시작 시 재생 1을 얻습니다.",
    "effect": {
      "type": "START_COMBAT_AND_TURN",
      "strength": 3,
      "regen": 1
    }
  },
  {
    "id": "diamond_skin",
    "name": "다이아몬드 피부",
    "rarity": "rare",
    "category": "buff",
    "desc": "전투 시작 시 가시를 5, 민첩을 2 얻습니다.",
    "effect": {
      "type": "START_COMBAT",
      "thorns": 5,
      "dexterity": 2
    }
  },
  {
    "id": "god_blessing",
    "name": "신성한 축복",
    "rarity": "special",
    "category": "buff",
    "desc": "전투 시작 시 모든 버프(근력, 민첩, 가시, 재생, 통찰)를 1 얻습니다.",
    "effect": {
      "type": "START_COMBAT",
      "strength": 1,
      "dexterity": 1,
      "thorns": 1,
      "regen": 1,
      "insight": 1
    }
  },
  {
    "id": "demon_heart",
    "name": "악마의 심장",
    "rarity": "mythic",
    "category": "buff",
    "desc": "매 턴 시작 시 근력을 1 얻습니다.",
    "effect": {
      "type": "START_TURN_MYTHIC",
      "strength": 1
    }
  },
  {
    "id": "toxic_flask",
    "name": "독 플라스크",
    "rarity": "common",
    "category": "debuff",
    "desc": "전투 시작 시 적 전체에게 중독 2를 부여합니다.",
    "effect": {
      "type": "START_COMBAT",
      "enemyPoison": 2
    }
  },
  {
    "id": "burning_coal",
    "name": "불타는 숯덩이",
    "rarity": "common",
    "category": "debuff",
    "desc": "전투 시작 시 적 전체에게 화상 2를 부여합니다.",
    "effect": {
      "type": "START_COMBAT",
      "enemyBurn": 2
    }
  },
  {
    "id": "rusted_blade",
    "name": "녹슨 칼날",
    "rarity": "common",
    "category": "debuff",
    "desc": "전투 시작 시 적 전체에게 출혈 2를 부여합니다.",
    "effect": {
      "type": "START_COMBAT",
      "enemyBleed": 2
    }
  },
  {
    "id": "frozen_tears",
    "name": "얼어붙은 눈물",
    "rarity": "uncommon",
    "category": "debuff",
    "desc": "전투 시작 시 적 전체에게 동상 2를 부여합니다.",
    "effect": {
      "type": "START_COMBAT",
      "enemyFrost": 2
    }
  },
  {
    "id": "weakening_totem",
    "name": "약화의 토템",
    "rarity": "uncommon",
    "category": "debuff",
    "desc": "전투 시작 시 적 전체에게 약화 1을 부여합니다.",
    "effect": {
      "type": "START_COMBAT",
      "enemyWeak": 1
    }
  },
  {
    "id": "vulnerable_charm",
    "name": "취약의 부적",
    "rarity": "uncommon",
    "category": "debuff",
    "desc": "전투 시작 시 적 전체에게 취약 1을 부여합니다.",
    "effect": {
      "type": "START_COMBAT",
      "enemyVuln": 1
    }
  },
  {
    "id": "plague_mask",
    "name": "역병 의사의 마스크",
    "rarity": "rare",
    "category": "debuff",
    "desc": "매 턴 시작 시 적 전체에게 중독 2를 부여합니다.",
    "effect": {
      "type": "START_TURN_ADVANCED",
      "poison": 2
    }
  },
  {
    "id": "inferno_core",
    "name": "지옥불 코어",
    "rarity": "rare",
    "category": "debuff",
    "desc": "매 턴 시작 시 적 전체에게 화상 2를 부여합니다.",
    "effect": {
      "type": "START_TURN_ADVANCED",
      "burn": 2
    }
  },
  {
    "id": "silencing_bell",
    "name": "침묵의 종",
    "rarity": "special",
    "category": "debuff",
    "desc": "전투 시작 시 적 전체에게 침묵 1을 부여합니다.",
    "effect": {
      "type": "START_COMBAT",
      "enemySilence": 1
    }
  },
  {
    "id": "binding_chains",
    "name": "구속의 쇠사슬",
    "rarity": "mythic",
    "category": "debuff",
    "desc": "전투 시작 시 적 전체에게 속박 1, 약화 2, 취약 2를 부여합니다.",
    "effect": {
      "type": "START_COMBAT",
      "enemyBind": 1,
      "enemyWeak": 2,
      "enemyVuln": 2
    }
  },
  {
    "id": "merchant_scale",
    "name": "상인의 저울",
    "rarity": "common",
    "category": "utility",
    "desc": "전투 승리 시 크레딧을 8 더 얻습니다.",
    "effect": {
      "type": "END_COMBAT_CREDITS",
      "bonus": 8
    }
  },
  {
    "id": "healing_herb",
    "name": "치유의 약초",
    "rarity": "common",
    "category": "utility",
    "desc": "전투 승리 시 체력을 4 회복합니다.",
    "effect": {
      "type": "END_COMBAT_HEAL",
      "heal": 4
    }
  },
  {
    "id": "mana_crystal",
    "name": "마나 수정",
    "rarity": "uncommon",
    "category": "utility",
    "desc": "매 턴 시작 시 마나를 1 얻습니다.",
    "effect": {
      "type": "START_TURN",
      "mana": 1
    }
  },
  {
    "id": "magic_mirror",
    "name": "마법 거울",
    "rarity": "uncommon",
    "category": "utility",
    "desc": "매 턴 시작 시 카드를 1장 더 뽑습니다.",
    "effect": {
      "type": "START_TURN",
      "draw": 1
    }
  },
  {
    "id": "bounty_hunter_mark",
    "name": "현상금 사냥꾼의 징표",
    "rarity": "uncommon",
    "category": "utility",
    "desc": "엘리트 처치 시 크레딧 30 획득 (구현 예정).",
    "effect": {
      "type": "NONE"
    }
  },
  {
    "id": "crystal_ball",
    "name": "수정구슬",
    "rarity": "rare",
    "category": "utility",
    "desc": "매 턴 시작 시 마나 1, 통찰 1 얻음.",
    "effect": {
      "type": "START_TURN",
      "mana": 1,
      "insight": 1
    }
  },
  {
    "id": "blood_chalice",
    "name": "피의 성배",
    "rarity": "rare",
    "category": "utility",
    "desc": "전투 승리 시 최대 체력의 10%만큼 회복합니다.",
    "effect": {
      "type": "END_COMBAT_HEAL_PERCENT",
      "percent": 10
    }
  },
  {
    "id": "ancient_tome",
    "name": "고대의 고서",
    "rarity": "rare",
    "category": "utility",
    "desc": "매 턴 시작 시 드로우 2.",
    "effect": {
      "type": "START_TURN",
      "draw": 2
    }
  },
  {
    "id": "philosopher_stone_refined",
    "name": "정제된 현자의 돌",
    "rarity": "special",
    "category": "utility",
    "desc": "매 턴 시작 시 마나 2 얻음.",
    "effect": {
      "type": "START_TURN",
      "mana": 2
    }
  },
  {
    "id": "omniscient_eye",
    "name": "전지전능의 눈",
    "rarity": "mythic",
    "category": "utility",
    "desc": "매 턴 시작 시 마나 2, 드로우 2 얻음.",
    "effect": {
      "type": "START_TURN_MYTHIC",
      "mana": 2,
      "draw": 2
    }
  }
];
