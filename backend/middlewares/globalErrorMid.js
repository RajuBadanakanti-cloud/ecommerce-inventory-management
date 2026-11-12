

const globalMiddleware = (err, req, res, next) =>{
        const statusCode = err.statusCode || 500
        return res.status(statusCode).json({
            status:"failed",
            message: err.message || "Internal server Error!"
        })
}

export default globalMiddleware 