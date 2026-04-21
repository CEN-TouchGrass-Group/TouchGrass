# TouchGrass

Touch Grass is a gamified outdoor scavenger hunt platform. Users receive a "challenge" for the week with 5 categories and objectives that are updated daily. Users are expected to go take pictures of these items in real life and submit them to the platform. Each user can vote on other users' images in a "Hot or Not" system. The top 15 users get displayed in a leaderboard according to their number of "touches." Users can also save their favorite personal images to their profile.

## Installation Instructions

### Prerequisites
- Node.js and npm installed
- Python 3.x installed
- Git installed

### Setup Steps

1. **Clone the repository from GitHub:**
   ```bash
   git clone https://github.com/CEN-TouchGrass-Group/TouchGrass.git
   ```

2. **Navigate to the project directory:**
   ```bash
   cd TouchGrass
   ```

3. **Navigate to the FRONTEND directory:**
   ```bash
   cd FRONTEND
   ```

4. **Install frontend dependencies:**
   ```bash
   npm install
   ```

5. **Install Material UI dependencies:**
   ```bash
   npm install @mui/material @emotion/react @emotion/styled
   ```

6. **Start the frontend server:**
   ```bash
   npm run dev
   ```

7. **In a separate terminal, navigate to the root directory of the project:**
   ```bash
   cd TouchGrass
   ```

8. **Run the backend server:**
   ```bash
   python userinfo.py
   ```

9. **Open your browser and go to:**
   ```
   http://localhost:3000/
   ```

10. **You can now create an account and start using TouchGrass!**

## Features

- Weekly photo challenges with 5 categories
- Daily objective updates
- Image submission and voting system
- "Hot or Not" style voting on user submissions
- Leaderboard displaying top 15 users by "touches"
- Personal profile with saved favorite images
- Admin system for user management

## Tech Stack

- **Frontend:** React, Next.js, Material UI
- **Backend:** Python, Flask
- **Database:** MongoDB Atlas
- **Image Storage:** GridFS
