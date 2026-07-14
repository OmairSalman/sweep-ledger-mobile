import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonLabel, IonIcon, IonItem, IonList, IonBackButton, IonButtons, ModalController, ToastController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { peopleOutline, personAddOutline } from 'ionicons/icons';
import { RouterLink } from '@angular/router';
import { CreateUserPage } from '../../create-user/create-user.page';

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
  
  constructor() {
    addIcons({ peopleOutline, personAddOutline });
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
      component: CreateUserPage
    })
    await modal.present();
    const { data, role } = await modal.onWillDismiss();
    if(role === 'confirm' && data)
    {
      this.showToast(`${data.name} created successfully`, 'app-toast-success')
    }
  }
}