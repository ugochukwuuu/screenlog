import { useState, useEffect, useContext} from 'react'
import { Button } from './ui/button'
import {X, ArrowDown,Star} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { removeShowFromUsersCollections, updateShowToUsersCollections } from '@/api/movieApi'
import { UserCollectionContext } from '../App'
import { statusColors } from "@/constants/colors"
import { MdCancel } from "react-icons/md";

const UpdateShowModal = ({show, userShowData, setShowModal, userId}) => {
  const [status, setStatus] = useState(userShowData.status)
  const [statusOptions] = useState(["unwatched", "watching", "plan to watch", "watched", "stalled", "dropped"])
  const [selectedSeason, setSelectedSeason] = useState(userShowData.current_season)
  const [selectedEpisode, setSelectedEpisode] = useState(userShowData.current_episode)
  const [episodes, setEpisodes] = useState([])
  const [isUpdating, setIsUpdating] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)

const [selectedRating, setSelectedRating] = useState(userShowData.rating)
const [totalRatings] = useState([1,2,3,4,5])


  const {userCollection, setUserCollection} = useContext(UserCollectionContext)

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus)
  }

  const handleRatingChange = (rate)=>{
    setSelectedRating(rate)
  }

  
  useEffect(() => {
    console.log("user show data", userShowData)
    if (selectedSeason && show.episodes_per_season) {
      const episodeCount = show.episodes_per_season[selectedSeason] || 0
      const episodesList = Array.from({ length: episodeCount }, (_, i) => i + 1)
      setEpisodes(episodesList)
    }
  }, [selectedSeason, show])

  const handleSeasonChange = (season) => {
    setSelectedSeason(season)
    setSelectedEpisode(1)
  }

  const handleEpisodeChange = (episode) => {
    setSelectedEpisode(episode)
  }

  const handleUpdateCollection = async () => {
    setIsUpdating(true)
    try {
      const showWithExternalId = {
        ...show,
        external_id: userShowData.imdb_id
      }

      const updateResult = await updateShowToUsersCollections(showWithExternalId, {
        selectedSeason,
        selectedEpisode,
        rating: status === "watched" ? selectedRating : null,
        status
      }, userId)

      if (updateResult.success) {
        setUserCollection(prevCollection => 
          prevCollection.map(item => {
            if (item.imdb_id === userShowData.imdb_id) {
              return {
                ...item,
                current_season: selectedSeason,
                current_episode: selectedEpisode,
                rating: selectedRating,
                status: status
              }
            }
            return item
          })
        )
        setShowModal(false)
      }
    } catch (error) {
      console.error("Error updating show:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleRemoveShow = async () =>{
    setIsRemoving(true)
    try{
      const removeShow = await removeShowFromUsersCollections(userShowData.imdb_id,userId)
      if(removeShow.success){
        setUserCollection(prevCollection => prevCollection.filter(
          item => item.imdb_id !== userShowData.imdb_id))
        setShowModal(false)
      }
    } catch (error) {
      console.error("Error removing show:", error)
    } finally {
      setIsRemoving(false)
    }
  }

  return (
    <div className="h-full fixed inset-0 flex items-center justify-center mx-auto bg-black bg-opacity-50 z-50">
      <div className="flex items-end flex-col justify-center">
    <MdCancel 
    
        className="cursor-pointer text-white w-6 h-6 hover:text-gray-200 transition-colors"
        onClick={() => setShowModal(false)}
      />
      <div className="relative bg-gradient-to-r from-violet-500 to-purple-500 p-6 rounded-lg shadow-2xl max-w-[400px]  flex flex-col items-start mx-2">
        <div className='flex justify-between w-full'>
          <h1 className="text-3xl font-bold text-white mb-6">{show.title}</h1>
        </div>
        <div className="flex items-center flex-wrap justify-between w-full text-white mb-4">
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
                />
                <p>{status}</p>
                <ArrowDown className="w-4 h-4" />
              </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent 
              className="max-h-[200px] overflow-y-auto bg-white rounded-md shadow-lg"
              align="center"
              side="top"
              sideOffset={5}
            >
              {statusOptions.map((option) => (
                <DropdownMenuItem 
                  key={option} 
                  onSelect={() => handleStatusChange(option)}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  <span 
                    style={{ 
                      backgroundColor: statusColors[option], 
                      width: "12px", 
                      height: "12px", 
                      borderRadius: "50%", 
                      display: "inline-block", 
                      marginRight: "8px" 
                    }} 
                  />
                  <p>{option}</p>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {status === "watched" && (
              <div className="rating flex gap-1 flex-row items-center justify-center">
                {totalRatings.map((item,index)=>(
                  <>
                  <Star
                  key={index} 
                  style={{
                  fill: selectedRating >= item ? "#FFD700" : "white",
                  stroke: selectedRating >= item ? "#FFD700" : "white",
                  }}
                  onClick={()=> handleRatingChange(item)} 
                  strokeWidth={1.5} />
                  </>
                ))}
              </div>
            )}

        </div>

        {status === "watching" && show.type === "series" && (
          <div className="episodes-selector-cont flex flex-col gap-4 w-full mb-6">
            {/* Season Selector */}
            <div className="flex flex-col items-start justify-start">
              <p className="text-white mb-2">Current Season:</p>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center justify-center gap-1 text-white cursor-pointer bg-black bg-opacity-20 px-3 py-1 rounded-md w-24 text-center">
                    <p>Season {selectedSeason}</p>
                    <ArrowDown className="w-4 h-4 ml-1" />
                  </div>
                </DropdownMenuTrigger>

                <DropdownMenuContent 
                  className="max-h-[200px] overflow-y-auto bg-white rounded-md shadow-lg"
                  align="center"
                  side="top"
                  sideOffset={5}
                >
                  {Array.from({ length: show.total_seasons }, (_, i) => i + 1).map((season) => (
                    <DropdownMenuItem 
                      key={season} 
                      onSelect={() => handleSeasonChange(season)}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      Season {season}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Episode Selector */}
            <div className="flex flex-col items-start justify-start">
              <p className="text-white mb-2">Current Episode:</p>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center justify-center gap-1 text-white cursor-pointer bg-black bg-opacity-20 px-3 py-1 rounded-md w-24 text-center">
                    <p>Ep {selectedEpisode}</p>
                    <ArrowDown className="w-4 h-4 ml-1" />
                  </div>
                </DropdownMenuTrigger>

                <DropdownMenuContent 
                  className="max-h-[200px] overflow-y-auto bg-white rounded-md shadow-lg"
                  align="center"
                  side="top"
                  sideOffset={5}
                >
                  {episodes.map((episode) => (
                    <DropdownMenuItem 
                      key={episode} 
                      onSelect={() => handleEpisodeChange(episode)}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      Episode {episode}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        )}
      

        <div className="flex justify-between w-full mt-4">
        <Button
        onClick={handleRemoveShow}
        disabled={isRemoving}
        >{isRemoving? 'Removing show...': 'Remove show'}</Button>

          <Button
            onClick={handleUpdateCollection}
            className="bg-white text-purple-600 hover:bg-gray-100"
            disabled={isUpdating}
          >
            {isUpdating ? 'Updating...' : 'Update'}
          </Button>
        </div>
      </div>
      </div>
    </div>
  )
}

export default UpdateShowModal
