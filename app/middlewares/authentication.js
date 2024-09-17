import jwt from 'jsonwebtoken';
import User from '../models/user.js';

export default async (req, res, next) => {
    try {
        const headers = req.header('Authorization');
        console.log("🚀 => headers:", headers);
        if (!headers) {
            console.log("No headers");
            return res.status(401).json({ message: 'Unauthorized' });
        }
        // split the token to get the actual token
        const token = headers.split(' ')[1];
        if (!token) {
            console.log("No token");
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        // console.log(decoded);
        if (!user) {
            console.log("No user");
            return res.status(401).json({ message: 'Unauthorized' });
        }
        user.password = undefined;
        req.user = user;
        next();
    }
    catch (error) {
        console.log(error);
        res.status(401).json({ message: error.message });
    }
};