import Redis from "ioredis";

class RedisConnector {
    constructor(redisConfig, db) {
        this.client = new Redis({
            ...redisConfig.redisOptions,
            db: redisConfig.redisClients[db],
        });
    }

    get(key) {
        return new Promise((resolve, reject) => {
            this.client.get(key, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    if (result) {
                        try {
                            result = JSON.parse(result);
                            resolve(result);
                        } catch (error) {
                            resolve(result);
                        }
                    }
                }
            });
        });
    }

    set(key, value) {
        return new Promise((resolve, reject) => {
            if (typeof value === "object") {
                value = JSON.stringify(value);
            }

            this.client.set(key, value, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    }

    destroy(key) {
        return new Promise((resolve, reject) => {
            this.client.del(key, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    }

    del(key) {
        return new Promise((resolve, reject) => {
            this.client.del(key, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    }
}

export default RedisConnector;
