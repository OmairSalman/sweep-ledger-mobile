import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonButtons, IonSpinner, IonText, IonList, IonItem, IonToggle, ModalController, ToastController, AlertController } from '@ionic/angular/standalone';
import { User } from 'src/models/user';
import { RolesStore } from 'src/app/services/roles-store';
import { UsersStore } from 'src/app/services/users-store';
import { forkJoin } from 'rxjs';
import { Role } from 'src/models/role';
import { AuthStore } from 'src/app/services/auth-store';

@Component({
  selector: 'app-user-roles',
  templateUrl: './user-roles.page.html',
  styleUrls: ['./user-roles.page.scss'],
  standalone: true,
  imports: [IonToggle, IonItem, IonList, IonText, IonSpinner, IonButtons, IonButton, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule]
})
export class UserRolesModal implements OnInit {
  @Input() user!: User

  rolesStore = inject(RolesStore);
  usersStore = inject(UsersStore);
  private authStore = inject(AuthStore);
  private alertController = inject(AlertController);
  private modalController = inject(ModalController);
  private toastController = inject(ToastController);

  loading = signal(false);
  errorMsg = signal('');
  assignedIds = signal<Set<number>>(new Set());

  constructor() { }

  ngOnInit()
  {
    this.loading.set(true);
    forkJoin({
      all: this.rolesStore.loadRoles(),
      userRoles: this.usersStore.getUserRoles(this.user.id)
    }).subscribe({
      next:({ userRoles }) =>
      {
        this.assignedIds.set(new Set(userRoles.map(r => r.id)));
        this.loading.set(false);
      },
      error:(err) =>
      {
        this.errorMsg.set(typeof err?.error === 'string' ? err.error : 'Could not load roles');
        this.loading.set(false);
      }
    })
  }

  close()
  {
    this.modalController.dismiss(null, 'done');
  }

  async onToggle(role: Role, event: CustomEvent)
  {
    const checked = event.detail.checked;
    const isSelfActiveRevoke = 
      !checked
      && this.user.id === this.authStore.currentUser()?.id
      && role.id === this.authStore.activeRole()?.id;
    const isLastRole = !checked && this.assignedIds().size === 1;

    if(!isSelfActiveRevoke && !isLastRole)
    {
      this.applyChange(role, checked);
      return;
    }

    const message = isSelfActiveRevoke
      ? `"${role.name}" is your active role${isLastRole ? ' and your only role' : ''}. Removing it may lock you out when your session refreshes.`
      : `This is ${this.user.name}'s only role. Removing it will prevent them from logging in until a role is assigned.`;

    const alert = await this.alertController.create({
      header: 'Remove this role?',
      message,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { text: 'Remove', role: 'destructive', cssClass: 'alert-danger-btn' },
      ]
    });
    await alert.present();
    const { role: dismissRole } = await alert.onWillDismiss();

    if(dismissRole === 'destructive') this.applyChange(role, false);
    else this.resyncToggle(role.id);
  }

  private applyChange(role: Role, checked: boolean)
  {
    const call = checked
      ? this.usersStore.assignRole(this.user.id, role.id)
      : this.usersStore.revokeRole(this.user.id, role.id);

    call.subscribe({
      next:(freshRoles) => this.assignedIds.set(new Set(freshRoles.map(r => r.id))),
      error:(err) =>
      {
        if (checked && err?.status === 409)
        {
          this.assignedIds.update(ids => new Set(ids).add(role.id));
          return;
        }
        this.resyncToggle(role.id);
        this.showToast(typeof err?.error === 'string' ? err.error : 'Could not update roles', 'app-toast-error');
      }
    })
  }

  private resyncToggle(roleId: number)
  {
    const shouldBeOn = this.assignedIds().has(roleId);
    this.assignedIds.update(ids => {
      const next = new Set(ids);
      shouldBeOn ? next.delete(roleId) : next.add(roleId);
      return next;
    });
    setTimeout(() => {
      this.assignedIds.update(ids => {
        const next = new Set(ids);
        shouldBeOn ? next.add(roleId) : next.delete(roleId);
        return next;
      })
    }, 0);
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