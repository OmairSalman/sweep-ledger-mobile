import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  constructor() {
    // The toolbar is maroon in both palettes, so the status bar always wants
    // light (white) icons. Without an explicit style each OEM guesses its own
    // default in light mode — white on OnePlus, black on Poco.
    if (Capacitor.isNativePlatform())
    {
      StatusBar.setStyle({ style: Style.Dark });
      if (Capacitor.getPlatform() === 'android')
      {
        StatusBar.setBackgroundColor({ color: '#670e0a' });
      }
    }
  }
}
