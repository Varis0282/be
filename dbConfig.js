import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
const db = process.env.MONGO_URI;


mongoose.connect(db).then(() => {
    console.log('MongoDB Connected')
}).catch(err => {
    console.log("Error connecting to db", err);
})

export default mongoose;