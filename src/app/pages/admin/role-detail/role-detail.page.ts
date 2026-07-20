import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonHeader, IonTitle, IonToolbar, ViewWillEnter, IonButtons, IonBackButton, IonText, IonSpinner, IonList, IonItem, IonLabel, IonIcon, IonToggle, IonButton, ActionSheetController, AlertController, ToastController } from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { MatrixRow, PagePermissionEntry, Role, RolePagePermissions } from 'src/models/role';
import { RolesStore } from 'src/app/services/roles-store';
import { forkJoin } from 'rxjs';
import { PagesStore } from 'src/app/services/pages-store';
import { Page } from 'src/models/page';

@Component({
  selector: 'app-role-detail',
  templateUrl: './role-detail.page.html',
  styleUrls: ['./role-detail.page.scss'],
  standalone: true,
  imports: [IonButton, IonToggle, IonIcon, IonLabel, IonItem, IonList, IonSpinner, IonBackButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, IonText]
})
export class RoleDetailPage implements ViewWillEnter {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private rolesStore = inject(RolesStore);
  private pagesStore = inject(PagesStore);
  private actionSheetController = inject(ActionSheetController);
  private alertController = inject(AlertController);
  private toastController = inject(ToastController);
  roleId = Number(this.route.snapshot.paramMap.get('id'));

  loading = signal(false);
  saving = signal(false);
  errorMsg = signal('');
  role = signal<Role | null>(null);
  matrix = signal<MatrixRow[]>([]);
  private snapshot: MatrixRow[] = [];
  availablePages = computed(() =>
  {
    const grantedIds = new Set(this.matrix().map(row => row.pageId));
    return this.pagesStore.pages().filter(page => !grantedIds.has(page.id));
  });
  dirty = computed(() => {
    const normalize = (rows: MatrixRow[]) =>
    rows.map(({ pageId, isRead, isWrite, isUpdate, isDelete, isPrint }) =>
      ({ pageId, isRead, isWrite, isUpdate, isDelete, isPrint })).sort((a,b) => a.pageId - b.pageId);
    return JSON.stringify(normalize(this.matrix())) !== JSON.stringify(normalize(this.snapshot));
  });

  constructor() { }

  ionViewWillEnter(): void
  {
    this.loading.set(true);
    this.errorMsg.set('');
    this.resolveRole();

    forkJoin({
      pages: this.pagesStore.loadPages(),
      permissions: this.rolesStore.loadRolePermissions(this.roleId)
    }).subscribe({
      next:({ permissions }) =>
      {
        this.buildMatrix(this.pagesStore.pages(), permissions);
        this.loading.set(false);
      },
      error: (err) =>
      {
        this.errorMsg.set(typeof err?.error === 'string' ? err.error : 'Could not load permissions');
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

  resolveRole()
  {
    const currentRole = this.rolesStore.roles().find(r => r.id === this.roleId);
    if(currentRole !== undefined)
    {
      this.role.set(currentRole);
      this.loading.set(false);
    }
    else
    {
      this.rolesStore.loadRoles().subscribe({
        next:() =>
        {
          {
            const found = this.rolesStore.roles().find(r => r.id === this.roleId);
            if (found === undefined)
            {
              this.router.navigate(['/admin/roles']);
              return;
            }
            this.role.set(found);
          }
        },
        error:(err) =>
        {
          this.errorMsg.set(typeof err.error === 'string' ? err.error : 'Could not load this role');
          this.loading.set(false);
        }
      })
    }
  }

  private buildMatrix(pages: Page[], permissions: RolePagePermissions[]): void
  {
    const rows: MatrixRow[] = permissions.map(grant =>
    {
      const page = pages.find(p => p.id === grant.pageId);
      return {
        pageId: grant.pageId,
        pageName: page?.name ?? grant.pageKey,
        pageKey: grant.pageKey,
        isRead: grant.isRead,
        isWrite: grant.isWrite,
        isUpdate: grant.isUpdate,
        isDelete: grant.isDelete,
        isPrint: grant.isPrint,
        expanded: false
      };
    });

    this.matrix.set(rows);
    this.snapshot = structuredClone(rows);
  }

  async onToggle(pageId: number, field: 'isRead' | 'isWrite' | 'isUpdate' | 'isDelete' | 'isPrint', event: CustomEvent)
  {
    const checked = event.detail.checked;

    if(field === 'isRead' && !checked)
    {
      const row = this.matrix().find(r => r.pageId === pageId);
      const alert = await this.alertController.create({
        header: 'Revoke this page?',
        message: `Turning off Read removes "${row?.pageName}" from this role entirely. All of its permissions will be revoked when you save.`,
        buttons: [
          { text: 'Cancel', role: 'cancel', handler: () => this.resyncRead(pageId) },
          { text: 'Revoke', role: 'destructive', handler: () => this.removeRow(pageId) }
        ]
      });
      await alert.present();
      const { role } = await alert.onWillDismiss();
      if(role !== 'destructive') this.resyncRead(pageId);
      return;
    }

    this.matrix.update(rows =>
      rows.map(r => r.pageId === pageId ? { ...r, [field]: checked } : r)
    );
  }

  private removeRow(pageId: number)
  {
    this.matrix.update(rows => rows.filter(r => r.pageId !== pageId));
  }

  private resyncToggles()
  {
    this.matrix.update(rows => rows.map(r => ({ ...r })));
  }

  private resyncRead(pageId: number)
  {
    // Mirror the toggle's rogue state so Angular has a real change to write...
    this.matrix.update(rows =>
      rows.map(r => r.pageId === pageId ? { ...r, isRead: false } : r)
    );
    // ...then restore truth on the next tick — a second real change.
    setTimeout(() =>
    {
      this.matrix.update(rows =>
        rows.map(r => r.pageId === pageId ? { ...r, isRead: true } : r)
      );
    }, 0);
  }

  toggleExpanded(pageId: number)
  {
    this.matrix.update(rows =>
      rows.map(r => r.pageId === pageId ? { ...r, expanded: !r.expanded } : r)
    );
  }

  async openAddPage()
  {
    const actionSheet = await this.actionSheetController.create({
      header: 'Add page',
      buttons: [
        ...this.availablePages().map(page => ({
          text: page.name,
          handler: () => this.addPageRow(page)
        })),
        { text: 'Cancel', role: 'cancel' }
      ]
    });
    await actionSheet.present();
  }

  addPageRow(page: Page)
  {
    this.matrix.update(rows => [...rows, {
      pageId: page.id,
      pageName: page.name,
      pageKey: page.pageKey,
      isRead: true,
      isWrite: false, isUpdate: false, isDelete: false, isPrint: false,
      expanded: true
    }]);
  }

  save()
  {
    this.saving.set(true);
    const permissions: PagePermissionEntry[] = this.matrix().map(r => ({
      pageId: r.pageId,
      isRead: r.isRead, isWrite: r.isWrite, isUpdate: r.isUpdate,
      isDelete: r.isDelete, isPrint: r.isPrint
    }));

    this.rolesStore.saveRolePermissions(this.roleId, permissions).subscribe({
      next:(fresh) =>
      {
        this.saving.set(false);
        this.buildMatrix(this.pagesStore.pages(), fresh);
        this.showToast('Permissions saved', 'app-toast-success');
      },
      error: (err) =>
      {
        this.saving.set(false);
        this.showToast(typeof err?.error === 'string' ? err.error : 'Could not save permissions', 'app-toast-error');
      }
    })
  }
}