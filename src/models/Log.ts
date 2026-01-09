import mongoose, { Schema, model, models } from "mongoose";

const LogSchema = new Schema({
    userId: { type: String, required: true },
    duration: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
});

const Log = models.Log || model("Log", LogSchema);

export default Log;