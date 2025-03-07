import mongoose from "mongoose";
import Redis from "ioredis";
import { RedisStore } from "connect-redis";

import RedisConnector from "./redis-connector.js";
import getConfig from "../config/config.js";

export async function closeOtherConnections() {
    if (mongoose.connection.readyState === 1) {
        await mongoose.disconnect();
    }

    console.log("Exiting the process");
    process.exit(0);
}

export function gracefulShutdown(server) {
    try {
        if (server) {
            server.close(() => {
                console.log("Server is closed");
                setTimeout(() => {
                    closeOtherConnections();
                }, 1000);
            });
        } else {
            setTimeout(() => {
                closeOtherConnections();
            }, 1000);
        }
    } catch (error) {
        console.error(error);
        process.exit(0);
    }
}

export async function connectDatabase(mongoDBList, mongoClients) {
    const mongoConfig = getConfig("mongoConfig");
    const { mongooseOptions, connectionString, dbList } = mongoConfig;

    const mongoDBs = mongoDBList.split(",");
    for (const db of mongoDBs) {
        mongooseOptions.dbName = dbList[db];
        const dbConn = await mongoose
            .createConnection(connectionString, mongooseOptions)
            .asPromise();

        mongoClients[db] = dbConn;
    }
}

export async function connectRedis(redisDBList, redisClients) {
    const redisConfig = getConfig("redisConfig");
    if (redisConfig.redisEnabled) {
        const redisDBs = redisDBList.split(",");
        for (const db of redisDBs) {
            let redisStore;
            if (db === "session") {
                const redisClient = new Redis({
                    ...redisConfig.redisOptions,
                    db: redisConfig.redisClients[db],
                });
                redisStore = new RedisStore({
                    client: redisClient,
                    prefix: "myapp:",
                });
            } else {
                redisStore = new RedisConnector(redisConfig, db);
            }
            redisClients[db] = redisStore;
        }
    }
}

export function registerMongooseHandlers(mongoClients) {
    const clients = Object.keys(mongoClients);
    const mongooseEvents = [
        "connected",
        "open",
        "disconnected",
        "reconnected",
        "disconnecting",
        "close",
    ];

    clients.forEach((client) => {
        const mongoClient = mongoClients[client];
        mongooseEvents.forEach((event) => {
            mongoClient.on(event, (error) => {
                if (error) {
                    console.error(error);
                }
                console.log(`MongoDB ${mongoClient} db status: ${event}`);
            });
        });
    });
}

export const registerRedisHandlers = (redisClients) => {
    const clients = Object.keys(redisClients);
    const redisEvents = [
        "error",
        "connect",
        "ready",
        "close",
        "reconnecting",
        "end",
        "wait",
        "select",
    ];

    clients.forEach((client) => {
        const redis = redisClients[client];
        redisEvents.forEach((event) => {
            if (client === "session") {
                redis.on(event, (error) => {
                    if (error) {
                        console.error(error);
                    }
                    console.log(`Redis ${client} db status: ${event}`);
                });
            } else {
                redis.client.on(event, (error) => {
                    if (error) {
                        console.error(error);
                    }
                    console.log(`Redis ${client} db status: ${event}`);
                });
            }
        });
    });
};
