import React from 'react';

const TermsOfService = () => {
  const lastUpdated = "July 11, 2026";
  
  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 max-w-[1000px] mx-auto text-[#e5e1e4]">
      {/* Header section */}
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold font-display tracking-tight text-white mb-3">
          Terms of Service
        </h1>
        <p className="text-sm text-gray-500 font-mono-display">
          Last Updated: {lastUpdated}
        </p>
      </div>

      {/* Main glass-card container */}
      <div className="glass-card rounded-2xl p-6 sm:p-10 space-y-8 leading-relaxed text-[15px] border border-white/5">
        <p className="text-gray-400">
          Welcome to <strong>httpTechNex</strong>! These terms and conditions outline the rules and regulations for the use of httpTechNex's Website, located at <a href="https://httptechnex.online" className="text-[#3B82F6] hover:underline">https://httptechnex.online</a>.
        </p>

        <p className="text-gray-400">
          By accessing this website, we assume you accept these terms of service. Do not continue to use httpTechNex if you do not agree to take all of the terms and conditions stated on this page.
        </p>

        <hr className="border-white/5" />

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white font-display">1. Intellectual Property Rights</h2>
          <p className="text-gray-400">
            Unless otherwise stated, httpTechNex and/or its licensors own the intellectual property rights for all material on httpTechNex. All intellectual property rights are reserved. You may access this from httpTechNex for your own personal use subjected to restrictions set in these terms and conditions.
          </p>
          <p className="text-gray-400">You must not:</p>
          <ul className="list-disc pl-5 space-y-1.5 text-gray-400">
            <li>Republish material from httpTechNex</li>
            <li>Sell, rent or sub-license material from httpTechNex</li>
            <li>Reproduce, duplicate or copy material from httpTechNex</li>
            <li>Redistribute content from httpTechNex</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white font-display">2. User Accounts & Security</h2>
          <p className="text-gray-400">
            When you create an account with us (e.g. through StudentOS or Google login), you guarantee that the information you provide us is accurate, complete, and current at all times. Inaccurate or obsolete information may result in the immediate termination of your account on our service.
          </p>
          <p className="text-gray-400">
            You are responsible for maintaining the confidentiality of your account credentials. You agree to accept responsibility for any and all activities or actions that occur under your account.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white font-display">3. User Content</h2>
          <p className="text-gray-400">
            Parts of this website offer an opportunity for users to post and exchange opinions and information (such as the Forum module). httpTechNex does not filter, edit, publish or review comments prior to their presence on the website. Comments do not reflect the views and opinions of httpTechNex, its agents and/or affiliates. Comments reflect the views and opinions of the person who posts their views and opinions.
          </p>
          <p className="text-gray-400">
            httpTechNex reserves the right to monitor all comments and posts and to remove any content which can be considered inappropriate, offensive or causes breach of these Terms of Service.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white font-display">4. Hyperlinking to our Content</h2>
          <p className="text-gray-400">
            The following organizations may link to our Website without prior written approval: government agencies, search engines, news organizations, and online directory distributors. No use of httpTechNex's logo or other artwork will be allowed for linking absent a trademark license agreement.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white font-display">5. Disclaimer of Warranties</h2>
          <p className="text-gray-400">
            This website is provided "AS IS," with all faults, and httpTechNex expresses no representations or warranties of any kind related to this website or the materials contained on this website. Also, nothing contained on this website shall be interpreted as advising you.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white font-display">6. Limitation of Liability</h2>
          <p className="text-gray-400">
            In no event shall httpTechNex, nor any of its officers, directors, and employees, be held liable for anything arising out of or in any way connected with your use of this website, whether such liability is under contract. httpTechNex, including its officers, directors, and employees, shall not be held liable for any indirect, consequential, or special liability arising out of or in any way related to your use of this website.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white font-display">7. Severability & Variation of Terms</h2>
          <p className="text-gray-400">
            If any provision of these Terms is found to be invalid under any applicable law, such provisions shall be deleted without affecting the remaining provisions herein. httpTechNex is permitted to revise these Terms at any time as it sees fit, and by using this website you are expected to review these Terms on a regular basis.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white font-display">8. Governing Law & Jurisdiction</h2>
          <p className="text-gray-400">
            These Terms will be governed by and interpreted in accordance with the laws of your jurisdiction, and you submit to the non-exclusive jurisdiction of the state and federal courts located in your country for the resolution of any disputes.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white font-display">9. Contact Information</h2>
          <p className="text-gray-400">
            If you have any questions about these Terms, please contact us at <a href="mailto:support@httptechnex.online" className="text-[#3B82F6] hover:underline">support@httptechnex.online</a>.
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermsOfService;
