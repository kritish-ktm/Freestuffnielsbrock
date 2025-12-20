import React from "react";
import { Link } from "react-router-dom";

function PrivacyPolicy() {
  return (
    <div className="container py-5" style={{ maxWidth: "900px" }}>
      <Link to="/" className="btn btn-link mb-3">
        <i className="bi bi-arrow-left me-2"></i>Back to Home
      </Link>

      <h1 className="mb-4" style={{ color: "#003087" }}>Privacy Policy</h1>
      <p className="text-muted mb-4">
        <strong>Last Updated:</strong> December 2025
      </p>

      <div className="card shadow-sm p-4">
        <h3 className="mt-4 mb-3" style={{ color: "#003087" }}>1. Introduction</h3>
        <p>
          Free Stuff Niels Brock ("we", "us", "our", or "Company") operates the Free Stuff platform. 
          This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website 
          and mobile application (the "Service").
        </p>

        <h3 className="mt-4 mb-3" style={{ color: "#003087" }}>2. Information We Collect</h3>
        
        <p><strong>Account & Identity Verification Information:</strong></p>
        <ul>
          <li>Email address (required for registration)</li>
          <li>Full name (required for community identification)</li>
          <li>Phone number (required for account verification and recovery)</li>
          <li>Date of birth (required for age verification)</li>
          <li>Student ID (required for verification of official student status)</li>
          <li>Section (academic section at Niels Brock)</li>
          <li>Intake month (when you started at Niels Brock)</li>
          <li>Course / Program (your course or program of study)</li>
          <li>Authentication data from Google</li>
        </ul>

        <p className="mt-3"><strong>Item Information:</strong></p>
        <ul>
          <li>Item name, description, category, condition</li>
          <li>Price (if any)</li>
          <li>Pickup location</li>
          <li>Item images</li>
          <li>WhatsApp number (for connecting interested buyers with sellers)</li>
        </ul>

        <p className="mt-3"><strong>Community Interaction Data:</strong></p>
        <ul>
          <li>Items marked as interested</li>
          <li>Request history (who showed interest in your items)</li>
          <li>Comments and feedback on the platform</li>
          <li>User feedback and ratings</li>
        </ul>

        <p className="mt-3"><strong>Automatic Information:</strong></p>
        <ul>
          <li>Browser type and IP address</li>
          <li>Pages visited and time spent</li>
          <li>Cookies and local storage data</li>
          <li>Device information</li>
          <li>Analytics data (user behavior and interaction patterns)</li>
        </ul>

        <h3 className="mt-4 mb-3" style={{ color: "#003087" }}>3. How We Use Your Information</h3>
        <ul>
          <li>To create and maintain your account</li>
          <li>To verify your identity as a Niels Brock student and prevent fraud</li>
          <li>To display your posted items and profile information to other users</li>
          <li>To share your WhatsApp number with interested buyers so they can contact you</li>
          <li>To notify you when someone shows interest in your items</li>
          <li>To enable communication and transactions between users</li>
          <li>To build and strengthen the Niels Brock student community</li>
          <li>To improve our Service and user experience</li>
          <li>To detect, prevent, and address fraud, abuse, and security issues</li>
          <li>To comply with legal obligations and enforce our Terms & Conditions</li>
          <li>To send important service updates and security alerts</li>
        </ul>

        <h3 className="mt-4 mb-3" style={{ color: "#003087" }}>4. Data Storage & Security</h3>
        <p>
          Your data is stored on <strong>Supabase</strong> (PostgreSQL database) and <strong>Vercel</strong> (hosting). 
          Both services comply with GDPR and have data centers in the EU.
        </p>
        <p>
          <strong>Security Measures:</strong>
        </p>
        <ul>
          <li>All data is encrypted in transit using HTTPS/TLS protocols</li>
          <li>Passwords are encrypted and never stored in plain text</li>
          <li>Access to personal data is restricted to authorized personnel only</li>
          <li>Regular security audits and updates are performed</li>
        </ul>
        <p className="mt-3">
          However, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security.
        </p>

        <h3 className="mt-4 mb-3" style={{ color: "#003087" }}>5. Fraud Prevention & Community Safety</h3>
        <p>
          We collect identity verification information (name, phone, date of birth, student ID) specifically to:
        </p>
        <ul>
          <li>Prevent fraudulent accounts and misuse of the platform</li>
          <li>Maintain a safe and trustworthy community</li>
          <li>Verify that users are legitimate Niels Brock students</li>
          <li>Protect community members from scams and abuse</li>
          <li>Enforce account suspension policies for fraudulent users</li>
        </ul>

        <h3 className="mt-4 mb-3" style={{ color: "#003087" }}>6. Cookies & Local Storage</h3>
        <p>
          We use <strong>localStorage</strong> to save:
        </p>
        <ul>
          <li>Interested items (wishlists)</li>
          <li>Search preferences and filters</li>
        </ul>
        <p className="mt-3">
          <strong>You can clear this data anytime:</strong> Browser Settings → Clear Cache/Cookies
        </p>

        <h3 className="mt-4 mb-3" style={{ color: "#003087" }}>7. Sharing Your Information</h3>
        <p>
          <strong>Your WhatsApp number is shared with:</strong>
        </p>
        <ul>
          <li>Users who mark your items as interested (so they can contact you directly)</li>
        </ul>
        <p className="mt-3">
          <strong>Your profile information is visible to:</strong>
        </p>
        <ul>
          <li>All logged-in users on the platform (name, section, course)</li>
          <li>Users viewing your posted items</li>
        </ul>
        <p className="mt-3">
          <strong>Your information is NOT shared with:</strong>
        </p>
        <ul>
          <li>Third-party advertisers or marketing companies</li>
          <li>External services (except as described below)</li>
          <li>Any other parties without your explicit consent</li>
        </ul>

        <h3 className="mt-4 mb-3" style={{ color: "#003087" }}>8. Third-Party Services</h3>
        <p>
          We use the following third-party services:
        </p>
        <ul>
          <li><strong>Google Authentication:</strong> For secure login (Google handles your password)</li>
          <li><strong>Supabase:</strong> For database storage and management</li>
          <li><strong>Vercel:</strong> For website hosting and deployment</li>
          <li><strong>WhatsApp:</strong> We only provide direct links; WhatsApp is not integrated with our platform</li>
        </ul>
        <p className="mt-3">
          Each service has its own privacy policy. We recommend reviewing them.
        </p>

        <h3 className="mt-4 mb-3" style={{ color: "#003087" }}>9. Your Rights (GDPR)</h3>
        <p>Under GDPR, you have the right to:</p>
        <ul>
          <li><strong>Access:</strong> Request a copy of your data</li>
          <li><strong>Correction:</strong> Update inaccurate information through your profile</li>
          <li><strong>Deletion:</strong> Request deletion of your data (Right to be Forgotten)</li>
          <li><strong>Portability:</strong> Download your data in a structured format</li>
          <li><strong>Object:</strong> Object to certain types of data processing</li>
          <li><strong>Restrict Processing:</strong> Request restriction of data processing</li>
        </ul>
        <p className="mt-3">
          To exercise any of these rights, please contact us at <a href="mailto:freestuffnbcbc@gmail.com">freestuffnbcbc@gmail.com</a>
        </p>

        <h3 className="mt-4 mb-3" style={{ color: "#003087" }}>10. Data Retention</h3>
        <ul>
          <li><strong>Active Accounts:</strong> Data kept while account is active</li>
          <li><strong>Deleted Accounts:</strong> Data deleted within 30 days of account deletion</li>
          <li><strong>Posted Items:</strong> Deleted when item is removed by the user</li>
          <li><strong>Interest Records:</strong> Deleted when user removes interest or deletes account</li>
          <li><strong>Server Logs:</strong> Deleted after 90 days</li>
          <li><strong>User Feedback & Comments:</strong> Retained as long as the user's account is active</li>
        </ul>

        <h3 className="mt-4 mb-3" style={{ color: "#003087" }}>11. Children's Privacy</h3>
        <p>
          Our Service is not intended for users under 13 years old. We do not knowingly collect data from children under 13. 
          If we discover we have collected such data, we will delete it immediately. All users must be at least 13 years old 
          to use this platform.
        </p>

        <h3 className="mt-4 mb-3" style={{ color: "#003087" }}>12. International Data Transfers</h3>
        <p>
          Your data is stored in the EU and will not be transferred outside the EU without your consent, 
          in compliance with GDPR regulations.
        </p>

        <h3 className="mt-4 mb-3" style={{ color: "#003087" }}>13. Changes to This Policy</h3>
        <p>
          We may update this Privacy Policy from time to time to reflect changes in our practices or for other operational, 
          legal, or regulatory reasons. We will notify you of any material changes by posting the new Privacy Policy on this 
          page and updating the "Last Updated" date. Your continued use of the Service after such modifications constitutes 
          your acceptance of the updated Privacy Policy.
        </p>

        <h3 className="mt-4 mb-3" style={{ color: "#003087" }}>14. Contact Us</h3>
        <p>
          If you have questions about this Privacy Policy or our privacy practices, please contact us at:
        </p>
        <div className="alert alert-light mt-3">
          <strong>Email:</strong> <a href="mailto:freestuffsupport@proton.me">freestuffsupport@proton.me</a><br />
          <strong>Phone:</strong> +45 91682540<br />
          <strong>Address:</strong> Niels Brock, Copenhagen, Denmark
        </div>

        <h3 className="mt-4 mb-3" style={{ color: "#003087" }}>15. Data Protection Authority</h3>
        <p>
          If you believe we are not respecting your privacy rights, you have the right to lodge a complaint with 
          the Danish Data Protection Authority (Datatilsynet):
        </p>
        <div className="alert alert-light">
          <strong>Website:</strong> <a href="https://www.datatilsynet.dk" target="_blank" rel="noopener noreferrer">
            www.datatilsynet.dk
          </a><br />
          <strong>Email:</strong> <a href="mailto:dt@datatilsynet.dk">dt@datatilsynet.dk</a>
        </div>

        <h3 className="mt-4 mb-3" style={{ color: "#003087" }}>16. GDPR Compliance Summary</h3>
        <p>
          Free Stuff Niels Brock is fully compliant with GDPR (EU 2016/679). We:
        </p>
        <ul>
          <li>Collect data only for specified, explicit, and legitimate purposes</li>
          <li>Collect only necessary and relevant data (data minimization)</li>
          <li>Implement appropriate security measures</li>
          <li>Respect users' privacy rights and provide mechanisms to exercise them</li>
          <li>Store data in the EU with appropriate safeguards</li>
          <li>Maintain records of processing activities</li>
          <li>Conduct privacy impact assessments for high-risk processing</li>
        </ul>

        <hr className="my-5" />

        <p className="text-muted text-center">
          <small>This Privacy Policy complies with GDPR (EU 2016/679) and Danish Data Protection Act</small>
        </p>
      </div>
    </div>
  );
}

export default PrivacyPolicy;