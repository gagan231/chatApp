const generateMessge = (username, text) => {
    return {
        username,
        text,
        createdAt: new Date().getTime()
    }
}

const generateLocation = (username, url) => {
    return{
        username,
        url,
        createdAt: new Date().getTime()
    }
}

module.exports = {
    generateMessge,
    generateLocation
}