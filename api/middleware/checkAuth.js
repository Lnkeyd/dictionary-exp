const jwt = require("jsonwebtoken")

module.exports = checkAuth = (req, res, next) => {
    const token = req.cookies.token
    if (!token) {
        return res.status(400).send("no token")
    }

    try {
        jwt.verify(token, process.env.JWT_SECRET)
        // req.body.user = user
        // req.user = user
        return next()
    } catch (error) {
        console.log('Clearing cookie')
        res.clearCookie("token")
        res.status(400).send("invalid token")
        return res.redirect("/")
    }
}