import { useState } from "react"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Search as SearchIcon } from "lucide-react"
import { omdbApiSearchShows } from "../api/movieApi"

function Search({ onSearch, onSearchingChange,initialQuery = '' }) {
  const [query, setQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSearching,setIsSearching] = useState(false);

  const [results, setResults] = useState([])




  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!query.trim()) return

    setIsLoading(true)
    onSearchingChange(true);
    try {
      const response = await omdbApiSearchShows(query.trim())
      const searchResults = response || []

      console.log(searchResults)
      setResults(searchResults)
      onSearch(searchResults,query)
    } catch (error) {
      console.error("Error searching movies:", error)
      setResults([])
      onSearch([],query)
    } finally {
      setIsSearching(false)
      setIsLoading(false)
      onSearchingChange(false);
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Search for movies or TV shows..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="submit" disabled={isLoading} >
          {isLoading ? "Searching..." : "Search"}
        </Button>
      </form>    
    </div>
  )
}

export default Search