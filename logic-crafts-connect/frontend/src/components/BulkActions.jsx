import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import './BulkActions.css';

const BulkActions = ({ 
  products = [], 
  selectedIds = [], 
  onSelectAll, 
  onDeselectAll,
  onDeleteSelected,
  onUpdateVisibility,
  onUpdateStock,
  onExportSelected 
}) => {
  const langContext = useLanguage();
  const language = langContext?.language || 'en';
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockValue, setStockValue] = useState('');
  const [stockAction, setStockAction] = useState('set'); // set, add, subtract

  const texts = {
    en: {
      selected: 'selected',
      selectAll: 'Select All',
      deselectAll: 'Deselect All',
      delete: 'Delete',
      hide: 'Hide',
      show: 'Show',
      updateStock: 'Update Stock',
      export: 'Export',
      confirmDelete: 'Are you sure you want to delete the selected products?',
      stockModalTitle: 'Update Stock for Selected Products',
      setStock: 'Set stock to',
      addStock: 'Add to stock',
      subtractStock: 'Subtract from stock',
      apply: 'Apply',
      cancel: 'Cancel',
      noSelection: 'No products selected',
      actions: 'Bulk Actions'
    },
    ta: {
      selected: 'தேர்ந்தெடுக்கப்பட்டது',
      selectAll: 'அனைத்தையும் தேர்ந்தெடு',
      deselectAll: 'அனைத்தையும் தேர்வுநீக்கு',
      delete: 'நீக்கு',
      hide: 'மறை',
      show: 'காட்டு',
      updateStock: 'இருப்பை புதுப்பி',
      export: 'ஏற்றுமதி',
      confirmDelete: 'தேர்ந்தெடுக்கப்பட்ட பொருட்களை நீக்க விரும்புகிறீர்களா?',
      stockModalTitle: 'தேர்ந்தெடுக்கப்பட்ட பொருட்களுக்கான இருப்பை புதுப்பிக்கவும்',
      setStock: 'இருப்பை அமை',
      addStock: 'இருப்பில் சேர்',
      subtractStock: 'இருப்பிலிருந்து கழி',
      apply: 'பயன்படுத்து',
      cancel: 'ரத்துசெய்',
      noSelection: 'பொருட்கள் தேர்ந்தெடுக்கப்படவில்லை',
      actions: 'மொத்த செயல்கள்'
    }
  };

  const t = texts[language] || texts.en;
  const hasSelection = selectedIds.length > 0;
  const allSelected = selectedIds.length === products.length && products.length > 0;

  const handleDelete = () => {
    if (window.confirm(t.confirmDelete)) {
      onDeleteSelected && onDeleteSelected(selectedIds);
    }
  };

  const handleStockUpdate = () => {
    if (!stockValue || isNaN(stockValue)) return;
    
    onUpdateStock && onUpdateStock(selectedIds, stockAction, parseInt(stockValue));
    setShowStockModal(false);
    setStockValue('');
  };

  const handleExport = () => {
    // Export selected products as CSV
    const selectedProducts = products.filter(p => selectedIds.includes(p._id || p.id));
    const csv = [
      ['Name', 'Price', 'Stock', 'Category', 'Status'].join(','),
      ...selectedProducts.map(p => [
        `"${p.name || p.title}"`,
        p.price,
        p.stock || 0,
        p.category || '',
        p.status || 'active'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `products-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className={`bulk-actions-bar ${hasSelection ? 'has-selection' : ''}`}>
        <div className="selection-info">
          {hasSelection ? (
            <span className="selection-count">
              <strong>{selectedIds.length}</strong> {t.selected}
            </span>
          ) : (
            <span className="no-selection">{t.noSelection}</span>
          )}
        </div>

        <div className="bulk-buttons">
          {/* Select/Deselect All */}
          <button 
            className="bulk-btn select-btn"
            onClick={allSelected ? onDeselectAll : onSelectAll}
          >
            {allSelected ? t.deselectAll : t.selectAll}
          </button>

          {/* Action Buttons - Only show when items selected */}
          {hasSelection && (
            <>
              <button 
                className="bulk-btn visibility-btn"
                onClick={() => onUpdateVisibility && onUpdateVisibility(selectedIds, true)}
                title={t.show}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                {t.show}
              </button>

              <button 
                className="bulk-btn visibility-btn"
                onClick={() => onUpdateVisibility && onUpdateVisibility(selectedIds, false)}
                title={t.hide}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
                {t.hide}
              </button>

              <button 
                className="bulk-btn stock-btn"
                onClick={() => setShowStockModal(true)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
                {t.updateStock}
              </button>

              <button 
                className="bulk-btn export-btn"
                onClick={handleExport}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                {t.export}
              </button>

              <button 
                className="bulk-btn delete-btn"
                onClick={handleDelete}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                {t.delete}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Stock Update Modal */}
      {showStockModal && (
        <div className="bulk-modal-overlay" onClick={() => setShowStockModal(false)}>
          <div className="bulk-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{t.stockModalTitle}</h3>
            
            <div className="stock-options">
              <label className={stockAction === 'set' ? 'active' : ''}>
                <input
                  type="radio"
                  name="stockAction"
                  value="set"
                  checked={stockAction === 'set'}
                  onChange={(e) => setStockAction(e.target.value)}
                />
                {t.setStock}
              </label>
              <label className={stockAction === 'add' ? 'active' : ''}>
                <input
                  type="radio"
                  name="stockAction"
                  value="add"
                  checked={stockAction === 'add'}
                  onChange={(e) => setStockAction(e.target.value)}
                />
                {t.addStock}
              </label>
              <label className={stockAction === 'subtract' ? 'active' : ''}>
                <input
                  type="radio"
                  name="stockAction"
                  value="subtract"
                  checked={stockAction === 'subtract'}
                  onChange={(e) => setStockAction(e.target.value)}
                />
                {t.subtractStock}
              </label>
            </div>

            <input
              type="number"
              min="0"
              value={stockValue}
              onChange={(e) => setStockValue(e.target.value)}
              placeholder="0"
              className="stock-input"
            />

            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowStockModal(false)}>
                {t.cancel}
              </button>
              <button className="btn-apply" onClick={handleStockUpdate}>
                {t.apply}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BulkActions;
