const jwt = require("jsonwebtoken");

module.exports = checkAuth = async (req, res, next) => {
    const accessToken = req.cookies?.accessToken;
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
        res.clearCookie("user");
        return res.status(401).send("no token");
    }

    // Проверяем accessToken
    jwt.verify(accessToken, process.env.JWT_SECRET, (accessTokenError, decodedAccessToken) => {
        if (accessTokenError) {
            console.log("ACCESS TOKEN ERROR: ", accessTokenError);

            // Если accessToken истёк, проверяем refreshToken
            if (!refreshToken) {
                console.log("No refresh token found");
                res.clearCookie("accessToken");
                res.clearCookie("user");
                return res.status(401).send("invalid token");
            }

            jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (refreshTokenError, decodedRefreshToken) => {
                if (refreshTokenError) {
                    console.log("REFRESH TOKEN ERROR: ", refreshTokenError);
                    console.log("Invalid or expired refresh token");
                    res.clearCookie("accessToken");
                    res.clearCookie("refreshToken");
                    res.clearCookie("user");
                    return res.status(401).send("invalid token");
                }

                // Проверяем refreshToken
                console.log("DECODED REF TOKEN: ", decodedRefreshToken);

                // Генерируем новый accessToken
                const newAccessToken = jwt.sign(
                    { id: decodedRefreshToken.id, username: decodedRefreshToken.username }, // Данные для нового токена
                    process.env.JWT_SECRET,
                    { expiresIn: "30m" } // Например, срок действия 30 минут
                );

                // Устанавливаем новый accessToken в cookie
                res.cookie("accessToken", newAccessToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production", // Включаем secure только в production
                    sameSite: "strict",
                    maxAge: 30 * 60 * 1000, // 30 минут
                });

                // Обновляем req.cookies.accessToken вручную
                req.cookies.accessToken = newAccessToken;

                // Передаем управление дальше
                return next();
            });
        } else {
            // Передаем управление дальше
            return next();
        }
    });
};