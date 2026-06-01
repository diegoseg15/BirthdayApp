// src/services/fullScreenAdService.js

import { Platform } from "react-native";
import {
  AdEventType,
  InterstitialAd,
  TestIds,
} from "react-native-google-mobile-ads";

function getInterstitialAdUnitId() {
  if (__DEV__) {
    return TestIds.INTERSTITIAL;
  }

  return Platform.select({
    android: process.env.EXPO_PUBLIC_ADMOB_ANDROID_INTERSTITIAL_ID,
    ios: process.env.EXPO_PUBLIC_ADMOB_IOS_INTERSTITIAL_ID,
    default: undefined,
  });
}

export function showSupportInterstitialAd() {
  return new Promise((resolve) => {
    const adUnitId = getInterstitialAdUnitId();

    if (!adUnitId) {
      resolve({
        shown: false,
        reason: "missing-ad-unit-id",
      });
      return;
    }

    const interstitial = InterstitialAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: true,
    });

    let didShow = false;

    const unsubscribeLoaded = interstitial.addAdEventListener(
      AdEventType.LOADED,
      () => {
        didShow = true;
        interstitial.show();
      },
    );

    const unsubscribeClosed = interstitial.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        unsubscribeLoaded();
        unsubscribeClosed();
        unsubscribeError();

        resolve({
          shown: true,
          reason: "closed",
        });
      },
    );

    const unsubscribeError = interstitial.addAdEventListener(
      AdEventType.ERROR,
      (error) => {
        console.warn("Support interstitial ad failed:", error);

        unsubscribeLoaded();
        unsubscribeClosed();
        unsubscribeError();

        resolve({
          shown: didShow,
          reason: "error",
        });
      },
    );

    interstitial.load();
  });
}