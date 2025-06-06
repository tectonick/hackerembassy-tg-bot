import { Router, Request } from "express";

import { User } from "@data/models";
import FundsRepository from "@repositories/funds";
import UsersRepository from "@repositories/users";

import { getDonationsSummary, SponsorshipLevel, SponsorshipLevelToName } from "@services/funds/export";
import { spaceService } from "@services/domain/space";
import { hasRole, userService } from "@services/domain/user";

import wikiRouter from "./wiki";
import embassyRouter from "./embassy";
import { spaceApiTemplate } from "../templates";
import { authentificate, allowTrustedMembers, allowMembers } from "../middleware";

// Router
const apiRouter = Router();
apiRouter.use(authentificate);
apiRouter.use("/wiki", wikiRouter);
apiRouter.use("/embassy", embassyRouter);

// Helpers
const isFromMemberOrHass = (req: Request): boolean => req.entity === "hass" || (req.user && hasRole(req.user as User, "member"));

// Routes
apiRouter.get("/space", (_, res) => {
    const status = spaceService.getState();
    const inside = userService.getPeopleInside();

    if (!spaceApiTemplate)
        return void res.status(500).json({
            error: "SpaceApi template is not defined",
        });

    res.json({
        ...spaceApiTemplate,
        state: {
            open: !!status.open,
            message: status.open ? "open for public" : "closed for public",
            trigger_person: status.changer.username,
        },
        sensors: {
            people_now_present: [{ value: inside.length }],
        },
    });
});

apiRouter.get("/status", (req, res) => {
    const status = spaceService.getState();

    const inside = userService.getPeopleInside(isFromMemberOrHass(req)).map(p => {
        return {
            username: p.user.username,
            dateChanged: p.date,
        };
    });
    const planningToGo = userService.getPeopleGoing().map(p => {
        return {
            username: p.user.username,
            dateChanged: p.date,
        };
    });

    res.json({
        open: status.open,
        dateChanged: status.date,
        changedBy: status.changer.username,
        inside,
        planningToGo,
    });
});

apiRouter.get("/inside", (req, res) => {
    const inside = userService.getPeopleInside(isFromMemberOrHass(req));
    res.json(inside);
});

// Legacy HASS api
apiRouter.get("/insidecount", (req, res) => {
    try {
        const inside = userService.getPeopleInside(isFromMemberOrHass(req));
        res.status(200).send(inside.length.toString());
    } catch {
        res.status(500).send("-1");
    }
});

apiRouter.post("/setgoing", allowTrustedMembers, (req, res) => {
    /*  #swagger.requestBody = {
                required: true,
                content: {
                    "application/json": {
                        schema: { $ref : '#/definitions/going' }  
                    }
                }
            
        } */
    try {
        const body = req.body as { isgoing: boolean; message?: string };

        if (typeof body.isgoing !== "boolean") return void res.status(400).send({ error: "Missing or incorrect parameters" });

        userService.setGoingState(req.user as User, body.isgoing, body.message);

        res.json({ message: "Success" });
    } catch (error) {
        res.status(500).send({ error });
    }
});

apiRouter.post("/in", allowTrustedMembers, (req, res) => {
    const success = userService.letIn(req.user as User);

    res.send({ message: success ? "Success" : "Failed" });
});

apiRouter.post("/out", allowTrustedMembers, (req, res) => {
    const success = userService.letOut(req.user as User);

    res.send({ message: success ? "Success" : "Failed" });
});

apiRouter.post("/open", allowMembers, (req, res) => {
    spaceService.openSpace(req.user as User);

    res.send({ message: "Success" });
});

apiRouter.post("/close", allowMembers, (req, res) => {
    spaceService.closeSpace(req.user as User);
    userService.evictPeople();

    res.send({ message: "Success" });
});

apiRouter.get("/donations", async (req, res) => {
    /*  #swagger.parameters['fund'] = {
                in: 'query',
                description: 'Fund name to show donations for. By default shows the latest fund for costs',
                required: false,
                type: 'string'
        } */
    /*  #swagger.parameters['limit'] = {
                in: 'query',
                description: 'Limit of donations to show. By default shows all donations',
                required: false,
                type: 'number'
        } */

    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    if (limit !== undefined && (isNaN(limit) || limit < 0)) return void res.status(400).send({ error: "Invalid limit" });

    const fund = req.query.fund ? FundsRepository.getFundByName(req.query.fund as string) : FundsRepository.getLatestCosts();
    if (!fund) return void res.status(500).send({ error: "Costs fund is not found" });

    res.json(await getDonationsSummary(fund, limit));
});

apiRouter.get("/sponsors", (req, res) => {
    const sponsors = UsersRepository.getSponsors();
    res.json(
        sponsors.map(s => {
            return {
                userid: isFromMemberOrHass(req) ? s.userid : undefined,
                username: s.username,
                first_name: s.first_name,
                sponsorship: SponsorshipLevelToName.get(s.sponsorship as SponsorshipLevel),
            };
        })
    );
});

export default apiRouter;
