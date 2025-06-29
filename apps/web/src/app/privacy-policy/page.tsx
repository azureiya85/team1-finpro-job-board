import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-gray-50/50 dark:bg-gray-900/50 py-12 md:py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-3xl md:text-4xl text-primary">Privacy Policy</CardTitle>
            <p className="text-muted-foreground pt-2">Last Updated: June 26, 2025</p>
          </CardHeader>
          <CardContent className="prose prose-gray dark:prose-invert max-w-none text-muted-foreground">
            <p>
              Welcome to Work Vault (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
            </p>

            <h3 className="text-foreground">1. Information We Collect</h3>
            <p>We may collect information about you in a variety of ways. The information we may collect on the Site includes:</p>
            <ul>
              <li>
                <strong>Personal Data:</strong> Personally identifiable information, such as your name, email address, phone number, and professional details (e.g., resume/CV, work history, skills) that you voluntarily give to us when you register with the Site or when you choose to participate in various activities related to the Site, such as applying for jobs.
              </li>
              <li>
                <strong>Company Data:</strong> Information that company representatives provide, including company name, address, company description, and job posting details.
              </li>
              <li>
                <strong>Usage Data:</strong> Information our servers automatically collect when you access the Site, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the Site.
              </li>
            </ul>

            <h3 className="text-foreground">2. How We Use Your Information</h3>
            <p>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:</p>
            <ul>
              <li>Create and manage your account.</li>
              <li>Facilitate the job application process by sharing your profile with potential employers.</li>
              <li>Email you regarding your account or job applications.</li>
              <li>Increase the efficiency and operation of the Site.</li>
              <li>Monitor and analyze usage and trends to improve your experience with the Site.</li>
              <li>Notify you of updates to our services.</li>
            </ul>

            <h3 className="text-foreground">3. Disclosure of Your Information</h3>
            <p>We may share information we have collected about you in certain situations. Your information may be disclosed as follows:</p>
            <ul>
                <li>
                    <strong>To Employers:</strong> When you apply for a job, your profile information and resume/CV will be shared with the company that posted the job listing.
                </li>
                <li>
                    <strong>By Law or to Protect Rights:</strong> If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others.
                </li>
                <li>
                    <strong>Third-Party Service Providers:</strong> We may share your information with third parties that perform services for us or on our behalf, including data analysis, email delivery, hosting services, and customer service.
                </li>
            </ul>

            <h3 className="text-foreground">4. Data Security</h3>
            <p>We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.</p>

            <h3 className="text-foreground">5. Your Rights</h3>
            <p>You have the right to review, update, or delete the information in your account at any time by logging into your account settings. If you wish to terminate your account, you may do so from your dashboard or by contacting us directly.</p>

            <h3 className="text-foreground">6. Changes to This Privacy Policy</h3>
            <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last Updated&quot; date. You are advised to review this Privacy Policy periodically for any changes.</p>

            <h3 className="text-foreground">7. Contact Us</h3>
            <p>
              If you have questions or comments about this Privacy Policy, please contact us at:
              <a href="mailto:privacy@Work Vault.com" className="text-primary hover:underline ml-2">privacy@Work Vault.com</a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}