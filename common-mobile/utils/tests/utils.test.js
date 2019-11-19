/**
 * Tests for ageFromDob utility method
 */

// Vendor
import expect from 'expect';

// Application
import Utils from '../utils';

describe('utils - `decimalPlaces`', () => {
    const { decimalPlaces } = Utils;
    it('returns 0 for 1', () => {
        expect(decimalPlaces(1)).toEqual(0);
    });
    it('returns 0 for "1"', () => {
        expect(decimalPlaces('1')).toEqual(0);
    });
    it('returns 0 for -1', () => {
        expect(decimalPlaces(-1)).toEqual(0);
    });
    it('returns 0 for null', () => {
        expect(decimalPlaces(null)).toEqual(0);
    });
});

describe('utils - `isGEZero`', () => {
    const { isGEZero } = Utils;
    it('returns true for 1', () => {
        expect(isGEZero(1)).toBeTruthy();
    });
    it('returns true for 0', () => {
        expect(isGEZero(0)).toBeTruthy();
    });
    it('returns false for -1', () => {
        expect(isGEZero(-1)).toBeFalsy();
    });
    it('returns false for null', () => {
        expect(isGEZero(null)).toBeFalsy();
    });
});
describe('utils - `fieldShouldShowError`', () => {
    const { fieldShouldShowError } = Utils;
    const errors = {
        'currency': 'Please choose a currency',
        'contractValue': 'Please specify your contract value',
    };
    const touched = { currency: true, contractValue: true };
    const touchPath = 'currency';
    const path = 'currency';
    it('returns falsy for no errors', () => {
        expect(fieldShouldShowError(null, touched, path, touchPath)).toBeFalsy();
    });
    it('returns falsy for no touched', () => {
        expect(fieldShouldShowError(errors, 'test', 'currency', touchPath)).toBeFalsy();
    });
    it('returns falsy for incorrect touch path', () => {
        expect(fieldShouldShowError(errors, touched, 'currency', 'test')).toBeFalsy();
    });
    it('returns truthy when reverting back to path', () => {
        expect(fieldShouldShowError(errors, touched, 'currency', null)).toBeTruthy();
    });
    it('returns truthy when using a touch path', () => {
        expect(fieldShouldShowError(errors, touched, 'currency', 'contractValue')).toBeTruthy();
    });
});

describe('utils - `isValidPercentage`', () => {
    const { isValidPercentage } = Utils;
    it('returns true for 0', () => {
        expect(isValidPercentage(0)).toBeTruthy();
    });
    it('returns true for 1', () => {
        expect(isValidPercentage(1)).toBeTruthy();
    });
    it('returns true for 100', () => {
        expect(isValidPercentage(100)).toBeTruthy();
    });
    it('returns false for -1', () => {
        expect(isValidPercentage(-1)).toBeFalsy();
    });
    it('returns false for null', () => {
        expect(isValidPercentage(null)).toBeFalsy();
    });
});

describe('utils - `isInteger`', () => {
    const { isInteger } = Utils;
    it('returns true for 0', () => {
        expect(isInteger(0)).toBeTruthy();
    });
    it('returns true for 1', () => {
        expect(isInteger(1)).toBeTruthy();
    });
    it('returns true for 100', () => {
        expect(isInteger(100)).toBeTruthy();
    });
    it('returns false for -1', () => {
        expect(isInteger(-1)).toBeTruthy();
    });
    it('returns false for -1.5', () => {
        expect(isInteger(-1.5)).toBeFalsy();
    });
    it('returns false for null', () => {
        expect(isInteger(null)).toBeFalsy();
    });
});
