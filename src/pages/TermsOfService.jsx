import React from "react";
import { Link } from "react-router-dom";

function TermsOfService() {
  return (
    <div className="container py-5" style={{ maxWidth: "900px" }}>
      <Link to="/" className="btn btn-link mb-3">
        <i className="bi bi-arrow-left me-2"></i>Back to Home
      </Link>

      <h1 className="mb-4" style={{ color: "#003087" }}>Terms of Service</h1>
      <p className="text-muted mb-4">
        <strong>Last Updated:</strong> December 2025
      </p>

      <div className="card shadow-sm p-4">
        <h3 className="mt-4 mb-3" style={{ color: "#003087" }}>1. Acceptance of Terms</h3>
        <p>
          By accessing and using Free Stuff Niels Brock ("the Service"), you agree to be bound by these Terms of Service. 
          If you do not agree to abide by the above, please do not use this service.
        </p>

        <h3 className="mt-4 mb-3" style={{ color: "#003087" }}>2. Use License</h3>
        <p>
          Permission is granted to temporarily download one copy of the materials (information or software) on Free Stuff Niels Brock 
          for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this 
          license you may not:
        </p>
        <ul>
          <li>Modifying or copying the materials</li>
          <li>Using the materials for any commercial purpose or for any public display</li>
          <li>Attempting to decompile or reverse engineer any software contained on the Service</li>
          <li>Removing any copyright or other proprietary notations from the materials</li>
          <li>Transferring the materials to another person or "mirroring" the materials on any other server</li>
          <li>Harassing, threatening, or defaming other users</li>
          <li>Posting prohibited content (hate speech, violence, illegal items)</li>
        </ul>

        <h3 className="mt-4 mb-3" style={{ color: "#003087" }}>3. Disclaimer</h3>
        <p>
          The materials on Free Stuff Niels Brock are provided on an 'as is' basis. Free Stuff Niels Brock makes no warranties, 
          expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties 
          or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation 
          of rights.
        </p>

        <h3 className="mt-4 mb-3" style={{ color: "#003087" }}>4. Limitations</h3>
        <p>
          In no event shall Free Stuff Niels Brock or its suppliers be liable for any damages (including, without limitation, damages for 
          loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Free Stuff 
          Niels Brock, even if we or an authorized representative has been notified orally or in writing of the possibility of such damage.
        </p>

        <h3 className="mt-4 mb-3" style={{ color: "#003087" }}>5. Accuracy of Materials</h3>
        <p>
          The materials appearing on Free Stuff Niels Brock could include technical, typographical, or photographic errors. 
          Free Stuff Niels Brock does not warrant that any of the materials on the Service are accurate, complete, or current. 
          Free Stuff Niels Brock may make changes to the materials contained on the Service at any time without notice.
        </p>

        <h3 className="mt-4 mb-3" style={{ color: "#003087" }}>6. Links</h3>
        <p>
          Free Stuff Niels Brock has not reviewed all of the sites linked to its website and is not responsible for the contents of any 
          such linked site. The inclusion of any link does not imply endorsement by Free Stuff Niels Brock of the site. Use of any such 
          linked website is at the user's own risk.
        </p>

        <h3 className="mt-4 mb-3" style={{ color: "#003087" }}>7. Modifications</h3>
        <p>
          Free Stuff Niels Brock may revise these terms of service for the Service at any time without notice. By using this Service, 
          you are agreeing to be bound by the then current version of these terms of service.
        </p>

        <h3 className="mt-4 mb-3" style={{ color: "#003087" }}>8. Governing Law</h3>
        <p>
          These terms and conditions are governed by and construed in accordance with the laws of Denmark, and you irrevocably submit 
          to the exclusive jurisdiction of the courts in that location.
        </p>

        <h3 className="mt-4 mb-3" style={{ color: "#003087" }}>9. User Accounts</h3>
        <p>
          <strong>Registration:</strong> To post items, you must create an account with accurate information.
        </p>
        <p>
          <strong>Responsibility:</strong> You are responsible for maintaining the confidentiality of your account and password and for 
          all activities that occur under your account.
        </p>
        <p>
          <strong>Prohibited Conduct:</strong> You agree not to use the Service to:
        </p>
        <ul>
          <li>Post items that are stolen, counterfeit, or illegal</li>
          <li>Harass, threaten, or abuse other users</li>
          <li>Spam or post promotional content</li>
          <li>Engage in fraud or deception</li>
          <li>Post explicit, offensive, or hateful content</li>
        </ul>

        <h3 className="mt-4 mb-3" style={{ color: "#003087" }}>10. Item Posting</h3>
        <p>
          <strong>Responsibility:</strong> You are solely responsible for the items you post and their accuracy.
        </p>
        <p>
          <strong>No Warranties:</strong> Items are sold/given "as-is" without any warranty from Free Stuff Niels Brock. 
          All transactions are between users.
        </p>
        <p>
          <strong>Prohibited Items:</strong> The following cannot be posted:
        </p>
        <ul>
          <li>Illegal items or stolen goods</li>
          <li>Weapons or dangerous items</li>
          <li>Adult content or services</li>
          <li>Items that violate intellectual property rights</li>
          <li>Items that pose health/safety risks</li>
        </ul>

        <h3 className="mt-4 mb-3" style={{ color: "#003087" }}>11. User-to-User Transactions</h3>
        <p>
          <strong>Direct Responsibility:</strong> Free Stuff Niels Brock is not a party to any transaction between users. 
          We do not facilitate payments, handle disputes, or guarantee the condition of items.
        </p>
        <p>
          <strong>Safety:</strong> Always meet in public places. We recommend meeting on campus (library, canteen, etc.). 
          Never share personal financial information.
        </p>

        <h3 className="mt-4 mb-3" style={{ color: "#003087" }}>12. Intellectual Property</h3>
        <p>
          All content on Free Stuff Niels Brock, including text, images, and code, is owned by or licensed to us. 
          You may not reproduce, distribute, or transmit any content without our written permission.
        </p>

        <h3 className="mt-4 mb-3" style={{ color: "#003087" }}>13. Content Removal</h3>
        <p>
          We reserve the right to remove any content that violates these terms or is offensive, illegal, or harmful. 
          We may ban users who repeatedly violate these rules.
        </p>

        <h3 className="mt-4 mb-3" style={{ color: "#003087" }}>14. Limitation of Liability</h3>
        <p>
          Free Stuff Niels Brock SHALL NOT BE LIABLE for any indirect, incidental, special, consequential, or punitive damages 
          resulting from your use of or inability to use the Service or materials, even if we have been advised of the possibility 
          of such damages.
        </p>

        <h3 className="mt-4 mb-3" style={{ color: "#003087" }}>15. Indemnification</h3>
        <p>
          You agree to indemnify and hold Free Stuff Niels Brock and its officers, directors, employees, and agents harmless from any 
          claims, damages, losses, or expenses arising from your use of the Service or violation of these terms.
        </p>

        <h3 className="mt-4 mb-3" style={{ color: "#003087" }}>16. Dispute Resolution</h3>
        <p>
          Any disputes should first be reported to us at <strong>support@freestuffnielsbrock.dk</strong>. 
          We will attempt to resolve disputes informally. If informal resolution fails, disputes shall be governed by Danish law.
        </p>

        <h3 className="mt-4 mb-3" style={{ color: "#003087" }}>17. Termination</h3>
        <p>
          We reserve the right to suspend or terminate your account at any time, with or without cause. 
          Upon termination, your right to use the Service will immediately cease.
        </p>

        <h3 className="mt-4 mb-3" style={{ color: "#003087" }}>18. Contact Information</h3>
        <p>
          If you have questions about these Terms of Service, please contact us at:
        </p>
        <div className="alert alert-light">
          <strong>Email:</strong> <a href="mailto:freestuffsupport@proton.me">freestuffsupport@proton.me</a><br />
          <strong>Address:</strong> Niels Brock, Copenhagen, Denmark
        </div>

        <hr className="my-5" />

        <p className="text-muted text-center">
          <small>Last Updated: December 2025</small>
        </p>
      </div>
    </div>
  );
}

export default TermsOfService;