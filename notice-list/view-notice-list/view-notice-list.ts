import { Component, ViewChild  } from '@angular/core';
import { NavController, NavParams, Content, Platform, PopoverController } from 'ionic-angular';
//import { IonInfiniteScroll } from '@ionic/angular';
// import { NavController, PopoverController } from "ionic-angular";
import { NoticeProvider } from '../../../services/noticeboard';
import { NoticeboardViewPage } from '../../noticeboard-view/noticeboard-view';
import { ProfilePage } from "../../my-profile/profile/profile";
import { DatabaseProvider } from '../../../providers/database/database';
import * as moment from 'moment';
import 'moment/locale/pt-br';
import { AuthServiceProvider } from '../../../providers/auth-service/auth-service';
import {MessagePage} from "../../message-board/message/message";
import { MyApp } from '../../../app/app.component';
import {NotificationsPage} from "../../notifications/notifications";

/**
 * Generated class for the ViewNoticeListPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-view-notice-list',
  templateUrl: 'view-notice-list.html',
})
export class ViewNoticeListPage {
  // @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
  @ViewChild(Content) content: Content;


  // private lastScrollTop: number = 0;
  // private direction: string = "";
  user: any = {}; 
  list: any = {};
  page = 0;
  maximumPages = 2;
  // items: any = {};
  notify:any=[];
  searchQuery: string = '';
  items: string[];
  noticelistIds: any = [];
  listval: any = [];
  // noticedate: any = {};
  constructor(public popoverCtrl: PopoverController,public platform: Platform, public authService: AuthServiceProvider, public DatabaseProvider: DatabaseProvider,public navCtrl: NavController, public navParams: NavParams, public nav: NavController, public noticeboardCtrl: NoticeProvider) {
    this.initializeItems();
    this.platform.registerBackButtonAction(() => {
      if (nav.canGoBack()) {
            nav.pop();
          }else{
          nav.setRoot(MyApp);
          }
    });
    // this.noticelistIds = navParams.get('id');
  }
  presentNotifications(myEvent) {
    console.log(myEvent);
    let popover = this.popoverCtrl.create(NotificationsPage);
    popover.present({
      ev: myEvent
    });
  }
  initializeItems() {
    this.items = this.list.data;
    console.log(this.items);
  }
  // to go account page
  goToAccount() {
    this.navCtrl.push(ProfilePage);
  }
  goToMessage(){
    this.nav.push(MessagePage);
  }
  getItems(ev: any) {
    // Reset items back to all of the items
    this.initializeItems();

    // set val to the value of the searchbar
    const val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.items = this.items.filter((item) => {
        console.log(item['notice_title']);
        return (item['notice_title'].toLowerCase().indexOf(val.toLowerCase()) > -1);
      })
    }
  }

  getDate(ev) {
    // Reset items back to all of the items
    console.log(ev);
    console.log(this.items);
    this.initializeItems();
   
    // set val to the value of the searchbar
    const dateval = ev;
    //console.log(val);
    // if the value is an empty string don't filter the items
    if (dateval) {
      this.items = this.items.filter((item) => {
        console.log(moment(item['notice_start_date']['date']).format("DD-MM-YYYY").indexOf(dateval));
        return (moment(item['notice_start_date']['date']).format("DD-MM-YYYY").match(dateval));
      })  
    }
  }

  ionViewCanEnter() {
    console.log(this.authService.authenticated());  
    return this.authService.authenticated();
  }
  doRefresh(refresher: any) {
    this.ngOnInit();
    refresher.complete();
  }

  ngOnInit() {
    if (JSON.parse(localStorage.getItem('currentuser'))) {
      this.DatabaseProvider.getuser().then((data) => {
        if (data) {
          this.notify = data['total'];
        } else {
          this.notify = '';
        }
      });
    }
    this.listval = [];
    this.user['type'] = 'm';
    this.noticeboardCtrl.notice(this.user, this.page).subscribe((resp: any) => {
      console.log(resp.body);
      this.listval = resp.body['rowcount'];
      console.log(this.listval);
      this.list = resp.body;
      this.initializeItems();
      /*Object.keys(this.list['data']).forEach(function(key) {
        this.noticelistIds.push(this.list['data'][key]['noticelist_index_id']);
      });*/
      this.list['data'].forEach((item, index) => {
        this.noticelistIds.push(item.noticelist_index_id); // 9, 2, 5      
      });
      console.log(this.noticelistIds);
    });
  }
  noticeView(id : number) {
    this.nav.push(NoticeboardViewPage, {
      Id: id,
      nextId: this.noticelistIds 
    });
  }
  

  loadUsers(infiniteScroll) {
    console.log("infiniteee");
    this.noticeboardCtrl.notice(this.user, this.page).subscribe((resp: any) => {
      resp.body['data'].forEach(element => {
        //console.log(element);
        this.items.push(element);
      });

      console.log(this.items);
      this.list = resp.body;
      console.log(this.list['rowcount']);
      if (infiniteScroll) {
        infiniteScroll.complete();
      }
    });
  }

  loadMore(infiniteScroll) {
    this.page += 10;
    console.log("page:");
    console.log(this.page);
    this.loadUsers(infiniteScroll);

    if (this.page === this.maximumPages) {
      if (!this.list['rowcount']) {
        console.log(!this.list['rowcount']);
        infiniteScroll.enable(false);
      } 
    }
  }
}
