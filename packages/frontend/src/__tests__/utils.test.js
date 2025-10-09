import currencyRound from '../util/currencyRound'
import { sliceNumberByDecimals } from '../util/sliceNumberByDecimals'
import { trimEndZeros } from '../util/trimEndZeros'

describe('trimEndZeros', () => {
  it('no trailing zeros', () => {
    expect(trimEndZeros('1')).toEqual('1')
    expect(trimEndZeros('12')).toEqual('12')
    expect(trimEndZeros('123')).toEqual('123')
  })

  it('trailing zeros', () => {
    expect(trimEndZeros('100')).toEqual('1')
    expect(trimEndZeros('1200')).toEqual('12')
    expect(trimEndZeros('123000')).toEqual('123')
  })

  it('mixed numbers with zeros', () => {
    expect(trimEndZeros('1020')).toEqual('102')
    expect(trimEndZeros('100200')).toEqual('1002')
    expect(trimEndZeros('1234000')).toEqual('1234')
  })

  it('only zeros', () => {
    expect(trimEndZeros('0')).toEqual('')
    expect(trimEndZeros('00')).toEqual('')
    expect(trimEndZeros('000')).toEqual('')
  })

  it('zeros in the middle', () => {
    expect(trimEndZeros('1001')).toEqual('1001')
    expect(trimEndZeros('10010')).toEqual('1001')
    expect(trimEndZeros('100100')).toEqual('1001')
  })

  it('decimal numbers', () => {
    expect(trimEndZeros('1.00')).toEqual('1.')
    expect(trimEndZeros('12.500')).toEqual('12.5')
    expect(trimEndZeros('123.456000')).toEqual('123.456')
  })

  it('empty and edge cases', () => {
    expect(trimEndZeros('')).toEqual('')
    expect(trimEndZeros('0001000')).toEqual('0001')
  })
})

describe('sliceNumberByDecimals', () => {
  describe('invalid inputs', () => {
    it('should handle undefined input', () => {
      expect(sliceNumberByDecimals(undefined, 2)).toEqual({ integer: '0', fractional: '' })
    })

    it('should handle null input', () => {
      expect(sliceNumberByDecimals(null, 2)).toEqual({ integer: '0', fractional: '' })
    })

    it('should handle empty string input', () => {
      expect(sliceNumberByDecimals('', 2)).toEqual({ integer: '0', fractional: '' })
    })

    it('should handle invalid decimal places (NaN)', () => {
      expect(sliceNumberByDecimals('123', NaN)).toEqual({ integer: '123', fractional: '' })
    })

    it('should handle invalid decimal places (non-integer)', () => {
      expect(sliceNumberByDecimals('123', 2.5)).toEqual({ integer: '123', fractional: '' })
    })

    it('should handle invalid decimal places (zero)', () => {
      expect(sliceNumberByDecimals('123', 0)).toEqual({ integer: '123', fractional: '' })
    })

    it('should handle invalid decimal places (negative)', () => {
      expect(sliceNumberByDecimals('123', -1)).toEqual({ integer: '123', fractional: '' })
    })
  })

  describe('string length greater than decimal places', () => {
    it('should split 4-digit number with 2 decimal places', () => {
      expect(sliceNumberByDecimals('1234', 2)).toEqual({ integer: '12', fractional: '34' })
    })

    it('should split 6-digit number with 3 decimal places', () => {
      expect(sliceNumberByDecimals('123456', 3)).toEqual({ integer: '123', fractional: '456' })
    })

    it('should split 3-digit number with 1 decimal place', () => {
      expect(sliceNumberByDecimals('789', 1)).toEqual({ integer: '78', fractional: '9' })
    })

    it('should split 5-digit number with 2 decimal places', () => {
      expect(sliceNumberByDecimals('12345', 2)).toEqual({ integer: '123', fractional: '45' })
    })
  })

  describe('string length equal to decimal places', () => {
    it('should handle 2-digit number with 2 decimal places', () => {
      expect(sliceNumberByDecimals('12', 2)).toEqual({ integer: '0', fractional: '12' })
    })

    it('should handle 3-digit number with 3 decimal places', () => {
      expect(sliceNumberByDecimals('123', 3)).toEqual({ integer: '0', fractional: '123' })
    })
  })

  describe('string length less than decimal places', () => {
    it('should handle 1-digit number with 2 decimal places', () => {
      expect(sliceNumberByDecimals('5', 2)).toEqual({ integer: '0', fractional: '05' })
    })

    it('should handle 2-digit number with 4 decimal places', () => {
      expect(sliceNumberByDecimals('42', 4)).toEqual({ integer: '0', fractional: '0042' })
    })

    it('should handle empty string with decimal places', () => {
      expect(sliceNumberByDecimals('', 3)).toEqual({ integer: '0', fractional: '' })
    })

    it('should handle single digit with 3 decimal places', () => {
      expect(sliceNumberByDecimals('7', 3)).toEqual({ integer: '0', fractional: '007' })
    })
  })

  describe('edge cases', () => {
    it('should handle zero with decimal places', () => {
      expect(sliceNumberByDecimals('0', 2)).toEqual({ integer: '0', fractional: '00' })
    })

    it('should handle very long number', () => {
      expect(sliceNumberByDecimals('123456789012345', 5)).toEqual({
        integer: '1234567890',
        fractional: '12345'
      })
    })

    it('should handle minimum decimal places', () => {
      expect(sliceNumberByDecimals('123', 1)).toEqual({ integer: '12', fractional: '3' })
    })
  })
})

describe('currencyRound', () => {
  it('hundred', () => {
    expect(currencyRound(1)).toEqual('1')
    expect(currencyRound(12)).toEqual('12')
    expect(currencyRound(123)).toEqual('123')
  })
  it('thousand', () => {
    expect(currencyRound(1234)).toEqual('1.2K')
    expect(currencyRound(12345)).toEqual('12.3K')
    expect(currencyRound(123678)).toEqual('124K')
  })
  it('million', () => {
    expect(currencyRound(1234567)).toEqual('1.23M')
    expect(currencyRound(12345678)).toEqual('12.3M')
    expect(currencyRound(123456789)).toEqual('123M')
  })
  it('billion', () => {
    expect(currencyRound(1234567891)).toEqual('1.23B')
    expect(currencyRound(12345678912)).toEqual('12.3B')
    expect(currencyRound(123456789123)).toEqual('123B')
  })
})
