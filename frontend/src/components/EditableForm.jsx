import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';

const EditableForm = ({ data, onSave }) => {
  const { register, handleSubmit, reset, setValue } = useForm({
    defaultValues: data,
  });
  const [items, setItems] = useState(
    Array.isArray(data?.items) ? data.items : []
  );

  useEffect(() => {
    reset(data);
    setItems(Array.isArray(data?.items) ? data.items : []);
  }, [data, reset]);

  // Update form value for items on change
  useEffect(() => {
    setValue('items', items);
  }, [items, setValue]);

  const onSubmit = formData => {
    if (onSave) {
      onSave({ ...formData, items });
    }
  };

  // Handlers for editing items
  const handleItemChange = (idx, field, value) => {
    setItems(prev =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item))
    );
  };
  const handleAddItem = () => {
    setItems(prev => [
      ...prev,
      { description: '', quantity: '', weight: '', value: '' },
    ]);
  };
  const handleRemoveItem = idx => {
    setItems(prev => prev.filter((_, i) => i !== idx));
  };

  // Editable items table
  const renderItemsTable = items => (
    <table className="min-w-full border border-gray-300 rounded mb-4">
      <thead>
        <tr className="bg-gray-100">
          <th className="p-2 border">Description</th>
          <th className="p-2 border">Quantity</th>
          <th className="p-2 border">Weight</th>
          <th className="p-2 border">Value</th>
          <th className="p-2 border"></th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, idx) => (
          <tr key={idx} className="bg-white">
            <td className="p-2 border">
              <input
                className="w-full border border-gray-200 rounded p-1"
                value={item.description}
                onChange={e =>
                  handleItemChange(idx, 'description', e.target.value)
                }
                placeholder="Description"
              />
            </td>
            <td className="p-2 border">
              <input
                type="number"
                className="w-full border border-gray-200 rounded p-1"
                value={item.quantity}
                onChange={e =>
                  handleItemChange(idx, 'quantity', e.target.value)
                }
                placeholder="Quantity"
              />
            </td>
            <td className="p-2 border">
              <input
                type="number"
                className="w-full border border-gray-200 rounded p-1"
                value={item.weight}
                onChange={e => handleItemChange(idx, 'weight', e.target.value)}
                placeholder="Weight"
              />
            </td>
            <td className="p-2 border">
              <input
                type="number"
                className="w-full border border-gray-200 rounded p-1"
                value={item.value}
                onChange={e => handleItemChange(idx, 'value', e.target.value)}
                placeholder="Value"
              />
            </td>
            <td className="p-2 border text-center">
              <button
                type="button"
                className="remove-item-btn"
                onClick={() => handleRemoveItem(idx)}
                title="Remove item"
              >
                &times;
              </button>
            </td>
          </tr>
        ))}
        <tr>
          <td colSpan={5} className="p-2 border text-center">
            <button
              type="button"
              className="add-item-btn"
              onClick={handleAddItem}
            >
              + Add Item
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  );

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="editable-form-card space-y-6"
    >
      {/* Shipment Details */}
      <div>
        <h3 className="text-xl font-bold mb-2 text-gray-800">
          Shipment Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Shipment ID
            </label>
            <input {...register('shipment_id')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Shipment Date
            </label>
            <input type="date" {...register('shipment_date')} />
          </div>
        </div>
      </div>
      {/* Sender Info */}
      <div>
        <h3 className="text-lg font-semibold mb-2 text-gray-700">
          Sender Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Sender Name
            </label>
            <input {...register('sender_name')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Sender Address
            </label>
            <textarea {...register('sender_address')} />
          </div>
        </div>
      </div>
      {/* Receiver Info */}
      <div>
        <h3 className="text-lg font-semibold mb-2 text-gray-700">
          Receiver Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Receiver Name
            </label>
            <input {...register('receiver_name')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Receiver Address
            </label>
            <textarea {...register('receiver_address')} />
          </div>
        </div>
      </div>
      {/* Items Table */}
      <div>
        <h3 className="text-lg font-semibold mb-2 text-gray-700">Items</h3>
        {renderItemsTable(items)}
      </div>
      {/* Totals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Total Weight
          </label>
          <input type="number" step="any" {...register('total_weight')} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Total Value
          </label>
          <input type="number" step="any" {...register('total_value')} />
        </div>
      </div>
      <button type="submit">Save Changes</button>
    </form>
  );
};

export default EditableForm;
