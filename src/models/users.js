import mongoose from "mongoose";

const { Schema } = mongoose;

const userSchema = new Schema({
    full_name: { type: "String", required: true },
    username: { type: "String", required: true },
    email_id: { type: "String", required: true },
    phone_no: { type: "String", required: true },
    password: { type: "String", required: true },
    role: { type: ["String"], required: true },
});

export default userSchema;
