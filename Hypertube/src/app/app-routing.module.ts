import { NgModule }  from "@angular/core";
import { Routes, RouterModule }  from "@angular/router";

// component imports
import { MoviesComponent } from './movies/movies.component';
import { SeriesComponent } from './series/series.component';
import { ProfileComponent } from './profile/profile.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';

const appRoutes: Routes = [
	{path: '' , pathMatch: "full", redirectTo: '/Movies'},
	{path: 'Movies', pathMatch: "full", component: MoviesComponent},
	{path: 'Series', pathMatch: "full", component: SeriesComponent},
	{path: 'Profile', pathMatch: "full", component: ProfileComponent},
	{path: 'Login', pathMatch: "full", component: LoginComponent},
	{path: 'Register', pathMatch: "full", component: RegisterComponent},
];

@NgModule({
	imports: [RouterModule.forRoot(appRoutes)],
	exports: [RouterModule]
})
export class AppRoutingModule {
	
	constructor() {
		// code...
	}
}