import SitemapProcessor from '../SitemapProcessor';
import SitemapReaderMock from './mocks/SitemapReaderMock';
import SitemapWriterMock from './mocks/SitemapWriterMock';
import { IWriterFactory, XMLWriterFactory } from '../IWriterFactory';
import { ISitemapWriter } from '../types';
import * as os from 'os';
import * as fs from 'fs';

it('can handle a mix of static and dynamic sitemaps', async () => {
  const now = new Date();
  const writer = new SitemapWriterMock();
  const writerFactory: IWriterFactory = {
    newWriter(): ISitemapWriter {
      return writer;
    }
  }
  const processor = new SitemapProcessor({
    publicHost: 'https://domain.tld',
    maxEntriesPerFile: 2,
    publicDirectory: '/sitemap',
    writerFactory
  });

  const addStaticResult = processor.addStatic({
    name: 'pages',
    entries: [ '/', '/about' ]
  });
  expect(addStaticResult).toBeInstanceOf(Promise);
  await addStaticResult;

  const addDynamicResult = processor.addDynamic({
    name: 'products',
    reader: new SitemapReaderMock({ entriesPerChunk: 1 })
  });
  expect(addDynamicResult).toBeInstanceOf(Promise);
  await addDynamicResult;

  const addIndexResult = processor.addIndex({ lastModified: now });
  expect(addIndexResult).toBeInstanceOf(Promise);
  await addIndexResult;

  expect(writer.streams).toEqual({
    index: [
      {
        url: 'https://domain.tld/sitemap/pages.xml',
        lastModified: now
      },
      {
        url: 'https://domain.tld/sitemap/products-1.xml',
        lastModified: now
      },
      {
        url: 'https://domain.tld/sitemap/products-2.xml',
        lastModified: now
      },
      {
        url: 'https://domain.tld/sitemap/products-3.xml',
        lastModified: now
      },
      {
        url: 'https://domain.tld/sitemap/products-4.xml',
        lastModified: now
      }
    ],
    pages: [ 'https://domain.tld/', 'https://domain.tld/about' ],
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
    'products-4': [ 'https://domain.tld/products/6' ]
  });
});


it('support parallel sitemap builds', async () => {
  const now = new Date();
  const tempDir = fs.mkdtempSync(os.tmpdir());
  const writerFactory: IWriterFactory = new XMLWriterFactory(tempDir);
  const processor = new SitemapProcessor({
    publicHost: 'https://domain.tld',
    maxEntriesPerFile: 2,
    publicDirectory: '/sitemap',
    writerFactory
  });

  const processors = [];
  processors.push(processor.addStatic({
    name: 'pages',
    entries: [ '/', '/about' ]
  }));

  processors.push(processor.addDynamic({
    name: 'product',
    reader: new SitemapReaderMock({ entriesPerChunk: 1 })
  }));

  processors.push(processor.addDynamic({
    name: 'category',
    reader: new SitemapReaderMock({ entriesPerChunk: 1 })
  }));

  await Promise.all(processors);

  await processor.addIndex({ lastModified: now });

  const files = fs.readdirSync(tempDir)

  expect(files.sort()).toEqual([ 'product-1.xml',
    'product-2.xml',
    'product-3.xml',
    'product-4.xml',
    'category-1.xml',
    'category-2.xml',
    'category-3.xml',
    'category-4.xml',
    'pages.xml',
    'index.xml'
  ].sort());

  files.forEach(file => fs.unlinkSync(tempDir + '/' + file));
  fs.rmdirSync(tempDir);
});
