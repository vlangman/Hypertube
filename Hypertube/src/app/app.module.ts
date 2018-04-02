import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFirestoreModule } from "angularfire2/firestore";
import { AngularFireStorageModule } from "angularfire2/storage";


//environment config -> (firebase config)
import { environment } from '../environments/environment';

// Services
import { SeriesService } from "./services/series.service";
import { AuthService } from "./services/auth.service";
import { MovieService } from "./services/movies.service";
import { TorrentService } from './services/torrent.service';
import { FilesService } from './services/files.service';
import { FileuploadService } from './services/fileupload.service'
//components
import { MoviesComponent } from './movies/movies.component';
import { MoviedetailsComponent } from './movies/moviedetails/moviedetails.component';
import { SeriesComponent } from './series/series.component';
import { ProfileComponent } from './profile/profile.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { PagenotfoundComponent } from './pagenotfound/pagenotfound.component';

//Util/Dom
import { InfiniteScrollModule } from "angular2-infinite-scroll";
//Guards
import { AuthGuard } from './services/auth-guard.service';

//pipes
import { EllipsisPipe } from './pipes/ellipsis.pipe';

import { WatchComponent } from './watch/watch.component';

import { FileSizePipe } from './pipes/file-size.pipe';


//video player imports
import {VgCoreModule} from 'videogular2/core';
import {VgControlsModule} from 'videogular2/controls';
import {VgOverlayPlayModule} from 'videogular2/overlay-play';
import {VgBufferingModule} from 'videogular2/buffering';
//directives
import { DropZoneDirective } from './services/drop-zone.directive';

@NgModule({
	declarations: [
		AppComponent,
		MoviesComponent,
		SeriesComponent,
		ProfileComponent,
		LoginComponent,
		RegisterComponent,
		EllipsisPipe,
		PagenotfoundComponent,
		WatchComponent,
		MoviedetailsComponent,
		DropZoneDirective,
		FileSizePipe
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
        VgCoreModule,
        VgControlsModule,
        VgOverlayPlayModule,
        VgBufferingModule,
        AngularFirestoreModule,
		AngularFireStorageModule,	
	],
	providers: [
		MovieService,
		SeriesService,
		AuthService,
		AuthGuard,
		FileuploadService,
		TorrentService,
		FilesService,
	],
	bootstrap: [AppComponent]
})
export class AppModule { }

