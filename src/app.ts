import { json } from 'body-parser';
import { merge } from 'config-plus';
import dotenv from 'dotenv';
import express from 'express';
import http from 'http';
import mysql from 'mysql';
import { config, env } from './config';
import { useContext } from './context';
import { route } from './route';

dotenv.config();
const conf = merge(config, process.env, env, process.env.ENV);

const app = express();
app.use(json());

const pool = mysql.createPool(conf.db);

pool.getConnection((err, conn) => {
  if (err) {
    console.error('Failed to connect to MySQL.', err.message, err.stack);
  } else if (conn) {
    console.log('Connected successfully to MySQL.');
    const ctx = useContext(pool, conf);
    route(app, ctx);
    http.createServer(app).listen(conf.port, () => {
      console.log('Start server at port ' + conf.port);
    });
  }
});
