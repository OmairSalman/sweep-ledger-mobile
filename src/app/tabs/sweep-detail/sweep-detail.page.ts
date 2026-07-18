import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, ViewWillEnter, IonBackButton, IonButtons, IonSpinner, IonText, IonList, IonIcon, IonItem, IonLabel, IonListHeader, IonFabButton, IonFab, IonItemSliding, IonItemOption, IonItemOptions, AlertController, ToastController } from '@ionic/angular/standalone';
import { inject } from '@angular/core';
import { SweepsStore } from 'src/app/services/sweeps-store';
import { AssetsStore } from 'src/app/services/assets-store';
import { ActivatedRoute, Router } from '@angular/router';
import { Sweep } from 'src/models/sweep';
import { forkJoin } from 'rxjs';
import { addIcons } from 'ionicons';
import { scanOutline, barcodeOutline, businessOutline, alertCircleOutline, personOutline, calendarOutline, cubeOutline } from 'ionicons/icons';
import { Asset } from 'src/models/asset';

@Component({
  selector: 'app-sweep-detail',
  templateUrl: './sweep-detail.page.html',
  styleUrls: ['./sweep-detail.page.scss'],
  standalone: true,
  imports: [IonItemOptions, IonItemOption, IonFab, IonFabButton, IonListHeader, IonLabel, IonItem, IonIcon, IonText, IonButtons, IonBackButton, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonSpinner, IonList, IonItemSliding]
})
export class SweepDetailPage implements ViewWillEnter {
  private sweepsStore = inject(SweepsStore);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private alertController = inject(AlertController);
  private toastController = inject(ToastController);
  assetsStore = inject(AssetsStore);
  sweepId = Number(this.route.snapshot.paramMap.get('id'));

  loading = signal(false);
  errorMsg = signal('');
  sweep = signal<Sweep | null>(null);

  constructor(){
    addIcons({ scanOutline, barcodeOutline, businessOutline, alertCircleOutline, personOutline, calendarOutline, cubeOutline });
  }

  ionViewWillEnter()
  {
    this.loading.set(true);
    this.errorMsg.set('');
    this.sweep.set(null);
    forkJoin([this.sweepsStore.loadSweep(this.sweepId), this.assetsStore.loadAssets(this.sweepId)]).subscribe({
      next:([sweep]) =>
        {
          this.sweep.set(sweep);
          this.loading.set(false);
        },
      error: (err) => {
        if (err.status === 404) {
          this.router.navigate(['/tabs/sweeps']);
          return;
        }
        this.errorMsg.set(err.error ?? 'Could not load this sweep');
        this.loading.set(false);
      }
    })
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

  continueScanning()
  {
    // A plain push, so this sweep stays under the scanner in the stack and
    // backing out of the scanner returns here. sweep-scan's done() then pops
    // back onto it rather than stacking a second copy.
    this.router.navigate(['/tabs/sweeps', this.sweepId, 'scan']);
  }

  async confirmDelete(asset: Asset)
  {
    const alert = await this.alertController.create({
      header: 'Delete asset?',
      message: `Remove ${asset.barcodeValue} from this sweep? This cannot be undone.`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { text: 'Delete', role: 'destructive', cssClass: 'alert-danger-btn', handler: () => this.doDelete(asset.id) },
      ],
    });
    await alert.present();
  }

  doDelete(assetId: number)
  {
    this.assetsStore.deleteAsset(this.sweepId, assetId).subscribe({
      next: () => this.showToast('Asset deleted', 'app-toast-success'),
      error: (err) => this.showToast(err.error ?? 'Could not delete asset', 'app-toast-error')
    });
  }
}