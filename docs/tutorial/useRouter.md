# Using `useRouter` in Next.js

The `useRouter` hook in Next.js allows you to access the router object inside any functional component.

## Basic Example of `useRouter`

```typescript
import { useRouter } from 'next/router';
 
function ActiveLink({ children, href }) {
  const router = useRouter();
  const style = {
    marginRight: 10,
    color: router.asPath === href ? 'red' : 'black',
  };
 
  const handleClick = (e) => {
    e.preventDefault();
    router.push(href);
  };
 
  return (
    <a href={href} onClick={handleClick} style={style}>
      {children}
    </a>
  );
}
 
export default ActiveLink;
```
**Note:** useRouter is a React Hook, so it cannot be used in class components.

## The `router` Object

The `router` object contains various properties and methods. Here's a breakdown of the key properties:

| Property       | Description                                                                                                     |
|----------------|-----------------------------------------------------------------------------------------------------------------|
| `pathname`     | Path for the current route file after `/pages`. Excludes `basePath`, `locale`, and `trailingSlash`.             |
| `query`        | Parsed query string as an object, including dynamic route parameters.                                           |
| `asPath`       | URL shown in the browser, including search params, respects `trailingSlash`. Excludes `basePath` and `locale`.  |
| `isFallback`   | Boolean indicating if the current page is in fallback mode.                                                     |
| `basePath`     | The active base path if enabled.                                                                                |
| `locale`       | The active locale if enabled.                                                                                   |
| `locales`      | Array of all supported locales if enabled.                                                                      |
| `defaultLocale`| The default locale if enabled.                                                                                  |
| `domainLocales`| Array of configured domain locales.                                                                             |
| `isReady`      | Boolean indicating if router fields are updated client-side and ready for use.                                  |
| `isPreview`    | Boolean indicating if the app is in preview mode.                                                               |

> **Note:** Using `asPath` may lead to a mismatch between client and server if using server-side rendering.
