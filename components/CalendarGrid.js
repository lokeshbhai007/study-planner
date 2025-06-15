'use client'

import { useState, useEffect } from 'react'
import DayCell from './DayCell'

// Note: Make sure your DayCell component handles all tasks properly
// The DayCell should show all tasks without the "+X more" limitation

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const WEEKDAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MOBILE_WEEKDAYS = ['Yesterday', 'Today', 'Tomorrow'] // 3-day view for mobile

export default function CalendarGrid({ year, month, tasks }) {
  const [isMobile, setIsMobile] = useState(false)

  // Check if screen is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768) // md breakpoint
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Get first day of month and number of days
  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay()

  // Create array of dates for the calendar grid
  const createCalendarDays = () => {
    const calendarDays = []
    
    // Previous month's trailing days
    const prevMonth = month === 1 ? 12 : month - 1
    const prevYear = month === 1 ? year - 1 : year
    const daysInPrevMonth = new Date(prevYear, prevMonth, 0).getDate()
    
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      calendarDays.push({
        date: daysInPrevMonth - i,
        isCurrentMonth: false,
        fullDate: new Date(prevYear, prevMonth - 1, daysInPrevMonth - i),
        dayOfWeek: (startingDayOfWeek - 1 - i + 7) % 7
      })
    }
    
    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      calendarDays.push({
        date: day,
        isCurrentMonth: true,
        fullDate: new Date(year, month - 1, day),
        dayOfWeek: (startingDayOfWeek + day - 1) % 7
      })
    }
    
    // Next month's leading days to fill remaining cells
    const remainingCells = 42 - calendarDays.length
    const nextMonth = month === 12 ? 1 : month + 1
    const nextYear = month === 12 ? year + 1 : year
    
    for (let day = 1; day <= remainingCells; day++) {
      calendarDays.push({
        date: day,
        isCurrentMonth: false,
        fullDate: new Date(nextYear, nextMonth - 1, day),
        dayOfWeek: (calendarDays.length) % 7
      })
    }
    
    return calendarDays
  }

  const allCalendarDays = createCalendarDays()

  // Filter for mobile view (yesterday, today, tomorrow)
  const getMobileCalendarDays = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)
    
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)
    
    const threeDays = [yesterday, today, tomorrow]
    
    return threeDays.map(date => {
      const isCurrentMonth = date.getMonth() === month - 1 && date.getFullYear() === year
      return {
        date: date.getDate(),
        isCurrentMonth,
        fullDate: date,
        dayOfWeek: date.getDay()
      }
    })
  }

  // Get mobile days (no weeks needed for 3-day view)
  const getMobileDays = () => {
    return getMobileCalendarDays()
  }

  const mobileDays = isMobile ? getMobileDays() : []

  // Navigation functions removed - not needed for 3-day view

  if (isMobile) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden shadow-xl">
        {/* Mobile 3-Day Headers (Yesterday, Today, Tomorrow) */}
        <div className="grid grid-cols-3">
          {MOBILE_WEEKDAYS.map((day, index) => (
            <div key={day} className={`bg-gray-900 p-2 text-center font-semibold text-xs border-b border-gray-700 h-10 flex items-center justify-center ${
              index === 1 ? 'text-blue-300 bg-gray-800' : 'text-gray-200' // Highlight "Today"
            }`}>
              {day}
            </div>
          ))}
        </div>
        
        {/* Mobile Calendar Days Grid (3 columns) */}
        <div className="grid grid-cols-3">
          {mobileDays.map((dayInfo, index) => (
            <div key={`mobile-${index}`} className="h-40 border-r border-b border-gray-700 last:border-r-0">
              <DayCell
                date={dayInfo.date}
                fullDate={dayInfo.fullDate}
                isCurrentMonth={dayInfo.isCurrentMonth}
                tasks={tasks}
                year={year}
                month={month}
              />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Desktop view (original 7-column layout)
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden shadow-xl">
      {/* Desktop Weekday Headers */}
      <div className="grid grid-cols-7">
        {WEEKDAYS_SHORT.map(day => (
          <div key={day} className="bg-gray-900 p-3 text-center font-semibold text-sm border-b border-gray-700 text-gray-200 h-12 flex items-center justify-center">
            {day}
          </div>
        ))}
      </div>
      
      {/* Desktop Calendar Days Grid - Fixed 6 rows */}
      <div className="grid grid-cols-7 grid-rows-6">
        {allCalendarDays.slice(0, 42).map((dayInfo, index) => (
          <div key={index} className="h-32 border-r border-b border-gray-700 last:border-r-0 [&:nth-child(7n)]:border-r-0">
            <DayCell
              date={dayInfo.date}
              fullDate={dayInfo.fullDate}
              isCurrentMonth={dayInfo.isCurrentMonth}
              tasks={tasks}
              year={year}
              month={month}
            />
          </div>
        ))}
      </div>
    </div>
  )
}