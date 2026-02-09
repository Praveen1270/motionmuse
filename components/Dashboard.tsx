
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { SessionHistory } from '../types';

interface DashboardProps {
  history: SessionHistory[];
}

const Dashboard: React.FC<DashboardProps> = ({ history }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      <div className="bg-white/5 rounded-2xl p-6 border border-white/10 backdrop-blur-md">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          Overall Performance Score
        </h3>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="date" stroke="#666" fontSize={12} />
              <YAxis domain={[0, 10]} stroke="#666" fontSize={12} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                itemStyle={{ color: '#3b82f6' }}
              />
              <Area type="monotone" dataKey="score" stroke="#3b82f6" fillOpacity={1} fill="url(#colorScore)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white/5 rounded-2xl p-6 border border-white/10 backdrop-blur-md">
        <h3 className="text-lg font-bold mb-4">Core Metrics Progress</h3>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="date" stroke="#666" fontSize={12} />
              <YAxis domain={[0, 10]} stroke="#666" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} />
              <Line type="monotone" dataKey="technique" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="timing" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="expression" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-6 mt-4 text-xs font-semibold">
          <div className="flex items-center gap-2 text-red-400">
            <span className="w-3 h-3 rounded-full bg-red-400" /> Technique
          </div>
          <div className="flex items-center gap-2 text-emerald-400">
            <span className="w-3 h-3 rounded-full bg-emerald-400" /> Timing
          </div>
          <div className="flex items-center gap-2 text-violet-400">
            <span className="w-3 h-3 rounded-full bg-violet-400" /> Expression
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
