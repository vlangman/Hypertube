// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  firebase: {
		apiKey: "AIzaSyDfm-qmawoD37oDSpGbzFtf7Qj1n-PGXsw",
		authDomain: "hypertube-5b429.firebaseapp.com",
		databaseURL: "https://hypertube-5b429.firebaseio.com",
		projectId: "hypertube-5b429",
		storageBucket: "hypertube-5b429.appspot.com",
		messagingSenderId: "702362178878"
	},
	google: {
		webClientId: '702362178878-fclssvebisnr7gnb11mushkl978om0e9.apps.googleusercontent.com',
		webClientSecret: 'ZaSNE6Zwxnd8odCzpF2S8gIz',
	},
};
