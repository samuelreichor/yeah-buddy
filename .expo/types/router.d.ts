/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string | object = string> {
      hrefInputParams: { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/`; params?: Router.UnknownInputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; } | { pathname: `/ingredients`; params?: Router.UnknownInputParams; } | { pathname: `/meals`; params?: Router.UnknownInputParams; } | { pathname: `/settings`; params?: Router.UnknownInputParams; } | { pathname: `/ingredients/[ingredientId]`, params: Router.UnknownInputParams & { ingredientId: string | number; } } | { pathname: `/meals/[mealId]`, params: Router.UnknownInputParams & { mealId: string | number; } };
      hrefOutputParams: { pathname: Router.RelativePathString, params?: Router.UnknownOutputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownOutputParams } | { pathname: `/`; params?: Router.UnknownOutputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownOutputParams; } | { pathname: `/ingredients`; params?: Router.UnknownOutputParams; } | { pathname: `/meals`; params?: Router.UnknownOutputParams; } | { pathname: `/settings`; params?: Router.UnknownOutputParams; } | { pathname: `/ingredients/[ingredientId]`, params: Router.UnknownOutputParams & { ingredientId: string; } } | { pathname: `/meals/[mealId]`, params: Router.UnknownOutputParams & { mealId: string; } };
      href: Router.RelativePathString | Router.ExternalPathString | `/${`?${string}` | `#${string}` | ''}` | `/_sitemap${`?${string}` | `#${string}` | ''}` | `/ingredients${`?${string}` | `#${string}` | ''}` | `/meals${`?${string}` | `#${string}` | ''}` | `/settings${`?${string}` | `#${string}` | ''}` | { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/`; params?: Router.UnknownInputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; } | { pathname: `/ingredients`; params?: Router.UnknownInputParams; } | { pathname: `/meals`; params?: Router.UnknownInputParams; } | { pathname: `/settings`; params?: Router.UnknownInputParams; } | `/ingredients/${Router.SingleRoutePart<T>}` | `/meals/${Router.SingleRoutePart<T>}` | { pathname: `/ingredients/[ingredientId]`, params: Router.UnknownInputParams & { ingredientId: string | number; } } | { pathname: `/meals/[mealId]`, params: Router.UnknownInputParams & { mealId: string | number; } };
    }
  }
}
