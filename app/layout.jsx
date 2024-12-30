import Providers from './providers'
import './globals.css'
import CodeViewer from '@/components/CodeViewer'

export const metadata = {
  title: 'dw-playground',
  description: 'A simple playground for testing and developing with dw-ui',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>
          {children}
          <CodeViewer />
        </Providers>
      </body>
    </html>
  )
}
