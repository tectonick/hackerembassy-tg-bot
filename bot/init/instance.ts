import logger from "../../services/logger";
import HackerEmbassyBot from "../core/HackerEmbassyBot";
import { setMenu } from "./menu";
import { setAutomaticFeatures } from "./recurring-actions";
import { setRoutes } from "./routes";

async function init(bot: HackerEmbassyBot): Promise<void> {
    const botInstanceInfo = await bot.getMe();
    bot.Name = botInstanceInfo.username;
    setRoutes(bot);
    setAutomaticFeatures(bot);
    setMenu(bot);

    logger.info(`Bot is ready to accept commands`);
}

// Configure the bot singleton instance
if (!process.env["HACKERBOTTOKEN"]) {
    logger.error("HACKERBOTTOKEN is not defined");
    logger.error("Please set HACKERBOTTOKEN in the .env file or sevironment variables");
    logger.error("Exiting...");
    process.exit(1);
}

const bot = new HackerEmbassyBot(process.env["HACKERBOTTOKEN"], { polling: true });

init(bot);

export default bot;