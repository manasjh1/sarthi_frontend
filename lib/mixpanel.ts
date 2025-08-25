// lib/mixpanel.ts
import mixpanel from "mixpanel-browser";

const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN!;

export const initMixpanel = () => {
  if (!MIXPANEL_TOKEN) {
    console.warn("Mixpanel token not found");
    return;
  }
  mixpanel.init(MIXPANEL_TOKEN, { debug: true });
};

export default mixpanel;
