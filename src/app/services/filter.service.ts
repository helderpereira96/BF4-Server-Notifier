import { Injectable } from "@angular/core";
import { Filters } from "../models/filter.model";
import { defaultFilters } from "../constants/game-data";

@Injectable({ providedIn: "root" })
export class FilterService {
  private readonly STORAGE_KEY = "bf4_filters";

  getFilters(): Filters {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    return saved ? JSON.parse(saved) : defaultFilters;
  }

  saveFilters(filters: Filters): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filters));
  }

  resetFilters(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
