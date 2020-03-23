const io = require('socket.io')(7777, {
  path: '/ws'
});

let users = [];

io.on('connection', socket => {
  socket.emit('update', { data: "hello world" });

  socket.on('setUsername', data => {
    console.log(`Socket ${socket.id} setUsername: ${data.username}`);
    users.push({ socketId: socket.id, username: data.username });
    console.log(users);
  })
});
