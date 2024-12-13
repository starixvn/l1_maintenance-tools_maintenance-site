exports.getHome = (req, res) => {
  res.render("pages/home", {
    title: "Express App",
  });
};
