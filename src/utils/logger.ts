const padding = 3;

const printTimestamp = (timestamp: boolean) =>
  timestamp ? "%c [" + Date.now().valueOf() + "]".padEnd(padding) : "";

export function debug(config: {
  name: string;
  action: string;
  message: string;
  timestamp?: boolean;
  data: any;
}) {
  const { name, action, message, timestamp, data } = config,
    debug = new URLSearchParams(window.location.search).get("debug"),
    logMessage = [
      "%c [" +
        name +
        "]".padEnd(padding) +
        "%c[" +
        action +
        "]".padEnd(padding) +
        printTimestamp(timestamp || false) +
        "%c" +
        message,
      "color: yellow; font-weight: bold;",
      "color: green",
      "color: pink",
      "color: inherit;",
    ];

  if (debug === "*" || debug === name) {
    if (data) {
      console.debug(...logMessage, data);
    } else {
      console.debug(...logMessage);
    }
  }
}
