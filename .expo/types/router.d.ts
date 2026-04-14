/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `/` | `/(auth)` | `/(auth)/join-church` | `/(auth)/login` | `/(auth)/register` | `/(public)` | `/(public)/` | `/(tabs)` | `/(tabs)/` | `/(tabs)/announcements` | `/(tabs)/calendar` | `/(tabs)/more` | `/(tabs)/parish` | `/(tabs)/schedule` | `/..\components\ui\DateOfBirthPicker` | `/..\components\ui\ImagePickerModal` | `/..\hooks\useToast` | `/..\services\Api` | `/..\services\ApiHandler` | `/_sitemap` | `/announcements` | `/calendar` | `/community` | `/country-select` | `/donations` | `/donations/history` | `/events` | `/family` | `/holy-week` | `/home` | `/join-church` | `/language-select` | `/login` | `/mass-schedule` | `/more` | `/notifications` | `/novenas` | `/novenas/rosary` | `/parish` | `/parish-info` | `/profile` | `/profile/edit` | `/readings/today` | `/register` | `/sacraments` | `/sacraments/request` | `/schedule` | `/settings` | `/simbang-gabi` | `/welcome`;
      StaticRoutes: `/` | `/(auth)` | `/(auth)/forgot-password` | `/(auth)/join-church` | `/(auth)/login` | `/(auth)/otp-verify` | `/(auth)/register` | `/(auth)/reset-password` | `/(public)` | `/(public)/` | `/(tabs)` | `/(tabs)/` | `/(tabs)/announcements` | `/(tabs)/calendar` | `/(tabs)/more` | `/(tabs)/parish` | `/(tabs)/schedule` | `/_sitemap` | `/announcements` | `/calendar` | `/community` | `/country-select` | `/donations` | `/donations/history` | `/events` | `/family` | `/forgot-password` | `/holy-week` | `/home` | `/join-church` | `/language-select` | `/login` | `/mass-schedule` | `/more` | `/notifications` | `/novenas` | `/novenas/rosary` | `/otp-verify` | `/parish` | `/parish-info` | `/profile` | `/profile/edit` | `/readings/today` | `/register` | `/reset-password` | `/sacraments` | `/sacraments/request` | `/schedule` | `/settings` | `/simbang-gabi` | `/welcome`;
      DynamicRoutes: `/announcements/${Router.SingleRoutePart<T>}` | `/community/member/${Router.SingleRoutePart<T>}` | `/donations/${Router.SingleRoutePart<T>}` | `/events/${Router.SingleRoutePart<T>}` | `/novenas/${Router.SingleRoutePart<T>}`;
      DynamicRouteTemplate: `/announcements/[id]` | `/community/member/[id]` | `/donations/[id]` | `/events/[id]` | `/novenas/[id]`;
    }
  }
}
