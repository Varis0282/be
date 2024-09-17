import UserModel from '../models/user.js';
import _ from 'lodash';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { successObj, errorObj } from '../../utils/settings.js'
import moment from 'moment';
import { FilterTable } from '../../utils/table.js'
import dotenv from 'dotenv';
dotenv.config();

const exp = {
    add: (data) => {
        return new Promise(async (resolve) => {
            try {
                if (!data.name || !data.email || !data.userName || !data.password) {
                    return resolve({ ...errorObj, message: 'Invalid data' });
                }
                let existingUserWithEmail = await UserModel.findOne({ email: data.email });
                if (existingUserWithEmail) {
                    return resolve({ ...errorObj, message: 'Email already exists' });
                }
                let existingUserWithUserName = await UserModel.findOne({ userName: data.userName });
                if (existingUserWithUserName) {
                    return resolve({ ...errorObj, message: 'Username already exists' });
                }
                let newUser = new UserModel();
                _.each(data, (value, key) => {
                    newUser[key] = value;
                });
                const salt = bcrypt.genSaltSync(10);
                newUser.password = bcrypt.hashSync(data.password, salt);
                await newUser.save();
                newUser.password = undefined;
                return resolve({ ...successObj, data: newUser, message: 'User added successfully' });
            } catch (error) {
                console.log(error)
                return resolve({ ...errorObj, message: error.message });
            }
        });
    },
    login: (data) => {
        return new Promise(async (resolve) => {
            try {
                if (!data.key || !data.password) {
                    return resolve({ ...errorObj, message: 'Invalid data' });
                }
                const user = await UserModel.findOne({ $or: [{ email: data.key.toLowerCase() }, { userName: data.key }] });
                if (!user) {
                    return resolve({ ...errorObj, message: 'User not found' });
                }
                const isMatch = bcrypt.compareSync(data.password, user.password);
                if (!isMatch) {
                    return resolve({ ...errorObj, message: 'Invalid password' });
                }
                const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
                user.password = undefined;
                return resolve({ ...successObj, data: token, message: 'User logged in successfully' });
            } catch (error) {
                console.log(error)
                return resolve({ ...errorObj, message: error.message });
            }
        });
    },
    list: (data) => {
        return new Promise(async (resolve) => {
            try {
                if (data?.createdAt && data?.createdAt?.length) {
                    data.createdAt = {
                        $gte: moment(data.createdAt[0]).toDate(),
                        $lt: moment(data.createdAt[1]).toDate()
                    }
                }
                if (data?.updatedAt && data?.updatedAt?.length) {
                    data.updatedAt = {
                        $gte: moment(data.updatedAt[0]).toDate(),
                        $lt: moment(data.updatedAt[1]).toDate()
                    }
                }
                data.select = {
                    password: 0
                }
                let x = await FilterTable(UserModel, {
                    sortField: 'createdAt',
                    sortOrder: 'ascend',
                    ...data
                })
                return resolve(x);
            } catch (error) {
                console.log(error)
                return resolve({ ...errorObj, message: error.message });
            }
        });
    },
    delete: (data) => {
        return new Promise(async (resolve) => {
            try {
                if (!data._id) {
                    return resolve({ ...errorObj, message: 'Invalid data' });
                }
                await UserModel.findByIdAndDelete(data.id);
                return resolve({ ...successObj, message: 'User deleted successfully' });
            } catch (error) {
                console.log(error)
                return resolve({ ...errorObj, message: error.message });
            }
        })
    },
    update: (data) => {
        return new Promise(async (resolve) => {
            try {
                if (!data._id) {
                    return resolve({ ...errorObj, message: 'Invalid data' });
                }
                let user = await UserModel.findById(data._id);
                if (!user) {
                    return resolve({ ...errorObj, message: 'User not found' });
                }
                _.each(data, (value, key) => {
                    user[key] = value;
                });
                await user.save();
                user.password = undefined;
                return resolve({ ...successObj, data: user, message: 'User updated successfully' });
            } catch (error) {
                console.log(error)
                return resolve({ ...errorObj, message: error.message });
            }
        });
    },
    getById: (data) => {
        return new Promise(async (resolve) => {
            try {
                if (!data._id) {
                    return resolve({ ...errorObj, message: 'Invalid data' });
                }
                let user = await UserModel.findById(data._id);
                if (!user) {
                    return resolve({ ...errorObj, message: 'User not found' });
                }
                user.password = undefined;
                return resolve({ ...successObj, data: user, message: 'User found successfully' });
            } catch (error) {
                console.log(error)
                return resolve({ ...errorObj, message: error.message });
            }
        });
    }
}

export default exp;