import SitemapProcessor from '../SitemapProcessor';
import SitemapReaderMock from './mocks/SitemapReaderMock';
import SitemapWriterMock from './mocks/SitemapWriterMock';

it('can handle a mix of static and dynamic sitemaps', async () => {
  const writer = new SitemapWriterMock();
  const processor = new SitemapProcessor({
    publicHost: 'https://domain.tld',
    maxEntriesPerFile: 2,
    publicDirectory: '/sitemap',
    writer
  });

  const addStaticResult = processor.addStatic({
    name: 'pages',
    entries: ['/', '/about']
  });
  expect(addStaticResult).toBeInstanceOf(Promise);
  await addStaticResult;

  const addDynamicResult = processor.addDynamic({
    name: 'products',
    reader: new SitemapReaderMock({entriesPerChunk: 1})
  });
  expect(addDynamicResult).toBeInstanceOf(Promise);
  await addDynamicResult;

  const addIndexResult = processor.addIndex();
  expect(addIndexResult).toBeInstanceOf(Promise);
  await addIndexResult;

  expect(writer.streams).toEqual({
    index: [
      {url: 'https://domain.tld/sitemap/pages.xml'},
      {url: 'https://domain.tld/sitemap/products-1.xml'},
      {url: 'https://domain.tld/sitemap/products-2.xml'},
      {url: 'https://domain.tld/sitemap/products-3.xml'},
      {url: 'https://domain.tld/sitemap/products-4.xml'}
    ],
    pages: ['https://domain.tld/', 'https://domain.tld/about'],
    'products-1': [
      'https://domain.tld/products/0',
      'https://domain.tld/products/1'
    ],
    'products-2': [
      'https://domain.tld/products/2',
      'https://domain.tld/products/3'
    ],
    'products-3': [
      'https://domain.tld/products/4',
      'https://domain.tld/products/5'
    ],
    'products-4': ['https://domain.tld/products/6']
  });
});
