/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
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
  text,
  button,
  footerWrap,
  footer,
} from './_shared-styles.ts'
import { BRAND_NAME, BRAND_TAGLINE, GAME_NAME } from '../senders.ts'

// Issue #375: the signup confirmation in the game's voice. The game name, one line, one button.
export const SIGNUP_EMAIL_LINE =
  'Confirm your email to keep your top talent and open your mission.'

// The auth hook passes siteName, siteUrl and recipient to every template; this one does not
// use them (the preview data and the hook keep the same shape).
interface SignupEmailProps {
  siteName?: string
  siteUrl?: string
  recipient?: string
  confirmationUrl: string
}

export const SignupEmail = ({ confirmationUrl }: SignupEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{SIGNUP_EMAIL_LINE}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Text style={brandMark}>{GAME_NAME}</Text>
        </Section>
        <Section style={body}>
          <Text style={text}>{SIGNUP_EMAIL_LINE}</Text>
          <Button style={button} href={confirmationUrl}>
            Confirm email
          </Button>
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

export default SignupEmail
