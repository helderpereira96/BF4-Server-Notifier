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
import { AndOr, Filters } from "../../models/filter.model";
import { FilterService } from "../../services/filter.service";
import { ApiService } from "../../services/api.service";
import { NotificationService } from "../../services/notification.service";
import * as bootstrap from "bootstrap";

enum StatusSearch {
  Disabled,
  NoRegios,
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
  showPopup = false;

  AndOr = AndOr;
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
  andOr = [AndOr.AND];
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
    if (this.currentFilters.regions.length == 0) {
      return StatusSearch.NoRegios;
    } else {
      this.clickCountdown = 30;
      this.reloadCountdown = 600;
      return StatusSearch.Available;
    }
  });

  currentFilters: Filters = { ...defaultFilters };

  tickTimers() {
    setInterval(() => {
      if (this.clickCountdown > 0) this.clickCountdown--;
      if (this.reloadCountdown > 0) this.reloadCountdown--;
      if (this.reloadCountdown === 0) window.location.reload();
      if (this.clickCountdown === 0) {
        this.clickCountdown = 30;
        this.loadServers();
      }
    }, 1000);
  }

  ngAfterViewInit() {
    const tooltipTriggerList = [].slice.call(
      document.querySelectorAll('[data-bs-toggle="tooltip"]')
    );
    tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    const popoverTriggerList = [].slice.call(
      document.querySelectorAll('[data-bs-toggle="popover"]')
    );
    popoverTriggerList.map(function (popoverTriggerEl) {
      return new bootstrap.Popover(popoverTriggerEl);
    });
  }

  ngOnInit() {
    this.notificationService.requestPermission();
    this.loadFilters();
    if (this.statusSearch() !== StatusSearch.Available) return;
    this.loadServers();
    this.tickTimers();
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

  toggleAndOr(andOr: AndOr) {
    this.currentFilters.andOr = [andOr];
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
      andOr: [AndOr.AND],
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
    this.andOr = this.currentFilters.andOr;
  }

  loadServers(): void {
    this.apiService.getServers(this.currentFilters).subscribe((servers) => {
      this.checkMatchesFallback(servers);
    });
  }

  private async checkMatchesFallback(servers: Server[]): Promise<void> {
    for (const server of servers) {
      const isMatch = await this.checkServerMatch(server, this.currentFilters);
      if (isMatch) this.serversFound.push(server);
    }
    if (this.serversFound.length > 0) {
      this.notificationService.notifyMatch(this.serversFound[0]);
      this.clickCountdown = -1;
    }
  }

  private async checkServerMatch(
    server: Server,
    filters: Filters
  ): Promise<boolean> {
    const isMapMatch =
      !filters.maps.length ||
      filters.maps
        .map((map) => map.toLowerCase().trim())
        .includes(server.currentMap.toLowerCase().trim());

    const isModeMatch =
      !filters.modes.length ||
      filters.modes
        .map((map) => map.toLowerCase().trim())
        .includes(server.mode.toLowerCase().trim());

    const isPlayerCountOk = server.playerAmount >= filters.minPlayers;

    if (!isPlayerCountOk) return false;

    const modeMapMatch = filters.andOr.includes(AndOr.AND)
      ? isMapMatch && isModeMatch
      : isMapMatch || isModeMatch;

    if (!modeMapMatch) return false;

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
