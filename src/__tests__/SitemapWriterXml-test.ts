jest.mock('mkdirp', () => ({
  default: {
    sync() {}
  }
}));

jest.mock('path', () => ({
  default: {
    join(...parts: string[]) {
      return parts.join('');
    }
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
  let stream = await writer.createStream('first');
  await stream.add(['/', '/foo']);
  await stream.add([{url: '/bar', lastModified: new Date(2017, 12, 26)}]);
  await stream.end();

  stream = await writer.createStream('second');
  await stream.add(['/foobar']);
  await stream.end();

  expect(fileStreamWriter.chunks).toEqual([
    '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    '<url><loc>/</loc></url>',
    '\n',
    '<url><loc>/foo</loc></url>',
    '\n',
    '<url><loc>/bar</loc><lastmod>2018-1-26</lastmod></url>',
    '\n',
    '</urlset>',
    '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    '<url><loc>/foobar</loc></url>',
    '\n',
    '</urlset>'
  ]);
});
