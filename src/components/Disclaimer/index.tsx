import React from 'react'
import Image from 'next/image'
import styled from 'styled-components'

import { ExternalLink } from 'components/Link'
import LibraLogo from '/public/static/images/libraLogoFull.png'

const Wrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;
  font-size: 13px;
  color: ${({ theme }) => theme.text2};
  gap: 20px;
  padding: 10px;
  text-align: center;
  margin-top: 40px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin-top: 20px;
  `}
`

export default function Disclaimer() {
  return (
    <Wrapper>
      <Image src={LibraLogo} alt="LIBRA Logo" height="120px" width="220px" />
      <ExternalLink href="https://libraprotocol.finance" style={{ opacity: 0.5 }}>
        {new Date().getFullYear()} Libra Protocol. All rights to the people.
      </ExternalLink>
    </Wrapper>
  )
}
