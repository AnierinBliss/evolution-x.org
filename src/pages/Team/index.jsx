import { motion } from "framer-motion"
import React, { useEffect, useState } from "react"
import founder from "../../assets/Founders.svg"
import ourteam from "../../assets/OurTeam.svg"

// Base URL for images
const BASE_URL = "https://raw.githubusercontent.com/Evolution-X/www_gitres/main/team/images/"

const Team = () => {
  const [teamData, setTeamData] = useState(null)

  // Fetch the team.json data
  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        const response = await fetch(
          "https://raw.githubusercontent.com/Evolution-X/www_gitres/main/team/team.json"
        )
        const data = await response.json()
        setTeamData(data)
      } catch (error) {
        console.error("Error fetching team data:", error)
      }
    }

    fetchTeamData()
  }, [])

  if (!teamData) {
    return <p>Loading...</p>
  }

  return (
    <>
      {/* Founders Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="z-10 flex flex-col items-center gap-2 px-4 text-center lg:-mt-14 lg:gap-7"
      >
        <p className="max-w-[50rem] font-[Prod-bold] text-4xl xl:text-5xl">
          We are the founders of this project
        </p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mx-auto flex w-fit flex-col items-center justify-center border-4 border-[#afbdf3] p-10"
      >
        <div className="mx-0 -mt-14 flex flex-col items-center justify-between text-xs lg:-mx-56 xl:-mx-64">
          <div className="mb-12 w-fit bg-[#040214] px-3 text-2xl">Our Founders</div>
          <Card list={teamData.founders} shadowOn={true} />
        </div>
      </motion.div>
      <img
        className="absolute left-0 top-[550px] z-0 my-auto sm:top-[570px] md:top-[370px] lg:top-[160px] xl:top-[200px] 2xl:top-[260px]"
        alt=""
        src={founder}
      />
      {/* Evolution X Team Section */}
      <div className="mx-auto mb-12 flex w-fit flex-col items-center justify-center border-4 border-[#afbdf3] px-10 pb-20 pt-10 xl:p-10">
        <div className="-my-14 flex flex-col items-center justify-between text-xs">
          <div className="mb-12 w-fit bg-[#040214] px-3 text-2xl">Project Members</div>
          <Card list={teamData.teamMembers} shadowOn={false} />
          <div className="mt-12 hidden w-fit bg-[#040214] px-3 text-2xl xl:block">
            These are some of the people who have helped bring us here today
          </div>
        </div>
        <img className="absolute right-0 z-0 my-auto" alt="" src={ourteam} />
      </div>
      {/* About Evolution X */}
      <div className="z-10 mx-10 flex flex-col items-center justify-center gap-10 sm:mx-24 xl:flex-row">
        <div className="space-y-10 md:text-center xl:text-left">
          <div className="text-nowrap !bg-clip-text text-4xl text-transparent [-webkit-background-clip:text] [-webkit-text-fill-color:transparent] [background:linear-gradient(92deg,_#2fc1ee,_#dbe6ea)] lg:text-5xl">
            About Evolution X
          </div>
          <div className="text-xl lg:text-2xl">
            Evolution X is a custom Android ROM project that mimics the user
            experience of Google Pixel devices while enhancing it with extensive
            customization options. Launched in March 2019 by a team of three
            developers, led by Jose Antonio Huab "Joey", Evolution X has since
            evolved into one of the most sought-after custom ROMs.
          </div>
        </div>
        <img
          className="mx-10 h-56 rounded-[2.5rem] object-cover lg:h-72"
          alt="Evolution X Banner"
          src={`${BASE_URL}banner.png`}
        />
      </div>
    </>
  )
}

export default Team

function Card({ list, shadowOn }) {
  return (
    <div className="z-10 grid gap-16 md:grid-cols-2 lg:grid-cols-3">
      {list.map((item, index) => (
        <div
          className={`relative flex h-80 w-64 flex-col justify-end rounded-3xl text-left duration-300 ${
            shadowOn
              ? "shadow-[0px_0px_38.5px_14px_#ffffff25] hover:shadow-[0px_0px_38.5px_14px_#ffffff50]"
              : "shadow-[0px_0px_38.5px_14px_#FF8AF320] hover:shadow-[0px_0px_38.5px_14px_#FF8AF350]"
          }`}
          key={index}
        >
          <img
            className="absolute h-80 w-64 rounded-3xl object-cover"
            alt={item.name}
            src={`${BASE_URL}${item.imgsrc}`}
          />
          <div className="z-20 rounded-b-3xl bg-black/25 px-4 py-4">
            <p className="font-[Prod-bold] text-base">{item.name}</p>
            {item.role && <div className="text-xs"><p>{item.role}</p></div>}
          </div>
        </div>
      ))}
    </div>
  )
}
