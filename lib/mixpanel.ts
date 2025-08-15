import mixpanel from 'mixpanel-browser'

// Initialize Mixpanel
const isDevelopment = process.env.NEXT_PUBLIC_ENVIRONMENT === 'development'

if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_MIXPANEL_TOKEN) {
  mixpanel.init(process.env.NEXT_PUBLIC_MIXPANEL_TOKEN, {
    debug: isDevelopment,
    track_pageview: true,
    persistence: 'localStorage',
    ignore_dnt: false
  })
}

// Analytics service
export const analytics = {
  // Identify user
  identify: (userId: string, traits?: Record<string, any>) => {
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_MIXPANEL_TOKEN) {
      mixpanel.identify(userId)
      if (traits) {
        mixpanel.people.set(traits)
      }
    }
  },

  // Track events
  track: (eventName: string, properties?: Record<string, any>) => {
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_MIXPANEL_TOKEN) {
      mixpanel.track(eventName, {
        ...properties,
        timestamp: new Date().toISOString(),
        page_url: window.location.href,
        user_agent: navigator.userAgent
      })
    }
  },

  // Set user properties
  setUserProperties: (properties: Record<string, any>) => {
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_MIXPANEL_TOKEN) {
      mixpanel.people.set(properties)
    }
  },

  // Page view tracking
  trackPageView: (pageName: string, properties?: Record<string, any>) => {
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_MIXPANEL_TOKEN) {
      mixpanel.track('Page Viewed', {
        page_name: pageName,
        ...properties
      })
    }
  },

  // Reset user (on logout)
  reset: () => {
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_MIXPANEL_TOKEN) {
      mixpanel.reset()
    }
  }
}

export default analytics