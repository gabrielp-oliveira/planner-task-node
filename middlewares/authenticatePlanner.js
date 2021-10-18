const jwt = require('jsonwebtoken')
const User = require('../models/user')

async function authenticatePlanner(req, res, next) {
    try {
        const { plannerId, id } = req.body.params
        const user = await User.findOne({ _id: id })

        const valid = await user.planners?.find((pln) => {
            return pln.plannerId == plannerId
        })
        if (valid != undefined) {
            next()
        } else {
            throw { error: 'error, you dont have acess to this planner' }
        }
    } catch (error) {
        throw { error: 'something wrong with the planner id or your acess' }
    }


}

module.exports = { authenticatePlanner }