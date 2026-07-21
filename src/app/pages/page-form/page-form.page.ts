import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlertController, IonContent, IonHeader, IonTitle, IonToolbar, ModalController, IonText, IonSpinner, IonButton, IonButtons, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { textOutline, codeSlashOutline, alertCircleOutline } from 'ionicons/icons';
import { PagesStore } from 'src/app/services/pages-store';
import { Page } from 'src/models/page';

@Component({
  selector: 'app-page-form',
  templateUrl: './page-form.page.html',
  styleUrls: ['./page-form.page.scss'],
  standalone: true,
  imports: [IonIcon, IonButtons, IonButton, IonSpinner, IonText, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, ReactiveFormsModule]
})
export class PageFormModal implements OnInit {
  @Input() page: Page | null = null;

  private modalController = inject(ModalController);
  private alertController = inject(AlertController);
  private pagesStore = inject(PagesStore);
  private fb = inject(FormBuilder);

  saving = signal(false);
  errorMsg = signal('');

  constructor() {
    addIcons({ textOutline, codeSlashOutline, alertCircleOutline });
  }

  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    pageKey: ['', Validators.required],
  });

  ngOnInit()
  {
    if (this.page)
    {
      this.form.patchValue({ name: this.page.name, pageKey: this.page.pageKey });
    }
  }

  async cancel()
  {
    // Nothing typed yet — nothing to lose, so close without asking.
    if (this.form.pristine)
    {
      this.modalController.dismiss(null, 'cancel');
      return;
    }

    const alert = await this.alertController.create({
      header: 'Discard this page?',
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
    const { name, pageKey } = this.form.getRawValue();

    const call = this.page
    ? this.pagesStore.updatePage(this.page.id, name, pageKey)
    : this.pagesStore.addPage(name, pageKey);

    call.subscribe({
      next: (page) =>
      {
        this.saving.set(false);
        this.modalController.dismiss(page, 'confirm');
      },
      error: (err) =>
      {
        this.saving.set(false);
        this.errorMsg.set(typeof err?.error === 'string' ? err.error : 'Could not create page');
      }
    });
  }
}