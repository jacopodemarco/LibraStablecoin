import { useCallback, useMemo } from 'react'
import { TransactionResponse } from '@ethersproject/abstract-provider'
import { Currency, CurrencyAmount, NativeCurrency, Token } from '@sushiswap/core-sdk'
import toast from 'react-hot-toast'
import { BigintIsh, JSBI } from '@sushiswap/core-sdk'
import { useTransactionAdder } from 'state/transactions/hooks'
import useWeb3React from 'hooks/useWeb3'
import { useMinterContract } from 'hooks/useContract'
import { calculateGasMargin } from 'utils/web3'
import { toHex } from 'utils/hex'
import { DefaultHandlerError } from 'utils/parseError'

import BigNumber from 'bignumber.js';

export enum RedeemCallbackState {
  INVALID = 'INVALID',
  VALID = 'VALID',
}

export default function useMinterCallback(
  deiCurrency: Currency | undefined | null,
  usdcCurrency: Currency | undefined | null,
  deiAmount: CurrencyAmount<NativeCurrency | Token> | null | undefined,
  usdcAmount: CurrencyAmount<NativeCurrency | Token> | null | undefined,
 
): {
  state: RedeemCallbackState
  callback: null | (() => Promise<string>)
  error: string | null
} {
  const { account, chainId, library } = useWeb3React()
  const addTransaction = useTransactionAdder()
  const Minter = useMinterContract()

  const constructCall = useCallback(() => {
    try {
      let val =0;
      let valmin =0
      if (!account || !library || !Minter || !deiAmount) {
        throw new Error('Missing dependencies.')
      }
     if( usdcAmount !== undefined && usdcAmount !== null){
       val= parseFloat(usdcAmount.toFixed(3)) 
     }
      

      valmin = parseFloat((val*0.9).toFixed(4))
      let arg0 = new BigNumber(val).shiftedBy(6).toString()
      let arg1 = new BigNumber(valmin).shiftedBy(6).toString()
      
   console.log(arg0,arg1)
      const methodName = 'mint1t1Libra'
      const args = [arg0,arg1]

      return {
        address: Minter.address,
        calldata: Minter.interface.encodeFunctionData(methodName, args) ?? '',
        value: 0,
      }
    } catch (error) {
      return {
        error,
      }
    }
  }, [account, library, Minter, deiAmount])

  return useMemo(() => {
    if (!account || !chainId || !library || !Minter || !usdcCurrency || !deiCurrency || !deiAmount) {
      return {
        state: RedeemCallbackState.INVALID,
        callback: null,
        error: 'Missing dependencies',
      }
    }
    if (!usdcAmount || !deiAmount) {
      return {
        state: RedeemCallbackState.INVALID,
        callback: null,
        error: 'No amount provided',
      }
    }

    return {
      state: RedeemCallbackState.VALID,
      error: null,
      callback: async function onRedeem(): Promise<string> {
        console.log('onRedeem callback')
        const call = constructCall()
        const { address, calldata, value } = call

        if ('error' in call) {
          console.error(call.error)
          if (call.error.message) {
            throw new Error(call.error.message)
          } else {
            throw new Error('Unexpected error. Could not construct calldata.')
          }
        }

        const tx = !value
          ? { from: account, to: address, data: calldata }
          : { from: account, to: address, data: calldata, value }

        console.log('Mint TRANSACTION', { tx, value })

        const estimatedGas = await library.estimateGas(tx).catch((gasError) => {
          console.debug('Gas estimate failed, trying eth_call to extract error', call)

          return library
            .call(tx)
            .then((result) => {
              console.debug('Unexpected successful call after failed estimate gas', call, gasError, result)
              return {
                error: new Error('Unexpected issue with estimating the gas. Please try again.'),
              }
            })
            .catch((callError) => {
              console.debug('Call threw an error', call, callError)
              toast.error(DefaultHandlerError(callError))
              return {
                error: new Error(callError.message), // TODO make this human readable
              }
            })
        })

        if ('error' in estimatedGas) {
          throw new Error('Unexpected error. Could not estimate gas for this transaction.')
        }

        return library
          .getSigner()
          .sendTransaction({
            ...tx,
            ...(estimatedGas ? { gasLimit: calculateGasMargin(estimatedGas) } : {}),
            // gasPrice /// TODO add gasPrice based on EIP 1559
          })
          .then((response: TransactionResponse) => {
            console.log(response)
            const summary = `Mint ${usdcAmount?.toSignificant()} USDC for ${deiAmount?.toSignificant()} LIBRA `
            addTransaction(response, { summary })

            return response.hash
          })
          .catch((error) => {
            // if the user rejected the tx, pass this along
            if (error?.code === 4001) {
              throw new Error('Transaction rejected.')
            } else {
              // otherwise, the error was unexpected and we need to convey that
              console.error(`Transaction failed`, error, address, calldata, value)
              throw new Error(`Transaction failed: ${error.message}`)
            }
          })
      },
    }
  }, [
    account,
    chainId,
    library,
    addTransaction,
    constructCall,
    Minter,
    usdcCurrency,
    deiCurrency,
    usdcAmount,
    deiAmount,
  ])
}
