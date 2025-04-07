const maps = {
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

const modes = [
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

const presets = ["Normal", "Hardcore", "Infantry Only", "Custom"];

const mapContainer = document.getElementById("mapCheckboxes");
const modeContainer = document.getElementById("modeCheckboxes");
const presetsContainer = document.getElementById("presetCheckboxes");
const saveBtn = document.getElementById("saveBtn");
const clearBtn = document.getElementById("clearBtn");

function createCheckbox(name, value, checked = false) {
  const label = document.createElement("label");
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.name = name;
  checkbox.value = value;
  if (checked) checkbox.checked = true;
  label.appendChild(checkbox);
  label.append(" " + value);
  return label;
}

function populateCheckboxes() {
  for (const dlc in maps) {
    const groupLabel = document.createElement("h4");
    groupLabel.textContent = dlc;
    groupLabel.style.margin = "8px 0 4px";
    mapContainer.appendChild(groupLabel);

    maps[dlc].forEach((map) => {
      const checkbox = createCheckbox("maps", map);
      mapContainer.appendChild(checkbox);
    });
  }

  modes.forEach((mode) => {
    const checkbox = createCheckbox("modes", mode);
    modeContainer.appendChild(checkbox);
  });

  presets.forEach((preset) => {
    const checkbox = createCheckbox("presets", preset);
    presetsContainer.appendChild(checkbox);
  });
}

function loadPreferences() {
  chrome.storage.sync.get(
    ["maps", "modes", "presets", "minPlayers"],
    (data) => {
      const mapValues = data.maps || [];
      const modeValues = data.modes || [];
      const presetValues = data.presets || [];

      document.querySelectorAll("input[name='maps']").forEach((cb) => {
        cb.checked = mapValues.includes(cb.value);
      });

      document.querySelectorAll("input[name='modes']").forEach((cb) => {
        cb.checked = modeValues.includes(cb.value);
      });

      document.querySelectorAll("input[name='presets']").forEach((cb) => {
        cb.checked = presetValues.includes(cb.value);
      });

      const minPlayersInput = document.getElementById("minPlayers");
      if (data.minPlayers !== undefined) {
        minPlayersInput.value = data.minPlayers;
      }
    }
  );
}

saveBtn.addEventListener("click", () => {
  const selectedMaps = Array.from(
    document.querySelectorAll("input[name='maps']:checked")
  ).map((cb) => cb.value);
  const selectedModes = Array.from(
    document.querySelectorAll("input[name='modes']:checked")
  ).map((cb) => cb.value);
  const selectedPresets = Array.from(
    document.querySelectorAll("input[name='presets']:checked")
  ).map((cb) => cb.value);
  const minPlayersValue = parseInt(
    document.getElementById("minPlayers").value,
    10
  );

  chrome.storage.sync.set(
    {
      maps: selectedMaps,
      modes: selectedModes,
      presets: selectedPresets,
      minPlayers: isNaN(minPlayersValue) ? 0 : minPlayersValue,
    },
    () => {
      showToast("Preferences saved!");
      setTimeout(() => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          chrome.tabs.reload(tabs[0].id);
        });
      }, 1000);
    }
  );
});

clearBtn.addEventListener("click", () => {
  document.querySelectorAll("input[type='checkbox']").forEach((cb) => {
    cb.checked = false;
  });

  document.getElementById("minPlayers").value = 30;

  chrome.storage.sync.set({
    maps: [],
    modes: [],
    presets: [],
    minPlayers: 30,
  });

  showToast("Preferences cleared!");

  setTimeout(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.reload(tabs[0].id);
    });
  }, 1000);
});

let toastTimeout;

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.style.display = "block";
  toast.style.opacity = "1";

  if (toastTimeout) {
    clearTimeout(toastTimeout);
  }

  toastTimeout = setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => {
      toast.style.display = "none";
    }, 300);
  }, 3000);
}

const infoIcon = document.getElementById("infoIcon");
const toastInfo = document.getElementById("toastInfo");

function showInfo() {
  toastInfo.style.display = "block";
}

function hideInfo() {
  toastInfo.style.display = "none";
}

infoIcon.addEventListener("mouseenter", showInfo);
infoIcon.addEventListener("mouseleave", () => {
  setTimeout(() => {
    if (!toastInfo.matches(":hover") && !infoIcon.matches(":hover")) {
      hideInfo();
    }
  }, 100);
});

toastInfo.addEventListener("mouseleave", () => {
  setTimeout(() => {
    if (!toastInfo.matches(":hover") && !infoIcon.matches(":hover")) {
      hideInfo();
    }
  }, 100);
});

document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("enableToggle");

  chrome.storage.sync.get(["enabled"], (data) => {
    toggle.checked = data.enabled ?? true;
  });

  toggle.addEventListener("change", () => {
    chrome.storage.sync.set({ enabled: toggle.checked });
  });
});

populateCheckboxes();
loadPreferences();
