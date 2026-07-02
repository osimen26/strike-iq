"use client";
import './PredictionWidget.css';

function PredictionWidget() {
  return (
    <div className="prediction-widget">
      <p className="match-title">World Cup · BRA vs FRA</p>
      <p className="prediction-detail">Over 2.5 &rarr; 88% confidence</p>
    </div>
  );
}

export default PredictionWidget;
