const mongoose = require('mongoose')
require('dotenv').config()

mongoose.Promise = global.Promise

let db = process.env.MONGO_DB_ACESS?process.env.MONGO_DB_ACESS:'mongodb://localhost/stp'
mongoose.connect(db, {useNewUrlParser: true, useUnifiedTopology: true})
.then( () => {
        console.log('mongoDB started ')
    }).catch((err) => {
        console.log('MongoDB ERROR - '+ err)
    })

module.exports = mongoose