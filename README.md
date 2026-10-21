# Blog Platform

    cp .env.example .env        # then set JWT_SECRET
    npm run install:all
    npm run auth                # terminal 1: Auth Server  http://localhost:4000
    npm run blog                # terminal 2: Blog API + UI http://localhost:5000

Open http://localhost:5000 for the UI. Data is saved in each server's `storage/` folder.
