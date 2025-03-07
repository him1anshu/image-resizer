import "dotenv/config";
import helmet from "helmet";
import express from "express";
import compression from "compression";
import session from "express-session";
import methodOverride from "method-override";
// import { rateLimit } from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";

import updateEntryRouter from "./routes/index.js";
import { authCheck } from "./utils/auth-check.js";
import {
    gracefulShutdown,
    connectDatabase,
    connectRedis,
    registerMongooseHandlers,
    registerRedisHandlers,
} from "./utils/server-utils.js";

const app = express();
const {
    port = 8000,
    service = "CRUD",
    redis_dbs_list: redisDBList = "session,cache",
    mongo_dbs_list: mongoDBList = "transaction",
} = process.env;

app.use(compression());
app.use(
    express.json({
        limit: "10mb",
        strict: true,
        type: "application/json",
    })
);

app.use(methodOverride());
app.use(helmet());
app.use(mongoSanitize());

const redisClients = {};
connectRedis(redisDBList, redisClients);
app.use(
    session({
        secret: "a2l0Y2hlbm1leW91bmdlcm1vbmV5c29kZWVwbHlwaW5rbm93c3VwcGVycG9saWNlZ3JvdXBnYXJkZW5o",
        resave: true,
        saveUninitialized: false,
        rolling: true,
        unset: "destroy",
        cookie: { secure: false, maxAge: 30000 },
        // store: redisClients.session,
    })
);

// const rateLimiter = rateLimit({
//     windowMs: 1 * 60 * 1000, // 15 minutes (15 * 60 * 1000)
//     max: 100, // Limit each IP to 5 requests per windowMs
//     message: {
//         status: 429,
//         message: "Too many attempts, please try again later.",
//     },
//     standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
//     legacyHeaders: false, // Disable the `X-RateLimit-*` headers
// });

// // Apply the rate limiting middleware to all requests.
// app.use(rateLimiter);

const mongoClients = {};
let server;
async function startServices() {
    try {
        await connectDatabase(mongoDBList, mongoClients);
        server = app.listen(port);
        console.log(`Express server listening on port ${port}`);

        app.use(authCheck);
        updateEntryRouter(app);
    } catch (error) {
        console.error(error);
        gracefulShutdown(server);
    }
}
startServices();

app.get("/ping", () => {
    console.log(`${service} running on port: ${port}`);
});

process.on("SIGINT", () => {
    gracefulShutdown(server);
});
process.on("SIGTERM", () => {
    gracefulShutdown(server);
});

process.on("unhandledRejection", (reason, promise) => {
    console.log(`Reason: ${reason}, Promise: ${promise}`);
});
process.on("uncaughtException", (error, origin) => {
    console.log(`Source: ${origin}, Error: ${error}`);
    gracefulShutdown();
});

registerMongooseHandlers(mongoClients);

registerRedisHandlers(redisClients);
