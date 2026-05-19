import { dashboardData } from "../data";

export default function DashboardPage() {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">
        Overview
      </h2>
      <div className="grid grid-cols-4 gap-4">
        {dashboardData.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-gray-200 p-5"
          >
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="text-3xl font-semibold text-gray-900 mt-1">
              {stat.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}