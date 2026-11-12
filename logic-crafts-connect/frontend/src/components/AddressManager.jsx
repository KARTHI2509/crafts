import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import './AddressManager.css';

const AddressManager = ({ onSelectAddress, selectedAddressId = null, selectable = false }) => {
  const authContext = useAuth();
  const user = authContext?.user;
  const langContext = useLanguage();
  const language = langContext?.language || 'en';
  const [addresses, setAddresses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false,
    type: 'home'
  });

  const texts = {
    en: {
      title: 'Saved Addresses',
      addNew: 'Add New Address',
      edit: 'Edit',
      delete: 'Delete',
      setDefault: 'Set as Default',
      default: 'Default',
      home: 'Home',
      work: 'Work',
      other: 'Other',
      name: 'Full Name',
      phone: 'Phone Number',
      addressLine1: 'Address Line 1',
      addressLine2: 'Address Line 2 (Optional)',
      city: 'City',
      state: 'State',
      pincode: 'PIN Code',
      addressType: 'Address Type',
      makeDefault: 'Make this my default address',
      save: 'Save Address',
      update: 'Update Address',
      cancel: 'Cancel',
      noAddresses: 'No saved addresses',
      addFirst: 'Add your first address to get started',
      confirmDelete: 'Are you sure you want to delete this address?',
      selectAddress: 'Select',
      selected: 'Selected'
    },
    ta: {
      title: 'சேமித்த முகவரிகள்',
      addNew: 'புதிய முகவரி சேர்',
      edit: 'திருத்து',
      delete: 'நீக்கு',
      setDefault: 'இயல்பாக அமை',
      default: 'இயல்பு',
      home: 'வீடு',
      work: 'அலுவலகம்',
      other: 'மற்றவை',
      name: 'முழு பெயர்',
      phone: 'தொலைபேசி எண்',
      addressLine1: 'முகவரி வரி 1',
      addressLine2: 'முகவரி வரி 2 (விருப்பமானது)',
      city: 'நகரம்',
      state: 'மாநிலம்',
      pincode: 'அஞ்சல் குறியீடு',
      addressType: 'முகவரி வகை',
      makeDefault: 'இதை எனது இயல்பு முகவரியாக மாற்று',
      save: 'முகவரியைச் சேமி',
      update: 'முகவரியைப் புதுப்பி',
      cancel: 'ரத்துசெய்',
      noAddresses: 'சேமித்த முகவரிகள் இல்லை',
      addFirst: 'தொடங்க உங்கள் முதல் முகவரியைச் சேர்க்கவும்',
      confirmDelete: 'இந்த முகவரியை நீக்க விரும்புகிறீர்களா?',
      selectAddress: 'தேர்ந்தெடு',
      selected: 'தேர்ந்தெடுக்கப்பட்டது'
    }
  };

  const t = texts[language] || texts.en;

  // Load addresses from localStorage
  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(`addresses_${user._id || user.id}`);
      if (saved) {
        setAddresses(JSON.parse(saved));
      }
    }
  }, [user]);

  // Save addresses to localStorage
  const saveAddresses = (newAddresses) => {
    if (user) {
      localStorage.setItem(`addresses_${user._id || user.id}`, JSON.stringify(newAddresses));
      setAddresses(newAddresses);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      pincode: '',
      isDefault: false,
      type: 'home'
    });
    setEditingAddress(null);
    setShowForm(false);
  };

  const handleEdit = (address) => {
    setFormData(address);
    setEditingAddress(address.id);
    setShowForm(true);
  };

  const handleDelete = (addressId) => {
    if (window.confirm(t.confirmDelete)) {
      const updated = addresses.filter(a => a.id !== addressId);
      saveAddresses(updated);
    }
  };

  const handleSetDefault = (addressId) => {
    const updated = addresses.map(a => ({
      ...a,
      isDefault: a.id === addressId
    }));
    saveAddresses(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingAddress) {
      // Update existing
      const updated = addresses.map(a => 
        a.id === editingAddress ? { ...formData, id: editingAddress } : a
      );
      // If setting as default, update others
      if (formData.isDefault) {
        updated.forEach(a => {
          if (a.id !== editingAddress) a.isDefault = false;
        });
      }
      saveAddresses(updated);
    } else {
      // Add new
      const newAddress = {
        ...formData,
        id: Date.now().toString()
      };
      // If first address or setting as default
      if (addresses.length === 0 || formData.isDefault) {
        newAddress.isDefault = true;
        const updated = addresses.map(a => ({ ...a, isDefault: false }));
        saveAddresses([...updated, newAddress]);
      } else {
        saveAddresses([...addresses, newAddress]);
      }
    }
    
    resetForm();
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'home':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        );
      case 'work':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
          </svg>
        );
      default:
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        );
    }
  };

  return (
    <div className="address-manager">
      <div className="address-manager-header">
        <h2>{t.title}</h2>
        {!showForm && (
          <button className="add-address-btn" onClick={() => setShowForm(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            {t.addNew}
          </button>
        )}
      </div>

      {/* Address Form */}
      {showForm && (
        <form className="address-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>{t.name} *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>{t.phone} *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>{t.addressLine1} *</label>
            <input
              type="text"
              name="addressLine1"
              value={formData.addressLine1}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>{t.addressLine2}</label>
            <input
              type="text"
              name="addressLine2"
              value={formData.addressLine2}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>{t.city} *</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>{t.state} *</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>{t.pincode} *</label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                pattern="[0-9]{6}"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>{t.addressType}</label>
            <div className="address-type-options">
              {['home', 'work', 'other'].map(type => (
                <label key={type} className={`type-option ${formData.type === type ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="type"
                    value={type}
                    checked={formData.type === type}
                    onChange={handleChange}
                  />
                  {getTypeIcon(type)}
                  <span>{t[type]}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="isDefault"
                checked={formData.isDefault}
                onChange={handleChange}
              />
              {t.makeDefault}
            </label>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={resetForm}>
              {t.cancel}
            </button>
            <button type="submit" className="btn-save">
              {editingAddress ? t.update : t.save}
            </button>
          </div>
        </form>
      )}

      {/* Address List */}
      {!showForm && addresses.length === 0 && (
        <div className="no-addresses">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <h3>{t.noAddresses}</h3>
          <p>{t.addFirst}</p>
        </div>
      )}

      {!showForm && addresses.length > 0 && (
        <div className="address-list">
          {addresses.map(address => (
            <div 
              key={address.id} 
              className={`address-card ${address.isDefault ? 'default' : ''} ${selectedAddressId === address.id ? 'selected' : ''}`}
              onClick={() => selectable && onSelectAddress && onSelectAddress(address)}
            >
              <div className="address-card-header">
                <div className="address-type-badge">
                  {getTypeIcon(address.type)}
                  <span>{t[address.type]}</span>
                </div>
                {address.isDefault && (
                  <span className="default-badge">{t.default}</span>
                )}
              </div>

              <div className="address-content">
                <p className="address-name">{address.name}</p>
                <p className="address-phone">{address.phone}</p>
                <p className="address-text">
                  {address.addressLine1}
                  {address.addressLine2 && `, ${address.addressLine2}`}
                </p>
                <p className="address-text">
                  {address.city}, {address.state} - {address.pincode}
                </p>
              </div>

              <div className="address-actions">
                {selectable ? (
                  <button 
                    className={`btn-select ${selectedAddressId === address.id ? 'selected' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectAddress && onSelectAddress(address);
                    }}
                  >
                    {selectedAddressId === address.id ? t.selected : t.selectAddress}
                  </button>
                ) : (
                  <>
                    <button className="btn-action" onClick={() => handleEdit(address)}>
                      {t.edit}
                    </button>
                    {!address.isDefault && (
                      <button className="btn-action" onClick={() => handleSetDefault(address.id)}>
                        {t.setDefault}
                      </button>
                    )}
                    <button className="btn-action delete" onClick={() => handleDelete(address.id)}>
                      {t.delete}
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressManager;
