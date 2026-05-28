import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ProctoringService } from './proctoring.service';
import { ProctorEventDto } from './dto/proctor-event.dto';

@WebSocketGateway({
  namespace: 'proctoring',
  cors: {
    origin: '*',
  },
})
export class ProctoringGateway {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly proctoringService: ProctoringService) {}

  @SubscribeMessage('joinAttempt')
  async joinAttempt(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { attemptId: string },
  ) {
    await client.join(body.attemptId);
    client.emit('joinedAttempt', { attemptId: body.attemptId });
  }

  @SubscribeMessage('proctorEvent')
  async handleProctorEvent(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { attemptId: string; event: ProctorEventDto },
  ) {
    const event = await this.proctoringService.logEvent(body.attemptId, body.event);
    this.server.to(body.attemptId).emit('proctorEventLogged', event);
    client.emit('proctorEventAccepted', { eventId: event.id });
  }
}
