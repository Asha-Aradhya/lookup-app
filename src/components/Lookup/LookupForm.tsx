/* Copyright (c) 2025. All Rights Reserved. All information in this file is Confidential and Proprietary. */

import { useEffect, useMemo, useRef, useState } from 'react';
import styles from './Lookup.module.scss';
import { modeSelection, SUMMARY_METHODS, type ParticipantData, type selectionType } from '../../types';
import { SelectInput } from '../UI/SelectInput/SelectInput';
import { RadioInput } from '../UI/RadioInput/RadioInput';
import { fetchLookupAppData } from '../../api/api';
import Popup from '../UI/Popup/Popup';
import { calculateAverage, calculateHighest, calculateLowest, determineType, extractCompetencies, getParticipantNames, sanitisedCompetencyValues } from '../Utils/Utils';

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

    // Get the score of the selected participant for the selected competency
    const getParticipantScoreByCompetency = () => {
        const participant = lookupData.find((participant) => participant.Participant === selectedParticipant);
        const competency = participant?.[selectedCompetency];
        setState((prev) => ({
            ...prev,
            output: competency
                ? `${participant?.Participant} scored ${competency} on ${selectedCompetency}`
                : `${participant?.Participant} has no score for ${selectedCompetency}`,
        }));
    }

    // Calculates summary (high/low/avg/type) for the selected competency across participants.
    const getCompetencySummary = () => {
        const competencyValues = lookupData.map(participant => participant[selectedCompetency]).filter(val => val !== null && val !== undefined);
        const areAllNumbers = competencyValues.every(val => typeof val === 'number');
        const areAllStrings = competencyValues.every(val => typeof val === 'string');
        // Sanitize only if not all strings or not all numbers. Convert level into scores for further caluculations
        const sanitisedCompetency = (areAllNumbers || areAllStrings) ? competencyValues : sanitisedCompetencyValues(competencyValues);
        console.log('Sanitised Competency:', sanitisedCompetency);
        let outputText = '';
        switch (selectedSummaryType) {
            case SUMMARY_METHODS.lowest:
                outputText = calculateLowest(sanitisedCompetency, selectedCompetency, areAllNumbers, areAllStrings);
                break;

            case SUMMARY_METHODS.highest:
                outputText = calculateHighest(sanitisedCompetency, selectedCompetency, areAllNumbers, areAllStrings);
                break;

            case SUMMARY_METHODS.average:
                outputText = calculateAverage(sanitisedCompetency, selectedCompetency, areAllNumbers, areAllStrings);
                break;

            case SUMMARY_METHODS.type:
                outputText = determineType(selectedCompetency, areAllNumbers, areAllStrings);
                break;
            default:
                outputText = 'Invalid data';
                break;
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
            setError("Submitted values are the same. Please select different values.");
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
            getParticipantScoreByCompetency();
        } else {
            getCompetencySummary();
        }
    }

    // Memoize the competency and participant options to avoid unnecessary re-renders
    const competencyOptions = useMemo(() => extractCompetencies(lookupData), [lookupData]);
    const participantOptions = useMemo(() => getParticipantNames(lookupData), [lookupData]);
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
                            options={competencyOptions}
                            value={selectedCompetency}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                                setState({ ...state, selectedCompetency: e.target.value })
                            }
                            required
                        />
                        {selectionMode === modeSelection.PARTICIPANT ? (
                            <SelectInput
                                label="Participant"
                                name="participantid"
                                options={participantOptions}
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
                                    setState({ ...state, selectedSummaryType: e.target.value })
                                }
                                required
                            />
                        )}
                    </fieldset>
                    <div className={styles.submitButton}>
                        <button className={styles.button} type="submit" disabled={!isFormValid}>
                            Submit
                        </button></div>
                </form>
            )}
            <output className={styles.output}>
                <p className={output?.toLowerCase().includes('no') ? styles.error : styles.success}>{output}</p>
            </output>
        </section>
    );
}

export default LookupForm;
