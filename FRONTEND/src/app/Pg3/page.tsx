"use client";
import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableContainer from '@mui/material/TableContainer';
import { useState, useEffect } from "react";
import Link from "next/link";
export default function Home() {
    type leaderboardData = {
        username: string;
        touches_total: number;
        images: {
        id: string;
        filename: string;
        content_type: string;
        upload_date: string;
        username: string;
        image_index: number;
    }[] | null[];
    }
    type imageData = {
      username: string;
        touches_total: number;
        images: {
        id: string;
        filename: string;
        content_type: string;
        upload_date: string;
        username: string;
        image_index: number;
    }[] | null[];
  }
    const [leaderboard, Leaderboard] = useState<leaderboardData[]>([]);
    const [leaderPics, setLeaderPics] = useState<imageData[]>([]);
    useEffect(() => {
          async function getTopTen() {
          const res = await fetch(`http://127.0.0.1:5000/getTopTen`, {
          method: "GET",
          });
          const data = await res.json();
          Leaderboard(data.leaderboard);
          }
          getTopTen();

          async function getLeaderPics() {
            const res = await fetch(`http://127.0.0.1:5000/getLeaderPics`, {
            method: "GET",
            });
            const data = await res.json();
            setLeaderPics(data.leaderboard);
            }
            getLeaderPics();
        }, []);

    return (
        <div className="min-h-screen bg-red-100 flex flex-col">
            <nav className="text-white">
                <div className="font-bold bg-green-400 text-center py-8 text-xl border-b-2 border-black">Welcome to TouchGrass</div>
                <div className="flex">
                    <Link href="/Pg1" className="flex-1">
                        <button className="bg-green-500 hover:bg-gray-500 px-15 py-4 w-full text-center border-1 border-b-3 border-l-0 border-black">Challenge Page</button>
                    </Link>
                    <Link href="/Pg2" className="flex-1">
                        <button className="bg-green-500 hover:bg-gray-500 px-15 py-4 w-full text-center border-2 border-black border-l-1 border-r-1">Voting Page</button>
                    </Link>
                    <Link href="" className="flex-1">
                        <button className="bg-green-600 px-15 py-4 w-full text-center border-2 border-black border-l-1 border-r-1">Leaderboard Page</button>
                    </Link>
                    <Link href="/Pg4" className="flex-1">
                    <button className="bg-green-500 hover:bg-gray-500 px-15 py-4 w-full text-center border-2 border-black border-l-1">Profile Page</button>
                    </Link>
                </div>                
            </nav>

      <div className="flex-1 flex flex-col items-center justify-center gap-6 py-10">
        <h1 className="text-2xl font-bold text-black">
          Top 15 User Profiles This Week
        </h1>

      <TableContainer sx={{maxHeight: 440, width: "75%", margin: "0 auto", marginBottom: 10, backgroundColor: "white", border: "2px solid black"}}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              <TableCell align="center">Rank</TableCell>
              <TableCell align="center">Touches</TableCell>
              <TableCell align="center">Username</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {leaderboard.map((entry, index) => (
              <TableRow key={entry.username}>
                <TableCell align="center">{index + 1}</TableCell>
                <TableCell align="center">{entry.touches_total}</TableCell>
                <TableCell align="center">{entry.username}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TableContainer sx={{maxHeight: 640, width: "95%", margin: "0 auto", marginBottom: 20, backgroundColor: "white", border: "2px solid black"}}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              <TableCell align="center">Username</TableCell>
              <TableCell align="center">Animals</TableCell>
              <TableCell align="center">Places</TableCell>
              <TableCell align="center">Items</TableCell>
              <TableCell align="center">Foods</TableCell>
              <TableCell align="center">Miscellaneous</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {leaderPics.map((entry, index) => (
              <TableRow key={entry.username}>
                <TableCell align="center">{entry.username}</TableCell>
                <TableCell align="center">{entry.images[0] ? <img src={`http://127.0.0.1:5000/weeklyImage/${entry.images[0].id}`} style={{ width: "100%", height: "100%"}} /> : "None"}</TableCell>
                <TableCell align="center">{entry.images[1] ? <img src={`http://127.0.0.1:5000/weeklyImage/${entry.images[1].id}`} style={{ width: "100%", height: "100%"}} /> : "None"}</TableCell>
                <TableCell align="center">{entry.images[2] ? <img src={`http://127.0.0.1:5000/weeklyImage/${entry.images[2].id}`} style={{ width: "100%", height: "100%"}} /> : "None"}</TableCell>
                <TableCell align="center">{entry.images[3] ? <img src={`http://127.0.0.1:5000/weeklyImage/${entry.images[3].id}`} style={{ width: "100%", height: "100%"}} /> : "None"}</TableCell>
                <TableCell align="center">{entry.images[4] ? <img src={`http://127.0.0.1:5000/weeklyImage/${entry.images[4].id}`} style={{ width: "100%", height: "100%"}} /> : "None"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

  </div>
</div>
    );
}