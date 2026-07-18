import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonButtons, ModalController, AlertController, IonText, IonSpinner, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { businessOutline, personOutline, alertCircleOutline } from 'ionicons/icons';
import { SweepsStore } from 'src/app/services/sweeps-store';

@Component({
  selector: 'app-create-sweep',
  templateUrl: './create-sweep.page.html',
  styleUrls: ['./create-sweep.page.scss'],
  standalone: true,
  imports: [IonSpinner, IonText, IonButtons, IonButton, IonIcon, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, ReactiveFormsModule]
})
export class CreateSweepPage {
  private modalController = inject(ModalController);
  private alertController = inject(AlertController);
  private sweepsStore = inject(SweepsStore);
  private fb = inject(FormBuilder);

  saving = signal(false);
  errorMsg = signal('');

  constructor() {
    addIcons({ businessOutline, personOutline, alertCircleOutline });
  }

  form = this.fb.nonNullable.group({
    roomCode: ['', Validators.required],
    responsiblePersonName: ['', Validators.required],
  });

  async cancel()
  {
    // Nothing typed yet — nothing to lose, so close without asking.
    if (this.form.pristine)
    {
      this.modalController.dismiss(null, 'cancel');
      return;
    }

    const alert = await this.alertController.create({
      header: 'Discard this sweep?',
      message: 'Your changes will not be saved.',
      buttons: [
        { text: 'Keep editing', role: 'cancel' },
        { text: 'Discard', role: 'destructive', cssClass: 'alert-danger-btn', handler: () => this.modalController.dismiss(null, 'cancel') },
      ],
    });
    await alert.present();
  }

  submit()
  {
    if (this.form.invalid) return;
    this.saving.set(true);
    const { roomCode, responsiblePersonName } = this.form.getRawValue();

    this.sweepsStore.saveSweep(roomCode, responsiblePersonName).subscribe({
      next: (sweep) =>
      {
        this.saving.set(false);
        this.modalController.dismiss(sweep, 'confirm');
      },
      error: (err) =>
      {
        this.saving.set(false);
        this.errorMsg.set(err.error ?? 'Could not create sweep');
      }
    });
  }
}