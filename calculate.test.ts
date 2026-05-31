import { describe, it, expect } from 'vitest';
import {
  calculateMacros,
  sumMacros,
  calculateRemaining,
  getProgressPercent,
} from '../calorie-tracker/src/lib/calculate';

const chicken = {
  calories_per_100g: 127,
  protein_per_100g: 21.6,
  carbs_per_100g: 0,
  fat_per_100g: 4.5,
};

const oats = {
  calories_per_100g: 407,
  protein_per_100g: 11.8,
  carbs_per_100g: 68.5,
  fat_per_100g: 9.5,
};

describe('calculateMacros', () => {
  it('calculates correct macros for 100g', () => {
    const result = calculateMacros(chicken, 100);
    expect(result.calories).toBe(127);
    expect(result.protein).toBe(21.6);
    expect(result.carbs).toBe(0);
    expect(result.fat).toBe(4.5);
  });

  it('scales correctly for 250g', () => {
    const result = calculateMacros(chicken, 250);
    expect(result.calories).toBe(317.5);
    expect(result.protein).toBe(54);
    expect(result.carbs).toBe(0);
    expect(result.fat).toBe(11.3);
  });

  it('scales correctly for 80g oats', () => {
    const result = calculateMacros(oats, 80);
    expect(result.calories).toBe(325.6);
    expect(result.protein).toBe(9.4);
    expect(result.carbs).toBe(54.8);
    expect(result.fat).toBe(7.6);
  });

  it('returns zeros for 0g quantity', () => {
    const result = calculateMacros(chicken, 0);
    expect(result.calories).toBe(0);
    expect(result.protein).toBe(0);
    expect(result.carbs).toBe(0);
    expect(result.fat).toBe(0);
  });

  it('handles fractional grams correctly', () => {
    const result = calculateMacros(oats, 37.5);
    expect(result.calories).toBe(152.6);
    expect(result.protein).toBe(4.4);
  });
});

describe('sumMacros', () => {
  it('sums multiple entries correctly', () => {
    const entries = [
      calculateMacros(chicken, 250),
      calculateMacros(oats, 80),
    ];
    const total = sumMacros(entries);
    expect(total.calories).toBe(643.1);
    expect(total.protein).toBe(63.4);
    expect(total.carbs).toBe(54.8);
    expect(total.fat).toBe(18.9);
  });

  it('returns zeros for empty array', () => {
    const total = sumMacros([]);
    expect(total.calories).toBe(0);
    expect(total.protein).toBe(0);
    expect(total.carbs).toBe(0);
    expect(total.fat).toBe(0);
  });

  it('handles single entry', () => {
    const total = sumMacros([calculateMacros(chicken, 100)]);
    expect(total.calories).toBe(127);
  });
});

describe('calculateRemaining', () => {
  const goals = { calories: 2000, protein: 160, carbs: 200, fat: 65 };

  it('calculates remaining correctly when under goal', () => {
    const consumed = { calories: 800, protein: 60, carbs: 80, fat: 25 };
    const remaining = calculateRemaining(goals, consumed);
    expect(remaining.calories).toBe(1200);
    expect(remaining.protein).toBe(100);
    expect(remaining.carbs).toBe(120);
    expect(remaining.fat).toBe(40);
  });

  it('returns negative values when over goal', () => {
    const consumed = { calories: 2200, protein: 180, carbs: 220, fat: 70 };
    const remaining = calculateRemaining(goals, consumed);
    expect(remaining.calories).toBe(-200);
    expect(remaining.protein).toBe(-20);
    expect(remaining.carbs).toBe(-20);
    expect(remaining.fat).toBe(-5);
  });

  it('returns zeros when exactly at goal', () => {
    const remaining = calculateRemaining(goals, goals);
    expect(remaining.calories).toBe(0);
    expect(remaining.protein).toBe(0);
    expect(remaining.carbs).toBe(0);
    expect(remaining.fat).toBe(0);
  });
});

describe('getProgressPercent', () => {
  it('returns correct percentage', () => {
    expect(getProgressPercent(800, 2000)).toBe(40);
    expect(getProgressPercent(2000, 2000)).toBe(100);
    expect(getProgressPercent(0, 2000)).toBe(0);
  });

  it('caps at 100 when over goal', () => {
    expect(getProgressPercent(2500, 2000)).toBe(100);
  });

  it('returns 0 when goal is 0', () => {
    expect(getProgressPercent(500, 0)).toBe(0);
  });
});
