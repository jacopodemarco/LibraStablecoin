import React, { useState, useMemo, useCallback } from 'react'
import styled from 'styled-components'
import { darken } from 'polished'
import { ArrowDown, Plus } from 'react-feather'

import { useCurrencyBalance } from 'state/wallet/hooks'
import { useWalletModalToggle } from 'state/application/hooks'
import useWeb3React from 'hooks/useWeb3'
import { useSupportedChainId } from 'hooks/useSupportedChainId'
import useApproveCallback, { ApprovalState } from 'hooks/useApproveCallback'
import useRedemptionCallback from 'hooks/useRedemptionCallback'
import useCollectCallback from 'hooks/useCollectCallback'
import { useRedeemAmountsOut, useRedeemData } from 'hooks/useRedemptionPage'
import { tryParseAmount } from 'utils/parse'
import { LIBRA_TOKEN, DEUS_TOKEN, USDC_TOKEN } from 'constants/tokens'
import { Pool } from 'constants/addresses'

import { PrimaryButton } from 'components/Button'
import { DotFlashing, Info } from 'components/Icons'
import { Row } from 'components/Row'
import Hero, { HeroSubtext } from 'components/Hero'
import Disclaimer from 'components/Disclaimer'
import InputBox from 'components/App/Redemption/InputBox'
import RedemptionInfoBox from 'components/App/Redemption/RedemptionInfoBox'

const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  overflow: visible;
  margin: 0 auto;
`

const Wrapper = styled(Container)`
  margin: 0 auto;
  margin-top: 50px;
  width: clamp(250px, 90%, 500px);
  background-color: rgb(13 13 13);
  padding: 20px 15px;
  border: 1px solid rgb(0, 0, 0);
  border-radius: 15px;
  justify-content: center;

  & > * {
    &:nth-child(2) {
      margin: 15px auto;
    }
  }
`

const Description = styled.div`
  font-size: 0.85rem;
  line-height: 1.25rem;
  margin-left: 10px;
  color: ${({ theme }) => darken(0.4, theme.text1)};
`

const PlusIcon = styled(Plus)`
  margin: -14px auto;
  z-index: 1000;
  padding: 3px;
  border: 1px solid black;
  border-radius: 15px;
  background-color: rgb(0 0 0);
`

const RedeemButton = styled(PrimaryButton)`
  border-radius: 15px;
`

export default function Redemption() {
  
  const { chainId, account } = useWeb3React()
  const toggleWalletModal = useWalletModalToggle()
  const isSupportedChainId = useSupportedChainId()
  const [amountIn, setAmountIn] = useState('')
  const libraCurrency = LIBRA_TOKEN
  const usdcCurrency = USDC_TOKEN
  const libraCurrencyBalance = useCurrencyBalance(account ?? undefined, libraCurrency)

  /* const { amountIn, amountOut1, amountOut2, onUserInput, onUserOutput1, onUserOutput2 } = useRedeemAmounts() */
  const  amountOut1 = amountIn
  
  
  
  const { reedemv,redemptionFee,mintfeeValue,redeemPaused} = useRedeemData(account)
  // console.log({ redeemPaused, rest })
  
  console.log(reedemv,account)
  // Amount typed in either fields
  const libraAmount = useMemo(() => {
    return tryParseAmount(amountIn, libraCurrency || undefined)
  }, [amountIn, libraCurrency])

  const insufficientBalance = useMemo(() => {
    if (!libraAmount) return false
    return libraCurrencyBalance?.lessThan(libraAmount)
  }, [libraCurrencyBalance, libraAmount])

  const usdcAmount = useMemo(() => {
    return tryParseAmount(amountOut1, usdcCurrency || undefined)
  }, [amountOut1, usdcCurrency])

  const {
    state: redeemCallbackState,
    callback: redeemCallback,
    error: redeemCallbackError,
  } = useRedemptionCallback(libraCurrency, usdcCurrency, libraAmount, usdcAmount)

  const {
    state: collectCallbackState,
    callback: collectCallback,
    error: collectCallbackError,
  } = useCollectCallback()

  const [awaitingApproveConfirmation, setAwaitingApproveConfirmation] = useState<boolean>(false)
  const [awaitingRedeemConfirmation, setAwaitingRedeemConfirmation] = useState<boolean>(false)
  const [awaitingCollectConfirmation, setAwaitingCollectConfirmation] = useState<boolean>(false)
  const spender = useMemo(() => (chainId ? Pool[chainId] : undefined), [chainId])
  const [approvalState, approveCallback] = useApproveCallback(libraCurrency ?? undefined, spender)
  const [showApprove, showApproveLoader] = useMemo(() => {
    const show = libraCurrency && approvalState !== ApprovalState.APPROVED && !!amountIn
    return [show, show && approvalState === ApprovalState.PENDING]
  }, [libraCurrency, approvalState, amountIn])


  const handleApprove = async () => {
    setAwaitingApproveConfirmation(true)
    await approveCallback()
    setAwaitingApproveConfirmation(false)
  }

  const handleRedeem = useCallback(async () => {
    console.log('called handleRedeem')
    console.log(redeemCallbackState, redeemCallback, redeemCallbackError)
    if (!redeemCallback) return

    // let error = ''
    try {
      setAwaitingRedeemConfirmation(true)
      const txHash = await redeemCallback()
      setAwaitingRedeemConfirmation(false)
      console.log({ txHash })
    } catch (e) {
      setAwaitingRedeemConfirmation(false)
      if (e instanceof Error) {
        // error = e.message
      } else {
        console.error(e)
        // error = 'An unknown error occurred.'
      }
    }
  }, [redeemCallbackState, redeemCallback, redeemCallbackError])

  const handleCollect = useCallback(async () => {
    console.log('called handleCollect')
    console.log(collectCallbackState, collectCallback, collectCallbackError)
    if (!collectCallback) return

    // let error = ''
    try {
      setAwaitingCollectConfirmation(true)
      const txHash = await collectCallback()
      setAwaitingCollectConfirmation(false)
      console.log({ txHash })
    } catch (e) {
      setAwaitingCollectConfirmation(false)
      if (e instanceof Error) {
        // error = e.message
      } else {
        console.error(e)
        // error = 'An unknown error occurred.'
      }
    }
  }, [collectCallbackState, collectCallback, collectCallbackError])

  function getApproveButton(): JSX.Element | null {
    if (!isSupportedChainId || !account) {
      return null
    }
    if (awaitingApproveConfirmation) {
      return (
        <RedeemButton active>
          Awaiting Confirmation <DotFlashing style={{ marginLeft: '10px' }} />
        </RedeemButton>
      )
    }
    if (showApproveLoader) {
      return (
        <RedeemButton active>
          Approving <DotFlashing style={{ marginLeft: '10px' }} />
        </RedeemButton>
      )
    }
    if (showApprove) {
      return <RedeemButton onClick={handleApprove}>Allow us to spend {libraCurrency?.symbol}</RedeemButton>
    }
    return null
  }

  function getActionButton(): JSX.Element | null {
    if (!chainId || !account) {
      return <RedeemButton onClick={toggleWalletModal}>Connect Wallet</RedeemButton>
    }
    if (showApprove) {
      return null
    }
    if (redeemPaused) {
      return <RedeemButton disabled>Redeem Paused</RedeemButton>
    }

   

    if (insufficientBalance) {
      return <RedeemButton disabled>Insufficient {libraCurrency?.symbol} Balance</RedeemButton>
    }
    if (awaitingRedeemConfirmation) {
      return (
        <RedeemButton>
          Redeeming LIBRA <DotFlashing style={{ marginLeft: '10px' }} />
        </RedeemButton>
      )
    }

    return <RedeemButton onClick={() => handleRedeem()}>Redeem LIBRA</RedeemButton>
  }
  function getCollectButton(): JSX.Element | null {
   
    
    if (redeemPaused) {
      return <RedeemButton disabled>Redeem Paused</RedeemButton>
    }

    if (awaitingCollectConfirmation) {
      return (
        <RedeemButton>
          Collecting Collateral <DotFlashing style={{ marginLeft: '10px' }} />
        </RedeemButton>
      )
    }
if(reedemv!= null && reedemv>0){
    return <RedeemButton onClick={() => handleCollect()}>Collect USDC</RedeemButton>
}
return null
  }

  return (
    <Container>
      
      <Wrapper>
        <InputBox
          currency={libraCurrency}
          value={amountIn}
          onChange={(value: string) => setAmountIn(value)}
          title={'From'}
        />
        <ArrowDown />

        <InputBox
          currency={usdcCurrency}
          value={amountOut1}
          onChange={(value: string) => console.log(value)}
          title={'To'}
          disabled={true}
        />
       
       
        {
          <Row mt={'8px'}>
            <Info data-for="id" data-tip={'Tool tip for hint client'} size={15} />
            <Description>After redeeming your LIBRA you must collect the collateral by clicking on the dedicated button</Description>
          </Row>
        }
        <div style={{ marginTop: '20px' }}></div>
        {getApproveButton()}
        {getActionButton()}
       <div style={{ marginTop: '20px' }}>{getCollectButton()}</div>
        
      </Wrapper>
    </Container>
  )
}
