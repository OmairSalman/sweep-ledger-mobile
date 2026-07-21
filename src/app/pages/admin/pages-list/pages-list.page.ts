import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertController, IonContent, IonHeader, IonTitle, IonToolbar, ModalController, ToastController, ViewWillEnter, IonText, IonButtons, IonButton, IonSpinner, IonList, IonItemSliding, IonItem, IonLabel, IonItemOptions, IonItemOption, IonIcon, IonBackButton } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, documentTextOutline } from 'ionicons/icons';
import { PagesStore } from 'src/app/services/pages-store';
import { PageFormModal } from '../../page-form/page-form.page';
import { Page } from 'src/models/page';

@Component({
  selector: 'app-pages-list',
  templateUrl: './pages-list.page.html',
  styleUrls: ['./pages-list.page.scss'],
  standalone: true,
  imports: [IonBackButton, IonIcon, IonItemOption, IonItemOptions, IonLabel, IonItem, IonItemSliding, IonList, IonSpinner, IonButton, IonButtons, IonText, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule]
})
export class PagesListPage implements ViewWillEnter {
  pagesStore = inject(PagesStore);
  private toastController = inject(ToastController);
  private alertController = inject(AlertController);
  private modalController = inject(ModalController);

  loading = signal(false);
  errorMsg = signal('');

  constructor() {
    addIcons({ add, documentTextOutline });
  }

  ionViewWillEnter(): void
  {
    this.loading.set(true);
    this.pagesStore.loadPages().subscribe({
      next: () => this.loading.set(false),
      error: (err) =>
      {
        this.errorMsg.set(err.error ?? 'Could not load pages');
        this.loading.set(false);
      }
    })
  }

  async openPageForm(page: Page | null)
  {
    const modal = await this.modalController.create({
      component: PageFormModal,
      componentProps: { page }
    });
    await modal.present();
    const { data, role } = await modal.onWillDismiss();
    if(role === 'confirm' && data)
    {
      this.showToast(page ? 'Page updated' : `Page ${data.name} created`, 'app-toast-success');
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

  async confirmDelete(page: Page)
  {
    const alert = await this.alertController.create({
      header: 'Delete page?',
      message: "This cannot be undone.",
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { text: 'Delete', role: 'destructive', cssClass: 'alert-danger-btn', handler: () => this.doDelete(page.id) },
      ],
    });
    await alert.present();
  }

  doDelete(pageId: number)
  {
    this.pagesStore.deletePage(pageId).subscribe({
      next:() => this.showToast('Page deleted', 'app-toast-success'),
      error: async (err) =>
      {
        if (typeof err?.error === 'string') this.showToast(err.error, 'app-toast-error');
        else if (err?.error?.roles)
        {
          const alert = await this.alertController.create({
            header: 'Unable to delete page',
            message: `The page is being added to the following roles: ${err.error.roles}. Please remove it from them before deleting it.`,
            buttons: [
              { text: 'Okay', role: 'cancel' },
            ],
          });
          await alert.present();
        }
        else this.showToast('Could not delete page', 'app-toast-error');
      }
    })
  }
}