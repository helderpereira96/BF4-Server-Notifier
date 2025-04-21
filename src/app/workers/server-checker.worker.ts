/// <reference lib="webworker" />

import { Filters } from "../models/filter.model";
import { Server } from "../models/server.model";

async function checkPreset(
  gameId: string,
  platform: string,
  savedPresets: string[]
): Promise<boolean> {
  try {
    const response = await fetch(
      `https://api.gametools.network/bf4/detailedserver/?gameId=${gameId}&platform=${platform}`
    );

    if (!response.ok) throw new Error("API request failed");

    const serverDetails = await response.json();

    const isHardcore =
      serverDetails?.settings?.all?.vffi === "on" &&
      serverDetails?.settings?.all?.vhud === "off";

    return savedPresets.some((preset) => {
      const presetLower = preset.toLowerCase().trim();
      return presetLower === "hardcore" ? isHardcore : !isHardcore;
    });
  } catch (error) {
    console.error("Error checking preset in worker:", error);
    return false;
  }
}

async function fetchServers(filters: Filters): Promise<Server[]> {
  try {
    const platform = filters.platforms[0] || "pc";
    const region = filters.regions.join("%2C");

    const response = await fetch(
      `https://api.gametools.network/bf4/servers/?name=&platform=${platform}&limit=100&region=${region}`
    );

    if (!response.ok) throw new Error("API request failed");

    const data = await response.json();
    return data.servers || [];
  } catch (error) {
    console.error("Error fetching servers:", error);
    return [];
  }
}

addEventListener("message", async ({ data }) => {
  const { filters } = data;
  const servers = await fetchServers(filters);
  const matches: Server[] = [];

  for (const server of servers) {
    const isMapMatch =
      filters.maps.length === 0 ||
      filters.maps.some(
        (map: any) =>
          map.toLowerCase().trim() === server.currentMap.toLowerCase().trim()
      );

    const isModeMatch =
      filters.modes.length === 0 ||
      filters.modes.some(
        (mode: any) =>
          mode.toLowerCase().trim() === server.mode.toLowerCase().trim()
      );

    const isPlayerCountOk = server.playerAmount >= filters.minPlayers;

    if (!isMapMatch || !isModeMatch || !isPlayerCountOk) {
      continue;
    }

    if (filters.presets?.length > 0) {
      const isPresetMatch = await checkPreset(
        server.gameId,
        server.platform,
        filters.presets
      );
      if (!isPresetMatch) continue;
    }

    matches.push(server);
  }

  postMessage(matches);
});
