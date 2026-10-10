
const cron = require("node-cron");
const {
  captureProgressSnapshots,
} = require("./progressSnapshotService");

function startProgressSnapshotScheduler() {
  // Every Monday at 00:05 UTC, capture the previous week.
  cron.schedule(
    "5 0 * * 1",
    async () => {
      try {
        const previousWeek = new Date();
        previousWeek.setUTCDate(previousWeek.getUTCDate() - 7);

        const result = await captureProgressSnapshots(
          "weekly",
          previousWeek
        );

        console.log(
          `Weekly progress snapshots saved: ${result.projectsProcessed}`
        );
      } catch (error) {
        console.error("Weekly progress snapshot job failed:", error);
      }
    },
    { timezone: "UTC" }
  );

  // On the first day of each month, capture the previous month.
  cron.schedule(
    "10 0 1 * *",
    async () => {
      try {
        const previousMonth = new Date();
        previousMonth.setUTCDate(1);
        previousMonth.setUTCDate(previousMonth.getUTCDate() - 1);

        const result = await captureProgressSnapshots(
          "monthly",
          previousMonth
        );

        console.log(
          `Monthly progress snapshots saved: ${result.projectsProcessed}`
        );
      } catch (error) {
        console.error("Monthly progress snapshot job failed:", error);
      }
    },
    { timezone: "UTC" }
  );

  console.log("Progress snapshot scheduler registered");
}

module.exports = { startProgressSnapshotScheduler };
