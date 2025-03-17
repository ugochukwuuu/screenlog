import { supabase } from '@/lib/supabase';
import React, { useEffect, useState, useContext } from 'react'
import { Loader } from '../components/Loader'
import { UserCollectionContext } from '@/App';
import CollectionShowCard from '../components/CollectionShowCard'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { statusColors } from '@/constants/colors';

export default function Collections() {
    const [position, setPosition] = useState("bottom")
    const userProfile = JSON.parse(localStorage.getItem('userProfile'));
    const userId = userProfile.user_id
    
    const [allUserShows, setAllUserShows] = useState([])
    const [filteredUserShows, setFilteredUserShows] = useState([]);
    const [isGettingUserShows, setIsGettingUserShows] = useState(true)
  const {userCollection} = useContext(UserCollectionContext)
  const [selectedStatus, setSelectedStatus] = useState("all")
  useEffect(() => {
      let isMounted = true;
      
      const fetchShowsInUserCollection = async () => {
          if (!userCollection) return;
      
          try {
              const { data: allShows, error } = await supabase
          .from('media')
          .select('*')
          .order('created_at', { ascending: false })
          
        if (error) throw error;
        if (!isMounted) return;

        const filteredShows = allShows.filter(show =>
          userCollection.some(userShow => userShow.imdb_id === show.external_id)
        );

        
        const combinedData = filteredShows.reduce((acc, show) => {
          const userData = userCollection.find(userShow => userShow.imdb_id === show.external_id)
          if (userData) {
            acc[show.external_id] = {
              showData: show,
              userCollection: userData
            }
          }
          return acc
        }, {})
        
        
        if (isMounted) {
            setAllUserShows(combinedData)
            setFilteredUserShows(combinedData)
            setIsGettingUserShows(false)
        }
      } catch(error) {
        console.error("Error getting user shows:", error)
        if (isMounted) {
            setIsGettingUserShows(false)
        }
    }
    }
    

    fetchShowsInUserCollection()
    
    return () => {
        isMounted = false
    }
}, [userCollection])

useEffect(()=>{
  console.log('new status', selectedStatus)
  console.log('alllUserShows', allUserShows)
  
    if(selectedStatus === "all"){
      setFilteredUserShows(allUserShows)
    }
    else{
        const filtered = 
        Object.values(allUserShows).filter(show => show.userCollection.status === selectedStatus);
      setFilteredUserShows(filtered)
      console.log(`filteredUserShows on ${selectedStatus}`, filteredUserShows)
    }
},[selectedStatus,allUserShows])

  if (isGettingUserShows) {
    return <Loader/>
  }


  const handleStatusChange = (status)=>{
    setSelectedStatus(status)
  }

  return (
    <div className="p-4">

      <h1 className="text-2xl font-bold mb-4">Your Collections</h1>
      <p className="text-gray-500 mb-4">Manage your collections here</p>

      <DropdownMenu>
      <DropdownMenuTrigger asChild>
      <button className="flex items-center gap-[0.25] border border-black rounded-md px-2 py-1 mb-2">
        <span 
            style={{ 
              backgroundColor: statusColors[selectedStatus], 
              width: "10px", 
              height: "10px", 
              borderRadius: "50%", 
              display: "inline-block", 
              marginRight: "8px" 
            }} 
            ></span>
        {selectedStatus}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        {/* <DropdownMenuLabel>Panel Position</DropdownMenuLabel> */}
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={selectedStatus} onValueChange={handleStatusChange}>
        <DropdownMenuRadioItem value="all">All  </DropdownMenuRadioItem>
          {Object.entries(statusColors).map(([status, color]) => (
            <DropdownMenuRadioItem key={status}
             value={status}>
              <span style={{ color }}>{status}</span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
    
      {filteredUserShows && Object.keys(filteredUserShows).length > 0 ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] ml-auto gap-6">
          {Object.values(filteredUserShows).map(show => (
            <CollectionShowCard 
              key={show.showData.media_id} 
              show={show.showData} 
              userShowData={show.userCollection} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 mt-8">
          <p className="mt-2">You don't have any {selectedStatus} shows</p>
        </div>
      )}
    </div>

  )
}
