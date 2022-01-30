import * as path from 'path';
import SitemapWriterFile from './SitemapWriterFile';
import {ISitemapWriterStream} from './types';

export default class SitemapWriterTxt extends SitemapWriterFile {
  public createStream(name: string, isIndex:boolean = false): Promise<ISitemapWriterStream> {
    const filename = name + '.txt';
    const sitemapPath = path.join(this.directory, filename);
    this.fileStreamWriter.open(sitemapPath);
    if( isIndex ) {
      console.log('there is no difference in output regardless  of isIndex');
    }

    const writerStream: ISitemapWriterStream = {
      name,
      filename,

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
