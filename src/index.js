// for public directory
const path = require('path');

const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const {addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));

// let count = 0;

// server (emit) -> client (recieve) - contUpdated
// client (emit) -> server (recieve) - increment

// io.on will only be used with the event connection, other methods will be used for all other events
io.on('connection', (socket) => { // socket is an object and it contains infromation about that connection, so we can use methods on socket to communicate with that specific client
    console.log('New WebSocket connection');

    // // to send an event from the server we use socket.emit 
    // socket.emit('countUpdated', count);

    // socket.on('increment', () => {
    //     count++
    //     // emits the event to the client firing the call
    //     // socket.emit('countUpdated', count);
    //     // emit the event to all clients
    //     io.emit('countUpdated', count);
    // });

// server (emit) -> client (recieve) --acknowledgement --> server
// client (emit) -> server (recieve) --acknowledgement --> client

    
    socket.on('join', ({username, room} /* or options */, callback) => {
        const { error, user } = addUser({id: socket.id, username, room} /* or {id: socket.id, ...options} */);

        if(error) {
            callback(error);
        } 
        else {
            socket.join(user.room)
            
            // emits the event to the client firing the call
            socket.emit('message', generateMessage('Admin' ,'Welcome!'));

            // emit the event to all clients except the current client
            socket.broadcast.to(user.room).emit('message', generateMessage('Admin',`${user.username} has joined`));
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
            callback();
            // socket.emit, io.emit, socket.broadcast.emit
            // io.to.emit, socket.broadcast.to.emit
        }
    })

    //the method callback is called to acknoledge the event
    socket.on('sendMessage', (message, callback) => {
        const filter = new Filter();
        if(filter.isProfane(message)) {
            return callback('Profanity is not allowed')
        }

        const user = getUser(socket.id);

        // emit the event to all clients
        io.to(user.room).emit('message', generateMessage(user.username ,message));
        callback();
    });
    
    socket.on('sendLocation', (coOrdinates, callback) => {
        // socket.broadcast.emit('message', `https://google.com/maps?q=${coOrdinates.latitude},${coOrdinates.longitude}`)
        user = getUser(socket.id);
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username,`https://google.com/maps?q=${coOrdinates.latitude},${coOrdinates.longitude}`));
        callback('Location Shared!');
    });

    // when we want to listen on a client disconnecting we use the following method for the built in event inside of the callback of io.on connection 
    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('message', generateMessage('Admin',`${user.username} has left`));
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    });
})

server.listen(port, () => {
    console.log(`Server is up on port ${port} !`);
});

