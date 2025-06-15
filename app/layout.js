import './globals.css'

export const metadata = {
  title: 'Study Planner',
  description: 'Personal monthly study planner',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        {children}
      </body>
    </html>
  )
}