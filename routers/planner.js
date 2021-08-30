const express = require('express')
const router = express.Router()
require('dotenv').config()

const User = require('../models/user')
const Planner = require('../models/planner')
const { authenticateToken } = require('../middlewares/authenticateToken')
const { authenticatePlanner } = require('../middlewares/authenticatePlanner')

// const { startStage, addParticipantsStage, newStages } = require('../teste')

router.post('/new', authenticateToken, async (req, resp) => {
    try {
        const { startStage, addParticipantsStage, newStages } = req.body.params
        const  id = req.query.id

        const user = await User.findOne({ _id: id })
        addParticipantsStage.push({ email: user.email, acess: 'total' })
        const planner = await Planner.create({
            name: startStage.plaannerName,
            desciption: startStage.plannerDescription,
            stages: newStages,
        })

        addParticipantsStage.forEach(async (el) => {
            const participant = await User.findOne({ email: el.email })

            if (participant !== null) {
                await Planner.findOneAndUpdate({ _id: planner._id },
                    {
                        $push: {
                            users: {
                                name: participant.name,
                                email: el.email,
                                acess: el.acess
                            }
                        }
                    })
                await User.findOneAndUpdate({ email: el.email },
                    {
                        $push: {
                            planners: {
                                name: startStage.plaannerName,
                                plannerId: planner._id,
                                acess: el.acess
                            }
                        }
                    })
            }
        })
        return resp.send({ ok: 'ok' })
    } catch (error) {
        console.log(error)
        return resp.send({ error: 'error' })
    }
})

router.get('/', (req, res) => {
    Planner.find()
        .exec((err, users) => {
            if (err) {
            } else {
                res.send(users);
            }
        });
});
router.get('/us', (req, res) => {
    User.find()
        .exec((err, users) => {
            if (err) {
            } else {
                res.send(users);
            }
        });
});
router.post('/auth', authenticateToken, authenticatePlanner, async (req, res) => {
    try {
        const { plannerId } = req.body.params
        const planner = await Planner.findOne({_id: plannerId})

        const currentUser = await User.findOne({_id: req.query.id})
        const acess =  planner.users.find((element) => {
            return element.email == currentUser.email
        })

        return res.send({planner, acess: acess.acess })
    } catch (error) {
        res.send(error)
    }
});


module.exports = app => app.use('/planner', router)