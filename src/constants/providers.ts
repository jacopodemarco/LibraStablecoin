import { JsonRpcProvider } from '@ethersproject/providers'

import { NETWORK_URLS, SupportedChainId } from './chains'

export const Providers: { [chainId: number]: JsonRpcProvider } = {
  [SupportedChainId.RINKEBY]: new JsonRpcProvider(NETWORK_URLS[SupportedChainId.RINKEBY]),
  [SupportedChainId.POLYGON]: new JsonRpcProvider(NETWORK_URLS[SupportedChainId.POLYGON]),
}
