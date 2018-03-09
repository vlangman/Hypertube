import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { AuthGuard, isLoggedIn } from './services/auth-guard.service';


// component imports
import { MoviesComponent } from './movies/movies.component';
import { SeriesComponent } from './series/series.component';
import { ProfileComponent } from './profile/profile.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';

const appRoutes: Routes = [
	{ path: '', pathMatch: "full", redirectTo: '/Login', canActivate: [isLoggedIn] },
	{ path: 'Movies', pathMatch: "full", component: MoviesComponent, canActivate: [AuthGuard] },
	{ path: 'Movies/:genre', pathMatch: "full", component: MoviesComponent, canActivate: [AuthGuard]  },
	{ path: 'Movies/Search/:query_term', pathMatch: 'full', component: MoviesComponent, canActivate: [AuthGuard]  },
	{ path: 'Series', pathMatch: "full", component: SeriesComponent, canActivate: [AuthGuard]  },
	{ path: 'Profile', pathMatch: "full", component: ProfileComponent, canActivate: [AuthGuard]  },
	{ path: 'Login', pathMatch: "full", component: LoginComponent, canActivate: [isLoggedIn]},
	{ path: 'Register', pathMatch: "full", component: RegisterComponent },
];

@NgModule({
	imports: [RouterModule.forRoot(appRoutes, {initialNavigation: true})],
	exports: [RouterModule]
})
export class AppRoutingModule {

	constructor() {
		// code...
	}
}