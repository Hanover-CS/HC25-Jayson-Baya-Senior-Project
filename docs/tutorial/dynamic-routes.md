# Dynamic Routes in Next.js

Dynamic routes allow you to create pages where part of the URL can vary based on data, such as user-generated content. With dynamic segments, you can build routes based on parameters that are either requested dynamically or prerendered at build time.

## Convention for Dynamic Segments

To create a dynamic route, wrap a file or folder name in square brackets: `[segmentName]`. This structure lets you define routes with variable parameters, like `[id]` or `[slug]`.

Dynamic segments can be accessed using the `useRouter` hook.

### Example

For instance, a blog might use a dynamic route `pages/blog/[slug].tsx`, where `[slug]` is the variable part of the route for different blog posts:

```typescript
// pages/blog/[slug].tsx
import { useRouter } from 'next/router';
 
export default function Page() {
  const router = useRouter();
  return <p>Post: {router.query.slug}</p>;
}
```

| Route                    | Example URL | Params           |
|--------------------------|-------------|------------------|
| `pages/blog/[slug].tsx`  | `/blog/a`   | `{ slug: 'a' }` |
| `pages/blog/[slug].tsx`  | `/blog/b`   | `{ slug: 'b' }` |
| `pages/blog/[slug].tsx`  | `/blog/c`   | `{ slug: 'c' }` |

----

## Catch-all Segments
Catch-all segments can capture multiple parts of the URL by adding an ellipsis (...) inside the brackets, like [...segmentName]. This type of segment can handle routes of varying depths.

For example, pages/shop/[...slug].tsx can match /shop/clothes, /shop/clothes/tops, or even /shop/clothes/tops/t-shirts.

| Route                     | Example URL   | Params                  |
|---------------------------|---------------|-------------------------|
| `pages/shop/[...slug].js` | `/shop/a`     | `{ slug: ['a'] }`       |
| `pages/shop/[...slug].js` | `/shop/a/b`   | `{ slug: ['a', 'b'] }`  |
| `pages/shop/[...slug].js` | `/shop/a/b/c` | `{ slug: ['a', 'b', 'c'] }` |

----

### Next Steps
For more details, consider exploring these topics:

**[Linking and Navigating](linking-and-navigating.md):** Learn about using the Link component and useRouter hook to navigate in Next.js. <br>
**[useRouter:](useRouter.md)** Access the Next.js Router instance within a page using the useRouter hook.

Previous: **[Pages and Layouts](pages-and-layouts.md)** <br>
Next: **[Linking and Navigating](linking-and-navigating.md)**