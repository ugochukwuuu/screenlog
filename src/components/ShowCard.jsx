//a show card should have its banner picture
//it should also have it's name
//and by the side it should be either movie/series
//then movie desciption
//then movie ratings
//then a button to add to collections or add to track lists
    //but if it's already in the users collections, then they can update it

import { useState, useEffect, useContext } from "react" //soi actually have to import the useContext hook in react
import { addShowToMediaTable, getShowEpisodes,addShowToUsersCollections, addShowToWatchList } from "@/api/movieApi"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Star, Plus, Check, ListPlus } from "lucide-react"
import { supabase } from "@/lib/supabase"
import AddToCollectionsModal from "./AddToCollectionsModal"
import { UserCollectionContext } from "../App"

  const ShowCard = ({ show, isInCollection = false }) => {
  const user = JSON.parse(localStorage.getItem('userProfile'));
  const { userCollection, setUserCollection } = useContext(UserCollectionContext);
//this is the way to use useContext, it's almost like useState, but both the context variable and the context manipulation funcion
//are set inside curly braces {} instead of [], here you aren't setting up the value of the context variable, you are merely
//creating your own variable and setting up the value of the variable to the context variable. that's it


//now i'll have to create a function that checks if a particular showcards imdb id is in the users collection context
//then create a boolean state to that holds the value of whether the show is in the users collection or not
//and if the state is true, then the showcard will display things according to what i want it to be


// Remember to save the file (Ctrl+S) for changes to take effect in the development server
useEffect(()=>{
    const checkIfShowIsInCollection = () =>{
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
  
  console.log(specificUserShowStatus)
  

  //function to first transform the show no matter the type

  const transformShow = async (show) => {
    let seriesDetails = null;

    console.log('specific show', show);
    // First check if show exists and has required properties
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

  // const addToUserTable = async ()
  const handleAddToCollection = async (show) => {
    setIsAddingToCollections(true);
    try {

       

        setShowModal(true);
        // Transform and add show to media table
        const showRecord = await transformShow(show);
        const mediaResult = await addShowToMediaTable(showRecord);

        let insertedData;
        // console.log("media result", mediaResult)
        if (mediaResult.error) {
            if (mediaResult.error.existingShow) {
                // Show exists in media table, proceed to add user-media relationship
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
        // You might want to show an error message to the user here
    } finally {
        setIsAddingToCollections(false);
    }
  }


  const handleFinalAddToCollection = async (usersChoice) => {
    console.log('selected season:', usersChoice.selectedSeason)
    console.log("Selected episode:", usersChoice.selectedEpisode);
    console.log('status:', usersChoice.status);
    console.log('user id:', user.user_id);

    console.log(showInfo)
    const addToUserCollections = await addShowToUsersCollections (showInfo,usersChoice,user.user_id);

    console.log(addToUserCollections);

  } 

  const statusColors = {
    "unwatched": "#555555",      
    "watching": "#5DADE2",       
    "plan to watch": "#F2E7FB",  
    "watched": "#2ecc71",        
    "stalled": "#f39c12",        
    "dropped": "#e74c3c"         
  };

  return (
    <>
    {showModal && <AddToCollectionsModal showData={showInfo} setShowModal={setShowModal}    onAddToCollection={handleFinalAddToCollection}  />}
    <Card 
      className="overflow-hidden hover:shadow-lg transition-all duration-300 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Banner/Poster Section */}
      <div className="relative h-48">
        <img
            src={show.Poster || 'https://via.placeholder.com/210x295?text=No+Image'} 
          alt={show.Title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 z-0"
        />
      
        
    
        {/* <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-background/80 px-2 py-1 rounded-full">
          <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
          <span className="text-xs font-medium">
            {show.rating?.average || 'N/A'}
          </span>
        </div> */}
      </div>

      <CardHeader className="space-y-1 pb-3">
      <div className="row flex justify-between mb-2">
        <CardTitle className="text-lg line-clamp-1">{show.Title}</CardTitle>
        <div className="bg-primary/80 text-primary-foreground px-2 py-1 rounded-full text-xs font-medium">
          {show.Type || 'TV Series'}
        </div>
      </div>
      <div className="flex flex-row justify-between">
        <p className="text-sm text-muted-foreground">
          {show.Year ?  show.Year : 'N/A'}
        </p>
        {isInUserCollection && (
          <div className="flex flex-row gap-2 items-center">
          <span className="w-2.5 h-2.5 rounded-full bg-black"></span>
            <span className="text-xs font-medium ">{specificUserShowStatus.status}</span>
          </div>
        )}
      </div>
   
      </CardHeader>

      <CardContent className="space-y-4">

        {/* <p className="text-sm text-muted-foreground line-clamp-2">
          {show.summary ? show.summary.replace(/<[^>]+>/g, '') : `${show.type || 'TV Series'} - ${show.status || 'Unknown status'}`}
        </p> */}


        <div className="flex flex-col gap-2">
          {isInUserCollection ? (
            <Button 
              variant="secondary" 
              className="w-full" 
              // onClick={handleUpdateStatus}
            >
              <Check className="mr-2 h-4 w-4" />
              Update Status
            </Button>
          ) : (
            <>
              <Button 
                variant = "primary"
                className="w-full bg-transparent text-foreground" 
                onClick={() => handleAddToCollection(show)}
                disabled={isAddingToCollections}
              >
                <Plus className="mr-2 h-4 w-4" />
                {isAddingToCollections ? 'Adding...' : 'Add to Collection'}
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
    </>
  )
}

export default ShowCard