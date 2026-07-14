import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertController, IonContent, IonHeader, IonTitle, IonToolbar, ToastController, ViewWillEnter, IonButton, IonText, IonSpinner, IonItem, IonLabel, IonList, IonListHeader, IonNote, IonInput } from '@ionic/angular/standalone';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { AuthStore } from 'src/app/services/auth-store';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [IonInput, IonNote, IonListHeader, IonList, IonLabel, IonItem, IonSpinner, IonText, IonButton, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, RouterLink]
})
export class ProfilePage implements ViewWillEnter {
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

  ionViewWillEnter()
  {
    this.authStore.authError.set('');
  }

  onChangePassword()
  {
    this.authStore.authError.set('');
    this.changing.set(true);
    if(!this.currentPassword || !this.newPassword || !this.confirmPassword)
    {
      this.authStore.authError.set('Please fill all fields');
      this.changing.set(false);
      return;
    }

    if (this.newPassword.length < 8)
    {
      this.authStore.authError.set('New password must be at least 8 characters long');
      this.changing.set(false);
      return;
    }

    if(this.newPassword !== this.confirmPassword)
    {
      this.authStore.authError.set(`New password and confirm password don't match`);
      this.changing.set(false);
      return;
    }

    this.authStore.changePassword(this.currentPassword, this.newPassword).subscribe({
      next:() => 
      {
        this.showToast('Password changed successfully');
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
        this.changing.set(false);
      },
      error: (err: HttpErrorResponse) =>
      {
        this.authStore.authError.set(err.error || err.message);
        this.changing.set(false);
      }
    })
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