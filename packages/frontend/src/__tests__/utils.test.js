import currencyRound from '../util/currencyRound'

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
