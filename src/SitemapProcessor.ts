import {
  ISitemapReader,
  ISitemapWriterStream,
  SitemapEntryConfig
} from './types';
import { IWriterFactory } from './IWriterFactory';

export default class SitemapProcessor {
  private publicHost: string;
  private maxEntriesPerFile: number;
  private publicDirectory: string;
  private sitemapFilenames: string[] = [];
  private writerFactory:  IWriterFactory;

  constructor({
    publicHost,
    maxEntriesPerFile = 50000,
    publicDirectory,
    writerFactory
  }: {
    publicHost: string;
    maxEntriesPerFile?: number;
    publicDirectory: string;
    writerFactory: IWriterFactory;
  }) {
    // Normalize `publicHost`
    if (publicHost.endsWith('/')) {
      publicHost = publicHost.slice(0, publicHost.length - 1);
    }
    if (!publicHost.startsWith('http')) publicHost = `http://${publicHost}`;
    this.publicHost = publicHost;

    this.maxEntriesPerFile = maxEntriesPerFile;

    // Normalize `publicDirectory`
    if (publicDirectory.endsWith('/')) {
      publicDirectory = publicDirectory.slice(0, publicDirectory.length - 1);
    }
    this.publicDirectory = publicDirectory;

    this.writerFactory = writerFactory;
  }

  public addDynamic({name, reader}: {name: string; reader: ISitemapReader}) {
    let stream: ISitemapWriterStream | null;
    let curStreamName;
    let curStreamedEntries = 0;
    let curFileIndex = 0;

    return new Promise<void>(async resolve => {
      while (reader.hasNext()) {
        const entries = await reader.getNext();

        if (entries.length > this.maxEntriesPerFile) {
          throw new Error(
            "The reader shouldn't return more entries than a single sitemap should contain."
          );
        }

        if (curStreamedEntries + entries.length > this.maxEntriesPerFile) {
          if (!stream) throw new Error('No opened stream.');
          await stream.end();
          this.sitemapFilenames.push(stream.filename);
          stream = null;
        }

        if (!stream) {
          curFileIndex++;
          curStreamedEntries = 0;
          curStreamName = `${name}-${curFileIndex}`;
          const writer = this.writerFactory.newWriter();
          stream = await writer.createStream(curStreamName, false);
        }

        curStreamedEntries += entries.length;
        if (stream) await stream.add(this.mapEntriesToFullUrls(entries));
      }

      if (stream) {
        await stream.end();
        this.sitemapFilenames.push(stream.filename);
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
    const writer = this.writerFactory.newWriter();
    const stream = await writer.createStream(name, false);
    await stream.add(this.mapEntriesToFullUrls(entries));
    await stream.end();
    this.sitemapFilenames.push(stream.filename);
  }

  public async addIndex({lastModified} = {lastModified: new Date()}) {
    const writer = this.writerFactory.newWriter();
    const stream = await writer.createStream('index', true);
    const entries = this.sitemapFilenames.map(filename => ({
      url: `${this.publicDirectory}/${filename}`,
      lastModified
    }));
    await stream.add(this.mapEntriesToFullUrls(entries));
    await stream.end();
  }

  private mapEntriesToFullUrls(entries: SitemapEntryConfig[]) {
    return entries.map(entryConfig => {
      let url = typeof entryConfig === 'string' ? entryConfig : entryConfig.url;
      if (!url.startsWith('http')) {
        if (!url.startsWith('/')) url = '/' + url;
        url = this.publicHost + url;
      }
      if (typeof entryConfig === 'string') {
        return url;
      } else {
        return {...entryConfig, url};
      }
    });
  }
}
