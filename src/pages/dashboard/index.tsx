import React, { useState } from 'react'
import styled from 'styled-components'
import Hero, { HeroSubtext } from 'components/Hero'
import Disclaimer from 'components/Disclaimer'
import DeiStats from 'components/App/Dashboard/DeiStats'

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

export default function Dashboard() {
 
  return (
    <Container>
      <Hero>
        <div>Dashboard</div>
        <HeroSubtext>Important stats about LIBRA </HeroSubtext>
      </Hero>

      <DeiStats />

      <Disclaimer />
    </Container>
  )
}
