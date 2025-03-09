//import the specific api
//then create a function that uses the api

import { omdbApi, tvmazeApi } from './api';
import { supabase } from "@/lib/supabase"

export const searchShows = async (query) =>{
    try{
        console.log("query is ", query)
        const response = await tvmazeApi.get('/search/shows',
            {params:{
            q: query
        }})
        console.log("response is", response)

        const shows = response.data.map(item => item.show)
        console.log("Extracted shows:", shows);
        return shows;
    } catch (error) {
        console.error('Error searching movies:', error);
        throw error;
    }
}

export const getMovieDetails = async (id) =>{
    try{
        const response = await omdbApi.get('/',{params:{
            i:id
        }})
        return response.data;
    } catch (error) {
        console.error('Error getting movie details:', error);
        throw error;
    }
}

export const getTvShowsDetails = async (query) => {
    try {
        const response = await tvmazeApi.get('/search/shows', {
            params: {
                q: query
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error searching TV shows:', error);
        throw error;
    }
}


export const getShowEpisodes = async (id) => {
    try{
        console.log("get show episodess")
    const response = await tvmazeApi.get(`/shows/${id}/episodes`);
    const episodes = response.data;

    const totalEpisodes = episodes.length;

    const episodesPerSeason = episodes.reduce((acc, episode) => {
        const season = episode.season;
        if (acc[season]) {
          acc[season] += 1;
        } else {
          acc[season] = 1;
        }
        return acc;
      }, {});
      
      const totalSeasons = Object.keys(episodesPerSeason).length;

        return {totalEpisodes, episodesPerSeason, totalSeasons};
    }
    catch(error){
        console.error("error getting the show's episodes",error)
        throw error
    }
}

export const addShowToCollection = async (show) => {
    try {
      // Ensure we have the required fields
      if (!show.imdbID) {
        throw new Error('Show is missing imdbID');
      }

      const genresArray = show.Genre ? show.Genre.split(', ') : [];
      const releaseYear = show.Year ? parseInt(show.Year.split('–')[0]) : null;
      const imdbRating = show.imdbRating ? parseFloat(show.imdbRating) : null;
      const mediaType = show.Type?.toLowerCase() || 'movie';
      
      const mediaRecord = {
        external_id: show.imdbID,
        title: show.Title || '',
        type: mediaType,
        release_year: releaseYear,
        total_seasons: show.totalSeasons ? parseInt(show.totalSeasons) : null,
        total_episodes: null, // OMDB API doesn't provide this
        poster_url: show.Poster || '',
        plot: show.Plot || '',
        genres: genresArray,
        imdb_rating: imdbRating
      };

      console.log("Attempting to insert media record:", mediaRecord);

      const { data, error } = await supabase
        .from('media')
        .insert([mediaRecord])
        .select();
  
      if (error) {
        console.error('Error adding show to collection:', error);
        throw error;
      }
  
      console.log('Show added successfully:', data);
      return data;
    } catch (error) {
      console.error('Failed to add show to collection:', error);
      throw error;
    }
  };
