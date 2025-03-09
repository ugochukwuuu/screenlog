//a show card should have its banner picture
//it should also have it's name
//and by the side it should be either movie/series
//then movie desciption
//then movie ratings
//then a button to add to collections or add to track lists
    //but if it's already in the users collections, then they can update it

import { useState } from "react"
import { addShowToCollection,getShowEpisodes } from "@/api/movieApi"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Star, Plus, Check, ListPlus } from "lucide-react"


const ShowCard = ({ show, isInCollection = false }) => {

  const [isHovered, setIsHovered] = useState(false)
  const [isAddingToCollections, setIsAddingToCollections] = useState(false);
  const [seriesInfo, setSeriesInfo] = useState([])

  const plainTextSummary = show.summary?.replace(/<[^>]+>/g, '');

  const handleAddToCollection = async (id) => {
    console.log("i was just clicked")
    setIsAddingToCollections(true);
    try {
      // Log the show object to debug
      console.log("Show object:", show);
      
      if(show.type === "Series") {  // Changed from show.Type to show.type and "series" to "Series"
        console.log("getting show episode details")
        const seriesDetails = await getShowEpisodes(id);
        setSeriesInfo(seriesDetails)
        console.log("series info",seriesInfo);
      }
      
      // try {
      //   const addShowToDatabaseResult = await addShowToCollection(show, seriesInfo);
      //   console.log("Successfully added to collection:", addShowToDatabaseResult);
      // } catch (error) {
      //   console.error("Error adding show to database:", error);
      // }
      
    } catch (error) {
      console.error("Error in handleAddToCollection:", error);
    } finally {
      setIsAddingToCollections(false);
    }
  }


  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-all duration-300 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Banner/Poster Section */}
      <div className="relative h-48">
        <img
            src={show.image?.medium || 'https://via.placeholder.com/210x295?text=No+Image'} 
          alt={show.Title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      
        
    
        <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-background/80 px-2 py-1 rounded-full">
          <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
          <span className="text-xs font-medium">
            {show.rating.average || 'N/A'}
          </span>
        </div>
      </div>

      <CardHeader className="space-y-1 pb-3">
      <div className="row flex justify-between">
        <CardTitle className="text-lg line-clamp-1">{show.name}</CardTitle>
        <div className="bg-primary/80 text-primary-foreground px-2 py-1 rounded-full text-xs font-medium">
          {show.type || 'TV Series'}
        </div>
      </div>
        <p className="text-sm text-muted-foreground">
          {show.premiered ? new Date(show.premiered).getFullYear() : 'N/A'}
        </p>
      </CardHeader>

      <CardContent className="space-y-4">

        <p className="text-sm text-muted-foreground line-clamp-2">
          {plainTextSummary || `${show.type} released in ${show.premiered ? new Date(show.premiered).getFullYear() : 'N/A'}`}
        </p>


        <div className="flex flex-col gap-2">
          {isInCollection ? (
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
                className="w-full" 
                onClick={() => handleAddToCollection(show.id)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add to Collection
              </Button>
              <Button 
                variant="outline" 
                className="w-full" 
                // onClick={handleAddToTracklist}
              >
                <ListPlus className="mr-2 h-4 w-4" />
                Add to Watchlist
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default ShowCard