# Linking and Navigating

In Next.js, the built-in router enables seamless client-side route transitions, 
which means users can navigate between different pages in your application without refreshing the entire page. 
This approach is similar to how a single-page application (SPA) behaves, 
enhancing the user experience with faster load times and smoother navigation.

#### **The Next.js router offers powerful methods and components for linking and navigation:** <br>
1. **Link Component:** The `Link` component is used to create client-side navigation. 
By wrapping a component or text within `<Link href="/path">`, you specify the destination path, 
and Next.js handles the transition, updating the URL without reloading the page. 
It preloads the linked page, ensuring fast navigation when users click the link.

```typescript
import Link from 'next/link';

export default function HomePage() {
  return (
    <Link href="/about">
      <a>About Us</a>
    </Link>
  );
}
```

Note: Any <Link /> in the viewport (initially or through scroll) will be prefetched 
by default (including the corresponding data) for pages using Static Generation. 
The corresponding data for server-rendered routes is fetched only when the <Link /> is clicked.

2. **useRouter Hook:** The `useRouter` hook provides access to the router instance within functional components. 
With `useRouter`, you can programmatically navigate, access route parameters, and detect route changes.

```typescript
import { useRouter } from 'next/router';

export default function HomePage() {
  const router = useRouter();

  const goToAbout = () => {
    router.push('/about');
  };

  return <button onClick={goToAbout}>Go to About</button>;
}
```
3. **Imperative Routing:** 
While the `next/linl` component is typically sufficient for most navigation needs, 
Next.js also supports imperative routing—allowing you to control navigation programmatically without using `<Link>`. 
This approach is ideal when you need to trigger route changes based on user interactions or events, 
such as clicking a button to go to another page or redirecting after form submission.
The `next/router` module provides the `useRouter` hook, which enables imperative navigation. 
By using `useRouter`, you can access the `router` instance directly, 
allowing you to programmatically control navigation through methods like `push`, `replace`, and more.

```typescript
import { useRouter } from 'next/router';

export default function ReadMore() {
  const router = useRouter();

  return (
    <button onClick={() => router.push('/about')}>
      Click here to read more
    </button>
  );
}
```
[<< Dynamic Routes](dynamic-routes.md) | [Conclusion >>](conclusion.md)