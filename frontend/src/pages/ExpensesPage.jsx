import React, { useState, useEffect, useCallback } from 'react';
import expenseService from '../services/expenseService';
import ExpenseSummary from '../components/expenses/ExpenseSummary';
import ExpenseFilters from '../components/expenses/ExpenseFilters';
import ExpenseList from '../components/expenses/ExpenseList';
import ExpenseForm from '../components/expenses/ExpenseForm';
import DeleteExpenseModal from '../components/expenses/DeleteExpenseModal';

const ExpensesPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Filtering state
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    startDate: '',
    endDate: ''
  });

  // UI state
  const [showForm, setShowForm] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState(null);
  const [expenseToDelete, setExpenseToDelete] = useState(null);

  const fetchExpenses = useCallback(async () => {
    setIsLoading(true);
    try {
      // Create clean query object without empty strings
      const queryParams = {};
      if (filters.search) queryParams.search = filters.search;
      if (filters.category) queryParams.category = filters.category;
      if (filters.startDate) queryParams.startDate = filters.startDate;
      if (filters.endDate) queryParams.endDate = filters.endDate;

      const data = await expenseService.getAll(queryParams);
      if (data.success) {
        setExpenses(data.data);
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    // Debounce fetch if typing search
    const timer = setTimeout(() => {
      fetchExpenses();
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchExpenses]);

  const handleAddNew = () => {
    setExpenseToEdit(null);
    setShowForm(true);
  };

  const handleEdit = (expense) => {
    setExpenseToEdit(expense);
    setShowForm(true);
  };

  const handleDeleteClick = (expense) => {
    setExpenseToDelete(expense);
  };

  const handleFormSave = () => {
    setShowForm(false);
    fetchExpenses();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setExpenseToEdit(null);
  };

  const handleDeleteSuccess = () => {
    setExpenseToDelete(null);
    fetchExpenses();
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ color: '#0f172a', margin: 0 }}>Expenses Management</h1>
        {!showForm && (
          <button 
            onClick={handleAddNew}
            style={{
              backgroundColor: '#2563eb', color: 'white', border: 'none', 
              padding: '10px 20px', borderRadius: '6px', fontWeight: '600', 
              cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
          >
            + Add Expense
          </button>
        )}
      </div>

      {showForm && (
        <ExpenseForm 
          expenseToEdit={expenseToEdit} 
          onSave={handleFormSave} 
          onCancel={handleFormCancel} 
        />
      )}

      <ExpenseFilters filters={filters} setFilters={setFilters} />
      
      <ExpenseSummary expenses={expenses} />

      <ExpenseList 
        expenses={expenses} 
        isLoading={isLoading} 
        onEdit={handleEdit} 
        onDeleteClick={handleDeleteClick} 
      />

      {expenseToDelete && (
        <DeleteExpenseModal 
          expense={expenseToDelete} 
          onClose={() => setExpenseToDelete(null)}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </div>
  );
};

export default ExpensesPage;
