import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertController, IonContent, IonHeader, IonTitle, IonToolbar, ToastController, ViewWillEnter, IonButton, IonText, IonSpinner, IonIcon, IonToggle } from '@ionic/angular/standalone';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';
import { personOutline, atOutline, lockClosedOutline, keyOutline, shieldCheckmarkOutline, logOutOutline, alertCircleOutline, swapHorizontalOutline, idCardOutline, fingerPrintOutline } from 'ionicons/icons';
import { AuthStore } from 'src/app/services/auth-store';
import { Biometrics } from 'src/app/services/biometrics';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [IonToggle, IonIcon, IonSpinner, IonText, IonButton, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, RouterLink]
})
export class ProfilePage implements ViewWillEnter {
  authStore = inject(AuthStore);
  private router = inject(Router);
  private toastController = inject(ToastController);
  private alertController = inject(AlertController);
  private biometrics = inject(Biometrics);

  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  changing = signal(false);
  biometricsAvailable = signal(false);
  biometricEnabled = signal(true);

  constructor() {
    addIcons({personOutline,atOutline,idCardOutline,swapHorizontalOutline,lockClosedOutline,keyOutline,alertCircleOutline,fingerPrintOutline,shieldCheckmarkOutline,logOutOutline});
  }

  private async showToast(message: string, css: 'app-toast-error' | 'app-toast-successs')
  {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
      cssClass: css,
    });
    await toast.present();
  }

  ionViewWillEnter()
  {
    this.authStore.authError.set('');
    this.authStore.ensureRolesLoaded();
    this.biometrics.isAvailable().then(available => this.biometricsAvailable.set(available));
    this.biometrics.isEnabled().then(enabled => this.biometricEnabled.set(enabled));
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
        this.showToast('Password changed successfully', 'app-toast-successs');
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

  async onBiometricToggle(event: CustomEvent)
  {
    const wantOn = event.detail.checked;

    if (!wantOn)
    {
      await this.biometrics.setEnabled(false);
      this.biometricEnabled.set(false);
      return;
    }

    try
    {
      await this.biometrics.authenticate();
      await this.biometrics.setEnabled(true);
      this.biometricEnabled.set(true);
    }
    catch
    {
      this.resyncBiometricToggle();
      this.showToast('Biometric verification failed', 'app-toast-error');
    }
  }

  private resyncBiometricToggle()
  {
    const truth = this.biometricEnabled();
    this.biometricEnabled.set(!truth);
    setTimeout(() => this.biometricEnabled.set(truth), 0);
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