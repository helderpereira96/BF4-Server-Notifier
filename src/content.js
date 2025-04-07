pageLoad();

async function pageLoad() {
  const { enabled } = await chrome.storage.sync.get(["enabled"]);
  if (enabled === false) {
    return;
  }

  const found = await scanServers();
  if (found) return;

  setTimeout(() => {
    window.location.reload();
  }, 60000);
}

async function scanServers() {
  const serverList = document.getElementsByClassName("server-row");

  for (const server of serverList) {
    const match = await processServer(server);
    if (match) {
      return true;
    }
  }

  return false;
}

async function processServer(serverRow) {
  const map =
    serverRow
      .getElementsByClassName("map")[1]
      ?.innerHTML.trim()
      .toLowerCase() || "";
  const mode =
    serverRow
      .getElementsByClassName("mode")[0]
      ?.innerHTML.trim()
      .toLowerCase() || "";
  const preset =
    serverRow
      .getElementsByClassName("preset")[0]
      ?.innerHTML.trim()
      .toLowerCase() || "";
  const players = parseInt(
    serverRow.getElementsByClassName("occupied")[0]?.innerHTML || "0"
  );

  return new Promise((resolve) => {
    chrome.storage.sync.get(
      ["maps", "modes", "presets", "minPlayers"],
      (config) => {
        const selectedMaps = (config.maps || []).map((m) =>
          m.trim().toLowerCase()
        );
        const selectedModes = (config.modes || []).map((m) =>
          m.trim().toLowerCase()
        );
        const selectedPresets = (config.presets || []).map((p) =>
          p.trim().toLowerCase()
        );
        const minPlayers = config.minPlayers || 30;

        const isMapMatch = selectedMaps.includes(map);
        const isModeMatch =
          selectedModes.length === 0 || selectedModes.includes(mode);
        const isPresetMatch =
          selectedPresets.length === 0 || selectedPresets.includes(preset);
        const isPlayerCountOk = players >= minPlayers;

        const matched =
          isMapMatch && isModeMatch && isPresetMatch && isPlayerCountOk;

        if (matched) {
          serverRow.classList.add("highlight-match");
          serverRow.scrollIntoView({ behavior: "smooth", block: "center" });

          chrome.runtime.sendMessage({
            type: "checkAndNotify",
            map,
            mode,
            preset,
            players,
          });

          resolve(true);
        } else {
          resolve(false);
        }
      }
    );
  });
}

const style = document.createElement("style");
style.textContent = `
.server-row.highlight-match {
  outline: 3px solid #00ffcc !important;
  background-color: rgba(0, 255, 204, 0.1) !important;
  scroll-margin-top: 100px;
}
`;
document.head.appendChild(style);
