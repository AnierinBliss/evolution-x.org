import { useState, useEffect, useCallback } from 'react'

const BASE = 'https://raw.githubusercontent.com/AnierinBliss/'
const GITRES = `${BASE}www_gitres/refs/heads/main/`
const DEVICES = `${GITRES}devices/devices.json`
const VERSIONS = `${GITRES}version/versions.json`
const OTA = `https://raw.githubusercontent.com/Evolution-X/OTA/`

const fetchDownloadCount = async (codename, version, filename) => {
  if (!codename || !version || !filename) {
    return 0
  }
  const endDate = new Date().toISOString().split('T')[0]
  const url = `https://sourceforge.net/projects/evolution-x/files/${codename}/${version}/${filename}/stats/json?start_date=2019-03-19&end_date=${endDate}&period=monthly`

  try {
    const response = await fetch(url)
    if (!response.ok) {
      console.error(
        `HTTP error fetching download count for ${filename}! status: ${response.status}`
      )
      return 0
    }
    const data = await response.json()
    return data?.summaries?.time?.downloads || 0
  } catch (err) {
    console.error(`Error fetching download count for ${filename}:`, err)
    return 0
  }
}

const useDeviceData = (codename) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deviceData, setDeviceData] = useState(null)

  const fetchOTAData = useCallback(async (codename, branch) => {
    const url = `${OTA}${branch}/builds/${codename}.json`
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
    const getDeviceData = async () => {
      setLoading(true)
      setError(null)
      setDeviceData(null)

      if (!codename) {
        setError(new Error('Codename not provided.'))
        setLoading(false)
        return
      }

      try {
        const [devicesResponse, versionsResponse] = await Promise.all([
          fetch(DEVICES),
          fetch(VERSIONS)
        ])

        if (!devicesResponse.ok) {
          throw new Error(
            `HTTP error fetching devices! status: ${devicesResponse.status}`
          )
        }
        const devices = await devicesResponse.json()

        if (!versionsResponse.ok) {
          throw new Error(
            `HTTP error fetching versions! status: ${versionsResponse.status}`
          )
        }
        const versions = await versionsResponse.json()

        const foundDevice = devices.find(
          (device) => device.codename === codename
        )

        if (!foundDevice) {
          setDeviceData(null)
          setLoading(false)
          return
        }

        const branchesWithOta = await Promise.all(
          foundDevice.branches.map(async (branch) => {
            const otaData = await fetchOTAData(codename, branch)
            const versionEntry = versions.find(
              (entry) => entry.branch === branch
            )
            const version = versionEntry ? versionEntry.version : 'N/A'
            return {
              branch,
              version,
              ota: otaData
            }
          })
        )

        const validBranchesData = branchesWithOta.filter(
          (data) => data.ota !== null
        )

        const branchesWithDownloads = await Promise.all(
          validBranchesData.map(async (branchData) => {
            if (branchData.ota && branchData.ota.length > 0) {
              const downloads = {}
              await Promise.all(
                branchData.ota.map(async (ota) => {
                  const count = await fetchDownloadCount(
                    codename,
                    branchData.version,
                    ota.filename
                  )
                  downloads[ota.filename] = count
                })
              )
              return { ...branchData, downloads }
            }
            return { ...branchData, downloads: {} }
          })
        )

        setDeviceData({
          deviceInfo: foundDevice,
          branchesData: branchesWithDownloads
        })
      } catch (err) {
        setError(err)
        console.error('Error fetching device data:', err)
      } finally {
        setLoading(false)
      }
    }

    getDeviceData()
  }, [codename, fetchOTAData])

  return { deviceData, loading, error }
}

export default useDeviceData
