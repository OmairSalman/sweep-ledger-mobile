import { Injectable } from '@angular/core';
import { BiometricAuth } from '@aparajita/capacitor-biometric-auth';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root',
})
export class Biometrics {
  async isAvailable(): Promise<boolean>
  {
    const result = await BiometricAuth.checkBiometry();
    return result.isAvailable;
  }

  async isEnabled(): Promise<boolean>
  {
    const result = await Preferences.get({ key: 'biometric_login_enabled' });
    if(result.value === null) return false;
    return result.value !== 'false';
  }

  async setEnabled(value: boolean)
  {
    await Preferences.set({ key: 'biometric_login_enabled', value: JSON.stringify(value) });
  }

  async authenticate(): Promise<void>
  {
    return BiometricAuth.authenticate({
      reason: 'Unlock to access your sweeps',
      iosFallbackTitle: '',
      androidTitle: 'Sweep Ledger',
      cancelTitle: 'Cancel',
      allowDeviceCredential: false,
    });
  }
}
