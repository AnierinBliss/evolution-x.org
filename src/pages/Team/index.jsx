import { motion } from 'framer-motion'
import React, { useEffect, useState } from 'react'
import evoloading from '../../assets/evoloading.gif'
import evolution from '../../assets/evolution.svg'

const variants = {
  hidden: { opacity: 0, y: 75, transition: { delay: 0.2 } },
  visible: { opacity: 1, y: 0, transition: { delay: 0.2 } }
}

const Team = () => {
  const [teamData, setTeamData] = useState(null)
  const [maintainersData, setMaintainersData] = useState(null)
  const [devicesData, setDevicesData] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      const baseUrl =
        'https://raw.githubusercontent.com/AnierinBliss/www_gitres/main'
      const devicesUrl =
        'https://raw.githubusercontent.com/AnierinBliss/www_gitres/refs/heads/main/devices/devices.json'

      try {
        const [teamResponse, maintainersResponse, devicesResponse] =
          await Promise.all([
            fetch(`${baseUrl}/team/team.json`),
            fetch(`${baseUrl}/team/maintainers.json`),
            fetch(devicesUrl)
          ])

        if (!teamResponse.ok) throw new Error('Failed to fetch team.json')
        if (!maintainersResponse.ok)
          throw new Error('Failed to fetch maintainers.json')
        if (!devicesResponse.ok) throw new Error('Failed to fetch devices.json')

        const team = await teamResponse.json()
        const maintainers = await maintainersResponse.json()
        const devices = await devicesResponse.json()

        setTeamData(team)
        setMaintainersData(maintainers)
        setDevicesData(devices)
      } catch (err) {
        console.error('Fetch error:', err)
      }
    }

    fetchData()
  }, [])

  const getDeviceName = (codename) => {
    const device = devicesData?.find((d) => d.codename === codename)
    return device ? device.codename : codename
  }

  if (!teamData || !maintainersData || !devicesData) {
    return <img className='mx-auto' src={evoloading} alt='Loading...' />
  }

  return (
    <motion.div
      variants={variants}
      initial='hidden'
      animate='visible'
      className='mx-4 flex flex-col items-center justify-center gap-10 md:gap-20 lg:mx-16 xl:mx-auto xl:w-[64rem]'
    >
      <div className='inline-flex flex-col items-baseline gap-2 text-center font-[Prod-bold] text-4xl sm:flex-row sm:text-5xl lg:gap-4 lg:text-6xl'>
        <span className='evoxhighlight'>Team</span>
        <img className='h-7 sm:h-10 lg:h-12' src={evolution} alt='Logo' />
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className='mx-auto flex w-fit flex-col items-center justify-center border-4 border-[#0060ff] p-10'
      >
        <div className='mx-0 -mt-14 flex flex-col items-center justify-between text-xs lg:-mx-56 xl:-mx-64'>
          <div className='mb-12 w-fit bg-[#040214] px-3 text-2xl'>Founders</div>
          <Card list={teamData.founders} shadowOn={true} />
        </div>
      </motion.div>
      <motion.div
        variants={variants}
        initial='hidden'
        animate='visible'
        className='mx-auto mb-12 flex w-fit flex-col items-center justify-center border-4 border-[#0060ff] px-10 pb-20 pt-10 xl:p-10'
      >
        <div className='-my-14 flex flex-col items-center justify-between text-xs'>
          <div className='mb-12 w-fit bg-[#040214] px-3 text-2xl'>
            Project Members
          </div>
          <Card list={teamData.teamMembers} shadowOn={false} />
          <div className='mt-12 hidden w-fit bg-[#040214] px-3 text-2xl xl:block'>
            These are some of the people who have helped bring us here today
          </div>
        </div>
      </motion.div>
      <motion.div
        variants={variants}
        initial='hidden'
        animate='visible'
        className='mx-auto mb-12 flex w-fit flex-col items-center justify-center border-4 border-[#0060ff] px-10 pb-20 pt-10 xl:p-10'
      >
        <div className='-my-14 flex flex-col items-center justify-between text-xs'>
          <div className='mb-12 w-fit bg-[#040214] px-3 text-2xl'>
            Current Maintainers
          </div>
          <Card
            list={maintainersData?.active_maintainers || []}
            shadowOn={false}
            isMaintainer={true}
            showUsedToMaintain={true}
            title='Currently Maintaining'
            getDeviceName={getDeviceName}
          />
          <div className='mt-12 hidden w-fit bg-[#040214] px-3 text-2xl xl:block'>
            These are the amazing individuals maintaining Evolution X
          </div>
        </div>
      </motion.div>
      <motion.div
        variants={variants}
        initial='hidden'
        animate='visible'
        className='mx-auto mb-12 flex w-fit flex-col items-center justify-center border-4 border-[#0060ff] px-10 pb-20 pt-10 xl:p-10'
      >
        <div className='-my-14 flex flex-col items-center justify-between text-xs'>
          <div className='mb-12 w-fit bg-[#040214] px-3 text-2xl'>
            Former Maintainers
          </div>
          <Card
            list={maintainersData?.inactive_maintainers || []}
            shadowOn={false}
            isMaintainer={true}
            showUsedToMaintain={true}
            title='Used To Maintain'
            getDeviceName={getDeviceName}
          />
          <div className='mt-12 hidden w-fit bg-[#040214] px-3 text-2xl xl:block'>
            Past maintainers who previously contributed to Evolution X
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default Team

function Card({
  list,
  shadowOn,
  isMaintainer = false,
  showUsedToMaintain = false,
  title = '',
  getDeviceName
}) {
  const [expandedItems, setExpandedItems] = useState(new Set())

  const toggleExpanded = (index) => {
    setExpandedItems((prev) => {
      const newExpandedItems = new Set(prev)
      if (newExpandedItems.has(index)) {
        newExpandedItems.delete(index)
      } else {
        newExpandedItems.add(index)
      }
      return newExpandedItems
    })
  }

  const handleShowMoreClick = (e, index, type) => {
    e.stopPropagation()
    toggleExpanded(`${index}-${type}`)
  }

  const handleCardDoubleClick = (githubUrl) => {
    window.open(githubUrl, '_blank')
  }

  return (
    <div className='z-10 grid gap-16 md:grid-cols-2 lg:grid-cols-3'>
      {list.map((item, index) => {
        const avatarUrl = `https://avatars.githubusercontent.com/${item.github}`
        const name = item.name || item.github
        const githubUrl = `https://github.com/${item.github}`
        const currentIndex = `${index}`
        const currentDevicesExpanded = expandedItems.has(`${index}-current`)
        const usedToMaintainExpanded = expandedItems.has(`${index}-used`)

        const currentDevicesList =
          isMaintainer && item.currently_maintains ? (
            <div className='text-xs'>
              <p className='font-semibold'>{title}:</p>
              {(currentDevicesExpanded
                ? item.currently_maintains
                : item.currently_maintains.slice(0, 3)
              ).map((codename, deviceIndex) => (
                <div key={deviceIndex}>{getDeviceName(codename)}</div>
              ))}
              {item.currently_maintains.length > 3 && (
                <button
                  onClick={(e) => handleShowMoreClick(e, index, 'current')}
                  className='mt-1 text-xs text-[#0060ff] hover:underline'
                >
                  {currentDevicesExpanded
                    ? 'Show Less'
                    : `+${item.currently_maintains.length - 3} more`}
                </button>
              )}
            </div>
          ) : null

        const usedToMaintainList =
          isMaintainer &&
          showUsedToMaintain &&
          item.used_to_maintain &&
          item.used_to_maintain.length > 0 ? (
            <div className='mt-2 text-xs'>
              <p className='font-semibold'>Previously Maintained:</p>
              {(usedToMaintainExpanded
                ? item.used_to_maintain
                : item.used_to_maintain.slice(0, 3)
              ).map((codename, deviceIndex) => (
                <div key={deviceIndex}>{getDeviceName(codename)}</div>
              ))}
              {item.used_to_maintain.length > 3 && (
                <button
                  onClick={(e) => handleShowMoreClick(e, index, 'used')}
                  className='mt-1 text-xs text-[#0060ff] hover:underline'
                >
                  {usedToMaintainExpanded
                    ? 'Show Less'
                    : `+${item.used_to_maintain.length - 3} more`}
                </button>
              )}
            </div>
          ) : null

        return (
          <motion.div
            variants={variants}
            initial={{ opacity: 0, scale: 0.75 }}
            whileInView={{ opacity: 1, scale: 1 }}
            key={index}
            className='relative flex h-80 w-64 flex-col justify-between rounded-3xl text-left duration-300'
            onDoubleClick={() => handleCardDoubleClick(githubUrl)}
          >
            <div
              className={`flex h-full flex-col justify-between rounded-3xl ${
                shadowOn
                  ? 'shadow-[0px_0px_38.5px_14px_#0060ff25] hover:scale-105 hover:shadow-[0px_0px_38.5px_14px_#0060ff50]'
                  : 'shadow-[0px_0px_38.5px_14px_#0060ff20] hover:scale-105 hover:shadow-[0px_0px_38.5px_14px_#0060ff50]'
              }`}
            >
              <img
                className='absolute h-80 w-64 rounded-3xl object-cover'
                alt={name}
                src={avatarUrl}
              />
              <div className='z-20 flex flex-col justify-end rounded-b-3xl bg-black/25 px-4 py-4'>
                <p className='font-[Prod-bold] text-base'>{name}</p>
                {!isMaintainer && item.role && (
                  <div className='text-xs'>
                    <p>{item.role}</p>
                  </div>
                )}
                {currentDevicesList}
                {usedToMaintainList}
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
