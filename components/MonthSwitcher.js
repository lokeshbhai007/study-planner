// components/MonthSwitcher.js
'use client'

import { useRouter } from 'next/navigation'

export default function MonthSwitcher({ currentYear, currentMonth }) {
  const router = useRouter()

  const navigateMonth = (direction) => {
    let newYear = currentYear
    let newMonth = currentMonth + direction

    if (newMonth < 1) {
      newMonth = 12
      newYear--
    } else if (newMonth > 12) {
      newMonth = 1
      newYear++
    }

    router.push(`/calendar/${newYear}/${newMonth}`)
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={() => navigateMonth(-1)}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500 transition-colors font-medium shadow-lg"
      >
        ← Previous
      </button>
      
      <span className="font-semibold text-lg text-gray-200 bg-gray-800 px-4 py-2 rounded-lg border border-gray-700">
        {monthNames[currentMonth - 1]} {currentYear}
      </span>
      
      <button
        onClick={() => navigateMonth(1)}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500 transition-colors font-medium shadow-lg"
      >
        Next →
      </button>
    </div>
  )
}