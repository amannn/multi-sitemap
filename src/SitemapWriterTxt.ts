import * as path from 'path';
import SitemapWriterFile from './SitemapWriterFile';
import {ISitemapWriterStream} from './types';

export default class SitemapWriterTxt extends SitemapWriterFile {
  public createStream(name: string): Promise<ISitemapWriterStream> {
    const filename = path.join(this.directory, `${name}.txt`);
    this.fileStreamWriter.open(filename);

    const writerStream: ISitemapWriterStream = {
      name,

      add: async entries => {
        for (const entryOrUrl of entries) {
          const url =
            typeof entryOrUrl === 'string' ? entryOrUrl : entryOrUrl.url;
          await this.fileStreamWriter.write(url);
          await this.fileStreamWriter.write('\n');
        }
      },

      end: async () => {
        await this.fileStreamWriter.end();
      }
    };

    return Promise.resolve(writerStream);
  }
}
