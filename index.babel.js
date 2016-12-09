require('log-timestamp');
import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import morgan from 'morgan';

import server from './src/server';

const app = express();
const port = process.env.PORT || 8080;

app.set('port', port);
app.set('trust_proxy', 1);
app.use(bodyParser.json());
app.use(morgan('[:date[iso]] :remote-addr ":method :url HTTP/:http-version" :status :res[content-length] ":user-agent"'));

const isDevelopment = process.env.NODE_ENV === 'development';

if (isDevelopment) {
  const webpack = require('webpack');
  const webpackMiddleware = require('webpack-dev-middleware');
  const webpackHotMiddleware = require('webpack-hot-middleware');
  const config = require('./webpack.config.js');
  const compiler = webpack(config);
  const middleware = webpackMiddleware(compiler, {
    publicPath: config.output.publicPath,
    contentBase: 'src/client',
    stats: {
      colors: true,
      hash: false,
      timings: true,
      chunks: false,
      chunkModules: false,
      modules: false
    }
  });

  app.use(middleware);
  app.use(webpackHotMiddleware(compiler));
  app.get('', function response(req, res) {
    res.write(middleware.fileSystem.readFileSync(path.join(__dirname, 'dist/index.html')));
    res.end();
  });
} else {
  app.use('/', express.static(path.resolve(__dirname, 'dist')));
  app.get('', function response(req, res) {
    res.sendFile(path.join(__dirname, 'dist/index.html'));
  });
}

server(app);

app.listen(port, function () {
   console.info('Listening on port ' + port);
});
