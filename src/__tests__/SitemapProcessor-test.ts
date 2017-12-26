import SitemapProcessor from '../SitemapProcessor';
import SitemapReaderMock from './mocks/SitemapReaderMock';
import SitemapWriterMock from './mocks/SitemapWriterMock';

it('can handle a mix of static and dynamic sitemaps', async () => {
  const writer = new SitemapWriterMock();
  const processor = new SitemapProcessor({writer, maxEntriesPerFile: 2});

  const addStaticResult = processor.addStatic({
    name: 'pages',
    entries: ['/', '/about']
  });
  expect(addStaticResult).toBeInstanceOf(Promise);
  await addStaticResult;

  const addDynamicResult = processor.addDynamic({
    name: 'products',
    reader: new SitemapReaderMock()
  });
  expect(addDynamicResult).toBeInstanceOf(Promise);
  await addDynamicResult;

  const addIndexResult = processor.addIndex();
  expect(addIndexResult).toBeInstanceOf(Promise);
  await addIndexResult;

  expect(writer.streams).toEqual({
    index: [
      {url: './pages'},
      {url: './products-1'},
      {url: './products-2'},
      {url: './products-3'},
      {url: './products'}
    ],
    pages: ['/', '/about'],
    'products-1': ['/products/0', '/products/1'],
    'products-2': ['/products/2', '/products/3'],
    'products-3': ['/products/4', '/products/5'],
    'products-4': ['/products/6']
  });
});
