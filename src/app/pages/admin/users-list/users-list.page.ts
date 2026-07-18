import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonBackButton, IonButtons, AlertController, ToastController, IonSpinner, IonText, IonList, IonLabel, IonItem, IonBadge, IonButton, IonIcon, ViewWillEnter, ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personOutline, alertCircleOutline } from 'ionicons/icons';
import { UsersStore } from 'src/app/services/users-store';
import { User } from 'src/models/user';

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.page.html',
  styleUrls: ['./users-list.page.scss'],
  standalone: true,
  imports: [IonButton, IonBadge, IonItem, IonLabel, IonList, IonText, IonIcon, IonButtons, IonBackButton, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonSpinner]
})
export class UsersListPage implements ViewWillEnter {
  usersStore = inject(UsersStore);
  private alertController = inject(AlertController);
  private toastController = inject(ToastController);

  loading = signal(false);
  errorMsg = signal('');

  constructor() {
    addIcons({ personOutline, alertCircleOutline });
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

  ionViewWillEnter(): void
  {
    this.loading.set(true);
    this.errorMsg.set('');
    this.usersStore.loadUsers().subscribe({
      next: () => this.loading.set(false),
      error: (err) => 
      {
        this.errorMsg.set(err.error ?? 'Could not load users');
        this.loading.set(false);
      }
    })
  }

  async confirmPromote(user: User)
  {
    const alert = await this.alertController.create({
      header: 'Promote to admin?',
      message: `${user.name} will gain full admin access`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { text: 'Promote', handler: () => this.doPromote(user.id) },
      ],
    });
    await alert.present();
  }

  doPromote(userId: number)
  {
    this.usersStore.promoteUser(userId).subscribe({
      next: () => this.showToast('User promoted to admin', 'app-toast-success'),
      error: (err) => this.showToast(err.error ?? 'Could not promote user', 'app-toast-error')
    })
  }
}