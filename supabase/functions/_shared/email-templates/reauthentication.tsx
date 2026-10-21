/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

import {
  main,
  container,
  header,
  brandMark,
  body,
  h1,
  text,
  codeStyle,
  footerWrap,
  footer,
} from './_shared-styles.ts'
import { BRAND_NAME, BRAND_TAGLINE } from '../senders.ts'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your verification code</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Text style={brandMark}>Find Your Top Talent</Text>
        </Section>
        <Section style={body}>
          <Heading style={h1}>Confirm it's you</Heading>
          <Text style={text}>Use this code to confirm your identity:</Text>
          <Text style={codeStyle}>{token}</Text>
          <Text style={{ ...text, fontSize: '13px' }}>
            This code expires shortly. If you didn't request this, ignore this
            email.
          </Text>
        </Section>
        <Section style={footerWrap}>
          <Text style={footer}>
            Sent by {BRAND_NAME} — {BRAND_TAGLINE}
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail
