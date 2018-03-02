import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';

  navOpen : boolean = true;

  toggleNavbar(){
  	if (this.navOpen) {
  		this.navOpen = false;
  		console.log(this.navOpen);
  	}
  	else{
  		this.navOpen = true;
  		console.log(this.navOpen);
  	}
  }
}
