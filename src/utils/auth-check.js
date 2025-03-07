export function authCheck(req, res, next) {
    if (!req?.session?.login_details || !Object.keys(req.session.login_details).length) {
        return res
            .status(401)
            .json({ message: "User not authorized. Please login with valid credentials." });
    }
    next();
}
