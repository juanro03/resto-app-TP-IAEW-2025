import pino from "pino";

export const logger = pino({
  level: "info",
  formatters: {
    level(label, number) {
      return { level: label };
    }
  },
  base: null,
});
