import { supabase } from '@/lib/supabase';
import React, { useEffect, useState, useContext } from 'react'
import { Loader } from '../components/Loader'
import { UserCollectionContext } from '@/App';
import CollectionShowCard from '../components/CollectionShowCard'

export default function Collections() {
  const userProfile = JSON.parse(localStorage.getItem('userProfile'));
  const userId = userProfile.user_id

  const [userShows, setUserShows] = useState(null)
  const [isGettingUserShows, setIsGettingUserShows] = useState(true)
  const {userCollection} = useContext(UserCollectionContext)

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
          setUserShows(combinedData)
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

  if (isGettingUserShows) {
    return <Loader/>
  }

  return (
    <div className="p-4">
      {userShows && Object.keys(userShows).length > 0 ? (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] max-w-[1200px] mx-auto gap-6 justify-center">
          {Object.values(userShows).map(show => (
            <CollectionShowCard 
              key={show.showData.media_id} 
              show={show.showData} 
              userShowData={show.userCollection} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 mt-8">
          <p className="text-xl">No shows in your collection yet</p>
          <p className="mt-2">Add some shows to get started!</p>
        </div>
      )}
    </div>
  )
}
