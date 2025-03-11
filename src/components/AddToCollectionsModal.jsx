import {React, useState, useEffect} from 'react'
import { Button } from './ui/button'
import {X} from 'lucide-react'
import {ArrowDown} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
const AddToCollectionsModal = ({showData = {}, setShowModal}) => {
const [status, setStatus ] = useState("Unwatched")
const [statusOptions, setStatusOptions] = useState(["Unwatched", "Watching", "Plan to watch", "Watched", "Stalled", "Dropped"])
const [selectedSeason, setSelectedSeason] = useState(null);
const [selectedEpisode, setSelectedEpisode] = useState(null);
const [seasons, setSeasons] = useState([]);
const [episodes, setEpisodes] = useState([]);


const statusColors = {
  "Unwatched": "#D3D3D3",
  "Watching": "#3498db",
  "Plan to watch": "#9b59b6",
  "Watched": "#2ecc71", 
  "Stalled": "#f39c12",
  "Dropped": "#e74c3c"
};
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
}, [selectedSeason, showData]);

const handleSeasonChange = (season) => {
  setSelectedSeason(season);
  setSelectedEpisode(1); // Reset episode when season changes
};

const handleEpisodeChange = (episode) => {
  setSelectedEpisode(episode);
};

  return (
    <div className="h-full fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    {showData.title && (      
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
          {status === "Watching" && showData.type === "series" && (
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

            {status === "Watching" && showData.type === "series" && selectedSeason && selectedEpisode && (
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
        <Button onClick={() => setShowModal(false)}>Done</Button>
      </div>
    </div>
    )}
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