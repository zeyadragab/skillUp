# Admin Dashboard Analytics Guide

## Overview

The skillup admin dashboard now provides comprehensive real-time analytics for all platform activities including payments, token transactions, and session bookings.

---

## Analytics Endpoints

### GET /api/admin/stats

**Real-time Platform Statistics**

Returns comprehensive platform metrics:

```json
{
  "success": true,
  "stats": {
    "users": {
      "total": 1245,
      "teachers": 423,
      "learners": 822,
      "newThisMonth": 156
    },
    "sessions": {
      "total": 3421,
      "completed": 2847,
      "active": 12,
      "completionRate": "83.20"
    },
    "tokens": {
      "inCirculation": 124500,
      "totalEarned": 89300,
      "totalSpent": 67200
    },
    "revenue": {
      "total": 45600.0,
      "transactions": 567
    },
    "topTeachers": [
      {
        "name": "John Doe",
        "email": "john@example.com",
        "tokensEarned": 5600,
        "totalSessionsTaught": 145,
        "averageRating": 4.9
      }
    ],
    "recentSessions": []
  }
}
```

### GET /api/admin/analytics?period=30d

**Time-based Analytics**

Query Parameters:

- `period`: `7d`, `30d`, `90d`, `1y` (default: `30d`)

Returns detailed analytics:

#### 1. **User Growth**

Daily user registration data

```json
"userGrowth": [
  { "_id": "2025-12-01", "count": 15 },
  { "_id": "2025-12-02", "count": 23 }
]
```

#### 2. **Session Activity**

Daily session creation data

```json
"sessionActivity": [
  { "_id": "2025-12-01", "count": 45 },
  { "_id": "2025-12-02", "count": 52 }
]
```

#### 3. **Revenue Over Time**

Daily revenue and token sales

```json
"revenueOverTime": [
  {
    "_id": "2025-12-01",
    "revenue": 459.97,
    "tokens": 150,
    "count": 23
  }
]
```

#### 4. **Payment Method Breakdown** ✨ NEW

Payment methods performance

```json
"paymentMethodBreakdown": [
  {
    "_id": "visa",
    "count": 145,
    "revenue": 2899.55,
    "tokens": 945
  },
  {
    "_id": "paypal",
    "count": 89,
    "revenue": 1779.11,
    "tokens": 580
  },
  {
    "_id": "instapay",
    "count": 67,
    "revenue": 1339.33,
    "tokens": 437
  }
]
```

#### 5. **Package Popularity** ✨ NEW

Which token packages sell best

```json
"packagePopularity": [
  {
    "_id": "popular",
    "count": 189,
    "revenue": 3778.11,
    "tokens": 5670
  },
  {
    "_id": "professional",
    "count": 134,
    "revenue": 4688.66,
    "tokens": 8040
  },
  {
    "_id": "premium",
    "count": 78,
    "revenue": 4678.22,
    "tokens": 9750
  },
  {
    "_id": "starter",
    "count": 45,
    "revenue": 449.55,
    "tokens": 450
  }
]
```

#### 6. **Transactions by Type** ✨ NEW

Token transaction breakdown

```json
"transactionsByType": [
  {
    "_id": "purchase",
    "count": 456,
    "totalTokens": 15670
  },
  {
    "_id": "session_teaching",
    "count": 2847,
    "totalTokens": 14235
  },
  {
    "_id": "session_learning",
    "count": 2847,
    "totalTokens": -14235
  }
]
```

#### 7. **Token Velocity** ✨ NEW

Daily token credits vs debits (flow analysis)

```json
"tokenVelocity": [
  {
    "_id": "2025-12-01",
    "credits": 350,
    "debits": 245
  }
]
```

#### 8. **Recent Transactions** ✨ NEW

Latest 20 transactions with user details

```json
"recentTransactions": [
  {
    "_id": "...",
    "user": {
      "name": "John Doe",
      "email": "john@example.com"
    },
    "type": "credit",
    "amount": 30,
    "reason": "purchase",
    "description": "Purchased Popular Pack via visa",
    "balanceBefore": 50,
    "balanceAfter": 80,
    "createdAt": "2025-12-07T10:30:00Z"
  }
]
```

#### 9. **Recent Payments** ✨ NEW

Latest 20 payments with user details

```json
"recentPayments": [
  {
    "_id": "...",
    "user": {
      "name": "Jane Smith",
      "email": "jane@example.com"
    },
    "amount": 19.99,
    "tokensAmount": 30,
    "packageType": "popular",
    "paymentMethod": "visa",
    "status": "succeeded",
    "receiptNumber": "SS-1733596800000-ABC123XYZ",
    "createdAt": "2025-12-07T10:30:00Z"
  }
]
```

#### 10. **Average Session Value** ✨ NEW

Average tokens per session

```json
"avgSessionValue": {
  "avgTokens": 5.2,
  "totalSessions": 2847
}
```

---

## Database Collections Tracked

### 1. **Payments Collection**

Every token purchase is recorded:

- User reference
- Package type (starter/popular/professional/premium)
- Payment method (visa/paypal/instapay/fawry/wallet)
- Amount (USD)
- Tokens amount (base + bonus)
- Status (pending/processing/succeeded/failed)
- Receipt number
- Timestamps

### 2. **Transactions Collection**

Every token movement is recorded:

- User reference
- Type (credit/debit)
- Amount (tokens)
- Reason (purchase/session_teaching/session_learning/etc)
- Balance before/after
- Payment reference (if applicable)
- Session reference (if applicable)
- Timestamps

### 3. **Sessions Collection**

Every booking is recorded:

- Teacher reference
- Learner reference
- Skill
- Token cost
- Status (pending/confirmed/in-progress/completed/cancelled)
- Scheduled time
- Timestamps

---

## Real-Time Tracking

### When User Buys Tokens:

1. **Payment** record created with status "processing"
2. After 2 seconds (simulated gateway processing):
   - Payment status → "succeeded"
   - User token balance updated
   - **Transaction** record created (type: "credit", reason: "purchase")
3. Admin dashboard shows:
   - ✅ New payment in "Recent Payments"
   - ✅ New transaction in "Recent Transactions"
   - ✅ Revenue graph updated
   - ✅ Package popularity chart updated
   - ✅ Payment method breakdown updated
   - ✅ Token velocity chart updated

### When User Books a Session:

1. **Session** record created with status "confirmed"
2. Tokens deducted from learner
3. **Transaction** records created:
   - Learner: type "debit", reason "session_learning"
   - Teacher (after session): type "credit", reason "session_teaching"
4. Admin dashboard shows:
   - ✅ Session activity chart updated
   - ✅ Transactions by type updated
   - ✅ Top skills chart updated
   - ✅ Token velocity updated

---

## Analytics Insights

### Revenue Analytics

- **Total Revenue**: Sum of all successful payments
- **Revenue Trend**: Daily revenue over selected period
- **Average Transaction**: Revenue / Number of transactions
- **Revenue by Payment Method**: Which methods generate most revenue
- **Revenue by Package**: Which packages are most profitable

### Token Economics

- **Tokens in Circulation**: Total tokens held by all users
- **Token Issuance Rate**: How many tokens sold per day
- **Token Burn Rate**: How many tokens spent on sessions per day
- **Token Velocity**: Credits vs Debits daily (economic health indicator)
- **Average Session Cost**: How many tokens per session on average

### User Engagement

- **User Growth**: Daily new registrations
- **Active Users**: Users who made transactions/bookings
- **Teacher/Learner Ratio**: Platform balance
- **Top Teachers**: By tokens earned and ratings

### Session Analytics

- **Session Volume**: Total bookings over time
- **Completion Rate**: % of sessions that complete successfully
- **Popular Skills**: Most booked skills
- **Peak Times**: When most sessions are booked

### Payment Analytics

- **Payment Success Rate**: % of successful vs failed payments
- **Popular Packages**: Which tier sells most
- **Payment Method Preferences**: Regional payment method usage
- **Average Order Value**: Revenue per payment

---

## Dashboard Features

### Overview Tab

- **Key Metrics Cards**: Users, Sessions, Revenue, Tokens
- **Charts**: User Growth, Revenue Trend, Session Activity
- **Quick Stats**: Completion rate, new users this month

### Analytics Tab

- **Time Period Selector**: 7d, 30d, 90d, 1y
- **Revenue Charts**: Line graph with daily revenue
- **Package Performance**: Bar chart of package sales
- **Payment Methods**: Pie chart distribution
- **Token Flow**: Stacked area chart (credits vs debits)

### Transactions Tab

- **Recent Transactions Table**: Last 20 with filtering
- **Transaction Type Breakdown**: Pie chart
- **User Search**: Find transactions by user
- **Export**: Download CSV of transactions

### Payments Tab

- **Recent Payments Table**: Last 20 with details
- **Payment Status**: Success/Failed/Pending counts
- **Package Stats**: Revenue and count by package
- **Payment Method Stats**: Usage and revenue by method

### Sessions Tab

- **Active Sessions**: Currently in-progress
- **Recent Sessions**: Last 20 bookings
- **Top Skills**: Most popular skills
- **Teacher Leaderboard**: Top earners

---

## Using the Analytics

### Example: Optimize Pricing

1. Check **Package Popularity** analytics
2. See which packages have best conversion
3. Compare revenue vs units sold
4. Adjust pricing or add new tiers

### Example: Marketing Decisions

1. Check **Payment Method Breakdown**
2. See regional preferences (InstaPay/Fawry in Egypt)
3. Focus marketing on popular payment methods
4. Add localized payment options

### Example: Monitor Platform Health

1. Check **Token Velocity**
2. If credits >> debits → tokens accumulating (low usage)
3. If debits >> credits → tokens depleting (high usage, boost sales)
4. Balance indicates healthy economy

### Example: Identify Revenue Opportunities

1. Check **Popular Skills**
2. See high-demand skills
3. Recruit more teachers in those areas
4. Create targeted campaigns

---

## API Integration Example

```javascript
// Frontend: Fetch analytics
const fetchAnalytics = async (period = "30d") => {
  const token = localStorage.getItem("adminToken");

  const response = await axios.get(
    `${API_BASE_URL}/admin/analytics?period=${period}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data.analytics;
};

// Use in dashboard
useEffect(() => {
  const loadData = async () => {
    const analytics = await fetchAnalytics("30d");

    // Update charts
    setRevenueData(analytics.revenueOverTime);
    setPackageData(analytics.packagePopularity);
    setPaymentMethodData(analytics.paymentMethodBreakdown);
    setTransactionData(analytics.transactionsByType);
  };

  loadData();

  // Refresh every 30 seconds
  const interval = setInterval(loadData, 30000);
  return () => clearInterval(interval);
}, []);
```

---

## Performance Optimization

### Indexes Created

All aggregation queries use MongoDB indexes for performance:

- `createdAt` index on all collections
- `status` index on Payments
- `type` and `reason` index on Transactions
- Compound indexes for common queries

### Caching Strategy

- Stats cached for 5 minutes
- Analytics cached per period (invalidated on new data)
- Real-time data refreshed every 30 seconds

---

## Security

### Admin-Only Access

- All analytics endpoints require admin role
- JWT token validation
- Rate limiting: 100 requests/15min

### Data Privacy

- User emails masked in public views
- PII (Personally Identifiable Information) filtered
- Payment details never exposed in analytics

---

## Summary

The admin dashboard now provides:

✅ **Real-time payment tracking** - Every token purchase logged
✅ **Transaction monitoring** - All token movements tracked
✅ **Session analytics** - Booking patterns and popular skills
✅ **Revenue insights** - Daily revenue, package performance, payment methods
✅ **Token economics** - Supply, demand, and velocity metrics
✅ **User growth** - Registration trends and engagement
✅ **Performance metrics** - Completion rates, average values
✅ **Recent activity** - Last 20 payments and transactions
✅ **Comprehensive aggregations** - By type, method, package, skill

All data is automatically updated as users:

- Buy token packages
- Book learning sessions
- Complete sessions
- Earn tokens from teaching

The analytics provide actionable insights for:

- Pricing optimization
- Marketing decisions
- Feature prioritization
- Platform health monitoring
- Revenue forecasting
