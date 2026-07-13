import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, ViewWillEnter, IonBackButton, IonButtons, IonSpinner, IonText, IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCardContent, IonList, IonIcon, IonItem, IonLabel, IonListHeader, IonFabButton, IonFab } from '@ionic/angular/standalone';
import { inject } from '@angular/core';
import { SweepsStore } from 'src/app/services/sweeps-store';
import { AssetsStore } from 'src/app/services/assets-store';
import { ActivatedRoute, Router } from '@angular/router';
import { Sweep } from 'src/models/sweep';
import { forkJoin } from 'rxjs';
import { addIcons } from 'ionicons';
import { personOutline, calendarOutline, cubeOutline, scanOutline, barcodeOutline } from 'ionicons/icons';

@Component({
  selector: 'app-sweep-detail',
  templateUrl: './sweep-detail.page.html',
  styleUrls: ['./sweep-detail.page.scss'],
  standalone: true,
  imports: [IonFab, IonFabButton, IonListHeader, IonLabel, IonItem, IonIcon, IonCardTitle, IonCardSubtitle, IonCardHeader, IonCard, IonText, IonButtons, IonBackButton, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonSpinner, IonCardContent, IonList]
})
export class SweepDetailPage implements ViewWillEnter {
  private sweepsStore = inject(SweepsStore);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  assetsStore = inject(AssetsStore);
  sweepId = Number(this.route.snapshot.paramMap.get('id'));

  loading = signal(false);
  errorMsg = signal('');
  sweep = signal<Sweep | null>(null);

  constructor(){
    addIcons({personOutline,calendarOutline,cubeOutline,scanOutline,barcodeOutline});
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

  continueScanning()
  {
    this.router.navigate(['/tabs/sweeps', this.sweepId, 'scan']);
  }
}
