const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')

const app = express()
const server = http.createServer(app)
const io = socketio(server)
const { generateMessge, generateLocation } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {
    console.log('New Websocket connection')

    socket.on('join', (options, callback) => {
        const { error, user } = addUser({id: socket.id, ...options})

        if(error){
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message', generateMessge('Admin', `Hi ${user.username}, Welcome to Chat App!`))
        socket.broadcast.to(user.room).emit('message', generateMessge('Admin', `${user.username} has joined the room!`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
    })

    socket.on('sendMessage', (messageText, callback) => {
        const user = getUser(socket.id)
        const filter = new Filter()

        if(filter.isProfane(messageText)){
            return callback(`Profanity is not allowed!`)
        }
        io.to(user.room).emit('message', generateMessge(user.username, messageText))
        callback()
    })

    socket.on('sendLocation', (location, callback) => {
        const user = getUser(socket.id);
        const messageText = `https://google.com/maps?q=${location.lat},${location.lng}`;
        io.to(user.room).emit('locationMessage', generateLocation(user.username, messageText))
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message', generateMessge('Admin', `${user.username} has left the chat`));
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})

server.listen(port, () => {
    console.log("Server is up on port " + port);
})