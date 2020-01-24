const users = []

// addUser, removeUser, getUser, getUsersInRoom

const addUser = ({id, username, room}) => {
    // Clean the data
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    // Validate the date
    if (!username || !room) {
        return {
            error: 'Username and Room are required!'
        }
    }

    // Check for existing user
    const existingUser = users.find( (user) => {
        return user.room === room && user.username === username
    });
    // Validate Username
    if (existingUser) {
        return {
            error: 'Username is in use!'
        }
    }

    // Only going to run if all the validations pass
    // Store user
    const user = {id, username, room};
    users.push(user);
    return { user }
}

const removeUser = (id) => {
    const index =users.findIndex( (user) => user.id === id);
    
    if(index !== -1) {
        return users.splice(index, 1)[0]
    }
}


getUser =(id) => {
    return users.find( (user) => user.id === id)
 }
 
 getUsersInRoom = (room) => {
    const usersInRoom = users.filter( (user) => user.room === room)
    if(usersInRoom === undefined) {
        usersInRoom = [];
    }
    return usersInRoom
 }

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}

// addUser({
//     id: 22,
//     username: ' Andrew  ',
//     room: '  room 1  '
// });


// addUser({
//     id: 33,
//     username: ' mead  ',
//     room: '  room 1  '
// });


// addUser({
//     id: 44,
//     username: ' hawa  ',
//     room: '  room 2  '
// });

// console.log(users)

// const removedUser = removeUser(22);

// console.log('removedUser',removedUser);
// console.log(users);


// const res  = addUser({
//     id: 33,
//     username: 'Andrew',
//     room: 'room 1'
// });

// console.log(res)


// console.log( getUser(33))
// console.log( getUsersInRoom('room 5'))