# Budgets and Alerts

Stay on top of AI costs with budget tracking and automatic alerts.

## Overview

Budgets help you control spending by setting limits and receiving notifications when thresholds are reached. Costwave supports:

- **Global budgets** - Across all providers
- **Provider-specific budgets** - Per LLM provider (Anthropic, OpenAI, etc.)
- **Workflow-specific budgets** - Per automation workflow

Alerts are sent via:
- **Email** (all plans)
- **Web push notifications** (Pro plan only)

## Creating a Budget

1. Navigate to **Budgets** in the sidebar
2. Click **New Budget**
3. Configure the following fields:

### Budget Fields

| Field | Description | Example |
|-------|-------------|---------|
| **Name** | Descriptive label | "Production Anthropic Budget" |
| **Scope** | What to track | `global`, `provider`, or `workflow` |
| **Target** | Provider or workflow (if scoped) | `anthropic` or workflow ID |
| **Period** | Reset frequency | `day`, `week`, or `month` |
| **Amount** | Limit in USD | `100.00` |
| **Thresholds** | Alert percentages | `[50, 75, 90, 100]` (default) |

4. Click **Create Budget**

[screenshot: create budget dialog]

## Budget Scopes

### Global Budget

Tracks spending across all providers and workflows.

**Use case**: Overall monthly AI spend cap.

**Example**:
- Scope: `global`
- Period: `month`
- Amount: `500.00`
- Thresholds: `[75, 90, 100]`

Result: Alerts at $375 (75%), $450 (90%), and $500 (100%).

### Provider Budget

Tracks spending for a specific provider.

**Use case**: Limit Anthropic Claude usage to $200/month.

**Example**:
- Scope: `provider`
- Target: `anthropic`
- Period: `month`
- Amount: `200.00`
- Thresholds: `[50, 75, 90, 100]`

Result: Alerts at $100, $150, $180, and $200.

### Workflow Budget

Tracks spending for a specific automation workflow.

**Use case**: Cap customer support bot at $50/week.

**Example**:
- Scope: `workflow`
- Target: `customer-support-bot` (workflow ID)
- Period: `week`
- Amount: `50.00`
- Thresholds: `[75, 100]`

Result: Alerts at $37.50 and $50.

## Alert Thresholds

Thresholds are percentages of the budget amount. Default is `[50, 75, 90, 100]`.

### How Thresholds Work

1. Budget created with thresholds `[50, 75, 90, 100]`
2. Background job runs every 15 minutes
3. Checks current spend vs. thresholds
4. If threshold crossed since last check, sends alert
5. Marks alert as sent to prevent duplicates

**Example**:
- Budget: $100/month
- Current spend: $52 (52%)
- Alert sent: "50% threshold reached"
- Current spend: $53 (53%)
- No alert sent (50% already triggered this period)

### Custom Thresholds

Set custom thresholds when creating/editing a budget:

- **Early warning only**: `[50]` - Single alert at 50%
- **Critical only**: `[90, 100]` - Alerts only near limit
- **Granular**: `[25, 50, 75, 90, 95, 100]` - Frequent updates

## Email Alerts

Email alerts are sent to your account email when a threshold is crossed.

**Email content**:
- Budget name and scope
- Current spend and threshold percentage
- Period (e.g., "this month")
- Link to dashboard for details

**Languages**: Email content matches your account locale (English, French, German).

## Web Push Notifications

Push notifications appear even when the dashboard is closed (Pro plan only).

### Enabling Push Notifications

1. Navigate to **Settings** > **Notifications**
2. Click **Enable Push Notifications**
3. Grant browser permission when prompted
4. Click **Test Notification** to verify

[screenshot: push notification permission prompt]

### Supported Browsers

- **Desktop**: Chrome, Edge, Firefox, Safari 16.4+
- **Mobile**: iOS 16.4+ (Safari), Android (Chrome)

### Managing Devices

View and remove subscribed devices in **Settings** > **Notifications**.

**Device label**: Auto-detected (e.g., "MacBook Pro - Chrome") or custom label.

## Background Jobs

Budget checking is automated via pg-boss background jobs.

### Job Schedule

| Job | Frequency | Purpose |
|-----|-----------|---------|
| `poll-usage` | Every 6 hours | Sync provider usage data |
| `check-budgets` | Every 15 minutes | Compare spend to thresholds, send alerts |

### Viewing Job Status

Logs are visible in the app container:

```bash
docker compose logs -f app | grep "check-budgets"
```

Expected output:

```
[INFO] check-budgets: Checking 5 budgets
[INFO] check-budgets: Budget "Production Claude" at 78% (threshold: 75%)
[INFO] check-budgets: Alert sent to user@example.com
```

## Budget Periods

Budgets reset automatically based on the period:

| Period | Reset | Example |
|--------|-------|---------|
| `day` | Midnight UTC | April 30 23:59 -> May 1 00:00 |
| `week` | Monday 00:00 UTC | Sunday 23:59 -> Monday 00:00 |
| `month` | 1st of month 00:00 UTC | April 30 23:59 -> May 1 00:00 |

**Note**: Period start is based on UTC, not your local timezone.

## Editing Budgets

1. Navigate to **Budgets**
2. Click the budget to edit
3. Update fields (name, amount, thresholds)
4. Click **Save**

**Important**: Changing the amount or thresholds takes effect immediately. If current spend already exceeds a new threshold, an alert is sent.

## Deleting Budgets

1. Navigate to **Budgets**
2. Click the budget to delete
3. Click **Delete Budget**
4. Confirm deletion

**Note**: Deleting a budget removes all alert history. Spend data is preserved in the events table.

## Budget Dashboard

The Budgets page shows all budgets with:

- **Name** and scope
- **Current spend** (this period)
- **Limit** and percentage used
- **Visual gauge** (green -> yellow -> red)
- **Next reset** date

[screenshot: budgets list view]

### Gauge Colors

| Range | Color | Meaning |
|-------|-------|---------|
| 0-50% | Green | Normal usage |
| 50-75% | Yellow | Approaching limit |
| 75-90% | Orange | Warning |
| 90-100% | Red | Critical |
| 100%+ | Red (flashing) | Budget exceeded |

## Alert Deduplication

Alerts are sent only once per threshold per period.

**Example**:
- Budget: $100/month, threshold: 75%
- April 15: Spend hits $76 -> Alert sent
- April 20: Spend is $85 -> No alert (75% already triggered)
- April 25: Spend hits $91 -> Alert sent (90% threshold)
- May 1: Budget resets -> Alert history cleared

## Free vs Pro Limits

| Feature | Free | Pro |
|---------|------|-----|
| Budgets | 1 | Unlimited |
| Email alerts | Yes | Yes |
| Push notifications | No | Yes |
| Custom thresholds | Yes | Yes |
| Workflow budgets | No (global/provider only) | Yes |

## Best Practices

1. **Start with global budget**: Set an overall monthly cap before granular budgets
2. **Use 50% threshold**: Early warning prevents overspending
3. **Review weekly**: Check budget dashboard every Monday
4. **Adjust seasonally**: Increase budgets during high-usage periods
5. **Test push notifications**: Send a test notification after enabling
6. **Set workflow budgets for high-risk automation**: Cap experimental workflows

## Troubleshooting

### Not Receiving Email Alerts

- **Check spam folder**: Alerts may be filtered
- **Verify email address**: Settings > Account > Email
- **Check Resend logs**: Self-hosted users should check Resend dashboard

### Not Receiving Push Notifications

- **Check browser permission**: Settings > Privacy > Notifications
- **Verify Pro plan**: Push requires active Pro subscription
- **Re-subscribe**: Settings > Notifications > Remove device > Re-enable

### Budget Not Updating

- **Wait 15 minutes**: Budget checks run every 15 minutes
- **Check events**: Ensure events are being ingested (Dashboard > Recent Events)
- **Check logs**: `docker compose logs -f app | grep check-budgets`

### Alerts Sent Multiple Times

This shouldn't happen (deduplication prevents it). If it does:

1. Check `budget_alert_sent` table for duplicates
2. File a bug report with budget ID and timestamps
3. Temporary fix: Reduce threshold count (e.g., remove 50% if getting duplicate 50% alerts)

## API Integration

Budgets can be created via server actions (not REST API yet).

Future versions will include:
- `POST /api/v1/budgets` - Create budget
- `GET /api/v1/budgets/:id/status` - Check current spend
- Webhooks for threshold alerts (for integration with PagerDuty, Slack, etc.)

## Next Steps

- **[Getting Started](./getting-started.md)** - Create your first budget
- **[API Reference](./api-reference.md)** - Integrate budget checks into workflows
- **[Self-Hosting](./self-hosting.md)** - Configure background jobs for budgets
