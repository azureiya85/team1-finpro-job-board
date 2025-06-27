import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Hr,
} from '@react-email/components';

interface SubscriptionExpiredEmailProps {
  firstName: string;
  planName: string;
  endDate: string; // The date it expired
  renewUrl: string;
}

export const SubscriptionExpiredEmail = ({
  firstName,
  planName,
  endDate,
  renewUrl,
}: SubscriptionExpiredEmailProps) => {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={logoContainer}>
            <Text style={title}>Job Board Platform</Text>
          </Section>
          
          <Section style={section}>
            <Text style={heading}>Your Subscription Has Expired</Text>
            
            <Text style={text}>Hi {firstName},</Text>
            <Text style={text}>
              We&apos;re writing to let you know that your <strong>{planName}</strong> subscription expired on {endDate}.
            </Text>
            
            <Text style={text}>
              You have now lost access to premium features. To regain access and continue enjoying the benefits, please renew your subscription at your earliest convenience.
            </Text>
            
            <Section style={buttonContainer}>
              <Button style={button} href={renewUrl}>
                Renew Your Subscription
              </Button>
            </Section>
            
            <Hr style={hr} />
            
            <Text style={footer}>
              If you have any questions or had trouble renewing, please don&apos;t hesitate to contact our support team.
            </Text>
            
            <Text style={footer}>
              Best regards,<br/>
              The Job Board Team
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// --- Styles ---

const main = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '560px',
};

const logoContainer = {
  textAlign: 'center' as const,
  marginBottom: '32px',
};

const title = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#1a1a1a',
  margin: '0',
};

const section = {
  padding: '24px',
  border: 'solid 1px #dedede',
  borderRadius: '8px',
  textAlign: 'left' as const,
};

const heading = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#dc2626', // Red for warning
  margin: '0 0 16px',
  textAlign: 'center' as const,
};

const text = {
  margin: '0 0 16px',
  fontSize: '16px',
  lineHeight: '24px',
  color: '#555',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '24px 0',
};

const button = {
  backgroundColor: '#f97316', // Orange for call-to-action
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 24px',
  fontWeight: 'bold',
};

const hr = {
  borderColor: '#dedede',
  margin: '20px 0',
};

const footer = {
  color: '#898989',
  fontSize: '12px',
  margin: '0 0 8px',
};