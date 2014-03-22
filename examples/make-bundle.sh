#!/usr/bin/env bash
node ../bin/cmd \
  --input src/index.js \
  --output dist/robot.js \
  --exports robot \
  --dependencies lodash:_,moment