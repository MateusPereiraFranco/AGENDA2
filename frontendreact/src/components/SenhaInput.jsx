import React, { useState } from 'react';
import { HiEye, HiEyeOff } from 'react-icons/hi';

function SenhaInput({
  label,
  value,
  onChange,
  placeholder = '',
  required = false,
  name = '',
  id = ''
}) {
  const [mostrar, setMostrar] = useState(false);

  return (
    <div className="input-container"
      style={{
        position: 'relative', 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      {label && <label>{label}</label>}
      <input
        type={mostrar ? 'text' : 'password'}
        name={name}
        value={value}
        required={required}
        onChange={onChange}
        placeholder={placeholder}
        id={id}
      />
      <label htmlFor="senha" className={value ? "floating" : ""}>Senha</label>
      <button 
        className='button_eye'
        type="button"
        onClick={() => setMostrar((prev) => !prev)}
        tabIndex={-1}
        style={{ transform: label ? 'none' : 'translateY(-50%)'}}
      >
        {mostrar ? <HiEyeOff /> : <HiEye />}
      </button>
    </div>
  );
}

export default SenhaInput;