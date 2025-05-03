import React, { useEffect, useState, useCallback } from 'react'
import closeIcon from '../../assets/menuClose.svg'
import { motion, AnimatePresence } from 'framer-motion'

const initialVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 50 }
}

const Changelogs = (props) => {
  const { codename, branch } = props
  const [changelogs, setChangelogs] = useState()
  const [showChangelogs, setShowChangelogs] = useState(false)

  const fetchChangelogs = useCallback(async () => {
    const url = `https://raw.githubusercontent.com/Evolution-X/OTA/refs/heads/${branch}/changelogs/${codename}.txt`
    try {
      const logs = await fetch(url)
      const data = await logs.text()
      return data
    } catch (error) {
      console.error('Error fetching changelogs for device ' + codename, error)
    }
  }, [codename, branch])

  useEffect(() => {
    const fetchResponse = async () => {
      const response = await fetchChangelogs()
      setChangelogs(response)
    }
    fetchResponse()
  }, [fetchChangelogs])

  const toggleChangelog = useCallback(() => {
    setShowChangelogs((prev) => !prev)
  }, [])

  useEffect(() => {
    if (showChangelogs) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [showChangelogs])

  return (
    <>
      <button
        onClick={toggleChangelog}
        className='h-16 w-full rounded-full bg-[#0060ff] px-4 text-2xl text-white hover:bg-[#004bb5]'
      >
        Changelog
      </button>

      <AnimatePresence>
        {showChangelogs && (
          <motion.div
            className='fixed inset-0 z-50 flex flex-col bg-black/50 py-[6rem] md:py-[6rem] lg:py-[6rem] xl:px-[4rem] 2xl:px-[15rem]'
            style={{ pointerEvents: 'auto' }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowChangelogs(false)
              }
            }}
            initial='hidden'
            animate='visible'
            exit='exit'
            variants={initialVariants}
            transition={{ duration: 0.3 }}
          >
            <div className='relative mx-[2rem] min-h-0 grow rounded-3xl border-4 border-dashed border-[#0060ff] bg-[#040214]'>
              <span
                onClick={toggleChangelog}
                className='absolute right-[-1rem] top-[-1rem] z-50 cursor-pointer rounded-full border-4 border-[#0060ff] bg-[#0060ff] p-2'
              >
                <img src={closeIcon} alt='close' />
              </span>
              <div className='h-full overflow-y-scroll px-10 pt-5 lg:pt-[1rem]'>
                {changelogs && (
                  <pre className='text-wrap text-[0.9rem] xl:text-lg'>
                    {changelogs}
                  </pre>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default Changelogs
