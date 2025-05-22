import React from "react";
import "./CustomRadioButton.css"; // Import CSS



const CustomRadioButton = ({ label, name, value, checked, onChange }) => {
  return (
    <label className="radio-label">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
      />
      <span className="custom-radio" />
      {label}
    </label>
  );
};

export default CustomRadioButton;
