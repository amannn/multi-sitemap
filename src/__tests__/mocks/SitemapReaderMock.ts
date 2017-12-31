import {ISitemapReader} from '../../types';

export default class SitemapProductsReader implements ISitemapReader {
  public i = 0;
  private entriesPerChunk: number;

  constructor({entriesPerChunk = 1}: {entriesPerChunk: number}) {
    this.entriesPerChunk = entriesPerChunk;
  }

  public hasNext() {
    return this.i < 7;
  }

  public getNext() {
    const entries = [];
    const limit = this.i + this.entriesPerChunk;

    for (; this.i < limit; this.i++) {
      entries.push(`/products/${this.i}`);
    }

    return Promise.resolve(entries);
  }
}
