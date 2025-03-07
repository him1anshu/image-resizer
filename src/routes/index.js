import express from "express";
import etRouter from "./entities.js";

const router = express.Router();

export default function initRoutes(app) {
    router.get("/", (req, res) => {
        const body = {
            Name: "API End Points",
            Total_Entity: global.entityCount,
            Sample_API_Endpoint: {
                GET_SCHEMA_STRUCTURE: "http://localhost:8080/api/v1/user/schema",
                GET_TOTAL_DATA_COUNT: "http://localhost:8080/api/v1/user/count",
                GET_ALL_DATA: "http://localhost:8080/api/v1/user",
                GET_SPECIFIC_DATA: "http://localhost:8080/api/v1/user/:id",
                POST_DATA: "http://localhost:8080/api/v1/user",
                PATCH_DATA: "http://localhost:8080/api/v1/user/:id",
                DELETE_DATA: "http://localhost:8080/api/v1//user/:id",
            },
            EntityNames: global.schemaNames,
        };
        res.set("Content-Type", "application/json");
        res.send(JSON.stringify(body, null, 2));
    });

    app.use("/", router);
    app.use("/entity", etRouter);
}
