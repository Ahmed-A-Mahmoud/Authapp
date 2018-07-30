import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import { Observable } from 'rxjs/Observable'
import { Subscription } from 'rxjs/Subscription'
import 'rxjs/add/observable/timer';
import 'rxjs/add/operator/throttleTime';

@Injectable()
export class AuthService {

    userId: string; // current user uid
    mouseEvents: Subscription;
    timer: Subscription;

    constructor(private afAuth: AngularFireAuth,
        private db: AngularFireDatabase) {
        /// Subscribe to auth state in firebase
        this.afAuth.authState
            .do(user => {
                if (user) {
                    this.userId = user.uid
                    this.updateOnConnect()
                    this.updateOnDisconnect()
                    this.updateOnIdle()
                }
            })
            .subscribe();
    }

    /// Helper to perform the update in Firebase
    public updateStatus(status: string) {
        if (!this.userId) return
        this.db.object(`profile/` + this.userId).update({ status: status })
    }
    /// Updates status when connection to Firebase starts
    private updateOnConnect() {
        return this.db.object('.info/connected').valueChanges()
            .do(connected => {
                let status = connected ? 'online' : 'offline'
                this.updateStatus(status)
            })
            .subscribe()
    }
    /// Updates status when connection to Firebase ends
    private updateOnDisconnect() {
        firebase.database().ref().child(`profile/${this.userId}`)
            .onDisconnect()
            .update({ status: 'offline' })
    }

    private updateOnIdle() {
        this.mouseEvents = Observable
            .fromEvent(document, 'mousemove')
            .throttleTime(2000)
            .do(() => {
                this.updateStatus('online')
                this.resetTimer()
            })
            .subscribe()
    }

    /// Reset the timer
    private resetTimer() {
        if (this.timer) this.timer.unsubscribe()
        this.timer = Observable.timer(5000)
            .do(() => {
                this.updateStatus('away')
            })
            .subscribe()
    }

    /// Make sure to close these subscriptions when no longer needed.
    signOut() {
        this.updateStatus('offline')
        this.mouseEvents.unsubscribe()
        this.timer.unsubscribe()
        this.afAuth.auth.signOut();
    }
}