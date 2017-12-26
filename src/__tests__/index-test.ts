import {SitemapProcessor, SitemapWriterTxt, SitemapWriterXml} from '../index';

it('exports all relevant modules', () => {
  expect(SitemapProcessor).toBeTruthy();
  expect(SitemapWriterTxt).toBeTruthy();
  expect(SitemapWriterXml).toBeTruthy();
});
