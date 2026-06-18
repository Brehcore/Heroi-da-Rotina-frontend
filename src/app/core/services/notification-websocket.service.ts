import { Injectable, inject, NgZone } from '@angular/core';
import { Client, Message } from '@stomp/stompjs';
import SockJS from 'sockjs-client/dist/sockjs';
import { Subject, Observable } from 'rxjs';
import { ScreenTimeResponseDTO } from './models/screentime.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificationWebSocketService {
  private stompClient: Client | null = null;
  private notificationSubject = new Subject<ScreenTimeResponseDTO>();
  private ngZone = inject(NgZone);

  public getNotifications(): Observable<ScreenTimeResponseDTO> {
    return this.notificationSubject.asObservable();
  }

  // Método privado para evitar repetição de código na emissão
  private emitNotification(message: Message) {
    if (message.body) {
      const notification: ScreenTimeResponseDTO = JSON.parse(message.body);
      this.ngZone.run(() => {
        this.notificationSubject.next(notification);
      });
    }
  }

  // Método genérico para garantir que estamos conectados
  private ensureConnected(onConnectCallback: () => void): void {
    if (this.stompClient?.active) {
      onConnectCallback();
      return;
    }

    const socket = new SockJS(environment.wsUrl);
    this.stompClient = new Client({
      webSocketFactory: () => socket as any,
      reconnectDelay: 5000,
      debug: (msg: string) => console.log('STOMP: ', msg)
    });

    this.stompClient.onConnect = () => {
      console.log('WebSocket Conectado!');
      onConnectCallback();
    };

    this.stompClient.activate();
  }

  public connect(familyId: number): void {
    this.ensureConnected(() => {
      this.stompClient?.subscribe(`/topic/notifications/family/${familyId}`, (message: Message) => {
        this.emitNotification(message);
      });
    });
  }

  public connectForMinor(minorId: number): void {
    this.ensureConnected(() => {
      this.stompClient?.subscribe(`/topic/notifications/minor/${minorId}`, (message: Message) => {
        this.emitNotification(message);
      });
    });
  }

  public disconnect(): void {
    if (this.stompClient) {
      this.stompClient.deactivate();
      this.stompClient = null;
    }
  }
}