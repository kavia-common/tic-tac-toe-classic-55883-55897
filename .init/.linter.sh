#!/bin/bash
cd /home/kavia/workspace/code-generation/tic-tac-toe-classic-55883-55897/frontend_react
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

