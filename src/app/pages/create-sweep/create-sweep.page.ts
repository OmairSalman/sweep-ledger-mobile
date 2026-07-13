import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonList, IonButton, IonButtons, ModalController, IonInput } from '@ionic/angular/standalone';
import { SweepsStore } from 'src/app/services/sweeps-store';

@Component({
  selector: 'app-create-sweep',
  templateUrl: './create-sweep.page.html',
  styleUrls: ['./create-sweep.page.scss'],
  standalone: true,
  imports: [IonButtons, IonButton, IonList, IonItem, IonContent, IonHeader, IonTitle, IonToolbar, IonInput, CommonModule, ReactiveFormsModule]
})
export class CreateSweepPage {
  private modalController = inject(ModalController);
  private sweepsStore = inject(SweepsStore);
  private fb = inject(FormBuilder);

  saving = signal(false);
  errorMsg = signal('');

  form = this.fb.nonNullable.group({
    roomCode: ['', Validators.required],
    responsiblePersonName: ['', Validators.required],
  });

  cancel() {
    this.modalController.dismiss(null, 'cancel');
  }

  submit() {
    if (this.form.invalid) return;
    this.saving.set(true);
    const { roomCode, responsiblePersonName } = this.form.getRawValue();

    this.sweepsStore.saveSweep(roomCode, responsiblePersonName).subscribe({
      next: (sweep) => {
        this.saving.set(false);
        this.modalController.dismiss(sweep, 'confirm');
      },
      error: (err) => {
        this.saving.set(false);
        this.errorMsg.set(err.error ?? 'Could not create sweep');
      }
    });
  }
}