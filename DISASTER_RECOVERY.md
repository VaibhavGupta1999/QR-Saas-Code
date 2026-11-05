# Disaster Recovery & Business Continuity Specification

**System:** Hospitality OS / QR Menu SaaS  
**Target Tier:** Commercial Indian Restaurant Operations (₹9,000/yr per restaurant)  
**Database:** PostgreSQL (Supabase / Managed Cloud)  

---

## 1. Recovery Objectives

| Metric | Target | Description |
| :--- | :--- | :--- |
| **Recovery Point Objective (RPO)** | **< 1 hour** (Target: < 5 min on Pro) | Maximum acceptable data loss duration in a total hardware failure. |
| **Recovery Time Objective (RTO)** | **< 30 minutes** | Maximum acceptable downtime before customer menus and KDS are restored. |

---

## 2. Backup Architecture & Retention Schedule

### Daily Automated Snapshot
* **Frequency:** Every 24 hours at 03:00 AM IST (during restaurant closing hours).
* **Retention:** 7 daily rolling snapshots (Supabase Pro includes 7-day PITR; Free Tier only offers manual dump).
* **Storage:** Encrypted off-site copy stored in an independent Cloudflare R2 bucket.

### Point-in-Time Recovery (PITR)
* For paying production clusters, WAL (Write-Ahead Logging) archiving enables recovery to any specific second within the last 7 days.
* Protects against accidental bulk deletions, rogue staff actions, or corrupted data migrations.

---

## 3. Database Restoration Test Procedure

To verify backup validity, conduct a dry-run restoration quarterly:

1. **Extract Latest Database Dump:**
   ```bash
   # Using Supabase CLI or pg_dump
   pg_dump -h db.xyz.supabase.co -U postgres -d postgres -F c -b -v -f backup_recovery_test.dump
   ```
2. **Spin Up Staging Restoration Target:**
   ```bash
   createdb -h localhost -U postgres hospitality_os_recovery_test
   pg_restore -h localhost -U postgres -d hospitality_os_recovery_test -v backup_recovery_test.dump
   ```
3. **Verify Integrity Queries:**
   ```sql
   -- Verify tenant count matches
   SELECT COUNT(*) FROM restaurants;
   -- Verify latest order consistency
   SELECT id, order_token, total, created_at FROM orders ORDER BY created_at DESC LIMIT 5;
   -- Verify line items integrity
   SELECT COUNT(*) FROM order_items WHERE order_id IN (SELECT id FROM orders LIMIT 10);
   ```
4. **Log Restoration Verification:** Record date, duration, and operator initials in audit trail.

---

## 4. Free-Tier Limitations & Upgrade Triggers

> [!WARNING]
> **CRITICAL PRODUCTION REALITY:**
> The Supabase **Free Tier** does **NOT** provide automated point-in-time recovery (PITR) and pauses databases after 7 days of inactivity.
> 
> **Explicit Upgrade Trigger:** As soon as you onboard your **first paying restaurant customer** (who pays you ₹9,000/year), you **MUST** upgrade Supabase to the **Pro Tier ($25/month)**. 
> A single client's payment (₹9,000 ~ $110) covers 4+ months of the database cost, and two clients cover the entire year while providing:
> - Automated daily backups with 7-day Point-in-Time Recovery (PITR).
> - Zero database pausing.
> - Compute burstability for busy weekend rush hours.
> - High-availability SLA.

---

## 5. Incident Escalation & Response Runbook

1. **Level 1 (KDS Tablet Disconnect):**
   * *Symptom:* Kitchen tablet shows offline badge; order chimes stop.
   * *Resolution:* Tablet automatically falls back to 15-second polling `/api/orders/kds-sync`. If Wi-Fi fails, switch tablet to 4G/5G mobile hotspot.
2. **Level 2 (Vercel Edge / Network Degradation):**
   * *Symptom:* Customer QR menu takes > 3s to load.
   * *Resolution:* Inspect Vercel Status. Route traffic through Cloudflare cache or failover edge replica.
3. **Level 3 (Database Unavailability):**
   * *Symptom:* `/api/health` returns status `unhealthy` or database connection timeouts.
   * *Resolution:* Execute PITR restore to latest healthy checkpoint or switch connection string to standby read-replica pooler.
