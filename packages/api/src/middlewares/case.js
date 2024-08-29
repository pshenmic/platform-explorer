module.exports = (next) => {
    return (request, response) => {
        const keys = Object.keys(request.params)

        if (keys.includes('hash')) {
            request.params.hash = request.params.hash.toUpperCase()
        }

        next(request, response)
    }
}
