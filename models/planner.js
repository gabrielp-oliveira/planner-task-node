const mongoose = require('../database/index')
const bcrypt = require('bcryptjs')

const plannerSchema = new mongoose.Schema({
    name:{
        type: String,
        require: true
    },
    desciption:{
        type: String,
        lowercase: true
    },

    CreatedAt: {
        type: Date,
        default: Date.now
    },
    users:[{
        name:{            
            type: String,
            require: true
        },
        email:{
            type: String,
            require: true
        },
        acess:{
            type: String,
            required: true,
        }
    }],
    stages:[{
        StageName:{
            type: String,
            require: true
        },
        StageDesc: {
            type: String,
        },
        tasks:[{}]

    }],

    tasks:[{
        StageId:{
            type: String,
            require: true
        },
        TaskId:{
            type: String,
            require: true
        }
    }]
})


const planner = mongoose.model('planner', plannerSchema)
module.exports = planner