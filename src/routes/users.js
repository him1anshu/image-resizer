import argon2 from "argon2";
import { Router } from "express";

import { userSchema } from "../models/users.js";
import { authCheck } from "../utils/auth-check.js";
import { getValidationRules, validateAndExtractData } from "../utils/validators.js";

const router = Router();

export const loginHandler = async (req, res) => {
    try {
        const Users = mongoose.model("User", userSchema);
        const user = await Users.findOne({ username: req.data.username });

        if (user) {
            if (await argon2.verify(user.password, req.data.password)) {
                req.session.login_details = {
                    username: user.username,
                    full_name: user.full_name,
                    email_id: user.email_id,
                    role: user.role,
                };

                return res.status(200).json({ message: "User logged in successfully" });
            }
        }
        return res.status(401).json({ message: "Please checkin login credentials and try again." });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};

router.post(
    "/login",
    getValidationRules(["username", "password"]),
    validateAndExtractData,
    loginHandler
);

export async function addUserAccountHandler(req, res) {
    try {
        const Users = allEntitiesModels.find((entity) => entity.name === "users");
        const hash = await argon2.hash(req.data.password);

        await Users.model.create({
            username: req.data.username,
            full_name: req.data.full_name,
            password: hash,
            phone_no: req.data.phone_no,
            email_id: req.data.email_id,
            role: req.data.role,
        });

        return res.status(201).json({ message: "New user account created successfully." });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
}

router.post(
    "/singup",
    authCheck,
    getValidationRules(["email_id", "username", "phone_no", "full_name", "password", "role"], {
        isSignup: true,
    }),
    validateAndExtractData,
    addUserAccountHandler
);

export default router;
