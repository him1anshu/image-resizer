import "dotenv/config";

const config = {
    mongoConfig: {
        connectionString: "mongodb://localhost:27017/",
        mongooseOptions: {
            autoIndex: false,
            dbName: "image-resizer-db",
            maxPoolSize: 50,
            minPoolSize: 10,
            socketTimeoutMS: 0,
            authSource: "admin",
            user: process.env.MONGOUSER,
            pass: process.env.PASSWORD,
            // serverSelectionTimeoutMS: "30",
            // heartbeatFrequencyMS: 2000,
        },
        dbList: { transaction: "image-resizer-db" },
    },
    redisConfig: {
        redisEnabled: true,
        redisOptions: {
            host: "127.0.0.1",
            port: 6379,
        },
        redisClients: {
            cache: 10,
            session: 11,
        },
    },
};

export default function getConfig(name) {
    return config[name] || {};
}
