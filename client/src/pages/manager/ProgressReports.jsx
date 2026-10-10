import React, { useCallback, useEffect, useState } from "react";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const ProgressReports = () => {
  const [period, setPeriod] = useState("weekly");
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = sessionStorage.getItem("projectflow_token");

      if (!token) {
        throw new Error("Please sign in again to view progress reports.");
      }

      const response = await fetch(
        `${API_BASE_URL}/api/reports/progress?period=${period}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load progress reports."
        );
      }

      setReports(Array.isArray(data.reports) ? data.reports : []);
    } catch (err) {
      setError(err.message || "Something went wrong.");
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return (
    <main className="p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Progress Reports</h1>
          <p className="mt-1 text-gray-600">
            Track project progress from task completion data.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPeriod("weekly")}
            className={`rounded-lg px-4 py-2 ${
              period === "weekly"
                ? "bg-blue-600 text-white"
                : "border border-gray-300"
            }`}
          >
            Weekly
          </button>

          <button
            type="button"
            onClick={() => setPeriod("monthly")}
            className={`rounded-lg px-4 py-2 ${
              period === "monthly"
                ? "bg-blue-600 text-white"
                : "border border-gray-300"
            }`}
          >
            Monthly
          </button>
        </div>
      </div>

      {loading && (
        <p role="status" className="text-gray-600">
          Loading {period} reports...
        </p>
      )}

      {!loading && error && (
        <section
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700"
        >
          <p>{error}</p>
          <button
            type="button"
            onClick={fetchReports}
            className="mt-3 rounded border border-red-300 px-3 py-1"
          >
            Try again
          </button>
        </section>
      )}

      {!loading && !error && reports.length === 0 && (
        <section className="rounded-lg border border-gray-200 p-6">
          <h2 className="font-semibold">No project reports available</h2>
          <p className="mt-2 text-gray-600">
            Reports will appear when projects are assigned to your manager
            account and progress snapshots have been recorded.
          </p>
        </section>
      )}

      {!loading && !error && reports.length > 0 && (
        <div className="space-y-5">
          {reports.map((report) => (
            <section
              key={report.projectId}
              className="rounded-xl border border-gray-200 p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">
                    {report.projectName}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Status: {report.projectStatus || "Not specified"}
                  </p>
                </div>

                <span className="rounded-full bg-gray-100 px-3 py-1 text-sm">
                  {report.history.length} {period}{" "}
                  {report.history.length === 1 ? "snapshot" : "snapshots"}
                </span>
              </div>

              {report.history.length === 0 ? (
                <p className="mt-4 text-gray-600">
                  No {period} snapshots have been recorded for this project yet.
                </p>
              ) : (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[600px] text-left text-sm">
                    <thead>
                      <tr className="border-b text-gray-500">
                        <th className="py-3 pr-4">Period start</th>
                        <th className="py-3 pr-4">Completed tasks</th>
                        <th className="py-3 pr-4">Total tasks</th>
                        <th className="py-3 pr-4">Progress</th>
                        <th className="py-3">Completed during period</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.history.map((snapshot) => (
                        <tr
                          key={`${snapshot.periodStart}-${snapshot.periodEnd}`}
                          className="border-b last:border-0"
                        >
                          <td className="py-3 pr-4">
                            {new Date(snapshot.periodStart).toLocaleDateString()}
                          </td>
                          <td className="py-3 pr-4">
                            {snapshot.completedTasks}
                          </td>
                          <td className="py-3 pr-4">
                            {snapshot.totalTasks}
                          </td>
                          <td className="py-3 pr-4">
                            <div className="flex items-center gap-3">
                              <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-200">
                                <div
                                  className="h-full rounded-full bg-blue-600"
                                  style={{
                                    width: `${snapshot.progressPercentage}%`,
                                  }}
                                />
                              </div>
                              <span>
                                {snapshot.progressPercentage}%
                              </span>
                            </div>
                          </td>
                          <td className="py-3">
                            {snapshot.tasksCompletedDuringPeriod}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          ))}
        </div>
      )}
    </main>
  );
};

export default ProgressReports;