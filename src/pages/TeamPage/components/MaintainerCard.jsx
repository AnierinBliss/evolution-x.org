import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const cardVariants = {
  hidden: { opacity: 0, scale: 0.75, y: 50 },
  visible: { opacity: 1, scale: 1, y: 0 }
}

const formatDevices = (devices) => {
  if (!devices || devices.length === 0) {
    return '-'
  }

  return (
    <div className='flex justify-center flex-wrap'>
      {devices.map((deviceObj) => (
        <div key={deviceObj.codename} className='px-2 py-1'>
          <Link
            to={`/devices/${deviceObj.codename}`}
            className='hover:underline break-words text-center block'
          >
            {deviceObj.device}
          </Link>
        </div>
      ))}
    </div>
  )
}

const MaintainerCard = ({ maintainer, isActive }) => (
  <motion.div
    variants={cardVariants}
    initial='hidden'
    animate='visible'
    whileHover={{ scale: 1.05, boxShadow: '0px 0px 38.5px 18px #0060ff50' }}
    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    className='cursor-pointer rounded-lg border-2 border-[#0060ff] bg-[#0f172a] p-4 shadow-[0px_0px_38.5px_14px_#0060ff20] duration-100 ease-in flex flex-col items-center text-center'
  >
    <a
      href={`https://github.com/${maintainer.github}`}
      target='_blank'
      rel='noopener noreferrer'
      className='mb-2 flex items-center transition-colors duration-300 hover:text-[#4da6ff]'
    >
      <img
        src={`https://avatars.githubusercontent.com/${maintainer.github}`}
        alt={maintainer.name}
        className='mr-2 h-10 w-10 rounded-full object-cover ring-0 transition-all duration-300 group-hover:ring-2 group-hover:ring-[#4da6ff]'
      />
      <span className='text-lg font-semibold'>{maintainer.name}</span>
    </a>

    {!isActive && (
      <div className='w-full'>
        {maintainer.currently_maintains &&
          maintainer.currently_maintains.length > 0 && (
            <div>
              <h4 className='font-semibold evoxhighlight'>Currently Maintains:</h4>
              {formatDevices(maintainer.currently_maintains)}
            </div>
          )}
        {maintainer.used_to_maintain &&
          maintainer.used_to_maintain.length > 0 && (
            <div>
              <h4 className='mt-2 font-semibold evoxhighlight'>Previously Maintained:</h4>
              {formatDevices(maintainer.used_to_maintain)}
            </div>
          )}
        {(!maintainer.currently_maintains ||
          maintainer.currently_maintains.length === 0) && (
            <div>
              <h4 className='font-semibold evoxhighlight'>Currently Maintains:</h4>-
            </div>
          )}
      </div>
    )}

    {isActive &&
      maintainer.used_to_maintain &&
      maintainer.used_to_maintain.length > 0 && (
        <div className='w-full'>
          <h4 className='mt-2 font-semibold evoxhighlight'>Previously Maintained:</h4>
          {formatDevices(maintainer.used_to_maintain)}
        </div>
      )}

    {isActive &&
      (!maintainer.used_to_maintain ||
        maintainer.used_to_maintain.length === 0) && (
        <div className='w-full'>
          <h4 className='mt-2 font-semibold evoxhighlight'>Previously Maintained:</h4>-
        </div>
      )}
  </motion.div>
)

export default MaintainerCard
