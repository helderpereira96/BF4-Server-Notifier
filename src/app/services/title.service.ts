import { inject, Injectable } from "@angular/core";
import { Title } from "@angular/platform-browser";

@Injectable({
  providedIn: "root",
})
export class TitleService {
  readonly title = inject(Title);
  private isAlerting = false;

  setTitle(newTitle: string): void {
    this.title.setTitle(newTitle);
  }

  startAlert(titleMessage: string): void {
    if (this.isAlerting) return;

    this.isAlerting = true;

    const icons = ["🟡", "🔴"];
    let i = 0;

    setInterval(() => {
      const icon = icons[i % icons.length];
      this.title.setTitle(`${icon} ${titleMessage} ${icon}`);
      i++;
    }, 1000);
  }

  getTitle(): string {
    return this.title.getTitle();
  }
}
