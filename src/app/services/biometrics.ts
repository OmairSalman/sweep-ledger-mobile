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
      androidTitle: 'Glyph Ledger',
      androidSubtitle: 'Unlock to access your scans',
      cancelTitle: 'Cancel',
      allowDeviceCredential: false,
    });
  }
}
