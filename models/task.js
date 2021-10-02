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
    PlanenrId:{
        type: String,
        require: true
    }
})

const Task = mongoose.model('task', TaskSchema)
module.exports = Task