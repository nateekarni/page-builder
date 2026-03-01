# คู่มือการ Deploy — Aglow Portfolio Builder บน Cloudflare

## ภาพรวม

Aglow Portfolio Builder ใช้ Cloudflare แพลตฟอร์มเป็นฐานหลัก:
- **Cloudflare Pages** — Hosting แอปพลิเคชัน
- **Cloudflare D1** — Database (SQLite)
- **Cloudflare R2** — Object Storage สำหรับไฟล์
- **Cloudflare Workers AI** — AI Content Assistant
- **Cloudflare Cron Triggers** — Scheduled Publishing

---

## ขั้นตอนที่ 1: เตรียมพร้อม

### 1.1 Cloudflare Account
1. สมัครบัญชี Cloudflare ที่ [cloudflare.com](https://cloudflare.com)
2. ติดตั้ง Wrangler CLI:
   ```bash
   npm install -g wrangler
   wrangler auth login
   ```

### 1.2 GitHub Repository
1. สร้าง repository ใหม่บน GitHub
2. Push โค้ดโปรเจ็ค:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/portfolio-builder.git
   git push -u origin main
   ```

### 1.3 Dependencies
ติดตั้ง dependencies ที่จำเป็น:
```bash
npm install
```

---

## ขั้นตอนที่ 2: ตั้งค่า Database (D1)

### 2.1 สร้าง D1 Database
```bash
# สร้าง D1 database
wrangler d1 create portfolio-builder-db

# คัดลอก database_id จากผลลัพธ์
# เช่น: "database_id": "abcd1234-5678-90ef-ghij-klmnopqrstuv"
```

### 2.2 ตั้งค่า wrangler.toml
แก้ไขไฟล์ `wrangler.toml`:
```toml
name = "portfolio-builder"
compatibility_date = "2026-02-28"
compatibility_flags = ["nodejs_compat"]

pages_build_output_dir = "./dist"

# D1 Database
[[d1_databases]]
binding = "DB"
database_name = "portfolio-builder-db"
database_id = "your-database-id-here"  # แทนที่ด้วย ID จริง

# R2 Object Storage
[[r2_buckets]]
binding = "R2"
bucket_name = "portfolio-media"

# Workers AI
[ai]
binding = "AI"

# Cron Triggers — scheduled publishing
[triggers]
crons = ["* * * * *"]
```

### 2.3 สร้างและรัน Migration
```bash
# สร้าง SQL migration จาก schema
npm run db:generate

# Apply migration ไปยัง production D1
npm run db:migrate:prod

# หรือถ้าต้องการ apply migration เพิ่มเติม:
wrangler d1 migrations apply portfolio-builder-db --remote
```

---

## ขั้นตอนที่ 3: ตั้งค่า Object Storage (R2)

### 3.1 สร้าง R2 Bucket
```bash
# สร้าง R2 bucket
wrangler r2 bucket create portfolio-media
```

### 3.2 ตั้งค่า CORS (ถ้าจำเป็น)
R2 bucket จะต้องอนุญาต CORS สำหรับการอัปโหลดไฟล์จาก frontend:
```bash
# เปิด Cloudflare Dashboard
# ไปที่ R2 → portfolio-media → Settings
# CORS policy:
[
  {
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 86400
  }
]
```

---

## ขั้นตอนที่ 4: ตั้งค่า Workers AI

### 4.1 เปิดใช้งาน Workers AI
1. เข้า Cloudflare Dashboard
2. ไปที่ AI → Workers AI
3. Enable Workers AI

### 4.2 ตรวจสอบ AI Binding
ใน `wrangler.toml` ต้องมี:
```toml
[ai]
binding = "AI"
```

---

## ขั้นตอนที่ 5: ตั้งค่า Environment Variables

### 5.1 ใน Cloudflare Dashboard
1. ไปที่ Pages → [your project]
2. Settings → Environment variables
3. เพิ่มตัวแปรต่อไปนี้:

#### Production Variables
```
NODE_VERSION=20
# ไม่มี environment variables เพิ่มเติม — ทุกอย่างใช้ bindings
```

#### (Optional) Development Variables
สำหรับ local development ใน `.dev.vars`:
```
# ไม่จำเป็น — wrangler จะจัดการ bindings อัตโนมัติ
```

### 5.2 Better Auth Configuration
1. ตั้งค่า callback URLs ใน Better Auth:
   - Callback URL: `https://your-domain.pages.dev/api/auth/callback`
   - Sign out URL: `https://your-domain.pages.dev/admin/login`

---

## ขั้นตอนที่ 6: Deploy แอปพลิเคชัน

### 6.1 เชื่อมต่อ GitHub
1. ไปที่ Cloudflare Dashboard → Pages
2. Create a project → Connect to Git
3. เลือก repository ที่สร้างไว้
4. ตั้งค่า build settings:

```
Production branch: main
Build command: npm run build
Build output directory: dist
Root directory: (leave empty)
```

### 6.2 Environment Variables สำหรับ Build
ใน Pages settings → Builds & deployments → Environment variables:

```
NODE_VERSION=20
```

### 6.3 Deploy อัตโนมัติ
เมื่อ push code ไป GitHub:
- Cloudflare จะ build และ deploy อัตโนมัติ
- สถานะ build สามารถดูได้ใน Pages dashboard

### 6.4 Deploy แบบ Manual (ถ้าต้องการ)
```bash
npm run deploy
```

---

## ขั้นตอนที่ 7: ตั้งค่า Custom Domain (Optional)

### 7.1 ใน Cloudflare Dashboard
1. ไปที่ Pages → [your project] → Custom domains
2. Add custom domain
3. อัปเดต DNS records ตามที่ Cloudflare แนะนำ

### 7.2 อัปเดต astro.config.mjs
แก้ไข `astro.config.mjs`:
```javascript
export default defineConfig({
  site: 'https://your-custom-domain.com',  // แทนที่ด้วย domain จริง
  // ...
});
```

---

## ขั้นตอนที่ 8: ตั้งค่า Security (Optional)

### 8.1 Cloudflare Access สำหรับ Admin
1. ไปที่ Zero Trust → Access → Applications
2. Create application:
   - Name: Portfolio Builder Admin
   - Domain: `your-domain.pages.dev/admin/*`
   - Policies: อนุญาตเฉพาะ email ที่กำหนด

### 8.2 Rate Limiting
Cloudflare จะจัดการ rate limiting อัตโนมัติ แต่สามารถตั้งค่าเพิ่มเติมได้:
- Security → WAF → Rate limiting

---

## ขั้นตอนที่ 9: Post-Deploy Configuration

### 9.1 สร้าง Admin User แรก
1. เข้าถึง `/admin/login`
2. Sign up ด้วย email และ password
3. User แรกจะเป็น admin อัตโนมัติ

### 9.2 ตั้งค่า Site Settings
1. เข้า admin dashboard
2. ไป Settings → Site Identity
3. ตั้งค่า site name, logo, tagline

### 9.3 อัปโหลด Media
1. ไป Media Manager
2. อัปโหลด logo และรูปภาพอื่นๆ

---

## ขั้นตอนที่ 10: Testing และ Monitoring

### 10.1 ทดสอบฟีเจอร์หลัก
```bash
# ทดสอบ login
curl -X POST https://your-domain.pages.dev/api/auth/sign-in \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'

# ทดสอบ API
curl https://your-domain.pages.dev/api/pages \
  -H "Cookie: session=your-session-cookie"
```

### 10.2 Monitoring
- **Cloudflare Dashboard**: Pages metrics, D1 usage, R2 storage
- **Application Logs**: Pages → [project] → Functions → Logs
- **Error Monitoring**: ตรวจสอบ response codes ใน Analytics

---

## Troubleshooting

### Database Connection Issues
```bash
# ตรวจสอบ D1 database
wrangler d1 list

# ตรวจสอบ migration status
wrangler d1 migrations list portfolio-builder-db --remote
```

### Build Failures
```bash
# ตรวจสอบ build logs ใน Cloudflare Dashboard
# หรือ build locally:
npm run build
```

### AI ไม่ทำงาน
```bash
# ตรวจสอบ AI binding
wrangler ai models list
```

### File Upload ไม่ทำงาน
```bash
# ตรวจสอบ R2 bucket permissions
wrangler r2 bucket list portfolio-media
```

---

## Cost Estimation

- **Cloudflare Pages**: Free tier (unlimited bandwidth)
- **D1 Database**: Free tier (500MB, 100K queries/day)
- **R2 Storage**: Free tier (10GB, 1M requests/month)
- **Workers AI**: Pay per token (เริ่มต้น free credits)

---

## Backup และ Recovery

### Database Backup
```bash
# Export D1 data
wrangler d1 export portfolio-builder-db --remote > backup.sql

# Import (ถ้าต้องการ restore)
wrangler d1 execute portfolio-builder-db --remote --file=backup.sql
```

### Media Backup
- R2 มี automatic replication
- สำหรับ manual backup: ใช้ `wrangler r2 object get` commands

---

## Next Steps

หลังจาก deploy เสร็จแล้ว:

1. **สร้างหน้าแรก**: เข้า admin → Pages → New Page → slug: `home`
2. **ตั้งค่า SEO**: Settings → Site Identity + SEO defaults
3. **เพิ่มผู้ใช้**: Users → Create users with appropriate roles
4. **ทดสอบ A/B Testing**: ไป AB Tests → Create test
5. **ตั้งค่า Cron**: ตรวจสอบ scheduled publishing ทำงาน

สำหรับคำถามเพิ่มเติม สามารถดูได้ใน:
- [Developer Guide](docs/developer-guide.md)
- [Admin Guide](docs/admin-guide.md)
- [API Reference](docs/api-reference.md)
