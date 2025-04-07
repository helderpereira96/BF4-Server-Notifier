document.addEventListener("DOMContentLoaded", () => {
  const saveBtn = document.getElementById("save");

  chrome.storage.sync.get(["maps", "modes", "presets", "minPlayers"], (res) => {
    const selectedMaps = res.maps || [];
    const selectedModes = res.modes || [];
    const selectedPresets = res.presets || [];

    document.querySelectorAll("input[name='maps']").forEach((cb) => {
      cb.checked = selectedMaps.includes(cb.value);
    });

    document.querySelectorAll("input[name='modes']").forEach((cb) => {
      cb.checked = selectedModes.includes(cb.value);
    });

    document.querySelectorAll("input[name='presets']").forEach((cb) => {
      cb.checked = selectedPresets.includes(cb.value);
    });

    if (res.minPlayers) {
      document.getElementById("minPlayers").value = res.minPlayers.toString();
    }
  });

  saveBtn.addEventListener("click", () => {
    const maps = Array.from(
      document.querySelectorAll("input[name='maps']:checked")
    ).map((cb) => cb.value);
    const modes = Array.from(
      document.querySelectorAll("input[name='modes']:checked")
    ).map((cb) => cb.value);
    const presets = Array.from(
      document.querySelectorAll("input[name='presets']:checked")
    ).map((cb) => cb.value);
    const minPlayers = parseInt(
      document.getElementById("minPlayers").value,
      10
    );

    chrome.storage.sync.set({ maps, modes, presets, minPlayers }, () => {
      showToast("Settings saved successfully!");
    });
  });
});
