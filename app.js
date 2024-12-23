import { leaky_bucket } from './strategies/leaky_bucket.js';
import express from 'express';
import fs from 'fs';
import axios from 'axios';
import yaml from 'js-yaml';
import { token_bucket } from './strategies/token_bucket.js';

const app = express()
const port = 3001


const config = yaml.load(fs.readFileSync('./routes-config.yaml', 'utf8'));
const leaky_buckets = {};
const token_buckets = {};

config.routes.forEach(route => {
  app.all(route.path, async (req, res) => {
    if (!route.methods.includes(req.method)) {
      return res.status(405).send("Method Not Allowed");
    }

    // Prepare headers and query
    const headers = {};
    for (const [key, value] of Object.entries(route.headers || {})) {
      headers[key] = eval(`\`${value}\``); // Replace dynamic placeholders
    }

    const strategy = route.strategy;
    if(strategy?.name === "leaky_bucket") {
      if(!handleLeakyBucket(strategy.rate, strategy.capacity, route)){
        return res.status(429).send("Too Many Requests");
      }
    }

    if(strategy?.name === "token_bucket") {
      if(!handleTokenBucket(strategy.rate, strategy.capacity, route)){
        return res.status(429).send("Too Many Requests");
      }
    }

    const query = {};
    for (const [key, value] of Object.entries(route.query || {})) {
      query[key] = eval(`\`${value}\``);
    }

    // Handle body transformations
    let data = req.body;
    try {
      const response = await axios({
        url: route.target,
        method: req.method,
        headers,
        params: query,
        data,
      });
      res.status(response.status).send(response.data);
    } catch (err) {
      res.status(err.response?.status || 500).send(err.message);
    }
  });
});

app.listen(port, () => {
  console.log(`Proxy server started on ${port}`)
})

function handleLeakyBucket(rate, capacity, route) {
  if (!leaky_buckets[route.path]) {
    leaky_buckets[route.path] = leaky_bucket(rate, capacity);
  }

  return leaky_buckets[route.path]()
}

function handleTokenBucket(rate, capacity, route) {
  if (!token_buckets[route.path]) {
    token_buckets[route.path] = token_bucket(rate, capacity);
  }

  return token_buckets[route.path]()
}