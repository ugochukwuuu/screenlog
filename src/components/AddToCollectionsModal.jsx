import {React, useState, useEffect, useContext} from 'react'
import { Button } from './ui/button'
import {X} from 'lucide-react'
import {ArrowDown} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from './ui/skeleton'
import {SkeletonCard} from "../components/SkeletonCard"
import { addShowToUsersCollections, updateShowToUsersCollections } from '@/api/movieApi'
import { UserCollectionContext } from '../App'
import { statusColors } from "@/constants/colors"

const AddToCollectionsModal = ({showData = {}, setShowModal, inUserCollection, userId, showAlreadyInCollection}) => {
const [status, setStatus ] = useState("unwatched")
const [statusOptions] = useState(["unwatched", "watching", "plan to watch", "watched", "stalled", "dropped"])
const [selectedSeason, setSelectedSeason] = useState(null);
const [selectedEpisode, setSelectedEpisode] = useState(null);
const [seasons, setSeasons] = useState([]);
const [episodes, setEpisodes] = useState([]);
const [isLoading, setIsLoading] = useState(false);
const {userCollection, setUserCollection} = useContext(UserCollectionContext);

const handleStatusChange = (newStatus) => {
  setStatus(newStatus)
}

useEffect(() => {
  if (selectedSeason && showData.episodes_per_season) {
    const episodeCount = showData.episodes_per_season[selectedSeason] || 0;
    const episodesList = Array.from({ length: episodeCount }, (_, i) => i + 1);
    setEpisodes(episodesList);
    
    // Set default to first episode
    if (episodesList.length > 0 && !selectedEpisode) {
      setSelectedEpisode(1);
    }
  }

  if(inUserCollection){
    console.log(showAlreadyInCollection)
    setSelectedSeason(showAlreadyInCollection.current_season)
    setSelectedEpisode(showAlreadyInCollection.current_episode)
    setStatus(showAlreadyInCollection.status)
  }
}, [selectedSeason, showData]);

const handleSeasonChange = (season) => {
  setSelectedSeason(season);
  setSelectedEpisode(1);
};

const handleEpisodeChange = (episode) => {
  setSelectedEpisode(episode);
};

const handleUpdateCollection = async () =>{
  const {current_season, current_episode, status:currentStatus} = showAlreadyInCollection;
  if(selectedSeason == current_season && 
    selectedEpisode == current_episode &&
    status == currentStatus
  ){
    console.log("you didn't change anything")
    setShowModal()
    return;
  }

  const updateToUserCollections = await updateShowToUsersCollections (showData,{
    selectedSeason: selectedSeason,
    selectedEpisode: selectedEpisode,
    status: status
  },userId);

  const requestStatus = updateToUserCollections.success;
  const requestData = updateToUserCollections.showData;
  if (updateToUserCollections.success === true) {

    setUserCollection(prevCollection => 
      prevCollection.map(show => {
        if (show.imdb_id === requestData.external_id || show.external_id === requestData.external_id) {
          return {
            ...show, 
            ...requestData
          };
        }

        return show;
      })
    );
    
    setShowModal(false);
  }
}

const handleAddToCollection = async () =>{
  const addToUserCollections = await addShowToUsersCollections(showData,{
    selectedSeason: selectedSeason,
    selectedEpisode: selectedEpisode,
    status: status
  },userId);

  const requestStatus = addToUserCollections.success;
  const requestData = addToUserCollections.showData;
  if(requestStatus === true){
    setUserCollection(prev=> [...prev, requestData])
    setShowModal()
  }
}
  return (
    <div className="h-full fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    {showData.title ? (      
    <div className="relative bg-gradient-to-r from-violet-500 to-purple-500  p-6 rounded-lg shadow-2xl w-[400px] flex flex-col items-start">
    <div className='flex  justify-between w-full'>
      <h1 className="text-3xl font-bold text-white mb-6">{showData.title}</h1>
      <X className="cursor-pointer text-black " onClick={() => setShowModal(false)} size = {20}/>
    </div>
      


      <div className="flex items-center justify-between w-full text-white">

      <DropdownMenu>
        <DropdownMenuTrigger>
          <div className="flex items-center justify-center gap-1 text-white">
          <span 
            style={{ 
              backgroundColor: statusColors[status], 
              width: "12px", 
              height: "12px", 
              borderRadius: "50%", 
              display: "inline-block", 
              marginRight: "8px" 
            }} 
            ></span>
            <p>{status}</p>
            <ArrowDown className="w-4 h-4" />
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent>

        {statusOptions.map((option) =>(
          <DropdownMenuItem key={option}>
         
            <span 
            style={{ 
              backgroundColor: statusColors[option], 
              width: "12px", 
              height: "12px", 
              borderRadius: "50%", 
              display: "inline-block", 
              marginRight: "8px" 
            }} 
            ></span>

          <p
             style={{ display: "flex", alignItems: "center" }}
             onClick={() => handleStatusChange(option)}>
             {option}
             </p>
          </DropdownMenuItem>
        ))}
        </DropdownMenuContent>
      </DropdownMenu>

        <div className="episodes-selector-cont flex flex-col items-start">
          {status === "watching" && showData.type === "series" && (
                  <>
                    {/* Season Selector */}
                    <div className="flex flex-col items-start justify-start">
                      <p className="text-white">Current Season:</p>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <div className="flex items-center justify-center gap-1 text-white cursor-pointer bg-black bg-opacity-20 px-3 py-1 rounded-md w-24 text-center">
                            <p>Season {selectedSeason}</p>
                            <ArrowDown className="w-4 h-4 ml-1" />
                          </div>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent>
                          {Array.from({ length: showData.total_seasons }, (_, i) => i + 1).map((season) => (
                            <DropdownMenuItem key={season} onSelect={() => handleSeasonChange(season)}>
                              Season {season}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Episode Selector */}
                    <div className="flex flex-col items-start justify-start">
                      <p className="text-white">Current Episode:</p>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <div className="flex items-center justify-center gap-1 text-white cursor-pointer bg-black bg-opacity-20 px-3 py-1 rounded-md w-24 text-center">
                            <p>Ep {selectedEpisode}</p>
                            <ArrowDown className="w-4 h-4 ml-1" />
                          </div>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent className="max-h-48 overflow-y-auto">
                          {episodes.map((episode) => (
                            <DropdownMenuItem key={episode} onSelect={() => handleEpisodeChange(episode)}>
                              Episode {episode}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </>
                )}

            {status === "watching" && showData.type === "series" && selectedSeason && selectedEpisode && (
              <div className="w-full bg-black bg-opacity-20 h-2 rounded-full overflow-hidden mt-2">
                <div 
                  className="bg-[#64E9F8] h-full" 
                  style={{ 
                    width: `${calculateProgress(showData, selectedSeason, selectedEpisode)}%` 
                  }}
                />
              </div>
            )}
          </div>
        <Button onClick={() => inUserCollection ? handleUpdateCollection() : handleAddToCollection()}>Done</Button>
       
      </div>
    </div>
    ) : <div className="h-full fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <Skeleton className="w-[400px] aspect-[2/1]  rounded-xl bg-white" />
    </div>}
  </div>
  )
}
function calculateProgress(showData, currentSeason, currentEpisode) {
  if (!showData || !showData.episodes_per_season || !currentSeason || !currentEpisode) {
    return 0;
  }

  let watchedEpisodes = 0;
  let totalEpisodes = 0;
  
  Object.keys(showData.episodes_per_season).forEach(season => {
    const seasonNumber = parseInt(season);
    const episodesInSeason = showData.episodes_per_season[season];
    
    totalEpisodes += episodesInSeason;
    
    if (seasonNumber < currentSeason) {
      watchedEpisodes += episodesInSeason;
    } else if (seasonNumber === currentSeason) {
      watchedEpisodes += currentEpisode - 1;
    }
  });
  
  return Math.round((watchedEpisodes / totalEpisodes) * 100);
}
export default AddToCollectionsModal