import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, AlertController, ToastController } from '@ionic/angular/standalone';
import { AuthStore } from '../services/auth-store';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonButton, IonHeader, IonToolbar, IonTitle, IonContent],
})
export class HomePage {
  authStore = inject(AuthStore);
  private router = inject(Router);
  private toastController = inject(ToastController);
  private alertController = inject(AlertController);

  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  changing = signal(false);

  private async showToast(message: string)
  {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
      cssClass: 'app-toast-success',
    });
    await toast.present();
  }
  
  async onLogout()
  {
    const alert = await this.alertController.create({
      header: 'Are you sure you want to logout?',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { text: 'Logout', role: 'destructive', cssClass: 'alert-danger-btn', handler: () => this.doLogout() },
      ],
    });
    await alert.present();
  }

  doLogout()
  {
    this.authStore.logout().subscribe({
      next:() => this.router.navigate(['/login'])
    });
  }
}
