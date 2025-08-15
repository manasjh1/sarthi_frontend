export const ANALYTICS_EVENTS = {
  // Authentication
  AUTH_INVITE_CODE_ENTERED: 'Auth Invite Code Entered',
  AUTH_OTP_SENT: 'Auth OTP Sent',
  AUTH_OTP_VERIFIED: 'Auth OTP Verified',
  AUTH_LOGIN_SUCCESS: 'Auth Login Success',
  AUTH_LOGOUT: 'Auth Logout',

  // Onboarding
  ONBOARDING_STARTED: 'Onboarding Started',
  ONBOARDING_NAME_SET: 'Onboarding Name Set',
  ONBOARDING_ANONYMOUS_SELECTED: 'Onboarding Anonymous Selected',
  ONBOARDING_COMPLETED: 'Onboarding Completed',

  // Reflection
  REFLECTION_STARTED: 'Reflection Started',
  REFLECTION_CATEGORY_SELECTED: 'Reflection Category Selected',
  REFLECTION_MESSAGE_SENT: 'Reflection Message Sent',
  REFLECTION_COMPLETED: 'Reflection Completed',
  REFLECTION_TEMPLATE_SELECTED: 'Reflection Template Selected',
  REFLECTION_EDITED: 'Reflection Edited',
  REFLECTION_REGENERATED: 'Reflection Regenerated',

  // Delivery
  DELIVERY_METHOD_SELECTED: 'Delivery Method Selected',
  DELIVERY_EMAIL_PROVIDED: 'Delivery Email Provided',
  DELIVERY_PHONE_PROVIDED: 'Delivery Phone Provided',
  DELIVERY_PRIVATE_SELECTED: 'Delivery Private Selected',
  MESSAGE_SENT: 'Message Sent',

  // Closure
  CLOSURE_FEELING_SELECTED: 'Closure Feeling Selected',
  CLOSURE_SHARE_SELECTED: 'Closure Share Selected',
  CLOSURE_PRIVATE_SELECTED: 'Closure Private Selected',

  // Engagement
  SHARE_LINK_GENERATED: 'Share Link Generated',
  SHARE_METHOD_USED: 'Share Method Used',
  JOURNAL_ENTRY_SAVED: 'Journal Entry Saved',

  // Errors
  ERROR_OCCURRED: 'Error Occurred'
} as const

export type AnalyticsEvent = typeof ANALYTICS_EVENTS[keyof typeof ANALYTICS_EVENTS]