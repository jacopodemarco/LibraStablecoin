import { SupportedChainId } from 'constants/chains'
import { DAI_ADDRESS, Token } from '@sushiswap/core-sdk'
import { USDC_ADDRESS, DEUS_ADDRESS, LIBRA_ADDRESS } from './addresses'

export const LIBRA_TOKEN = new Token(SupportedChainId.POLYGON, LIBRA_ADDRESS[SupportedChainId.POLYGON], 18, 'LIBRA', 'LIBRA')

export const USDC_TOKEN = new Token(SupportedChainId.POLYGON, USDC_ADDRESS[SupportedChainId.POLYGON], 6, 'USDC', 'USDC')

export const DAI_TOKEN = new Token(SupportedChainId.POLYGON, DAI_ADDRESS[SupportedChainId.POLYGON], 18, 'DAI', 'DAI')

export const DEUS_TOKEN = new Token(SupportedChainId.FANTOM, DEUS_ADDRESS[SupportedChainId.FANTOM], 18, 'DEUS', 'DEUS')


export const DEI_BDEI_LP_TOKEN = new Token(
  SupportedChainId.FANTOM,
  '0xdce9ec1eb454829b6fe0f54f504fef3c3c0642fc',
  18,
  'DB-LP',
  'DB-LP'
)
