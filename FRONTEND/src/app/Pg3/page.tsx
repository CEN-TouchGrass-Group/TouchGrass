//Page 3
"use client";
import { useState } from "react";
import Link from "next/link";

export default function Home() {
    return (
        <div className="min-h-screen bg-white flex flex-col">
            <nav className="text-white">
                <div className="font-bold bg-green-400 text-center py-8 text-xl border-b-2 border-black">Welcome to TouchGrass</div>
                <div className="flex">
                    <Link href="/Pg1" className="flex-1">
                        <button className="bg-green-500 hover:bg-gray-500 px-15 py-4 w-full text-center border-1 border-b-3 border-l-0 border-black">Page1</button>
                    </Link>
                    <Link href="/Pg2" className="flex-1">
                        <button className="bg-green-500 hover:bg-gray-500 px-15 py-4 w-full text-center border-2 border-black border-l-1 border-r-1">Page2</button>
                    </Link>
                    <Link href="" className="flex-1">
                        <button className="bg-green-600 px-15 py-4 w-full text-center border-2 border-black border-l-1 border-r-1">Page3</button>
                    </Link>
                    <Link href="/Pg4" className="flex-1">
                    <button className="bg-green-500 hover:bg-gray-500 px-15 py-4 w-full text-center border-2 border-black border-l-1">Page4</button>
                    </Link>
                </div>                
            </nav>


        </div>
    );
}