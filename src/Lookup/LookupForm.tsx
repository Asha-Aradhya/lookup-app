/* Copyright (c) 2025. All Rights Reserved. All information in this file is Confidential and Proprietary. */

import { useEffect, useState } from 'react';
import styles from './Lookup.module.scss';
import { letterToScore, modeSelection, SUMMARY_METHODS, type ParticipantData, type selectionType } from '../types';

function LookupForm() {
    const [lookupData, setLookupData] = useState<ParticipantData[]>([]);
    const [selectionMode, setSelectionMode] = useState<selectionType>(modeSelection.PARTICIPANT);
    const [selectedParticipant, setSelectedParticipant] = useState<string>('');
    const [selectedCompetency, setSelectedCompetency] = useState<string>('');
    const [selectedSummaryType, setSelectedSummaryType] = useState<string>('');
    const [output, setOutput] = useState<string>('');

    // Fetch data from the server for the lookup app and set it to state
    const fetchLookupAppData = async () => {
        try {
            const response = await fetch('http://localhost:3001/participants');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const jsonData = await response.json();
            setLookupData(jsonData);
        } catch (error:any) {
            console.error('Fetch error:', error.message);
        }
    };

    useEffect(() => {
        fetchLookupAppData();
    }, []);

    // Reset the form when user selects a different mode( summary/participant)
    const handleModeChange = (mode: selectionType) => {
        setSelectionMode(mode);
        setSelectedParticipant('');
        setSelectedSummaryType('');
        setSelectedCompetency('');
        setOutput('');
    };

    // Extract competencies from the data
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

    // Get the names of the participants
    const getParticipantNames = (participants: ParticipantData[]) =>
        participants.map(participant => participant.Participant);

    // Generate output for participant mode 
    const generateParticipantOutput = () => {
        const person = lookupData.find(person => person.Participant === selectedParticipant);
        const competency = person?.[selectedCompetency];
        if (competency) {
            setOutput(`${person?.Participant} scored ${competency} on ${selectedCompetency}`);
        } else {
            setOutput(`${person?.Participant} has no score for ${selectedCompetency}`);
        }
    }

    // Generate output for summary mode
    const generateSummaryOutput = () => {
        const competencyValues = lookupData.map(participant => participant[selectedCompetency]).filter(val => val !== null);
        const areAllNumbers = competencyValues.every(val => typeof val === 'number');
        const areAllStrings = competencyValues.every(val => typeof val === 'string');
        switch (selectedSummaryType) {
            case SUMMARY_METHODS.lowest:

                if (areAllNumbers) {
                    const lowestValue = Math.ceil(Math.min(...competencyValues));
                    setOutput(`The lowest score for ${selectedCompetency} is ${lowestValue}`);
                } else if (areAllStrings) {
                    const lowestValue = competencyValues.sort().pop();
                    setOutput(`The lowest score for ${selectedCompetency} is ${lowestValue}`);
                } else {
                    setOutput('No valid lowest scores found');
                }
                break;

            case SUMMARY_METHODS.highest:
                if (areAllNumbers) {
                    const lowestValue = Math.ceil(Math.max(...competencyValues));
                    setOutput(`The highest score for ${selectedCompetency} is ${lowestValue}`);
                } else if (areAllStrings) {
                    const lowestValue = competencyValues.sort()[0];
                    setOutput(`The highest score for ${selectedCompetency} is ${lowestValue}`);
                } else {
                    setOutput('No valid lowest scores found');
                }
                break;

            case SUMMARY_METHODS.average:
                if (areAllNumbers) {
                    const total = competencyValues.reduce((accumulator, val) => accumulator + val, 0);
                    const average = Math.ceil(total / competencyValues.length);
                    setOutput(`The average score for ${selectedCompetency} is ${average}`);
                } else if (areAllStrings) {
                    const validGrades = competencyValues.filter(val => letterToScore[val.toUpperCase()]);
                    const total = validGrades.reduce((acc, val) => acc + letterToScore[val], 0);
                    const average = Math.ceil(total / validGrades.length);
                    const averageLetter = Object.keys(letterToScore).find(key => letterToScore[key] === average)
                    setOutput(`The average score for ${selectedCompetency} is ${averageLetter}`);
                } else {
                    setOutput('No valid average scores found');
                }
                break;

            case SUMMARY_METHODS.type:
                if (!areAllNumbers && !areAllStrings) {
                    setOutput('No valid type found');
                } else {
                    setOutput(`The type of ${selectedCompetency} is ${typeof competencyValues[0]}`);
                }
                break;

            default:
                setOutput('Data not found');
        }
    }

    // Handle form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log(selectionMode)
        console.log(selectedCompetency)
        console.log(selectedParticipant)
        console.log(selectedSummaryType)
        if (selectionMode === modeSelection.PARTICIPANT) {
            generateParticipantOutput();
        } else {
            generateSummaryOutput();
        }
    }

    // Populate the competency options and participant dropdown list
    const competencyOptions = extractCompetencies(lookupData);
    const participantList = getParticipantNames(lookupData);
    const isFormValid = selectedCompetency && (selectionMode === 'summary' ? selectedSummaryType : selectedParticipant);

    return (
        <section>
            <header className={styles.header}>
                <h3>Look Up App</h3>
            </header>

            <form className={styles.lookupForm} onSubmit={handleSubmit}>
                <fieldset className={styles.fieldset}>
                    <legend className={styles.legend}>Select Mode</legend>
                    <div className={styles.inputSection}>
                        <label htmlFor='participant'>
                            Participant <span className={styles.required}>*</span>
                        </label>
                        <input
                            type="radio"
                            id="participant"
                            name="selectmode"
                            value="participant"
                            checked={selectionMode === modeSelection.PARTICIPANT}
                            onChange={() => handleModeChange(modeSelection.PARTICIPANT)}
                        />
                    </div>
                    <div className={styles.inputSection}>
                        <label htmlFor='summary'>
                            Summary <span className={styles.required}>*</span>
                        </label>
                        <input
                            type="radio"
                            id="summary"
                            name="selectmode"
                            value="summary"
                            checked={selectionMode === modeSelection.SUMMARY}
                            onChange={() => handleModeChange(modeSelection.SUMMARY)}
                        />
                    </div>
                </fieldset>

                <fieldset className={styles.fieldset}>
                    <legend className={styles.legend}>Select Participant / Summary Method</legend>

                    <div className={styles.inputSection}>
                        <label className={styles.label} htmlFor="competency">
                            Competency <span className={styles.required}>*</span>
                        </label>
                        <select className={styles.selectInput} name="competency" id="competency" value={selectedCompetency} onChange={(e) => setSelectedCompetency(e.target.value)}>
                            <option value="">Select</option>
                            {competencyOptions.map((competency) => (
                                <option key={competency} value={competency}>
                                    {competency}
                                </option>
                            ))}

                        </select>
                    </div>
                    {selectionMode === modeSelection.PARTICIPANT && (
                        <div className={styles.inputSection}>
                            <label className={styles.label} htmlFor="participantid">
                                Participant <span className={styles.required}>*</span>
                            </label>
                            <select className={styles.selectInput} name="participantid" id="participantid" onChange={(e) => setSelectedParticipant(e.target.value)}>
                                <option value="">Select</option>
                                {participantList.map((participant: string) => (
                                    <option key={participant} value={participant}>
                                        {participant}
                                    </option>
                                ))}
                            </select>
                        </div>)
                        ||
                        (<div className={styles.inputSection}>
                            <label className={styles.label} htmlFor="summarySelect">
                                Participant's Summary <span className={styles.required}>*</span>
                            </label>
                            <select name="summary" id="summarySelect" onChange={(e) => setSelectedSummaryType(e.target.value)}>
                                <option value="">Select</option>
                                {Object.entries(SUMMARY_METHODS).map(([key, summaryType]) => (
                                    <option key={key} value={summaryType}>
                                        {summaryType}
                                    </option>
                                ))}
                            </select>
                        </div>)}


                </fieldset>

                <button className={styles.button} type="submit" disabled={!isFormValid}>
                    Submit
                </button>
            </form>

            <output className={styles.output}>
                <p className={output.includes('no') ? styles.error : styles.success}>{output}</p>
            </output>
        </section>
    );
}

export default LookupForm;
