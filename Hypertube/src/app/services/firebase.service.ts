import { Injectable } from '@angular/core';
<<<<<<< Updated upstream
<<<<<<< Updated upstream
=======
import { Http, Response } from '@angular/http';
import 'rxjs/Rx';
import { Observable } from 'rxjs/Observable'
>>>>>>> Stashed changes
=======
import { Http, Response } from '@angular/http';
import 'rxjs/Rx';
import { Observable } from 'rxjs/Observable'
>>>>>>> Stashed changes

@Injectable()
export class FirebaseService {

<<<<<<< Updated upstream
<<<<<<< Updated upstream
  constructor() { }
=======
=======
>>>>>>> Stashed changes
  constructor(private http: Http) { }


	//used to post data into database
	//creates an observable that will only be sent if an observer subscribes to it
	storeServers(servers: any[]) {
		return this.http.post('https://hypertube-5b429.firebaseio.com/data.json', servers);
	}

	//used to get data from database
	//creates an observable that will only be sent if an observer subscribes to it

	// if an error is caught an observable is created and the error thrown from the observable
	getServers(){
		return this.http.get('https://hypertube-5b429.firebaseio.com/data.json')
		.map(
				(response: Response) => {
					const data = response.json();
					return data;
				}
			)
		.catch(
			(error: Response) => {
				console.log(error);
				return Observable.throw(error);
				
			}
		)
	}

	//used to overwrite data in database
	//creates an observable that will only be sent if an observer subscribes to it
	overwriteServers(servers: any[]){
		return this.http.put('https://hypertube-5b429.firebaseio.com/data.json', servers);
	}
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes

}
