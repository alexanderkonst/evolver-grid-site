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

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
}

export const InviteEmail = ({
  siteName,
  siteUrl,
  confirmationUrl,
}: InviteEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>You've been invited to {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Text style={brandMark}>Find Your Top Talent</Text>
        </Section>
        <Section style={body}>
          <Heading style={h1}>You've been invited.</Heading>
          <Text style={text}>
            You've been invited to join{' '}
            <Link href={siteUrl} style={link}>
              <strong>{siteName}</strong>
            </Link>
            . Accept the invitation to create your account and begin.
          </Text>
          <Button style={button} href={confirmationUrl}>
            Accept invitation
          </Button>
          <Text style={{ ...text, marginTop: '32px', fontSize: '13px' }}>
            If this wasn't expected, you can safely ignore this email.
          </Text>
        </Section>
        <Section style={footerWrap}>
          <Text style={footer}>{siteName} — your unique business, decoded.</Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default InviteEmail
