import mkdirp from 'mkdirp';
import FileStreamWriter from './FileStreamWriter';
import {IFileStreamWriter, ISitemapWriter, ISitemapWriterStream} from './types';

export default abstract class SitemapWriterFile implements ISitemapWriter {
  protected directory: string;
  protected fileStreamWriter: IFileStreamWriter;

  constructor({
    directory,
    fileStreamWriter
  }: {
    directory: string;
    fileStreamWriter?: IFileStreamWriter;
  }) {
    this.directory = directory;
    this.fileStreamWriter = fileStreamWriter || new FileStreamWriter();

    mkdirp.sync(directory);
  }

  public abstract createStream(name: string): Promise<ISitemapWriterStream>;
}
