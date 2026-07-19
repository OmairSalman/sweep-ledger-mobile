import { inject, Injectable } from '@angular/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { Device } from '@capacitor/device';
import { Api } from './api';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

interface NotificationBroadcastResponse
{
  sentCount: number,
  failedCount: number
}

@Injectable({
  providedIn: 'root',
})
export class Push {
  private api = inject(Api);
  private router = inject(Router);

  constructor() {
    PushNotifications.addListener('registration', async (token) => {
      const deviceId = await Device.getId();
      this.api.post<void>('/notifications/register-token', { token: token.value, deviceId: deviceId.identifier }).subscribe({
        error: (err) => console.error('token register failed', err)
      })
    });
    PushNotifications.addListener('registrationError', (error) => {
      alert(`push notification registration error:\n${error.error}`);
    });
    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      const data = action.notification.data;
      switch(data.type)
      {
        case 'new_scan':  this.router.navigate(['/tabs']); break;
      }
    })
  }

  async registerPush()
  {
    const status = await PushNotifications.requestPermissions();
    if (status.receive !== 'granted') return;

    await PushNotifications.register();
    await PushNotifications.createChannel({
      id: 'high_importance',
      name: 'Important Notifications',
      importance: 5,
      visibility: 1,
      vibration: true
    });
  }

  broadcastNotification(title: string, body: string): Observable<NotificationBroadcastResponse>
  {
    return this.api.post<NotificationBroadcastResponse>('/notifications/broadcast', { title, body });
  }
}