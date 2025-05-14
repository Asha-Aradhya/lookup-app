import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LookupForm from './LookupForm';
import { modeSelection, SUMMARY_METHODS } from '../../types';

// Mock fetch API using jest.spyOn
beforeAll(() => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: () =>
            Promise.resolve([
                { Participant: 'Alice', Competency1: 'A', Competency2: 85 },
                { Participant: 'Bob', Competency1: 'B', Competency2: 90 },
            ]),
    });
});

describe('LookupForm Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders the component with initial state', async () => {
        render(<LookupForm />);

        expect(screen.getByText(/Look Up App/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Participant/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Summary/i)).toBeInTheDocument();

        // Wait for data to load
        await waitFor(() => {
            expect(screen.getByLabelText(/Competency/i)).toBeInTheDocument();
        });
    });

    test('fetches and displays participant data', async () => {
        render(<LookupForm />);

        await waitFor(() => {
            expect(screen.getByLabelText(/Competency/i)).toBeInTheDocument();
        });

        fireEvent.change(screen.getByLabelText(/Competency/i), { target: { value: 'Competency1' } });
        fireEvent.change(screen.getByLabelText(/Participant/i), { target: { value: 'Alice' } });

        expect(screen.getByLabelText(/Competency/i)).toHaveValue('Competency1');
        expect(screen.getByLabelText(/Participant/i)).toHaveValue('Alice');
    });

    test('handles mode change to Summary', async () => {
        render(<LookupForm />);

        await waitFor(() => {
            expect(screen.getByLabelText(/Competency/i)).toBeInTheDocument();
        });

        fireEvent.click(screen.getByLabelText(/Summary/i));

        expect(screen.getByLabelText(/Participant's Summary/i)).toBeInTheDocument();
        expect(screen.queryByLabelText(/Participant/i)).not.toBeInTheDocument();
    });

    test('disables submit button when form is invalid', async () => {
        render(<LookupForm />);

        await waitFor(() => {
            expect(screen.getByLabelText(/Competency/i)).toBeInTheDocument();
        });

        const submitButton = screen.getByRole('button', { name: /Submit/i });
        expect(submitButton).toBeDisabled();

        fireEvent.change(screen.getByLabelText(/Competency/i), { target: { value: 'Competency1' } });
        expect(submitButton).toBeDisabled();

        fireEvent.change(screen.getByLabelText(/Participant/i), { target: { value: 'Alice' } });
        expect(submitButton).toBeEnabled();
    });

    test('generates output for participant mode', async () => {
        render(<LookupForm />);

        await waitFor(() => {
            expect(screen.getByLabelText(/Competency/i)).toBeInTheDocument();
        });

        fireEvent.change(screen.getByLabelText(/Competency/i), { target: { value: 'Competency1' } });
        fireEvent.change(screen.getByLabelText(/Participant/i), { target: { value: 'Alice' } });

        fireEvent.click(screen.getByRole('button', { name: /Submit/i }));

        await waitFor(() => {
            expect(screen.getByText(/Alice scored A on Competency1/i)).toBeInTheDocument();
        });
    });

    test('generates output for summary mode (lowest)', async () => {
        render(<LookupForm />);

        await waitFor(() => {
            expect(screen.getByLabelText(/Competency/i)).toBeInTheDocument();
        });

        fireEvent.click(screen.getByLabelText(/Summary/i));
        fireEvent.change(screen.getByLabelText(/Competency/i), { target: { value: 'Competency2' } });
        fireEvent.change(screen.getByLabelText(/Participant's Summary/i), { target: { value: SUMMARY_METHODS.lowest } });

        fireEvent.click(screen.getByRole('button', { name: /Submit/i }));

        await waitFor(() => {
            expect(screen.getByText(/The lowest score for Competency2 is 85/i)).toBeInTheDocument();
        });
    });

    test('generates output for summary mode (highest)', async () => {
        render(<LookupForm />);

        await waitFor(() => {
            expect(screen.getByLabelText(/Competency/i)).toBeInTheDocument();
        });

        fireEvent.click(screen.getByLabelText(/Summary/i));
        fireEvent.change(screen.getByLabelText(/Competency/i), { target: { value: 'Competency2' } });
        fireEvent.change(screen.getByLabelText(/Participant's Summary/i), { target: { value: SUMMARY_METHODS.highest } });

        fireEvent.click(screen.getByRole('button', { name: /Submit/i }));

        await waitFor(() => {
            expect(screen.getByText(/The highest score for Competency2 is 90/i)).toBeInTheDocument();
        });
    });

    test('handles no valid data for summary mode', async () => {
        render(<LookupForm />);

        await waitFor(() => {
            expect(screen.getByLabelText(/Competency/i)).toBeInTheDocument();
        });

        fireEvent.click(screen.getByLabelText(/Summary/i));
        fireEvent.change(screen.getByLabelText(/Competency/i), { target: { value: 'InvalidCompetency' } });
        fireEvent.change(screen.getByLabelText(/Participant's Summary/i), { target: { value: SUMMARY_METHODS.lowest } });

        fireEvent.click(screen.getByRole('button', { name: /Submit/i }));

        await waitFor(() => {
            expect(screen.getByText(/No valid lowest scores found/i)).toBeInTheDocument();
        });
    });
});
