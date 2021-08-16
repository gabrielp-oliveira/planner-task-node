const express = require('express')
const router = express.Router()
require('dotenv').config()

const User = require('../models/user')
const planner = require('../models/planner')

router.post('/confirm', async (req, resp) => {
    try {

        const { email, userId } = req.body
        console.log(email, userId)
        const user = await User.findOne({_id: userId})
        const participant = await User.findOne({email: email})

        if(user.email === email){
            return resp.send({error: 'this is your email.'})
        }if(participant == null){
            return resp.send({error: 'this email does not exist.'})
        }
        const participantInfo = {
            name: participant.name,
            email: participant.email
        } 
       return resp.send(participantInfo)

    } catch (error) {
        console.log(error)
        return resp.send({ error: error })
    }
})

module.exports = app => app.use('/user', router)