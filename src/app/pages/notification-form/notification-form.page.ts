import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, ModalController, IonButtons, IonButton, IonSpinner, IonList, IonItem, IonTextarea, IonText, IonInput } from '@ionic/angular/standalone';
import { Push } from 'src/app/services/push';

@Component({
  selector: 'app-notification-form',
  templateUrl: './notification-form.page.html',
  styleUrls: ['./notification-form.page.scss'],
  standalone: true,
  imports: [IonText, IonItem, IonList, IonSpinner, IonButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, ReactiveFormsModule, IonTextarea, IonInput]
})
export class NotificationFormPage {
  private modalController = inject(ModalController);
  private push = inject(Push);
  private fb = inject(FormBuilder);

  saving = signal(false);
  errorMsg = signal('');

  form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    body: ['', Validators.required],
  });

  cancel()
  {
    this.modalController.dismiss(null, 'cancel');
  }

  submit()
  {
    if (this.form.invalid) return;
    this.saving.set(true);
    const { title, body } = this.form.getRawValue();

    this.push.broadcastNotification(title, body).subscribe({
      next: (result) =>
      {
        this.saving.set(false);
        this.modalController.dismiss(result, 'confirm');
      },
      error: (err) =>
      {
        this.saving.set(false);
        this.errorMsg.set(err.error ?? 'Could not broadcast notification');
      }
    });
  }
}