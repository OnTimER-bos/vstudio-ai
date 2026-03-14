import { useState,useEffect } from "react"

import Sidebar from "./components/Sidebar"
import Header from "./components/Header"
import FloatingInput from "./components/FloatingInput"

import Dashboard from "./labs/Dashboard"
import TextLab from "./labs/TextLab"
import ImageLab from "./labs/ImageLab"
import VideoLab from "./labs/VideoLab"

export default function App(){

const [tab,setTab]=useState("dashboard")
const [prompt,setPrompt]=useState("")
const [queue,setQueue]=useState([])
const [logs,setLogs]=useState([])
const [results,setResults]=useState([])
const [processing,setProcessing]=useState(false)

const [apiKey,setApiKey]=useState(
localStorage.getItem("gemini_key") || ""
)

useEffect(()=>{
localStorage.setItem("gemini_key",apiKey)
},[apiKey])

useEffect(()=>{
processQueue()
},[queue])

function log(msg){
setLogs(l=>[msg,...l])
}

function addTask(){

if(!prompt) return

const task={
id:Date.now(),
type:tab,
prompt
}

setQueue(q=>[...q,task])
setPrompt("")
log("Task Added")
}

async function processQueue(){

if(processing) return
if(queue.length===0) return

setProcessing(true)

const task=queue[0]

try{

const res=await fetch(
`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
{
method:"POST",
headers:{'Content-Type':'application/json'},
body:JSON.stringify({
contents:[{parts:[{text:task.prompt}]}]
})
})

const data=await res.json()

const text=data.candidates?.[0]?.content?.parts?.[0]?.text

setResults(r=>[
{id:task.id,text,type:task.type},
...r
])

log("Task Finished")

}catch(e){
log("Task Error")
}

setQueue(q=>q.slice(1))
setProcessing(false)

}

return(

<div className="flex h-screen">

<Sidebar tab={tab} setTab={setTab} logs={logs} />

<div className="flex-1 flex flex-col">

<Header apiKey={apiKey} setApiKey={setApiKey} />

<div className="flex-1 p-6 overflow-auto">

{tab==="dashboard" && 
<Dashboard queue={queue} results={results} />}

{tab==="text" && 
<TextLab results={results}/>}

{tab==="image" && 
<ImageLab />}

{tab==="video" && 
<VideoLab />}

</div>

<FloatingInput
prompt={prompt}
setPrompt={setPrompt}
addTask={addTask}
/>

</div>

</div>
)
}