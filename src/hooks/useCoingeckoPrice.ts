import { useEffect, useMemo, useState } from 'react'
import CoinGecko from 'coingecko-api'

import { CoingeckoQueue } from 'utils/queue'
import { useSingleContractMultipleMethods } from 'state/multicall/hooks'
import { useLpaddr ,useoracleaddr} from './useContract'
const CoinGeckoClient = new CoinGecko()

export const SymbolIdentifiers: {
  [x: string]: string
} = {
  BEETS: 'beethoven-x',
  BTC: 'bitcoin',
  BOO: 'spookyswap',
  DAI: 'dai',
  DEI: 'dei-token',
  DEUS: 'deus-finance-2',
  FTM: 'fantom',
  LQDR: 'liquiddriver',
  MIM: 'magic-internet-money',
  MIMATIC: 'mimatic',
  OXD: '0xdao',
  OXSOLID: 'oxsolid',
  SCREAM: 'scream',
  SPELL: 'spell-token',
  SOLID: 'solidly',
  SOLIDsex: 'solidsex-tokenized-vesolid',
  TOMB: 'tomb',
  USDC: 'usd-coin',
  WBTC: 'bitcoin',
  WFTM: 'fantom',
}

export function useDeusPrice() {
  return useCoingeckoPrice(SymbolIdentifiers.DEUS, '0')
}
export  function useDeiPrice() : {
  price: number
  
} {
  
  const contract = useLpaddr()
  const currentTrancheCall = [
    {
      methodName: 'getReserves',
      callInputs: [],
    },
   
  ]
  const [res0, res1] = useSingleContractMultipleMethods(
    contract,
    currentTrancheCall
  )
  

  
  //TODO
  const { reserve0v,reserve1v} = useMemo(
    () => ({
      reserve0v: res0?.result ? Number(res0.result[0].toString()) : 0,
      reserve1v: res0?.result ? Number(res0.result[1].toString()) : 0,
   
    }),
    
    [res0, res1]
  )
  
  const contract2 = useoracleaddr()
  const currentTrancheCall2 = [
    {
      methodName: 'getLatestPrice',
      callInputs: [],
    },
   
  ]
  const [res] = useSingleContractMultipleMethods(
    contract2,
    currentTrancheCall2
  )
  

  
  //TODO
  const {price} = useMemo(
    () => ({
      price: res?.result ? Number(res.result[0].toString())*(10 ** 10) : 0,
   
    }),
    
    [res]
  )

   console.log(reserve1v,reserve0v,price)

  return {
    price: ((price*reserve0v )/ reserve1v)/(10 ** 18),
  }

    
}

export function useSolidPrice() {
  return useCoingeckoPrice(SymbolIdentifiers.SOLID, '0')
}

export function useCustomCoingeckoPrice(symbol: string) {
  const valid = symbol in SymbolIdentifiers
  return useCoingeckoPrice(valid ? SymbolIdentifiers[symbol] : '', '0', !valid)
}

// TODO add this to global state, so we don't refetch prices.
export default function useCoingeckoPrice(id: string, DEFAULT_PRICE: string, forceRevert?: boolean): string {
  const [price, setPrice] = useState(DEFAULT_PRICE)

  useEffect(() => {
    const fetchPrice = () => {
      CoingeckoQueue.add(async () => {
        try {
          const result = await CoinGeckoClient.simple.price({
            ids: [id],
            vs_currencies: ['usd'],
          })

          const price: number = result?.data?.[id]?.usd ?? 0
          setPrice(price.toString())
        } catch (err) {
          console.log('Unable to fetch Coingecko price:')
          console.error(err)
          setPrice(DEFAULT_PRICE)
        }
      })
    }
    if (!forceRevert) {
      fetchPrice()
    }
  }, [id, forceRevert, DEFAULT_PRICE])

  return price
}
