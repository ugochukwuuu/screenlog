import { useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "../components/ui/button"
import Search from "../components/Search"
import ShowCard from "../components/ShowCard"
import NavBar from "../components/NavBar"

export function Home() {
  const [searchResults, setSearchResults] = useState([])

  const handleSearch = (results) => {
    setSearchResults(results)
  }

  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-8rem)]">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Welcome to Movie Tracker</h1>
        <p className="text-xl text-muted-foreground">
          Keep track of all the movies and TV shows you've watched
        </p>
      </div>
     
      <Search onSearch={handleSearch} />

      <div className="mt-12">
        {searchResults && searchResults.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.map((result) => (
              <ShowCard 
                key={result.imdbID} 
                show={result}
                isInCollection={false}
              />
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            <p className="mb-6">Search for movies or TV shows to get started</p>
            <div className="flex justify-center gap-4">
              <Link to="/movies">
                <Button>View My Movies</Button>
              </Link>
              <Link to="/tv-shows">
                <Button variant="outline">View My TV Shows</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  )
} 