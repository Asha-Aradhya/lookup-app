export type selectionType = 'participant' | 'summary';

export type CompetencyValues = (string | number)[];

export const modeSelection: { PARTICIPANT: selectionType; SUMMARY: selectionType } = {
    PARTICIPANT: 'participant',
    SUMMARY: 'summary',
};

export enum ModeSelection {
    PARTICIPANT = 'participant',
    SUMMARY = 'summary',
}

export interface ParticipantData {
    Participant: string;
    [key: string]: string | number | null;
}

export const SUMMARY_METHODS = {
    lowest: 'Lowest',
    highest: 'Highest',
    average: 'Average',
    type: 'Type'
};

export const letterToScore: Record<string, number> = {
    A: 5,
    B: 4,
    C: 3,
    D: 2,
    E: 1,
};