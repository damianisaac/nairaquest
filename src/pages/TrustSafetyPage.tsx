import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// ─── Policy documents ─────────────────────────────────────────────────────────

const POLICIES = [
  {
    id: 'privacy',
    label: 'Privacy Policy',
    icon: '🔒',
    effective: '16 September 2026',
    sections: [
      {
        title: 'Introduction',
        body: 'This Privacy Policy describes how Teens Can Code ("we", "us", or "our") collects, uses, and shares information about you when you use NairaQuest.NG (the "Service"). By using the Service, you agree to the collection and use of information in accordance with this policy.',
      },
      {
        title: 'Information We Collect',
        body: null,
        bullets: [
          '**Information you provide to us:** Account registration details, profile information, communications, and content you submit.',
          '**Information collected automatically:** Usage data, device information, IP addresses, and cookies and similar tracking technologies when you use the Service.',
          '**Information from third parties:** Where you connect third-party accounts or where third parties provide us with information about you in accordance with their privacy policies.',
        ],
      },
      {
        title: 'How We Use Your Information',
        body: 'We use the information we collect to:',
        bullets: [
          'Provide, maintain, and improve the Service',
          'Process transactions and send related information',
          'Send technical notices, updates, security alerts, and administrative messages',
          'Respond to comments, questions, and requests',
          'Monitor and analyze usage patterns and trends',
          'Detect, investigate, and prevent fraudulent transactions and other illegal activities',
          'Comply with legal obligations',
        ],
      },
      {
        title: 'Legal Basis for Processing (GDPR/UK GDPR)',
        body: 'If you are located in the European Economic Area (EEA) or the United Kingdom, our legal basis for collecting and using your personal data depends on the data concerned and the specific context:',
        bullets: [
          '**Contractual necessity:** Processing required to fulfill our contract with you',
          '**Legitimate interests:** Where processing is in our legitimate business interests and not overridden by your rights',
          '**Legal obligations:** Where we must comply with a legal requirement',
          '**Consent:** Where you have given us specific consent to process your data for a specific purpose',
        ],
      },
      {
        title: 'Information Sharing and Disclosure',
        body: 'We do not sell your personal information. We may share your information in the following circumstances:',
        bullets: [
          '**Service providers:** With vendors and service providers who perform services on our behalf',
          '**Legal requirements:** In response to lawful requests by public authorities',
          '**Business transfers:** In connection with any merger, sale of assets, or acquisition',
          '**With your consent:** With your consent or at your direction',
        ],
      },
      {
        title: 'Data Retention',
        body: 'We retain personal data for as long as necessary to fulfil the purposes for which it was collected, including satisfying legal, accounting, or reporting requirements. When data is no longer required, we delete or anonymize it using secure methods.',
      },
      {
        title: 'Your Rights',
        body: 'Depending on your location, you may have the following rights regarding your personal data:',
        bullets: [
          '**Access:** Request a copy of the personal data we hold about you',
          '**Correction:** Request that we correct inaccurate or incomplete data',
          '**Deletion:** Request that we delete your personal data',
          '**Portability:** Request a machine-readable copy of your data',
          '**Objection:** Object to processing based on legitimate interests',
        ],
        footer: 'To exercise these rights, contact us at info@teenscancode.com.ng.',
      },
      {
        title: 'Contact Us',
        body: null,
        bullets: [
          'Teens Can Code',
          'Email: info@teenscancode.com.ng',
          'Website: https://nairaquest.ng/',
        ],
      },
    ],
  },
  {
    id: 'terms',
    label: 'Terms of Use',
    icon: '📋',
    effective: '16 September 2026',
    sections: [
      {
        title: 'Acceptance of Terms',
        body: 'By accessing or using NairaQuest.NG (the "Service") operated by Teens Can Code ("Company", "we", "us", or "our"), you agree to be bound by these Terms of Use. If you disagree with any part of these terms, you may not access the Service.',
      },
      {
        title: 'Use of the Service',
        body: 'You agree to use the Service only for lawful purposes and in accordance with these Terms. You agree not to:',
        bullets: [
          'Use the Service in any way that violates applicable local, national, or international laws',
          'Engage in conduct that restricts or inhibits anyone\'s use of the Service',
          'Transmit unsolicited or unauthorized advertising or promotional material',
          'Impersonate any person or entity or misrepresent your affiliation',
          'Attempt to gain unauthorized access to any systems or networks',
        ],
      },
      {
        title: 'User Accounts',
        body: 'When you create an account with us, you must provide accurate, complete, and current information. You are responsible for safeguarding your account credentials and for all activity under your account. Notify us immediately of any unauthorized use of your account.',
      },
      {
        title: 'Intellectual Property',
        body: 'The Service and its original content, features, and functionality are owned by Teens Can Code and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.',
      },
      {
        title: 'Termination',
        body: 'We may terminate or suspend your access to the Service immediately, without prior notice or liability, for any reason, including if you breach these Terms. Upon termination, your right to use the Service will immediately cease.',
      },
      {
        title: 'Disclaimer of Warranties',
        body: 'The Service is provided "as is" and "as available" without any warranties of any kind, either express or implied. We do not warrant that the Service will be uninterrupted, secure, or error-free.',
      },
      {
        title: 'Limitation of Liability',
        body: 'To the maximum extent permitted by applicable law, Teens Can Code shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your access to or use of the Service.',
      },
      {
        title: 'Governing Law',
        body: 'These Terms shall be governed by and construed in accordance with the laws of Africa, without regard to its conflict of law provisions.',
      },
      {
        title: 'Contact',
        body: 'For questions about these Terms, contact us at info@teenscancode.com.ng.',
      },
    ],
  },
  {
    id: 'conduct',
    label: 'Code of Conduct',
    icon: '🤝',
    effective: '16 September 2026',
    sections: [
      {
        title: 'Our Pledge',
        body: 'Teens Can Code is committed to providing a welcoming, safe, and inclusive environment for all users of NairaQuest.NG. We expect all community members to treat each other with respect and dignity.',
      },
      {
        title: 'Expected Behavior',
        body: 'We expect all community members to:',
        bullets: [
          'Be respectful and considerate in all interactions',
          'Use welcoming and inclusive language',
          'Accept constructive criticism gracefully',
          'Focus on what is best for the community',
          'Show empathy toward other community members',
        ],
      },
      {
        title: 'Prohibited Behavior',
        body: 'The following behaviors are strictly prohibited:',
        bullets: [
          'Harassment, intimidation, or abuse of any kind',
          'Discrimination based on race, gender, sexual orientation, disability, nationality, religion, or any other protected characteristic',
          'Sharing sexually explicit or violent content without appropriate context',
          'Sharing others\' private information without consent',
          'Impersonating other users, staff, or public figures',
          'Spamming, phishing, or other disruptive behavior',
          'Promoting illegal activities',
        ],
      },
      {
        title: 'Enforcement',
        body: 'Violations of this Code of Conduct may result in content removal, temporary suspension, or permanent ban from the platform depending on severity and frequency. Appeals can be submitted to info@teenscancode.com.ng.',
      },
    ],
  },
  {
    id: 'antidiscrimination',
    label: 'Anti-Discrimination',
    icon: '⚖️',
    effective: '16 September 2026',
    sections: [
      {
        title: 'Zero Tolerance Commitment',
        body: 'Teens Can Code has zero tolerance for discrimination or harassment of any kind. This policy applies to all users of NairaQuest.NG and all interactions on our platform.',
      },
      {
        title: 'Protected Characteristics',
        body: 'Discrimination or harassment based on any of the following characteristics is prohibited: Age, disability, gender reassignment, marriage and civil partnership, pregnancy and maternity, race (including color, nationality, and ethnic or national origins), religion or belief, sex, and sexual orientation.',
        footer: 'This list is not exhaustive. We treat all forms of discriminatory behavior seriously.',
      },
      {
        title: 'Reporting and Action',
        body: 'If you experience or witness discrimination or harassment on NairaQuest.NG, please report it to info@teenscancode.com.ng. All reports are treated confidentially. We will investigate promptly and take appropriate action, up to and including permanent removal from the platform.',
      },
    ],
  },
  {
    id: 'security',
    label: 'Information Security',
    icon: '🛡️',
    effective: '16 September 2026',
    sections: [
      {
        title: 'Purpose and Scope',
        body: 'This Information Security Policy establishes the security requirements and responsibilities for Teens Can Code to protect the confidentiality, integrity, and availability of information assets related to NairaQuest.NG. This policy applies to all employees, contractors, and third parties who access Teens Can Code systems and data.',
      },
      {
        title: 'Security Principles',
        body: 'Our information security program is built on the following principles:',
        bullets: [
          '**Confidentiality:** Information is accessible only to those authorized to access it',
          '**Integrity:** Information is accurate, complete, and protected from unauthorized modification',
          '**Availability:** Information and systems are accessible and operational when needed',
          '**Least Privilege:** Users have only the minimum access required to perform their duties',
          '**Defense in Depth:** Multiple security controls are layered to protect critical assets',
        ],
      },
      {
        title: 'Technical Security Controls',
        body: 'Teens Can Code implements the following technical controls:',
        bullets: [
          'Encryption of data in transit (TLS 1.2 or higher) and at rest',
          'Multi-factor authentication for access to critical systems',
          'Regular vulnerability scanning and penetration testing',
          'Intrusion detection and prevention systems',
          'Automated patch management processes',
          'Secure software development lifecycle (SSDLC) practices',
          'Network segmentation and firewall controls',
        ],
      },
      {
        title: 'Security Incident Management',
        body: 'In the event of a security incident:',
        bullets: [
          '**Detection:** Incidents are identified through monitoring systems and user reports',
          '**Containment:** Affected systems are isolated to prevent further damage',
          '**Assessment:** The scope and impact of the incident are evaluated',
          '**Notification:** Affected parties and regulators are notified as required by law',
          '**Recovery:** Systems are restored from clean backups or rebuilt',
          '**Review:** Root cause analysis and lessons-learned review are conducted',
        ],
        footer: 'To report a security concern, contact info@teenscancode.com.ng.',
      },
    ],
  },
  {
    id: 'dlp',
    label: 'Data Loss Prevention',
    icon: '🗄️',
    effective: '16 September 2026',
    sections: [
      {
        title: 'Purpose',
        body: 'This Data Loss Prevention (DLP) Policy establishes requirements to prevent the unauthorized disclosure, transfer, or leakage of sensitive data at Teens Can Code. This policy applies to all data associated with NairaQuest.NG and all personnel who access that data.',
      },
      {
        title: 'Data Classification',
        body: 'Teens Can Code classifies data into the following categories:',
        bullets: [
          '**Public:** Information approved for public release with no risk if disclosed',
          '**Internal:** Information intended for internal use only; limited risk if disclosed',
          '**Confidential:** Sensitive business or customer information; significant risk if disclosed',
          '**Restricted:** Highly sensitive information (PII, financial data, health records); severe risk if disclosed',
        ],
      },
      {
        title: 'Prohibited Data Transfer Activities',
        body: 'The following activities are prohibited without explicit authorization:',
        bullets: [
          'Uploading Confidential or Restricted data to unauthorized cloud storage services',
          'Sending sensitive data via unencrypted email or messaging platforms',
          'Copying sensitive data to personal devices or removable media',
          'Sharing access credentials or data with unauthorized third parties',
          'Printing or storing sensitive data in unsecured physical locations',
          'Accessing sensitive data from unsecured public networks without a VPN',
        ],
      },
      {
        title: 'DLP Incident Response',
        body: 'If a DLP violation or suspected data leakage is detected:',
        bullets: [
          'The incident is automatically flagged and queued for review',
          'The security team assesses severity and potential regulatory impact',
          'Affected individuals and systems are identified',
          'Regulatory notification is made within required timeframes if personal data is involved',
          'Root cause analysis is conducted and controls are updated to prevent recurrence',
        ],
        footer: 'To report a suspected data loss incident, contact info@teenscancode.com.ng immediately.',
      },
    ],
  },
  {
    id: 'social',
    label: 'Social Media',
    icon: '📣',
    effective: '16 September 2026',
    sections: [
      {
        title: 'Scope and Purpose',
        body: 'This Social Media Policy governs how Teens Can Code uses social media platforms for company operations, communications, and engagement in connection with NairaQuest.NG. It applies to all employees, contractors, and authorized representatives who manage or contribute to official Teens Can Code social media accounts.',
      },
      {
        title: 'Content Guidelines',
        body: 'Content posted on official Teens Can Code social media channels must be:',
        bullets: [
          'Accurate, truthful, and not misleading',
          'Respectful of all individuals and communities',
          'Compliant with platform terms of service and applicable laws',
          'Reviewed by an authorized representative before posting',
          'Free from confidential business information unless explicitly approved',
          'Transparent about our organizational identity',
        ],
      },
      {
        title: 'Prohibited Content and Conduct',
        body: 'The following are prohibited on all official social media channels:',
        bullets: [
          'Sharing confidential, proprietary, or personally identifiable information',
          'Making statements that could constitute defamation, harassment, or discrimination',
          'Endorsing political candidates or parties on behalf of the organization',
          'Engaging in disputes or negative commentary about competitors',
          'Posting content that violates intellectual property rights',
          'Sharing content that could expose the organization to legal liability',
        ],
      },
      {
        title: 'Responding to Incidents',
        body: 'In the event of a social media crisis, negative viral content, or potential reputational issue:',
        bullets: [
          'Do not respond publicly until authorized to do so',
          'Immediately notify the relevant team lead',
          'Document the incident including screenshots and timeline',
          'Follow the escalation process as defined by internal procedures',
          'All public responses must be reviewed and approved before posting',
        ],
        footer: 'For questions or to report a social media incident, contact info@teenscancode.com.ng.',
      },
    ],
  },
  {
    id: 'accessibility',
    label: 'Accessibility',
    icon: '♿',
    effective: '16 September 2026',
    sections: [
      {
        title: 'Accessibility Commitment',
        body: 'Teens Can Code is committed to ensuring NairaQuest.NG is accessible to all users, including those with disabilities. We aim to meet or exceed the requirements of WCAG 2.1 Level AA and comply with applicable accessibility legislation in Africa.',
      },
      {
        title: 'Accessibility Features',
        body: 'Our accessibility efforts include:',
        bullets: [
          'Screen reader compatibility',
          'Full keyboard navigation support',
          'Sufficient color contrast ratios (minimum 4.5:1)',
          'Alternative text for all meaningful images',
          'Resizable text without loss of functionality',
          'Captions for video content',
          'Clear and consistent navigation',
        ],
      },
      {
        title: 'Known Limitations',
        body: 'We are continuously working to improve the accessibility of NairaQuest.NG. While we strive to meet WCAG 2.1 Level AA standards across our platform, some older content or third-party integrations may not yet fully meet these standards. We are actively working to address these limitations.',
      },
      {
        title: 'Feedback and Contact',
        body: 'We welcome feedback on our accessibility. If you encounter barriers, please contact us at info@teenscancode.com.ng with the subject line "Accessibility Feedback". We are committed to addressing accessibility issues promptly and aim to respond within 5 business days.',
      },
    ],
  },
] as const;

// ─── Helper: render body text with **bold** markers ──────────────────────────

function RichText({ text }: { text: string }) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1
          ? <strong key={i} style={{ color: '#e2e8f0', fontWeight: 700 }}>{part}</strong>
          : <span key={i}>{part}</span>
      )}
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TrustSafetyPage() {
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState<string>('privacy');

  const active = POLICIES.find(p => p.id === activeId) ?? POLICIES[0];

  return (
    <div className="min-h-screen" style={{ background: '#030712' }}>

      {/* ── Top bar ── */}
      <div
        className="sticky top-0 z-40 flex items-center gap-4 px-4 sm:px-8 py-4 border-b"
        style={{ background: 'rgba(3,7,18,0.92)', backdropFilter: 'blur(12px)', borderColor: 'rgba(255,255,255,0.07)' }}
      >
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-semibold transition-colors"
          style={{ color: 'rgba(255,255,255,0.5)' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#22c55e')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
        >
          ← Back
        </button>
        <div className="flex-1" />
        <div>
          <p className="text-xs font-bold tracking-widest uppercase" style={{ color: '#22c55e', letterSpacing: '0.1em' }}>
            NairaQuest · Teens Can Code
          </p>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Trust &amp; Safety · Effective {active.effective}</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row max-w-6xl mx-auto px-4 sm:px-8 py-10 gap-8">

        {/* ── Sidebar nav ── */}
        <nav className="lg:w-60 flex-shrink-0">
          <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>
            Policies
          </p>
          <ul className="flex lg:flex-col gap-2 flex-wrap">
            {POLICIES.map(p => {
              const isActive = p.id === activeId;
              return (
                <li key={p.id}>
                  <button
                    onClick={() => setActiveId(p.id)}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-sm font-semibold transition-all"
                    style={{
                      background: isActive ? 'rgba(34,197,94,0.12)' : 'transparent',
                      color: isActive ? '#22c55e' : 'rgba(255,255,255,0.45)',
                      border: isActive ? '1px solid rgba(34,197,94,0.3)' : '1px solid transparent',
                    }}
                  >
                    <span className="text-base leading-none">{p.icon}</span>
                    <span className="leading-tight">{p.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* ── Document body ── */}
        <article className="flex-1 min-w-0">

          {/* Document header */}
          <div className="mb-10 pb-8 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-4xl">{active.icon}</span>
              <div>
                <h1 className="font-display font-black text-white" style={{ fontSize: 'clamp(22px, 3.5vw, 34px)', lineHeight: 1.2 }}>
                  {active.label}
                </h1>
                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  Teens Can Code · NairaQuest.NG · Effective {active.effective}
                </p>
              </div>
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-10">
            {active.sections.map((section, i) => (
              <section key={i}>
                <h2
                  className="text-xs font-bold tracking-widest uppercase mb-4 pb-2 border-b"
                  style={{ color: '#22c55e', letterSpacing: '0.1em', borderColor: 'rgba(34,197,94,0.2)' }}
                >
                  {section.title}
                </h2>

                {'body' in section && section.body && (
                  <p className="text-sm leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,0.65)' }}>
                    <RichText text={section.body} />
                  </p>
                )}

                {'bullets' in section && section.bullets && (
                  <ul className="space-y-2 mb-4">
                    {(section.bullets as readonly string[]).map((b, j) => (
                      <li key={j} className="flex gap-3 text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#22c55e', minWidth: 6 }} />
                        <RichText text={b} />
                      </li>
                    ))}
                  </ul>
                )}

                {'footer' in section && section.footer && (
                  <p className="text-sm leading-relaxed mt-3" style={{ color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>
                    {section.footer}
                  </p>
                )}
              </section>
            ))}
          </div>

          {/* Disclaimer */}
          <div
            className="mt-14 p-5 rounded-xl text-xs leading-relaxed"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.3)',
            }}
          >
            <strong className="block mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Disclaimer</strong>
            This document is provided for informational purposes only and does not constitute legal advice. Consult a qualified legal professional before publishing or relying on these policy documents.
          </div>

          {/* Contact strip */}
          <div
            className="mt-6 p-5 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
            style={{ background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.15)' }}
          >
            <div>
              <p className="text-sm font-bold text-white">Questions about this policy?</p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>Our team is happy to help.</p>
            </div>
            <a
              href="mailto:info@teenscancode.com.ng"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
              style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }}
            >
              info@teenscancode.com.ng →
            </a>
          </div>

        </article>
      </div>
    </div>
  );
}
