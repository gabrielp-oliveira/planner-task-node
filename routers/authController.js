const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
require('dotenv').config()
const User = require('../models/user')

const { authenticateToken } = require('../middlewares/authenticateToken')

router.post('/register',  async (req, res) => {
    
    try {
        const { email, name, password } = req.body
        // if (!email && !name && !password) return res.send({ error: 'Please, fill the fields below.' })
        // if (!name) return res.send({ error: 'Name field is empty' })
        // else if (name.length <= 3) return res.send({ error: 'Name too short' })
        // if (!email) return res.send({ error: 'Email field is empty' })
        // if (!password) return res.send({ error: 'Password field is empty' })
        // else if (password.length <= 3) return res.send({ error: 'Password shorter than 3 caracteres.' })
        // else if (password.length >= 10) return res.send({ error: 'Password bigger than 10 caracteres.' })
        // if (!validateEmail(email)) return res.send({ error: 'Error, use a valid email' })
        
        
        if (await User.findOne({ email })) {
                return res.send({ error: 'Email alread registred' })
            } else {
                
            const userInfo = await User.create(req.body)

            userInfo.password = undefined
            const token = jwt.sign({ id: userInfo._id }, process.env.TOKEN_HASH, { expiresIn: 44000 })
            return res.send({
                userValid: true,
                token:'bearer '+ token,
                UserId: userInfo._id
            })

        }

    } catch (err) {
        console.log(err)
        return res.send({ error: err })
    }

})


router.post('/login', async (req, res) => {
try {
    const { email, password } = req.body
    // if (!email && !password) return res.send({ error: 'Please, fill the fields below.' })
    // if (!password) return res.send({ error: 'Password field is empty' })
    // if (!email) return res.send({ error: 'Email field is empty' })


    const userInfo = await User.findOne({ email }).select('+password')
    if (userInfo == null) {
        return res.send({ error: 'User not found' })
    }
    else {
        if (await bcrypt.compare(password, userInfo.password)) {
            userInfo.password = undefined
            const token = jwt.sign({ _id: userInfo._id }, process.env.TOKEN_HASH, { expiresIn: 44000 })

            return res.send({
                userValid: true,
                token: token,
                UserId: userInfo._id
            })
        } else {
            return res.send({ error: 'senha incompativel' })
        }
    }

} catch (error) {
    res.send(error)
}
})


router.post('/forgot', async (req, resp) => {
    try {
        const { email } = req.body
        const userInfo = await User.findOne({ email }).select('+password')
        if (userInfo == null) {
            return resp.send({error: 'email invalid'})
        }else{
            // mandar o email por aqui e depois retorna o ok
            return resp.send({ok: 'ok1'})

        }


    } catch (error) {
        return resp.send({ error: 'error' })
    }
})
router.get('/',authenticateToken, async (req, resp) => {
    try {
        const User_ID = req.query.id
        const currentUser = await User.findOne({ _id: User_ID })
        if (currentUser) {
            return resp.send({userInfo: currentUser,userValid: true } )
        } else {
            return res.status(400).send({ error: 'error' })
        }

    } catch (error) {
        console.log(error)
        return resp.send({ error: error })
    }
})

module.exports = app => app.use('/auth', router)