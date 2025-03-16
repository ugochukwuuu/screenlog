//import the specific api
//then create a function that uses the api

import { omdbApi, tvmazeApi } from './api';
import { supabase } from "@/lib/supabase"

export const tvmazeApiSearchShows = async (query) =>{
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
export const omdbApiSearchShows = async (query) =>{
    try{
        console.log("query is ", query)
        const response = await omdbApi.get('/',
            {params:{
            s: query
        }})
        console.log("response is", response)

        const shows = response.data.Search;
        console.log("Extracted shows:", shows);
        return shows;

        // return response; 
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


export const getShowEpisodes = async (title) => {
    try{
        console.log(title)
    const response = await tvmazeApi.get(`/singlesearch/shows/?q=${title}&embed=episodes`);
    // const response = await tvmazeApi.get(`/shows/${id}/episodes`);

    const episodes = response.data._embedded.episodes;
    // console.log("episodes",episodes)

    const totalEpisodes = episodes.length;
    // console.log("total episodes", totalEpisodes)

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

        console.log(totalEpisodes, episodesPerSeason, totalSeasons);
        return {totalEpisodes, episodesPerSeason, totalSeasons};
    }
    catch(error){
        console.error("error getting the show's episodes",error)
        throw error
    }
}

export const addShowToMediaTable = async (mediaRecord) => {
  try {
    console.log("media record",mediaRecord)
    if (!mediaRecord.external_id) {
      throw new Error('External ID is required');
    }


    const { data: existingMedia, error: checkError } = await supabase
      .from('media')
      .select('*')
      .eq('external_id', mediaRecord.external_id)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing media:', checkError);
      return { error: checkError };
    }

    
    if (existingMedia) {
      return { 
        error: { 
          message: 'Show already exists in the database',
          existingShow: existingMedia 
        } 
      };
    }

   
    const { data: insertedMedia, error: insertError } = await supabase
      .from('media')
      .insert([{
        external_id: mediaRecord.external_id,
        title: mediaRecord.title,
        type: mediaRecord.type,
        release_year: mediaRecord.release_year,
        total_seasons: mediaRecord.total_seasons,
        total_episodes: mediaRecord.total_episodes,
        poster_url: mediaRecord.poster_url,
        episodes_per_season: mediaRecord.episodes_per_season
      }])
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting media:', insertError);
      return { error: insertError };
    }

    return { data: insertedMedia,  };
  } catch (error) {
    console.error('Error in addShowToMediaTable:', error);
    return { error };
  }
};


export const addShowToUsersCollections = async (mediaResult,usersChoice,id) =>{
    const { data:showData,error: userMediaError } = await supabase
            .from('user_media')
            .insert([{
                user_id: id,
                media_id: mediaResult.media_id,
                status: usersChoice.status.toLowerCase(),
                current_season: usersChoice.selectedSeason,
                current_episode: usersChoice.selectedEpisode,
                imdb_id: mediaResult.external_id,
                added_at: new Date().toISOString()
            }])
            .single()
            .select();

        if (userMediaError) {
            if (userMediaError.code === '23505') { // Unique violation
                console.log("Show already in user's collection");
                throw new Error("Show already in your collection");
            }
            throw userMediaError;
        }
        console.log(showData)
        return {success: true,showData};
}

export const updateShowToUsersCollections = async (mediaResult,usersChoice,id) =>{
    
const { data:showData, error } = await supabase
.from('user_media')
.update({
    status: usersChoice.status.toLowerCase(),
    current_season: usersChoice.selectedSeason,
    current_episode: usersChoice.selectedEpisode
})
.eq('imdb_id', mediaResult.external_id)
.select()

if (error) {
    console.error('Error updating user media:', error);
    throw error;
}
console.log(showData)
return {success: true,showData};
} 

export const addShowToWatchList = async (mediaResult,id) => {
    const { error: userMediaError } = await supabase
    .from('user_media')
    .insert([{
        user_id: id,
        media_id: mediaResult.data?.media_id,
        status: 'plan_to_watch',
        added_at: new Date().toISOString()
    }])
    .single();

if (userMediaError) {
    if (userMediaError.code === '23505') { // Unique violation
        console.log("Show already in user's collection");
        throw new Error("Show already in your collection");
    }
    throw userMediaError;
}

return "show successfully added to user's table"
}