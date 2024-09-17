import blogModel from '../models/blog.js';
import _ from 'lodash';
import { successObj, errorObj } from '../../utils/settings.js'
import { FilterTable } from '../../utils/table.js'
import moment from 'moment';

const exp = {
    add: (data) => {
        return new Promise(async (resolve) => {
            try {
                if (!data.title || !data.content || !data.description) {
                    return resolve({ ...errorObj, message: 'Invalid data' });
                }
                let blog = await blogModel.findOne({ title: data.title });
                if (blog) {
                    return resolve({ ...errorObj, message: 'Title already exists' });
                }
                let newBlog = new blogModel();
                _.each(data, (value, key) => {
                    newBlog[key] = value;
                });
                newBlog.createdBy = data.userId;
                if (newBlog.status === 'published') {
                    newBlog.publishedAt = new Date();
                }
                await newBlog.save();
                return resolve({ ...successObj, data: newBlog, message: 'Blog added successfully' });
            } catch (error) {
                console.log(error)
                resolve({ ...errorObj, message: error.message });
            }
        });
    },
    list: (data) => {
        return new Promise(async (resolve) => {
            try {

                if (data.createdAt && data.createdAt.length) {
                    data.createdAt = {
                        $gte: moment(data.createdAt[0]).toISOString(),
                        $lte: moment(data.createdAt[1]).toISOString()
                    }
                }
                if (data.updatedAt && data.updatedAt.length) {
                    data.updatedAt = {
                        $gte: moment(data.updatedAt[0]).toISOString(),
                        $lte: moment(data.updatedAt[1]).toISOString()
                    }
                }
                if (data.publishedAt && data.publishedAt.length) {
                    data.publishedAt = {
                        $gte: moment(data.publishedAt[0]).toISOString(),
                        $lte: moment(data.publishedAt[1]).toISOString()
                    }
                }
                if (data.category) {
                    data.category = _.map(data.category, (item) => {
                        return new RegExp(item, 'ig');
                    });
                }
                if (data.tags) {
                    data.tags = {
                        $in: _.map(data.tags, (item) => {
                            return new RegExp(item, 'ig');
                        })
                    }
                }
                if (data.status) {
                    data.status = _.map(data.status, (item) => {
                        return new RegExp(item, 'ig');
                    });
                }
                if (data.createdBy) {
                    data.createdBy = {
                        $in: data.createdBy
                    }
                }
                if (data.title) {
                    data.title = new RegExp(data.title, 'ig');
                }
                if (data.description) {
                    data.description = new RegExp(data.description, 'ig');
                }
                if (data.content) {
                    data.content = new RegExp(data.content, 'ig');
                }
                if (data.search) {
                    // search in title, description, content, tags
                    data.$or = [
                        {
                            title: new RegExp(data.search, 'ig')
                        },
                        {
                            description: new RegExp(data.search, 'ig')
                        },
                        {
                            content: new RegExp(data.search, 'ig')
                        },
                        {
                            tags: {
                                $in: _.map(data.search.split(' '), (item) => {
                                    return new RegExp(item, 'ig');
                                })
                            }
                        }
                    ]
                    delete data.search;
                }

                data.populateArr = [];

                delete data.userId;
                let x = await FilterTable(blogModel, {
                    sortField: 'createdAt',
                    sortOrder: 'ascend',
                    ...data
                });
                return resolve(x);
            } catch (error) {
                console.log(error)
                return resolve({ ...errorObj, message: error.message });
            }
        });
    },
    update: (data) => {
        return new Promise(async (resolve) => {
            try {
                if (!data._id) {
                    return resolve({ ...errorObj, message: 'Invalid data' });
                }
                let blog = await blogModel.findById(data._id);
                if (!blog) {
                    return resolve({ ...errorObj, message: 'Blog not found' });
                }
                _.each(data, (value, key) => {
                    blog[key] = value;
                });
                await blog.save();
                return resolve({ ...successObj, data: blog, message: 'Blog updated successfully' });
            } catch (error) {
                console.log(error)
                return resolve({ ...errorObj, message: error.message });
            }
        });
    },
    publish: (data) => {
        return new Promise(async (resolve) => {
            try {
                if (!data._id) {
                    return resolve({ ...errorObj, message: 'Invalid data' });
                }
                let blog = await blogModel.findById(data._id);
                if (!blog) {
                    return resolve({ ...errorObj, message: 'Blog not found' });
                }
                if (blog.status === 'published') {
                    return resolve({ ...errorObj, message: 'Blog already published' });
                }
                blog.status = 'published';
                blog.publishedAt = new Date();
                await blog.save();
                return resolve({ ...successObj, data: blog, message: 'Blog published successfully' });
            } catch (error) {
                console.log(error)
                return resolve({ ...errorObj, message: error.message });
            }
        })
    },
    getById: (data) => {
        return new Promise(async (resolve) => {
            try {
                if (!data._id) {
                    return resolve({ ...errorObj, message: 'Invalid data' });
                }
                let blog = await blogModel.findById(data._id).populate('createdBy', 'name email');
                if (!blog) {
                    return resolve({ ...errorObj, message: 'Blog not found' });
                }
                return resolve({ ...successObj, data: blog });
            } catch (error) {
                console.log(error)
                resolve({ ...errorObj, message: error.message });
            }
        });
    },
    delete: (data) => {
        return new Promise(async (resolve) => {
            try {
                if (!data._id) {
                    return resolve({ ...errorObj, message: 'Invalid data' });
                }
                await blogModel.findByIdAndDelete(data._id);
                return resolve({ ...successObj, message: 'Blog deleted successfully' });
            } catch (error) {
                console.log(error)
                resolve({ ...errorObj, message: error.message });
            }
        });
    }
}

export default exp;