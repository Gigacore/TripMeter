import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import { LanguageSwitcher } from './LanguageSwitcher';
import i18n from '../../tests/i18n';

describe('LanguageSwitcher', () => {
  it('renders the language switcher', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <LanguageSwitcher />
      </I18nextProvider>
    );

    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('changes the language when a new language is selected', async () => {
    render(
      <I18nextProvider i18n={i18n}>
        <LanguageSwitcher />
      </I18nextProvider>
    );

    const combobox = screen.getByRole('combobox');
    await userEvent.click(combobox);
    await userEvent.selectOptions(combobox, 'fr');

    expect(i18n.language).toBe('fr');
  });
});
