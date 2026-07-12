import { Injectable } from '@angular/core';
import { SecureStorage } from '@aparajita/capacitor-secure-storage'

@Injectable({
  providedIn: 'root',
})
export class TokenStorage {
  private accessToken: string | null = null;
  private readonly REFRESH_TOKEN_KEY = 'RefreshToken';

  setAccessToken(token: string)
  {
    this.accessToken = token;
  }
  getAccessToken()
  {
    return this.accessToken;
  }

  async setRefreshToken(token: string): Promise<void>
  {
    await SecureStorage.setItem(this.REFRESH_TOKEN_KEY, token);
  }

  async getRefreshToken(): Promise<string | null>
  {
    return await SecureStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  async clear(): Promise<void>
  {
    this.accessToken = null;
    await SecureStorage.removeItem(this.REFRESH_TOKEN_KEY);
  } 
}
