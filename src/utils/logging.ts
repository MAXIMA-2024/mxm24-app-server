import ENV from "@/utils/env";
import db from "@/services/db";

type LogLevel = "LOGS" | "INFO" | "WARN" | "DEBUG" | "ERROR";

/**
 * Prints log messages to the console based on the specified log level.
 *
 * @param level - The log level (INFO, WARN, DEBUG, ERROR).
 * @param message - The log message to be printed.
 * @param err - Optional error object to be printed along with the log message.
 */
const print = (level: LogLevel, message: string, err?: unknown) => {
  const now = new Date().toISOString();
  if (level === "INFO") {
    console.log(`${now} - [INFO]: ${message}`);
  }

  if (level === "WARN") {
    console.warn(`${now} - [WARN]: ${message}`);
  }

  if (level === "DEBUG") {
    console.debug(`${now} - [DEBUG]: ${message}`);
  }

  if (level === "ERROR") {
    console.error(`${now} - [ERROR]: ${message}`);
    if (err) console.error(err);
  }
};

/**
 * Logs a message with the specified log level.
 *
 * @param level - The log level.
 * @param message - The log message.
 * @param err - An optional error object.
 */
const logging = (level: LogLevel, message: string, err?: unknown) => {
  if (ENV.NODE_ENV === "development" && level === "DEBUG") {
    print(level, message, err);
    return;
  }

  if (level === "LOGS") {
    db.logs
      .create({
        data: {
          action: message,
        },
      })
      .catch((err) => {
        print("ERROR", "Failed to log to database", err);
      });
  }

  print(level, message, err);
};

export default logging;
