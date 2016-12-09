module.exports = (app) => {
  app.get('/hello/:name', (req, res) => {
    res.status(200).send("Hello " + req.params.name)
  })
}
