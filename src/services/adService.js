// src/services/adService.js

import mobileAds, { MaxAdContentRating } from "react-native-google-mobile-ads";

let isInitialized = false;

export async function initializeAds() {
  if (isInitialized) return true;

  try {
    await mobileAds().setRequestConfiguration({
      maxAdContentRating: MaxAdContentRating.PG,
      testDeviceIdentifiers: __DEV__ ? ["EMULATOR"] : [],
    });

    await mobileAds().initialize();

    isInitialized = true;

    return true;
  } catch (error) {
    console.warn("AdMob could not be initialized:", error);

    return false;
  }
}
