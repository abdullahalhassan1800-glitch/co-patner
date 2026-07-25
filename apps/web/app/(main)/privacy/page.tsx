"use client";

import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#06060A] relative">
      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-primary/[0.04] blur-[160px] animate-orb" />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-6 pt-24 pb-20">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-8 text-sm">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
          Back to Velio
        </Link>

        <h1 className="text-3xl font-black text-white mb-2">Privacy Policy</h1>
        <p className="text-xs text-gray-600 mb-10">Effective Date: July 2026</p>

        <div className="space-y-8 text-sm text-gray-400 leading-relaxed">
          <p>
            <span className="text-white font-bold">Omaza Innovations LLP</span> (&quot;We&quot;, &quot;Us&quot;, or &quot;Our&quot;) operates the Velio mobile application (the &quot;App&quot;). This Privacy Policy informs You of our policies regarding the collection, use, and disclosure of personal data when You use our Service and the choices You have associated with that data.
          </p>

          {/* Information We Collect */}
          <div>
            <h2 className="text-white font-bold text-lg mb-3">1. INFORMATION WE COLLECT</h2>
            <p>We collect several different types of information for various purposes to provide and improve our Service to You.</p>
            <h3 className="text-white font-semibold mt-4 mb-2">Types of Data Collected</h3>

            <div className="glass rounded-2xl p-5 mt-3">
              <h4 className="text-white font-semibold mb-2">Personal Data</h4>
              <p>While using our Service, we may ask You to provide Us with certain personally identifiable information that can be used to contact or identify You. This may include:</p>
              <ul className="mt-2 space-y-1 ml-4 list-disc">
                <li>Email address</li>
                <li>First name and last name</li>
                <li>Date of birth</li>
                <li>Gender</li>
                <li>Usage Data</li>
              </ul>
            </div>

            <div className="glass rounded-2xl p-5 mt-3">
              <h4 className="text-white font-semibold mb-2">Usage Data</h4>
              <p>We may also collect information that Your browser sends whenever You visit our Service or when You access the Service by or through a mobile device. This may include:</p>
              <ul className="mt-2 space-y-1 ml-4 list-disc">
                <li>IP address of Your device</li>
                <li>Browser type and version</li>
                <li>Pages of our Service that You visit</li>
                <li>Time and date of Your visit</li>
                <li>Time spent on those pages</li>
                <li>Device identifiers</li>
              </ul>
            </div>
          </div>

          {/* Use of Data */}
          <div>
            <h2 className="text-white font-bold text-lg mb-3">2. USE OF DATA</h2>
            <p>Velio uses the collected data for various purposes:</p>
            <ul className="mt-2 space-y-1.5 ml-4 list-disc">
              <li>To provide and maintain our Service</li>
              <li>To notify You about changes to our Service</li>
              <li>To allow You to participate in interactive features</li>
              <li>To provide customer support</li>
              <li>To gather analysis so that we can improve our Service</li>
              <li>To monitor the usage of our Service</li>
              <li>To detect, prevent and address technical issues</li>
              <li>To verify Your age and eligibility</li>
            </ul>
          </div>

          {/* Data Sharing */}
          <div>
            <h2 className="text-white font-bold text-lg mb-3">3. DATA SHARING AND DISCLOSURE</h2>
            <p>We may share Your personal information in the following situations:</p>
            <ul className="mt-2 space-y-1.5 ml-4 list-disc">
              <li><span className="text-white font-medium">With other Users:</span> When You interact with other Users through the Service, they may be able to see Your profile information</li>
              <li><span className="text-white font-medium">With Service Providers:</span> We may share Your information with third-party service providers to perform service-related functions</li>
              <li><span className="text-white font-medium">For Legal Requirements:</span> We may disclose Your personal data if required to do so by law or in response to valid requests by public authorities</li>
            </ul>
          </div>

          {/* Data Security */}
          <div>
            <h2 className="text-white font-bold text-lg mb-3">4. DATA SECURITY</h2>
            <p>The security of Your data is important to Us. We strive to use commercially acceptable means of protecting Your personal information. However, no method of transmission over the Internet, or method of electronic storage is 100% secure.</p>
          </div>

          {/* Video Chat Privacy */}
          <div>
            <h2 className="text-white font-bold text-lg mb-3">5. VIDEO CHAT PRIVACY</h2>
            <div className="glass rounded-2xl p-5 border border-primary/20">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-primary-light" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-1">We do not store video chats</h4>
                  <p className="text-sm text-gray-400">Your video interactions are peer-to-peer encrypted. We do not record, store, or have access to any video or audio content from your chats.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Children Privacy */}
          <div>
            <h2 className="text-white font-bold text-lg mb-3">6. CHILDREN&apos;S PRIVACY</h2>
            <p>Our Service does not address anyone under the age of 18. We do not knowingly collect personal information from anyone under the age of 18. If You are a parent or guardian and You are aware that Your child has provided Us with personal data, please contact Us. If We become aware that We have collected personal data from anyone under the age of 18 without verification of parental consent, We take steps to remove that information from Our servers.</p>
          </div>

          {/* Data Retention */}
          <div>
            <h2 className="text-white font-bold text-lg mb-3">7. DATA RETENTION</h2>
            <p>We will retain Your personal data only for as long as is necessary for the purposes set out in this Privacy Policy. We will retain and use Your data to the extent necessary to comply with our legal obligations, resolve disputes, and enforce our legal agreements and policies.</p>
          </div>

          {/* Your Rights */}
          <div>
            <h2 className="text-white font-bold text-lg mb-3">8. YOUR RIGHTS</h2>
            <p>Under applicable data protection laws, You have the following rights:</p>
            <ul className="mt-2 space-y-1.5 ml-4 list-disc">
              <li>The right to access the personal data we hold about You</li>
              <li>The right to request correction of inaccurate personal data</li>
              <li>The right to request deletion of your personal data</li>
              <li>The right to withdraw consent at any time</li>
              <li>The right to lodge a complaint with a supervisory authority</li>
            </ul>
          </div>

          {/* Changes */}
          <div>
            <h2 className="text-white font-bold text-lg mb-3">9. CHANGES TO THIS POLICY</h2>
            <p>We may update our Privacy Policy from time to time. We will notify You of any changes by posting the new Privacy Policy on this page and updating the &quot;Effective Date&quot; date. You are advised to review this Privacy Policy periodically for any changes.</p>
          </div>

          {/* Contact */}
          <div>
            <h2 className="text-white font-bold text-lg mb-3">10. CONTACT US</h2>
            <p>If You have any questions about this Privacy Policy, please contact us:</p>
            <div className="glass rounded-2xl p-5 mt-3">
              <div className="space-y-2">
                <p><span className="text-gray-500">Company:</span> <span className="text-white font-medium">Omaza Innovations LLP</span></p>
                <p><span className="text-gray-500">Email:</span> <span className="text-white font-medium">app-support@omaza.in</span></p>
                <p><span className="text-gray-500">Grievance Officer:</span> <span className="text-white font-medium">Mohammad Akaram</span></p>
                <p><span className="text-gray-500">Grievance Email:</span> <span className="text-white font-medium">grievance.officer@omaza.in</span></p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/[0.06] text-center">
          <p className="text-xs text-gray-600">&copy; 2026 Omaza Innovations LLP. All Rights Reserved.</p>
        </div>
      </div>
    </div>
  );
}
