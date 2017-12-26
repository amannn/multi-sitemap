import {
  ISitemapReader,
  ISitemapWriter,
  ISitemapWriterStream,
  SitemapEntryConfig
} from './types';

export default class SitemapProcessor {
  private writer: ISitemapWriter;
  private sitemaps: string[] = [];
  private maxEntriesPerFile: number;

  constructor({
    writer,
    maxEntriesPerFile = 50000
  }: {
    writer: ISitemapWriter;
    maxEntriesPerFile?: number;
  }) {
    this.writer = writer;
    this.maxEntriesPerFile = maxEntriesPerFile;
  }

  public addDynamic({name, reader}: {name: string; reader: ISitemapReader}) {
    let stream: ISitemapWriterStream | null;
    let curStreamName;
    let curStreamedEntries = 0;
    let curFileIndex = 0;

    return new Promise<void>(async resolve => {
      while (reader.hasNext()) {
        const entries = await reader.getNext();

        if (curStreamedEntries + entries.length > this.maxEntriesPerFile) {
          if (!stream) {
            throw new Error('No opened stream.');
          }
          await stream.end();
          this.sitemaps.push(stream.name);
          stream = null;
        }

        if (!stream) {
          curFileIndex++;
          curStreamedEntries = 0;
          curStreamName = `${name}-${curFileIndex}`;
          stream = await this.writer.createStream(curStreamName);
        }

        curStreamedEntries += entries.length;
        if (stream) await stream.add(entries);
      }

      if (stream) {
        await stream.end();
        this.sitemaps.push(stream.name);
      }
      resolve();
    });
  }

  public async addStatic({
    name,
    entries
  }: {
    name: string;
    entries: SitemapEntryConfig[];
  }) {
    const stream = await this.writer.createStream(name);
    await stream.add(entries);
    await stream.end();
    this.sitemaps.push(name);
  }

  public async addIndex() {
    const stream = await this.writer.createStream('index');
    const entries = this.sitemaps.map(url => ({url: `./${url}`}));
    await stream.add(entries);
    await stream.end();
  }
}
