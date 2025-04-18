import { Injectable } from "@angular/core";
import { Server } from "../models/server.model";

@Injectable({ providedIn: "root" })
export class NotificationService {
  requestPermission() {
    if ("Notification" in window) {
      Notification.requestPermission().then((permission) => {
        console.log("Permission:", permission);
      });
    }
  }

  notifyMatch(server: Server): void {
    if (Notification.permission !== "granted") return;

    const notification = new Notification("🔥 BF4 Match Found!", {
      body: `Map: ${server.currentMap}\nMode: ${server.mode}\nPlayers: ${server.playerAmount}`,
      icon: "https://battlelog.battlefield.com/favicon.ico",
    });

    notification.onclick = () => {
      window.open(`${server.serverLink}?BF4-Notifier`, "_blank");
    };
  }
}
