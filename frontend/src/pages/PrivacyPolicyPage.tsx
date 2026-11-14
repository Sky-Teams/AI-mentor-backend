import { LegalLayout } from "../components/LegalLayout";

export const PrivacyPolicyPage = () => (
  <LegalLayout
    eyebrow="Privacy & data"
    footerLink="Read our Terms of Service"
    footerText="Questions about this policy?"
    footerTo="/terms-of-service"
    title="Privacy Policy"
  >
    <p>
      This Privacy Policy explains how AI Mentor ("we", "us") collects, uses, shares
      and protects information when you use the AI Mentor mobile application (the
      "App"). AI Mentor helps you plan, write, review and prepare research manuscripts
      with AI-assisted feedback.
    </p>
    <p>
      By creating an account or using the App, you agree to this policy. If you do not
      agree, please do not use the App.
    </p>

    <h2>1. Information we collect</h2>
    <div className="legal-table-wrap">
      <table>
        <thead>
          <tr>
            <th scope="col">Category</th>
            <th scope="col">What it includes</th>
            <th scope="col">Why we collect it</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Account information</td>
            <td>
              Full name, email address and password (stored only in hashed form on our
              servers).
            </td>
            <td>
              To create and secure your account, verify your email, and let you sign in.
            </td>
          </tr>
          <tr>
            <td>Project content</td>
            <td>
              Project titles, article type, specialty and target journal, section text,
              references and citations, checklist progress, and the review issues you
              resolve.
            </td>
            <td>
              To provide the core features: storing your work, generating AI reviews,
              readiness scores, paraphrasing, citations and exports.
            </td>
          </tr>
          <tr>
            <td>Images and files</td>
            <td>
              Figures and images you choose to upload from your photo library or camera,
              with their captions.
            </td>
            <td>
              To attach figures to your project. We only access images you explicitly
              select.
            </td>
          </tr>
          <tr>
            <td>Subscription and payment information</td>
            <td>
              The plan or credit pack you request or hold, its status (pending, active,
              cancelled), billing period, renewal setting and credit balance, plus
              records of payments you make to us (amount, date and plan).
            </td>
            <td>
              To review plan requests, activate plans, track usage credits, and keep
              billing records.
            </td>
          </tr>
          <tr>
            <td>Crash and diagnostic data</td>
            <td>
              Crash reports, stack traces, device model, operating system version and app
              version (via Firebase Crashlytics).
            </td>
            <td>To find and fix bugs and keep the App stable.</td>
          </tr>
          <tr>
            <td>Usage and interaction data</td>
            <td>
              Screens visited, taps, scrolls and session replays of how the App is used
              (via Microsoft Clarity).
            </td>
            <td>To understand how the App is used and improve usability.</td>
          </tr>
          <tr>
            <td>Device storage</td>
            <td>
              Sign-in tokens (kept in the device's secure storage), app preferences such
              as theme and tutorial progress, and cached project data.
            </td>
            <td>
              To keep you signed in and make the App faster. This data stays on your
              device.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p>
      We do not collect your precise location, contacts, or payment card details in the
      App, and we do not sell your personal information.
    </p>

    <h2 id="payments">Payments</h2>
    <p>
      AI Mentor offers paid monthly subscription plans and one-time credit packs, priced
      in US dollars. <strong>The App does not process payments and never asks for your
      card or bank details.</strong> When you choose a plan in the App, a plan request
      is sent to our team for review. After the request is reviewed, AI-mentor contacts
      you at your registered email address with payment details, and the plan becomes
      active once payment is confirmed. We keep only the payment records described
      above. Any payment information you give to a bank or payment provider is handled
      under that provider's privacy policy. Billing records may be kept for as long as
      tax and accounting laws require, even after you delete your account.
    </p>

    <h2>2. How we use AI</h2>
    <p>
      When you request a review, paraphrase, citation or similar feature, the relevant
      project text is sent to our servers and processed by third-party AI service
      providers to generate the result. These providers process the content only to
      return the result to us and are not permitted by us to use it for advertising.
      Please do not include confidential patient data or other sensitive personal data
      about third parties in your projects. AI-generated feedback may be inaccurate and
      should be checked by you.
    </p>

    <h2>3. How we share information</h2>
    <p>We share information only as needed to run the App:</p>
    <ul>
      <li>
        <strong>Hosting and infrastructure providers</strong> that store and process
        data on our behalf.
      </li>
      <li>
        <strong>AI service providers</strong> that process project text for AI features
        (see section 2).
      </li>
      <li>
        <strong>Google Firebase Crashlytics</strong> for crash reporting –{" "}
        <a href="https://firebase.google.com/support/privacy">
          Firebase privacy information
        </a>
        .
      </li>
      <li>
        <strong>Microsoft Clarity</strong> for usage analytics –{" "}
        <a href="https://privacy.microsoft.com/privacystatement">
          Microsoft Privacy Statement
        </a>
        .
      </li>
      <li>
        <strong>Legal reasons</strong>: when required by law, or to protect the rights,
        safety and security of our users or us.
      </li>
    </ul>

    <h2>4. Data security</h2>
    <p>
      All data is transmitted over encrypted connections (HTTPS). Sign-in tokens are
      stored in the device's encrypted secure storage and passwords are never stored in
      plain text. No method of transmission or storage is 100% secure, but we take
      reasonable measures to protect your information.
    </p>

    <h2>5. Data retention</h2>
    <p>
      We keep your account and project data for as long as your account is active.
      Archived projects remain stored until you delete your account. Crash and analytics
      data are kept for the retention periods of the respective providers (generally up
      to 90 days for Crashlytics and up to 13 months for Clarity).
    </p>

    <h2 id="delete-account">6. Deleting your account and data</h2>
    <p>You can request deletion of your account and all associated data at any time:</p>
    <ol>
      <li>
        Email{" "}
        <a href="mailto:researchapp2026@gmail.com">
          researchapp2026@gmail.com
        </a>{" "}
        from the email address registered to your account with the subject{" "}
        <em>"Delete my AI Mentor account"</em>.
      </li>
    </ol>
    <p>
      Once we verify the request, we will delete your account information, projects,
      uploaded figures, references, reviews and subscription records within{" "}
      <strong>30 days</strong>. Limited records may be kept longer only where the law
      requires it (for example, for fraud prevention or legal obligations). Crash and
      analytics data are not linked to your name and expire automatically per the
      retention periods above.
    </p>
    <p>
      Uninstalling the App removes the data stored on your device but does not delete
      your account.
    </p>

    <h2>7. Your rights</h2>
    <p>
      Depending on where you live, you may have the right to access, correct, export or
      delete your personal data, and to object to or restrict certain processing. You
      can update your name and password in the App under <em>Settings → Profile</em>.
      For any other request, contact us at the email below. We will respond within 30
      days.
    </p>

    <h2>8. Children</h2>
    <p>
      The App is intended for students, researchers and professionals and is not
      directed at children under 16. We do not knowingly collect personal information
      from children. If you believe a child has provided us data, contact us and we
      will delete it.
    </p>

    <h2>9. International transfers</h2>
    <p>
      Our servers and service providers may be located outside your country. By using
      the App you understand that your information may be transferred to and processed
      in those countries, with the protections described in this policy.
    </p>

    <h2>10. Changes to this policy</h2>
    <p>
      We may update this policy from time to time. We will change the effective date
      above and, for significant changes, notify you in the App or by email.
    </p>

    <h2>11. Contact us</h2>
    <p>
      AI Mentor
      <br />
      Email:{" "}
      <a href="mailto:researchapp2026@gmail.com">researchapp2026@gmail.com</a>
      <br />
      Website:{" "}
      <a href="https://ai-mentor-backend-2.onrender.com/">
        https://ai-mentor-backend-2.onrender.com/
      </a>
    </p>
  </LegalLayout>
);
