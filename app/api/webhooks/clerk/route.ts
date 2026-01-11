import { NextRequest, NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { db } from '@/lib/db'

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET

export async function POST(req: NextRequest) {
  if (!webhookSecret) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local')
  }

  // Get the headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your secret.
  const wh = new Webhook(webhookSecret)

  let evt: any

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as any
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error occured', {
      status: 400,
    })
  }

  // Handle the webhook
  const { id } = evt.data
  const eventType = evt.type

  console.log(`Webhook with an ID of ${id} and type of ${eventType}`)
  console.log('Webhook body:', body)

  try {
    switch (eventType) {
      case 'user.created':
        await handleUserCreated(evt.data)
        break
      case 'user.updated':
        await handleUserUpdated(evt.data)
        break
      case 'user.deleted':
        await handleUserDeleted(evt.data)
        break
      default:
        console.log(`Unhandled webhook event type: ${eventType}`)
    }
  } catch (error) {
    console.error('Error handling webhook:', error)
    return NextResponse.json(
      { error: 'Error processing webhook' },
      { status: 500 }
    )
  }

  return NextResponse.json({ message: 'Webhook processed successfully' })
}

async function handleUserCreated(data: any) {
  const { id, email_addresses, first_name, last_name } = data
  const primaryEmail = email_addresses.find((email: any) => email.id === data.primary_email_address_id)?.email_address

  if (!primaryEmail) {
    console.error('No primary email found for user:', id)
    return
  }

  // Check if user should be admin based on email
  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim().toLowerCase()) || []
  const isAdmin = adminEmails.includes(primaryEmail.toLowerCase())

  try {
    await db.users.create({
      data: {
        clerkUserId: id,
        email: primaryEmail,
        firstName: first_name || null,
        lastName: last_name || null,
        role: isAdmin ? 'ADMIN' : 'CUSTOMER',
        notificationEnabled: true, // Enable notifications by default
      },
    })
    console.log(`Created user in database: ${primaryEmail} (${isAdmin ? 'ADMIN' : 'CUSTOMER'})`)
  } catch (error) {
    console.error('Error creating user in database:', error)
  }
}

async function handleUserUpdated(data: any) {
  const { id, email_addresses, first_name, last_name } = data
  const primaryEmail = email_addresses.find((email: any) => email.id === data.primary_email_address_id)?.email_address

  if (!primaryEmail) {
    console.error('No primary email found for user:', id)
    return
  }

  try {
    await db.users.upsert({
      where: { clerkUserId: id },
      update: {
        email: primaryEmail,
        firstName: first_name || null,
        lastName: last_name || null,
        updatedAt: new Date(),
      },
      create: {
        clerkUserId: id,
        email: primaryEmail,
        firstName: first_name || null,
        lastName: last_name || null,
        role: 'CUSTOMER',
        notificationEnabled: true,
      },
    })
    console.log(`Updated user in database: ${primaryEmail}`)
  } catch (error) {
    console.error('Error updating user in database:', error)
  }
}

async function handleUserDeleted(data: any) {
  const { id } = data

  try {
    await db.users.delete({
      where: { clerkUserId: id },
    })
    console.log(`Deleted user from database: ${id}`)
  } catch (error) {
    console.error('Error deleting user from database:', error)
  }
}