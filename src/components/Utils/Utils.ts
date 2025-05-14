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

const getValueType = (values: any[]) => {
    const allNumbers = values.every(val => typeof val === 'number');
    const allStrings = values.every(val => typeof val === 'string');
    if (allNumbers) return 'number';
    if (allStrings) return 'string';
    return 'mixed';
};

export const calculateLowest = (competencyValues: any[], sanitisedCompetency: any, selectedCompetency: string): string => {
    const type = getValueType(competencyValues);

    const formatResult = (value: string | number) =>
        `The lowest score for ${selectedCompetency} is ${value}`;

    if (type === 'number') {
        const lowestValue = Math.round(Math.min(...competencyValues) * 10) / 10;
        return formatResult(lowestValue);
    }

    if (type === 'string') {
        const lowestValue = competencyValues.sort().pop();
        return formatResult(lowestValue);
    }

    if (sanitisedCompetency.length > 0) {
        const lowest = Math.min(...sanitisedCompetency);
        return formatResult(lowest);
    }

    return 'No valid lowest scores found';
};

export const calculateHighest = (
    competencyValues: any[],
    sanitisedCompetency: any,
    selectedCompetency: string
  ): string => {
    const type = getValueType(competencyValues);
  
    const formatResult = (value: string | number) =>
      `The highest score for ${selectedCompetency} is ${value}`;
  
    if (type === 'number') {
      const highestValue = Math.round(Math.max(...competencyValues) * 10) / 10;
      return formatResult(highestValue);
    }
  
    if (type === 'string') {
      const highestValue = competencyValues.sort()[0];
      return formatResult(highestValue);
    }
  
    if (sanitisedCompetency.length > 0) {
      const highest = Math.max(...sanitisedCompetency);
      return formatResult(highest);
    }
  
    return 'No valid highest score found';
  };
  

export const calculateAverage = (competencyValues: any[], sanitisedCompetency: any, selectedCompetency: string): string => {
    const type = getValueType(competencyValues);
    if (type === 'number') {
        const total = competencyValues.reduce((accumulator, val) => accumulator + val, 0);
        const average = Math.round((total / sanitisedCompetency.length) * 10) / 10;
        return `The average score for ${selectedCompetency} is ${average}`;
    } else if (type === 'string') {
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
    const type = getValueType(competencyValues);
    if (type === 'number') return `The type of ${selectedCompetency} is 'score'`;
    if (type === 'string') return `The type of ${selectedCompetency} is 'level'`;
    return `The type of ${selectedCompetency} is both 'level' and 'score'`;
};