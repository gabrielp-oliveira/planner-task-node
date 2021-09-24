const express = require('express')
const router = express.Router()
require('dotenv').config()

const User = require('../models/user')
const Planner = require('../models/planner')
const Task = require('../models/task')
const { authenticateToken } = require('../middlewares/authenticateToken')
const { authenticatePlanner } = require('../middlewares/authenticatePlanner')

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

        const currentUser = await User.findOne({ _id: req.query.id })
        const acess = planner.users.find((element) => {
            return element.email == currentUser.email
        })


        
        planner.stages.forEach( async (stag ) => {
            const taskList = await Task.find({StageId: stag._id})
            if(taskList.length > 0){
                stag.tasks = taskList
            }
        });

        setTimeout(() => {      
            return res.send({ planner, acess: acess.acess })
        }, 100);
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
            console.log('foi')
            return res.send('removido')
        } else {
            console.log('ainda a tratar')
            return res.send('ainda a tratar')
        }

    } catch (error) {
        res.send(error)
    }
});

router.get('/task', async (req, res) => {
    try {

        const tasks = await Task.find();

        return res.send(tasks)
    } catch (error) {
        res.send(error)
    }
});

router.post('/newColumn', authenticateToken, async (req, res) => {
    try {
        const { plannerId, name, desciption } = req.body.params
        const { id } = req.query
        console.log(req.body)
        await Planner.findOneAndUpdate({ _id: plannerId },
            {
                $push: {
                    stages: {
                        StageName: name,
                        StageDesc: desciption
                    }
                }
            })

        return res.send('ok')

    } catch (error) {
        return res.send(error)
    }
});

router.post('/newTask', authenticateToken, async (req, res) => {
    try {
        const { Columnid, plannerId, accountable, desciption, title } = req.body.params
        
        const task = await Task.create({
            title: title,
            description: desciption,
            accountable: accountable,
            PlanenrId: plannerId,
            StageId: Columnid
        })

        console.log(task)

        await User.findOneAndUpdate({_id: req.query.id},{
            $push: {
                tasks: {
                    TaskId: task._id
                }
            }
        })

        await Planner.findOneAndUpdate({ _id: plannerId },
            {
                $push: {
                    tasks: {
                        StageId: Columnid,
                        TaskId: task._id
                    }
                }
            })

        




        return res.send('ok')

    } catch (error) {
        console.log(error)
        return res.send(error)
    }
});



module.exports = app => app.use('/planner', router)