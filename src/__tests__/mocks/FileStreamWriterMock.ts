import {IFileStreamWriter} from '../../types';

export default class FileStreamWriterMock implements IFileStreamWriter {
  public chunksByName: {[filename: string]: any[]} = {};
  private stream: string | null = null;

  public open(filename: string) {
    if (this.stream) throw new Error('Only one stream may be open at a time.');

    this.stream = filename;
    this.chunksByName[filename] = [];
  }

  public write(chunk: any): Promise<void> {
    if (!this.stream) throw new Error('No stream is opened currently.');

    this.chunksByName[this.stream].push(chunk);

    return new Promise(resolve => setTimeout(resolve, 0));
  }

  public end(): Promise<void> {
    if (!this.stream) throw new Error('No stream is opened currently.');

    this.stream = null;
    return new Promise(resolve => setTimeout(resolve, 0));
  }
}
