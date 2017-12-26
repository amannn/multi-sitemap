import * as path from 'path';
import SitemapWriterFile from './SitemapWriterFile';
import {ISitemapEntry, ISitemapWriterStream} from './types';

function formatLastModified(date = new Date()) {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

export default class SitemapWriterXml extends SitemapWriterFile {
  public async createStream(name: string): Promise<ISitemapWriterStream> {
    const filename = path.join(this.directory, `${name}.xml`);
    this.fileStreamWriter.open(filename);

    await this.fileStreamWriter.write('<?xml version="1.0" encoding="UTF-8"?>');
    await this.fileStreamWriter.write('\n');
    await this.fileStreamWriter.write(
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
    );
    await this.fileStreamWriter.write('\n');

    return {
      name,

      add: async entries => {
        for (const entryOrUrl of entries) {
          const entry: ISitemapEntry =
            typeof entryOrUrl === 'string' ? {url: entryOrUrl} : entryOrUrl;

          await this.fileStreamWriter.write(
            [
              '<url>',
              `<loc>${entry.url}</loc>`,
              entry.lastModified &&
                `<lastmod>${formatLastModified(entry.lastModified)}</lastmod>`,
              entry.changeFrequency &&
                `<changefreq>${entry.changeFrequency}</changefreq>`,
              entry.priority && `<changefreq>${entry.priority}</changefreq>`,
              '</url>'
            ]
              .filter(Boolean)
              .join('')
          );

          await this.fileStreamWriter.write('\n');
        }
      },

      end: async () => {
        await this.fileStreamWriter.write('</urlset>');
        await this.fileStreamWriter.end();
      }
    };
  }
}
