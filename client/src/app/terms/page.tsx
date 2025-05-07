'use client'; // Ensure this runs on the client

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from 'react';

export default function TermsOfServicePage() {
    const [currentDate, setCurrentDate] = useState<string | null>(null);

    useEffect(() => {
        // Set the date only on the client side after hydration
        setCurrentDate(new Date().toLocaleDateString());
    }, []);


  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-center">Terms of Service</h1>
       <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Agreement to Terms</CardTitle>
        </CardHeader>
        <CardContent className="prose max-w-none text-muted-foreground">
            <p><strong>Last Updated:</strong> {currentDate || 'Loading date...'}</p>

            <p>These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity (“you”) and AcademiaConnect (“we,” “us” or “our”), concerning your access to and use of the AcademiaConnect platform as well as any other media form, media channel, mobile website or mobile application related, linked, or otherwise connected thereto (collectively, the “Platform”).</p>
            <p>You agree that by accessing the Platform, you have read, understood, and agree to be bound by all of these Terms of Service. If you do not agree with all of these Terms of Service, then you are expressly prohibited from using the Platform and you must discontinue use immediately.</p>

            <h2>Intellectual Property Rights</h2>
            <p>Unless otherwise indicated, the Platform is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Platform (collectively, the “Content”) and the trademarks, service marks, and logos contained therein (the “Marks”) are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws.</p>

            <h2>User Representations</h2>
            <p>By using the Platform, you represent and warrant that: (1) all registration information you submit will be true, accurate, current, and complete; (2) you will maintain the accuracy of such information and promptly update such registration information as necessary; (3) you have the legal capacity and you agree to comply with these Terms of Service; (4) you are affiliated with the participating university department; (5) you will not use the Platform for any illegal or unauthorized purpose; and (6) your use of the Platform will not violate any applicable law or regulation.</p>

            <h2>User Registration</h2>
            <p>You may be required to register with the Platform. You agree to keep your password confidential and will be responsible for all use of your account and password. We reserve the right to remove, reclaim, or change a username you select if we determine, in our sole discretion, that such username is inappropriate, obscene, or otherwise objectionable.</p>

            <h2>Prohibited Activities</h2>
            <p>You may not access or use the Platform for any purpose other than that for which we make the Platform available. The Platform may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.</p>
            <p>As a user of the Platform, you agree not to:</p>
            <ul>
                <li>Systematically retrieve data or other content from the Platform to create or compile, directly or indirectly, a collection, compilation, database, or directory without written permission from us.</li>
                <li>Engage in unauthorized framing of or linking to the Platform.</li>
                <li>Interfere with, disrupt, or create an undue burden on the Platform or the networks or services connected to the Platform.</li>
                <li>Attempt to impersonate another user or person.</li>
                <li>Use any information obtained from the Platform in order to harass, abuse, or harm another person.</li>
                <li>Use the Platform in a manner inconsistent with any applicable laws or regulations.</li>
            </ul>

            <h2>User Generated Contributions</h2>
            <p>The Platform allows you to create, submit, post, display, transmit, perform, publish, distribute, or broadcast content and materials to us or on the Platform, including but not limited to text, writings, video, audio, photographs, graphics, comments, suggestions, or personal information or other material (collectively, &quot;Contributions&quot;). Your Contributions are viewable by other users of the Platform.</p>
            <p>You warrant that your Contributions are accurate and do not violate the privacy rights, publicity rights, copyrights, contract rights, intellectual property rights, or any other rights of any third party.</p>


            <h2>Platform Management</h2>
            <p>We reserve the right, but not the obligation, to: (1) monitor the Platform for violations of these Terms of Service; (2) take appropriate legal action against anyone who, in our sole discretion, violates the law or these Terms of Service; (3) in our sole discretion and without limitation, refuse, restrict access to, limit the availability of, or disable any of your Contributions or any portion thereof; (4) otherwise manage the Platform in a manner designed to protect our rights and property and to facilitate the proper functioning of the Platform.</p>

            <h2>Term and Termination</h2>
            <p>These Terms of Service shall remain in full force and effect while you use the Platform. WITHOUT LIMITING ANY OTHER PROVISION OF THESE TERMS OF SERVICE, WE RESERVE THE RIGHT TO, IN OUR SOLE DISCRETION AND WITHOUT NOTICE OR LIABILITY, DENY ACCESS TO AND USE OF THE PLATFORM (INCLUDING BLOCKING CERTAIN IP ADDRESSES), TO ANY PERSON FOR ANY REASON OR FOR NO REASON.</p>

            <h2>Modifications and Interruptions</h2>
            <p>We reserve the right to change, modify, or remove the contents of the Platform at any time or for any reason at our sole discretion without notice. We also reserve the right to modify or discontinue all or part of the Platform without notice at any time.</p>

            <h2>Governing Law</h2>
            <p>These Terms shall be governed by and defined following the laws of [Your State/Country].</p>

            <h2>Contact Us</h2>
            <p>In order to resolve a complaint regarding the Platform or to receive further information regarding use of the Platform, please contact us at terms@academiaconnect.example.com.</p>
        </CardContent>
      </Card>
    </div>
  );
}

    