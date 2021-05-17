//sockets
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
//constants
import { BOTS } from '../constants/bots'
//types
import { User, Message } from '../types/types'

@WebSocketGateway()
export class AppGateway implements OnGatewayConnection, OnGatewayInit, OnGatewayDisconnect {

  @WebSocketServer()
  server: Server;

  users: Array<User> = [];


  afterInit(server: Server): void {
    console.log('server init');

    this.users = BOTS

  }

  handleConnection(@ConnectedSocket() client: Socket, ...args: any[]): void {

    console.log(`User connected, socket id - ${client.id}`);

  }

  handleDisconnect(@ConnectedSocket() client: Socket): void {

    console.log(`User disconnected, socket id - ${client.id}`);

    const user: User = this.users.find(el => el.socketId === client.id);

    if (user) user.online = false;

    this.server.emit('updateUsers', this.users);

  }

  @SubscribeMessage('enter')
  handleUser(@ConnectedSocket() client: Socket, @MessageBody() payload: User): void {

    const user: User = this.users.find(el => el.id === payload.id);

    if (user) {

      user.online = true;

      user.socketId = client.id;

    } else {

      const user: User = payload;

      user.online = true;

      user.socketId = client.id;

      this.users.push(user);

    }

    this.server.emit('updateUsers', this.users);

    sendSpam(this.server, client.id, payload, this.users[2])


  }

  @SubscribeMessage('newMessage')
  handleMessage(@ConnectedSocket() client: Socket, @MessageBody() payload: Message): void {

    if (payload.recipient.id === 1) {

      const msg: Message = createMessage(payload);

      this.server.to(client.id).emit('message', payload);

      this.server.to(client.id).emit('message', msg);

    } else if (payload.recipient.id === 2) {

      const msg: Message = createMessage(payload);

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
