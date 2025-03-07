//import the specific api
//then create a function that uses the api

import omdbApi from './api';
import tvmazeApi from './api';

export const searchMovies = async (query) =>{
    try{
        const response = await omdbApi.get('/',{params:{
            s: query
        }})
        return response.data;
    }catch(error){
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
    }catch(error){
        console.error('Error getting movie details:', error);
        throw error;
    }
}

export const getTvShowsDetails = async (query) =>{
    return tvmazeApi.get('/search/shows',{params:{
        q:query
    }})
}