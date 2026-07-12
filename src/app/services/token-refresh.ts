import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TokenRefresh {
  isRefreshing = false;
  readonly refreshSubject = new BehaviorSubject<string | null>(null);
}