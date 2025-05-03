import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Device from '../../hooks/Device'
import evoloading from '../../assets/evoloading.gif'
import donateicon from '../../assets/donateicon.svg'
import xdaicon from '../../assets/xdaicon.svg'
import FlashingInstructions from '../FlashingInstructions'
import Changelogs from '../Changelogs'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowOutwardIcon } from '../ui/icons.tsx'
import UnmaintainedWarning from '../../components/UnmaintainedWarning'
import ThermonuclearWarning from '../../components/ThermonuclearWarning'
import evolution from '../../assets/evolution.svg'
import DeviceNotFound from '../../components/DeviceNotFound'

const initialVariants = {
  hidden: { opacity: 0, y: 75 },
  visible: { opacity: 1, y: 0 }
}

const switchVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
}

const DownloadSection = () => {
  const { codename } = useParams()
  const { deviceData, loading, error } = Device(codename)

  const [currentBranch, setCurrentBranch] = useState(null)
  const [showUnmaintainedWarning, setShowUnmaintainedWarning] = useState(false)
  const [warningBuildInfo, setWarningBuildInfo] = useState(null)
  const [showThermoWarning, setShowThermoWarning] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState(null)
  const [isDeviceNotFound, setDeviceNotFound] = useState(false)

  useEffect(() => {
    if (!deviceData?.branchesData?.length) return

    setCurrentBranch(
      deviceData.branchesData
        .filter((b) => !b.branch.toLowerCase().includes('vanilla'))
        .sort((a, b) =>
          b.version.localeCompare(a.version, undefined, { sensitivity: 'base' })
        )[0]?.branch ?? deviceData.branchesData[0].branch
    )
  }, [deviceData])

  useEffect(() => {
    const hasSeenThermo = localStorage.getItem('hasSeenThermonuclearWarning')
    setShowThermoWarning(!hasSeenThermo)
  }, [])

  useEffect(() => {
    if (!loading && !deviceData && !error) {
      setDeviceNotFound(true)
    } else {
      setDeviceNotFound(false)
    }
  }, [loading, deviceData, error, codename])

  const handleCloseThermoWarning = (action) => {
    setShowThermoWarning(false)
    if (action === 'gotIt') {
      localStorage.setItem('hasSeenThermonuclearWarning', 'true')
    }
  }

  const handleUnmaintainedAcknowledge = () => {
    if (downloadUrl) {
      window.open(downloadUrl, '_blank')
      setDownloadUrl(null)
    }
  }

  const handleCloseUnmaintainedWarning = () => {
    setShowUnmaintainedWarning(false)
    setWarningBuildInfo(null)
    setDownloadUrl(null)
  }

  const handleDownloadClick = (ota) => {
    if (!ota.currently_maintained) {
      const buildIdentifier = `${codename}-${ota.version}-${ota.filename}`
      const acknowledged = localStorage.getItem('acknowledgedUnmaintained')
      const acknowledgedBuilds = acknowledged ? JSON.parse(acknowledged) : {}

      if (!acknowledgedBuilds[buildIdentifier]) {
        setWarningBuildInfo({
          codename,
          version: ota.version,
          build: ota.filename
        })
        setDownloadUrl(ota.download)
        setShowUnmaintainedWarning(true)
        return
      }
    }
    window.open(ota.download, '_blank')
  }

  const currentBranchData = deviceData
    ? deviceData.branchesData.find(
        (branchData) => branchData.branch === currentBranch
      )
    : null

  const currentOtas = currentBranchData?.ota || []

  if (loading) {
    return (
      <div>
        <img className='mx-auto' src={evoloading} alt='Loading ...' />
      </div>
    )
  }

  if (error) {
    return <div className='text-red-500'>Error: {error.message}</div>
  }

  if (isDeviceNotFound) {
    return <DeviceNotFound codename={codename} />
  }

  return (
    <>
      <AnimatePresence>
        {showThermoWarning && (
          <ThermonuclearWarning onClose={handleCloseThermoWarning} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showUnmaintainedWarning && warningBuildInfo && (
          <UnmaintainedWarning
            onClose={handleCloseUnmaintainedWarning}
            buildInfo={warningBuildInfo}
            onAcknowledge={handleUnmaintainedAcknowledge}
          />
        )}
      </AnimatePresence>
      {deviceData &&
      deviceData.branchesData &&
      deviceData.branchesData.length > 0 ? (
        <motion.div
          variants={initialVariants}
          initial='hidden'
          animate='visible'
          className='mx-4 flex flex-col items-center justify-center gap-10 md:gap-20 lg:mx-16 xl:mx-auto xl:w-[80rem]'
        >
          <div className='inline-flex flex-col items-baseline gap-2 text-center font-[Prod-bold] text-4xl sm:flex-row sm:text-5xl lg:gap-4 lg:text-6xl'>
            <img className='h-7 sm:h-10 lg:h-12' src={evolution} alt='Logo' />
            <span className='evoxhighlight'>{codename}</span>
          </div>
          <div className='flex w-full flex-col gap-4 sm:-mt-8 lg:-mb-20 lg:-mt-16'>
            <div className='inline-flex flex-wrap items-center justify-start gap-2 lg:gap-3'>
              {deviceData.branchesData.map((branchData) => {
                const versionLabel = branchData.version.replace(/_/g, ' ')

                return (
                  <button
                    key={branchData.branch}
                    className={`buttonSelect ${
                      currentBranch === branchData.branch ? 'bg-[#0060ff]' : ''
                    }`}
                    onClick={() => setCurrentBranch(branchData.branch)}
                  >
                    {versionLabel}
                  </button>
                )
              })}
            </div>

            {currentOtas.length > 0 &&
              currentOtas.map((ota) => (
                <motion.div
                  key={ota.filename}
                  className='flex flex-col items-center justify-center gap-6 rounded-2xl border-2 border-[#0060ff] bg-[#060505] p-4 md:flex-row lg:gap-16 lg:p-11'
                >
                  <div className='mt-4 flex flex-col gap-4 md:w-1/4 lg:w-1/4 lg:flex-shrink-0'>
                    <img
                      className='max-h-56 min-h-48 w-full object-contain'
                      src={`https://raw.githubusercontent.com/Evolution-X/www_gitres/refs/heads/main/devices/images/${codename}.webp`}
                      alt='Device'
                    />
                    <div className='gap-4 text-center'>
                      <span>
                        <p className='text-2xl'>
                          {ota.oem} {ota.device}
                        </p>
                        <p className='evoxhighlight text-lg'>({codename})</p>
                      </span>
                    </div>
                  </div>
                  <AnimatePresence mode='wait'>
                    <motion.div
                      key={currentBranch}
                      variants={switchVariants}
                      initial='hidden'
                      animate='visible'
                      exit='exit'
                      transition={{ duration: 0.3 }}
                      className='middleshadow flex grow flex-col gap-4 rounded-2xl border-2 border-[#0060ff] bg-[#151414] px-4 py-5 md:w-2/3 lg:w-2/3 lg:justify-between lg:gap-0'
                    >
                      <div className='flex grow flex-col gap-4 lg:justify-between lg:gap-0'>
                        <div className='grid grid-cols-2 gap-2 pb-4 pl-2 lg:grid-cols-3 lg:gap-6'>
                          <div className='grow'>
                            <div className='evoxhighlight text-base'>
                              Android Version
                            </div>
                            <div className='text-2xl text-white'>
                              {currentBranchData?.version}
                            </div>
                          </div>

                          <div className='grow'>
                            <div className='evoxhighlight text-base'>
                              Evolution X Version
                            </div>
                            <div className='text-2xl text-white'>
                              {ota.version}
                            </div>
                          </div>

                          <div className='grow'>
                            <div className='evoxhighlight text-base'>Date</div>
                            <div className='text-2xl text-white'>
                              {new Date(ota.timestamp * 1000).toDateString()}
                            </div>
                          </div>
                          <div className='grow'>
                            <div className='evoxhighlight text-base'>Type</div>
                            <div className='text-2xl text-white'>
                              {ota.buildtype}
                            </div>
                          </div>
                          <div className='grow'>
                            <div className='evoxhighlight text-base'>Size</div>
                            <div className='text-2xl text-white'>
                              {(ota.size / 1024 / 1024 / 1024).toFixed(2)} GB
                            </div>
                          </div>
                          <div className='grow'>
                            <div className='evoxhighlight text-base'>
                              Download Count
                            </div>
                            <div className='text-2xl text-white'>
                              {deviceData?.branchesData.find(
                                (b) => b.branch === currentBranch
                              )?.downloads?.[ota.filename] || 'N/A'}
                            </div>
                          </div>
                        </div>
                        <div className='mb-4 flex items-center justify-between gap-4 rounded-2xl border-2 border-[#0060ff] bg-[#212121] px-4 py-3 lg:gap-9'>
                          <div className='flex items-center justify-start gap-2'>
                            <div className='flex size-12 shrink-0 items-center justify-center lg:size-16'>
                              <img
                                className='rounded-full'
                                src={`https://avatars.githubusercontent.com/${ota.github}`}
                                alt='avatar'
                              />
                            </div>
                            <div className='lg:max-w-90 max-w-48 text-wrap font-[Prod-Medium] text-lg text-white lg:text-xl xl:max-w-fit'>
                              {ota.maintainer}
                            </div>
                          </div>
                          <div className='flex gap-2'>
                            {ota.paypal && (
                              <Link to={ota.paypal} target='_blank'>
                                <img
                                  src={donateicon}
                                  alt='donateicon'
                                  className='size-8 lg:size-10'
                                />
                              </Link>
                            )}
                            {ota.forum && (
                              <Link to={ota.forum} target='_blank'>
                                <img
                                  src={xdaicon}
                                  alt='xda'
                                  className='size-8 lg:size-10'
                                />
                              </Link>
                            )}
                          </div>
                        </div>
                        <div className='grid grid-cols-1 gap-3 lg:grid-cols-2'>
                          <FlashingInstructions
                            codename={codename}
                            branch={currentBranch}
                          />
                          <Changelogs
                            codename={codename}
                            branch={currentBranch}
                          />
                          <button
                            onClick={() => handleDownloadClick(ota)}
                            className='inline-flex h-16 items-center justify-center gap-2 rounded-full bg-[#0060ff] text-2xl text-white hover:bg-[#004bb5] lg:hidden'
                          >
                            <p>Download</p>
                            <ArrowOutwardIcon className='size-4 lg:size-6' />
                          </button>
                        </div>
                        <div className='flex w-full flex-col gap-3 py-2 lg:flex-row lg:gap-4'>
                          <button
                            onClick={() => handleDownloadClick(ota)}
                            className='hidden h-16 grow items-center justify-center gap-2 rounded-full bg-[#0060ff] text-2xl text-white hover:bg-[#004bb5] lg:inline-flex lg:h-16 lg:w-1/2'
                          >
                            <p>Download</p>
                            <ArrowOutwardIcon className='size-4 lg:size-6' />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </motion.div>
              ))}
            {currentOtas.length === 0 &&
              deviceData.branchesData.some(
                (branchData) =>
                  branchData.branch === currentBranch &&
                  branchData.ota &&
                  branchData.ota.length === 0
              ) && (
                <motion.div
                  variants={initialVariants}
                  initial='hidden'
                  animate='visible'
                  exit='exit'
                  transition={{ duration: 0.3 }}
                  className='flex rounded-2xl bg-[#060505] p-6 ring ring-gray-400/5 ring-offset-2 ring-offset-gray-400/5 lg:gap-16 lg:p-11'
                >
                  No OTA data available for the selected branch.
                </motion.div>
              )}
          </div>
        </motion.div>
      ) : null}
    </>
  )
}

export default DownloadSection
