import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';

import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFireAuthModule } from 'angularfire2/auth';


//nvironment config
import { environment } from '../environments/environment';

// Services
import { MovieService } from "./services/movies.service";
import { MoviesComponent } from './movies/movies.component';
import { SeriesComponent } from './series/series.component';
import { ProfileComponent } from './profile/profile.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { SeriesService } from "./services/series.service";
import { InfiniteScrollModule } from "angular2-infinite-scroll";
import { AuthService } from "./services/auth.service";

//pipes
import { EllipsisPipe } from './pipes/ellipsis.pipe';




@NgModule({
	declarations: [
		AppComponent,
		MoviesComponent,
		SeriesComponent,
		ProfileComponent,
		LoginComponent,
		RegisterComponent,
		EllipsisPipe
	],
	imports: [
		BrowserModule,
		FormsModule,
		HttpClientModule,
		AppRoutingModule,
		InfiniteScrollModule,
		AngularFireModule.initializeApp(environment.firebase, 'angular-auth-firebase'),
		AngularFireDatabaseModule,
		AngularFireAuthModule,
	],
	providers: [
		MovieService,
		SeriesService,
		AuthService,
	],
	bootstrap: [AppComponent]
})
export class AppModule { }
