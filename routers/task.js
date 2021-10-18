const express = require('express')
const router = express.Router()
require('dotenv').config()

const getDateRange = require('../utils/getDateRange')
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
        const graphValues = { none: 0, interrupted: 0, 'waiting more details': 0, priority: 0, progressing:0 }

        const task = await Task.create({
            title: title,
            description: desciption,
            accountable: accountable,
            plannerId: plannerId,
            StageId: Columnid,
            deleted: false
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
        await Task.findOneAndUpdate({ _id: task._id },
            {
                $set: {
                    deleted: false
                }
            })

        const userName = user.name.split(' ')


        const planner = await Planner.findOne({_id: plannerId})



        
        for(let i = 0; i <= planner.stages.length +1; i++){
            if(planner.stages[i] == undefined){
                io.to(plannerId).emit('newTask',
                {
                    modalTitle: "New task has been created.",
                    createdBy: userName[0],
                    title: title,
                    createdAt: new Date(),
                    userId: user._id,
                    taskId: task._id,
                    Columnid: Columnid,
                    columns: planner.stages
                }
            )
            }else{
                const taskToAdd = await Task.find({ StageId: planner.stages[i]._id, deleted: false })
                if (taskToAdd.length > 0) {
                    planner.stages[i].tasks = taskToAdd
                }
            }
        }
        for(let i = 0; i <= planner.tasks.length +1; i++){
            if(planner.tasks[i] == undefined){
                const taskToRemove = await Task.find({ plannerId: plannerId, deleted: true })

                io.to(plannerId).emit('restoreTask', {task: taskToRemove, graphValues})
                return res.send('ok')
            }

            const ttask = await Task.findOne({_id: planner.tasks[i].TaskId})

            if(ttask.deleted == false || ttask.deleted == undefined){
                graphValues[ttask.status? ttask.status : 'none'] = graphValues[ttask.status? ttask.status : 'none'] + 1
            }
        }
        return res.send('ok')
    } catch (error) {
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
        const tasks = await Task.find({ accountable: { $in: [userEmail] } });
        return res.send(tasks)

    } catch (error) {
        res.send(error)
    }
});
router.post('/restoreTask', authenticateToken, async (req, res) => {
    try {
        const io = req.app.locals.io
        const taskId = req.body.params.taskId
        const task = await Task.findOne({ _id: taskId })
        const graphValues = { none: 0, interrupted: 0, 'waiting more details': 0, priority: 0, progressing:0 }
        await Task.findOneAndUpdate({ _id: taskId }, {
            $set: { deleted: false }
        })

        const planner = await Planner.findOne({ _id: task.plannerId })

        const currentUser = await User.findOne({ _id: req.query.id })

        const acess = planner.users.find((element) => {
            return element.email == currentUser.email
        })
        if (acess == undefined || acess.acess == 'total' || acess.acess == 'intermediate') {
            const currentTask = await Task.find({ plannerId: task.plannerId, deleted: true})

            planner.stages.forEach(async (stag) => {
                const tasks = await Task.find({ StageId: stag._id})
                stag.tasks = tasks
            })
            for(let i = 0; i <= planner.tasks.length +1; i++){
                if(planner.tasks[i] == undefined){
                    io.to(task.plannerId).emit('restoreTask', {task: currentTask, graphValues, tasksRestored: planner.stages })
                }

                const ttask = await Task.findOne({_id: planner.tasks[i].TaskId, deleted: false})
                graphValues[ttask?.status? ttask?.status : 'none'] = graphValues[ttask?.status? ttask?.status : 'none'] + 1
                
            }

        } else {
            throw { error: "You seems don't have permission to restore a task." }
        }
        return res.send({ ok: 'ok' })

    } catch (error) {
        return res.send(error)
    }
});

router.delete('/delTask', authenticateToken, async (req, res) => {
    try {
        const io = req.app.locals.io
        const date = Date.now()
        const taskId = req.query.taskId
        const tsk = await Task.findOne({ _id: taskId })
        const planner = await Planner.findOne({ _id: tsk.plannerId })
        const graphValues = { none: 0, interrupted: 0, 'waiting more details': 0, priority: 0, progressing:0 }

        const currentUser = await User.findOne({ _id: req.query.id })

        const acess = planner.users.find((element) => {
            return element.email == currentUser.email
        })
        if (acess == undefined || acess.acess == 'total' || acess.acess == 'intermediate') {
            await Task.findOneAndUpdate({ _id: taskId }, {
                $set: { deleted: true, deletedAt: date }
            })
        } else {
            throw { error: "You seems don't have permission to delete a task." }
        }
        
        planner.stages.forEach(async (stag) => {
            const tasks = await Task.find({ StageId: stag._id, deleted: false})
            if (tasks.length > 0) {
                stag.tasks = tasks
            }
                
            
        })
        
        for(let i = 0; i <= planner.tasks.length +1; i++){
            if(planner.tasks[i] == undefined){
                const deletedTask = await Task.find({ plannerId: tsk.plannerId, deleted: true })

                io.to(tsk.plannerId).emit('delTask', {task: planner.stages, graphValues, deletedTask})
                return res.send({ ok: 'ok' })
            }
            
            const ttask = await Task.findOne({_id: planner.tasks[i].TaskId})
            if(ttask.deleted == false || ttask.deleted == undefined){
                graphValues[ttask.status? ttask.status : 'none'] = graphValues[ttask.status? ttask.status : 'none'] + 1
            }
        }

        
    } catch (error) {
        res.send(error)
    }
});
router.delete('/confirmDelTask', authenticateToken, async (req, res) => {
    try {

        const io = req.app.locals.io
        const taskId = req.query.taskId

        const task = await Task.findOne({ _id: taskId })
        const planner = await Planner.findOne({ _id: task.plannerId })
        const currentUser = await User.findOne({ _id: req.query.id })

        const acess = planner.users.find((element) => {
            return element.email == currentUser.email
        })
        const delList = []
        if (acess == undefined || acess.acess == 'total') {
            if (task.deleted) {

                await Task.findOneAndDelete({ _id: taskId })
                planner.stages.forEach(async (stag) => {
                    const taskList = await Task.find({ StageId: stag._id })
                    taskList.forEach(async (tsk, index) => {
                        if (tsk.deleted == true) {
                            tsk.StageId = stag.StageName
                            delList.push(tsk)
                            taskList.splice(index, 1);

                        }
                    })
                });
                await Planner.findOneAndUpdate({ _id: task.plannerId }, {
                    $pull: { tasks: { TaskId: taskId } }
                })
                setTimeout(() => {
                    io.to(task.plannerId).emit('deletedTask', delList)
                    return res.send(delList)
                }, 1000);

            } else {
                throw { error: "You seems don't have permission to delete THIS task." }
            }
        } else {
            throw { error: "You seems don't have permission to delete a task." }
        }

    } catch (error) {
        return res.send(error)
    }
});
router.put('/update', authenticateToken, async (req, res) => {
    try {
        const io = req.app.locals.io
        const task = req.body.params.updatedTask
        const plannerId = req.body.params.plannerId
        task.deleted = false
        const planner = await Planner.findOne({ _id: task.plannerId })
        const currentUser = await User.findOne({ _id: req.query.id })
        const graphValues = { none: 0, interrupted: 0, 'waiting more details': 0, priority: 0, progressing:0 }

        const acess = planner?.users.find((element) => {
            return element.email == currentUser.email
        })
        if (acess == undefined || (acess.acess !== 'total' && acess.acess !== 'intermediate')) {
            throw { error: "You seems don't have permission to make changes in a task." }
        }
        await Task.findOneAndReplace({ _id: task._id }, task)
       
        for(let i = 0; i < planner.stages.length +1; i++){
            const taskList = await Task.find({ StageId: planner.stages[i]?._id, deleted: false})
            if(planner.stages[i] == undefined){
                io.to(task.plannerId).emit('updateTaskInfo', {columns: planner.stages, graphValues})
                return res.send({ ok: 'ok' })
            }
            planner.stages[i].tasks = taskList
            
            taskList.forEach((el) => {
                graphValues[el.status? el.status : 'none'] = graphValues[el.status? el.status : 'none'] + 1
            })

        }
    } catch (error) {
        return res.send(error)
    }
});
router.put('/updateTaskPosition', async (req, res) => {
    try {
        const io = req.app.locals.io
        const { columns, plannerId, userId } = req.body.params
        io.to(plannerId).emit('changeTask', columns)


        const col = []
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
                throw err
                t
            }
        })

        return res.send({ ok: 'ok' })
    } catch (error) {
        res.send(error)
    }
});

router.get('/usersTasks', authenticateToken, async (req, res) => {
    try {
        const { plannerId, userEmail } = req.query
        const planner = await Planner.findOne({ _id: plannerId })
        const delList = await Task.find({plannerId: plannerId, deleted: true})

        for(let i = 0; i <= planner.stages.length; i++){
            if(planner.stages[i] == undefined){
                return res.send({ planner, delList  })
            }else{
               
                const tasks = await Task.find({ StageId: planner.stages[i]._id, accountable: userEmail})
                tasks.forEach(async (el) => {
                    if(el.deleted == undefined){
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



module.exports = app => app.use('/task', router)
