import { describe, it, expect, beforeAll } from 'vitest';
import { getAnalyticsData } from './events';
import { getDb } from './db';

describe('Analytics', () => {
  beforeAll(async () => {
    // Ensure database connection is available
    const db = await getDb();
    expect(db).toBeTruthy();
  });

  it('should return analytics data structure', async () => {
    const data = await getAnalyticsData();
    
    expect(data).toBeTruthy();
    expect(data).toHaveProperty('overview');
    expect(data).toHaveProperty('trafficSources');
    expect(data).toHaveProperty('popularIngredients');
    expect(data).toHaveProperty('languages');
    expect(data).toHaveProperty('dailyVisitors');
  });

  it('should have valid overview metrics', async () => {
    const data = await getAnalyticsData();
    
    if (data) {
      expect(data.overview).toHaveProperty('totalSessions');
      expect(data.overview).toHaveProperty('anonymousSessions');
      expect(data.overview).toHaveProperty('authenticatedSessions');
      expect(data.overview).toHaveProperty('conversionRate');
      expect(data.overview).toHaveProperty('avgSessionDuration');
      expect(data.overview).toHaveProperty('totalEvents');
      
      // Validate types
      expect(typeof data.overview.totalSessions).toBe('number');
      expect(typeof data.overview.conversionRate).toBe('number');
      expect(typeof data.overview.avgSessionDuration).toBe('number');
      expect(typeof data.overview.totalEvents).toBe('number');
      
      // Validate ranges
      expect(data.overview.totalSessions).toBeGreaterThanOrEqual(0);
      expect(data.overview.conversionRate).toBeGreaterThanOrEqual(0);
      expect(data.overview.conversionRate).toBeLessThanOrEqual(100);
      expect(data.overview.avgSessionDuration).toBeGreaterThanOrEqual(0);
    }
  });

  it('should return traffic sources array', async () => {
    const data = await getAnalyticsData();
    
    if (data) {
      expect(Array.isArray(data.trafficSources)).toBe(true);
      
      // If there are traffic sources, validate structure
      if (data.trafficSources.length > 0) {
        const source = data.trafficSources[0];
        expect(source).toHaveProperty('source');
        expect(source).toHaveProperty('count');
        expect(typeof source.source).toBe('string');
        expect(typeof source.count).toBe('number');
      }
    }
  });

  it('should return popular ingredients array', async () => {
    const data = await getAnalyticsData();
    
    if (data) {
      expect(Array.isArray(data.popularIngredients)).toBe(true);
      
      // If there are ingredients, validate structure
      if (data.popularIngredients.length > 0) {
        const ingredient = data.popularIngredients[0];
        expect(ingredient).toHaveProperty('name');
        expect(ingredient).toHaveProperty('count');
        expect(typeof ingredient.name).toBe('string');
        expect(typeof ingredient.count).toBe('number');
        
        // Should be sorted by count descending
        if (data.popularIngredients.length > 1) {
          expect(data.popularIngredients[0].count).toBeGreaterThanOrEqual(
            data.popularIngredients[1].count
          );
        }
      }
    }
  });

  it('should return language distribution array', async () => {
    const data = await getAnalyticsData();
    
    if (data) {
      expect(Array.isArray(data.languages)).toBe(true);
      
      // If there are languages, validate structure
      if (data.languages.length > 0) {
        const lang = data.languages[0];
        expect(lang).toHaveProperty('language');
        expect(lang).toHaveProperty('count');
        expect(typeof lang.language).toBe('string');
        expect(typeof lang.count).toBe('number');
      }
    }
  });

  it('should return daily visitors array', async () => {
    const data = await getAnalyticsData();
    
    if (data) {
      expect(Array.isArray(data.dailyVisitors)).toBe(true);
      
      // If there are daily visitors, validate structure
      if (data.dailyVisitors.length > 0) {
        const day = data.dailyVisitors[0];
        expect(day).toHaveProperty('date');
        expect(day).toHaveProperty('count');
        expect(typeof day.date).toBe('string');
        expect(typeof day.count).toBe('number');
        
        // Date should be in ISO format (YYYY-MM-DD)
        expect(day.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        
        // Should be sorted by date ascending
        if (data.dailyVisitors.length > 1) {
          expect(data.dailyVisitors[0].date <= data.dailyVisitors[1].date).toBe(true);
        }
      }
    }
  });

  it('should calculate conversion rate correctly', async () => {
    const data = await getAnalyticsData();
    
    if (data && data.overview.totalSessions > 0) {
      // Conversion rate should be between 0 and 100
      expect(data.overview.conversionRate).toBeGreaterThanOrEqual(0);
      expect(data.overview.conversionRate).toBeLessThanOrEqual(100);
      
      // Should be a reasonable decimal (max 1 decimal place based on implementation)
      const decimalPlaces = (data.overview.conversionRate.toString().split('.')[1] || '').length;
      expect(decimalPlaces).toBeLessThanOrEqual(1);
    }
  });

  it('should sum anonymous and authenticated sessions to total', async () => {
    const data = await getAnalyticsData();
    
    if (data) {
      const sum = data.overview.anonymousSessions + data.overview.authenticatedSessions;
      expect(sum).toBe(data.overview.totalSessions);
    }
  });
});
