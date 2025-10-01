
import React, {useMemo} from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar, Legend } from "recharts";

const COLORS = ['#4F46E5','#06B6D4','#F97316','#10B981','#EF4444','#A78BFA','#FBBF24','#7C3AED','#84CC16','#64748B'];

export function Charts({transactions = [], excludeIncome=false, show={pie:true,line:true,bar:true}}){
  const filtered = useMemo(()=>{
    if(!excludeIncome) return transactions;
    return transactions.filter(t => Number(t.Amount || 0) < 0);
  }, [transactions, excludeIncome]);

  const categoryTotals = useMemo(()=>{
    const map = {};
    for(const t of filtered){
      const cat = t.category || 'Uncategorized';
      map[cat] = (map[cat] || 0) + Math.abs(Number(t.Amount || 0));
    }
    return Object.entries(map).map(([name, value])=>({name, value}));
  }, [filtered]);

  const timeSeries = useMemo(()=>{
    const map = {};
    for(const t of filtered){
      const d = t.Date;
      if(!d) continue;
      if(!map[d]) map[d] = {date:d, income:0, expense:0};
      const amt = Number(t.Amount) || 0;
      if(amt >= 0) map[d].income += amt;
      else map[d].expense += Math.abs(amt);
    }
    return Object.values(map).sort((a,b)=>new Date(a.date)-new Date(b.date));
  }, [filtered]);

  const topMerchants = useMemo(()=>{
    const map = {};
    for(const t of filtered){
      const m = (t.Description || '').split(' ')[0] || t.Description || '';
      map[m] = (map[m] || 0) + Math.abs(Number(t.Amount || 0));
    }
    return Object.entries(map).map(([name, value])=>({name, value})).sort((a,b)=>Math.abs(b.value)-Math.abs(a.value)).slice(0,8);
  }, [filtered]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {show.pie && (
      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-2">Spending by Category</h3>
        {categoryTotals.length===0 ? <div className="text-sm text-slate-500">No data</div> : (
          <div style={{height:300}}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryTotals} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} label>
                  {categoryTotals.map((entry, idx)=>(<Cell key={idx} fill={COLORS[idx % COLORS.length]} />))}
                </Pie>
                <Tooltip formatter={(v)=>['$'+Number(v).toFixed(2),'Amount']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
      )}

      {show.line && (
      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-2">Income vs Expense (by date)</h3>
        {timeSeries.length===0 ? <div className="text-sm text-slate-500">No data</div> : (
          <div style={{height:300}}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSeries}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="income" stroke="#06B6D4" />
                <Line type="monotone" dataKey="expense" stroke="#EF4444" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
      )}

      {show.bar && (
      <div className="bg-white p-4 rounded shadow md:col-span-2">
        <h3 className="font-semibold mb-2">Top Merchants (by absolute spend)</h3>
        {topMerchants.length===0 ? <div className="text-sm text-slate-500">No data</div> : (
          <div style={{height:320}}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topMerchants}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(v)=>['$'+Number(v).toFixed(2),'Amount']} />
                <Bar dataKey="value">
                  {topMerchants.map((entry, idx)=>(<Cell key={idx} fill={COLORS[idx % COLORS.length]} />))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
      )}
    </div>
  );
}