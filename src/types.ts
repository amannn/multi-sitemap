export interface ISitemapReader {
  hasNext(): boolean;
  getNext(): Promise<SitemapEntryConfig[]>;
}

export interface ISitemapWriter {
  createStream(name: string): Promise<ISitemapWriterStream>;
  [others: string]: any;
}

export interface ISitemapEntry {
  url: string;
  lastModified?: Date;
  changeFrequency?:
    | 'always'
    | 'hourly'
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'yearly'
    | 'never';
  priority?: number;
}

export type SitemapEntryConfig = string | ISitemapEntry;

export interface ISitemapWriterStream {
  name: string;
  filename: string;
  add(entries: SitemapEntryConfig[]): Promise<void>;
  end(): Promise<void>;
  [others: string]: any;
}

export interface IFileStreamWriter {
  open: (filename: string) => void;
  write: (chunk: any) => Promise<void>;
  end: () => Promise<void>;
}
