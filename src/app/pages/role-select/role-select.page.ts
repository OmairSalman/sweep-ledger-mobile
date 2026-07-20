import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, ToastController, IonList, IonItem, IonLabel, IonSpinner, IonIcon, IonButtons, IonBackButton } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { AuthStore } from 'src/app/services/auth-store';
import { Role } from 'src/models/role';

@Component({
  selector: 'app-role-select',
  templateUrl: './role-select.page.html',
  styleUrls: ['./role-select.page.scss'],
  standalone: true,
  imports: [IonBackButton, IonButtons, IonIcon, IonSpinner, IonLabel, IonItem, IonList, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class RoleSelectPage {
  authStore = inject(AuthStore);
  private router = inject(Router);
  private toastController = inject(ToastController);

  applying = signal<number | null>(null);

  pick(role: Role)
  {
    if (this.applying() !== null) return;
    this.applying.set(role.id);

    this.authStore.selectAndApplyRole(role).subscribe({
      next: () =>
      {
        this.applying.set(null);
        this.router.navigate(['/tabs']);
      },
      error: (err) =>
      {
        this.applying.set(null);
        this.showToast(typeof err?.error === 'string' ? err.error : 'Could not select role', 'app-toast-error');
      }
    });
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
}