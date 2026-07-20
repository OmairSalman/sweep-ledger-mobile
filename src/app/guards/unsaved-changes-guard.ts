import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { AlertController } from '@ionic/angular/standalone';
import { RoleDetailPage } from '../pages/admin/role-detail/role-detail.page';

export const unsavedChangesGuard: CanDeactivateFn<RoleDetailPage> = async (component, currentRoute, currentState, nextState) => {
  if (!component.dirty()) return true;
  const alertController = inject(AlertController);
  const alert = await alertController.create({
    header: 'Discard changes?',
    message: 'Your unsaved permission changes will be lost.',
    buttons: [
      { text: 'Keep editing', role: 'cancel' },
      { text: 'Discard', role: 'destructive', cssClass: 'alert-danger-btn' },
    ],
  });
  await alert.present();
  const { role } = await alert.onWillDismiss();
  return role === 'destructive';
};