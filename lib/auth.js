import 'dotenv/config'
import jwt from 'jsonwebtoken'

export default function authToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token === null) return res.status(401).json({ success: false, message: 'Token needed' })

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.status(401).json({ success: false, message: 'Invalid or expired token' })
        req.user = user
        next()
    })
}