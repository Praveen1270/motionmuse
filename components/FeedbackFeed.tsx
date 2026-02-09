
import React from 'react';
import { TechniqueIssue } from '../types';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

interface FeedbackFeedProps {
  issues: TechniqueIssue[];
}

const FeedbackFeed: React.FC<FeedbackFeedProps> = ({ issues }) => {
  return (
    <div className="flex flex-col gap-3 h-full overflow-y-auto p-4 custom-scrollbar">
      {issues.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-gray-500 opacity-50">
          <Info size={48} className="mb-2" />
          <p>Analyzing performance...</p>
        </div>
      ) : (
        issues.map((issue, idx) => (
          <div 
            key={idx}
            className={`p-4 rounded-xl border-l-4 transition-all animate-in slide-in-from-right duration-300 ${
              issue.severity === 'high' ? 'bg-red-500/10 border-red-500' : 
              issue.severity === 'medium' ? 'bg-yellow-500/10 border-yellow-500' : 
              'bg-blue-500/10 border-blue-500'
            }`}
          >
            <div className="flex items-start gap-3">
              {issue.severity === 'high' ? (
                <AlertCircle className="text-red-500 shrink-0" size={20} />
              ) : (
                <CheckCircle className="text-blue-500 shrink-0" size={20} />
              )}
              <div>
                <h4 className="font-bold text-sm uppercase tracking-wider opacity-80">{issue.category}</h4>
                <p className="text-sm font-medium my-1">{issue.description}</p>
                <div className="mt-2 py-2 px-3 bg-white/5 rounded text-xs italic text-gray-300">
                  <span className="font-semibold text-blue-400 not-italic">Coach's Tip:</span> {issue.correction}
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default FeedbackFeed;
