import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonItemOption, IonItemOptions, IonLabel, IonItem, IonItemSliding, IonList, IonText, IonSpinner, AlertController, ToastController, ViewWillEnter, IonIcon, IonFabButton, IonFab, ModalController } from '@ionic/angular/standalone';
import { SweepsStore } from 'src/app/services/sweeps-store';
import { Sweep } from 'src/models/sweep';
import { addIcons } from 'ionicons';
import { add, businessOutline, cubeOutline, alertCircleOutline } from 'ionicons/icons';
import { RouterLink } from '@angular/router';
import { NavController } from '@ionic/angular/standalone';
import { CreateSweepPage } from 'src/app/pages/create-sweep/create-sweep.page';
import { AuthStore } from 'src/app/services/auth-store';

@Component({
  selector: 'app-sweeps-list',
  templateUrl: './sweeps-list.page.html',
  styleUrls: ['./sweeps-list.page.scss'],
  standalone: true,
  imports: [RouterLink, IonFab, IonFabButton, IonIcon, IonSpinner, IonText, IonList, IonItemSliding, IonItem, IonLabel, IonItemOptions, IonItemOption, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule]
})
export class SweepsListPage implements ViewWillEnter {
  sweepsStore = inject(SweepsStore);
  authStore = inject(AuthStore);
  private toastController = inject(ToastController);
  private alertController = inject(AlertController);
  private modalController = inject(ModalController);
  private navController = inject(NavController);

  loading = signal(false);
  errorMsg = signal('');

  constructor(){
    addIcons({ add, businessOutline, cubeOutline, alertCircleOutline });
  }

  ionViewWillEnter()
  {
    this.loading.set(true);
    this.sweepsStore.loadSweeps().subscribe({
      next:() => this.loading.set(false),
      error:(err) =>
      {
        this.errorMsg.set(err.error ?? 'Could not load your sweeps');
        this.loading.set(false);
      }
    })
  }

  async openCreateSweep()
  {
    const modal = await this.modalController.create({
      component: CreateSweepPage
    });
    await modal.present();
    const { data, role } = await modal.onWillDismiss();
    if(role === 'confirm' && data)
    {
      // Seed the new sweep's detail into the stack before opening the scanner,
      // so backing out of the scanner lands on the sweep rather than here, and
      // so sweep-scan's done() has a view to pop back onto. Unanimated: it is a
      // stack entry, not a screen the user is meant to read on the way past.
      await this.navController.navigateForward(['/tabs/sweeps', data.id], { animated: false });
      await this.navController.navigateForward(['/tabs/sweeps', data.id, 'scan']);
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

  async confirmDelete(sweep: Sweep)
  {
    const alert = await this.alertController.create({
      header: 'Delete sweep?',
      message: "This cannot be undone. All of the assets scanned in this sweep will also be deleted.",
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { text: 'Delete', role: 'destructive', cssClass: 'alert-danger-btn', handler: () => this.doDelete(sweep.id) },
      ],
    });
    await alert.present();
  }

  doDelete(sweepId: number)
  {
    this.sweepsStore.deleteSweep(sweepId).subscribe({
      next:() => this.showToast('Sweep deleted', 'app-toast-success'),
      error:(err) => this.showToast(err.error ?? 'Could not delete sweep', 'app-toast-error')
    })
  }
}