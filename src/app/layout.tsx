import './globals.css'
import { Inter } from 'next/font/google'
import MobileTouchOptimizer from '@/components/ui/MobileTouchOptimizer'

const inter = Inter({ 
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  preload: true,
  variable: '--font-inter'
})

export const metadata = {
  title: 'Study Sheet Generator - Login-Learning',
  description: 'เครื่องมือสร้างชีทเรียนสำหรับการสอน 4 ชั่วโมง พัฒนาโดย AI',
  keywords: ['study sheet', 'การศึกษา', 'AI', 'Login-Learning', 'GenCouce', 'ชีทเรียน'],
  authors: [{ name: 'Login-Learning Team' }],
  creator: 'Login-Learning Co., Ltd.',
  publisher: 'Login-Learning Platform',
  robots: 'index, follow',
  openGraph: {
    title: 'Study Sheet Generator - Login-Learning',
    description: 'เครื่องมือสร้างชีทเรียนสำหรับการสอน 4 ชั่วโมง พัฒนาโดย AI',
    type: 'website',
    locale: 'th_TH',
  },
  viewport: 'width=device-width, initial-scale=1.0, maximum-scale=5.0, minimum-scale=1.0, user-scalable=yes, viewport-fit=cover'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, minimum-scale=1.0, user-scalable=yes, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className={`${inter.className} ${inter.variable} antialiased bg-gradient-to-br from-login-learning-50 to-login-learning-100 min-h-screen`}>
        <MobileTouchOptimizer />
        {children}
      </body>
    </html>
  )
}