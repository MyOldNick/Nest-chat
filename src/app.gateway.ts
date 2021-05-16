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

@WebSocketGateway()
export class AppGateway implements OnGatewayConnection, OnGatewayInit, OnGatewayDisconnect {

  @WebSocketServer()
  server: Server;

  users = [];


  afterInit(server: Server): any {
    console.log('server init');
  }

  handleConnection(@ConnectedSocket() client: Socket, ...args: any[]): any {

    console.log(`User connected, socket id - ${client.id}`);

  }

  handleDisconnect(@ConnectedSocket() client: Socket): void {

    console.log(`User disconnected, socket id - ${client.id}`);

    const user = this.users.find(el => el.socketId === client.id)

    if(user) user.online = false

    this.server.emit('updateUsers', this.users);

  }

  @SubscribeMessage('enter')
  handleUser(@ConnectedSocket() client: Socket, @MessageBody() payload: any): void {

    const user = this.users.find(el => el.id === payload.id);

    if (user) {
      user.online = true

      user.socketId = client.id
    }

    else {
      const user = payload

      user.online = true

      user.socketId = client.id

      this.users.push(user);

    }

    this.server.emit('updateUsers', this.users);

  }

  @SubscribeMessage('newMessage')
  handleMessage(@ConnectedSocket() client: Socket, @MessageBody() payload: any): void {

    this.server.to(payload.socketId).to(client.id).emit('message', payload);

  }

}
