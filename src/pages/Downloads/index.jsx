import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import loadingGif from '../../assets/evoloading.gif'
import iphoneGif from '../../assets/iphone.gif'
import evolutionIcon from '../../assets/evolution.svg'
import Devices from '../../hooks/Devices'

const variants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0 }
}

const DownloadsPage = () => {
  const { deviceMap, loading, error } = Devices()
  const [search, setSearch] = useState('')
  const [oemFilter, setOemFilter] = useState(null)
  const [maintainedFilter, setMaintainedFilter] = useState(null)
  const [isSearchingIphone, setIsSearchingIphone] = useState(false)
  const [visibleOems, setVisibleOems] = useState([])

  const handleMaintainedFilter = useCallback((status) => {
    setMaintainedFilter((prev) => (prev === status ? null : status))
    setOemFilter(null)
  }, [])

  const handleOemFilter = useCallback(
    (oem) => setOemFilter((prev) => (prev === oem ? null : oem)),
    []
  )

  const filtered = useMemo(
    () =>
      deviceMap
        ?.filter(
          (d) =>
            maintainedFilter === null || d.isMaintained === maintainedFilter
        )
        .filter((d) => oemFilter === null || d.oem === oemFilter)
        .filter((d) => {
          const q = search.toLowerCase()
          return (
            d.device?.toLowerCase()?.includes(q) ||
            d.codename?.toLowerCase()?.includes(q) ||
            `${d.oem?.toLowerCase()} ${d.device?.toLowerCase()}`?.includes(q)
          )
        }) ?? [],
    [deviceMap, maintainedFilter, oemFilter, search]
  )

  const allOems = useMemo(
    () =>
      Array.from(new Set(deviceMap.map((device) => device.oem))).sort((a, b) =>
        a?.localeCompare(b)
      ),
    [deviceMap]
  )

  useEffect(() => {
    if (maintainedFilter === null) {
      setVisibleOems(allOems)
    } else {
      const filteredOems = new Set()
      deviceMap.forEach((device) => {
        if (device.isMaintained === maintainedFilter && device.oem) {
          filteredOems.add(device.oem)
        }
      })
      setVisibleOems(
        Array.from(filteredOems).sort((a, b) => a?.localeCompare(b))
      )
    }
  }, [maintainedFilter, deviceMap, allOems])

  const handleSearchChange = useCallback((e) => {
    const query = e.target.value
    setSearch(query)
    setIsSearchingIphone(query.toLowerCase() === 'iphone')
  }, [])

  if (loading) {
    return <img className='mx-auto' src={loadingGif} alt='Loading...' />
  }

  if (error) {
    return <div>Error: {error.message}</div>
  }

  return (
    <>
      <div className='flex flex-col items-center justify-center gap-20 xl:gap-24'>
        <motion.div
          variants={variants}
          initial='hidden'
          animate='visible'
          transition={{ delay: 0.1 }}
          className='mx-4 inline-flex min-w-[20rem] flex-col items-center justify-center gap-8 sm:mx-6 sm:min-w-[32rem] lg:w-[60rem] lg:gap-12 xl:w-[64rem]'
        >
          <div className='inline-flex flex-col items-baseline gap-2 text-center font-[Prod-bold] text-4xl sm:flex-row sm:text-5xl lg:gap-4 lg:text-6xl'>
            <span className='evoxhighlight'>Download</span>
            <img className='h-7 sm:h-10 lg:h-12' src={evolutionIcon} alt='' />
          </div>
          <div className='mx-auto w-full max-w-[40rem] space-y-4'>
            <input
              type='text'
              value={search}
              onChange={handleSearchChange}
              className='flex w-full rounded-full border-2 border-current bg-slate-800 bg-gradient-to-r from-indigo-100 to-[#0060ff] px-10 py-4 text-black text-black/75 placeholder:text-black/75 focus:border-blue-600 focus:outline-none'
              placeholder='Search'
            />
            <div className='flex justify-center gap-3'>
              <button
                onClick={() => handleMaintainedFilter(true)}
                className={`buttonSelect ${
                  maintainedFilter === true ? 'bg-green-500' : ''
                }`}
              >
                Active Devices
              </button>
              <button
                onClick={() => handleMaintainedFilter(false)}
                className={`buttonSelect ${
                  maintainedFilter === false ? 'bg-red-500' : ''
                }`}
              >
                Inactive Devices
              </button>
            </div>
            <div className='inline-flex flex-wrap items-center justify-center gap-3'>
              {visibleOems?.map((brand, i) => (
                <button
                  key={i}
                  onClick={() => handleOemFilter(brand)}
                  className={`buttonSelect ${
                    oemFilter === brand ? 'bg-[#0060ff]' : ''
                  }`}
                >
                  {brand}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {!loading && isSearchingIphone && (
          <div className='text-center'>
            <h2 className='text-2xl'>
              LMAO! You bought iPhone just to switch to Android!!
            </h2>{' '}
            <br />
            <h1 className='text-5xl font-bold'>NOOB!!</h1>
            <img src={iphoneGif} alt='iphone' />
          </div>
        )}

        <motion.div
          variants={variants}
          initial='hidden'
          animate='visible'
          transition={{ delay: 0.2 }}
          className='mx-4 grid gap-5 md:gap-10 min-[880px]:grid-cols-2 lg:gap-14 min-[1320px]:grid-cols-3'
          key={`${maintainedFilter}-${oemFilter}-${search}`}
        >
          {filtered?.map((device, i) => (
            <motion.div
              variants={variants}
              initial={{ opacity: 0, scale: 0.75 }}
              whileInView={{ opacity: 1, scale: 1 }}
              key={i}
            >
              <div className='relative flex min-h-full w-[23rem] flex-col justify-between rounded-2xl border-2 border-[#0060ff] bg-black pb-7 shadow-[0px_0px_38.5px_14px_#0060ff20] duration-100 ease-in hover:scale-105 hover:shadow-[0px_0px_38.5px_18px_#0060ff50]'>
                <img
                  className='mx-auto my-4 flex size-56 object-contain'
                  src={device.imageUrl}
                />
                {device.supportsLatest && (
                  <motion.img
                    src={`https://raw.githubusercontent.com/Evolution-X/www_gitres/refs/heads/main/version/latestversion.svg`}
                    initial={{ scale: 0.8, rotate: -5 }}
                    animate={{ scale: 0.9, rotate: 5 }}
                    transition={{
                      repeat: Infinity,
                      repeatType: 'mirror',
                      duration: 0.7,
                      type: 'spring',
                      damping: 5,
                      stiffness: 30
                    }}
                    viewport={{ once: true }}
                    className='absolute right-[-20px] top-[-30px] sm:right-[-30px]'
                  />
                )}
                <div className='flex flex-col gap-6 px-7'>
                  <div>
                    <p className='lg:text-md evoxhighlight flex items-end justify-between text-sm'>
                      Device
                      <span className='ml-8 inline-flex h-5 items-center justify-center rounded-3xl bg-[#232323] p-4'>
                        <span className='bg-gradient-to-r from-[#0060ff] via-[#9b4dca] to-[#ff007f] bg-clip-text text-transparent lg:text-lg'>
                          {device.codename}
                        </span>
                      </span>
                    </p>
                    <p className='mt-0 font-[Prod-Medium] text-xl text-white lg:text-2xl'>
                      {device.oem} {device.device}
                    </p>
                  </div>
                  <Link
                    to={`/downloads/${device.codename}`}
                    className='inline-flex h-16 items-center justify-center rounded-full bg-[#0060ff] text-xl text-white transition-all duration-300 hover:bg-[#004bb5]'
                  >
                    <span className='mr-1'>Get</span>
                    <img
                      src={evolutionIcon}
                      alt='Evolution X'
                      className='h-4 w-auto'
                    />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </>
  )
}

export default DownloadsPage
