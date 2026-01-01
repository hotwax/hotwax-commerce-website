import { test, expect } from '@playwright/test';
import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';

/**
 * Sanity test to check for 404 errors on hotwax.co
 */
test.describe('HotWax.co Sanity Test', () => {
  let urls: string[] = [
    '/',
    '/blog',
    '/podcast',
    '/whitepaper',
    '/product-updates',
    '/omnichannel-order-management-system',
    '/netsuite-shopify-integration',
  ];

  test.beforeAll(async () => {
    try {
      console.log('Fetching sitemap for comprehensive testing...');
      const response = await axios.get('https://www.hotwax.co/sitemap.xml');
      const parser = new XMLParser();
      const jsonObj = parser.parse(response.data);
      
      if (jsonObj.urlset && jsonObj.urlset.url) {
        const sitemapUrls = jsonObj.urlset.url
          .map((u: any) => u.loc)
          .filter((url: string) => url && url.startsWith('http'));
        
        // Add a sample of URLs from the sitemap to avoid running thousands of tests
        // but still getting broad coverage
        const sampleSize = 20;
        const sampledUrls = sitemapUrls
          .sort(() => 0.5 - Math.random())
          .slice(0, sampleSize);
        
        urls = Array.from(new Set([...urls, ...sampledUrls]));
        console.log(`Added ${sampledUrls.length} URLs from sitemap. Total URLs to test: ${urls.length}`);
      }
    } catch (error) {
      console.error('Failed to fetch or parse sitemap, falling back to core URLs:', error.message);
    }
  });

  // Dynamically create tests for each URL
  for (const url of urls) {
    const formattedUrl = url.startsWith('http') ? url : `https://www.hotwax.co${url}`;
    
    test(`Check page: ${formattedUrl}`, async ({ page }) => {
      console.log(`Testing: ${formattedUrl}`);
      
      const response = await page.goto(formattedUrl, { waitUntil: 'domcontentloaded' });
      
      // Check status code (should not be 404)
      if (response) {
        expect(response.status(), `Page ${formattedUrl} returned status ${response.status()}`).not.toBe(404);
      }
      
      // Check for 404 text on the page (additional safety)
      const content = await page.content();
      const is404Page = content.includes('404') && 
                       (content.toLowerCase().includes('page not found') || 
                        content.toLowerCase().includes('not found'));
      
      expect(is404Page, `Page ${formattedUrl} appears to be a 404 error page based on content`).toBe(false);
      
      // Ensure the body is visible
      await expect(page.locator('body')).toBeVisible();
    });
  }
});
