import { CompetencyValues, letterToScore, ParticipantData } from "../../types";

// This function takes an array of participant data and returns a unique list of competencies
export const extractCompetencies = (competencies: ParticipantData[]) =>
    [...new Set(competencies.flatMap((participant) => Object.keys(participant).filter((key) => key !== 'Participant')))];

// Get the names of the participants to populate the participant dropdown
export const getParticipantNames = (participants: ParticipantData[]) =>
    participants.map((participant) => participant.Participant);

// This function takes an array of competency values and returns a new array with the string values converted to numbers
export const sanitisedCompetencyValues = (competencyValues: CompetencyValues) =>
    competencyValues
        .map((competency) => {
            if (typeof competency === 'number') return competency;
            if (typeof competency === 'string' && letterToScore[competency.toUpperCase()]) {
                return letterToScore[competency.toUpperCase()];
            }
            return null;
        })
        .filter((val): val is number => typeof val === 'number');

// Get total value of the competencies that has both score and level and this value is used to calculate average   
export const getTotalScoredCompetencyValue = (values: (string[] | number[])): number =>
    values.filter((val): val is number => typeof val === 'number').reduce((acc, val) => acc + val, 0);

export const calculateLowest = (sanitisedCompetency: any[], selectedCompetency: string, areAllNumbers: boolean, areAllStrings: boolean): string => {

    const formatResult = (value: string | number) =>
        `The lowest score for ${selectedCompetency} is ${value}`;

    if (areAllNumbers) {
        const lowestValue = Math.round(Math.min(...sanitisedCompetency) * 10) / 10;
        return formatResult(lowestValue);
    }

    if (areAllStrings) {
        const lowestValue = sanitisedCompetency.sort().pop();
        return formatResult(lowestValue);
    }

    if (sanitisedCompetency.length > 0) {
        const lowest = Math.min(...sanitisedCompetency);
        return formatResult(lowest);
    }

    return 'No valid lowest scores found';
};

export const calculateHighest = (
    sanitisedCompetency: any[], selectedCompetency: string, areAllNumbers: boolean, areAllStrings: boolean
): string => {
    const formatResult = (value: string | number) =>
        `The highest score for ${selectedCompetency} is ${value}`;

    if (areAllNumbers) {
        const highestValue = Math.round(Math.max(...sanitisedCompetency) * 10) / 10;
        return formatResult(highestValue);
    }

    if (areAllStrings) {
        const highestValue = sanitisedCompetency.sort()[0];
        return formatResult(highestValue);
    }

    if (sanitisedCompetency.length > 0) {
        const highest = Math.max(...sanitisedCompetency);
        return formatResult(highest);
    }

    return 'No valid highest score found';
};


export const calculateAverage = (sanitisedCompetency: any[], selectedCompetency: string, areAllNumbers: boolean, areAllStrings: boolean): string => {
    if (areAllNumbers) {
        const total = sanitisedCompetency.reduce((accumulator, val) => accumulator + val, 0);
        const average = Math.round((total / sanitisedCompetency.length) * 10) / 10;
        return `The average score for ${selectedCompetency} is ${average}`;
    } else if (areAllStrings) {
        const validGrades = sanitisedCompetency.filter((val: string) => letterToScore[val.toUpperCase()]);
        const total = validGrades.reduce((acc, val) => acc + letterToScore[val], 0);
        const average = Math.round(total / validGrades.length);
        const averageLetter = Object.keys(letterToScore).find(key => letterToScore[key] === average)
        return `The average score for ${selectedCompetency} is ${averageLetter}`;
    } else {
        if (sanitisedCompetency.length > 0) {
            const total = getTotalScoredCompetencyValue(sanitisedCompetency);
            const average = Math.round((total / sanitisedCompetency.length) * 10) / 10;
            return `The average score for ${selectedCompetency} is ${average}`;
        } else {
            return 'No valid average scores found';
        }
    }
};

export const determineType = (selectedCompetency: string, areAllNumbers: boolean, areAllStrings: boolean): string => {
    if (areAllNumbers) return `The type of ${selectedCompetency} is 'score'`;
    if (areAllStrings) return `The type of ${selectedCompetency} is 'level'`;
    return `The type of ${selectedCompetency} is both 'level' and 'score'`;
};