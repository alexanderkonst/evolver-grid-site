/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
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
  button,
  footerWrap,
  footer,
} from './_shared-styles.ts'

interface MagicLinkEmailProps {
  siteName: string
  confirmationUrl: string
}

export const MagicLinkEmail = ({
  siteName,
  confirmationUrl,
}: MagicLinkEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your sign-in link for {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Text style={brandMark}>Genius Business</Text>
        </Section>
        <Section style={body}>
          <Heading style={h1}>Your sign-in link</Heading>
          <Text style={text}>
            Tap the button below to sign in to {siteName}. This link expires
            shortly — for your security.
          </Text>
          <Button style={button} href={confirmationUrl}>
            Sign in
          </Button>
          <Text style={{ ...text, marginTop: '32px', fontSize: '13px' }}>
            Didn't ask for this? Ignore this email and nothing will change.
          </Text>
        </Section>
        <Section style={footerWrap}>
          <Text style={footer}>{siteName} — your unique business, decoded.</Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default MagicLinkEmail
