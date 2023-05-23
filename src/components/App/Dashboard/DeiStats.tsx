import React, { useMemo, useState } from 'react'
import styled from 'styled-components'

import { useRedeemData } from 'hooks/useRedemptionPage'

import { RowBetween } from 'components/Row'
import { Loader } from 'components/Icons'
import { formatAmount, formatDollarAmount } from 'utils/numbers'

import { useDeiPrice } from 'hooks/useCoingeckoPrice'
import { useDeiStats } from 'hooks/useDeiStats'

import { useDashboardModalToggle } from 'state/application/hooks'
import StatsModal from './StatsModal'

const Wrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  gap: 1rem;
  margin-top: 50px;
`

const TopWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  width: 100%;
  max-width: 1200px;
  gap: 2rem;
  justify-content: start;
  margin: 0 auto;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    flex-flow: column nowrap;
  `}
`

const StatsWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  gap: 2rem;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    width: 100%;
    margin: 0 auto;
  `}
`

const InfoWrapper = styled(RowBetween)<{
  secondary?: boolean
}>`
  align-items: center;
  margin-top: 1px;
  white-space: nowrap;
  margin: auto;
  background-color: #0d0d0d;
  border: 1px solid #1c1c1c;
  border-radius: 15px;
  padding: 1.25rem 2rem;
  font-size: 0.75rem;
  min-width: 500px;
  width: 100%;

  &:hover {
    background: #141414;
    cursor: pointer;
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 0.75rem 1rem;
    width: 90%;
    min-width: 250px;
  `}

  ${({ secondary }) =>
    secondary &&
    `
    min-width: 250px;
  `}
`

const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  align-self: start;
  background-color: #2f2f2f;
  border: 1px solid #0d0d0d;
  border-radius: 15px;
  padding: 1.25rem 1rem;
  font-size: 1rem;
  min-width: 500px;
  width: 100%;
  gap: 1rem;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    width: 90%;
    padding: 0.75rem 0.5rem;
    margin: 0 auto;
    min-width: 265px;
    gap: 0.5rem;
  `}
`

const ItemValue = styled.div`
  display: flex;
  align-self: end;
  color: ${({ theme }) => theme.yellow3};
  margin-left: 5px;

  > span {
    margin-left: 5px;
    color: ${({ theme }) => theme.text1};
  }
`

const Heading = styled.div`
  display: flex;
  align-self: center;
  margin-left: 1rem;
  width: 100%;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    width:90%;
  `}
`

const ItemWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  gap: 0.25rem;
`

const SubWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  gap: 1rem;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    gap: 0.5rem;
    flex-flow: column nowrap;
  `}
`

export enum Dashboard {
  EMPTY = 'EMPTY',
  DEI_PRICE = 'LIBRA Price',
  DEI_TOTAL_SUPPLY = 'LIBRA Total Supply',
  DEI_PROTOCOL_HOLDINGS = 'LIBRA Protocol Holdings',
  TOTAL_DEI_BONDED = 'Total LIBRA Bonded',
  DEI_CIRCULATING_SUPPLY = 'DEI Circulating Supply',
  TOTAL_USDC_RESERVES = 'Total Reserves',
  USDC_BACKING_FOR_DEI = 'Value Backing per LIBRA',
  GLOBAL_DEI_BORROWED = 'Global DEI Borrowed',
  TOTAL_DEI_REDEEMED = 'Total LIBRA Redeemed',
  TOTAL_DEI_MINTED = 'Total LIBRA Minted',
  REDEMPTION_PER_DEI = 'Redemption per DEI',
  TOTAL_BDEI_STAKED = 'Total bDEI Staked',
  BDEI_STAKING_APR = 'bDEI Staking APR',
  BDEI_LIQUIDITY = 'bDEI Liquidity in bDEI-DEI Pool',
  DEI_LIQUIDITY = 'DEI Liquidity in bDEI-DEI Pool',
  
}

export default function DeiStats() {
  const toggleDashboardModal = useDashboardModalToggle()

  const [currentStat, setCurrentStat] = useState(Dashboard.EMPTY)

  const {price} = useDeiPrice()


  

  const {
    totalSupply,
    minted_amo,
    circulatingSupply,
    totalReserves,
    reedemed_amo,
    usdcReserves1
  } = useDeiStats()

  const valueBackingPerLibra = useMemo(() => {
    return totalReserves / totalSupply
  }, [totalReserves, totalSupply])

  const showLoader = false

  function handleClick(flag: Dashboard) {
    setCurrentStat(flag)
    toggleDashboardModal()
  }

  return (
    <>
      <Wrapper>
        <TopWrapper>
          <Container>
            <Heading>LIBRA stats</Heading>
            <div onClick={() => handleClick(Dashboard.DEI_PRICE)}>
              <InfoWrapper>
                <p>Price</p>
                {price === null ? <Loader /> : <ItemValue>{formatDollarAmount(price)}</ItemValue>}
              </InfoWrapper>
            </div>
           
              <div onClick={() => handleClick(Dashboard.DEI_TOTAL_SUPPLY)}>
                <InfoWrapper>
                  <p>Total Supply</p>
                  {totalSupply === null ? <Loader /> : <ItemValue>{formatAmount(totalSupply, 2)}</ItemValue>}
                </InfoWrapper>
              </div>
             
            <div onClick={() => handleClick(Dashboard.TOTAL_USDC_RESERVES)}>
              <InfoWrapper>
                <p>Total Reserves</p>
                {totalReserves === null ? <Loader /> : <ItemValue>{formatAmount(totalReserves, 2)}</ItemValue>}
              </InfoWrapper>
            </div>
            <div onClick={() => handleClick(Dashboard.USDC_BACKING_FOR_DEI)}>
              <InfoWrapper>
                <p>Value Backing per LIBRA</p>
                {valueBackingPerLibra === null ? (
                  <Loader />
                ) : (
                  <ItemValue>{formatDollarAmount(valueBackingPerLibra, 2)}</ItemValue>
                )}
              </InfoWrapper>
            </div>
          </Container>
          <StatsWrapper>
            <Container>
              <Heading>Redemption stats</Heading>
              <div onClick={() => handleClick(Dashboard.TOTAL_DEI_REDEEMED)}>
                <InfoWrapper>
                  <p>Total LIBRA Redeemed</p>
                  {showLoader ? <Loader /> : <ItemValue>{formatAmount(reedemed_amo)}</ItemValue>}
                </InfoWrapper>
              </div>
             
            </Container>
            <Container>
              <Heading>Mint stats</Heading>
              <div onClick={() => handleClick(Dashboard.TOTAL_DEI_MINTED)}>
                <InfoWrapper>
                  <p>Total LIBRA Minted</p>
                  {showLoader ? <Loader /> : <ItemValue>{formatAmount(minted_amo)}</ItemValue>}
                </InfoWrapper>
              </div>
             
            </Container>
          </StatsWrapper>
        </TopWrapper>
      </Wrapper>
      <StatsModal stat={currentStat} />
    </>
  )
}
