// components/TaskModal.js
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function TaskModal({ selectedDate, year, month, onClose, existingTasks = [] }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Format the selected date for the input field (avoiding timezone issues)
  const formatDateForInput = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Format date for display in dd/mm/yyyy format
  const formatDateForDisplay = (date) => {
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  // Calculate end date (3 days after start date)
  const getDefaultEndDate = (startDate) => {
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + 2)
    return endDate
  }
  
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    startDate: formatDateForInput(selectedDate), // Set to selected day's date
    endDate: formatDateForInput(getDefaultEndDate(selectedDate)), // 3 days later
    status: 'pending'
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.refresh()
        onClose()
      } else {
        alert('Failed to create task')
      }
    } catch (error) {
      console.error('Error creating task:', error)
      alert('Failed to create task')
    }

    setIsSubmitting(false)
  }

  const handleDelete = async (taskId) => {
    if (!confirm('Are you sure you want to delete this task?')) return

    try {
      const response = await fetch('/api/tasks', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: taskId }),
      })

      if (response.ok) {
        router.refresh()
        onClose()
      } else {
        alert('Failed to delete task')
      }
    } catch (error) {
      console.error('Error deleting task:', error)
      alert('Failed to delete task')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto border border-gray-700 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-100">
            📋 Tasks for {formatDateForDisplay(selectedDate)}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 text-xl transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Existing Tasks */}
        {existingTasks.length > 0 && (
          <div className="mb-6">
            <h3 className="font-medium mb-3 text-gray-200">Existing Tasks:</h3>
            {existingTasks.map((task, index) => (
              <div key={index} className="bg-gray-700 p-3 rounded-lg mb-2 flex justify-between items-start border border-gray-600">
                <div className="flex-1">
                  <div className="font-medium text-gray-100">{task.title}</div>
                  <div className="text-sm text-gray-300">{task.subject}</div>
                  <div className="text-xs text-gray-400">
                    {new Date(task.startDate).toLocaleDateString()} - {new Date(task.endDate).toLocaleDateString()}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(task._id)}
                  className="text-red-400 hover:text-red-300 text-sm ml-2 transition-colors"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add New Task Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="font-medium text-gray-200">Add New Task:</h3>
          
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">Start Date</label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({...formData, startDate: e.target.value})}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">End Date</label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({...formData, endDate: e.target.value})}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isSubmitting ? 'Adding...' : 'Add Task'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-600 text-gray-200 py-2 px-4 rounded hover:bg-gray-500 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}