# LOGITAP - Deployment Configuration

## 🚀 Stack
- **Framework**: Next.js 15 + TypeScript
- **Database**: Supabase (PostgreSQL)
- **Hosting**: Vercel
- **Maps**: Google Maps API

## 🔐 Environment Variables for Vercel

Configurar estas variables en Vercel Dashboard:

### Production Environment Variables:

```
DATABASE_URL=postgresql://postgres.tyvzxtrctlujmifhukea:%40Javi06051803@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true

DIRECT_URL=postgresql://postgres.tyvzxtrctlujmifhukea:%40Javi06051803@db.tyvzxtrctlujmifhukea.supabase.co:5432/postgres

JWT_SECRET=production-jwt-secret-super-seguro-12345-CHANGE-THIS

NEXTAUTH_SECRET=production-nextauth-secret-67890-CHANGE-THIS

NEXTAUTH_URL=https://tu-proyecto.vercel.app

NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyD1WV-HM7ffqEb4qiXEF_YmQ7BTBZeQriI

NODE_ENV=production
```

## 📝 Deployment Steps

1. Push code to GitHub (main branch)
2. Go to vercel.com and import project
3. Configure environment variables
4. Deploy
5. Update NEXTAUTH_URL with actual Vercel URL

## ✅ Post-Deployment Checklist

- [ ] Verify database connection
- [ ] Test admin login
- [ ] Test driver login
- [ ] Verify map loads
- [ ] Test create dispatch
- [ ] Test GPS tracking
- [ ] Test mark deliveries

## 🔄 CI/CD

Auto-deploy configured:
- Push to `master` → Production deployment
- Pull requests → Preview deployments

---

Developed by: Javier Godoy
Project: Logitap - Pharmaceutical Logistics Management System
