import React from 'react';

const PrivacyPolicy = () => {
  const lastUpdated = "July 11, 2026";
  
  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 max-w-[1000px] mx-auto text-[#e5e1e4]">
      {/* Header section */}
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold font-display tracking-tight text-white mb-3">
          Privacy Policy
        </h1>
        <p className="text-sm text-gray-500 font-mono-display">
          Last Updated: {lastUpdated}
        </p>
      </div>

      {/* Main glass-card container */}
      <div className="glass-card rounded-2xl p-6 sm:p-10 space-y-8 leading-relaxed text-[15px] border border-white/5">
        <p className="text-gray-400">
          At <strong>httpTechNex</strong>, accessible from <a href="https://httptechnex.online" className="text-[#3B82F6] hover:underline">https://httptechnex.online</a>, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by httpTechNex and how we use it.
        </p>

        <p className="text-gray-400">
          If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us at <a href="mailto:support@httptechnex.online" className="text-[#3B82F6] hover:underline">support@httptechnex.online</a>.
        </p>

        <hr className="border-white/5" />

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white font-display">1. Consent</h2>
          <p className="text-gray-400">
            By using our website, you hereby consent to our Privacy Policy and agree to its terms.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white font-display">2. Information We Collect</h2>
          <p className="text-gray-400">
            The personal information that you are asked to provide, and the reasons why you are asked to provide it, will be made clear to you at the point we ask you to provide your personal information.
          </p>
          <p className="text-gray-400">
            If you contact us directly, we may receive additional information about you such as your name, email address, phone number, the contents of the message and/or attachments you may send us, and any other information you may choose to provide.
          </p>
          <p className="text-gray-400">
            When you register for an Account, we may ask for your contact information, including items such as name, company name, address, email address, and telephone number.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white font-display">3. How We Use Your Information</h2>
          <p className="text-gray-400">We use the information we collect in various ways, including to:</p>
          <ul className="list-disc pl-5 space-y-1.5 text-gray-400">
            <li>Provide, operate, and maintain our website</li>
            <li>Improve, personalize, and expand our website</li>
            <li>Understand and analyze how you use our website</li>
            <li>Develop new products, services, features, and functionality</li>
            <li>Communicate with you, either directly or through one of our partners, including for customer service, to provide you with updates and other information relating to the website, and for marketing and promotional purposes</li>
            <li>Send you emails (such as newsletters)</li>
            <li>Find and prevent fraud</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white font-display">4. Log Files</h2>
          <p className="text-gray-400">
            httpTechNex follows a standard procedure of using log files. These files log visitors when they visit websites. All hosting companies do this as part of hosting services' analytics. The information collected by log files include internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks. These are not linked to any information that is personally identifiable. The purpose of the information is for analyzing trends, administering the site, tracking users' movement on the website, and gathering demographic information.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white font-display">5. Google DoubleClick DART Cookie</h2>
          <p className="text-gray-400">
            Google is one of the third-party vendors on our site. It also uses cookies, known as DART cookies, to serve ads to our site visitors based upon their visit to our site and other sites on the internet. However, visitors may choose to decline the use of DART cookies by visiting the Google ad and content network Privacy Policy at the following URL – <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-[#3B82F6] hover:underline">https://policies.google.com/technologies/ads</a>.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white font-display">6. Our Advertising Partners</h2>
          <p className="text-gray-400">
            Some of the advertisers on our site may use cookies and web beacons. Our advertising partners include:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-gray-400">
            <li>
              <strong>Google AdSense:</strong> Their privacy policy can be viewed at <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-[#3B82F6] hover:underline">https://policies.google.com/technologies/ads</a>.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white font-display">7. Advertising Partners Privacy Policies</h2>
          <p className="text-gray-400">
            Third-party ad servers or ad networks use technologies like cookies, JavaScript, or Web Beacons that are used in their respective advertisements and links that appear on httpTechNex, which are sent directly to users' browsers. They automatically receive your IP address when this occurs. These technologies are used to measure the effectiveness of their advertising campaigns and/or to personalize the advertising content that you see on websites that you visit.
          </p>
          <p className="text-gray-400">
            Note that httpTechNex has no access to or control over these cookies that are used by third-party advertisers.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white font-display">8. Third Party Privacy Policies</h2>
          <p className="text-gray-400">
            httpTechNex's Privacy Policy does not apply to other advertisers or websites. Thus, we are advising you to consult the respective Privacy Policies of these third-party ad servers for more detailed information. It may include their practices and instructions about how to opt-out of certain options.
          </p>
          <p className="text-gray-400">
            You can choose to disable cookies through your individual browser options. To find more detailed information about cookie management with specific web browsers, check the browsers' respective websites.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white font-display">9. CCPA Privacy Rights (Do Not Sell My Personal Information)</h2>
          <p className="text-gray-400">
            Under the CCPA, among other rights, California consumers have the right to:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-gray-400">
            <li>Request that a business that collects a consumer's personal data disclose the categories and specific pieces of personal data that a business has collected about consumers.</li>
            <li>Request that a business delete any personal data about the consumer that a business has collected.</li>
            <li>Request that a business that sells a consumer's personal data, not sell the consumer's personal data.</li>
          </ul>
          <p className="text-gray-400">
            If you make a request, we have one month to respond to you. If you would like to exercise any of these rights, please contact us.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white font-display">10. GDPR Data Protection Rights</h2>
          <p className="text-gray-400">
            We would like to make sure you are fully aware of all of your data protection rights. Every user is entitled to the following:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-gray-400">
            <li><strong>The right to access</strong> – You have the right to request copies of your personal data. We may charge you a small fee for this service.</li>
            <li><strong>The right to rectification</strong> – You have the right to request that we correct any information you believe is inaccurate. You also have the right to request that we complete the information you believe is incomplete.</li>
            <li><strong>The right to erasure</strong> – You have the right to request that we erase your personal data, under certain conditions.</li>
            <li><strong>The right to restrict processing</strong> – You have the right to request that we restrict the processing of your personal data, under certain conditions.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white font-display">11. Children's Information</h2>
          <p className="text-gray-400">
            Another part of our priority is adding protection for children while using the internet. We encourage parents and guardians to observe, participate in, and/or monitor and guide their online activity.
          </p>
          <p className="text-gray-400">
            httpTechNex does not knowingly collect any Personal Identifiable Information from children under the age of 13. If you think that your child provided this kind of information on our website, we strongly encourage you to contact us immediately and we will do our best efforts to promptly remove such information from our records.
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
