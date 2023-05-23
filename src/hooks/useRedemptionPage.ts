import { useState, useCallback, useMemo } from 'react'
import { Token } from '@sushiswap/core-sdk'
import { BigNumber } from 'bignumber.js'
import { formatUnits } from '@ethersproject/units'
import debounce from 'lodash/debounce'

import { useSingleContractMultipleMethods } from 'state/multicall/hooks'
import { BN_TEN, removeTrailingZeros, toBN } from 'utils/numbers'
import { useMinterContract,useMinterDAIContract,useTokenContract } from 'hooks/useContract'



export function useRedeemData(addr:string|null|undefined): {
  redemptionFee: number
  mintfeeValue:number|null
  redeemPaused: boolean
  reedemv:number|null
} {
  if(addr != undefined && addr!= null){
  const contract = useMinterContract()
  const currentTrancheCall = [
    {
      methodName: 'redeemCollateralBalances',
      callInputs: [addr],
    },
    {
      methodName: 'redeemPaused',
      callInputs: [],
    },
    {
      methodName: 'redemption_fee',
      callInputs: [],
    },
    {
      methodName: 'minting_fee',
      callInputs: [],
    },
    
  ]
  const [reedeem_amount, redeemPaused, redemptionFee, mintfee] = useSingleContractMultipleMethods(
    contract,
    currentTrancheCall
  )
  

  
  //TODO
  const { reedemv, redeemPausedValue, redemptionFeeValue, mintfeeValue} = useMemo(
    () => ({
      reedemv: reedeem_amount?.result ? Number(reedeem_amount.result[0].toString()) : null,
      redeemPausedValue: redeemPaused?.result ? redeemPaused?.result[0] : false,
      redemptionFeeValue: redemptionFee?.result ? toBN(formatUnits(redemptionFee.result[0], 6)).toNumber() : 0,
      mintfeeValue: mintfee?.result ? Number(mintfee.result[0].toString()) : null,
   
    }),
    
    [reedeem_amount, redeemPaused, redemptionFee, mintfee]
  )
 
  return {
    redemptionFee: redemptionFeeValue,  
    redeemPaused: redeemPausedValue,
    mintfeeValue: mintfeeValue,
    reedemv:reedemv,
  }
}else{
  return{
    redemptionFee:0,
    mintfeeValue:0,
    redeemPaused:false,
    reedemv:0,
  }
}
}

export function useRedeemDaiData(addr:string|null|undefined): {
  redemptionFee: number
  mintfeeValue:number|null
  redeemPaused: boolean
  reedemv:number|null
} {
  if(addr != undefined && addr!= null){
  const contract = useMinterDAIContract()
  const currentTrancheCall = [
    {
      methodName: 'redeemCollateralBalances',
      callInputs: [addr],
    },
    {
      methodName: 'redeemPaused',
      callInputs: [],
    },
    {
      methodName: 'redemption_fee',
      callInputs: [],
    },
    {
      methodName: 'minting_fee',
      callInputs: [],
    },
    
  ]
  const [reedeem_amount, redeemPaused, redemptionFee, mintfee] = useSingleContractMultipleMethods(
    contract,
    currentTrancheCall
  )
  

  
  //TODO
  const { reedemv, redeemPausedValue, redemptionFeeValue, mintfeeValue} = useMemo(
    () => ({
      reedemv: reedeem_amount?.result ? Number(reedeem_amount.result[0].toString()) : null,
      redeemPausedValue: redeemPaused?.result ? redeemPaused?.result[0] : false,
      redemptionFeeValue: redemptionFee?.result ? toBN(formatUnits(redemptionFee.result[0], 6)).toNumber() : 0,
      mintfeeValue: mintfee?.result ? Number(mintfee.result[0].toString()) : null,
   
    }),
    
    [reedeem_amount, redeemPaused, redemptionFee, mintfee]
  )
 
  return {
    redemptionFee: redemptionFeeValue,  
    redeemPaused: redeemPausedValue,
    mintfeeValue: mintfeeValue,
    reedemv:reedemv,
  }
}else{
  return{
    redemptionFee:0,
    mintfeeValue:0,
    redeemPaused:false,
    reedemv:0,
  }
}
}


export function useRedeemed(): {
  totalSupply: string
} {
 
  const contract = useTokenContract()

  const amountOutCall = useMemo(
    () =>
    [
            {
              methodName: 'totalSupply',
              callInputs: [],
            },
           
          ],
    []
  )

  const [usdRedeem] = useSingleContractMultipleMethods(contract, amountOutCall)

  const totalSupply =
    !usdRedeem || !usdRedeem.result ? '' : toBN(formatUnits(usdRedeem.result[0].toString(), 18)).toString()

  
  return {
    totalSupply,
  }
}
export function useRedeemAmountsOut(
  amountIn: string,
  tokenIn: Token
): {
  amountOut1: string
  amountOut2: string
} {
  const amountInBN = amountIn ? toBN(amountIn).times(BN_TEN.pow(tokenIn.decimals)).toFixed(0) : ''
  const contract = useMinterContract()

  const amountOutCall = useMemo(
    () =>
      !amountInBN || amountInBN == '' || amountInBN == '0'
        ? []
        : [
            {
              methodName: 'usdRedeemValue',
              callInputs: [amountInBN],
            },
            {
              methodName: 'deusRedeemValue',
              callInputs: [amountInBN],
            },
          ],
    [amountInBN]
  )

  const [usdRedeem, deusRedeem] = useSingleContractMultipleMethods(contract, amountOutCall)

  const amountOut1 =
    !usdRedeem || !usdRedeem.result ? '' : toBN(formatUnits(usdRedeem.result[0].toString(), 6)).toString()

  const amountOut2 =
    !deusRedeem || !deusRedeem.result ? '' : toBN(formatUnits(deusRedeem.result[0].toString(), 6)).toString()

  return {
    amountOut1,
    amountOut2,
  }
}
