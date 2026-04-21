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

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({
  siteName,
  siteUrl,
  recipient,
  confirmationUrl,
}: SignupEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Confirm your email — your Zone of Genius awaits</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Text style={brandMark}>Genius Business</Text>
        </Section>
        <Section style={body}>
          <Heading style={h1}>Welcome. Let's confirm it's you.</Heading>
          <Text style={text}>
            Thanks for joining{' '}
            <Link href={siteUrl} style={link}>
              <strong>{siteName}</strong>
            </Link>
            . Confirm <strong>{recipient}</strong> to activate your account and
            unlock your Zone of Genius.
          </Text>
          <Button style={button} href={confirmationUrl}>
            Confirm email
          </Button>
          <Text style={{ ...text, marginTop: '32px', fontSize: '13px' }}>
            If you didn't create an account, you can safely ignore this email.
          </Text>
        </Section>
        <Section style={footerWrap}>
          <Text style={footer}>
            Sent by {siteName} — your unique business, decoded.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail
