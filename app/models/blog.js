import mongoose, { Schema } from "mongoose";
import MongooseDelete from 'mongoose-delete'


const commentsSchema = new Schema({
    userName: { type: String, required: true },
    comment: { type: String, required: true },
    userId: { type: String, required: true, ref: 'User' },
}, { timestamps: true });

const likesSchema = new Schema({
    userId: { type: String, required: true, ref: 'User' },
}, { timestamps: true });

const blogSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    content: { type: String, required: true },
    image: { type: String, default: null },
    category: { type: String, required: true, enum: ["tech", "health", "sports", "entertainment", "politics", "general"], default: "general" },
    tags: { type: Array, default: [] },
    status: { type: String, required: true, enum: ["draft", "published"], default: "draft" },
    publishedAt: { type: Date, default: null },
    comments: [commentsSchema],
    likes: [likesSchema],
    createdBy: { type: String, ref: 'User', required: true },
}, { timestamps: true });

blogSchema.plugin(MongooseDelete, { deletedAt: true, overrideMethods: ['count', 'countDocuments', 'find'] })

export default mongoose.model("Blog", blogSchema);