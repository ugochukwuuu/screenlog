import { useState } from "react"
import { Card, CardTitle } from "./ui/card"
import { FilePenLine } from 'lucide-react'
import {Star} from "lucide-react"
import { statusColors } from "@/constants/colors"
import UpdateShowModal from "./UpdateShowModal"

const CollectionShowCard = ({ show, userShowData }) => {
  const [isHovered, setIsHovered] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const user = JSON.parse(localStorage.getItem('userProfile'))

  const handleCardClick = () => {
    setShowModal(true)
  }

  return (
    <>
      {showModal && (
        <UpdateShowModal
          show={show}
          userShowData={userShowData}
          setShowModal={setShowModal}
          userId={user?.user_id}
        />
      )}
      <div>
        <Card 
          className="overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={handleCardClick}
        >
          <div className="relative">
            <img
              src={show.poster_url || 'src/assets/no-img.svg'} 
              alt={show.title}
              className="flex flex-col w-full h-[200px] bg-white rounded-lg shadow-md overflow-hidden
               object-cover transition-transform duration-300 group-hover:scale-105 z-0"
            />
          
            {isHovered && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white bg-black/10 px-2 py-1 rounded flex items-center justify-center flex-col w-full">
                <FilePenLine size={45} strokeWidth={2.75} />
                <p className="text-xl font-bold text-center">Update show</p>
              </div>
            )}

            <p className="absolute top-2 left-2 bg-gradient-to-r from-violet-500 to-purple-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              {show.type || 'TV Series'}
            </p>

            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
            <div className="absolute bottom-2 left-2 text-white text-xs font-medium w-full mb-2">
              <CardTitle className="text-lg line-clamp-1 break-words">
                {show.title}
              </CardTitle>
              <CardTitle className="text-sm">
                {show.release_year || 'N/A'}
              </CardTitle>
            </div>
          </div>
        </Card>

        <div className="flex flex-row justify-between items-center mt-2">
          <div className="flex flex-row gap-1 items-center">
            <span className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: statusColors[userShowData.status]}}></span>
            <span className="text-[1rem] font-medium">{userShowData.status}</span>
          </div>

          <div className="flex flex-row items-center justify-center">
          <p>
            {userShowData.rating}
          </p>
            <Star
                  style={{
                  fill: "yellow",
                  stroke:  "yellow",
                  }}
                  strokeWidth={1.5} size={19}/>
          </div>
        </div>
      </div>
    </>
  )
}

export default CollectionShowCard
