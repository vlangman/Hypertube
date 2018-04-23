
export class TMDB {

	public movie_results: string[];
	public person_results:string[];
	public tv_results: string[];
	public tv_episode_results: string[];
	public tv_season_results: string[];


	constructor(
			movie_results: string[], 
			person_results: string[],
			tv_results: string[],
			tv_episode_results: string[],
			tv_season_results: string[],
		) {
		this.movie_results = movie_results;
		this.person_results = person_results;
		this.tv_results = tv_results;
		this.tv_episode_results = tv_episode_results;
		this.tv_season_results = tv_season_results;
	}
}