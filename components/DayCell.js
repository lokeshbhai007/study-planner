//components/Daycell.jsx

'use client'

import { useState } from 'react'
import TaskModal from './TaskModal'

// Subject color configuration
const SUBJECT_COLORS = {
  'JS': 'bg-amber-100 text-amber-800 border-amber-200',
  'DB': 'bg-blue-100 text-blue-800 border-blue-200',
  'DSA': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'WEB': 'bg-purple-100 text-purple-800 border-purple-200'
}

// Expanded pretty highlight colors for tasks (6 varieties)
const TASK_HIGHLIGHT_COLORS = [
  'bg-gradient-to-r from-rose-100 to-pink-100 text-rose-800 border border-rose-200 shadow-sm',
  'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border border-blue-200 shadow-sm',
  'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 border border-emerald-200 shadow-sm',
  'bg-gradient-to-r from-purple-100 to-violet-100 text-purple-800 border border-purple-200 shadow-sm',
  'bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 border border-orange-200 shadow-sm',
  'bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-800 border border-indigo-200 shadow-sm'
]

const DEFAULT_SUBJECT_COLOR = 'bg-gray-100 text-gray-800 border-gray-200'

function getSubjectColor(subject) {
  return SUBJECT_COLORS[subject?.toUpperCase()] || DEFAULT_SUBJECT_COLOR
}

// Simple hash function to get consistent color index for task titles
function getTaskColorIndex(taskTitle) {
  if (!taskTitle) return 0
  
  let hash = 0
  for (let i = 0; i < taskTitle.length; i++) {
    const char = taskTitle.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  
  // Return positive index within our color array range
  return Math.abs(hash) % TASK_HIGHLIGHT_COLORS.length
}

function isDateInRange(date, startDate, endDate) {
  const checkDate = new Date(date)
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  // Reset time to compare dates only
  checkDate.setHours(0, 0, 0, 0)
  start.setHours(0, 0, 0, 0)
  end.setHours(0, 0, 0, 0)
  
  return checkDate >= start && checkDate <= end
}

export default function DayCell({ 
  date, 
  fullDate, 
  isCurrentMonth, 
  tasks = [], 
  year, 
  month 
}) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // Filter tasks for this specific date
  const dayTasks = tasks.filter(task =>
    isDateInRange(fullDate, task.startDate, task.endDate)
  )
  
  // Get unique subjects for this day
  const subjects = [...new Set(
    dayTasks.map(task => task.subject).filter(Boolean)
  )]
  
  const isToday = new Date().toDateString() === fullDate.toDateString()
  const hasOverflow = dayTasks.length > 3
  
  // Handle cell click
  const handleCellClick = () => {
    if (isCurrentMonth) {
      setIsModalOpen(true)
    }
  }
  
  // Base cell styles - Updated for fixed container
  const cellClasses = `
    relative w-full h-full p-2 
    cursor-pointer transition-all duration-200 ease-in-out
    flex flex-col
    ${isCurrentMonth 
      ? 'bg-white hover:bg-gray-100 hover:shadow-sm' 
      : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
    }
    ${isToday ? 'ring-2 ring-blue-500 bg-yellow-100' : ''}
  `.trim()
  
  // Date number styles
  const dateClasses = `
    font-semibold mb-1 leading-none flex-shrink-0
    ${isToday 
      ? 'text-blue-600 text-base' 
      : isCurrentMonth 
        ? 'text-gray-900 text-sm' 
        : 'text-gray-400 text-sm'
    }
  `.trim()

  return (
    <>
      <div className={cellClasses} onClick={handleCellClick}>
        {/* Date Number */}
        <div className={dateClasses}>
          {date}
          {isToday && (
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full ml-1 mb-0.5 inline-block" />
          )}
        </div>
        
        {/* Task Preview Section - Flexible container */}
        {dayTasks.length > 0 && (
          <div className="flex-1 min-h-0 mt-1 overflow-hidden">
            <div className="space-y-1 h-full">
              {/* Show first 3 tasks with consistent colors based on title */}
              {dayTasks.slice(0, 3).map((task, index) => {
                const colorIndex = getTaskColorIndex(task.title)
                return (
                  <div 
                    key={`${task.id || index}`}
                    className={`text-xs px-2 py-1 rounded-md 
                             truncate hover:scale-105 transition-all duration-200 
                             font-medium ${TASK_HIGHLIGHT_COLORS[colorIndex]}`}
                    title={task.title} // Tooltip for full title
                  >
                    {task.title}
                  </div>
                )
              })}
              
              {/* Overflow indicator */}
              {hasOverflow && (
                <div className="text-xs text-gray-600 font-medium px-2 py-1 
                             bg-gradient-to-r from-gray-100 to-gray-200 
                             rounded-md text-center border border-gray-300 shadow-sm
                             hover:from-gray-200 hover:to-gray-300 transition-all duration-200">
                  +{dayTasks.length - 3} more
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Empty state for current month */}
        {isCurrentMonth && dayTasks.length === 0 && (
          <div className="flex-1 flex items-center justify-center 
                       opacity-0 hover:opacity-100 transition-opacity">
            <div className="text-xs text-gray-400 font-medium text-center">
              Click to add task
            </div>
          </div>
        )}
      </div>
      
      {/* Task Modal */}
      {isModalOpen && (
        <TaskModal
          selectedDate={fullDate}
          year={year}
          month={month}
          onClose={() => setIsModalOpen(false)}
          existingTasks={dayTasks}
        />
      )}
    </>
  )
}