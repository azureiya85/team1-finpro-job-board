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

interface SubscriptionRejectionEmailProps {
  firstName: string;
  planName: string;
  rejectionReason?: string;
  supportUrl: string;
  subscriptionUrl: string;
}

export const SubscriptionRejectionEmail = ({
  firstName,
  planName,
  rejectionReason,
  supportUrl,
  subscriptionUrl,
}: SubscriptionRejectionEmailProps) => {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={logoContainer}>
            <Text style={title}>Job Board Platform</Text>
          </Section>
          
          <Section style={section}>
            <Text style={heading}>❌ Subscription Payment Issue</Text>
            
            <Text style={text}>Hi {firstName},</Text>
            <Text style={text}>
              We&apos;re writing to inform you that there was an issue with your <strong>{planName}</strong> subscription payment and it could not be approved at this time.
            </Text>
            
            {rejectionReason && (
              <Section style={reasonContainer}>
                <Text style={reasonTitle}>Reason for rejection:</Text>
                <Text style={reasonText}>{rejectionReason}</Text>
              </Section>
            )}
            
            <Text style={text}>
              Don&apos;t worry - you can easily resolve this issue. Here&apos;s what you can do:
            </Text>
            
            <Section style={stepsContainer}>
              <Text style={stepText}>• Check your payment information for accuracy</Text>
              <Text style={stepText}>• Ensure your payment proof is clear and valid (for bank transfers)</Text>
              <Text style={stepText}>• Try subscribing again with updated information</Text>
              <Text style={stepText}>• Contact our support team if you need assistance</Text>
            </Section>
            
            <Section style={buttonContainer}>
              <Button style={button} href={subscriptionUrl}>
                Try Again
              </Button>
            </Section>
            
            <Text style={text}>
              If you have any questions or need help resolving this issue, our support team is here to assist you.
            </Text>
            
            <Section style={buttonContainer}>
              <Button style={supportButton} href={supportUrl}>
                Contact Support
              </Button>
            </Section>
            
            <Hr style={hr} />
            
            <Text style={footer}>
              We apologize for any inconvenience and appreciate your understanding. We&apos;re committed to helping you get your subscription activated as quickly as possible.
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
  color: '#dc2626',
  margin: '0 0 16px',
  textAlign: 'center' as const,
};

const text = {
  margin: '0 0 16px',
  fontSize: '16px',
  lineHeight: '24px',
  color: '#555',
};

const reasonContainer = {
  backgroundColor: '#fef2f2',
  border: 'solid 1px #fecaca',
  padding: '16px',
  borderRadius: '6px',
  margin: '20px 0',
};

const reasonTitle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#dc2626',
  margin: '0 0 8px',
};

const reasonText = {
  fontSize: '14px',
  lineHeight: '20px',
  color: '#991b1b',
  margin: '0',
  fontStyle: 'italic',
};

const stepsContainer = {
  backgroundColor: '#f8f9fa',
  padding: '16px',
  borderRadius: '6px',
  margin: '20px 0',
};

const stepText = {
  fontSize: '14px',
  lineHeight: '20px',
  color: '#555',
  margin: '0 0 8px',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '20px 0',
};

const button = {
  backgroundColor: '#2563eb',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 24px',
  fontWeight: 'bold',
  margin: '0 0 10px',
};

const supportButton = {
  backgroundColor: '#6b7280',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '14px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '10px 20px',
  fontWeight: 'normal',
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