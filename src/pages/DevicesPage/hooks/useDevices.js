import { useState, useEffect, useCallback } from 'react'
import * as Constants from '../../../constants'

const useDevices = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deviceMap, setDeviceMap] = useState([])

  const fetchOTAData = useCallback(async (codename, branch) => {
    const url = `${Constants.OTA}${branch}/builds/${codename}.json`
    try {
      const response = await fetch(url)
      if (!response.ok) {
        if (response.status === 404) {
          console.warn(`OTA data not found for ${codename} on branch ${branch}`)
          return null
        }
        throw new Error(
          `HTTP error fetching OTA for ${codename} on ${branch}! status: ${response.status}`
        )
      }
      const data = await response.json()
      return data.response
    } catch (error) {
      console.error(
        `Error fetching OTA data for ${codename} on ${branch}:`,
        error
      )
      return null
    }
  }, [])

  useEffect(() => {
    const fetchDevicesAndOTA = async () => {
      setLoading(true)
      setError(null)
      try {
        const [devicesResponse, versionsResponse] = await Promise.all([
          fetch(Constants.DEVICES),
          fetch(Constants.VERSIONS)
        ])

        if (!devicesResponse.ok) {
          throw new Error(
            `HTTP error fetching devices! status: ${devicesResponse.status}`
          )
        }
        const devicesData = await devicesResponse.json()

        if (!versionsResponse.ok) {
          throw new Error(
            `HTTP error fetching versions! status: ${versionsResponse.status}`
          )
        }
        const versionsData = await versionsResponse.json()
        const latestVersionEntry = versionsData.find(
          (versionEntry) => !versionEntry.branch.includes('vanilla')
        )

        const latestBranchName = latestVersionEntry
          ? latestVersionEntry.branch
          : null

        const newDeviceMap = []
        const otaPromises = devicesData.map(async (deviceData) => {
          const { codename, branches } = deviceData
          const nonVanillaBranches = branches.filter(
            (branch) => !branch.includes('vanilla')
          )

          const branchOTAPromises = nonVanillaBranches.map((branch) =>
            fetchOTAData(codename, branch)
          )
          const otaResults = await Promise.all(branchOTAPromises)

          let isMaintained = false
          let device = 'N/A'
          let foundDeviceName = false
          let latestBuildForDevice = 0
          let oem = 'N/A'

          for (const otaData of otaResults) {
            if (otaData) {
              for (const build of otaData) {
                if (build.oem && oem === 'N/A') {
                  oem = build.oem
                }
                if (!foundDeviceName && build.device) {
                  device = build.device
                  foundDeviceName = true
                }
                if (build.currently_maintained) {
                  isMaintained = true
                }
                if (build.timestamp && build.timestamp > latestBuildForDevice) {
                  latestBuildForDevice = build.timestamp
                }
              }
            }
          }

          const supportsLatest = latestBranchName
            ? branches.includes(latestBranchName)
            : false
          const imageUrl = `${Constants.DEVICES_IMAGE}${codename}.webp`

          newDeviceMap.push({
            codename,
            device,
            oem,
            supportsLatest,
            isMaintained,
            latestBuild: latestBuildForDevice,
            imageUrl
          })
        })

        await Promise.all(otaPromises)

        newDeviceMap.sort((a, b) => b.latestBuild - a.latestBuild)

        setDeviceMap(newDeviceMap)
      } catch (error) {
        setError(error)
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDevicesAndOTA()
  }, [fetchOTAData])

  return { deviceMap, loading, error }
}

export default useDevices
