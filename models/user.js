const mongoose = require('../database/index')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        require: true
    },
    email:{
        type: String,
        unique: true,
        required: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    CreatedAt: {
        type: Date,
        default: Date.now
    },
    dashboards:[{
        name:{            
            type: String,
            require: true
        },
        permissions:{
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
    }]
})

userSchema.pre('save', async function(next) {
    const hash = await bcrypt.hash(this.password, 10)
    this.password = hash
    next()
})

const user = mongoose.model('user', userSchema)
module.exports = user