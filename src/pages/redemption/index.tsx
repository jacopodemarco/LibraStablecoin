import React, { useState } from 'react'
import styled from 'styled-components'

import Hero, { HeroSubtext } from 'components/Hero'
import Disclaimer from 'components/Disclaimer'
import { Navigation, NavigationTypes } from 'components/StableCoin'
import Reedemusdc from './usdc'
import ReedemDai from './dai'

const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  overflow: visible;
  margin: 0 auto;
`

const SelectorContainer = styled.div`
  display: flex;
  flex-flow: column nowrap;
  overflow: visible;
  margin: 0 auto;
  margin-top: 24px;
  padding-right: 24px;
`

export default function Bonds() {
  const [selected, setSelected] = useState<NavigationTypes>(NavigationTypes.MINT)

  const getAppComponent = (): JSX.Element => {
    if (selected == NavigationTypes.MINT) {
      return <Reedemusdc  />
    }
    if (selected == NavigationTypes.SWAP) {
      return <ReedemDai  />
    }
    
    return <Reedemusdc />
  }

  return (
    <Container>
      <Hero>
        <div>Redemption</div>
        <HeroSubtext>redeem your LIBRA</HeroSubtext>
      </Hero>

      <SelectorContainer>
        <Navigation selected={selected} setSelected={setSelected} />
      </SelectorContainer>

      {getAppComponent()}

      <Disclaimer />
    </Container>
  )
}
