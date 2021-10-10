const express = require('express')
const router = express.Router()
require('dotenv').config()

const User = require('../models/user')
const Planner = require('../models/planner')
const Task = require('../models/task')
const { authenticateToken } = require('../middlewares/authenticateToken')
const { authenticatePlanner } = require('../middlewares/authenticatePlanner')

router.post('/newTask', authenticateToken, async (req, res) => {
    try {
        const { Columnid, plannerId, accountable, desciption, title } = req.body.params

        const io = req.app.locals.io
        const user = await User.findOne({ _id: req.query.id })

        const task = await Task.create({
            title: title,
            description: desciption,
            accountable: accountable,
            plannerId: plannerId,
            StageId: Columnid
        })

        await User.findOneAndUpdate({ _id: req.query.id }, {
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

        const userName = user.name.split(' ')



        io.to(plannerId).emit('newTask',
            {
                modalTitle: "New task has been created.",
                createdBy: userName[0],
                title: title,
                createdAt: new Date(),
                userId: user._id,
                taskId: task._id,
                Columnid: Columnid
            }
        )

        return res.send('ok')
    } catch (error) {
        console.log(error)
        return res.send(error)
    }
});

router.get('/', authenticateToken, async (req, res) => {
    try {

        const tasks = await Task.findOne({ _id: req.query.taskId });
        return res.send(tasks)
    } catch (error) {
        res.send(error)
    }
});
router.get('/userTasks', authenticateToken, async (req, res) => {
    try {
        const userEmail = req.query.userEmail
        const tasks = await Task.find({ accountable: {$in : [userEmail] } });
        return res.send(tasks)

    } catch (error) {
        res.send(error)
    }
});
router.delete('/delTask', authenticateToken, async (req, res) => {
    try {
        const io = req.app.locals.io
        const date = Date.now()
        const taskId = req.query.taskId
        
        const tsk = await Task.findOne({ _id: taskId })
        const planner = await Planner.findOne({ _id: tsk.plannerId })
        
        const currentUser = await User.findOne({ _id: req.query.id })
        
        const acess = planner.users.find((element) => {
            return element.email == currentUser.email
        })
        if(acess == undefined || acess.acess == 'total' || acess.acess == 'intermediate'){
            console.log('req')
            await Task.findOneAndUpdate({ _id: taskId }, {
                $set: { deleted: true, deletedAt: date }
            })
        }else{
            console.log('req')
            throw {error: "You seems don't have permission to delete a task."}
            
        }
        console.log('2')
        io.to(tsk.plannerId).emit('delTask', taskId)
        return res.send({ ok: 'ok' })
    } catch (error) {
        res.send(error)
    }
});
router.put('/update', authenticateToken, async (req, res) => {
    try {
        const io = req.app.locals.io
        const task = req.body.params.updatedTask
        const plannerId = req.body.params.plannerId

        const planner = await Planner.findOne({_id: task.plannerId})
        const currentUser = await User.findOne({ _id: req.query.id })


        const acess = planner?.users.find((element) => {
            return element.email == currentUser.email
        })
        if( acess == undefined || (acess.acess !== 'total' && acess.acess !== 'intermediate') ){
            throw {error: "You seems don't have permission to make changes in a task."}
        }
        await Task.findOneAndReplace({_id: task._id}, task)

        planner.stages.forEach( async (stag ) => {
            const taskList = await Task.find({StageId: stag._id})
            if(taskList.length > 0){
                stag.tasks = taskList
            }
        });
        setTimeout(() => {
            io.to(task.plannerId).emit('updateTaskInfo', planner.stages)
        }, 100);
        const abc = await Task.findOne({_id: task._id})
        return res.send({ ok: 'ok' })
    } catch (error) {
        console.log(error)
        return res.send(error)
    }
});
router.put('/updateTaskPosition', async (req, res) => {
    try {
        const io = req.app.locals.io
        const { columns, plannerId, userId } = req.body.params
        io.to(plannerId).emit('changeTask', columns)


        const col = []
        // console.log(columns[1].tasks)
        Object.entries(columns).forEach((el) => {
            el[1].tasks?.forEach((tsk) => {
                tsk.StageId = el[1]._id
            })
            col[el[0]] = el[1]
        })
        const tasks = []
        col.forEach((el) => {
            el.tasks?.forEach(async (tsk) => {
                tasks.push({
                    StageId: tsk.StageId,
                    TaskId: tsk._id
                })
                await Task.findOneAndUpdate({ _id: tsk._id }, {
                    $set: { StageId: tsk.StageId }
                })

            })
            el.tasks = []
        })


        const teste = await Planner.findOneAndUpdate({ _id: plannerId }, {
            $set: { tasks }
        }, (err, resolv) => {
            if (err) {
                console.log(err)
            }
        })

        return res.send({ ok: 'ok' })
    } catch (error) {
        console.log(error)
        res.send(error)
    }
});



module.exports = app => app.use('/task', router)
