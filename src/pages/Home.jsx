import { useState,useEffect } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { Button } from "../components/ui/button"
import Search from "../components/Search"
import ShowCard from "../components/ShowCard"
import {SkeletonCard} from "../components/SkeletonCard"
import { omdbApiSearchShows } from "../api/movieApi"


export function Home() {
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(()=>{
    const urlQuery = searchParams.get('q');
    if(urlQuery){
      performSearch(urlQuery)
    }
  },[])

  const performSearch = async (query) =>{
    if(!query.trim()) return;

    setIsSearching(true);

    try{
      const response = await omdbApiSearchShows(query)
      const searchResults = response || []

      setSearchResults(searchResults);
    }
    catch(error){
      console.error('Error searching for shows:', error);
      setSearchResults([])
    }
    finally{
      setIsSearching(false)
    }
  }
  const handleSearch = (results,query) => {
    setSearchResults(results)

    setSearchParams({q:query})
  }

  const handleSearchingChange = (searching) =>{
    setIsSearching(searching)
  }

  // const dummyShowData = [
  //   {
  //     Title: "The prestige",
  //     Type: "series",
  //     Year: "2004",
  //     Poster: 'src/assets/dummy-pic.jpg'
  //   },
  //   {
  //     Title: "The prestige",
  //     Type: "movie",
  //     Year: "2004",
  //     Poster: 'src/assets/dummy-pic.jpg'
  //   },
  //   {
  //     Title: "The prestige",
  //     Type: "animation",
  //     Year: "2004",
  //     Poster: 'src/assets/dummy-pic.jpg'
  //   },
  //   {
  //     Title: "The prestige",
  //     Type: "animation",
  //     Year: "2004",
  //     Poster: 'src/assets/dummy-pic.jpg'
  //   },
  //   {
  //     Title: "The prestige",
  //     Type: "animation",
  //     Year: "2004",
  //     Poster: 'src/assets/dummy-pic.jpg'
  //   },
  //   {
  //     Title: "The prestige",
  //     Type: "animation",
  //     Year: "2004",
  //     Poster: 'src/assets/dummy-pic.jpg'
  //   }
  // ]

  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-8rem)]">
      <div className="container  px-4 py-8 space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Welcome to<span className="bg-gradient-to-r from-violet-500 to-purple-500 bg-clip-text text-transparent ml-1">
            screenlog</span>
          </h1>
          <p className="text-xl text-muted-foreground font-light leading-relaxed mb-4">
  Keep track of all the movies and TV shows you've watched
</p>
      </div>
     
      <Search onSearch={handleSearch} onSearchingChange = {handleSearchingChange} initialQuery = {searchParams.get('q') || ''} />

    
      <div className="mt-12">
      {isSearching ? (
      <div className="grid grid-cols-1 min-[548px]:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
      </div>
      ) : (
        searchResults && searchResults.length > 0 ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] ml-auto gap-6">
            {searchResults.map((result,index) => (
              <ShowCard 
                key={index} 
                show={result}
                isInCollection={false}
              />
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            <p className="mb-6">Search for movies or TV shows to get started</p>
          </div>
        )
      )}


        {/* <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] ml-auto gap-6">
    {dummyShowData.map((item, index) => (
      <ShowCard key={index} show={item} />
    ))}
  </div> */}
      </div>
      </div>
    </div>
  )
} 