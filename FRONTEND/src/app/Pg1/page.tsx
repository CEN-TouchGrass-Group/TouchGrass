//PAGE 1
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function Home() {
  //Defining weekly objectives seed
  const now = new Date();
  const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();

  function seededRandom(seed: number) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }

  const index = Math.floor(seededRandom(seed) * 50); // same for everyone today

  //Using index to pull from csv, generate array of objectives
  const [objectives, setObjectives] = useState<string[]>([]);
  const [wikiLinks, setWikiLinks] = useState<string[]>([]);

  useEffect(() => {
    const files = ["Animals", "Places", "Items", "Foods", "Miscellaneous"];
    const wikiFiles = ["AnimalsWiki", "PlacesWiki", "ItemsWiki", "FoodsWiki", "MiscellaneousWiki"];
    
    Promise.all(
      files.map(f => fetch(`/${f}.csv`).then(res => res.text()))
    ).then(results => {
      const picked = results.map(text => {
        const rows = text.split("\n").map(r => r.trim()).filter(r => r);
        return rows[index];
      });
      setObjectives(picked);
      
    });
    Promise.all(
      wikiFiles.map(f => fetch(`/${f}.csv`).then(res => res.text()))
    ).then(results => {
      const picked = results.map(text => {
        const rows = text.split("\n").map(r => r.trim()).filter(r => r);
        return rows[index];
      });
      setWikiLinks(picked);
    });
      
  }, [index]);

  //add code here to pull wiki links, just copy exact stuff above for new csv files*** (or ask Kieran)

  //display

  const [error, setError] = useState("");
  const [username, Name] = useState("");
  const [pic1, setPic1] = useState<string>("upload.jpg");
  const [pic2, setPic2] = useState<string>("upload.jpg");
  const [pic3, setPic3] = useState<string>("upload.jpg");
  const [pic4, setPic4] = useState<string>("upload.jpg");
  const [pic5, setPic5] = useState<string>("upload.jpg");
  const [f1, setF1] = useState<File | null>(null);
  const [f2, setF2] = useState<File | null>(null);
  const [f3, setF3] = useState<File | null>(null);
  const [f4, setF4] = useState<File | null>(null);
  const [f5, setF5] = useState<File | null>(null);

  useEffect(() => {
    Name(localStorage.getItem("username"));
    const username = localStorage.getItem("username");

    fetch(`http://127.0.0.1:5000/getWeeklySubmission?username=${username}`)
      .then(res => res.json())
      .then(data => {
        if (data.weekly_submission) {
        const pics = data.weekly_submission.images
        setPic1(pics[0] ? `http://127.0.0.1:5000/weeklyImage/${pics[0].id}` : "upload.jpg");
        setPic2(pics[1] ? `http://127.0.0.1:5000/weeklyImage/${pics[1].id}` : "upload.jpg");
        setPic3(pics[2] ? `http://127.0.0.1:5000/weeklyImage/${pics[2].id}` : "upload.jpg");
        setPic4(pics[3] ? `http://127.0.0.1:5000/weeklyImage/${pics[3].id}` : "upload.jpg");
        setPic5(pics[4] ? `http://127.0.0.1:5000/weeklyImage/${pics[4].id}` : "upload.jpg");
        }
    })
    .catch(err => console.error(err));
}, []);

  async function imageChange(e:React.ChangeEvent<HTMLInputElement>, setPreview: (url: string) => void, picture: string, username: string, imageIndex: number, set: (file: File)=> void){
    const file = e.target.files?.[0];
    if (file) {
      set(file);
      const link = URL.createObjectURL(file);
      setPreview(link);
      const formData = new FormData();
      formData.append("image", file);
      try {
        const res = await fetch(`http://127.0.0.1:5000/uploadImage/${username}/${imageIndex}`, {
        method: "POST", body: formData,
        });
        const data = await res.json();
        if(!res.ok){
          setError(data.error);
        }
        else{
          alert("Image uploaded successfully!");
        }
      }
      catch (err) {
        alert("could not connect");
      }
    }
  }
  async function HandleImageUpload(file: File, username: string, imageIndex: number){
    const forms = new FormData();
    forms.append("image", file);
    const res = await fetch(`http://127.0.0.1:5000/uploadImageUserInfo/${username}/${imageIndex}`, {
    method: "POST", body: forms,
  });
  const data = await res.json();
  res.ok ? alert("Saved to profile!") : setError(data.error);
  }

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <nav className="text-white">
                <div className="font-bold bg-green-400 text-center py-8 text-xl border-b-2 border-black">Welcome to TouchGrass</div>
                <div className="flex">
                    <Link href="" className="flex-1">
                        <button className="bg-green-600 px-15 py-4 w-full text-center border-1 border-b-3 border-l-0 border-black">Challenge Page</button>
                    </Link>
                    <Link href="/Pg2" className="flex-1">
                        <button className="bg-green-500 hover:bg-gray-500 px-15 py-4 w-full text-center border-2 border-black border-l-1 border-r-1">Voting Page</button>
                    </Link>
                    <Link href="/Pg3" className="flex-1">
                        <button className="bg-green-500 hover:bg-gray-500 px-15 py-4 w-full text-center border-2 border-black border-l-1 border-r-1">Leaderboard Page</button>
                    </Link>
                    <Link href="/Pg4" className="flex-1">
                    <button className="bg-green-500 hover:bg-gray-500 px-15 py-4 w-full text-center border-2 border-black border-l-1">Profile Page</button>
                    </Link>
                </div>                
            </nav>

            <div className="page">

      <h2 style ={{marginBottom:'5px',fontSize:'28px',color:'black', textAlign:'center', marginTop:'50px'}}>Category: Animals</h2>
      <h2 style ={{marginBottom:'5px',fontSize:'28px',color:'black', textAlign:'center'}}>Objective: {objectives[0]}</h2>
      <h2 style ={{marginBottom:'5px',fontSize:'28px',color:'black', textAlign:'center'}}>
        <a href={wikiLinks[0]} target="_blank" rel="noopener noreferrer" style={{color:'blue', textDecoration:'underline'}}>Learn more!</a>
      </h2>
      <div style = {{backgroundColor: '#95f195', border:'2px solid green', borderRadius:'12px',width:'60%',maxWidth:'600px',margin:'20px auto', padding:'25px'}}>
        <h2 style ={{marginBottom:'20px',fontSize:'28px',color:'green'}}>Upload Image 1</h2>
        <label className = "hover:bg-green-300" style = {{display:'block',backgroundColor:'white',color:'green',border:'2px solid green',borderRadius:'8px',padding:'12px 24px',fontSize:'18px',cursor:'pointer',transition:'0.2s'}}>
          Choose Image:
          <input style = {{display:'none',border:'2px solid green',marginTop:'7px',borderRadius:'8px',padding:'6px 12px'}} type="file" accept="image/*" onChange={(e) => imageChange(e, setPic1, "pic1", username, 0, setF1)} />
          <img style = {{width: pic1 === 'upload.jpg' ? '40%' : '100%', height: 'auto'}} src={pic1}/>
        </label>
        <button className="bg-green-500 hover:bg-green-600 text-white rounded-lg px-4 py-2 font-semibold hover:bg-green-600" style={{marginTop:'20px'}} onClick={async ()=> {
        if(f1){
          await HandleImageUpload(f1, username, 0);
        }else if(pic1 !== "upload.jpg"){
          const blob = await fetch(pic1).then(r => r.blob());
          const file = new File([blob], "image.jpg", { type: blob.type });
          await HandleImageUpload(file, username, 0);
        }
      }}>Save to Profile Slot 1</button>
        <p style={{color:'red', marginTop:'3px'}}>You only get one save per category!</p>
      </div>

      <h2 style ={{marginBottom:'5px',fontSize:'28px',color:'black', textAlign:'center', marginTop:'50px'}}>Category: Places</h2>
      <h2 style ={{marginBottom:'5px',fontSize:'28px',color:'black', textAlign:'center'}}>Objective: {objectives[1]}</h2>
      <div style = {{backgroundColor: '#95f195', border:'2px solid green', borderRadius:'12px',width:'60%',maxWidth:'600px',margin:'20px auto', padding:'25px'}}>
        <h2 style ={{marginBottom:'20px',fontSize:'28px',color:'green'}}>Upload Image 2</h2>
        <label className = "hover:bg-green-300" style = {{display:'block',backgroundColor:'white',color:'green',border:'2px solid green',borderRadius:'8px',padding:'12px 24px',fontSize:'18px',cursor:'pointer',transition:'0.2s'}}>
          Choose Image:
          <input style = {{display:'none',border:'2px solid green',marginTop:'7px',borderRadius:'8px',padding:'6px 12px'}} type="file" accept="image/*" onChange={(e) => imageChange(e, setPic2, "pic2", username, 1, setF2)} />
          <img style = {{width: pic2 === 'upload.jpg' ? '40%' : '100%', height: 'auto'}} src={pic2}/>
        </label>
        <button className="bg-green-500 hover:bg-green-600 text-white rounded-lg px-4 py-2 font-semibold hover:bg-green-600" style={{marginTop:'20px'}} onClick={async ()=> {
        if(f2){
          await HandleImageUpload(f2, username, 1);
        }else if(pic2 !== "upload.jpg"){
          const blob = await fetch(pic2).then(r => r.blob());
          const file = new File([blob], "image.jpg", { type: blob.type });
          await HandleImageUpload(file, username, 1);
        }
      }}>Save to Profile Slot 2</button>
        <p style={{color:'red', marginTop:'3px'}}>You only get one save per category!</p>
      </div>

      <h2 style ={{marginBottom:'5px',fontSize:'28px',color:'black', textAlign:'center', marginTop:'50px'}}>Category: Items</h2>
      <h2 style ={{marginBottom:'5px',fontSize:'28px',color:'black', textAlign:'center'}}>Objective: {objectives[2]}</h2>
      <h2 style ={{marginBottom:'5px',fontSize:'28px',color:'black', textAlign:'center'}}>
        <a href={wikiLinks[2]} target="_blank" rel="noopener noreferrer" style={{color:'blue', textDecoration:'underline'}}>Learn more!</a>
      </h2>
      <div style = {{backgroundColor: '#95f195', border:'2px solid green', borderRadius:'12px',width:'60%',maxWidth:'600px',margin:'20px auto', padding:'25px'}}>
        <h2 style ={{marginBottom:'20px',fontSize:'28px',color:'green'}}>Upload Image 3</h2>
        <label className = "hover:bg-green-300" style = {{display:'block',backgroundColor:'white',color:'green',border:'2px solid green',borderRadius:'8px',padding:'12px 24px',fontSize:'18px',cursor:'pointer',transition:'0.2s'}}>
          Choose Image:
          <input style = {{display:'none',border:'2px solid green',marginTop:'7px',borderRadius:'8px',padding:'6px 12px'}} type="file" accept="image/*" onChange={(e) => imageChange(e, setPic3, "pic3", username, 2, setF3)} />
          <img style = {{width: pic3 === 'upload.jpg' ? '40%' : '100%', height: 'auto'}} src={pic3}/>
        </label>
        <button className="bg-green-500 hover:bg-green-600 text-white rounded-lg px-4 py-2 font-semibold hover:bg-green-600" style={{marginTop:'20px'}} onClick={async ()=> {
        if(f3){
          await HandleImageUpload(f3, username, 2);
        }else if(pic3 !== "upload.jpg"){
          const blob = await fetch(pic3).then(r => r.blob());
          const file = new File([blob], "image.jpg", { type: blob.type });
          await HandleImageUpload(file, username, 2);
        }
      }}>Save to Profile Slot 3</button>
        <p style={{color:'red', marginTop:'3px'}}>You only get one save per category!</p>
      </div>

      <h2 style ={{marginBottom:'5px',fontSize:'28px',color:'black', textAlign:'center', marginTop:'50px'}}>Category: Foods</h2>
      <h2 style ={{marginBottom:'5px',fontSize:'28px',color:'black', textAlign:'center'}}>Objective: {objectives[3]}</h2>
      <h2 style ={{marginBottom:'5px',fontSize:'28px',color:'black', textAlign:'center'}}>
        <a href={wikiLinks[3]} target="_blank" rel="noopener noreferrer" style={{color:'blue', textDecoration:'underline'}}>Learn more!</a>
      </h2>
      <div style = {{backgroundColor: '#95f195', border:'2px solid green', borderRadius:'12px',width:'60%',maxWidth:'600px',margin:'20px auto', padding:'25px'}}>
        <h2 style ={{marginBottom:'20px',fontSize:'28px',color:'green'}}>Upload Image 4</h2>
        <label className = "hover:bg-green-300" style = {{display:'block',backgroundColor:'white',color:'green',border:'2px solid green',borderRadius:'8px',padding:'12px 24px',fontSize:'18px',cursor:'pointer',transition:'0.2s'}}>
          Choose Image:
          <input style = {{display:'none',border:'2px solid green',marginTop:'7px',borderRadius:'8px',padding:'6px 12px'}} type="file" accept="image/*" onChange={(e) => imageChange(e, setPic4, "pic4", username, 3, setF4)} />
          <img style = {{width: pic4 === 'upload.jpg' ? '40%' : '100%', height: 'auto'}} src={pic4}/>
        </label>
        <button className="bg-green-500 hover:bg-green-600 text-white rounded-lg px-4 py-2 font-semibold hover:bg-green-600" style={{marginTop:'20px'}} onClick={async ()=> {
        if(f4){
          await HandleImageUpload(f4, username, 3);
        }else if(pic4 !== "upload.jpg"){
          const blob = await fetch(pic4).then(r => r.blob());
          const file = new File([blob], "image.jpg", { type: blob.type });
          await HandleImageUpload(file, username, 3);
        }
      }}>Save to Profile Slot 4</button>
        <p style={{color:'red', marginTop:'3px'}}>You only get one save per category!</p>
      </div>

      <h2 style ={{marginBottom:'5px',fontSize:'28px',color:'black', textAlign:'center', marginTop:'50px'}}>Category: Miscellaneous</h2>
      <h2 style ={{marginBottom:'5px',fontSize:'28px',color:'black', textAlign:'center'}}>Objective: {objectives[4]}</h2>
      <div style = {{backgroundColor: '#95f195', border:'2px solid green', borderRadius:'12px',width:'60%',maxWidth:'600px',margin:'20px auto', padding:'25px'}}>
        <h2 style ={{marginBottom:'20px',fontSize:'28px',color:'green'}}>Upload Image 5</h2>
        <label className = "hover:bg-green-300" style = {{display:'block',backgroundColor:'white',color:'green',border:'2px solid green',borderRadius:'8px',padding:'12px 24px',fontSize:'18px',cursor:'pointer',transition:'0.2s'}}>
          Choose Image:
          <input style = {{display:'none',border:'2px solid green',marginTop:'7px',borderRadius:'8px'}} type="file" accept="image/*" onChange={(e) => imageChange(e, setPic5, "pic5", username, 4, setF5)} />
          <img style = {{width: pic5 === 'upload.jpg' ? '40%' : '100%', height: 'auto'}} src={pic5}/>
        </label>
        <button className="bg-green-500 hover:bg-green-600 text-white rounded-lg px-4 py-2 font-semibold hover:bg-green-600" style={{marginTop:'20px'}} onClick={async ()=> {
        if(f5){
          await HandleImageUpload(f5, username, 4);
        }else if(pic5 !== "upload.jpg"){
          const blob = await fetch(pic5).then(r => r.blob());
          const file = new File([blob], "image.jpg", { type: blob.type });
          await HandleImageUpload(file, username, 4);
        }
      }}>Save to Profile Slot 5</button>
        <p style={{color:'red', marginTop:'3px'}}>You only get one save per category!</p>
      </div>
    </div>
            
        </div>
    );
}