import { useState, useEffect, useContext } from "react"
import { addShowToMediaTable, getShowEpisodes } from "@/api/movieApi"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Star, Plus, Check, ListPlus } from "lucide-react"
import { supabase } from "@/lib/supabase"
import AddToCollectionsModal from "./AddToCollectionsModal"
import { UserCollectionContext } from "../App"
import { PlusCircle, FilePenLine } from 'lucide-react';
import { statusColors } from "@/constants/colors"

const ShowCard = ({ show, isInCollection = false }) => {
  const user = JSON.parse(localStorage.getItem('userProfile'));
  const { userCollection, setUserCollection } = useContext(UserCollectionContext);

  useEffect(() => {
    const checkIfShowIsInCollection = () => {
      console.log(userCollection)
      if (!show?.imdbID) return;
      const isInCollection = userCollection.some(item => item.imdb_id === show.imdbID);
      setIsInUserCollection(isInCollection);
      if(isInCollection){
        const userShowStatus = userCollection.find(item => item.imdb_id === show.imdbID);
        console.log(userShowStatus);
        setSpecificUserShowStatus(userShowStatus);
      }
      console.log(`Show ${show.Title} (${show.imdbID}) ${isInCollection ? 'is' : 'is not'} in collection`);
    }
    checkIfShowIsInCollection(); 
  },[userCollection, show.imdbID])

  const [isInUserCollection, setIsInUserCollection] = useState(false);
  const [specificUserShowStatus, setSpecificUserShowStatus] = useState(null);
  const [showInfo, setShowInfo] = useState({})
  const [isHovered, setIsHovered] = useState(false)
  const [isAddingToCollections, setIsAddingToCollections] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const transformShow = async (show) => {
    let seriesDetails = null;

    console.log('specific show', show);
    if (!show) {
        throw new Error('Show object is undefined');
    }
    if (show.Type && show.Type.toLowerCase() === "series") {
        console.log("fetching the tv details for", show.Title);
        try {
            seriesDetails = await getShowEpisodes(show.Title);
            console.log(seriesDetails.episodesPerSeason)
        } catch (error) {
            console.error("Error fetching series details:", error);
        }
    }

    const releaseYear = show.Year ? parseInt(show.Year.split(/[-–]/)[0],10) : null;

    const record = {
        external_id: show.imdbID,
        title: show.Title || '',
        type: show.Type || 'series',
        release_year: releaseYear,
        total_seasons: seriesDetails ? seriesDetails.totalSeasons : null,
        total_episodes: seriesDetails ? seriesDetails.totalEpisodes : null,
        poster_url: show.Poster || show.image?.original || 'https://via.placeholder.com/210x295?text=No+Image',
        episodes_per_season: seriesDetails ? seriesDetails.episodesPerSeason : null
    };

    console.log("Transformed record:", record);
    return record;
  }

  const handleAddToCollection = async (show) => {
    setIsAddingToCollections(true);
    try {
        setShowModal(true);
        const showRecord = await transformShow(show);
        const mediaResult = await addShowToMediaTable(showRecord);

        let insertedData;
        if (mediaResult.error) {
            if (mediaResult.error.existingShow) {
                console.log("Show exists in media table, adding to user's collection");

                const { data: existingMedia, error: checkError } = await supabase
                  .from('media')
                  .select('*')
                  .eq('external_id', showRecord.external_id)
                  .maybeSingle();
            
                if (checkError) {
                  console.error('Error checking existing media:', checkError);
                  return { error: checkError };
                }

                console.log("existing media", existingMedia);
                insertedData = existingMedia;
                setShowInfo(insertedData);
                return;
            } else {
                throw new Error(mediaResult.error.message);
            }
        }

        insertedData = mediaResult.data;
        console.log("inserted data", insertedData);
        setShowInfo(insertedData);
      
    } catch (error) {
        console.error("Error in handleAddToCollection:", error);
    } finally {
        setIsAddingToCollections(false);
    }
  }

  const removeModal = () => {
    setShowModal(false)
  }

  return (
    <>
    {showModal && <AddToCollectionsModal 
      showData={showInfo} 
      setShowModal={removeModal} 
      inUserCollection={isInUserCollection} 
      userId={user?.user_id} 
      showAlreadyInCollection={specificUserShowStatus} 
    />}
    <div>
    <Card 
      className="overflow-hidden hover:shadow-lg transition-all duration-300 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => handleAddToCollection(show)}
    >
      {/* Banner/Poster Section */}
      <div className="relative">
        <img
            src={show.Poster !== 'N/A' ? show.Poster || show.poster_url : 'src/assets/no-img.svg'} 
          alt={show.Title || show.title}
         className="flex flex-col w-full  bg-white rounded-lg shadow-md overflow-hidden
          object-cover transition-transform duration-300 group-hover:scale-105 z-0"
        />
      
          {isHovered && (
            isInUserCollection ?  
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white bg-black/10 px-2 py-1 rounded flex items-center justify-center flex-col w-full">
        <FilePenLine size={45} strokeWidth={2.75} />
          <p className="text-xl font-bold text-center">Update show</p>
        </div>
         :  
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white bg-black/10 px-2 py-1 rounded flex items-center justify-center flex-col w-full">
        <PlusCircle size={45} strokeWidth={2.75} />
        <p className="text-xl font-bold text-center">Add to your collections</p>
        </div>
          )}

        <p className="absolute top-2 left-2 bg-gradient-to-r from-violet-500 to-purple-500 text-white px-2 py-1 rounded-full text-xs font-medium">
          {show.Type || 'TV Series'}
        </p>

        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
        <div className="absolute bottom-2 left-2 text-white text-xs font-medium w-full mb-2">
          <CardTitle className="text-lg line-clamp-1 break-words">
            {show.Title || show.title}
          </CardTitle>
          <CardTitle className="text-sm">
            {show.Year || show.release_year || 'N/A'}
          </CardTitle>
      </div>

      </div>
    </Card>
    <div className="flex flex-row justify-between items-center">
        {isInUserCollection && (
          <div className="flex flex-row gap-1 items-center justify-center">
          <span className="w-2.5 h-2.5 rounded-full" style={{backgroundColor:statusColors[specificUserShowStatus.status]}}></span>
            <span className="text-[1rem] font-medium ">{specificUserShowStatus.status}</span> 
          </div>
        )}
      </div>
    </div>
    </>
  )
}

export default ShowCard