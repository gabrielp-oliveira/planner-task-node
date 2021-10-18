const jwt = require('jsonwebtoken')

async function authenticateToken(req, res, next) {
    try {
        const authHeader = req.headers.authentication
        if (authHeader == null) return res.status(401).send({ error: 'token nullo' })

        const token = authHeader.split(' ')
        if (!token.length == 2) {
            return res.status(401).send({ error: 'token error' })
        }


        if (await jwt.decode(token[1]) == null) return res.send({ error: 'jwt error, null' })
        if (await jwt.decode(token[1])._id == req.query.id) {

            await jwt.verify(token[1], process.env.TOKEN_HASH, (err, useres) => {
                if (err) {
                    return res.send({ error: 'jwt expired' })
                }
                req.user = useres
                next()
            })
        }
    }
    catch {
        console.log('err')
        return res.send({ error: 'jwt error' })

    }

}

module.exports = { authenticateToken }