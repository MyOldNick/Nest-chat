//types
import { Server } from "socket.io";
import { User } from '../types/types'

const sendSpam = (server: Server, socketId: string, recipient: User, author: User): void => {

  const time: number = Math.floor(Math.random() * (120000 - 10000) + 10000);

  setTimeout(() => {
    
    server.to(socketId).emit('message', {
      author,
      recipient,
      text: 'Задонать мне на печеньку',
      socketId: undefined,
      created: new Date(),
    });

    sendSpam(server, socketId, recipient, author);
  }, time);
};

export default sendSpam;
