import * as path from 'path';
import SitemapWriterFile from './SitemapWriterFile';
import {ISitemapEntry, ISitemapWriterStream} from './types';

function formatLastModified(date = new Date()) {
  let month = (date.getMonth() + 1).toString();
  if (month.length < 2) month = '0' + month;

  let day = date.getDate().toString();
  if (day.length < 2) day = '0' + day;

  return `${date.getFullYear()}-${month}-${day}`;
}

export default class SitemapWriterXml extends SitemapWriterFile {
  public async createStream(
    name: string,
    isIndex: boolean = false
  ): Promise<ISitemapWriterStream> {
    const filename = name + '.xml';
    const sitemapPath = path.join(this.directory, filename);
    this.fileStreamWriter.open(sitemapPath);

    await this.fileStreamWriter.write('<?xml version="1.0" encoding="UTF-8"?>');
    await this.fileStreamWriter.write('\n');
    await this.fileStreamWriter.write(
      isIndex
        ? '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
        : '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
    );
    await this.fileStreamWriter.write('\n');

    return {
      name,
      filename,

      add: async entries => {
        for (const entryOrUrl of entries) {
          const entry: ISitemapEntry =
            typeof entryOrUrl === 'string' ? {url: entryOrUrl} : entryOrUrl;

          await this.fileStreamWriter.write(
            [
              isIndex ? '<sitemap>' : '<url>',
              `<loc>${entry.url}</loc>`,
              entry.lastModified &&
                `<lastmod>${formatLastModified(entry.lastModified)}</lastmod>`,
              entry.changeFrequency &&
                `<changefreq>${entry.changeFrequency}</changefreq>`,
              entry.priority && `<priority>${entry.priority}</priority>`,
              isIndex ? '</sitemap>' : '</url>'
            ]
              .filter(Boolean)
              .join('')
          );

          await this.fileStreamWriter.write('\n');
        }
      },

      end: async () => {
        await this.fileStreamWriter.write(
          isIndex ? '</sitemapindex>' : '</urlset>'
        );
        await this.fileStreamWriter.end();
      }
    };
  }
}
