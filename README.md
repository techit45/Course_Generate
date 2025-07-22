# GenCouce - AI Study Sheet Generator

🎓 **GenCouce** เป็นเครื่องมือสร้างชีทเรียนแบบอัตโนมัติด้วย AI สำหรับการเรียนการสอนภาษาไทย

[![CI/CD Pipeline](https://github.com/techit45/Course_Generate/actions/workflows/ci.yml/badge.svg)](https://github.com/techit45/Course_Generate/actions/workflows/ci.yml)
[![Security Scan](https://github.com/techit45/Course_Generate/actions/workflows/security.yml/badge.svg)](https://github.com/techit45/Course_Generate/actions/workflows/security.yml)
[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/import/project?template=https://github.com/techit45/Course_Generate)

## ✨ คุณสมบัติหลัก

### 🤖 การสร้างเนื้อหาด้วย AI
- **AI ที่ทันสมัย**: ใช้ OpenRouter API และ Claude 3.5 Haiku
- **ภาษาไทยเต็มรูปแบบ**: รองรับการสร้างเนื้อหาภาษาไทยอย่างสมบูรณ์
- **ปรับแต่งตามระดับชั้น**: ม.1 - ม.6 พร้อมความยากง่ายที่เหมาะสม
- **หลากหลายวิชา**: คณิตศาสตร์, วิทยาศาสตร์, ภาษาไทย, สังคมศึกษา

### ⚡ ประสิทธิภาพสูง
- **แคชอัจฉริยะ**: บันทึกผลการสร้างเนื้อหาเพื่อการใช้งานที่รวดเร็ว
- **โหลดภาพแบบ Lazy**: ปรับปรุงความเร็วในการโหลดหน้าเว็บ
- **ตัวบ่งชี้ความคืบหน้าขั้นสูง**: แสดงความคืบหน้าแบบละเอียด
- **การบังคับใช้เวลา 3 วินาที**: รับประกันการตอบสนองที่รวดเร็ว

### 📱 การออกแบบที่ใช้งานง่าย
- **Responsive Design**: ใช้งานได้ทั้งมือถือและเดสก์ท็อป
- **การแก้ไขแบบเรียลไทม์**: แก้ไขเนื้อหาได้ทันที
- **การส่งออกหลากรูปแบบ**: PDF, เว็บ, JSON
- **โหมดแก้ไขขั้นสูง**: แก้ไขเนื้อหาแต่ละส่วนได้อย่างละเอียด

## 🚀 การติดตั้งและใช้งาน

### ความต้องการของระบบ
- Node.js 18+
- npm หรือ yarn
- OpenRouter API Key

### การติดตั้ง

```bash
# Clone repository
git clone https://github.com/techit45/Course_Generate.git
cd Course_Generate

# ติดตั้ง dependencies
npm install --legacy-peer-deps

# สร้างไฟล์ environment
cp .env.local.example .env.local

# แก้ไขไฟล์ .env.local ใส่ API Key
# NEXT_PUBLIC_OPENROUTER_API_KEY=your_api_key_here

# รันเซิร์ฟเวอร์ development
npm run dev
```

### การใช้งาน Docker

```bash
# สร้าง Docker image
npm run docker:build

# รันด้วย Docker
npm run docker:run

# หรือใช้ Docker Compose
npm run docker:compose:build
```

## 📋 คำสั่งที่สำคัญ

```bash
# Development
npm run dev              # เริ่มเซิร์ฟเวอร์ development
npm run build           # สร้าง production build
npm run start           # เริ่มเซิร์ฟเวอร์ production

# Testing
npm run test            # รันการทดสอบ
npm run test:coverage   # รันการทดสอบพร้อม coverage
npm run typecheck       # ตรวจสอบ TypeScript

# Deployment
npm run docker:build    # สร้าง Docker image
npm run docker:compose  # Deploy ด้วย Docker Compose
```

## 🏗️ โครงสร้างโปรเจค

```
src/
├── app/                    # Next.js App Router
├── components/             # React Components
│   ├── ui/                # UI Components
│   ├── branding/          # Branding Components
│   ├── editing/           # Content Editing
│   └── export/            # Export Functionality
├── hooks/                 # Custom React Hooks
├── services/              # Business Logic Services
├── config/                # Configuration Files
├── types/                 # TypeScript Types
└── utils/                 # Utility Functions
```

## 🔧 เทคโนโลยีที่ใช้

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **AI**: OpenRouter API, Claude 3.5 Haiku
- **Export**: jsPDF, html2canvas
- **Testing**: Jest, React Testing Library
- **Deployment**: Docker, Vercel, GitHub Actions

## 📊 ข้อมูลประสิทธิภาพ

- ⚡ **เวลาโหลดเริ่มต้น**: < 3 วินาที
- 🚀 **เวลาสร้างเนื้อหา**: < 3 วินาที (พร้อม fallback)
- 💾 **อัตราการใช้แคช**: > 60%
- 📱 **ขนาด Bundle**: < 400KB First Load JS
- 🔒 **คะแนนประสิทธิภาพ**: > 90/100

## 🔒 ความปลอดภัย

- ✅ Security Headers (CSP, X-Frame-Options)
- ✅ Input Validation และ Sanitization
- ✅ Error Handling ที่ครอบคลุม
- ✅ Rate Limiting Protection
- ✅ Environment Variables Security

## 🌐 การ Deploy

### Vercel (แนะนำ)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/import/project?template=https://github.com/techit45/Course_Generate)

### Netlify
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/techit45/Course_Generate)

### Manual Deployment
```bash
# Production build
npm run build

# Start production server
npm run start
```

## 🤝 การมีส่วนร่วม

1. Fork โปรเจค
2. สร้าง feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit การเปลี่ยนแปลง (`git commit -m 'Add some AmazingFeature'`)
4. Push ไปยัง branch (`git push origin feature/AmazingFeature`)
5. เปิด Pull Request

## 📝 License

โปรเจคนี้อยู่ภายใต้ ISC License - ดูรายละเอียดในไฟล์ [LICENSE](LICENSE)

## 📞 การสนับสนุน

- 📧 **Email**: [ติดต่อผู้พัฒนา]
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/techit45/Course_Generate/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/techit45/Course_Generate/discussions)

## 🙏 กิตติกรรมประกาศ

โปรเจคนี้ได้รับการพัฒนาด้วย:
- 🤖 [Claude Code](https://claude.ai/code) - AI Assistant
- ❤️ ความมุ่งมั่นในการพัฒนาเครื่องมือการศึกษาไทย

---

**GenCouce** - สร้างชีทเรียนคุณภาพด้วย AI เพื่อการศึกษาไทยที่ดีกว่า 🇹🇭