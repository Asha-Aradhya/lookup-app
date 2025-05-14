import { letterToScore, ParticipantData } from "../../types";


// Extract competencies from the data
export const extractCompetencies = (competencies: ParticipantData[]) =>
    [...new Set(competencies.flatMap((participant) => Object.keys(participant).filter((key) => key !== 'Participant')))];

// Get the names of the participants
export const getParticipantNames = (participants: ParticipantData[]) =>
    participants.map((participant) => participant.Participant);

// If the competency is both string and number then convert them to numbers
export const sanitisedCompetencyValues = (competencyValues: (string | number | null)[]) =>
    competencyValues
        .map((competency) => {
            if (typeof competency === 'number') return competency;
            if (typeof competency === 'string' && letterToScore[competency.toUpperCase()]) {
                return letterToScore[competency.toUpperCase()];
            }
            return null;
        })
        .filter((val): val is number => typeof val === 'number');

// Get total value of the competencies that has both score and level        
export const getTotal = (values: (string[] | number[])): number =>
    values.filter((val): val is number => typeof val === 'number').reduce((acc, val) => acc + val, 0);

// Removed duplicate import of letterToScore

export const calculateLowest = (competencyValues: any[], sanitisedCompetency: any, selectedCompetency: string): string => {
    if (competencyValues.every(val => typeof val === 'number')) {
        const lowestValue = Math.round(Math.min(...competencyValues) * 10) / 10;
        return `The lowest score for ${selectedCompetency} is ${lowestValue}`;
    } else if (competencyValues.every(val => typeof val === 'string')) {
        const lowestValue = competencyValues.sort().pop();
        return `The lowest score for ${selectedCompetency} is ${lowestValue}`;
    } else {
        // If there are both numbers and strings, we need to handle them separately
        if (sanitisedCompetency.length > 0) {
            const lowest = Math.min(...sanitisedCompetency);
            return `The lowest score for ${selectedCompetency} is ${lowest}`;
        } else {
            return 'No valid lowest scores found';
        }
    }
};

export const calculateHighest = (competencyValues: any[], sanitisedCompetency: any, selectedCompetency: string): string => {
    if (competencyValues.every(val => typeof val === 'number')) {
        const highestValue = Math.round(Math.max(...competencyValues) * 10) / 10;
        return `The highest score for ${selectedCompetency} is ${highestValue}`;
    } else if (competencyValues.every(val => typeof val === 'string')) {
        const highestValue = competencyValues.sort()[0];
        return `The highest score for ${selectedCompetency} is ${highestValue}`;
    } else {
        if (sanitisedCompetency.length > 0) {
            const highest = Math.max(...sanitisedCompetency);
            return `The highest score for ${selectedCompetency} is ${highest}`;
        } else {
            return 'No valid highest score found';
        }
    }
};

export const calculateAverage = (competencyValues: any[], sanitisedCompetency: any, selectedCompetency: string): string => {
    if (competencyValues.every(val => typeof val === 'number')) {
        const total = competencyValues.reduce((accumulator, val) => accumulator + val, 0);
        const average = Math.round((total / sanitisedCompetency.length) * 10) / 10;
        return `The average score for ${selectedCompetency} is ${average}`;
    } else if (competencyValues.every(val => typeof val === 'string')) {
        const validGrades = competencyValues.filter((val: string) => letterToScore[val.toUpperCase()]);
        const total = validGrades.reduce((acc, val) => acc + letterToScore[val], 0);
        const average = Math.round(total / validGrades.length);
        const averageLetter = Object.keys(letterToScore).find(key => letterToScore[key] === average)
        return `The average score for ${selectedCompetency} is ${averageLetter}`;
    } else {
        if (sanitisedCompetency.length > 0) {
            const total = getTotal(sanitisedCompetency);
            const average = Math.round((total / sanitisedCompetency.length) * 10) / 10;
            return `The average score for ${selectedCompetency} is ${average}`;
        } else {
            return 'No valid average scores found';
        }
    }
};

export const determineType = (competencyValues: any[], selectedCompetency: string): string => {
    if (competencyValues.every(val => typeof val === 'number')) {
        return `The type of ${selectedCompetency} is 'score'`;
    } else if (competencyValues.every(val => typeof val === 'string')) {
        return `The type of ${selectedCompetency} is 'level'`;
    } else {
        return `The type of ${selectedCompetency} is both 'level' and 'score'`;
    }
};