# 🌾 CropWise - Quick Reference

## 🌐 Current URLs (Before Domain Setup)

**Frontend:** http://cropwise-dev-frontend.s3-website.ap-south-1.amazonaws.com
**Backend API:** http://65.0.87.98:3000
**API Info:** http://65.0.87.98:3000/api

---

## 🎯 Future URLs (After Domain Setup)

**Frontend:** https://cropwise.io
**Backend API:** https://api.cropwise.io
**API Docs:** https://api.cropwise.io/api/docs

---

## 📋 Next Steps After Registering cropwise.io

### **1. Register Domain (1 minute)**
- Go to: https://www.namecheap.com/domains/
- Search for `cropwise.io`
- Register for ~$12/year

### **2. Follow Setup Guide (30-60 minutes)**
- Read: `CROPWISE_DOMAIN_SETUP.md`
- Request SSL certificate
- Set up CloudFront for frontend
- Set up Application Load Balancer for backend
- Configure DNS records

### **3. Update Application (5 minutes)**
- Update GitHub Secrets with new URLs
- Update Google OAuth redirect URIs
- Trigger new deployment

---

## 🚀 Deploy Status

**Latest Commit:** rebrand: Update CropWise to CropWise
**GitHub Actions:** https://github.com/yellowflowersorganics-star/cropwise/actions

---

## ✅ What Was Updated

- ✅ **Package Names:** frontend & backend package.json
- ✅ **API Name:** CropWise API (instead of CropWise API)
- ✅ **Browser Title:** "CropWise - Smart Farming Platform"
- ✅ **Meta Description:** Updated for SEO
- ✅ **README:** Full rebrand with new tagline
- ✅ **Domain Guide:** Complete 500+ line setup guide created

---

## 📞 AWS Resources

**ECS Service:**
https://console.aws.amazon.com/ecs/home?region=ap-south-1#/clusters/cropwise-dev-cluster/services/cropwise-backend-dev

**S3 Frontend:**
https://s3.console.aws.amazon.com/s3/buckets/cropwise-dev-frontend?region=ap-south-1

**RDS Database:**
https://console.aws.amazon.com/rds/home?region=ap-south-1#databases:

**CloudWatch Logs:**
https://console.aws.amazon.com/cloudwatch/home?region=ap-south-1#logsV2:log-groups/log-group//ecs/cropwise-backend-dev

---

## 💡 Remember

- Domain propagation takes up to 48 hours
- SSL certificate validation takes 5-30 minutes
- CloudFront deployment takes 10-15 minutes
- Always test in browser incognito mode to avoid cache

---

## 🎉 You're Ready!

Once you register cropwise.io, follow the comprehensive guide in:
**`CROPWISE_DOMAIN_SETUP.md`**

Good luck! 🌾✨

