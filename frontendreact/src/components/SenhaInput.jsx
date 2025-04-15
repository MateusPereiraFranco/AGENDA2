import React, { useState } from 'react';
import { HiEye, HiEyeOff } from 'react-icons/hi';

function SenhaInput({
  label,
  value,
  onChange,
  placeholder = '',
  required = false,
  name = ''
}) {
  const [mostrar, setMostrar] = useState(false);

  return (
    <div style={{ position: 'relative', marginBottom: '10px' }}>
      {label && <label>{label}</label>}
      <input
        type={mostrar ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        name={name}
        style={{
          paddingRight: '40px',
          width: '100%',
        }}
      />
      <button
        type="button"
        onClick={() => setMostrar((prev) => !prev)}
        tabIndex={-1}
        style={{
          position: 'absolute',
          right: '10px',
          top: label ? '38px' : '50%',
          transform: label ? 'none' : 'translateY(-50%)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '20px',
          padding: 0,
          color: '#444'
        }}
      >
        {mostrar ? <HiEyeOff /> : <HiEye />}
      </button>
    </div>
  );
}

export default SenhaInput;
