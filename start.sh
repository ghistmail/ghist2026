#!/bin/bash
npm install --production
NODE_ENV=production node dist/index.cjs
