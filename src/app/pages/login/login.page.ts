import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton, IonContent, IonInput, IonSpinner, IonText, IonIcon, ViewWillEnter } from '@ionic/angular/standalone';
import { AuthStore } from 'src/app/services/auth-store';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { addIcons } from 'ionicons';
import { fingerPrintOutline } from 'ionicons/icons';
import { Biometrics } from 'src/app/services/biometrics';
import { BiometryError, BiometryErrorType } from '@aparajita/capacitor-biometric-auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonIcon, IonContent, CommonModule, FormsModule, IonInput, IonButton, IonText, IonSpinner]
})
export class LoginPage implements ViewWillEnter {
  authStore = inject(AuthStore);
  private router = inject(Router);
  private biometrics = inject(Biometrics);

  loading = signal(false);
  username = '';
  password = '';

  constructor() {
    addIcons({ fingerPrintOutline });
  }

  ionViewWillEnter()
  {
    this.authStore.authError.set('');
  }

  onLogin()
  {
    this.authStore.authError.set('');
    this.loading.set(true);
    if(!this.username || !this.password)
    {
      this.authStore.authError.set('Please enter both username and password');
      this.loading.set(false);
      return;
    }
    this.authStore.login(this.username, this.password).subscribe({
      next:() =>
      {
        this.router.navigate(['/home']);
        this.username = '';
        this.password = '';
        this.loading.set(false);
      },
      error:(err: HttpErrorResponse) => {
        this.authStore.authError.set(err.error);
        this.loading.set(false);
      }
    })
  }

  async onBiometricRetry()
  {
    try
    {
      await this.biometrics.authenticate();
    }
    catch (error)
    {
      if (error instanceof BiometryError && error.code !== BiometryErrorType.userCancel)
      {
        alert('Biometric login error');
      }
      return;
    }

    this.authStore.checkAuth().subscribe({
      next:(user) =>
      {
        if(user)
        {
          this.router.navigate(['/tabs/tab1']);
          this.authStore.biometricDeclined.set(false);
        }
        else this.authStore.authError.set('Session expired, please log in');
      }
    })
  }
}
