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
    <div className="expenses-container">
      <header className="expenses-header">
        <div className="header-title-group">
          <h1>Expenses Management</h1>
          <p>Track and manage your business operating costs</p>
        </div>
        {!showForm && (
          <button
            type="button"
            className="btn-primary"
            onClick={handleAddNew}
          >
            <span>＋ Add Expense</span>
          </button>
        )}
      </header>

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
