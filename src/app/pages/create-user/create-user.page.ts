import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, ModalController, IonButtons, IonButton, IonText, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personOutline, atOutline, keyOutline, alertCircleOutline } from 'ionicons/icons';
import { UsersStore } from 'src/app/services/users-store';

@Component({
  selector: 'app-create-user',
  templateUrl: './create-user.page.html',
  styleUrls: ['./create-user.page.scss'],
  standalone: true,
  imports: [IonText, IonButton, IonButtons, IonIcon, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, ReactiveFormsModule]
})
export class CreateUserPage{
  private modalController = inject(ModalController);
  private usersStore = inject(UsersStore);
  private fb = inject(FormBuilder);

  saving = signal(false);
  errorMsg = signal('');

  constructor() {
    addIcons({ personOutline, atOutline, keyOutline, alertCircleOutline });
  }

  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    username: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  cancel()
  {
    this.modalController.dismiss(null, 'cancel');
  }

  submit()
  {
    if (this.form.invalid) return;
    this.saving.set(true);
    const { name, username, password } = this.form.getRawValue();

    this.usersStore.createUser(name, username, password).subscribe({
      next: (user) =>
      {
        this.saving.set(false);
        this.modalController.dismiss(user, 'confirm');
      },
      error: (err) =>
      {
        this.saving.set(false);
        this.errorMsg.set(err.error ?? 'Could not create user');
      }
    })
  }
}