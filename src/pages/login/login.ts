import { AuthService } from './../../services/auth.service';
import { AngularFireDatabase } from 'angularfire2/database';
import { User } from './../../models/user';
import { Component } from '@angular/core';
import { NavController, NavParams, IonicPage, ToastController } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';
/**
 * Generated class for the LoginPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {
  user = {} as User;
  constructor(public navCtrl: NavController, public navParams: NavParams, private afAuth: AngularFireAuth, private toast: ToastController, private db: AngularFireDatabase, private as: AuthService) {
  }

  async login(user: User) {
    try {
      const result = await this.afAuth.auth.signInWithEmailAndPassword(user.email, user.password);
      if (result) {
        this.afAuth.authState.subscribe(data => {
          if (data && data.email && data.uid) {
            this.as.userId = data.uid;
            this.db.database.ref('profile/').on('value', (snapshot) => {
              if (snapshot.val() != null) {
                snapshot.forEach((dbdata) => {
                  if (dbdata.key == data.uid) {
                    this.navCtrl.setRoot('HomePage');
                  }
                  else {
                    this.navCtrl.setRoot('ProfilePage');
                  }
                })
              }
            });
          }
        });
      }
    }
    catch (e) {
      this.toast.create({
        message: `Could not find authentication details`,
        duration: 3000
      }).present();
    }
  }

  register() {
    this.navCtrl.push('RegisterPage');
  }

}
