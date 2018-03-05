import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';

import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { InfiniteScrollModule } from 'angular2-infinite-scroll';

// Services
import { MovieService } from "./services/movies.service";
import { MoviesComponent } from './movies/movies.component';
import { SeriesComponent } from './series/series.component';
import { ProfileComponent } from './profile/profile.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { SeriesService } from "./services/series.service";




@NgModule({
	declarations: [
		AppComponent,
		MoviesComponent,
		SeriesComponent,
		ProfileComponent,
		LoginComponent,
		RegisterComponent,
	],
	imports: [
		BrowserModule,
		FormsModule,
		HttpClientModule,
		AppRoutingModule,
		InfiniteScrollModule
	],
	providers: [
		MovieService,
		SeriesService,
	],
	bootstrap: [AppComponent]
})
export class AppModule { }
