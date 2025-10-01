
import React from "react";

export function Transactions({transactions, onUpdateCategory}){
  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Description</th>
              <th className="p-3 text-right">Amount</th>
              <th className="p-3 text-left">Category</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t,i)=>(
              <tr key={i} className="border-b hover:bg-slate-50">
                <td className="p-3">{t.Date}</td>
                <td className="p-3">{t.Description}</td>
                <td className="p-3 text-right">{formatMoney(t.Amount)}</td>
                <td className="p-3">
                  <input className="w-full border rounded px-2 py-1" defaultValue={t.category||''}
                    onBlur={(e)=>onUpdateCategory(i, e.target.value)} onKeyDown={(e)=>{ if(e.key==='Enter'){ e.target.blur(); } }} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="text-sm text-slate-500">Tip: edit a transaction's category and it will automatically create a matching rule for similar descriptions.</div>
    </div>
  );
}

function formatMoney(n){
  const sign = n<0 ? '-' : '';
  const v = Math.abs(Number(n)||0).toFixed(2);
  return sign + '$' + v;
}
