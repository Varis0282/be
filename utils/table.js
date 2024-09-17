import _ from 'lodash'
import moment from 'moment'
import { errorObj, successObj } from './settings.js'

const utils = {
    removeExtraTableParams: (obj) => {
        let x = Object.assign({}, obj)
        delete x.results
        delete x.page
        delete x.count
        delete x.sortField
        delete x.sortOrder
        delete x.selectors
        delete x.select
        delete x.regExFilters
        delete x.populateArr
        delete x.project
        delete x.dateFilter
        delete x.pageSize
        delete x.current

        return x
    }
}

export function isJson(str) {

    try {
        let json = JSON.parse(str)
        return (typeof json === 'object')
    } catch (e) {
        return false
    }

}


export const FilterTable = (Model, Params) => {
    return new Promise(async (resolve) => {

        let { pageSize = 10, current = 1, sortField, sortOrder, regExFilters = [], select, populateArr, cache } = Params

        let page = current
        let results = pageSize

        let populateArrFilters = []

        let filter = utils.removeExtraTableParams(Params)

        let { dateFilter } = Params
        let customQuery = null

        if (filter) {
            customQuery = filter.customQuery
        }

        results = parseInt(results)
        page = parseInt(page)

        let query = Model.find({}, { password: 0 })
        let countQuery = Model.countDocuments({})

        if (populateArr) {
            _.each(populateArr, (val, key) => {
                /* console.log(val)
        
                 let x = val.path
                 if (filter && filter[val.path]) {
                     val.match = {[val.select]: new RegExp(filter[val.path][0], 'ig')}
                     delete filter[val.path]
                 }
        
                 console.log(val)*/
                query.populate(val)
            })
        }

        if (customQuery) {
            if (typeof customQuery === 'string' && isJson(customQuery)) {
                customQuery = JSON.parse(customQuery)
            }
            query.where({ ...customQuery })
            countQuery.where({ ...customQuery })
            delete filter.customQuery
        }

        if (filter) {
            _.each(filter, (val, key) => {

                if (isJson(val)) {
                    val = JSON.parse(val)
                    query.where({ [key]: val })
                    countQuery.where({ [key]: val })
                } else {
                    if (val !== undefined) {
                        let valueWord = val
                        if (regExFilters.includes(key)) {
                            val = val && val.trim().replace(/(^ +)|( +$)/g, '')
                            val = val && val.replace(/^[^a-zA-Z0-9]+/, '')
                            valueWord = new RegExp(val, 'ig')

                        }
                        query.where({ [key]: valueWord })
                        countQuery.where({ [key]: valueWord })
                    }
                }

            })
        }

        if (dateFilter) {
            dateFilter = JSON.parse(dateFilter)

            if (dateFilter.from && dateFilter.to) {
                query.where({ [dateFilter.key]: { $gte: moment(dateFilter.from).startOf('day') } })
                query.where({ [dateFilter.key]: { $lte: moment(dateFilter.to).endOf('day') } })

                countQuery.where({ [dateFilter.key]: { $gte: moment(dateFilter.from).startOf('day') } })
                countQuery.where({ [dateFilter.key]: { $lte: moment(dateFilter.to).endOf('day') } })
            }

        }

        if (select) {
            query.select(select)
        }

        if (sortField) {

            let order = sortOrder === 'ascend' ? 'asc' : 'desc'

            query.sort({ [sortField]: order }).collation({ locale: 'en', strength: 2 })
        }

        query.skip((page - 1) * results).limit(results)
        query.lean()

        if (cache) {
            console.log(cache, ' this is cache')
            query.cache(cache)
            countQuery.cache(cache)
        }

        try {
            let data = await query.exec()
            let total = await countQuery.exec()
            resolve({ ...successObj, data, page, pageSize: data.length, total })

        } catch (err) {
            return resolve({ ...errorObj, err, data: [], total: 0 })
        }

    })
}