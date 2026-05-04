/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
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
  link,
  button,
  footerWrap,
  footer,
} from './_shared-styles.ts'

interface EmailChangeEmailProps {
  siteName: string
  email: string
  newEmail: string
  confirmationUrl: string
}

export const EmailChangeEmail = ({
  siteName,
  email,
  newEmail,
  confirmationUrl,
}: EmailChangeEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Confirm your new email for {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Text style={brandMark}>Find Your Top Talent</Text>
        </Section>
        <Section style={body}>
          <Heading style={h1}>Confirm your email change</Heading>
          <Text style={text}>
            You requested to change your {siteName} email from{' '}
            <Link href={`mailto:${email}`} style={link}>
              {email}
            </Link>{' '}
            to{' '}
            <Link href={`mailto:${newEmail}`} style={link}>
              {newEmail}
            </Link>
            .
          </Text>
          <Button style={button} href={confirmationUrl}>
            Confirm change
          </Button>
          <Text style={{ ...text, marginTop: '32px', fontSize: '13px' }}>
            If you didn't request this, secure your account immediately.
          </Text>
        </Section>
        <Section style={footerWrap}>
          <Text style={footer}>{siteName} — your unique business, decoded.</Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default EmailChangeEmail
