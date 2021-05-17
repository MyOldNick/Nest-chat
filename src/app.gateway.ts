import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';

//helpers
import createMessage from '../helpers/messageCreator';
import sendSpam from '../helpers/spamMessage'

@WebSocketGateway()
export class AppGateway implements OnGatewayConnection, OnGatewayInit, OnGatewayDisconnect {

  @WebSocketServer()
  server: Server;

  users = [];


  afterInit(server: Server): any {
    console.log('server init');

    this.users = [
      {
        name: 'Echo Bot',
        id: 1,
        avatar: 'https://www.m24.ru/b/d/nBkSUhL2hFQmncmwL76BrNOp2Z318Ji-miDHnvyDoGuQYX7XByXLjCdwu5tI-BaO-42NvWWBK8AqGfS8kjIzIymM8G1N_xHb1A=DuEKGyzMcLXDjjbxhxLt6Q.jpg',
        socketId: null,
        online: true
      },
      {
        name: 'Reverse Bot',
        id: 2,
        avatar: 'https://images.prismic.io/doge/969221d4-45bd-4b72-9469-0c6809427c2f_2.jpg?auto=compress,format&rect=0,106,735,735&w=456&h=456',
        socketId: null,
        online: true
      },
      {
        name: "Spam Bot",
        id: 3,
        avatar: 'https://i.pinimg.com/474x/8c/61/78/8c61788fe4ec3854e2751e1082307590.jpg',
        socketId: null,
        online: true
      },
      {
        name: "Ignore Bot",
        id: 4,
        avatar: 'https://u.kanobu.ru/editor/images/43/d2af8c86-0513-42a4-a87d-9a548084040c.png',
        socketId: null,
        online: true
      }
    ]


  }

  handleConnection(@ConnectedSocket() client: Socket, ...args: any[]): any {

    console.log(`User connected, socket id - ${client.id}`);


  }

  handleDisconnect(@ConnectedSocket() client: Socket): void {

    console.log(`User disconnected, socket id - ${client.id}`);

    const user = this.users.find(el => el.socketId === client.id);

    if (user) user.online = false;

    this.server.emit('updateUsers', this.users);

  }

  @SubscribeMessage('enter')
  handleUser(@ConnectedSocket() client: Socket, @MessageBody() payload: any): void {

    const user = this.users.find(el => el.id === payload.id);

    if (user) {
      user.online = true;

      user.socketId = client.id;
    } else {
      const user = payload;

      user.online = true;

      user.socketId = client.id;

      this.users.push(user);

    }

    this.server.emit('updateUsers', this.users);

    sendSpam(this.server, client.id, payload, this.users[2])


  }

  @SubscribeMessage('newMessage')
  handleMessage(@ConnectedSocket() client: Socket, @MessageBody() payload: any): void {

    if (payload.recipient.id === 1) {
      const msg = createMessage(payload);


      this.server.to(client.id).emit('message', payload);

      this.server.to(client.id).emit('message', msg);

    } else if (payload.recipient.id === 2) {

      const msg = createMessage(payload);

      msg.text = msg.text.split('').reverse().join('');

      this.server.to(client.id).emit('message', payload);

      setTimeout(() => {

        this.server.to(client.id).emit('message', msg);

      }, 3000);

    } else {

      this.server.to(payload.socketId).to(client.id).emit('message', payload);

    }


  }

}
