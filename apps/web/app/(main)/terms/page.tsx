"use client";

import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#06060A] relative">
      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-primary/[0.04] blur-[160px] animate-orb" />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-6 pt-24 pb-20">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-8 text-sm">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
          Back to Co-Patner
        </Link>

        <h1 className="text-3xl font-black text-white mb-2">TERMS OF USE OF SERVICES</h1>
        <p className="text-xs text-gray-600 mb-10">Effective Date: July 2026</p>

        <div className="space-y-8 text-sm text-gray-400 leading-relaxed">
          <p>
            These Terms of Service (&quot;TOS&quot;) are an electronic document in terms of the Information Technology Act, 2000 and rules made thereunder and the amended provisions pertaining to electronic documents / records in various statutes as amended by the Information Technology Act, 2000. This TOS does not require any physical, electronic or digital signature.
          </p>
          <p>
            The mobile application, <span className="text-white font-bold">Co-Patner</span> (hereinafter &quot;App&quot;), is owned and operated by <span className="text-white font-bold">Omaza Innovations LLP</span> (&quot;We&quot;, &quot;Us&quot;, or &quot;Our&quot;).
          </p>

          {/* Grievance Officer */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-white font-bold mb-3">Grievance Officer</h3>
            <p className="text-gray-400">In compliance with Rule 3(2) of the Information Technology (Intermediary Guidelines & Digital Media Ethics Codes) Rules, 2021:</p>
            <div className="mt-3 space-y-1">
              <p><span className="text-gray-500">Name:</span> <span className="text-white font-medium">Mohammad Akaram</span></p>
              <p><span className="text-gray-500">Email:</span> <span className="text-white font-medium">grievance.officer@omaza.in</span></p>
            </div>
          </div>

          {/* Legally Binding */}
          <div>
            <h2 className="text-white font-bold text-lg mb-3">LEGALLY BINDING TERMS OF SERVICE</h2>
            <p>These TOS are a legally binding document between the User/you (&quot;User/You/Your&quot;) and the Company. These TOS apply to any User accessing or using, any services made available by the Company on our App, and to any other related services or applications provided by Us (collectively, the &quot;Services&quot;).</p>
            <p className="mt-3">By accessing or using or attempting to access or use any Services (including the App) in any manner whatsoever, You agree to be bound by this TOS.</p>
          </div>

          {/* Our Services */}
          <div>
            <h2 className="text-white font-bold text-lg mb-3">OUR SERVICES</h2>
            <p>We are a Social Media Intermediary that enables audio or video or other digital interactions between Users and Streamers for creation of social bonds, companionship and entertainment, alongwith other associated features involving only online engagements (collectively &quot;Services&quot;).</p>
            <p className="mt-3">The Services on the App currently include:</p>
            <ul className="mt-2 space-y-1.5 ml-4 list-disc">
              <li>Creating and maintaining your own profile and other Content on the App after registration</li>
              <li>Viewing profiles of others (including Streamers) after registration</li>
              <li>Live online social interactions between User &amp; Streamer</li>
              <li>Creating or sharing Content; connecting, following, engaging and communicating with other profiles</li>
              <li>Sending and receiving comments or information or communication in audio/video or other digital formats</li>
            </ul>
          </div>

          {/* Age Restrictions */}
          <div>
            <h2 className="text-white font-bold text-lg mb-3">AGE AND RELATED RESTRICTIONS</h2>
            <p>The Services are intended solely for Users who are above <span className="text-white font-bold">18 (eighteen) years</span> and above and who satisfy the criteria described in this TOS. You represent and warrant that You:</p>
            <ul className="mt-2 space-y-1.5 ml-4 list-disc">
              <li>are of legal age to form a binding contract (at least 18 years old)</li>
              <li>have not previously been suspended or removed from using our Services</li>
              <li>have full power and authority to agree to this TOS</li>
              <li>have not committed any criminal offence</li>
              <li>are not prohibited in the jurisdiction applicable to You from availing our Services</li>
            </ul>
            <p className="mt-3">Users below the age of 18 years (&quot;Minor(s)&quot;) cannot use the App.</p>
          </div>

          {/* Accounts */}
          <div>
            <h2 className="text-white font-bold text-lg mb-3">ACCOUNTS &amp; IDENTIFICATION</h2>
            <p>We provide you with a free account, however, you are required to be registered with us, to avail full functionalities of our Services.</p>
            <p className="mt-3">You must use original and distinct credentials to create an account on our App. Username, handle names, display name must not contain derogatory, demeaning or misleading language or messages or identity or images.</p>
          </div>

          {/* Content Restrictions */}
          <div>
            <h2 className="text-white font-bold text-lg mb-3">CONTENT RELATED RESTRICTIONS</h2>
            <p>Any Content on our App must be in compliance with the Intermediary Guidelines 2021 issued by the Government of India.</p>
            <p className="mt-3">A user of the App shall not host, display, upload, modify, publish, transmit, store, update or share on the App, the following information that:</p>
            <ul className="mt-2 space-y-1.5 ml-4 list-disc">
              <li>May be harmful to minors or children, including any sexually explicit, abusive content</li>
              <li>Depicts content which is sexually explicit, violent in nature, abusive, and grossly harmful</li>
              <li>Deceives or misleads the addressee about the origin of the message</li>
              <li>Threatens the unity, integrity, defence, security or sovereignty of India</li>
              <li>Is invasive of another&apos;s privacy, hateful, or racially, ethnically objectionable</li>
              <li>Infringes on any third party&apos;s rights, including copyright, trademark, privacy, and publicity rights</li>
              <li>Threatens, harasses, or bully other Users or third parties</li>
              <li>Is in violation of applicable law</li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h2 className="text-white font-bold text-lg mb-3">SUPPORT</h2>
            <p>The Company offers email based, and in App online support tools for users. You may access support by emailing at <span className="text-primary-light">app-support@omaza.in</span>.</p>
          </div>

          {/* User License */}
          <div>
            <h2 className="text-white font-bold text-lg mb-3">USER LICENSE</h2>
            <p>By submitting, posting, displaying, or communicating on our App, you hereby grant to us a non-exclusive, royalty-free, transferable, sub-licensable, worldwide license to host, use, distribute, modify, run, copy, reproduce, process, such Content across all formats, media now known, or which may come into existence later.</p>
          </div>

          {/* Payments */}
          <div>
            <h2 className="text-white font-bold text-lg mb-3">PAYMENTS</h2>
            <p>To the extent the Service or any portion thereof requires payment of a fee, you may be required to select a payment plan and provide information regarding your credit card or other payment instruments.</p>
            <p className="mt-3">It is strictly prohibited to make any direct payment to any other User, including a Streamer. Company accepts no responsibility.</p>
          </div>

          {/* Indemnification */}
          <div>
            <h2 className="text-white font-bold text-lg mb-3">INDEMNIFICATION</h2>
            <p>You will defend, indemnify, and hold harmless the Company, its affiliates, and their respective shareholders, members, directors, officers, employees, attorneys, agents, representatives, suppliers and contractors from any claim, demand, lawsuit, action, proceeding, investigation, liability, damage, loss, cost or expense arising out or relating to Your use of, or conduct in connection with, the Services.</p>
          </div>

          {/* Limitation of Liability */}
          <div>
            <h2 className="text-white font-bold text-lg mb-3">LIMITATION OF LIABILITY</h2>
            <p>TO THE FULLEST EXTENT PERMITTED BY LAW, IN NO EVENT SHALL COMPANY BE LIABLE UNDER CONTRACT, TORT, STRICT LIABILITY, NEGLIGENCE OR ANY OTHER LEGAL OR EQUITABLE THEORY WITH RESPECT TO THE SERVICE FOR ANY LOST PROFITS, DATA LOSS, LOSS OF GOODWILL OR OPPORTUNITY, OR SPECIAL, INDIRECT, INCIDENTAL, PUNITIVE, OR CONSEQUENTIAL DAMAGES OF ANY KIND WHATSOEVER.</p>
          </div>

          {/* Governing Law */}
          <div>
            <h2 className="text-white font-bold text-lg mb-3">GOVERNING LAW</h2>
            <p>This TOS is governed by the laws of India. The Courts of Lucknow shall have exclusive jurisdiction over any disputes arising out of or in relation to this TOS.</p>
          </div>

          {/* Entire Agreement */}
          <div>
            <h2 className="text-white font-bold text-lg mb-3">ENTIRE AGREEMENT</h2>
            <p>This TOS contains the entire agreement and supersedes all prior and contemporaneous understandings between the parties regarding the Services on the App.</p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/[0.06] text-center">
          <p className="text-xs text-gray-600">&copy; 2026 Omaza Innovations LLP. All Rights Reserved.</p>
        </div>
      </div>
    </div>
  );
}
