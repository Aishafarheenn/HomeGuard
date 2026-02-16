import Card from "../../components/ui/Card";

function Dashboard() {
  return (
    <div className="space-y-6">

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-6">

        <Card>
          <h3 className="text-gray-500">Total Job Tickets</h3>
          <p className="text-2xl font-bold mt-2">124</p>
        </Card>

        <Card>
          <h3 className="text-gray-500">Pending Inspections</h3>
          <p className="text-2xl font-bold mt-2">18</p>
        </Card>

        <Card>
          <h3 className="text-gray-500">Registered Owners</h3>
          <p className="text-2xl font-bold mt-2">52</p>
        </Card>

        <Card>
          <h3 className="text-gray-500">Completed Jobs</h3>
          <p className="text-2xl font-bold mt-2">89</p>
        </Card>

      </div>

      {/* Recent Job Tickets Table */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="font-semibold mb-4">Recent Job Tickets</h3>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2">Title</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-2">Water Leakage</td>
              <td className="text-yellow-600">Open</td>
              <td>High</td>
              <td>20 Feb 2026</td>
            </tr>
            <tr>
              <td className="py-2">AC Repair</td>
              <td className="text-green-600">Completed</td>
              <td>Medium</td>
              <td>18 Feb 2026</td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  );
}

export default Dashboard;
