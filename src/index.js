const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const path = require('path');
const Filter = require('bad-words');

const {generateMessage, generateLocationMessage} = require('./utils/messages');
const {addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server)

const port = process.env.Port || 3000;

const publicDirectoryPath = path.join(__dirname,'../public');

app.use(express.static(publicDirectoryPath));

// 1
// let count = 0;

io.on('connection',(socket)=>{
    console.log('socket connection')
    // 1
    // socket.emit('countUpdated',count)

    // socket.on('increment',()=>{
    //     count++;
    //     // socket.emit('countUpdated',count)     //emit single connection ,2 console one change made no reflection on another
    //     io.emit('countUpdated',count)    //emit to all connections,2 console one change made both reflect change
    // })

    // 2

    // socket.on('join',({username, room}, callback)=>{
    //     const {error, user} = addUser({ id : socket.id, username, room})
    // or
    socket.on('join',(options, callback)=>{
        const {error, user} = addUser({ id : socket.id, ...options});
        if(error){
            return callback(error)
        }

        socket.join(user.room,user.username)

        socket.emit('message',generateMessage('Admin','Welcome!!'));
        socket.broadcast.to(user.room).emit('message',generateMessage('Admin',`${user.username} has joined`));
        io.to(user.room).emit('roomData',{
            room : user.room ,
            users : getUsersInRoom(user.room)
        })
        callback();
    });

    socket.on('sendMessage',(message,callBack)=>{
        const user = getUser(socket.id)
        // const abc = getUsersInRoom(user.room);
        // var people = {}
        // for(var i=0;i<abc.length;i++){
        // people[`${abc[i].username}`] = abc[i].id;
        // }
        const filter = new Filter()
        if(filter.isProfane(message)){
            return callBack('Profanity')
        }
        io.to(user.room).emit('message',generateMessage(user.username, message))
        // io.to(people[user.username]).emit('message',generateMessage(user.username, message))
        callBack();
    });

    socket.on('sendLocation',(location,callback)=>{
        const user = getUser(socket.id)
        // io.emit('message',`Location : ${location.latitude} , ${location.longitude}`)
        io.to(user.room).emit('locationMessage',generateLocationMessage(user.username,`https://google.com/maps?q=${location.latitude},${location.longitude}`))
        callback();
    });

    socket.on('disconnect',()=>{
        const user = removeUser(socket.id)

        if(user){
            io.to(user.room).emit('message',generateMessage('Admin',`${user.username} has left ${user.room} room`))
            io.to(user.room).emit('roomData',{
                room : user.room ,
                users : getUsersInRoom(user.room)
            })
        }
    });
})

server.listen(port,()=>{
    console.log(`port running on ${port}!`)
});

