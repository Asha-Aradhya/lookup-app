import { useEffect, useState } from 'react';
import styles from './App.module.scss';
import { modeSelection, type ParticipantData, type selectionType } from './types';

function App() {
  const [selectionMode, setSelectionMode] = useState<selectionType>(modeSelection.PARTICIPANT);
  const [data, setData] = useState<ParticipantData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedParticipant, setSelectedParticipant] = useState('');
  const [competencyOptions, setCompetencyOptions] = useState<string[]>([]);
  const [summaryMethod, setSummaryMethod] = useState('');
  const [selectedCompetency, setSelectedCompetency] = useState('');
  const [output, setOutput] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch('http://localhost:3001/participants')
      .then(async (response) => {
        //Check HTTP errors like 404, 500, etc other than network errors
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const jsonData = await response.json();
        
        // Extract competencies after data is loaded
        if (jsonData.length > 0) {
          setData(jsonData);
          setLoading(false);
          const competencies = extractCompetencies(jsonData);
          setCompetencyOptions(competencies);
        }
      })
      .catch((error) => {
        console.error('Fetch error:', error);
        setLoading(false);
      });
  }, []);

  const extractCompetencies = (jsonData: ParticipantData[]) => {
    const allKeys = new Set<string>();
    jsonData.forEach((participant: ParticipantData) => {
      Object.keys(participant).forEach((key) => {
        if (key !== 'Participant') {
          allKeys.add(key);
        }
      });
    });
    return [...allKeys];
  };

  const handleParticipantSelection = () => {
    const person = data.find(person => person.Participant === selectedParticipant);
    const competency = person?.[selectedCompetency];
    if (competency) {
      setOutput(`${person?.Participant} scored ${competency} on ${selectedCompetency}`);
    } else {
      setOutput(`${person?.Participant} has no score for ${selectedCompetency}`);
    }
    return true;
  };

  const handleSummarySelection = () => {
    const competencyValues = getValidCompetencyValues(data, selectedCompetency);

    // Call the function to get the result based on the summary method
    const result = getSummaryResult(competencyValues);

    // Display the result
    setOutput(result);

    return true;
  };

  // Function to get valid competency values
  const getValidCompetencyValues = (data: ParticipantData[], competency: string) => {
    return data.map((participant) => participant[competency]).filter(isValidCompetencyValue);
  };

  // Function to handle summary calculation based on selected method
  const getSummaryResult = (values: any[]) => {
    if (values.length === 0) {
      return `No valid values found for ${selectedCompetency}.`;
    }

    // Switch to determine summary method
    switch (summaryMethod) {
      case 'lowest':
        return handleLowestSummary(values);
      case 'highest':
        return handleHighestSummary(values);
      case 'average':
        return handleAverageSummary(values);
      default:
        return 'Please select a valid summary method.';
    }
  };

  // Function to handle lowest summary
  const handleLowestSummary = (values: any[]) => {
    const numericValues = values.map(Number).filter((v) => !isNaN(v));
    if (numericValues.length === 0) {
      return `No numeric values found for ${selectedCompetency}.`;
    }
    const lowest = Math.min(...numericValues);
    return `Lowest score for ${selectedCompetency} is ${lowest}`;
  };

  // Function to handle highest summary
  const handleHighestSummary = (values: any[]) => {
    const numericValues = values.map(Number).filter((v) => !isNaN(v));
    if (numericValues.length === 0) {
      return `No numeric values found for ${selectedCompetency}.`;
    }
    const highest = Math.max(...numericValues);
    return `Highest score for ${selectedCompetency} is ${highest}`;
  };

  // Function to handle average summary
  const handleAverageSummary = (values: any[]) => {
    const numericValues = values.map(Number).filter((v) => !isNaN(v));
    if (numericValues.length === 0) {
      return `No numeric values found for ${selectedCompetency}.`;
    }
    const average = numericValues.reduce((sum, value) => sum + value, 0) / numericValues.length;
    return `Average score for ${selectedCompetency} is ${average.toFixed(2)}`;
  };

  // Helper function to check if a competency value is valid (not undefined, null, or empty string)
  const isValidCompetencyValue = (value: any) => value != null && value !== '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCompetency) {
      setOutput('Please select a competency.');
      return;
    }

    let result = false;
    if (selectionMode === 'participant') {
      result = handleParticipantSelection();
    } else if (selectionMode === 'summary') {
      result = handleSummarySelection();
    }

    if (!result) {
      setOutput('An error occurred while processing your request.');
    }
  };

  // Check if form is ready to submit
  const isFormValid = selectedCompetency && 
                      (selectionMode === 'summary' ? summaryMethod : selectedParticipant);

  return (
    <>
      <header className={styles.header}>
        <h3>Look Up App</h3>
      </header>
      {loading && <p>Loading...</p>}
      {!loading && data.length === 0 && <p>No data available.</p>}
      <form className={styles.lookupForm} onSubmit={handleSubmit}>
        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>Select Mode</legend>
          <div>
            <label htmlFor='participant'>Participant <span className={styles.required}>*</span></label>
            <input
              type="radio"
              id="participant"
              name="selectmode"
              value="participant"
              checked={selectionMode === modeSelection.PARTICIPANT}
              onChange={() => {
                setSelectionMode('participant');
                setSelectedParticipant('');
                setSummaryMethod('');
              }}
            />
          </div>
          <div>
            <label htmlFor='summary'>Summary <span className={styles.required}>*</span></label>
            <input
              type="radio"
              id="summary"
              name="selectmode"
              value="summary"
              checked={selectionMode === 'summary'}
              onChange={() => {
                setSelectionMode('summary');
                setSelectedParticipant('');
              }}
            />
          </div>
        </fieldset>

        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>{selectionMode === 'participant' ? 'Select Participant' : 'Select Summary Method'}</legend>
          {selectionMode === 'participant' ? (
            <div>
              <label className={styles.label} htmlFor="participantid">Participant <span className={styles.required}>*</span></label>
              <select
                name="participantid"
                id="participantid"
                value={selectedParticipant}
                onChange={(e) => setSelectedParticipant(e.target.value)}
              >
                <option value="">Select Participant</option>
                {data.map((participant) => (
                  <option key={participant.Participant} value={participant?.Participant ?? ''}>
                    {participant.Participant}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className={styles.label} htmlFor="summarySelect">Summary Method <span className={styles.required}>*</span></label>
              <select
                name="summary"
                id="summarySelect"
                value={summaryMethod}
                onChange={(e) => setSummaryMethod(e.target.value)}
              >
                <option value="">Select Summary Method</option>
                <option value="lowest">Lowest</option>
                <option value="highest">Highest</option>
                <option value="average">Average</option>
                <option value="type">Type</option>
              </select>
            </div>
          )}

          <div>
            <label className={styles.label} htmlFor="competency">Competency <span className={styles.required}>*</span></label>
            <select
              name="competency"
              id="competency"
              value={selectedCompetency}
              onChange={(e) => setSelectedCompetency(e.target.value)}
            >
              <option value="">Select Competency</option>
              {competencyOptions.map((comp) => (
                <option key={comp} value={comp}>{comp}</option>
              ))}
            </select>
          </div>
        </fieldset>

        <button
          className={styles.button}
          type="submit"
          disabled={!isFormValid}
        >
          Submit
        </button>
      </form>

      <output>
        {output && <p>{output}</p>}
      </output>
    </>
  );
}

export default App;
