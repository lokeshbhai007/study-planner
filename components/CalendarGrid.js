'use client'

import { useState, useEffect } from 'react'
import DayCell from './DayCell'

// Note: Make sure your DayCell component handles all tasks properly
// The DayCell should show all tasks without the "+X more" limitation

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const WEEKDAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function CalendarGrid({ year, month, tasks }) {
  const [isMobile, setIsMobile] = useState(false)
  const [mobileViewType, setMobileViewType] = useState('next') // 'prev' or 'next'

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

  // Get mobile calendar days based on view type
  const getMobileCalendarDays = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    let threeDays = []
    
    if (mobileViewType === 'prev') {
      // Previous 3 days (day-2, day-1, today)
      for (let i = 2; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(today.getDate() - i)
        threeDays.push(date)
      }
    } else {
      // Next 3 days (today, day+1, day+2)
      for (let i = 0; i < 3; i++) {
        const date = new Date(today)
        date.setDate(today.getDate() + i)
        threeDays.push(date)
      }
    }
    
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

  // Get mobile days headers based on view type
  const getMobileHeaders = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (mobileViewType === 'prev') {
      return ['2 Days Ago', 'Yesterday', 'Today']
    } else {
      return ['Today', 'Tomorrow', 'Day After']
    }
  }

  const mobileDays = isMobile ? getMobileCalendarDays() : []
  const mobileHeaders = isMobile ? getMobileHeaders() : []

  if (isMobile) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden shadow-xl">
        {/* Navigation Arrows */}
        <div className="bg-gray-900 p-3 border-b border-gray-700">
          <div className="flex items-center justify-between max-w-xs mx-auto">
            <button
              onClick={() => setMobileViewType('prev')}
              className={`p-2 rounded-full transition-all duration-200 ${
                mobileViewType === 'prev'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div className="text-gray-200 text-sm font-medium">
              {mobileViewType === 'prev' ? 'Previous Days' : 'Next Days'}
            </div>
            
            <button
              onClick={() => setMobileViewType('next')}
              className={`p-2 rounded-full transition-all duration-200 ${
                mobileViewType === 'next'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile 3-Day Headers */}
        <div className="grid grid-cols-3">
          {mobileHeaders.map((day, index) => {
            const isToday = (mobileViewType === 'prev' && index === 2) || 
                           (mobileViewType === 'next' && index === 0)
            return (
              <div key={day} className={`bg-gray-900 p-2 text-center font-semibold text-xs border-b border-gray-700 h-10 flex items-center justify-center ${
                isToday ? 'text-blue-300 bg-gray-800' : 'text-gray-200'
              }`}>
                {day}
              </div>
            )
          })}
        </div>
        
        {/* Mobile Calendar Days Grid (3 columns) */}
        <div className="grid grid-cols-3">
          {mobileDays.map((dayInfo, index) => (
            <div key={`mobile-${mobileViewType}-${index}`} className="h-40 border-r border-b border-gray-700 last:border-r-0">
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
      <div className="grid grid-cols-7 grid-rows-5">
        {allCalendarDays.slice(0, 35).map((dayInfo, index) => (
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