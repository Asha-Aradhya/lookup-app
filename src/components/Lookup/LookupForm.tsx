/* Copyright (c) 2025. All Rights Reserved. All information in this file is Confidential and Proprietary. */

import { useEffect, useRef, useState } from 'react';
import styles from './Lookup.module.scss';
import { letterToScore, modeSelection, SUMMARY_METHODS, type ParticipantData, type selectionType } from '../../types';
import { SelectInput } from '../UI/SelectInput/SelectInput';
import { RadioInput } from '../UI/RadioInput/RadioInput';
import { fetchLookupAppData } from '../../api/api';
import Popup from '../UI/Popup/Popup';

function LookupForm() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null); 
    const [state, setState] = useState({
        lookupData: [] as ParticipantData[],
        selectionMode: modeSelection.PARTICIPANT,
        selectedParticipant: '',
        selectedCompetency: '',
        selectedSummaryType: '',
        output: '',
    });

    const { lookupData, selectionMode, selectedParticipant, selectedCompetency, selectedSummaryType, output } = state;

    const lastSubmittedValues = useRef({
        selectedParticipant: '',
        selectedCompetency: '',
        selectedSummaryType: '',
        selectionMode: '',
    });

    // Fetch data from the server for the lookup app and set it to state
    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await fetchLookupAppData(setError);
            console.log(data)
            setState((prev) => ({ ...prev, lookupData: data }));
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchData();
    }, []);

    // Reset the form when user selects a different mode( summary/participant)
    const handleModeChange = (mode: selectionType) => {
        setState(prev => ({
            ...prev,
            selectionMode: mode,
            selectedParticipant: '',
            selectedCompetency: '',
            selectedSummaryType: '',
            output: '',
        }));
    };

    // Extract competencies from the data
    const extractCompetencies = (competencies: ParticipantData[]) =>
        [...new Set(competencies.flatMap((participant) => Object.keys(participant).filter((key) => key !== 'Participant')))];

    // Get the names of the participants
    const getParticipantNames = (participants: ParticipantData[]) =>
        participants.map(participant => participant.Participant);

    // Generate output for participant mode 
    const generateParticipantOutput = () => {
        const person = lookupData.find((participant) => participant.Participant === selectedParticipant);
        const competency = person?.[selectedCompetency];
        setState((prev) => ({
            ...prev,
            output: competency
                ? `${person?.Participant} scored ${competency} on ${selectedCompetency}`
                : `${person?.Participant} has no score for ${selectedCompetency}`,
        }));
    }

    // If the competency is both string and number then convert them to numbers
    const sanitisedCompetencyValues = (competencyValues: (string | number | null)[]) =>
        competencyValues
            .map((competency) => {
                if (typeof competency === 'number') return competency;
                if (typeof competency === 'string' && letterToScore[competency.toUpperCase()]) {
                    return letterToScore[competency.toUpperCase()];
                }
                return null;
            })
            .filter((val): val is number => typeof val === 'number');

    const getTotal = (values: (string[] | number[])): number =>
        values.filter((val): val is number => typeof val === 'number')
            .reduce((acc, val) => acc + val, 0);

    // Generate output for summary mode
    const generateSummaryOutput = () => {
        const competencyValues = lookupData.map(participant => participant[selectedCompetency]).filter(val => val !== null && val !== undefined);
        const areAllNumbers = competencyValues.every(val => typeof val === 'number');
        const areAllStrings = competencyValues.every(val => typeof val === 'string');
        // Sanitize only if not all strings or not all numbers
        const sanitisedCompetency = (areAllNumbers || areAllStrings) ? competencyValues : sanitisedCompetencyValues(competencyValues);

        let outputText = '';
        switch (selectedSummaryType) {
            case SUMMARY_METHODS.lowest:
                if (areAllNumbers) {
                    const lowestValue = Math.round(Math.min(...competencyValues) * 10) / 10;
                    outputText = `The lowest score for ${selectedCompetency} is ${lowestValue}`;
                } else if (areAllStrings) {
                    const lowestValue = competencyValues.sort().pop();
                    outputText = `The lowest score for ${selectedCompetency} is ${lowestValue}`;
                } else {
                    // If there are both numbers and strings, we need to handle them separately
                    if (sanitisedCompetency.length > 0) {
                        const total = getTotal(sanitisedCompetency);
                        const lowest = Math.round((total / sanitisedCompetency.length) * 10) / 10;
                        outputText = `The lowest score for ${selectedCompetency} is ${lowest}`;
                    } else {
                        outputText = 'No valid lowest scores found';
                    }
                }

                break;

            case SUMMARY_METHODS.highest:
                if (areAllNumbers) {
                    const highestValue = Math.round(Math.max(...competencyValues) * 10) / 10;
                    outputText = `The highest score for ${selectedCompetency} is ${highestValue}`;
                } else if (areAllStrings) {
                    const highestValue = competencyValues.sort()[0];
                    outputText = `The highest score for ${selectedCompetency} is ${highestValue}`;
                } else {
                    if (sanitisedCompetency.length > 0) {
                        const total = getTotal(sanitisedCompetency);
                        const highest = Math.round(((total / sanitisedCompetency.length) * 10)) / 10;
                        outputText = `The highest score for ${selectedCompetency} is ${highest}`;
                    } else {
                        outputText = 'No valid highest score found';
                    }
                }

                break;

            case SUMMARY_METHODS.average:
                if (areAllNumbers) {
                    const total = competencyValues.reduce((accumulator, val) => accumulator + val, 0);
                    const average = Math.round((total / sanitisedCompetency.length) * 10) / 10;
                    outputText = `The average score for ${selectedCompetency} is ${average}`;
                } else if (areAllStrings) {
                    const validGrades = competencyValues.filter((val: string) => letterToScore[val.toUpperCase()]);
                    const total = validGrades.reduce((acc, val) => acc + letterToScore[val], 0);
                    const average = Math.round(total / validGrades.length);
                    const averageLetter = Object.keys(letterToScore).find(key => letterToScore[key] === average)
                    outputText = `The average score for ${selectedCompetency} is ${averageLetter}`;
                } else {
                    if (sanitisedCompetency.length > 0) {
                        const total = getTotal(sanitisedCompetency);
                        const average = Math.round((total / sanitisedCompetency.length) * 10) / 10;
                        outputText = `The average score for ${selectedCompetency} is ${average}`;
                    } else {
                        outputText = 'No valid average scores found';
                    }
                }

                break;

            case SUMMARY_METHODS.type:
                if (areAllNumbers) {
                    outputText = `The type of ${selectedCompetency} is 'score'`;
                } else if (areAllStrings) {
                    outputText = `The type of ${selectedCompetency} is 'level'`;
                } else {
                    outputText = `The type of ${selectedCompetency} is both 'level' and 'score'`;
                }

                break;

            default:
        }
        // Set state with the valid output text
        setState((prev) => ({
            ...prev,
            output: outputText,
        }));
    }

    // Handle form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Prevent duplicate submissions
        if (
            lastSubmittedValues.current.selectedParticipant === selectedParticipant &&
            lastSubmittedValues.current.selectedCompetency === selectedCompetency &&
            lastSubmittedValues.current.selectedSummaryType === selectedSummaryType &&
            lastSubmittedValues.current.selectionMode === selectionMode
        ) {
            //Duplicate submission prevented
            return;
        }

        // Update last submitted values
        lastSubmittedValues.current = {
            selectedParticipant,
            selectedCompetency,
            selectedSummaryType,
            selectionMode,
        };

        if (selectionMode === modeSelection.PARTICIPANT) {
            generateParticipantOutput();
        } else {
            generateSummaryOutput();
        }
    }

    // Check if the form is valid
    const isFormValid = selectedCompetency && (selectionMode === 'summary' ? selectedSummaryType : selectedParticipant);

    return (
        <section className={styles.lookupContainer}>
             {error && <Popup message={error} onClose={() => setError(null)} />}
            <header className={styles.header}>
                <h3>Look Up App</h3>
            </header>
            {loading ? (
                <div className={styles.loading}>
                    <img src="/loading_icon.gif" alt="Loading..." />
                </div>
            ) : (
                <form className={styles.lookupForm} onSubmit={handleSubmit}>
                    <fieldset className={styles.fieldset}>
                        <legend className={styles.legend}>Select Mode</legend>
                        <RadioInput
                            label="Participant"
                            name="selectmode"
                            value={modeSelection.PARTICIPANT}
                            checked={selectionMode === modeSelection.PARTICIPANT}
                            onChange={() => handleModeChange(modeSelection.PARTICIPANT)}
                        />
                        <RadioInput
                            label="Summary"
                            name="selectmode"
                            value={modeSelection.SUMMARY}
                            checked={selectionMode === modeSelection.SUMMARY}
                            onChange={() => handleModeChange(modeSelection.SUMMARY)}
                        />
                    </fieldset>

                    <fieldset className={styles.fieldset}>
                        <legend className={styles.legend}>Select Participant / Summary Method</legend>
                        <SelectInput
                            label="Competency"
                            name="competency"
                            options={extractCompetencies(lookupData)}
                            value={selectedCompetency}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                                setState({ ...state, selectedCompetency: e.target.value})
                            }
                            required
                        />
                        {selectionMode === modeSelection.PARTICIPANT ? (
                            <SelectInput
                                label="Participant"
                                name="participantid"
                                options={getParticipantNames(lookupData)}
                                value={selectedParticipant}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                                    setState({ ...state, selectedParticipant: e.target.value })
                                }
                                required
                            />
                        ) : (
                            <SelectInput
                                label="Participant's Summary"
                                name="summarySelect"
                                options={Object.values(SUMMARY_METHODS)}
                                value={selectedSummaryType}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                                    setState({ ...state, selectedSummaryType: e.target.value})
                                }
                                required
                            />
                        )}
                    </fieldset>

                    <button className={styles.button} type="submit" disabled={!isFormValid}>
                        Submit
                    </button>
                </form>
            )}
            <output className={styles.output}>
                <p className={output?.toLowerCase().includes('no') ? styles.error : styles.success}>{output}</p>
            </output>
        </section>
    );
}

export default LookupForm;
