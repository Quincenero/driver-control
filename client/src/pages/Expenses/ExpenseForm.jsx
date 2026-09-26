// pages/Expenses/ExpenseForm.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import api from '../../api/axiosConfig';
import { useExpenses } from '../../hooks/useExpenses';
import ExpenseList from './ExpenseList';
import ExpenseFilters from './ExpenseFilters';
import ExpenseEditModal from './ExpenseEditModal';
import styles from './ExpenseForm.module.css';

const localToday = () => {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

const FILTROS_DEFAULT = { periodo: 'hoy' };

export default function ExpenseForm() {
  const [category, setCategory] = useState('Peaje');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(localToday);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [filtros, setFiltros] = useState(FILTROS_DEFAULT);
  const [expenseEditando, setExpenseEditando] = useState(null);

  const navigate = useNavigate();

  const {
    expenses,
    loading: loadingList,
    error: listError,
    refetch,
  } = useExpenses(filtros);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const amountNum = Number(amount);
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      setError('Ingresa un monto válido mayor a 0');
      return;
    }

    setLoading(true);
    try {
      await api.post('/expenses', {
        category,
        amount: amountNum,
        description: description.trim(),
        date,
      });
      setAmount('');
      setDescription('');
      refetch();
    } catch (err) {
      if (err.response?.status === 401) return;
      setError(err.response?.data?.message || 'Error al registrar el gasto');
    } finally {
      setLoading(false);
    }
  };

  const handleSaved = () => {
    setExpenseEditando(null);
    refetch();
  };

  return (
    <div className={styles.formContainer}>
      <header className={styles.formHeader}>
        <button type="button" className={styles.backBtn} onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={16} />
          Volver
        </button>
        <h2 className={styles.formTitle}>
          Registrar <span>Gasto</span>
        </h2>
      </header>

      <form className={styles.formCard} onSubmit={handleSubmit}>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="date">Fecha</label>
            <input id="date" type="date" className={styles.formInput} value={date} max={localToday()} onChange={(e) => setDate(e.target.value)} required />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="category">Categoría</label>
            <select id="category" className={styles.formSelect} value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="Peaje">Peaje</option>
              <option value="Lavado">Lavado</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor="description">Descripción</label>
          <input id="description" type="text" className={styles.formInput} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ej: Peaje autopista" maxLength={200} />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor="amount">Monto</label>
          <input id="amount" type="number" className={styles.formInput} value={amount} onChange={(e) => setAmount(e.target.value)} min="0.01" step="0.01" inputMode="decimal" placeholder="0.00" required />
        </div>

        {error && (
          <div className={styles.formError} role="alert">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <div className={styles.formActions}>
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? (<><span className={styles.spinner} />Guardando…</>) : (<><Save size={16} />Guardar Gasto</>)}
          </button>
        </div>
      </form>

      <section className={styles.listSection}>
        <header className={styles.listHeader}>
          <h3 className={styles.listTitle}>
            Historial
            {expenses.length > 0 && <span className={styles.listCount}> · {expenses.length}</span>}
          </h3>
        </header>

        <ExpenseFilters filtros={filtros} onChange={setFiltros} onClear={() => setFiltros(FILTROS_DEFAULT)} />

        <ExpenseList
          expenses={expenses}
          loading={loadingList}
          error={listError}
          onEdit={setExpenseEditando}
          refetch={refetch}
        />
      </section>

      {expenseEditando && (
        <ExpenseEditModal
          key={expenseEditando._id || expenseEditando.id}
          expense={expenseEditando}
          onClose={() => setExpenseEditando(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}