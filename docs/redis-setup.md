# Redis Setup Guide

This guide covers setting up Redis for your BabyBliss e-commerce application in different environments.

## Local Development

### Option 1: Docker (Recommended)

```bash
# Run Redis in Docker
docker run -d \
  --name redis-cache \
  -p 6379:6379 \
  redis:7-alpine

# Verify Redis is running
docker ps | grep redis
```

### Option 2: Homebrew (macOS)

```bash
# Install Redis
brew install redis

# Start Redis service
brew services start redis

# Or run Redis manually
redis-server
```

### Option 3: Package Manager (Linux)

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install redis-server

# CentOS/RHEL
sudo yum install redis

# Start Redis
sudo systemctl start redis
sudo systemctl enable redis
```

## Production Deployment

### AWS ElastiCache

1. **Create ElastiCache Cluster**
   ```bash
   aws elasticache create-cache-cluster \
     --cache-cluster-id babybliss-redis \
     --engine redis \
     --cache-node-type cache.t3.micro \
     --num-cache-nodes 1
   ```

2. **Get Connection Endpoint**
   ```bash
   aws elasticache describe-cache-clusters \
     --cache-cluster-id babybliss-redis \
     --show-cache-node-info
   ```

3. **Update Environment Variables**
   ```env
   REDIS_URL="redis://your-cluster.cache.amazonaws.com:6379"
   ```

### Redis Cloud

1. **Sign up at Redis Cloud**
   - Visit [Redis Cloud](https://redis.com/redis-enterprise-cloud/)
   - Create a free account

2. **Create Database**
   - Choose your cloud provider and region
   - Select database size and features

3. **Get Connection String**
   ```env
   REDIS_URL="redis://username:password@host:port"
   ```

### DigitalOcean Managed Redis

1. **Create Database Cluster**
   ```bash
   doctl databases create redis-cluster \
     --engine redis \
     --size db-s-1vcpu-1gb \
     --region nyc1
   ```

2. **Get Connection Details**
   ```bash
   doctl databases connection redis-cluster
   ```

### Railway

1. **Add Redis Plugin**
   ```bash
   # In your Railway project
   railway add redis
   ```

2. **Get Connection URL**
   ```bash
   railway variables
   ```

## Environment Configuration

### Development (.env.local)
```env
REDIS_URL="redis://localhost:6379"
```

### Production
```env
# AWS ElastiCache
REDIS_URL="redis://your-cluster.cache.amazonaws.com:6379"

# Redis Cloud
REDIS_URL="redis://username:password@host:port"

# With SSL (recommended for production)
REDIS_URL="rediss://username:password@host:port"
```

## Vercel Deployment

### Using Upstash Redis

1. **Create Upstash Account**
   - Visit [Upstash](https://upstash.com/)
   - Create a Redis database

2. **Add to Vercel**
   ```bash
   # Install Vercel CLI
   npm i -g vercel

   # Add environment variables
   vercel env add REDIS_URL
   ```

3. **Environment Variables in Vercel Dashboard**
   - Go to Project Settings → Environment Variables
   - Add `REDIS_URL` with your Upstash connection string

## Testing Redis Connection

### Local Testing
```bash
# Test Redis connection
npm run test:cache

# Test with Redis running
npm run test:redis
```

### Health Check API
```bash
# Check Redis health
curl http://localhost:3000/api/health/redis
```

## Redis Configuration

### Basic Redis Config (redis.conf)
```conf
# Memory management
maxmemory 256mb
maxmemory-policy allkeys-lru

# Persistence (optional for cache)
save ""
appendonly no

# Security
requirepass your-secure-password

# Network
bind 127.0.0.1
port 6379
```

### Production Recommendations

1. **Memory Management**
   - Set appropriate `maxmemory` limit
   - Use `allkeys-lru` eviction policy for cache

2. **Security**
   - Use strong passwords
   - Enable SSL/TLS in production
   - Restrict network access

3. **Monitoring**
   - Monitor memory usage
   - Track cache hit rates
   - Set up alerts for connection issues

## Troubleshooting

### Common Issues

1. **Connection Refused**
   ```bash
   # Check if Redis is running
   redis-cli ping
   
   # Check port
   netstat -an | grep 6379
   ```

2. **Memory Issues**
   ```bash
   # Check Redis memory usage
   redis-cli info memory
   
   # Clear all cache (use carefully)
   redis-cli flushall
   ```

3. **Performance Issues**
   ```bash
   # Monitor Redis commands
   redis-cli monitor
   
   # Check slow queries
   redis-cli slowlog get 10
   ```

### Fallback Behavior

The application automatically falls back to in-memory caching when Redis is unavailable:

- ✅ Application continues to work
- ⚠️ Cache is limited to single instance
- ⚠️ Cache is lost on restart
- ⚠️ No cache sharing between instances

## Cache Warming

### Warm Cache on Startup
```typescript
// Add to your startup script
import { CachedQueries } from '@/lib/cache-wrapper'

async function warmCache() {
  console.log('Warming cache...')
  
  // Pre-load frequently accessed data
  await CachedQueries.getCategories()
  await CachedQueries.getProducts(1, 20)
  await CachedQueries.getActiveOffers()
  
  console.log('Cache warmed successfully')
}

// Call during app initialization
warmCache().catch(console.error)
```

## Monitoring and Metrics

### Key Metrics to Monitor

1. **Cache Hit Rate**
   - Target: >80% for frequently accessed data
   - Monitor via Redis INFO stats

2. **Memory Usage**
   - Monitor Redis memory consumption
   - Set alerts at 80% capacity

3. **Connection Count**
   - Monitor active connections
   - Ensure connection pooling is working

4. **Response Time**
   - Cache operations should be <5ms
   - Database fallback should be <100ms

### Monitoring Tools

- **Redis CLI**: Built-in monitoring
- **RedisInsight**: GUI for Redis management
- **Grafana + Prometheus**: Advanced monitoring
- **Application logs**: Custom metrics and alerts

## Best Practices

1. **Use appropriate TTLs** based on data change frequency
2. **Implement cache warming** for critical data
3. **Monitor cache hit rates** and adjust strategies
4. **Use Redis clustering** for high availability in production
5. **Implement proper error handling** with fallbacks
6. **Regular backup** of critical cached data (if needed)
7. **Security**: Use SSL, authentication, and network restrictions