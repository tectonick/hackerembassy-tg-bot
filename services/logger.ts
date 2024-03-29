import "winston-daily-rotate-file";

import config from "config";
import { createLogger, format, transports } from "winston";

import { BotConfig } from "../config/schema";

const botConfig = config.get<BotConfig>("bot");

const logLevel = botConfig.debug ? "debug" : "info";

const rotatedFile = new transports.DailyRotateFile({
    level: logLevel,
    filename: `${botConfig.logfolderpath}/%DATE%.log`,
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "14d",
});

const logger = createLogger({
    level: logLevel,
    format: format.combine(
        format.timestamp({
            format: "YYYY-MM-DD HH:mm:ss",
        }),
        format.errors({ stack: true }),
        format.printf(info => `${info.timestamp}: [${info.level}]\t${info.stack ?? info.message}\n`)
    ),
    transports: [rotatedFile, new transports.Console()],
});

export default logger;
