const io = require('socket.io')(7777, {
  path: '/ws'
});

let users = [];

io.on('connection', socket => {
  socket.emit('update', { data: "hello world" });

  socket.on('createUser', data => {
    users.push({ socketId: socket.id, username: data.username });
    console.log('createUser: ', users);
  })

  socket.on('setUsername', data => {
    users.find((user, index) => {
      if (user.socketId === socket.id) {
        users[index]['username'] = data.username;
      }
    });
    console.log('setUsername: ', users);
  });

  socket.on('disconnect', () => {
    users.find((user, index) => {
      if (user.socketId === socket.id) {
        users.splice(index, 1);
      }
    });
    console.log('disconnect: ',users);
  })
});
