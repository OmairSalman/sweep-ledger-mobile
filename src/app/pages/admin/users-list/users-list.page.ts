import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonBackButton, IonButtons, IonSpinner, IonText, IonList, IonLabel, IonItem, IonIcon, ViewWillEnter } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personOutline, alertCircleOutline } from 'ionicons/icons';
import { UsersStore } from 'src/app/services/users-store';

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.page.html',
  styleUrls: ['./users-list.page.scss'],
  standalone: true,
  imports: [IonItem, IonLabel, IonList, IonText, IonIcon, IonButtons, IonBackButton, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonSpinner]
})
export class UsersListPage implements ViewWillEnter {
  usersStore = inject(UsersStore);

  loading = signal(false);
  errorMsg = signal('');

  constructor() {
    addIcons({ personOutline, alertCircleOutline });
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
}