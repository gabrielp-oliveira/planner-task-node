const express = require('express')
const router = express.Router()
require('dotenv').config()

const User = require('../models/user')
const Planner = require('../models/planner')

router.post('/confirm', async (req, resp) => {
    try {

        const { email, userId } = req.body
        const user = await User.findOne({_id: userId})
        const participant = await User.findOne({email: email})

        if(user.email === email){
            
            throw {error: 'this is your email.'}
        }if(participant == null){
            throw {error: 'this email does not exist.'}
        }
        const participantInfo = {
            name: participant.name,
            email: participant.email
        } 
       return resp.send(participantInfo)

    } catch (error) {
        return resp.send({ error: error })
    }
})
router.post('/leavePlaner', async (req, resp) => {
    try {

        const { email, userId, plannerId } = req.body
        const user = await User.findOne({email: email, _id: userId})
        const planner = await Planner.findOne({_id: plannerId})
        if(!planner) throw {error: 'something wrong with the planner, try again later.'}
        if(!user) throw {error: 'something wrong with the user, try again later.'}

        await Planner.findOneAndUpdate({ _id: plannerId }, {
            $pull: { users: {email: email} }
        })
        await User.findOneAndUpdate({email: email, _id: userId}, {
            $pull: { planners: {plannerId: plannerId} }
        })
        const currentPlanner = await Planner.findOne({_id: plannerId})
        if(currentPlanner.users.length == 0){
            await Planner.findOneAndDelete({_id: plannerId})
        }
        return resp.send('participantInfo')

    } catch (error) {
        return resp.send({ error: error })
    }
})

module.exports = app => app.use('/user', router)