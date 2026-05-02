import React, { createContext, useContext, useState, ReactNode } from 'react';

interface TransactionFormState {
  amount: string;
  selectedAccount: string | null;
  selectedAccountName: string | null;
  selectedCategory: string | null;
  selectedCategoryName: string | null;
  selectedCategoryIcon: string | null;
  selectedType: string | null;
  selectedCurrency: string | null;
  setAmount: (amount: string) => void;
  setSelectedAccount: (account: string | null) => void;
  setSelectedAccountName: (account: string | null) => void;
  setSelectedCategory: (category: string | null) => void;
  setSelectedCategoryName: (category: string | null) => void;
  setSelectedCategoryIcon: (icon: string | null) => void;
  setSelectedType: (type: string | null) => void;
  setSelectedCurrency: (currency: string | null) => void;
}

const TransactionContext = createContext<TransactionFormState | undefined>(undefined);

export const TransactionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [amount, setAmount] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [selectedAccountName, setSelectedAccountName] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string | null>(null);
  const [selectedCategoryIcon, setSelectedCategoryIcon] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<string | null>(null);
  return (
    <TransactionContext.Provider value={{ 
      amount, 
      selectedAccount,
      selectedAccountName,
      selectedCategory, 
      selectedCategoryName,
      selectedCategoryIcon, 
      selectedType,
      selectedCurrency,
      setAmount, 
      setSelectedAccount,
      setSelectedAccountName,
      setSelectedCategory,
      setSelectedCategoryName, 
      setSelectedCategoryIcon,
      setSelectedType,
      setSelectedCurrency, 
      }}>
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransaction = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransaction must be used within a TransactionProvider');
  }
  return context;
};