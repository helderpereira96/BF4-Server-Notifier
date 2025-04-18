import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Server } from "../models/server.model";
import { Filters } from "../models/filter.model";
import { catchError, map, Observable, of } from "rxjs";

interface ServerDetails {
  settings: {
    all: {
      vffi: string;
      vhud: string;
      vkca: string;
    };
  };
}

@Injectable({ providedIn: "root" })
export class ApiService {
  private readonly API_URL = "https://api.gametools.network/bf4";

  httpCliente = inject(HttpClient);

  getServers(filters: Filters): Observable<Server[]> {
    const params = {
      name: " ",
      platform: (filters.platforms[0] || "pc").trim(),
      limit: "100",
      region: filters.regions.join("%2C"),
    };

    return this.httpCliente
      .get<{ servers: Server[] }>(`${this.API_URL}/servers/`, { params })
      .pipe(
        map((response) => response.servers),
        catchError((error) => {
          console.error("API Error:", error);
          return of([]);
        })
      );
  }

  getServerDetails(
    gameId: string,
    platform: string
  ): Observable<ServerDetails> {
    const params = {
      gameId: gameId,
      platform: platform,
    };

    return this.httpCliente.get<ServerDetails>(
      `${this.API_URL}/detailedserver/`,
      {
        params,
      }
    );
  }
}
