chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "checkAndNotify") {
    const { map, mode, preset, players } = message;

    chrome.notifications.create({
      type: "basic",
      iconUrl: "src/media/icon.png",
      title: "🔔 Server found!",
      message: `Map: ${map}\nMode: ${mode}\nPreset: ${preset}\nPlayers: ${players}`,
      priority: 2,
    });
  }
});
