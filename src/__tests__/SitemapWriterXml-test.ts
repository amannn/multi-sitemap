jest.mock('mkdirp', () => ({
  sync() {}
}));

jest.mock('path', () => ({
  join(...parts: string[]) {
    return parts.join('');
  }
}));

import SitemapWriterXml from '../SitemapWriterXml';
import FileStreamWriterMock from './mocks/FileStreamWriterMock';

it('builds a valid XML file', async () => {
  const fileStreamWriter = new FileStreamWriterMock();
  const writer = new SitemapWriterXml({
    directory: './tmp',
    fileStreamWriter
  });
  let stream = await writer.createStream('/first');
  await stream.add(['/', '/foo']);
  await stream.add([{url: '/bar', lastModified: new Date(2018, 0, 14)}]);
  await stream.end();

  stream = await writer.createStream('/second');
  await stream.add(['/foobar']);
  await stream.end();

  expect(fileStreamWriter.chunksByName).toEqual({
    './tmp/first.xml': [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '\n',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      '\n',
      '<url><loc>/</loc></url>',
      '\n',
      '<url><loc>/foo</loc></url>',
      '\n',
      '<url><loc>/bar</loc><lastmod>2018-01-14</lastmod></url>',
      '\n',
      '</urlset>'
    ],
    './tmp/second.xml': [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '\n',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      '\n',
      '<url><loc>/foobar</loc></url>',
      '\n',
      '</urlset>'
    ]
  });
});

it('supports special index syntax', async () => {
  const fileStreamWriter = new FileStreamWriterMock();
  const writer = new SitemapWriterXml({
    directory: './tmp',
    fileStreamWriter
  });
  const stream = await writer.createStream('/first', true);
  await stream.add(['/', '/foo']);
  await stream.add([{url: '/bar', lastModified: new Date(2018, 0, 14)}]);
  await stream.add([{url: '/baz', priority: 1}]);
  await stream.add([{url: '/bag', changeFrequency: "daily"}]);
  await stream.end();

  expect(fileStreamWriter.chunksByName).toEqual({
    './tmp/first.xml': [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '\n',
      '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      '\n',
      '<sitemap><loc>/</loc></sitemap>',
      '\n',
      '<sitemap><loc>/foo</loc></sitemap>',
      '\n',
      '<sitemap><loc>/bar</loc><lastmod>2018-01-14</lastmod></sitemap>',
      '\n',
      '<sitemap><loc>/baz</loc><priority>1</priority></sitemap>',
      '\n',
      '<sitemap><loc>/bag</loc><changefreq>daily</changefreq></sitemap>',
      '\n',
      '</sitemapindex>'
    ]
  });
});
