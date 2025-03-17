import { useState, useEffect, useContext} from 'react'
import { Button } from './ui/button'
import {X, ArrowDown} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { updateShowToUsersCollections } from '@/api/movieApi'
import { UserCollectionContext } from '../App'
import { statusColors } from "@/constants/colors"

const UpdateShowModal = ({show, userShowData, setShowModal, userId}) => {
  const [status, setStatus] = useState(userShowData.status)
  const [statusOptions] = useState(["unwatched", "watching", "plan to watch", "watched", "stalled", "dropped"])
  const [selectedSeason, setSelectedSeason] = useState(userShowData.current_season)
  const [selectedEpisode, setSelectedEpisode] = useState(userShowData.current_episode)
  const [episodes, setEpisodes] = useState([])
  const [isUpdating, setIsUpdating] = useState(false)
  const {userCollection, setUserCollection} = useContext(UserCollectionContext)

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus)
  }

  useEffect(() => {
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
      const updateResult = await updateShowToUsersCollections(
        { external_id: userShowData.imdb_id },
        { selectedSeason, selectedEpisode, status },
        userId
      )

      if (updateResult.success) {
        setUserCollection(prevCollection => 
          prevCollection.map(item => {
            if (item.imdb_id === userShowData.imdb_id) {
              return {
                ...item,
                current_season: selectedSeason,
                current_episode: selectedEpisode,
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

  return (
    <div className="h-full fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="relative bg-gradient-to-r from-violet-500 to-purple-500 p-6 rounded-lg shadow-2xl w-[400px] flex flex-col items-start">
        <div className='flex justify-between w-full'>
          <h1 className="text-3xl font-bold text-white mb-6">{show.title}</h1>
          <X className="cursor-pointer text-black" onClick={() => setShowModal(false)} size={20}/>
        </div>

        <div className="flex items-center justify-between w-full text-white mb-4">
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

            <DropdownMenuContent>
              {statusOptions.map((option) => (
                <DropdownMenuItem key={option} onSelect={() => handleStatusChange(option)}>
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

                <DropdownMenuContent>
                  {Array.from({ length: show.total_seasons }, (_, i) => i + 1).map((season) => (
                    <DropdownMenuItem key={season} onSelect={() => handleSeasonChange(season)}>
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

                <DropdownMenuContent>
                  {episodes.map((episode) => (
                    <DropdownMenuItem key={episode} onSelect={() => handleEpisodeChange(episode)}>
                      Episode {episode}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        )}

        <div className="flex justify-end w-full mt-4">
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
  )
}

export default UpdateShowModal
