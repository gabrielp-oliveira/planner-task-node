const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
require('dotenv').config()
const User = require('../models/user')
const { validateEmail } = require('../utils/regex')

const { authenticateToken } = require('../middlewares/authenticateToken')

const sendEmail = require('../nodeMailer/index')
const randomCode = require('../utils/randomCode')
const getDateRange = require('../utils/getDateRange')

router.post('/register', async (req, res) => {

    try {
        const { email, name, password } = req.body
        if (!email && !name && !password) throw { error: 'Please, fill the fields below.' }
        if (!name) throw { error: 'Name field is empty' }
        else if (name.length <= 3) throw { error: 'Name too short' }
        if (!email) throw { error: 'Email field is empty' }
        if (!password) throw { error: 'Password field is empty' }
        else if (password.length <= 2) throw { error: 'Password shorter than 3 caracteres.' }
        else if (password.length >= 9) throw { error: 'Password bigger than 8 caracteres.' }
        if (!validateEmail(email)) throw { error: 'Error, use a valid email' }
        const title = 'Verify account'
        const message = 'if you have not requested to create a account in the planner, please ignore this email'
        const SecondMessage = 'Acess the planner and use your email and the token to verify your account. this token will expire in 20 min.'
        const code = randomCode(10)

        if (await User.findOne({ email })) {
            let currentUser = await User.findOne({email})

            if(currentUser.ValidUser == true){
                throw { error: 'Email alread registred.' }
            }

            await User.findOneAndUpdate({ email }, {
                $set: { ValidUserCode: code }
            })
            await User.findOneAndUpdate({ email }, {
                $set: { ValidUserCodeAt: Date.now() }
            })
            let userCode = await User.findOne({email})


            setTimeout(async () => {
                await sendEmail(title,'Planner Register', message, userCode.ValidUserCode, process.env.URL + 'forgotpassword', email, SecondMessage, res);
            }, 1000);
            throw { error: 'Email alread registred, another code was sended to your email. This code its valid for 20 min.' }
        }else{
            await User.create({
                email, password, name,
                ValidUserCode: code,
                ValidUser: false,
                ValidUserCodeAt: Date.now()
            })

            
            const userInfo = await User.findOne({ email })
            userInfo.password = undefined
            
            sendEmail(title,'Planner Register', message, code, process.env.URL + 'forgotpassword', email, SecondMessage, res);
        
            return res.send({ ok: 'ok' })
                
                
            }
    } catch (err) {
        return res.send( err )
    }

})

router.post('/confirmCode', async (req, resp) => {

    try {
        const { email, token } = req.body
        const userInfo = await User.findOne({ email })

        if (userInfo == null) {
            throw { error: 'email invalid.' }
        }
        if (userInfo.ValidUserCode.toLowerCase() !== token.toLowerCase()) {
            throw { error: 'token invalid.' }
        }

        if (getDateRange(userInfo.forgetAt, Date.now()) >= 20) {
            throw { error: 'expired time.' }
        }
        if (userInfo.ValidUser == true) {
            throw { error: 'User already validated' }
        }


        await User.findOneAndUpdate({ email }, {
            $set: { ValidUser: true }
        })
        await User.findOneAndUpdate({ email }, {
            $set: { ValidUserCode: '' }
        })

        return resp.send({ok: 'ok'})

    } catch (error) {
        return resp.send(error)
    }
})


router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body
        if (!email && !password) throw { error: 'Please, fill the fields below.' }
        if (!password) throw { error: 'Password field is empty' }
        if (!email) throw { error: 'Email field is empty' }


        const userInfo = await User.findOne({ email }).select('+password')
        if (userInfo == null) {
            throw { error: 'User not found' }
        }
        if (userInfo.ValidUser !== true) {
            throw { error: 'User not validated' }
        }
        else {
            if (await bcrypt.compare(password, userInfo.password)) {
                userInfo.password = undefined
                const token = jwt.sign({ _id: userInfo._id }, process.env.TOKEN_HASH, { expiresIn: 44000 })

                return res.send({
                    token: token,
                    UserId: userInfo._id
                })
            } else {
                throw { error: 'wrong password' }
            }
        }

    } catch (error) {
        return res.send(error)
    }
})


router.post('/forgot', async (req, resp) => {
    const title = 'Recover Password'
    const message = 'if you have not requested to change your planner password, please ignore this email'
    const SecondMessage = 'Acess the planner and use your email and the token to change the password. this token will expire in 20 min.'
    try {
        const { email } = req.body
        const userInfo = await User.findOne({ email })
        if (userInfo == null) {
            throw { error: 'email invalid' }
        }

        await User.findOneAndUpdate({ email }, {
            $set: { forgetAt: Date.now() }
        })
        await User.findOneAndUpdate({ email }, {
            $set: { forgetCode: randomCode(10) }
        })

        const currentUser = await User.findOne({ email: email })

        let url = process.env.URL?process.env.URL:'http://localhost:3000'
        sendEmail(title,'Planner forgot Password', message, currentUser.forgetCode, url + '/forgotpassword', email, SecondMessage, resp);

    } catch (error) {
        return resp.send({ error: error })
    }
})

router.post('/verifyEmail', async (req, resp) => {

    try {
        const { email, token } = req.body
        const userInfo = await User.findOne({ email })

        if (userInfo == null) {
            throw { error: 'email invalid.' }
        }
        if (userInfo.ValidUserCode.toLowerCase() !== token.toLowerCase()) {
            throw { error: 'token invalid.' }
        }



        return resp.send({ ok: userInfo })
    } catch (error) {
        return resp.send(error)
    }
})
router.post('/confirmToken', async (req, resp) => {

    try {
        const { email, token } = req.body
        const userInfo = await User.findOne({ email })
        
        if(userInfo.forgetCode.trim().toLowerCase() != token.trim().toLowerCase()){
            throw { error: 'Token invalid' }
        }
        if (userInfo == null) {
            throw { error: 'email invalid.' }
        }

        return resp.send({ ok: 'ok' })
    } catch (error) {
        return resp.send(error)
    }
})
router.post('/UpdatePassword', async (req, resp) => {

    try {
        const { email, password, token } = req.body
        if (!password.first || !password.second ) throw { error: 'Please, fill the fields below.' }
        if (!password.first) throw { error: 'Please, fill the fields below.' }
        if (!password.second) throw { error: 'Please, fill the fields below.' }
        if (password.first.length <= 2) throw { error: 'Password shorter than 3 caracteres.' }
        if (password.first.length >= 9) throw { error: 'Password bigger than 8 caracteres.' }
        if (password.first !== password.second) {
            throw { error: 'passwords are not compatible.' }
        }
        const userInfo = await User.findOne({ email }).select('+password')
        if (getDateRange(userInfo.forgetAt, Date.now()) >= 20) {
            throw { error: 'expired time.' }
        }

        if (await bcrypt.compare(password.first, userInfo.password)) {
            throw { error: 'this password has already been used, try again' }
        }
        const passwordHash = await bcrypt.hash(password.first, 10)

        await User.findOneAndUpdate({ email }, {
            $set: {
                password: passwordHash
            }
        })

        await User.findOneAndUpdate({ email }, {
            $set: {
                forgetCode: randomCode(11)
            }
        })
        return resp.send({ ok: 'ok' })


    } catch (error) {
        console.log(error)
        return resp.send(error)
    }
})


router.get('/', authenticateToken, async (req, resp) => {
    try {
        const User_ID = req.query.id
        const currentUser = await User.findOne({ _id: User_ID })
        if (currentUser) {
            return resp.send( currentUser )
        } else {
           throw { error: 'error' }
        }

    } catch (error) {
        console.log(error)
        return resp.send({ error: error })
    }
})

module.exports = app => app.use('/auth', router)