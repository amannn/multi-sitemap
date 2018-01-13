import {
  ISitemapWriter,
  ISitemapWriterStream,
  SitemapEntryConfig
} from '../../types';

export default class SitemapWriterMock implements ISitemapWriter {
  public streams: {[key: string]: SitemapEntryConfig[]} = {};

  public createStream(name: string): Promise<ISitemapWriterStream> {
    const stream: ISitemapWriterStream = {
      entries: [],
      name,
      filename: `${name}.xml`,

      add: (entries: SitemapEntryConfig[]) => {
        this.streams[name].push(...entries);
        return Promise.resolve();
      },

      end: () => Promise.resolve()
    };

    this.streams[name] = [];

    return Promise.resolve(stream);
  }
}
