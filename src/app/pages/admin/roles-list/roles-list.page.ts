import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertController, IonContent, IonHeader, IonTitle, IonToolbar, ModalController, ToastController, ViewWillEnter, IonButtons, IonBackButton, IonButton, IonIcon, IonSpinner, IonText, IonList, IonItem, IonLabel, IonItemSliding, IonItemOption, IonItemOptions } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, idCardOutline } from 'ionicons/icons';
import { RolesStore } from 'src/app/services/roles-store';
import { Role } from 'src/models/role';
import { RoleFormModal } from '../../role-form/role-form.page';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-roles-list',
  templateUrl: './roles-list.page.html',
  styleUrls: ['./roles-list.page.scss'],
  standalone: true,
  imports: [IonItemOptions, IonItemOption, IonItemSliding, IonLabel, IonItem, IonList, IonText, IonSpinner, IonIcon, IonButton, IonBackButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, RouterLink]
})
export class RolesListPage implements ViewWillEnter {
  rolesStore = inject(RolesStore);
  private toastController = inject(ToastController);
  private alertController = inject(AlertController);
  private modalController = inject(ModalController);

  loading = signal(false);
  errorMsg = signal('');

  constructor() {
    addIcons({ add, idCardOutline });
  }

  ionViewWillEnter(): void
  {
    this.loading.set(true);
    this.rolesStore.loadRoles().subscribe({
      next: () => this.loading.set(false),
      error: (err) =>
      {
        this.errorMsg.set(err.error ?? 'Could not load roles');
        this.loading.set(false);
      }
    })
  }

  async openRoleForm(selectedRole: Role | null)
  {
    const modal = await this.modalController.create({
      component: RoleFormModal,
      componentProps: { role: selectedRole }
    });
    await modal.present();
    const { data, role } = await modal.onWillDismiss();
    if(role === 'confirm' && data)
    {
      this.showToast(selectedRole ? 'Role updated' : `Role ${data.name} created`, 'app-toast-success');
    }
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

  async confirmDelete(role: Role)
  {
    const alert = await this.alertController.create({
      header: 'Delete role?',
      message: "This cannot be undone. This role's permissions will also be deleted.",
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { text: 'Delete', role: 'destructive', cssClass: 'alert-danger-btn', handler: () => this.doDelete(role.id) },
      ],
    });
    await alert.present();
  }

  doDelete(roleId: number)
  {
    this.rolesStore.deleteRole(roleId).subscribe({
      next:() => this.showToast('Role deleted', 'app-toast-success'),
      error: async (err) =>
      {
        if (typeof err?.error === 'string') this.showToast(err.error, 'app-toast-error');
        else if (err?.error?.usersCount)
        {
          const alert = await this.alertController.create({
            header: 'Unable to delete row',
            message: `The role is assigned to ${err.error.usersCount} ${err.error.usersCount === 1 ? 'user' : 'users'}. Please remove it from them before deleting it.`,
            buttons: [
              { text: 'Okay', role: 'cancel' },
            ],
          });
          await alert.present();
        }
        else this.showToast('Could not delete role', 'app-toast-error');
      }
    })
  }
}