import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

const ClientRegistrationEnhanced = ({ onClientCreated, onCancel }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Client basic information
  const [clientForm, setClientForm] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    address: '',
    contactPerson: '',
    budgetInfo: {
      totalBudget: '',
      allocatedBudget: '',
      currency: 'USD'
    }
  });

  // Agreement information
  const [agreementForm, setAgreementForm] = useState({
    title: '',
    description: '',
    agreementType: 'Contract',
    startDate: '',
    endDate: '',
    value: '',
    currency: 'USD',
    terms: [{ clause: '', description: '' }],
    paymentTerms: {
      paymentMethod: 'Bank Transfer',
      paymentSchedule: 'Milestone',
      dueDate: 30
    }
  });

  const [includeAgreement, setIncludeAgreement] = useState(false);
  const [includeBudget, setIncludeBudget] = useState(false);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('http://localhost:5000', {
      transports: ['websocket', 'polling'],
      timeout: 20000,
    });

    newSocket.on('connect', () => {
      console.log('Connected to server for client registration');
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const handleClientFormChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setClientForm(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setClientForm(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleAgreementFormChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setAgreementForm(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setAgreementForm(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const addTerm = () => {
    setAgreementForm(prev => ({
      ...prev,
      terms: [...prev.terms, { clause: '', description: '' }]
    }));
  };

  const updateTerm = (index, field, value) => {
    const updatedTerms = [...agreementForm.terms];
    updatedTerms[index][field] = value;
    setAgreementForm(prev => ({
      ...prev,
      terms: updatedTerms
    }));
  };

  const removeTerm = (index) => {
    const updatedTerms = agreementForm.terms.filter((_, i) => i !== index);
    setAgreementForm(prev => ({
      ...prev,
      terms: updatedTerms
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare client data
      const clientData = {
        ...clientForm,
        budgetInfo: includeBudget ? {
          totalBudget: parseFloat(clientForm.budgetInfo.totalBudget) || 0,
          allocatedBudget: parseFloat(clientForm.budgetInfo.allocatedBudget) || 0,
          currency: clientForm.budgetInfo.currency,
          budgetStatus: 'Active'
        } : undefined
      };

      // Create client
      const clientResponse = await axios.post('http://localhost:5000/clients', clientData);
      const createdClient = clientResponse.data.client;

      // Add agreement if included
      if (includeAgreement) {
        const agreementData = {
          ...agreementForm,
          value: parseFloat(agreementForm.value) || 0,
          createdBy: JSON.parse(localStorage.getItem('user') || '{}').id,
          status: 'Draft'
        };

        await axios.post(`http://localhost:5000/clients/${createdClient._id}/agreements`, agreementData);
      }

      alert('Client registered successfully!');
      
      if (onClientCreated) {
        onClientCreated(createdClient);
      }

      // Reset forms
      setClientForm({
        name: '',
        company: '',
        email: '',
        phone: '',
        address: '',
        contactPerson: '',
        budgetInfo: {
          totalBudget: '',
          allocatedBudget: '',
          currency: 'USD'
        }
      });

      setAgreementForm({
        title: '',
        description: '',
        agreementType: 'Contract',
        startDate: '',
        endDate: '',
        value: '',
        currency: 'USD',
        terms: [{ clause: '', description: '' }],
        paymentTerms: {
          paymentMethod: 'Bank Transfer',
          paymentSchedule: 'Milestone',
          dueDate: 30
        }
      });

      setActiveStep(1);
      setIncludeAgreement(false);
      setIncludeBudget(false);

    } catch (error) {
      console.error('Error creating client:', error);
      alert('Error creating client: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (activeStep < 3) {
      setActiveStep(activeStep + 1);
    }
  };

  const prevStep = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 20 }}>
      {/* Connection Status */}
      <div style={{
        position: 'fixed',
        top: 10,
        right: 10,
        zIndex: 1000,
        padding: '5px 10px',
        borderRadius: 5,
        backgroundColor: connected ? '#4caf50' : '#f44336',
        color: 'white',
        fontSize: 12
      }}>
        {connected ? '🟢 Connected' : '🔴 Disconnected'}
      </div>

      <div style={{ marginBottom: 30 }}>
        <h1>Client Registration</h1>
        
        {/* Step Indicator */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 30 }}>
          {[1, 2, 3].map(step => (
            <div
              key={step}
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                backgroundColor: activeStep >= step ? '#2196f3' : '#e0e0e0',
                color: activeStep >= step ? 'white' : '#666',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 10px',
                fontWeight: 'bold'
              }}
            >
              {step}
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <h3>
            {activeStep === 1 && 'Basic Information'}
            {activeStep === 2 && 'Budget & Agreement Options'}
            {activeStep === 3 && 'Agreement Details'}
          </h3>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Step 1: Basic Information */}
        {activeStep === 1 && (
          <div className="step-content">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
              <div className="form-group">
                <label>Client Name *</label>
                <input
                  type="text"
                  value={clientForm.name}
                  onChange={(e) => handleClientFormChange('name', e.target.value)}
                  required
                  style={{ width: '100%', padding: 10, borderRadius: 4, border: '1px solid #ddd' }}
                />
              </div>

              <div className="form-group">
                <label>Company</label>
                <input
                  type="text"
                  value={clientForm.company}
                  onChange={(e) => handleClientFormChange('company', e.target.value)}
                  style={{ width: '100%', padding: 10, borderRadius: 4, border: '1px solid #ddd' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={clientForm.email}
                  onChange={(e) => handleClientFormChange('email', e.target.value)}
                  required
                  style={{ width: '100%', padding: 10, borderRadius: 4, border: '1px solid #ddd' }}
                />
              </div>

              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={clientForm.phone}
                  onChange={(e) => handleClientFormChange('phone', e.target.value)}
                  style={{ width: '100%', padding: 10, borderRadius: 4, border: '1px solid #ddd' }}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 20 }}>
              <label>Contact Person</label>
              <input
                type="text"
                value={clientForm.contactPerson}
                onChange={(e) => handleClientFormChange('contactPerson', e.target.value)}
                style={{ width: '100%', padding: 10, borderRadius: 4, border: '1px solid #ddd' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 20 }}>
              <label>Address</label>
              <textarea
                value={clientForm.address}
                onChange={(e) => handleClientFormChange('address', e.target.value)}
                rows="3"
                style={{ width: '100%', padding: 10, borderRadius: 4, border: '1px solid #ddd' }}
              />
            </div>
          </div>
        )}

        {/* Step 2: Budget & Agreement Options */}
        {activeStep === 2 && (
          <div className="step-content">
            <div style={{ marginBottom: 30 }}>
              <h3>Additional Options</h3>
              
              {/* Budget Option */}
              <div style={{ 
                border: '1px solid #ddd', 
                borderRadius: 8, 
                padding: 20, 
                marginBottom: 20,
                backgroundColor: includeBudget ? '#f0f8ff' : '#fff'
              }}>
                <label style={{ display: 'flex', alignItems: 'center', marginBottom: 15 }}>
                  <input
                    type="checkbox"
                    checked={includeBudget}
                    onChange={(e) => setIncludeBudget(e.target.checked)}
                    style={{ marginRight: 10 }}
                  />
                  <strong>Include Budget Information</strong>
                </label>
                
                {includeBudget && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 15 }}>
                    <div className="form-group">
                      <label>Total Budget</label>
                      <input
                        type="number"
                        value={clientForm.budgetInfo.totalBudget}
                        onChange={(e) => handleClientFormChange('budgetInfo.totalBudget', e.target.value)}
                        min="0"
                        step="0.01"
                        style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ddd' }}
                      />
                    </div>

                    <div className="form-group">
                      <label>Allocated Budget</label>
                      <input
                        type="number"
                        value={clientForm.budgetInfo.allocatedBudget}
                        onChange={(e) => handleClientFormChange('budgetInfo.allocatedBudget', e.target.value)}
                        min="0"
                        step="0.01"
                        style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ddd' }}
                      />
                    </div>

                    <div className="form-group">
                      <label>Currency</label>
                      <select
                        value={clientForm.budgetInfo.currency}
                        onChange={(e) => handleClientFormChange('budgetInfo.currency', e.target.value)}
                        style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ddd' }}
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Agreement Option */}
              <div style={{ 
                border: '1px solid #ddd', 
                borderRadius: 8, 
                padding: 20,
                backgroundColor: includeAgreement ? '#f0f8ff' : '#fff'
              }}>
                <label style={{ display: 'flex', alignItems: 'center', marginBottom: 15 }}>
                  <input
                    type="checkbox"
                    checked={includeAgreement}
                    onChange={(e) => setIncludeAgreement(e.target.checked)}
                    style={{ marginRight: 10 }}
                  />
                  <strong>Create Initial Agreement</strong>
                </label>
                
                {includeAgreement && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
                    <div className="form-group">
                      <label>Agreement Title</label>
                      <input
                        type="text"
                        value={agreementForm.title}
                        onChange={(e) => handleAgreementFormChange('title', e.target.value)}
                        placeholder="e.g., Construction Service Agreement"
                        style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ddd' }}
                      />
                    </div>

                    <div className="form-group">
                      <label>Agreement Type</label>
                      <select
                        value={agreementForm.agreementType}
                        onChange={(e) => handleAgreementFormChange('agreementType', e.target.value)}
                        style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ddd' }}
                      >
                        <option value="Contract">Contract</option>
                        <option value="NDA">NDA</option>
                        <option value="Service Agreement">Service Agreement</option>
                        <option value="Payment Terms">Payment Terms</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Agreement Details */}
        {activeStep === 3 && includeAgreement && (
          <div className="step-content">
            <div style={{ marginBottom: 20 }}>
              <div className="form-group" style={{ marginBottom: 15 }}>
                <label>Agreement Description</label>
                <textarea
                  value={agreementForm.description}
                  onChange={(e) => handleAgreementFormChange('description', e.target.value)}
                  rows="4"
                  placeholder="Describe the agreement details..."
                  style={{ width: '100%', padding: 10, borderRadius: 4, border: '1px solid #ddd' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15, marginBottom: 15 }}>
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={agreementForm.startDate}
                    onChange={(e) => handleAgreementFormChange('startDate', e.target.value)}
                    style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ddd' }}
                  />
                </div>

                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    value={agreementForm.endDate}
                    onChange={(e) => handleAgreementFormChange('endDate', e.target.value)}
                    style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ddd' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15, marginBottom: 20 }}>
                <div className="form-group">
                  <label>Agreement Value</label>
                  <input
                    type="number"
                    value={agreementForm.value}
                    onChange={(e) => handleAgreementFormChange('value', e.target.value)}
                    min="0"
                    step="0.01"
                    style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ddd' }}
                  />
                </div>

                <div className="form-group">
                  <label>Currency</label>
                  <select
                    value={agreementForm.currency}
                    onChange={(e) => handleAgreementFormChange('currency', e.target.value)}
                    style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ddd' }}
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>
              </div>

              {/* Payment Terms */}
              <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 15, marginBottom: 20 }}>
                <h4>Payment Terms</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 15 }}>
                  <div className="form-group">
                    <label>Payment Method</label>
                    <select
                      value={agreementForm.paymentTerms.paymentMethod}
                      onChange={(e) => handleAgreementFormChange('paymentTerms.paymentMethod', e.target.value)}
                      style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ddd' }}
                    >
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Check">Check</option>
                      <option value="Cash">Cash</option>
                      <option value="Credit Card">Credit Card</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Payment Schedule</label>
                    <select
                      value={agreementForm.paymentTerms.paymentSchedule}
                      onChange={(e) => handleAgreementFormChange('paymentTerms.paymentSchedule', e.target.value)}
                      style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ddd' }}
                    >
                      <option value="Upfront">Upfront</option>
                      <option value="Milestone">Milestone</option>
                      <option value="Monthly">Monthly</option>
                      <option value="Quarterly">Quarterly</option>
                      <option value="On Completion">On Completion</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Due Date (Days)</label>
                    <input
                      type="number"
                      value={agreementForm.paymentTerms.dueDate}
                      onChange={(e) => handleAgreementFormChange('paymentTerms.dueDate', parseInt(e.target.value))}
                      min="1"
                      style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ddd' }}
                    />
                  </div>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 15 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                  <h4>Terms and Conditions</h4>
                  <button
                    type="button"
                    onClick={addTerm}
                    style={{
                      backgroundColor: '#2196f3',
                      color: 'white',
                      border: 'none',
                      padding: '5px 10px',
                      borderRadius: 4,
                      cursor: 'pointer'
                    }}
                  >
                    Add Term
                  </button>
                </div>

                {agreementForm.terms.map((term, index) => (
                  <div key={index} style={{ marginBottom: 15, padding: 10, border: '1px solid #eee', borderRadius: 4 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <strong>Term {index + 1}</strong>
                      {agreementForm.terms.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTerm(index)}
                          style={{
                            backgroundColor: '#f44336',
                            color: 'white',
                            border: 'none',
                            padding: '2px 8px',
                            borderRadius: 4,
                            cursor: 'pointer',
                            fontSize: 12
                          }}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div style={{ marginBottom: 10 }}>
                      <input
                        type="text"
                        placeholder="Clause title"
                        value={term.clause}
                        onChange={(e) => updateTerm(index, 'clause', e.target.value)}
                        style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ddd' }}
                      />
                    </div>
                    <textarea
                      placeholder="Clause description"
                      value={term.description}
                      onChange={(e) => updateTerm(index, 'description', e.target.value)}
                      rows="2"
                      style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ddd' }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          marginTop: 30,
          paddingTop: 20,
          borderTop: '1px solid #ddd'
        }}>
          <div>
            {activeStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                style={{
                  backgroundColor: '#9e9e9e',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: 4,
                  cursor: 'pointer',
                  marginRight: 10
                }}
              >
                Previous
              </button>
            )}
            
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                style={{
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: 4,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            )}
          </div>

          <div>
            {activeStep < 3 && (
              <button
                type="button"
                onClick={nextStep}
                disabled={activeStep === 2 && !includeAgreement}
                style={{
                  backgroundColor: (activeStep === 2 && !includeAgreement) ? '#ccc' : '#2196f3',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: 4,
                  cursor: (activeStep === 2 && !includeAgreement) ? 'not-allowed' : 'pointer'
                }}
              >
                {activeStep === 2 && !includeAgreement ? 'Skip to Submit' : 'Next'}
              </button>
            )}

            {(activeStep === 3 || (activeStep === 2 && !includeAgreement)) && (
              <button
                type="submit"
                disabled={loading}
                style={{
                  backgroundColor: loading ? '#ccc' : '#4caf50',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: 4,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Creating...' : 'Create Client'}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default ClientRegistrationEnhanced;