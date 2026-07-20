import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonLabel, IonIcon, IonItem, IonList, IonBackButton, IonButtons, ModalController, ToastController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { peopleOutline, personAddOutline, notificationsOutline } from 'ionicons/icons';
import { RouterLink } from '@angular/router';
import { CreateUserModal } from '../../create-user/create-user.page';
import { NotificationFormPage } from '../../notification-form/notification-form.page';
import { AuthStore } from 'src/app/services/auth-store';

@Component({
  selector: 'app-admin-panel',
  templateUrl: './admin-panel.page.html',
  styleUrls: ['./admin-panel.page.scss'],
  standalone: true,
  imports: [IonButtons, IonBackButton, IonList, IonItem, IonIcon, IonLabel, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, RouterLink]
})
export class AdminPanelPage {
  private modalController = inject(ModalController);
  private toastController = inject(ToastController);
  authStore = inject(AuthStore);
  
  constructor() {
    addIcons({peopleOutline,personAddOutline,notificationsOutline});
  }

  private async showToast(message: string, css: string)
  {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
      cssClass: css,
    });
    await toast.present();
  }

  async openCreateUser()
  {
    const modal = await this.modalController.create({
      component: CreateUserModal
    })
    await modal.present();
    const { data, role } = await modal.onWillDismiss();
    if(role === 'confirm' && data)
    {
      this.showToast(`${data.name} created successfully`, 'app-toast-success')
    }
  }

  async openCreateNotification()
  {
    const modal = await this.modalController.create({
      component: NotificationFormPage
    })
    await modal.present();
    const { data, role } = await modal.onWillDismiss();
    if(role === 'confirm' && data)
    {
      const message = data.sentCount == 0 ? "No devices reached"
      : `Sent to ${data.sentCount}${data.failedCount > 0 ? `, ${data.failedCount} failed` : ''}`;
      const css = data.sentCount > 0 ? 'app-toast-success' : 'app-toast-error';
      this.showToast(message, css);
    }
  }
}