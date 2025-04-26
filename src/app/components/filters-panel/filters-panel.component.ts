import { Component, computed, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import {
  maps,
  modes,
  regions,
  platforms,
  presets,
  defaultFilters,
} from "../../constants/game-data";
import { firstValueFrom } from "rxjs";
import { Server } from "../../models/server.model";
import { Filters } from "../../models/filter.model";
import { FilterService } from "../../services/filter.service";
import { ApiService } from "../../services/api.service";
import { NotificationService } from "../../services/notification.service";

enum StatusSearch {
  Disabled,
  NoMapsModes,
  Available,
  NotificationsDisabled,
}

@Component({
  standalone: true,
  selector: "app-filters-panel",
  templateUrl: "./filters-panel.component.html",
  styleUrls: ["./filters-panel.component.css"],
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
})
export class FiltersPanelComponent implements OnInit {
  filterService = inject(FilterService);
  apiService = inject(ApiService);
  notificationService = inject(NotificationService);

  StatusSearch = StatusSearch;
  showToast = false;
  toastMessage = "";
  toastType = "success";

  servers: Server[] = [];

  // Dados
  mapGroups = maps;
  modes = modes;
  regions = regions;
  platforms = platforms;
  presets = presets;

  // Estado
  isBodyVisible = true;
  isInfoVisible = false;
  isEnabled = true;
  clickCountdown = -1;
  reloadCountdown = -1;

  serversFound: Server[] = [];

  statusSearch = computed(() => {
    if (Notification.permission !== "granted")
      return StatusSearch.NotificationsDisabled;
    if (!this.currentFilters.enabled) return StatusSearch.Disabled;
    if (
      this.currentFilters.maps.length == 0 &&
      this.currentFilters.modes.length == 0
    )
      return StatusSearch.NoMapsModes;
    else {
      this.clickCountdown = 30;
      this.reloadCountdown = 600;
      return StatusSearch.Available;
    }
  });

  currentFilters: Filters = { ...defaultFilters };
  readonly searchWorker: Worker | null = null;
  readonly timerWorker: Worker;

  constructor() {
    this.timerWorker = new Worker(
      new URL("../../workers/timer.worker", import.meta.url),
      { type: "module" }
    );

    this.timerWorker.onmessage = ({ data }) => {
      if (data.type === "worker_ready") {
        this.timerWorker.postMessage({ command: "start" });
      }

      if (data.type === "tick") {
        this.tickTimers();
      }
    };

    this.timerWorker.onerror = (error) => {
      console.error("[Main] Worker error:", error);
    };

    if (typeof Worker !== "undefined") {
      this.searchWorker = new Worker(
        new URL("../../workers/server-checker.worker", import.meta.url),
        { type: "module" }
      );

      this.searchWorker.onmessage = ({ data }) => {
        if (data.length > 0) {
          this.serversFound = data;
          this.notificationService.notifyMatch(data[0]);
          this.clickCountdown = -1;
        }
      };
    }
  }

  tickTimers() {
    if (this.clickCountdown > 0) this.clickCountdown--;
    if (this.reloadCountdown > 0) this.reloadCountdown--;
    if (this.reloadCountdown === 0) window.location.reload();
    if (this.clickCountdown === 0) {
      this.clickCountdown = 30;
      this.loadServers();
    }
  }

  ngOnInit() {
    this.notificationService.requestPermission();
    this.loadFilters();
    if (this.statusSearch() !== StatusSearch.Available) return;
    this.loadServers();
  }

  toggleBody() {
    this.isBodyVisible = !this.isBodyVisible;
  }

  showInfo() {
    this.isInfoVisible = true;
  }

  hideInfo() {
    this.isInfoVisible = false;
  }

  toggleRegion(value: string) {
    this.currentFilters.regions = [value];
  }

  togglePlatform(value: string) {
    this.currentFilters.platforms = [value];
  }

  toggleMap(value: string, isChecked: boolean | null) {
    if (isChecked) {
      this.currentFilters.maps.push(value);
    } else {
      this.currentFilters.maps = this.currentFilters.maps.filter(
        (r) => r !== value
      );
    }
  }

  toggleMode(value: string, isChecked: boolean | null) {
    if (isChecked) {
      this.currentFilters.modes.push(value);
    } else {
      this.currentFilters.modes = this.currentFilters.modes.filter(
        (r) => r !== value
      );
    }
  }

  togglePreset(value: string, isChecked: boolean | null) {
    if (isChecked) {
      this.currentFilters.presets.push(value);
    } else {
      this.currentFilters.presets = this.currentFilters.presets.filter(
        (r) => r !== value
      );
    }
  }

  toggleEnable(isChecked: boolean | null) {
    this.currentFilters.enabled = isChecked ?? false;
  }

  saveFilters() {
    this.filterService.saveFilters(this.currentFilters);

    this.showToast = true;
    this.toastMessage = "Configs saved, reloading...";
    this.toastType = "success";
    this.showToast = true;

    setTimeout(() => {
      this.showToast = false;
      window.location.reload();
    }, 2000);
  }

  clearFilters() {
    this.currentFilters = {
      regions: ["sam"],
      platforms: ["pc"],
      maps: [],
      modes: [],
      presets: ["Normal/Custom"],
      minPlayers: 30,
      enabled: true,
    };

    this.showToast = true;
    this.toastMessage = "Configs reseted!";
    this.toastType = "alert";
    this.showToast = true;

    setTimeout(() => {
      this.showToast = false;
    }, 2000);
  }

  loadFilters() {
    this.currentFilters = this.filterService.getFilters();
    this.isEnabled = this.currentFilters.enabled;
  }

  loadServers(): void {
    if (this.searchWorker) {
      this.searchWorker.postMessage({
        filters: this.currentFilters,
      });
    } else {
      this.apiService.getServers(this.currentFilters).subscribe((servers) => {
        this.checkMatchesFallback(servers);
      });
    }
  }

  private async checkMatchesFallback(servers: Server[]): Promise<void> {
    for (const server of servers) {
      const isMatch = await this.checkServerMatch(server, this.currentFilters);
      if (isMatch) this.serversFound.push(server);
    }
    if (this.serversFound.length > 0) {
      this.notificationService.notifyMatch(this.serversFound[0]);
    }
  }

  private async checkServerMatch(
    server: Server,
    filters: Filters
  ): Promise<boolean> {
    const isMapMatch =
      filters.maps.length === 0 ||
      filters.maps
        .map((map) => map.toLowerCase().trim())
        .includes(server.currentMap.toLowerCase().trim());

    const isModeMatch =
      filters.modes.length === 0 ||
      filters.modes
        .map((map) => map.toLowerCase().trim())
        .includes(server.mode.toLowerCase().trim());

    const isPlayerCountOk = server.playerAmount >= filters.minPlayers;

    if (!isMapMatch || !isModeMatch || !isPlayerCountOk) {
      return false;
    }

    if (filters.presets?.length > 0) {
      const isPresetMatch = await this.checkPreset(
        server.gameId,
        server.platform,
        filters.presets
      );
      if (!isPresetMatch) return false;
    }

    return true;
  }

  private async checkPreset(
    gameId: string,
    platform: string,
    savedPresets: string[]
  ): Promise<boolean> {
    try {
      const serverDetails = await firstValueFrom(
        this.apiService.getServerDetails(gameId, platform)
      );

      if (!serverDetails) return false;

      const isHardcore =
        serverDetails.settings.all.vffi === "on" &&
        serverDetails.settings.all.vhud === "off";

      return savedPresets
        .map((data) => data.toLowerCase().trim())
        .includes("hardcore")
        ? isHardcore
        : !isHardcore;
    } catch (error) {
      console.error("Error checking preset:", error);
      return false;
    }
  }
}
