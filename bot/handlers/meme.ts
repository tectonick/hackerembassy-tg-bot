import { Message } from "node-telegram-bot-api";

import t from "../../services/localization";
import { getImageFromPath, getRandomImageFromFolder } from "../../services/media";
import HackerEmbassyBot, { BotHandlers } from "../core/HackerEmbassyBot";

export default class MemeHandlers implements BotHandlers {
    static async randomImagePathHandler(bot: HackerEmbassyBot, msg: Message, path: string) {
        const buffer = await getRandomImageFromFolder(path);

        if (!buffer) {
            await bot.sendMessageExt(msg.chat.id, t("status.general.error"), msg);
            return;
        }

        await bot.sendPhotoExt(msg.chat.id, buffer, msg);
    }

    static async randomDogHandler(bot: HackerEmbassyBot, msg: Message) {
        await MemeHandlers.randomImagePathHandler(bot, msg, "./resources/images/dogs");
    }

    static async randomCatHandler(bot: HackerEmbassyBot, msg: Message) {
        await MemeHandlers.randomImagePathHandler(bot, msg, "./resources/images/cats");
    }

    static async randomCabHandler(bot: HackerEmbassyBot, msg: Message) {
        await MemeHandlers.randomImagePathHandler(bot, msg, "./resources/images/cab");
    }

    static async randomRoosterHandler(bot: HackerEmbassyBot, msg: Message) {
        await MemeHandlers.randomImagePathHandler(bot, msg, "./resources/images/roosters");
    }

    static async imageHandler(bot: HackerEmbassyBot, msg: Message, path: string) {
        const buffer = await getImageFromPath(path);

        if (!buffer) {
            await bot.sendMessageExt(msg.chat.id, t("status.general.error"), msg);
            return;
        }

        await bot.sendPhotoExt(msg.chat.id, buffer, msg);
    }
}
