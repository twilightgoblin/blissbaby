import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const faqs = [
      {
        id: '1',
        category: 'Orders',
        question: 'How do I track my order?',
        answer: 'Once your order is shipped, you will receive a tracking number via email. You can also check your order status in your account under "My Orders".'
      },
      {
        id: '2',
        category: 'Orders',
        question: 'Can I cancel my order?',
        answer: 'You can cancel your order within 1 hour of placing it. After that, please contact our customer support for assistance.'
      },
      {
        id: '3',
        category: 'Shipping',
        question: 'What are your shipping options?',
        answer: 'We offer Standard (3-5 days), Express (1-2 days), and Overnight shipping. Free shipping is available on orders over ₹500.'
      },
      {
        id: '4',
        category: 'Shipping',
        question: 'Do you ship internationally?',
        answer: 'Currently, we only ship within India. International shipping will be available soon.'
      },
      {
        id: '5',
        category: 'Returns',
        question: 'What is your return policy?',
        answer: 'We accept returns within 30 days of delivery. Items must be in original condition with tags attached.'
      },
      {
        id: '6',
        category: 'Returns',
        question: 'How do I return an item?',
        answer: 'Go to your account, find the order, and click "Return Item". We will provide a return label and instructions.'
      },
      {
        id: '7',
        category: 'Products',
        question: 'Are your products safe for babies?',
        answer: 'Yes, all our products meet international safety standards and are tested for baby safety. We only source from certified manufacturers.'
      },
      {
        id: '8',
        category: 'Products',
        question: 'Do you offer product warranties?',
        answer: 'Yes, most of our products come with manufacturer warranties. Check individual product pages for warranty details.'
      },
      {
        id: '9',
        category: 'Account',
        question: 'How do I create an account?',
        answer: 'Click "Sign Up" at the top of the page and follow the instructions. You can also create an account during checkout.'
      },
      {
        id: '10',
        category: 'Account',
        question: 'I forgot my password. What should I do?',
        answer: 'Click "Forgot Password" on the login page and follow the instructions to reset your password.'
      },
      {
        id: '11',
        category: 'Payment',
        question: 'What payment methods do you accept?',
        answer: 'We accept all major credit cards, debit cards, UPI, net banking, and digital wallets.'
      },
      {
        id: '12',
        category: 'Payment',
        question: 'Is my payment information secure?',
        answer: 'Yes, we use industry-standard encryption and secure payment gateways to protect your information.'
      }
    ]

    const categories = [...new Set(faqs.map(faq => faq.category))]

    return NextResponse.json({
      faqs,
      categories
    })
  } catch (error) {
    console.error('Error fetching FAQs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch FAQs' },
      { status: 500 }
    )
  }
}