const express = require('express')
const router = express.Router()
require('dotenv').config()

const User = require('../models/user')
const Planner = require('../models/planner')
const Task = require('../models/task')
const { authenticateToken } = require('../middlewares/authenticateToken')
const { authenticatePlanner } = require('../middlewares/authenticatePlanner')
const getDateRange = require('../utils/getDateRange')

// const { startStage, addParticipantsStage, newStages } = require('../teste')

router.post('/new', authenticateToken, async (req, resp) => {
    try {
        const { startStage, addParticipantsStage, newStages } = req.body.params
        const id = req.query.id

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
        const planner = await Planner.findOne({ _id: plannerId })
        const delList = await Task.find({plannerId: plannerId, deleted: true})

        for(let i = 0; i <= planner.stages.length; i++){
            if(planner.stages[i] == undefined){
                console.log('terminou')
                return res.send({ planner, delList  })
            }else{

                
                const taskToRemove = await Task.find({ StageId: planner.stages[i]._id, deleted: true })
                taskToRemove.forEach(async (tsk, index) => {
                    if (tsk.deleted == true) {
                        if (getDateRange(tsk.deletedAt, Date.now()) >= 10080) {
                            await Task.findOneAndRemove({ StageId: tsk._id })
                            await Planner.findOneAndUpdate({ _id: plannerId }, {
                                $pull: { tasks: { TaskId: tsk._id } }
                            })
                        } 
                    }
                })
                
                
                const tasks = await Task.find({ StageId: planner.stages[i]._id})
                tasks.forEach(async (el) => {
                    if(el.deleted == undefined){
                        console.log('undefined')
                        await Task.findOneAndUpdate({_id: el._id},{
                            $set: { deleted: false }
                        })
                    }
                })
                planner.stages[i].tasks = tasks
                
                
            }
        }

        

    } catch (error) {
        res.send(error)
    }
});

router.delete('/delColumn', authenticateToken, async (req, res) => {
    try {
        const { id, Columnid, plannerId } = req.query

        const teste = await Planner.findOne({ _id: plannerId }, { stages: { _id: Columnid } })

        if (teste.stages[0].tasks.length === 0) {
            await Planner.findOneAndUpdate({ _id: plannerId },
                {
                    $pull: { stages: { _id: Columnid } }
                })
            return res.send('removido')
        } else {
            console.log('ainda a tratar')
            return res.send('ainda a tratar')
        }

    } catch (error) {
        res.send(error)
    }
});
router.delete('/removeUser', authenticateToken, async (req, res) => {
    try {

        const { plannerId } = req.query
        const currentId = req.query.userId
        const io = req.app.locals.io

        const email = req.query.user
        const planner = await Planner.findOne({ _id: plannerId })
        const findUser = planner.users.find((user) => {
            return user.email == email
        })
        if (!findUser) {
            throw { error: 'this user is not cadastred in this planner.' }
        }
        const currentUser = await User.findOne({ _id: currentId })
        const userAcess = planner.users.find((element) => {
            return element.email == currentUser.email
        })
        if (userAcess.acess !== 'total') {
            throw { error: "You seems don't have permission to remove a user from this planner." }
        }
        const contact = await User.findOne({ email })
        if (contact.acess == 'total') {
            throw { error: "This user has full access to the planner, it will only be removed if he leaves by his own will." }
        }

        const newUser = await User.findOne({ email: email })
        if (!newUser) {
            throw { error: "we didn't find this record in our database." }
        }

        await User.findOneAndUpdate({ email: email }, {
            $pull: {
                planners: {
                    plannerId: planner._id,
                }
            }
        })

        await Planner.findOneAndUpdate({ _id: plannerId }, {
            $pull: {
                users: {
                    email: email,
                }
            }
        })

        const currentPlanner = await Planner.findOne({ _id: plannerId })

        io.to(plannerId).emit('currentUsers', currentPlanner.users)
        return res.send('ok')

    } catch (error) {
        return res.send(error)
    }
});

router.post('/newUser', authenticateToken, async (req, res) => {
    try {
        const { plannerId, name, desciption } = req.body.params
        const io = req.app.locals.io
        const { id } = req.query
        const email = req.body.params.user.email
        const planner = await Planner.findOne({ _id: plannerId })
        const findUser = planner.users.find((user) => {
            return user.email == req.body.params.user.email
        })
        if (findUser) {
            throw { error: 'this user is already cadastred in the planner.' }
        }
        const currentUser = await User.findOne({ _id: req.body.params.userId })
        const acess = planner.users.find((element) => {
            return element.email == currentUser.email
        })
        if (acess == undefined || acess.acess !== 'total') {
            console.log('acess')
            throw { error: "You seems don't have permission to add a new user in this planner." }
        }
        const newUser = await User.findOne({ email: email })
        if (!newUser) {
            throw { error: "we didn't find this record in our database." }
        }

        await User.findOneAndUpdate({ email: email }, {
            $push: {
                planners: {
                    name: planner.name,
                    plannerId: planner._id,
                    acess: req.body.params.user.permission,
                }
            }
        })

        await Planner.findOneAndUpdate({ _id: plannerId }, {
            $push: {
                users: {
                    name: newUser.name,
                    email: newUser.email,
                    acess: req.body.params.user.permission,
                }
            }
        })

        const currentPlanner = await Planner.findOne({ _id: plannerId })
        io.to(plannerId).emit('currentUsers', currentPlanner.users)
        return res.send('ok')

    } catch (error) {
        return res.send(error)
    }
});


module.exports = app => app.use('/planner', router)