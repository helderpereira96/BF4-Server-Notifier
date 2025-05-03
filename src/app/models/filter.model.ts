export interface Filters {
  regions: string[];
  platforms: string[];
  maps: string[];
  modes: string[];
  presets: string[];
  minPlayers: number;
  enabled: boolean;
  andOr: AndOr[];
}

export enum AndOr {
  AND = "0",
  OR = "1",
}
