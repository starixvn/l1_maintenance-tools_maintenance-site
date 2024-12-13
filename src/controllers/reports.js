exports.getReports = (req, res) => {
  res.render("pages/reports/activity", {
    title: "Activity Log",
  });
};

exports.getStatistics = (req, res) => {
  res.render("pages/reports/statistics", {
    title: "Statistics",
  });
};
