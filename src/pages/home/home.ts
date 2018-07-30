import { AuthService } from './../../services/auth.service';
import { AngularFireDatabase } from 'angularfire2/database';
import { Component } from '@angular/core';
import { NavController, IonicPage, ToastController } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';
import { Observable } from 'rxjs';

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  profileData: Observable<{}>;
  constructor(public navCtrl: NavController, private afAuth: AngularFireAuth, private toast: ToastController, private afDatabase: AngularFireDatabase, private as: AuthService) {

  }

  ionViewWillLoad() {
    this.afAuth.authState.subscribe(data => {
      if (data && data.email && data.uid) {
        this.toast.create({
          message: `Welcome to APP_NAME, ${data.email}`,
          duration: 3000
        }).present();
        this.profileData = this.afDatabase.object(`profile/${data.uid}`).valueChanges();
      }
    });
  }

  logout() {
    this.as.updateStatus('offline')
    this.afAuth.auth.signOut();
    this.navCtrl.setRoot('LoginPage');
  }
}
