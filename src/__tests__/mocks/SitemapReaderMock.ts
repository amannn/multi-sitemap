import {ISitemapReader} from '../../types';

export default class SitemapProductsReader implements ISitemapReader {
  public i = 0;

  public hasNext() {
    return this.i < 7;
  }

  public getNext() {
    return Promise.resolve([`/products/${this.i++}`]);
  }
}
