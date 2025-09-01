// components/DashboardCharts.jsx
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

const DashboardCharts = ({ chartData }) => {
  console.log('DashboardCharts received chartData:', chartData)
  
  // Safety check to ensure chartData exists and has the required properties
  if (!chartData || !chartData.appointmentsByDoctor || !chartData.appointmentsByStatus) {
    console.log('Chart data validation failed:', {
      hasChartData: !!chartData,
      hasAppointmentsByDoctor: !!chartData?.appointmentsByDoctor,
      hasAppointmentsByStatus: !!chartData?.appointmentsByStatus
    })
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }
  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top'
      },
      title: {
        display: true,
        text: 'Appointment Trend (Last 7 Days)'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  }

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Your Most Visited Doctors'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  }

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom'
      },
      title: {
        display: true,
        text: 'Appointment Status Overview'
      }
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Line Chart - Appointment Trend */}
      {chartData.appointmentsByDay && (
        <div className="bg-white rounded-lg shadow p-6">
          {chartData.appointmentsByDay?.labels ? (
            <Line data={chartData.appointmentsByDay} options={lineChartOptions} />
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No appointment trend data
            </div>
          )}
        </div>
      )}

      {/* Bar Chart - Top Doctors */}
      <div className="bg-white rounded-lg shadow p-6">
        {chartData.appointmentsByDoctor?.labels && chartData.appointmentsByDoctor.labels.length > 0 ? (
          <Bar data={chartData.appointmentsByDoctor} options={barChartOptions} />
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500">
            No doctor data available
          </div>
        )}
      </div>

      {/* Doughnut Chart - Appointment Status Distribution */}
      <div className="bg-white rounded-lg shadow p-6">
        {chartData.appointmentsByStatus?.labels ? (
          <Doughnut data={chartData.appointmentsByStatus} options={doughnutOptions} />
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500">
            No status data available
          </div>
        )}
      </div>
    </div>
  )
}

export default DashboardCharts
