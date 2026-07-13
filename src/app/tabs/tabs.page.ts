import { Component } from '@angular/core';
import { IonTabs, IonTabBar, IonIcon, IonLabel, IonTabButton } from '@ionic/angular/standalone';
import { listOutline, personOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
  standalone: true,
  imports: [IonTabButton, IonLabel, IonIcon, IonTabBar, IonTabs]
})
export class TabsPage {

  constructor() {
    addIcons({ listOutline, personOutline });
  }

}