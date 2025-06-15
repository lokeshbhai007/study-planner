// app/calendar/[year]/[month]/page.js
import CalendarGrid from '../../../../components/CalendarGrid'
import Sidebar from '../../../../components/Sidebar'
import MonthSwitcher from '../../../../components/MonthSwitcher'

async function getTasks(year, month) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/tasks?year=${year}&month=${month}`, {
      cache: 'no-store'
    })
    if (!res.ok) return []
    return await res.json()
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return []
  }
}

async function getMonthMeta(year, month) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/month-meta?year=${year}&month=${month}`, {
      cache: 'no-store'
    })
    if (!res.ok) return { goals: [] }
    return await res.json()
  } catch (error) {
    console.error('Error fetching month meta:', error)
    return { goals: [] }
  }
}

export default async function CalendarPage({ params }) {
  const year = parseInt(params.year)
  const month = parseInt(params.month)
  
  const [tasks, monthMeta] = await Promise.all([
    getTasks(year, month),
    getMonthMeta(year, month)
  ])

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto p-4 lg:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-3xl lg:text-4xl font-bold text-amber-400">📋 <span className='text-green-600'>GG</span> - GoalGrid</h1>
          <MonthSwitcher currentYear={year} currentMonth={month} />
        </div>
        
        {/* Month Display */}
        <div className="flex justify-center mb-6">
          <div className="flex flex-wrap justify-center gap-2 text-sm text-gray-400">
            {monthNames.map((name, index) => (
              <span 
                key={name}
                className={`px-2 py-1 rounded ${index + 1 === month ? 'font-bold text-gray-100 bg-gray-800' : 'hover:text-gray-300'}`}
              >
                {name}
              </span>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Calendar */}
          <div className="flex-1 order-2 lg:order-1">
            <CalendarGrid year={year} month={month} tasks={tasks} />
          </div>
          
          {/* Sidebar */}
          <div className="w-full lg:w-80 order-1 lg:order-2">
            <Sidebar 
              year={year} 
              month={month} 
              monthMeta={monthMeta}
            />
          </div>
        </div>
      </div>
    </div>
  )
}