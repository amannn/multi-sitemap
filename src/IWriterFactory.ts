import { IFileStreamWriter, ISitemapWriter, SitemapWriterXml } from './index';
import SitemapWriterFile from './SitemapWriterFile';
import FileStreamWriter from './FileStreamWriter';

export interface IWriterFactory {
  newWriter(): ISitemapWriter;
}

export class XMLWriterFactory implements IWriterFactory {
  constructor(private directory:string,
              private fileStreamWriter?:IFileStreamWriter) {
  }

  newWriter(): SitemapWriterFile {
    return new SitemapWriterXml({
      directory: this.directory,
      fileStreamWriter: this.fileStreamWriter || new FileStreamWriter() });
  }
}
