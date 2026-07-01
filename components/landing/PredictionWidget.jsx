"use client";
import './PredictionWidget.css';

function PredictionWidget() {
  return (
    <div className="prediction-widget">
      <div className="match-title">
        <p>EPL · ARS vs CHE</p>
      </div>
      <div className="prediction-detail">
        <p>Over 2.5 &rarr; 71% confidence</p>
      </div>
    </div>
  );
}

export default PredictionWidget;
