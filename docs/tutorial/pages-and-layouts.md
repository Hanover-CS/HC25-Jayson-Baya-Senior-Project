# Understanding Pages and Routing in Next.js

Next.js uses a file-system-based router, making it easy to set up routes simply by creating files in the `pages` directory.

## Basic Pages and Routes

In Next.js, a "page" is just a React component file (e.g., `.js`, `.jsx`, `.ts`, or `.tsx`) inside the `pages` directory. Each file corresponds to a route based on its name:

- `pages/about.js` → accessible at `/about`

### Root Page

A file named `index` in any directory acts as the root of that directory:

- `pages/index.js` → `/`
- `pages/blog/index.js` → `/blog`

## Nested Routes

To create nested routes, just place files in subdirectories:

- `pages/blog/post1.js` → `/blog/post1`
- `pages/user/profile/settings.js` → `/user/profile/settings`

## Dynamic Routes

Dynamic routing lets you create pages where parts of the URL are variable. In Next.js, square brackets `[param]` represent dynamic segments.

- `pages/posts/[id].js` can handle URLs like `/posts/1`, `/posts/2`, etc.

To learn more, you can check out the Next.js documentation on [Dynamic Routing](https://nextjs.org/docs/routing/dynamic-routes).

---

# Layouts for Reusable Components

Most sites use repeated elements like headers and footers. Next.js makes it easy to set up these layouts using React components.

## Basic Layout Component

A layout component can house shared page elements, such as a navigation bar and footer:

```typescript
// components/Layout.tsx
import Navbar from './Navbar';
import Footer from './Footer';
import { ReactNode } from 'react';

type LayoutProps = {
    children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
    return (
        <>
            <Navbar />
        <main>{children}</main>
        <Footer />
        </>
    );
}
```

## Wrapping Pages with Layout
1. Global Layout: If the layout is the same across the site, wrap your app in pages/_app.js:

``` TypeScript
// pages/_app.tsx
import Layout from '../components/Layout';
import type { AppProps } from 'next/app';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}
```

2. Per-Page Layout: To customize layouts per page, define a getLayout function on individual pages.

``` typescript
// pages/special.tsx
import Layout from '../components/Layout';
import { ReactElement } from 'react';

function SpecialPage() {
  return <div>Special Content Here</div>;
}

SpecialPage.getLayout = function getLayout(page: ReactElement) {
  return (
    <Layout>
      {page}
    </Layout>
  );
}

export default SpecialPage;
```
In _app.tsx, modify to support per-page layouts:

```typescript
// pages/_app.tsx
import type { AppProps } from 'next/app';
import type { ReactElement, ReactNode } from 'react';
import type { NextPage } from 'next';

type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export default function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => page);

  return getLayout(<Component {...pageProps} />);
}
```

---
## Data Fetching in Layouts
To fetch data client-side in a layout, use a library like SWR or useEffect (since getStaticProps and getServerSideProps are only for pages).

```typescript
// components/Layout.tsx
import useSWR from 'swr';
import Navbar from './Navbar';
import Footer from './Footer';
import { ReactNode } from 'react';

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  const { data, error } = useSWR('/api/navigation');

  if (error) return <div>Failed to load</div>;
  if (!data) return <div>Loading...</div>;

  return (
    <>
      <Navbar links={data.links} />
      <main>{children}</main>
      <Footer />
    </>
  );
}
```
---
Previous: **[Pre-requisite](pre-requisite.md)** <br>
Next: **[Dynamic Routes](dynamic-routes.md)**