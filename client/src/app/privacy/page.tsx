'use client'; // Ensure this runs on the client

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from 'react';

export default function PrivacyPolicyPage() {
    const [currentDate, setCurrentDate] = useState<string | null>(null);

    useEffect(() => {
        // Set the date only on the client side after hydration
        setCurrentDate(new Date().toLocaleDateString());
    }, []);


  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-center">Privacy Policy</h1>
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Our Commitment to Your Privacy</CardTitle>
        </CardHeader>
        <CardContent className="prose max-w-none text-muted-foreground">
          <p><strong>Last Updated:</strong> {currentDate || 'Loading date...'}</p>

          <h2>Introduction</h2>
          <p>Welcome to AcademiaConnect. We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about this privacy notice, or our practices with regards to your personal information, please contact us.</p>

          <h2>Information We Collect</h2>
          <p>We collect personal information that you voluntarily provide to us when you register on the platform, express an interest in obtaining information about us or our products and services, when you participate in activities on the platform or otherwise when you contact us.</p>
          <p>The personal information that we collect depends on the context of your interactions with us and the platform, the choices you make and the products and features you use. The personal information we collect may include the following:</p>
          <ul>
            <li>Personal Information Provided by You: Name, email address, university affiliation, department, title, research interests, bio, publications, project details, contact information, profile picture, and collaboration preferences.</li>
            <li>Information Automatically Collected: We may automatically collect certain information when you visit, use or navigate the platform. This information does not reveal your specific identity but may include device and usage information.</li>
          </ul>

          <h2>How We Use Your Information</h2>
          <p>We use personal information collected via our platform for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.</p>
           <ul>
                <li>To facilitate account creation and logon process.</li>
                <li>To post testimonials with your consent.</li>
                <li>Request feedback.</li>
                <li>To enable user-to-user communications (collaboration requests).</li>
                <li>To manage user accounts.</li>
                <li>To send administrative information to you.</li>
                <li>To protect our Services.</li>
                <li>To respond to legal requests and prevent harm.</li>
           </ul>


          <h2>Will Your Information Be Shared With Anyone?</h2>
          <p>We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations.</p>
          <p>Specifically, your profile information (excluding potentially sensitive contact details you choose not to share publicly) will be visible to other registered users of the AcademiaConnect platform to facilitate the core purpose of finding collaborators.</p>

          <h2>How Long Do We Keep Your Information?</h2>
          <p>We keep your information for as long as necessary to fulfill the purposes outlined in this privacy notice unless otherwise required by law.</p>

          <h2>How Do We Keep Your Information Safe?</h2>
          <p>We aim to protect your personal information through a system of organizational and technical security measures. However, despite our safeguards and efforts to secure your information, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure.</p>

          <h2>What Are Your Privacy Rights?</h2>
          <p>In some regions, you have rights that allow you greater access to and control over your personal information. You may review, change, or terminate your account at any time.</p>

          <h2>Updates to This Notice</h2>
          <p>We may update this privacy notice from time to time. The updated version will be indicated by an updated &quot;Last Updated&quot; date.</p>

          <h2>How Can You Contact Us About This Notice?</h2>
          <p>If you have questions or comments about this notice, you may email us at privacy@academiaconnect.example.com or by post to [Your University Department Address].</p>
        </CardContent>
      </Card>
    </div>
  );
}

    