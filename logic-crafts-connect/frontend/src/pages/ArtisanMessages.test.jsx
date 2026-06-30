import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LanguageContext } from '../context/LanguageContext';
import { SocketProvider } from '../context/SocketContext';
import ArtisanMessages from './ArtisanMessages';

import { vi } from 'vitest';

// Mock the CSS import
vi.mock('./ArtisanMessages.css', () => ({ default: '' }));

const mockUser = {
  id: '1',
  role: 'artisan',
  name: 'Test Artisan'
};

const renderWithProviders = (ui) => {
  return render(
    <BrowserRouter>
      <LanguageContext.Provider value={{ language: 'en' }}>
        <AuthContext.Provider value={{ user: mockUser }}>
          <SocketProvider>
            {ui}
          </SocketProvider>
        </AuthContext.Provider>
      </LanguageContext.Provider>
    </BrowserRouter>
  );
};

describe('ArtisanMessages Component', () => {
  it('renders loading state initially', () => {
    renderWithProviders(<ArtisanMessages />);
    expect(screen.getByText(/loading messages/i)).toBeInTheDocument();
  });
});
