import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { OrderStatus, PaymentStatus } from '@/lib/generated/prisma'
import { stripe } from '@/lib/stripe'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30' // days

    const periodDays = parseInt(period)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - periodDays)

    // Get dashboard stats with real payment data
    const [
      totalOrders,
      totalRevenue,
      totalProducts,
      totalCustomers,
      recentOrders,
      topProducts,
      categoryStats,
      revenueByMonth,
      stripePayments
    ] = await Promise.all([
      // Total orders
      db.order.count(),
      
      // Total revenue from completed payments
      db.payment.aggregate({
        _sum: {
          amount: true
        },
        where: {
          status: PaymentStatus.COMPLETED
        }
      }),
      
      // Total products
      db.product.count({
        where: {
          status: 'ACTIVE'
        }
      }),
      
      // Total customers (unique clerk user IDs)
      db.order.findMany({
        select: {
          clerkUserId: true
        },
        distinct: ['clerkUserId']
      }),
      
      // Recent orders (last 3)
      db.order.findMany({
        take: 3,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  name: true
                }
              }
            }
          },
          payments: {
            where: {
              status: 'COMPLETED'
            }
          }
        }
      }),
      
      // Top products by sales
      db.orderItem.groupBy({
        by: ['productId'],
        _sum: {
          quantity: true,
          totalPrice: true
        },
        orderBy: {
          _sum: {
            quantity: 'desc'
          }
        },
        take: 5
      }),
      
      // Category sales stats
      db.orderItem.groupBy({
        by: ['productId'],
        _sum: {
          quantity: true,
          totalPrice: true
        }
      }),
      
      // Revenue by month (last 6 months) - only from completed payments
      db.payment.findMany({
        where: {
          createdAt: {
            gte: new Date(new Date().setMonth(new Date().getMonth() - 6))
          },
          status: PaymentStatus.COMPLETED
        },
        select: {
          amount: true,
          createdAt: true
        }
      }),

      // Get recent Stripe payments for verification
      stripe.paymentIntents.list({
        limit: 10,
        created: {
          gte: Math.floor(startDate.getTime() / 1000)
        }
      }).catch(() => ({ data: [] })) // Fallback if Stripe fails
    ])

    // Get product details for top products
    const topProductIds = topProducts.map(p => p.productId)
    const productDetails = await db.product.findMany({
      where: {
        id: {
          in: topProductIds
        }
      },
      select: {
        id: true,
        name: true,
        category: {
          select: {
            name: true
          }
        }
      }
    })

    // Process top products data
    const topProductsWithDetails = topProducts.map(product => {
      const details = productDetails.find(p => p.id === product.productId)
      return {
        name: details?.name || 'Unknown Product',
        sales: product._sum.quantity || 0,
        revenue: product._sum.totalPrice || 0,
        category: details?.category?.name || 'Uncategorized'
      }
    })

    // Process category data
    const categoryProductMap = await db.product.findMany({
      where: {
        id: {
          in: categoryStats.map(c => c.productId)
        }
      },
      select: {
        id: true,
        category: {
          select: {
            name: true
          }
        }
      }
    })

    const categoryMap = new Map()
    categoryStats.forEach(stat => {
      const product = categoryProductMap.find(p => p.id === stat.productId)
      const categoryName = product?.category?.name || 'Uncategorized'
      
      if (!categoryMap.has(categoryName)) {
        categoryMap.set(categoryName, { sales: 0, revenue: 0 })
      }
      
      const current = categoryMap.get(categoryName)
      current.sales += stat._sum.quantity || 0
      current.revenue += Number(stat._sum.totalPrice) || 0
    })

    const categoryData = Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      sales: data.sales,
      revenue: data.revenue
    }))

    // Process revenue by month from payments
    const monthlyRevenue = new Map()
    revenueByMonth.forEach(payment => {
      const month = payment.createdAt.toISOString().slice(0, 7) // YYYY-MM format
      if (!monthlyRevenue.has(month)) {
        monthlyRevenue.set(month, 0)
      }
      monthlyRevenue.set(month, monthlyRevenue.get(month) + Number(payment.amount))
    })

    // Get last 6 months
    const last6Months = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthKey = date.toISOString().slice(0, 7)
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      
      last6Months.push({
        month: monthName,
        revenue: monthlyRevenue.get(monthKey) || 0
      })
    }

    // Calculate previous period stats for comparison (from payments)
    const previousStartDate = new Date(startDate)
    previousStartDate.setDate(previousStartDate.getDate() - periodDays)

    const [prevOrders, prevRevenue] = await Promise.all([
      db.order.count({
        where: {
          createdAt: {
            gte: previousStartDate,
            lt: startDate
          }
        }
      }),
      db.payment.aggregate({
        _sum: {
          amount: true
        },
        where: {
          createdAt: {
            gte: previousStartDate,
            lt: startDate
          },
          status: PaymentStatus.COMPLETED
        }
      })
    ])

    const currentPeriodOrders = await db.order.count({
      where: {
        createdAt: {
          gte: startDate
        }
      }
    })

    const currentPeriodRevenue = await db.payment.aggregate({
      _sum: {
        amount: true
      },
      where: {
        createdAt: {
          gte: startDate
        },
        status: PaymentStatus.COMPLETED
      }
    })

    // Calculate percentage changes
    const orderChange = prevOrders > 0 ? ((currentPeriodOrders - prevOrders) / prevOrders * 100) : (currentPeriodOrders > 0 ? 100 : 0)
    const revenueChange = Number(prevRevenue._sum.amount || 0) > 0 
      ? ((Number(currentPeriodRevenue._sum.amount || 0) - Number(prevRevenue._sum.amount || 0)) / Number(prevRevenue._sum.amount) * 100) 
      : (Number(currentPeriodRevenue._sum.amount || 0) > 0 ? 100 : 0)

    // Calculate product and customer changes based on recent activity
    const prevProducts = await db.product.count({
      where: {
        createdAt: {
          gte: previousStartDate,
          lt: startDate
        }
      }
    })
    
    const currentPeriodProducts = await db.product.count({
      where: {
        createdAt: {
          gte: startDate
        }
      }
    })

    const productChange = prevProducts > 0 ? ((currentPeriodProducts - prevProducts) / prevProducts * 100) : (currentPeriodProducts > 0 ? 100 : 0)
    
    // For customers, we'll use a simple growth indicator based on recent orders
    const recentCustomerGrowth = totalCustomers.length > 0 ? Math.min(Math.max((totalOrders / totalCustomers.length - 1) * 10, -50), 50) : 0

    // Prepare stats data
    const stats = [
      {
        title: "Total Revenue",
        value: `₹${Number(totalRevenue._sum.amount || 0).toLocaleString()}`,
        change: `${revenueChange >= 0 ? '+' : ''}${revenueChange.toFixed(1)}%`,
        trend: revenueChange >= 0 ? "up" : "down",
        icon: "IndianRupee",
        color: "bg-green-100 text-green-600"
      },
      {
        title: "Total Orders",
        value: totalOrders.toLocaleString(),
        change: `${orderChange >= 0 ? '+' : ''}${orderChange.toFixed(1)}%`,
        trend: orderChange >= 0 ? "up" : "down",
        icon: "ShoppingCart",
        color: "bg-blue-100 text-blue-600"
      },
      {
        title: "Products",
        value: totalProducts.toLocaleString(),
        change: `${productChange >= 0 ? '+' : ''}${productChange.toFixed(1)}%`,
        trend: productChange >= 0 ? "up" : "down",
        icon: "Package",
        color: "bg-purple-100 text-purple-600"
      },
      {
        title: "Customers",
        value: totalCustomers.length.toLocaleString(),
        change: `${recentCustomerGrowth >= 0 ? '+' : ''}${recentCustomerGrowth.toFixed(1)}%`,
        trend: recentCustomerGrowth >= 0 ? "up" : "down",
        icon: "Users",
        color: "bg-orange-100 text-orange-600"
      }
    ]

    // Format recent orders
    const formattedRecentOrders = recentOrders.map(order => ({
      id: order.orderNumber,
      customer: order.userName || order.userEmail || 'Guest',
      amount: Number(order.totalAmount),
      status: order.status.toLowerCase(),
      date: order.createdAt.toLocaleDateString(),
      items: order.items.length
    }))

    return NextResponse.json({
      stats,
      revenueData: last6Months,
      categoryData: categoryData.slice(0, 8), // Top 8 categories
      recentOrders: formattedRecentOrders,
      topProducts: topProductsWithDetails
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store'
      }
    })

  } catch (error) {
    console.error('Error fetching dashboard analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard analytics' },
      { status: 500 }
    )
  }
}