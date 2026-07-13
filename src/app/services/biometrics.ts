import { Injectable } from '@angular/core';
import { BiometricAuth } from '@aparajita/capacitor-biometric-auth';

@Injectable({
  providedIn: 'root',
})
export class Biometrics {
  async isAvailable(): Promise<boolean>
  {
    const result = await BiometricAuth.checkBiometry();
    return result.isAvailable;
  }

  async authenticate(): Promise<void>
  {
    return BiometricAuth.authenticate({
      androidTitle: 'Sweep Ledger',
      androidSubtitle: 'Unlock to access the app',
      cancelTitle: 'Cancel',
      allowDeviceCredential: false,
    });
  }
}
