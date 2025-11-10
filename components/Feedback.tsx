import React, { useState } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';

interface FeedbackProps {
  contentId: string;
  contentType: string;
  promptText?: string;
  className?: string;
  variant?: 'light' | 'dark';
}

type Rating = 'good' | 'bad' | null;

const Feedback: React.FC<FeedbackProps> = ({ contentId, contentType, promptText = "内容质量如何？", className = '', variant = 'light' }) => {
  const [ratings, setRatings] = useLocalStorage<Record<string, Rating>>('ai-content-ratings', {});
  const [submitted, setSubmitted] = useState(false);

  const currentRating = ratings[contentId] || null;

  const handleRating = (rating: 'good' | 'bad') => {
    setRatings(prev => ({ ...prev, [contentId]: rating }));
    setSubmitted(true);
    // Here you would typically send this feedback to a server
    // console.log(`Feedback for ${contentType} (${contentId}): ${rating}`);
    setTimeout(() => setSubmitted(false), 2000);
  };
  
  const textClass = variant === 'light' ? 'text-slate-500' : 'text-slate-400';
  const buttonClass = variant === 'light' ? 'text-slate-500 hover:bg-slate-100' : 'text-slate-400 hover:bg-slate-700';
  const goodSelectedClass = variant === 'light' ? 'bg-green-100 text-green-700' : 'bg-green-800/50 text-green-300';
  const badSelectedClass = variant === 'light' ? 'bg-red-100 text-red-700' : 'bg-red-800/50 text-red-300';
  const submittedClass = variant === 'light' ? 'text-green-600' : 'text-green-400';

  if (submitted) {
    return <div className={`text-xs ${submittedClass} animate-fade-in-up ${className}`}>感谢您的反馈！</div>;
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {promptText && <span className={`text-xs ${textClass}`}>{promptText}</span>}
      <button
        onClick={() => handleRating('good')}
        className={`p-1 rounded-full transition-colors ${currentRating === 'good' ? goodSelectedClass : buttonClass}`}
        aria-label="Good"
        title="满意"
      >
        <span className="material-symbols-outlined !text-sm">thumb_up</span>
      </button>
      <button
        onClick={() => handleRating('bad')}
        className={`p-1 rounded-full transition-colors ${currentRating === 'bad' ? badSelectedClass : buttonClass}`}
        aria-label="Bad"
        title="不满意"
      >
        <span className="material-symbols-outlined !text-sm">thumb_down</span>
      </button>
    </div>
  );
};

export default Feedback;
