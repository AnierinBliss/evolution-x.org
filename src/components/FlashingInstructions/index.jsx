import React, { useEffect, useState, useCallback } from 'react'
import Markdown from 'react-markdown'
import 'github-markdown-css/github-markdown-dark.css'
import closeIcon from '../../assets/menuClose.svg'
import { motion, AnimatePresence } from 'framer-motion'

const initialVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 50 }
}

const FlashingInstructions = (props) => {
  const { codename, branch } = props
  const [instructions, setInstructions] = useState()
  const [showInstructions, setShowInstructions] = useState(false)

  const fetchInstructions = useCallback(async () => {
    const url = `https://raw.githubusercontent.com/Evolution-X/www_gitres/refs/heads/main/devices/instructions/${branch}/${codename}.md`
    try {
      const logs = await fetch(url)
      const data = await logs.text()
      return data
    } catch (error) {
      console.error('Error fetching instructions for device ' + codename, error)
    }
  }, [codename, branch])

  useEffect(() => {
    const fetchResponse = async () => {
      const response = await fetchInstructions()
      setInstructions(response)
    }
    fetchResponse()
  }, [fetchInstructions])

  const toggleInstructions = useCallback(() => {
    setShowInstructions((prev) => !prev)
  }, [])

  useEffect(() => {
    if (showInstructions) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [showInstructions])

  const components = {
    p: ({ node, ...props }) => (
      <p className='text-wrap text-[0.9rem] xl:text-lg' {...props} />
    )
  }

  return (
    <>
      <button
        onClick={toggleInstructions}
        className='h-16 w-full rounded-full bg-[#0060ff] px-4 text-2xl text-white hover:bg-[#004bb5]'
      >
        How to install
      </button>

      <AnimatePresence>
        {showInstructions && (
          <motion.div
            className='fixed inset-0 z-50 flex flex-col bg-black/50 py-[6rem] md:py-[6rem] lg:py-[6rem] xl:px-[4rem] 2xl:px-[15rem]'
            style={{ pointerEvents: 'auto' }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowInstructions(false)
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
                onClick={toggleInstructions}
                className='absolute right-[-1rem] top-[-1rem] z-50 cursor-pointer rounded-full border-4 border-[#0060ff] bg-[#0060ff] p-2'
              >
                <img src={closeIcon} alt='close' />
              </span>
              <div className='h-full overflow-y-scroll px-10 pt-5 lg:pt-[1rem]'>
                <div
                  className='markdown-body'
                  style={{ backgroundColor: '#040214' }}
                >
                  {instructions && (
                    <Markdown components={components}>{instructions}</Markdown>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default FlashingInstructions
