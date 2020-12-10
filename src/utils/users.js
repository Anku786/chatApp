const users = [];

const addUser = ({ id, username, room }) =>{
    //clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //validate the data
    if(!username || !room){
        return {
            error : 'Username and room are required!!'
        }
    }

    //check for existing user
    const existingUser = users.find((user)=>{
        return user.room == room && user.username == username
    })

    // validate username
    if(existingUser){
        return {
            error : 'username is in use'
        }
    }
    //store user
    const user = {id, username, room}
    users.push(user)
    return {
        user
    }
}

const removeUser = (id) =>{
    const index = users.findIndex((user)=>{
        return user.id === id
    })
    if(index !== -1){
        return users.splice(index , 1)[0]
    }
}

const getUser = (id) => {
    const user = users.find((user)=>{
        return user.id === id
    })
    if(!user){
        return {
            error : 'no user found'
        }
    }
    return user
}

const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase()
    const user = users.filter((user)=>{
        return user.room === room
    })
    if(!user){
        return {
            error : 'no user found'
        }
    }
    return user
}

module.exports = {
    addUser ,
    removeUser ,
    getUser ,
    getUsersInRoom
}