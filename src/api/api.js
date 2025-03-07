import axios from 'axios';

const omdbApi = axios.create({
    baseURL:import.meta.env.VITE_OMDB_URL,
    params:{
        apiKey:import.meta.env.VITE_OMDB_KEY
    }
});

const tvmazeApi = axios.create({
    baseURL:import.meta.env.VITE_TVMAZE_URL
})
export default omdbApi;

