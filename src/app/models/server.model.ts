export interface Server {
  prefix: string;
  description: string;
  playerAmount: number;
  maxPlayers: number;
  inSpectator: number;
  inQue: number;
  serverInfo: string;
  url: string;
  mode: string;
  currentMap: string;
  country: string;
  region: string;
  platform: string;
  serverId: string;
  isCustom: boolean;
  smallMode: string;
  serverLink: string;
  official: boolean;
  battlelogId: string;
  gameId: string;
}
