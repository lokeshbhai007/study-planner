// components/Sidebar.js
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Sidebar({ year, month, monthMeta }) {
  const router = useRouter()
  const [goals, setGoals] = useState(monthMeta.goals || [])
  const [newGoal, setNewGoal] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date().getDate())
  const [dayMeta, setDayMeta] = useState({ todo: [], notes: '' })
  const [newTodo, setNewTodo] = useState('')

  // Load day meta when selected date changes
  useEffect(() => {
    fetchDayMeta(selectedDate)
  }, [selectedDate, year, month])

  const fetchDayMeta = async (day) => {
    try {
      const response = await fetch(`/api/day-meta?year=${year}&month=${month}&day=${day}`)
      if (response.ok) {
        const data = await response.json()
        setDayMeta(data)
      }
    } catch (error) {
      console.error('Error fetching day meta:', error)
    }
  }

  const saveMonthMeta = async (updatedGoals) => {
    try {
      await fetch('/api/month-meta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          year,
          month,
          goals: updatedGoals
        }),
      })
      router.refresh()
    } catch (error) {
      console.error('Error saving month meta:', error)
    }
  }

  const saveDayMeta = async (updatedTodo, updatedNotes) => {
    try {
      await fetch('/api/day-meta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          year,
          month,
          day: selectedDate,
          todo: updatedTodo,
          notes: updatedNotes
        }),
      })
    } catch (error) {
      console.error('Error saving day meta:', error)
    }
  }

  const addGoal = () => {
    if (newGoal.trim()) {
      const newGoalObj = {
        text: newGoal.trim(),
        completed: false,
        id: Date.now()
      }
      const updatedGoals = [...goals, newGoalObj]
      setGoals(updatedGoals)
      setNewGoal('')
      saveMonthMeta(updatedGoals)
    }
  }

  const toggleGoalCompletion = (goalId) => {
    const updatedGoals = goals.map(goal => 
      goal.id === goalId ? { ...goal, completed: !goal.completed } : goal
    )
    setGoals(updatedGoals)
    saveMonthMeta(updatedGoals)
  }

  const removeGoal = (goalId) => {
    const updatedGoals = goals.filter(goal => goal.id !== goalId)
    setGoals(updatedGoals)
    saveMonthMeta(updatedGoals)
  }

  const addTodo = () => {
    if (newTodo.trim()) {
      const newTodoObj = {
        text: newTodo.trim(),
        completed: false,
        id: Date.now()
      }
      const updatedTodo = [...dayMeta.todo, newTodoObj]
      const updatedDayMeta = { ...dayMeta, todo: updatedTodo }
      setDayMeta(updatedDayMeta)
      setNewTodo('')
      saveDayMeta(updatedTodo, dayMeta.notes)
    }
  }

  const toggleTodoCompletion = (todoId) => {
    const updatedTodo = dayMeta.todo.map(item => 
      item.id === todoId ? { ...item, completed: !item.completed } : item
    )
    const updatedDayMeta = { ...dayMeta, todo: updatedTodo }
    setDayMeta(updatedDayMeta)
    saveDayMeta(updatedTodo, dayMeta.notes)
  }

  const removeTodo = (todoId) => {
    const updatedTodo = dayMeta.todo.filter(item => item.id !== todoId)
    const updatedDayMeta = { ...dayMeta, todo: updatedTodo }
    setDayMeta(updatedDayMeta)
    saveDayMeta(updatedTodo, dayMeta.notes)
  }

  const saveNotes = () => {
    saveDayMeta(dayMeta.todo, dayMeta.notes)
  }

  const updateNotes = (newNotes) => {
    setDayMeta({ ...dayMeta, notes: newNotes })
  }

  // Convert legacy goals/todos to new format if needed
  const normalizeGoals = (goals) => {
    return goals.map(goal => {
      if (typeof goal === 'string') {
        return { text: goal, completed: false, id: Date.now() + Math.random() }
      }
      return goal
    })
  }

  const normalizeTodos = (todos) => {
    return todos.map(todo => {
      if (typeof todo === 'string') {
        return { text: todo, completed: false, id: Date.now() + Math.random() }
      }
      return todo
    })
  }

  // Normalize goals and todos
  const normalizedGoals = normalizeGoals(goals)
  const normalizedTodos = normalizeTodos(dayMeta.todo)

  // Generate days for the current month
  const daysInMonth = new Date(year, month, 0).getDate()
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  return (
    <div className="space-y-6 p-4 bg-gradient-to-b from-gray-900 to-gray-800 ">

      {/* Goals of the Month */}
      <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 backdrop-blur-sm border border-amber-500/20 rounded-xl p-5 shadow-lg">
        <div className="flex items-center justify-center mb-4">
          <div className="flex items-center gap-2">
            {/* <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
              <span className="text-sm">🎯</span>
            </div> */}
            <h3 className="font-bold text-amber-100 text-lg">Monthly Goals</h3>
          </div>
        </div>
        
        <div className="space-y-3">
          {normalizedGoals.map((goal) => (
            <div 
              key={goal.id} 
              className={`group flex items-center gap-3 backdrop-blur-sm p-3 rounded-lg border transition-all duration-200 ${
                goal.completed 
                  ? 'bg-green-500/20 border-green-500/30 hover:border-green-500/50' 
                  : 'bg-black/20 border-amber-500/10 hover:border-amber-500/30'
              }`}
            >
              <button
                onClick={() => toggleGoalCompletion(goal.id)}
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0 ${
                  goal.completed
                    ? 'bg-green-500 border-green-500 text-white hover:bg-green-600'
                    : 'border-amber-400 hover:border-amber-300 hover:bg-amber-500/10'
                }`}
              >
                {goal.completed && (
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
              <span 
                className={`flex-1 text-sm font-medium transition-all duration-200 ${
                  goal.completed 
                    ? 'text-green-200 line-through opacity-75' 
                    : 'text-amber-100'
                }`}
              >
                {goal.text}
              </span>
              <button
                onClick={() => removeGoal(goal.id)}
                className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 text-xs transition-all duration-200 bg-red-500/10 hover:bg-red-500/20 rounded-full w-6 h-6 flex items-center justify-center"
              >
                ✕
              </button>
            </div>
          ))}
          
          <div className="flex gap-2 mt-4">
            <input
              type="text"
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              placeholder="Write ur this month goal..."
              className="flex-1 text-sm bg-black/30 backdrop-blur-sm border border-amber-500/20 rounded-lg px-3 py-2 text-amber-100 placeholder-amber-300/60 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all duration-200"
              onKeyPress={(e) => e.key === 'Enter' && addGoal()}
            />
            <button
              onClick={addGoal}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 px-4 py-2 rounded-lg text-xs font-medium text-white shadow-lg hover:shadow-amber-500/25 transition-all duration-200 transform hover:scale-105"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Date Selector */}
      <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-sm border border-blue-500/20 rounded-xl p-2 shadow-lg">
        
        <div className="relative">
          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(parseInt(e.target.value))}
            className="w-full bg-black/30 backdrop-blur-sm border border-blue-500/20 rounded-lg px-3 py-3 text-sm text-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 appearance-none cursor-pointer"
          >
            {daysArray.map(day => (
              <option key={day} value={day} className="bg-gray-800 text-white">
                {monthNames[month - 1]} {day}, {year}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* To Do List for Selected Date */}
      <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-5 shadow-lg">
        <div className="flex items-center justify-center mb-4">
          <div className="flex items-center gap-2">
            
            <h3 className="font-bold text-emerald-100 text-lg">
              Daily Tasks
            </h3>
          </div>
        </div>
      
        
        <div className="space-y-3">
          {normalizedTodos.map((item) => (
            <div 
              key={item.id} 
              className={`group flex items-center gap-3 backdrop-blur-sm p-3 rounded-lg border transition-all duration-200 ${
                item.completed 
                  ? 'bg-green-500/20 border-green-500/30 hover:border-green-500/50' 
                  : 'bg-black/20 border-emerald-500/10 hover:border-emerald-500/30'
              }`}
            >
              <button
                onClick={() => toggleTodoCompletion(item.id)}
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0 ${
                  item.completed
                    ? 'bg-green-500 border-green-500 text-white hover:bg-green-600'
                    : 'border-emerald-400 hover:border-emerald-300 hover:bg-emerald-500/10'
                }`}
              >
                {item.completed && (
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
              <span 
                className={`flex-1 text-sm font-medium transition-all duration-200 ${
                  item.completed 
                    ? 'text-green-200 line-through opacity-75' 
                    : 'text-emerald-100'
                }`}
              >
                {item.text}
              </span>
              <button
                onClick={() => removeTodo(item.id)}
                className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 text-xs transition-all duration-200 bg-red-500/10 hover:bg-red-500/20 rounded-full w-6 h-6 flex items-center justify-center"
              >
                ✕
              </button>
            </div>
          ))}
          
          <div className="flex gap-2 mt-4">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="What was your today task?"
              className="flex-1 text-sm bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-lg px-3 py-2 text-emerald-100 placeholder-emerald-300/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200"
              onKeyPress={(e) => e.key === 'Enter' && addTodo()}
            />
            <button
              onClick={addTodo}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 px-4 py-2 rounded-lg text-xs font-medium text-white shadow-lg hover:shadow-emerald-500/25 transition-all duration-200 transform hover:scale-105"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Notes for Selected Date */}
      <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm border border-purple-500/20 rounded-xl p-5 shadow-lg">
        
        <div className="relative">
          <textarea
            value={dayMeta.notes}
            onChange={(e) => updateNotes(e.target.value)}
            onBlur={saveNotes}
            placeholder="Writes the notes..."
            className="w-full h-32 text-sm bg-black/30 backdrop-blur-sm border border-purple-500/20 rounded-lg p-3 resize-none text-purple-100 placeholder-purple-300/60 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200"
          />
          <div className="absolute bottom-2 right-2 text-xs text-purple-400/60">
            Auto-saved
          </div>
        </div>
      </div>
    </div>
  )
}