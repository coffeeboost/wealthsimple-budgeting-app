
import React, {useState, useEffect} from "react";

export function RulesManager({rules, setRules}){
  const [editingIndex, setEditingIndex] = useState(-1);
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');

  useEffect(()=>{
    setEditingIndex(-1);
    setKeyword('');
    setCategory('');
  }, [rules]);

  const startAdd = ()=>{ setEditingIndex(-1); setKeyword(''); setCategory(''); };

  const save = ()=>{
    const trimmedKey = keyword.trim();
    if(!trimmedKey){ alert('Please enter a keyword'); return; }
    const newRules = [...rules];
    if(editingIndex>=0){ newRules[editingIndex] = {keyword: trimmedKey, category: category.trim()}; }
    else { newRules.push({keyword: trimmedKey, category: category.trim()}); }
    setRules(newRules);
  };

  const edit = (i)=>{ setEditingIndex(i); setKeyword(rules[i].keyword); setCategory(rules[i].category); };
  const remove = (i)=>{ if(!confirm('Delete this rule?')) return; const newRules = rules.filter((_,idx)=>idx!==i); setRules(newRules); };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <button onClick={startAdd} className="px-3 py-2 bg-indigo-600 text-white rounded shadow">Add Rule</button>
        <div className="text-sm text-slate-500">Rules match if the keyword appears anywhere in the transaction description.</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-50 p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Create / Edit Rule</h3>
          <label className="block text-sm">Keyword</label>
          <input value={keyword} onChange={(e)=>setKeyword(e.target.value)} className="w-full border rounded px-2 py-1 mb-2" placeholder="e.g. starbucks or coffee" />
          <label className="block text-sm">Category</label>
          <input value={category} onChange={(e)=>setCategory(e.target.value)} className="w-full border rounded px-2 py-1 mb-3" placeholder="e.g. Food & Drink" />
          <div className="flex gap-2">
            <button onClick={save} className="px-3 py-2 bg-emerald-500 text-white rounded">Save</button>
            <button onClick={()=>{setEditingIndex(-1); setKeyword(''); setCategory('');}} className="px-3 py-2 bg-gray-100 rounded">Cancel</button>
          </div>
        </div>

        <div className="p-4 bg-white rounded shadow col-span-1 md:col-span-1">
          <h3 className="font-semibold mb-2">Existing Rules</h3>
          {rules.length===0 && <div className="text-sm text-slate-500">No rules yet.</div>}
          <ul className="space-y-2">
            {rules.map((r,i)=>(
              <li key={i} className="flex items-center justify-between border rounded p-2">
                <div>
                  <div className="font-medium">{r.keyword}</div>
                  <div className="text-sm text-slate-500">{r.category}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={()=>edit(i)} className="px-2 py-1 bg-yellow-400 rounded">Edit</button>
                  <button onClick={()=>remove(i)} className="px-2 py-1 bg-red-500 text-white rounded">Delete</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
