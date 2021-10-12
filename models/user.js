const mongoose = require('../database/index')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        require: true
    },
    email:{
        type: String,
        required: true,
        lowercase: true,
        unique: true
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
    forgetCode: {
        type: String,
        required: false,
    },
    forgetAt: {
        type: Date,
        required: false,
    },
    ValidUser:{
        type: Boolean,
        required: true,
    },
    ValidUserCode: {
        type: String,
        required: false,
    },
    ValidUserCodeAt: {
        type: Date,
        required: false,
    },
    planners:[{
        name:{            
            type: String,
            require: true
        },
        plannerId:{
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
        stage:{
            type: String
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