import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlertController, IonContent, IonHeader, IonTitle, IonToolbar, ModalController, IonButtons, IonButton, IonSpinner, IonText, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { idCardOutline, alertCircleOutline } from 'ionicons/icons';
import { Role } from 'src/models/role';
import { RolesStore } from 'src/app/services/roles-store';

@Component({
  selector: 'app-role-form',
  templateUrl: './role-form.page.html',
  styleUrls: ['./role-form.page.scss'],
  standalone: true,
  imports: [IonIcon, IonText, IonSpinner, IonButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, ReactiveFormsModule]
})
export class RoleFormModal implements OnInit {
  @Input() role: Role | null = null;

  private modalController = inject(ModalController);
  private alertController = inject(AlertController);
  private rolesStore = inject(RolesStore);
  private fb = inject(FormBuilder);

  saving = signal(false);
  errorMsg = signal('');

  constructor() {
    addIcons({ idCardOutline, alertCircleOutline });
  }

  form = this.fb.nonNullable.group({
    name: ['', Validators.required]
  });

  ngOnInit()
  {
    if (this.role)
    {
      this.form.patchValue({ name: this.role.name });
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
      header: 'Discard this role?',
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
    const { name } = this.form.getRawValue();

    const call = this.role
    ? this.rolesStore.updateRole(this.role.id, name)
    : this.rolesStore.addRole(name);

    call.subscribe({
      next: (role) =>
      {
        this.saving.set(false);
        this.modalController.dismiss(role, 'confirm');
      },
      error: (err) =>
      {
        this.saving.set(false);
        this.errorMsg.set(typeof err?.error === 'string' ? err.error : 'Could not save role');
      }
    });
  }
}