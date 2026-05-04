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

interface RecoveryEmailProps {
  siteName: string
  confirmationUrl: string
}

export const RecoveryEmail = ({
  siteName,
  confirmationUrl,
}: RecoveryEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Reset your password for {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Text style={brandMark}>Find Your Top Talent</Text>
        </Section>
        <Section style={body}>
          <Heading style={h1}>Reset your password</Heading>
          <Text style={text}>
            We received a request to reset your password for {siteName}. Choose
            a new one below.
          </Text>
          <Button style={button} href={confirmationUrl}>
            Reset password
          </Button>
          <Text style={{ ...text, marginTop: '32px', fontSize: '13px' }}>
            If you didn't request this, ignore this email — your password stays
            the same.
          </Text>
        </Section>
        <Section style={footerWrap}>
          <Text style={footer}>{siteName} — your unique business, decoded.</Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default RecoveryEmail
