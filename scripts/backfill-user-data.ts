#!/usr/bin/env tsx

import 'dotenv/config'
import { db } from '../lib/db'

async function backfillUserData() {
  console.log('Starting backfill of user email and name data...')

  try {
    // Backfill Cart records
    console.log('Backfilling Cart records...')
    const carts = await db.cart.findMany({
      where: {
        OR: [
          { userEmail: null },
          { userEmail: '' }
        ]
      },
      include: { user: true }
    })

    for (const cart of carts) {
      await db.cart.update({
        where: { id: cart.id },
        data: {
          userEmail: cart.user.email,
          userName: cart.user.name
        }
      })
    }
    console.log(`Updated ${carts.length} cart records`)

    // Backfill Order records
    console.log('Backfilling Order records...')
    const orders = await db.order.findMany({
      where: {
        OR: [
          { userEmail: null },
          { userEmail: '' }
        ]
      },
      include: { user: true }
    })

    for (const order of orders) {
      await db.order.update({
        where: { id: order.id },
        data: {
          userEmail: order.user.email,
          userName: order.user.name
        }
      })
    }
    console.log(`Updated ${orders.length} order records`)

    // Backfill Payment records
    console.log('Backfilling Payment records...')
    const payments = await db.payment.findMany({
      where: {
        OR: [
          { userEmail: null },
          { userEmail: '' }
        ]
      },
      include: { 
        order: { 
          include: { user: true } 
        } 
      }
    })

    for (const payment of payments) {
      await db.payment.update({
        where: { id: payment.id },
        data: {
          userEmail: payment.order.user.email,
          userName: payment.order.user.name
        }
      })
    }
    console.log(`Updated ${payments.length} payment records`)

    // Backfill Refund records
    console.log('Backfilling Refund records...')
    const refunds = await db.refund.findMany({
      where: {
        OR: [
          { userEmail: null },
          { userEmail: '' }
        ]
      },
      include: { 
        order: { 
          include: { user: true } 
        } 
      }
    })

    for (const refund of refunds) {
      await db.refund.update({
        where: { id: refund.id },
        data: {
          userEmail: refund.order.user.email,
          userName: refund.order.user.name
        }
      })
    }
    console.log(`Updated ${refunds.length} refund records`)

    // Backfill Address records
    console.log('Backfilling Address records...')
    const addresses = await db.address.findMany({
      where: {
        OR: [
          { userEmail: null },
          { userEmail: '' }
        ]
      },
      include: { user: true }
    })

    for (const address of addresses) {
      await db.address.update({
        where: { id: address.id },
        data: {
          userEmail: address.user.email,
          userName: address.user.name
        }
      })
    }
    console.log(`Updated ${addresses.length} address records`)

    console.log('Backfill completed successfully!')

  } catch (error) {
    console.error('Error during backfill:', error)
    process.exit(1)
  } finally {
    await db.$disconnect()
  }
}

// Run the backfill
backfillUserData()