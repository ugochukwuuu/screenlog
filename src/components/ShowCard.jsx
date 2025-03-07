//a show card should have its banner picture
//it should also have it's name
//and by the side it should be either movie/series
//then movie desciption
//then movie ratings
//then a button to add to collections or add to track lists
    //but if it's already in the users collections, then they can update it

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Star, Plus, Check, ListPlus } from "lucide-react"

const ShowCard = ({ show, isInCollection = false }) => {
  const [isHovered, setIsHovered] = useState(false)

  const handleAddToCollection = () => {
    // TODO: Implement add to collection functionality
    console.log("Adding to collection:", show.imdbID)
  }

  const handleAddToTracklist = () => {
    // TODO: Implement add to tracklist functionality
    console.log("Adding to tracklist:", show.imdbID)
  }

  const handleUpdateStatus = () => {
    // TODO: Implement update status functionality
    console.log("Updating status:", show.imdbID)
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
          src={show.Poster !== 'N/A' ? show.Poster : '/placeholder-poster.jpg'}
          alt={show.Title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      
        
        {/* Type Badge */}
     

        {/* Rating */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-background/80 px-2 py-1 rounded-full">
          <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
          <span className="text-xs font-medium">
            {show.imdbRating || 'N/A'}
          </span>
        </div>
      </div>

      <CardHeader className="space-y-1 pb-3">
      <div className="row flex justify-between">
        <CardTitle className="text-lg line-clamp-1">{show.Title}</CardTitle>
        <div className="bg-primary/80 text-primary-foreground px-2 py-1 rounded-full text-xs font-medium">
          {show.Type === 'movie' ? 'Movie' : 'TV Series'}
        </div>
      </div>
        <p className="text-sm text-muted-foreground">{show.Year}</p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2">
          {show.Plot || `${show.Type} released in ${show.Year}`}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          {isInCollection ? (
            <Button 
              variant="secondary" 
              className="w-full" 
              onClick={handleUpdateStatus}
            >
              <Check className="mr-2 h-4 w-4" />
              Update Status
            </Button>
          ) : (
            <>
              <Button 
                className="w-full" 
                onClick={handleAddToCollection}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add to Collection
              </Button>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={handleAddToTracklist}
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