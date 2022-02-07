export class Setting<T> {
  text: string;
  onSelect?: () => void;
  options?: { text: string; value: T }[];
  value?: T;

  constructor(
    text: string,
    onSelect?: () => void,
    options?: { text: string; value: T }[],
    value?: T
  ) {
    this.text = text;
    this.onSelect = onSelect;
    this.options = options;
    this.value = value;
  }
}
