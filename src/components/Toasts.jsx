
import React, {useState, useEffect} from "react";

let idCounter = 0;

export function useToasts(){
  const [toasts, setToasts] = useState([]);
  const pushToast = (t) => {
    const id = ++idCounter;
    const toast = {...t, id};
    setToasts(prev => [...prev, toast]);
    setTimeout(() => setToasts(prev => prev.filter(x=>x.id!==id)), 3500);
  };
  const removeToast = (id) => setToasts(prev => prev.filter(x=>x.id!==id));
  return { toasts, pushToast, removeToast };
}

export function ToastContainer({toasts, removeToast}){
  return (
    <div className="fixed right-4 bottom-4 flex flex-col gap-2 z-50">
      {toasts.map(t=>(
        <div key={t.id} className="min-w-[220px] bg-white shadow rounded p-3 border-l-4" style={{borderColor: t.type==='success' ? '#10B981' : '#3B82F6'}}>
          <div className="font-semibold text-sm">{t.type === 'success' ? '✅' : 'ℹ️'} {t.message}</div>
          <div className="text-xs text-slate-500 mt-1"><button onClick={()=>removeToast(t.id)} className="underline">Dismiss</button></div>
        </div>
      ))}
    </div>
  );
}
