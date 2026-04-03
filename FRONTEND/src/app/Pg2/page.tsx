//PAGE 2
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
                        <button className="bg-green-500 hover:bg-gray-500 px-15 py-4 w-full text-center border-1 border-b-3 border-l-0 border-black">Challenge Page</button>
                    </Link>
                    <Link href="" className="flex-1">
                        <button className="bg-green-600 px-15 py-4 w-full text-center border-2 border-black border-l-1 border-r-1">Voting Page</button>
                    </Link>
                    <Link href="/Pg3" className="flex-1">
                        <button className="bg-green-500 hover:bg-gray-500 px-15 py-4 w-full text-center border-2 border-black border-l-1 border-r-1">Leaderboard Page</button>
                    </Link>
                    <Link href="/Pg4" className="flex-1">
                    <button className="bg-green-500 hover:bg-gray-500 px-15 py-4 w-full text-center border-2 border-black border-l-1">Profile Page</button>
                    </Link>
                </div>                
            </nav>

            <h2 style ={{marginBottom:'5px',fontSize:'28px',color:'black', textAlign:'center', marginTop:'50px'}}>Voting Category: Animals</h2>
            <div className="flex gap-[25%] pl-[20%] pt-[25px] pb-[100px]">
                <label className = "w-1/4 hover:bg-green-300" style = {{display:'block',backgroundColor:'white',color:'green',border:'2px solid green',borderRadius:'8px',padding:'12px 24px',fontSize:'18px',cursor:'pointer',transition:'0.2s'}}>
                Option 1:
                <img style = {{width: '100%', height: 'auto'}} src={"upload.jpg"}/>
                </label>

                <label className = "w-1/4 hover:bg-green-300" style = {{display:'block',backgroundColor:'white',color:'green',border:'2px solid green',borderRadius:'8px',padding:'12px 24px',fontSize:'18px',cursor:'pointer',transition:'0.2s',}}>
                Option 2:
                <img style = {{width: '100%', height: 'auto'}} src={"upload.jpg"}/>
                </label>
            </div>

            <div className="h-[3px] bg-green-400 mx-[15%]"></div>

            <h2 style ={{marginBottom:'5px',fontSize:'28px',color:'black', textAlign:'center', marginTop:'50px'}}>Voting Category: Foods</h2>
            <div className="flex gap-[25%] pl-[20%] pt-[25px] pb-[100px]">
                <label className = "w-1/4 hover:bg-green-300" style = {{display:'block',backgroundColor:'white',color:'green',border:'2px solid green',borderRadius:'8px',padding:'12px 24px',fontSize:'18px',cursor:'pointer',transition:'0.2s'}}>
                Option 1:
                <img style = {{width: '100%', height: 'auto'}} src={"upload.jpg"}/>
                </label>
                
                <label className = "w-1/4 hover:bg-green-300" style = {{display:'block',backgroundColor:'white',color:'green',border:'2px solid green',borderRadius:'8px',padding:'12px 24px',fontSize:'18px',cursor:'pointer',transition:'0.2s',}}>
                Option 2:
                <img style = {{width: '100%', height: 'auto'}} src={"upload.jpg"}/>
                </label>
            </div>

            <div className="h-[3px] bg-green-400 mx-[15%]"></div>

            <h2 style ={{marginBottom:'5px',fontSize:'28px',color:'black', textAlign:'center', marginTop:'50px'}}>Voting Category: Items</h2>
            <div className="flex gap-[25%] pl-[20%] pt-[25px] pb-[100px]">
                <label className = "w-1/4 hover:bg-green-300" style = {{display:'block',backgroundColor:'white',color:'green',border:'2px solid green',borderRadius:'8px',padding:'12px 24px',fontSize:'18px',cursor:'pointer',transition:'0.2s'}}>
                Option 1:
                <img style = {{width: '100%', height: 'auto'}} src={"upload.jpg"}/>
                </label>
                
                <label className = "w-1/4 hover:bg-green-300" style = {{display:'block',backgroundColor:'white',color:'green',border:'2px solid green',borderRadius:'8px',padding:'12px 24px',fontSize:'18px',cursor:'pointer',transition:'0.2s',}}>
                Option 2:
                <img style = {{width: '100%', height: 'auto'}} src={"upload.jpg"}/>
                </label>
            </div>

            <div className="h-[3px] bg-green-400 mx-[15%]"></div>

            <h2 style ={{marginBottom:'5px',fontSize:'28px',color:'black', textAlign:'center', marginTop:'50px'}}>Voting Category: Places</h2>
            <div className="flex gap-[25%] pl-[20%] pt-[25px] pb-[100px]">
                <label className = "w-1/4 hover:bg-green-300" style = {{display:'block',backgroundColor:'white',color:'green',border:'2px solid green',borderRadius:'8px',padding:'12px 24px',fontSize:'18px',cursor:'pointer',transition:'0.2s'}}>
                Option 1:
                <img style = {{width: '100%', height: 'auto'}} src={"upload.jpg"}/>
                </label>
                
                <label className = "w-1/4 hover:bg-green-300" style = {{display:'block',backgroundColor:'white',color:'green',border:'2px solid green',borderRadius:'8px',padding:'12px 24px',fontSize:'18px',cursor:'pointer',transition:'0.2s',}}>
                Option 2:
                <img style = {{width: '100%', height: 'auto'}} src={"upload.jpg"}/>
                </label>
            </div>

            <div className="h-[3px] bg-green-400 mx-[15%]"></div>

            <h2 style ={{marginBottom:'5px',fontSize:'28px',color:'black', textAlign:'center', marginTop:'50px'}}>Voting Category: Miscellaneous</h2>
            <div className="flex gap-[25%] pl-[20%] pt-[25px] pb-[100px]">
                <label className = "w-1/4 hover:bg-green-300" style = {{display:'block',backgroundColor:'white',color:'green',border:'2px solid green',borderRadius:'8px',padding:'12px 24px',fontSize:'18px',cursor:'pointer',transition:'0.2s'}}>
                Option 1:
                <img style = {{width: '100%', height: 'auto'}} src={"upload.jpg"}/>
                </label>
                
                <label className = "w-1/4 hover:bg-green-300" style = {{display:'block',backgroundColor:'white',color:'green',border:'2px solid green',borderRadius:'8px',padding:'12px 24px',fontSize:'18px',cursor:'pointer',transition:'0.2s',}}>
                Option 2:
                <img style = {{width: '100%', height: 'auto'}} src={"upload.jpg"}/>
                </label>
            </div>

            
        </div>
    );
}