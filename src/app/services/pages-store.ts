import { inject, Injectable, signal } from '@angular/core';
import { Page } from 'src/models/page';
import { Api } from './api';
import { map, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PagesStore {
  private api = inject(Api);
  pages = signal<Page[]>([]);
  
  loadPages(): Observable<void>
  {
    return this.api.get<Page[]>('/pages').pipe(
      tap((pages) => this.pages.set(pages)),
      map(() => {})
    )
  }

  addPage(name: string, pageKey: string): Observable<Page>
  {
    return this.api.post<Page>('/pages', { name, pageKey }).pipe(
      tap((page) => this.pages.update(pages => [...pages, page]
        .sort((a, b) => a.name.localeCompare(b.name))
      ))
    )
  }

  updatePage(pageId: number, name: string, pageKey: string): Observable<Page>
  {
    return this.api.put<Page>(`/pages/${pageId}`, { name, pageKey }).pipe(
      tap((page) => this.pages.update(pages =>
        pages.map(p => p.id === pageId ? page : p)
        .sort((a, b) => a.name.localeCompare(b.name))
      ))
    )
  }

  deletePage(pageId: number): Observable<void>
  {
    return this.api.delete<void>(`/pages/${pageId}`).pipe(
      tap(() => this.pages.update(pages => pages.filter(p => p.id !== pageId)))
    )
  }
}