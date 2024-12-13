exports.getSettings = (req, res) => {
  const settingType = req.params.type || "general";
  res.render("pages/settings", {
    title: `${
      settingType.charAt(0).toUpperCase() + settingType.slice(1)
    } Settings`,
    settingType,
  });
};

exports.updateSettings = (req, res) => {
  res.json({
    status: "success",
    message: "Settings updated successfully",
  });
};
