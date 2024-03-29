import config from "config";
import { promises as fs } from "fs";

import { BotConfig } from "../../config/schema";
import logger from "../../services/logger";
import HackerEmbassyBot from "../core/HackerEmbassyBot";
import { setMenu } from "./menu";
import { setAutomaticFeatures } from "./recurring-actions";
import { addEventHandlers, addRoutes, startRouting } from "./router";
const botConfig = config.get<BotConfig>("bot");

async function init(bot: HackerEmbassyBot): Promise<void> {
    const botInstanceInfo = await bot.getMe();
    bot.Name = botInstanceInfo.username;
    const restrictedImage = await fs.readFile("./resources/images/restricted.jpg").catch(() => null);
    bot.restrictedImage = restrictedImage ? Buffer.from(restrictedImage) : null;
    addRoutes(bot);
    addEventHandlers(bot);
    startRouting(bot, botConfig.debug);
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

const bot = new HackerEmbassyBot(process.env["HACKERBOTTOKEN"], {
    polling: {
        params: {
            //@ts-ignore
            allowed_updates: JSON.stringify([
                "update_id",
                "message",
                "edited_message",
                "channel_post",
                "edited_channel_post",
                "inline_query",
                "chosen_inline_result",
                "callback_query",
                "shipping_query",
                "pre_checkout_query",
                "poll",
                "poll_answer",
                "my_chat_member",
                "chat_member",
            ]),
        },
    },
});

export function StartTelegramBot() {
    init(bot);
}

export default bot;
