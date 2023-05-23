import { formatUnits } from '@ethersproject/units'
import { DAI_TOKEN, LIBRA_TOKEN, USDC_TOKEN } from 'constants/tokens'
import { useMemo } from 'react'
import { useSingleContractMultipleMethods } from 'state/multicall/hooks'
import { toBN } from 'utils/numbers'
import { useERC20Contract, useMinterContract, useMinterDAIContract, useTokenContract } from './useContract'

export function useDeiStats(): {
  totalSupply: number
  minted_amo: number
  reedemed_amo: number
  totalProtocolHoldings: number
  circulatingSupply: number
  usdcReserves1: number
  daiReserves:number
  totalReserves: number
  
} {
  const deiContract = useTokenContract()
  const minterContract = useMinterContract()?.address
  const minterdaiContract = useMinterDAIContract()?.address
  const usdcContract = useERC20Contract(USDC_TOKEN.address)
  const daiContract = useERC20Contract(DAI_TOKEN.address)

  const calls = !deiContract
    ? []
    : [
        {
          methodName: 'totalSupply',
          callInputs: [],
        },
        {
          methodName: 'minted_amount',
          callInputs: [],
        },
        {
          methodName: 'redeemed_amount',
          callInputs: [],
        },
      ]

  const [totalSupplyDEI, mamount, ramount] = useSingleContractMultipleMethods(deiContract, calls)

  const { totalSupplyDEIValue, totalProtocolHoldings, minted_amo, reedemed_amo } = useMemo(() => {
    return {
      totalSupplyDEIValue: totalSupplyDEI?.result ? toBN(formatUnits(totalSupplyDEI.result[0], 18)).toNumber() : 0,
      totalProtocolHoldings:
        (mamount?.result ? toBN(formatUnits(mamount.result[0], 18)).toNumber() : 0) +
        (ramount?.result ? toBN(formatUnits(ramount.result[0], 18)).toNumber() : 0),
      minted_amo: mamount?.result ? toBN(formatUnits(mamount.result[0], 18)).toNumber() : 0,
      reedemed_amo: ramount?.result ? toBN(formatUnits(ramount.result[0], 18)).toNumber() : 0,
    }
  }, [totalSupplyDEI, mamount, ramount])

  const circulatingSupply = useMemo(() => {
    return totalSupplyDEIValue - totalProtocolHoldings 
  }, [totalSupplyDEIValue, totalProtocolHoldings])

  const reservesCalls = !usdcContract
    ? []
    : [
        {
          methodName: 'balanceOf',
          callInputs: [minterContract],
        },
        
      ]

  const [usdcBalance1] = useSingleContractMultipleMethods(usdcContract, reservesCalls)

  const reservesCalls2 = !usdcContract
  ? []
  : [
      {
        methodName: 'balanceOf',
        callInputs: [minterdaiContract],
      },
      
    ]

const [daiBalance] = useSingleContractMultipleMethods(daiContract, reservesCalls2)


  const { totalReserves, usdcReserves1,daiReserves } = useMemo(() => {
    return {
      totalReserves:
        (usdcBalance1?.result ? toBN(formatUnits(usdcBalance1.result[0], 6)).toNumber() +  (daiBalance?.result ? toBN(formatUnits(daiBalance.result[0], 18)).toNumber():0):0),
      usdcReserves1: usdcBalance1?.result ? toBN(formatUnits(usdcBalance1.result[0], 6)).toNumber() : 0,
      daiReserves: daiBalance?.result ? toBN(formatUnits(daiBalance.result[0], 18)).toNumber() : 0,
    }
  }, [usdcBalance1,daiBalance])


  return {
    totalSupply: totalSupplyDEIValue,
    minted_amo,
    reedemed_amo,
    totalProtocolHoldings,
    circulatingSupply,
    usdcReserves1,
    daiReserves,
    totalReserves
  }
}
