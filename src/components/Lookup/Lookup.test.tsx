import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LookupForm from './LookupForm';
import * as api from '../../api/api';

jest.mock('../../api/api'); // Mock the API

const mockData = [
    { Participant: 'Alice', Communication: 4, Leadership: 3 },
    { Participant: 'Bob', Communication: 5, Leadership: 2 },
    { Participant: 'Jon', total: null, Leadership: 2 },
    { Participant: 'Anthony', total: 1.1, enthousiasm: 2 },
    { Participant: 'Donald Duck', enthousiasm: 0 },
];

describe('LookupForm Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Renders loading initially and then loads the form', async () => {
        (api.fetchLookupAppData as jest.Mock).mockResolvedValueOnce(mockData);
        render(<LookupForm />);

        expect(screen.getByAltText(/loading/i)).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText(/Look Up App/i)).toBeInTheDocument();
        });
    });

    test('Displays error popup on API error', async () => {
        (api.fetchLookupAppData as jest.Mock).mockImplementationOnce((setError) => {
            setError('Failed to fetch');
            return Promise.resolve([]);
        });

        render(<LookupForm />);
        await waitFor(() => {
            expect(screen.getByText(/Failed to fetch/i)).toBeInTheDocument();
        });
    });

    test('Changes mode when radio button is clicked', async () => {
        (api.fetchLookupAppData as jest.Mock).mockResolvedValueOnce(mockData);
        render(<LookupForm />);
        await waitFor(() => screen.getByText('Look Up App'));

        const summaryRadio = screen.getByLabelText(/Summary/i);
        fireEvent.click(summaryRadio);
        expect(summaryRadio).toBeChecked();
    });

    test('Disables submit button if form is incomplete', async () => {
        (api.fetchLookupAppData as jest.Mock).mockResolvedValueOnce(mockData);
        render(<LookupForm />);
        await waitFor(() => screen.getByText('Look Up App'));

        const submitButton = screen.getByRole('button', { name: /submit/i });
        expect(submitButton).toBeDisabled();
    });

    test('Generates output when valid data is selected in Participant mode', async () => {
        (api.fetchLookupAppData as jest.Mock).mockResolvedValueOnce(mockData);
        render(<LookupForm />);

        await waitFor(() => screen.getByText('Look Up App'));

        // Select a competency
        fireEvent.change(screen.getByLabelText(/Competency/i), {
            target: { value: 'Communication' },
        });

        // Use a more specific selector for the participant dropdown
        const participantSelects = screen.getAllByLabelText(/Participant/i);
        const participantDropdown = participantSelects.find((el) => el.tagName === 'SELECT') as HTMLSelectElement;

        fireEvent.change(participantDropdown, {
            target: { value: 'Alice' },
        });

        // Submit the form
        const submitButton = screen.getByRole('button', { name: /submit/i });
        expect(submitButton).not.toBeDisabled();
        fireEvent.click(submitButton);

        // Wait for the output to appear
        await waitFor(() => {
            expect(screen.getByText(/Alice scored 4 on Communication/i)).toBeInTheDocument();
        });
    });
    test('Shows message when selected participant has no score for selected competency', async () => {
        (api.fetchLookupAppData as jest.Mock).mockResolvedValueOnce(mockData);
        render(<LookupForm />);

        await waitFor(() => screen.getByText('Look Up App'));

        // Select a competency
        fireEvent.change(screen.getByLabelText(/Competency/i), {
            target: { value: 'total' },
        });

        // Use a more specific selector for the participant dropdown
        const participantSelects = screen.getAllByLabelText(/Participant/i);
        const participantDropdown = participantSelects.find((el) => el.tagName === 'SELECT') as HTMLSelectElement;

        fireEvent.change(participantDropdown, {
            target: { value: 'Jon' },
        });

        // Submit the form
        const submitButton = screen.getByRole('button', { name: /submit/i });
        expect(submitButton).not.toBeDisabled();
        fireEvent.click(submitButton);

        // Wait for the output to appear
        await waitFor(() => {
            expect(screen.getByText(/Jon has no score for total/i)).toBeInTheDocument();
        });
    });
});
