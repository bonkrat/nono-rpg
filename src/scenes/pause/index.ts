import { scale } from "../battle/constants";
import { Setting } from "./Setting";

const fullscreen = new Setting<boolean>(
  "Test Setting",
  () => {},
  [
    { text: "on", value: true },
    { text: "off", value: false },
  ],
  false
);

export class Pause extends Phaser.Scene {
  settings: Setting<any>[] = [fullscreen];
  selectedSetting: Setting<any> = this.settings[0];
  selectedTween!: Phaser.Tweens.Tween;
  settingState: { [k: string]: any } = {};

  constructor() {
    super("Pause");
  }

  async create() {
    await this.add.textsprite("Paused", scale);

    this.settings.forEach(async (setting: Setting<any>) => {
      const settingText = await this.add.textsprite(setting.text, scale / 2);
      this.settingState[setting.text] = setting.value;

      const text = setting.options?.find(
        (o) => o.value === setting.value
      )?.text;

      let settingValueText;
      if (text) {
        settingValueText = this.add.textsprite(text, scale / 2);
      }

      if (setting === this.selectedSetting) {
        this.selectedTween = this.tweens.add({
          targets: [settingText, settingValueText],
          y: -20,
          ease: "Bounce.easeInOut",
          duration: 500,
          yoyo: true,
          repeat: -1,
        });
      }
    });
  }
}
