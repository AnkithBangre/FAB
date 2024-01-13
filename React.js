import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

const SymptomChecker = () => {
  const [symptoms, setSymptoms] = useState('');
  const [prediction, setPrediction] = useState('');
  const [precaution, setPrecaution] = useState('');
  const [drug, setDrug] = useState('');
  const [randomDisease, setRandomDisease] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const updateSuggestions = (inputSymptoms) => {
    const csvFilePath = 'fph.csv';
    fetch(csvFilePath)
      .then((response) => response.text())
      .then((csvData) => {
        const rows = csvData.split('\n');
        const matchedSuggestions = rows
          .filter((row) => row.includes(inputSymptoms))
          .map((row) => row.split(',')[0]);

        const relatedDiseases = rows
          .slice(0, 5)
          .map((row) => row.split(',')[0])
          .filter((disease) => disease !== inputSymptoms);

        setSuggestions([...new Set([...matchedSuggestions, ...relatedDiseases])]);
      })
      .catch((error) => console.error('Error updating suggestions:', error));
  };

  const handleSuggestionsClick = (suggestion) => {
    setSymptoms(suggestion);
    setSuggestions([]);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      predictDisease();
    }
  };

  const animateText = (text, setTextFunction) => {
    let index = 0;
    const intervalId = setInterval(() => {
      setTextFunction((prevText) => prevText + text[index]);
      index += 1;
      if (index === text.length) {
        clearInterval(intervalId);
      }
    }, 100);
  };

  const predictDisease = async () => {
    try {
      const csvFilePath = 'fph.csv';
      const response = await fetch(csvFilePath);
      const csvData = await response.text();
      const rows = csvData.split('\n');
      const matchingRow = rows.find((row) => {
        const [csvSymptoms, csvDisease, csvPrecaution, csvDrug] = row.split(',');
        return csvSymptoms === symptoms;
      });

      setPrediction('');
      setPrecaution('');
      setDrug('');

      if (matchingRow) {
        const [, csvDisease, csvPrecaution, csvDrug] = matchingRow.split(',');
        animateText(csvDisease, setPrediction);
        animateText(csvPrecaution, setPrecaution);
        animateText(csvDrug, setDrug);
      } else {
        animateText('Prediction not found', setPrediction);
      }
    } catch (error) {
      console.error('Error predicting disease:', error);
    }
  };

  const getRandomDiseaseName = () => {
    const csvFilePath = 'fph.csv';
    fetch(csvFilePath)
      .then((response) => response.text())
      .then((csvData) => {
        const rows = csvData.split('\n');
        const randomIndex = Math.floor(Math.random() * rows.length);
        const randomRow = rows[randomIndex];
        const [randomDisease] = randomRow.split(',');
        setRandomDisease(randomDisease);
      })
      .catch((error) => console.error('Error fetching random disease:', error));
  };

  useEffect(() => {
    getRandomDiseaseName();
  }, []);

  const handleRandomDiseaseClick = () => {
    setSymptoms(randomDisease);
  };

  return (
    <div>
      <h1 className='h'>PERSONAL HEALTHCARE</h1>
      <label>
        Enter your Disease Name:
        <input
          type="text"
          value={symptoms}
          onChange={(e) => {
            setSymptoms(e.target.value);
            updateSuggestions(e.target.value);
          }}
          onKeyPress={handleKeyPress}
          placeholder="Drop your text (ctrl+b)"
          id="searchBox"
        />
      </label>
      {suggestions.length > 0 && (
        <ul>
          {suggestions.map((suggestion, index) => (
            <li key={index} onClick={() => handleSuggestionsClick(suggestion)}>
              {suggestion}
            </li>
          ))}
        </ul>
      )}
      <button onClick={predictDisease}>Predict Disease</button>

      {symptoms && (
        <div>
          <h2>Disease Name</h2>
          <p>{symptoms}</p>
        </div>
      )}

      {prediction && (
        <div>
          <h2>Symptom:</h2>
          <p>{prediction}</p>
          <h2>Precaution:</h2>
          <p>{precaution}</p>
          <h2>Drug to Cure the Disease:</h2>
          <p>{drug}</p>
        </div>
      )}

      {randomDisease && (
        <div>
          <p class='ts' 
            style={{ cursor: 'pointer', textDecoration: 'none', color: 'black' }}
            onClick={handleRandomDiseaseClick}
          >
            Top Search: {randomDisease}
          </p>
        </div>
      )}
    </div>
  );
};

ReactDOM.render(<SymptomChecker />, document.getElementById('root'));

document.addEventListener('keydown', function (event) {
  if (event.ctrlKey && event.key === 'b') {
    document.getElementById('searchBox').focus();
  }
});

export default SymptomChecker;
