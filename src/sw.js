import { registerSW } from 'virtual:pwa-register'

const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('New content is available. Reload to get the latest version?')) {
      updateSW()
    }
  },
  onOfflineReady() {
    console.log('App is ready to work offline')
  },
})

export default updateSW
