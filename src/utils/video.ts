
export const getVideoQuality = (height: number) => {
  if (height >= 4320) {
    return 'FUHD'
  }
  if (height >= 2160) {
    return 'UHD'
  }
  if (height >= 1440) {
    return 'QHD'
  }
  if (height >= 1080) {
    return 'FHD'
  }
  if (height >= 720) {
    return 'HD'
  }
  if (height >= 480) {
    return 'SD'
  }
}