//Page 4
//testing changes
"use client";
import { useState , useEffect} from "react";
import Link from "next/link";
export default function Home() {
    const [touches, Touches] = useState(null);
    const [username, Name] = useState("");
    const [pictures, Pictures] = useState<string[]>([]);
    const categories = ["Animals", "Places", "Items", "Foods", "Miscellaneous"]
    useEffect(() => {
      Name(localStorage.getItem("username"));

      async function getTouches() {
      const username = localStorage.getItem("username");
      const res = await fetch(`http://127.0.0.1:5000/getTouches?username=${username}`, {
      method: "GET",
      });
      const data = await res.json();
      Touches(data.touches);
      }
      getTouches();

      async function getPictures(){
      const username = localStorage.getItem("username");
      const res = await fetch(`http://127.0.0.1:5000/getPictures?username=${username}`, {
      method: "Get",
      });
      const data = await res.json();
      Pictures(data.pictures);
      }
      getPictures();
    }, []);



    return (
        <div className="min-h-screen bg-white flex flex-col">
            <nav className="text-white">
                <div className="font-bold bg-green-400 text-center py-8 text-xl border-b-2 border-black">Welcome to TouchGrass</div>
                <div className="flex">
                    <Link href="/Pg1" className="flex-1">
                        <button className="bg-green-500 hover:bg-gray-500 px-15 py-4 w-full text-center border-1 border-b-3 border-l-0 border-black">Challenge Page</button>
                    </Link>
                    <Link href="/Pg2" className="flex-1">
                        <button className="bg-green-500 hover:bg-gray-500 px-15 py-4 w-full text-center border-2 border-black border-l-1 border-r-1">Voting Page</button>
                    </Link>
                    <Link href="/Pg3" className="flex-1">
                        <button className="bg-green-500 hover:bg-gray-500 px-15 py-4 w-full text-center border-2 border-black border-l-1 border-r-1">Leaderboard Page</button>
                    </Link>
                    <Link href="" className="flex-1">
                    <button className="bg-green-600 px-15 py-4 w-full text-center border-2 border-black border-l-1">Profile Page</button>
                    </Link>
                </div>                
            </nav>

            <h1 style ={{marginBottom:'20px',fontSize:'28px',color:'green',margin:'20px auto', padding:'25px'}}>Profile</h1>

            <p style = {{marginBottom:'20px', color:'black', paddingLeft:'25vw', fontSize:'25px'}}>Profile Username: {username}</p>
            <p style = {{marginBottom:'60px', color:'black', paddingLeft:'25vw', fontSize:'25px'}}>Total Profile Touches: {touches}</p>
            <p style = {{marginBottom: '30px', color:'black', paddingLeft:'25vw', fontSize: '25px'}}>Your Saved Profile Pictures(One save per category): </p>
            <div style={{marginBottom:'60px', marginTop:'10px', display:'flex', flexDirection:'column', alignItems:'center', gap:'50px'}}>
                {pictures .filter((pic) => pic !==null) .map((pic, index) => (
                    <div key={index} style={{textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center'}}>
                        <p style={{marginBottom:'10px'}}>{categories[pic.image_index]}</p>
                        <img key={index} src={`http://127.0.0.1:5000/getImages/${pic.file_id}`}
                        style={{width:'50%', height:'auto', border:'10px solid #18E745'}}/>
                    </div>
                ))}
            </div>

            <Link href = "/Login" style={{display:'flex',justifyContent:'center', marginBottom:'20px'}}>

                <button className="bg-green-500 hover:bg-green-600 text-white rounded-lg px-4 py-2 font-semibold hover:bg-green-600">
                    Log Out
                </button>
            </Link>            
            
        </div>
    );
}