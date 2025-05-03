import { AndOr, Filters } from "../models/filter.model";

export const maps = {
  Vanilla: [
    "Siege of Shanghai",
    "Paracel Storm",
    "Flood Zone",
    "Zavod 311",
    "Lancang Dam",
    "Hainan Resort",
    "Dawnbreaker",
    "Rogue Transmission",
    "Golmud Railway",
    "Operation Locker",
  ],
  "China Rising": ["Silk Road", "Altai Range", "Guilin Peaks", "Dragon Pass"],
  "Second Assault": [
    "Operation Metro 2014",
    "Caspian Border 2014",
    "Gulf of Oman 2014",
    "Operation Firestorm 2014",
  ],
  "Naval Strike": [
    "Lost Islands",
    "Nansha Strike",
    "Wave Breaker",
    "Operation Mortar",
  ],
  "Dragon's Teeth": [
    "Pearl Market",
    "Propaganda",
    "Sunken Dragon",
    "Lumphini Garden",
  ],
  "Final Stand": [
    "Hangar 21",
    "Operation Whiteout",
    "Giants of Karelia",
    "Hammerhead",
  ],
  "Night Operations": ["Zavod: Graveyard Shift"],
  "Community Operations": ["Operation Outbreak"],
  "Legacy Operations": ["Dragon Valley 2015"],
};

export const modes = [
  "Conquest",
  "Conquest Large",
  "Conquest Small",
  "Team Deathmatch",
  "Domination",
  "Obliteration",
  "Defuse",
  "Rush",
  "Squad Deathmatch",
  "Chain Link",
  "Carrier Assault",
  "Air Superiority",
  "Gun Master",
  "Capture the Flag",
];

export const regions = [
  { value: "eu", name: "Europe" },
  { value: "asia", name: "Asia" },
  { value: "nam", name: "North America" },
  { value: "sam", name: "South America" },
  { value: "au", name: "Australia" },
  { value: "oc", name: "Oceania" },
];

export const platforms = [
  { value: "pc", name: "PC" },
  { value: "xboxone", name: "Xbox One" },
  { value: "ps4 ", name: "PS4" },
];

export const presets = ["Normal/Custom", "Hardcore"];

export const defaultFilters: Filters = {
  regions: ["sam"],
  platforms: ["pc"],
  maps: [],
  modes: [],
  presets: ["Normal/Custom"],
  minPlayers: 30,
  enabled: true,
  andOr: [AndOr.AND],
};
