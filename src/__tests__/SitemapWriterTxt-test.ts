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

import SitemapWriterTxt from '../SitemapWriterTxt';
import FileStreamWriterMock from './mocks/FileStreamWriterMock';

it('writes a list of URLs', async () => {
  const fileStreamWriter = new FileStreamWriterMock();
  const writer = new SitemapWriterTxt({
    directory: './tmp',
    fileStreamWriter
  });
  let stream = await writer.createStream('first');
  await stream.add(['/', '/foo']);
  await stream.add(['/bar']);
  await stream.end();

  stream = await writer.createStream('second');
  await stream.add(['/foobar']);
  await stream.end();

  expect(fileStreamWriter.chunks).toEqual([
    '/',
    '\n',
    '/foo',
    '\n',
    '/bar',
    '\n',
    '/foobar',
    '\n'
  ]);
});
