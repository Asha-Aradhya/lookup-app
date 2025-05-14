import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LookupForm from './LookupForm';
import { modeSelection, SUMMARY_METHODS } from '../../types';

beforeAll(() => {
    global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => [
            { Participant: 'Alice', Competency1: 'A', Competency2: 85 },
            { Participant: 'Bob', Competency1: 'B', Competency2: 90 },
        ],
    });
});

afterAll(() => {
    jest.resetAllMocks();
});

describe('LookupForm Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders the component with initial state', async () => {
        render(<LookupForm />);
        expect(screen.getByText('Look Up App')).toBeInTheDocument();
        await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
    });

    test('fetches and displays participant data', async () => {
        render(<LookupForm />);
        await waitFor(() => {
            expect(screen.getByText('Alice')).toBeInTheDocument();
            expect(screen.getByText('Bob')).toBeInTheDocument();
        });
    });

    test('disables submit button when form is invalid', async () => {
        render(<LookupForm />);
        await waitFor(() => screen.getByLabelText(/Competency/i));
        const submitButton = screen.getByRole('button', { name: /Submit/i });
        expect(submitButton).toBeDisabled();
        fireEvent.change(screen.getByLabelText(/Competency/i), { target: { value: 'Competency1' } });
        expect(submitButton).toBeDisabled();
    });

    test('generates output for summary mode (lowest)', async () => {
        render(<LookupForm />);
        await waitFor(() => screen.getByLabelText(/Competency/i));
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
        await waitFor(() => screen.getByLabelText(/Competency/i));
        fireEvent.click(screen.getByLabelText(/Summary/i));
        fireEvent.change(screen.getByLabelText(/Competency/i), { target: { value: 'Competency2' } });
        fireEvent.change(screen.getByLabelText(/Participant's Summary/i), { target: { value: SUMMARY_METHODS.highest } });
        fireEvent.click(screen.getByRole('button', { name: /Submit/i }));
        await waitFor(() => {
            expect(screen.getByText(/The highest score for Competency2 is 90/i)).toBeInTheDocument();
        });
    });
});