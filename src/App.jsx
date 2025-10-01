
import React, {useState, useCallback} from "react";
import Papa from "papaparse";
import { loadRules, saveRules } from "./utils/storage";
import { Transactions } from "./components/Transactions";
import { RulesManager } from "./components/RulesManager";
import { Charts } from "./components/Charts";
import { ToastContainer, useToasts } from "./components/Toasts";

const STOPWORDS = new Set(["the","a","an","and","at","in","on","of","for","to","by","from","with","store","inc","llc"]);

function smartKeyword(desc){
  if(!desc) return "";
  const w = desc.replace(/[^\w\s]/g, ' ').toLowerCase().split(/\s+/).filter(Boolean);
  for(const token of w){
    if(token.length<=2) continue;
    if(STOPWORDS.has(token)) continue;
    return token;
  }
  return w[0] || "";
}

export default function App(){
  const [tab, setTab] = useState("transactions");
  const [rules, setRules] = useState(loadRules());
  const [transactions, setTransactions] = useState([]);
  const [showGraphs, setShowGraphs] = useState({pie:true,line:true,bar:true});
  const [excludeIncome, setExcludeIncome] = useState(false);
  const { toasts, pushToast, removeToast } = useToasts();

  const handleUpload = (file) => {
    if(!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data
          .map(r => ({
            Date: r.Date || r.date || r.TransactionDate || r["Posted Date"] || "",
            Description: r.Description || r.Payee || r.Merchant || r["Description"] || "",
            Amount: r.Amount || r.amount || r["Debit"] || r["Credit"] || r["Transaction Amount"] || r["Amount"] || ""
          }))
          .filter(r => r.Date && r.Description && r.Amount !== undefined)
          .map(r => ({
            ...r,
            Amount: Number(String(r.Amount).replace(/[^0-9.-]+/g,'')) || 0,
            category: applyRules(r.Description, rules)
          }));
        setTransactions(rows);
        setTab("transactions");
      }
    });
  };

  const handleFolder = (fileList) => {
    if(!fileList || fileList.length===0) return;
    const filesToParse = Array.from(fileList).filter(f => f.name && (f.name.toLowerCase().endsWith('.csv') || f.name.toLowerCase().endsWith('.txt')));
    const allFiles = filesToParse.length ? filesToParse : Array.from(fileList);
    let allRows = [];
    let processed = 0;
    allFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const res = Papa.parse(e.target.result, {header:true, skipEmptyLines:true});
          const rows = res.data.map(r => ({
            Date: r.Date || r.date || r.TransactionDate || r["Posted Date"] || "",
            Description: r.Description || r.Payee || r.Merchant || r["Description"] || "",
            Amount: r.Amount || r.amount || r["Debit"] || r["Credit"] || r["Transaction Amount"] || r["Amount"] || ""
          })).filter(r => r.Date && r.Description && r.Amount !== undefined)
            .map(r => ({...r, Amount: Number(String(r.Amount).replace(/[^0-9.-]+/g,''))||0, category: applyRules(r.Description, rules)}));
          allRows = allRows.concat(rows);
        } catch(err) {
          console.warn('file parse error', file.name, err);
        }
        processed++;
        if(processed === allFiles.length){
          setTransactions(allRows);
          setTab('transactions');
        }
      };
      reader.readAsText(file);
    });
  };

  const updateRules = (newRules) => {
    setRules(newRules);
    saveRules(newRules);
    setTransactions(prev => prev.map(t => ({...t, category: applyRules(t.Description, newRules)})));
  };

  const importAndReplaceRules = (imported) => {
    if(!Array.isArray(imported)) return;
    updateRules(imported);
    pushToast({type:'success', message:'Rules imported and replaced.'});
    setTab('rules');
  };

  const updateTransactionCategory = (index, category) => {
    setTransactions(prev => {
      const copy = [...prev];
      copy[index] = {...copy[index], category};
      return copy;
    });
    const desc = transactions[index] && transactions[index].Description ? transactions[index].Description : null;
    if(!desc) return;
    const kw = smartKeyword(desc);
    if(!kw) return;
    setRules(prevRules => {
      const exists = prevRules.find(r => r.keyword === kw);
      let newRules;
      if(exists){
        newRules = prevRules.map(r => r.keyword === kw ? {...r, category} : r);
      } else {
        newRules = [...prevRules, {keyword: kw, category}];
      }
      saveRules(newRules);
      pushToast({type:'success', message:`Rule added/updated: '${kw}' → ${category}`});
      return newRules;
    });
  };

  const applyAllRules = () => {
    setTransactions(prev => prev.map(t => ({...t, category: applyRules(t.Description, rules)})));
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-700">Budgeting App</h1>
          <p className="text-sm text-slate-500">Upload statements, manage categorization rules, and visualize spending.</p>
        </div>
        <div className="flex space-x-2 items-center">
          <nav className="inline-flex rounded-lg bg-white shadow p-1">
            <button onClick={()=>setTab('transactions')} className={`px-4 py-2 text-sm font-medium ${tab==='transactions' ? 'bg-indigo-600 text-white rounded-lg' : 'text-slate-600'}`}>Transactions</button>
            <button onClick={()=>setTab('rules')} className={`px-4 py-2 text-sm font-medium ${tab==='rules' ? 'bg-indigo-600 text-white rounded-lg' : 'text-slate-600'}`}>Rules</button>
            <button onClick={()=>setTab('graphs')} className={`px-4 py-2 text-sm font-medium ${tab==='graphs' ? 'bg-indigo-600 text-white rounded-lg' : 'text-slate-600'}`}>Graphs</button>
          </nav>
        </div>
      </header>

      <div className="mb-4 flex items-center gap-3">
        <input id="file" type="file" accept=".csv" onChange={(e)=>handleUpload(e.target.files[0])} className="hidden" />
        <label htmlFor="file" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded shadow cursor-pointer inline-flex items-center gap-2">Upload CSV</label>

        <label className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded shadow cursor-pointer inline-flex items-center gap-2">
          Load Folder
          <input type="file" webkitdirectory="true" directory="" multiple onChange={(e)=>handleFolder(e.target.files)} className="hidden" />
        </label>

        <button onClick={applyAllRules} className="px-3 py-2 bg-gray-100 rounded shadow hover:bg-gray-200">Apply Rules</button>
        <button onClick={()=>{ const blob = new Blob([JSON.stringify(rules,null,2)],{type:'application/json'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='rules.json'; a.click(); URL.revokeObjectURL(url); }} className="px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded shadow">Export Rules</button>

        <label className="px-3 py-2 bg-yellow-400 hover:bg-yellow-500 text-white rounded shadow cursor-pointer">
          Import Rules (replace)
          <input type="file" accept=".json" onChange={(e)=>{ const f=e.target.files[0]; if(!f) return; const reader=new FileReader(); reader.onload=(ev)=>{ try{ const imported=JSON.parse(ev.target.result); importAndReplaceRules(imported); }catch{ alert('Could not parse JSON'); } }; reader.readAsText(f); }} className="hidden" />
        </label>

        <div className="ml-auto flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={excludeIncome} onChange={(e)=>setExcludeIncome(e.target.checked)} /> Hide income from analysis</label>
          <div className="text-sm text-slate-500">Graphs:</div>
          <label className="text-sm"><input type="checkbox" checked={showGraphs.pie} onChange={(e)=>setShowGraphs(s=>({...s,pie:e.target.checked}))} /> Pie</label>
          <label className="text-sm"><input type="checkbox" checked={showGraphs.line} onChange={(e)=>setShowGraphs(s=>({...s,line:e.target.checked}))} /> Line</label>
          <label className="text-sm"><input type="checkbox" checked={showGraphs.bar} onChange={(e)=>setShowGraphs(s=>({...s,bar:e.target.checked}))} /> Bar</label>
        </div>
      </div>

      <main className="bg-white rounded-lg shadow p-4">
        {tab==="transactions" && <Transactions transactions={transactions} onUpdateCategory={(i,c)=>{ updateTransactionCategory(i,c); }} />}
        {tab==="rules" && <RulesManager rules={rules} setRules={updateRules} />}
        {tab==="graphs" && <Charts transactions={transactions} excludeIncome={excludeIncome} show={showGraphs} />}
      </main>

      <footer className="mt-6 text-sm text-slate-500">Rules are stored in your browser's localStorage and never leave your device.</footer>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

function applyRules(desc, rules){
  if(!desc) return '';
  const lowered = desc.toLowerCase();
  for(const rule of rules){
    if(!rule.keyword) continue;
    if(lowered.includes(rule.keyword.toLowerCase())) return rule.category || '';
  }
  return '';
}
