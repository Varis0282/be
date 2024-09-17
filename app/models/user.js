import mongoose, { Schema } from "mongoose";
import MongooseDelete from 'mongoose-delete'

const userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    userName: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, required: true, enum: ["user", "admin"], default: "user" },
}, { timestamps: true });

userSchema.plugin(MongooseDelete, { deletedAt: true, overrideMethods: ['count', 'countDocuments', 'find'] })

export default mongoose.model("User", userSchema);