# multi-sitemap

Painless creation of large dynamic sitemaps that consist of multiple files.

## Features
 - Supports generating sitemaps from **dynamic data**: e.g. generating a sitemap for all entities in a paginated REST endpoint.
 - Automatically splits sitemaps into **chunks of 50k** entries to comply to the [Google guidelines](https://support.google.com/webmasters/answer/183668#sitemapformat).
 - Pluggable writers: Use `SitemapWriterXml`, `SitemapWriterTxt` or build your own (e.g. create a sitemap at a remote static file host).
 - Utilizes **streams**, so large amounts of data can be processed without memory issues.
 - Built with **TypeScript** so consumers can take advantage of types.

## Usage

```js
import {SitemapProcessor, SitemapWriterXml} from 'multi-sitemap';

(async () => {
  const processor = new SitemapProcessor({
    // The domain where the sitemap is hosted. A sitemap is
    // required to include a full URL including the host.
    publicHost: 'https://domain.tld',

    // The public path on the host where the sitemap can be
    // found. This will be concatenated with `publicHost`.
    publicDirectory: '/sitemap',

    // One of the pluggable writers.
    writer: new SitemapWriterXml({directory: './static/sitemap'});
  });

  await processor.addStatic({
    name: 'pages',
    entries: ['/', '/about']
  });

  await processor.addDynamic({
    name: 'products',
    reader: new SitemapProductsReader()
  });

  await processor.addIndex();
})();
```

All methods of `SitemapProcessor` return promises that should be waited for before calling other methods. The `addIndex` method should be called last, as this is the time the processor knows about all child sitemaps.

## Adding dynamic data

Create a reader class that implements the following interface:

```ts
interface ISitemapReader {
  hasNext(): boolean;
  getNext(): Promise<SitemapEntryConfig[]>;
}

// Given the following types:

type SitemapEntryConfig = /* url */ string | ISitemapEntry;

interface ISitemapEntry {
  url: string;
  lastModified?: Date;
  changeFrequency?:
    | 'always'
    | 'hourly'
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'yearly'
    | 'never';
  priority?: number;
}
```

An instance of such a class can be passed to the sitemap processor. An example would be:

```js
/**
 * Fetches 7 pages of products, each consisting
 * of 20 entities that are written to a sitemap.
 */
class SitemapProductsReader {
  i = 0;

  hasNext() {
    return this.i < 7;
  }

  getNext() {
    const size = 20;
    const offset = this.i * size;

    this.i++;

    return fetch(`/api/products?offset=${offset}&size=${size}`)
      .then(products => products.map(product => `/products/${product.id}`))
  }
}

processor.addDynamic({
  name: 'products',
  reader: new SitemapProductsReader()
});
```
