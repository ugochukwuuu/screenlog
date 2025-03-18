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
    
    const [allUserShows, setAllUserShows] = useState({})
    const [filteredUserShows, setFilteredUserShows] = useState({});
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

                // Only include shows that exist in userCollection
                const filteredShows = allShows.filter(show =>
                    userCollection.some(userShow => userShow.imdb_id === show.external_id)
                );

                // Combine media data with user collection data
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

    // Filter shows based on selected status
    useEffect(() => {
        if (selectedStatus === "all") {
            setFilteredUserShows(allUserShows)
        } else {
            const filtered = Object.entries(allUserShows).reduce((acc, [key, show]) => {
                if (show.userCollection.status === selectedStatus) {
                    acc[key] = show
                }
                return acc
            }, {})
            setFilteredUserShows(filtered)
        }
    }, [selectedStatus, allUserShows])

    if (isGettingUserShows) {
        return <Loader/>
    }

    return (
        <div className="p-4">
            <div className='flex justify-end mb-4'>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className='flex items-center gap-2'>
                            <span 
                                style={{ 
                                    backgroundColor: statusColors[selectedStatus] || '#cbd5e1', 
                                    width: "12px", 
                                    height: "12px", 
                                    borderRadius: "50%", 
                                    display: "inline-block" 
                                }} 
                            />
                            {selectedStatus === "all" ? "All shows" : selectedStatus}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuRadioGroup value={selectedStatus} onValueChange={setSelectedStatus}>
                            <DropdownMenuRadioItem value="all">
                                <span 
                                    style={{ 
                                        backgroundColor: '#cbd5e1', 
                                        width: "12px", 
                                        height: "12px", 
                                        borderRadius: "50%", 
                                        display: "inline-block", 
                                        marginRight: "8px" 
                                    }} 
                                />
                                All shows
                            </DropdownMenuRadioItem>
                            {["watching", "plan to watch", "watched", "stalled", "dropped"].map((status) => (
                                <DropdownMenuRadioItem key={status} value={status}>
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
                                    {status}
                                </DropdownMenuRadioItem>
                            ))}
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {Object.keys(filteredUserShows).length > 0 ? (
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
                    <p className="text-xl">No shows in your collection</p>
                    <p className="mt-2">Add some shows to get started!</p>
                </div>
            )}
        </div>
    )
}
