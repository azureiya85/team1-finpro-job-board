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

interface SubscriptionActivationEmailProps {
  firstName: string;
  planName: string;
  startDate: string;
  endDate: string;
  dashboardUrl: string;
}

export const SubscriptionActivationEmail = ({
  firstName,
  planName,
  startDate,
  endDate,
  dashboardUrl,
}: SubscriptionActivationEmailProps) => {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={logoContainer}>
            <Text style={title}>Job Board Platform</Text>
          </Section>
          
          <Section style={section}>
            <Text style={heading}>🎉 Subscription Activated!</Text>
            
            <Text style={text}>Hi {firstName},</Text>
            <Text style={text}>
              Great news! Your subscription payment has been approved and your <strong>{planName}</strong> subscription is now active.
            </Text>
            
            <Section style={detailsContainer}>
              <Text style={detailsTitle}>Subscription Details:</Text>
              <Text style={detailsText}>
                <strong>Plan:</strong> {planName}<br/>
                <strong>Start Date:</strong> {startDate}<br/>
                <strong>End Date:</strong> {endDate}
              </Text>
            </Section>
            
            <Text style={text}>
              You now have access to all premium features included in your subscription plan. Visit your dashboard to explore your new capabilities.
            </Text>
            
            <Section style={buttonContainer}>
              <Button style={button} href={dashboardUrl}>
                Go to Dashboard
              </Button>
            </Section>
            
            <Hr style={hr} />
            
            <Text style={footer}>
              Thank you for choosing our platform! If you have any questions about your subscription or need assistance, please don&apos;t hesitate to contact our support team.
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
  color: '#16a34a',
  margin: '0 0 16px',
  textAlign: 'center' as const,
};

const text = {
  margin: '0 0 16px',
  fontSize: '16px',
  lineHeight: '24px',
  color: '#555',
};

const detailsContainer = {
  backgroundColor: '#f8f9fa',
  padding: '16px',
  borderRadius: '6px',
  margin: '20px 0',
};

const detailsTitle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#333',
  margin: '0 0 8px',
};

const detailsText = {
  fontSize: '14px',
  lineHeight: '20px',
  color: '#555',
  margin: '0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '24px 0',
};

const button = {
  backgroundColor: '#16a34a',
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