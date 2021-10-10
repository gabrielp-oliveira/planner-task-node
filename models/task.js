const mongoose = require('../database/index')


const TaskSchema = new mongoose.Schema({
    title:{
        type: String,
        require: true
    },
    description:{
        type: String,
        lowercase: true
    },

    CreatedAt: {
        type: Date,
        default: Date.now
    },
    accountable: [{
        type: String,
    }],
    StageId:{
        type: String,
        require: true
    },
    plannerId:{
        type: String,
        require: true
    },
    deleted: {
        type: Boolean,
        require: false
    },
    deletedAt:{
        type: Date,
        require: false
    },
    priority:{
        type: String,
        require: false
    },
    status:{
        type: String,
        require: false
    }
})

const Task = mongoose.model('task', TaskSchema)
module.exports = Task