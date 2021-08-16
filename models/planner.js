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
    tasks:[{
        title:{
            type: String,
            require: true
        },
        status:{
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
        }
    }]
})


const planner = mongoose.model('planner', plannerSchema)
module.exports = planner