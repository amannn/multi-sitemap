import * as fs from 'fs';
import {IFileStreamWriter} from './types';

export default class FileStreamWriter implements IFileStreamWriter {
  private stream: fs.WriteStream | null;

  public open(filename: string) {
    if (this.stream) throw new Error('Only one stream may be open at a time.');

    this.stream = fs.createWriteStream(filename);
  }

  public write(chunk: any): Promise<void> {
    return new Promise(resolve => {
      if (!this.stream) throw new Error('No stream is opened currently.');

      this.stream.write(chunk, resolve);
    });
  }

  public end(): Promise<void> {
    return new Promise(resolve => {
      if (!this.stream) throw new Error('No stream is opened currently.');

      this.stream.end(() => {
        resolve();
        this.stream = null;
      });
    });
  }
}
