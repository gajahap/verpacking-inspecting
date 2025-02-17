import React from 'react';
import Alert from 'react-bootstrap/Alert';
const style = {
  Custom: {
    fontSize: '12px',
    border: 'none',
    borderRadius :'0px'
  },

}

function CustomAlert({ variants = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'], text }) {
  return (
    <>
      {variants.map((variant) => (
        <Alert key={variant} variant={variant} style={style.Custom}>
          {text}
        </Alert>
      ))}
    </>
  );
}

export default CustomAlert;
