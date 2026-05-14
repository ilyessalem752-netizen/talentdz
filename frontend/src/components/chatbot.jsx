
import api from '../services/api';
import { useState } from 'react'; 

export default function ChatBot() {

  const [message, setMessage] = useState('');

  const [response, setResponse] = useState('');

 const handleSend = async () => {

  try {

   const res = await api.get(`/jobs?search=${message}`);
   console.log("DATA =", res.data)
   console.log("JOBS =", res.data.jobs)
    const jobs = res.data.data|| [];

    const search = message.toLowerCase();

    const filtered = jobs.filter(job =>

  job.title?.toLowerCase().includes(search) ||

  job.skills?.some(skill =>
    skill.toLowerCase().includes(search)
     )

);


      


    if (filtered.length > 0) {

      setResponse(
        filtered.map(job => `


💼 ${job.title}

🏢 ${job.company?.name || 'Entreprise'}

📍 ${job.wilaya || 'Algérie'}

🧠 ${job.skills || 'Pas de skills'}


`).join('\n')
      );

    } else {

      setResponse('❌ ماكانتش offres مطابقة');

    }

  } catch (err) {

    setResponse('❌ خطأ فالـ API');

  }

};

  return (

    <div className="bg-white p-6 rounded-xl shadow-md mt-10 max-w-xl">

      <h2 className="text-2xl font-bold mb-4">

        🤖 Assistant IA TalentDZ

      </h2>

      <div className="flex gap-2 mt-3">
  <input
    type="text"
    placeholder="اكتب React أو stage..."
    className="flex-1 border p-3 rounded-lg"
    value={message}
    onChange={(e) => setMessage(e.target.value)}
  />

  <button
    onClick={handleSend}
    className="bg-blue-500 text-white px-4 rounded-lg"
  >
    Envoyer
  </button>
</div>

      

      {response && (

        <div className="mt-4 p-4 bg-white rounded-xl whitespace-pre-line shadow border max-w-xl mx-auto">
            {response}
</div>

          

       

      )}

    </div>

  );

}






