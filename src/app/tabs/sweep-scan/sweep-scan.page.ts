import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, ViewWillEnter, ViewWillLeave, IonButton, IonText, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular/standalone';
import { AssetsStore } from 'src/app/services/assets-store';
import { BarcodeFormat, BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { addIcons } from 'ionicons';
import { cameraOutline } from 'ionicons/icons';
import { AuthStore } from 'src/app/services/auth-store';

@Component({
  selector: 'app-sweep-scan',
  templateUrl: './sweep-scan.page.html',
  styleUrls: ['./sweep-scan.page.scss'],
  standalone: true,
  imports: [IonSpinner, IonIcon, IonText, IonButton, IonContent, CommonModule, FormsModule]
})
export class SweepScanPage implements ViewWillEnter, ViewWillLeave {
  private route = inject(ActivatedRoute);
  private navController = inject(NavController);
  private authStore = inject(AuthStore);
  assetsStore = inject(AssetsStore);
  sweepId = Number(this.route.snapshot.paramMap.get('id'));

  scanning = signal(false);
  lastScanned = signal('');
  warning = signal('');
  warningType = signal<'duplicate' | 'error' | ''>('');
  permissionDenied = signal(false);

  constructor() {
    addIcons({ cameraOutline });
  }

  private recentScans = new Map<string, number>;
  private readonly COOLDOWN_MS = 3000;
  private warningTimer?: ReturnType<typeof setTimeout>;
  private audioContext?: AudioContext;

  ionViewWillEnter(): void
  {
    if(!this.authStore.can('assets', 'write')) this.navController.navigateBack(['/tabs/sweeps', this.sweepId])
    else
    {
      this.assetsStore.loadAssets(this.sweepId).subscribe();
      this.startScanning();
    }
  }

  ionViewWillLeave(): void
  {
    if (this.scanning())
    {
      this.stopScanning();
    }
    this.recentScans.clear();
    clearTimeout(this.warningTimer);
  }

  async startScanning()
  {
    const { camera } = await BarcodeScanner.requestPermissions();
    if (camera !== 'granted' && camera !== 'limited')
    {
      this.permissionDenied.set(true);
      return;
    }
    this.permissionDenied.set(false);

    document.body.classList.add('scanner-active');
    this.scanning.set(true);

    await BarcodeScanner.startScan({
      formats: [
        BarcodeFormat.Ean13, BarcodeFormat.Ean8,
        BarcodeFormat.UpcA, BarcodeFormat.UpcE,
        BarcodeFormat.Code128, BarcodeFormat.Code39
      ]
    });

    await BarcodeScanner.addListener('barcodesScanned', (event) =>
    {
      const barcode = event.barcodes[0];
      if (!barcode?.rawValue) return;
      this.handleScan(barcode.rawValue);
    })
  }

  async stopScanning()
  {
    await BarcodeScanner.stopScan();
    await BarcodeScanner.removeAllListeners();
    document.body.classList.remove('scanner-active');
    this.scanning.set(false);
  }

  private handleScan(value: string)
  {
    const lastSeen = this.recentScans.get(value);
      if (lastSeen && Date.now() - lastSeen < this.COOLDOWN_MS) {
      return;
    }
    this.recentScans.set(value, Date.now());

    this.assetsStore.addAsset(this.sweepId, value).subscribe({
      next: (res) =>
      {
        this.lastScanned.set(value);
        if(res.wasAlreadyPresent)
        {
          this.showWarning('Already scanned', 'duplicate');
          Haptics.notification({ type: NotificationType.Warning });
        }
        else
        {
          this.clearWarning();
          Haptics.impact({ style: ImpactStyle.Light });
          this.beep();
        }
      },
      error: (err) =>
      {
        this.showWarning(err.error ?? 'Could not save scan', 'error');
        Haptics.notification({ type: NotificationType.Error });
      }
    })
  }

  private showWarning(message: string, type: 'duplicate' | 'error')
  {
    clearTimeout(this.warningTimer);
    this.warning.set(message);
    this.warningType.set(type);
    this.warningTimer = setTimeout(() => this.clearWarning(), 2500);
  }

  private clearWarning()
  {
    clearTimeout(this.warningTimer);
    this.warning.set('');
    this.warningType.set('');
  }

  private beep()
  {
    this.audioContext ??=new AudioContext();
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    osc.connect(gain);
    gain.connect(this.audioContext.destination);
    osc.frequency.value = 880;
    gain.gain.value = 0.1;
    osc.start();
    osc.stop(this.audioContext.currentTime + 0.08);
  }

  done()
  {
    // navigateBack pops the scanner off rather than stacking the detail on top
    // of it, so Back from the detail reaches the sweeps list instead of
    // re-opening the camera.
    //
    // This relies on the sweep detail already being in the outlet stack: Ionic's
    // setBack() falls back to setRoot() when the target isn't found, which would
    // wipe the stack and leave the detail as the only view (Back would then exit
    // the tab). Both routes into the scanner guarantee it is present —
    // sweep-detail pushes from itself, and sweeps-list seeds it before opening
    // the scanner on a freshly created sweep.
    this.navController.navigateBack(['/tabs/sweeps', this.sweepId]);
  }
}