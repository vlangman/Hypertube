import { NgModule } from "@angular/core";
import { Routes, RouterModule, ExtraOptions } from "@angular/router";
import { AuthGuard} from './services/auth-guard.service';

// component imports
import { MoviesComponent } from './movies/movies.component';
import { SeriesComponent } from './series/series.component';
import { ProfileComponent } from './profile/profile.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { PagenotfoundComponent } from "./pagenotfound/pagenotfound.component";
import { MoviedetailsComponent } from './movies/moviedetails/moviedetails.component';
import { SeriesdetailsComponent }from './series/seriesdetails/seriesdetails.component';



const appRoutes: Routes = [
	{ path: '', pathMatch: "full", redirectTo: '/Movies', canActivate: [AuthGuard], runGuardsAndResolvers: 'always' },
	{ path: '', pathMatch: "full", redirectTo: '/Login'},
	{ path: 'Movies', pathMatch: "full", component: MoviesComponent, canActivate: [AuthGuard] , runGuardsAndResolvers: 'always'},
	{ path: 'Movies/Genre/:genreId', pathMatch: "full", component: MoviesComponent, canActivate: [AuthGuard], runGuardsAndResolvers: 'always' },
	{ path: 'Movies/Details/:movie_id', pathMatch: 'full', component: MoviedetailsComponent, canActivate: [AuthGuard], runGuardsAndResolvers: 'always'},
	{ path: 'Series', pathMatch: "full", component: SeriesComponent, canActivate: [AuthGuard], runGuardsAndResolvers: 'always'},
	{ path: 'Series/AllShows', pathMatch: "full", component: SeriesComponent, canActivate: [AuthGuard], runGuardsAndResolvers: 'always'},
	{ path: 'Series/Details/:series_id/:series_hash/:filename', pathMatch: 'full', component: SeriesdetailsComponent, canActivate: [AuthGuard], runGuardsAndResolvers: 'always'},
	{ path: 'Profile', pathMatch: "full", component: ProfileComponent, canActivate: [AuthGuard], runGuardsAndResolvers: 'always'},
	{ path: 'Login', pathMatch: "full", component: LoginComponent },
	{ path: 'Register', pathMatch: "full", component: RegisterComponent },
	{ path: '**', component: PagenotfoundComponent },
];

@NgModule({
	imports: [RouterModule.forRoot(appRoutes, {onSameUrlNavigation: 'reload', })],
	exports: [RouterModule],
})
export class AppRoutingModule {

	constructor() {
		// code...
	}
}
