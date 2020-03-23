const server = require('http').createServer();
const io = require('socket.io')(server, {
  path: '/ws'
});

server.listen({ host: "192.168.1.249", port: 7777 });

let users = [];

io.on('connection', socket => {
  let user = createUser(socket.id, getRandomInt());
  user ? socket.emit('createUser', user) : '';

  socket.on('setUsername', data => {
    users.find((user, index) => {
      if (user.socketId === socket.id) {
        users[index]['username'] = data.username;
      }
    });
    console.log('setUsername: ', users);
  });

  socket.on('sendMessage', data => {
    io.emit('sendMessage', { username: getUsername(socket.id), msg: data });
  })

  socket.on('disconnect', () => {
    users.find((user, index) => {
      if (user && user.socketId === socket.id) {
        users.splice(index, 1);
      }
    });
  })
});

function getUsername(socketId) {
  let user = users.find((user => user.socketId === socketId));
  return user.username;
}

function createUser(socketId, randomInt) {
  let found = users.find(user => user.username === `user-${randomInt}`);
  if (found) {
    createUser(socket.id, getRandomInt());
  } else {
    let user = { socketId: socketId, username: `user-${getRandomInt()}` };
    users.push(user);
    return user;
  }
}

function getRandomInt() {
  return Math.floor(Math.random() * Math.floor(9999));
}