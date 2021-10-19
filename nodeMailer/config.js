require('dotenv').config()

module.exports ={
    user: process.env.Email,
    clientId: process.env.clientId,
    clientSecret: process.env.clientSecret,
    refresh_token: process.env.refresh_Token
}