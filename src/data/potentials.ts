import type { GrowthAttribute, PotentialNode, PotentialProfile } from "../types";
import { characters } from "./characters";

const gachaCharacterUrl = (name: string) =>
  `https://www.gacha.gg/chaos-zero-nightmare/characters/${name}`;

function units(amount: number) {
  return { id: "credits", name: "Units", amount };
}

function growthStone(
  attribute: GrowthAttribute,
  tier: "Common" | "Great" | "Premium",
  amount: number,
) {
  const attributeId = attribute.toLowerCase();
  const tierId = tier.toLowerCase();
  return {
    id: `growth-${tierId}-${attributeId}`,
    name: `${tier} Growth Stone of ${attribute === "Void" ? "the Void" : attribute}`,
    amount,
  };
}

function item(id: string, name: string, amount: number) {
  return { id, name, amount };
}

function makeNodes(
  attribute: GrowthAttribute,
  statNodeNames: [string, string],
  branchNodeName: string,
  verifiedRanks: {
    criticalChanceRankOne?: boolean;
    criticalDamageRankOne?: boolean;
    basicCardProficiency?: boolean;
    cardEpiphany?: boolean;
    uniqueStatUpgrade?: boolean;
  } = {},
): PotentialNode[] {
  return [
    {
      id: "first-epiphany",
      name: "Epiphany Bonus",
      mapPosition: { x: 9, y: 80 },
      costs: [units(10_000), growthStone(attribute, "Common", 8)],
    },
    {
      id: "basic-cards",
      name: "Basic Card Upgrade",
      mapPosition: { x: 28, y: 80 },
      rankCap: 10,
      knownRankCosts: [
        [units(3_000), growthStone(attribute, "Common", 4)],
        [units(3_000), growthStone(attribute, "Common", 4)],
        [units(3_000), growthStone(attribute, "Common", 6)],
        [units(3_000), growthStone(attribute, "Great", 3)],
        [units(3_000), growthStone(attribute, "Great", 3)],
        [units(12_000), growthStone(attribute, "Great", 3)],
        [units(12_000), growthStone(attribute, "Great", 3)],
        [units(12_000), growthStone(attribute, "Great", 4)],
        [units(12_000), growthStone(attribute, "Great", 4)],
        [units(12_000), growthStone(attribute, "Great", 4)],
      ],
      rankCostsComplete: Array(10).fill(true),
      costs: [
        units(75_000),
        growthStone(attribute, "Common", 14),
        growthStone(attribute, "Great", 24),
      ],
    },
    {
      id: "common-cards",
      name: "Common Card Upgrade",
      mapPosition: { x: 17, y: 56 },
      rankCap: 10,
      knownRankCosts: [
        [units(16_000), growthStone(attribute, "Great", 5)],
        [units(16_000), growthStone(attribute, "Great", 5)],
        [growthStone(attribute, "Great", 6)],
        [growthStone(attribute, "Great", 6)],
        [growthStone(attribute, "Great", 6)],
        [growthStone(attribute, "Premium", 5)],
        [
          growthStone(attribute, "Premium", 5),
          item("eye-of-wailing-prodigal", "Eye of Wailing Prodigal (Wailing Prodigal)", 1),
        ],
        [
          growthStone(attribute, "Premium", 6),
          item("eye-of-wailing-prodigal", "Eye of Wailing Prodigal (Wailing Prodigal)", 1),
        ],
        [
          growthStone(attribute, "Premium", 8),
          item("eye-of-wailing-prodigal", "Eye of Wailing Prodigal (Wailing Prodigal)", 2),
        ],
        [],
      ],
      rankCostsComplete: [true, true, false, false, false, false, false, false, false, true],
      costs: [
        units(224_000),
        growthStone(attribute, "Great", 33),
        growthStone(attribute, "Premium", 24),
        item("eye-of-wailing-prodigal", "Eye of Wailing Prodigal (Wailing Prodigal)", 4),
      ],
    },
    {
      id: "potential-3-1",
      name: branchNodeName,
      mapPosition: { x: 42, y: 56 },
      costs: [units(24_000), growthStone(attribute, "Great", 16)],
      pathType: "branch",
    },
    {
      id: "signature-cards",
      name: "Signature Card Upgrade",
      mapPosition: { x: 37, y: 31 },
      rankCap: 10,
      knownRankCosts: [
        [units(20_000), growthStone(attribute, "Great", 8)],
        [growthStone(attribute, "Great", 10)],
        [growthStone(attribute, "Great", 12)],
        [growthStone(attribute, "Great", 14)],
        [growthStone(attribute, "Premium", 8)],
        [growthStone(attribute, "Premium", 8)],
        [
          growthStone(attribute, "Premium", 10),
          item("eye-of-wailing-prodigal", "Eye of Wailing Prodigal (Wailing Prodigal)", 1),
        ],
        [
          units(32_000),
          growthStone(attribute, "Premium", 10),
          item("eye-of-wailing-prodigal", "Eye of Wailing Prodigal (Wailing Prodigal)", 1),
        ],
        [
          units(32_000),
          growthStone(attribute, "Premium", 12),
          item("eye-of-wailing-prodigal", "Eye of Wailing Prodigal (Wailing Prodigal)", 2),
        ],
      ],
      rankCostsComplete: [true, false, false, false, false, false, false, true, true],
      costs: [
        units(248_000),
        growthStone(attribute, "Great", 52),
        growthStone(attribute, "Premium", 48),
        item("eye-of-wailing-prodigal", "Eye of Wailing Prodigal (Wailing Prodigal)", 4),
      ],
      pathType: "main",
    },
    {
      id: "potential-5-0",
      name: statNodeNames[0],
      mapPosition: { x: 59, y: 31 },
      rankCap: 5,
      ...(verifiedRanks.criticalChanceRankOne && {
        rankCap: 5,
        knownRankCosts: [
          [units(28_000), growthStone(attribute, "Premium", 16)],
          [units(28_000), growthStone(attribute, "Premium", 16)],
          [units(38_000), growthStone(attribute, "Premium", 16)],
          [
            units(38_000),
            growthStone(attribute, "Premium", 18),
            item("shards-of-condemnation", "Shards of Condemnation (Judas)", 1),
          ],
          [
            units(38_000),
            growthStone(attribute, "Premium", 18),
            item("shards-of-condemnation", "Shards of Condemnation (Judas)", 1),
            item("undetermined-ego-crystal", "Undetermined Ego Crystal", 1),
          ],
        ],
        rankCostsComplete: [true, true, true, true, true],
      }),
      costs: [
        units(170_000),
        growthStone(attribute, "Premium", 84),
        item("shards-of-condemnation", "Shards of Condemnation (Judas)", 2),
        item("undetermined-ego-crystal", "Undetermined Ego Crystal", 1),
      ],
    },
    {
      id: "potential-5-1",
      name: verifiedRanks.basicCardProficiency
        ? "Basic Card Proficiency"
        : "Potential 5-1: Epiphany",
      mapPosition: { x: 46, y: 10 },
      rankCap: 5,
      ...(verifiedRanks.basicCardProficiency && {
        rankCap: 5,
        pathType: "branch" as const,
        knownRankCosts: [[
          units(60_000),
          growthStone(attribute, "Premium", 26),
          item("shards-of-condemnation", "Shards of Condemnation (Judas)", 2),
        ]],
        rankCostsComplete: [true],
      }),
      costs: [
        units(60_000),
        growthStone(attribute, "Premium", 26),
        item("shards-of-condemnation", "Shards of Condemnation (Judas)", 2),
      ],
    },
    {
      id: "divine-epiphany",
      name: verifiedRanks.cardEpiphany ? "Card Epiphany" : "Divine Epiphany",
      mapPosition: { x: 17, y: 10 },
      ...(verifiedRanks.cardEpiphany && { pathType: "branch" as const }),
      costs: [
        units(75_000),
        growthStone(attribute, "Premium", 30),
        item("eye-of-wailing-prodigal", "Eye of Wailing Prodigal (Wailing Prodigal)", 4),
        item("shards-of-condemnation", "Shards of Condemnation (Judas)", 2),
      ],
    },
    {
      id: "potential-6-0",
      name: verifiedRanks.criticalDamageRankOne
        ? "Critical Damage Proficiency"
        : statNodeNames[1],
      mapPosition: { x: 80, y: 31 },
      rankCap: 5,
      ...(verifiedRanks.criticalDamageRankOne && {
        rankCap: 5,
        knownRankCosts: [
          [units(42_000), growthStone(attribute, "Premium", 20)],
          [units(42_000), growthStone(attribute, "Premium", 20)],
          [units(42_000), growthStone(attribute, "Premium", 24)],
          [
            units(42_000),
            growthStone(attribute, "Premium", 24),
            item("shards-of-condemnation", "Shards of Condemnation (Judas)", 1),
          ],
          [
            units(42_000),
            growthStone(attribute, "Premium", 28),
            item("shards-of-condemnation", "Shards of Condemnation (Judas)", 1),
            item("undetermined-ego-crystal", "Undetermined Ego Crystal", 1),
          ],
        ],
        rankCostsComplete: [true, true, true, true, true],
      }),
      costs: [
        units(210_000),
        growthStone(attribute, "Premium", 116),
        item("shards-of-condemnation", "Shards of Condemnation (Judas)", 2),
        item("undetermined-ego-crystal", "Undetermined Ego Crystal", 1),
      ],
    },
    {
      id: "unique",
      name: verifiedRanks.uniqueStatUpgrade ? "Unique Stat Upgrade" : "Unique",
      mapPosition: { x: 91, y: 10 },
      ...(verifiedRanks.uniqueStatUpgrade && { pathType: "main" as const }),
      costs: [
        units(80_000),
        growthStone(attribute, "Premium", 36),
        item("shards-of-condemnation", "Shards of Condemnation (Judas)", 2),
      ],
    },
  ];
}

const characterSpecificProfiles: Record<string, PotentialProfile> = {
  mika: {
    characterId: "mika",
    attribute: "Justice",
    sourceUrl: gachaCharacterUrl("mika"),
    connections: [
      ["first-epiphany", "basic-cards"],
      ["basic-cards", "common-cards"],
      ["common-cards", "potential-3-1"],
      ["common-cards", "signature-cards"],
      ["signature-cards", "potential-5-0"],
      ["potential-5-0", "potential-5-1"],
      ["potential-5-1", "divine-epiphany"],
      ["potential-5-0", "potential-6-0"],
      ["potential-6-0", "unique"],
    ],
    nodes: makeNodes("Justice", ["Potential 5-0", "Potential 6-0"], "Epiphany"),
  },
  renoa: {
    characterId: "renoa",
    attribute: "Void",
    sourceUrl: gachaCharacterUrl("renoa"),
    connections: [
      ["first-epiphany", "basic-cards"],
      ["basic-cards", "common-cards"],
      ["common-cards", "potential-3-1"],
      ["common-cards", "signature-cards"],
      ["signature-cards", "potential-5-0"],
      ["potential-5-0", "potential-5-1"],
      ["potential-5-1", "divine-epiphany"],
      ["potential-5-0", "potential-6-0"],
      ["potential-6-0", "unique"],
    ],
    nodes: makeNodes(
      "Void",
      ["Critical Chance Proficiency", "Critical Damage"],
      "Signature Card Proficiency",
      {
        criticalChanceRankOne: true,
        criticalDamageRankOne: true,
        basicCardProficiency: true,
        cardEpiphany: true,
        uniqueStatUpgrade: true,
      },
    ),
  },
};

const standardConnections: [string, string][] = [
  ["first-epiphany", "basic-cards"],
  ["basic-cards", "common-cards"],
  ["common-cards", "potential-3-1"],
  ["common-cards", "signature-cards"],
  ["signature-cards", "potential-5-0"],
  ["potential-5-0", "potential-5-1"],
  ["potential-5-1", "divine-epiphany"],
  ["potential-5-0", "potential-6-0"],
  ["potential-6-0", "unique"],
];

function createStandardProfile(
  characterId: string,
  attribute: GrowthAttribute,
): PotentialProfile {
  return {
    characterId,
    attribute,
    sourceUrl: gachaCharacterUrl(characterId),
    connections: standardConnections,
    nodes: makeNodes(
      attribute,
      ["Potential 5-0", "Potential 6-0"],
      "Potential 3-1",
    ),
  };
}

const standardProfiles = Object.fromEntries(
  characters
    .filter((character) => character.attribute)
    .map((character) => [
      character.id,
      createStandardProfile(character.id, character.attribute!),
    ]),
);

// Shared node costs and topology are prefilled; Renoa and Mika retain their tailored data.
export const potentialProfiles: Record<string, PotentialProfile> = {
  ...standardProfiles,
  ...characterSpecificProfiles,
};
