import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const privacyPolicy = {
      lastUpdated: '2024-01-01',
      sections: [
        {
          title: 'Information We Collect',
          content: `We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us. This may include:
          
• Personal information (name, email, phone number)
• Billing and shipping addresses
• Payment information (processed securely by our payment partners)
• Order history and preferences
• Communications with our customer service team`
        },
        {
          title: 'How We Use Your Information',
          content: `We use the information we collect to:
          
• Process and fulfill your orders
• Communicate with you about your orders and account
• Provide customer support
• Send you promotional emails (with your consent)
• Improve our products and services
• Comply with legal obligations`
        },
        {
          title: 'Information Sharing',
          content: `We do not sell, trade, or rent your personal information to third parties. We may share your information with:
          
• Service providers who help us operate our business
• Payment processors to handle transactions
• Shipping companies to deliver your orders
• Legal authorities when required by law`
        },
        {
          title: 'Data Security',
          content: `We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.`
        },
        {
          title: 'Your Rights',
          content: `You have the right to:
          
• Access your personal information
• Correct inaccurate information
• Delete your account and personal information
• Opt out of marketing communications
• Request a copy of your data`
        },
        {
          title: 'Cookies',
          content: `We use cookies and similar technologies to improve your browsing experience, analyze site traffic, and personalize content. You can control cookie settings through your browser.`
        },
        {
          title: 'Children\'s Privacy',
          content: `Our services are not directed to children under 13. We do not knowingly collect personal information from children under 13. If you believe we have collected such information, please contact us.`
        },
        {
          title: 'Changes to This Policy',
          content: `We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date.`
        },
        {
          title: 'Contact Us',
          content: `If you have any questions about this privacy policy, please contact us at:
          
Email: privacy@babybliss.com
Phone: +91-XXXX-XXXX-XX
Address: [Your Business Address]`
        }
      ]
    }

    return NextResponse.json(privacyPolicy)
  } catch (error) {
    console.error('Error fetching privacy policy:', error)
    return NextResponse.json(
      { error: 'Failed to fetch privacy policy' },
      { status: 500 }
    )
  }
}